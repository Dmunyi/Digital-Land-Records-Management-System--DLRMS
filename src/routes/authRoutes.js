/**
 * Authentication Routes
 * Routes for user login, registration, and authentication operations
 */

const express = require('express');
const router = express.Router();
const { register, login, getCurrentUser, logout, deleteUser } = require('../controllers/authController');
const { authMiddleware, authorize } = require('../middleware/auth');
const { USER_ROLES } = require('../config/constants');

// Public routes
router.post('/register', register);
router.post('/login', login);

// Protected routes (require authentication)
router.get('/me', authMiddleware, getCurrentUser);
router.post('/logout', authMiddleware, logout);

// Admin-only routes
router.delete('/:userId', authMiddleware, authorize([USER_ROLES.ADMIN]), deleteUser);

module.exports = router;
