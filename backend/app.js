// === backend/app.js ===
require('dotenv').config();
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const swaggerUi = require("swagger-ui-express");
const swaggerDocument = require("./doc/swagger.json");

const authRoutes = require("./routes/auth");
const userRoutes = require("./routes/users");
const projectRoutes = require("./routes/projects");
const graduateRoutes = require("./routes/graduate");
const investorRoutes = require("./routes/investor");
const adminRoutes = require("./routes/admin");

const { sequelize } = require("./config/database");
 // ✅ Sequelize instance

require("./models/associations"); // ✅ Register all models & associations

const app = express();

app.use(cors());
app.use(helmet());
app.use(express.json());

// Rate limiting
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: "Too many requests, try again later.",
  })
);

// Swagger Docs
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// ✅ Log that Swagger UI is running
console.log("📘 API documentation available at: http://localhost:5000/api-docs");

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/graduate", graduateRoutes);
app.use("/api/investor", investorRoutes);
app.use("/api/admin", adminRoutes);

// Test and sync DB
sequelize.authenticate()
  .then(() => {
    console.log("✅ Database connected...");
    return sequelize.sync(); // Optional: { force: true } for dev resets
  })
  .then(() => console.log("✅ Database synced..."))
  .catch((err) => console.error("❌ DB Error: ", err));

module.exports = app;
