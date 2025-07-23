import React, { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import {
  ClipboardDocumentListIcon,
  Bars3Icon,
  XMarkIcon,
  BellIcon,
  ChevronDownIcon,
  UserCircleIcon,
  ArrowRightOnRectangleIcon,
  ChatBubbleLeftRightIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';

const Layout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [notificationOpen, setNotificationOpen] = useState(false);

  const navigation = [
    { name: 'Dashboard', href: '/', icon: ClipboardDocumentListIcon },
    { name: 'Surveys', href: '/surveys', icon: ClipboardDocumentListIcon },
    { name: 'Create Survey', href: '/surveys/create', icon: ClipboardDocumentListIcon },
    { name: 'Feedback', href: '/feedback', icon: ClipboardDocumentListIcon },
    { name: 'Messages', href: '/messages', icon: ChatBubbleLeftRightIcon },
    { name: 'Users', href: '/users', icon: ClipboardDocumentListIcon },
    { name: 'Add User', href: '/users/add', icon: ClipboardDocumentListIcon },
    { name: 'Departments', href: '/departments', icon: ClipboardDocumentListIcon },
  ];

  const notifications = [
    { id: 1, message: "New survey response received", time: "2 min ago", unread: true },
    { id: 2, message: "User John Doe completed feedback", time: "1 hour ago", unread: true },
    { id: 3, message: "Monthly report is ready", time: "3 hours ago", unread: false },
  ];

  const unreadCount = notifications.filter(n => n.unread).length;

  const isActive = (path) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top navigation bar */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8">
          {/* Logo and navigation */}
          <div className="flex items-center space-x-8">
            <div className="flex items-center">
              <ClipboardDocumentListIcon className="h-8 w-8 text-blue-600" />
              <span className="ml-2 text-xl font-bold text-gray-900">FeedbackPro</span>
            </div>
            
            {/* Navigation menu */}
            <nav className="hidden md:flex space-x-6">
              {navigation.map((item) => (
                <button
                  key={item.name}
                  onClick={() => navigate(item.href)}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive(item.href)
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  {item.name}
                </button>
              ))}
            </nav>
          </div>
          
          {/* User info and actions */}
          <div className="flex items-center space-x-4">
            {/* Notifications */}
            <div className="relative">
              <button
                onClick={() => setNotificationOpen(!notificationOpen)}
                className="relative p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100"
              >
                <BellIcon className="h-6 w-6" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                    {unreadCount}
                  </span>
                )}
              </button>

              {/* Notification dropdown */}
              {notificationOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                  <div className="p-4 border-b border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900">Notifications</h3>
                  </div>
                  <div className="max-h-64 overflow-y-auto">
                    {notifications.map((notification) => (
                      <div key={notification.id} className={`p-4 border-b border-gray-100 hover:bg-gray-50 ${notification.unread ? 'bg-blue-50' : ''}`}>
                        <p className="text-sm text-gray-900">{notification.message}</p>
                        <p className="text-xs text-gray-500 mt-1">{notification.time}</p>
                      </div>
                    ))}
                  </div>
                  <div className="p-3 text-center border-t border-gray-200">
                    <button className="text-sm text-blue-600 hover:text-blue-800">View all notifications</button>
                  </div>
                </div>
              )}
            </div>

            {/* User dropdown */}
            <div className="relative">
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="relative">
                  <div className="h-8 w-8 bg-blue-600 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm font-semibold">
                      {user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}
                    </span>
                  </div>
                  {/* Online indicator */}
                  <div className="absolute -bottom-0.5 -right-0.5 h-3 w-3 bg-green-400 border-2 border-white rounded-full"></div>
                </div>
                <div className="hidden sm:block text-left">
                  <p className="text-sm font-medium text-gray-900">
                    {user?.firstName} {user?.lastName}
                  </p>
                  <p className="text-xs text-gray-500">{user?.role}</p>
                </div>
                <ChevronDownIcon className="h-4 w-4 text-gray-400" />
              </button>

              {/* Dropdown menu */}
              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                  <div className="py-1">
                    <button
                      onClick={() => {
                        navigate('/profile');
                        setDropdownOpen(false);
                      }}
                      className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      <UserCircleIcon className="h-4 w-4 mr-3" />
                      Profile
                    </button>
                    <button
                      onClick={() => {
                        navigate('/messages');
                        setDropdownOpen(false);
                      }}
                      className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      <ChatBubbleLeftRightIcon className="h-4 w-4 mr-3" />
                      Messages
                    </button>
                    <hr className="my-1" />
                    <button
                      onClick={() => {
                        logout();
                        setDropdownOpen(false);
                      }}
                      className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      <ArrowRightOnRectangleIcon className="h-4 w-4 mr-3" />
                      Sign out
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <main className="flex-1 p-6">
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;




