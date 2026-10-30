const express = require('express');
const {
  registerStudent,
  login,
  logout,
  getMe,
  updateProfile,
  changePassword
} = require('../controllers/auth.controller');
const authenticate = require('../middleware/auth.middleware');
const { authLimiter } = require('../middleware/rateLimiter.middleware');

const router = express.Router();

/**
 * @route   POST /api/v1/auth/register
 * @desc    Register a new student account
 * @access  Public
 */
router.post('/register', authLimiter, registerStudent);

/**
 * @route   POST /api/v1/auth/login
 * @desc    Authenticate user and set HTTP-only cookie
 * @access  Public
 */
router.post('/login', authLimiter, login);

/**
 * @route   POST /api/v1/auth/logout
 * @desc    Sign out user and clear auth cookies
 * @access  Public
 */
router.post('/logout', logout);

/**
 * @route   GET /api/v1/auth/me
 * @desc    Get profile of currently authenticated user
 * @access  Private
 */
router.get('/me', authenticate, getMe);

/**
 * @route   PUT /api/v1/auth/profile
 * @desc    Update authenticated user profile
 * @access  Private
 */
router.put('/profile', authenticate, updateProfile);

/**
 * @route   PUT /api/v1/auth/change-password
 * @desc    Change authenticated user password
 * @access  Private
 */
router.put('/change-password', authenticate, changePassword);

module.exports = router;
