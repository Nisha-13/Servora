import { notificationRepository } from '../repositories/notificationRepository.js';
import { emitToUser } from '../sockets/socketHandler.js';
import { SOCKET_EVENTS } from '../sockets/socketEvents.js';
import { NotificationQueueManager } from '../queues/notificationQueue.js';
import { logger } from '../utils/logger.js';

export class NotificationService {
  async sendNotification({ recipient, sender = null, type, title, message, data = {} }) {
    try {
      const notification = await notificationRepository.create({
        recipient,
        sender,
        type,
        title,
        message,
        data
      });

      // Fetch unread count for recipient
      const unreadCount = await notificationRepository.countUnread(recipient);

      // Emit real-time notification to user's personal socket room
      emitToUser(recipient, SOCKET_EVENTS.NOTIFICATION_NEW, {
        notification,
        unreadCount
      });

      // Also queue background worker job
      await NotificationQueueManager.enqueueNotification({
        notificationId: notification._id,
        recipient,
        type,
        title,
        message
      });

      return notification;
    } catch (err) {
      logger.error(`[Notification Service Error]: ${err.message}`);
    }
  }

  async getUserNotifications(userId, options) {
    return notificationRepository.findByUser(userId, options);
  }

  async markAsRead(notificationId, userId) {
    const notification = await notificationRepository.markAsRead(notificationId, userId);
    const unreadCount = await notificationRepository.countUnread(userId);
    emitToUser(userId, SOCKET_EVENTS.NOTIFICATION_UNREAD_COUNT, { unreadCount });
    return notification;
  }

  async markAllAsRead(userId) {
    await notificationRepository.markAllAsRead(userId);
    emitToUser(userId, SOCKET_EVENTS.NOTIFICATION_UNREAD_COUNT, { unreadCount: 0 });
  }

  async deleteNotification(notificationId, userId) {
    await notificationRepository.deleteById(notificationId, userId);
    const unreadCount = await notificationRepository.countUnread(userId);
    emitToUser(userId, SOCKET_EVENTS.NOTIFICATION_UNREAD_COUNT, { unreadCount });
  }
}

export const notificationService = new NotificationService();
