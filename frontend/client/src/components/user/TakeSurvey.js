import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { 
  ArrowLeftIcon, 
  CheckIcon, 
  ExclamationTriangleIcon,
  ClockIcon,
  UserIcon
} from '@heroicons/react/24/outline';

const TakeSurvey = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [survey, setSurvey] = useState(null);
  const [answers, setAnswers] = useState({});
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchSurvey();
  }, [id]);

  const fetchSurvey = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/surveys/${id}`);
      
      // Validate survey data
      if (!response.data || !response.data.questions || !Array.isArray(response.data.questions)) {
        throw new Error('Invalid survey data');
      }
      
      // Check if user has already submitted this survey
      const feedbackResponse = await axios.get(`/api/feedback/check-submission/${id}`);
      if (feedbackResponse.data.hasSubmitted) {
        toast.error('You have already completed this survey');
        navigate('/user/surveys');
        return;
      }
      
      setSurvey(response.data);
      
      // Initialize answers object
      const initialAnswers = {};
      response.data.questions.forEach((question, index) => {
        if (question.type === 'checkbox') {
          initialAnswers[index] = [];
        } else {
          initialAnswers[index] = '';
        }
      });
      setAnswers(initialAnswers);
    } catch (error) {
      console.error('Error fetching survey:', error);
      if (error.response?.status === 409) {
        toast.error('You have already completed this survey');
      } else {
        toast.error('Failed to load survey');
      }
      navigate('/user/surveys');
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerChange = (questionIndex, value) => {
    setAnswers(prev => ({
      ...prev,
      [questionIndex]: value
    }));
  };

  const handleCheckboxChange = (questionIndex, option) => {
    setAnswers(prev => {
      const currentAnswers = prev[questionIndex] || [];
      const updatedAnswers = currentAnswers.includes(option)
        ? currentAnswers.filter(item => item !== option)
        : [...currentAnswers, option];
      
      return {
        ...prev,
        [questionIndex]: updatedAnswers
      };
    });
  };

  const handleSubmit = async () => {
    try {
      setSubmitting(true);
      
      // Validate required questions
      const requiredQuestions = survey.questions.filter((q, index) => q.required);
      const missingAnswers = requiredQuestions.filter((q, index) => {
        const answer = answers[survey.questions.indexOf(q)];
        return !answer || (Array.isArray(answer) && answer.length === 0);
      });

      if (missingAnswers.length > 0) {
        toast.error(`Please answer all required questions`);
        return;
      }

      const feedbackData = {
        survey: survey._id,
        answers: survey.questions.map((question, index) => ({
          question: question.question,
          answer: answers[index],
          questionType: question.type,
          required: question.required
        })),
        timeSpent: 0, // You can calculate this if needed
        isAnonymous: false
      };

      console.log('Submitting feedback data:', feedbackData);
      const response = await axios.post('/api/feedback', feedbackData);
      console.log('Feedback submission response:', response.data);
      toast.success('Survey submitted successfully!');
      
      // Navigate back to surveys and trigger a refresh with completed state
      navigate('/user/surveys', { state: { refresh: true, showCompleted: true } });
    } catch (error) {
      console.error('Error submitting survey:', error);
      if (error.response) {
        console.error('Error response:', error.response.data);
        toast.error(error.response.data.message || 'Failed to submit survey');
      } else {
        toast.error('Failed to submit survey');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const nextQuestion = () => {
    if (currentQuestion < survey.questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  const prevQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const renderQuestion = (question, index) => {
    const currentAnswer = answers[index];

    switch (question.type) {
      case 'text':
        return (
          <input
            type="text"
            value={currentAnswer}
            onChange={(e) => handleAnswerChange(index, e.target.value)}
            placeholder={question.placeholder || "Enter your answer"}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        );

      case 'textarea':
        return (
          <textarea
            value={currentAnswer}
            onChange={(e) => handleAnswerChange(index, e.target.value)}
            placeholder={question.placeholder || "Enter your answer"}
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        );

      case 'multiple':
        return (
          <div className="space-y-2">
            {question.options && Array.isArray(question.options) ? (
              question.options.map((option, optionIndex) => (
                <label key={optionIndex} className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="radio"
                    name={`question-${index}`}
                    value={option}
                    checked={currentAnswer === option}
                    onChange={(e) => handleAnswerChange(index, e.target.value)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-gray-700">{option}</span>
                </label>
              ))
            ) : (
              <p className="text-red-500">No options available for this question</p>
            )}
          </div>
        );

      case 'checkbox':
        return (
          <div className="space-y-2">
            {question.options && Array.isArray(question.options) ? (
              question.options.map((option, optionIndex) => (
                <label key={optionIndex} className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="checkbox"
                    value={option}
                    checked={currentAnswer?.includes(option) || false}
                    onChange={() => handleCheckboxChange(index, option)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-gray-700">{option}</span>
                </label>
              ))
            ) : (
              <p className="text-red-500">No options available for this question</p>
            )}
          </div>
        );

      case 'rating':
        return (
          <div className="flex space-x-2">
            {[1, 2, 3, 4, 5].map((rating) => (
              <button
                key={rating}
                type="button"
                onClick={() => handleAnswerChange(index, rating)}
                className={`w-10 h-10 rounded-full border-2 flex items-center justify-center ${
                  currentAnswer === rating
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-white text-gray-600 border-gray-300 hover:border-blue-500'
                }`}
              >
                {rating}
              </button>
            ))}
          </div>
        );

      case 'scale':
        return (
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-600">1</span>
            <input
              type="range"
              min="1"
              max="10"
              value={currentAnswer || 5}
              onChange={(e) => handleAnswerChange(index, parseInt(e.target.value))}
              className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            />
            <span className="text-sm text-gray-600">10</span>
            <span className="text-sm font-medium text-blue-600">{currentAnswer || 5}</span>
          </div>
        );

      case 'number':
        return (
          <input
            type="number"
            value={currentAnswer}
            onChange={(e) => handleAnswerChange(index, e.target.value)}
            placeholder={question.placeholder || "Enter a number"}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        );

      case 'date':
        return (
          <input
            type="date"
            value={currentAnswer}
            onChange={(e) => handleAnswerChange(index, e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        );

      case 'email':
        return (
          <input
            type="email"
            value={currentAnswer}
            onChange={(e) => handleAnswerChange(index, e.target.value)}
            placeholder={question.placeholder || "Enter your email"}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        );

      case 'url':
        return (
          <input
            type="url"
            value={currentAnswer}
            onChange={(e) => handleAnswerChange(index, e.target.value)}
            placeholder={question.placeholder || "Enter a URL"}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        );

      default:
        return (
          <input
            type="text"
            value={currentAnswer}
            onChange={(e) => handleAnswerChange(index, e.target.value)}
            placeholder="Enter your answer"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        );
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  if (!survey) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <ExclamationTriangleIcon className="h-12 w-12 mx-auto mb-4 text-red-500" />
          <p className="text-lg font-medium text-gray-900">Survey not found</p>
          <button
            onClick={() => navigate('/user/surveys')}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Back to Surveys
          </button>
        </div>
      </div>
    );
  }

  // Check if survey has questions
  if (!survey.questions || survey.questions.length === 0) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <ExclamationTriangleIcon className="h-12 w-12 mx-auto mb-4 text-red-500" />
          <p className="text-lg font-medium text-gray-900">No questions found in this survey</p>
          <button
            onClick={() => navigate('/user/surveys')}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Back to Surveys
          </button>
        </div>
      </div>
    );
  }

  // Ensure currentQuestion is within bounds
  if (currentQuestion >= survey.questions.length) {
    setCurrentQuestion(0);
  }

  const question = survey.questions[currentQuestion];
  const progress = ((currentQuestion + 1) / survey.questions.length) * 100;

  return (
    <div className="p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => navigate('/user/surveys')}
            className="flex items-center text-blue-600 hover:text-blue-700 mb-4"
          >
            <ArrowLeftIcon className="h-4 w-4 mr-2" />
            Back to Surveys
          </button>
          
          <div className="bg-white rounded-lg shadow p-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">{survey.title}</h1>
            <p className="text-gray-600 mb-4">{survey.description}</p>
            
            <div className="flex flex-wrap gap-2 mb-4">
              <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                {survey.category}
              </span>
              <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                {survey.questions.length} questions
              </span>
              <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-medium">
                {survey.estimatedTime || '5'} min estimated
              </span>
            </div>

            {/* Progress Bar */}
            <div className="mb-6">
              <div className="flex justify-between text-sm text-gray-600 mb-2">
                <span>Question {currentQuestion + 1} of {survey.questions.length}</span>
                <span>{Math.round(progress)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>

        {/* Question */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              {question.question}
              {question.required && <span className="text-red-500 ml-1">*</span>}
            </h2>
            {question.description && (
              <p className="text-gray-600 mb-4">{question.description}</p>
            )}
          </div>

          <div className="mb-8">
            {renderQuestion(question, currentQuestion)}
          </div>

          {/* Navigation */}
          <div className="flex justify-between">
            <button
              onClick={prevQuestion}
              disabled={currentQuestion === 0}
              className={`px-4 py-2 rounded-md ${
                currentQuestion === 0
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-gray-600 text-white hover:bg-gray-700'
              }`}
            >
              Previous
            </button>

            {currentQuestion === survey.questions.length - 1 ? (
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-400 flex items-center"
              >
                {submitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Submitting...
                  </>
                ) : (
                  <>
                    <CheckIcon className="h-4 w-4 mr-2" />
                    Submit Survey
                  </>
                )}
              </button>
            ) : (
              <button
                onClick={nextQuestion}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Next
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TakeSurvey;