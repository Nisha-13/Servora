import { categoryService } from '../services/categoryService.js';
import { ApiResponse } from '../utils/apiResponse.js';

export class CategoryController {
  static async getCategories(req, res, next) {
    try {
      const categories = await categoryService.getAllCategories(req.query);
      return ApiResponse.success(res, 'Categories retrieved', { categories });
    } catch (err) {
      next(err);
    }
  }

  static async getCategoryById(req, res, next) {
    try {
      const category = await categoryService.getCategoryById(req.params.id);
      return ApiResponse.success(res, 'Category retrieved', { category });
    } catch (err) {
      next(err);
    }
  }

  static async createCategory(req, res, next) {
    try {
      let data = { ...req.body };
      if (req.file) {
        data.image = `/uploads/${req.file.filename}`;
      }
      const category = await categoryService.createCategory(data, req.user, req);
      return ApiResponse.created(res, 'Category created successfully', { category });
    } catch (err) {
      next(err);
    }
  }

  static async updateCategory(req, res, next) {
    try {
      let data = { ...req.body };
      if (req.file) {
        data.image = `/uploads/${req.file.filename}`;
      }
      const category = await categoryService.updateCategory(req.params.id, data, req.user, req);
      return ApiResponse.success(res, 'Category updated successfully', { category });
    } catch (err) {
      next(err);
    }
  }

  static async deleteCategory(req, res, next) {
    try {
      const result = await categoryService.deleteCategory(req.params.id, req.user, req);
      return ApiResponse.success(res, 'Category deleted successfully', result);
    } catch (err) {
      next(err);
    }
  }
}
