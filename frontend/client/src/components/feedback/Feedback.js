import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import {
  ChartBarIcon,
  DocumentTextIcon,
  EyeIcon,
  ArrowDownTrayIcon,
  FunnelIcon,
  UsersIcon,
  CalendarIcon,
  ClockIcon,
  ArrowTrendingUpIcon,
  ChartBarSquareIcon,
  MagnifyingGlassIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '../../contexts/AuthContext';

const Feedback = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('responses');
  const [responses, setResponses] = useState([]);
  const [allResponses, setAllResponses] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [surveys, setSurveys] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSurvey, setSelectedSurvey] = useState(null);
  const [showResponseModal, setShowResponseModal] = useState(false);
  const [filters, setFilters] = useState({
    survey: '',
    department: '',
    startDate: '',
    endDate: ''
  });

  useEffect(() => {
    if (activeTab === 'responses') {
      fetchMyResponses();
    } else if (activeTab === 'analytics') {
      fetchAnalytics();
    } else if (activeTab === 'all-responses') {
      fetchAllResponses();
    }
    fetchSurveys();
  }, [activeTab]);

  const fetchMyResponses = async () => {
    try {
      const response = await axios.get('/api/feedback/my-responses');
      setResponses(Array.isArray(response.data) ? response.data : response.data.responses || []);
    } catch (error) {
      console.error('Error fetching my responses:', error);
      setResponses([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchAnalytics = async () => {
    try {
      const response = await axios.get('/api/feedback/analytics', { params: filters });
      setAnalytics(Array.isArray(response.data) ? response.data : response.data.analytics || []);
    } catch (error) {
      console.error('Error fetching analytics:', error);
      setAnalytics([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchSurveys = async () => {
    try {
      const response = await axios.get('/api/surveys');
      setSurveys(Array.isArray(response.data) ? response.data : response.data.surveys || []);
    } catch (error) {
      console.error('Error fetching surveys:', error);
      setSurveys([]);
    }
  };

  const fetchAllResponses = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/feedback/all-responses', { params: filters });
      setAllResponses(Array.isArray(response.data) ? response.data : response.data.responses || []);
    } catch (error) {
      console.error('Error fetching all responses:', error);
      setAllResponses([]);
    } finally {
      setLoading(false);
    }
  };

  const viewSurveyResponses = async (surveyId) => {
    try {
      const response = await axios.get(`/api/surveys/${surveyId}/responses`);
      setSelectedSurvey(response.data);
      setShowResponseModal(true);
    } catch (error) {
      console.error('Error fetching survey responses:', error);
      toast.error('Failed to load survey responses');
    }
  };

  const handleExport = async (surveyId) => {
    try {
      let url = '';
      let filename = '';
      
      if (surveyId === 'all') {
        // Export all responses
        const response = await axios.get('/api/feedback/export-all', {
          responseType: 'blob',
          params: filters
        });
        url = window.URL.createObjectURL(new Blob([response.data]));
        filename = `all-survey-responses-${new Date().toISOString().split('T')[0]}.csv`;
      } else {
        // Export specific survey
        const response = await axios.get(`/api/feedback/export/${surveyId}`, {
          responseType: 'blob'
        });
        url = window.URL.createObjectURL(new Blob([response.data]));
        filename = `survey-responses-${surveyId}.csv`;
      }
      
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success('Export completed');
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Failed to export data');
    }
  };

  const handleExportMyResponses = async () => {
    try {
      const response = await axios.get('/api/feedback/export-my-responses', {
        responseType: 'blob'
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `my-survey-responses-${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success('Export completed');
    } catch (error) {
      toast.error('Failed to export data');
    }
  };

  const canViewAnalytics = ['hr', 'admin', 'manager'].includes(user?.role);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="bg-green-100 p-2 rounded-lg">
          <DocumentTextIcon className="h-8 w-8 text-green-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Feedback Management</h1>
          <p className="text-gray-600">View and analyze feedback responses</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('responses')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'responses'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            My Responses
          </button>
          {canViewAnalytics && (
            <>
              <button
                onClick={() => setActiveTab('all-responses')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'all-responses'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                All Responses
              </button>
              <button
                onClick={() => setActiveTab('analytics')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'analytics'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                Analytics
              </button>
            </>
          )}
        </nav>
      </div>

      {/* My Responses Tab */}
      {activeTab === 'responses' && (
        <div className="card">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">My Survey Responses</h2>
            {responses.length > 0 && (
              <button
                onClick={handleExportMyResponses}
                className="btn-secondary flex items-center gap-2 px-4 py-2"
              >
                <ArrowDownTrayIcon className="h-4 w-4" />
                Export My Responses
              </button>
            )}
          </div>
          {loading ? (
            <div className="text-center py-8">Loading...</div>
          ) : responses.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No responses found. <Link to="/surveys" className="text-blue-600 hover:underline">Take a survey</Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Survey
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Category
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Submitted
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {responses.map((response) => (
                    <tr key={response._id}>
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">
                          {response.survey?.title}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                          {response.survey?.category}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {new Date(response.submittedAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4">
                        <button className="text-blue-600 hover:text-blue-900">
                          <EyeIcon className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* All Responses Tab */}
      {activeTab === 'all-responses' && canViewAnalytics && (
        <div className="space-y-6">
          {/* Filters */}
          <div className="card">
            <h3 className="text-lg font-semibold mb-4">Filters</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <select
                value={filters.survey}
                onChange={(e) => setFilters({...filters, survey: e.target.value})}
                className="input-field"
              >
                <option value="">All Surveys</option>
                {surveys.map(survey => (
                  <option key={survey._id} value={survey._id}>{survey.title}</option>
                ))}
              </select>
              <input
                type="date"
                value={filters.startDate}
                onChange={(e) => setFilters({...filters, startDate: e.target.value})}
                className="input-field"
                placeholder="Start Date"
              />
              <input
                type="date"
                value={filters.endDate}
                onChange={(e) => setFilters({...filters, endDate: e.target.value})}
                className="input-field"
                placeholder="End Date"
              />
              <button
                onClick={fetchAllResponses}
                className="btn-primary flex items-center justify-center"
              >
                <FunnelIcon className="h-4 w-4 mr-2" />
                Apply Filters
              </button>
            </div>
          </div>

          {/* All Responses Table */}
          <div className="card">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">All Survey Responses</h2>
              {allResponses.length > 0 && (
                <button
                  onClick={() => handleExport(filters.survey || 'all')}
                  className="btn-secondary flex items-center gap-2 px-4 py-2"
                >
                  <ArrowDownTrayIcon className="h-4 w-4" />
                  Export All Responses
                </button>
              )}
            </div>
            {loading ? (
              <div className="text-center py-8">Loading...</div>
            ) : allResponses.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No responses found.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Survey
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Respondent
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Department
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Submitted
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {allResponses.map((response) => (
                      <tr key={response._id}>
                        <td className="px-6 py-4">
                          <div className="text-sm font-medium text-gray-900">
                            {response.survey?.title}
                          </div>
                          <div className="text-sm text-gray-500">
                            {response.survey?.category}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900">
                            {response.respondent?.firstName} {response.respondent?.lastName}
                          </div>
                          <div className="text-sm text-gray-500">
                            {response.respondent?.email}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                            {response.respondent?.department?.name || 'N/A'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500">
                          {new Date(response.submittedAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex space-x-2">
                            <button 
                              onClick={() => viewSurveyResponses(response.survey._id)}
                              className="text-blue-600 hover:text-blue-900"
                              title="View Responses"
                            >
                              <EyeIcon className="h-4 w-4" />
                            </button>
                            <button 
                              onClick={() => handleExport(response.survey._id)}
                              className="text-green-600 hover:text-green-900"
                              title="Export CSV"
                            >
                              <ArrowDownTrayIcon className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Analytics Tab */}
      {activeTab === 'analytics' && canViewAnalytics && (
        <div className="space-y-6">
          {/* Filters */}
          <div className="card">
            <h3 className="text-lg font-semibold mb-4">Filters</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <select
                value={filters.survey}
                onChange={(e) => setFilters({...filters, survey: e.target.value})}
                className="input-field"
              >
                <option value="">All Surveys</option>
                {surveys.map(survey => (
                  <option key={survey._id} value={survey._id}>{survey.title}</option>
                ))}
              </select>
              <input
                type="date"
                value={filters.startDate}
                onChange={(e) => setFilters({...filters, startDate: e.target.value})}
                className="input-field"
                placeholder="Start Date"
              />
              <input
                type="date"
                value={filters.endDate}
                onChange={(e) => setFilters({...filters, endDate: e.target.value})}
                className="input-field"
                placeholder="End Date"
              />
              <button
                onClick={fetchAnalytics}
                className="btn-primary flex items-center justify-center"
              >
                <FunnelIcon className="h-4 w-4 mr-2" />
                Apply Filters
              </button>
            </div>
          </div>

          {/* Analytics Cards */}
          {analytics && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="card">
                <div className="flex items-center">
                  <div className="bg-blue-100 p-3 rounded-lg">
                    <ChartBarIcon className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total Responses</p>
                    <p className="text-2xl font-bold text-gray-900">{analytics.totalResponses}</p>
                  </div>
                </div>
              </div>

              <div className="card">
                <div className="flex items-center">
                  <div className="bg-green-100 p-3 rounded-lg">
                    <DocumentTextIcon className="h-6 w-6 text-green-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Categories</p>
                    <p className="text-2xl font-bold text-gray-900">{analytics.responsesByCategory?.length || 0}</p>
                  </div>
                </div>
              </div>

              <div className="card">
                <div className="flex items-center">
                  <div className="bg-yellow-100 p-3 rounded-lg">
                    <ClockIcon className="h-6 w-6 text-yellow-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Avg Response Time</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {Math.round(analytics.avgResponseTime / 60)} min
                    </p>
                  </div>
                </div>
              </div>

              <div className="card">
                <div className="flex items-center">
                  <div className="bg-purple-100 p-3 rounded-lg">
                    <ArrowDownTrayIcon className="h-6 w-6 text-purple-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Export Data</p>
                    <button
                      onClick={() => handleExport(filters.survey || 'all')}
                      className="text-sm text-blue-600 hover:underline"
                    >
                      Download CSV
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Detailed Analytics */}
          {analytics && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Responses by Category */}
              {analytics.responsesByCategory && analytics.responsesByCategory.length > 0 && (
                <div className="card">
                  <h3 className="text-lg font-semibold mb-4">Responses by Category</h3>
                  <div className="space-y-3">
                    {analytics.responsesByCategory.map((item, index) => (
                      <div key={index} className="flex justify-between items-center">
                        <span className="text-sm font-medium text-gray-700 capitalize">{item._id}</span>
                        <div className="flex items-center space-x-2">
                          <div className="w-20 bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-blue-600 h-2 rounded-full" 
                              style={{ width: `${(item.count / analytics.totalResponses) * 100}%` }}
                            ></div>
                          </div>
                          <span className="text-sm text-gray-500 w-16 text-right">{item.count}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Responses by Department */}
              {analytics.responsesByDepartment && analytics.responsesByDepartment.length > 0 && (
                <div className="card">
                  <h3 className="text-lg font-semibold mb-4">Responses by Department</h3>
                  <div className="space-y-3">
                    {analytics.responsesByDepartment.map((item, index) => (
                      <div key={index} className="flex justify-between items-center">
                        <span className="text-sm font-medium text-gray-700">{item._id}</span>
                        <div className="flex items-center space-x-2">
                          <div className="w-20 bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-green-600 h-2 rounded-full" 
                              style={{ width: `${(item.count / analytics.totalResponses) * 100}%` }}
                            ></div>
                          </div>
                          <span className="text-sm text-gray-500 w-16 text-right">{item.count}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Responses Over Time */}
          {analytics?.responsesOverTime && analytics.responsesOverTime.length > 0 && (
            <div className="card">
              <h3 className="text-lg font-semibold mb-4">Responses Over Time (Last 30 Days)</h3>
              <div className="h-64 flex items-end space-x-1">
                {analytics.responsesOverTime.map((item, index) => {
                  const maxCount = Math.max(...analytics.responsesOverTime.map(d => d.count));
                  const height = maxCount > 0 ? (item.count / maxCount) * 100 : 0;
                  return (
                    <div key={index} className="flex-1 flex flex-col items-center">
                      <div 
                        className="w-full bg-blue-500 rounded-t"
                        style={{ height: `${height}%` }}
                        title={`${item._id}: ${item.count} responses`}
                      ></div>
                      <span className="text-xs text-gray-500 mt-1 transform -rotate-45 origin-left">
                        {new Date(item._id).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Survey Responses Modal */}
      {showResponseModal && selectedSurvey && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 max-w-4xl shadow-lg rounded-md bg-white">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Survey Responses: {selectedSurvey.survey?.title}</h3>
              <div className="flex space-x-2">
                <button
                  onClick={() => handleExport(selectedSurvey.survey._id)}
                  className="btn-secondary flex items-center gap-2 px-3 py-1"
                >
                  <ArrowDownTrayIcon className="h-4 w-4" />
                  Export CSV
                </button>
                <button
                  onClick={() => setShowResponseModal(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>
            </div>
            
            <div className="max-h-96 overflow-y-auto">
              {selectedSurvey.responses?.length > 0 ? (
                <div className="space-y-4">
                  {selectedSurvey.responses.map((response, index) => (
                    <div key={response._id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h4 className="font-medium text-gray-900">
                            Response #{index + 1}
                          </h4>
                          <p className="text-sm text-gray-500">
                            By: {response.respondent?.firstName} {response.respondent?.lastName} 
                            ({response.respondent?.email})
                          </p>
                          <p className="text-sm text-gray-500">
                            Submitted: {new Date(response.submittedAt).toLocaleString()}
                          </p>
                        </div>
                      </div>
                      
                      <div className="space-y-3">
                        {response.answers?.map((answer, answerIndex) => (
                          <div key={answerIndex} className="border-l-4 border-blue-500 pl-3">
                            <h5 className="font-medium text-gray-900 mb-1">
                              {answer.question}
                            </h5>
                            <div className="text-gray-700">
                              {Array.isArray(answer.answer) ? (
                                <ul className="list-disc list-inside">
                                  {answer.answer.map((item, i) => (
                                    <li key={i}>{item}</li>
                                  ))}
                                </ul>
                              ) : (
                                <p>{answer.answer || 'No answer provided'}</p>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  No responses found for this survey.
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Feedback; 
