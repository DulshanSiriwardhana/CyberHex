/**
 * CyberHex v3.0 — Redis Cache Service
 *
 * Provides a unified caching layer with TTL, prefix namespacing,
 * JSON serialization, and graceful degradation when Redis is
 * unavailable (falls back to in-memory LRU cache).
 *
 * @module services/cacheService
 */

import { createClient } from 'redis';
import { config } from '../utils/env.js';
import { logger } from '../utils/logger.js';

// ──── In-Memory LRU Fallback ─────────────────────────────────────
class MemoryCache {
  constructor(maxSize = 1000) {
    this.store = new Map();
    this.maxSize = maxSize;
  }

  get(key) {
    const entry = this.store.get(key);
    if (!entry) return null;
    if (entry.expires && entry.expires < Date.now()) {
      this.store.delete(key);
      return null;
    }
    // Move to end (most recently used)
    this.store.delete(key);
    this.store.set(key, entry);
    return entry.value;
  }

  set(key, value, ttlSeconds = 300) {
    // Evict oldest if full
    if (this.store.size >= this.maxSize) {
      const oldest = this.store.keys().next().value;
      this.store.delete(oldest);
    }
    this.store.set(key, {
      value,
      expires: ttlSeconds > 0 ? Date.now() + ttlSeconds * 1000 : null,
    });
  }

  del(key) {
    this.store.delete(key);
  }

  flush() {
    this.store.clear();
  }
}

// ──── Redis Client Setup ─────────────────────────────────────────
const REDIS_URL = config.REDIS_URL || 'redis://localhost:6379';
let redisClient = null;
let isRedisConnected = false;

async function getRedisClient() {
  if (redisClient && isRedisConnected) return redisClient;

  try {
    redisClient = createClient({
      url: REDIS_URL,
      socket: {
        reconnectStrategy: (retries) => {
          if (retries > 10) {
            logger.warn('Redis: max reconnection attempts reached, using memory cache');
            return new Error('Max retries reached');
          }
          return Math.min(retries * 100, 3000);
        },
      },
    });

    redisClient.on('error', (err) => {
      logger.warn('Redis connection error:', err.message);
      isRedisConnected = false;
    });

    redisClient.on('connect', () => {
      logger.info('Redis connected successfully');
      isRedisConnected = true;
    });

    await redisClient.connect();
    isRedisConnected = true;
    return redisClient;
  } catch (err) {
    logger.warn('Redis unavailable, falling back to in-memory cache:', err.message);
    isRedisConnected = false;
    return null;
  }
}

// ──── Memory fallback instance ───────────────────────────────────
const memoryCache = new MemoryCache(2000);

// ──── Public API ─────────────────────────────────────────────────

/**
 * Get a cached value by key. Automatically deserializes JSON.
 * @param {string} key - Cache key (prefix:name format recommended)
 * @returns {Promise<any|null>}
 */
export async function cacheGet(key) {
  try {
    const redis = await getRedisClient();
    if (redis && isRedisConnected) {
      const value = await redis.get(key);
      return value ? JSON.parse(value) : null;
    }
    return memoryCache.get(key);
  } catch (err) {
    logger.debug('Cache get error:', err.message);
    return memoryCache.get(key);
  }
}

/**
 * Set a cached value with optional TTL.
 * @param {string} key
 * @param {any} value
 * @param {number} ttlSeconds - Default 300 (5 minutes)
 */
export async function cacheSet(key, value, ttlSeconds = 300) {
  try {
    const redis = await getRedisClient();
    const serialized = JSON.stringify(value);

    if (redis && isRedisConnected) {
      if (ttlSeconds > 0) {
        await redis.setEx(key, ttlSeconds, serialized);
      } else {
        await redis.set(key, serialized);
      }
      return;
    }
    memoryCache.set(key, value, ttlSeconds);
  } catch (err) {
    logger.debug('Cache set error:', err.message);
    memoryCache.set(key, value, ttlSeconds);
  }
}

/**
 * Delete a cached key.
 * @param {string} key
 */
export async function cacheDel(key) {
  try {
    const redis = await getRedisClient();
    if (redis && isRedisConnected) {
      await redis.del(key);
      return;
    }
    memoryCache.del(key);
  } catch (err) {
    logger.debug('Cache del error:', err.message);
    memoryCache.del(key);
  }
}

/**
 * Delete all keys matching a pattern.
 * @param {string} pattern - Redis glob pattern (e.g., "user:*")
 */
export async function cacheDelPattern(pattern) {
  try {
    const redis = await getRedisClient();
    if (redis && isRedisConnected) {
      let cursor = 0;
      do {
        const result = await redis.scan(cursor, { MATCH: pattern, COUNT: 100 });
        cursor = result.cursor;
        if (result.keys.length > 0) {
          await redis.del(result.keys);
        }
      } while (cursor !== 0);
      return;
    }
    // Simple prefix match for in-memory
    const prefix = pattern.replace('*', '');
    for (const key of memoryCache.store.keys()) {
      if (key.startsWith(prefix)) {
        memoryCache.del(key);
      }
    }
  } catch (err) {
    logger.debug('Cache delPattern error:', err.message);
  }
}

/**
 * Clear all cached data.
 */
export async function cacheFlush() {
  try {
    const redis = await getRedisClient();
    if (redis && isRedisConnected) {
      await redis.flushDb();
      return;
    }
    memoryCache.flush();
  } catch (err) {
    logger.debug('Cache flush error:', err.message);
    memoryCache.flush();
  }
}

/**
 * Get or set cache (read-through pattern).
 * @param {string} key
 * @param {() => Promise<any>} fetchFn - Function to call on cache miss
 * @param {number} ttlSeconds
 * @returns {Promise<any>}
 */
export async function cacheGetOrSet(key, fetchFn, ttlSeconds = 300) {
  const cached = await cacheGet(key);
  if (cached !== null && cached !== undefined) return cached;

  const fresh = await fetchFn();
  if (fresh !== null && fresh !== undefined) {
    await cacheSet(key, fresh, ttlSeconds);
  }
  return fresh;
}

/**
 * Check if Redis is connected.
 */
export function isRedisAvailable() {
  return isRedisConnected;
}

export default {
  get: cacheGet,
  set: cacheSet,
  del: cacheDel,
  delPattern: cacheDelPattern,
  flush: cacheFlush,
  getOrSet: cacheGetOrSet,
  isAvailable: isRedisAvailable,
};