const { User, GraduateProfile } = require("../models");

exports.getProfile = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      include: ["graduateProfile", "investorProfile"],
    });
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: "Error fetching profile", error });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    await User.update(req.body, { where: { id: req.user.id } });
    res.json({ message: "Profile updated" });
  } catch (error) {
    res.status(500).json({ message: "Update failed", error });
  }
};

exports.uploadDegree = async (req, res) => {
  if (!req.file || req.file.mimetype !== "application/pdf") {
    return res.status(400).json({ message: "Invalid degree document. PDF only." });
  }
  try {
    await GraduateProfile.update(
      { aluDegreeDocument: req.file.path },
      { where: { userId: req.user.id } }
    );
    res.json({ message: "Degree uploaded" });
  } catch (error) {
    res.status(500).json({ message: "Upload failed", error });
  }
};
exports.uploadAvatar = async (req, res) => {
  // Placeholder: replace with Cloudinary/AWS S3 logic later
  if (!req.file || !req.file.mimetype.startsWith("image/")) {
    return res.status(400).json({ message: "Invalid image file." });
  }

  try {
    // Save image path or URL (e.g., from Cloudinary) to user
    await User.update(
      { profileImage: req.file.path }, // assuming path is from multer
      { where: { id: req.user.id } }
    );
    res.json({ message: "Avatar uploaded" });
  } catch (error) {
    res.status(500).json({ message: "Avatar upload failed", error });
  }
};

exports.deleteAccount = async (req, res) => {
  try {
    await User.destroy({ where: { id: req.user.id } });
    res.json({ message: "Account deleted" });
  } catch (error) {
    res.status(500).json({ message: "Delete failed", error });
  }
};
