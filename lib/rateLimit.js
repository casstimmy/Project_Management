/**
 * In-memory rate limiter for API routes.
 * Usage:
 *   import { rateLimit } from "@/lib/rateLimit";
 *   const limiter = rateLimit({ interval: 60_000, uniqueTokenPerInterval: 500 });
 *   // In handler: const { success } = limiter.check(res, 30, ip);
 */

const LRU_SIZE = 500;

class TokenBucket {
  constructor({ interval, uniqueTokenPerInterval }) {
    this.interval = interval;
    this.maxTokens = uniqueTokenPerInterval;
    this.tokenCache = new Map();

    // Periodically clean expired entries to prevent memory leaks
    this._cleanupTimer = setInterval(() => {
      const now = Date.now();
      for (const [key, entry] of this.tokenCache) {
        if (now - entry.timestamp > this.interval) {
          this.tokenCache.delete(key);
        }
      }
    }, this.interval);

    // Allow garbage collection of the timer
    if (this._cleanupTimer.unref) {
      this._cleanupTimer.unref();
    }
  }

  check(res, limit, token) {
    const now = Date.now();
    const entry = this.tokenCache.get(token);

    if (!entry || now - entry.timestamp > this.interval) {
      // New window
      this.tokenCache.set(token, { count: 1, timestamp: now });
      // Evict oldest if over capacity
      if (this.tokenCache.size > this.maxTokens) {
        const firstKey = this.tokenCache.keys().next().value;
        this.tokenCache.delete(firstKey);
      }
      res.setHeader("X-RateLimit-Limit", limit);
      res.setHeader("X-RateLimit-Remaining", limit - 1);
      return { success: true };
    }

    entry.count += 1;

    if (entry.count > limit) {
      res.setHeader("X-RateLimit-Limit", limit);
      res.setHeader("X-RateLimit-Remaining", 0);
      res.setHeader("Retry-After", Math.ceil((this.interval - (now - entry.timestamp)) / 1000));
      return { success: false };
    }

    res.setHeader("X-RateLimit-Limit", limit);
    res.setHeader("X-RateLimit-Remaining", limit - entry.count);
    return { success: true };
  }
}

/**
 * Create a rate limiter instance.
 * @param {Object} options
 * @param {number} options.interval - Time window in ms (default: 60000 = 1 min)
 * @param {number} options.uniqueTokenPerInterval - Max unique callers tracked (default: 500)
 */
export function rateLimit({ interval = 60_000, uniqueTokenPerInterval = 500 } = {}) {
  return new TokenBucket({ interval, uniqueTokenPerInterval });
}

/**
 * Helper to get client IP from request
 */
export function getClientIp(req) {
  const forwarded = req.headers["x-forwarded-for"];
  if (forwarded) {
    return typeof forwarded === "string" ? forwarded.split(",")[0].trim() : forwarded[0];
  }
  return req.socket?.remoteAddress || "unknown";
}

/**
 * Pre-configured limiters for different route types
 */
export const apiLimiter = rateLimit({ interval: 60_000, uniqueTokenPerInterval: 500 });
export const authLimiter = rateLimit({ interval: 60_000, uniqueTokenPerInterval: 200 });

/**
 * Apply rate limiting to an API handler.
 * @param {Object} res - Response object
 * @param {Object} req - Request object
 * @param {Object} limiter - Rate limiter instance
 * @param {number} limit - Max requests per interval
 * @returns {boolean} true if request is allowed, false if rate limited
 */
export function applyRateLimit(req, res, limiter = apiLimiter, limit = 60) {
  const ip = getClientIp(req);
  const { success } = limiter.check(res, limit, ip);
  if (!success) {
    res.status(429).json({ error: "Too many requests. Please try again later." });
    return false;
  }
  return true;
}
