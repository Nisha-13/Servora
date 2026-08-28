import { invoiceRepository } from '../repositories/invoiceRepository.js';
import { bookingRepository } from '../repositories/bookingRepository.js';
import { notificationService } from './notificationService.js';
import { activityLogService } from './activityLogService.js';
import { ReminderQueueManager } from '../queues/reminderQueue.js';
import { BOOKING_STATUS } from '../constants/bookingStatus.js';
import { INVOICE_STATUS } from '../constants/paymentStatus.js';
import { NOTIFICATION_TYPES } from '../constants/notificationTypes.js';
import { ACTIVITY_ACTIONS } from '../constants/activityActions.js';
import { emitToUser } from '../sockets/socketHandler.js';
import { SOCKET_EVENTS } from '../sockets/socketEvents.js';
import { AppError } from '../utils/appError.js';

export class InvoiceService {
  generateInvoiceNumber() {
    const random = Math.floor(100000 + Math.random() * 900000);
    return `INV-${Date.now().toString().slice(-4)}${random}`;
  }

  async createInvoice(data, providerUser, req = null) {
    const booking = await bookingRepository.findById(data.bookingId);
    if (!booking) throw new AppError('Booking not found', 404);

    // Only assigned provider or admin can create invoice
    if (booking.provider._id.toString() !== providerUser._id.toString() && providerUser.role !== 'ADMIN') {
      throw new AppError('Only the assigned provider can create an invoice for this booking', 403);
    }

    // Must be in SERVICE_COMPLETED status
    if (booking.status !== BOOKING_STATUS.SERVICE_COMPLETED) {
      throw new AppError(
        `Invoices can only be created once the service is in SERVICE_COMPLETED status. Current status: ${booking.status}`,
        400
      );
    }

    // Check if an invoice already exists for this booking
    const existingInvoice = await invoiceRepository.findByBookingId(booking._id);
    if (existingInvoice) {
      throw new AppError('An invoice has already been generated for this booking', 400);
    }

    const items = data.items || [];
    const serviceFee = Number(data.serviceFee || booking.startingPrice || 0);
    const laborFee = Number(data.laborFee || 0);
    const partsFee = Number(data.partsFee || 0);
    const extraFee = Number(data.extraFee || 0);
    const tax = Number(data.tax || 0);
    const discount = Number(data.discount || 0);

    const calculatedTotal = serviceFee + laborFee + partsFee + extraFee + tax - discount;
    const totalAmount = data.totalAmount ? Number(data.totalAmount) : calculatedTotal;

    if (totalAmount <= 0) {
      throw new AppError('Invoice total amount must be greater than zero', 400);
    }

    const invoiceNumber = this.generateInvoiceNumber();

    const invoice = await invoiceRepository.create({
      invoiceNumber,
      booking: booking._id,
      customer: booking.customer._id,
      provider: booking.provider._id,
      items,
      serviceFee,
      laborFee,
      partsFee,
      extraFee,
      tax,
      discount,
      totalAmount,
      status: INVOICE_STATUS.PENDING,
      notes: data.notes || '',
      dueDate: data.dueDate || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    });

    // Link invoice to booking and update status to PAYMENT_PENDING
    booking.invoice = invoice._id;
    booking.status = BOOKING_STATUS.PAYMENT_PENDING;
    booking.statusHistory.push({
      status: BOOKING_STATUS.PAYMENT_PENDING,
      changedBy: providerUser._id,
      note: `Final invoice #${invoiceNumber} issued for Rs. ${totalAmount.toLocaleString()}`,
      timestamp: new Date()
    });
    await booking.save();

    const populatedInvoice = await invoiceRepository.findById(invoice._id);

    // Schedule BullMQ payment reminders
    await ReminderQueueManager.schedulePaymentReminders({
      invoiceId: invoice._id.toString(),
      bookingId: booking._id.toString(),
      customerId: booking.customer._id.toString(),
      providerId: booking.provider._id.toString(),
      totalAmount
    });

    // Notify customer in real-time
    await notificationService.sendNotification({
      recipient: booking.customer._id,
      sender: providerUser._id,
      type: NOTIFICATION_TYPES.PAYMENT_PENDING,
      title: 'Invoice Ready for Payment',
      message: `Final invoice #${invoiceNumber} for Rs. ${totalAmount.toLocaleString()} is ready for booking #${booking.bookingNumber}. Please complete payment.`,
      data: { invoiceId: invoice._id, bookingId: booking._id }
    });

    emitToUser(booking.customer._id, SOCKET_EVENTS.INVOICE_NEW, populatedInvoice);
    emitToUser(booking.customer._id, SOCKET_EVENTS.BOOKING_STATUS_UPDATED, booking);

    await activityLogService.log({
      user: providerUser,
      action: ACTIVITY_ACTIONS.INVOICE_CREATED,
      description: `Invoice #${invoiceNumber} generated for Rs. ${totalAmount} on booking #${booking.bookingNumber}`,
      entityType: 'INVOICE',
      entityId: invoice._id,
      req
    });

    return populatedInvoice;
  }

  async getInvoiceById(id, user) {
    const invoice = await invoiceRepository.findById(id);
    if (!invoice) throw new AppError('Invoice not found', 404);

    const isCustomer = invoice.customer._id.toString() === user._id.toString();
    const isProvider = invoice.provider._id.toString() === user._id.toString();
    const isAdmin = user.role === 'ADMIN';

    if (!isCustomer && !isProvider && !isAdmin) {
      throw new AppError('You are not authorized to view this invoice', 403);
    }

    return invoice;
  }

  async getInvoices(user, query) {
    const filter = { ...query };
    if (user.role === 'CUSTOMER') {
      filter.customer = user._id;
    } else if (user.role === 'PROVIDER') {
      filter.provider = user._id;
    }
    return invoiceRepository.findInvoices(filter);
  }
}

export const invoiceService = new InvoiceService();
