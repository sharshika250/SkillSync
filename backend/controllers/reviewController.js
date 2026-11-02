import mongoose from 'mongoose';
import Review from '../models/Review.js';
import ExchangeRequest from '../models/ExchangeRequest.js';
import User from '../models/User.js';
import Notification from '../models/Notification.js';

/**
 * @desc    Submit a review for a completed skill exchange
 * @route   POST /api/reviews
 * @access  Private
 */
export const createReview = async (req, res, next) => {
  try {
    const reviewerId = req.user._id;
    const { exchangeRequestId, rating, criteria, comment } = req.body;

    // 1. Validation
    if (!exchangeRequestId || !rating) {
      return res.status(400).json({
        success: false,
        message: 'Please provide exchangeRequestId and rating (1-5 stars)'
      });
    }

    const numericRating = Number(rating);
    if (numericRating < 1 || numericRating > 5) {
      return res.status(400).json({
        success: false,
        message: 'Rating must be between 1 and 5'
      });
    }

    const exchange = await ExchangeRequest.findById(exchangeRequestId);
    if (!exchange) {
      return res.status(404).json({
        success: false,
        message: 'Skill exchange request not found'
      });
    }

    // Must be a participant
    const isSender = String(exchange.sender) === String(reviewerId);
    const isReceiver = String(exchange.receiver) === String(reviewerId);

    if (!isSender && !isReceiver) {
      return res.status(403).json({
        success: false,
        message: 'You can only review skill exchanges you actively participated in'
      });
    }

    // Must be completed (or accepted with both confirmations)
    if (exchange.status !== 'completed' && !(exchange.senderConfirmedCompleted && exchange.receiverConfirmedCompleted)) {
      return res.status(400).json({
        success: false,
        message: 'Cannot review an exchange until both participants have confirmed completion'
      });
    }

    const revieweeId = isSender ? exchange.receiver : exchange.sender;
    const skillTaught = isSender ? exchange.requestedSkill : exchange.offeredSkill;

    // 2. Prevent duplicate reviews
    const existing = await Review.findOne({
      exchangeRequest: exchangeRequestId,
      reviewer: reviewerId
    });

    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'You have already submitted a review for this exchange'
      });
    }

    // 3. Create review
    const review = await Review.create({
      exchangeRequest: exchangeRequestId,
      reviewer: reviewerId,
      reviewee: revieweeId,
      skillTaught,
      rating: numericRating,
      criteria: criteria || { punctuality: numericRating, clarity: numericRating, helpfulness: numericRating },
      comment: comment ? comment.trim() : ''
    });

    // 4. Update reviewee's trustScore and badges dynamically
    const allReviews = await Review.find({ reviewee: revieweeId });
    const avgRating = allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;

    const reviewee = await User.findById(revieweeId);
    if (reviewee) {
      // Calculate reputation score: base (50) + 10 * (avgRating - 3) + 5 * reviewCount, capped at 100
      const bonusScore = Math.min(50, Math.round((avgRating - 1) * 12.5 + allReviews.length * 2));
      reviewee.trustScore = Math.min(100, 50 + bonusScore);

      if (!reviewee.badges) reviewee.badges = [];

      // Top Rated badge: avgRating >= 4.7 with at least 3 reviews
      if (avgRating >= 4.7 && allReviews.length >= 3 && !reviewee.badges.includes('Top Rated')) {
        reviewee.badges.push('Top Rated');
      }

      // Reliable Partner badge: at least 3 completed exchanges
      if (allReviews.length >= 3 && !reviewee.badges.includes('Reliable Partner')) {
        reviewee.badges.push('Reliable Partner');
      }

      await reviewee.save();
    }

    // 5. Notify reviewee
    await Notification.create({
      user: revieweeId,
      type: 'review',
      title: 'New Review Received! ⭐',
      message: `${req.user.name} gave you a ${numericRating}-star review for teaching ${skillTaught}.`,
      link: '/profile'
    });

    return res.status(201).json({
      success: true,
      message: 'Review submitted successfully',
      review
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get reviews for a specific user
 * @route   GET /api/reviews/user/:userId
 * @access  Public / Authenticated
 */
export const getUserReviews = async (req, res, next) => {
  try {
    const { userId } = req.params;

    const reviews = await Review.find({ reviewee: userId })
      .populate('reviewer', 'name email avatar role')
      .sort({ createdAt: -1 });

    const avgRating = reviews.length > 0
      ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1)
      : 0;

    return res.status(200).json({
      success: true,
      count: reviews.length,
      averageRating: Number(avgRating),
      reviews
    });
  } catch (error) {
    next(error);
  }
};
