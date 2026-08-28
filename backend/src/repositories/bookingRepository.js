import { Booking } from '../models/Booking.js';

export class BookingRepository {
  async findById(id) {
    return Booking.findById(id)
      .populate('customer', 'name email phone avatar address')
      .populate('provider', 'name email phone avatar address providerProfile')
      .populate({
        path: 'service',
        populate: { path: 'category', select: 'name slug icon' }
      })
      .populate('invoice');
  }

  async findByBookingNumber(bookingNumber) {
    return Booking.findOne({ bookingNumber })
      .populate('customer', 'name email phone avatar address')
      .populate('provider', 'name email phone avatar address providerProfile')
      .populate('service')
      .populate('invoice');
  }

  async create(data) {
    return Booking.create(data);
  }

  async updateById(id, data) {
    return Booking.findByIdAndUpdate(id, data, { new: true, runValidators: true })
      .populate('customer', 'name email phone avatar address')
      .populate('provider', 'name email phone avatar address providerProfile')
      .populate('service')
      .populate('invoice');
  }

  async findBookings({ customer, provider, status, page = 1, limit = 15 }) {
    const filter = {};
    if (customer) filter.customer = customer;
    if (provider) filter.provider = provider;
    if (status) {
      if (Array.isArray(status)) {
        filter.status = { $in: status };
      } else {
        filter.status = status;
      }
    }

    const skip = (page - 1) * limit;
    const [bookings, total] = await Promise.all([
      Booking.find(filter)
        .populate('customer', 'name email phone avatar')
        .populate('provider', 'name email phone avatar providerProfile')
        .populate({
          path: 'service',
          select: 'name startingPrice estimatedDuration category',
          populate: { path: 'category', select: 'name slug icon' }
        })
        .populate('invoice')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Booking.countDocuments(filter)
    ]);

    return { bookings, total, page, limit, pages: Math.ceil(total / limit) };
  }

  async countByStatus(status, { customer, provider } = {}) {
    const filter = { status };
    if (customer) filter.customer = customer;
    if (provider) filter.provider = provider;
    return Booking.countDocuments(filter);
  }

  async countTotal({ customer, provider } = {}) {
    const filter = {};
    if (customer) filter.customer = customer;
    if (provider) filter.provider = provider;
    return Booking.countDocuments(filter);
  }

  async hasUnpaidBookings(customerId) {
    const count = await Booking.countDocuments({
      customer: customerId,
      status: 'PAYMENT_PENDING'
    });
    return count > 0;
  }
}

export const bookingRepository = new BookingRepository();
