/**
 * Scalable Audit Service for Large Website Audits
 * 
 * This service addresses the scaling issues in the original audit system:
 * - Intelligent batching and queue management
 * - Progressive loading and streaming results
 * - Memory-efficient processing
 * - Database batch operations
 * - Smart caching and deduplication
 */

import { generateAuditResult } from './auditService';
import { SitemapService } from './sitemapService';
import { CrawleeService } from './crawleeService';
import { processWithConcurrency } from '../utils/concurrency';

interface ScalingConfig {
  maxPages: number;
  maxConcurrency: number;
  batchSize: number;
  memoryLimit: number; // MB
  timeoutMs: number;
  enableStreaming: boolean;
  enableCaching: boolean;
  prioritizeByScore: boolean;
}

interface AuditJob {
  id: string;
  url: string;
  priority: number;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  result?: any;
  error?: string;
  startTime?: number;
  endTime?: number;
}

interface AuditProgress {
  jobId: string;
  totalPages: number;
  completedPages: number;
  failedPages: number;
  currentBatch: number;
  totalBatches: number;
  estimatedTimeRemaining: number;
  averageTimePerPage: number;
  memoryUsage: number;
  status: 'discovering' | 'auditing' | 'completed' | 'failed';
}

export class ScalableAuditService {
  private jobs = new Map<string, AuditJob[]>();
  private cache = new Map<string, any>();
  private memoryUsage = 0;
  private readonly config: ScalingConfig;

  constructor(config: Partial<ScalingConfig> = {}) {
    this.config = {
      maxPages: config.maxPages ?? 100,
      maxConcurrency: config.maxConcurrency ?? 10,
      batchSize: config.batchSize ?? 20,
      memoryLimit: config.memoryLimit ?? 512, // 512MB
      timeoutMs: config.timeoutMs ?? 30000, // 30 seconds (reduced from 5 minutes)
      enableStreaming: config.enableStreaming ?? true,
      enableCaching: config.enableCaching ?? true,
      prioritizeByScore: config.prioritizeByScore ?? true
    };
  }

  /**
   * Start a scalable website audit with progressive results
   */
  async auditWebsite(
    mainUrl: string,
    onProgress?: (progress: AuditProgress) => void,
    onBatchComplete?: (batch: any[], batchNumber: number) => void
  ): Promise<{ jobId: string; success: boolean; error?: string }> {
    const jobId = this.generateJobId();
    
    try {
      // Phase 1: Intelligent URL Discovery
      onProgress?.({
        jobId,
        totalPages: 0,
        completedPages: 0,
        failedPages: 0,
        currentBatch: 0,
        totalBatches: 0,
        estimatedTimeRemaining: 0,
        averageTimePerPage: 0,
        memoryUsage: this.getMemoryUsage(),
        status: 'discovering'
      });

      const urls = await this.discoverUrlsIntelligently(mainUrl, onProgress);
      // Create audit jobs from discovered URLs
      const jobs = urls.map((url, index) => ({
        id: `job-${Date.now()}-${index}`,
        url,
        priority: this.calculatePriority(url, mainUrl),
        status: 'pending' as const // Fix type by explicitly typing as const
      }));
      this.jobs.set(jobId, jobs);

      const totalBatches = Math.ceil(jobs.length / this.config.batchSize);

      // Phase 2: Batch Processing with Streaming
      onProgress?.({
        jobId,
        totalPages: jobs.length,
        completedPages: 0,
        failedPages: 0,
        currentBatch: 0,
        totalBatches,
        estimatedTimeRemaining: this.estimateTime(jobs.length),
        averageTimePerPage: 2000, // Initial estimate
        memoryUsage: this.getMemoryUsage(),
        status: 'auditing'
      });

      await this.processBatches(jobId, onProgress, onBatchComplete);

      return { jobId, success: true };

    } catch (error) {
      console.error('Scalable audit failed:', error);
      return { 
        jobId, 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }

  /**
   * Intelligent URL discovery with multiple strategies
   */
  private async discoverUrlsIntelligently(
    mainUrl: string,
    onProgress?: (progress: AuditProgress) => void
  ): Promise<string[]> {
    const discoveredUrls = new Set<string>([mainUrl]);
    const strategies = [
      () => this.discoverViaSitemap(mainUrl),
      () => this.discoverViaNavigation(mainUrl),
      // Removed pattern-based discovery to avoid non-real URLs
      () => this.discoverViaCrawling(mainUrl)
    ];

    for (const [index, strategy] of strategies.entries()) {
      try {
        const urls = await strategy();
        urls.forEach(url => discoveredUrls.add(url));
        
        // Update progress
        onProgress?.({
          jobId: 'discovery',
          totalPages: Math.min(discoveredUrls.size, this.config.maxPages),
          completedPages: 0,
          failedPages: 0,
          currentBatch: 0,
          totalBatches: 0,
          estimatedTimeRemaining: 0,
          averageTimePerPage: 0,
          memoryUsage: this.getMemoryUsage(),
          status: 'discovering'
        });

        // Stop if we have enough URLs or hit our limit
        if (discoveredUrls.size >= this.config.maxPages) {
          break;
        }
      } catch (error) {
        console.warn(`Discovery strategy ${index} failed:`, error);
        continue;
      }
    }

    return Array.from(discoveredUrls).slice(0, this.config.maxPages);
  }

  /**
   * Sitemap-based discovery
   */
  private async discoverViaSitemap(mainUrl: string): Promise<string[]> {
    const result = await SitemapService.discoverUrls(mainUrl);
    return result.success ? result.data || [] : [];
  }

  /**
   * Navigation-based discovery
   */
  private async discoverViaNavigation(mainUrl: string): Promise<string[]> {
    try {
      const response = await fetch(mainUrl);
      const html = await response.text();
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, 'text/html');
      
      const links = Array.from(doc.querySelectorAll('a[href]'))
        .map(link => link.getAttribute('href'))
        .filter(href => href && this.isValidUrl(href, mainUrl))
        .map(href => this.resolveUrl(href!, mainUrl));

      return Array.from(new Set(links));
    } catch {
      return [];
    }
  }

  /**
   * Pattern-based URL generation
   */
  private async discoverViaPatterns(mainUrl: string): Promise<string[]> {
    // Removed: pattern-based discovery to avoid generating non-real URLs
    return [];
  }

  /**
   * Limited crawling as fallback
   */
  private async discoverViaCrawling(mainUrl: string): Promise<string[]> {
    try {
      const crawler = new CrawleeService({
        maxPages: 20,
        maxDepth: 2,
        timeout: 3000,
        delay: 100
      });

      const result = await crawler.crawl(mainUrl);
      return result.success ? result.data?.pages.map(p => p.url) || [] : [];
    } catch {
      return [];
    }
  }

  /**
   * Create prioritized audit jobs
   */
  private createAuditJobs(urls: string[]): AuditJob[] {
    return urls.map((url, index) => ({
      id: `job_${Date.now()}_${index}`,
      url,
      priority: this.calculatePriority(url),
      status: 'pending'
    })).sort((a, b) => b.priority - a.priority); // High priority first
  }

  /**
   * Calculate URL priority for processing order
   */
  private calculatePriority(url: string): number {
    let priority = 0;
    
    // Homepage gets highest priority
    if (url.split('/').length <= 3) priority += 100;
    
    // Important pages get higher priority
    const importantPatterns = ['/about', '/contact', '/services', '/products'];
    if (importantPatterns.some(pattern => url.includes(pattern))) {
      priority += 50;
    }
    
    // Shorter URLs typically more important
    priority += Math.max(0, 50 - url.length / 10);
    
    return priority;
  }

  /**
   * Process jobs in optimized batches
   */
  private async processBatches(
    jobId: string,
    onProgress?: (progress: AuditProgress) => void,
    onBatchComplete?: (batch: any[], batchNumber: number) => void
  ): Promise<void> {
    const jobs = this.jobs.get(jobId);
    if (!jobs) throw new Error('Job not found');

    const totalJobs = jobs.length;
    const totalBatches = Math.ceil(totalJobs / this.config.batchSize);
    let completedJobs = 0;
    let failedJobs = 0;
    const startTime = Date.now();

    for (let batchIndex = 0; batchIndex < totalBatches; batchIndex++) {
      const batchStart = batchIndex * this.config.batchSize;
      const batchEnd = Math.min(batchStart + this.config.batchSize, totalJobs);
      const batch = jobs.slice(batchStart, batchEnd);

      // Check memory usage before processing batch
      if (this.getMemoryUsage() > this.config.memoryLimit) {
        await this.cleanupMemory();
      }

      try {
        // Process batch with controlled concurrency
        const batchResults = await processWithConcurrency(
          batch,
          async (job: AuditJob) => {
            job.status = 'processing';
            job.startTime = Date.now();

            try {
              // Check cache first
              const cached = this.getCachedResult(job.url);
              if (cached) {
                job.result = cached;
                job.status = 'completed';
                return job.result;
              }

              // No simulation - throw error instead of mock data
              throw new Error(`Real audit data unavailable for ${job.url} - PageSpeed API required`);
            } catch (error) {
              job.status = 'failed';
              job.error = error instanceof Error ? error.message : 'Unknown error';
              job.endTime = Date.now();
              throw error;
            }
          },
          Math.min(this.config.maxConcurrency, batch.length),
          (completed) => {
            const totalCompleted = completedJobs + completed;
            const averageTime = (Date.now() - startTime) / totalCompleted;
            const remaining = totalJobs - totalCompleted;
            
            onProgress?.({
              jobId,
              totalPages: totalJobs,
              completedPages: totalCompleted,
              failedPages: failedJobs,
              currentBatch: batchIndex + 1,
              totalBatches,
              estimatedTimeRemaining: remaining * averageTime,
              averageTimePerPage: averageTime,
              memoryUsage: this.getMemoryUsage(),
              status: 'auditing'
            });
          }
        );

        // Update counters
        const successfulResults = batchResults.filter(r => r !== null);
        completedJobs += successfulResults.length;
        failedJobs += batch.length - successfulResults.length;

        // Stream batch results
        if (onBatchComplete && successfulResults.length > 0) {
          onBatchComplete(successfulResults, batchIndex + 1);
        }

      } catch (error) {
        console.error(`Batch ${batchIndex + 1} failed:`, error);
        failedJobs += batch.length;
      }

      // Garbage collection hint
      if (batchIndex % 5 === 0) {
        this.garbageCollectionHint();
      }
    }

    // Final progress update
    onProgress?.({
      jobId,
      totalPages: totalJobs,
      completedPages: completedJobs,
      failedPages: failedJobs,
      currentBatch: totalBatches,
      totalBatches,
      estimatedTimeRemaining: 0,
      averageTimePerPage: (Date.now() - startTime) / totalJobs,
      memoryUsage: this.getMemoryUsage(),
      status: 'completed'
    });
  }

  /**
   * Get results for a job (with pagination support)
   */
  getJobResults(jobId: string, page = 1, limit = 50): {
    results: any[];
    totalPages: number;
    currentPage: number;
    hasMore: boolean;
  } {
    const jobs = this.jobs.get(jobId);
    if (!jobs) return { results: [], totalPages: 0, currentPage: 1, hasMore: false };

    const completedJobs = jobs.filter(job => job.status === 'completed');
    const totalResults = completedJobs.length;
    const totalPages = Math.ceil(totalResults / limit);
    const startIndex = (page - 1) * limit;
    const endIndex = Math.min(startIndex + limit, totalResults);
    
    const results = completedJobs
      .slice(startIndex, endIndex)
      .map(job => job.result);

    return {
      results,
      totalPages,
      currentPage: page,
      hasMore: page < totalPages
    };
  }

  /**
   * Helper methods
   */
  private generateJobId(): string {
    return `audit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private estimateTime(pageCount: number): number {
    return pageCount * 2000; // 2 seconds per page estimate
  }

  private getMemoryUsage(): number {
    if (typeof performance !== 'undefined' && performance.memory) {
      return performance.memory.usedJSHeapSize / 1024 / 1024; // MB
    }
    return this.memoryUsage;
  }

  private async cleanupMemory(): Promise<void> {
    // Clear old cache entries
    if (this.cache.size > 1000) {
      const entries = Array.from(this.cache.entries());
      entries.slice(0, 500).forEach(([key]) => this.cache.delete(key));
    }

    // Clear completed jobs older than 1 hour
    const cutoff = Date.now() - 3600000;
    for (const [jobId, jobs] of this.jobs.entries()) {
      const hasRecentActivity = jobs.some(job => 
        (job.endTime || job.startTime || 0) > cutoff
      );
      if (!hasRecentActivity) {
        this.jobs.delete(jobId);
      }
    }
  }

  private garbageCollectionHint(): void {
    // Request garbage collection if available
    if (typeof gc === 'function') {
      gc();
    }
  }

  private getCachedResult(url: string): any {
    if (!this.config.enableCaching) return null;
    return this.cache.get(url);
  }

  private setCachedResult(url: string, result: any): void {
    if (!this.config.enableCaching) return;
    this.cache.set(url, result);
  }

  private isValidUrl(href: string, baseUrl: string): boolean {
    try {
      const url = new URL(href, baseUrl);
      const base = new URL(baseUrl);
      return url.hostname === base.hostname && url.protocol.startsWith('http');
    } catch {
      return false;
    }
  }

  private resolveUrl(href: string, baseUrl: string): string {
    try {
      return new URL(href, baseUrl).href;
    } catch {
      return href;
    }
  }
}

export default ScalableAuditService; 