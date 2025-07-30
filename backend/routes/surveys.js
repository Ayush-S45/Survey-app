const express = require('express');
const { body, validationResult } = require('express-validator');
const Survey = require('../models/Survey');
const Feedback = require('../models/Feedback');
const { auth, authorize } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/surveys
// @desc    Get all surveys (filtered by user role and department)
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const { category, isActive, page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    let query = {};

    // Filter by category
    if (category) {
      query.category = category;
    }

    // Filter by active status
    if (isActive !== undefined) {
      query.isActive = isActive === 'true';
    }

    // Filter surveys based on user role and department
    if (req.user.role === 'employee') {
      query.$or = [
        { 'targetAudience.departments': req.user.department },
        { 'targetAudience.roles': { $in: ['employee', req.user.role] } }
      ];
    } else if (req.user.role === 'manager') {
      query.$or = [
        { 'targetAudience.departments': req.user.department },
        { 'targetAudience.roles': { $in: ['manager', 'employee'] } }
      ];
    }
    // HR and Admin can see all surveys

    const surveys = await Survey.find(query)
      .populate('createdBy', 'firstName lastName')
      .populate('targetAudience.departments', 'name')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Survey.countDocuments(query);

    res.json({
      surveys,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/surveys/available
// @desc    Get available surveys for current user
// @access  Private
router.get('/available', auth, async (req, res) => {
  try {
    const now = new Date();
    let query = {
      isActive: true,
      startDate: { $lte: now },
      endDate: { $gte: now }
    };

    // Filter surveys based on user role and department
    if (req.user.role === 'employee') {
      query.$or = [
        { 'targetAudience.departments': req.user.department },
        { 'targetAudience.roles': { $in: ['employee', req.user.role] } }
      ];
    } else if (req.user.role === 'manager') {
      query.$or = [
        { 'targetAudience.departments': req.user.department },
        { 'targetAudience.roles': { $in: ['manager', 'employee'] } }
      ];
    }
    // HR and Admin can see all surveys

    const surveys = await Survey.find(query)
      .populate('createdBy', 'firstName lastName')
      .populate('targetAudience.departments', 'name')
      .sort({ createdAt: -1 });

    // Check which surveys the user has already submitted
    const submittedSurveys = await Feedback.find({ 
      respondent: req.user.id 
    }).distinct('survey');

    console.log('User submitted surveys:', submittedSurveys);
    console.log('Available surveys:', surveys.map(s => s._id.toString()));

    const surveysWithSubmissionStatus = surveys.map(survey => {
      const hasSubmitted = submittedSurveys.some(submittedId => 
        submittedId.toString() === survey._id.toString()
      );
      
      console.log(`Survey ${survey.title}: hasSubmitted = ${hasSubmitted}`);
      
      return {
        ...survey.toObject(),
        hasSubmitted
      };
    });

    res.json(surveysWithSubmissionStatus);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/surveys/:id
// @desc    Get survey by ID
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    const survey = await Survey.findById(req.params.id)
      .populate('createdBy', 'firstName lastName')
      .populate('targetAudience.departments', 'name');

    if (!survey) {
      return res.status(404).json({ message: 'Survey not found' });
    }

    // Check if user has already submitted this survey
    const existingFeedback = await Feedback.findOne({
      survey: survey._id,
      respondent: req.user.id
    });

    if (existingFeedback) {
      return res.status(409).json({ 
        message: 'You have already completed this survey',
        hasSubmitted: true,
        submissionDate: existingFeedback.submittedAt
      });
    }

    res.json(survey);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/surveys
// @desc    Create a new survey
// @access  Private (HR, Admin, Manager)
router.post('/', [
  auth,
  authorize('hr', 'admin', 'manager'),
  body('title').notEmpty().withMessage('Title is required'),
  body('category').isIn(['project', 'manager', 'workplace', 'general', 'training', 'custom']).withMessage('Invalid category'),
  body('questions').isArray({ min: 1 }).withMessage('At least one question is required'),
  body('startDate').isISO8601().withMessage('Valid start date is required'),
  body('endDate').isISO8601().withMessage('Valid end date is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      title,
      description,
      category,
      questions,
      targetAudience,
      isAnonymous,
      startDate,
      endDate,
      estimatedTime,
      tags,
      settings
    } = req.body;

    // Validate end date is after start date
    if (new Date(endDate) <= new Date(startDate)) {
      return res.status(400).json({ message: 'End date must be after start date' });
    }

    console.log('Creating survey with data:', {
      title,
      category,
      questionsCount: questions.length,
      settings
    });

    const survey = new Survey({
      title,
      description,
      category,
      questions: questions.map((q, index) => ({ ...q, order: index + 1 })),
      targetAudience,
      isAnonymous,
      startDate,
      endDate,
      estimatedTime,
      tags,
      settings,
      createdBy: req.user.id
    });

    await survey.save();
    console.log('Survey created successfully with ID:', survey._id);

    res.status(201).json(survey);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/surveys/:id
// @desc    Update a survey
// @access  Private (HR, Admin, Manager)
router.put('/:id', [
  auth,
  authorize('hr', 'admin', 'manager'),
  body('title').notEmpty().withMessage('Title is required'),
  body('category').isIn(['project', 'manager', 'workplace', 'general', 'training', 'custom']).withMessage('Invalid category')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const survey = await Survey.findById(req.params.id);
    if (!survey) {
      return res.status(404).json({ message: 'Survey not found' });
    }

    // Check if user can edit this survey
    if (survey.createdBy.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to edit this survey' });
    }

    // Check if survey has responses
    const feedbackCount = await Feedback.countDocuments({ survey: survey._id });
    if (feedbackCount > 0) {
      return res.status(400).json({ message: 'Cannot edit survey that has responses' });
    }

    const updatedSurvey = await Survey.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    res.json(updatedSurvey);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/surveys/:id
// @desc    Delete a survey
// @access  Private (HR, Admin)
router.delete('/:id', [auth, authorize('hr', 'admin')], async (req, res) => {
  try {
    const survey = await Survey.findById(req.params.id);
    if (!survey) {
      return res.status(404).json({ message: 'Survey not found' });
    }

    // Check if survey has responses
    const feedbackCount = await Feedback.countDocuments({ survey: survey._id });
    if (feedbackCount > 0) {
      return res.status(400).json({ message: 'Cannot delete survey that has responses' });
    }

    await Survey.findByIdAndDelete(req.params.id);
    res.json({ message: 'Survey deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/surveys/:id/responses
// @desc    Get survey responses (for HR/Admin/Manager)
// @access  Private
router.get('/:id/responses', [auth, authorize('hr', 'admin', 'manager')], async (req, res) => {
  try {
    const survey = await Survey.findById(req.params.id);
    if (!survey) {
      return res.status(404).json({ message: 'Survey not found' });
    }

    const responses = await Feedback.find({ survey: survey._id })
      .populate('respondent', 'firstName lastName email employeeId department')
      .populate('metadata.department', 'name')
      .sort({ submittedAt: -1 });

    res.json({
      survey,
      responses,
      totalResponses: responses.length
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router; 
