import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import axios from 'axios';
import toast from 'react-hot-toast';
import LoadingSpinner from '../common/LoadingSpinner';

const SurveyDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [survey, setSurvey] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [answers, setAnswers] = useState({});
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [responseCount, setResponseCount] = useState(0);

  useEffect(() => {
    fetchSurvey();
  }, [id]);

  const fetchSurvey = async () => {
    try {
      const response = await axios.get(`/api/surveys/${id}`);
      setSurvey(response.data.survey || response.data);
      setHasSubmitted(response.data.hasSubmitted);
      
      // Check if there are responses for this survey
      try {
        const responsesResponse = await axios.get(`/api/surveys/${id}/responses`);
        const count = responsesResponse.data.responses?.length || 0;
        setResponseCount(count);
        
        // If there are responses and user is admin/hr, redirect to responses page
        if (count > 0 && (user.role === 'admin' || user.role === 'hr')) {
          navigate(`/surveys/${id}/responses`);
          return;
        }
      } catch (error) {
        console.error('Error fetching responses:', error);
        setResponseCount(0);
      }
      
      // Initialize answers object
      const initialAnswers = {};
      response.data.survey.questions.forEach((question, index) => {
        initialAnswers[index] = '';
      });
      setAnswers(initialAnswers);
    } catch (error) {
      console.error('Error fetching survey:', error);
      toast.error('Failed to load survey');
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const answersArray = Object.keys(answers).map(index => ({
        answer: answers[index]
      }));

      await axios.post('/api/feedback', {
        survey: id,
        answers: answersArray,
        timeSpent: 0 // You can implement time tracking
      });

      toast.success('Survey submitted successfully!');
      navigate('/surveys');
    } catch (error) {
      console.error('Error submitting survey:', error);
      toast.error(error.response?.data?.message || 'Failed to submit survey');
    } finally {
      setSubmitting(false);
    }
  };

  const renderQuestion = (question, index) => {
    switch (question.type) {
      case 'text':
        return (
          <textarea
            value={answers[index] || ''}
            onChange={(e) => handleAnswerChange(index, e.target.value)}
            className="input-field mt-2"
            rows={4}
            placeholder="Enter your answer..."
            required={question.required}
          />
        );

      case 'rating':
        return (
          <div className="flex gap-2 mt-2">
            {[1, 2, 3, 4, 5].map((rating) => (
              <button
                key={rating}
                type="button"
                onClick={() => handleAnswerChange(index, rating)}
                className={`w-10 h-10 rounded-full border-2 flex items-center justify-center ${
                  answers[index] === rating
                    ? 'border-primary-500 bg-primary-500 text-white'
                    : 'border-gray-300 hover:border-primary-300'
                }`}
              >
                {rating}
              </button>
            ))}
          </div>
        );

      case 'multiple-choice':
        return (
          <div className="space-y-2 mt-2">
            {question.options.map((option, optionIndex) => (
              <label key={optionIndex} className="flex items-center">
                <input
                  type="radio"
                  name={`question-${index}`}
                  value={option}
                  checked={answers[index] === option}
                  onChange={(e) => handleAnswerChange(index, e.target.value)}
                  className="mr-2"
                  required={question.required}
                />
                {option}
              </label>
            ))}
          </div>
        );

      case 'checkbox':
        return (
          <div className="space-y-2 mt-2">
            {question.options.map((option, optionIndex) => (
              <label key={optionIndex} className="flex items-center">
                <input
                  type="checkbox"
                  value={option}
                  checked={answers[index]?.includes?.(option) || false}
                  onChange={(e) => {
                    const currentAnswers = answers[index] ? answers[index].split(',') : [];
                    if (e.target.checked) {
                      currentAnswers.push(option);
                    } else {
                      const index = currentAnswers.indexOf(option);
                      if (index > -1) currentAnswers.splice(index, 1);
                    }
                    handleAnswerChange(index, currentAnswers.join(','));
                  }}
                  className="mr-2"
                />
                {option}
              </label>
            ))}
          </div>
        );

      case 'scale':
        return (
          <div className="flex items-center gap-4 mt-2">
            <span className="text-sm text-gray-500">1</span>
            <input
              type="range"
              min="1"
              max="10"
              value={answers[index] || 5}
              onChange={(e) => handleAnswerChange(index, parseInt(e.target.value))}
              className="flex-1"
            />
            <span className="text-sm text-gray-500">10</span>
            <span className="text-sm font-medium">{answers[index] || 5}</span>
          </div>
        );

      default:
        return (
          <input
            type="text"
            value={answers[index] || ''}
            onChange={(e) => handleAnswerChange(index, e.target.value)}
            className="input-field mt-2"
            placeholder="Enter your answer..."
            required={question.required}
          />
        );
    }
  };

  if (loading) {
    return <LoadingSpinner size="lg" className="h-64" />;
  }

  if (!survey) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium text-gray-900 mb-2">Survey not found</h3>
        <p className="text-gray-500">The survey you're looking for doesn't exist.</p>
      </div>
    );
  }

  if (hasSubmitted) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium text-gray-900 mb-2">Already Submitted</h3>
        <p className="text-gray-500 mb-4">You have already submitted this survey.</p>
        <button
          onClick={() => navigate('/surveys')}
          className="btn-primary"
        >
          Back to Surveys
        </button>
      </div>
    );
  }

  // Show message for surveys with responses (for non-admin users)
  if (responseCount > 0 && user.role !== 'admin' && user.role !== 'hr') {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium text-gray-900 mb-2">Survey Has Responses</h3>
        <p className="text-gray-500 mb-4">This survey has {responseCount} response{responseCount !== 1 ? 's' : ''}. Contact an administrator to view the responses.</p>
        <button
          onClick={() => navigate('/surveys')}
          className="btn-primary"
        >
          Back to Surveys
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Survey Header */}
      <div className="card">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">{survey.title}</h1>
        <p className="text-gray-600 mb-4">{survey.description}</p>
        <div className="flex items-center gap-4 text-sm text-gray-500">
          <span>Category: {survey.category}</span>
          <span>Questions: {survey.questions.length}</span>
          <span>Estimated time: {survey.estimatedTime || 5} minutes</span>
          {responseCount > 0 && (
            <span className="text-blue-600 font-medium">
              {responseCount} Response{responseCount !== 1 ? 's' : ''}
            </span>
          )}
        </div>
        {responseCount > 0 && (user.role === 'admin' || user.role === 'hr') && (
          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>Note:</strong> This survey has {responseCount} response{responseCount !== 1 ? 's' : ''}. 
              <button
                onClick={() => navigate(`/surveys/${id}/responses`)}
                className="ml-2 text-blue-600 hover:text-blue-800 underline"
              >
                View all responses
              </button>
            </p>
          </div>
        )}
      </div>

      {/* Survey Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {survey.questions.map((question, index) => (
          <div key={index} className="card">
            <div className="mb-4">
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Question {index + 1}
              </h3>
              <p className="text-gray-700">{question.question}</p>
              {question.required && (
                <span className="text-red-500 text-sm">* Required</span>
              )}
            </div>
            {renderQuestion(question, index)}
          </div>
        ))}

        <div className="flex justify-end gap-4">
          <button
            type="button"
            onClick={() => navigate('/surveys')}
            className="btn-secondary"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="btn-primary"
          >
            {submitting ? 'Submitting...' : 'Submit Survey'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default SurveyDetail; 