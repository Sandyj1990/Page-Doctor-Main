/**
 * Service for detecting and extracting website navigation structure
 */

export interface NavigationSection {
  name: string;
  href: string;
  children?: NavigationSection[];
}

export interface NavigationCategory {
  name: string;
  urls: string[];
  totalPages: number;
}

export class NavigationService {
  
  /**
   * Extract navigation structure from website HTML
   */
  static async extractNavigation(url: string): Promise<NavigationSection[]> {
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
      return this.parseNavigationFromHtml(html, url);
    } catch (error) {
      console.error('Error extracting navigation:', error);
      return [];
    }
  }

  /**
   * Parse HTML and extract navigation structure
   */
  private static parseNavigationFromHtml(html: string, baseUrl: string): NavigationSection[] {
    const sections: NavigationSection[] = [];
    
    try {
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, 'text/html');
      const baseUrlObj = new URL(baseUrl);
      
      // Look for common navigation selectors
      const navSelectors = [
        'nav ul',
        '.navigation ul',
        '.main-nav ul',
        '.navbar ul',
        '.menu ul',
        'header ul',
        '[role="navigation"] ul',
        '.nav ul'
      ];

      for (const selector of navSelectors) {
        const navElements = doc.querySelectorAll(selector);
        
        for (const navElement of navElements) {
          const extractedSections = this.extractSectionsFromElement(navElement, baseUrlObj);
          sections.push(...extractedSections);
        }
        
        // If we found sections, use the first successful navigation
        if (sections.length > 0) break;
      }

      // Fallback: look for dropdown menus specifically
      if (sections.length === 0) {
        const dropdownSections = this.extractDropdownSections(doc, baseUrlObj);
        sections.push(...dropdownSections);
      }

    } catch (error) {
      console.error('Error parsing navigation HTML:', error);
    }

    return this.deduplicateAndClean(sections);
  }

  /**
   * Extract sections from a navigation element
   */
  private static extractSectionsFromElement(element: Element, baseUrlObj: URL): NavigationSection[] {
    const sections: NavigationSection[] = [];
    
    // Look for top-level navigation items
    const topLevelItems = element.querySelectorAll(':scope > li');
    
    for (const item of topLevelItems) {
      const link = item.querySelector('a');
      if (!link) continue;

      const href = link.getAttribute('href');
      if (!href) continue;

      const name = link.textContent?.trim() || '';
      if (!name || name.length < 2) continue;

      try {
        const fullUrl = this.resolveUrl(href, baseUrlObj);
        if (!this.isValidInternalUrl(fullUrl, baseUrlObj)) continue;

        const section: NavigationSection = {
          name,
          href: fullUrl
        };

        // Check for dropdown children
        const subMenu = item.querySelector('ul');
        if (subMenu) {
          section.children = this.extractSubSections(subMenu, baseUrlObj);
        }

        sections.push(section);
      } catch {
        continue;
      }
    }

    return sections;
  }

  /**
   * Extract dropdown/submenu sections
   */
  private static extractDropdownSections(doc: Document, baseUrlObj: URL): NavigationSection[] {
    const sections: NavigationSection[] = [];
    
    // Look for common dropdown patterns
    const dropdownSelectors = [
      '.dropdown-menu a',
      '.submenu a',
      '.mega-menu a',
      '[class*="dropdown"] a',
      '[class*="submenu"] a'
    ];

    for (const selector of dropdownSelectors) {
      const links = doc.querySelectorAll(selector);
      
      for (const link of links) {
        const href = link.getAttribute('href');
        const name = link.textContent?.trim();
        
        if (!href || !name || name.length < 2) continue;

        try {
          const fullUrl = this.resolveUrl(href, baseUrlObj);
          if (!this.isValidInternalUrl(fullUrl, baseUrlObj)) continue;

          sections.push({
            name,
            href: fullUrl
          });
        } catch {
          continue;
        }
      }
    }

    return sections;
  }

  /**
   * Extract subsections from submenu
   */
  private static extractSubSections(subMenu: Element, baseUrlObj: URL): NavigationSection[] {
    const subSections: NavigationSection[] = [];
    
    const subLinks = subMenu.querySelectorAll('a');
    for (const link of subLinks) {
      const href = link.getAttribute('href');
      const name = link.textContent?.trim();
      
      if (!href || !name || name.length < 2) continue;

      try {
        const fullUrl = this.resolveUrl(href, baseUrlObj);
        if (!this.isValidInternalUrl(fullUrl, baseUrlObj)) continue;

        subSections.push({
          name,
          href: fullUrl
        });
      } catch {
        continue;
      }
    }

    return subSections;
  }

  /**
   * Organize navigation sections into auditable categories
   */
  static async organizeIntoCategories(
    sections: NavigationSection[], 
    baseUrl: string
  ): Promise<NavigationCategory[]> {
    const categories: NavigationCategory[] = [];
    
    for (const section of sections) {
      try {
        // Discover all URLs in this section
        const sectionUrls = await this.discoverSectionUrls(section, baseUrl);
        
        if (sectionUrls.length > 0) {
          categories.push({
            name: section.name,
            urls: sectionUrls,
            totalPages: sectionUrls.length
          });
        }
      } catch (error) {
        console.error(`Error organizing section ${section.name}:`, error);
      }
    }

    return categories;
  }

  /**
   * Discover all URLs within a navigation section
   */
  private static async discoverSectionUrls(section: NavigationSection, baseUrl: string): Promise<string[]> {
    const urls = new Set<string>([section.href]);
    const baseUrlObj = new URL(baseUrl);

    // Add children URLs if any
    if (section.children) {
      for (const child of section.children) {
        urls.add(child.href);
      }
    }

    // Try to discover more URLs by crawling the section's main page
    try {
      const response = await fetch(section.href, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; PageDoctor/1.0)'
        }
      });

      if (response.ok) {
        const html = await response.text();
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');
        
        // Look for links within the same section path
        const sectionPath = new URL(section.href).pathname;
        const pathPrefix = sectionPath.split('/').slice(0, -1).join('/');
        
        const links = doc.querySelectorAll('a[href]');
        for (const link of links) {
          const href = link.getAttribute('href');
          if (!href) continue;

          try {
            const fullUrl = this.resolveUrl(href, baseUrlObj);
            const linkPath = new URL(fullUrl).pathname;
            
            // Include URLs that are in the same section path
            if (this.isValidInternalUrl(fullUrl, baseUrlObj) && 
                (linkPath.startsWith(pathPrefix) || linkPath.startsWith(sectionPath))) {
              urls.add(fullUrl);
            }
          } catch {
            continue;
          }
        }
      }
    } catch (error) {
      console.log(`Could not crawl section ${section.name}:`, error);
    }

    // Limit to 15 URLs per section to avoid overwhelming audits
    return Array.from(urls).slice(0, 15);
  }

  /**
   * Resolve relative URLs to absolute URLs
   */
  private static resolveUrl(href: string, baseUrlObj: URL): string {
    if (href.startsWith('http')) {
      return href;
    } else if (href.startsWith('/')) {
      return `${baseUrlObj.protocol}//${baseUrlObj.host}${href}`;
    } else if (href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('tel:')) {
      throw new Error('Invalid URL type');
    } else {
      return new URL(href, baseUrlObj.toString()).toString();
    }
  }

  /**
   * Check if URL is valid for internal auditing
   */
  private static isValidInternalUrl(url: string, baseUrlObj: URL): boolean {
    try {
      const urlObj = new URL(url);
      
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
        '/css/', '/js/', '/fonts/', '/download'
      ];

      return !skipPatterns.some(pattern => path.includes(pattern));
    } catch {
      return false;
    }
  }

  /**
   * Remove duplicates and clean up sections
   */
  private static deduplicateAndClean(sections: NavigationSection[]): NavigationSection[] {
    const seen = new Set<string>();
    const cleaned: NavigationSection[] = [];

    for (const section of sections) {
      // Skip very short or generic names
      if (section.name.length < 2 || 
          ['home', 'index', '#', '', 'link'].includes(section.name.toLowerCase())) {
        continue;
      }

      const key = `${section.name.toLowerCase()}-${section.href}`;
      if (!seen.has(key)) {
        seen.add(key);
        
        // Clean up children too
        if (section.children) {
          section.children = this.deduplicateAndClean(section.children);
        }
        
        cleaned.push(section);
      }
    }

    return cleaned;
  }
}