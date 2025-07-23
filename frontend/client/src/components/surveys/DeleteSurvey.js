import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { TrashIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../../contexts/AuthContext';

const DeleteSurvey = () => {
  const { user } = useAuth();
  const [surveys, setSurveys] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(null);

  useEffect(() => {
    fetchSurveys();
  }, []);

  const fetchSurveys = async () => {
    try {
      const response = await axios.get('/api/surveys');
      setSurveys(response.data);
    } catch (error) {
      console.error('Error fetching surveys:', error);
      toast.error('Failed to fetch surveys');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (surveyId, title) => {
    if (window.confirm(`Are you sure you want to delete "${title}"? This action cannot be undone.`)) {
      setDeleting(surveyId);
      try {
        await axios.delete(`/api/surveys/${surveyId}`);
        toast.success('Survey deleted successfully');
        fetchSurveys();
      } catch (error) {
        console.error('Error deleting survey:', error);
        toast.error('Failed to delete survey');
      } finally {
        setDeleting(null);
      }
    }
  };

  const canDelete = (survey) => {
    return user?.role === 'admin' || user?.role === 'hr' || 
           (user?.role === 'manager' && survey.createdBy?._id === user.id);
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64">Loading surveys...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="bg-red-100 p-2 rounded-lg">
          <TrashIcon className="h-8 w-8 text-red-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Delete Surveys</h1>
          <p className="text-gray-600">Permanently remove surveys from the system</p>
        </div>
      </div>

      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex items-center">
          <ExclamationTriangleIcon className="h-5 w-5 text-yellow-600 mr-2" />
          <p className="text-yellow-800 text-sm">
            Warning: Deleting a survey will permanently remove all associated responses and data.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {surveys.filter(survey => canDelete(survey)).map((survey) => (
          <div key={survey._id} className="card border-red-200">
            <div className="flex justify-between items-start mb-4">
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {survey.title}
                </h3>
                <p className="text-gray-600 text-sm mb-3">
                  {survey.description}
                </p>
                <div className="flex items-center gap-2 mb-3">
                  <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                    {survey.category}
                  </span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    survey.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {survey.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <div className="text-sm text-gray-500">
                  <p>Created by: {survey.createdBy?.firstName} {survey.createdBy?.lastName}</p>
                  <p>Questions: {survey.questions?.length || 0}</p>
                  <p>Responses: {survey.responses?.length || 0}</p>
                </div>
              </div>
            </div>

            <button
              onClick={() => handleDelete(survey._id, survey.title)}
              disabled={deleting === survey._id}
              className="w-full btn-danger flex items-center justify-center"
            >
              <TrashIcon className="h-4 w-4 mr-2" />
              {deleting === survey._id ? 'Deleting...' : 'Delete Survey'}
            </button>
          </div>
        ))}
      </div>

      {surveys.filter(survey => canDelete(survey)).length === 0 && (
        <div className="text-center py-12">
          <TrashIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No surveys to delete</h3>
          <p className="text-gray-500">
            You don't have permission to delete any surveys or no surveys exist.
          </p>
        </div>
      )}
    </div>
  );
};

export default DeleteSurvey;
