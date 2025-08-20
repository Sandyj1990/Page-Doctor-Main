// Lovable-compatible adapter - disables server-side crawling
export class LovableAuditAdapter {
  static isLovableEnvironment(): boolean {
    return typeof window !== 'undefined' && 
           !process.env.NODE_ENV || 
           process.env.NODE_ENV === 'development';
  }

  static async performLimitedAudit(url: string) {
    if (!this.isLovableEnvironment()) {
      throw new Error('This adapter is only for Lovable/browser environments');
    }

    console.log('🌐 Lovable Mode: Using API-only audit (no crawling)');
    
    try {
      // Option 1: PageSpeed API only (if you have API key)
      const pageSpeedKey = process.env.VITE_PAGESPEED_API_KEY;
      if (pageSpeedKey) {
        const response = await fetch(
          `https://www.googleapis.com/pagespeed/insights/v5/runPagespeed?url=${encodeURIComponent(url)}&key=${pageSpeedKey}&strategy=desktop&category=performance&category=accessibility&category=best-practices&category=seo`
        );
        
        if (response.ok) {
          const data = await response.json();
          return this.convertPageSpeedToAudit(data, url);
        }
      }

      // Option 2: Basic URL analysis (no external calls)
      return this.generateBasicAudit(url);
      
    } catch (error) {
      console.error('Lovable audit failed:', error);
      throw new Error(`Audit failed in Lovable environment: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private static convertPageSpeedToAudit(pageSpeedData: any, url: string) {
    const lighthouse = pageSpeedData.lighthouseResult;
    const categories = lighthouse?.categories || {};
    
    return {
      url,
      overallScore: Math.round((
        (categories.performance?.score || 0) * 100 +
        (categories.accessibility?.score || 0) * 100 +
        (categories['best-practices']?.score || 0) * 100 +
        (categories.seo?.score || 0) * 100
      ) / 4),
      writing: {
        readabilityScore: 75, // Default since we can't analyze content
        grammarSpelling: { score: 80, errors: [], suggestions: [] },
        contentLength: lighthouse?.audits?.['dom-size']?.numericValue || 0,
        headingStructure: 70
      },
      seo: {
        titleTags: categories.seo?.score ? Math.round(categories.seo.score * 100) : 70,
        metaDescription: categories.seo?.score ? Math.round(categories.seo.score * 100) : 70,
        urlStructure: 80,
        internalLinking: 70
      },
      structure: {
        navigationLayout: 75,
        mobileLayout: categories.accessibility?.score ? Math.round(categories.accessibility.score * 100) : 70,
        visualSpacing: 80,
        typography: 75
      },
      technical: {
        pageSpeed: categories.performance?.score ? Math.round(categories.performance.score * 100) : 50,
        htmlValidation: 80,
        httpsSecurityValidation: new URL(url).protocol === 'https:' ? 100 : 0,
        mobileFriendly: 80
      },
      recommendations: [
        'Lovable deployment detected - limited analysis available',
        'For full crawling features, deploy to Railway, Render, or Fly.io',
        'Consider using the hybrid approach: Lovable frontend + external API backend'
      ],
      auditType: 'lovable-limited',
      timestamp: new Date().toISOString(),
      processingTime: 1000
    };
  }

  private static generateBasicAudit(url: string) {
    const urlObj = new URL(url);
    const isHttps = urlObj.protocol === 'https:';
    const hasWww = urlObj.hostname.startsWith('www.');
    
    return {
      url,
      overallScore: 75,
      writing: {
        readabilityScore: 75,
        grammarSpelling: { score: 80, errors: [], suggestions: [] },
        contentLength: 1000,
        headingStructure: 70
      },
      seo: {
        titleTags: 70,
        metaDescription: 70,
        urlStructure: hasWww ? 85 : 75,
        internalLinking: 70
      },
      structure: {
        navigationLayout: 75,
        mobileLayout: 75,
        visualSpacing: 80,
        typography: 75
      },
      technical: {
        pageSpeed: 60,
        htmlValidation: 80,
        httpsSecurityValidation: isHttps ? 100 : 0,
        mobileFriendly: 80
      },
      recommendations: [
        '⚠️ Limited Lovable analysis - no real crawling available',
        '🚀 For full features, deploy to Railway, Render, or Fly.io',
        isHttps ? '✅ HTTPS detected' : '❌ Consider switching to HTTPS',
        '💡 This is a basic audit - real crawling needs server environment'
      ],
      auditType: 'lovable-basic',
      timestamp: new Date().toISOString(),
      processingTime: 500
    };
  }
} 