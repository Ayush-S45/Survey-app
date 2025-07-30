import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { 
  PaperAirplaneIcon, 
  ExclamationTriangleIcon,
  ChatBubbleLeftRightIcon,
  ClockIcon,
  PlusIcon,
  UserIcon
} from '@heroicons/react/24/outline';
import axios from 'axios';
import { toast } from 'react-hot-toast';

const Complaints = () => {
  const { user } = useAuth();
  const [complaints, setComplaints] = useState([]);
  const [sentComplaints, setSentComplaints] = useState([]);
  const [newComplaint, setNewComplaint] = useState('');
  const [complaintType, setComplaintType] = useState('survey');
  const [relatedSurvey, setRelatedSurvey] = useState('');
  const [assignedTo, setAssignedTo] = useState('');
  const [surveys, setSurveys] = useState([]);
  const [recipients, setRecipients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [complaintTitle, setComplaintTitle] = useState('');
  const [complaintDescription, setComplaintDescription] = useState('');
  const [complaintCategory, setComplaintCategory] = useState('workplace');
  const [activeTab, setActiveTab] = useState('received');

  // Add employee-related complaint type
  const complaintTypes = [
    { value: 'employee-feedback', label: 'Employee Feedback Issue' },
    { value: 'survey', label: 'Survey Issue' },
    { value: 'workplace', label: 'Workplace Issue' },
    { value: 'other', label: 'Other' }
  ];

  useEffect(() => {
    fetchComplaints();
    fetchSurveys();
    fetchRecipients();
  }, []);

  const fetchComplaints = async () => {
    try {
      const [receivedResponse, sentResponse] = await Promise.all([
        axios.get('/api/complaints'),
        axios.get('/api/complaints/sent')
      ]);
      setComplaints(receivedResponse.data);
      setSentComplaints(sentResponse.data);
    } catch (error) {
      console.error('Error fetching complaints:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSurveys = async () => {
    try {
      const response = await axios.get('/api/surveys');
      // Handle both array and object responses
      setSurveys(Array.isArray(response.data) ? response.data : response.data.surveys || []);
    } catch (error) {
      console.error('Error fetching surveys:', error);
      setSurveys([]); // fallback to empty array on error
    }
  };

  const fetchRecipients = async () => {
    try {
      const response = await axios.get('/api/users/complaint-recipients');
      setRecipients(response.data);
    } catch (error) {
      console.error('Error fetching recipients:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!complaintTitle.trim() || !complaintDescription.trim() || !newComplaint.trim()) return;

    try {
      const complaintData = {
        title: complaintTitle,
        description: complaintDescription,
        content: newComplaint,
        type: complaintType,
        relatedSurvey: relatedSurvey || null,
        assignedTo: assignedTo || null,
        category: complaintCategory // Always include category
      };

      await axios.post('/api/complaints', complaintData);
      toast.success('Complaint submitted and message sent successfully!');
      setComplaintTitle('');
      setComplaintDescription('');
      setNewComplaint('');
      setComplaintType('survey');
      setRelatedSurvey('');
      setAssignedTo('');
      setComplaintCategory('workplace');
      setShowForm(false);
      fetchComplaints();
    } catch (error) {
      console.error('Error submitting complaint:', error);
      toast.error('Failed to submit complaint');
    }
  };

  const deleteComplaint = async (complaintId) => {
    if (!window.confirm('Are you sure you want to delete this complaint?')) {
      return;
    }

    try {
      await axios.delete(`/api/complaints/${complaintId}`);
      toast.success('Complaint deleted successfully!');
      fetchComplaints();
    } catch (error) {
      console.error('Error deleting complaint:', error);
      toast.error('Failed to delete complaint');
    }
  };

  const getComplaintIcon = (type) => {
    switch (type) {
      case 'survey':
        return <ExclamationTriangleIcon className="h-5 w-5 text-red-500" />;
      case 'technical':
        return <ExclamationTriangleIcon className="h-5 w-5 text-yellow-500" />;
      case 'harassment':
        return <ExclamationTriangleIcon className="h-5 w-5 text-red-600" />;
      default:
        return <ChatBubbleLeftRightIcon className="h-5 w-5 text-blue-500" />;
    }
  };

  const getComplaintTypeColor = (type) => {
    switch (type) {
      case 'survey':
        return 'bg-red-100 text-red-800';
      case 'technical':
        return 'bg-yellow-100 text-yellow-800';
      case 'harassment':
        return 'bg-red-200 text-red-900';
      case 'workplace':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-blue-100 text-blue-800';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'resolved':
        return 'bg-green-100 text-green-800';
      case 'in-progress':
        return 'bg-yellow-100 text-yellow-800';
      case 'under-review':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Complaints & Issues</h1>
              <p className="text-gray-600 mt-1">Submit complaints that will be sent as messages to the assigned person</p>
            </div>
            <button
              onClick={() => setShowForm(!showForm)}
              className="flex items-center px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
            >
              <PlusIcon className="h-4 w-4 mr-2" />
              New Complaint
            </button>
          </div>
        </div>

        {/* Complaint Form */}
        {showForm && (
          <div className="p-6 border-b border-gray-200 bg-red-50">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Submit New Complaint</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Title
                  </label>
                  <input
                    type="text"
                    value={complaintTitle}
                    onChange={e => setComplaintTitle(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                    placeholder="Title"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <input
                    type="text"
                    value={complaintDescription}
                    onChange={e => setComplaintDescription(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                    placeholder="Description"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category
                  </label>
                  <select
                    value={complaintCategory}
                    onChange={(e) => setComplaintCategory(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                  >
                    <option value="harassment">Harassment</option>
                    <option value="discrimination">Discrimination</option>
                    <option value="workplace">Workplace</option>
                    <option value="management">Management</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Complaint Type
                  </label>
                  <select
                    value={complaintType}
                    onChange={(e) => setComplaintType(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                  >
                    <option value="survey">Survey Related</option>
                    <option value="technical">Technical Issue</option>
                    <option value="workplace">Workplace Issue</option>
                    <option value="harassment">Harassment</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Assign To
                  </label>
                  <select
                    value={assignedTo}
                    onChange={(e) => setAssignedTo(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                  >
                    <option value="">Auto-assign to Admin</option>
                    {recipients.map((person) => (
                      <option key={person._id} value={person._id}>
                        {person.firstName} {person.lastName} ({person.role})
                      </option>
                    ))}
                  </select>
                </div>

                {complaintType === 'survey' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Related Survey
                    </label>
                    <select
                      value={relatedSurvey}
                      onChange={(e) => setRelatedSurvey(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                    >
                      <option value="">Select a survey</option>
                      {console.log('surveys:', surveys)}
                      {Array.isArray(surveys) && surveys.map((survey) => (
                        <option key={survey._id} value={survey._id}>
                          {survey.title}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Complaint Details
                </label>
                <textarea
                  value={newComplaint}
                  onChange={(e) => setNewComplaint(e.target.value)}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                  placeholder="Please describe your complaint in detail..."
                  required
                />
              </div>

              <div className="flex gap-2">
                <button
                  type="submit"
                  className="flex items-center px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                >
                  <PaperAirplaneIcon className="h-4 w-4 mr-2" />
                  Submit Complaint
                </button>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            <button
              onClick={() => setActiveTab('received')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'received'
                  ? 'border-red-500 text-red-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Received/Assigned ({complaints.length})
            </button>
            <button
              onClick={() => setActiveTab('sent')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'sent'
                  ? 'border-red-500 text-red-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Sent Complaints ({sentComplaints.length})
            </button>
          </nav>
        </div>

        {/* Complaints List */}
        <div className="p-6">
          {activeTab === 'received' ? (
            <>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                {user.role === 'employee' ? 'Your Complaints' : 'Complaints Assigned to You'}
              </h2>
              
              {complaints.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <ExclamationTriangleIcon className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>No complaints found.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {complaints.map((complaint) => (
                    <div key={complaint._id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center space-x-3">
                          {getComplaintIcon(complaint.type)}
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getComplaintTypeColor(complaint.type)}`}>
                            {complaint.type && typeof complaint.type === 'string'
                              ? complaint.type.charAt(0).toUpperCase() + complaint.type.slice(1)
                              : 'Unknown'}
                          </span>
                          {complaint.assignedTo && (
                            <div className="flex items-center text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                              <UserIcon className="h-3 w-3 mr-1" />
                              Assigned to: {complaint.assignedTo.firstName} {complaint.assignedTo.lastName}
                            </div>
                          )}
                          {complaint.relatedSurvey && (
                            <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                              Survey: {complaint.relatedSurvey.title}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(complaint.status)}`}>
                            {complaint.status && typeof complaint.status === 'string'
                              ? complaint.status.replace('-', ' ').charAt(0).toUpperCase() + complaint.status.replace('-', ' ').slice(1)
                              : 'Unknown'}
                          </span>
                          <div className="flex items-center text-xs text-gray-500">
                            <ClockIcon className="h-4 w-4 mr-1" />
                            {new Date(complaint.createdAt).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                      
                      <p className="text-gray-700 mb-3">{complaint.content}</p>
                      
                      {complaint.priority && (
                        <div className={`inline-block px-2 py-1 rounded text-xs font-medium mb-2 ${
                          complaint.priority === 'high' 
                            ? 'bg-red-100 text-red-800' 
                            : complaint.priority === 'medium'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-green-100 text-green-800'
                        }`}>
                          Priority: {complaint.priority}
                        </div>
                      )}

                      {complaint.adminResponse && (
                        <div className="mt-3 p-3 bg-blue-50 rounded-md border-l-4 border-blue-400">
                          <p className="text-sm font-medium text-blue-900">Response:</p>
                          <p className="text-sm text-blue-800 mt-1">{complaint.adminResponse}</p>
                          {complaint.respondedAt && (
                            <p className="text-xs text-blue-600 mt-2">
                              Responded on: {new Date(complaint.respondedAt).toLocaleDateString()}
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </>
          ) : (
            <>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Your Sent Complaints</h2>
              
              {sentComplaints.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <ExclamationTriangleIcon className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>No complaints submitted yet.</p>
                  <p className="text-sm">Click "New Complaint" to submit your first complaint.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {sentComplaints.map((complaint) => (
                    <div key={complaint._id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center space-x-3">
                          {getComplaintIcon(complaint.type)}
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getComplaintTypeColor(complaint.type)}`}>
                            {complaint.type && typeof complaint.type === 'string'
                              ? complaint.type.charAt(0).toUpperCase() + complaint.type.slice(1)
                              : 'Unknown'}
                          </span>
                          {complaint.assignedTo && (
                            <div className="flex items-center text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                              <UserIcon className="h-3 w-3 mr-1" />
                              Assigned to: {complaint.assignedTo.firstName} {complaint.assignedTo.lastName}
                            </div>
                          )}
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(complaint.status)}`}>
                            {complaint.status && typeof complaint.status === 'string'
                              ? complaint.status.replace('-', ' ').charAt(0).toUpperCase() + complaint.status.replace('-', ' ').slice(1)
                              : 'Unknown'}
                          </span>
                          <button
                            onClick={() => deleteComplaint(complaint._id)}
                            className="text-red-600 hover:text-red-800 text-sm font-medium"
                          >
                            Delete
                          </button>
                          <div className="flex items-center text-xs text-gray-500">
                            <ClockIcon className="h-4 w-4 mr-1" />
                            {new Date(complaint.createdAt).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                      
                      <p className="text-gray-700 mb-3">{complaint.content}</p>
                      
                      {complaint.priority && (
                        <div className={`inline-block px-2 py-1 rounded text-xs font-medium mb-2 ${
                          complaint.priority === 'high' 
                            ? 'bg-red-100 text-red-800' 
                            : complaint.priority === 'medium'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-green-100 text-green-800'
                        }`}>
                          Priority: {complaint.priority}
                        </div>
                      )}

                      {complaint.resolution && (
                        <div className="bg-green-50 border-l-4 border-green-400 p-3 mt-3">
                          <p className="text-sm font-medium text-green-900 mb-1">
                            Resolution by {complaint.resolvedBy?.firstName} {complaint.resolvedBy?.lastName}:
                          </p>
                          <p className="text-green-800">{complaint.resolution}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Complaints;



