/**
 * Authentication Controller
 * Handles user login, registration, and authentication-related operations
 */

const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { logAuditTrail } = require('../utils/logger');
const { AUDIT_ACTIONS, USER_ROLES } = require('../config/constants');

/**
 * Generate JWT token for user
 */
const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '7d',
  });
};

/**
 * User Registration
 * Creates a new user account in the system
 */
const register = async (req, res) => {
  try {
    const { fullName, email, password, department, role } = req.body;

    // Validate required fields
    if (!fullName || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide full name, email, and password.',
      });
    }

    // Check if user already exists
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({
        success: false,
        message: 'Email already registered. Please login instead.',
      });
    }

    // Create new user
    user = new User({
      fullName,
      email,
      password,
      department,
      role: role || USER_ROLES.VIEWER,
    });

    // Save user to database
    await user.save();

    // Log the registration action
    await logAuditTrail(user._id, AUDIT_ACTIONS.CREATE, 'USER', user._id, {
      description: 'User registered successfully',
    });

    // Generate token
    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      message: 'User registered successfully!',
      token,
      user: user.toJSON(),
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error during registration: ' + error.message,
    });
  }
};

/**
 * User Login
 * Authenticates user and returns JWT token
 */
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate required fields
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password.',
      });
    }

    // Find user by email (include password field for comparison)
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials. Please check your email and password.',
      });
    }

    // Check if account is active
    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: 'Your account has been deactivated. Contact administrator.',
      });
    }

    // Compare password
    const isPasswordMatch = await user.matchPassword(password);
    if (!isPasswordMatch) {
      // Log failed login attempt
      await logAuditTrail(user._id, AUDIT_ACTIONS.LOGIN, 'USER', user._id, {
        status: 'FAILED',
        description: 'Failed login attempt',
      });

      return res.status(401).json({
        success: false,
        message: 'Invalid credentials. Please check your password.',
      });
    }

    // Update last login time
    user.lastLogin = new Date();
    await user.save();

    // Log successful login
    await logAuditTrail(user._id, AUDIT_ACTIONS.LOGIN, 'USER', user._id, {
      description: 'User logged in successfully',
    });

    // Generate token
    const token = generateToken(user._id);

    res.status(200).json({
      success: true,
      message: 'Login successful!',
      token,
      user: user.toJSON(),
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error during login: ' + error.message,
    });
  }
};

/**
 * Get Current User Profile
 * Returns authenticated user's information
 */
const getCurrentUser = async (req, res) => {
  try {
    res.status(200).json({
      success: true,
      user: req.user.toJSON(),
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching user: ' + error.message,
    });
  }
};

/**
 * User Logout
 * Logs out the current user (client-side token removal)
 */
const logout = async (req, res) => {
  try {
    // Log logout action
    await logAuditTrail(req.user._id, AUDIT_ACTIONS.LOGOUT, 'USER', req.user._id, {
      description: 'User logged out',
    });

    res.status(200).json({
      success: true,
      message: 'Logged out successfully!',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error during logout: ' + error.message,
    });
  }
};

/**
 * Delete User
 * Allows admin to delete a user account
 */
const deleteUser = async (req, res) => {
  try {
    const { userId } = req.params;

    // Validate userId parameter
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'User ID is required.',
      });
    }

    // Prevent admin from deleting themselves
    if (req.user._id.toString() === userId) {
      return res.status(400).json({
        success: false,
        message: 'You cannot delete your own account.',
      });
    }

    // Find and delete user
    const user = await User.findByIdAndDelete(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found.',
      });
    }

    // Log the user deletion action
    await logAuditTrail(req.user._id, AUDIT_ACTIONS.DELETE, 'USER', userId, {
      description: `User ${user.fullName} (${user.email}) deleted by admin`,
      deletedUser: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
      },
    });

    res.status(200).json({
      success: true,
      message: `User ${user.fullName} has been successfully deleted.`,
      deletedUser: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting user: ' + error.message,
    });
  }
};

module.exports = {
  register,
  login,
  getCurrentUser,
  logout,
  deleteUser,
};
