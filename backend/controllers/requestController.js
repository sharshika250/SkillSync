import mongoose from 'mongoose';
import ExchangeRequest from '../models/ExchangeRequest.js';
import User from '../models/User.js';
import Notification from '../models/Notification.js';
import { calculateMatchScore } from '../services/matchingService.js';

/**
 * @desc    Create a new exchange request
 * @route   POST /api/requests
 * @access  Private
 */
export const createRequest = async (req, res, next) => {
  try {
    const senderId = req.user._id;
    const { receiverId, offeredSkill, requestedSkill, message } = req.body;

    // 1. Validation
    if (!receiverId || !offeredSkill || !requestedSkill) {
      return res.status(400).json({
        success: false,
        message: 'Please provide receiverId, offeredSkill, and requestedSkill'
      });
    }

    if (!mongoose.Types.ObjectId.isValid(receiverId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid receiver ID format'
      });
    }

    if (String(senderId) === String(receiverId)) {
      return res.status(400).json({
        success: false,
        message: 'You cannot initiate a skill exchange request with yourself'
      });
    }

    const receiver = await User.findById(receiverId);
    if (!receiver) {
      return res.status(404).json({
        success: false,
        message: 'The requested skill partner does not exist'
      });
    }

    // 2. Duplicate prevention
    const existingPending = await ExchangeRequest.findOne({
      sender: senderId,
      receiver: receiverId,
      status: 'pending'
    });

    if (existingPending) {
      return res.status(400).json({
        success: false,
        message: 'You already have an active pending exchange request with this partner'
      });
    }

    // 3. Compute algorithmic match score
    const matchScore = calculateMatchScore(req.user, receiver);

    // 4. Save to MongoDB
    const newRequest = await ExchangeRequest.create({
      sender: senderId,
      receiver: receiverId,
      offeredSkill: offeredSkill.trim(),
      requestedSkill: requestedSkill.trim(),
      message: message ? message.trim() : '',
      matchScore: matchScore || 0,
      status: 'pending'
    });

    const populatedRequest = await ExchangeRequest.findById(newRequest._id)
      .populate('sender', 'name email role bio skillsOffered skillsWanted trustScore verification')
      .populate('receiver', 'name email role bio skillsOffered skillsWanted trustScore verification');

    return res.status(201).json({
      success: true,
      message: 'Exchange request sent successfully',
      request: populatedRequest
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get user's exchange requests (sent and/or received)
 * @route   GET /api/requests
 * @access  Private
 */
export const getUserRequests = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { type, status } = req.query;

    const query = {};

    if (type === 'sent') {
      query.sender = userId;
    } else if (type === 'received') {
      query.receiver = userId;
    } else {
      query.$or = [{ sender: userId }, { receiver: userId }];
    }

    if (status) {
      query.status = status;
    }

    const requests = await ExchangeRequest.find(query)
      .populate('sender', 'name email role bio skillsOffered skillsWanted trustScore verification')
      .populate('receiver', 'name email role bio skillsOffered skillsWanted trustScore verification')
      .sort({ createdAt: -1 });

    // Separate sent vs received for convenient frontend consumption
    const sent = requests.filter(r => String(r.sender?._id || r.sender) === String(userId));
    const received = requests.filter(r => String(r.receiver?._id || r.receiver) === String(userId));

    return res.status(200).json({
      success: true,
      count: requests.length,
      requests,
      sent,
      received
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Accept an exchange request
 * @route   PUT /api/requests/:id/accept
 * @access  Private
 */
export const acceptRequest = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid request ID'
      });
    }

    const request = await ExchangeRequest.findById(id);
    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Exchange request not found'
      });
    }

    // Only the receiver can accept
    if (String(request.receiver) !== String(userId)) {
      return res.status(403).json({
        success: false,
        message: 'Only the recipient of the request can accept it'
      });
    }

    if (request.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: `Cannot accept a request that is already ${request.status}`
      });
    }

    request.status = 'accepted';
    await request.save();

    const populated = await ExchangeRequest.findById(request._id)
      .populate('sender', 'name email role bio skillsOffered skillsWanted trustScore verification')
      .populate('receiver', 'name email role bio skillsOffered skillsWanted trustScore verification');

    return res.status(200).json({
      success: true,
      message: 'Exchange request accepted! A new skill match has been formed.',
      request: populated
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Reject an exchange request
 * @route   PUT /api/requests/:id/reject
 * @access  Private
 */
export const rejectRequest = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid request ID'
      });
    }

    const request = await ExchangeRequest.findById(id);
    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Exchange request not found'
      });
    }

    // Only the receiver can reject
    if (String(request.receiver) !== String(userId)) {
      return res.status(403).json({
        success: false,
        message: 'Only the recipient of the request can reject it'
      });
    }

    if (request.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: `Cannot reject a request that is already ${request.status}`
      });
    }

    request.status = 'rejected';
    await request.save();

    const populated = await ExchangeRequest.findById(request._id)
      .populate('sender', 'name email role bio skillsOffered skillsWanted trustScore verification')
      .populate('receiver', 'name email role bio skillsOffered skillsWanted trustScore verification');

    return res.status(200).json({
      success: true,
      message: 'Exchange request declined',
      request: populated
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Cancel a sent exchange request
 * @route   PUT /api/requests/:id/cancel
 * @access  Private
 */
export const cancelRequest = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid request ID'
      });
    }

    const request = await ExchangeRequest.findById(id);
    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Exchange request not found'
      });
    }

    // Only the sender can cancel
    if (String(request.sender) !== String(userId)) {
      return res.status(403).json({
        success: false,
        message: 'Only the sender can cancel this request'
      });
    }

    if (request.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: `Cannot cancel a request that is already ${request.status}`
      });
    }

    request.status = 'cancelled';
    await request.save();

    return res.status(200).json({
      success: true,
      message: 'Exchange request cancelled',
      request
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all accepted and completed matches for current user
 * @route   GET /api/requests/matches (also wired to /api/matches)
 * @access  Private
 */
export const getUserMatches = async (req, res, next) => {
  try {
    const userId = req.user._id;

    const acceptedRequests = await ExchangeRequest.find({
      $or: [{ sender: userId }, { receiver: userId }],
      status: { $in: ['accepted', 'completed'] }
    })
      .populate('sender', 'name email role bio skillsOffered skillsWanted trustScore verification availability badges skillVerifications')
      .populate('receiver', 'name email role bio skillsOffered skillsWanted trustScore verification availability badges skillVerifications')
      .sort({ updatedAt: -1 });

    const matches = acceptedRequests.map(item => {
      const isSender = String(item.sender?._id || item.sender) === String(userId);
      const partner = isSender ? item.receiver : item.sender;
      const mySkill = isSender ? item.offeredSkill : item.requestedSkill;
      const partnerSkill = isSender ? item.requestedSkill : item.offeredSkill;

      return {
        id: item._id,
        requestId: item._id,
        partner,
        mySkill,
        partnerSkill,
        matchScore: item.matchScore,
        status: item.status,
        senderConfirmedCompleted: item.senderConfirmedCompleted,
        receiverConfirmedCompleted: item.receiverConfirmedCompleted,
        isCompleted: item.status === 'completed',
        canLeaveReview: item.status === 'completed',
        createdAt: item.createdAt,
        updatedAt: item.updatedAt
      };
    });

    return res.status(200).json({
      success: true,
      count: matches.length,
      matches
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Confirm exchange completion (requires dual confirmation to finalize)
 * @route   PUT /api/requests/:id/complete
 * @access  Private
 */
export const confirmCompletion = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid request ID'
      });
    }

    const request = await ExchangeRequest.findById(id);
    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Exchange request not found'
      });
    }

    const isSender = String(request.sender) === String(userId);
    const isReceiver = String(request.receiver) === String(userId);

    if (!isSender && !isReceiver) {
      return res.status(403).json({
        success: false,
        message: 'Only participants of this exchange can confirm completion'
      });
    }

    if (request.status !== 'accepted' && request.status !== 'completed') {
      return res.status(400).json({
        success: false,
        message: `Cannot complete an exchange that is ${request.status}`
      });
    }

    if (isSender) {
      request.senderConfirmedCompleted = true;
    }
    if (isReceiver) {
      request.receiverConfirmedCompleted = true;
    }

    // If both confirmed (or if one confirms and other already confirmed), mark COMPLETED
    let isFullyCompleted = false;
    if (request.senderConfirmedCompleted && request.receiverConfirmedCompleted) {
      request.status = 'completed';
      request.completedAt = new Date();
      isFullyCompleted = true;

      // Increment trust scores for both participants (+5 points for completing an exchange)
      await User.findByIdAndUpdate(request.sender, { $inc: { trustScore: 5 } });
      await User.findByIdAndUpdate(request.receiver, { $inc: { trustScore: 5 } });

      // Notify both participants
      await Notification.create([
        {
          user: request.sender,
          type: 'accepted',
          title: 'Skill Exchange Completed! 🎓',
          message: `Both you and your partner confirmed completion. You can now leave a review for your partner.`,
          link: '/matches'
        },
        {
          user: request.receiver,
          type: 'accepted',
          title: 'Skill Exchange Completed! 🎓',
          message: `Both you and your partner confirmed completion. You can now leave a review for your partner.`,
          link: '/matches'
        }
      ]);
    } else {
      // Notify other participant to confirm
      const otherUserId = isSender ? request.receiver : request.sender;
      await Notification.create({
        user: otherUserId,
        type: 'request',
        title: 'Partner Confirmed Session Completion',
        message: `Your partner marked your skill exchange as completed. Please confirm completion to unlock reviews.`,
        link: '/matches'
      });
    }

    await request.save();

    return res.status(200).json({
      success: true,
      message: isFullyCompleted
        ? 'Skill exchange fully completed by both members! Reviews are now unlocked.'
        : 'Your completion confirmation recorded. Waiting for partner confirmation.',
      request,
      isFullyCompleted
    });
  } catch (error) {
    next(error);
  }
};
