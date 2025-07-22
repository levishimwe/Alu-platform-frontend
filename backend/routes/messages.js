const express = require('express');
const router = express.Router();
const { Message, Conversation, User } = require('../models');
const auth = require('../middleware/auth');
const { Op } = require('sequelize');

// Get all conversations for the current user
router.get('/conversations', auth, async (req, res) => {
  try {
    const conversations = await Conversation.findAll({
      where: {
        [Op.or]: [
          { user1Id: req.user.id },
          { user2Id: req.user.id }
        ]
      },
      include: [
        {
          model: User,
          as: 'user1',
          attributes: ['id', 'firstName', 'lastName', 'email', 'userType', 'profileImage', 'company']
        },
        {
          model: User,
          as: 'user2',
          attributes: ['id', 'firstName', 'lastName', 'email', 'userType', 'profileImage', 'company']
        },
        {
          model: Message,
          as: 'lastMessage',
          limit: 1,
          order: [['createdAt', 'DESC']],
          attributes: ['id', 'content', 'createdAt', 'senderId']
        }
      ],
      order: [['updatedAt', 'DESC']]
    });

    // Transform conversations to include other user info and unread count
    const transformedConversations = await Promise.all(
      conversations.map(async (conv) => {
        const otherUser = conv.user1Id === req.user.id ? conv.user2 : conv.user1;
        
        // Count unread messages
        const unreadCount = await Message.count({
          where: {
            conversationId: conv.id,
            senderId: { [Op.ne]: req.user.id },
            read: false
          }
        });

        return {
          id: conv.id,
          otherUserId: otherUser.id,
          otherUser: otherUser,
          lastMessage: conv.lastMessage,
          lastMessageAt: conv.updatedAt,
          unreadCount: unreadCount
        };
      })
    );

    res.json({ conversations: transformedConversations });
  } catch (error) {
    console.error('Error fetching conversations:', error);
    res.status(500).json({ error: 'Failed to fetch conversations' });
  }
});

// Get messages for a specific conversation
router.get('/conversation/:conversationId', auth, async (req, res) => {
  try {
    const { conversationId } = req.params;

    // Verify user is part of this conversation
    const conversation = await Conversation.findOne({
      where: {
        id: conversationId,
        [Op.or]: [
          { user1Id: req.user.id },
          { user2Id: req.user.id }
        ]
      }
    });

    if (!conversation) {
      return res.status(404).json({ error: 'Conversation not found' });
    }

    // Get messages
    const messages = await Message.findAll({
      where: { conversationId },
      include: [
        {
          model: User,
          as: 'sender',
          attributes: ['id', 'firstName', 'lastName', 'profileImage']
        }
      ],
      order: [['createdAt', 'ASC']]
    });

    // Mark messages as read
    await Message.update(
      { read: true },
      {
        where: {
          conversationId,
          senderId: { [Op.ne]: req.user.id },
          read: false
        }
      }
    );

    res.json({ messages });
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
});

// Send a new message
router.post('/send', auth, async (req, res) => {
  try {
    const { recipientId, content, conversationId } = req.body;

    if (!content?.trim()) {
      return res.status(400).json({ error: 'Message content is required' });
    }

    let conversation;

    if (conversationId) {
      // Use existing conversation
      conversation = await Conversation.findOne({
        where: {
          id: conversationId,
          [Op.or]: [
            { user1Id: req.user.id },
            { user2Id: req.user.id }
          ]
        }
      });

      if (!conversation) {
        return res.status(404).json({ error: 'Conversation not found' });
      }
    } else {
      // Create new conversation or find existing one
      const existingConversation = await Conversation.findOne({
        where: {
          [Op.or]: [
            { user1Id: req.user.id, user2Id: recipientId },
            { user1Id: recipientId, user2Id: req.user.id }
          ]
        }
      });

      if (existingConversation) {
        conversation = existingConversation;
      } else {
        conversation = await Conversation.create({
          user1Id: req.user.id,
          user2Id: recipientId
        });
      }
    }

    // Create the message
    const message = await Message.create({
      conversationId: conversation.id,
      senderId: req.user.id,
      content: content.trim(),
      read: false
    });

    // Update conversation timestamp
    await conversation.update({ updatedAt: new Date() });

    // Include sender info in response
    const messageWithSender = await Message.findByPk(message.id, {
      include: [
        {
          model: User,
          as: 'sender',
          attributes: ['id', 'firstName', 'lastName', 'profileImage']
        }
      ]
    });

    res.status(201).json({ 
      message: messageWithSender,
      conversationId: conversation.id
    });
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({ error: 'Failed to send message' });
  }
});

// Find or create conversation between two users
router.post('/conversation/find', auth, async (req, res) => {
  try {
    const { otherUserId } = req.body;

    if (!otherUserId) {
      return res.status(400).json({ error: 'Other user ID is required' });
    }

    // Find existing conversation
    let conversation = await Conversation.findOne({
      where: {
        [Op.or]: [
          { user1Id: req.user.id, user2Id: otherUserId },
          { user1Id: otherUserId, user2Id: req.user.id }
        ]
      },
      include: [
        {
          model: User,
          as: 'user1',
          attributes: ['id', 'firstName', 'lastName', 'email', 'userType', 'profileImage', 'company']
        },
        {
          model: User,
          as: 'user2',
          attributes: ['id', 'firstName', 'lastName', 'email', 'userType', 'profileImage', 'company']
        }
      ]
    });

    if (!conversation) {
      // Get other user info for new conversation
      const otherUser = await User.findByPk(otherUserId, {
        attributes: ['id', 'firstName', 'lastName', 'email', 'userType', 'profileImage', 'company']
      });

      if (!otherUser) {
        return res.status(404).json({ error: 'User not found' });
      }

      // Return conversation data for new conversation (will be created when first message is sent)
      return res.json({
        conversation: {
          id: `new-${otherUserId}`,
          otherUserId: otherUserId,
          otherUser: otherUser,
          messages: [],
          isNew: true
        }
      });
    }

    // Transform existing conversation
    const otherUser = conversation.user1Id === req.user.id ? conversation.user2 : conversation.user1;
    
    res.json({
      conversation: {
        id: conversation.id,
        otherUserId: otherUser.id,
        otherUser: otherUser,
        messages: [],
        isNew: false
      }
    });
  } catch (error) {
    console.error('Error finding conversation:', error);
    res.status(500).json({ error: 'Failed to find conversation' });
  }
});

// Mark messages as read
router.patch('/conversation/:conversationId/read', auth, async (req, res) => {
  try {
    const { conversationId } = req.params;

    // Verify user is part of this conversation
    const conversation = await Conversation.findOne({
      where: {
        id: conversationId,
        [Op.or]: [
          { user1Id: req.user.id },
          { user2Id: req.user.id }
        ]
      }
    });

    if (!conversation) {
      return res.status(404).json({ error: 'Conversation not found' });
    }

    // Mark all unread messages as read
    await Message.update(
      { read: true },
      {
        where: {
          conversationId,
          senderId: { [Op.ne]: req.user.id },
          read: false
        }
      }
    );

    res.json({ success: true });
  } catch (error) {
    console.error('Error marking messages as read:', error);
    res.status(500).json({ error: 'Failed to mark messages as read' });
  }
});

// Delete a message
router.delete('/message/:messageId', auth, async (req, res) => {
  try {
    const { messageId } = req.params;

    const message = await Message.findOne({
      where: {
        id: messageId,
        senderId: req.user.id
      }
    });

    if (!message) {
      return res.status(404).json({ error: 'Message not found or unauthorized' });
    }

    await message.destroy();
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting message:', error);
    res.status(500).json({ error: 'Failed to delete message' });
  }
});

module.exports = router;