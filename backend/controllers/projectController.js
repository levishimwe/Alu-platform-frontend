const { Project, User, Interaction } = require("../models/associations");

exports.createProject = async (req, res) => {
  try {
    const project = await Project.create({ ...req.body, graduateId: req.user.id });
    res.status(201).json(project);
  } catch (error) {
    res.status(500).json({ message: "Create failed", error });
  }
};

exports.updateProject = async (req, res) => {
  try {
    await Project.update(req.body, {
      where: { id: req.params.id, graduateId: req.user.id },
    });
    res.json({ message: "Updated successfully" });
  } catch (error) {
    res.status(500).json({ message: "Update failed", error });
  }
};

exports.getAllProjects = async (req, res) => {
  try {
    const projects = await Project.findAll({ where: { status: "published" } });
    res.json(projects);
  } catch (error) {
    res.status(500).json({ message: "Fetch failed", error });
  }
};

exports.getFeaturedProjects = async (req, res) => {
  try {
    const projects = await Project.findAll({ 
      where: { status: "published", featured: true },
      limit: 10 // Adjust as needed
    });
    res.json(projects);
  } catch (error) {
    res.status(500).json({ message: "Fetch featured projects failed", error });
  }
};

exports.getProjectById = async (req, res) => {
  try {
    const project = await Project.findByPk(req.params.id);
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }
    res.json(project);
  } catch (error) {
    res.status(500).json({ message: "Fetch project failed", error });
  }
};

exports.deleteProject = async (req, res) => {
  try {
    const deleted = await Project.destroy({
      where: { id: req.params.id, graduateId: req.user.id }
    });
    if (!deleted) {
      return res.status(404).json({ message: "Project not found or unauthorized" });
    }
    res.json({ message: "Project deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Delete failed", error });
  }
};

exports.incrementViews = async (req, res) => {
  try {
    const project = await Project.findByPk(req.params.id);
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }
    
    await Project.increment('views', {
      where: { id: req.params.id }
    });
    
    res.json({ message: "Views incremented successfully" });
  } catch (error) {
    res.status(500).json({ message: "Increment views failed", error });
  }
};

exports.uploadMedia = async (req, res) => {
  try {
    // This is a basic implementation - you'll need to add proper file upload handling
    // Consider using multer middleware for file uploads
    const project = await Project.findOne({
      where: { id: req.params.id, graduateId: req.user.id }
    });
    
    if (!project) {
      return res.status(404).json({ message: "Project not found or unauthorized" });
    }
    
    // Add your file upload logic here
    // For now, just return a placeholder response
    res.json({ message: "Media upload endpoint - implement file handling" });
  } catch (error) {
    res.status(500).json({ message: "Media upload failed", error });
  }
};