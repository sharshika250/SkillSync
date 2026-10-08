import express from 'express';
import { getRecommendations, getUserMatches } from '../controllers/matchController.js';
import { requireAuth } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(requireAuth);

router.get('/', getUserMatches);
router.get('/recommendations', getRecommendations);

export default router;
