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
    <div className="divide-y divide-gray-200">
      {conversations.map((conversation) => {
        const otherUser = conversation.otherUser;
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
              <div className="flex-shrink-0">
                {otherUser?.profileImage ? (
                  <img
                    src={otherUser.profileImage}
                    alt={`${otherUser.firstName} ${otherUser.lastName}`}
                    className="w-10 h-10 rounded-full"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center">
                    <User size={20} className="text-gray-600" />
                  </div>
                )}
                {hasUnreadMessages && (
                  <div className="w-3 h-3 bg-blue-600 rounded-full -mt-1 -mr-1 relative float-right"></div>
                )}
              </div>

              {/* Conversation Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h3 className={`text-sm font-medium truncate ${
                    hasUnreadMessages ? 'text-gray-900 font-semibold' : 'text-gray-900'
                  }`}>
                    {otherUser ? `${otherUser.firstName} ${otherUser.lastName}` : 'Unknown User'}
                  </h3>
                  <span className="text-xs text-gray-500 flex-shrink-0 ml-2">
                    {formatLastMessageTime(conversation.lastMessageAt)}
                  </span>
                </div>

                <div className="flex items-center justify-between mt-1">
                  <p className={`text-sm truncate ${
                    hasUnreadMessages ? 'text-gray-900 font-medium' : 'text-gray-600'
                  }`}>
                    {conversation.lastMessage 
                      ? truncateMessage(conversation.lastMessage.content)
                      : 'No messages yet'
                    }
                  </p>
                  {hasUnreadMessages && (
                    <span className="bg-blue-600 text-white text-xs rounded-full px-2 py-1 ml-2">
                      {conversation.unreadCount}
                    </span>
                  )}
                </div>

                {/* User Type Badge */}
                {otherUser && (
                  <span className={`inline-block text-xs px-2 py-1 rounded-full mt-1 ${
                    otherUser.userType === 'graduate' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-blue-100 text-blue-800'
                  }`}>
                    {otherUser.userType === 'graduate' ? 'Graduate' : 'Investor'}
                  </span>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default MessageList;