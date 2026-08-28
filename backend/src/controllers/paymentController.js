import { paymentService } from '../services/paymentService.js';
import { ApiResponse } from '../utils/apiResponse.js';

export class PaymentController {
  /**
   * Confirm physical cash received for an invoice/booking.
   * Only accessible by authorized Providers or Admins.
   */
  static async confirmCashPayment(req, res, next) {
    try {
      const { invoiceId, bookingId } = req.body;
      const result = await paymentService.confirmCashPayment({ invoiceId, bookingId }, req.user, req);
      return ApiResponse.success(res, 'Cash payment confirmed successfully', result);
    } catch (err) {
      next(err);
    }
  }

  static async getPayments(req, res, next) {
    try {
      const result = await paymentService.getPayments(req.user, req.query);
      return ApiResponse.success(res, 'Payments retrieved', result);
    } catch (err) {
      next(err);
    }
  }

  static async refundPayment(req, res, next) {
    try {
      const payment = await paymentService.refundPayment(req.params.id, req.body, req.user, req);
      return ApiResponse.success(res, 'Payment refund processed successfully', { payment });
    } catch (err) {
      next(err);
    }
  }
}
