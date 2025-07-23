const mongoose = require('mongoose');

const complaintSchema = new mongoose.Schema({
  submittedBy: {
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
    enum: ['survey', 'technical', 'workplace', 'harassment', 'other'],
    required: true
  },
  relatedSurvey: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Survey'
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  status: {
    type: String,
    enum: ['pending', 'under-review', 'in-progress', 'resolved'],
    default: 'pending'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium'
  },
  adminResponse: {
    type: String,
    trim: true
  },
  respondedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  respondedAt: {
    type: Date
  },
  messageId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Message'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Complaint', complaintSchema);

