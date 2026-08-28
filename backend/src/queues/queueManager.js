import { config } from '../config/environment.js';

export const redisConnectionOptions = {
  host: '127.0.0.1',
  port: 6379,
  maxRetriesPerRequest: null,
  enableOfflineQueue: false,
  connectTimeout: 2000,
  retryStrategy: (times) => {
    if (times > 3) return null; // stop reconnecting if redis is down
    return 1000;
  }
};
