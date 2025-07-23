import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserIcon, ShieldCheckIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../contexts/AuthContext';

const DemoLogin = () => {
  const [role, setRole] = useState('user');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { setUser } = useAuth();

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    // Special shortcuts: demo/123456 or demo@gmail.com/123456 always go to admin
    if ((email === 'demo' && password === '123456') || (email === 'demo@gmail.com' && password === '123456')) {
      setUser({
        _id: 'demo-admin',
        email: email,
        firstName: 'Demo',
        lastName: 'Admin',
        role: 'admin',
      });
      navigate('/dashboard');
      return;
    }
    if (role === 'admin') {
      if (email === 'admin@demo.com' && password === 'demo123') {
        setUser({
          _id: 'demo-admin',
          email: email,
          firstName: 'Demo',
          lastName: 'Admin',
          role: 'admin',
        });
        navigate('/dashboard');
      } else {
        setError('Not a valid admin account.');
      }
    } else {
      if (email === 'user@demo.com' && password === 'demo123') {
        setUser({
          _id: 'demo-user',
          email: email,
          firstName: 'Demo',
          lastName: 'User',
          role: 'user',
        });
        navigate(`/user/${encodeURIComponent(email)}`);
      } else {
        setError('Not a valid user account.');
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-500 to-purple-400">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8 flex flex-col items-center">
        <div className="flex flex-col items-center mb-6">
          <div className="bg-blue-100 p-3 rounded-full mb-2">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 text-blue-600">
              <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 12h9m-9 4h6m-6-8h9m-9 4h6" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">FeedbackPro</h1>
          <p className="text-gray-500 text-sm">Professional feedback management system</p>
        </div>
        <form className="w-full" onSubmit={handleSubmit}>
          <h2 className="text-xl font-semibold text-gray-900 mb-1">Welcome Back</h2>
          <p className="text-gray-500 text-sm mb-4">Sign in to access your feedback dashboard</p>
          <div className="flex mb-4 rounded-lg overflow-hidden border border-gray-200">
            <button type="button" onClick={() => setRole('user')} className={`flex-1 flex items-center justify-center gap-1 py-2 text-sm font-medium ${role === 'user' ? 'bg-blue-50 text-blue-700' : 'bg-white text-gray-500'}`}> <UserIcon className="h-5 w-5" /> User </button>
            <button type="button" onClick={() => setRole('admin')} className={`flex-1 flex items-center justify-center gap-1 py-2 text-sm font-medium border-l border-gray-200 ${role === 'admin' ? 'bg-blue-50 text-blue-700' : 'bg-white text-gray-500'}`}> <ShieldCheckIcon className="h-5 w-5" /> Admin </button>
          </div>
          <div className="mb-3">
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input type="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="user@example.com" className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400" />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input type="password" required value={password} onChange={e => setPassword(e.target.value)} placeholder="Password" className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400" />
          </div>
          {error && <div className="mb-2 text-red-600 text-sm text-center">{error}</div>}
          <button type="submit" className="w-full py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition mb-2">
            Sign in as {role === 'admin' ? 'Admin' : 'User'}
          </button>
        </form>
        <div className="text-xs text-gray-500 mt-2 text-center">
          <div>Demo accounts:</div>
          <div>User: user@demo.com | Admin: admin@demo.com</div>
          <div>Password: demo123</div>
          <div className="mt-1">Or use <b>demo</b> / <b>123456</b> or <b>demo@gmail.com</b> / <b>123456</b> for instant admin access</div>
        </div>
      </div>
    </div>
  );
};

export default DemoLogin; 