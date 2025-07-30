import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  ClockIcon,
  CheckCircleIcon,
  ChatBubbleLeftRightIcon,
  DocumentTextIcon,
  EyeIcon,
  CalendarIcon
} from '@heroicons/react/24/outline';

const UserDashboard = () => {
  const { user } = useAuth();
  const [dashboardData, setDashboardData] = useState({
    pendingSurveys: [],
    completedSurveys: [],
    messages: [],
    totalFeedback: 0,
    stats: {
      pending: 0,
      completed: 0,
      messages: 0,
      feedback: 0
    }
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDashboardData = () => {
      // Test data for user@gmail.com matching the screenshot
      const testData = {
        pendingSurveys: [
          {
            id: 1,
            title: "Q2 Employee Satisfaction Survey",
            dueDate: "30/6/2024",
            status: "pending",
            description: "Help us understand your work experience and satisfaction levels"
          },
          {
            id: 2,
            title: "Training Program Evaluation", 
            dueDate: "5/7/2024",
            status: "pending",
            description: "Evaluate the effectiveness of recent training sessions"
          },
          {
            id: 3,
            title: "Office Environment Feedback",
            dueDate: "15/7/2024", 
            status: "pending",
            description: "Share your thoughts on workplace environment and facilities"
          }
        ],
        completedSurveys: [
          {
            id: 4,
            title: "Remote Work Feedback",
            completedDate: "15/6/2024",
            status: "completed",
            score: 4.5
          },
          {
            id: 5,
            title: "Team Communication Survey",
            completedDate: "10/6/2024", 
            status: "completed",
            score: 4.2
          },
          {
            id: 6,
            title: "Monthly Check-in",
            completedDate: "5/6/2024",
            status: "completed", 
            score: 4.8
          },
          {
            id: 7,
            title: "Project Feedback Survey",
            completedDate: "1/6/2024",
            status: "completed",
            score: 4.0
          },
          {
            id: 8,
            title: "Performance Review",
            completedDate: "25/5/2024",
            status: "completed",
            score: 4.6
          },
          {
            id: 9,
            title: "Workplace Culture Assessment", 
            completedDate: "20/5/2024",
            status: "completed",
            score: 4.3
          },
          {
            id: 10,
            title: "Benefits Satisfaction",
            completedDate: "15/5/2024",
            status: "completed",
            score: 4.1
          },
          {
            id: 11,
            title: "Manager Feedback",
            completedDate: "10/5/2024",
            status: "completed", 
            score: 4.7
          },
          {
            id: 12,
            title: "Q1 Performance Review",
            completedDate: "5/5/2024",
            status: "completed",
            score: 4.4
          },
          {
            id: 13,
            title: "Training Needs Assessment",
            completedDate: "1/5/2024",
            status: "completed",
            score: 4.2
          },
          {
            id: 14,
            title: "Work-Life Balance Survey",
            completedDate: "25/4/2024", 
            status: "completed",
            score: 4.0
          },
          {
            id: 15,
            title: "Technology Tools Feedback",
            completedDate: "20/4/2024",
            status: "completed",
            score: 4.5
          }
        ],
        messages: [
          {
            id: 1,
            title: "Welcome to FeedbackPro!",
            content: "We're excited to have you on our feedback platform.",
            date: "2024-06-20",
            read: true
          },
          {
            id: 2,
            title: "Survey Reminder", 
            content: "You have 3 pending surveys. Please complete them by the due date.",
            date: "2024-06-22",
            read: false
          }
        ],
        totalFeedback: 8
      };

      setDashboardData({
        ...testData,
        stats: {
          pending: 3, // Exact match to screenshot
          completed: 12, // Exact match to screenshot  
          messages: 2, // Exact match to screenshot
          feedback: 8 // Exact match to screenshot
        }
      });
      setLoading(false);
    };

    setTimeout(loadDashboardData, 300);
  }, []);

  const StatCard = ({ title, value, icon: Icon, color, bgColor }) => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">{value}</p>
        </div>
        <div className={`p-3 rounded-lg ${bgColor}`}>
          <Icon className={`h-6 w-6 ${color}`} />
        </div>
      </div>
    </div>
  );

  const SurveyCard = ({ survey, type }) => (
    <div className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-3 flex-1">
          <div className={`p-2 rounded-lg ${type === 'pending' ? 'bg-orange-100' : 'bg-green-100'}`}>
            {type === 'pending' ? (
              <ClockIcon className="h-5 w-5 text-orange-600" />
            ) : (
              <CheckCircleIcon className="h-5 w-5 text-green-600" />
            )}
          </div>
          <div className="flex-1">
            <h3 className="font-medium text-gray-900">{survey.title}</h3>
            <p className="text-sm text-gray-500 mt-1 flex items-center">
              <CalendarIcon className="h-4 w-4 mr-1" />
              {type === 'pending' ? `Due: ${survey.dueDate}` : `Completed: ${survey.completedDate}`}
            </p>
            {survey.description && (
              <p className="text-sm text-gray-600 mt-1">{survey.description}</p>
            )}
          </div>
        </div>
        <div className="flex items-center space-x-2">
          {type === 'completed' && survey.score && (
            <span className="text-sm font-medium text-green-600">
              ★ {survey.score}/5
            </span>
          )}
          <span className={`px-2 py-1 text-xs font-medium rounded-full ${
            type === 'pending' 
              ? 'bg-orange-100 text-orange-800' 
              : 'bg-green-100 text-green-800'
          }`}>
            {type}
          </span>
          <button className="p-1 text-gray-400 hover:text-gray-600 rounded">
            <EyeIcon className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Header - Matching screenshot */}
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl p-6 text-white">
        <h1 className="text-2xl font-bold mb-2">
          Welcome back, {user?.firstName || 'Demo'}! 👋
        </h1>
        <p className="text-blue-100">
          Here's your feedback activity overview.
        </p>
      </div>

      {/* Stats Cards - Use dashboardData.stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Pending Surveys"
          value={dashboardData.stats.pending}
          icon={ClockIcon}
          color="text-orange-600"
          bgColor="bg-orange-100"
        />
        <StatCard
          title="Completed Surveys" 
          value={dashboardData.stats.completed}
          icon={CheckCircleIcon}
          color="text-green-600"
          bgColor="bg-green-100"
        />
        <StatCard
          title="Messages"
          value={dashboardData.stats.messages}
          icon={ChatBubbleLeftRightIcon}
          color="text-purple-600"
          bgColor="bg-purple-100"
        />
        <StatCard
          title="Total Feedback"
          value={dashboardData.stats.feedback}
          icon={DocumentTextIcon}
          color="text-blue-600"
          bgColor="bg-blue-100"
        />
      </div>

      {/* Recent Surveys - Use dashboardData for recent surveys */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-gray-900">Recent Surveys</h2>
          <Link 
            to="/user/surveys" 
            className="text-blue-600 hover:text-blue-800 text-sm font-medium hover:underline"
          >
            View All
          </Link>
        </div>
        <div className="space-y-4">
          {/* Show up to 2 pending and 2 completed surveys as recent */}
          {dashboardData.pendingSurveys.slice(0, 2).map((survey) => (
            <Link key={survey.id} to={`/user/surveys/${survey.id}`} className="block">
              <SurveyCard survey={survey} type="pending" />
            </Link>
          ))}
          {dashboardData.completedSurveys.slice(0, 2).map((survey) => (
            <Link key={survey.id} to={`/user/surveys/${survey.id}`} className="block">
              <SurveyCard survey={survey} type="completed" />
            </Link>
          ))}
        </div>
      </div>

      {/* Quick Actions - Matching screenshot */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-6">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link
            to="/user/surveys"
            className="flex items-center justify-center p-4 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium"
          >
            <DocumentTextIcon className="h-5 w-5 mr-2" />
            Take Survey
          </Link>
          <Link
            to="/user/messages"
            className="flex items-center justify-center p-4 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors font-medium"
          >
            <ChatBubbleLeftRightIcon className="h-5 w-5 mr-2" />
            View Messages
          </Link>
          <Link
            to="/user/feedback"
            className="flex items-center justify-center p-4 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors font-medium"
          >
            <DocumentTextIcon className="h-5 w-5 mr-2" />
            My Feedback
          </Link>
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;



