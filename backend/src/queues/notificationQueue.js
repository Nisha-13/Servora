import { Queue } from 'bullmq';
import { redisConnectionOptions } from './queueManager.js';
import { logger } from '../utils/logger.js';

export const NOTIFICATION_QUEUE_NAME = 'servora-notifications';

export const notificationQueue = new Queue(NOTIFICATION_QUEUE_NAME, {
  connection: redisConnectionOptions
});

notificationQueue.on('error', (err) => {
  // Gracefully handle queue connection notice
});

export class NotificationQueueManager {
  static async enqueueNotification(payload) {
    try {
      await notificationQueue.add('send-notification', payload, {
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 2000
        },
        removeOnComplete: true
      });
    } catch (err) {
      logger.error(`[BullMQ Enqueue Notification Error]: ${err.message}`);
    }
  }
}
