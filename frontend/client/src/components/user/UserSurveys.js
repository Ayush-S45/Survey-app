import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useAuth } from '../../contexts/AuthContext';
import { 
  ClockIcon, 
  CheckCircleIcon, 
  ExclamationTriangleIcon,
  CalendarIcon,
  UserGroupIcon
} from '@heroicons/react/24/outline';

const UserSurveys = () => {
  const { user } = useAuth();
  const location = useLocation();
  const [surveys, setSurveys] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('pending');

  const fetchAvailableSurveys = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/surveys/available');
      console.log('Available surveys response:', response.data);
      console.log('Survey details:', response.data.map(s => ({
        id: s._id,
        title: s.title,
        startDate: s.startDate,
        endDate: s.endDate,
        isActive: s.isActive,
        hasSubmitted: s.hasSubmitted
      })));
      
      // For completed surveys, fetch submission details
      const surveysWithDetails = await Promise.all(
        response.data.map(async (survey) => {
          if (survey.hasSubmitted) {
            try {
              const feedbackResponse = await axios.get(`/api/feedback/check-submission/${survey._id}`);
              return {
                ...survey,
                submissionDate: feedbackResponse.data.submissionDate
              };
            } catch (error) {
              console.error('Error fetching submission details:', error);
              return survey;
            }
          }
          return survey;
        })
      );
      
      setSurveys(surveysWithDetails || []);
    } catch (error) {
      console.error('Error fetching surveys:', error);
      toast.error('Failed to fetch surveys');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAvailableSurveys();
  }, []);

  // Refresh surveys when returning from survey completion
  useEffect(() => {
    if (location.state?.refresh) {
      fetchAvailableSurveys();
      toast.success('Survey completed successfully!');
      
      // Switch to completed tab if showCompleted is true
      if (location.state?.showCompleted) {
        setActiveTab('completed');
      }
      
      // Clear the refresh state
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  // Refresh surveys when component comes into focus (after survey completion)
  useEffect(() => {
    const handleFocus = () => {
      fetchAvailableSurveys();
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, []);

  const pendingSurveys = surveys.filter(survey => !survey.hasSubmitted);
  const completedSurveys = surveys.filter(survey => survey.hasSubmitted);

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'inactive': return 'bg-gray-100 text-gray-800';
      default: return 'bg-blue-100 text-blue-800';
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
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">My Surveys</h1>
            <p className="text-gray-600 mt-1">View and participate in available surveys</p>
          </div>
          <div className="flex space-x-3">
            <Link
              to="/user/history"
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
            >
              View History
            </Link>
            <button
              onClick={fetchAvailableSurveys}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Refresh
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg mb-6">
          <button
            onClick={() => setActiveTab('pending')}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'pending'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Pending ({pendingSurveys.length})
          </button>
          <button
            onClick={() => setActiveTab('completed')}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'completed'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Completed ({completedSurveys.length})
          </button>
        </div>

        {/* Surveys List */}
        <div className="space-y-4">
          {activeTab === 'pending' ? (
            pendingSurveys.length > 0 ? (
              pendingSurveys.map(survey => (
                <div key={survey._id} className="bg-white border rounded-lg p-6 hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">{survey.title}</h3>
                      <p className="text-gray-600 mb-3">{survey.description}</p>
                      
                      <div className="flex flex-wrap gap-2 mb-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(survey.category)}`}>
                          {survey.category}
                        </span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(survey.isActive ? 'active' : 'inactive')}`}>
                          {survey.isActive ? 'Active' : 'Inactive'}
                        </span>
                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {survey.questions?.length || 0} questions
                        </span>
                      </div>

                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <div className="flex items-center">
                          <CalendarIcon className="h-4 w-4 mr-1" />
                          Ends: {new Date(survey.endDate).toLocaleDateString()}
                        </div>
                        <div className="flex items-center">
                          <ClockIcon className="h-4 w-4 mr-1" />
                          {survey.estimatedTime} min
                        </div>
                        {survey.createdBy && (
                          <div className="flex items-center">
                            <UserGroupIcon className="h-4 w-4 mr-1" />
                            By: {survey.createdBy.firstName} {survey.createdBy.lastName}
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <Link
                      to={`/user/surveys/${survey._id}`}
                      className="ml-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                    >
                      Take Survey
                    </Link>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-12 text-gray-500">
                <ExclamationTriangleIcon className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p className="text-lg font-medium">No pending surveys</p>
                <p className="text-sm">Check back later for new surveys</p>
              </div>
            )
          ) : (
            completedSurveys.length > 0 ? (
              completedSurveys.map(survey => (
                <div key={survey._id} className="bg-white border rounded-lg p-6 hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">{survey.title}</h3>
                      <p className="text-gray-600 mb-3">{survey.description}</p>
                      
                      <div className="flex flex-wrap gap-2 mb-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(survey.category)}`}>
                          {survey.category}
                        </span>
                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          Completed
                        </span>
                      </div>

                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <div className="flex items-center">
                          <CalendarIcon className="h-4 w-4 mr-1" />
                          Completed on: {new Date(survey.submissionDate || survey.createdAt).toLocaleDateString()}
                        </div>
                        {survey.createdBy && (
                          <div className="flex items-center">
                            <UserGroupIcon className="h-4 w-4 mr-1" />
                            By: {survey.createdBy.firstName} {survey.createdBy.lastName}
                          </div>
                        )}
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
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
};

export default UserSurveys;



