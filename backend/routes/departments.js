const express = require('express');
const { body, validationResult } = require('express-validator');
const Department = require('../models/Department');
const User = require('../models/User');
const { auth, authorize } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/departments
// @desc    Get all departments
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const { isActive } = req.query;
    let query = {};

    if (isActive !== undefined) {
      query.isActive = isActive === 'true';
    }

    const departments = await Department.find(query)
      .populate('head', 'firstName lastName email')
      .sort({ name: 1 });

    res.json(departments);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/departments/:id
// @desc    Get department by ID
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    const department = await Department.findById(req.params.id)
      .populate('head', 'firstName lastName email');

    if (!department) {
      return res.status(404).json({ message: 'Department not found' });
    }

    // Get department statistics
    const employeeCount = await User.countDocuments({ 
      department: department._id, 
      isActive: true 
    });

    const managerCount = await User.countDocuments({ 
      department: department._id, 
      role: 'manager',
      isActive: true 
    });

    res.json({
      ...department.toObject(),
      stats: {
        employeeCount,
        managerCount
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/departments
// @desc    Create a new department
// @access  Private (HR, Admin)
router.post('/', [
  auth,
  authorize('hr', 'admin'),
  body('name').notEmpty().withMessage('Department name is required'),
  body('description').optional().isString().withMessage('Description must be a string')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, description, head, color } = req.body;

    // Check if department already exists
    const existingDept = await Department.findOne({ name });
    if (existingDept) {
      return res.status(400).json({ message: 'Department already exists' });
    }

    // Validate head if provided
    if (head) {
      const headUser = await User.findById(head);
      if (!headUser) {
        return res.status(400).json({ message: 'Department head not found' });
      }
    }

    const department = new Department({
      name,
      description,
      head,
      color
    });

    await department.save();

    const newDepartment = await Department.findById(department._id)
      .populate('head', 'firstName lastName email');

    res.status(201).json(newDepartment);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/departments/:id
// @desc    Update department
// @access  Private (HR, Admin)
router.put('/:id', [
  auth,
  authorize('hr', 'admin'),
  body('name').notEmpty().withMessage('Department name is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const department = await Department.findById(req.params.id);
    if (!department) {
      return res.status(404).json({ message: 'Department not found' });
    }

    const { name, description, head, color, isActive } = req.body;

    // Check if name is being changed and if it already exists
    if (name !== department.name) {
      const existingDept = await Department.findOne({ name });
      if (existingDept) {
        return res.status(400).json({ message: 'Department name already exists' });
      }
    }

    // Validate head if provided
    if (head) {
      const headUser = await User.findById(head);
      if (!headUser) {
        return res.status(400).json({ message: 'Department head not found' });
      }
    }

    const updatedDepartment = await Department.findByIdAndUpdate(
      req.params.id,
      { name, description, head, color, isActive },
      { new: true, runValidators: true }
    ).populate('head', 'firstName lastName email');

    res.json(updatedDepartment);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/departments/:id
// @desc    Deactivate department
// @access  Private (HR, Admin)
router.delete('/:id', [auth, authorize('hr', 'admin')], async (req, res) => {
  try {
    const department = await Department.findById(req.params.id);
    if (!department) {
      return res.status(404).json({ message: 'Department not found' });
    }

    // Check if department has active employees
    const employeeCount = await User.countDocuments({ 
      department: department._id, 
      isActive: true 
    });

    if (employeeCount > 0) {
      return res.status(400).json({ 
        message: `Cannot deactivate department with ${employeeCount} active employees` 
      });
    }

    department.isActive = false;
    await department.save();

    res.json({ message: 'Department deactivated successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/departments/:id/employees
// @desc    Get employees in a department
// @access  Private (HR, Admin, Manager)
router.get('/:id/employees', [auth, authorize('hr', 'admin', 'manager')], async (req, res) => {
  try {
    const { departmentId } = req.params;

    // Check if manager can access this department
    if (req.user.role === 'manager' && req.user.department?.toString() !== departmentId) {
      return res.status(403).json({ message: 'Not authorized to view this department' });
    }

    const employees = await User.find({ 
      department: departmentId, 
      isActive: true 
    })
    .select('-password')
    .populate('manager', 'firstName lastName email')
    .sort({ firstName: 1, lastName: 1 });

    res.json(employees);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/departments/stats/overview
// @desc    Get department statistics overview
// @access  Private (HR, Admin)
router.get('/stats/overview', [auth, authorize('hr', 'admin')], async (req, res) => {
  try {
    const departments = await Department.find({ isActive: true });
    
    const stats = await Promise.all(
      departments.map(async (dept) => {
        const employeeCount = await User.countDocuments({ 
          department: dept._id, 
          isActive: true 
        });

        const managerCount = await User.countDocuments({ 
          department: dept._id, 
          role: 'manager',
          isActive: true 
        });

        return {
          department: dept.name,
          employeeCount,
          managerCount,
          color: dept.color
        };
      })
    );

    const totalEmployees = stats.reduce((sum, stat) => sum + stat.employeeCount, 0);
    const totalManagers = stats.reduce((sum, stat) => sum + stat.managerCount, 0);

    res.json({
      departments: stats,
      totals: {
        employees: totalEmployees,
        managers: totalManagers,
        departments: departments.length
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router; 