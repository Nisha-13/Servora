import { Worker } from 'bullmq';
import { redisConnectionOptions } from '../queues/queueManager.js';
import { NOTIFICATION_QUEUE_NAME } from '../queues/notificationQueue.js';
import { logger } from '../utils/logger.js';

export const initNotificationWorker = () => {
  const worker = new Worker(
    NOTIFICATION_QUEUE_NAME,
    async (job) => {
      const { notificationId, recipient, type, title } = job.data;
      logger.info(`[Notification Worker] Processing notification job ${job.id} for user ${recipient} (Type: ${type})`);
      // Simulates external channel dispatch e.g. email / SMS / push
      return { dispatched: true, notificationId };
    },
    {
      connection: redisConnectionOptions,
      concurrency: 10
    }
  );

  worker.on('completed', (job) => {
    logger.debug(`[Notification Worker] Job ${job.id} finished`);
  });

  worker.on('failed', (job, err) => {
    logger.error(`[Notification Worker] Job ${job?.id} failed: ${err.message}`);
  });

  return worker;
};
