import { userRepository } from '../repositories/userRepository.js';
import { AppError } from '../utils/appError.js';
import { activityLogService } from './activityLogService.js';
import { ACTIVITY_ACTIONS } from '../constants/activityActions.js';

export class UserService {
  async getUserProfile(userId) {
    const user = await userRepository.findById(userId);
    if (!user) throw new AppError('User not found', 404);
    return user;
  }

  async updateProfile(userId, updateData, req = null) {
    const user = await userRepository.findById(userId);
    if (!user) throw new AppError('User not found', 404);

    const filtered = {};
    if (updateData.name !== undefined) filtered.name = updateData.name;
    if (updateData.phone !== undefined) filtered.phone = updateData.phone;
    if (updateData.avatar !== undefined) filtered.avatar = updateData.avatar;

    // Handle both nested address (from JSON) and flat city (from FormData)
    const city = updateData.city ?? updateData['address[city]'] ?? updateData?.address?.city;
    if (city !== undefined || updateData.address !== undefined) {
      filtered.address = {
        ...(user.address?.toObject ? user.address.toObject() : (user.address || {})),
        ...(updateData.address || {})
      };
      if (city !== undefined) filtered.address.city = city;
    }

    // Normalize serviceAreas: accept both 'serviceAreas' (JSON) and 'serviceAreas[]' (FormData/multer)
    const rawServiceAreas = updateData['serviceAreas[]'] ?? updateData.serviceAreas;
    const normalizedServiceAreas = rawServiceAreas !== undefined
      ? (Array.isArray(rawServiceAreas)
          ? rawServiceAreas
          : String(rawServiceAreas).split(',').map((s) => s.trim()).filter(Boolean))
      : undefined;

    // Merge Provider Profile fields
    if (
      updateData.providerProfile ||
      updateData.bio !== undefined ||
      updateData.experienceYears !== undefined ||
      normalizedServiceAreas !== undefined ||
      updateData.serviceCategories !== undefined
    ) {
      const currentProviderProfile = user.providerProfile?.toObject
        ? user.providerProfile.toObject()
        : (user.providerProfile || {});

      filtered.providerProfile = {
        ...currentProviderProfile,
        ...(updateData.providerProfile || {})
      };

      if (updateData.bio !== undefined) filtered.providerProfile.bio = updateData.bio;
      if (updateData.experienceYears !== undefined) filtered.providerProfile.experienceYears = Number(updateData.experienceYears);
      if (normalizedServiceAreas !== undefined) {
        filtered.providerProfile.serviceAreas = normalizedServiceAreas;
      }
    }

    const updatedUser = await userRepository.updateById(userId, filtered);
    if (!updatedUser) throw new AppError('User not found', 404);

    await activityLogService.log({
      user: updatedUser,
      action: ACTIVITY_ACTIONS.USER_UPDATED_PROFILE,
      description: `User ${updatedUser.name} updated profile`,
      entityType: 'USER',
      entityId: updatedUser._id,
      req
    });

    return updatedUser;
  }

  async changePassword(userId, { currentPassword, newPassword }, req = null) {
    const user = await userRepository.findById(userId, true);
    if (!user) throw new AppError('User not found', 404);

    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      throw new AppError('Current password is incorrect', 400);
    }

    user.password = newPassword;
    await user.save();

    return { message: 'Password updated successfully' };
  }
}

export const userService = new UserService();
