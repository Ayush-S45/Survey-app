const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  content: {
    type: String,
    required: true,
    trim: true
  },
  type: {
    type: String,
    enum: ['general', 'feedback', 'complaint', 'urgent'],
    default: 'general'
  },
  status: {
    type: String,
    enum: ['sent', 'read', 'replied'],
    default: 'sent'
  },
  reply: {
    type: String,
    trim: true
  },
  repliedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  repliedAt: {
    type: Date
  },
  complaintId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Complaint'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Message', messageSchema);
