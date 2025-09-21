import { z } from 'zod';

// Schema for validating user ID parameter
export const userIdSchema = z.object({
  id: z.string().regex(/^\d+$/, 'ID must be a valid number').transform(Number),
});

// Schema for updating user information
export const updateUserSchema = z
  .object({
    name: z.string().min(2).max(255).trim().optional(),
    email: z.string().email().toLowerCase().trim().optional(),
    password: z.string().min(6).max(128).optional(),
    role: z.enum(['user', 'admin']).optional(),
  })
  .strict(); // Only allow specified fields

// Schema for creating a user (similar to signup but for admin purposes)
export const createUserSchema = z.object({
  name: z.string().min(2).max(255).trim(),
  email: z.string().email().toLowerCase().trim(),
  password: z.string().min(6).max(128),
  role: z.enum(['user', 'admin']).default('user'),
});
