import mongoose from 'mongoose';
import Message from '../models/Message.js';
import Notification from '../models/Notification.js';
import User from '../models/User.js';

/**
 * @desc    Send a message to an exchange partner
 * @route   POST /api/messages
 * @access  Private
 */
export const sendMessage = async (req, res, next) => {
  try {
    const senderId = req.user._id;
    const { receiverId, content } = req.body;

    if (!receiverId || !content || !content.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Please provide receiverId and non-empty message content'
      });
    }

    if (String(senderId) === String(receiverId)) {
      return res.status(400).json({
        success: false,
        message: 'Cannot message yourself'
      });
    }

    const receiver = await User.findById(receiverId);
    if (!receiver) {
      return res.status(404).json({
        success: false,
        message: 'Recipient user not found'
      });
    }

    const message = await Message.create({
      sender: senderId,
      receiver: receiverId,
      content: content.trim()
    });

    const populated = await Message.findById(message._id)
      .populate('sender', 'name avatar')
      .populate('receiver', 'name avatar');

    // Create in-app notification for receiver
    await Notification.create({
      user: receiverId,
      type: 'message',
      title: `New message from ${req.user.name}`,
      message: content.trim().length > 60 ? `${content.trim().substring(0, 60)}...` : content.trim(),
      link: '/messages'
    });

    return res.status(201).json({
      success: true,
      message: populated
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get message history between current user and a partner
 * @route   GET /api/messages/:partnerId
 * @access  Private
 */
export const getMessagesWithPartner = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { partnerId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(partnerId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid partner ID'
      });
    }

    const messages = await Message.find({
      $or: [
        { sender: userId, receiver: partnerId },
        { sender: partnerId, receiver: userId }
      ]
    })
      .populate('sender', 'name avatar')
      .populate('receiver', 'name avatar')
      .sort({ createdAt: 1 });

    // Mark incoming messages as read
    await Message.updateMany(
      { sender: partnerId, receiver: userId, read: false },
      { $set: { read: true } }
    );

    return res.status(200).json({
      success: true,
      count: messages.length,
      messages
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get list of all conversations for current user
 * @route   GET /api/messages
 * @access  Private
 */
export const getConversations = async (req, res, next) => {
  try {
    const userId = req.user._id;

    // Find all distinct partners
    const sent = await Message.find({ sender: userId }).distinct('receiver');
    const received = await Message.find({ receiver: userId }).distinct('sender');

    const partnerIds = Array.from(new Set([...sent, ...received].map(String)));

    const conversations = [];

    for (const pid of partnerIds) {
      const partner = await User.findById(pid).select('name email avatar role');
      if (partner) {
        const lastMsg = await Message.findOne({
          $or: [
            { sender: userId, receiver: pid },
            { sender: pid, receiver: userId }
          ]
        }).sort({ createdAt: -1 });

        const unreadCount = await Message.countDocuments({
          sender: pid,
          receiver: userId,
          read: false
        });

        conversations.push({
          partner,
          lastMessage: lastMsg,
          unreadCount
        });
      }
    }

    conversations.sort((a, b) => new Date(b.lastMessage?.createdAt || 0) - new Date(a.lastMessage?.createdAt || 0));

    return res.status(200).json({
      success: true,
      count: conversations.length,
      conversations
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get user notifications
 * @route   GET /api/notifications
 * @access  Private
 */
export const getNotifications = async (req, res, next) => {
  try {
    const userId = req.user._id;

    const notifications = await Notification.find({ user: userId })
      .sort({ createdAt: -1 })
      .limit(30);

    const unreadCount = await Notification.countDocuments({ user: userId, read: false });

    return res.status(200).json({
      success: true,
      unreadCount,
      notifications
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Mark single notification as read
 * @route   PUT /api/notifications/:id/read
 * @access  Private
 */
export const markNotificationRead = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const notif = await Notification.findOneAndUpdate(
      { _id: id, user: userId },
      { $set: { read: true } },
      { new: true }
    );

    return res.status(200).json({
      success: true,
      notification: notif
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Mark all notifications as read
 * @route   PUT /api/notifications/read-all
 * @access  Private
 */
export const markAllNotificationsRead = async (req, res, next) => {
  try {
    const userId = req.user._id;

    await Notification.updateMany({ user: userId, read: false }, { $set: { read: true } });

    return res.status(200).json({
      success: true,
      message: 'All notifications marked as read'
    });
  } catch (error) {
    next(error);
  }
};
