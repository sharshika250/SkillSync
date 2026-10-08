import express from 'express';
import {
  createRequest,
  getUserRequests,
  acceptRequest,
  rejectRequest,
  cancelRequest,
  getUserMatches
} from '../controllers/requestController.js';
import { requireAuth } from '../middleware/authMiddleware.js';

const router = express.Router();

// All request operations require authentication
router.use(requireAuth);

router.post('/', createRequest);
router.get('/', getUserRequests);
router.get('/matches', getUserMatches);
router.put('/:id/accept', acceptRequest);
router.put('/:id/reject', rejectRequest);
router.put('/:id/cancel', cancelRequest);

export default router;
