import { Category } from '../models/Category.js';

export class CategoryRepository {
  async findAll({ isActive, group } = {}) {
    const filter = {};
    if (isActive !== undefined) filter.isActive = isActive;
    if (group) filter.group = group;
    return Category.find(filter).sort({ order: 1, name: 1 });
  }

  async findById(id) {
    return Category.findById(id);
  }

  async findBySlug(slug) {
    return Category.findOne({ slug: slug.toLowerCase() });
  }

  async create(data) {
    return Category.create(data);
  }

  async updateById(id, data) {
    return Category.findByIdAndUpdate(id, data, { new: true, runValidators: true });
  }

  async deleteById(id) {
    return Category.findByIdAndDelete(id);
  }

  async count() {
    return Category.countDocuments();
  }
}

export const categoryRepository = new CategoryRepository();
