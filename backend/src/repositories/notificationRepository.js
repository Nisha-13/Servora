import { Notification } from '../models/Notification.js';

export class NotificationRepository {
  async create(data) {
    return Notification.create(data);
  }

  async findByUser(userId, { isRead, page = 1, limit = 20 } = {}) {
    const filter = { recipient: userId };
    if (isRead !== undefined) filter.isRead = isRead;

    const skip = (page - 1) * limit;
    const [notifications, total, unreadCount] = await Promise.all([
      Notification.find(filter)
        .populate('sender', 'name avatar')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Notification.countDocuments(filter),
      Notification.countDocuments({ recipient: userId, isRead: false })
    ]);

    return { notifications, total, unreadCount, page, limit, pages: Math.ceil(total / limit) };
  }

  async markAsRead(notificationId, userId) {
    return Notification.findOneAndUpdate(
      { _id: notificationId, recipient: userId },
      { isRead: true, readAt: new Date() },
      { new: true }
    );
  }

  async markAllAsRead(userId) {
    return Notification.updateMany(
      { recipient: userId, isRead: false },
      { isRead: true, readAt: new Date() }
    );
  }

  async deleteById(notificationId, userId) {
    return Notification.findOneAndDelete({ _id: notificationId, recipient: userId });
  }

  async countUnread(userId) {
    return Notification.countDocuments({ recipient: userId, isRead: false });
  }
}

export const notificationRepository = new NotificationRepository();
