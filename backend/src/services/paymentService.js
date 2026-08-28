import { paymentRepository } from '../repositories/paymentRepository.js';
import { invoiceRepository } from '../repositories/invoiceRepository.js';
import { bookingRepository } from '../repositories/bookingRepository.js';
import { notificationService } from './notificationService.js';
import { activityLogService } from './activityLogService.js';
import { ReminderQueueManager } from '../queues/reminderQueue.js';
import { BOOKING_STATUS } from '../constants/bookingStatus.js';
import { INVOICE_STATUS, PAYMENT_STATUS } from '../constants/paymentStatus.js';
import { NOTIFICATION_TYPES } from '../constants/notificationTypes.js';
import { ACTIVITY_ACTIONS } from '../constants/activityActions.js';
import { emitToUser } from '../sockets/socketHandler.js';
import { SOCKET_EVENTS } from '../sockets/socketEvents.js';
import { AppError } from '../utils/appError.js';
import { logger } from '../utils/logger.js';

export class PaymentService {
  generateTransactionId() {
    const random = Math.floor(100000 + Math.random() * 900000);
    return `COD-${Date.now().toString().slice(-4)}${random}`;
  }

  /**
   * Confirm physical cash received by Service Provider or Admin.
   * Customers are strictly forbidden from confirming their own cash payments.
   */
  async confirmCashPayment({ invoiceId, bookingId }, user, req = null) {
    if (user.role !== 'PROVIDER' && user.role !== 'ADMIN') {
      throw new AppError(
        'Customers cannot confirm cash payment. Only the service provider or an authorized administrator can confirm receipt of cash.',
        403
      );
    }

    let invoice;
    let booking;

    if (invoiceId) {
      invoice = await invoiceRepository.findById(invoiceId);
      if (!invoice) throw new AppError('Invoice not found', 404);
      booking = await bookingRepository.findById(invoice.booking._id || invoice.booking);
    } else if (bookingId) {
      booking = await bookingRepository.findById(bookingId);
      if (!booking) throw new AppError('Booking not found', 404);
      invoice = await invoiceRepository.findByBookingId(booking._id);
    } else {
      throw new AppError('Either invoiceId or bookingId must be provided', 400);
    }

    if (!invoice) {
      throw new AppError('Associated invoice not found for this booking', 404);
    }
    if (!booking) {
      throw new AppError('Associated booking not found for this invoice', 404);
    }

    // Provider authorization check: must be the assigned provider
    if (user.role === 'PROVIDER') {
      const providerId = (booking.provider._id || booking.provider).toString();
      if (providerId !== user._id.toString()) {
        throw new AppError('You are not authorized to confirm payment for this booking', 403);
      }
    }

    // Prevent double confirmation
    if (invoice.status === INVOICE_STATUS.PAID && booking.status === BOOKING_STATUS.PAID) {
      throw new AppError('This invoice has already been confirmed as paid', 400);
    }

    const transactionId = this.generateTransactionId();

    // Find or create Payment record in COMPLETED state
    let payment = await paymentRepository.findByInvoiceId(invoice._id);
    if (payment) {
      payment.status = PAYMENT_STATUS.COMPLETED;
      payment.paidAt = new Date();
      payment.confirmedBy = user._id;
      payment.paymentMethod = 'CASH_ON_DELIVERY';
      await payment.save();
    } else {
      payment = await paymentRepository.create({
        transactionId,
        booking: booking._id,
        invoice: invoice._id,
        customer: invoice.customer._id || invoice.customer,
        provider: invoice.provider._id || invoice.provider,
        amount: invoice.totalAmount,
        currency: 'pkr',
        paymentMethod: 'CASH_ON_DELIVERY',
        status: PAYMENT_STATUS.COMPLETED,
        paidAt: new Date(),
        confirmedBy: user._id
      });
    }

    // Mark Invoice as PAID
    invoice.status = INVOICE_STATUS.PAID;
    invoice.paidAt = new Date();
    invoice.confirmedBy = user._id;
    invoice.paymentMethod = 'CASH_ON_DELIVERY';
    await invoice.save();

    // Mark Booking as PAID
    booking.status = BOOKING_STATUS.PAID;
    booking.statusHistory.push({
      status: BOOKING_STATUS.PAID,
      changedBy: user._id,
      note: `Cash payment of Rs. ${invoice.totalAmount.toLocaleString()} confirmed received by ${user.role === 'ADMIN' ? 'Admin' : 'Provider (' + user.name + ')'}`,
      timestamp: new Date()
    });
    await booking.save();

    // Cancel BullMQ pending payment reminder jobs
    await ReminderQueueManager.cancelPaymentReminders(invoice._id.toString());

    // Send notifications to Customer and Provider
    const customerId = invoice.customer._id || invoice.customer;
    const providerId = invoice.provider._id || invoice.provider;

    await notificationService.sendNotification({
      recipient: customerId,
      sender: user._id,
      type: NOTIFICATION_TYPES.PAYMENT_SUCCESSFUL,
      title: 'Cash Payment Confirmed',
      message: `Your cash payment of Rs. ${invoice.totalAmount.toLocaleString()} for booking #${booking.bookingNumber} has been confirmed. You can now submit a review!`,
      data: { bookingId: booking._id, invoiceId: invoice._id }
    });

    if (user.role === 'ADMIN') {
      await notificationService.sendNotification({
        recipient: providerId,
        sender: user._id,
        type: NOTIFICATION_TYPES.PAYMENT_SUCCESSFUL,
        title: 'Payment Confirmed by Admin',
        message: `Admin confirmed cash payment of Rs. ${invoice.totalAmount.toLocaleString()} for booking #${booking.bookingNumber}.`,
        data: { bookingId: booking._id, invoiceId: invoice._id }
      });
    }

    // Real-time WebSocket broadcasts
    emitToUser(customerId, SOCKET_EVENTS.PAYMENT_RECEIVED, { booking, invoice, payment });
    emitToUser(providerId, SOCKET_EVENTS.PAYMENT_RECEIVED, { booking, invoice, payment });
    emitToUser(customerId, SOCKET_EVENTS.BOOKING_STATUS_UPDATED, booking);
    emitToUser(providerId, SOCKET_EVENTS.BOOKING_STATUS_UPDATED, booking);

    // Audit log
    await activityLogService.log({
      user,
      action: ACTIVITY_ACTIONS.PAYMENT_PROCESSED,
      description: `Cash payment of Rs. ${invoice.totalAmount} confirmed for Invoice #${invoice.invoiceNumber} on booking #${booking.bookingNumber}`,
      entityType: 'PAYMENT',
      entityId: payment._id,
      req
    });

    logger.info(
      `[Cash Payment Confirmed] Invoice #${invoice.invoiceNumber} and Booking #${booking.bookingNumber} marked PAID by ${user.role} ${user.name}`
    );

    return {
      success: true,
      booking,
      invoice,
      payment
    };
  }

  async refundPayment(paymentId, { reason }, adminUser, req = null) {
    const payment = await paymentRepository.findById(paymentId);
    if (!payment) throw new AppError('Payment record not found', 404);

    if (payment.status !== PAYMENT_STATUS.COMPLETED) {
      throw new AppError('Only completed payments can be refunded', 400);
    }

    payment.status = PAYMENT_STATUS.REFUNDED;
    payment.refundReason = reason || 'Admin processed cash refund';
    payment.refundedAt = new Date();
    await payment.save();

    await activityLogService.log({
      user: adminUser,
      action: ACTIVITY_ACTIONS.PAYMENT_REFUNDED,
      description: `Cash refund of Rs. ${payment.amount} recorded for payment ${payment.transactionId}`,
      entityType: 'PAYMENT',
      entityId: payment._id,
      req
    });

    return payment;
  }

  async getPayments(user, query) {
    const filter = { ...query };
    if (user.role === 'CUSTOMER') {
      filter.customer = user._id;
    } else if (user.role === 'PROVIDER') {
      filter.provider = user._id;
    }
    return paymentRepository.findPayments(filter);
  }
}

export const paymentService = new PaymentService();
