import Assessment from '../models/Assessment.js';
import AssessmentAttempt from '../models/AssessmentAttempt.js';
import User from '../models/User.js';
import Notification from '../models/Notification.js';
import { evaluateCode } from '../services/codeRunnerService.js';

/**
 * Configure score thresholds (as specified in Module One requirements):
 * Below 40%: Not demonstrated
 * 40–59%: Basic
 * 60–79%: Intermediate
 * 80–100%: Advanced
 */
export const calculateDemonstratedLevel = (percentage) => {
  if (percentage >= 80) return 'Advanced';
  if (percentage >= 60) return 'Intermediate';
  if (percentage >= 40) return 'Basic';
  return 'Not Demonstrated';
};

/**
 * @desc    Get list of skills with available verification assessments
 * @route   GET /api/assessments/skills
 * @access  Public / Authenticated
 */
export const getAvailableSkills = async (req, res, next) => {
  try {
    const skills = await Assessment.distinct('skill');
    return res.status(200).json({
      success: true,
      skills: skills.sort()
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get assessment questions for a skill (stripping correctOptionIndex for security)
 * @route   GET /api/assessments/skill/:skill
 * @access  Private
 */
export const getAssessmentForSkill = async (req, res, next) => {
  try {
    const { skill } = req.params;
    const { difficulty = 'Intermediate', type } = req.query;

    const query = {
      skill: new RegExp(`^${skill.trim()}$`, 'i'),
      isActive: true
    };

    if (difficulty) {
      query.difficulty = difficulty;
    }

    if (type) {
      query.type = type;
    }

    const questions = await Assessment.find(query).select('-correctOptionIndex -explanation');

    // Also sanitize practical questions so hidden test cases don't expose answers
    const sanitized = questions.map(q => {
      const obj = q.toObject();
      if (obj.practicalDetails && obj.practicalDetails.testCases) {
        obj.practicalDetails.testCases = obj.practicalDetails.testCases.map(tc => {
          if (tc.isHidden) {
            return {
              description: tc.description || 'Hidden Test Case',
              isHidden: true
            };
          }
          return tc;
        });
      }
      return obj;
    });

    return res.status(200).json({
      success: true,
      skill,
      count: sanitized.length,
      questions: sanitized
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Submit MCQ assessment answers and evaluate backend-side
 * @route   POST /api/assessments/submit-mcq
 * @access  Private
 */
export const submitMCQAssessment = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { skill, difficulty = 'Intermediate', answers } = req.body;

    if (!skill || !answers || typeof answers !== 'object') {
      return res.status(400).json({
        success: false,
        message: 'Please provide skill and answers object (questionId -> selectedOptionIndex)'
      });
    }

    // 1. Enforce attempt limit: Maximum 3 attempts per 24 hours per skill
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const recentAttempts = await AssessmentAttempt.countDocuments({
      user: userId,
      skill: new RegExp(`^${skill.trim()}$`, 'i'),
      type: 'mcq',
      createdAt: { $gte: oneDayAgo }
    });

    if (recentAttempts >= 3) {
      return res.status(429).json({
        success: false,
        message: 'Daily attempt limit reached (maximum 3 attempts per 24 hours for this skill). Please try again later.'
      });
    }

    // 2. Fetch ground truth questions from MongoDB
    const questionIds = Object.keys(answers);
    const questions = await Assessment.find({
      _id: { $in: questionIds },
      type: 'mcq'
    });

    if (questions.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No valid assessment questions found for evaluation'
      });
    }

    // 3. Evaluate answers on backend
    let score = 0;
    const reviewDetails = [];

    for (const q of questions) {
      const selectedIndex = Number(answers[String(q._id)]);
      const isCorrect = selectedIndex === q.correctOptionIndex;
      if (isCorrect) {
        score++;
      }
      reviewDetails.push({
        questionId: q._id,
        question: q.question,
        selectedOption: selectedIndex,
        correctOption: q.correctOptionIndex,
        isCorrect,
        explanation: q.explanation
      });
    }

    const totalPossible = questions.length;
    const percentage = Math.round((score / totalPossible) * 100);
    const demonstratedLevel = calculateDemonstratedLevel(percentage);
    const passed = percentage >= 60; // 60% threshold for assessment pass

    let verificationStatusAwarded = 'SELF_DECLARED';
    if (percentage >= 60) {
      verificationStatusAwarded = 'ASSESSMENT_PASSED';
    }

    // 4. Save attempt in MongoDB
    const attempt = await AssessmentAttempt.create({
      user: userId,
      skill: skill.trim(),
      type: 'mcq',
      difficulty,
      score,
      totalPossible,
      percentage,
      passed,
      demonstratedLevel,
      verificationStatusAwarded,
      answers: reviewDetails
    });

    // 5. Update user profile verification record
    const user = await User.findById(userId);
    if (!user.skillVerifications) user.skillVerifications = [];

    const existingIndex = user.skillVerifications.findIndex(
      v => v.skill.toLowerCase() === skill.trim().toLowerCase()
    );

    const claimedProf = (user.proficiency && user.proficiency[skill]) || 'Intermediate';

    if (existingIndex >= 0) {
      const current = user.skillVerifications[existingIndex];
      // Only upgrade or keep highest status (never downgrade from SKILL_VERIFIED)
      if (current.status !== 'SKILL_VERIFIED') {
        current.status = verificationStatusAwarded;
      }
      current.score = Math.max(current.score || 0, percentage);
      current.demonstratedProficiency = demonstratedLevel;
      current.verifiedAt = new Date();
    } else {
      user.skillVerifications.push({
        skill: skill.trim(),
        status: verificationStatusAwarded,
        score: percentage,
        claimedProficiency: claimedProf,
        demonstratedProficiency: demonstratedLevel,
        verifiedAt: new Date()
      });
    }

    // If user passed at least one skill assessment, update user.verification flag
    if (passed) {
      user.verification = true;
    }

    await user.save();

    // 6. Create in-app notification
    await Notification.create({
      user: userId,
      type: 'verification',
      title: `Assessment Completed: ${skill}`,
      message: `You scored ${percentage}% (${score}/${totalPossible}) on your ${skill} assessment. Status: ${verificationStatusAwarded}.`,
      link: '/profile'
    });

    return res.status(200).json({
      success: true,
      score,
      totalPossible,
      percentage,
      demonstratedLevel,
      passed,
      verificationStatusAwarded,
      attemptId: attempt._id,
      reviewDetails
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Submit practical coding challenge for skill verification
 * @route   POST /api/assessments/submit-practical
 * @access  Private
 */
export const submitPracticalAssessment = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { questionId, code, language } = req.body;

    if (!questionId || !code) {
      return res.status(400).json({
        success: false,
        message: 'Please provide questionId and code submission'
      });
    }

    const question = await Assessment.findById(questionId);
    if (!question || question.type !== 'practical') {
      return res.status(404).json({
        success: false,
        message: 'Practical challenge not found'
      });
    }

    const lang = language || question.practicalDetails?.language || 'javascript';
    const testCases = question.practicalDetails?.testCases || [];

    // Evaluate in safe isolated runner
    const evaluation = await evaluateCode(lang, code, testCases);

    const passed = evaluation.percentage >= 80;
    const verificationStatusAwarded = passed ? 'SKILL_VERIFIED' : 'ASSESSMENT_PASSED';
    const demonstratedLevel = calculateDemonstratedLevel(evaluation.percentage);

    // Record attempt
    const attempt = await AssessmentAttempt.create({
      user: userId,
      skill: question.skill,
      type: 'practical',
      difficulty: question.difficulty,
      score: evaluation.score,
      totalPossible: evaluation.total,
      percentage: evaluation.percentage,
      passed,
      demonstratedLevel,
      verificationStatusAwarded,
      codeSubmission: code,
      practicalTestResults: evaluation.results
    });

    // Update user verification status
    const user = await User.findById(userId);
    if (!user.skillVerifications) user.skillVerifications = [];

    const existingIndex = user.skillVerifications.findIndex(
      v => v.skill.toLowerCase() === question.skill.toLowerCase()
    );

    if (existingIndex >= 0) {
      const current = user.skillVerifications[existingIndex];
      if (passed) {
        current.status = 'SKILL_VERIFIED';
        current.score = Math.max(current.score || 0, evaluation.percentage);
        current.demonstratedProficiency = demonstratedLevel;
        current.verifiedAt = new Date();
      }
    } else {
      user.skillVerifications.push({
        skill: question.skill,
        status: verificationStatusAwarded,
        score: evaluation.percentage,
        claimedProficiency: (user.proficiency && user.proficiency[question.skill]) || 'Intermediate',
        demonstratedProficiency: demonstratedLevel,
        verifiedAt: new Date()
      });
    }

    if (passed) {
      user.verification = true;
      // Award Verified Teacher badge if user has >= 2 verified skills
      const verifiedCount = user.skillVerifications.filter(v => v.status === 'SKILL_VERIFIED').length;
      if (verifiedCount >= 2 && !user.badges.includes('Verified Teacher')) {
        user.badges.push('Verified Teacher');
      }
    }

    await user.save();

    // Create notification
    await Notification.create({
      user: userId,
      type: 'verification',
      title: passed ? `Skill Verified: ${question.skill}! 🎉` : `Practical Challenge Submitted: ${question.skill}`,
      message: passed
        ? `Congratulations! You passed all test cases for ${question.skill} and unlocked the Skill Verified badge!`
        : `You completed ${evaluation.score}/${evaluation.total} test cases. Keep practicing to reach 80%+!`,
      link: '/profile'
    });

    return res.status(200).json({
      success: true,
      evaluation,
      passed,
      demonstratedLevel,
      verificationStatusAwarded,
      attemptId: attempt._id
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get user's past assessment attempts
 * @route   GET /api/assessments/history
 * @access  Private
 */
export const getUserAssessmentHistory = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const history = await AssessmentAttempt.find({ user: userId })
      .select('-answers.correctOption -answers.explanation -codeSubmission')
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: history.length,
      history
    });
  } catch (error) {
    next(error);
  }
};
