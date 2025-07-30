import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import axios from 'axios';
import toast from 'react-hot-toast';
import {
  ArrowLeftIcon,
  UserIcon,
  CalendarIcon,
  ClockIcon,
  DocumentTextIcon,
  EyeIcon,
  ArrowDownTrayIcon
} from '@heroicons/react/24/outline';
import LoadingSpinner from '../common/LoadingSpinner';

const SurveyResponses = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const [survey, setSurvey] = useState(null);
  const [responses, setResponses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedResponse, setSelectedResponse] = useState(null);
  const [showResponseModal, setShowResponseModal] = useState(false);

  useEffect(() => {
    fetchSurveyAndResponses();
  }, [id]);

  const fetchSurveyAndResponses = async () => {
    try {
      setLoading(true);
      
      // Fetch survey details
      const surveyResponse = await axios.get(`/api/surveys/${id}`);
      setSurvey(surveyResponse.data);
      
      // Fetch responses
      const responsesResponse = await axios.get(`/api/surveys/${id}/responses`);
      setResponses(responsesResponse.data.responses || []);
      
    } catch (error) {
      console.error('Error fetching survey and responses:', error);
      toast.error('Failed to load survey responses');
    } finally {
      setLoading(false);
    }
  };

  const handleViewResponse = (response) => {
    setSelectedResponse(response);
    setShowResponseModal(true);
  };

  const handleExportCSV = async () => {
    try {
      const response = await axios.get(`/api/feedback/export-all?survey=${id}`, {
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${survey.title}-responses.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      
      toast.success('CSV exported successfully!');
    } catch (error) {
      console.error('Error exporting CSV:', error);
      toast.error('Failed to export CSV');
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

  return (
    <div className="p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-4">
            <Link
              to="/surveys"
              className="flex items-center text-blue-600 hover:text-blue-700"
            >
              <ArrowLeftIcon className="h-4 w-4 mr-2" />
              Back to Surveys
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Survey Responses</h1>
              <p className="text-gray-600 mt-1">{survey.title}</p>
            </div>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={handleExportCSV}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors flex items-center"
            >
              <ArrowDownTrayIcon className="h-4 w-4 mr-2" />
              Export CSV
            </button>
            <button
              onClick={fetchSurveyAndResponses}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Refresh
            </button>
          </div>
        </div>

        {/* Survey Info */}
        <div className="bg-white border rounded-lg p-6 mb-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">{survey.title}</h2>
              <p className="text-gray-600 mb-3">{survey.description}</p>
              
              <div className="flex flex-wrap gap-2 mb-4">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(survey.category)}`}>
                  {survey.category}
                </span>
                <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  {survey.questions?.length || 0} questions
                </span>
                <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  {responses.length} response{responses.length !== 1 ? 's' : ''}
                </span>
              </div>

              <div className="flex items-center space-x-4 text-sm text-gray-500">
                <div className="flex items-center">
                  <CalendarIcon className="h-4 w-4 mr-1" />
                  Created: {new Date(survey.createdAt).toLocaleDateString()}
                </div>
                <div className="flex items-center">
                  <ClockIcon className="h-4 w-4 mr-1" />
                  Est. time: {survey.estimatedTime || 5} min
                </div>
                {survey.createdBy && (
                  <div className="flex items-center">
                    <UserIcon className="h-4 w-4 mr-1" />
                    By: {survey.createdBy.firstName} {survey.createdBy.lastName}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Responses List */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">All Responses</h3>
          
          {responses.length > 0 ? (
            responses.map((response) => (
              <div key={response._id} className="bg-white border rounded-lg p-6 hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <div className="flex items-center space-x-4 mb-2">
                      <h4 className="text-lg font-medium text-gray-900">
                        {response.respondent?.firstName} {response.respondent?.lastName}
                      </h4>
                      <span className="text-sm text-gray-500">
                        {response.respondent?.email}
                      </span>
                      {response.respondent?.employeeId && (
                        <span className="text-sm text-gray-500">
                          ID: {response.respondent.employeeId}
                        </span>
                      )}
                    </div>
                    
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <div className="flex items-center">
                        <CalendarIcon className="h-4 w-4 mr-1" />
                        Submitted: {new Date(response.submittedAt).toLocaleDateString()}
                      </div>
                      <div className="flex items-center">
                        <ClockIcon className="h-4 w-4 mr-1" />
                        Time spent: {Math.round(response.timeSpent / 60)} min
                      </div>
                      {response.respondent?.department && (
                        <div className="flex items-center">
                          <DocumentTextIcon className="h-4 w-4 mr-1" />
                          Dept: {response.respondent.department.name}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <button
                    onClick={() => handleViewResponse(response)}
                    className="ml-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center"
                  >
                    <EyeIcon className="h-4 w-4 mr-2" />
                    View Details
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-12 text-gray-500">
              <DocumentTextIcon className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p className="text-lg font-medium">No responses yet</p>
              <p className="text-sm">This survey hasn't received any responses yet.</p>
            </div>
          )}
        </div>

        {/* Response Modal */}
        {showResponseModal && selectedResponse && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  Response Details
                </h3>
                <button
                  onClick={() => setShowResponseModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>
              
              <div className="space-y-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-2">Respondent Information</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Name:</span>
                      <span className="ml-2 font-medium">
                        {selectedResponse.respondent?.firstName} {selectedResponse.respondent?.lastName}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-600">Email:</span>
                      <span className="ml-2 font-medium">{selectedResponse.respondent?.email}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Employee ID:</span>
                      <span className="ml-2 font-medium">{selectedResponse.respondent?.employeeId || 'N/A'}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Department:</span>
                      <span className="ml-2 font-medium">
                        {selectedResponse.respondent?.department?.name || 'N/A'}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-600">Submitted:</span>
                      <span className="ml-2 font-medium">
                        {new Date(selectedResponse.submittedAt).toLocaleString()}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-600">Time Spent:</span>
                      <span className="ml-2 font-medium">
                        {Math.round(selectedResponse.timeSpent / 60)} minutes
                      </span>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium text-gray-900 mb-4">Answers</h4>
                  <div className="space-y-4">
                    {selectedResponse.answers?.map((answer, index) => (
                      <div key={index} className="border rounded-lg p-4">
                        <h5 className="font-medium text-gray-900 mb-2">
                          Q{index + 1}: {answer.question}
                        </h5>
                        <div className="bg-gray-50 p-3 rounded">
                          <span className="text-gray-700">
                            {Array.isArray(answer.answer) 
                              ? answer.answer.join(', ') 
                              : answer.answer}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end mt-6">
                <button
                  onClick={() => setShowResponseModal(false)}
                  className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SurveyResponses; 