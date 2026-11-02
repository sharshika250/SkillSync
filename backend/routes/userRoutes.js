import express from 'express';
import {
  getAllUsers,
  getUserById,
  getProfile,
  updateProfile,
  deleteAccount
} from '../controllers/userController.js';
import { requireAuth, optionalAuth } from '../middleware/authMiddleware.js';

const router = express.Router();

// Current user profile routes (must be defined before /:id)
router.get('/profile', requireAuth, getProfile);
router.put('/profile', requireAuth, updateProfile);
router.delete('/profile', requireAuth, deleteAccount);

// Explore users & partner details
router.get('/', optionalAuth, getAllUsers);
router.get('/:id', optionalAuth, getUserById);

export default router;
