import { ContactMessage } from '../models/ContactMessage.js';
import { ApiResponse } from '../utils/apiResponse.js';
import { AppError } from '../utils/appError.js';

export class ContactController {
  static async submitContact(req, res, next) {
    try {
      const { name, email, subject, message } = req.body;
      if (!name || !email || !subject || !message) {
        throw new AppError('Name, email, subject, and message are required', 400);
      }

      const inquiry = await ContactMessage.create({
        name: name.trim(),
        email: email.trim().toLowerCase(),
        subject: subject.trim(),
        message: message.trim()
      });

      return ApiResponse.created(res, 'Inquiry received successfully! Our support team will reply directly to your email.', {
        id: inquiry._id,
        createdAt: inquiry.createdAt
      });
    } catch (err) {
      next(err);
    }
  }

  static async getInquiries(req, res, next) {
    try {
      const { status, page = 1, limit = 20 } = req.query;
      const filter = {};
      if (status) filter.status = status.toUpperCase();

      const skip = (page - 1) * limit;
      const [messages, total] = await Promise.all([
        ContactMessage.find(filter).sort({ createdAt: -1 }).skip(skip).limit(parseInt(limit, 10)),
        ContactMessage.countDocuments(filter)
      ]);

      return ApiResponse.success(res, 'Contact messages retrieved', {
        messages,
        total,
        page: parseInt(page, 10),
        pages: Math.ceil(total / limit)
      });
    } catch (err) {
      next(err);
    }
  }
}
