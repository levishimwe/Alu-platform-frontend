const { Project, User, Interaction } = require("../models/associations"); // Adjust imports based on your models
const { Op } = require("sequelize"); // For advanced queries

// Admin moderation panel: approve/reject projects, manage users, platform analytics
exports.approveProject = async (req, res) => {
  try {
    const { id } = req.params;
    await Project.update({ status: "published" }, { where: { id } });
    res.json({ message: "Project approved successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to approve project", error });
  }
};

exports.rejectProject = async (req, res) => {
  try {
    const { id } = req.params;
    await Project.update({ status: "rejected" }, { where: { id } });
    res.json({ message: "Project rejected successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to reject project", error });
  }
};

exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.findAll();
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: "Failed to retrieve users", error });
  }
};

// Get admin dashboard with platform statistics
exports.getDashboard = async (req, res) => {
  try {
    // Get total counts
    const totalUsers = await User.count();
    const totalProjects = await Project.count();
    const pendingProjects = await Project.count({ where: { status: "pending" } });
    const publishedProjects = await Project.count({ where: { status: "published" } });
    
    // Get user counts by role
    const graduates = await User.count({ where: { role: "graduate" } });
    const investors = await User.count({ where: { role: "investor" } });
    const admins = await User.count({ where: { role: "admin" } });
    
    // Get recent activity
    const recentUsers = await User.findAll({
      order: [['createdAt', 'DESC']],
      limit: 5,
      attributes: ['id', 'name', 'email', 'role', 'createdAt']
    });
    
    const recentProjects = await Project.findAll({
      order: [['createdAt', 'DESC']],
      limit: 5,
      include: [{ model: User, as: "graduate", attributes: ['name', 'email'] }]
    });
    
    res.json({
      totalUsers,
      totalProjects,
      pendingProjects,
      publishedProjects,
      usersByRole: { graduates, investors, admins },
      recentUsers,
      recentProjects
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch dashboard", error });
  }
};

// Get all users (alias for getAllUsers for consistency with routes)
exports.getUsers = async (req, res) => {
  try {
    const { page = 1, limit = 50, role, status } = req.query;
    const offset = (page - 1) * limit;
    
    const whereClause = {};
    if (role) whereClause.role = role;
    if (status) whereClause.status = status;
    
    const users = await User.findAndCountAll({
      where: whereClause,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['createdAt', 'DESC']],
      attributes: { exclude: ['password'] } // Don't send passwords
    });
    
    res.json({
      users: users.rows,
      totalCount: users.count,
      currentPage: parseInt(page),
      totalPages: Math.ceil(users.count / limit)
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to retrieve users", error });
  }
};

// Update user status (activate/deactivate)
exports.updateUserStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    if (!['active', 'inactive', 'suspended'].includes(status)) {
      return res.status(400).json({ message: "Invalid status value" });
    }
    
    await User.update({ status }, { where: { id } });
    res.json({ message: "User status updated successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to update user status", error });
  }
};

// Get pending projects for moderation
exports.getPendingProjects = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;
    
    const projects = await Project.findAndCountAll({
      where: { status: "pending" },
      include: [{ model: User, as: "graduate", attributes: ['name', 'email'] }],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['createdAt', 'ASC']] // Oldest first for fair review
    });
    
    res.json({
      projects: projects.rows,
      totalCount: projects.count,
      currentPage: parseInt(page),
      totalPages: Math.ceil(projects.count / limit)
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch pending projects", error });
  }
};

// Get platform analytics
exports.getAnalytics = async (req, res) => {
  try {
    const { period = '30' } = req.query; // Default to last 30 days
    const daysAgo = new Date();
    daysAgo.setDate(daysAgo.getDate() - parseInt(period));
    
    // User registration analytics
    const newUsers = await User.count({
      where: { createdAt: { [Op.gte]: daysAgo } }
    });
    
    // Project submission analytics
    const newProjects = await Project.count({
      where: { createdAt: { [Op.gte]: daysAgo } }
    });
    
    // Engagement analytics (if you have interactions)
    let totalInteractions = 0;
    try {
      totalInteractions = await Interaction.count({
        where: { createdAt: { [Op.gte]: daysAgo } }
      });
    } catch (err) {
      // Interaction model might not exist
    }
    
    // Project status breakdown
    const projectsByStatus = await Project.findAll({
      attributes: [
        'status',
        [Project.sequelize.fn('COUNT', Project.sequelize.col('id')), 'count']
      ],
      group: ['status']
    });
    
    // Users by role
    const usersByRole = await User.findAll({
      attributes: [
        'role',
        [User.sequelize.fn('COUNT', User.sequelize.col('id')), 'count']
      ],
      group: ['role']
    });
    
    res.json({
      period: parseInt(period),
      newUsers,
      newProjects,
      totalInteractions,
      projectsByStatus,
      usersByRole
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch analytics", error });
  }
};

// Get system reports
exports.getReports = async (req, res) => {
  try {
    const { type = 'overview' } = req.query;
    
    switch (type) {
      case 'overview':
        const overview = {
          totalUsers: await User.count(),
          totalProjects: await Project.count(),
          activeUsers: await User.count({ where: { status: 'active' } }),
          publishedProjects: await Project.count({ where: { status: 'published' } }),
          pendingProjects: await Project.count({ where: { status: 'pending' } })
        };
        res.json(overview);
        break;
        
      case 'user-activity':
        const userActivity = await User.findAll({
          attributes: ['id', 'name', 'email', 'role', 'createdAt', 'updatedAt'],
          order: [['updatedAt', 'DESC']],
          limit: 100
        });
        res.json(userActivity);
        break;
        
      case 'project-performance':
        const projectPerformance = await Project.findAll({
          attributes: ['id', 'title', 'status', 'views', 'likes', 'createdAt'],
          order: [['views', 'DESC']],
          limit: 50
        });
        res.json(projectPerformance);
        break;
        
      default:
        res.status(400).json({ message: "Invalid report type" });
    }
  } catch (error) {
    res.status(500).json({ message: "Failed to generate reports", error });
  }
};
