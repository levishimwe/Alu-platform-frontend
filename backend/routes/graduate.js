// === backend/routes/graduate.js ===
const express = require("express");
const router = express.Router();
const graduateController = require("../controllers/graduateController");
const { verifyToken, requireRole } = require("../middleware/auth");

router.get("/dashboard", verifyToken, requireRole("graduate"), graduateController.getDashboard);
router.get("/projects", verifyToken, requireRole("graduate"), graduateController.getMyProjects);
router.get("/analytics/:projectId", verifyToken, requireRole("graduate"), graduateController.getAnalytics);
router.get("/messages", verifyToken, requireRole("graduate"), graduateController.getMessages);

module.exports = router;
