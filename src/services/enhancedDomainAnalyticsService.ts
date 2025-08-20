import { LLMService } from './llmService';
import { CrawleeService } from './crawleeService';
import { externalDataService, DomainAnalytics, TrafficData, SEOMetrics } from './externalDataService';
import { realTopPagesService, RealTopPagesResult } from './realTopPagesService';
import { openSourceAnalyticsService, OpenSourceDomainData } from './openSourceAnalyticsService';

// Enhanced types with LLM insights
export interface LLMDomainInsights {
  marketAnalysis: string;
  competitivePosition: string;
  growthOpportunities: string[];
  technicalRecommendations: string[];
  contentStrategy: string;
  seoInsights: string;
  trafficAnalysis: string;
  businessIntelligence: string;
  actionableTips: string[];
}

export interface EnhancedDomainAnalytics extends DomainAnalytics {
  llmInsights?: LLMDomainInsights;
  actualDataSources: string[];
  dataQuality: 'high' | 'medium' | 'low';
  websiteContent?: {
    title: string;
    description: string;
    mainContent: string;
    technologies: string[];
    businessType: string;
  };
  realTimeMetrics?: {
    loadTime: number;
    isOnline: boolean;
    httpStatus: number;
  };
  realTopPages?: RealTopPagesResult;
  openSourceData?: OpenSourceDomainData;
  lighthouse?: {
    metrics?: {
      firstContentfulPaint?: number;
      largestContentfulPaint?: number;
      totalBlockingTime?: number;
      cumulativeLayoutShift?: number;
      speedIndex?: number;
      interactive?: number;
    };
  };
}

export interface DomainAnalysisOptions {
  includeLLMAnalysis?: boolean;
  includeContentAnalysis?: boolean;
  includeRealtimeMetrics?: boolean;
  includeRealTopPages?: boolean;
  industry?: string;
  businessType?: string;
}

export class EnhancedDomainAnalyticsService {
  private llmService: LLMService;

  constructor() {
    this.llmService = new LLMService();
  }

  /**
   * Get enhanced domain analytics with LLM insights and real data
   */
  async getEnhancedDomainAnalytics(
    domain: string, 
    options: DomainAnalysisOptions = {}
  ): Promise<{
    success: boolean;
    data?: EnhancedDomainAnalytics;
    error?: string;
  }> {
    console.log('🚀 Starting Enhanced Domain Analytics with LLM for:', domain);
    
    // Performance optimization: Default to fast mode (skip LLM) unless explicitly requested
    const fastMode = options.includeLLMAnalysis !== true;
    if (fastMode) {
      console.log('⚡ Fast mode enabled - skipping LLM analysis for better performance');
      options.includeLLMAnalysis = false;
    }

    try {
      // Step 1: Get base domain analytics
      const baseAnalytics = await externalDataService.getDomainAnalytics(domain);
      if (!baseAnalytics.success || !baseAnalytics.data) {
        return { success: false, error: 'Failed to fetch base domain analytics' };
      }

      let enhancedData: EnhancedDomainAnalytics = {
        ...baseAnalytics.data,
        actualDataSources: ['ExternalDataService'],
        dataQuality: 'medium'
      };

      // Step 2: Fetch website content for better analysis
      if (options.includeContentAnalysis !== false) {
        console.log('📄 Fetching website content for analysis...');
        const websiteContent = await this.fetchWebsiteContent(domain);
        if (websiteContent) {
          enhancedData.websiteContent = websiteContent;
          enhancedData.actualDataSources.push('WebsiteContent');
          enhancedData.dataQuality = 'high';
        }
      }

      // Step 3: Get real-time metrics
      if (options.includeRealtimeMetrics !== false) {
        console.log('⏱️ Fetching real-time metrics...');
        const realtimeMetrics = await this.fetchRealtimeMetrics(domain);
        if (realtimeMetrics) {
          enhancedData.realTimeMetrics = realtimeMetrics;
          enhancedData.actualDataSources.push('RealtimeMetrics');
        }
      }

      // Step 4: Enhanced data fetching using multiple sources
      const enhancedTrafficData = await this.fetchEnhancedTrafficData(domain);
      if (enhancedTrafficData) {
        enhancedData.traffic = { ...enhancedData.traffic, ...enhancedTrafficData };
        enhancedData.actualDataSources.push('EnhancedTrafficAPI');
      }

      // Step 4.4: Lighthouse performance metrics (optional, best-effort)
      try {
        console.log('🔍 Checking Lighthouse availability...');
        const lh = await externalDataService.runLighthouse(domain);
        if (lh && lh.metrics) {
          enhancedData.lighthouse = { metrics: lh.metrics };
          enhancedData.actualDataSources.push('Lighthouse');
          console.log('✅ Lighthouse data integrated successfully');
        } else {
          console.log('ℹ️ Lighthouse data not available (skipped)');
        }
      } catch (e) {
        console.log('ℹ️ Lighthouse integration skipped:', e.message);
      }

      // Step 4.5: Get real data from open-source APIs
      console.log('🔓 Fetching data from open-source APIs...');
      const openSourceResult = await openSourceAnalyticsService.getOpenSourceAnalytics(domain);
      if (openSourceResult.success && openSourceResult.data) {
        enhancedData.openSourceData = openSourceResult.data;
        enhancedData.actualDataSources.push('OpenSourceAPIs');
        
        // Update traffic data with real performance metrics if available
        if (openSourceResult.data.performance.pageSpeedScore > 0) {
          enhancedData.traffic = {
            ...enhancedData.traffic,
            averageVisitDuration: Math.max(openSourceResult.data.performance.loadTime / 1000, enhancedData.traffic.averageVisitDuration),
            monthlyVisits: openSourceResult.data.performance.monthlyTrafficEstimate || enhancedData.traffic.monthlyVisits
          } as any;
        }
        
        // Update SEO data with real information
        if (openSourceResult.data.seoData.title) {
          enhancedData.seo = {
            ...enhancedData.seo,
            organicKeywords: Math.max(enhancedData.seo.organicKeywords, openSourceResult.data.seoData.structuredData.length)
          };
        }
        
        enhancedData.dataQuality = 'high';
        console.log('✅ Integrated open-source API data');
      }

      // Step 4.6: Discover real top pages
      if (options.includeRealTopPages !== false) {
        console.log('📄 Discovering real top pages...');
        const realTopPages = await realTopPagesService.discoverRealTopPages(domain);
        if (realTopPages && realTopPages.pages.length > 0) {
          enhancedData.realTopPages = realTopPages;
          enhancedData.actualDataSources.push('RealPageDiscovery');
          
          // Replace the mock top pages with real ones
          enhancedData.topPages = {
            pages: realTopPages.pages.map(page => ({
              url: page.url,
              title: page.title,
              visits: page.visits,
              percentage: page.percentage,
              avgTimeOnPage: page.avgTimeOnPage,
              bounceRate: page.bounceRate
            }))
          };
          
          console.log(`✅ Replaced mock pages with ${realTopPages.pages.length} real pages`);
        }
      }

      // Step 5: LLM Analysis and Insights
      if (options.includeLLMAnalysis !== false && this.llmService.isAvailable()) {
        console.log('🤖 Generating LLM insights...');
        const llmInsights = await this.generateLLMInsights(enhancedData, options);
        if (llmInsights) {
          enhancedData.llmInsights = llmInsights;
          enhancedData.actualDataSources.push('LLMAnalysis');
        }
      }

      console.log('✅ Enhanced Domain Analytics completed!');
      console.log('📊 Data sources used:', enhancedData.actualDataSources);
      console.log('🎯 Data quality:', enhancedData.dataQuality);

      return { success: true, data: enhancedData };
    } catch (error) {
      console.error('❌ Enhanced Domain Analytics failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to run enhanced analytics'
      };
    }
  }

  private async fetchWebsiteContent(domain: string) {
    try {
      const crawler = new CrawleeService({ maxPages: 1, maxDepth: 0, respectRobots: false });
      const crawl = await crawler.crawl(domain);
      const page = crawl?.data?.pages?.[0];
      if (!page) {
        console.log('⚠️ Could not fetch website content');
        return null;
      }

      // Extract technologies from the page
      const technologies = this.extractTechnologies(page.content);
      
      // Determine business type from content
      const businessType = this.inferBusinessType((page.title || '') + ' ' + page.content);

      return {
        title: page.title || 'No title found',
        description: page.metaDescription || 'No description found',
        mainContent: page.content.substring(0, 2000), // Limit for LLM analysis
        technologies,
        businessType
      };
    } catch (error) {
      console.error('Failed to fetch website content:', error);
      return null;
    }
  }

  /**
   * Fetch real-time metrics
   */
  private async fetchRealtimeMetrics(domain: string): Promise<{
    loadTime: number;
    isOnline: boolean;
    httpStatus: number;
  } | null> {
    try {
      const url = domain.startsWith('http') ? domain : `https://${domain}`;
      const startTime = Date.now();
      
      const response = await fetch(url, {
        method: 'HEAD',
        mode: 'no-cors'
      });
      
      const loadTime = Date.now() - startTime;
      
      return {
        loadTime,
        isOnline: true,
        httpStatus: response.status || 200
      };
    } catch (error) {
      console.error('Failed to fetch realtime metrics:', error);
      return {
        loadTime: 0,
        isOnline: false,
        httpStatus: 0
      };
    }
  }

  /**
   * Fetch enhanced traffic data from multiple sources
   */
  private async fetchEnhancedTrafficData(domain: string): Promise<Partial<TrafficData> | null> {
    try {
      // Do not return estimates; only return data when real sources are available
      return null;
    } catch (error) {
      console.error('Failed to fetch enhanced traffic data:', error);
      return null;
    }
  }

  /**
   * Analyze website to derive real metrics instead of generating fake data
   */
  private async analyzeWebsiteForRealMetrics(domain: string): Promise<Partial<TrafficData> | null> {
    // Disabled heuristic estimation to avoid non-real metrics
    return null;
  }

  /**
   * Generate LLM insights based on domain data
   */
  private async generateLLMInsights(domainData: EnhancedDomainAnalytics, _options: DomainAnalysisOptions): Promise<LLMDomainInsights | null> {
    try {
      const { domain, traffic, seo, websiteContent, realTimeMetrics } = domainData;
      const prompt = `You are an expert digital strategist. Analyze the following domain data and provide actionable insights.\n\n` +
        `Domain: ${domain}\n` +
        `Traffic: ${JSON.stringify(traffic)}\n` +
        `SEO: ${JSON.stringify(seo)}\n` +
        `${websiteContent ? `Website Content: ${JSON.stringify(websiteContent)}\n` : ''}` +
        `${realTimeMetrics ? `Realtime: ${JSON.stringify(realTimeMetrics)}\n` : ''}`;

      const response = await this.llmService.analyzeContent({ url: domain, title: websiteContent?.title || domain, content: prompt, metaDescription: websiteContent?.description, headings: { h1: [], h2: [], h3: [] }, images: [] as any });
      if (!response) return null;

      // Map LLM content analysis to domain insights
      const analysis = response;
      const insights: LLMDomainInsights = {
        marketAnalysis: (analysis.competitiveAdvantages && analysis.competitiveAdvantages.length)
          ? analysis.competitiveAdvantages.join('; ')
          : 'N/A',
        competitivePosition: 'N/A',
        growthOpportunities: analysis.contentGaps || [],
        technicalRecommendations: analysis.improvementSuggestions || [],
        contentStrategy: analysis.keywordOptimization?.recommendations?.join('; ') || 'N/A',
        seoInsights: analysis.seoInsights
          ? `Title: ${analysis.seoInsights.titleOptimization}; Meta: ${analysis.seoInsights.metaDescriptionSuggestion}`
          : 'N/A',
        trafficAnalysis: 'N/A',
        businessIntelligence: 'N/A',
        actionableTips: analysis.improvementSuggestions || []
      };

      return insights;
    } catch (error) {
      console.error('Failed to generate LLM insights:', error);
      return null;
    }
  }

  // Helper methods
  private extractTechnologies(content: string): string[] {
    const techKeywords = [
      // Frontend Frameworks
      'react', 'vue', 'angular', 'svelte', 'nextjs', 'nuxt', 'gatsby',
      // CMS & E-commerce
      'wordpress', 'shopify', 'magento', 'woocommerce', 'drupal', 'joomla',
      // CSS Frameworks
      'bootstrap', 'tailwind', 'bulma', 'foundation',
      // JavaScript Libraries
      'jquery', 'lodash', 'moment', 'axios',
      // Backend Technologies
      'php', 'node.js', 'python', 'ruby', 'java', 'dotnet', 'golang',
      // Frameworks
      'django', 'laravel', 'express', 'flask', 'rails', 'spring',
      // Analytics & Marketing
      'google analytics', 'gtm', 'facebook pixel', 'hotjar', 'intercom',
      // CDN & Hosting
      'cloudflare', 'aws', 'vercel', 'netlify', 'heroku',
      // Payment Systems
      'stripe', 'paypal', 'square', 'razorpay'
    ];
    
    const detectedTech = techKeywords.filter(tech => 
      content.toLowerCase().includes(tech.toLowerCase())
    );
    
    // Also check for common meta tags and scripts
    const scriptTech = this.extractScriptTechnologies(content);
    
    return [...detectedTech, ...scriptTech].slice(0, 8); // Limit to 8 technologies
  }

  private extractScriptTechnologies(content: string): string[] {
    const technologies = [];
    
    // Check for specific script patterns
    if (content.includes('wp-content') || content.includes('wp-includes')) {
      technologies.push('WordPress');
    }
    if (content.includes('shopify') || content.includes('shopify.com')) {
      technologies.push('Shopify');
    }
    if (content.includes('gtag') || content.includes('gtm.js')) {
      technologies.push('Google Analytics');
    }
    if (content.includes('bootstrap') || content.includes('bs.')) {
      technologies.push('Bootstrap');
    }
    if (content.includes('react') || content.includes('__REACT_DEVTOOLS')) {
      technologies.push('React');
    }
    if (content.includes('vue') || content.includes('__VUE__')) {
      technologies.push('Vue.js');
    }
    
    return technologies;
  }

  private inferBusinessType(content: string): string {
    const businessTypes = {
      'ecommerce': ['shop', 'buy', 'cart', 'product', 'store', 'checkout'],
      'blog': ['blog', 'article', 'post', 'news', 'content'],
      'corporate': ['company', 'business', 'services', 'about us', 'contact'],
      'portfolio': ['portfolio', 'work', 'projects', 'gallery'],
      'nonprofit': ['nonprofit', 'charity', 'donate', 'foundation'],
      'education': ['course', 'learn', 'education', 'school', 'university']
    } as Record<string, string[]>;
    
    const lowerContent = content.toLowerCase();
    for (const [type, keywords] of Object.entries(businessTypes)) {
      if (keywords.some(keyword => lowerContent.includes(keyword))) {
        return type;
      }
    }
    
    return 'general';
  }

  private async assessDomainPopularity(domain: string): Promise<boolean> {
    // Simple heuristics for domain assessment
    const popularTLDs = ['.com', '.org', '.net', '.edu', '.gov'];
    const isPopularTLD = popularTLDs.some(tld => domain.endsWith(tld));
    const isShortDomain = domain.length <= 15;
    
    return isPopularTLD && isShortDomain;
  }

  /**
   * Estimate monthly traffic based on performance metrics
   */
  private estimateTrafficFromPerformance(performance: any): number {
    if (!performance.pageSpeedScore) return 0;
    
    // Better performance usually correlates with higher traffic
    // This is a rough estimate based on PageSpeed score
    const baseTraffic = performance.pageSpeedScore * 100; // PageSpeed score 0-100 -> 0-10k base
    const loadTimeMultiplier = performance.loadTime < 3000 ? 2 : performance.loadTime < 5000 ? 1.5 : 1;
    
    return Math.floor(baseTraffic * loadTimeMultiplier);
  }

  /**
   * Check if enhanced domain analytics is available
   */
  isAvailable(): boolean {
    return this.llmService.isAvailable();
  }

  /**
   * Get available analysis options
   */
  getAnalysisOptions() {
    return {
      llmAvailable: this.llmService.isAvailable(),
      contentAnalysisAvailable: true,
      realtimeMetricsAvailable: true,
      realTopPagesAvailable: true,
      recommendedOptions: {
        includeLLMAnalysis: this.llmService.isAvailable(),
        includeContentAnalysis: true,
        includeRealtimeMetrics: true,
        includeRealTopPages: true
      }
    };
  }
}

export const enhancedDomainAnalyticsService = new EnhancedDomainAnalyticsService();
export type { DomainAnalysisOptions as EnhancedDomainAnalysisOptions }; 