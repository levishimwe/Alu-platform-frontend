const { Project, User, Interaction } = require("../models/associations"); // Adjust imports based on your models

// Provides graduate dashboard data, project analytics, engagement metrics
exports.getDashboardStats = async (req, res) => {
  try {
    const userId = req.user.id;
    const projects = await Project.findAll({ where: { graduateId: userId } });
    const views = projects.reduce((acc, project) => acc + project.views, 0);
    const likes = projects.reduce((acc, project) => acc + project.likes, 0);
    res.json({ totalProjects: projects.length, totalViews: views, totalLikes: likes });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch dashboard stats", error });
  }
};

// Main dashboard endpoint (this is what your route is calling)
exports.getDashboard = async (req, res) => {
  try {
    const userId = req.user.id;
    const projects = await Project.findAll({ where: { graduateId: userId } });
    const views = projects.reduce((acc, project) => acc + (project.views || 0), 0);
    const likes = projects.reduce((acc, project) => acc + (project.likes || 0), 0);
    
    // Get recent projects
    const recentProjects = await Project.findAll({
      where: { graduateId: userId },
      order: [['createdAt', 'DESC']],
      limit: 5
    });

    res.json({
      totalProjects: projects.length,
      totalViews: views,
      totalLikes: likes,
      recentProjects: recentProjects
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch dashboard", error });
  }
};

// Get all projects for the logged-in graduate
exports.getMyProjects = async (req, res) => {
  try {
    const userId = req.user.id;
    const projects = await Project.findAll({
      where: { graduateId: userId },
      order: [['createdAt', 'DESC']]
    });
    res.json(projects);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch projects", error });
  }
};

// Get analytics for a specific project
exports.getAnalytics = async (req, res) => {
  try {
    const userId = req.user.id;
    const projectId = req.params.projectId;
    
    const project = await Project.findOne({
      where: { id: projectId, graduateId: userId }
    });
    
    if (!project) {
      return res.status(404).json({ message: "Project not found or unauthorized" });
    }
    
    // Basic analytics - you can expand this based on your needs
    const analytics = {
      projectId: project.id,
      title: project.title,
      views: project.views || 0,
      likes: project.likes || 0,
      createdAt: project.createdAt,
      status: project.status
    };
    
    res.json(analytics);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch analytics", error });
  }
};

// Get messages for the graduate
exports.getMessages = async (req, res) => {
  try {
    const userId = req.user.id;
    
    // This assumes you have a Message model - adjust based on your schema
    const messages = await Message.findAll({
      where: { recipientId: userId },
      order: [['createdAt', 'DESC']],
      limit: 50
    });
    
    res.json(messages);
  } catch (error) {
    // If Message model doesn't exist, return empty array for now
    res.json([]);
  }
};
