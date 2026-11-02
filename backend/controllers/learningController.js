import LearningGoal from '../models/LearningGoal.js';
import User from '../models/User.js';
import ExchangeSession from '../models/ExchangeSession.js';
import ExchangeRequest from '../models/ExchangeRequest.js';

/**
 * @desc    Get user's learning goals and dashboard summary
 * @route   GET /api/learning
 * @access  Private
 */
export const getLearningSummary = async (req, res, next) => {
  try {
    const userId = req.user._id;

    const [goals, sessions, user, completedExchanges] = await Promise.all([
      LearningGoal.find({ user: userId }).sort({ createdAt: -1 }),
      ExchangeSession.find({
        $or: [{ sender: userId }, { receiver: userId }]
      })
        .populate('sender', 'name')
        .populate('receiver', 'name')
        .sort({ date: 1 }),
      User.findById(userId).select('skillsOffered skillsWanted skillVerifications'),
      ExchangeRequest.countDocuments({
        $or: [{ sender: userId }, { receiver: userId }],
        status: 'completed'
      })
    ]);

    const upcomingSessions = sessions.filter(s => s.status === 'scheduled');
    const pastSessions = sessions.filter(s => s.status === 'completed');

    return res.status(200).json({
      success: true,
      goals,
      skillsOffered: user?.skillsOffered || [],
      skillsWanted: user?.skillsWanted || [],
      skillVerifications: user?.skillVerifications || [],
      completedExchangesCount: completedExchanges,
      upcomingSessions,
      pastSessions
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Create a new learning goal
 * @route   POST /api/learning/goals
 * @access  Private
 */
export const createLearningGoal = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { skill, currentProficiency, targetProficiency, targetDate, milestones } = req.body;

    if (!skill) {
      return res.status(400).json({
        success: false,
        message: 'Skill is required'
      });
    }

    const defaultMilestones = milestones && milestones.length > 0
      ? milestones.map(m => (typeof m === 'string' ? { title: m, completed: false } : m))
      : [
          { title: `Master fundamentals of ${skill}`, completed: false },
          { title: `Complete first practice project in ${skill}`, completed: false },
          { title: `Complete peer exchange session for ${skill}`, completed: false },
          { title: `Pass verification assessment for ${skill}`, completed: false }
        ];

    const goal = await LearningGoal.create({
      user: userId,
      skill: skill.trim(),
      currentProficiency: currentProficiency || 'Beginner',
      targetProficiency: targetProficiency || 'Advanced',
      targetDate: targetDate || '',
      milestones: defaultMilestones
    });

    return res.status(201).json({
      success: true,
      message: 'Learning goal created successfully',
      goal
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Toggle milestone completion
 * @route   PUT /api/learning/goals/:goalId/milestones/:milestoneId
 * @access  Private
 */
export const toggleMilestone = async (req, res, next) => {
  try {
    const { goalId, milestoneId } = req.params;
    const userId = req.user._id;

    const goal = await LearningGoal.findOne({ _id: goalId, user: userId });
    if (!goal) {
      return res.status(404).json({
        success: false,
        message: 'Learning goal not found'
      });
    }

    const milestone = goal.milestones.id(milestoneId);
    if (!milestone) {
      return res.status(404).json({
        success: false,
        message: 'Milestone not found'
      });
    }

    milestone.completed = !milestone.completed;
    milestone.completedAt = milestone.completed ? new Date() : null;

    // If all milestones completed, mark goal completed
    const allDone = goal.milestones.every(m => m.completed);
    if (allDone) {
      goal.status = 'completed';
    } else {
      goal.status = 'in_progress';
    }

    await goal.save();

    return res.status(200).json({
      success: true,
      message: 'Milestone updated',
      goal
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Add journal entry to learning goal
 * @route   POST /api/learning/goals/:goalId/journal
 * @access  Private
 */
export const addJournalEntry = async (req, res, next) => {
  try {
    const { goalId } = req.params;
    const { note } = req.body;
    const userId = req.user._id;

    if (!note || !note.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Journal note cannot be empty'
      });
    }

    const goal = await LearningGoal.findOne({ _id: goalId, user: userId });
    if (!goal) {
      return res.status(404).json({
        success: false,
        message: 'Learning goal not found'
      });
    }

    goal.journal.unshift({
      note: note.trim(),
      date: new Date()
    });

    await goal.save();

    return res.status(201).json({
      success: true,
      message: 'Journal entry recorded',
      goal
    });
  } catch (error) {
    next(error);
  }
};
