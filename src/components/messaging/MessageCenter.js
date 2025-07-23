import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { MessageCircle, Search, Users } from 'lucide-react';
import ContactModal from './ContactModal';

const MessageCenter = () => {
  const { user } = useAuth();
  const [conversations, setConversations] = useState([]);

  const [loading, setLoading] = useState(true);
  const [showContactModal, setShowContactModal] = useState(false);


// Fetch conversations when the component mounts or user changes
  useEffect(() => {
    if (user) {
      fetchConversations();
    }
  }, [user]);

  const fetchConversations = async () => {
    try {

      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/messages/conversations', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setConversations(data.conversations || []);
      } else {
        console.error('Failed to fetch conversations');
      }
    } catch (error) {
      console.error('Failed to fetch conversations');
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return <div>Please log in to access messages.</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="bg-blue-100 p-3 rounded-full">
                <MessageCircle className="h-8 w-8 text-blue-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Message Center</h1>
                <p className="text-gray-600">Connect with other users</p>
              </div>
            </div>
            <button
              onClick={() => setShowContactModal(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 flex items-center space-x-2"
            >
              <Users size={16} />
              <span>Find Users</span>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p>Loading conversations...</p>
            </div>
          ) : conversations.length === 0 ? (
            <div className="text-center py-12">
              <MessageCircle size={64} className="mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No conversations yet</h3>
              <p className="text-gray-600 mb-6">Start connecting with other users to begin conversations</p>
              <button
                onClick={() => setShowContactModal(true)}
                className="bg-blue-600 text-white px-6 py-3 rounded hover:bg-blue-700 flex items-center space-x-2 mx-auto"
              >
                <Search size={16} />
                <span>Find Users to Connect</span>
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {conversations.map((conversation, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <p>Conversation {index + 1}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Contact Modal */}
      <ContactModal 
        isOpen={showContactModal} 
        onClose={() => setShowContactModal(false)} 
      />
    </div>
  );
};

export default MessageCenter;