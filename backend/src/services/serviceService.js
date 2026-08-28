import { serviceRepository } from '../repositories/serviceRepository.js';
import { cacheService } from './cacheService.js';
import { AppError } from '../utils/appError.js';
import { activityLogService } from './activityLogService.js';
import { ACTIVITY_ACTIONS } from '../constants/activityActions.js';

export class ServiceService {
  async getServices(query) {
    const cacheKey = `services:list:${JSON.stringify(query)}`;
    const cached = await cacheService.get(cacheKey);
    if (cached) return cached;

    const result = await serviceRepository.findServices(query);
    await cacheService.set(cacheKey, result, 120); // 2 mins cache
    return result;
  }

  async getServiceById(id) {
    const service = await serviceRepository.findById(id);
    if (!service) throw new AppError('Service not found', 404);
    return service;
  }

  async createService(data, providerUser, req = null) {
    const service = await serviceRepository.create({
      ...data,
      provider: providerUser._id
    });

    await cacheService.delPattern('services:*');

    await activityLogService.log({
      user: providerUser,
      action: ACTIVITY_ACTIONS.SERVICE_CREATED,
      description: `Service created: ${service.name} (Rs. ${service.startingPrice})`,
      entityType: 'SERVICE',
      entityId: service._id,
      req
    });

    return service;
  }

  async updateService(id, data, user, req = null) {
    const service = await serviceRepository.findById(id);
    if (!service) throw new AppError('Service not found', 404);

    // Only provider owner or admin can update
    if (service.provider._id.toString() !== user._id.toString() && user.role !== 'ADMIN') {
      throw new AppError('You are not authorized to update this service', 403);
    }

    const updated = await serviceRepository.updateById(id, data);
    await cacheService.delPattern('services:*');

    await activityLogService.log({
      user,
      action: ACTIVITY_ACTIONS.SERVICE_UPDATED,
      description: `Service updated: ${updated.name}`,
      entityType: 'SERVICE',
      entityId: updated._id,
      req
    });

    return updated;
  }

  async deleteService(id, user, req = null) {
    const service = await serviceRepository.findById(id);
    if (!service) throw new AppError('Service not found', 404);

    if (service.provider._id.toString() !== user._id.toString() && user.role !== 'ADMIN') {
      throw new AppError('You are not authorized to delete this service', 403);
    }

    await serviceRepository.deleteById(id);
    await cacheService.delPattern('services:*');

    await activityLogService.log({
      user,
      action: ACTIVITY_ACTIONS.SERVICE_DELETED,
      description: `Service deleted: ${service.name}`,
      entityType: 'SERVICE',
      entityId: service._id,
      req
    });

    return { message: 'Service deleted successfully' };
  }
}

export const serviceService = new ServiceService();
