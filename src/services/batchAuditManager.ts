/**
 * Batch Audit Manager for Large-Scale Website Audits
 * 
 * Handles enterprise-level scaling requirements:
 * - Queue management with priorities
 * - Database batch operations
 * - Worker-like processing
 * - Memory-efficient streaming
 * - Progress persistence
 */

import { ScalableAuditService } from './scalableAuditService';
import { supabase } from '@/integrations/supabase/client';

interface BatchAuditRequest {
  id: string;
  urls: string[];
  priority: 'low' | 'medium' | 'high' | 'urgent';
  options: {
    maxPages?: number;
    maxConcurrency?: number;
    enableCaching?: boolean;
    notifyOnComplete?: boolean;
  };
  status: 'queued' | 'processing' | 'completed' | 'failed' | 'cancelled';
  createdAt: number;
  startedAt?: number;
  completedAt?: number;
  progress: {
    totalUrls: number;
    completedUrls: number;
    failedUrls: number;
    currentBatch: number;
    totalBatches: number;
  };
  results?: any[];
  error?: string;
}

export class BatchAuditManager {
  private queue: BatchAuditRequest[] = [];
  private processing = new Set<string>();
  private auditService: ScalableAuditService;

  // Adaptive concurrency for batch processing
  private getAdaptiveConcurrency(): number {
    const queueSize = this.queue.length;
    return Math.min(10, Math.max(3, Math.floor(queueSize / 2)));
  }

  constructor() {
    this.auditService = new ScalableAuditService({
      maxPages: 200,
      maxConcurrency: 15,
      batchSize: 25,
      memoryLimit: 1024,
      enableStreaming: true,
      enableCaching: true
    });

    // Start processing queue
    this.startQueueProcessor();
  }

  /**
   * Add a batch audit request to the queue
   */
  async queueBatchAudit(
    urls: string[],
    priority: 'low' | 'medium' | 'high' | 'urgent' = 'medium',
    options: BatchAuditRequest['options'] = {}
  ): Promise<string> {
    const batchId = this.generateBatchId();
    
    const request: BatchAuditRequest = {
      id: batchId,
      urls: [...new Set(urls)], // Remove duplicates
      priority,
      options: {
        maxPages: 50,
        maxConcurrency: 10,
        enableCaching: true,
        notifyOnComplete: false,
        ...options
      },
      status: 'queued',
      createdAt: Date.now(),
      progress: {
        totalUrls: urls.length,
        completedUrls: 0,
        failedUrls: 0,
        currentBatch: 0,
        totalBatches: 0
      }
    };

    // Insert into queue with priority ordering
    this.insertIntoQueue(request);
    
    // Persist to database
    await this.saveBatchRequest(request);

    console.log(`🔄 Queued batch audit ${batchId} with ${urls.length} URLs (priority: ${priority})`);
    
    return batchId;
  }

  /**
   * Get batch audit status and progress
   */
  getBatchStatus(batchId: string): BatchAuditRequest | null {
    return this.queue.find(req => req.id === batchId) || null;
  }

  /**
   * Cancel a batch audit
   */
  async cancelBatch(batchId: string): Promise<boolean> {
    const request = this.queue.find(req => req.id === batchId);
    if (!request) return false;

    if (request.status === 'processing') {
      // Mark for cancellation - will be handled by processor
      request.status = 'cancelled';
      this.processing.delete(batchId);
    } else if (request.status === 'queued') {
      // Remove from queue
      const index = this.queue.findIndex(req => req.id === batchId);
      if (index >= 0) {
        this.queue.splice(index, 1);
      }
    }

    await this.updateBatchRequest(request);
    return true;
  }

  /**
   * Get batch results with pagination
   */
  async getBatchResults(
    batchId: string, 
    page = 1, 
    limit = 50
  ): Promise<{
    results: any[];
    totalResults: number;
    currentPage: number;
    totalPages: number;
    hasMore: boolean;
  } | null> {
    const request = this.queue.find(req => req.id === batchId);
    if (!request || !request.results) return null;

    const totalResults = request.results.length;
    const totalPages = Math.ceil(totalResults / limit);
    const startIndex = (page - 1) * limit;
    const endIndex = Math.min(startIndex + limit, totalResults);
    
    const results = request.results.slice(startIndex, endIndex);

    return {
      results,
      totalResults,
      currentPage: page,
      totalPages,
      hasMore: page < totalPages
    };
  }

  /**
   * Process multiple websites efficiently
   */
  async processMultipleWebsites(
    websites: string[],
    onProgress?: (overall: {
      completedWebsites: number;
      totalWebsites: number;
      currentWebsite: string;
      websiteProgress: number;
    }) => void
  ): Promise<Map<string, any[]>> {
    const results = new Map<string, any[]>();
    let completedWebsites = 0;

    // Process websites with controlled concurrency
    const websiteProcessor = async (websiteUrl: string) => {
      const websiteResults: any[] = [];
      
      const auditResult = await this.auditService.auditWebsite(
        websiteUrl,
        (progress) => {
          onProgress?.({
            completedWebsites,
            totalWebsites: websites.length,
            currentWebsite: websiteUrl,
            websiteProgress: (progress.completedPages / progress.totalPages) * 100
          });
        },
        (batch) => {
          websiteResults.push(...batch);
        }
      );

      if (auditResult.success) {
        results.set(websiteUrl, websiteResults);
      }
      
      completedWebsites++;
      onProgress?.({
        completedWebsites,
        totalWebsites: websites.length,
        currentWebsite: '',
        websiteProgress: 100
      });
    };

    // Process websites in smaller batches to avoid overwhelming the system
    const batchSize = 3;
    for (let i = 0; i < websites.length; i += batchSize) {
      const batch = websites.slice(i, i + batchSize);
      await Promise.all(batch.map(websiteProcessor));
    }

    return results;
  }

  /**
   * Queue processor - runs continuously
   */
  private startQueueProcessor(): void {
    setInterval(async () => {
      await this.processQueue();
    }, 5000); // Check every 5 seconds
  }

  /**
   * Process queued batch requests
   */
  private async processQueue(): Promise<void> {
    const maxConcurrent = this.getAdaptiveConcurrency();
    if (this.processing.size >= maxConcurrent) {
      return; // Already at capacity
    }

    // Find next high-priority request
    const nextRequest = this.queue.find(req => 
      req.status === 'queued' && !this.processing.has(req.id)
    );

    if (!nextRequest) return;

    // Start processing
    this.processing.add(nextRequest.id);
    nextRequest.status = 'processing';
    nextRequest.startedAt = Date.now();
    
    await this.updateBatchRequest(nextRequest);

    try {
      await this.processBatchRequest(nextRequest);
    } catch (error) {
      console.error(`Batch ${nextRequest.id} failed:`, error);
      nextRequest.status = 'failed';
      nextRequest.error = error instanceof Error ? error.message : 'Unknown error';
    } finally {
      this.processing.delete(nextRequest.id);
      nextRequest.completedAt = Date.now();
      await this.updateBatchRequest(nextRequest);
    }
  }

  /**
   * Process a single batch request
   */
  private async processBatchRequest(request: BatchAuditRequest): Promise<void> {
    const allResults: any[] = [];

    // Process each URL in the batch
    for (const url of request.urls) {
      if (request.status === 'cancelled') {
        break; // Exit if cancelled
      }

      try {
        const auditResult = await this.auditService.auditWebsite(
          url,
          (progress) => {
            // Update request progress
            request.progress = {
              totalUrls: request.urls.length,
              completedUrls: request.urls.indexOf(url) + (progress.completedPages / progress.totalPages),
              failedUrls: progress.failedPages,
              currentBatch: progress.currentBatch,
              totalBatches: progress.totalBatches
            };
          },
          (batch) => {
            allResults.push(...batch);
          }
        );

        if (auditResult.success) {
          // Get final results
          const finalResults = this.auditService.getJobResults(auditResult.jobId);
          allResults.push(...finalResults.results);
        }

      } catch (error) {
        console.error(`Failed to audit ${url}:`, error);
        request.progress.failedUrls++;
      }

      request.progress.completedUrls++;
      
      // Save progress periodically
      if (request.progress.completedUrls % 10 === 0) {
        await this.updateBatchRequest(request);
      }
    }

    // Save final results
    request.results = allResults;
    request.status = 'completed';
    
    // Save to database in batches for efficiency
    await this.saveBatchResults(request.id, allResults);
  }

  /**
   * Insert request into priority queue
   */
  private insertIntoQueue(request: BatchAuditRequest): void {
    const priorityOrder = { urgent: 4, high: 3, medium: 2, low: 1 };
    const priority = priorityOrder[request.priority];

    // Find insertion point based on priority
    let insertIndex = this.queue.length;
    for (let i = 0; i < this.queue.length; i++) {
      const queuePriority = priorityOrder[this.queue[i].priority];
      if (priority > queuePriority) {
        insertIndex = i;
        break;
      }
    }

    this.queue.splice(insertIndex, 0, request);
  }

  /**
   * Database operations for persistence
   * Note: These would require additional database tables to be created
   */
  private async saveBatchRequest(request: BatchAuditRequest): Promise<void> {
    try {
      // TODO: Create batch_audit_requests table
      console.log('Saving batch request:', request.id);
      // await supabase.from('batch_audit_requests').insert({...});
    } catch (error) {
      console.error('Failed to save batch request:', error);
    }
  }

  private async updateBatchRequest(request: BatchAuditRequest): Promise<void> {
    try {
      // TODO: Update batch_audit_requests table
      console.log('Updating batch request:', request.id, request.status);
      // await supabase.from('batch_audit_requests').update({...});
    } catch (error) {
      console.error('Failed to update batch request:', error);
    }
  }

  private async saveBatchResults(batchId: string, results: any[]): Promise<void> {
    try {
      // TODO: Create batch_audit_results table
      console.log('Saving batch results:', batchId, results.length);
      // Save in chunks to avoid large payloads when implemented
      // await supabase.from('batch_audit_results').insert({...});
    } catch (error) {
      console.error('Failed to save batch results:', error);
    }
  }

  private generateBatchId(): string {
    return `batch_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Get queue statistics
   */
  getQueueStats(): {
    totalRequests: number;
    queuedRequests: number;
    processingRequests: number;
    completedRequests: number;
    failedRequests: number;
  } {
    return {
      totalRequests: this.queue.length,
      queuedRequests: this.queue.filter(r => r.status === 'queued').length,
      processingRequests: this.queue.filter(r => r.status === 'processing').length,
      completedRequests: this.queue.filter(r => r.status === 'completed').length,
      failedRequests: this.queue.filter(r => r.status === 'failed').length
    };
  }
}

// Export singleton instance
export const batchAuditManager = new BatchAuditManager();
export default BatchAuditManager; 