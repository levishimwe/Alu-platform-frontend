// === backend/routes/admin.js ===
const express = require("express");
const router = express.Router();
const adminController = require("../controllers/adminController");
const { verifyToken, requireRole } = require("../middleware/auth");

router.get("/dashboard", verifyToken, requireRole("admin"), adminController.getDashboard);
router.get("/users", verifyToken, requireRole("admin"), adminController.getUsers);
router.put("/users/:id/status", verifyToken, requireRole("admin"), adminController.updateUserStatus);
router.get("/projects/pending", verifyToken, requireRole("admin"), adminController.getPendingProjects);
router.put("/projects/:id/approve", verifyToken, requireRole("admin"), adminController.approveProject);
router.get("/analytics", verifyToken, requireRole("admin"), adminController.getAnalytics);
router.get("/reports", verifyToken, requireRole("admin"), adminController.getReports);

module.exports = router;
