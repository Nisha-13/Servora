import mongoose from 'mongoose';
import { Service } from '../models/Service.js';
import { Category } from '../models/Category.js';

export class ServiceRepository {
  async findById(id) {
    return Service.findById(id)
      .populate('category', 'name slug group icon')
      .populate('provider', 'name avatar address phone providerProfile');
  }

  async create(data) {
    return Service.create(data);
  }

  async updateById(id, data) {
    return Service.findByIdAndUpdate(id, data, { new: true, runValidators: true })
      .populate('category', 'name slug group icon')
      .populate('provider', 'name avatar address phone providerProfile');
  }

  async deleteById(id) {
    return Service.findByIdAndDelete(id);
  }

  async findServices({
    search,
    category,
    provider,
    minPrice,
    maxPrice,
    minRating,
    isActive,
    includeInactive,
    all,
    sortBy = 'createdAt',
    sortOrder = 'desc',
    page = 1,
    limit = 12
  }) {
    const filter = {};

    // Active status filter
    if (includeInactive === true || includeInactive === 'true' || all === true || all === 'true' || isActive === 'all') {
      // Show both active and inactive
    } else if (isActive !== undefined && isActive !== null && isActive !== '') {
      filter.isActive = String(isActive) === 'true';
    } else if (provider) {
      // Provider viewing their own services: show both active and inactive by default
    } else {
      // Public search default: only active services
      filter.isActive = true;
    }

    // Category filter: handles ObjectId, slug, or name
    if (category) {
      if (mongoose.isValidObjectId(category)) {
        filter.category = category;
      } else {
        const catDoc = await Category.findOne({
          $or: [
            { slug: category.toLowerCase().trim() },
            { name: { $regex: new RegExp(`^${category.trim()}$`, 'i') } }
          ]
        });
        if (catDoc) {
          filter.category = catDoc._id;
        } else {
          // If category not found, return empty result without crashing
          filter.category = new mongoose.Types.ObjectId();
        }
      }
    }

    if (provider) filter.provider = provider;
    if (minPrice !== undefined || maxPrice !== undefined) {
      filter.startingPrice = {};
      if (minPrice !== undefined) filter.startingPrice.$gte = Number(minPrice);
      if (maxPrice !== undefined) filter.startingPrice.$lte = Number(maxPrice);
    }
    if (minRating !== undefined) {
      filter.rating = { $gte: Number(minRating) };
    }
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ];
    }

    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const parsedPage = Math.max(1, parseInt(page, 10) || 1);
    const parsedLimit = Math.max(1, parseInt(limit, 10) || 12);
    const skip = (parsedPage - 1) * parsedLimit;

    const [services, total] = await Promise.all([
      Service.find(filter)
        .populate('category', 'name slug group icon')
        .populate('provider', 'name avatar address providerProfile')
        .sort(sort)
        .skip(skip)
        .limit(parsedLimit),
      Service.countDocuments(filter)
    ]);

    return {
      services,
      total,
      page: parsedPage,
      limit: parsedLimit,
      pages: Math.ceil(total / parsedLimit) || 1
    };
  }

  async countByProvider(providerId) {
    return Service.countDocuments({ provider: providerId });
  }

  async countTotal(filter = {}) {
    return Service.countDocuments(filter);
  }
}

export const serviceRepository = new ServiceRepository();
