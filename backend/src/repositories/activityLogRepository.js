import { ActivityLog } from '../models/ActivityLog.js';

export class ActivityLogRepository {
  async create(data) {
    return ActivityLog.create(data);
  }

  async findLogs({ user, role, action, entityType, page = 1, limit = 25 }) {
    const filter = {};
    if (user) filter.user = user;
    if (role) filter.role = role;
    if (action) filter.action = action;
    if (entityType) filter.entityType = entityType;

    const skip = (page - 1) * limit;
    const [logs, total] = await Promise.all([
      ActivityLog.find(filter)
        .populate('user', 'name email role')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      ActivityLog.countDocuments(filter)
    ]);

    return { logs, total, page, limit, pages: Math.ceil(total / limit) };
  }

  async countTotal() {
    return ActivityLog.countDocuments();
  }
}

export const activityLogRepository = new ActivityLogRepository();
