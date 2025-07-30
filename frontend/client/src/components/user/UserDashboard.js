import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { 
  DocumentTextIcon, 
  ChatBubbleLeftRightIcon,
  CheckCircleIcon,
  ClockIcon,
  CalendarIcon,
  EyeIcon
} from '@heroicons/react/24/outline';

const UserDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    pendingSurveys: 3,
    completedSurveys: 12,
    messages: 2,
    totalFeedback: 8
  });

  const recentSurveys = [
    { id: 1, title: 'Q2 Employee Satisfaction Survey', status: 'pending', dueDate: '2024-06-30' },
    { id: 2, title: 'Remote Work Feedback', status: 'completed', completedDate: '2024-06-15' },
    { id: 3, title: 'Training Program Evaluation', status: 'pending', dueDate: '2024-07-05' },
    { id: 4, title: 'Team Communication Survey', status: 'completed', completedDate: '2024-06-10' }
  ];

  const StatCard = ({ title, value, icon: Icon, color, bgColor }) => (
    <div className="bg-white/80 backdrop-blur-md rounded-2xl p-6 shadow-xl border border-gray-200/50 hover:shadow-2xl transition-all duration-300">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">{value}</p>
        </div>
        <div className={`p-3 rounded-xl ${bgColor}`}>
          <Icon className="h-8 w-8 text-white" />
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white shadow-xl">
        <h1 className="text-3xl font-bold mb-2">
          Welcome back, {user?.firstName || user?.name || 'User'}! 👋
        </h1>
        <p className="text-blue-100 text-lg">
          Here's your feedback activity overview.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Pending Surveys"
          value={stats.pendingSurveys}
          icon={ClockIcon}
          bgColor="bg-gradient-to-r from-orange-500 to-orange-600"
        />
        <StatCard
          title="Completed Surveys"
          value={stats.completedSurveys}
          icon={CheckCircleIcon}
          bgColor="bg-gradient-to-r from-green-500 to-green-600"
        />
        <StatCard
          title="Messages"
          value={stats.messages}
          icon={ChatBubbleLeftRightIcon}
          bgColor="bg-gradient-to-r from-purple-500 to-purple-600"
        />
        <StatCard
          title="Total Feedback"
          value={stats.totalFeedback}
          icon={DocumentTextIcon}
          bgColor="bg-gradient-to-r from-blue-500 to-blue-600"
        />
      </div>

      {/* Recent Surveys */}
      <div className="bg-white/80 backdrop-blur-md rounded-2xl p-6 shadow-xl border border-gray-200/50">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Recent Surveys</h3>
          <button className="text-blue-600 hover:text-blue-800 font-medium">View All</button>
        </div>
        <div className="space-y-4">
          {recentSurveys.map((survey) => (
            <div key={survey.id} className="flex items-center justify-between p-4 bg-gray-50/80 rounded-xl hover:bg-gray-100/80 transition-colors">
              <div className="flex items-center space-x-4">
                <div className={`p-2 rounded-lg ${survey.status === 'pending' ? 'bg-orange-100' : 'bg-green-100'}`}>
                  {survey.status === 'pending' ? (
                    <ClockIcon className="h-5 w-5 text-orange-600" />
                  ) : (
                    <CheckCircleIcon className="h-5 w-5 text-green-600" />
                  )}
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">{survey.title}</h4>
                  <p className="text-sm text-gray-500 flex items-center">
                    <CalendarIcon className="h-4 w-4 mr-1" />
                    {survey.status === 'pending' 
                      ? `Due: ${new Date(survey.dueDate).toLocaleDateString()}`
                      : `Completed: ${new Date(survey.completedDate).toLocaleDateString()}`
                    }
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                  survey.status === 'pending' ? 'bg-orange-100 text-orange-800' : 'bg-green-100 text-green-800'
                }`}>
                  {survey.status}
                </span>
                <button className="text-gray-400 hover:text-gray-600">
                  <EyeIcon className="h-5 w-5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white/80 backdrop-blur-md rounded-2xl p-6 shadow-xl border border-gray-200/50">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="p-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all duration-200 shadow-lg hover:shadow-xl">
            <DocumentTextIcon className="h-6 w-6 mx-auto mb-2" />
            <span className="block text-sm font-medium">Take Survey</span>
          </button>
          <button className="p-4 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl hover:from-green-600 hover:to-green-700 transition-all duration-200 shadow-lg hover:shadow-xl">
            <ChatBubbleLeftRightIcon className="h-6 w-6 mx-auto mb-2" />
            <span className="block text-sm font-medium">View Messages</span>
          </button>
          <button className="p-4 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-xl hover:from-purple-600 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl">
            <CheckCircleIcon className="h-6 w-6 mx-auto mb-2" />
            <span className="block text-sm font-medium">My Feedback</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;

