const express = require('express');
const router = express.Router();
const Message = require('../models/Message');
const User = require('../models/User');
const { auth, authorize } = require('../middleware/auth');

// @route   GET /api/messages
// @desc    Get messages based on user role
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    let query = {};
    
    // If user is HR/Admin, they can see all messages
    if (req.user.role === 'hr' || req.user.role === 'admin') {
      // No additional query filters - show all messages
    } else {
      // Regular users only see their sent messages
      query.sender = req.user.id;
    }

    const messages = await Message.find(query)
      .populate('sender', 'firstName lastName email role')
      .populate('recipient', 'firstName lastName role')
      .populate('repliedBy', 'firstName lastName')
      .sort({ createdAt: -1 });
    
    res.json(messages);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/messages/inbox
// @desc    Get messages received by user
// @access  Private
router.get('/inbox', auth, async (req, res) => {
  try {
    const messages = await Message.find({ recipient: req.user.id })
      .populate('sender', 'firstName lastName email role')
      .populate('repliedBy', 'firstName lastName')
      .sort({ createdAt: -1 });
    
    console.log(`Found ${messages.length} messages for user ${req.user.id}`);
    res.json(messages);
  } catch (error) {
    console.error('Error fetching inbox messages:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/messages/received
// @desc    Alternative endpoint for received messages (for frontend compatibility)
// @access  Private
router.get('/received', auth, async (req, res) => {
  try {
    const messages = await Message.find({ recipient: req.user.id })
      .populate('sender', 'firstName lastName email role')
      .populate('repliedBy', 'firstName lastName')
      .sort({ createdAt: -1 });
    
    res.json(messages);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/messages
// @desc    Send new message (single recipient, multiple recipients, or to all)
// @access  Private
router.post('/', auth, async (req, res) => {
  try {
    const { content, type, recipient, recipients, sendToAll } = req.body;

    let messages = [];

    if (sendToAll) {
      // Send to all active users except the sender
      const allUsers = await User.find({ 
        _id: { $ne: req.user.id }, 
        isActive: true 
      }).select('_id');

      messages = allUsers.map(user => ({
        sender: req.user.id,
        recipient: user._id,
        content,
        type,
        status: 'sent'
      }));
    } else if (recipients && recipients.length > 0) {
      // Send to multiple selected recipients
      messages = recipients.map(recipientId => ({
        sender: req.user.id,
        recipient: recipientId,
        content,
        type,
        status: 'sent'
      }));
    } else if (recipient) {
      // Send to single recipient (backward compatibility)
      messages = [{
        sender: req.user.id,
        recipient,
        content,
        type,
        status: 'sent'
      }];
    } else {
      return res.status(400).json({ message: 'No recipients specified' });
    }

    // Create all messages
    const createdMessages = await Message.insertMany(messages);
    
    console.log(`Created ${createdMessages.length} messages`);
    
    // Populate recipient information for all messages
    await Message.populate(createdMessages, {
      path: 'recipient',
      select: 'firstName lastName role'
    });

    res.status(201).json({
      message: 'Messages sent successfully',
      count: createdMessages.length,
      messages: createdMessages
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/messages/:id/read
// @desc    Mark message as read
// @access  Private
router.put('/:id/read', auth, async (req, res) => {
  try {
    const message = await Message.findOneAndUpdate(
      { _id: req.params.id, recipient: req.user.id },
      { status: 'read' },
      { new: true }
    ).populate('sender', 'firstName lastName email');

    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }

    res.json(message);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/messages/:id/reply
// @desc    Reply to message
// @access  Private
router.put('/:id/reply', auth, async (req, res) => {
  try {
    const { reply } = req.body;

    const message = await Message.findOneAndUpdate(
      { _id: req.params.id, recipient: req.user.id },
      { 
        reply,
        status: 'replied',
        repliedBy: req.user.id,
        repliedAt: new Date()
      },
      { new: true }
    ).populate('sender', 'firstName lastName email')
     .populate('repliedBy', 'firstName lastName');

    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }

    res.json(message);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/messages/stats
// @desc    Get message statistics for current user
// @access  Private
router.get('/stats', auth, async (req, res) => {
  try {
    const [sentCount, receivedCount, unreadCount] = await Promise.all([
      Message.countDocuments({ sender: req.user.id }),
      Message.countDocuments({ recipient: req.user.id }),
      Message.countDocuments({ recipient: req.user.id, status: 'sent' })
    ]);

    res.json({
      sent: sentCount,
      received: receivedCount,
      unread: unreadCount
    });
  } catch (error) {
    console.error('Error fetching message stats:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;


