import { userRepository } from '../repositories/userRepository.js';
import { serviceRepository } from '../repositories/serviceRepository.js';
import { bookingRepository } from '../repositories/bookingRepository.js';
import { invoiceRepository } from '../repositories/invoiceRepository.js';
import { paymentRepository } from '../repositories/paymentRepository.js';
import { categoryRepository } from '../repositories/categoryRepository.js';
import { reviewRepository } from '../repositories/reviewRepository.js';
import { activityLogRepository } from '../repositories/activityLogRepository.js';
import { activityLogService } from './activityLogService.js';
import { ACTIVITY_ACTIONS } from '../constants/activityActions.js';
import { AppError } from '../utils/appError.js';

export class AdminService {
  async getDashboardStats() {
    const [
      totalUsers,
      totalCustomers,
      totalProviders,
      totalServices,
      totalCategories,
      totalBookings,
      pendingBookings,
      completedBookings,
      cancelledBookings,
      pendingPayments,
      totalRevenue,
      recentActivity,
      recentBookings
    ] = await Promise.all([
      userRepository.countTotal(),
      userRepository.countByRole('CUSTOMER'),
      userRepository.countByRole('PROVIDER'),
      serviceRepository.countTotal({ isActive: true }),
      categoryRepository.count(),
      bookingRepository.countTotal(),
      bookingRepository.countByStatus('PENDING'),
      bookingRepository.countByStatus('PAID'),
      bookingRepository.countByStatus('CANCELLED'),
      bookingRepository.countByStatus('PAYMENT_PENDING'),
      invoiceRepository.sumPaidRevenue(),
      activityLogRepository.findLogs({ limit: 10 }),
      bookingRepository.findBookings({ limit: 8 })
    ]);

    // Calculate status breakdown
    const bookingsByStatus = [
      { status: 'PENDING', count: pendingBookings },
      { status: 'PAID', count: completedBookings },
      { status: 'PAYMENT_PENDING', count: pendingPayments },
      { status: 'CANCELLED', count: cancelledBookings }
    ];

    // Calculate dynamic monthly revenue trend from invoices
    const monthlyRevenue = await invoiceRepository.getMonthlyRevenueTrend({ monthsCount: 6 });

    // Calculate avg invoice
    const avgInvoice = completedBookings > 0 ? Math.round(totalRevenue / completedBookings) : 0;

    // Count active providers
    const activeProviders = await userRepository.countByRole('PROVIDER', { isActive: true }).catch(() => totalProviders);

    return {
      kpis: {
        totalUsers,
        totalCustomers,
        totalProviders,
        activeProviders,
        totalServices,  // active services only (isActive: true)
        totalCategories,
        totalBookings,
        pendingBookings,
        completedBookings,
        cancelledBookings,
        pendingPayments,
        totalRevenue,
        avgInvoice,
        monthlyRevenue,
        bookingsByStatus
      },
      recentActivity: recentActivity.logs,
      recentBookings: recentBookings.bookings
    };
  }

  async toggleUserStatus(userId, adminUser, req = null) {
    const user = await userRepository.findById(userId);
    if (!user) throw new AppError('User not found', 404);
    if (user.role === 'ADMIN') throw new AppError('Cannot deactivate admin account', 400);

    user.isActive = !user.isActive;
    await user.save();

    await activityLogService.log({
      user: adminUser,
      action: ACTIVITY_ACTIONS.ADMIN_MODERATION,
      description: `User ${user.name} (${user.email}) status changed to ${user.isActive ? 'Active' : 'Inactive'}`,
      entityType: 'USER',
      entityId: user._id,
      req
    });

    return user;
  }

  async verifyProvider(providerId, isVerified, adminUser, req = null) {
    const provider = await userRepository.findById(providerId);
    if (!provider || provider.role !== 'PROVIDER') {
      throw new AppError('Provider not found', 404);
    }

    provider.providerProfile.isVerified = isVerified;
    await provider.save();

    await activityLogService.log({
      user: adminUser,
      action: ACTIVITY_ACTIONS.ADMIN_MODERATION,
      description: `Provider ${provider.name} verification set to ${isVerified}`,
      entityType: 'USER',
      entityId: provider._id,
      req
    });

    return provider;
  }

  async getReports() {
    const revenue = await invoiceRepository.sumPaidRevenue();
    const totalBookings = await bookingRepository.countTotal();
    const completedBookings = await bookingRepository.countByStatus('PAID');
    const completionRate = totalBookings > 0 ? Math.round((completedBookings / totalBookings) * 100) : 0;

    return {
      revenue,
      totalBookings,
      completedBookings,
      completionRate
    };
  }
}

export const adminService = new AdminService();
