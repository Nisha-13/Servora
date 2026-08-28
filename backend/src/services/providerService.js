import { userRepository } from '../repositories/userRepository.js';
import { serviceRepository } from '../repositories/serviceRepository.js';
import { bookingRepository } from '../repositories/bookingRepository.js';
import { invoiceRepository } from '../repositories/invoiceRepository.js';
import { paymentRepository } from '../repositories/paymentRepository.js';
import { reviewRepository } from '../repositories/reviewRepository.js';
import { cacheService } from './cacheService.js';
import { AppError } from '../utils/appError.js';

export class ProviderService {
  async getProviders(query) {
    const cacheKey = `providers:${JSON.stringify(query)}`;
    const cached = await cacheService.get(cacheKey);
    if (cached) return cached;

    const result = await userRepository.findProviders(query);
    await cacheService.set(cacheKey, result, 120); // 2 mins cache
    return result;
  }

  async getProviderById(providerId) {
    const provider = await userRepository.findById(providerId);
    if (!provider || provider.role !== 'PROVIDER' || !provider.isActive) {
      throw new AppError('Provider not found or unavailable', 404);
    }

    const [services, reviews, ratingStats] = await Promise.all([
      serviceRepository.findServices({ provider: providerId, isActive: true, limit: 50 }),
      reviewRepository.findReviews({ provider: providerId, limit: 10 }),
      reviewRepository.getProviderRatingStats(providerId)
    ]);

    return {
      provider,
      services: services.services,
      reviews: reviews.reviews,
      ratingStats
    };
  }

  async updateAvailability(providerId, data) {
    const provider = await userRepository.findById(providerId);
    if (!provider || provider.role !== 'PROVIDER') {
      throw new AppError('Provider not found', 404);
    }

    if (!provider.providerProfile) {
      provider.providerProfile = {};
    }

    const availData = data.availability ? data.availability : data;
    provider.providerProfile.availability = {
      ...(provider.providerProfile.availability || {}),
      ...(availData.days !== undefined ? { days: availData.days } : {}),
      ...(availData.startTime !== undefined ? { startTime: availData.startTime } : {}),
      ...(availData.endTime !== undefined ? { endTime: availData.endTime } : {}),
      ...(availData.isAvailable !== undefined ? { isAvailable: availData.isAvailable } : {})
    };

    if (data.serviceAreas && Array.isArray(data.serviceAreas)) {
      provider.providerProfile.serviceAreas = data.serviceAreas;
    }

    provider.markModified('providerProfile');
    await provider.save();
    await cacheService.delPattern('providers:*');

    return {
      availability: provider.providerProfile.availability,
      serviceAreas: provider.providerProfile.serviceAreas
    };
  }

  async getProviderEarnings(providerId) {
    const [totalRevenue, totalBookings, completedBookings, recentPayments, recentInvoices] = await Promise.all([
      invoiceRepository.sumPaidRevenue({ provider: providerId }),
      bookingRepository.countTotal({ provider: providerId }),
      bookingRepository.countByStatus('PAID', { provider: providerId }),
      paymentRepository.findPayments({ provider: providerId, limit: 10 }),
      invoiceRepository.findInvoices({ provider: providerId, limit: 10 })
    ]);

    return {
      totalRevenue,
      totalBookings,
      completedBookings,
      recentPayments: recentPayments.payments,
      recentInvoices: recentInvoices.invoices
    };
  }

  async getProviderDashboardStats(providerId) {
    const [
      pendingRequests,
      acceptedJobs,
      inProgressJobs,
      completedJobs,
      totalRevenue,
      ratingStats,
      recentBookings,
      revenueTrends
    ] = await Promise.all([
      bookingRepository.countByStatus('PENDING', { provider: providerId }),
      bookingRepository.countByStatus('ACCEPTED', { provider: providerId }),
      bookingRepository.countByStatus('IN_PROGRESS', { provider: providerId }),
      bookingRepository.countByStatus('PAID', { provider: providerId }),
      invoiceRepository.sumPaidRevenue({ provider: providerId }),
      reviewRepository.getProviderRatingStats(providerId),
      bookingRepository.findBookings({ provider: providerId, limit: 5 }),
      invoiceRepository.getMonthlyRevenueTrend({ provider: providerId, monthsCount: 1 })
    ]);

    const activeJobs = acceptedJobs + inProgressJobs;
    const currentMonthRevenue = revenueTrends?.[0]?.revenue || 0;

    return {
      stats: {
        pendingRequests,
        activeJobs,
        completedJobs,
        totalRevenue,
        monthlyRevenue: currentMonthRevenue,
        rating: ratingStats.avgRating,
        reviewCount: ratingStats.totalReviews
      },
      recentBookings: recentBookings.bookings
    };
  }
}

export const providerService = new ProviderService();
