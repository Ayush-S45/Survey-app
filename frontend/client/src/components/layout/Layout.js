import React, { useState } from 'react';
import { Link, Outlet, useNavigate, useLocation } from 'react-router-dom';
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
  ExclamationTriangleIcon,
  UserIcon,
  HomeIcon,
  UsersIcon,
  DocumentTextIcon,
  ChartBarIcon,
  BuildingOfficeIcon,
  XCircleIcon,
  ShieldCheckIcon
} from '@heroicons/react/24/outline';

const Layout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [notificationOpen, setNotificationOpen] = useState(false);

  const getUserRoutes = () => {
    if (!user) return [];
    
    if (user.role === 'admin' || user.role === 'hr') {
      return [
        { name: 'Dashboard', path: '/dashboard', icon: HomeIcon },
        { name: 'Users', path: '/users', icon: UsersIcon },
        { name: 'Surveys', path: '/surveys', icon: DocumentTextIcon },
        { name: 'Feedback', path: '/feedback', icon: ChartBarIcon },
        { name: 'Departments', path: '/departments', icon: BuildingOfficeIcon },
        { name: 'Complaints', path: '/complaints', icon: ExclamationTriangleIcon }
      ];
    } else {
      return [
        { name: 'Dashboard', path: '/dashboard', icon: HomeIcon },
        { name: 'My Surveys', path: '/user/surveys', icon: DocumentTextIcon },
        { name: 'History', path: '/user/history', icon: ChartBarIcon },
        { name: 'Messages', path: '/user/messages', icon: ChatBubbleLeftRightIcon }
      ];
    }
  };

  const userRoutes = getUserRoutes();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Top navigation bar */}
      <div className="bg-white/80 backdrop-blur-md shadow-lg border-b border-gray-200/50">
        <div className="flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8">
          {/* Logo and navigation */}
          <div className="flex items-center space-x-8">
            <div className="flex items-center">
              <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg mr-3">
                <ClipboardDocumentListIcon className="h-6 w-6 text-white" />
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">FeedbackPro</span>
              </div>
            </div>
            
            {/* Desktop Navigation */}
            <nav className="hidden md:flex space-x-1">
              {userRoutes.map((item) => (
                <Link
                  key={item.name}
                  to={item.path}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    location.pathname === item.path
                      ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg'
                      : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50'
                  }`}
                >
                  {item.name}
                </Link>
              ))}
            </nav>
          </div>

          {/* User menu */}
          <div className="flex items-center space-x-4">
            {/* Notifications */}
            <div className="relative">
              <button
                onClick={() => setNotificationOpen(!notificationOpen)}
                className="relative p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
              >
                <BellIcon className="h-6 w-6" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {unreadCount}
                  </span>
                )}
              </button>

              {notificationOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-gray-200 py-2 z-50">
                  <div className="px-4 py-2 border-b border-gray-100">
                    <h3 className="text-sm font-semibold text-gray-900">Notifications</h3>
                  </div>
                  <div className="max-h-64 overflow-y-auto">
                    {notifications.map((notification) => (
                      <div
                        key={notification.id}
                        className={`px-4 py-3 hover:bg-gray-50 border-l-4 ${
                          notification.unread ? 'border-blue-500 bg-blue-50/30' : 'border-transparent'
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <p className={`text-sm ${notification.unread ? 'font-medium text-gray-900' : 'text-gray-700'}`}>
                              {notification.message}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">{notification.time}</p>
                          </div>
                          {notification.unread && (
                            <div className="w-2 h-2 bg-blue-500 rounded-full ml-2 mt-1"></div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="px-4 py-2 border-t border-gray-100">
                    <button className="text-sm text-blue-600 hover:text-blue-800 font-medium">
                      View all notifications
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div className="relative">
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-medium">
                    {(user?.firstName?.charAt(0) || user?.name?.charAt(0) || 'A').toUpperCase()}
                  </span>
                </div>
                <span className="text-gray-700 font-medium">
                  {user?.firstName  && user?.lastName 
                    ? `${user.firstName.charAt(0)} ${user.lastName}` 
                    : user?.name || 'Admin'}
                </span>
                <ChevronDownIcon className="h-4 w-4 text-gray-500" />
              </button>
              
              {isDropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-gray-200 py-2 z-50">
                  <Link
                    to="/profile"
                    className="flex items-center px-4 py-2 text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                  >
                    <UserIcon className="h-4 w-4 mr-3" />
                    Profile
                  </Link>
                  <Link
                    to="/messages"
                    className="flex items-center px-4 py-2 text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                  >
                    <ChatBubbleLeftRightIcon className="h-4 w-4 mr-3" />
                    Messages & Complaints
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center px-4 py-2 text-red-600 hover:bg-red-50 transition-colors"
                  >
                    <ArrowRightOnRectangleIcon className="h-4 w-4 mr-3" />
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile sidebar */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setSidebarOpen(false)} />
          <div className="relative flex w-64 flex-col bg-white h-full shadow-xl">
            <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200">
              <div className="flex items-center">
                <ClipboardDocumentListIcon className="h-8 w-8 text-blue-600" />
                <span className="ml-2 text-xl font-bold text-gray-900">FeedbackPro</span>
              </div>
              <button
                onClick={() => setSidebarOpen(false)}
                className="p-2 rounded-md text-gray-400 hover:text-gray-600"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>
            <nav className="flex-1 px-4 py-4 space-y-2">
              {userRoutes.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.name}
                    to={item.path}
                    onClick={() => setSidebarOpen(false)}
                    className={`flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      location.pathname === item.path
                        ? 'bg-blue-50 text-blue-600'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <Icon className="h-5 w-5 mr-3" />
                    {item.name}
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>
      )}

      {/* Main content */}
      <main className="flex-1 p-6">
        <div className="max-w-7xl mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default Layout;






























