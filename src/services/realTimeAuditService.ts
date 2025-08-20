import { LighthouseAuditService } from './lighthouseAuditService';
import { CrawleeService } from './crawleeService';
import { fetchPageSpeedData } from './auditService';
import { pageSpeedRateLimit } from '@/utils/apiRateLimit';
import type { AuditResult, ScoreItem } from './auditService';

export interface RealTimeAuditResult extends AuditResult {
  dataSources: {
    pageSpeed: boolean;
    lighthouse: boolean;
    crawlee: boolean;
  };
  realTimeMetrics: {
    pageSpeedResponseTime: number;
    lighthouseResponseTime: number;
    crawleeResponseTime: number;
    totalAuditTime: number;
  };
  dataQuality: 'real-time' | 'partial' | 'failed';
  errors?: string[];
}

export interface RealTimeAuditOptions {
  requireAllSources?: boolean; // If true, fails if any source is unavailable
  timeoutMs?: number;
  includeContent?: boolean;
  maxRetries?: number;
}

export class RealTimeAuditService {
  
  /**
   * Perform real-time audit combining PageSpeed + Crawlee + Lighthouse
   * NO FALLBACK OR MOCK DATA - Real APIs only
   */
  static async performRealTimeAudit(
    url: string,
    options: RealTimeAuditOptions = {}
  ): Promise<RealTimeAuditResult> {
    const startTime = Date.now();
    const config = {
      requireAllSources: options.requireAllSources ?? true,
      timeoutMs: options.timeoutMs ?? 30000,
      includeContent: options.includeContent ?? true,
      maxRetries: options.maxRetries ?? 2,
      ...options
    };

    console.log('🚀 Starting REAL-TIME audit (NO fallbacks) for:', url);
    console.log('📊 Required sources: PageSpeed + Lighthouse + Crawlee');

    // Validate URL
    try {
      new URL(url);
    } catch {
      throw new Error('Invalid URL format provided');
    }

    const results = {
      pageSpeed: null as any,
      lighthouse: null as any,
      crawlee: null as any
    };

    const timings = {
      pageSpeedResponseTime: 0,
      lighthouseResponseTime: 0,
      crawleeResponseTime: 0,
      totalAuditTime: 0
    };

    const errors: string[] = [];
    const sourcesAvailable = {
      pageSpeed: false,
      lighthouse: false,
      crawlee: false
    };

    // Execute all three data sources in parallel
    console.log('⚡ Executing parallel real-time data collection...');
    
    const auditPromises = await Promise.allSettled([
      // PageSpeed API
      this.executePageSpeedAudit(url, config).then(result => {
        results.pageSpeed = result.data;
        timings.pageSpeedResponseTime = result.responseTime;
        sourcesAvailable.pageSpeed = result.success;
        if (!result.success) errors.push(`PageSpeed: ${result.error}`);
        return result;
      }),

      // Lighthouse Direct
      this.executeLighthouseAudit(url, config).then(result => {
        results.lighthouse = result.data;
        timings.lighthouseResponseTime = result.responseTime;
        sourcesAvailable.lighthouse = result.success;
        if (!result.success) errors.push(`Lighthouse: ${result.error}`);
        return result;
      }),

      // Crawlee Real Content
      this.executeCrawleeAudit(url, config).then(result => {
        results.crawlee = result.data;
        timings.crawleeResponseTime = result.responseTime;
        sourcesAvailable.crawlee = result.success;
        if (!result.success) errors.push(`Crawlee: ${result.error}`);
        return result;
      })
    ]);

    timings.totalAuditTime = Date.now() - startTime;

    // Check if we have minimum required data
    const successfulSources = Object.values(sourcesAvailable).filter(Boolean).length;
    
    if (config.requireAllSources && successfulSources < 3) {
      throw new Error(`Real-time audit failed - only ${successfulSources}/3 sources available. Errors: ${errors.join('; ')}. NO FALLBACK DATA PROVIDED.`);
    }

    if (successfulSources === 0) {
      throw new Error(`All real-time data sources failed. Errors: ${errors.join('; ')}. NO MOCK DATA PROVIDED.`);
    }

    console.log(`✅ Real-time audit completed with ${successfulSources}/3 sources in ${timings.totalAuditTime}ms`);
    console.log('📊 Sources used:', Object.entries(sourcesAvailable).filter(([, available]) => available).map(([name]) => name).join(', '));

    // Combine real data from all available sources
    const combinedResult = await this.combineRealTimeResults(url, results, sourcesAvailable);

    return {
      ...combinedResult,
      dataSources: sourcesAvailable,
      realTimeMetrics: timings,
      dataQuality: successfulSources === 3 ? 'real-time' : 'partial',
      errors: errors.length > 0 ? errors : undefined
    };
  }

  /**
   * Execute PageSpeed API audit with real-time data only
   */
  private static async executePageSpeedAudit(url: string, config: RealTimeAuditOptions): Promise<{
    success: boolean;
    data: any;
    responseTime: number;
    error?: string;
  }> {
    const startTime = Date.now();
    
    try {
      console.log('📊 Fetching real-time PageSpeed data...');
      
      // Check if API key is available
      const apiKey = import.meta.env.VITE_PAGESPEED_API_KEY;
      if (!apiKey || apiKey === 'your_pagespeed_api_key_here') {
        throw new Error('PageSpeed API key required for real-time data - no fallback provided');
      }

      const pageSpeedData = await fetchPageSpeedData(url);
      const responseTime = Date.now() - startTime;
      
      if (!pageSpeedData || pageSpeedData.some((d: any) => d.error)) {
        throw new Error('PageSpeed API returned invalid data');
      }

      console.log(`✅ PageSpeed real-time data received (${responseTime}ms)`);
      return {
        success: true,
        data: pageSpeedData,
        responseTime
      };

    } catch (error) {
      const responseTime = Date.now() - startTime;
      console.error('❌ PageSpeed real-time audit failed:', error);
      return {
        success: false,
        data: null,
        responseTime,
        error: error instanceof Error ? error.message : 'Unknown PageSpeed error'
      };
    }
  }

  /**
   * Execute Lighthouse direct audit with real-time data only
   */
  private static async executeLighthouseAudit(url: string, config: RealTimeAuditOptions): Promise<{
    success: boolean;
    data: any;
    responseTime: number;
    error?: string;
  }> {
    const startTime = Date.now();
    
    try {
      console.log('🔬 Running real-time Lighthouse audit...');
      
      if (!LighthouseAuditService.isAvailable()) {
        throw new Error('Lighthouse not available - no fallback provided');
      }

      const lighthouseResult = await LighthouseAuditService.runDirectAudit(url);
      const responseTime = Date.now() - startTime;
      
      if (!lighthouseResult) {
        throw new Error('Lighthouse returned no data');
      }

      console.log(`✅ Lighthouse real-time data received (${responseTime}ms)`);
      return {
        success: true,
        data: lighthouseResult,
        responseTime
      };

    } catch (error) {
      const responseTime = Date.now() - startTime;
      console.error('❌ Lighthouse real-time audit failed:', error);
      return {
        success: false,
        data: null,
        responseTime,
        error: error instanceof Error ? error.message : 'Unknown Lighthouse error'
      };
    }
  }

  /**
   * Execute Crawlee content extraction with real-time data only
   */
  private static async executeCrawleeAudit(url: string, config: RealTimeAuditOptions): Promise<{
    success: boolean;
    data: any;
    responseTime: number;
    error?: string;
  }> {
    const startTime = Date.now();
    
    try {
      console.log('🕷️ Extracting real-time content with Crawlee...');
      
      const crawleeService = new CrawleeService({
        maxPages: 1, // Single page for performance
        timeout: config.timeoutMs || 30000,
        maxDepth: 1
      });

      const crawlResult = await crawleeService.crawl(url);
      const responseTime = Date.now() - startTime;
      
      if (!crawlResult.success || !crawlResult.data?.pages?.length) {
        throw new Error('Crawlee failed to extract content - no fallback provided');
      }

      console.log(`✅ Crawlee real-time content extracted (${responseTime}ms)`);
      return {
        success: true,
        data: crawlResult.data.pages[0],
        responseTime
      };

    } catch (error) {
      const responseTime = Date.now() - startTime;
      console.error('❌ Crawlee real-time audit failed:', error);
      return {
        success: false,
        data: null,
        responseTime,
        error: error instanceof Error ? error.message : 'Unknown Crawlee error'
      };
    }
  }

  /**
   * Combine real data from all available sources into comprehensive audit result
   */
  private static async combineRealTimeResults(
    url: string,
    results: { pageSpeed: any; lighthouse: any; crawlee: any },
    sourcesAvailable: { pageSpeed: boolean; lighthouse: boolean; crawlee: boolean }
  ): Promise<AuditResult> {
    
    console.log('🔄 Combining real-time data from available sources...');
    
    // Initialize combined result structure
    const combinedResult: AuditResult = {
      overallScore: 0,
      writingQuality: [],
      seoSignals: [],
      structure: [],
      technical: []
    };

    let totalScore = 0;
    let scoreCount = 0;

    // Process PageSpeed data if available
    if (sourcesAvailable.pageSpeed && results.pageSpeed) {
      console.log('📊 Processing PageSpeed real-time data...');
      const pageSpeedMetrics = this.extractPageSpeedMetrics(results.pageSpeed);
      combinedResult.technical.push(...pageSpeedMetrics.technical);
      combinedResult.seoSignals.push(...pageSpeedMetrics.seo);
      totalScore += pageSpeedMetrics.score;
      scoreCount++;
    }

    // Process Lighthouse data if available  
    if (sourcesAvailable.lighthouse && results.lighthouse) {
      console.log('🔬 Processing Lighthouse real-time data...');
      const lighthouseMetrics = this.extractLighthouseMetrics(results.lighthouse);
      combinedResult.technical.push(...lighthouseMetrics.technical);
      combinedResult.structure.push(...lighthouseMetrics.structure);
      totalScore += lighthouseMetrics.score;
      scoreCount++;
    }

    // Process Crawlee content if available
    if (sourcesAvailable.crawlee && results.crawlee) {
      console.log('🕷️ Processing Crawlee real-time content...');
      const crawleeMetrics = this.extractCrawleeMetrics(results.crawlee);
      combinedResult.writingQuality.push(...crawleeMetrics.writingQuality);
      combinedResult.seoSignals.push(...crawleeMetrics.seo);
      combinedResult.structure.push(...crawleeMetrics.structure);
      totalScore += crawleeMetrics.score;
      scoreCount++;
    }

    // Calculate overall score from real data only
    combinedResult.overallScore = scoreCount > 0 ? Math.round(totalScore / scoreCount) : 0;

    console.log(`✅ Combined real-time audit complete - Overall Score: ${combinedResult.overallScore}/100`);
    
    return combinedResult;
  }

  /**
   * Extract metrics from PageSpeed API real-time data
   */
  private static extractPageSpeedMetrics(pageSpeedData: any[]): {
    technical: ScoreItem[];
    seo: ScoreItem[];
    score: number;
  } {
    const technical: ScoreItem[] = [];
    const seo: ScoreItem[] = [];
    let totalScore = 0;
    let scoreCount = 0;

    // Process each PageSpeed result
    for (const data of pageSpeedData) {
      if (data.error) continue;

      const lighthouse = data.lighthouseResult;
      if (!lighthouse?.audits) continue;

      // Core Web Vitals from real PageSpeed data
      const coreWebVitals = [
        'largest-contentful-paint',
        'first-input-delay', 
        'cumulative-layout-shift',
        'first-contentful-paint'
      ];

      for (const auditId of coreWebVitals) {
        const audit = lighthouse.audits[auditId];
        if (audit) {
          const score = (audit.score || 0) * 100;
          technical.push({
            name: audit.title || auditId,
            score: Math.round(score),
            status: score >= 90 ? 'good' : score >= 50 ? 'warning' : 'poor',
            description: audit.description || `${auditId} measurement`,
            details: [
              `Value: ${audit.displayValue || 'N/A'}`,
              `Score: ${score}/100`
            ],
            stats: { found: 1, total: 1 }
          });
          totalScore += score;
          scoreCount++;
        }
      }

      // SEO metrics from PageSpeed
      const seoAudits = [
        'document-title',
        'meta-description', 
        'viewport',
        'robots-txt'
      ];

      for (const auditId of seoAudits) {
        const audit = lighthouse.audits[auditId];
        if (audit) {
          const score = (audit.score || 0) * 100;
          seo.push({
            name: audit.title || auditId,
            score: Math.round(score),
            status: score >= 90 ? 'good' : score >= 50 ? 'warning' : 'poor',
            description: audit.description || `${auditId} check`,
            details: [
              audit.explanation || audit.displayValue || 'Real-time measurement'
            ],
            stats: { found: 1, total: 1 }
          });
          totalScore += score;
          scoreCount++;
        }
      }
    }

    return {
      technical,
      seo,
      score: scoreCount > 0 ? totalScore / scoreCount : 0
    };
  }

  /**
   * Extract metrics from Lighthouse real-time data
   */
  private static extractLighthouseMetrics(lighthouseData: any): {
    technical: ScoreItem[];
    structure: ScoreItem[];
    score: number;
  } {
    const technical: ScoreItem[] = [];
    const structure: ScoreItem[] = [];
    
    // Extract performance metrics
    if (lighthouseData.performance) {
      technical.push({
        name: 'Performance Score',
        score: Math.round(lighthouseData.performance * 100),
        status: lighthouseData.performance >= 0.9 ? 'good' : 
                lighthouseData.performance >= 0.5 ? 'warning' : 'poor',
        description: 'Overall performance score from Lighthouse real-time analysis',
        details: ['Real-time Lighthouse measurement'],
        stats: { found: 1, total: 1 }
      });
    }

    // Extract accessibility metrics
    if (lighthouseData.accessibility) {
      structure.push({
        name: 'Accessibility Score',
        score: Math.round(lighthouseData.accessibility * 100),
        status: lighthouseData.accessibility >= 0.9 ? 'good' : 
                lighthouseData.accessibility >= 0.7 ? 'warning' : 'poor',
        description: 'Accessibility compliance from Lighthouse real-time analysis',
        details: ['Real-time accessibility measurement'],
        stats: { found: 1, total: 1 }
      });
    }

    const avgScore = (
      (lighthouseData.performance || 0) + 
      (lighthouseData.accessibility || 0)
    ) / 2 * 100;

    return {
      technical,
      structure,
      score: avgScore
    };
  }

  /**
   * Extract metrics from Crawlee real-time content
   */
  private static extractCrawleeMetrics(crawleeData: any): {
    writingQuality: ScoreItem[];
    seo: ScoreItem[];
    structure: ScoreItem[];
    score: number;
  } {
    const writingQuality: ScoreItem[] = [];
    const seo: ScoreItem[] = [];
    const structure: ScoreItem[] = [];
    
    // Content length analysis from real extracted content
    const contentLength = (crawleeData.content || '').length;
    const wordCount = (crawleeData.content || '').split(/\s+/).length;
    
    writingQuality.push({
      name: 'Content Length',
      score: contentLength > 1000 ? 95 : contentLength > 300 ? 75 : 40,
      status: contentLength > 1000 ? 'good' : contentLength > 300 ? 'warning' : 'poor',
      description: `Real content length analysis: ${contentLength} characters, ${wordCount} words`,
      details: [
        `Characters: ${contentLength}`,
        `Words: ${wordCount}`,
        'Extracted from live website'
      ],
      stats: { found: contentLength, total: 1000 }
    });

    // Title analysis from real page data
    if (crawleeData.title) {
      seo.push({
        name: 'Page Title',
        score: crawleeData.title.length >= 30 && crawleeData.title.length <= 60 ? 95 : 70,
        status: crawleeData.title.length >= 30 && crawleeData.title.length <= 60 ? 'good' : 'warning',
        description: `Real page title: "${crawleeData.title}"`,
        details: [
          `Length: ${crawleeData.title.length} characters`,
          'Extracted from live page'
        ],
        stats: { found: 1, total: 1 }
      });
    }

    // Heading structure from real content
    const headingCount = (crawleeData.headings?.h1?.length || 0) + 
                        (crawleeData.headings?.h2?.length || 0) + 
                        (crawleeData.headings?.h3?.length || 0);
    
    structure.push({
      name: 'Heading Structure',
      score: headingCount >= 3 ? 90 : headingCount >= 1 ? 70 : 30,
      status: headingCount >= 3 ? 'good' : headingCount >= 1 ? 'warning' : 'poor',
      description: `Real heading structure: ${headingCount} headings found`,
      details: [
        `H1: ${crawleeData.headings?.h1?.length || 0}`,
        `H2: ${crawleeData.headings?.h2?.length || 0}`, 
        `H3: ${crawleeData.headings?.h3?.length || 0}`,
        'Extracted from live page structure'
      ],
      stats: { found: headingCount, total: 5 }
    });

    // Calculate average score
    const scores = [
      contentLength > 300 ? 80 : 40,
      crawleeData.title ? 85 : 50,
      headingCount >= 1 ? 80 : 30
    ];
    const avgScore = scores.reduce((a, b) => a + b, 0) / scores.length;

    return {
      writingQuality,
      seo,
      structure,
      score: avgScore
    };
  }

  /**
   * Check if real-time audit is possible
   */
  static isAvailable(): boolean {
    const pageSpeedAvailable = !!import.meta.env.VITE_PAGESPEED_API_KEY && 
                              import.meta.env.VITE_PAGESPEED_API_KEY !== 'your_pagespeed_api_key_here';
    const lighthouseAvailable = LighthouseAuditService.isAvailable();
    
    console.log('🔍 Real-time audit availability check:');
    console.log(`  PageSpeed API: ${pageSpeedAvailable ? '✅' : '❌'}`);
    console.log(`  Lighthouse: ${lighthouseAvailable ? '✅' : '❌'}`);
    console.log(`  Crawlee: ✅ (always available)`);
    
    return pageSpeedAvailable || lighthouseAvailable; // At least one major API must be available
  }
} 