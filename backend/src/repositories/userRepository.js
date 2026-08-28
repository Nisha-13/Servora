import { User } from '../models/User.js';

export class UserRepository {
  async findById(id, selectPassword = false) {
    const query = User.findById(id);
    if (selectPassword) query.select('+password');
    return query;
  }

  async findByEmail(email, selectPassword = false) {
    const query = User.findOne({ email: email.toLowerCase() });
    if (selectPassword) query.select('+password');
    return query;
  }

  async create(userData) {
    return User.create(userData);
  }

  async updateById(id, updateData) {
    return User.findByIdAndUpdate(id, updateData, { new: true, runValidators: true });
  }

  async findUsers({ role, isActive, search, page = 1, limit = 20 }) {
    const filter = {};
    if (role) filter.role = role;
    if (isActive !== undefined) filter.isActive = isActive;
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }
    const skip = (page - 1) * limit;
    const [users, total] = await Promise.all([
      User.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
      User.countDocuments(filter)
    ]);
    return { users, total, page, limit, pages: Math.ceil(total / limit) };
  }

  async findProviders({ category, search, city, minRating, isVerified, page = 1, limit = 12 }) {
    const filter = { role: 'PROVIDER', isActive: true };
    if (isVerified !== undefined) filter['providerProfile.isVerified'] = isVerified;
    if (minRating) filter['providerProfile.rating'] = { $gte: Number(minRating) };
    if (category) filter['providerProfile.serviceCategories'] = category;
    if (city) filter['address.city'] = { $regex: city, $options: 'i' };
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { 'providerProfile.bio': { $regex: search, $options: 'i' } }
      ];
    }
    const skip = (page - 1) * limit;
    const [providers, total] = await Promise.all([
      User.find(filter)
        .populate('providerProfile.serviceCategories', 'name slug icon')
        .sort({ 'providerProfile.rating': -1, 'providerProfile.reviewCount': -1 })
        .skip(skip)
        .limit(limit),
      User.countDocuments(filter)
    ]);
    return { providers, total, page, limit, pages: Math.ceil(total / limit) };
  }

  async countByRole(role, extraFilter = {}) {
    return User.countDocuments({ role, ...extraFilter });
  }

  async countTotal(extraFilter = {}) {
    return User.countDocuments(extraFilter);
  }
}

export const userRepository = new UserRepository();
