import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';

const UserPage = () => {
  const { email } = useParams();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-400 to-blue-400">
      <div className="bg-white rounded-2xl shadow-lg p-8 flex flex-col items-center w-full max-w-md">
        <h1 className="text-2xl font-bold text-purple-700 mb-2">Welcome, User!</h1>
        <p className="text-gray-700 mb-4">You are signed in as:</p>
        <div className="bg-purple-50 text-purple-700 px-4 py-2 rounded-lg font-mono mb-6">{decodeURIComponent(email)}</div>
        <button onClick={() => navigate('/demo-login')} className="px-4 py-2 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition">Back to Login</button>
      </div>
    </div>
  );
};

export default UserPage; 