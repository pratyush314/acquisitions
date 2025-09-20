import {
  fetchAllUsers,
  fetchUserById,
  updateUserById,
  deleteUserById,
} from '#controllers/user.controller.js';
import { authenticate, authorize } from '#middleware/auth.middleware.js';
import express from 'express';

const router = express.Router();

router.get('/', authenticate, authorize('admin'), fetchAllUsers);
router.get('/:id', authenticate, fetchUserById);
router.put('/:id', authenticate, updateUserById);
router.delete('/:id', authenticate, deleteUserById);

export default router;
