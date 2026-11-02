import mongoose from 'mongoose';
import User from '../models/User.js';
import { calculateMatchScore, calculateDetailedMatchScore } from '../services/matchingService.js';

// Category mapping helper
const CATEGORY_MAP = {
  programming: ['python', 'java', 'c++', 'c#', 'golang', 'rust', 'c', 'backend'],
  web: ['react', 'javascript', 'html', 'css', 'node.js', 'vue', 'angular', 'next.js', 'frontend'],
  design: ['ui/ux', 'ui/ux design', 'figma', 'adobe xd', 'photoshop', 'illustrator', 'design'],
  datascience: ['data science', 'machine learning', 'ai', 'pandas', 'numpy', 'sql', 'deep learning'],
  business: ['project management', 'marketing', 'finance', 'entrepreneurship', 'public speaking', 'business'],
  communication: ['english', 'spanish', 'communication', 'writing', 'presentation']
};

/**
 * @desc    Get all users (excluding current user if authenticated)
 * @route   GET /api/users
 * @access  Public / Optional Auth
 */
export const getAllUsers = async (req, res, next) => {
  try {
    const { search, skill, offeredSkill, wantedSkill, category, verifiedOnly, sortBy } = req.query;
    const filter = {};

    // Exclude currently logged in user if available
    if (req.user?._id) {
      filter._id = { $ne: req.user._id };
    }

    // Exclude suspended accounts from public search
    filter.isSuspended = { $ne: true };

    // Verified only filter
    if (verifiedOnly === 'true' || verifiedOnly === true) {
      filter.verification = true;
    }

    // Keyword search across name, role, bio, and skills
    if (search && search.trim()) {
      const searchRegex = new RegExp(search.trim(), 'i');
      filter.$or = [
        { name: searchRegex },
        { role: searchRegex },
        { bio: searchRegex },
        { skillsOffered: searchRegex },
        { skillsWanted: searchRegex }
      ];
    }

    // Specific skill filters
    if (skill && skill.trim()) {
      const skillRegex = new RegExp(skill.trim(), 'i');
      filter.$or = [
        { skillsOffered: skillRegex },
        { skillsWanted: skillRegex }
      ];
    }

    if (offeredSkill && offeredSkill.trim()) {
      filter.skillsOffered = new RegExp(offeredSkill.trim(), 'i');
    }

    if (wantedSkill && wantedSkill.trim()) {
      filter.skillsWanted = new RegExp(wantedSkill.trim(), 'i');
    }

    // Category filter
    if (category && category !== 'All') {
      const catKey = category.toLowerCase().replace(/[^a-z]/g, '');
      const keywords = CATEGORY_MAP[catKey] || [category.toLowerCase()];
      const catRegexList = keywords.map(kw => new RegExp(kw, 'i'));
      filter.$or = [
        { skillsOffered: { $in: catRegexList } },
        { skillsWanted: { $in: catRegexList } }
      ];
    }

    const rawUsers = await User.find(filter)
      .select('-password')
      .sort({ createdAt: -1 });

    // Format safe response and calculate match score if current user is logged in
    const users = rawUsers.map(user => {
      const userObj = user.toJSON();
      let matchScore = 0;
      let matchDetails = null;

      if (req.user) {
        const detailed = calculateDetailedMatchScore(req.user, user);
        matchScore = detailed.score;
        matchDetails = {
          factors: detailed.factors,
          explanations: detailed.explanations,
          isReciprocal: detailed.isReciprocal
        };
      }
      return {
        ...userObj,
        matchScore,
        matchDetails
      };
    });

    // Sorting
    if (sortBy === 'recent') {
      users.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    } else if (sortBy === 'rating') {
      users.sort((a, b) => (b.trustScore || 0) - (a.trustScore || 0));
    } else if (req.user) {
      users.sort((a, b) => b.matchScore - a.matchScore);
    }

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
 * @desc    Get single user by ID
 * @route   GET /api/users/:id
 * @access  Public / Optional Auth
 */
export const getUserById = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid user ID format'
      });
    }

    const user = await User.findById(id).select('-password');
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const userObj = user.toJSON();
    let matchScore = 0;
    let matchDetails = null;

    if (req.user) {
      const detailed = calculateDetailedMatchScore(req.user, user);
      matchScore = detailed.score;
      matchDetails = {
        factors: detailed.factors,
        explanations: detailed.explanations,
        isReciprocal: detailed.isReciprocal
      };
    }

    return res.status(200).json({
      success: true,
      user: {
        ...userObj,
        matchScore,
        matchDetails
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get current user profile
 * @route   GET /api/users/profile
 * @access  Private (requires authentication)
 */
export const getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User profile not found'
      });
    }

    return res.status(200).json({
      success: true,
      user: user.toJSON()
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update current user profile
 * @route   PUT /api/users/profile
 * @access  Private (requires authentication)
 */
export const updateProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const {
      name,
      bio,
      role,
      location,
      skillsOffered,
      skillsWanted,
      proficiency,
      availability,
      avatar,
      portfolioLinks,
      certificates,
      teachingExperience
    } = req.body;

    if (name !== undefined) {
      if (!name.trim()) {
        return res.status(400).json({
          success: false,
          message: 'Name cannot be empty'
        });
      }
      user.name = name.trim();
    }

    if (bio !== undefined) {
      user.bio = typeof bio === 'string' ? bio.trim() : '';
    }

    if (role !== undefined) {
      // Disallow setting 'Admin' via profile update unless user is already admin
      const requestedRole = typeof role === 'string' ? role.trim() : 'Student';
      if (requestedRole.toLowerCase() === 'admin' && !user.isAdmin) {
        user.role = 'Student';
      } else {
        user.role = requestedRole;
      }
    }

    if (location !== undefined) {
      user.location = typeof location === 'string' ? location.trim() : '';
    }

    if (avatar !== undefined) {
      user.avatar = typeof avatar === 'string' ? avatar.trim() : '';
    }

    if (portfolioLinks && typeof portfolioLinks === 'object') {
      user.portfolioLinks = {
        github: portfolioLinks.github || '',
        linkedin: portfolioLinks.linkedin || '',
        website: portfolioLinks.website || ''
      };
    }

    if (Array.isArray(certificates)) {
      user.certificates = certificates.filter(c => c && c.title);
    }

    if (teachingExperience !== undefined) {
      user.teachingExperience = typeof teachingExperience === 'string' ? teachingExperience.trim() : '';
    }

    if (skillsOffered !== undefined) {
      if (Array.isArray(skillsOffered)) {
        user.skillsOffered = skillsOffered
          .map(s => (typeof s === 'string' ? s.trim() : ''))
          .filter(Boolean);

        // Ensure new offered skills have a corresponding entry in skillVerifications if missing
        if (!user.skillVerifications) user.skillVerifications = [];
        for (const s of user.skillsOffered) {
          const exists = user.skillVerifications.some(v => v.skill.toLowerCase() === s.toLowerCase());
          if (!exists) {
            user.skillVerifications.push({
              skill: s,
              status: 'SELF_DECLARED',
              score: 0,
              claimedProficiency: (user.proficiency && user.proficiency[s]) || 'Intermediate',
              demonstratedProficiency: 'Not Demonstrated',
              verifiedAt: new Date()
            });
          }
        }
      }
    }

    if (skillsWanted !== undefined) {
      if (Array.isArray(skillsWanted)) {
        user.skillsWanted = skillsWanted
          .map(s => (typeof s === 'string' ? s.trim() : ''))
          .filter(Boolean);
      }
    }

    if (proficiency !== undefined) {
      user.proficiency = proficiency;
      user.markModified('proficiency');
    }

    if (availability !== undefined) {
      user.availability = typeof availability === 'string' ? availability.trim() : '';
    }

    const updatedUser = await user.save();

    return res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      user: updatedUser.toJSON()
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete account (self-service account deletion)
 * @route   DELETE /api/users/profile
 * @access  Private
 */
export const deleteAccount = async (req, res, next) => {
  try {
    const userId = req.user._id;
    await User.findByIdAndDelete(userId);
    return res.status(200).json({
      success: true,
      message: 'Account deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};
