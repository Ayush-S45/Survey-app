const express = require('express');
const router = express.Router();
const Complaint = require('../models/Complaint');
const User = require('../models/User');
const { auth, authorize } = require('../middleware/auth');

// @route   GET /api/complaints
// @desc    Get complaints based on user role (received/assigned)
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    let query = {};
    
    // If user is HR/Admin, they can see all complaints
    if (req.user.role === 'hr' || req.user.role === 'admin') {
      // No additional query filters
    } 
    // If user is manager, they can see complaints assigned to them or their department
    else if (req.user.role === 'manager') {
      query.$or = [
        { assignedTo: req.user.id },
        { submittedBy: { $in: await User.find({ department: req.user.department }).select('_id') } }
      ];
    }
    // If user is employee, they can only see their own complaints
    else {
      query.submittedBy = req.user.id;
    }

    const complaints = await Complaint.find(query)
      .populate('submittedBy', 'firstName lastName email')
      .populate('assignedTo', 'firstName lastName')
      .populate('resolvedBy', 'firstName lastName')
      .sort({ createdAt: -1 });
    
    res.json(complaints);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/complaints/sent
// @desc    Get complaints submitted by the current user
// @access  Private
router.get('/sent', auth, async (req, res) => {
  try {
    const complaints = await Complaint.find({ submittedBy: req.user.id })
      .populate('submittedBy', 'firstName lastName email')
      .populate('assignedTo', 'firstName lastName')
      .populate('resolvedBy', 'firstName lastName')
      .sort({ createdAt: -1 });
    
    res.json(complaints);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/complaints
// @desc    Submit new complaint
// @access  Private
router.post('/', auth, async (req, res) => {
  try {
    const { title, description, category, priority, isAnonymous, assignedTo, content } = req.body;

    const complaint = new Complaint({
      title,
      description,
      category,
      priority,
      submittedBy: req.user.id,
      isAnonymous,
      assignedTo: assignedTo || undefined
    });

    await complaint.save();
    
    // If assignedTo is provided, also create a message to notify the assigned person
    if (assignedTo) {
      const Message = require('../models/Message');
      const message = new Message({
        sender: req.user.id,
        recipient: assignedTo,
        content: content || `New complaint assigned: ${title}`,
        type: 'complaint',
        status: 'sent',
        complaintId: complaint._id
      });
      await message.save();
    }

    const populatedComplaint = await Complaint.findById(complaint._id)
      .populate('submittedBy', 'firstName lastName email')
      .populate('assignedTo', 'firstName lastName')
      .populate('resolvedBy', 'firstName lastName');

    res.status(201).json(populatedComplaint);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/complaints/:id/assign
// @desc    Assign complaint to a specific person (HR/Admin only)
// @access  Private
router.put('/:id/assign', [auth, authorize('hr', 'admin')], async (req, res) => {
  try {
    const { assignedTo } = req.body;

    // Validate that assignedTo user exists and is a manager or HR
    const assignedUser = await User.findById(assignedTo);
    if (!assignedUser) {
      return res.status(400).json({ message: 'Assigned user not found' });
    }

    if (!['manager', 'hr', 'admin'].includes(assignedUser.role)) {
      return res.status(400).json({ message: 'Can only assign complaints to managers, HR, or admins' });
    }

    const complaint = await Complaint.findByIdAndUpdate(
      req.params.id,
      { 
        assignedTo,
        status: 'investigating'
      },
      { new: true }
    )
    .populate('submittedBy', 'firstName lastName email')
    .populate('assignedTo', 'firstName lastName')
    .populate('resolvedBy', 'firstName lastName');

    if (!complaint) {
      return res.status(404).json({ message: 'Complaint not found' });
    }

    res.json(complaint);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/complaints/:id/resolve
// @desc    Resolve a complaint (HR/Admin/Assigned person only)
// @access  Private
router.put('/:id/resolve', auth, async (req, res) => {
  try {
    const { resolution } = req.body;

    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) {
      return res.status(404).json({ message: 'Complaint not found' });
    }

    // Check if user can resolve this complaint
    const canResolve = req.user.role === 'hr' || 
                      req.user.role === 'admin' || 
                      complaint.assignedTo?.toString() === req.user.id;

    if (!canResolve) {
      return res.status(403).json({ message: 'Not authorized to resolve this complaint' });
    }

    const updatedComplaint = await Complaint.findByIdAndUpdate(
      req.params.id,
      { 
        resolution,
        status: 'resolved',
        resolvedBy: req.user.id,
        resolvedAt: new Date()
      },
      { new: true }
    )
    .populate('submittedBy', 'firstName lastName email')
    .populate('assignedTo', 'firstName lastName')
    .populate('resolvedBy', 'firstName lastName');

    res.json(updatedComplaint);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/complaints/:id
// @desc    Delete a complaint (only by submitter or HR/Admin)
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    const complaint = await Complaint.findById(req.params.id);
    
    if (!complaint) {
      return res.status(404).json({ message: 'Complaint not found' });
    }

    // Check if user can delete this complaint
    const canDelete = req.user.role === 'hr' || 
                     req.user.role === 'admin' || 
                     complaint.submittedBy.toString() === req.user.id;

    if (!canDelete) {
      return res.status(403).json({ message: 'Not authorized to delete this complaint' });
    }

    await Complaint.findByIdAndDelete(req.params.id);
    
    res.json({ message: 'Complaint deleted successfully' });
  } catch (error) {
    console.error('Error deleting complaint:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;



