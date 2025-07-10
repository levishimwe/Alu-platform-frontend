// === backend/middleware/upload.js ===
const multer = require("multer");
const path = require("path");

const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  if (
    [".png", ".jpg", ".jpeg", ".pdf", ".mp4"].includes(
      path.extname(file.originalname).toLowerCase()
    )
  ) {
    cb(null, true);
  } else {
    cb(new Error("Invalid file type"), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 },
});

module.exports = upload;
