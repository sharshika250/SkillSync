import mongoose from 'mongoose';
import ExchangeSession from '../models/ExchangeSession.js';
import ExchangeRequest from '../models/ExchangeRequest.js';
import Notification from '../models/Notification.js';

/**
 * @desc    Schedule a skill exchange session
 * @route   POST /api/sessions/schedule
 * @access  Private
 */
export const scheduleSession = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { exchangeRequestId, date, time, durationMinutes = 60, meetingLink, notes } = req.body;

    if (!exchangeRequestId || !date || !time) {
      return res.status(400).json({
        success: false,
        message: 'Please provide exchangeRequestId, date, and time for the session'
      });
    }

    const exchange = await ExchangeRequest.findById(exchangeRequestId);
    if (!exchange) {
      return res.status(404).json({
        success: false,
        message: 'Exchange partnership not found'
      });
    }

    const isSender = String(exchange.sender) === String(userId);
    const isReceiver = String(exchange.receiver) === String(userId);

    if (!isSender && !isReceiver) {
      return res.status(403).json({
        success: false,
        message: 'Only members of this exchange can schedule sessions'
      });
    }

    const session = await ExchangeSession.create({
      exchangeRequest: exchangeRequestId,
      sender: exchange.sender,
      receiver: exchange.receiver,
      date,
      time,
      durationMinutes: Number(durationMinutes) || 60,
      meetingLink: meetingLink ? meetingLink.trim() : '',
      notes: notes ? notes.trim() : '',
      status: 'scheduled'
    });

    const partnerId = isSender ? exchange.receiver : exchange.sender;
    await Notification.create({
      user: partnerId,
      type: 'session',
      title: 'New Session Scheduled 📅',
      message: `${req.user.name} scheduled an exchange session on ${date} at ${time}.`,
      link: '/matches'
    });

    const populated = await ExchangeSession.findById(session._id)
      .populate('sender', 'name email avatar')
      .populate('receiver', 'name email avatar')
      .populate('exchangeRequest', 'offeredSkill requestedSkill');

    return res.status(201).json({
      success: true,
      message: 'Exchange session scheduled successfully',
      session: populated
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all sessions for current user (upcoming & past)
 * @route   GET /api/sessions
 * @access  Private
 */
export const getUserSessions = async (req, res, next) => {
  try {
    const userId = req.user._id;

    const sessions = await ExchangeSession.find({
      $or: [{ sender: userId }, { receiver: userId }]
    })
      .populate('sender', 'name email avatar')
      .populate('receiver', 'name email avatar')
      .populate('exchangeRequest', 'offeredSkill requestedSkill status')
      .sort({ date: 1, time: 1 });

    return res.status(200).json({
      success: true,
      count: sessions.length,
      sessions
    });
  } catch (error) {
    next(error);
  }
};
