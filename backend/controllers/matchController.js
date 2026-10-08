import User from '../models/User.js';
import { calculateMatchScore } from '../services/matchingService.js';
import { getUserMatches } from './requestController.js';

/**
 * @desc    Get top recommended matches for the logged-in user
 * @route   GET /api/matches/recommendations
 * @access  Private
 */
export const getRecommendations = async (req, res, next) => {
  try {
    const currentUser = req.user;

    const allOtherUsers = await User.find({ _id: { $ne: currentUser._id } }).select('-password');

    const scoredUsers = allOtherUsers.map(user => {
      const matchScore = calculateMatchScore(currentUser, user);
      return {
        ...user.toJSON(),
        matchScore
      };
    });

    // Sort by match score descending
    scoredUsers.sort((a, b) => b.matchScore - a.matchScore);

    return res.status(200).json({
      success: true,
      count: scoredUsers.length,
      recommendations: scoredUsers
    });
  } catch (error) {
    next(error);
  }
};

export { getUserMatches };
