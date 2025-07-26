import React from 'react';
import { formatDistanceToNow } from 'date-fns';
import { MessageCircle, User } from 'lucide-react';

const MessageList = ({ 
  conversations, 
  selectedConversation, 
  onConversationSelect, 
  loading, 
  currentUser 
}) => {

  const formatLastMessageTime = (timestamp) => {
    if (!timestamp) return '';
    try {
      return formatDistanceToNow(new Date(timestamp), { addSuffix: true });
    } catch (error) {
      return '';
    }
  };

  const truncateMessage = (message, maxLength = 50) => {
    if (!message) return '';
    return message.length > maxLength 
      ? message.substring(0, maxLength) + '...' 
      : message;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (conversations.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 px-4">
        <MessageCircle size={48} className="text-gray-300 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No conversations yet</h3>
        <p className="text-sm text-gray-600 text-center">
          Start a conversation to connect with other users
        </p>
      </div>
    );
  }

  return (
    <div className="divide-y divide-gray-200 max-h-80 overflow-y-auto">
      {conversations.map((conversation) => {
        // Use 'partner' instead of 'otherUser' to match API response
        const partner = conversation.partner;
        const isSelected = selectedConversation?.id === conversation.id;
        const hasUnreadMessages = conversation.unreadCount > 0;

        return (
          <div
            key={conversation.id}
            onClick={() => onConversationSelect(conversation)}
            className={`p-4 cursor-pointer transition-colors hover:bg-gray-50 ${
              isSelected ? 'bg-blue-50 border-r-2 border-blue-600' : ''
            }`}
          >
            <div className="flex items-start space-x-3">
              {/* User Avatar */}
              <div className="flex-shrink-0 relative">
                {partner?.profileImage ? (
                  <img
                    src={partner.profileImage}
                    alt={`${partner.firstName} ${partner.lastName}`}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center">
                    <span className="text-sm font-medium text-gray-600">
                      {partner?.firstName?.[0]}{partner?.lastName?.[0]}
                    </span>
                  </div>
                )}
                {hasUnreadMessages && (
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-blue-600 rounded-full"></div>
                )}
              </div>

              {/* Conversation Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h3 className={`text-sm font-medium truncate ${
                    hasUnreadMessages ? 'text-gray-900 font-semibold' : 'text-gray-900'
                  }`}>
                    {partner ? `${partner.firstName} ${partner.lastName}` : 'Unknown User'}
                  </h3>
                  <span className="text-xs text-gray-500 flex-shrink-0 ml-2">
                    {formatLastMessageTime(conversation.lastMessage?.createdAt)}
                  </span>
                </div>

                <div className="flex items-center justify-between mt-1">
                  <p className={`text-sm truncate ${
                    hasUnreadMessages ? 'text-gray-900 font-medium' : 'text-gray-600'
                  }`}>
                    <span className="text-xs text-gray-500 mr-1">
                      {conversation.lastMessage?.subject}:
                    </span>
                    {conversation.lastMessage 
                      ? truncateMessage(conversation.lastMessage.content)
                      : 'No messages yet'
                    }
                  </p>
                  {hasUnreadMessages && (
                    <span className="bg-blue-600 text-white text-xs rounded-full px-2 py-1 ml-2 flex-shrink-0">
                      {conversation.unreadCount}
                    </span>
                  )}
                </div>

                {/* User Type and Email */}
                <div className="flex items-center justify-between mt-1">
                  <span className="text-xs text-gray-500 truncate">
                    {partner?.email}
                  </span>
                  {partner && (
                    <span className={`inline-block text-xs px-2 py-1 rounded-full ml-2 flex-shrink-0 ${
                      partner.userType === 'graduate' 
                        ? 'bg-green-100 text-green-800' 
                        : partner.userType === 'investor'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-purple-100 text-purple-800'
                    }`}>
                      {partner.userType === 'graduate' ? 'Graduate' : 
                       partner.userType === 'investor' ? 'Investor' : 'Admin'}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default MessageList;