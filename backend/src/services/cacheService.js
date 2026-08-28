import { redisClient } from '../config/redis.js';
import { logger } from '../utils/logger.js';

export class CacheService {
  async get(key) {
    try {
      const data = await redisClient.get(key);
      return data ? JSON.parse(data) : null;
    } catch (err) {
      logger.warn(`[Cache GET Error for ${key}]: ${err.message}`);
      return null;
    }
  }

  async set(key, value, ttlSeconds = 300) {
    try {
      await redisClient.set(key, JSON.stringify(value), 'EX', ttlSeconds);
    } catch (err) {
      logger.warn(`[Cache SET Error for ${key}]: ${err.message}`);
    }
  }

  async del(key) {
    try {
      await redisClient.del(key);
    } catch (err) {
      logger.warn(`[Cache DEL Error for ${key}]: ${err.message}`);
    }
  }

  async delPattern(pattern) {
    try {
      const keys = await redisClient.keys(pattern);
      if (keys.length > 0) {
        await redisClient.del(...keys);
      }
    } catch (err) {
      logger.warn(`[Cache DEL Pattern Error for ${pattern}]: ${err.message}`);
    }
  }
}

export const cacheService = new CacheService();
