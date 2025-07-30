import React from 'react';
import { Link } from 'react-router-dom';

const Dashboard = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-8">
      <Link
        to="/user/surveys"
        className="px-8 py-4 bg-blue-600 text-white rounded-xl text-xl font-semibold shadow hover:bg-blue-700 transition-colors"
      >
        Pending Surveys
      </Link>
      <Link
        to="/user/history"
        className="px-8 py-4 bg-green-600 text-white rounded-xl text-xl font-semibold shadow hover:bg-green-700 transition-colors"
      >
        Completed Surveys
      </Link>
    </div>
  );
};

export default Dashboard; 

















