import { bookingService } from '../services/bookingService.js';
import { ApiResponse } from '../utils/apiResponse.js';

export class BookingController {
  static async createBooking(req, res, next) {
    try {
      const booking = await bookingService.createBooking(req.body, req.user, req);
      return ApiResponse.created(res, 'Booking created successfully', { booking });
    } catch (err) {
      next(err);
    }
  }

  static async getBookings(req, res, next) {
    try {
      const result = await bookingService.getUserBookings(req.user, req.query);
      return ApiResponse.success(res, 'Bookings retrieved', result);
    } catch (err) {
      next(err);
    }
  }

  static async getBookingById(req, res, next) {
    try {
      const booking = await bookingService.getBookingById(req.params.id, req.user);
      return ApiResponse.success(res, 'Booking details retrieved', { booking });
    } catch (err) {
      next(err);
    }
  }

  static async updateStatus(req, res, next) {
    try {
      const { status, note, reason } = req.body;
      const booking = await bookingService.updateBookingStatus(
        req.params.id,
        status,
        req.user,
        { note, reason },
        req
      );
      return ApiResponse.success(res, `Booking status updated to ${status}`, { booking });
    } catch (err) {
      next(err);
    }
  }
}
