import mongoose from 'mongoose';
import User from '../models/User.js';
import { calculateMatchScore } from '../services/matchingService.js';

/**
 * @desc    Get all users (excluding current user if authenticated)
 * @route   GET /api/users
 * @access  Public / Optional Auth
 */
export const getAllUsers = async (req, res, next) => {
  try {
    const { search, skill, offeredSkill, wantedSkill } = req.query;
    const filter = {};

    // Exclude currently logged in user if available
    if (req.user?._id) {
      filter._id = { $ne: req.user._id };
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

    const rawUsers = await User.find(filter)
      .select('-password')
      .sort({ createdAt: -1 });

    // Format safe response and calculate match score if current user is logged in
    const users = rawUsers.map(user => {
      const userObj = user.toJSON();
      let matchScore = 0;
      if (req.user) {
        matchScore = calculateMatchScore(req.user, user);
      }
      return {
        ...userObj,
        matchScore
      };
    });

    // If current user is logged in, sort by matchScore descending, then trustScore
    if (req.user) {
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
    if (req.user) {
      matchScore = calculateMatchScore(req.user, user);
    }

    return res.status(200).json({
      success: true,
      user: {
        ...userObj,
        matchScore
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
      availability
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
      user.role = typeof role === 'string' ? role.trim() : 'Student';
    }

    if (location !== undefined) {
      user.location = typeof location === 'string' ? location.trim() : '';
    }

    if (skillsOffered !== undefined) {
      if (Array.isArray(skillsOffered)) {
        user.skillsOffered = skillsOffered
          .map(s => (typeof s === 'string' ? s.trim() : ''))
          .filter(Boolean);
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
