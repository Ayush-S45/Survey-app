const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  question: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['text', 'rating', 'multiple-choice', 'checkbox', 'scale'],
    required: true
  },
  options: [{
    type: String
  }],
  required: {
    type: Boolean,
    default: false
  },
  order: {
    type: Number,
    required: true
  }
});

const surveySchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  category: {
    type: String,
    enum: ['project', 'manager', 'workplace', 'general', 'custom'],
    required: true
  },
  questions: [questionSchema],
  targetAudience: {
    departments: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Department'
    }],
    roles: [{
      type: String,
      enum: ['employee', 'manager', 'hr', 'admin']
    }]
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isAnonymous: {
    type: Boolean,
    default: false
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  estimatedTime: {
    type: Number, // in minutes
    default: 5
  },
  tags: [{
    type: String,
    trim: true
  }]
}, {
  timestamps: true
});

// Index for better query performance
surveySchema.index({ category: 1, isActive: 1, endDate: 1 });

module.exports = mongoose.model('Survey', surveySchema); 