import { Review } from '../models/Review.js';

export class ReviewRepository {
  async findById(id) {
    return Review.findById(id)
      .populate('customer', 'name avatar')
      .populate('provider', 'name avatar')
      .populate('service', 'name');
  }

  async findByBookingId(bookingId) {
    return Review.findOne({ booking: bookingId });
  }

  async create(data) {
    return Review.create(data);
  }

  async updateById(id, data) {
    return Review.findByIdAndUpdate(id, data, { new: true, runValidators: true });
  }

  async deleteById(id) {
    return Review.findByIdAndDelete(id);
  }

  async findReviews({ provider, service, customer, isVisible = true, page = 1, limit = 10 }) {
    const filter = {};
    if (provider) filter.provider = provider;
    if (service) filter.service = service;
    if (customer) filter.customer = customer;
    if (isVisible !== undefined) filter.isVisible = isVisible;

    const skip = (page - 1) * limit;
    const [reviews, total] = await Promise.all([
      Review.find(filter)
        .populate('customer', 'name avatar')
        .populate('service', 'name startingPrice')
        .populate('provider', 'name avatar')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Review.countDocuments(filter)
    ]);

    return { reviews, total, page, limit, pages: Math.ceil(total / limit) };
  }

  async getProviderRatingStats(providerId) {
    const stats = await Review.aggregate([
      { $match: { provider: providerId, isVisible: true } },
      {
        $group: {
          _id: null,
          avgRating: { $avg: '$rating' },
          totalReviews: { $sum: 1 }
        }
      }
    ]);
    if (stats.length === 0) {
      return { avgRating: 0, totalReviews: 0 };
    }
    return {
      avgRating: Math.round(stats[0].avgRating * 10) / 10,
      totalReviews: stats[0].totalReviews
    };
  }

  async getServiceRatingStats(serviceId) {
    const stats = await Review.aggregate([
      { $match: { service: serviceId, isVisible: true } },
      {
        $group: {
          _id: null,
          avgRating: { $avg: '$rating' },
          totalReviews: { $sum: 1 }
        }
      }
    ]);
    if (stats.length === 0) {
      return { avgRating: 0, totalReviews: 0 };
    }
    return {
      avgRating: Math.round(stats[0].avgRating * 10) / 10,
      totalReviews: stats[0].totalReviews
    };
  }

  async countTotal() {
    return Review.countDocuments();
  }
}

export const reviewRepository = new ReviewRepository();
