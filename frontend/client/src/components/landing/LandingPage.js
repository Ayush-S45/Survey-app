import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ChartBarIcon,
  UserGroupIcon,
  ShieldCheckIcon,
  GlobeAltIcon,
  StarIcon,
  ArrowRightIcon,
  CogIcon,
  ChatBubbleLeftRightIcon,
  ClipboardDocumentListIcon,
  UserIcon,
  ChevronLeftIcon,
  ChevronRightIcon
} from '@heroicons/react/24/outline';

const LandingPage = () => {
  const [currentFeedback, setCurrentFeedback] = useState(0);

  const testimonials = [
    {
      id: 1,
      name: "Sarah Johnson",
      role: "Product Manager, TechCorp",
      avatar: "S",
      rating: 5,
      quote: "FeedbackPro transformed how we collect and analyze user feedback. The insights are invaluable!"
    },
    {
      id: 2,
      name: "Michael Chen",
      role: "HR Director, InnovateTech",
      avatar: "M",
      rating: 5,
      quote: "The employee satisfaction surveys have given us unprecedented insights into our workplace culture."
    },
    {
      id: 3,
      name: "Emily Rodriguez",
      role: "Team Lead, DataFlow",
      avatar: "E",
      rating: 5,
      quote: "Real-time analytics and beautiful dashboards make decision-making so much easier!"
    },
    {
      id: 4,
      name: "David Thompson",
      role: "CEO, StartupXYZ",
      avatar: "D",
      rating: 5,
      quote: "The platform's ease of use and powerful features have revolutionized our feedback process."
    },
    {
      id: 5,
      name: "Lisa Wang",
      role: "Operations Manager, GrowthCo",
      avatar: "L",
      rating: 5,
      quote: "Customer feedback collection has never been this seamless and insightful before."
    },
    {
      id: 6,
      name: "James Wilson",
      role: "Engineering Manager, DevCorp",
      avatar: "J",
      rating: 5,
      quote: "The developer experience and API integration capabilities are absolutely outstanding."
    },
    {
      id: 7,
      name: "Amanda Foster",
      role: "Marketing Director, BrandFirst",
      avatar: "A",
      rating: 5,
      quote: "FeedbackPro helped us understand our customers better than ever before. Game changer!"
    }
  ];

  // Auto-advance carousel
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentFeedback((prev) => (prev + 1) % testimonials.length);
    }, 4000); // Change every 4 seconds

    return () => clearInterval(interval);
  }, [testimonials.length]);

  const nextFeedback = () => {
    setCurrentFeedback((prev) => (prev + 1) % testimonials.length);
  };

  const prevFeedback = () => {
    setCurrentFeedback((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  const goToFeedback = (index) => {
    setCurrentFeedback(index);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <header className="relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg mr-3">
                <ChatBubbleLeftRightIcon className="h-6 w-6 text-white" />
              </div>
              <span className="text-2xl font-bold text-white">FeedbackPro</span>
            </div>
            <div className="flex items-center space-x-4">
              <Link
                to="/login"
                className="text-gray-300 hover:text-white transition-colors"
              >
                Login
              </Link>
              <Link
                to="/register"
                className="bg-white text-gray-900 px-4 py-2 rounded-lg font-medium hover:bg-gray-100 transition-colors"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-20 pb-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="mb-4">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
              ⚡ Next-Gen Feedback Platform
            </span>
          </div>
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-8 leading-tight">
            Transform your feedback collection with{' '}
            <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              AI-powered insights
            </span>
          </h1>
          <p className="text-xl text-gray-300 mb-12 max-w-4xl mx-auto">
            Beautiful analytics, seamless user experiences, and real results that drive organizational growth and employee satisfaction.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/register"
              className="inline-flex items-center px-8 py-4 bg-white text-gray-900 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
            >
              Get Started Free
              <ArrowRightIcon className="ml-2 h-5 w-5" />
            </Link>
            <Link
              to="/demo-login"
              className="inline-flex items-center px-8 py-4 border-2 border-white text-white rounded-lg font-semibold hover:bg-white hover:text-gray-900 transition-colors"
            >
              Watch Demo
            </Link>
          </div>
        </div>
      </section>

      {/* Statistics Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 text-center border border-gray-700">
              <UserGroupIcon className="h-8 w-8 text-blue-400 mx-auto mb-4" />
              <div className="text-2xl font-bold text-white mb-1">10,000+</div>
              <div className="text-gray-400 text-sm">Active Users</div>
              <div className="text-green-400 text-xs mt-2">+12%</div>
            </div>
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 text-center border border-gray-700">
              <ChatBubbleLeftRightIcon className="h-8 w-8 text-purple-400 mx-auto mb-4" />
              <div className="text-2xl font-bold text-white mb-1">500K+</div>
              <div className="text-gray-400 text-sm">Feedback Collected</div>
              <div className="text-green-400 text-xs mt-2">+24%</div>
            </div>
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 text-center border border-gray-700">
              <ShieldCheckIcon className="h-8 w-8 text-green-400 mx-auto mb-4" />
              <div className="text-2xl font-bold text-white mb-1">98.5%</div>
              <div className="text-gray-400 text-sm">Success Rate</div>
              <div className="text-green-400 text-xs mt-2">+2.1%</div>
            </div>
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 text-center border border-gray-700">
              <GlobeAltIcon className="h-8 w-8 text-orange-400 mx-auto mb-4" />
              <div className="text-2xl font-bold text-white mb-1">65+</div>
              <div className="text-gray-400 text-sm">Countries</div>
              <div className="text-green-400 text-xs mt-2">+5</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
              <ChatBubbleLeftRightIcon className="h-8 w-8 text-blue-400 mb-4" />
              <h3 className="text-lg font-semibold text-white mb-2">Smart Form Builder</h3>
              <p className="text-gray-400 text-sm mb-4">Create professional feedback forms with drag-and-drop simplicity</p>
              <button className="text-blue-400 text-sm font-medium hover:text-blue-300 transition-colors">
                50+ Templates →
              </button>
            </div>
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
              <ChartBarIcon className="h-8 w-8 text-purple-400 mb-4" />
              <h3 className="text-lg font-semibold text-white mb-2">Real-time Analytics</h3>
              <p className="text-gray-400 text-sm mb-4">Visualize feedback data with beautiful charts and insights</p>
              <button className="text-purple-400 text-sm font-medium hover:text-purple-300 transition-colors">
                Live Insights →
              </button>
            </div>
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
              <UserGroupIcon className="h-8 w-8 text-green-400 mb-4" />
              <h3 className="text-lg font-semibold text-white mb-2">User Management</h3>
              <p className="text-gray-400 text-sm mb-4">Manage users, assign roles, and control access efficiently</p>
              <button className="text-green-400 text-sm font-medium hover:text-green-300 transition-colors">
                Role-Based →
              </button>
            </div>
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
              <ShieldCheckIcon className="h-8 w-8 text-orange-400 mb-4" />
              <h3 className="text-lg font-semibold text-white mb-2">Secure & Reliable</h3>
              <p className="text-gray-400 text-sm mb-4">Enterprise-grade security with role-based permissions</p>
              <button className="text-orange-400 text-sm font-medium hover:text-orange-300 transition-colors">
                99.9% Uptime →
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonial Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold text-white mb-4">Trusted by Leaders</h2>
          <p className="text-gray-400 text-lg mb-12">See what our customers say about FeedbackPro</p>
          
          {/* Carousel Container */}
          <div className="relative max-w-4xl mx-auto">
            {/* Main Testimonial */}
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-8 border border-gray-700 relative overflow-hidden">
              {/* Fade Animation */}
              <div 
                className="transition-all duration-500 ease-in-out"
                style={{ opacity: 1 }}
              >
                <div className="flex justify-center mb-6">
                  {[...Array(testimonials[currentFeedback].rating)].map((_, i) => (
                    <StarIcon key={i} className="h-6 w-6 text-yellow-400" />
                  ))}
                </div>
                <div className="flex items-start">
                  <ChatBubbleLeftRightIcon className="h-8 w-8 text-blue-400 mr-4 mt-1 flex-shrink-0" />
                  <blockquote className="text-xl text-white italic mb-6">
                    "{testimonials[currentFeedback].quote}"
                  </blockquote>
                </div>
                <div className="flex items-center justify-center">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mr-4">
                    <span className="text-white font-semibold">{testimonials[currentFeedback].avatar}</span>
                  </div>
                  <div className="text-left">
                    <div className="text-white font-semibold">{testimonials[currentFeedback].name}</div>
                    <div className="text-gray-400 text-sm">{testimonials[currentFeedback].role}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Navigation Arrows */}
            <button
              onClick={prevFeedback}
              className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-gray-800/80 hover:bg-gray-700/80 text-white p-2 rounded-full transition-colors"
            >
              <ChevronLeftIcon className="h-6 w-6" />
            </button>
            <button
              onClick={nextFeedback}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-gray-800/80 hover:bg-gray-700/80 text-white p-2 rounded-full transition-colors"
            >
              <ChevronRightIcon className="h-6 w-6" />
            </button>

            {/* Dots Indicator */}
            <div className="flex justify-center mt-6 space-x-2">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => goToFeedback(index)}
                  className={`w-3 h-3 rounded-full transition-colors ${
                    index === currentFeedback 
                      ? 'bg-blue-400' 
                      : 'bg-gray-600 hover:bg-gray-500'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Access Levels Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* User Access */}
            <div className="bg-gradient-to-br from-blue-600 to-green-600 rounded-xl p-8 text-white">
              <UserIcon className="h-12 w-12 mb-6" />
              <h3 className="text-2xl font-bold mb-4">User Access</h3>
              <p className="text-blue-100 mb-6">Access your assigned feedback forms and submit responses</p>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center">
                  <ShieldCheckIcon className="h-5 w-5 mr-3" />
                  Submit feedback forms with smart validation
                </li>
                <li className="flex items-center">
                  <ChartBarIcon className="h-5 w-5 mr-3" />
                  Track completion status in real-time
                </li>
                <li className="flex items-center">
                  <ClipboardDocumentListIcon className="h-5 w-5 mr-3" />
                  View submission history and insights
                </li>
              </ul>
              <Link
                to="/login"
                className="inline-flex items-center px-6 py-3 bg-white text-blue-600 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
              >
                Login as User →
              </Link>
            </div>

            {/* Admin Access */}
            <div className="bg-gradient-to-br from-pink-600 to-purple-600 rounded-xl p-8 text-white">
              <CogIcon className="h-12 w-12 mb-6" />
              <h3 className="text-2xl font-bold mb-4">Admin Access</h3>
              <p className="text-pink-100 mb-6">Manage forms, users, and comprehensive analytics</p>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center">
                  <ChatBubbleLeftRightIcon className="h-5 w-5 mr-3" />
                  Create & manage forms with AI assistance
                </li>
                <li className="flex items-center">
                  <ChartBarIcon className="h-5 w-5 mr-3" />
                  View analytics dashboard with insights
                </li>
                <li className="flex items-center">
                  <UserGroupIcon className="h-5 w-5 mr-3" />
                  Manage users & advanced permissions
                </li>
              </ul>
              <Link
                to="/login"
                className="inline-flex items-center px-6 py-3 bg-white text-pink-600 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
              >
                Login as Admin ⚙
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <p className="text-white text-lg mb-2">Powering feedback collection worldwide</p>
            <p className="text-gray-400 text-sm mb-6">Built with React, Node.js, and modern web technologies</p>
            <div className="flex justify-center space-x-6 mb-6">
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <span className="sr-only">GitHub</span>
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                </svg>
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <span className="sr-only">Twitter</span>
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                </svg>
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <span className="sr-only">LinkedIn</span>
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                </svg>
              </a>
            </div>
            <div className="flex justify-center space-x-6 text-sm text-gray-400">
              <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
              <a href="#" className="hover:text-white transition-colors">Support</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage; 