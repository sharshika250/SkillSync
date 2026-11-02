import express from 'express';
import {
  getAvailableSkills,
  getAssessmentForSkill,
  submitMCQAssessment,
  submitPracticalAssessment,
  getUserAssessmentHistory
} from '../controllers/assessmentController.js';
import { requireAuth } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/skills', getAvailableSkills);
router.get('/history', requireAuth, getUserAssessmentHistory);
router.get('/skill/:skill', requireAuth, getAssessmentForSkill);
router.post('/submit-mcq', requireAuth, submitMCQAssessment);
router.post('/submit-practical', requireAuth, submitPracticalAssessment);

export default router;
