import { bookingRepository } from '../repositories/bookingRepository.js';
import { serviceRepository } from '../repositories/serviceRepository.js';
import { notificationService } from './notificationService.js';
import { activityLogService } from './activityLogService.js';
import { BOOKING_STATUS, isValidTransition } from '../constants/bookingStatus.js';
import { NOTIFICATION_TYPES } from '../constants/notificationTypes.js';
import { ACTIVITY_ACTIONS } from '../constants/activityActions.js';
import { emitToUser } from '../sockets/socketHandler.js';
import { SOCKET_EVENTS } from '../sockets/socketEvents.js';
import { AppError } from '../utils/appError.js';

export class BookingService {
  generateBookingNumber() {
    const random = Math.floor(100000 + Math.random() * 900000);
    return `BK-${Date.now().toString().slice(-4)}${random}`;
  }

  async createBooking(data, customerUser, req = null) {
    // 1. Business Rule: Check if customer has outstanding unpaid bookings in PAYMENT_PENDING
    const hasUnpaid = await bookingRepository.hasUnpaidBookings(customerUser._id);
    if (hasUnpaid) {
      throw new AppError('You have pending unpaid service invoices. Please clear payment before booking new services.', 400);
    }

    // 2. Fetch service to verify existence and get provider & starting price
    const service = await serviceRepository.findById(data.serviceId);
    if (!service || !service.isActive) {
      throw new AppError('Service not found or currently unavailable', 404);
    }

    // Prevent provider from booking their own service
    if (service.provider._id.toString() === customerUser._id.toString()) {
      throw new AppError('You cannot book your own service', 400);
    }

    const bookingNumber = this.generateBookingNumber();

    const bookingData = {
      bookingNumber,
      customer: customerUser._id,
      provider: service.provider._id,
      service: service._id,
      startingPrice: service.startingPrice,
      bookingDate: new Date(data.bookingDate),
      timeSlot: data.timeSlot,
      address: {
        street: data.address?.street || customerUser.address?.street || '',
        city: data.address?.city || customerUser.address?.city || '',
        state: data.address?.state || customerUser.address?.state || '',
        zipCode: data.address?.zipCode || customerUser.address?.zipCode || ''
      },
      notes: data.notes || '',
      status: BOOKING_STATUS.PENDING,
      statusHistory: [
        {
          status: BOOKING_STATUS.PENDING,
          changedBy: customerUser._id,
          note: 'Booking requested by customer',
          timestamp: new Date()
        }
      ]
    };

    const booking = await bookingRepository.create(bookingData);
    const populated = await bookingRepository.findById(booking._id);

    // Notify Provider in real-time
    await notificationService.sendNotification({
      recipient: service.provider._id,
      sender: customerUser._id,
      type: NOTIFICATION_TYPES.BOOKING_CREATED,
      title: 'New Service Booking Request',
      message: `${customerUser.name} booked "${service.name}" for ${new Date(data.bookingDate).toLocaleDateString()} at ${data.timeSlot}`,
      data: { bookingId: booking._id }
    });

    emitToUser(service.provider._id, SOCKET_EVENTS.BOOKING_NEW_REQUEST, populated);

    // Audit log
    await activityLogService.log({
      user: customerUser,
      action: ACTIVITY_ACTIONS.BOOKING_CREATED,
      description: `New booking ${bookingNumber} created for service: ${service.name}`,
      entityType: 'BOOKING',
      entityId: booking._id,
      req
    });

    return populated;
  }

  async getBookingById(id, user) {
    const booking = await bookingRepository.findById(id);
    if (!booking) throw new AppError('Booking not found', 404);

    // Authorization check
    const isCustomer = booking.customer._id.toString() === user._id.toString();
    const isProvider = booking.provider._id.toString() === user._id.toString();
    const isAdmin = user.role === 'ADMIN';

    if (!isCustomer && !isProvider && !isAdmin) {
      throw new AppError('You are not authorized to view this booking', 403);
    }

    return booking;
  }

  async getUserBookings(user, query) {
    const filter = { ...query };
    if (user.role === 'CUSTOMER') {
      filter.customer = user._id;
    } else if (user.role === 'PROVIDER') {
      filter.provider = user._id;
    }
    return bookingRepository.findBookings(filter);
  }

  async updateBookingStatus(id, newStatus, user, { note = '', reason = '' } = {}, req = null) {
    const booking = await bookingRepository.findById(id);
    if (!booking) throw new AppError('Booking not found', 404);

    const isCustomer = booking.customer._id.toString() === user._id.toString();
    const isProvider = booking.provider._id.toString() === user._id.toString();
    const isAdmin = user.role === 'ADMIN';

    if (!isCustomer && !isProvider && !isAdmin) {
      throw new AppError('You are not authorized to update this booking', 403);
    }

    // Strict state machine validation
    if (!isValidTransition(booking.status, newStatus)) {
      throw new AppError(
        `Invalid status transition from "${booking.status}" to "${newStatus}".`,
        400
      );
    }

    // Role-specific transition permissions
    if (newStatus === BOOKING_STATUS.ACCEPTED || newStatus === BOOKING_STATUS.REJECTED) {
      if (!isProvider && !isAdmin) {
        throw new AppError('Only the assigned service provider can accept or reject bookings', 403);
      }
    }

    if (newStatus === BOOKING_STATUS.IN_PROGRESS || newStatus === BOOKING_STATUS.SERVICE_COMPLETED) {
      if (!isProvider && !isAdmin) {
        throw new AppError('Only the service provider can update on-site service progress', 403);
      }
    }

    if (newStatus === BOOKING_STATUS.CANCELLED) {
      if (booking.status !== BOOKING_STATUS.PENDING && booking.status !== BOOKING_STATUS.ACCEPTED && !isAdmin) {
        throw new AppError('Bookings can only be cancelled prior to service commencement', 400);
      }
      booking.cancelReason = reason || note;
    }

    if (newStatus === BOOKING_STATUS.DISPUTED) {
      booking.disputeReason = reason || note;
    }

    booking.status = newStatus;
    booking.statusHistory.push({
      status: newStatus,
      changedBy: user._id,
      note: note || `Status transitioned to ${newStatus}`,
      timestamp: new Date()
    });

    await booking.save();
    const updated = await bookingRepository.findById(booking._id);

    // Notify parties & emit Socket event
    const recipientId = isProvider ? booking.customer._id : booking.provider._id;
    let notifType = NOTIFICATION_TYPES.BOOKING_ACCEPTED;
    let notifTitle = `Booking ${newStatus}`;
    let notifMsg = `Booking #${booking.bookingNumber} status is now ${newStatus}.`;

    if (newStatus === BOOKING_STATUS.ACCEPTED) {
      notifType = NOTIFICATION_TYPES.BOOKING_ACCEPTED;
      notifTitle = 'Booking Accepted';
      notifMsg = `Provider ${booking.provider.name} has accepted your booking #${booking.bookingNumber}.`;
    } else if (newStatus === BOOKING_STATUS.REJECTED) {
      notifType = NOTIFICATION_TYPES.BOOKING_REJECTED;
      notifTitle = 'Booking Rejected';
      notifMsg = `Provider ${booking.provider.name} could not accept booking #${booking.bookingNumber}.`;
    } else if (newStatus === BOOKING_STATUS.IN_PROGRESS) {
      notifType = NOTIFICATION_TYPES.SERVICE_STARTED;
      notifTitle = 'Service Started';
      notifMsg = `Provider has started work for booking #${booking.bookingNumber}.`;
    } else if (newStatus === BOOKING_STATUS.SERVICE_COMPLETED) {
      notifType = NOTIFICATION_TYPES.SERVICE_COMPLETED;
      notifTitle = 'Service Completed';
      notifMsg = `Provider completed work for #${booking.bookingNumber}. Final invoice is being prepared.`;
    }

    await notificationService.sendNotification({
      recipient: recipientId,
      sender: user._id,
      type: notifType,
      title: notifTitle,
      message: notifMsg,
      data: { bookingId: booking._id }
    });

    emitToUser(booking.customer._id, SOCKET_EVENTS.BOOKING_STATUS_UPDATED, updated);
    emitToUser(booking.provider._id, SOCKET_EVENTS.BOOKING_STATUS_UPDATED, updated);

    await activityLogService.log({
      user,
      action: `BOOKING_${newStatus}`,
      description: `Booking #${booking.bookingNumber} updated to ${newStatus}`,
      entityType: 'BOOKING',
      entityId: booking._id,
      req
    });

    return updated;
  }
}

export const bookingService = new BookingService();
