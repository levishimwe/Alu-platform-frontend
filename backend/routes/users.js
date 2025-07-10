// === backend/routes/users.js ===
const express = require("express");
const multer = require("multer");
const router = express.Router();
const upload = multer({ dest: "uploads/" }); // or configure storage/cloud later
const userController = require("../controllers/userController");
const { verifyToken } = require("../middleware/auth");

router.get("/profile", verifyToken, userController.getProfile);
router.put("/profile", verifyToken, userController.updateProfile);
router.post("/upload-avatar", verifyToken, userController.uploadAvatar);
router.post("/upload-degree", verifyToken, userController.uploadDegree);
router.delete("/account", verifyToken, userController.deleteAccount);

module.exports = router;
