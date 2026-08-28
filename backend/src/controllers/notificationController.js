import { notificationService } from '../services/notificationService.js';
import { ApiResponse } from '../utils/apiResponse.js';

export class NotificationController {
  static async getNotifications(req, res, next) {
    try {
      const result = await notificationService.getUserNotifications(req.user._id, req.query);
      return ApiResponse.success(res, 'Notifications retrieved', result);
    } catch (err) {
      next(err);
    }
  }

  static async markAsRead(req, res, next) {
    try {
      const notification = await notificationService.markAsRead(req.params.id, req.user._id);
      return ApiResponse.success(res, 'Notification marked as read', { notification });
    } catch (err) {
      next(err);
    }
  }

  static async markAllAsRead(req, res, next) {
    try {
      await notificationService.markAllAsRead(req.user._id);
      return ApiResponse.success(res, 'All notifications marked as read');
    } catch (err) {
      next(err);
    }
  }

  static async deleteNotification(req, res, next) {
    try {
      await notificationService.deleteNotification(req.params.id, req.user._id);
      return ApiResponse.success(res, 'Notification deleted successfully');
    } catch (err) {
      next(err);
    }
  }
}
