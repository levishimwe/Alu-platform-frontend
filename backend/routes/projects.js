// === backend/routes/projects.js ===
const express = require("express");
const router = express.Router();
const projectController = require("../controllers/projectController");
const { verifyToken } = require("../middleware/auth");

router.get("/", projectController.getAllProjects);
router.get("/featured", projectController.getFeaturedProjects);
router.get("/:id", projectController.getProjectById);
router.post("/", verifyToken, projectController.createProject);
router.put("/:id", verifyToken, projectController.updateProject);
router.delete("/:id", verifyToken, projectController.deleteProject);
router.post("/:id/view", projectController.incrementViews);
router.post("/:id/upload-media", verifyToken, projectController.uploadMedia);

module.exports = router;
