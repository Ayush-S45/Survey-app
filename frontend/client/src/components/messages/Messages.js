import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { 
  PaperAirplaneIcon, 
  ChatBubbleLeftRightIcon,
  ClockIcon,
  PlusIcon,
  UserIcon,
  ExclamationTriangleIcon,
  InboxIcon,
  FireIcon
} from '@heroicons/react/24/outline';
import axios from 'axios';
import { toast } from 'react-hot-toast';

const Messages = () => {
  const { user } = useAuth();
  const [sentMessages, setSentMessages] = useState([]);
  const [receivedMessages, setReceivedMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [messageType, setMessageType] = useState('general');
  const [recipient, setRecipient] = useState('');
  const [recipients, setRecipients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [activeTab, setActiveTab] = useState('sent');

  useEffect(() => {
    fetchSentMessages();
    fetchReceivedMessages();
    fetchRecipients();
  }, []);

  const fetchSentMessages = async () => {
    try {
      const response = await axios.get('/api/messages');
      setSentMessages(response.data);
    } catch (error) {
      console.error('Error fetching sent messages:', error);
    }
  };

  const fetchReceivedMessages = async () => {
    try {
      const response = await axios.get('/api/messages/inbox');
      setReceivedMessages(response.data);
    } catch (error) {
      console.error('Error fetching received messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchRecipients = async () => {
    try {
      const response = await axios.get('/api/users/recipients');
      setRecipients(response.data);
    } catch (error) {
      console.error('Error fetching recipients:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !recipient) return;

    try {
      const messageData = {
        content: newMessage,
        type: messageType,
        recipient: recipient
      };

      await axios.post('/api/messages', messageData);
      toast.success('Message sent successfully!');
      setNewMessage('');
      setMessageType('general');
      setRecipient('');
      setShowForm(false);
      fetchSentMessages();
    } catch (error) {
      toast.error('Failed to send message');
    }
  };

  const markAsRead = async (messageId) => {
    try {
      await axios.put(`/api/messages/${messageId}/read`);
      fetchReceivedMessages();
    } catch (error) {
      console.error('Error marking message as read:', error);
    }
  };

  const replyToMessage = async (messageId, replyContent) => {
    try {
      await axios.put(`/api/messages/${messageId}/reply`, { reply: replyContent });
      toast.success('Reply sent successfully!');
      fetchReceivedMessages();
    } catch (error) {
      toast.error('Failed to send reply');
    }
  };

  const getMessageIcon = (type) => {
    switch (type) {
      case 'complaint':
        return <ExclamationTriangleIcon className="h-5 w-5 text-red-500" />;
      case 'urgent':
        return <FireIcon className="h-5 w-5 text-orange-500" />;
      case 'feedback':
        return <ChatBubbleLeftRightIcon className="h-5 w-5 text-blue-500" />;
      default:
        return <ChatBubbleLeftRightIcon className="h-5 w-5 text-gray-500" />;
    }
  };

  const getMessageTypeColor = (type) => {
    switch (type) {
      case 'complaint':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'urgent':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'feedback':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'read':
        return 'bg-green-100 text-green-800';
      case 'replied':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  // Filter received messages by type
  const urgentMessages = receivedMessages.filter(msg => msg.type === 'urgent');
  const complaintMessages = receivedMessages.filter(msg => msg.type === 'complaint');
  const generalMessages = receivedMessages.filter(msg => msg.type === 'general' || msg.type === 'feedback');

  const MessageCard = ({ message, isReceived = false }) => (
    <div className={`border rounded-lg p-4 hover:shadow-md transition-shadow ${
      isReceived && message.status === 'sent' ? 'bg-blue-50 border-blue-200' : 'border-gray-200'
    } ${message.type === 'complaint' ? 'border-red-300 bg-red-25' : ''}`}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center space-x-3">
          {getMessageIcon(message.type)}
          <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getMessageTypeColor(message.type)}`}>
            {message.type === 'complaint' ? '⚠️ Complaint' : message.type.charAt(0).toUpperCase() + message.type.slice(1)}
          </span>
          <div className="flex items-center text-sm text-gray-600">
            <UserIcon className="h-4 w-4 mr-1" />
            {isReceived ? (
              <>From: {message.sender?.firstName} {message.sender?.lastName}</>
            ) : (
              <>To: {message.recipient?.firstName} {message.recipient?.lastName} ({message.recipient?.role})</>
            )}
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(message.status)}`}>
            {message.status.charAt(0).toUpperCase() + message.status.slice(1)}
          </span>
          <div className="flex items-center text-xs text-gray-500">
            <ClockIcon className="h-4 w-4 mr-1" />
            {new Date(message.createdAt).toLocaleDateString()}
          </div>
        </div>
      </div>
      
      <p className={`text-gray-700 mb-3 ${message.type === 'complaint' ? 'font-medium' : ''}`}>
        {message.content}
      </p>

      {isReceived && message.status === 'sent' && (
        <div className="flex gap-2">
          <button
            onClick={() => markAsRead(message._id)}
            className="text-xs bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
          >
            Mark as Read
          </button>
          {message.type === 'complaint' && (
            <button
              className="text-xs bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700"
              onClick={() => {
                const replyContent = prompt('Enter your response to this complaint:');
                if (replyContent) {
                  replyToMessage(message._id, replyContent);
                }
              }}
            >
              Respond to Complaint
            </button>
          )}
        </div>
      )}

      {message.reply && (
        <div className={`mt-3 p-3 rounded-md border-l-4 ${
          message.type === 'complaint' 
            ? 'bg-green-50 border-green-400' 
            : 'bg-blue-50 border-blue-400'
        }`}>
          <p className={`text-sm font-medium ${
            message.type === 'complaint' ? 'text-green-900' : 'text-blue-900'
          }`}>
            Response from {message.repliedBy?.firstName} {message.repliedBy?.lastName}:
          </p>
          <p className={`text-sm mt-1 ${
            message.type === 'complaint' ? 'text-green-800' : 'text-blue-800'
          }`}>
            {message.reply}
          </p>
          {message.repliedAt && (
            <p className={`text-xs mt-2 ${
              message.type === 'complaint' ? 'text-green-600' : 'text-blue-600'
            }`}>
              Responded on: {new Date(message.repliedAt).toLocaleDateString()}
            </p>
          )}
        </div>
      )}
    </div>
  );

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
              <h1 className="text-2xl font-bold text-gray-900">Messages</h1>
              <p className="text-gray-600 mt-1">Send and receive messages</p>
            </div>
            <button
              onClick={() => setShowForm(!showForm)}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              <PlusIcon className="h-4 w-4 mr-2" />
              New Message
            </button>
          </div>
        </div>

        {/* Message Form */}
        {showForm && (
          <div className="p-6 border-b border-gray-200 bg-blue-50">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Send New Message</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Send To
                  </label>
                  <select
                    value={recipient}
                    onChange={(e) => setRecipient(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="">Select recipient</option>
                    {recipients.map((person) => (
                      <option key={person._id} value={person._id}>
                        {person.firstName} {person.lastName} ({person.role})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Message Type
                  </label>
                  <select
                    value={messageType}
                    onChange={(e) => setMessageType(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="general">General Message</option>
                    <option value="feedback">Feedback</option>
                    <option value="complaint">Complaint</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Message
                </label>
                <textarea
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Type your message here..."
                  required
                />
              </div>

              <div className="flex gap-2">
                <button
                  type="submit"
                  className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  <PaperAirplaneIcon className="h-4 w-4 mr-2" />
                  Send Message
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
              onClick={() => setActiveTab('sent')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'sent'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Sent Messages ({sentMessages.length})
            </button>
            <button
              onClick={() => setActiveTab('received')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'received'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <InboxIcon className="h-4 w-4 inline mr-1" />
              Received Messages ({receivedMessages.length})
            </button>
          </nav>
        </div>

        {/* Messages Content */}
        <div className="p-6">
          {activeTab === 'sent' && (
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Your Sent Messages</h2>
              {sentMessages.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <ChatBubbleLeftRightIcon className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>No messages sent yet.</p>
                  <p className="text-sm">Click "New Message" to send your first message.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {sentMessages.map((message) => (
                    <MessageCard key={message._id} message={message} isReceived={false} />
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'received' && (
            <div className="space-y-8">
              {/* Urgent Messages */}
              {urgentMessages.length > 0 && (
                <div>
                  <div className="flex items-center mb-4 p-3 bg-orange-50 rounded-lg border-l-4 border-orange-400">
                    <FireIcon className="h-6 w-6 text-orange-500 mr-2" />
                    <h3 className="text-lg font-semibold text-orange-700">🚨 Urgent Messages ({urgentMessages.length})</h3>
                  </div>
                  <div className="space-y-4">
                    {urgentMessages.map((message) => (
                      <MessageCard key={message._id} message={message} isReceived={true} />
                    ))}
                  </div>
                </div>
              )}

              {/* Complaint Messages */}
              {complaintMessages.length > 0 && (
                <div>
                  <div className="flex items-center mb-4 p-3 bg-red-50 rounded-lg border-l-4 border-red-400">
                    <ExclamationTriangleIcon className="h-6 w-6 text-red-500 mr-2" />
                    <h3 className="text-lg font-semibold text-red-700">⚠️ Complaints & Issues ({complaintMessages.length})</h3>
                  </div>
                  <div className="space-y-4">
                    {complaintMessages.map((message) => (
                      <div key={message._id} className="border-l-4 border-red-400 bg-red-50">
                        <MessageCard message={message} isReceived={true} />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* General Messages */}
              {generalMessages.length > 0 && (
                <div>
                  <div className="flex items-center mb-4 p-3 bg-blue-50 rounded-lg border-l-4 border-blue-400">
                    <ChatBubbleLeftRightIcon className="h-6 w-6 text-blue-500 mr-2" />
                    <h3 className="text-lg font-semibold text-blue-700">💬 General Messages & Feedback ({generalMessages.length})</h3>
                  </div>
                  <div className="space-y-4">
                    {generalMessages.map((message) => (
                      <MessageCard key={message._id} message={message} isReceived={true} />
                    ))}
                  </div>
                </div>
              )}

              {receivedMessages.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <InboxIcon className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>No messages received yet.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Messages;




