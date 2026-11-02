import express from 'express';
import {
  generateRoadmap,
  analyzeSkillGap,
  getAISkillRecommendations,
  askLearningAssistant
} from '../controllers/aiController.js';
import { requireAuth } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(requireAuth);
router.post('/roadmap', generateRoadmap);
router.post('/gap-analysis', analyzeSkillGap);
router.get('/recommendations', getAISkillRecommendations);
router.post('/ask-assistant', askLearningAssistant);

export default router;
