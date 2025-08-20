/**
 * Page Doctor Marketplace Extension API
 * 
 * This module provides REST API endpoints for embedding Page Doctor
 * functionality in external applications, CMS plugins, and Lovable projects.
 */

import { generateAuditResult, generateBatchAuditResult, generateSectionAuditResult } from '../services/auditService';
import { SitemapService } from '../services/sitemapService';
import { NavigationService } from '../services/navigationService';

// API Response types for external integrations
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  timestamp: string;
  version: string;
}

export interface WidgetConfig {
  theme?: 'light' | 'dark' | 'auto';
  primaryColor?: string;
  showBranding?: boolean;
  compact?: boolean;
  apiKey?: string;
  allowedDomains?: string[];
}

export interface AuditRequest {
  url: string;
  type: 'single' | 'full' | 'sections';
  options?: {
    useFastMode?: boolean;
    maxPages?: number;
    sections?: string[];
  };
  config?: WidgetConfig;
}

export interface WidgetAuditResult {
  id: string;
  url: string;
  type: 'single' | 'full' | 'sections';
  overallScore: number;
  categories: {
    writingQuality: number;
    seoSignals: number;
    structure: number;
    technical: number;
  };
  summary: {
    totalPages: number;
    completionTime: number;
    recommendations: string[];
  };
  detailed?: any; // Full audit data for premium integrations
  createdAt: string;
}

/**
 * Page Doctor Marketplace API Class
 */
export class PageDoctorAPI {
  private static version = '1.0.0';
  private static baseUrl = typeof window !== 'undefined' ? window.location.origin : '';

  /**
   * Validate API request and domain authorization
   */
  private static validateRequest(request: AuditRequest): { valid: boolean; error?: string } {
    // Basic URL validation
    try {
      new URL(request.url);
    } catch {
      return { valid: false, error: 'Invalid URL provided' };
    }

    // Domain validation if allowedDomains is specified
    if (request.config?.allowedDomains?.length) {
      const requestDomain = new URL(request.url).hostname;
      const allowed = request.config.allowedDomains.some(domain => 
        requestDomain === domain || requestDomain.endsWith('.' + domain)
      );
      if (!allowed) {
        return { valid: false, error: 'Domain not authorized for this widget' };
      }
    }

    return { valid: true };
  }

  /**
   * Transform audit result for widget consumption
   */
  private static transformAuditResult(
    auditResult: any, 
    type: string, 
    url: string, 
    startTime: number
  ): WidgetAuditResult {
    const totalPages = Array.isArray(auditResult) ? auditResult.length : 1;
    const mainResult = Array.isArray(auditResult) ? auditResult[0] : auditResult;

    // Calculate category averages
    const categories = {
      writingQuality: this.calculateCategoryScore(mainResult.writingQuality),
      seoSignals: this.calculateCategoryScore(mainResult.seoSignals),
      structure: this.calculateCategoryScore(mainResult.structure),
      technical: this.calculateCategoryScore(mainResult.technical)
    };

    // Generate actionable recommendations
    const recommendations = this.generateRecommendations(mainResult);

    return {
      id: `audit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      url,
      type: type as any,
      overallScore: mainResult.overallScore,
      categories,
      summary: {
        totalPages,
        completionTime: Date.now() - startTime,
        recommendations
      },
      detailed: mainResult,
      createdAt: new Date().toISOString()
    };
  }

  /**
   * Calculate average score for a category
   */
  private static calculateCategoryScore(items: any[]): number {
    if (!items?.length) return 0;
    const total = items.reduce((sum, item) => sum + item.score, 0);
    return Math.round(total / items.length);
  }

  /**
   * Generate actionable recommendations from audit results
   */
  private static generateRecommendations(auditResult: any): string[] {
    const recommendations: string[] = [];

    // Check for critical issues
    const allItems = [
      ...auditResult.writingQuality,
      ...auditResult.seoSignals,
      ...auditResult.structure,
      ...auditResult.technical
    ];

    const poorItems = allItems.filter(item => item.status === 'poor');
    const warningItems = allItems.filter(item => item.status === 'warning');

    if (poorItems.length > 0) {
      recommendations.push(`Fix ${poorItems.length} critical issues for better performance`);
    }

    if (warningItems.length > 0) {
      recommendations.push(`Address ${warningItems.length} optimization opportunities`);
    }

    // Specific recommendations based on common issues
    if (auditResult.overallScore < 70) {
      recommendations.push('Overall score needs improvement - focus on technical optimization');
    }

    if (auditResult.seoSignals.some((item: any) => item.name.includes('Meta') && item.status !== 'good')) {
      recommendations.push('Improve meta tags and descriptions for better SEO');
    }

    return recommendations.slice(0, 3); // Limit to top 3 recommendations
  }

  /**
   * Main API endpoint for running audits
   */
  public static async runAudit(request: AuditRequest): Promise<ApiResponse<WidgetAuditResult>> {
    const startTime = Date.now();
    
    try {
      // Validate request
      const validation = this.validateRequest(request);
      if (!validation.valid) {
        return {
          success: false,
          error: validation.error,
          timestamp: new Date().toISOString(),
          version: this.version
        };
      }

      let auditResult: any;

      // Execute audit based on type
      switch (request.type) {
        case 'single':
          auditResult = await generateAuditResult(request.url, request.options?.useFastMode);
          break;

        case 'full':
          const batchResult = await generateBatchAuditResult(request.url);
          if (!batchResult.success) {
            throw new Error(batchResult.error || 'Full website audit failed');
          }
          auditResult = batchResult.data;
          break;

        case 'sections':
          if (!request.options?.sections?.length) {
            throw new Error('Sections must be specified for section audit');
          }
          
          // First discover navigation structure
          const navigation = await NavigationService.extractNavigation(request.url);
          const categories = await NavigationService.organizeIntoCategories(navigation, request.url);
          
          // Filter to requested sections
          const selectedCategories = categories.filter(cat => 
            request.options!.sections!.includes(cat.name)
          );

          const sectionResult = await generateSectionAuditResult(selectedCategories);
          if (!sectionResult.success) {
            throw new Error(sectionResult.error || 'Section audit failed');
          }
          auditResult = sectionResult.data;
          break;

        default:
          throw new Error('Invalid audit type specified');
      }

      // Transform result for widget
      const widgetResult = this.transformAuditResult(auditResult, request.type, request.url, startTime);

      return {
        success: true,
        data: widgetResult,
        timestamp: new Date().toISOString(),
        version: this.version
      };

    } catch (error) {
      console.error('API audit failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Audit failed',
        timestamp: new Date().toISOString(),
        version: this.version
      };
    }
  }

  /**
   * Get website navigation structure for section selection
   */
  public static async getNavigationStructure(url: string): Promise<ApiResponse<any[]>> {
    try {
      new URL(url); // Validate URL
      
      const navigation = await NavigationService.extractNavigation(url);
      const categories = await NavigationService.organizeIntoCategories(navigation, url);

      return {
        success: true,
        data: categories.map(cat => ({
          name: cat.name,
          pages: cat.urls.length,
          description: `${cat.urls.length} pages in ${cat.name} section`
        })),
        timestamp: new Date().toISOString(),
        version: this.version
      };

    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to extract navigation',
        timestamp: new Date().toISOString(),
        version: this.version
      };
    }
  }

  /**
   * Discover website URLs for preview
   */
  public static async discoverUrls(url: string, limit = 10): Promise<ApiResponse<string[]>> {
    try {
      new URL(url); // Validate URL
      
      const discovery = await SitemapService.discoverUrls(url);
      
      if (!discovery.success) {
        throw new Error(discovery.error || 'URL discovery failed');
      }

      return {
        success: true,
        data: (discovery.data || []).slice(0, limit),
        timestamp: new Date().toISOString(),
        version: this.version
      };

    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'URL discovery failed',
        timestamp: new Date().toISOString(),
        version: this.version
      };
    }
  }

  /**
   * Get API status and version info
   */
  public static getStatus(): ApiResponse<{ version: string; uptime: number; features: string[] }> {
    return {
      success: true,
      data: {
        version: this.version,
        uptime: Date.now(),
        features: [
          'single-page-audit',
          'full-website-audit', 
          'section-based-audit',
          'navigation-discovery',
          'url-discovery',
          'real-time-progress',
          'caching-support'
        ]
      },
      timestamp: new Date().toISOString(),
      version: this.version
    };
  }
}

// Export for direct usage
export default PageDoctorAPI; 