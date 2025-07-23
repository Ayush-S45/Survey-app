import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { DocumentTextIcon, ClockIcon } from '@heroicons/react/24/outline';

const SubmitFeedback = () => {
  const { surveyId } = useParams();
  const navigate = useNavigate();
  const [survey, setSurvey] = useState(null);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [startTime] = useState(Date.now());

  useEffect(() => {
    fetchSurvey();
  }, [surveyId]);

  const fetchSurvey = async () => {
    try {
      const response = await axios.get(`/api/surveys/${surveyId}`);
      setSurvey(response.data);
      
      // Initialize answers object
      const initialAnswers = {};
      response.data.questions.forEach((_, index) => {
        initialAnswers[index] = '';
      });
      setAnswers(initialAnswers);
    } catch (error) {
      toast.error('Failed to load survey');
      navigate('/surveys');
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
      const timeSpent = Math.floor((Date.now() - startTime) / 1000);
      const answersArray = Object.keys(answers).map(index => ({
        answer: answers[index]
      }));

      await axios.post('/api/feedback', {
        survey: surveyId,
        answers: answersArray,
        timeSpent
      });

      toast.success('Feedback submitted successfully!');
      navigate('/feedback');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to submit feedback');
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
            className="input-field min-h-[100px]"
            placeholder="Enter your response..."
            required={question.required}
          />
        );
      
      case 'rating':
        return (
          <div className="flex space-x-2">
            {[1, 2, 3, 4, 5].map(rating => (
              <button
                key={rating}
                type="button"
                onClick={() => handleAnswerChange(index, rating)}
                className={`w-10 h-10 rounded-full border-2 ${
                  answers[index] === rating
                    ? 'bg-blue-500 border-blue-500 text-white'
                    : 'border-gray-300 hover:border-blue-300'
                }`}
              >
                {rating}
              </button>
            ))}
          </div>
        );
      
      case 'multiple-choice':
        return (
          <div className="space-y-2">
            {question.options?.map((option, optionIndex) => (
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
          <div className="space-y-2">
            {question.options?.map((option, optionIndex) => (
              <label key={optionIndex} className="flex items-center">
                <input
                  type="checkbox"
                  value={option}
                  checked={(answers[index] || []).includes(option)}
                  onChange={(e) => {
                    const currentAnswers = answers[index] || [];
                    if (e.target.checked) {
                      handleAnswerChange(index, [...currentAnswers, option]);
                    } else {
                      handleAnswerChange(index, currentAnswers.filter(a => a !== option));
                    }
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
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-500">Strongly Disagree</span>
            <div className="flex space-x-2">
              {[1, 2, 3, 4, 5].map(scale => (
                <button
                  key={scale}
                  type="button"
                  onClick={() => handleAnswerChange(index, scale)}
                  className={`w-8 h-8 rounded-full border-2 ${
                    answers[index] === scale
                      ? 'bg-blue-500 border-blue-500 text-white'
                      : 'border-gray-300 hover:border-blue-300'
                  }`}
                >
                  {scale}
                </button>
              ))}
            </div>
            <span className="text-sm text-gray-500">Strongly Agree</span>
          </div>
        );
      
      default:
        return (
          <input
            type="text"
            value={answers[index] || ''}
            onChange={(e) => handleAnswerChange(index, e.target.value)}
            className="input-field"
            required={question.required}
          />
        );
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64">Loading survey...</div>;
  }

  if (!survey) {
    return <div className="text-center text-red-600">Survey not found</div>;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="bg-blue-100 p-2 rounded-lg">
          <DocumentTextIcon className="h-8 w-8 text-blue-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{survey.title}</h1>
          <p className="text-gray-600">{survey.description}</p>
        </div>
      </div>

      {/* Survey Info */}
      <div className="card">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
              {survey.category}
            </span>
            <div className="flex items-center text-gray-500">
              <ClockIcon className="h-4 w-4 mr-1" />
              <span className="text-sm">Estimated time: 5-10 minutes</span>
            </div>
          </div>
          <div className="text-sm text-gray-500">
            {survey.questions?.length} questions
          </div>
        </div>
      </div>

      {/* Questions */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {survey.questions?.map((question, index) => (
          <div key={index} className="card">
            <div className="mb-4">
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {index + 1}. {question.question}
                {question.required && <span className="text-red-500 ml-1">*</span>}
              </h3>
              {question.description && (
                <p className="text-sm text-gray-600 mb-3">{question.description}</p>
              )}
            </div>
            {renderQuestion(question, index)}
          </div>
        ))}

        {/* Submit Button */}
        <div className="flex justify-end space-x-4">
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
            {submitting ? 'Submitting...' : 'Submit Feedback'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default SubmitFeedback;
