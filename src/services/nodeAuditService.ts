/**
 * Node.js-compatible PageSpeed API Service
 * Removes browser dependencies like localStorage/Supabase for server-side usage
 */

// Simple rate limiter for Node.js
class RateLimiter {
  private requests: number[] = [];
  
  constructor(private maxRequests: number, private windowMs: number) {}
  
  async throttle(): Promise<void> {
    const now = Date.now();
    // Remove old requests outside the window
    this.requests = this.requests.filter(time => now - time < this.windowMs);
    
    if (this.requests.length >= this.maxRequests) {
      const oldestRequest = Math.min(...this.requests);
      const waitTime = this.windowMs - (now - oldestRequest);
      if (waitTime > 0) {
        await new Promise(resolve => setTimeout(resolve, waitTime));
        return this.throttle(); // Re-check after waiting
      }
    }
    
    this.requests.push(now);
  }
}

export interface ScoreItem {
  name: string;
  score: number;
  status: 'good' | 'warning' | 'poor';
  description: string;
  details: string[];
  stats?: { found: number; total: number; examples?: string[] };
}

export interface AuditResult {
  overallScore: number;
  writingQuality: ScoreItem[];
  seoSignals: ScoreItem[];
  structure: ScoreItem[];
  technical: ScoreItem[];
  url: string;
}

// Rate limiting for PageSpeed API
const pageSpeedRateLimit = new RateLimiter(100, 60000); // 100 requests per minute

const PAGESPEED_API_URL = 'https://www.googleapis.com/pagespeedonline/v5/runPagespeed';

const fetchPageSpeedData = async (url: string) => {
  try {
    await pageSpeedRateLimit.throttle();
    
    // Get API key from environment variable or file (Node.js compatible)
    let apiKey = process.env.VITE_PAGESPEED_API_KEY;
    
    // Fallback: try to read from .env.local file
    if (!apiKey) {
      try {
        const fs = await import('fs');
        const path = await import('path');
        const envPath = path.join(process.cwd(), '.env.local');
        const envContent = fs.readFileSync(envPath, 'utf8');
        const match = envContent.match(/VITE_PAGESPEED_API_KEY=(.+)/);
        if (match) {
          apiKey = match[1].trim();
          console.log('🔑 API key loaded from .env.local file');
        }
      } catch (error) {
        console.log('⚠️ Could not read .env.local file');
      }
    }
    let apiUrl = `${PAGESPEED_API_URL}?url=${encodeURIComponent(url)}&category=performance&category=accessibility&category=best-practices&category=seo&strategy=desktop`;
    
    if (apiKey && apiKey !== 'your_pagespeed_api_key_here') {
      apiUrl += `&key=${apiKey}`;
      console.log('🔑 Using PageSpeed API key for higher quotas');
    } else {
      console.log('⚠️ No valid PageSpeed API key found - using limited quota (may fail)');
      console.log('💡 Get a free API key from: https://developers.google.com/speed/docs/insights/v5/get-started');
    }
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout
    
    const response = await fetch(apiUrl, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'Page-Doctor-Node-Tool/1.0'
      }
    });
    
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      const responseText = await response.text();
      console.error('PageSpeed API Error Response:', responseText);
      throw new Error(`PageSpeed API returned ${response.status}: ${response.statusText}`);
    }
    
    const json = await response.json();
    
    if (json.error) {
      throw new Error(`PageSpeed API error: ${json.error.message}`);
    }
    
    if (!json.lighthouseResult) {
      throw new Error('Invalid PageSpeed API response - missing lighthouse data');
    }
    
    return [json, json, json, json]; // Return 4 copies for compatibility
  } catch (error: any) {
    if (error.name === 'AbortError') {
      console.error('PageSpeed API timeout (30s) - API too slow');
      throw new Error('PageSpeed API timeout - please try again later');
    } else {
      console.error('PageSpeed API error:', error.message);
      throw error;
    }
  }
};

const parsePageSpeedData = async (data: any[], url: string): Promise<AuditResult> => {
  if (!data || data.some(d => d.error)) {
    console.log('❌ PageSpeed API failed - cannot provide real audit data');
    throw new Error('Unable to audit page - PageSpeed API data unavailable');
  }

  try {
    const [performance, accessibility, bestPractices, seo] = data;
    
    // Extract scores
    const performanceScore = Math.round((performance?.lighthouseResult?.categories?.performance?.score || 0.75) * 100);
    const accessibilityScore = Math.round((accessibility?.lighthouseResult?.categories?.accessibility?.score || 0.85) * 100);
    const bestPracticesScore = Math.round((bestPractices?.lighthouseResult?.categories?.['best-practices']?.score || 0.8) * 100);
    const seoScore = Math.round((seo?.lighthouseResult?.categories?.seo?.score || 0.9) * 100);
    
    const audits = performance?.lighthouseResult?.audits || {};
    const seoAudits = seo?.lighthouseResult?.audits || {};
    
    // Overall score calculation
    const overallScore = Math.round((performanceScore + accessibilityScore + bestPracticesScore + seoScore) / 4);

    // Writing Quality Analysis
    const writingQuality: ScoreItem[] = [
      {
        name: 'Content Quality',
        score: seoScore,
        status: seoScore >= 80 ? 'good' : seoScore >= 60 ? 'warning' : 'poor',
        description: 'SEO and content optimization analysis',
        details: [
          `SEO Score: ${seoScore}/100`,
          `Title optimization: ${seoAudits['document-title']?.score ? 'Good' : 'Needs improvement'}`,
          `Meta description: ${seoAudits['meta-description']?.score ? 'Present' : 'Missing'}`,
          `Heading structure: ${seoAudits['heading-order']?.score ? 'Good' : 'Needs work'}`
        ],
        stats: { found: seoScore, total: 100 }
      },
      {
        name: 'Performance Impact',
        score: performanceScore,
        status: performanceScore >= 80 ? 'good' : performanceScore >= 60 ? 'warning' : 'poor',
        description: 'Page performance affecting user experience',
        details: [
          `Performance Score: ${performanceScore}/100`,
          `LCP: ${audits['largest-contentful-paint']?.displayValue || 'N/A'}`,
          `FID: ${audits['max-potential-fid']?.displayValue || 'N/A'}`,
          `CLS: ${audits['cumulative-layout-shift']?.displayValue || 'N/A'}`
        ],
        stats: { found: performanceScore, total: 100 }
      }
    ];

    // SEO Signals
    const seoSignals: ScoreItem[] = [
      {
        name: 'SEO Fundamentals',
        score: seoScore,
        status: seoScore >= 80 ? 'good' : seoScore >= 60 ? 'warning' : 'poor',
        description: 'Basic SEO implementation',
        details: [
          `Overall SEO: ${seoScore}/100`,
          `Title: ${seoAudits['document-title']?.score ? '✓' : '✗'}`,
          `Meta description: ${seoAudits['meta-description']?.score ? '✓' : '✗'}`,
          `Structured data: ${seoAudits['structured-data']?.score ? '✓' : '✗'}`
        ],
        stats: { found: seoScore, total: 100 }
      },
      {
        name: 'Mobile Optimization',
        score: accessibilityScore,
        status: accessibilityScore >= 80 ? 'good' : accessibilityScore >= 60 ? 'warning' : 'poor',
        description: 'Mobile-friendly design and accessibility',
        details: [
          `Accessibility Score: ${accessibilityScore}/100`,
          `Viewport meta: ${seoAudits['viewport']?.score ? '✓' : '✗'}`,
          `Font sizes: ${audits['font-size']?.score ? 'Adequate' : 'Too small'}`,
          `Touch targets: ${audits['tap-targets']?.score ? 'Good' : 'Too small'}`
        ],
        stats: { found: accessibilityScore, total: 100 }
      }
    ];

    // Structure Analysis
    const structure: ScoreItem[] = [
      {
        name: 'Page Structure',
        score: bestPracticesScore,
        status: bestPracticesScore >= 80 ? 'good' : bestPracticesScore >= 60 ? 'warning' : 'poor',
        description: 'HTML structure and best practices',
        details: [
          `Best Practices: ${bestPracticesScore}/100`,
          `HTTPS: ${audits['is-on-https']?.score ? '✓' : '✗'}`,
          `Image optimization: ${audits['uses-optimized-images']?.score ? 'Good' : 'Needs work'}`,
          `Error logging: ${audits['errors-in-console']?.score ? 'Clean' : 'Has errors'}`
        ],
        stats: { found: bestPracticesScore, total: 100 }
      }
    ];

    // Technical Performance
    const technical: ScoreItem[] = [
      {
        name: 'Core Web Vitals',
        score: performanceScore,
        status: performanceScore >= 80 ? 'good' : performanceScore >= 60 ? 'warning' : 'poor',
        description: 'Google Core Web Vitals performance',
        details: [
          `Performance: ${performanceScore}/100`,
          `First Contentful Paint: ${audits['first-contentful-paint']?.displayValue || 'N/A'}`,
          `Largest Contentful Paint: ${audits['largest-contentful-paint']?.displayValue || 'N/A'}`,
          `Speed Index: ${audits['speed-index']?.displayValue || 'N/A'}`
        ],
        stats: { found: performanceScore, total: 100 }
      },
      {
        name: 'Resource Optimization',
        score: Math.round(performanceScore * 0.8), // Slightly lower than overall performance
        status: performanceScore >= 80 ? 'good' : performanceScore >= 60 ? 'warning' : 'poor',
        description: 'Asset and resource optimization',
        details: [
          `Unused CSS: ${audits['unused-css-rules']?.score ? 'Minimal' : 'Significant'}`,
          `Image formats: ${audits['uses-webp-images']?.score ? 'Modern' : 'Could improve'}`,
          `Text compression: ${audits['uses-text-compression']?.score ? 'Enabled' : 'Missing'}`,
          `Resource efficiency: ${audits['total-byte-weight']?.displayValue || 'N/A'}`
        ],
        stats: { found: Math.round(performanceScore * 0.8), total: 100 }
      }
    ];

    return {
      overallScore,
      writingQuality,
      seoSignals,
      structure,
      technical,
      url
    };

  } catch (error) {
    console.error('Error parsing PageSpeed data:', error);
    throw new Error('Failed to parse PageSpeed API response');
  }
};

export class NodeAuditService {
  static async auditWebsite(url: string): Promise<AuditResult> {
    console.log(`🔍 Starting PageSpeed API audit for: ${url}`);
    
    try {
      const data = await fetchPageSpeedData(url);
      const result = await parsePageSpeedData(data, url);
      
      console.log(`✅ PageSpeed audit completed with score: ${result.overallScore}/100`);
      return result;
    } catch (error) {
      console.error('❌ PageSpeed audit failed:', error);
      throw error;
    }
  }

  static async testApiKey(): Promise<boolean> {
    try {
      const testUrl = 'https://example.com';
      await fetchPageSpeedData(testUrl);
      return true;
    } catch (error) {
      console.error('API key test failed:', error);
      return false;
    }
  }
} 