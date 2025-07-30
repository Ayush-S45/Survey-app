import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import { Toaster } from 'react-hot-toast';

// Layout
import Layout from './components/layout/Layout';

// Auth Components
import Login from './components/auth/Login';
import Register from './components/auth/Register';

// Landing Page
import LandingPage from './components/landing/LandingPage';

// Dashboard
import Dashboard from './components/dashboard/Dashboard';

// Survey Components
import Surveys from './components/surveys/Surveys';
import SurveyDetail from './components/surveys/SurveyDetail';
import SurveyResponses from './components/surveys/SurveyResponses';
import CreateSurvey from './components/surveys/CreateSurvey';
import DeleteSurvey from './components/surveys/DeleteSurvey';
import EditSurvey from './components/surveys/EditSurvey';

// Other Components
import Feedback from './components/feedback/Feedback';
import Users from './components/users/Users';
import AddUser from './components/users/AddUser';
import Departments from './components/departments/Departments';
import Profile from './components/profile/Profile';
import DemoLogin from './components/DemoLogin';
import UserPage from './components/UserPage';
import CreateForm from './components/forms/CreateForm';
import SubmitFeedback from './components/feedback/SubmitFeedback';
import DeleteUser from './components/users/DeleteUser';
import EditUser from './components/users/EditUser';
import Complaints from './components/complaints/Complaints';
import Messages from './components/messages/Messages';

// User Components
import UserDashboard from './components/user/UserDashboard';
import UserProfile from './components/user/UserProfile';
import UserSurveys from './components/user/UserSurveys';
import TakeSurvey from './components/user/TakeSurvey';
import UserMessages from './components/user/UserMessages';
import UserFeedback from './components/user/UserFeedback';
import UserHistory from './components/user/UserHistory';

function App() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <div className="App">
        <Toaster position="top-right" />
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={user ? <Navigate to="/dashboard" /> : <LandingPage />} />
          <Route path="/login" element={user ? <Navigate to="/dashboard" /> : <Login />} />
          <Route path="/register" element={user ? <Navigate to="/dashboard" /> : <Register />} />
          {/* Demo Login and UserPage Demo Routes */}
          <Route path="/demo-login" element={<DemoLogin />} />
          <Route path="/user/:email" element={<UserPage />} />
          
          {/* Protected Routes */}
          {user && (
            <Route path="/" element={<Layout />}>
              <Route path="dashboard" element={user.role === 'admin' || user.role === 'hr' ? <Dashboard /> : <UserDashboard />} />
              <Route path="user/dashboard" element={<UserDashboard />} />
              <Route path="user/surveys" element={<UserSurveys />} />
              <Route path="user/feedback" element={<UserFeedback />} />
              <Route path="user/messages" element={<UserMessages />} />
              <Route path="user/profile" element={<UserProfile />} />
              <Route path="user/history" element={<UserHistory />} />
              <Route path="user/surveys/:id" element={<TakeSurvey />} />
              <Route path="surveys" element={<Surveys />} />
              <Route path="surveys/create" element={<CreateSurvey />} />
              <Route path="surveys/delete" element={<DeleteSurvey />} />
              <Route path="surveys/:id" element={<SurveyDetail />} />
              <Route path="surveys/:id/responses" element={<SurveyResponses />} />
              <Route path="surveys/:id/edit" element={<EditSurvey />} />
              <Route path="feedback" element={<Feedback />} />
              <Route path="users" element={<Users />} />
              <Route path="users/add" element={<AddUser />} />
              <Route path="departments" element={<Departments />} />
              <Route path="profile" element={<Profile />} />
              <Route path="forms/create" element={<CreateForm />} />
              <Route path="feedback/submit/:surveyId" element={<SubmitFeedback />} />
              <Route path="users/delete" element={<DeleteUser />} />
              <Route path="users/:id/edit" element={<EditUser />} />
              <Route path="complaints" element={<Complaints />} />
              <Route path="messages" element={<Messages />} />
            </Route>
          )}

          {/* Catch all route */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App; 
