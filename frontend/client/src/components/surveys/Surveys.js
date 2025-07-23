import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import axios from 'axios';
import toast from 'react-hot-toast';
import {
  PlusIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  ClipboardDocumentListIcon
} from '@heroicons/react/24/outline';
import LoadingSpinner from '../common/LoadingSpinner';
import ProfilePicture from '../common/ProfilePicture';

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
      const response = await axios.get('/api/surveys');
      setSurveys(response.data.surveys);
    } catch (error) {
      console.error('Error fetching surveys:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (surveyId) => {
    if (window.confirm('Are you sure you want to delete this survey?')) {
      try {
        await axios.delete(`/api/surveys/${surveyId}`);
        toast.success('Survey deleted successfully');
        fetchSurveys(); // Refresh the list
      } catch (error) {
        console.error('Error deleting survey:', error);
        toast.error('Failed to delete survey');
      }
    }
  };

  const filteredSurveys = surveys.filter(survey => {
    if (filter === 'all') return true;
    if (filter === 'active') return survey.isActive;
    if (filter === 'inactive') return !survey.isActive;
    return survey.category === filter;
  });

  const getCategoryColor = (category) => {
    const colors = {
      project: 'bg-blue-100 text-blue-800',
      manager: 'bg-green-100 text-green-800',
      workplace: 'bg-purple-100 text-purple-800',
      general: 'bg-gray-100 text-gray-800',
      custom: 'bg-orange-100 text-orange-800'
    };
    return colors[category] || colors.general;
  };

  if (loading) {
    return <LoadingSpinner size="lg" className="h-64" />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Surveys</h1>
          <p className="text-gray-600">Manage and participate in surveys</p>
        </div>
        {(user?.role === 'admin' || user?.role === 'hr' || user?.role === 'manager') && (
          <Link
            to="/surveys/create"
            className="btn-primary flex items-center"
          >
            <PlusIcon className="h-5 w-5 mr-2" />
            Create Survey
          </Link>
        )}
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
      {filteredSurveys.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredSurveys.map((survey) => (
            <div key={survey._id} className="card hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {survey.title}
                  </h3>
                  <p className="text-gray-600 text-sm mb-3">
                    {survey.description}
                  </p>
                  <div className="flex items-center gap-2 mb-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(survey.category)}`}>
                      {survey.category}
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      survey.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {survey.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  <div className="text-sm text-gray-500">
                    <div className="flex items-center mb-2">
                      <ProfilePicture user={survey.createdBy} size="xs" className="mr-2" />
                      <span>Created by: {survey.createdBy?.firstName} {survey.createdBy?.lastName}</span>
                    </div>
                    <p>Questions: {survey.questions?.length || 0}</p>
                    <p>Estimated time: {survey.estimatedTime || 5} min</p>
                  </div>
                </div>
              </div>

              <div className="flex gap-2">
                <Link
                  to={`/surveys/${survey._id}`}
                  className="btn-secondary flex items-center text-sm"
                >
                  <EyeIcon className="h-4 w-4 mr-1" />
                  View
                </Link>
                
                {(user?.role === 'admin' || user?.role === 'hr' || 
                  (user?.role === 'manager' && survey.createdBy?._id === user.id)) && (
                  <>
                    <Link
                      to={`/surveys/${survey._id}/edit`}
                      className="btn-secondary flex items-center text-sm"
                    >
                      <PencilIcon className="h-4 w-4 mr-1" />
                      Edit
                    </Link>
                    <button
                      onClick={() => handleDelete(survey._id)}
                      className="btn-danger flex items-center text-sm"
                    >
                      <TrashIcon className="h-4 w-4 mr-1" />
                      Delete
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <ClipboardDocumentListIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No surveys found</h3>
          <p className="text-gray-500">
            {filter === 'all' 
              ? 'No surveys have been created yet.' 
              : `No ${filter} surveys found.`
            }
          </p>
        </div>
      )}
    </div>
  );
};

export default Surveys; 
