import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { 
  CheckCircleIcon, 
  ExclamationTriangleIcon,
  CalendarIcon,
  UserGroupIcon,
  ClockIcon,
  ArrowLeftIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '../../contexts/AuthContext';

const UserHistory = () => {
  const { user } = useAuth();
  const [completedSurveys, setCompletedSurveys] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCompletedSurveys();
  }, []);

  const fetchCompletedSurveys = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/feedback/my-responses-all');
      console.log('Completed surveys response:', response.data);
      
      setCompletedSurveys(response.data);
    } catch (error) {
      console.error('Error fetching completed surveys:', error);
      toast.error('Failed to fetch completed surveys');
    } finally {
      setLoading(false);
    }
  };

  const getCategoryColor = (category) => {
    switch (category) {
      case 'project': return 'bg-blue-100 text-blue-800';
      case 'manager': return 'bg-purple-100 text-purple-800';
      case 'workplace': return 'bg-green-100 text-green-800';
      case 'training': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
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

  return (
    <div className="p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-4">
            <Link
              to="/user/surveys"
              className="flex items-center text-blue-600 hover:text-blue-700"
            >
              <ArrowLeftIcon className="h-4 w-4 mr-2" />
              Back to Surveys
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Survey History</h1>
              <p className="text-gray-600 mt-1">View all your completed surveys</p>
            </div>
          </div>
          <button
            onClick={fetchCompletedSurveys}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Refresh
          </button>
        </div>

        {/* Completed Surveys List */}
        <div className="space-y-4">
          {completedSurveys.length > 0 ? (
            completedSurveys.map((item) => (
              <div key={item._id} className="bg-white border rounded-lg p-6 hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {item.survey?.title || 'Unknown Survey'}
                    </h3>
                    <p className="text-gray-600 mb-3">
                      {item.survey?.description || 'No description available'}
                    </p>
                    
                    <div className="flex flex-wrap gap-2 mb-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(item.survey?.category)}`}>
                        {item.survey?.category || 'Unknown'}
                      </span>
                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        Completed
                      </span>
                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {item.survey?.questions?.length || 0} questions
                      </span>
                    </div>

                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <div className="flex items-center">
                        <CalendarIcon className="h-4 w-4 mr-1" />
                        Completed: {new Date(item.submissionDate).toLocaleDateString()}
                      </div>
                      <div className="flex items-center">
                        <ClockIcon className="h-4 w-4 mr-1" />
                        Time spent: {Math.round(item.timeSpent / 60)} min
                      </div>
                      {item.survey?.createdBy && (
                        <div className="flex items-center">
                          <UserGroupIcon className="h-4 w-4 mr-1" />
                          By: {item.survey.createdBy.firstName} {item.survey.createdBy.lastName}
                        </div>
                      )}
                    </div>

                    {/* Show a few answers as preview */}
                    <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Your Answers Preview:</h4>
                      <div className="space-y-2">
                        {item.answers?.slice(0, 3).map((answer, index) => (
                          <div key={index} className="text-sm">
                            <span className="font-medium text-gray-600">Q{index + 1}:</span>{' '}
                            <span className="text-gray-800">
                              {Array.isArray(answer.answer) 
                                ? answer.answer.join(', ') 
                                : answer.answer}
                            </span>
                          </div>
                        ))}
                        {item.answers?.length > 3 && (
                          <div className="text-sm text-gray-500">
                            ... and {item.answers.length - 3} more answers
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="ml-4 flex items-center text-green-600">
                    <CheckCircleIcon className="h-5 w-5 mr-1" />
                    <span className="text-sm font-medium">Completed</span>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-12 text-gray-500">
              <CheckCircleIcon className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p className="text-lg font-medium">No completed surveys</p>
              <p className="text-sm">Complete some surveys to see them here</p>
              <Link
                to="/user/surveys"
                className="mt-4 inline-block px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                Take a Survey
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserHistory; 