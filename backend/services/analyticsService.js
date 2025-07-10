// === backend/services/analyticsService.js ===
exports.trackProjectView = async (projectId) => {
  // Simple increment function - to be expanded with logging details
  const { Project } = require("../models");
  const project = await Project.findByPk(projectId);
  if (project) {
    project.views += 1;
    await project.save();
  }
};
