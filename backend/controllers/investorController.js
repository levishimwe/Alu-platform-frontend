const { Project, User, Interaction } = require("../models/associations"); // Adjust imports based on your models

// Manages bookmarks, expressions of interest, messaging with graduates
exports.bookmarkProject = async (req, res) => {
  try {
    const investorId = req.user.id;
    const { projectId } = req.params;
    await Interaction.create({ investorId, projectId, type: "bookmark" });
    res.status(201).json({ message: "Project bookmarked successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to bookmark project", error });
  }
};

exports.contactGraduate = async (req, res) => {
  try {
    const investorId = req.user.id;
    const { projectId } = req.body;
    const { message } = req.body;
    await Interaction.create({ investorId, projectId, type: "contact", message });
    res.status(201).json({ message: "Graduate contacted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to contact graduate", error });
  }
};

// Get investor dashboard data
exports.getDashboard = async (req, res) => {
  try {
    const investorId = req.user.id;
    
    // Get bookmarked projects count
    const bookmarksCount = await Interaction.count({
      where: { investorId, type: "bookmark" }
    });
    
    // Get expressions of interest count
    const interestsCount = await Interaction.count({
      where: { investorId, type: "interest" }
    });
    
    // Get recent bookmarked projects
    const recentBookmarks = await Interaction.findAll({
      where: { investorId, type: "bookmark" },
      include: [{ model: Project, as: "project" }],
      order: [['createdAt', 'DESC']],
      limit: 5
    });
    
    res.json({
      totalBookmarks: bookmarksCount,
      totalInterests: interestsCount,
      recentBookmarks: recentBookmarks
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch dashboard", error });
  }
};

// Get all bookmarked projects for the investor
exports.getBookmarks = async (req, res) => {
  try {
    const investorId = req.user.id;
    
    const bookmarks = await Interaction.findAll({
      where: { investorId, type: "bookmark" },
      include: [{ 
        model: Project, 
        as: "project",
        include: [{ model: User, as: "graduate", attributes: ['id', 'name', 'email'] }]
      }],
      order: [['createdAt', 'DESC']]
    });
    
    res.json(bookmarks);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch bookmarks", error });
  }
};

// Express interest in a project
exports.expressInterest = async (req, res) => {
  try {
    const investorId = req.user.id;
    const { projectId, message } = req.body;
    
    // Check if interest already exists
    const existingInterest = await Interaction.findOne({
      where: { investorId, projectId, type: "interest" }
    });
    
    if (existingInterest) {
      return res.status(400).json({ message: "Interest already expressed for this project" });
    }
    
    await Interaction.create({ 
      investorId, 
      projectId, 
      type: "interest", 
      message 
    });
    
    res.status(201).json({ message: "Interest expressed successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to express interest", error });
  }
};

// Get all conversations for the investor
exports.getConversations = async (req, res) => {
  try {
    const investorId = req.user.id;
    
    // Get all interactions where the investor contacted graduates
    const conversations = await Interaction.findAll({
      where: { 
        investorId, 
        type: ["contact", "interest"] 
      },
      include: [
        { 
          model: Project, 
          as: "project",
          include: [{ model: User, as: "graduate", attributes: ['id', 'name', 'email'] }]
        }
      ],
      order: [['createdAt', 'DESC']]
    });
    
    // Group by project/graduate
    const groupedConversations = conversations.reduce((acc, interaction) => {
      const key = `${interaction.projectId}-${interaction.project.graduateId}`;
      if (!acc[key]) {
        acc[key] = {
          project: interaction.project,
          graduate: interaction.project.graduate,
          messages: []
        };
      }
      acc[key].messages.push({
        id: interaction.id,
        type: interaction.type,
        message: interaction.message,
        createdAt: interaction.createdAt
      });
      return acc;
    }, {});
    
    res.json(Object.values(groupedConversations));
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch conversations", error });
  }
};

// Remove bookmark (bonus function)
exports.removeBookmark = async (req, res) => {
  try {
    const investorId = req.user.id;
    const { projectId } = req.params;
    
    const deleted = await Interaction.destroy({
      where: { investorId, projectId, type: "bookmark" }
    });
    
    if (!deleted) {
      return res.status(404).json({ message: "Bookmark not found" });
    }
    
    res.json({ message: "Bookmark removed successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to remove bookmark", error });
  }
};
