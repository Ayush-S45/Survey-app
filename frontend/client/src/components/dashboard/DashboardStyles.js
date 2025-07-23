import React from 'react';
import { EyeIcon, PencilSquareIcon } from '@heroicons/react/24/outline';

export const StatCard = ({ icon: Icon, color, label, value, highlight }) => (
  <div className={`bg-white rounded-lg shadow-sm border border-gray-200 p-6 flex items-center gap-4 ${highlight ? 'border-green-200' : ''}`}>
    <Icon className={`h-8 w-8 ${color}`} />
    <div>
      <p className="text-sm font-medium text-gray-500">{label}</p>
      <p className={`text-2xl font-semibold ${highlight ? 'text-green-600' : 'text-gray-900'}`}>{value}</p>
    </div>
  </div>
);

export const AnalyticsCard = ({ name, rating, responses }) => (
  <div className="flex items-center justify-between bg-white border border-gray-200 rounded-lg p-4">
    <div>
      <div className="font-semibold text-gray-900 mb-1">{name}</div>
      <div className="flex items-center gap-4">
        <span className="text-sm text-gray-500">Rating:</span>
        <span className="font-medium text-gray-900">{rating}/5</span>
        <div className="w-40 h-2 bg-gray-200 rounded-full ml-2">
          <div className="h-2 rounded-full bg-green-500" style={{ width: `${(rating / 5) * 100}%` }}></div>
        </div>
      </div>
    </div>
    <span className="ml-4 px-3 py-1 rounded-full bg-gray-100 text-gray-700 text-xs font-semibold whitespace-nowrap border border-gray-200">{responses} responses</span>
  </div>
);

export const ResponseFormCard = ({ title, status, created, responses }) => (
  <div className="flex items-center justify-between bg-gray-50 rounded-lg p-4 border border-gray-200">
    <div>
      <div className="font-semibold text-gray-900 flex items-center gap-2">
        {title}
        <span className={`ml-2 px-2 py-0.5 rounded text-xs font-semibold ${status === 'active' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'}`}>
          {status}
        </span>
      </div>
      <div className="text-xs text-gray-500 mt-1">Created: {created} • {responses} responses</div>
    </div>
    <div className="flex gap-2">
      <button className="flex items-center gap-1 px-3 py-1 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 text-sm font-medium">
        <EyeIcon className="h-4 w-4" /> View
      </button>
      <button className="flex items-center gap-1 px-3 py-1 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 text-sm font-medium">
        <PencilSquareIcon className="h-4 w-4" /> Edit
      </button>
    </div>
  </div>
); 