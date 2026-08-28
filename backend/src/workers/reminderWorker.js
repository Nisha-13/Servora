import { Worker } from 'bullmq';
import { redisConnectionOptions } from '../queues/queueManager.js';
import { REMINDER_QUEUE_NAME } from '../queues/reminderQueue.js';
import { invoiceRepository } from '../repositories/invoiceRepository.js';
import { notificationService } from '../services/notificationService.js';
import { NOTIFICATION_TYPES } from '../constants/notificationTypes.js';
import { INVOICE_STATUS } from '../constants/paymentStatus.js';
import { logger } from '../utils/logger.js';

export const initReminderWorker = () => {
  const worker = new Worker(
    REMINDER_QUEUE_NAME,
    async (job) => {
      const { invoiceId, bookingId, customerId, totalAmount, reminderTitle, reminderIndex } = job.data;
      logger.info(`[Reminder Worker] Processing reminder #${reminderIndex} for invoice ${invoiceId}`);

      // Check current invoice status directly from DB
      const invoice = await invoiceRepository.findById(invoiceId);
      if (!invoice || invoice.status !== INVOICE_STATUS.PENDING) {
        logger.info(`[Reminder Worker] Invoice ${invoiceId} is no longer pending (${invoice?.status}). Skipping reminder.`);
        return { skipped: true, reason: 'Invoice not pending' };
      }

      // Send pending payment reminder notification to customer
      await notificationService.sendNotification({
        recipient: customerId,
        type: NOTIFICATION_TYPES.PAYMENT_REMINDER,
        title: reminderTitle || 'Payment Reminder',
        message: `Reminder: Final invoice #${invoice.invoiceNumber} for Rs. ${totalAmount.toLocaleString()} is pending payment. Please settle the invoice to complete your booking.`,
        data: { invoiceId, bookingId }
      });

      logger.info(`[Reminder Worker] Payment reminder #${reminderIndex} successfully sent for invoice ${invoice.invoiceNumber}`);
      return { success: true, invoiceId };
    },
    {
      connection: redisConnectionOptions,
      concurrency: 5
    }
  );

  worker.on('completed', (job) => {
    logger.info(`[Reminder Worker] Job ${job.id} completed`);
  });

  worker.on('failed', (job, err) => {
    logger.error(`[Reminder Worker] Job ${job?.id} failed: ${err.message}`);
  });

  return worker;
};
