import { db } from '#config/database.js';
import logger from '#config/logger.js';
import { users } from '#models/user.model.js';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcrypt';

export const getAllUsers = async () => {
  try {
    return await db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        role: users.role,
        created_at: users.created_at,
        updated_at: users.updated_at,
      })
      .from(users);
  } catch (error) {
    logger.error('Error getting users : ', error);
    throw new Error('Error getting users');
  }
};

export const getUserById = async id => {
  try {
    const [user] = await db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        role: users.role,
        created_at: users.created_at,
        updated_at: users.updated_at,
      })
      .from(users)
      .where(eq(users.id, id))
      .limit(1);

    if (!user) {
      throw new Error('User not found');
    }

    logger.info(`User ${user.email} retrieved successfully`);
    return user;
  } catch (error) {
    logger.error('Error getting user by ID : ', error);
    if (error.message === 'User not found') {
      throw error;
    }
    throw new Error('Error getting user by ID');
  }
};

export const updateUser = async (id, updates) => {
  try {
    // Check if user exists
    const existingUser = await getUserById(id);

    // Prepare update object
    const updateData = { ...updates };

    // Hash password if it's being updated
    if (updates.password) {
      updateData.password = await bcrypt.hash(updates.password, 10);
    }

    // Add updated timestamp
    updateData.updated_at = new Date();

    // Check for email uniqueness if email is being updated
    if (updates.email && updates.email !== existingUser.email) {
      const [emailExists] = await db
        .select({ id: users.id })
        .from(users)
        .where(eq(users.email, updates.email))
        .limit(1);

      if (emailExists) {
        throw new Error('Email already exists');
      }
    }

    const [updatedUser] = await db
      .update(users)
      .set(updateData)
      .where(eq(users.id, id))
      .returning({
        id: users.id,
        name: users.name,
        email: users.email,
        role: users.role,
        created_at: users.created_at,
        updated_at: users.updated_at,
      });

    logger.info(`User ${updatedUser.email} updated successfully`);
    return updatedUser;
  } catch (error) {
    logger.error('Error updating user : ', error);
    if (
      error.message === 'User not found' ||
      error.message === 'Email already exists'
    ) {
      throw error;
    }
    throw new Error('Error updating user');
  }
};

export const deleteUser = async id => {
  try {
    // Check if user exists
    const existingUser = await getUserById(id);
    if (!existingUser) {
      throw new Error('User does not exist.');
    }
    const [deletedUser] = await db
      .delete(users)
      .where(eq(users.id, id))
      .returning({
        id: users.id,
        name: users.name,
        email: users.email,
      });

    logger.info(`User ${deletedUser.email} deleted successfully`);
    return deletedUser;
  } catch (error) {
    logger.error('Error deleting user : ', error);
    if (error.message === 'User not found') {
      throw error;
    }
    throw new Error('Error deleting user');
  }
};
