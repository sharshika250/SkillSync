import User from '../models/User.js';

/**
 * @desc    Register a new user
 * @route   POST /api/auth/register
 * @access  Public
 */
export const registerUser = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    // 1. Validate required fields
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields: name, email, and password'
      });
    }

    const trimmedName = name.trim();
    const trimmedEmail = email.trim().toLowerCase();

    if (!trimmedName) {
      return res.status(400).json({
        success: false,
        message: 'Name cannot be empty'
      });
    }

    // Basic email format validation
    const emailRegex = /^\S+@\S+\.\S+$/;
    if (!emailRegex.test(trimmedEmail)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid email address'
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long'
      });
    }

    // 2. Check if user already exists
    const userExists = await User.findOne({ email: trimmedEmail });
    if (userExists) {
      return res.status(409).json({
        success: false,
        message: 'A user with this email address is already registered'
      });
    }

    // 3. Create the user in MongoDB (password hashing happens in User schema pre-save hook)
    const user = await User.create({
      name: trimmedName,
      email: trimmedEmail,
      password: password
    });

    // 4. Return safe JSON response (password and hash are omitted)
    return res.status(201).json({
      success: true,
      message: 'User registered successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role || 'Student',
        location: user.location || '',
        bio: user.bio,
        skillsOffered: user.skillsOffered,
        skillsWanted: user.skillsWanted,
        proficiency: user.proficiency,
        availability: user.availability,
        verification: user.verification,
        trustScore: user.trustScore,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      }
    });
  } catch (error) {
    // Handle duplicate key error from MongoDB if race condition occurs
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: 'A user with this email address is already registered'
      });
    }
    next(error);
  }
};
/**
 * @desc    Login an existing user
 * @route   POST /api/auth/login
 * @access  Public
 */
export const loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password'
      });
    }

    const trimmedEmail = email.trim().toLowerCase();

    const user = await User.findOne({ email: trimmedEmail });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    const passwordMatches = await user.matchPassword(password);

    if (!passwordMatches) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Login successful',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role || 'Student',
        location: user.location || '',
        bio: user.bio,
        skillsOffered: user.skillsOffered,
        skillsWanted: user.skillsWanted,
        proficiency: user.proficiency,
        availability: user.availability,
        verification: user.verification,
        trustScore: user.trustScore,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      }
    });
  } catch (error) {
    next(error);
  }
};