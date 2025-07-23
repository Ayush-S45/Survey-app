const express = require('express');
const router = express.Router();
const Message = require('../models/Message');
const User = require('../models/User');
const auth = require('../middleware/auth');
const authorize = require('../middleware/authorize');

// @route   GET /api/messages
// @desc    Get user's sent messages
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const messages = await Message.find({ sender: req.user.id })
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
      .populate('sender', 'firstName lastName email')
      .populate('repliedBy', 'firstName lastName')
      .sort({ createdAt: -1 });
    
    res.json(messages);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/messages
// @desc    Send new message
// @access  Private
router.post('/', auth, async (req, res) => {
  try {
    const { content, type, recipient } = req.body;

    const message = new Message({
      sender: req.user.id,
      recipient,
      content,
      type,
      status: 'sent'
    });

    await message.save();
    
    await message.populate('recipient', 'firstName lastName role');
    
    res.status(201).json(message);
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

module.exports = router;

