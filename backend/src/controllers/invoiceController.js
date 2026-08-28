import { invoiceService } from '../services/invoiceService.js';
import { ApiResponse } from '../utils/apiResponse.js';

export class InvoiceController {
  static async createInvoice(req, res, next) {
    try {
      const invoice = await invoiceService.createInvoice(req.body, req.user, req);
      return ApiResponse.created(res, 'Invoice generated successfully', { invoice });
    } catch (err) {
      next(err);
    }
  }

  static async getInvoices(req, res, next) {
    try {
      const result = await invoiceService.getInvoices(req.user, req.query);
      return ApiResponse.success(res, 'Invoices retrieved', result);
    } catch (err) {
      next(err);
    }
  }

  static async getInvoiceById(req, res, next) {
    try {
      const invoice = await invoiceService.getInvoiceById(req.params.id, req.user);
      return ApiResponse.success(res, 'Invoice details retrieved', { invoice });
    } catch (err) {
      next(err);
    }
  }
}
