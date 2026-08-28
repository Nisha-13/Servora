import { Invoice } from '../models/Invoice.js';

export class InvoiceRepository {
  async findById(id) {
    return Invoice.findById(id)
      .populate('customer', 'name email phone avatar address')
      .populate('provider', 'name email phone avatar address providerProfile')
      .populate({
        path: 'booking',
        populate: { path: 'service', select: 'name startingPrice category' }
      });
  }

  async findByInvoiceNumber(invoiceNumber) {
    return Invoice.findOne({ invoiceNumber })
      .populate('customer', 'name email phone avatar address')
      .populate('provider', 'name email phone avatar address providerProfile')
      .populate('booking');
  }

  async findByBookingId(bookingId) {
    return Invoice.findOne({ booking: bookingId })
      .populate('customer', 'name email phone avatar address')
      .populate('provider', 'name email phone avatar address providerProfile')
      .populate('booking');
  }

  async create(data) {
    return Invoice.create(data);
  }

  async updateById(id, data) {
    return Invoice.findByIdAndUpdate(id, data, { new: true, runValidators: true })
      .populate('customer', 'name email phone avatar address')
      .populate('provider', 'name email phone avatar address providerProfile')
      .populate('booking');
  }

  async findInvoices({ customer, provider, status, page = 1, limit = 15 }) {
    const filter = {};
    if (customer) filter.customer = customer;
    if (provider) filter.provider = provider;
    if (status) filter.status = status;

    const skip = (page - 1) * limit;
    const [invoices, total] = await Promise.all([
      Invoice.find(filter)
        .populate('customer', 'name email avatar')
        .populate('provider', 'name email avatar')
        .populate({
          path: 'booking',
          select: 'bookingNumber status service',
          populate: { path: 'service', select: 'name' }
        })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Invoice.countDocuments(filter)
    ]);

    return { invoices, total, page, limit, pages: Math.ceil(total / limit) };
  }

  async sumPaidRevenue({ provider } = {}) {
    const match = { status: 'PAID' };
    if (provider) match.provider = provider;
    const result = await Invoice.aggregate([
      { $match: match },
      { $group: { _id: null, totalRevenue: { $sum: '$totalAmount' } } }
    ]);
    return result[0]?.totalRevenue || 0;
  }

  async getMonthlyRevenueTrend({ provider, monthsCount = 6 } = {}) {
    const match = { status: 'PAID' };
    if (provider) {
      match.provider = typeof provider === 'string' ? new Invoice.base.Types.ObjectId(provider) : provider;
    }

    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - (monthsCount - 1));
    startDate.setDate(1);
    startDate.setHours(0, 0, 0, 0);

    match.paidAt = { $gte: startDate };

    const aggregated = await Invoice.aggregate([
      { $match: match },
      {
        $group: {
          _id: {
            year: { $year: { $ifNull: ['$paidAt', '$createdAt'] } },
            month: { $month: { $ifNull: ['$paidAt', '$createdAt'] } }
          },
          revenue: { $sum: '$totalAmount' },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const now = new Date();
    const result = [];

    for (let i = monthsCount - 1; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const y = d.getFullYear();
      const m = d.getMonth() + 1; // 1-indexed
      const found = aggregated.find((a) => a._id.year === y && a._id.month === m);

      result.push({
        month: monthNames[d.getMonth()],
        year: y,
        revenue: found ? found.revenue : 0,
        count: found ? found.count : 0
      });
    }

    return result;
  }
}

export const invoiceRepository = new InvoiceRepository();
