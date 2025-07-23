import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import {
  ChartBarIcon,
  DocumentTextIcon,
  EyeIcon,
  ArrowDownTrayIcon,
  FunnelIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '../../contexts/AuthContext';

const Feedback = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('responses');
  const [responses, setResponses] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [surveys, setSurveys] = useState([]);
  const [loading, setLoading] = useState(true);
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
    }
    fetchSurveys();
  }, [activeTab]);

  const fetchMyResponses = async () => {
    try {
      const response = await axios.get('/api/feedback/my-responses');
      setResponses(response.data.responses);
    } catch (error) {
      toast.error('Failed to fetch responses');
    } finally {
      setLoading(false);
    }
  };

  const fetchAnalytics = async () => {
    try {
      const response = await axios.get('/api/feedback/analytics', { params: filters });
      setAnalytics(response.data);
    } catch (error) {
      toast.error('Failed to fetch analytics');
    } finally {
      setLoading(false);
    }
  };

  const fetchSurveys = async () => {
    try {
      const response = await axios.get('/api/surveys');
      setSurveys(response.data.surveys || []);
    } catch (error) {
      console.error('Error fetching surveys:', error);
    }
  };

  const handleExport = async (surveyId) => {
    try {
      const response = await axios.get(`/api/feedback/export/${surveyId}`, {
        responseType: 'blob'
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `survey-responses-${surveyId}.csv`);
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
          )}
        </nav>
      </div>

      {/* My Responses Tab */}
      {activeTab === 'responses' && (
        <div className="card">
          <h2 className="text-lg font-semibold mb-4">My Survey Responses</h2>
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
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
                  <div className="bg-purple-100 p-3 rounded-lg">
                    <ArrowDownTrayIcon className="h-6 w-6 text-purple-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Export Data</p>
                    <button
                      onClick={() => handleExport(filters.survey)}
                      className="text-sm text-blue-600 hover:underline"
                      disabled={!filters.survey}
                    >
                      Download CSV
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Responses by Category */}
          {analytics?.responsesByCategory && (
            <div className="card">
              <h3 className="text-lg font-semibold mb-4">Responses by Category</h3>
              <div className="space-y-3">
                {analytics.responsesByCategory.map((item, index) => (
                  <div key={index} className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-700 capitalize">{item._id}</span>
                    <span className="text-sm text-gray-500">{item.count} responses</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Feedback; 
