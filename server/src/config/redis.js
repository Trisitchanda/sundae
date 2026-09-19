import { Redis } from 'ioredis';
import logger from '../utils/logger.js';

let redisClient = null;
let isReady = false;

const redisUrl = process.env.REDIS_URL;

if (redisUrl) {
  try {
    redisClient = new Redis(redisUrl, {
      maxRetriesPerRequest: 1,
      enableReadyCheck: true,
      lazyConnect: false,
      retryStrategy(times) {
        if (times > 10) {
          logger.warn('Redis reconnection attempts exceeded. Operating in cache bypass mode.');
          return null; // Stop retrying after 10 attempts
        }
        return Math.min(times * 300, 3000);
      },
    });

    redisClient.on('connect', () => {
      logger.info('Connecting to Redis...');
    });

    redisClient.on('ready', () => {
      isReady = true;
      logger.info('Redis connection established and ready.');
    });

    redisClient.on('error', (err) => {
      isReady = false;
      logger.warn(`Redis connection issue: ${err.message}`);
    });

    redisClient.on('close', () => {
      isReady = false;
    });
  } catch (err) {
    logger.warn(`Failed to initialize Redis client: ${err.message}. Cache bypass active.`);
    redisClient = null;
    isReady = false;
  }
} else {
  logger.info('REDIS_URL not configured. Running in cache bypass mode (direct database queries).');
}

export const isRedisReady = () => isReady && redisClient !== null;

export const getRedisClient = () => redisClient;

export const getAsync = async (key) => {
  if (!isRedisReady()) return null;
  try {
    return await redisClient.get(key);
  } catch (err) {
    logger.warn(`Redis GET failed for ${key}: ${err.message}`);
    return null;
  }
};

export const setAsync = async (key, value, ttlSeconds = 300) => {
  if (!isRedisReady()) return;
  try {
    if (ttlSeconds) {
      await redisClient.set(key, value, 'EX', ttlSeconds);
    } else {
      await redisClient.set(key, value);
    }
  } catch (err) {
    logger.warn(`Redis SET failed for ${key}: ${err.message}`);
  }
};

export const deleteKeysByPattern = async (pattern) => {
  if (!isRedisReady()) return;
  try {
    const stream = redisClient.scanStream({
      match: pattern,
      count: 100,
    });

    return new Promise((resolve) => {
      stream.on('data', async (keys = []) => {
        if (keys.length > 0) {
          const pipeline = redisClient.pipeline();
          keys.forEach((k) => pipeline.del(k));
          await pipeline.exec().catch((e) => {
            logger.warn(`Pipeline del error: ${e.message}`);
          });
        }
      });

      stream.on('end', () => resolve());
      stream.on('error', (err) => {
        logger.warn(`Redis scanStream error for pattern "${pattern}": ${err.message}`);
        resolve();
      });
    });
  } catch (err) {
    logger.warn(`Failed to delete keys for pattern "${pattern}": ${err.message}`);
  }
};

export default {
  getRedisClient,
  isRedisReady,
  getAsync,
  setAsync,
  deleteKeysByPattern,
};
