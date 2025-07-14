const express = require('express');
const { User, Project } = require('../models');
const auth = require('../middleware/auth');
const router = express.Router();

// Investor middleware
const investorAuth = (req, res, next) => {
  if (req.user.userType !== 'investor') {
    return res.status(403).json({ message: 'Investor access required' });
  }
  next();
};

// Get investor dashboard
router.get('/dashboard', auth, investorAuth, async (req, res) => {
  try {
    // Get featured and recent projects
    const featuredProjects = await Project.findAll({
      where: { isFeatured: true, status: 'approved' },
      include: [{
        model: User,
        as: 'user',
        attributes: ['firstName', 'lastName', 'profileImage']
      }],
      limit: 6,
      order: [['views', 'DESC']]
    });

    const recentProjects = await Project.findAll({
      where: { status: 'approved' },
      include: [{
        model: User,
        as: 'user',
        attributes: ['firstName', 'lastName', 'profileImage']
      }],
      limit: 10,
      order: [['createdAt', 'DESC']]
    });

    res.json({
      featuredProjects,
      recentProjects
    });
  } catch (error) {
    console.error('Investor dashboard error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Bookmark project (placeholder)
router.post('/bookmark/:projectId', auth, investorAuth, async (req, res) => {
  try {
    const project = await Project.findByPk(req.params.projectId);
    
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Placeholder for bookmark functionality
    res.json({ message: 'Project bookmarked successfully' });
  } catch (error) {
    console.error('Bookmark project error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get bookmarks (placeholder)
router.get('/bookmarks', auth, investorAuth, async (req, res) => {
  try {
    // Placeholder for bookmarks
    res.json({ bookmarks: [] });
  } catch (error) {
    console.error('Get bookmarks error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Express interest (placeholder)
router.post('/express-interest', auth, investorAuth, async (req, res) => {
  try {
    const { projectId, message } = req.body;
    
    const project = await Project.findByPk(projectId);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Placeholder for interest expression
    res.json({ message: 'Interest expressed successfully' });
  } catch (error) {
    console.error('Express interest error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Contact graduate (placeholder)
router.post('/contact-graduate', auth, investorAuth, async (req, res) => {
  try {
    const { graduateId, message } = req.body;
    
    const graduate = await User.findByPk(graduateId);
    if (!graduate || graduate.userType !== 'graduate') {
      return res.status(404).json({ message: 'Graduate not found' });
    }

    // Placeholder for contacting graduate
    res.json({ message: 'Message sent successfully' });
  } catch (error) {
    console.error('Contact graduate error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get conversations (placeholder)
router.get('/conversations', auth, investorAuth, async (req, res) => {
  try {
    // Placeholder for conversations
    res.json({ conversations: [] });
  } catch (error) {
    console.error('Get conversations error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
