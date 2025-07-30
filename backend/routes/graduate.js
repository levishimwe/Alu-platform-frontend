const express = require('express');
const { User, Project } = require('../models');
const auth = require('../middleware/auth');
const router = express.Router();

// Graduate middleware
const graduateAuth = (req, res, next) => {
  if (req.user.userType !== 'graduate') {
    return res.status(403).json({ message: 'Graduate access required' });
  }
  next();
};

// Get all graduates (public endpoint for graduates directory)
router.get('/all', async (req, res) => {
  try {
    const graduates = await User.findAll({
      where: { userType: 'graduate' },
      attributes: ['id', 'firstName', 'lastName', 'email', 'bio', 'university', 'graduationYear', 'city', 'country', 'profileImage'],
      order: [['createdAt', 'DESC']]
    });

    res.json(graduates);
  } catch (error) {
    console.error('Error fetching all graduates:', error);
    res.status(500).json({ message: 'Error fetching graduates' });
  }
});

// Get graduate dashboard
router.get('/dashboard', auth, graduateAuth, async (req, res) => {
  try {
    const userId = req.user.userId || req.user.id;

    // Get user's projects
    const projects = await Project.findAll({
      where: { userId },
      order: [['createdAt', 'DESC']]
    });

    // Calculate stats
    const totalProjects = projects.length;
    const approvedProjects = projects.filter(p => p.status === 'approved').length;
    const pendingProjects = projects.filter(p => p.status === 'pending').length;
    const totalViews = projects.reduce((sum, p) => sum + (p.views || 0), 0);
    const totalLikes = projects.reduce((sum, p) => sum + (p.likes || 0), 0);

    res.json({
      stats: {
        totalProjects,
        approvedProjects,
        pendingProjects,
        totalViews,
        totalLikes
      },
      recentProjects: projects.slice(0, 5)
    });
  } catch (error) {
    console.error('Graduate dashboard error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get graduate's projects
router.get('/projects', auth, graduateAuth, async (req, res) => {
  try {
    const userId = req.user.userId || req.user.id;
    const projects = await Project.findAll({
      where: { userId },
      order: [['createdAt', 'DESC']]
    });

    res.json({ projects });
  } catch (error) {
    console.error('Get graduate projects error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get project analytics
router.get('/analytics/:projectId', auth, graduateAuth, async (req, res) => {
  try {
    const project = await Project.findByPk(req.params.projectId);
    
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    const userId = req.user.userId || req.user.id;
    if (project.userId !== userId) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    // Basic analytics - expand as needed
    const analytics = {
      views: project.views || 0,
      likes: project.likes || 0,
      status: project.status,
      createdAt: project.createdAt,
      // Add more analytics data as needed
    };

    res.json(analytics);
  } catch (error) {
    console.error('Get project analytics error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get messages (placeholder)
router.get('/messages', auth, graduateAuth, async (req, res) => {
  try {
    // Placeholder for messaging system
    res.json({ messages: [] });
  } catch (error) {
    console.error('Get messages error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
