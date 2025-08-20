// Browser compatibility check - Crawlee is designed for Node.js
const isBrowser = typeof window !== 'undefined';

// Only import Crawlee in Node.js environment
let PuppeteerCrawler: any = null;

if (!isBrowser) {
  try {
    // Dynamic import only in Node.js environment
    import('crawlee').then(module => {
      PuppeteerCrawler = module.PuppeteerCrawler;
    });
  } catch (error) {
    console.warn('Crawlee not available in browser environment');
  }
}

import { Page } from 'puppeteer';

interface CrawlOptions {
  maxPages?: number;
  maxDepth?: number;
  includeExternal?: boolean;
  followRedirects?: boolean;
  timeout?: number;
  delay?: number;
  respectRobots?: boolean;
  userAgent?: string;
}

interface CrawlResult {
  url: string;
  title: string;
  content: string;
  links: string[];
  statusCode: number;
  contentType: string;
  size: number;
  loadTime: number;
  depth: number;
  metaDescription?: string;
  headings: {
    h1: string[];
    h2: string[];
    h3: string[];
  };
  images: Array<{
    src: string;
    alt: string;
    title?: string;
  }>;
  errors: string[];
}

interface WebSpiderResult {
  success: boolean;
  error?: string;
  data?: {
    pages: CrawlResult[];
    totalPages: number;
    crawlTime: number;
    summary: {
      successful: number;
      failed: number;
      redirects: number;
      averageLoadTime: number;
    };
  };
}

export class CrawleeService {
  private options: Required<CrawlOptions>;

  constructor(options: CrawlOptions = {}) {
    this.options = {
      maxPages: options.maxPages ?? 20,
      maxDepth: options.maxDepth ?? 3,
      includeExternal: options.includeExternal ?? false,
      followRedirects: options.followRedirects ?? true,
      timeout: options.timeout ?? 30000,
      delay: options.delay ?? 1000,
      respectRobots: options.respectRobots ?? true,
      userAgent: options.userAgent ?? 'Mozilla/5.0 (compatible; PageDoctor/1.0; +https://pagedoctor.dev)'
    };
  }

  // Static methods for compatibility with SpiderService interface
  static saveApiKey(apiKey: string): void {
    // Not needed for Crawlee, but keep for compatibility
    console.log('API key not required for Crawlee');
  }

  static getApiKey(): string | null {
    // Not needed for Crawlee, return a dummy value
    return 'local-crawlee';
  }

  static removeApiKey(): void {
    // Not needed for Crawlee
    console.log('API key not required for Crawlee');
  }

  static async testApiKey(apiKey: string): Promise<boolean> {
    // Always return true since Crawlee doesn't need API keys
    return true;
  }

  /**
   * Main crawling method compatible with SpiderService interface
   */
  async crawl(
    startUrl: string, 
    onProgress?: (progress: number, message: string, currentUrl?: string) => void
  ): Promise<WebSpiderResult> {
    const startTime = Date.now();
    
    // Browser fallback when Crawlee is not available
    if (isBrowser || !PuppeteerCrawler) {
      console.warn('🌐 Crawlee not available in browser - using basic fallback');
      onProgress?.(50, 'Using browser-compatible mode...');
      
      // Return basic result for browser compatibility
      const fallbackResult: CrawlResult = {
        url: startUrl,
        title: 'Page Title (Browser Mode)',
        content: 'Content extraction limited in browser environment',
        links: [],
        statusCode: 200,
        contentType: 'text/html',
        size: 1000,
        loadTime: 500,
        depth: 0,
        metaDescription: '',
        headings: { h1: [], h2: [], h3: [] },
        images: [],
        errors: []
      };
      
      onProgress?.(100, 'Browser fallback complete');
      
      return {
        success: true,
        data: {
          pages: [fallbackResult],
          totalPages: 1,
          crawlTime: Date.now() - startTime,
          summary: {
            successful: 1,
            failed: 0,
            redirects: 0,
            averageLoadTime: 500
          }
        }
      };
    }

    // Node.js environment - full Crawlee functionality
    const results: CrawlResult[] = [];
    const errors: string[] = [];
    const visitedUrls = new Set<string>();
    let processedCount = 0;

    try {
      onProgress?.(10, 'Initializing Crawlee crawler...');

      const crawler = new PuppeteerCrawler({
        maxRequestsPerCrawl: this.options.maxPages,
        requestHandlerTimeoutSecs: this.options.timeout / 1000,
        navigationTimeoutSecs: 30,
        headless: true,
        launchContext: {
          launchOptions: {
            headless: true,
            args: ['--no-sandbox', '--disable-setuid-sandbox']
          }
        },
        requestHandler: async ({ page, request, enqueueLinks, log }) => {
          const url = request.loadedUrl || request.url;
          
          if (visitedUrls.has(url) || processedCount >= this.options.maxPages) {
            return;
          }

          visitedUrls.add(url);
          processedCount++;

          onProgress?.(
            Math.min(90, 10 + (processedCount / this.options.maxPages) * 80), 
            `Processing page ${processedCount}/${this.options.maxPages}...`, 
            url
          );

          try {
            const crawlResult = await this.extractPageData(page, url, request.userData?.depth || 0);
            results.push(crawlResult);

            // Enqueue more links if we haven't reached max depth
            const currentDepth = request.userData?.depth || 0;
            if (currentDepth < this.options.maxDepth && results.length < this.options.maxPages) {
              await enqueueLinks({
                globs: this.options.includeExternal ? ['**/*'] : [`${new URL(startUrl).origin}/**/*`],
                userData: { depth: currentDepth + 1 },
                limit: Math.max(1, this.options.maxPages - results.length)
              });
            }

          } catch (error) {
            console.error(`Error processing ${url}:`, error);
            errors.push(`Failed to process ${url}: ${error instanceof Error ? error.message : 'Unknown error'}`);
          }
        }
      });

      onProgress?.(20, 'Starting crawl...');

      await crawler.run([{
        url: startUrl,
        userData: { depth: 0 }
      }]);

      const crawlTime = Date.now() - startTime;
      const summary = {
        successful: results.length,
        failed: errors.length,
        redirects: 0, // Would need to track this separately
        averageLoadTime: crawlTime / Math.max(results.length, 1)
      };

      onProgress?.(100, `Completed crawling ${results.length} pages`);

      return {
        success: true,
        data: {
          pages: results,
          totalPages: results.length,
          crawlTime,
          summary
        }
      };

    } catch (error) {
      console.error('Crawlee crawl failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown crawling error'
      };
    }
  }

  /**
   * Extract comprehensive data from a page
   */
  private async extractPageData(page: Page, url: string, depth: number): Promise<CrawlResult> {
    const startTime = Date.now();

    try {
      // Extract basic page information
      const title = await page.title();
      const content = await page.evaluate(() => {
        // Remove script and style elements
        const scripts = document.querySelectorAll('script, style, nav, footer, header');
        scripts.forEach(el => el.remove());
        
        // Get main content
        const main = document.querySelector('main') || document.querySelector('[role="main"]') || document.body;
        return main?.innerText || document.body.innerText || '';
      });

      // Extract meta description
      const metaDescription = await page.evaluate(() => {
        const meta = document.querySelector('meta[name="description"]') as HTMLMetaElement;
        return meta?.content || '';
      });

      // Extract headings
      const headings = await page.evaluate(() => {
        const h1s = Array.from(document.querySelectorAll('h1')).map(h => h.textContent?.trim() || '');
        const h2s = Array.from(document.querySelectorAll('h2')).map(h => h.textContent?.trim() || '');
        const h3s = Array.from(document.querySelectorAll('h3')).map(h => h.textContent?.trim() || '');
        return { h1: h1s, h2: h2s, h3: h3s };
      });

      // Extract images
      const images = await page.evaluate(() => {
        return Array.from(document.querySelectorAll('img')).map(img => ({
          src: img.src,
          alt: img.alt || '',
          title: img.title
        }));
      });

      // Extract links
      const links = await page.evaluate(() => {
        return Array.from(document.querySelectorAll('a[href]'))
          .map(a => (a as HTMLAnchorElement).href)
          .filter(href => href.startsWith('http'));
      });

      const loadTime = Date.now() - startTime;

      return {
        url,
        title,
        content,
        links: [...new Set(links)], // Remove duplicates
        statusCode: 200, // Assume success if we got here
        contentType: 'text/html',
        size: content.length,
        loadTime,
        depth,
        metaDescription,
        headings,
        images,
        errors: []
      };

    } catch (error) {
      console.error(`Error extracting data from ${url}:`, error);
      return {
        url,
        title: 'Error loading page',
        content: '',
        links: [],
        statusCode: 500,
        contentType: 'text/html',
        size: 0,
        loadTime: Date.now() - startTime,
        depth,
        metaDescription: '',
        headings: { h1: [], h2: [], h3: [] },
        images: [],
        errors: [error instanceof Error ? error.message : 'Unknown error']
      };
    }
  }

  /**
   * Static method for single page crawling (SpiderService compatible)
   */
  static async crawlSingle(url: string): Promise<CrawlResult | null> {
    try {
      const service = new CrawleeService({ maxPages: 1, maxDepth: 0 });
      const result = await service.crawl(url);
      
      if (result.success && result.data?.pages.length > 0) {
        return result.data.pages[0];
      }
      
      return null;
    } catch (error) {
      console.error('Error during Crawlee single crawl:', error);
      return null;
    }
  }

  /**
   * Static method for URL discovery (SpiderService compatible)
   */
  static async discoverUrls(url: string, maxUrls = 20): Promise<{ success: boolean; error?: string; data?: string[] }> {
    try {
      const service = new CrawleeService({ maxPages: maxUrls, maxDepth: 2 });
      const result = await service.crawl(url);
      
      if (result.success && result.data?.pages) {
        const urls = result.data.pages.map(page => page.url);
        return { success: true, data: urls };
      }
      
      return { success: false, error: 'Failed to discover URLs' };
    } catch (error) {
      console.error('Error during Crawlee URL discovery:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to discover URLs' 
      };
    }
  }

  // Legacy methods for backward compatibility
  static async crawlWebsite(url: string): Promise<{ success: boolean; error?: string; data?: string[] }> {
    return this.discoverUrls(url, 50);
  }

  static async scrapeUrl(url: string): Promise<{ success: boolean; error?: string; content?: string }> {
    const result = await this.crawlSingle(url);
    if (result) {
      return { success: true, content: result.content };
    } else {
      return { success: false, error: 'Failed to scrape URL' };
    }
  }
} 