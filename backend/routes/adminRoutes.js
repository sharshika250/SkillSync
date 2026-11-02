import express from 'express';
import {
  getPlatformAnalytics,
  getAdminUsers,
  toggleUserSuspension,
  createReport,
  getAdminReports,
  resolveReport,
  createAssessmentQuestion
} from '../controllers/adminController.js';
import { requireAuth, requireAdmin } from '../middleware/authMiddleware.js';

const router = express.Router();

// Allow normal users to submit reports
router.post('/reports', requireAuth, createReport);

// All other admin management endpoints require admin privileges
router.use(requireAuth, requireAdmin);

router.get('/analytics', getPlatformAnalytics);
router.get('/users', getAdminUsers);
router.put('/users/:userId/suspend', toggleUserSuspension);
router.get('/reports', getAdminReports);
router.put('/reports/:id', resolveReport);
router.post('/assessments', createAssessmentQuestion);

export default router;
