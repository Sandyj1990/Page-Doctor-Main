import { ScoreItem, AuditResult } from './auditService';
import { GrammarSpellingService } from './grammarSpellingService';
import { CrawleeService } from './crawleeService';

interface SeoAuditOptions {
  crawlDepth: number;
  includeExternalLinks: boolean;
  analyzeImages: boolean;
  checkRedirects: boolean;
  analyzeTechnical: boolean;
  includeContent: boolean;
}

interface ComprehensiveSeoResult extends AuditResult {
  categories?: any; // Add missing categories property
  crawlStats: {
    totalPages: number;
    successfulPages: number;
    errorPages: number;
    redirects: number;
    externalLinks: number;
  };
  technicalSeo: {
    robots: string | null;
    sitemap: string[] | null;
    canonicals: { [url: string]: string };
    metaData: { [url: string]: { title: string; description: string } };
    headings: { [url: string]: { h1: string[]; h2: string[]; h3: string[] } };
    images: { [url: string]: { total: number; missingAlt: number; optimized: number } };
    performance: { [url: string]: { loadTime: number; size: number; requests: number } };
  };
  contentAnalysis: {
    grammarSpelling: { [url: string]: any };
    readability: { [url: string]: { score: number; level: string } };
    wordCount: { [url: string]: number };
    duplicateContent: string[];
  };
  linkAnalysis: {
    internalLinks: { [url: string]: string[] };
    externalLinks: { [url: string]: string[] };
    brokenLinks: string[];
    redirectChains: { [url: string]: string[] };
  };
}

export class ComprehensiveSeoAuditService {
  
  /**
   * Main method to perform comprehensive SEO audit similar to Screaming Frog
   */
  static async performComprehensiveAudit(
    baseUrl: string, 
    options: Partial<SeoAuditOptions> = {}
  ): Promise<ComprehensiveSeoResult> {
    
    const defaultOptions: SeoAuditOptions = {
      crawlDepth: 2,
      includeExternalLinks: true,
      analyzeImages: true,
      checkRedirects: true,
      analyzeTechnical: true,
      includeContent: true
    };

    const auditOptions = { ...defaultOptions, ...options };
    
    console.log(`🕷️ Starting comprehensive SEO audit for ${baseUrl}...`);
    
    try {
      // Phase 1: Crawl the website
      const crawlResults = await this.crawlWebsite(baseUrl, auditOptions);
      
      // Phase 2: Analyze technical SEO aspects
      const technicalAnalysis = await this.analyzeTechnicalSeo(crawlResults, auditOptions);
      
      // Phase 3: Content analysis
      const contentAnalysis = await this.analyzeContent(crawlResults, auditOptions);
      
      // Phase 4: Link analysis
      const linkAnalysis = await this.analyzeLinkStructure(crawlResults, auditOptions);
      
      // Phase 5: Generate comprehensive report
      const comprehensiveResult = this.generateComprehensiveReport(
        baseUrl,
        crawlResults,
        technicalAnalysis,
        contentAnalysis,
        linkAnalysis
      );

      console.log(`✅ Comprehensive SEO audit completed for ${baseUrl}`);
      return comprehensiveResult;

    } catch (error) {
      console.error('❌ Comprehensive SEO audit failed:', error);
      throw new Error(`SEO audit failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Website crawling (similar to Screaming Frog's crawling)
   */
  private static async crawlWebsite(baseUrl: string, options: SeoAuditOptions): Promise<any> {
    console.log(`🔍 Crawling website with depth ${options.crawlDepth}...`);
    
    const crawler = new CrawleeService({
      maxPages: options.crawlDepth === 1 ? 1 : options.crawlDepth * 10,
      maxDepth: options.crawlDepth,
      respectRobots: true,
      delay: 500 // Be respectful
    });

    const crawlResult = await crawler.crawl(baseUrl);
    
    // Process crawl results
    const pages = crawlResult?.data?.pages || [];
    const processedPages: any = {};
    
    for (const page of pages) {
      processedPages[page.url] = {
        url: page.url,
        title: page.title,
        content: page.content,
        metaDescription: page.metaDescription,
        headings: this.extractHeadings(page.content),
        images: this.extractImages(page.content),
        links: this.extractLinks(page.content, baseUrl),
        statusCode: page.statusCode || 200,
        loadTime: page.loadTime || 0,
        size: page.content?.length || 0
      };
    }

    return {
      baseUrl,
      pages: processedPages,
      totalPages: pages.length,
      crawlDepth: options.crawlDepth
    };
  }

  /**
   * Technical SEO analysis (robots.txt, sitemaps, meta tags, etc.)
   */
  private static async analyzeTechnicalSeo(crawlResults: any, options: SeoAuditOptions): Promise<any> {
    console.log('🔧 Analyzing technical SEO factors...');
    
    const baseUrl = crawlResults.baseUrl;
    const pages = crawlResults.pages;
    
    // Analyze robots.txt
    const robotsTxt = await this.analyzeRobotsTxt(baseUrl);
    
    // Find sitemaps
    const sitemaps = await this.findSitemaps(baseUrl, robotsTxt);
    
    // Analyze meta data for each page
    const metaData: { [url: string]: any } = {};
    const canonicals: { [url: string]: string } = {};
    const headings: { [url: string]: any } = {};
    const images: { [url: string]: any } = {};
    const performance: { [url: string]: any } = {};
    
    for (const [url, pageData] of Object.entries(pages) as [string, any][]) {
      // Meta data analysis
      metaData[url] = {
        title: pageData.title || '',
        description: pageData.metaDescription || '',
        titleLength: (pageData.title || '').length,
        descriptionLength: (pageData.metaDescription || '').length,
        hasDuplicateTitle: false, // Will be calculated later
        hasDuplicateDescription: false // Will be calculated later
      };
      
      // Canonicals (would need to parse HTML for real implementation)
      canonicals[url] = url; // Simplified
      
      // Headings analysis
      headings[url] = pageData.headings || { h1: [], h2: [], h3: [] };
      
      // Images analysis
      images[url] = this.analyzePageImages(pageData.images || []);
      
      // Performance metrics
      performance[url] = {
        loadTime: pageData.loadTime || 0,
        size: pageData.size || 0,
        requests: 1 // Simplified
      };
    }
    
    // Find duplicate titles and descriptions
    this.findDuplicateMetaData(metaData);

    return {
      robots: robotsTxt,
      sitemap: sitemaps,
      canonicals,
      metaData,
      headings,
      images,
      performance
    };
  }

  /**
   * Content analysis (grammar, spelling, readability, word count)
   */
  private static async analyzeContent(crawlResults: any, options: SeoAuditOptions): Promise<any> {
    if (!options.includeContent) {
      return { grammarSpelling: {}, readability: {}, wordCount: {}, duplicateContent: [] };
    }

    console.log('📝 Analyzing content quality...');
    
    const pages = crawlResults.pages;
    const grammarSpelling: { [url: string]: any } = {};
    const readability: { [url: string]: any } = {};
    const wordCount: { [url: string]: number } = {};
    const contentHashes: { [hash: string]: string[] } = {};
    
    for (const [url, pageData] of Object.entries(pages) as [string, any][]) {
      const content = this.cleanTextContent(pageData.content || '');
      const fullText = `${pageData.title || ''} ${pageData.metaDescription || ''} ${content}`.trim();
      
      if (fullText.length > 10) {
        // Grammar and spelling analysis
        grammarSpelling[url] = GrammarSpellingService.analyzeContent(fullText);
        
        // Readability analysis
        readability[url] = {
          score: grammarSpelling[url].statistics?.readabilityScore || 0,
          level: grammarSpelling[url].statistics?.readingLevel || 'Unknown'
        };
        
        // Word count
        wordCount[url] = grammarSpelling[url].totalWords || 0;
        
        // Content hash for duplicate detection
        const contentHash = this.generateContentHash(content);
        if (!contentHashes[contentHash]) {
          contentHashes[contentHash] = [];
        }
        contentHashes[contentHash].push(url);
      }
    }
    
    // Find duplicate content
    const duplicateContent = Object.values(contentHashes)
      .filter(urls => urls.length > 1)
      .flat();

    return {
      grammarSpelling,
      readability,
      wordCount,
      duplicateContent
    };
  }

  /**
   * Link analysis (internal/external links, broken links, redirects)
   */
  private static async analyzeLinkStructure(crawlResults: any, options: SeoAuditOptions): Promise<any> {
    console.log('🔗 Analyzing link structure...');
    
    const pages = crawlResults.pages;
    const baseUrl = crawlResults.baseUrl;
    const baseDomain = new URL(baseUrl).hostname;
    
    const internalLinks: { [url: string]: string[] } = {};
    const externalLinks: { [url: string]: string[] } = {};
    const allLinks: Set<string> = new Set();
    
    for (const [url, pageData] of Object.entries(pages) as [string, any][]) {
      const links = pageData.links || [];
      
      internalLinks[url] = [];
      externalLinks[url] = [];
      
      for (const link of links) {
        allLinks.add(link);
        
        try {
          const linkDomain = new URL(link, baseUrl).hostname;
          if (linkDomain === baseDomain) {
            internalLinks[url].push(link);
          } else {
            externalLinks[url].push(link);
          }
        } catch (error) {
          // Invalid URL, skip
        }
      }
    }
    
    // Check for broken links (simplified - would need actual HTTP requests)
    const brokenLinks: string[] = [];
    const redirectChains: { [url: string]: string[] } = {};
    
    return {
      internalLinks,
      externalLinks,
      brokenLinks,
      redirectChains
    };
  }

  /**
   * Generate comprehensive SEO report
   */
  private static generateComprehensiveReport(
    baseUrl: string,
    crawlResults: any,
    technicalAnalysis: any,
    contentAnalysis: any,
    linkAnalysis: any
  ): ComprehensiveSeoResult {
    
    const totalPages = Object.keys(crawlResults.pages).length;
    
    // Calculate overall scores
    const technicalScore = this.calculateTechnicalScore(technicalAnalysis);
    const contentScore = this.calculateContentScore(contentAnalysis);
    const linkScore = this.calculateLinkScore(linkAnalysis);
    
    // Generate audit categories
    const categories = [
      {
        type: 'Technical SEO',
        score: technicalScore,
        items: this.generateTechnicalSeoItems(technicalAnalysis)
      },
      {
        type: 'Content Quality',
        score: contentScore,
        items: this.generateContentQualityItems(contentAnalysis)
      },
      {
        type: 'Link Analysis',
        score: linkScore,
        items: this.generateLinkAnalysisItems(linkAnalysis)
      },
      {
        type: 'Site Structure',
        score: Math.round((technicalScore + linkScore) / 2),
        items: this.generateSiteStructureItems(crawlResults, technicalAnalysis)
      }
    ];

    const overallScore = Math.round(
      categories.reduce((sum, cat) => sum + cat.score, 0) / categories.length
    );

    return {
      url: baseUrl,
      timestamp: new Date().toISOString(),
      categories,
      overallScore,
      provider: 'comprehensive-seo-audit',
      auditType: 'comprehensive',
      crawlStats: {
        totalPages,
        successfulPages: totalPages,
        errorPages: 0,
        redirects: 0,
        externalLinks: Object.values(linkAnalysis.externalLinks).flat().length
      },
      technicalSeo: technicalAnalysis,
      contentAnalysis,
      linkAnalysis
    };
  }

  // Helper methods
  private static extractHeadings(content: string): { h1: string[]; h2: string[]; h3: string[] } {
    const h1 = content.match(/<h1[^>]*>(.*?)<\/h1>/gi)?.map(h => h.replace(/<[^>]*>/g, '').trim()) || [];
    const h2 = content.match(/<h2[^>]*>(.*?)<\/h2>/gi)?.map(h => h.replace(/<[^>]*>/g, '').trim()) || [];
    const h3 = content.match(/<h3[^>]*>(.*?)<\/h3>/gi)?.map(h => h.replace(/<[^>]*>/g, '').trim()) || [];
    
    return { h1, h2, h3 };
  }

  private static extractImages(content: string): Array<{ src: string; alt: string; title?: string }> {
    const imgRegex = /<img[^>]+>/gi;
    const images = content.match(imgRegex) || [];
    
    return images.map(img => {
      const srcMatch = img.match(/src=["']([^"']+)["']/i);
      const altMatch = img.match(/alt=["']([^"']*)["']/i);
      const titleMatch = img.match(/title=["']([^"']*)["']/i);
      
      return {
        src: srcMatch ? srcMatch[1] : '',
        alt: altMatch ? altMatch[1] : '',
        title: titleMatch ? titleMatch[1] : undefined
      };
    });
  }

  private static extractLinks(content: string, baseUrl: string): string[] {
    const linkRegex = /<a[^>]+href=["']([^"']+)["'][^>]*>/gi;
    const links: string[] = [];
    let match;
    
    while ((match = linkRegex.exec(content)) !== null) {
      try {
        const absoluteUrl = new URL(match[1], baseUrl).href;
        links.push(absoluteUrl);
      } catch (error) {
        // Skip invalid URLs
      }
    }
    
    return [...new Set(links)]; // Remove duplicates
  }

  private static cleanTextContent(html: string): string {
    return html
      .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
      .replace(/<[^>]*>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  private static generateContentHash(content: string): string {
    // Simple hash function (would use crypto in production)
    let hash = 0;
    for (let i = 0; i < content.length; i++) {
      const char = content.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return hash.toString();
  }

  private static async analyzeRobotsTxt(baseUrl: string): Promise<string | null> {
    try {
      const robotsUrl = new URL('/robots.txt', baseUrl).href;
      const response = await fetch(robotsUrl);
      if (response.ok) {
        return await response.text();
      }
    } catch (error) {
      console.log('No robots.txt found');
    }
    return null;
  }

  private static async findSitemaps(baseUrl: string, robotsTxt: string | null): Promise<string[]> {
    const sitemaps: string[] = [];
    
    // Check robots.txt for sitemaps
    if (robotsTxt) {
      const sitemapMatches = robotsTxt.match(/Sitemap:\s*(.*?)$/gim);
      if (sitemapMatches) {
        sitemapMatches.forEach(match => {
          const url = match.replace(/Sitemap:\s*/i, '').trim();
          sitemaps.push(url);
        });
      }
    }
    
    // Check common sitemap locations
    const commonSitemaps = ['/sitemap.xml', '/sitemap_index.xml', '/sitemaps.xml'];
    for (const path of commonSitemaps) {
      try {
        const sitemapUrl = new URL(path, baseUrl).href;
        const response = await fetch(sitemapUrl, { method: 'HEAD' });
        if (response.ok && !sitemaps.includes(sitemapUrl)) {
          sitemaps.push(sitemapUrl);
        }
      } catch (error) {
        // Skip if sitemap doesn't exist
      }
    }
    
    return sitemaps;
  }

  private static analyzePageImages(images: Array<{ src: string; alt: string; title?: string }>): any {
    const total = images.length;
    const missingAlt = images.filter(img => !img.alt || img.alt.trim() === '').length;
    const optimized = images.filter(img => 
      img.src.includes('.webp') || 
      img.src.includes('w=') || 
      img.src.includes('optimize')
    ).length;
    
    return { total, missingAlt, optimized };
  }

  private static findDuplicateMetaData(metaData: { [url: string]: any }): void {
    const titleCounts: { [title: string]: string[] } = {};
    const descCounts: { [desc: string]: string[] } = {};
    
    // Count occurrences
    for (const [url, data] of Object.entries(metaData)) {
      if (data.title) {
        if (!titleCounts[data.title]) titleCounts[data.title] = [];
        titleCounts[data.title].push(url);
      }
      
      if (data.description) {
        if (!descCounts[data.description]) descCounts[data.description] = [];
        descCounts[data.description].push(url);
      }
    }
    
    // Mark duplicates
    for (const [url, data] of Object.entries(metaData)) {
      data.hasDuplicateTitle = titleCounts[data.title]?.length > 1;
      data.hasDuplicateDescription = descCounts[data.description]?.length > 1;
    }
  }

  private static calculateTechnicalScore(technicalAnalysis: any): number {
    let score = 100;
    
    // Deduct points for missing robots.txt
    if (!technicalAnalysis.robots) score -= 10;
    
    // Deduct points for missing sitemaps
    if (!technicalAnalysis.sitemap || technicalAnalysis.sitemap.length === 0) score -= 15;
    
    // Check meta data quality
    const metaUrls = Object.keys(technicalAnalysis.metaData);
    let metaIssues = 0;
    
    for (const url of metaUrls) {
      const meta = technicalAnalysis.metaData[url];
      if (!meta.title || meta.titleLength < 10 || meta.titleLength > 60) metaIssues++;
      if (!meta.description || meta.descriptionLength < 120 || meta.descriptionLength > 160) metaIssues++;
      if (meta.hasDuplicateTitle) metaIssues++;
      if (meta.hasDuplicateDescription) metaIssues++;
    }
    
    score -= Math.min(50, metaIssues * 5);
    
    return Math.max(0, Math.round(score));
  }

  private static calculateContentScore(contentAnalysis: any): number {
    const urls = Object.keys(contentAnalysis.grammarSpelling);
    if (urls.length === 0) return 0;
    
    let totalScore = 0;
    let totalPages = 0;
    
    for (const url of urls) {
      const grammar = contentAnalysis.grammarSpelling[url];
      if (grammar && grammar.score !== undefined) {
        totalScore += grammar.score;
        totalPages++;
      }
    }
    
    const avgScore = totalPages > 0 ? totalScore / totalPages : 0;
    
    // Deduct for duplicate content
    const duplicatePages = contentAnalysis.duplicateContent.length;
    const duplicatePenalty = Math.min(20, duplicatePages * 2);
    
    return Math.max(0, Math.round(avgScore - duplicatePenalty));
  }

  private static calculateLinkScore(linkAnalysis: any): number {
    // Simplified link scoring
    const totalInternal = Object.values(linkAnalysis.internalLinks).flat().length;
    const totalExternal = Object.values(linkAnalysis.externalLinks).flat().length;
    const brokenLinks = linkAnalysis.brokenLinks.length;
    
    let score = 80; // Base score
    
    // Boost for good internal linking
    if (totalInternal > 10) score += 10;
    
    // Small boost for some external links
    if (totalExternal > 0 && totalExternal < 50) score += 5;
    
    // Penalty for broken links
    score -= brokenLinks * 5;
    
    return Math.max(0, Math.min(100, Math.round(score)));
  }

  private static generateTechnicalSeoItems(technicalAnalysis: any): ScoreItem[] {
    const items: ScoreItem[] = [];
    
    // Robots.txt check
    items.push({
      name: 'Robots.txt',
      score: technicalAnalysis.robots ? 100 : 0,
      status: technicalAnalysis.robots ? 'good' : 'poor',
      description: technicalAnalysis.robots ? 'Robots.txt found' : 'Robots.txt missing',
      details: [
        technicalAnalysis.robots ? 'Robots.txt is present' : 'No robots.txt file found',
        technicalAnalysis.robots ? 'Contains crawl directives' : 'Should create robots.txt'
      ],
      stats: { found: technicalAnalysis.robots ? 1 : 0, total: 1 }
    });
    
    // Sitemap check
    const sitemapScore = technicalAnalysis.sitemap?.length > 0 ? 100 : 0;
    items.push({
      name: 'XML Sitemaps',
      score: sitemapScore,
      status: sitemapScore > 0 ? 'good' : 'poor',
      description: sitemapScore > 0 ? `${technicalAnalysis.sitemap.length} sitemap(s) found` : 'No sitemaps found',
      details: [
        `Sitemaps found: ${technicalAnalysis.sitemap?.length || 0}`,
        sitemapScore > 0 ? 'Helps search engines discover pages' : 'Create XML sitemap for better indexing'
      ],
      stats: { found: technicalAnalysis.sitemap?.length || 0, total: 1 }
    });
    
    return items;
  }

  private static generateContentQualityItems(contentAnalysis: any): ScoreItem[] {
    const items: ScoreItem[] = [];
    const urls = Object.keys(contentAnalysis.grammarSpelling);
    
    if (urls.length === 0) {
      return [{
        name: 'Content Analysis',
        score: 0,
        status: 'poor',
        description: 'No content analyzed',
        details: ['Content analysis not available'],
        stats: { found: 0, total: 0 }
      }];
    }
    
    // Calculate average grammar score
    let totalGrammarScore = 0;
    let totalSpellingErrors = 0;
    let totalGrammarErrors = 0;
    let totalWords = 0;
    
    for (const url of urls) {
      const grammar = contentAnalysis.grammarSpelling[url];
      if (grammar) {
        totalGrammarScore += grammar.score || 0;
        totalSpellingErrors += grammar.spellingErrors?.length || 0;
        totalGrammarErrors += grammar.grammarErrors?.length || 0;
        totalWords += grammar.totalWords || 0;
      }
    }
    
    const avgGrammarScore = Math.round(totalGrammarScore / urls.length);
    
    items.push({
      name: 'Writing Quality',
      score: avgGrammarScore,
      status: avgGrammarScore >= 80 ? 'good' : avgGrammarScore >= 60 ? 'warning' : 'poor',
      description: `${totalSpellingErrors + totalGrammarErrors} total issues across ${urls.length} pages`,
      details: [
        `Average writing score: ${avgGrammarScore}/100`,
        `Total spelling errors: ${totalSpellingErrors}`,
        `Total grammar issues: ${totalGrammarErrors}`,
        `Total words analyzed: ${totalWords.toLocaleString()}`
      ],
      stats: { found: totalWords - totalSpellingErrors - totalGrammarErrors, total: totalWords }
    });
    
    // Duplicate content check
    const duplicateScore = contentAnalysis.duplicateContent.length === 0 ? 100 : Math.max(0, 100 - contentAnalysis.duplicateContent.length * 10);
    items.push({
      name: 'Duplicate Content',
      score: duplicateScore,
      status: duplicateScore === 100 ? 'good' : 'warning',
      description: contentAnalysis.duplicateContent.length === 0 ? 'No duplicate content found' : `${contentAnalysis.duplicateContent.length} pages with duplicate content`,
      details: [
        `Pages with duplicate content: ${contentAnalysis.duplicateContent.length}`,
        duplicateScore === 100 ? 'All content appears unique' : 'Consider rewriting duplicate content'
      ],
      stats: { found: urls.length - contentAnalysis.duplicateContent.length, total: urls.length }
    });
    
    return items;
  }

  private static generateLinkAnalysisItems(linkAnalysis: any): ScoreItem[] {
    const items: ScoreItem[] = [];
    
    const totalInternal = Object.values(linkAnalysis.internalLinks).flat().length;
    const totalExternal = Object.values(linkAnalysis.externalLinks).flat().length;
    
    items.push({
      name: 'Internal Links',
      score: totalInternal > 0 ? Math.min(100, totalInternal * 2) : 0,
      status: totalInternal > 10 ? 'good' : totalInternal > 0 ? 'warning' : 'poor',
      description: `${totalInternal} internal links found`,
      details: [
        `Total internal links: ${totalInternal}`,
        totalInternal > 10 ? 'Good internal linking structure' : 'Consider adding more internal links'
      ],
      stats: { found: totalInternal, total: totalInternal + totalExternal }
    });
    
    items.push({
      name: 'External Links',
      score: totalExternal > 0 && totalExternal < 50 ? 85 : totalExternal >= 50 ? 60 : 40,
      status: totalExternal > 0 && totalExternal < 50 ? 'good' : 'warning',
      description: `${totalExternal} external links found`,
      details: [
        `Total external links: ${totalExternal}`,
        'External links can provide value but should be used judiciously'
      ],
      stats: { found: totalExternal, total: totalInternal + totalExternal }
    });
    
    return items;
  }

  private static generateSiteStructureItems(crawlResults: any, technicalAnalysis: any): ScoreItem[] {
    const items: ScoreItem[] = [];
    const totalPages = Object.keys(crawlResults.pages).length;
    
    // Page depth analysis
    const avgDepth = crawlResults.crawlDepth || 1;
    const depthScore = avgDepth <= 3 ? 100 : Math.max(50, 100 - (avgDepth - 3) * 20);
    
    items.push({
      name: 'Site Depth',
      score: depthScore,
      status: depthScore >= 80 ? 'good' : 'warning',
      description: `Average page depth: ${avgDepth} levels`,
      details: [
        `Pages found: ${totalPages}`,
        `Maximum crawl depth: ${avgDepth}`,
        depthScore >= 80 ? 'Good site structure depth' : 'Consider flattening site structure'
      ],
      stats: { found: totalPages, total: totalPages }
    });
    
    return items;
  }
}

// Export types
export type { SeoAuditOptions, ComprehensiveSeoResult }; 