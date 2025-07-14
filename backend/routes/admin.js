const express = require('express');
const { User, Project } = require('../models');
const auth = require('../middleware/auth');
const router = express.Router();

// Admin middleware
const adminAuth = (req, res, next) => {
  if (req.user.userType !== 'admin') {
    return res.status(403).json({ message: 'Admin access required' });
  }
  next();
};

// Get admin dashboard data
router.get('/dashboard', auth, adminAuth, async (req, res) => {
  try {
    const totalUsers = await User.count();
    const totalProjects = await Project.count();
    const pendingProjects = await Project.count({ where: { status: 'pending' } });
    const approvedProjects = await Project.count({ where: { status: 'approved' } });

    const recentUsers = await User.findAll({
      limit: 5,
      order: [['createdAt', 'DESC']],
      attributes: { exclude: ['password'] }
    });

    const recentProjects = await Project.findAll({
      limit: 5,
      order: [['createdAt', 'DESC']],
      include: [{
        model: User,
        as: 'user',
        attributes: ['firstName', 'lastName']
      }]
    });

    res.json({
      stats: {
        totalUsers,
        totalProjects,
        pendingProjects,
        approvedProjects
      },
      recentUsers,
      recentProjects
    });
  } catch (error) {
    console.error('Admin dashboard error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get all users with filters
router.get('/users', auth, adminAuth, async (req, res) => {
  try {
    const { userType, isActive, page = 1, limit = 20 } = req.query;
    
    const where = {};
    if (userType) where.userType = userType;
    if (isActive !== undefined) where.isActive = isActive === 'true';
    
    const offset = (page - 1) * limit;

    const users = await User.findAndCountAll({
      where,
      attributes: { exclude: ['password'] },
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['createdAt', 'DESC']]
    });

    res.json({
      users: users.rows,
      totalUsers: users.count,
      totalPages: Math.ceil(users.count / limit),
      currentPage: parseInt(page)
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update user status
router.put('/users/:id/status', auth, adminAuth, async (req, res) => {
  try {
    const { status } = req.body; // isActive, isVerified, etc.
    
    const user = await User.findByPk(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    await user.update(status);

    res.json({ message: 'User status updated successfully', user });
  } catch (error) {
    console.error('Update user status error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get pending projects
router.get('/projects/pending', auth, adminAuth, async (req, res) => {
  try {
    const projects = await Project.findAll({
      where: { status: 'pending' },
      include: [{
        model: User,
        as: 'user',
        attributes: ['firstName', 'lastName', 'email']
      }],
      order: [['createdAt', 'ASC']]
    });

    res.json(projects);
  } catch (error) {
    console.error('Get pending projects error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Approve/reject project
router.put('/projects/:id/approve', auth, adminAuth, async (req, res) => {
  try {
    const { approved, reason } = req.body;
    
    const project = await Project.findByPk(req.params.id);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    const newStatus = approved ? 'approved' : 'rejected';
    await project.update({ status: newStatus });

    res.json({ 
      message: `Project ${newStatus} successfully`, 
      project,
      reason 
    });
  } catch (error) {
    console.error('Approve project error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get analytics
router.get('/analytics', auth, adminAuth, async (req, res) => {
  try {
    // Basic analytics - you can expand this
    const usersByType = await User.findAll({
      attributes: [
        'userType',
        [sequelize.fn('COUNT', sequelize.col('userType')), 'count']
      ],
      group: ['userType']
    });

    const projectsByCategory = await Project.findAll({
      attributes: [
        'category',
        [sequelize.fn('COUNT', sequelize.col('category')), 'count']
      ],
      group: ['category']
    });

    const projectsByStatus = await Project.findAll({
      attributes: [
        'status',
        [sequelize.fn('COUNT', sequelize.col('status')), 'count']
      ],
      group: ['status']
    });

    res.json({
      usersByType,
      projectsByCategory,
      projectsByStatus
    });
  } catch (error) {
    console.error('Get analytics error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Generate reports
router.get('/reports', auth, adminAuth, async (req, res) => {
  try {
    const { type, startDate, endDate } = req.query;
    
    let whereClause = {};
    if (startDate && endDate) {
      whereClause.createdAt = {
        [Op.between]: [new Date(startDate), new Date(endDate)]
      };
    }

    let data = {};
    
    switch (type) {
      case 'users':
        data = await User.findAll({
          where: whereClause,
          attributes: { exclude: ['password'] },
          order: [['createdAt', 'DESC']]
        });
        break;
      case 'projects':
        data = await Project.findAll({
          where: whereClause,
          include: [{
            model: User,
            as: 'user',
            attributes: ['firstName', 'lastName', 'email']
          }],
          order: [['createdAt', 'DESC']]
        });
        break;
      default:
        return res.status(400).json({ message: 'Invalid report type' });
    }

    res.json({ type, data, generatedAt: new Date() });
  } catch (error) {
    console.error('Generate report error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
