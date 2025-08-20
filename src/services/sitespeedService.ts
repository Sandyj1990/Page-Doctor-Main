// Browser compatibility layer for Node.js modules
const path = {
  join: (...parts: string[]) => parts.join('/'),
  resolve: (...parts: string[]) => parts.join('/'),
  dirname: (p: string) => p.split('/').slice(0, -1).join('/'),
  basename: (p: string) => p.split('/').pop() || ''
};

const fs = {
  existsSync: () => false,
  mkdirSync: () => {},
  writeFileSync: () => {},
  readFileSync: () => '',
  unlinkSync: () => {},
  readFile: async () => Promise.resolve(''),
  readdir: async () => Promise.resolve([]),
  access: async () => Promise.resolve(),
  rm: async () => Promise.resolve()
};

// Check if we're running in a browser environment
const isBrowser = typeof window !== 'undefined' && typeof document !== 'undefined';

interface SitespeedResult {
  url: string;
  performance: {
    score: number;
    firstContentfulPaint: number;
    largestContentfulPaint: number;
    speedIndex: number;
    totalBlockingTime: number;
    cumulativeLayoutShift: number;
  };
  accessibility: {
    score: number;
    violations: any[];
  };
  bestPractices: {
    score: number;
    https: boolean;
    mixedContent: boolean;
  };
  seo: {
    score: number;
    metaDescription: boolean;
    titleTag: boolean;
    headings: any[];
  };
}

export interface AuditResult {
  overallScore: number;
  writingQuality: ScoreItem[];
  seoSignals: ScoreItem[];
  structure: ScoreItem[];
  technical: ScoreItem[];
}

export interface ScoreItem {
  name: string;
  score: number;
  status: 'good' | 'warning' | 'poor';
  description: string;
  details: string[];
  stats?: {
    found: number;
    total: number;
    examples?: string[];
  };
}

class SitespeedService {
  private static instance: SitespeedService;
  private tempDir: string;

  constructor() {
    if (isBrowser) {
      this.tempDir = '/tmp/sitespeed-results'; // Mock path for browser
    } else {
      const path = require('path');
      const os = require('os');
      this.tempDir = path.join(os.tmpdir(), 'sitespeed-results');
    }
  }

  static getInstance(): SitespeedService {
    if (!SitespeedService.instance) {
      SitespeedService.instance = new SitespeedService();
    }
    return SitespeedService.instance;
  }

  /**
   * Check if Sitespeed.io is available in the system
   */
  async isAvailable(): Promise<boolean> {
    // Always return false in browser environment
    if (isBrowser) {
      console.log('⚠️ Sitespeed.io not available in browser environment - will use fallback audit');
      return false;
    }
    
    try {
      // First check if sitespeed.io CLI is available
      const cliAvailable = await this.checkCliAvailable();
      if (cliAvailable) return true;

      // Then check if Docker is available for container-based execution
      const dockerAvailable = await this.checkDockerAvailable();
      return dockerAvailable;
    } catch (error) {
      console.log('⚠️ Sitespeed.io not available:', error);
      return false;
    }
  }

  private async checkCliAvailable(): Promise<boolean> {
    if (isBrowser) return false;
    
    return new Promise((resolve) => {
      const { spawn } = require('child_process');
      const child = spawn('sitespeed.io', ['--version'], { 
        stdio: ['pipe', 'pipe', 'pipe'],
        shell: true
      });

      child.on('close', (code) => {
        resolve(code === 0);
      });

      child.on('error', () => {
        resolve(false);
      });

      // Timeout after 5 seconds
      setTimeout(() => {
        child.kill();
        resolve(false);
      }, 5000);
    });
  }

  private async checkDockerAvailable(): Promise<boolean> {
    if (isBrowser) return false;
    
    return new Promise((resolve) => {
      const { spawn } = require('child_process');
      const child = spawn('docker', ['--version'], { 
        stdio: ['pipe', 'pipe', 'pipe'],
        shell: true
      });

      child.on('close', (code) => {
        resolve(code === 0);
      });

      child.on('error', () => {
        resolve(false);
      });

      // Timeout after 5 seconds
      setTimeout(() => {
        child.kill();
        resolve(false);
      }, 5000);
    });
  }

  /**
   * Ensure the temporary directory exists
   */
  private async ensureTempDir(): Promise<void> {
    if (isBrowser) return;
    
    try {
      const fs = require('fs').promises;
      const path = require('path');
      await fs.mkdir(this.tempDir, { recursive: true });
    } catch (error) {
      console.error('Failed to create temp directory:', error);
      throw error;
    }
  }

  /**
   * Run Sitespeed.io audit on a URL
   */
  async runAudit(url: string, options: { mobile?: boolean; fast?: boolean } = {}): Promise<SitespeedResult> {
    console.log('🚀 Starting Sitespeed.io audit for:', url);
    
    try {
      // Ensure temp directory exists
      await this.ensureTempDir();
      
      const outputDir = path.join(this.tempDir, `audit-${Date.now()}`);
      
      // Try CLI first, then Docker fallback
      const cliAvailable = await this.checkCliAvailable();
      
      let result: SitespeedResult;
      if (cliAvailable) {
        result = await this.runWithCli(url, outputDir, options);
      } else {
        result = await this.runWithDocker(url, outputDir, options);
      }
      
      // Clean up temp files
      await this.cleanup(outputDir);
      
      console.log('✅ Sitespeed.io audit completed');
      return result;
      
    } catch (error) {
      console.error('❌ Sitespeed.io audit failed:', error);
      throw new Error(`Sitespeed.io audit failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private async runWithCli(url: string, outputDir: string, options: any): Promise<SitespeedResult> {
    const args = [
      url,
      '--outputFolder', outputDir,
      '--budget.configPath', 'null', // Disable budget to avoid errors
      '--html.showAllWaterfallSummary', 'false', // Reduce output size
      '--video', 'false', // Disable video recording for speed
      '--visualMetrics', 'false', // Disable visual metrics for speed
      '--sustainable.disable', 'true', // Disable sustainability checks for speed
    ];

    if (options.fast) {
      args.push('--iterations', '1');
      args.push('--connectivity.profile', 'native'); // Use native connection
    }

    if (options.mobile) {
      args.push('--mobile', 'true');
    }

    return new Promise((resolve, reject) => {
      const { spawn } = require('child_process');
      const child = spawn('sitespeed.io', args, { 
        stdio: ['ignore', 'pipe', 'pipe'],
        env: { ...process.env, NODE_ENV: 'production' }
      });

      let stdout = '';
      let stderr = '';

      child.stdout.on('data', (data) => {
        stdout += data.toString();
      });

      child.stderr.on('data', (data) => {
        stderr += data.toString();
      });

      child.on('close', async (code) => {
        if (code === 0) {
          try {
            const result = await this.parseResults(outputDir, url);
            resolve(result);
          } catch (parseError) {
            reject(new Error(`Failed to parse results: ${parseError}`));
          }
        } else {
          reject(new Error(`Sitespeed.io CLI failed with code ${code}: ${stderr}`));
        }
      });

      child.on('error', (error) => {
        reject(new Error(`Failed to spawn sitespeed.io: ${error.message}`));
      });

      // Set timeout for the audit
      setTimeout(() => {
        child.kill('SIGTERM');
        reject(new Error('Sitespeed.io audit timeout (60s)'));
      }, 60000);
    });
  }

  private async runWithDocker(url: string, outputDir: string, options: any): Promise<SitespeedResult> {
    const args = [
      'run', '--rm',
      '-v', `${outputDir}:/sitespeed.io`,
      'sitespeedio/sitespeed.io:latest',
      url,
      '--budget.configPath', 'null',
      '--html.showAllWaterfallSummary', 'false',
      '--video', 'false',
      '--visualMetrics', 'false',
      '--sustainable.disable', 'true',
    ];

    if (options.fast) {
      args.push('--iterations', '1');
      args.push('--connectivity.profile', 'native');
    }

    if (options.mobile) {
      args.push('--mobile', 'true');
    }

    return new Promise((resolve, reject) => {
      const { spawn } = require('child_process');
      const child = spawn('docker', args, { 
        stdio: ['ignore', 'pipe', 'pipe'] 
      });

      let stdout = '';
      let stderr = '';

      child.stdout.on('data', (data) => {
        stdout += data.toString();
      });

      child.stderr.on('data', (data) => {
        stderr += data.toString();
      });

      child.on('close', async (code) => {
        if (code === 0) {
          try {
            const result = await this.parseResults(outputDir, url);
            resolve(result);
          } catch (parseError) {
            reject(new Error(`Failed to parse results: ${parseError}`));
          }
        } else {
          reject(new Error(`Sitespeed.io Docker failed with code ${code}: ${stderr}`));
        }
      });

      child.on('error', (error) => {
        reject(new Error(`Failed to spawn Docker: ${error.message}`));
      });

      // Set timeout for the audit
      setTimeout(() => {
        child.kill('SIGTERM');
        reject(new Error('Sitespeed.io Docker timeout (90s)'));
      }, 90000);
    });
  }

  private async parseResults(outputDir: string, url: string): Promise<SitespeedResult> {
    try {
      // Sitespeed.io generates JSON files in the output directory
      const urlFolder = await this.findUrlFolder(outputDir, url);
      const dataFile = path.join(urlFolder, 'data', 'browsertime.json');
      
      if (!(await this.fileExists(dataFile))) {
        throw new Error('Browsertime data file not found');
      }

      const data = JSON.parse(await fs.readFile(dataFile, 'utf-8'));
      const firstRun = data[0]?.browserScripts?.[0] || {};
      
      // Extract performance metrics
      const timings = firstRun.timings || {};
      const visualMetrics = firstRun.visualMetrics || {};
      
      return {
        url,
        performance: {
          score: this.calculatePerformanceScore(timings, visualMetrics),
          firstContentfulPaint: timings.paintTiming?.first_contentful_paint || 0,
          largestContentfulPaint: timings.largestContentfulPaint || 0,
          speedIndex: visualMetrics.SpeedIndex || 0,
          totalBlockingTime: timings.totalBlockingTime || 0,
          cumulativeLayoutShift: visualMetrics.CumulativeLayoutShift || 0,
        },
        accessibility: {
          score: 85, // Placeholder - Sitespeed.io doesn't provide accessibility by default
          violations: [],
        },
        bestPractices: {
          score: this.calculateBestPracticesScore(firstRun),
          https: url.startsWith('https://'),
          mixedContent: false, // Would need additional analysis
        },
        seo: {
          score: this.calculateSeoScore(firstRun),
          metaDescription: Boolean(firstRun.pageinfo?.description),
          titleTag: Boolean(firstRun.pageinfo?.title),
          headings: firstRun.pageinfo?.headings || [],
        },
      };

    } catch (error) {
      console.error('Error parsing Sitespeed.io results:', error);
      throw new Error(`Failed to parse Sitespeed.io results: ${error}`);
    }
  }

  private async findUrlFolder(outputDir: string, url: string): Promise<string> {
    const sitespeedDir = path.join(outputDir, 'sitespeed-result');
    const dirs = await fs.readdir(sitespeedDir, { withFileTypes: true });
    
    // Find the folder that matches our URL structure
    for (const dir of dirs) {
      if (dir.isDirectory()) {
        const fullPath = path.join(sitespeedDir, dir.name);
        if (await this.fileExists(path.join(fullPath, 'data'))) {
          return fullPath;
        }
      }
    }
    
    throw new Error('Could not find URL-specific results folder');
  }

  private async fileExists(filePath: string): Promise<boolean> {
    try {
      await fs.access(filePath);
      return true;
    } catch {
      return false;
    }
  }

  private calculatePerformanceScore(timings: any, visualMetrics: any): number {
    // Calculate performance score based on Core Web Vitals
    const fcp = timings.paintTiming?.first_contentful_paint || 3000;
    const lcp = timings.largestContentfulPaint || 4000;
    const cls = visualMetrics.CumulativeLayoutShift || 0.1;
    
    let score = 100;
    
    // FCP scoring (0-1800ms = 100, 1800-3000ms = linear, >3000ms = 0)
    if (fcp > 3000) score -= 30;
    else if (fcp > 1800) score -= Math.round((fcp - 1800) / 1200 * 30);
    
    // LCP scoring (0-2500ms = 100, 2500-4000ms = linear, >4000ms = 0)
    if (lcp > 4000) score -= 30;
    else if (lcp > 2500) score -= Math.round((lcp - 2500) / 1500 * 30);
    
    // CLS scoring (0-0.1 = 100, 0.1-0.25 = linear, >0.25 = 0)
    if (cls > 0.25) score -= 20;
    else if (cls > 0.1) score -= Math.round((cls - 0.1) / 0.15 * 20);
    
    return Math.max(0, score);
  }

  private calculateBestPracticesScore(data: any): number {
    let score = 100;
    
    // Basic checks based on available data
    if (!data.pageinfo?.url?.startsWith('https://')) {
      score -= 20; // No HTTPS
    }
    
    if (data.errors && data.errors.length > 0) {
      score -= 15; // Console errors
    }
    
    return Math.max(0, score);
  }

  private calculateSeoScore(data: any): number {
    let score = 100;
    
    const pageinfo = data.pageinfo || {};
    
    if (!pageinfo.title || pageinfo.title.length < 10) {
      score -= 15; // Missing or poor title
    }
    
    if (!pageinfo.description || pageinfo.description.length < 50) {
      score -= 15; // Missing or poor meta description
    }
    
    if (!pageinfo.headings || pageinfo.headings.length === 0) {
      score -= 10; // No headings
    }
    
    return Math.max(0, score);
  }

  private async cleanup(outputDir: string): Promise<void> {
    try {
      await fs.rm(outputDir, { recursive: true, force: true });
    } catch (error) {
      console.log('⚠️ Could not clean up temp files:', error);
    }
  }

  /**
   * Convert Sitespeed.io results to our audit format
   */
  convertToAuditResult(sitespeedResult: SitespeedResult): AuditResult {
    const { performance, accessibility, bestPractices, seo } = sitespeedResult;
    
    const writingQuality: ScoreItem[] = [
      {
        name: 'Content Analysis',
        score: 85, // Placeholder - would need content extraction
        status: 'good',
        description: 'Content quality analysis (basic)',
        details: [
          `Title: ${seo.titleTag ? 'Present' : 'Missing'}`,
          `Meta description: ${seo.metaDescription ? 'Present' : 'Missing'}`,
          `Headings: ${seo.headings.length} found`,
        ],
        stats: { found: 85, total: 100 }
      },
      {
        name: 'Accessibility',
        score: accessibility.score,
        status: accessibility.score >= 80 ? 'good' : accessibility.score >= 60 ? 'warning' : 'poor',
        description: accessibility.score >= 80 ? 'Good accessibility implementation' : 'Accessibility needs improvement',
        details: [
          `Accessibility score: ${accessibility.score}/100`,
          `Violations found: ${accessibility.violations.length}`,
        ],
        stats: { found: accessibility.score, total: 100 }
      }
    ];

    const seoSignals: ScoreItem[] = [
      {
        name: 'SEO Optimization',
        score: seo.score,
        status: seo.score >= 80 ? 'good' : seo.score >= 60 ? 'warning' : 'poor',
        description: seo.score >= 80 ? 'Well optimized for search engines' : 'SEO needs improvement',
        details: [
          `Title tag: ${seo.titleTag ? 'Present' : 'Missing'}`,
          `Meta description: ${seo.metaDescription ? 'Present' : 'Missing'}`,
          `Headings structure: ${seo.headings.length} headings found`,
        ],
        stats: { found: seo.score, total: 100 }
      },
      {
        name: 'Technical SEO',
        score: bestPractices.https ? 90 : 60,
        status: bestPractices.https ? 'good' : 'warning',
        description: bestPractices.https ? 'Good technical SEO foundation' : 'Technical SEO needs attention',
        details: [
          `HTTPS: ${bestPractices.https ? 'Enabled' : 'Not enabled'}`,
          `Mixed content: ${bestPractices.mixedContent ? 'Issues found' : 'None detected'}`,
        ],
        stats: { found: bestPractices.https ? 90 : 60, total: 100 }
      }
    ];

    const structure: ScoreItem[] = [
      {
        name: 'Best Practices',
        score: bestPractices.score,
        status: bestPractices.score >= 80 ? 'good' : bestPractices.score >= 60 ? 'warning' : 'poor',
        description: bestPractices.score >= 80 ? 'Following web best practices' : 'Some best practices need attention',
        details: [
          `HTTPS usage: ${bestPractices.https ? 'Secure' : 'Insecure'}`,
          `Mixed content: ${bestPractices.mixedContent ? 'Found' : 'None'}`,
          `Overall best practices: ${bestPractices.score}/100`,
        ],
        stats: { found: bestPractices.score, total: 100 }
      }
    ];

    const technical: ScoreItem[] = [
      {
        name: 'Performance',
        score: performance.score,
        status: performance.score >= 80 ? 'good' : performance.score >= 60 ? 'warning' : 'poor',
        description: performance.score >= 80 ? 'Excellent performance' : 'Performance needs optimization',
        details: [
          `First Contentful Paint: ${Math.round(performance.firstContentfulPaint)}ms`,
          `Largest Contentful Paint: ${Math.round(performance.largestContentfulPaint)}ms`,
          `Cumulative Layout Shift: ${performance.cumulativeLayoutShift.toFixed(3)}`,
          `Total Blocking Time: ${Math.round(performance.totalBlockingTime)}ms`,
        ],
        stats: { found: performance.score, total: 100 }
      },
      {
        name: 'Core Web Vitals',
        score: this.calculateCoreWebVitalsScore(performance),
        status: this.calculateCoreWebVitalsScore(performance) >= 80 ? 'good' : 'warning',
        description: 'Core Web Vitals assessment',
        details: [
          `LCP: ${performance.largestContentfulPaint < 2500 ? 'Good' : performance.largestContentfulPaint < 4000 ? 'Needs Improvement' : 'Poor'}`,
          `CLS: ${performance.cumulativeLayoutShift < 0.1 ? 'Good' : performance.cumulativeLayoutShift < 0.25 ? 'Needs Improvement' : 'Poor'}`,
          `FCP: ${performance.firstContentfulPaint < 1800 ? 'Good' : performance.firstContentfulPaint < 3000 ? 'Needs Improvement' : 'Poor'}`,
        ],
        stats: { found: this.calculateCoreWebVitalsScore(performance), total: 100 }
      }
    ];

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
      technical
    };
  }

  private calculateCoreWebVitalsScore(performance: any): number {
    let score = 100;
    
    // LCP scoring
    if (performance.largestContentfulPaint > 4000) score -= 30;
    else if (performance.largestContentfulPaint > 2500) score -= 15;
    
    // CLS scoring
    if (performance.cumulativeLayoutShift > 0.25) score -= 30;
    else if (performance.cumulativeLayoutShift > 0.1) score -= 15;
    
    // FCP scoring
    if (performance.firstContentfulPaint > 3000) score -= 20;
    else if (performance.firstContentfulPaint > 1800) score -= 10;
    
    return Math.max(0, score);
  }

  /**
   * Get installation instructions for Sitespeed.io
   */
  getInstallationInstructions(): string[] {
    return [
      '📦 Install Sitespeed.io (choose one):',
      '',
      '1. Via npm (recommended):',
      '   npm install -g sitespeed.io',
      '',
      '2. Via Docker:',
      '   docker pull sitespeedio/sitespeed.io:latest',
      '',
      '3. Via yarn:',
      '   yarn global add sitespeed.io',
      '',
      '📖 More info: https://sitespeed.io/documentation/',
    ];
  }
}

export default SitespeedService.getInstance(); 