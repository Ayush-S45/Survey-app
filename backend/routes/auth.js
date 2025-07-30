const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const { auth } = require('../middleware/auth');

const router = express.Router();

// @route   POST /api/auth/register
// @desc    Register a new user
// @access  Public (for initial setup, then should be restricted)
router.post('/register', [
  body('firstName').notEmpty().withMessage('First name is required'),
  body('lastName').notEmpty().withMessage('Last name is required'),
  body('email').isEmail().withMessage('Please enter a valid email'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('employeeId').notEmpty().withMessage('Employee ID is required'),
  body('position').notEmpty().withMessage('Position is required'),
  body('role').isIn(['employee', 'manager', 'hr', 'admin']).withMessage('Invalid role')
], async (req, res) => {
  try {
    // Demo mode fallback
    if (process.env.DEMO_MODE === 'true') {
      return res.json({
        token: 'demo-token-' + Date.now(),
        user: {
          id: 'demo-' + Date.now(),
          firstName: req.body.firstName,
          lastName: req.body.lastName,
          email: req.body.email,
          role: req.body.role || 'employee',
          employeeId: req.body.employeeId,
          position: req.body.position
        }
      });
    }

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { firstName, lastName, email, password, employeeId, position, role, department } = req.body;

    // Check if user already exists
    let user = await User.findOne({ $or: [{ email }, { employeeId }] });
    if (user) {
      return res.status(400).json({ message: 'User already exists' });
    }

    user = new User({
      firstName,
      lastName,
      email,
      password,
      employeeId,
      position,
      role,
      department
    });

    await user.save();

    const payload = {
      userId: user._id,
      role: user.role
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET || 'your-secret-key-change-in-production', {
      expiresIn: '7d'
    });

    res.json({
      token,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        employeeId: user.employeeId,
        position: user.position,
        department: user.department
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/auth/login
// @desc    Authenticate user & get token
// @access  Public
router.post('/login', [
  body('email').isEmail().withMessage('Please enter a valid email'),
  body('password').exists().withMessage('Password is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    const user = await User.findOne({ email }).populate('department');
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    if (!user.isActive) {
      return res.status(400).json({ message: 'Account is deactivated' });
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    const payload = {
      userId: user._id,
      role: user.role
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET || 'your-secret-key-change-in-production', {
      expiresIn: '7d'
    });

    res.json({
      token,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        employeeId: user.employeeId,
        position: user.position,
        department: user.department,
        manager: user.manager
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/auth/me
// @desc    Get current user
// @access  Private
router.get('/me', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .select('-password')
      .populate('department')
      .populate('manager', 'firstName lastName email');
    
    res.json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/auth/change-password
// @desc    Change user password
// @access  Private
router.post('/change-password', [
  auth,
  body('currentPassword').notEmpty().withMessage('Current password is required'),
  body('newPassword').isLength({ min: 6 }).withMessage('New password must be at least 6 characters')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user.id);

    // Check current password
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Current password is incorrect' });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    await user.save();

    res.json({ message: 'Password changed successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/auth/create-demo-user
// @desc    Create demo user for testing
// @access  Public (for demo purposes)
router.post('/create-demo-user', async (req, res) => {
  try {
    // Check if demo user already exists
    let user = await User.findOne({ email: 'user@gmail.com' });
    if (user) {
      return res.json({ message: 'Demo user already exists' });
    }

    // Create demo user
    user = new User({
      firstName: 'Demo',
      lastName: 'User',
      email: 'user@gmail.com',
      password: '123456',
      employeeId: 'EMP001',
      position: 'Software Developer',
      role: 'employee',
      isActive: true
    });

    await user.save();
    res.json({ message: 'Demo user created successfully' });
  } catch (error) {
    console.error('Error creating demo user:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router; 
