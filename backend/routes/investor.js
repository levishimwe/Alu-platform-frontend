// === backend/routes/investor.js ===
const express = require("express");
const router = express.Router();
const investorController = require("../controllers/investorController");
const { verifyToken, requireRole } = require("../middleware/auth");

router.get("/dashboard", verifyToken, requireRole("investor"), investorController.getDashboard);
router.post("/bookmark/:projectId", verifyToken, investorController.bookmarkProject);
router.get("/bookmarks", verifyToken, investorController.getBookmarks);
router.post("/express-interest", verifyToken, investorController.expressInterest);
router.post("/contact-graduate", verifyToken, investorController.contactGraduate);
router.get("/conversations", verifyToken, investorController.getConversations);

module.exports = router;
