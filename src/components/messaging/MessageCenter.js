import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { MessageSquare, Plus, Search, X } from 'lucide-react';
import MessageList from './MessageList';
import MessageThread from './MessageThread';
import ContactModal from './ContactModal';

const MessageCenter = () => {
  const { user } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showContactModal, setShowContactModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Fetch conversations on component mount
  useEffect(() => {
    fetchConversations();
  }, []);

  const fetchConversations = async () => {
    try {
      setLoading(true);
      const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000/api';
      const token = localStorage.getItem('token');
      
      const response = await fetch(`${API_BASE_URL}/messages/conversations`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setConversations(data.conversations || []);
      } else {
        console.error('Failed to fetch conversations');
      }
    } catch (error) {
      console.error('Error fetching conversations:', error);
    } finally {
      setLoading(false);
    }
  };

  // Handle conversation selection
  const handleConversationSelect = (conversation) => {
    setSelectedConversation(conversation);
  };

  // Handle starting new conversation
  const handleStartConversation = (newConversation) => {
    setConversations(prev => [newConversation, ...prev]);
    setSelectedConversation(newConversation);
  };

  // Handle message sent
  const handleMessageSent = (conversationId, newMessage) => {
    // Update conversations list
    setConversations(prev => 
      prev.map(conv => 
        conv.id === conversationId 
          ? { 
              ...conv, 
              lastMessage: newMessage,
              lastMessageAt: newMessage.createdAt,
              messages: [...(conv.messages || []), newMessage]
            }
          : conv
      )
    );

    // Update selected conversation
    if (selectedConversation && selectedConversation.id === conversationId) {
      setSelectedConversation(prev => ({
        ...prev,
        messages: [...(prev.messages || []), newMessage]
      }));
    }
  };

  // Filter conversations based on search
  const filteredConversations = conversations.filter(conv =>
    conv.otherUser?.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    conv.otherUser?.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    conv.lastMessage?.content?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                <MessageSquare className="mr-3" size={32} />
                Messages
              </h1>
              <p className="text-gray-600">Connect with graduates and investors</p>
            </div>
            <button
              onClick={() => setShowContactModal(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center space-x-2 transition-colors"
            >
              <Plus size={20} />
              <span>New Message</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-sm overflow-hidden" style={{ height: '70vh' }}>
          <div className="flex h-full">
            {/* Conversations Sidebar */}
            <div className="w-1/3 border-r border-gray-200 flex flex-col">
              {/* Search */}
              <div className="p-4 border-b border-gray-200">
                <div className="relative">
                  <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search conversations..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Conversations List */}
              <div className="flex-1 overflow-y-auto">
                <MessageList
                  conversations={filteredConversations}
                  selectedConversation={selectedConversation}
                  onConversationSelect={handleConversationSelect}
                  loading={loading}
                  currentUser={user}
                />
              </div>
            </div>

            {/* Message Thread */}
            <div className="flex-1 flex flex-col">
              {selectedConversation ? (
                <MessageThread
                  conversation={selectedConversation}
                  currentUser={user}
                  onMessageSent={handleMessageSent}
                />
              ) : (
                <div className="flex-1 flex items-center justify-center bg-gray-50">
                  <div className="text-center">
                    <MessageSquare size={64} className="mx-auto mb-4 text-gray-300" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      Select a conversation
                    </h3>
                    <p className="text-gray-600 mb-4">
                      Choose a conversation from the sidebar to start messaging
                    </p>
                    <button
                      onClick={() => setShowContactModal(true)}
                      className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
                    >
                      Start New Conversation
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Contact Modal */}
      <ContactModal
        isOpen={showContactModal}
        onClose={() => setShowContactModal(false)}
        onStartConversation={handleStartConversation}
      />
    </div>
  );
};

export default MessageCenter;