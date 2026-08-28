import { serviceService } from '../services/serviceService.js';
import { ApiResponse } from '../utils/apiResponse.js';

export class ServiceController {
  static async getServices(req, res, next) {
    try {
      const result = await serviceService.getServices(req.query);
      return ApiResponse.success(res, 'Services retrieved', result);
    } catch (err) {
      next(err);
    }
  }

  static async getServiceById(req, res, next) {
    try {
      const service = await serviceService.getServiceById(req.params.id);
      return ApiResponse.success(res, 'Service retrieved', { service });
    } catch (err) {
      next(err);
    }
  }

  static async createService(req, res, next) {
    try {
      let data = { ...req.body };
      if (req.files && req.files.length > 0) {
        const baseUrl = `${req.protocol}://${req.get('host')}`;
        data.images = req.files.map((file) => `${baseUrl}/uploads/${file.filename}`);
      }
      const service = await serviceService.createService(data, req.user, req);
      return ApiResponse.created(res, 'Service created successfully', { service });
    } catch (err) {
      next(err);
    }
  }

  static async updateService(req, res, next) {
    try {
      let data = { ...req.body };
      if (req.files && req.files.length > 0) {
        const baseUrl = `${req.protocol}://${req.get('host')}`;
        data.images = req.files.map((file) => `${baseUrl}/uploads/${file.filename}`);
      }
      const service = await serviceService.updateService(req.params.id, data, req.user, req);
      return ApiResponse.success(res, 'Service updated successfully', { service });
    } catch (err) {
      next(err);
    }
  }

  static async deleteService(req, res, next) {
    try {
      const result = await serviceService.deleteService(req.params.id, req.user, req);
      return ApiResponse.success(res, result.message);
    } catch (err) {
      next(err);
    }
  }
}
