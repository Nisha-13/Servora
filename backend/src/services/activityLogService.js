import { activityLogRepository } from '../repositories/activityLogRepository.js';
import { logger } from '../utils/logger.js';

export class ActivityLogService {
  async log({ user, userEmail, role, action, description, entityType = 'SYSTEM', entityId = null, metadata = {}, req = null }) {
    try {
      const ipAddress = req?.ip || req?.headers?.['x-forwarded-for'] || '';
      const userAgent = req?.headers?.['user-agent'] || '';

      await activityLogRepository.create({
        user: user?._id || user || null,
        userEmail: userEmail || user?.email || '',
        role: role || user?.role || '',
        action,
        description,
        entityType,
        entityId,
        metadata,
        ipAddress,
        userAgent
      });
    } catch (err) {
      logger.error(`[ActivityLog Error]: ${err.message}`);
    }
  }

  async getLogs(query) {
    return activityLogRepository.findLogs(query);
  }
}

export const activityLogService = new ActivityLogService();
