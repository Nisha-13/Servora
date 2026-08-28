import { Payment } from '../models/Payment.js';

export class PaymentRepository {
  async findById(id) {
    return Payment.findById(id)
      .populate('customer', 'name email avatar')
      .populate('provider', 'name email avatar')
      .populate('confirmedBy', 'name email')
      .populate('booking')
      .populate('invoice');
  }

  async findByTransactionId(transactionId) {
    return Payment.findOne({ transactionId })
      .populate('customer', 'name email avatar')
      .populate('provider', 'name email avatar')
      .populate('confirmedBy', 'name email')
      .populate('booking')
      .populate('invoice');
  }

  async findByInvoiceId(invoiceId) {
    return Payment.findOne({ invoice: invoiceId });
  }

  async findByBookingId(bookingId) {
    return Payment.findOne({ booking: bookingId });
  }

  async create(data) {
    return Payment.create(data);
  }

  async updateById(id, data) {
    return Payment.findByIdAndUpdate(id, data, { new: true, runValidators: true });
  }

  async findPayments({ customer, provider, status, page = 1, limit = 15 }) {
    const filter = {};
    if (customer) filter.customer = customer;
    if (provider) filter.provider = provider;
    if (status) filter.status = status;

    const skip = (page - 1) * limit;
    const [payments, total] = await Promise.all([
      Payment.find(filter)
        .populate('customer', 'name email avatar')
        .populate('provider', 'name email avatar')
        .populate('confirmedBy', 'name email')
        .populate({
          path: 'booking',
          select: 'bookingNumber status'
        })
        .populate({
          path: 'invoice',
          select: 'invoiceNumber totalAmount'
        })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Payment.countDocuments(filter)
    ]);

    return { payments, total, page, limit, pages: Math.ceil(total / limit) };
  }

  async sumCompletedPayments({ provider } = {}) {
    const match = { status: 'COMPLETED' };
    if (provider) match.provider = provider;
    const result = await Payment.aggregate([
      { $match: match },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);
    return result[0]?.total || 0;
  }
}

export const paymentRepository = new PaymentRepository();
