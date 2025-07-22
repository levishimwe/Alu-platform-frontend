import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { X, Search, User, MessageCircle, Mail, Phone } from 'lucide-react';

const ContactModal = ({ isOpen, onClose, onStartConversation, projectId = null }) => {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);

  // Fetch users when modal opens
  useEffect(() => {
    if (isOpen) {
      fetchUsers();
    }
  }, [isOpen]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000/api';
      const token = localStorage.getItem('token');
      
      // If projectId is provided, fetch project owner; otherwise fetch all users
      const endpoint = projectId 
        ? `projects/${projectId}/owner`
        : 'users/search';
      
      const response = await fetch(`${API_BASE_URL}/${endpoint}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (projectId) {
          setUsers([data.user]);
          setSelectedUser(data.user);
        } else {
          // Filter out current user and users of different types for relevant connections
          const filteredUsers = data.users?.filter(u => 
            u.id !== user.id && 
            (
              (user.userType === 'investor' && u.userType === 'graduate') ||
              (user.userType === 'graduate' && u.userType === 'investor') ||
              user.userType === 'admin'
            )
          ) || [];
          setUsers(filteredUsers);
        }
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  // Filter users based on search term
  const filteredUsers = users.filter(u =>
    u.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Handle starting conversation
  const handleStartConversation = async (targetUser) => {
    try {
      const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000/api';
      const token = localStorage.getItem('token');
      
      // Check if conversation already exists
      const response = await fetch(`${API_BASE_URL}/messages/conversation/find`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          otherUserId: targetUser.id
        })
      });

      if (response.ok) {
        const data = await response.json();
        if (onStartConversation) {
          onStartConversation(data.conversation || {
            id: `new-${targetUser.id}`,
            otherUserId: targetUser.id,
            otherUser: targetUser,
            messages: [],
            isNew: true
          });
        }
        onClose();
      }
    } catch (error) {
      console.error('Error starting conversation:', error);
    }
  };

  // Handle direct contact methods
  const handleEmailContact = (email) => {
    window.open(`mailto:${email}`, '_blank');
  };

  const handlePhoneContact = (phone) => {
    window.open(`tel:${phone}`, '_blank');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-2xl mx-4 max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            {projectId ? 'Contact Project Owner' : 'Start New Conversation'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X size={24} />
          </button>
        </div>

        {/* Search (only show if not contacting specific project owner) */}
        {!projectId && (
          <div className="p-6 border-b border-gray-200">
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
        )}

        {/* Users List */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="text-center py-8">
              <User size={48} className="mx-auto mb-4 text-gray-300" />
              <p className="text-gray-600 mb-2">No users found</p>
              <p className="text-sm text-gray-500">
                {projectId 
                  ? 'Unable to find project owner information'
                  : 'Try adjusting your search terms'
                }
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredUsers.map((targetUser) => (
                <div
                  key={targetUser.id}
                  className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-blue-300 transition-colors"
                >
                  <div className="flex items-center space-x-4">
                    <img
                      src={targetUser.profileImage || `https://ui-avatars.com/api/?name=${targetUser.firstName}+${targetUser.lastName}&background=3B82F6&color=fff&size=48`}
                      alt={`${targetUser.firstName} ${targetUser.lastName}`}
                      className="w-12 h-12 rounded-full"
                    />
                    <div>
                      <h3 className="font-medium text-gray-900">
                        {targetUser.firstName} {targetUser.lastName}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {targetUser.userType === 'graduate' ? 'ALU Graduate' : 'Investor'}
                      </p>
                      {targetUser.company && (
                        <p className="text-sm text-gray-500">{targetUser.company}</p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    {/* Email Contact */}
                    {targetUser.email && (
                      <button
                        onClick={() => handleEmailContact(targetUser.email)}
                        className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
                        title="Send Email"
                      >
                        <Mail size={16} />
                      </button>
                    )}

                    {/* Phone Contact */}
                    {targetUser.phone && (
                      <button
                        onClick={() => handlePhoneContact(targetUser.phone)}
                        className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-full transition-colors"
                        title="Call"
                      >
                        <Phone size={16} />
                      </button>
                    )}

                    {/* Start Conversation */}
                    <button
                      onClick={() => handleStartConversation(targetUser)}
                      className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      <MessageCircle size={16} />
                      <span>Message</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 bg-gray-50">
          <div className="flex justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactModal;
