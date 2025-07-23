import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { UserGroupIcon, DocumentTextIcon, ChatBubbleLeftRightIcon, ArrowTrendingUpIcon, PlusIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../../contexts/AuthContext';

const mockFeedbackCategories = [
  { name: 'Course Quality', count: 45 },
  { name: 'Instructor', count: 36 },
  { name: 'Materials', count: 42 },
  { name: 'Support', count: 33 },
  { name: 'Platform', count: 28 },
];

const mockRatingDistribution = [
  { name: '5 Stars', value: 120 },
  { name: '4 Stars', value: 89 },
  { name: '3 Stars', value: 45 },
  { name: '2 Stars', value: 20 },
  { name: '1 Star', value: 10 },
];

const mockStats = [
  {
    name: 'Total Forms',
    value: 12,
    icon: DocumentTextIcon,
  },
  {
    name: 'Total Responses',
    value: 284,
    icon: ChatBubbleLeftRightIcon,
  },
  {
    name: 'Active Users',
    value: 67,
    icon: UserGroupIcon,
  },
  {
    name: 'Avg Rating',
    value: '4.2/5',
    icon: ArrowTrendingUpIcon,
  },
];

const mockAnalytics = [
  { metric: 'Response Rate', value: '85%', change: 12 },
  { metric: 'Completion Rate', value: '92%', change: 5 },
  { metric: 'Avg Time', value: '3.2 min', change: -8 },
  { metric: 'Satisfaction', value: '4.5/5', change: 15 },
];

const mockForms = [
  {
    title: 'Q4 Product Feedback',
    status: 'active',
    created: '2024-01-15',
    responses: 23,
  },
  {
    title: 'Course Evaluation',
    status: 'active',
    created: '2024-01-12',
    responses: 45,
  },
  {
    title: 'Service Assessment',
    status: 'completed',
    created: '2024-01-10',
    responses: 67,
  },
];

const COLORS = ['#00C49F', '#0088FE', '#FFBB28', '#FF8042', '#FF5C8A'];

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(mockStats);
  const [feedbackCategories, setFeedbackCategories] = useState(mockFeedbackCategories);
  const [ratingDistribution, setRatingDistribution] = useState(mockRatingDistribution);
  const [analytics, setAnalytics] = useState(mockAnalytics);
  const [forms, setForms] = useState(mockForms);
  const [loading, setLoading] = useState(false);

  // Show mock data for demo admin accounts
  const isDemoAdmin = user && user.role === 'admin' && (
    user.email === 'demo' || user.email === 'demo@gmail.com' || user.email === 'admin@demo.com'
  );

  useEffect(() => {
    if (!isDemoAdmin && user) {
      setLoading(true);
      Promise.all([
        axios.get('/api/dashboard/stats'),
        axios.get('/api/dashboard/feedback-categories'),
        axios.get('/api/dashboard/rating-distribution'),
        axios.get('/api/dashboard/analytics'),
        axios.get('/api/dashboard/forms'),
      ])
        .then(([statsRes, catRes, ratingRes, analyticsRes, formsRes]) => {
          setStats(statsRes.data || mockStats);
          setFeedbackCategories(catRes.data || mockFeedbackCategories);
          setRatingDistribution(ratingRes.data || mockRatingDistribution);
          setAnalytics(analyticsRes.data || mockAnalytics);
          setForms(formsRes.data || mockForms);
        })
        .catch((err) => {
          console.error('Dashboard API error:', err);
          // Keep using mock data on error
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [user, isDemoAdmin]);

  if (loading) {
    return <div className="flex justify-center items-center h-64 text-lg">Loading dashboard...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Welcome back, {user?.firstName}!
          </h1>
          <p className="text-gray-500 text-sm">
            {user?.role === 'admin' ? 'Admin Dashboard' : 'Employee Dashboard'} • {user?.department?.name || 'No Department'}
          </p>
        </div>
        <div className="flex gap-2">
          <Link
            to="/surveys/create"
            className="flex items-center gap-1 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition"
          >
            <PlusIcon className="h-5 w-5" />
            Create Survey
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white p-6 rounded-lg shadow border">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <stat.icon className="h-8 w-8 text-blue-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    {stat.name}
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {stat.value}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Feedback Categories Chart */}
        <div className="bg-white p-6 rounded-lg shadow border">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Feedback Categories</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={feedbackCategories}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#3B82F6" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Rating Distribution Chart */}
        <div className="bg-white p-6 rounded-lg shadow border">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Rating Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={ratingDistribution}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {ratingDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent Activity and Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Forms */}
        <div className="bg-white p-6 rounded-lg shadow border">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">Recent Forms</h3>
            <Link
              to="/surveys"
              className="text-sm text-blue-600 hover:text-blue-500 font-medium"
            >
              View all
            </Link>
          </div>
          <div className="space-y-3">
            {forms.slice(0, 5).map((form, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="text-sm font-medium text-gray-900">{form.title}</p>
                  <p className="text-xs text-gray-500">{form.responses} responses</p>
                </div>
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                  form.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                }`}>
                  {form.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Analytics Overview */}
        <div className="bg-white p-6 rounded-lg shadow border">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Analytics Overview</h3>
          <div className="space-y-4">
            {analytics.map((item, index) => (
              <div key={index} className="flex items-center justify-between">
                <span className="text-sm text-gray-600">{item.metric}</span>
                <div className="flex items-center">
                  <span className="text-sm font-medium text-gray-900 mr-2">{item.value}</span>
                  <span className={`text-xs ${item.change > 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {item.change > 0 ? '+' : ''}{item.change}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 








