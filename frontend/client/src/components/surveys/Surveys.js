import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import axios from 'axios';
import toast from 'react-hot-toast';
import {
  PlusIcon,
  ClipboardDocumentListIcon
} from '@heroicons/react/24/outline';
import LoadingSpinner from '../common/LoadingSpinner';

const Surveys = () => {
  const { user } = useAuth();
  const [surveys, setSurveys] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchSurveys();
  }, []);

  const fetchSurveys = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/surveys');
      console.log('Surveys response:', response.data);
      
      const surveysData = Array.isArray(response.data) ? response.data : response.data.surveys || [];
      
      // Fetch response counts for each survey
      const surveysWithResponses = await Promise.all(
        surveysData.map(async (survey) => {
          try {
            const responsesResponse = await axios.get(`/api/feedback/all-responses?survey=${survey._id}`);
            const responseCount = responsesResponse.data.responses?.length || 0;
            return {
              ...survey,
              responseCount
            };
          } catch (error) {
            console.error('Error fetching responses for survey:', survey._id, error);
            return {
              ...survey,
              responseCount: 0
            };
          }
        })
      );
      
      setSurveys(surveysWithResponses);
    } catch (error) {
      console.error('Error fetching surveys:', error);
      toast.error('Failed to fetch surveys');
      setSurveys([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredSurveys = surveys.filter(survey => {
    if (filter === 'all') return true;
    if (filter === 'active') return survey.isActive;
    if (filter === 'inactive') return !survey.isActive;
    return survey.category === filter;
  });

  if (loading) {
    return <LoadingSpinner size="lg" className="h-64" />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-md rounded-2xl p-6 shadow-xl border border-gray-200/50">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Survey Management
            </h1>
            <p className="text-gray-600 mt-1">Create and manage feedback surveys</p>
          </div>
          <Link
            to="/surveys/create"
            className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl hover:from-blue-600 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl"
          >
            <PlusIcon className="h-5 w-5 mr-2" />
            Create Survey
          </Link>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-4">
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="input-field max-w-xs"
        >
          <option value="all">All Surveys</option>
          <option value="active">Active Only</option>
          <option value="inactive">Inactive Only</option>
          <option value="project">Project Surveys</option>
          <option value="manager">Manager Surveys</option>
          <option value="workplace">Workplace Surveys</option>
          <option value="general">General Surveys</option>
        </select>
      </div>

      {/* Surveys Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredSurveys.map((survey) => (
          <div key={survey._id} className="bg-white/80 backdrop-blur-md rounded-2xl p-6 shadow-xl border border-gray-200/50 hover:shadow-2xl transition-all duration-200">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-lg font-bold text-gray-900 line-clamp-2">{survey.title}</h3>
              <div className="flex flex-col gap-1">
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                  survey.isActive 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  {survey.isActive ? 'Active' : 'Inactive'}
                </span>
                {survey.responseCount > 0 && (
                  <span className="px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    {survey.responseCount} Response{survey.responseCount !== 1 ? 's' : ''}
                  </span>
                )}
              </div>
            </div>
            
            <p className="text-gray-600 text-sm mb-4 line-clamp-3">{survey.description}</p>
            
            <div className="space-y-3 mb-6">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Questions:</span>
                <span className="text-sm font-medium text-gray-900">{survey.questions?.length || 0}</span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Responses:</span>
                <span className="text-sm font-medium text-gray-900">{survey.responseCount || 0}</span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Created:</span>
                <span className="text-sm font-medium text-gray-900">
                  {new Date(survey.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>
            
            <div className="flex space-x-2">
              <Link
                to={survey.responseCount > 0 ? `/surveys/${survey._id}/responses` : `/surveys/${survey._id}`}
                className="flex-1 bg-blue-50 text-blue-600 py-2 px-3 rounded-lg text-sm font-medium hover:bg-blue-100 transition-colors text-center"
              >
                {survey.responseCount > 0 ? `View Responses (${survey.responseCount})` : 'View'}
              </Link>
              <Link
                to={`/surveys/edit/${survey._id}`}
                className="flex-1 bg-green-50 text-green-600 py-2 px-3 rounded-lg text-sm font-medium hover:bg-green-100 transition-colors text-center"
              >
                Edit
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Surveys; 
