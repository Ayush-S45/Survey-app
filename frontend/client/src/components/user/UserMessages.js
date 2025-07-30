import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { 
  PaperAirplaneIcon, 
  ChatBubbleLeftRightIcon,
  ClockIcon,
  UserIcon,
  ExclamationTriangleIcon,
  InboxIcon,
  FireIcon
} from '@heroicons/react/24/outline';
import axios from 'axios';
import { toast } from 'react-hot-toast';

const UserMessages = () => {
  const { user } = useAuth();
  const [sentMessages, setSentMessages] = useState([]);
  const [receivedMessages, setReceivedMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('received');

  useEffect(() => {
    fetchMessages();
  }, []);

  const fetchMessages = async () => {
    try {
      const [sentResponse, receivedResponse] = await Promise.all([
        axios.get('/api/messages'),
        axios.get('/api/messages/inbox')
      ]);
      
      setSentMessages(Array.isArray(sentResponse.data) ? sentResponse.data : []);
      setReceivedMessages(Array.isArray(receivedResponse.data) ? receivedResponse.data : []);
    } catch (error) {
      console.error('Error fetching messages:', error);
      toast.error('Failed to load messages');
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (messageId) => {
    try {
      await axios.put(`/api/messages/${messageId}/read`);
      fetchMessages();
    } catch (error) {
      console.error('Error marking message as read:', error);
    }
  };

  const getMessageIcon = (type) => {
    switch (type) {
      case 'urgent': return <FireIcon className="h-5 w-5 text-red-500" />;
      case 'complaint': return <ExclamationTriangleIcon className="h-5 w-5 text-orange-500" />;
      case 'feedback': return <ChatBubbleLeftRightIcon className="h-5 w-5 text-blue-500" />;
      default: return <InboxIcon className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'read': return 'text-green-600 bg-green-100';
      case 'replied': return 'text-blue-600 bg-blue-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const MessageCard = ({ message, isReceived = false }) => (
    <div className="bg-white rounded-lg shadow-md p-4 mb-4 border-l-4 border-blue-500">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center space-x-3">
          {getMessageIcon(message.type)}
          <div>
            <h3 className="font-semibold text-gray-900">
              {isReceived ? message.sender?.firstName + ' ' + message.sender?.lastName : 
                           message.recipient?.firstName + ' ' + message.recipient?.lastName}
            </h3>
            <p className="text-sm text-gray-500">
              {isReceived ? message.sender?.role : message.recipient?.role}
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(message.status)}`}>
            {message.status}
          </span>
          <span className="text-xs text-gray-400">
            {new Date(message.createdAt).toLocaleDateString()}
          </span>
        </div>
      </div>
      
      <p className="text-gray-700 mb-3">{message.content}</p>
      
      {message.reply && (
        <div className="bg-gray-50 rounded p-3 mt-3 border-l-4 border-green-500">
          <p className="text-sm text-gray-600 mb-1">
            <strong>Reply:</strong> {message.repliedBy?.firstName} {message.repliedBy?.lastName}
          </p>
          <p className="text-gray-700">{message.reply}</p>
        </div>
      )}
      
      {isReceived && message.status === 'sent' && (
        <button
          onClick={() => markAsRead(message._id)}
          className="mt-2 text-sm text-blue-600 hover:text-blue-800"
        >
          Mark as Read
        </button>
      )}
    </div>
  );

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">My Messages</h1>
      
      {/* Tab Navigation */}
      <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg mb-6">
        <button
          onClick={() => setActiveTab('received')}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'received'
              ? 'bg-white text-blue-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Received ({receivedMessages.length})
        </button>
        <button
          onClick={() => setActiveTab('sent')}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'sent'
              ? 'bg-white text-blue-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Sent ({sentMessages.length})
        </button>
      </div>

      {/* Messages List */}
      <div className="space-y-4">
        {activeTab === 'received' ? (
          receivedMessages.length > 0 ? (
            receivedMessages.map(message => (
              <MessageCard key={message._id} message={message} isReceived={true} />
            ))
          ) : (
            <div className="text-center py-8 text-gray-500">
              <InboxIcon className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>No received messages</p>
            </div>
          )
        ) : (
          sentMessages.length > 0 ? (
            sentMessages.map(message => (
              <MessageCard key={message._id} message={message} isReceived={false} />
            ))
          ) : (
            <div className="text-center py-8 text-gray-500">
              <PaperAirplaneIcon className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>No sent messages</p>
            </div>
          )
        )}
      </div>
    </div>
  );
};

export default UserMessages;
