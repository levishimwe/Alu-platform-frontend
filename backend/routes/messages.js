const express = require('express');
const { body, validationResult } = require('express-validator');
const { Message, User } = require('../models');
const auth = require('../middleware/auth');
const router = express.Router();

// Send a message
router.post('/send', [
  auth,
  body('recipientId').isInt().withMessage('Valid recipient ID is required'),
  body('subject').trim().isLength({ min: 1 }).withMessage('Subject is required'),
  body('content').trim().isLength({ min: 1 }).withMessage('Message content is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { recipientId, subject, content } = req.body;
    const senderId = req.user.id;

    // Check if recipient exists
    const recipient = await User.findByPk(recipientId);
    if (!recipient) {
      return res.status(404).json({ message: 'Recipient not found' });
    }

    // Create the message
    const message = await Message.create({
      senderId,
      recipientId,
      subject,
      content,
      isRead: false
    });

    // Fetch the complete message with sender info
    const fullMessage = await Message.findByPk(message.id, {
      include: [
        {
          model: User,
          as: 'sender',
          attributes: ['id', 'firstName', 'lastName', 'email']
        },
        {
          model: User,
          as: 'recipient',
          attributes: ['id', 'firstName', 'lastName', 'email']
        }
      ]
    });

    res.status(201).json({
      message: 'Message sent successfully',
      data: fullMessage
    });

  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({ message: 'Failed to send message' });
  }
});

// Get user's messages (both sent and received)
router.get('/', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const { type = 'all' } = req.query;

    let whereClause = {};
    if (type === 'received') {
      whereClause.recipientId = userId;
    } else if (type === 'sent') {
      whereClause.senderId = userId;
    } else {
      whereClause = {
        [require('sequelize').Op.or]: [
          { senderId: userId },
          { recipientId: userId }
        ]
      };
    }

    const messages = await Message.findAll({
      where: whereClause,
      include: [
        {
          model: User,
          as: 'sender',
          attributes: ['id', 'firstName', 'lastName', 'email']
        },
        {
          model: User,
          as: 'recipient',
          attributes: ['id', 'firstName', 'lastName', 'email']
        }
      ],
      order: [['createdAt', 'DESC']]
    });

    res.json({
      message: 'Messages retrieved successfully',
      messages
    });

  } catch (error) {
    console.error('Get messages error:', error);
    res.status(500).json({ message: 'Failed to retrieve messages' });
  }
});

// Mark message as read
router.put('/:id/read', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const message = await Message.findOne({
      where: {
        id,
        recipientId: userId // Only recipient can mark as read
      }
    });

    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }

    await message.update({ isRead: true });

    res.json({ message: 'Message marked as read' });

  } catch (error) {
    console.error('Mark as read error:', error);
    res.status(500).json({ message: 'Failed to mark message as read' });
  }
});

// Delete message
router.delete('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const message = await Message.findOne({
      where: {
        id,
        [require('sequelize').Op.or]: [
          { senderId: userId },
          { recipientId: userId }
        ]
      }
    });

    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }

    await message.destroy();

    res.json({ message: 'Message deleted successfully' });

  } catch (error) {
    console.error('Delete message error:', error);
    res.status(500).json({ message: 'Failed to delete message' });
  }
});

// Get users for messaging (exclude current user)
router.get('/users', auth, async (req, res) => {
  try {
    const currentUserId = req.user.id;

    const users = await User.findAll({
      where: {
        id: { [require('sequelize').Op.ne]: currentUserId },
        isActive: true
      },
      attributes: ['id', 'firstName', 'lastName', 'email', 'userType'],
      order: [['firstName', 'ASC']]
    });

    res.json({
      message: 'Users retrieved successfully',
      users
    });

  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ message: 'Failed to retrieve users' });
  }
});

module.exports = router;