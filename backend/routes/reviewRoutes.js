import express from 'express';
import { createReview, getUserReviews } from '../controllers/reviewController.js';
import { requireAuth, optionalAuth } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/', requireAuth, createReview);
router.get('/user/:userId', optionalAuth, getUserReviews);

export default router;
