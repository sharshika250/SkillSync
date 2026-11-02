import express from 'express';
import {
  getLearningSummary,
  createLearningGoal,
  toggleMilestone,
  addJournalEntry
} from '../controllers/learningController.js';
import { requireAuth } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(requireAuth);
router.get('/', getLearningSummary);
router.post('/goals', createLearningGoal);
router.put('/goals/:goalId/milestones/:milestoneId', toggleMilestone);
router.post('/goals/:goalId/journal', addJournalEntry);

export default router;
