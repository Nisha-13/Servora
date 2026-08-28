import { connectDB } from '../config/db.js';
import { initRedis } from '../config/redis.js';
import { initReminderWorker } from './reminderWorker.js';
import { initNotificationWorker } from './notificationWorker.js';
import { logger } from '../utils/logger.js';

const startWorkers = async () => {
  try {
    logger.info('[Worker Process] Initializing database & Redis connections...');
    await connectDB();
    await initRedis();

    const reminderWorker = initReminderWorker();
    const notificationWorker = initNotificationWorker();

    logger.info('🚀 [BullMQ Dedicated Workers] Running and listening for queue jobs...');

    const gracefulShutdown = async () => {
      logger.info('[Worker Process] Shutting down workers gracefully...');
      await reminderWorker.close();
      await notificationWorker.close();
      process.exit(0);
    };

    process.on('SIGTERM', gracefulShutdown);
    process.on('SIGINT', gracefulShutdown);
  } catch (err) {
    logger.error(`[Worker Runner Error]: ${err.message}`);
    process.exit(1);
  }
};

startWorkers();
