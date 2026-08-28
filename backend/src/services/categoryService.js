import { categoryRepository } from '../repositories/categoryRepository.js';
import { cacheService } from './cacheService.js';
import { AppError } from '../utils/appError.js';
import { activityLogService } from './activityLogService.js';
import { ACTIVITY_ACTIONS } from '../constants/activityActions.js';

export class CategoryService {
  async getAllCategories(options = { isActive: true }) {
    const cacheKey = `categories:${options.isActive ? 'active' : 'all'}`;
    const cached = await cacheService.get(cacheKey);
    if (cached) return cached;

    const categories = await categoryRepository.findAll(options);
    await cacheService.set(cacheKey, categories, 600); // 10 mins cache
    return categories;
  }

  async getCategoryById(id) {
    const category = await categoryRepository.findById(id);
    if (!category) throw new AppError('Category not found', 404);
    return category;
  }

  async getCategoryBySlug(slug) {
    const category = await categoryRepository.findBySlug(slug);
    if (!category) throw new AppError('Category not found', 404);
    return category;
  }

  async createCategory(data, adminUser, req = null) {
    const slug = data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    const existing = await categoryRepository.findBySlug(slug);
    if (existing) throw new AppError('A category with this name already exists', 400);

    const category = await categoryRepository.create({ ...data, slug });
    await cacheService.delPattern('categories:*');

    await activityLogService.log({
      user: adminUser,
      action: ACTIVITY_ACTIONS.CATEGORY_CREATED,
      description: `Category created: ${category.name}`,
      entityType: 'CATEGORY',
      entityId: category._id,
      req
    });

    return category;
  }

  async updateCategory(id, data, adminUser, req = null) {
    if (data.name) {
      data.slug = data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    }

    const category = await categoryRepository.updateById(id, data);
    if (!category) throw new AppError('Category not found', 404);

    await cacheService.delPattern('categories:*');
    await cacheService.delPattern('services:*');

    await activityLogService.log({
      user: adminUser,
      action: ACTIVITY_ACTIONS.CATEGORY_UPDATED,
      description: `Category updated: ${category.name}`,
      entityType: 'CATEGORY',
      entityId: category._id,
      req
    });

    return category;
  }

  async deleteCategory(id, adminUser, req = null) {
    const category = await categoryRepository.deleteById(id);
    if (!category) throw new AppError('Category not found', 404);

    await cacheService.delPattern('categories:*');
    await cacheService.delPattern('services:*');

    await activityLogService.log({
      user: adminUser,
      action: ACTIVITY_ACTIONS.CATEGORY_DELETED,
      description: `Category deleted: ${category.name}`,
      entityType: 'CATEGORY',
      entityId: category._id,
      req
    });

    return category;
  }
}

export const categoryService = new CategoryService();
