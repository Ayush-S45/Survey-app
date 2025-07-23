const mongoose = require('mongoose');

const answerSchema = new mongoose.Schema({
  question: {
    type: String,
    required: true
  },
  answer: {
    type: mongoose.Schema.Types.Mixed,
    required: true
  },
  questionType: {
    type: String,
    enum: ['text', 'rating', 'multiple-choice', 'checkbox', 'scale'],
    required: true
  }
});

const feedbackSchema = new mongoose.Schema({
  survey: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Survey',
    required: true
  },
  respondent: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  answers: [answerSchema],
  isAnonymous: {
    type: Boolean,
    default: false
  },
  submittedAt: {
    type: Date,
    default: Date.now
  },
  timeSpent: {
    type: Number, // in seconds
    default: 0
  },
  ipAddress: {
    type: String
  },
  userAgent: {
    type: String
  },
  status: {
    type: String,
    enum: ['draft', 'submitted', 'archived'],
    default: 'submitted'
  },
  metadata: {
    department: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Department'
    },
    role: {
      type: String,
      enum: ['employee', 'manager', 'hr', 'admin']
    },
    project: {
      type: String
    }
  }
}, {
  timestamps: true
});

// Indexes for better query performance
feedbackSchema.index({ survey: 1, submittedAt: -1 });
feedbackSchema.index({ respondent: 1, survey: 1 });
feedbackSchema.index({ 'metadata.department': 1, submittedAt: -1 });

module.exports = mongoose.model('Feedback', feedbackSchema); 