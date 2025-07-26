const express = require('express');
const router = express.Router();
const { sequelize } = require('../config/database');
const auth = require('../middleware/auth');
const { Op } = require('sequelize');

// GET conversations for current user
router.get('/conversations', auth, async (req, res) => {
  try {
    const userId = req.user.userId;
    console.log('Fetching conversations for user:', userId);

    // Get all messages where user is sender or receiver (using your DB schema)
    const messages = await sequelize.query(`
      SELECT 
        m.id,
        m.senderId,
        m.receiverId,
        m.subject,
        m.content,
        m.isRead,
        m.createdAt,
        sender.id as senderId,
        sender.firstName as senderFirstName,
        sender.lastName as senderLastName,
        sender.email as senderEmail,
        sender.profileImage as senderProfileImage,
        receiver.id as receiverId,
        receiver.firstName as receiverFirstName,
        receiver.lastName as receiverLastName,
        receiver.email as receiverEmail,
        receiver.profileImage as receiverProfileImage
      FROM Messages m
      LEFT JOIN Users sender ON m.senderId = sender.id
      LEFT JOIN Users receiver ON m.receiverId = receiver.id
      WHERE m.senderId = ? OR m.receiverId = ?
      ORDER BY m.createdAt DESC
    `, {
      replacements: [userId, userId],
      type: sequelize.QueryTypes.SELECT
    });

    // Group messages by conversation partner
    const conversationsMap = new Map();
    
    messages.forEach(message => {
      const partnerId = message.senderId === userId ? message.receiverId : message.senderId;
      const partner = message.senderId === userId ? {
        id: message.receiverId,
        firstName: message.receiverFirstName,
        lastName: message.receiverLastName,
        email: message.receiverEmail,
        profileImage: message.receiverProfileImage
      } : {
        id: message.senderId,
        firstName: message.senderFirstName,
        lastName: message.senderLastName,
        email: message.senderEmail,
        profileImage: message.senderProfileImage
      };
      
      if (!conversationsMap.has(partnerId)) {
        conversationsMap.set(partnerId, {
          id: partnerId,
          partner: partner,
          lastMessage: {
            id: message.id,
            subject: message.subject,
            content: message.content,
            createdAt: message.createdAt,
            isRead: message.isRead,
            senderId: message.senderId,
            receiverId: message.receiverId
          },
          unreadCount: 0,
          messages: []
        });
      }
      
      const conversation = conversationsMap.get(partnerId);
      conversation.messages.push({
        id: message.id,
        subject: message.subject,
        content: message.content,
        createdAt: message.createdAt,
        isRead: message.isRead,
        senderId: message.senderId,
        receiverId: message.receiverId
      });
      
      // Count unread messages (messages sent to current user that are unread)
      if (message.receiverId === userId && !message.isRead) {
        conversation.unreadCount++;
      }
    });

    const conversations = Array.from(conversationsMap.values());
    
    console.log(`Found ${conversations.length} conversations for user ${userId}`);
    res.json({ conversations });
  } catch (error) {
    console.error('Error fetching conversations:', error);
    res.status(500).json({ 
      error: 'Failed to fetch conversations',
      message: error.message 
    });
  }
});

// GET messages for a specific conversation
router.get('/conversation/:userId', auth, async (req, res) => {
  try {
    const currentUserId = req.user.userId;
    const otherUserId = req.params.userId;
    
    console.log(`Fetching conversation between ${currentUserId} and ${otherUserId}`);

    const messages = await sequelize.query(`
      SELECT 
        m.id,
        m.senderId,
        m.receiverId,
        m.subject,
        m.content,
        m.isRead,
        m.createdAt,
        sender.firstName as senderFirstName,
        sender.lastName as senderLastName,
        sender.email as senderEmail,
        sender.profileImage as senderProfileImage,
        receiver.firstName as receiverFirstName,
        receiver.lastName as receiverLastName,
        receiver.email as receiverEmail,
        receiver.profileImage as receiverProfileImage
      FROM Messages m
      LEFT JOIN Users sender ON m.senderId = sender.id
      LEFT JOIN Users receiver ON m.receiverId = receiver.id
      WHERE (m.senderId = ? AND m.receiverId = ?) OR (m.senderId = ? AND m.receiverId = ?)
      ORDER BY m.createdAt ASC
    `, {
      replacements: [currentUserId, otherUserId, otherUserId, currentUserId],
      type: sequelize.QueryTypes.SELECT
    });

    // Mark messages as read
    await sequelize.query(`
      UPDATE Messages 
      SET isRead = 1, updatedAt = NOW()
      WHERE senderId = ? AND receiverId = ? AND isRead = 0
    `, {
      replacements: [otherUserId, currentUserId],
      type: sequelize.QueryTypes.UPDATE
    });

    const formattedMessages = messages.map(msg => ({
      id: msg.id,
      subject: msg.subject,
      content: msg.content,
      isRead: msg.isRead,
      createdAt: msg.createdAt,
      sender: {
        id: msg.senderId,
        firstName: msg.senderFirstName,
        lastName: msg.senderLastName,
        email: msg.senderEmail,
        profileImage: msg.senderProfileImage
      },
      receiver: {
        id: msg.receiverId,
        firstName: msg.receiverFirstName,
        lastName: msg.receiverLastName,
        email: msg.receiverEmail,
        profileImage: msg.receiverProfileImage
      }
    }));

    console.log(`Found ${formattedMessages.length} messages in conversation`);
    res.json({ messages: formattedMessages });
  } catch (error) {
    console.error('Error fetching conversation:', error);
    res.status(500).json({ 
      error: 'Failed to fetch conversation',
      message: error.message 
    });
  }
});

// POST send a new internal message
router.post('/send', auth, async (req, res) => {
  try {
    const { receiverId, subject, content } = req.body;
    const senderId = req.user.userId;

    console.log('Sending internal message:', { senderId, receiverId, subject });

    // Validate receiver exists
    const receiver = await sequelize.query(`
      SELECT id, firstName, lastName, email 
      FROM Users 
      WHERE id = ? AND isActive = 1
    `, {
      replacements: [receiverId],
      type: sequelize.QueryTypes.SELECT
    });

    if (!receiver[0]) {
      return res.status(404).json({ error: 'Receiver not found' });
    }

    // Insert message into database
    const result = await sequelize.query(`
      INSERT INTO Messages (senderId, receiverId, subject, content, isRead, createdAt, updatedAt)
      VALUES (?, ?, ?, ?, 0, NOW(), NOW())
    `, {
      replacements: [senderId, receiverId, subject || 'No Subject', content],
      type: sequelize.QueryTypes.INSERT
    });

    // Get the complete message with user details
    const messageId = result[0]; // MySQL returns the insert ID
    const completeMessage = await sequelize.query(`
      SELECT 
        m.id,
        m.senderId,
        m.receiverId,
        m.subject,
        m.content,
        m.isRead,
        m.createdAt,
        sender.firstName as senderFirstName,
        sender.lastName as senderLastName,
        sender.email as senderEmail,
        sender.profileImage as senderProfileImage,
        receiver.firstName as receiverFirstName,
        receiver.lastName as receiverLastName,
        receiver.email as receiverEmail,
        receiver.profileImage as receiverProfileImage
      FROM Messages m
      LEFT JOIN Users sender ON m.senderId = sender.id
      LEFT JOIN Users receiver ON m.receiverId = receiver.id
      WHERE m.id = ?
    `, {
      replacements: [messageId],
      type: sequelize.QueryTypes.SELECT
    });

    console.log('Internal message sent successfully');
    res.status(201).json({ 
      message: 'Message sent successfully',
      data: completeMessage[0]
    });
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({ 
      error: 'Failed to send message',
      message: error.message 
    });
  }
});

// PUT mark message as read
router.put('/:messageId/read', auth, async (req, res) => {
  try {
    const messageId = req.params.messageId;
    const userId = req.user.userId;

    const result = await sequelize.query(`
      UPDATE Messages 
      SET isRead = 1, updatedAt = NOW()
      WHERE id = ? AND receiverId = ?
    `, {
      replacements: [messageId, userId],
      type: sequelize.QueryTypes.UPDATE
    });

    if (result[1] === 0) { // MySQL returns [result, affectedRows]
      return res.status(404).json({ error: 'Message not found' });
    }
    
    console.log(`Message ${messageId} marked as read by user ${userId}`);
    res.json({ message: 'Message marked as read' });
  } catch (error) {
    console.error('Error marking message as read:', error);
    res.status(500).json({ 
      error: 'Failed to mark message as read',
      message: error.message 
    });
  }
});

// GET unread message count
router.get('/unread/count', auth, async (req, res) => {
  try {
    const userId = req.user.userId;
    
    const result = await sequelize.query(`
      SELECT COUNT(*) as unreadCount
      FROM Messages 
      WHERE receiverId = ? AND isRead = 0
    `, {
      replacements: [userId],
      type: sequelize.QueryTypes.SELECT
    });
    
    const unreadCount = result[0].unreadCount;
    console.log(`User ${userId} has ${unreadCount} unread messages`);
    
    res.json({ unreadCount });
  } catch (error) {
    console.error('Error getting unread count:', error);
    res.status(500).json({ 
      error: 'Failed to get unread count',
      message: error.message 
    });
  }
});

module.exports = router;