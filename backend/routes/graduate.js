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

// Get graduate dashboard
router.get('/dashboard', auth, graduateAuth, async (req, res) => {
  try {
    const userId = req.user.userId;

    // Get user's projects
    const projects = await Project.findAll({
      where: { userId },
      order: [['createdAt', 'DESC']]
    });

    // Calculate stats
    const totalProjects = projects.length;
    const approvedProjects = projects.filter(p => p.status === 'approved').length;
    const pendingProjects = projects.filter(p => p.status === 'pending').length;
    const totalViews = projects.reduce((sum, p) => sum + p.views, 0);
    const totalLikes = projects.reduce((sum, p) => sum + p.likes, 0);

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
    const projects = await Project.findAll({
      where: { userId: req.user.userId },
      order: [['createdAt', 'DESC']]
    });

    res.json(projects);
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

    if (project.userId !== req.user.userId) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    // Basic analytics - expand as needed
    const analytics = {
      views: project.views,
      likes: project.likes,
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
