import { CrawleeService } from './crawleeService';

/**
 * Fast, free website URL discovery service using sitemaps, HTML parsing, and web crawling
 */
export class SitemapService {
  
  /**
   * Discover URLs from a website using multiple methods: sitemap.xml, HTML parsing, and intelligent crawling
   */
  static async discoverUrls(url: string): Promise<{ success: boolean; error?: string; data?: string[] }> {
    try {
      console.log('🕷️ Starting advanced URL discovery for:', url);
      
      // Method 1: Try to get URLs from sitemap (fastest)
      const sitemapUrls = await this.getSitemapUrls(url);
      if (sitemapUrls.length >= 10) {
        console.log(`✅ Found ${sitemapUrls.length} URLs from sitemap`);
        return { 
          success: true, 
          data: sitemapUrls.slice(0, 20) // Limit to 20 URLs
        };
      }

      // Method 2: Use super-fast HTML parsing for URL discovery
      console.log('⚡ Using super-fast HTML link extraction...');
      const fastHtmlUrls = await this.getLinksFromHtml(url);
      
      if (fastHtmlUrls.length >= 5) {
        console.log(`✅ Fast HTML parsing found ${fastHtmlUrls.length} URLs`);
        return { 
          success: true, 
          data: fastHtmlUrls.slice(0, 20) // Limit to 20 URLs
        };
      }

      // Method 3: Final fallback
      console.log('📄 Final fallback - return homepage only...');
      return { 
        success: true, 
        data: [url] // Just return the main URL
      };
    } catch (error) {
      console.error('Error discovering URLs:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to discover URLs' 
      };
    }
  }

  /**
   * Extract URLs from sitemap.xml
   */
  private static async getSitemapUrls(baseUrl: string): Promise<string[]> {
    const sitemapUrls = [
      `${baseUrl}/sitemap.xml`,
      `${baseUrl}/sitemap_index.xml`,
      `${baseUrl}/sitemaps.xml`
    ];

    for (const sitemapUrl of sitemapUrls) {
      try {
        const response = await fetch(sitemapUrl, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (compatible; PageDoctor/1.0)'
          }
        });

        if (response.ok) {
          const xmlText = await response.text();
          const urls = await this.parseSitemapXml(xmlText, baseUrl);
          if (urls.length > 0) {
            return urls;
          }
        }
      } catch (error) {
        console.log(`Failed to fetch ${sitemapUrl}:`, error);
        continue;
      }
    }

    return [];
  }

  /**
   * Parse sitemap XML and extract URLs
   */
  private static async parseSitemapXml(xmlText: string, baseUrl: string): Promise<string[]> {
    const urls: string[] = [];
    
    try {
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(xmlText, 'text/xml');
      
      // Check for XML parsing errors
      const parserError = xmlDoc.querySelector('parsererror');
      if (parserError) {
        console.log('XML parsing error:', parserError.textContent);
        return [];
      }

      // Handle sitemap index (contains links to other sitemaps)
      const sitemapElements = xmlDoc.querySelectorAll('sitemap loc');
      if (sitemapElements.length > 0) {
        // This is a sitemap index, fetch the actual sitemaps
        for (const element of Array.from(sitemapElements).slice(0, 3)) { // Limit to 3 sitemaps
          const sitemapUrl = element.textContent?.trim();
          if (sitemapUrl) {
            try {
              const response = await fetch(sitemapUrl);
              if (response.ok) {
                const sitemapXml = await response.text();
                const sitemapUrls = await this.parseSitemapXml(sitemapXml, baseUrl);
                urls.push(...sitemapUrls);
              }
            } catch (error) {
              console.log(`Failed to fetch sitemap ${sitemapUrl}:`, error);
            }
          }
        }
      } else {
        // Handle regular sitemap (contains actual URLs)
        const urlElements = xmlDoc.querySelectorAll('url loc');
        for (const element of urlElements) {
          const url = element.textContent?.trim();
          if (url && this.isValidUrl(url, baseUrl)) {
            urls.push(url);
          }
        }
      }
    } catch (error) {
      console.error('Error parsing sitemap XML:', error);
    }

    return urls;
  }

  /**
   * Extract links from HTML page
   */
  private static async getLinksFromHtml(url: string): Promise<string[]> {
    try {
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; PageDoctor/1.0)'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const html = await response.text();
      return this.parseLinksFromHtml(html, url);
    } catch (error) {
      console.error('Error fetching HTML:', error);
      // Return at least the original URL
      return [url];
    }
  }

  /**
   * Parse HTML and extract internal links
   */
  private static parseLinksFromHtml(html: string, baseUrl: string): string[] {
    const urls: Set<string> = new Set([baseUrl]); // Always include the base URL
    
    try {
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, 'text/html');
      
      const links = doc.querySelectorAll('a[href]');
      const baseUrlObj = new URL(baseUrl);
      
      for (const link of links) {
        const href = link.getAttribute('href');
        if (!href) continue;

        try {
          let fullUrl: string;
          
          if (href.startsWith('http')) {
            fullUrl = href;
          } else if (href.startsWith('/')) {
            fullUrl = `${baseUrlObj.protocol}//${baseUrlObj.host}${href}`;
          } else if (href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('tel:')) {
            continue; // Skip anchors and non-HTTP links
          } else {
            fullUrl = new URL(href, baseUrl).toString();
          }

          // Only include URLs from the same domain
          const linkUrl = new URL(fullUrl);
          if (linkUrl.hostname === baseUrlObj.hostname && this.isValidUrl(fullUrl, baseUrl)) {
            urls.add(fullUrl);
          }
        } catch (error) {
          // Skip invalid URLs
          continue;
        }
      }
    } catch (error) {
      console.error('Error parsing HTML:', error);
    }

    return Array.from(urls);
  }

  /**
   * Validate if URL is suitable for auditing
   */
  private static isValidUrl(url: string, baseUrl: string): boolean {
    try {
      const urlObj = new URL(url);
      const baseUrlObj = new URL(baseUrl);
      
      // Must be same domain
      if (urlObj.hostname !== baseUrlObj.hostname) {
        return false;
      }

      // Skip common non-content URLs
      const path = urlObj.pathname.toLowerCase();
      const skipPatterns = [
        '/wp-admin/', '/admin/', '/api/', '/feed/', '/rss/',
        '.xml', '.json', '.pdf', '.jpg', '.png', '.gif', '.svg',
        '/wp-content/', '/wp-includes/', '/node_modules/',
        '/assets/', '/static/', '/media/', '/images/',
        '/css/', '/js/', '/fonts/'
      ];

      return !skipPatterns.some(pattern => path.includes(pattern));
    } catch {
      return false;
    }
  }
}