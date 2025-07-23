const express = require('express');
const { body, validationResult } = require('express-validator');
const Feedback = require('../models/Feedback');
const Survey = require('../models/Survey');
const { auth, authorize } = require('../middleware/auth');

const router = express.Router();

// @route   POST /api/feedback
// @desc    Submit feedback for a survey
// @access  Private
router.post('/', [
  auth,
  body('survey').isMongoId().withMessage('Valid survey ID is required'),
  body('answers').isArray({ min: 1 }).withMessage('At least one answer is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { survey: surveyId, answers, timeSpent, isAnonymous } = req.body;

    // Check if survey exists and is active
    const survey = await Survey.findById(surveyId);
    if (!survey) {
      return res.status(404).json({ message: 'Survey not found' });
    }

    if (!survey.isActive) {
      return res.status(400).json({ message: 'Survey is not active' });
    }

    // Check if survey is within date range
    const now = new Date();
    if (now < survey.startDate || now > survey.endDate) {
      return res.status(400).json({ message: 'Survey is not available at this time' });
    }

    // Check if user has already submitted this survey
    const existingFeedback = await Feedback.findOne({
      survey: surveyId,
      respondent: req.user.id
    });

    if (existingFeedback) {
      return res.status(400).json({ message: 'You have already submitted this survey' });
    }

    // Validate answers against survey questions
    if (answers.length !== survey.questions.length) {
      return res.status(400).json({ message: 'Number of answers does not match number of questions' });
    }

    // Create feedback object
    const feedbackData = {
      survey: surveyId,
      answers: answers.map((answer, index) => ({
        question: survey.questions[index].question,
        answer: answer.answer,
        questionType: survey.questions[index].type
      })),
      timeSpent,
      isAnonymous: isAnonymous || survey.isAnonymous,
      ipAddress: req.ip,
      userAgent: req.get('User-Agent'),
      metadata: {
        department: req.user.department,
        role: req.user.role
      }
    };

    // Only include respondent if not anonymous
    if (!feedbackData.isAnonymous) {
      feedbackData.respondent = req.user.id;
    }

    const feedback = new Feedback(feedbackData);
    await feedback.save();

    res.status(201).json({
      message: 'Feedback submitted successfully',
      feedbackId: feedback._id
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/feedback/my-responses
// @desc    Get user's own feedback responses
// @access  Private
router.get('/my-responses', auth, async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    const responses = await Feedback.find({ respondent: req.user.id })
      .populate('survey', 'title category startDate endDate')
      .sort({ submittedAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Feedback.countDocuments({ respondent: req.user.id });

    res.json({
      responses,
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

// @route   GET /api/feedback/analytics
// @desc    Get feedback analytics (for HR/Admin/Manager)
// @access  Private
router.get('/analytics', [auth, authorize('hr', 'admin', 'manager')], async (req, res) => {
  try {
    const { department, category, startDate, endDate } = req.query;

    let matchQuery = {};

    // Filter by department if specified
    if (department) {
      matchQuery['metadata.department'] = department;
    }

    // Filter by category if specified
    if (category) {
      matchQuery['survey'] = { $in: await Survey.find({ category }).distinct('_id') };
    }

    // Filter by date range if specified
    if (startDate || endDate) {
      matchQuery.submittedAt = {};
      if (startDate) matchQuery.submittedAt.$gte = new Date(startDate);
      if (endDate) matchQuery.submittedAt.$lte = new Date(endDate);
    }

    // If user is manager, only show their department's data
    if (req.user.role === 'manager') {
      matchQuery['metadata.department'] = req.user.department;
    }

    const analytics = await Feedback.aggregate([
      { $match: matchQuery },
      {
        $lookup: {
          from: 'surveys',
          localField: 'survey',
          foreignField: '_id',
          as: 'surveyData'
        }
      },
      { $unwind: '$surveyData' },
      {
        $group: {
          _id: {
            category: '$surveyData.category',
            month: { $dateToString: { format: '%Y-%m', date: '$submittedAt' } }
          },
          count: { $sum: 1 },
          avgTimeSpent: { $avg: '$timeSpent' }
        }
      },
      { $sort: { '_id.month': -1 } }
    ]);

    // Get total responses
    const totalResponses = await Feedback.countDocuments(matchQuery);

    // Get responses by category
    const responsesByCategory = await Feedback.aggregate([
      { $match: matchQuery },
      {
        $lookup: {
          from: 'surveys',
          localField: 'survey',
          foreignField: '_id',
          as: 'surveyData'
        }
      },
      { $unwind: '$surveyData' },
      {
        $group: {
          _id: '$surveyData.category',
          count: { $sum: 1 }
        }
      }
    ]);

    res.json({
      analytics,
      totalResponses,
      responsesByCategory
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/feedback/export/:surveyId
// @desc    Export survey responses to CSV (for HR/Admin/Manager)
// @access  Private
router.get('/export/:surveyId', [auth, authorize('hr', 'admin', 'manager')], async (req, res) => {
  try {
    const { surveyId } = req.params;
    
    const survey = await Survey.findById(surveyId);
    if (!survey) {
      return res.status(404).json({ message: 'Survey not found' });
    }

    const responses = await Feedback.find({ survey: surveyId })
      .populate('respondent', 'firstName lastName email employeeId')
      .populate('metadata.department', 'name')
      .sort({ submittedAt: -1 });

    // Create CSV data
    const csvData = responses.map(response => {
      const row = {
        'Response ID': response._id,
        'Submitted At': response.submittedAt,
        'Time Spent (seconds)': response.timeSpent,
        'Anonymous': response.isAnonymous ? 'Yes' : 'No'
      };

      // Add respondent info if not anonymous
      if (!response.isAnonymous && response.respondent) {
        row['First Name'] = response.respondent.firstName;
        row['Last Name'] = response.respondent.lastName;
        row['Email'] = response.respondent.email;
        row['Employee ID'] = response.respondent.employeeId;
      }

      // Add department info
      if (response.metadata.department) {
        row['Department'] = response.metadata.department.name;
      }

      // Add answers
      response.answers.forEach((answer, index) => {
        row[`Q${index + 1}: ${answer.question}`] = Array.isArray(answer.answer) 
          ? answer.answer.join(', ') 
          : answer.answer;
      });

      return row;
    });

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="survey-${surveyId}-responses.csv"`);

    // Convert to CSV
    if (csvData.length > 0) {
      const headers = Object.keys(csvData[0]);
      const csv = [
        headers.join(','),
        ...csvData.map(row => headers.map(header => `"${row[header] || ''}"`).join(','))
      ].join('\n');

      res.send(csv);
    } else {
      res.send('No responses found');
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router; 