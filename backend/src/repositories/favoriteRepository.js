import { Favorite } from '../models/Favorite.js';

export class FavoriteRepository {
  async find(customerId, providerId) {
    return Favorite.findOne({ customer: customerId, provider: providerId });
  }

  async addProvider(customerId, providerId) {
    return Favorite.findOneAndUpdate(
      { customer: customerId, provider: providerId },
      { customer: customerId, provider: providerId, itemType: 'PROVIDER' },
      { upsert: true, new: true }
    );
  }

  async removeProvider(customerId, providerId) {
    return Favorite.findOneAndDelete({ customer: customerId, provider: providerId });
  }

  async addService(customerId, serviceId) {
    return Favorite.findOneAndUpdate(
      { customer: customerId, service: serviceId },
      { customer: customerId, service: serviceId, itemType: 'SERVICE' },
      { upsert: true, new: true }
    );
  }

  async removeService(customerId, serviceId) {
    return Favorite.findOneAndDelete({ customer: customerId, service: serviceId });
  }

  async removeById(customerId, favoriteId) {
    return Favorite.findOneAndDelete({ _id: favoriteId, customer: customerId });
  }

  async findByCustomer(customerId, { page = 1, limit = 50, type = null } = {}) {
    const skip = (page - 1) * limit;
    const filter = { customer: customerId };
    if (type) filter.itemType = type.toUpperCase();

    const [favorites, total] = await Promise.all([
      Favorite.find(filter)
        .populate({
          path: 'provider',
          select: 'name email avatar phone address providerProfile',
          populate: { path: 'providerProfile.serviceCategories', select: 'name slug icon' }
        })
        .populate({
          path: 'service',
          select: 'name description startingPrice estimatedDuration images rating reviewCount category provider',
          populate: [
            { path: 'category', select: 'name icon' },
            { path: 'provider', select: 'name avatar address' }
          ]
        })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Favorite.countDocuments(filter)
    ]);

    const validFavorites = favorites.filter((f) => {
      if (f.itemType === 'PROVIDER') return !!f.provider;
      if (f.itemType === 'SERVICE') return !!f.service;
      return !!f.provider || !!f.service;
    });

    return { favorites: validFavorites, total, page, limit, pages: Math.ceil(total / limit) };
  }

  async isFavoriteProvider(customerId, providerId) {
    const count = await Favorite.countDocuments({ customer: customerId, provider: providerId });
    return count > 0;
  }

  async isFavoriteService(customerId, serviceId) {
    const count = await Favorite.countDocuments({ customer: customerId, service: serviceId });
    return count > 0;
  }
}

export const favoriteRepository = new FavoriteRepository();
