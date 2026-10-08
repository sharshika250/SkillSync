import mongoose from 'mongoose';
import User from '../models/User.js';

/**
 * Authentication middleware that verifies the user ID from headers.
 * Supports:
 * - 'x-user-id': <userId>
 * - 'authorization': 'Bearer <userId>'
 */
export const requireAuth = async (req, res, next) => {
  try {
    let userId = req.headers['x-user-id'];

    const authHeader = req.headers.authorization;
    if (!userId && authHeader && authHeader.startsWith('Bearer ')) {
      userId = authHeader.split(' ')[1];
    }

    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required. Please login.'
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Authenticated user account was not found.'
      });
    }

    req.user = user;
    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Optional authentication middleware:
 * Attaches user to req.user if valid credentials exist, but does not block unauthenticated access.
 */
export const optionalAuth = async (req, res, next) => {
  try {
    let userId = req.headers['x-user-id'];

    const authHeader = req.headers.authorization;
    if (!userId && authHeader && authHeader.startsWith('Bearer ')) {
      userId = authHeader.split(' ')[1];
    }

    if (userId && mongoose.Types.ObjectId.isValid(userId)) {
      const user = await User.findById(userId);
      if (user) {
        req.user = user;
      }
    }

    next();
  } catch {
    next();
  }
};
