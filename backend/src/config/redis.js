import Redis from 'ioredis';
import { config } from './environment.js';

export const redisClient = new Redis(config.redis.url, {
  maxRetriesPerRequest: 1,
  enableOfflineQueue: false,
  enableReadyCheck: true,
  lazyConnect: true,
  connectTimeout: 2000,
  retryStrategy(times) {
    if (times > 3) return null;
    return 1000;
  }
});

redisClient.on('connect', () => {
  console.log('[Redis] Connected successfully to Redis server');
});

redisClient.on('error', (err) => {
  // Silent or single log to prevent noise if offline
});

export const initRedis = async () => {
  try {
    await redisClient.connect();
    console.log('[Redis] Connection initialized');
  } catch (err) {
    console.warn(`[Redis Connection Warning]: Could not connect to Redis at ${config.redis.url}.`);
  }
};
