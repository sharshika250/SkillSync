import express from 'express';
import {
  sendMessage,
  getMessagesWithPartner,
  getConversations,
  getNotifications,
  markNotificationRead,
  markAllNotificationsRead
} from '../controllers/communicationController.js';
import { requireAuth } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(requireAuth);

// Messages
router.post('/messages', sendMessage);
router.get('/messages', getConversations);
router.get('/messages/:partnerId', getMessagesWithPartner);

// Notifications
router.get('/notifications', getNotifications);
router.put('/notifications/read-all', markAllNotificationsRead);
router.put('/notifications/:id/read', markNotificationRead);

export default router;
