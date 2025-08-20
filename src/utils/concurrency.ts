/**
 * Utility for running async operations with concurrency limits
 */
export class ConcurrencyLimiter {
  private running = 0;
  private queue: Array<() => Promise<void>> = [];

  constructor(private limit: number) {}

  async add<T>(task: () => Promise<T>): Promise<T> {
    return new Promise((resolve, reject) => {
      this.queue.push(async () => {
        try {
          this.running++;
          const result = await task();
          resolve(result);
        } catch (error) {
          reject(error);
        } finally {
          this.running--;
          this.processQueue();
        }
      });

      this.processQueue();
    });
  }

  private processQueue() {
    if (this.running < this.limit && this.queue.length > 0) {
      const task = this.queue.shift();
      if (task) {
        task();
      }
    }
  }

  async waitForAll(): Promise<void> {
    while (this.running > 0 || this.queue.length > 0) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  }
}

/**
 * Process an array of items with limited concurrency
 */
export async function processWithConcurrency<T, R>(
  items: T[],
  processor: (item: T, index: number) => Promise<R>,
  concurrency: number = 3,
  onProgress?: (completed: number, total: number) => void
): Promise<R[]> {
  const results: R[] = new Array(items.length);
  const limiter = new ConcurrencyLimiter(concurrency);
  let completed = 0;

  const promises = items.map((item, index) =>
    limiter.add(async () => {
      const result = await processor(item, index);
      results[index] = result;
      completed++;
      onProgress?.(completed, items.length);
      return result;
    })
  );

  await Promise.all(promises);
  return results;
}