const express = require('express');
const router = express.Router();
const Complaint = require('../models/Complaint');
const Message = require('../models/Message');
const User = require('../models/User');
const auth = require('../middleware/auth');
const authorize = require('../middleware/authorize');

// @route   GET /api/complaints
// @desc    Get user's complaints
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const complaints = await Complaint.find({ submittedBy: req.user.id })
      .populate('relatedSurvey', 'title')
      .populate('assignedTo', 'firstName lastName role')
      .sort({ createdAt: -1 });
    
    res.json(complaints);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/complaints
// @desc    Submit new complaint and send as message
// @access  Private
router.post('/', auth, async (req, res) => {
  try {
    const { content, type, relatedSurvey, assignedTo } = req.body;

    // Determine recipient - either assigned person or default admin
    let recipient = assignedTo;
    if (!recipient) {
      const admin = await User.findOne({ role: 'admin', isActive: true });
      recipient = admin._id;
    }

    // Create complaint
    const complaint = new Complaint({
      submittedBy: req.user.id,
      content,
      type,
      relatedSurvey: relatedSurvey || null,
      assignedTo: recipient,
      status: 'pending',
      priority: type === 'harassment' ? 'high' : 'medium'
    });

    await complaint.save();

    // Create corresponding message
    const message = new Message({
      sender: req.user.id,
      recipient: recipient,
      content: `COMPLAINT: ${content}`,
      type: 'complaint',
      status: 'sent',
      complaintId: complaint._id
    });

    await message.save();

    // Update complaint with message reference
    complaint.messageId = message._id;
    await complaint.save();

    await complaint.populate('relatedSurvey', 'title');
    await complaint.populate('assignedTo', 'firstName lastName role');
    
    res.status(201).json(complaint);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/complaints/admin
// @desc    Get all complaints for admin
// @access  Private (Admin, HR)
router.get('/admin', [auth, authorize('admin', 'hr')], async (req, res) => {
  try {
    const complaints = await Complaint.find()
      .populate('submittedBy', 'firstName lastName email')
      .populate('relatedSurvey', 'title')
      .populate('assignedTo', 'firstName lastName role')
      .sort({ priority: -1, createdAt: -1 });
    
    res.json(complaints);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/complaints/:id/respond
// @desc    Admin respond to complaint
// @access  Private (Admin, HR)
router.put('/:id/respond', [auth, authorize('admin', 'hr')], async (req, res) => {
  try {
    const { adminResponse, status, priority } = req.body;

    const complaint = await Complaint.findByIdAndUpdate(
      req.params.id,
      { 
        adminResponse,
        status,
        priority,
        respondedAt: new Date(),
        respondedBy: req.user.id
      },
      { new: true }
    ).populate('submittedBy', 'firstName lastName email')
     .populate('relatedSurvey', 'title')
     .populate('assignedTo', 'firstName lastName role');

    if (!complaint) {
      return res.status(404).json({ message: 'Complaint not found' });
    }

    // Update corresponding message with reply
    if (complaint.messageId) {
      await Message.findByIdAndUpdate(complaint.messageId, {
        reply: adminResponse,
        status: 'replied',
        repliedBy: req.user.id,
        repliedAt: new Date()
      });
    }

    res.json(complaint);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;

