import User from '../models/User.js';
import Assessment from '../models/Assessment.js';
import AssessmentAttempt from '../models/AssessmentAttempt.js';
import ExchangeRequest from '../models/ExchangeRequest.js';
import Review from '../models/Review.js';
import Report from '../models/Report.js';

/**
 * @desc    Get aggregate platform analytics
 * @route   GET /api/admin/analytics
 * @access  Admin Only
 */
export const getPlatformAnalytics = async (req, res, next) => {
  try {
    const [
      totalUsers,
      totalExchanges,
      completedExchanges,
      totalAssessments,
      totalAttempts,
      reviews,
      reportsCount
    ] = await Promise.all([
      User.countDocuments(),
      ExchangeRequest.countDocuments(),
      ExchangeRequest.countDocuments({ status: 'completed' }),
      Assessment.countDocuments(),
      AssessmentAttempt.countDocuments(),
      Review.find({}).select('rating'),
      Report.countDocuments({ status: 'pending' })
    ]);

    // Calculate verified skills count
    const verifiedUsers = await User.find({ 'skillVerifications.status': 'SKILL_VERIFIED' });
    let verifiedSkillsCount = 0;
    for (const u of verifiedUsers) {
      verifiedSkillsCount += (u.skillVerifications || []).filter(v => v.status === 'SKILL_VERIFIED').length;
    }

    const avgRating = reviews.length > 0
      ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(2)
      : '5.00';

    // Popular skills aggregation
    const allUsers = await User.find({}).select('skillsOffered skillsWanted');
    const skillTally = {};
    for (const u of allUsers) {
      for (const s of u.skillsOffered || []) {
        skillTally[s] = (skillTally[s] || 0) + 1;
      }
    }

    const popularSkills = Object.entries(skillTally)
      .map(([skill, count]) => ({ skill, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 8);

    return res.status(200).json({
      success: true,
      analytics: {
        totalUsers,
        totalExchanges,
        completedExchanges,
        verifiedSkillsCount,
        totalAssessments,
        totalAttempts,
        averagePlatformRating: Number(avgRating),
        pendingReportsCount: reportsCount,
        popularSkills
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all users for admin management
 * @route   GET /api/admin/users
 * @access  Admin Only
 */
export const getAdminUsers = async (req, res, next) => {
  try {
    const users = await User.find({})
      .select('-password')
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: users.length,
      users
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Toggle account suspension status
 * @route   PUT /api/admin/users/:userId/suspend
 * @access  Admin Only
 */
export const toggleUserSuspension = async (req, res, next) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Protect primary admin from self-suspension
    if (String(user._id) === String(req.user._id)) {
      return res.status(400).json({
        success: false,
        message: 'Administrator cannot suspend their own account'
      });
    }

    user.isSuspended = !user.isSuspended;
    await user.save();

    return res.status(200).json({
      success: true,
      message: `User account has been ${user.isSuspended ? 'suspended' : 'reactivated'}.`,
      isSuspended: user.isSuspended
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Submit a user report
 * @route   POST /api/admin/reports
 * @access  Private
 */
export const createReport = async (req, res, next) => {
  try {
    const reporterId = req.user._id;
    const { reportedUserId, reason, details } = req.body;

    if (!reportedUserId || !reason) {
      return res.status(400).json({
        success: false,
        message: 'Please provide reportedUserId and reason'
      });
    }

    const report = await Report.create({
      reporter: reporterId,
      reportedUser: reportedUserId,
      reason,
      details: details ? details.trim() : '',
      status: 'pending'
    });

    return res.status(201).json({
      success: true,
      message: 'Report submitted for administrator review',
      report
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all reports
 * @route   GET /api/admin/reports
 * @access  Admin Only
 */
export const getAdminReports = async (req, res, next) => {
  try {
    const reports = await Report.find({})
      .populate('reporter', 'name email')
      .populate('reportedUser', 'name email isSuspended')
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: reports.length,
      reports
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update report status
 * @route   PUT /api/admin/reports/:id
 * @access  Admin Only
 */
export const resolveReport = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, actionTaken } = req.body;

    const report = await Report.findById(id);
    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'Report not found'
      });
    }

    if (status) report.status = status;
    if (actionTaken) report.actionTaken = actionTaken;

    await report.save();

    return res.status(200).json({
      success: true,
      message: 'Report updated',
      report
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Admin: Create assessment question
 * @route   POST /api/admin/assessments
 * @access  Admin Only
 */
export const createAssessmentQuestion = async (req, res, next) => {
  try {
    const { skill, difficulty, type, question, options, correctOptionIndex, explanation, practicalDetails } = req.body;

    if (!skill || !question) {
      return res.status(400).json({
        success: false,
        message: 'Skill and question are required'
      });
    }

    const newQ = await Assessment.create({
      skill,
      difficulty: difficulty || 'Intermediate',
      type: type || 'mcq',
      question,
      options: options || [],
      correctOptionIndex: Number(correctOptionIndex) || 0,
      explanation: explanation || '',
      practicalDetails: practicalDetails || {}
    });

    return res.status(201).json({
      success: true,
      message: 'Assessment question created',
      assessment: newQ
    });
  } catch (error) {
    next(error);
  }
};
