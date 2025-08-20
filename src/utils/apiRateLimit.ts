/**
 * API Rate limiting utility to prevent hitting API limits
 */
export class RateLimiter {
  private lastCall = 0;
  private callCount = 0;
  private resetTime = 0;

  constructor(
    private maxCalls: number,
    private windowMs: number,
    private minDelayMs: number = 0
  ) {}

  async throttle(): Promise<void> {
    const now = Date.now();

    // Reset counter if window has passed
    if (now >= this.resetTime) {
      this.callCount = 0;
      this.resetTime = now + this.windowMs;
    }

    // If we've hit the limit, wait until the window resets
    if (this.callCount >= this.maxCalls) {
      const waitTime = this.resetTime - now;
      if (waitTime > 0) {
        await new Promise(resolve => setTimeout(resolve, waitTime));
        // Reset after waiting
        this.callCount = 0;
        this.resetTime = Date.now() + this.windowMs;
      }
    }

    // Ensure minimum delay between calls
    if (this.minDelayMs > 0) {
      const timeSinceLastCall = now - this.lastCall;
      if (timeSinceLastCall < this.minDelayMs) {
        await new Promise(resolve => 
          setTimeout(resolve, this.minDelayMs - timeSinceLastCall)
        );
      }
    }

    this.callCount++;
    this.lastCall = Date.now();
  }
}

// Pre-configured rate limiters for common APIs
const hasPageSpeedKey = !!import.meta.env.VITE_PAGESPEED_API_KEY;
export const pageSpeedRateLimit = new RateLimiter(
  100, // 100 calls per minute (Google's documented default quota)
  60 * 1000, // 1 minute window
  hasPageSpeedKey ? 0 : 100 // Less delay if API key is present
);

// Note: Firecrawl rate limiter removed - we now use our fast, unlimited web crawler!