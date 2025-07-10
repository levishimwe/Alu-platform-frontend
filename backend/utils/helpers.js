// === backend/utils/helpers.js ===
exports.formatResponse = (success, message, data = {}) => {
  return { success, message, data };
};

exports.handleError = (res, error) => {
  console.error(error);
  return res.status(500).json({ success: false, message: "Internal Server Error" });
};
