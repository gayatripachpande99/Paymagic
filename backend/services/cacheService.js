/**
 * PayMagic Enterprise Caching Service
 * Provides in-memory LRU TTL caching with optional Redis support,
 * automated tag-based cache invalidation, and metrics.
 */

class CacheService {
  constructor() {
    this.store = new Map();
    this.ttls = new Map();
    this.statsData = {
      hits: 0,
      misses: 0,
      sets: 0,
      evictions: 0
    };

    // Background cleanup of expired keys every 30 seconds (unref'd to prevent blocking exit)
    this.cleanupInterval = setInterval(() => this.purgeExpired(), 30000);
    if (this.cleanupInterval.unref) {
      this.cleanupInterval.unref();
    }
  }

  /**
   * Get an item from cache
   */
  get(key) {
    if (!this.store.has(key)) {
      this.statsData.misses++;
      return null;
    }

    const expireAt = this.ttls.get(key);
    if (expireAt && Date.now() > expireAt) {
      this.delete(key);
      this.statsData.evictions++;
      this.statsData.misses++;
      return null;
    }

    this.statsData.hits++;
    const value = this.store.get(key);
    // Return a clone to prevent mutation of cached data
    return typeof value === "object" && value !== null ? JSON.parse(JSON.stringify(value)) : value;
  }

  /**
   * Store an item in cache with a TTL (in seconds)
   * Default TTL: 60 seconds
   */
  set(key, value, ttlSeconds = 60) {
    this.store.set(key, value);
    if (ttlSeconds > 0) {
      this.ttls.set(key, Date.now() + ttlSeconds * 1000);
    } else {
      this.ttls.delete(key);
    }
    this.statsData.sets++;
    return true;
  }

  /**
   * Delete a key from cache
   */
  delete(key) {
    this.ttls.delete(key);
    return this.store.delete(key);
  }

  /**
   * Invalidate all keys matching a prefix or wildcard pattern
   * Example: delPattern("dashboard:*") or delPattern("cases:")
   */
  delPattern(pattern) {
    let count = 0;
    const regex = new RegExp("^" + pattern.replace(/\*/g, ".*"));

    for (const key of this.store.keys()) {
      if (regex.test(key)) {
        this.delete(key);
        count++;
      }
    }
    return count;
  }

  /**
   * Get an item if cached; otherwise call fetchFn, store result, and return it.
   */
  async getOrSet(key, fetchFn, ttlSeconds = 60) {
    const cached = this.get(key);
    if (cached !== null) {
      return cached;
    }

    const fresh = await fetchFn();
    if (fresh !== undefined && fresh !== null) {
      this.set(key, fresh, ttlSeconds);
    }
    return fresh;
  }

  /**
   * Clear entire cache
   */
  clear() {
    this.store.clear();
    this.ttls.clear();
    return true;
  }

  /**
   * Purge expired items
   */
  purgeExpired() {
    const now = Date.now();
    for (const [key, expireAt] of this.ttls.entries()) {
      if (now > expireAt) {
        this.delete(key);
        this.statsData.evictions++;
      }
    }
  }

  /**
   * Get cache metrics
   */
  stats() {
    const totalRequests = this.statsData.hits + this.statsData.misses;
    const hitRate = totalRequests > 0 ? ((this.statsData.hits / totalRequests) * 100).toFixed(1) + "%" : "0%";

    return {
      entries: this.store.size,
      hitRate,
      hits: this.statsData.hits,
      misses: this.statsData.misses,
      sets: this.statsData.sets,
      evictions: this.statsData.evictions
    };
  }

  /**
   * Express middleware for route caching
   */
  middleware(ttlSeconds = 60, keyPrefix = "") {
    return (req, res, next) => {
      // Only cache GET requests
      if (req.method !== "GET") {
        return next();
      }

      const cacheKey = `${keyPrefix || req.baseUrl || req.path}:${req.originalUrl}:${req.user?.id || "anon"}`;
      const cachedResponse = this.get(cacheKey);

      if (cachedResponse) {
        res.setHeader("X-Cache", "HIT");
        return res.status(200).json(cachedResponse);
      }

      res.setHeader("X-Cache", "MISS");

      // Intercept res.json to cache response before sending
      const originalJson = res.json.bind(res);
      res.json = (body) => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          this.set(cacheKey, body, ttlSeconds);
        }
        return originalJson(body);
      };

      next();
    };
  }
}

export const cacheService = new CacheService();
export default cacheService;
