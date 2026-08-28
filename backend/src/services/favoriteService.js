import { favoriteRepository } from '../repositories/favoriteRepository.js';
import { userRepository } from '../repositories/userRepository.js';
import { serviceRepository } from '../repositories/serviceRepository.js';
import { AppError } from '../utils/appError.js';

export class FavoriteService {
  async toggleFavorite(customerId, { providerId, serviceId }) {
    if (providerId) {
      const provider = await userRepository.findById(providerId);
      if (!provider || provider.role !== 'PROVIDER') {
        throw new AppError('Provider not found', 404);
      }

      const isFav = await favoriteRepository.isFavoriteProvider(customerId, providerId);
      if (isFav) {
        await favoriteRepository.removeProvider(customerId, providerId);
        return { isFavorite: false, itemType: 'PROVIDER', message: 'Provider removed from favorites' };
      } else {
        await favoriteRepository.addProvider(customerId, providerId);
        return { isFavorite: true, itemType: 'PROVIDER', message: 'Provider added to favorites' };
      }
    } else if (serviceId) {
      const service = await serviceRepository.findById(serviceId);
      if (!service) {
        throw new AppError('Service not found', 404);
      }

      const isFav = await favoriteRepository.isFavoriteService(customerId, serviceId);
      if (isFav) {
        await favoriteRepository.removeService(customerId, serviceId);
        return { isFavorite: false, itemType: 'SERVICE', message: 'Service removed from saved' };
      } else {
        await favoriteRepository.addService(customerId, serviceId);
        return { isFavorite: true, itemType: 'SERVICE', message: 'Service added to saved' };
      }
    } else {
      throw new AppError('Provider ID or Service ID required', 400);
    }
  }

  async getCustomerFavorites(customerId, options) {
    return favoriteRepository.findByCustomer(customerId, options);
  }

  async checkIsFavorite(customerId, { providerId, serviceId }) {
    if (providerId) {
      const isFavorite = await favoriteRepository.isFavoriteProvider(customerId, providerId);
      return { isFavorite };
    }
    if (serviceId) {
      const isFavorite = await favoriteRepository.isFavoriteService(customerId, serviceId);
      return { isFavorite };
    }
    return { isFavorite: false };
  }

  async deleteFavorite(customerId, favoriteId) {
    const deleted = await favoriteRepository.removeById(customerId, favoriteId);
    if (!deleted) {
      throw new AppError('Favorite item not found', 404);
    }
    return { message: 'Item removed from favorites successfully' };
  }
}

export const favoriteService = new FavoriteService();
