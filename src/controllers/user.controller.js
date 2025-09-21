import logger from '#config/logger.js';
import {
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
} from '#services/user.service.js';
import { formatValidationError } from '#utils/format.js';
import {
  userIdSchema,
  updateUserSchema,
} from '#validations/user.validation.js';

export const fetchAllUsers = async (req, res, next) => {
  try {
    const allUsers = await getAllUsers();
    logger.info('All users retrieved successfully');
    res.json({
      message: 'Successfully retrieved users.',
      users: allUsers,
      count: allUsers.length,
    });
  } catch (error) {
    logger.error('Error fetching all users:', error);
    next(error);
  }
};

export const fetchUserById = async (req, res, next) => {
  try {
    // Validate request parameters
    const validationResult = userIdSchema.safeParse(req.params);
    if (!validationResult.success) {
      return res.status(400).json({
        error: 'Validation failed',
        details: formatValidationError(validationResult.error),
      });
    }

    const { id } = validationResult.data;
    const user = await getUserById(id);

    res.json({
      message: 'Successfully retrieved user.',
      user,
    });
  } catch (error) {
    logger.error('Error fetching user by ID:', error);
    if (error.message === 'User not found') {
      return res.status(404).json({
        error: 'Not found',
        message: 'User not found',
      });
    }
    next(error);
  }
};

export const updateUserById = async (req, res, next) => {
  try {
    // Validate request parameters
    const idValidation = userIdSchema.safeParse(req.params);
    if (!idValidation.success) {
      return res.status(400).json({
        error: 'Validation failed',
        details: formatValidationError(idValidation.error),
      });
    }

    // Validate request body
    const bodyValidation = updateUserSchema.safeParse(req.body);
    if (!bodyValidation.success) {
      return res.status(400).json({
        error: 'Validation failed',
        details: formatValidationError(bodyValidation.error),
      });
    }

    const { id } = idValidation.data;
    const updates = bodyValidation.data;

    // Check if user is trying to update their own information or if they're admin
    const isOwnProfile = req.user.id === id;
    const isAdmin = req.user.role === 'admin';

    if (!isOwnProfile && !isAdmin) {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'You can only update your own profile',
      });
    }

    // Only admins can change roles
    if (updates.role && !isAdmin) {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'Only administrators can change user roles',
      });
    }

    // If non-admin user is updating their own profile, remove role from updates
    if (isOwnProfile && !isAdmin && updates.role) {
      delete updates.role;
    }

    const updatedUser = await updateUser(id, updates);

    res.json({
      message: 'User updated successfully',
      user: updatedUser,
    });
  } catch (error) {
    logger.error('Error updating user:', error);
    if (error.message === 'User not found') {
      return res.status(404).json({
        error: 'Not found',
        message: 'User not found',
      });
    }
    if (error.message === 'Email already exists') {
      return res.status(409).json({
        error: 'Conflict',
        message: 'Email already exists',
      });
    }
    next(error);
  }
};

export const deleteUserById = async (req, res, next) => {
  try {
    // Validate request parameters
    const validationResult = userIdSchema.safeParse(req.params);
    if (!validationResult.success) {
      return res.status(400).json({
        error: 'Validation failed',
        details: formatValidationError(validationResult.error),
      });
    }

    const { id } = validationResult.data;

    // Check if user is trying to delete their own account or if they're admin
    const isOwnProfile = req.user.id === id;
    const isAdmin = req.user.role === 'admin';

    if (!isOwnProfile && !isAdmin) {
      return res.status(403).json({
        error: 'Forbidden',
        message:
          'You can only delete your own profile or must be an administrator',
      });
    }

    const deletedUser = await deleteUser(id);

    res.json({
      message: 'User deleted successfully',
      user: deletedUser,
    });
  } catch (error) {
    logger.error('Error deleting user:', error);
    if (error.message === 'User not found') {
      return res.status(404).json({
        error: 'Not found',
        message: 'User not found',
      });
    }
    next(error);
  }
};
