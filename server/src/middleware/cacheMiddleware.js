import redisService from '../config/redis.js';
import logger from '../utils/logger.js';

/**
 * Builds a deterministic cache key scoped to the authenticated user.
 */
const buildUserCacheKey = (userId, prefix, query = {}) => {
  const sortedKeys = Object.keys(query).sort();
  const queryString = sortedKeys
    .map((key) => `${encodeURIComponent(key)}=${encodeURIComponent(query[key])}`)
    .join('&');
  return `sundae:user:${userId}:${prefix}${queryString ? `:${queryString}` : ''}`;
};

/**
 * Express middleware to serve cached responses from Redis.
 *
 * @param {string} prefix - Resource prefix (e.g., 'categories', 'transactions', 'analytics:summary')
 * @param {number} ttlSeconds - Time-to-live in seconds (default: 300)
 */
export const cacheMiddleware = (prefix, ttlSeconds = 300) => {
  return async (req, res, next) => {
    // Only cache GET requests for authenticated users
    if (req.method !== 'GET' || !req.user?.id || !redisService.isRedisReady()) {
      return next();
    }

    const cacheKey = buildUserCacheKey(req.user.id, prefix, req.query);

    try {
      const cachedData = await redisService.getAsync(cacheKey);

      if (cachedData) {
        res.setHeader('X-Cache', 'HIT');
        try {
          const parsed = JSON.parse(cachedData);
          return res.json(parsed);
        } catch {
          // If corrupted, let request proceed to handler
        }
      }

      res.setHeader('X-Cache', 'MISS');

      // Intercept res.json to cache response payload
      const originalJson = res.json.bind(res);
      res.json = (body) => {
        if (res.statusCode >= 200 && res.statusCode < 300 && body) {
          // Save to Redis asynchronously without blocking response
          redisService.setAsync(cacheKey, JSON.stringify(body), ttlSeconds).catch((err) => {
            logger.warn(`Failed to set cache for ${cacheKey}: ${err.message}`);
          });
        }
        return originalJson(body);
      };

      next();
    } catch (err) {
      logger.warn(`Cache middleware error for ${prefix}: ${err.message}`);
      next();
    }
  };
};

/**
 * Invalidates all cache keys for a given user matching specified resource prefixes.
 *
 * @param {string} userId - User ID to invalidate
 * @param {...string} prefixes - Resource prefixes (e.g. 'transactions', 'analytics', 'categories')
 */
export const invalidateUserCache = async (userId, ...prefixes) => {
  if (!userId || !redisService.isRedisReady() || prefixes.length === 0) return;

  try {
    for (const prefix of prefixes) {
      const pattern = `sundae:user:${userId}:${prefix}*`;
      await redisService.deleteKeysByPattern(pattern);
    }
  } catch (err) {
    logger.warn(`Failed to invalidate cache for user ${userId}: ${err.message}`);
  }
};

export default {
  cacheMiddleware,
  invalidateUserCache,
};
