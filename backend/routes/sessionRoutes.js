import express from 'express';
import { scheduleSession, getUserSessions } from '../controllers/sessionController.js';
import { requireAuth } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(requireAuth);
router.post('/schedule', scheduleSession);
router.get('/', getUserSessions);

export default router;
