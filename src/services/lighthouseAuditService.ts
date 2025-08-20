/**
 * Direct Lighthouse Integration Service
 * Open source alternative to Google PageSpeed API
 * No rate limits, no API keys, unlimited audits
 */

import { ScoreItem, AuditResult } from './auditService';
import { GrammarSpellingService, GrammarSpellingResult } from './grammarSpellingService';

interface LighthouseConfig {
  extends: 'lighthouse:default';
  settings: {
    onlyCategories: string[];
    output: string[];
    throttlingMethod: 'simulate' | 'devtools';
    screenEmulation: {
      mobile: boolean;
      disabled: boolean;
    };
  };
}

export class LighthouseAuditService {
  private static readonly DEFAULT_CONFIG: LighthouseConfig = {
    extends: 'lighthouse:default',
    settings: {
      onlyCategories: ['performance', 'accessibility', 'best-practices', 'seo'],
      output: ['json'],
      throttlingMethod: 'simulate',
      screenEmulation: {
        mobile: false,
        disabled: false
      }
    }
  };

  /**
   * Check if direct Lighthouse is available in the browser
   */
  static isAvailable(): boolean {
    // Check if we can load Lighthouse as a module or if it's available
    return typeof window !== 'undefined' && (
      // Check for Chrome DevTools Protocol (needed for Lighthouse)
      'chrome' in window ||
      // Check for Lighthouse npm package (if loaded)
      typeof require !== 'undefined'
    );
  }

  /**
   * Run Lighthouse audit directly in browser (Chrome only)
   */
  static async runDirectAudit(url: string): Promise<AuditResult> {
    const startTime = Date.now();
    console.log('🔬 Running direct Lighthouse audit for:', url);

    try {
      // Method 1: Use Chrome DevTools Protocol if available
      if ('chrome' in window && (window as any).chrome?.debugger) {
        return await this.runChromeDevToolsAudit(url);
      }

      // Method 2: Use iframe-based analysis for basic metrics
      return await this.runIframeBasedAnalysis(url);

    } catch (error) {
      console.error('❌ Direct Lighthouse audit failed:', error);
      throw new Error(`Lighthouse audit failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Chrome DevTools Protocol based audit (Chrome extension or dev mode)
   */
  private static async runChromeDevToolsAudit(url: string): Promise<AuditResult> {
    console.log('🚀 Using Chrome DevTools Protocol for Lighthouse');
    
    // This would require Chrome extension or developer mode
    throw new Error('Chrome DevTools Protocol audit not implemented yet - requires extension');
  }

  /**
   * Iframe-based analysis for basic performance metrics
   * This is a fallback that works in all browsers
   */
  private static async runIframeBasedAnalysis(url: string): Promise<AuditResult> {
    console.log('📊 Running iframe-based performance analysis');
    
    const startTime = Date.now();
    
    // Create hidden iframe to load and analyze the page
    const iframe = document.createElement('iframe');
    iframe.style.display = 'none';
    iframe.style.width = '1024px';
    iframe.style.height = '768px';
    
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        document.body.removeChild(iframe);
        reject(new Error('Analysis timeout - page took too long to load'));
      }, 15000);

      iframe.onload = async () => {
        clearTimeout(timeout);
        
        try {
          const metrics = await this.analyzeIframeContent(iframe, url);
          document.body.removeChild(iframe);
          
          const totalTime = Date.now() - startTime;
          console.log(`✅ Iframe analysis completed in ${totalTime}ms`);
          
          resolve(metrics);
        } catch (error) {
          document.body.removeChild(iframe);
          reject(error);
        }
      };

      iframe.onerror = () => {
        clearTimeout(timeout);
        document.body.removeChild(iframe);
        reject(new Error('Failed to load page in iframe - may be blocked by CORS'));
      };

      document.body.appendChild(iframe);
      iframe.src = url;
    });
  }

  /**
   * Analyze content loaded in iframe
   */
  private static async analyzeIframeContent(iframe: HTMLIFrameElement, url: string): Promise<AuditResult> {
    try {
      const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
      
      if (!iframeDoc) {
        throw new Error('Cannot access iframe content - likely blocked by CORS policy');
      }

      console.log('🔍 Analyzing page content...');
      
      // Basic content analysis
      const title = iframeDoc.title || '';
      const metaDescription = iframeDoc.querySelector('meta[name="description"]')?.getAttribute('content') || '';
      const headings = Array.from(iframeDoc.querySelectorAll('h1, h2, h3, h4, h5, h6'));
      const images = Array.from(iframeDoc.querySelectorAll('img'));
      const links = Array.from(iframeDoc.querySelectorAll('a[href]'));
      const scripts = Array.from(iframeDoc.querySelectorAll('script'));
      const styles = Array.from(iframeDoc.querySelectorAll('link[rel="stylesheet"], style'));

      // Run grammar and spelling analysis
      console.log('📝 Running grammar and spelling check...');
      const grammarSpellingResult = GrammarSpellingService.analyzePageContent(iframeDoc);
      
      // Calculate scores based on content analysis
      const writingQuality = this.analyzeWritingQuality(title, metaDescription, headings, iframeDoc, grammarSpellingResult);
      const seoSignals = this.analyzeSEOSignals(title, metaDescription, url, headings, images, iframeDoc);
      const structure = this.analyzeStructure(headings, images, links, iframeDoc);
      const technical = this.analyzeTechnical(scripts, styles, images, url, iframeDoc);

      // Calculate overall score
      const allScores = [
        ...writingQuality.map(item => item.score),
        ...seoSignals.map(item => item.score),
        ...structure.map(item => item.score),
        ...technical.map(item => item.score)
      ];
      
      const overallScore = Math.round(allScores.reduce((sum, score) => sum + score, 0) / allScores.length);

      return {
        overallScore,
        writingQuality,
        seoSignals,
        structure,
        technical,
        url
      };

    } catch (error) {
      console.error('Content analysis error:', error);
      throw new Error('Failed to analyze page content - CORS restrictions likely');
    }
  }

  /**
   * Analyze writing quality based on content with grammar and spelling check
   */
  private static analyzeWritingQuality(
    title: string, 
    metaDescription: string, 
    headings: Element[], 
    doc: Document, 
    grammarResult: { title: GrammarSpellingResult; headings: GrammarSpellingResult; body: GrammarSpellingResult; overall: GrammarSpellingResult }
  ): ScoreItem[] {
    const wordCount = grammarResult.overall.totalWords;
    const hasGoodTitle = title.length >= 10 && title.length <= 60;
    const hasGoodMeta = metaDescription.length >= 120 && metaDescription.length <= 160;
    const headingStructure = headings.length >= 2;
    
    // Use real grammar and spelling analysis
    const overallGrammarScore = grammarResult.overall.score;
    const spellingErrorCount = grammarResult.overall.spellingErrors.length;
    const grammarErrorCount = grammarResult.overall.grammarErrors.length;
    const readabilityScore = Math.round(grammarResult.overall.readabilityScore);

    return [
      {
        name: 'Content Quality',
        score: hasGoodTitle && hasGoodMeta ? 85 : hasGoodTitle || hasGoodMeta ? 65 : 45,
        status: hasGoodTitle && hasGoodMeta ? 'good' : hasGoodTitle || hasGoodMeta ? 'warning' : 'poor',
        description: 'Analysis of title and meta description quality',
        details: [
          `Title: ${title.length} characters ${hasGoodTitle ? '✓' : '✗'}`,
          `Meta description: ${metaDescription.length} characters ${hasGoodMeta ? '✓' : '✗'}`,
          `Word count: ${wordCount} words`,
          `Heading structure: ${headings.length} headings found`
        ],
        stats: { found: wordCount, total: 300, examples: [title, metaDescription].filter(Boolean).slice(0, 2) }
      },
      {
        name: 'Grammar & Spelling',
        score: overallGrammarScore,
        status: overallGrammarScore >= 80 ? 'good' : overallGrammarScore >= 60 ? 'warning' : 'poor',
        description: overallGrammarScore >= 80 ? 'Excellent writing quality' : 'Writing quality needs improvement',
        details: [
          `Spelling errors: ${spellingErrorCount} found`,
          `Grammar issues: ${grammarErrorCount} found`,
          `Overall writing score: ${overallGrammarScore}/100`,
          `Reading level: ${grammarResult.overall.statistics.readingLevel}`
        ],
        stats: { 
          found: wordCount - spellingErrorCount - grammarErrorCount, 
          total: wordCount, 
          examples: grammarResult.overall.suggestions.slice(0, 3)
        }
      },
      {
        name: 'Readability',
        score: readabilityScore,
        status: readabilityScore >= 70 ? 'good' : readabilityScore >= 30 ? 'warning' : 'poor',
        description: `Content readability: ${grammarResult.overall.statistics.readingLevel}`,
        details: [
          `Flesch Reading Score: ${readabilityScore}/100`,
          `Average words per sentence: ${Math.round(grammarResult.overall.statistics.avgWordsPerSentence)}`,
          `Complex words: ${grammarResult.overall.statistics.complexWords}`,
          `Reading level: ${grammarResult.overall.statistics.readingLevel}`
        ],
        stats: { found: readabilityScore, total: 100 }
      },
      {
        name: 'Content Structure',
        score: headingStructure ? 80 : 60,
        status: headingStructure ? 'good' : 'warning',
        description: 'Content organization and hierarchy',
        details: [
          `H1 tags: ${doc.querySelectorAll('h1').length}`,
          `H2 tags: ${doc.querySelectorAll('h2').length}`,
          `H3 tags: ${doc.querySelectorAll('h3').length}`,
          `Total headings: ${headings.length}`
        ],
        stats: { found: headings.length, total: 8 }
      }
    ];
  }

  /**
   * Analyze SEO signals
   */
  private static analyzeSEOSignals(title: string, metaDescription: string, url: string, headings: Element[], images: Element[], doc: Document): ScoreItem[] {
    const hasViewport = !!doc.querySelector('meta[name="viewport"]');
    const hasRobots = !!doc.querySelector('meta[name="robots"]');
    const imagesWithAlt = Array.from(images).filter(img => img.getAttribute('alt')).length;
    const isHTTPS = url.startsWith('https://');

    const seoScore = [hasViewport, hasRobots, title.length > 0, metaDescription.length > 0, isHTTPS].filter(Boolean).length * 20;

    return [
      {
        name: 'SEO Optimization',
        score: seoScore,
        status: seoScore >= 80 ? 'good' : seoScore >= 60 ? 'warning' : 'poor',
        description: 'Basic SEO implementation check',
        details: [
          `Meta viewport: ${hasViewport ? 'Present' : 'Missing'}`,
          `Meta robots: ${hasRobots ? 'Present' : 'Missing'}`,
          `Title tag: ${title.length > 0 ? 'Present' : 'Missing'}`,
          `Meta description: ${metaDescription.length > 0 ? 'Present' : 'Missing'}`,
          `HTTPS: ${isHTTPS ? 'Yes' : 'No'}`
        ],
        stats: { found: seoScore / 20, total: 5 }
      },
      {
        name: 'Image Optimization',
        score: images.length === 0 ? 100 : Math.round((imagesWithAlt / images.length) * 100),
        status: images.length === 0 ? 'good' : imagesWithAlt / images.length >= 0.8 ? 'good' : 'warning',
        description: 'Image accessibility and optimization',
        details: [
          `Total images: ${images.length}`,
          `Images with alt text: ${imagesWithAlt}`,
          `Alt text coverage: ${images.length > 0 ? Math.round((imagesWithAlt / images.length) * 100) : 100}%`,
          `Optimization: Basic check only`
        ],
        stats: { found: imagesWithAlt, total: images.length }
      }
    ];
  }

  /**
   * Analyze page structure
   */
  private static analyzeStructure(headings: Element[], images: Element[], links: Element[], doc: Document): ScoreItem[] {
    const hasH1 = doc.querySelectorAll('h1').length === 1;
    const hasNavigation = !!doc.querySelector('nav, [role="navigation"]');
    const hasMain = !!doc.querySelector('main, [role="main"]');
    const hasFooter = !!doc.querySelector('footer, [role="contentinfo"]');

    const structureScore = [hasH1, hasNavigation, hasMain, hasFooter].filter(Boolean).length * 25;

    return [
      {
        name: 'HTML Structure',
        score: structureScore,
        status: structureScore >= 75 ? 'good' : structureScore >= 50 ? 'warning' : 'poor',
        description: 'Semantic HTML structure analysis',
        details: [
          `H1 tag: ${hasH1 ? 'Single H1 found' : doc.querySelectorAll('h1').length > 1 ? 'Multiple H1s found' : 'No H1 found'}`,
          `Navigation: ${hasNavigation ? 'Present' : 'Missing'}`,
          `Main content: ${hasMain ? 'Present' : 'Missing'}`,
          `Footer: ${hasFooter ? 'Present' : 'Missing'}`
        ],
        stats: { found: structureScore / 25, total: 4 }
      }
    ];
  }

  /**
   * Analyze technical aspects
   */
  private static analyzeTechnical(scripts: Element[], styles: Element[], images: Element[], url: string, doc: Document): ScoreItem[] {
    const isHTTPS = url.startsWith('https://');
    const hasViewport = !!doc.querySelector('meta[name="viewport"]');
    const scriptCount = scripts.length;
    const styleCount = styles.length;

    // Simple performance estimation based on resource counts
    const resourceScore = Math.max(0, 100 - (scriptCount * 2) - (styleCount * 1) - (images.length * 0.5));

    return [
      {
        name: 'Basic Performance',
        score: Math.round(resourceScore),
        status: resourceScore >= 80 ? 'good' : resourceScore >= 60 ? 'warning' : 'poor',
        description: 'Resource count based performance estimate',
        details: [
          `Script tags: ${scriptCount}`,
          `Style resources: ${styleCount}`,
          `Images: ${images.length}`,
          `Estimated load: ${resourceScore > 80 ? 'Light' : resourceScore > 60 ? 'Moderate' : 'Heavy'}`
        ],
        stats: { found: Math.round(resourceScore), total: 100 }
      },
      {
        name: 'Security & Standards',
        score: isHTTPS && hasViewport ? 100 : isHTTPS || hasViewport ? 75 : 50,
        status: isHTTPS && hasViewport ? 'good' : 'warning',
        description: 'Basic security and mobile readiness',
        details: [
          `HTTPS: ${isHTTPS ? 'Secure' : 'Not secure'}`,
          `Mobile viewport: ${hasViewport ? 'Configured' : 'Missing'}`,
          `Protocol: ${url.split('://')[0].toUpperCase()}`,
          `Mobile ready: ${hasViewport ? 'Yes' : 'No'}`
        ],
        stats: { found: (isHTTPS ? 1 : 0) + (hasViewport ? 1 : 0), total: 2 }
      }
    ];
  }

  /**
   * Get capability information
   */
  static getCapabilities(): {
    available: boolean;
    features: string[];
    limitations: string[];
    recommendation: string;
  } {
    const isChrome = navigator.userAgent.includes('Chrome');
    const available = this.isAvailable();

    return {
      available,
      features: [
        'No API keys required',
        'Unlimited audits',
        'No rate limits',
        'Privacy focused - no data sent to Google',
        'Basic content analysis',
        'SEO fundamentals check',
        'HTML structure validation'
      ],
      limitations: [
        'Limited by CORS policy for external sites',
        'No real performance metrics (requires Lighthouse CDP)',
        'Cannot measure Core Web Vitals directly',
        'Basic analysis only (not as comprehensive as PageSpeed API)',
        'Works best with same-origin pages'
      ],
      recommendation: isChrome 
        ? 'Chrome detected - best compatibility for iframe analysis'
        : 'Consider using Chrome for better compatibility'
    };
  }
}

// Types
export interface DirectLighthouseResult extends AuditResult {
  analysisMethod: 'chrome-devtools' | 'iframe-analysis' | 'cors-blocked';
  limitations: string[];
} 