const mongoose = require('mongoose');

const departmentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  head: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  // Enhanced fields for project management
  type: {
    type: String,
    enum: ['operational', 'project', 'functional'],
    default: 'operational'
  },
  category: {
    type: String,
    enum: ['hr', 'engineering', 'sales', 'marketing', 'finance', 'operations', 'project', 'custom'],
    required: true
  },
  level: {
    type: String,
    enum: ['department', 'team', 'project', 'division'],
    default: 'department'
  },
  parentDepartment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Department'
  },
  projectCode: {
    type: String,
    sparse: true // For project-specific departments
  },
  roles: [{
    title: {
      type: String,
      required: true
    },
    level: {
      type: String,
      enum: ['junior', 'senior', 'lead', 'manager', 'director'],
      required: true
    }
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  color: {
    type: String,
    default: '#3B82F6'
  }
}, {
  timestamps: true
});

departmentSchema.index({ name: 1 });
departmentSchema.index({ category: 1, type: 1 });
departmentSchema.index({ parentDepartment: 1 });

module.exports = mongoose.model('Department', departmentSchema);
