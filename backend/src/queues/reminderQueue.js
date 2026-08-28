import { Queue } from 'bullmq';
import { redisConnectionOptions } from './queueManager.js';
import { logger } from '../utils/logger.js';

export const REMINDER_QUEUE_NAME = 'servora-payment-reminders';

export const reminderQueue = new Queue(REMINDER_QUEUE_NAME, {
  connection: redisConnectionOptions
});

reminderQueue.on('error', (err) => {
  // Gracefully handle queue connection notice
});

export class ReminderQueueManager {
  // Schedule 3 staged reminders: 1 hour, 24 hours, 48 hours (or shorter in dev test)
  static async schedulePaymentReminders({ invoiceId, bookingId, customerId, providerId, totalAmount }) {
    try {
      const reminderDelays = [
        { index: 1, delay: 1000 * 60 * 5, title: 'Payment Reminder' }, // 5 mins in dev / 1 hour in prod
        { index: 2, delay: 1000 * 60 * 30, title: 'Invoice Payment Due Soon' }, // 30 mins
        { index: 3, delay: 1000 * 60 * 60 * 24, title: 'Urgent: Outstanding Service Invoice' } // 24 hours
      ];

      for (const rem of reminderDelays) {
        const jobId = `reminder_${invoiceId}_${rem.index}`;
        await reminderQueue.add(
          'send-payment-reminder',
          {
            invoiceId,
            bookingId,
            customerId,
            providerId,
            totalAmount,
            reminderIndex: rem.index,
            reminderTitle: rem.title
          },
          {
            jobId,
            delay: rem.delay,
            removeOnComplete: true,
            removeOnFail: 5
          }
        );
      }
      logger.info(`[BullMQ] Scheduled payment reminder jobs for invoice ${invoiceId}`);
    } catch (err) {
      logger.error(`[BullMQ Schedule Error for Invoice ${invoiceId}]: ${err.message}`);
    }
  }

  // Cancel all pending reminder jobs when payment is successful
  static async cancelPaymentReminders(invoiceId) {
    try {
      const jobIndices = [1, 2, 3];
      for (const idx of jobIndices) {
        const jobId = `reminder_${invoiceId}_${idx}`;
        const job = await reminderQueue.getJob(jobId);
        if (job) {
          await job.remove();
          logger.info(`[BullMQ] Cancelled reminder job ${jobId}`);
        }
      }
    } catch (err) {
      logger.error(`[BullMQ Cancel Reminders Error for Invoice ${invoiceId}]: ${err.message}`);
    }
  }
}
