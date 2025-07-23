const express = require('express');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const Department = require('../models/Department');
const { auth, authorize } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/users
// @desc    Get all users (filtered by role and department)
// @access  Private (HR, Admin, Manager)
router.get('/', [auth, authorize('hr', 'admin', 'manager')], async (req, res) => {
  try {
    const { role, department, isActive, page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    let query = {};

    // Filter by role
    if (role) {
      query.role = role;
    }

    // Filter by department
    if (department) {
      query.department = department;
    }

    // Filter by active status
    if (isActive !== undefined) {
      query.isActive = isActive === 'true';
    }

    // If user is manager, only show their department's employees
    if (req.user.role === 'manager') {
      query.department = req.user.department;
      query.role = { $in: ['employee', 'manager'] };
    }

    const users = await User.find(query)
      .select('-password')
      .populate('department', 'name')
      .populate('manager', 'firstName lastName email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await User.countDocuments(query);

    res.json({
      users,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/users/:id
// @desc    Get user by ID
// @access  Private (HR, Admin, Manager, Self)
router.get('/:id', auth, async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select('-password')
      .populate('department', 'name')
      .populate('manager', 'firstName lastName email');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if user can access this profile
    if (req.user.role === 'employee' && req.user.id !== req.params.id) {
      return res.status(403).json({ message: 'Not authorized to view this profile' });
    }

    if (req.user.role === 'manager' && user.department?.toString() !== req.user.department?.toString()) {
      return res.status(403).json({ message: 'Not authorized to view this profile' });
    }

    res.json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/users
// @desc    Create a new user
// @access  Private (HR, Admin)
router.post('/', [
  auth,
  authorize('hr', 'admin'),
  body('firstName').notEmpty().withMessage('First name is required'),
  body('lastName').notEmpty().withMessage('Last name is required'),
  body('email').isEmail().withMessage('Please enter a valid email'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('employeeId').notEmpty().withMessage('Employee ID is required'),
  body('position').notEmpty().withMessage('Position is required'),
  body('role').isIn(['employee', 'manager', 'hr', 'admin']).withMessage('Invalid role')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { firstName, lastName, email, password, employeeId, position, role, department, manager } = req.body;

    // Only admin can create admin/hr users
    if ((role === 'admin' || role === 'hr') && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Only admin can create admin or HR users' });
    }

    // Check if user already exists
    let user = await User.findOne({ $or: [{ email }, { employeeId }] });
    if (user) {
      if (user.email === email) {
        return res.status(400).json({ message: 'Email already exists' });
      }
      if (user.employeeId === employeeId) {
        return res.status(400).json({ message: 'Employee ID already exists' });
      }
    }

    // Validate department exists
    if (department) {
      const dept = await Department.findById(department);
      if (!dept) {
        return res.status(400).json({ message: 'Department not found' });
      }
    }

    // Validate manager exists and is actually a manager
    if (manager) {
      const managerUser = await User.findById(manager);
      if (!managerUser) {
        return res.status(400).json({ message: 'Manager not found' });
      }
      if (!['manager', 'admin'].includes(managerUser.role)) {
        return res.status(400).json({ message: 'Selected user is not a manager' });
      }
    }

    user = new User({
      firstName,
      lastName,
      email,
      password,
      employeeId,
      position,
      role,
      department,
      manager,
      isActive: req.body.isActive !== undefined ? req.body.isActive : true
    });

    await user.save();

    const newUser = await User.findById(user._id)
      .select('-password')
      .populate('department', 'name')
      .populate('manager', 'firstName lastName email');

    res.status(201).json(newUser);
  } catch (error) {
    console.error(error);
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      return res.status(400).json({ message: `${field} already exists` });
    }
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/users/:id
// @desc    Update user
// @access  Private (HR, Admin, Self for basic info)
router.put('/:id', [
  auth,
  body('firstName').notEmpty().withMessage('First name is required'),
  body('lastName').notEmpty().withMessage('Last name is required'),
  body('email').isEmail().withMessage('Please enter a valid email')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check permissions
    if (req.user.role === 'employee' && req.user.id !== req.params.id) {
      return res.status(403).json({ message: 'Not authorized to update this profile' });
    }

    if (req.user.role === 'manager' && user.department?.toString() !== req.user.department?.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this profile' });
    }

    // Only HR/Admin can change role, department, manager
    if (req.user.role === 'employee' && (req.body.role || req.body.department || req.body.manager)) {
      return res.status(403).json({ message: 'Not authorized to change role, department, or manager' });
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    )
    .select('-password')
    .populate('department', 'name')
    .populate('manager', 'firstName lastName email');

    res.json(updatedUser);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/users/:id
// @desc    Deactivate user
// @access  Private (HR, Admin)
router.delete('/:id', [auth, authorize('hr', 'admin')], async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Don't allow deactivating admin users
    if (user.role === 'admin') {
      return res.status(400).json({ message: 'Cannot deactivate admin users' });
    }

    user.isActive = false;
    await user.save();

    res.json({ message: 'User deactivated successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/users/departments/:departmentId
// @desc    Get users by department
// @access  Private (HR, Admin, Manager)
router.get('/departments/:departmentId', [auth, authorize('hr', 'admin', 'manager')], async (req, res) => {
  try {
    const { departmentId } = req.params;

    // Check if manager can access this department
    if (req.user.role === 'manager' && req.user.department?.toString() !== departmentId) {
      return res.status(403).json({ message: 'Not authorized to view this department' });
    }

    const users = await User.find({ department: departmentId, isActive: true })
      .select('-password')
      .populate('manager', 'firstName lastName email')
      .sort({ firstName: 1, lastName: 1 });

    res.json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Add this route to get recipients (admin, hr, managers)
router.get('/recipients', auth, async (req, res) => {
  try {
    const recipients = await User.find({
      role: { $in: ['admin', 'hr', 'manager'] },
      isActive: true
    }).select('firstName lastName role');
    
    res.json(recipients);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router; 
