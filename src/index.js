require("dotenv").config();
const path = require("path");
const express = require("express");
const cors = require("cors");
const { sequelize } = require("./models");
const authMiddleware = require("./middleware/auth");

const authRoutes = require("./routes/authRoutes");
const projectRoutes = require("./routes/projectRoutes");
const taskRoutes = require("./routes/taskRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "..", "public")));

if (!process.env.JWT_SECRET) {
  console.error("Missing required environment variable: JWT_SECRET");
  process.exit(1);
}

app.get("/api/health", (_req, res) => {
  res.json({ ok: true, message: "Team Task Manager API running" });
});

app.use("/api/auth", authRoutes);
app.use("/api/projects", authMiddleware, projectRoutes);
app.use("/api", authMiddleware, taskRoutes);
app.use("/api/dashboard", authMiddleware, dashboardRoutes);

app.get(/.*/, (_req, res) => {
  res.sendFile(path.join(__dirname, "..", "public", "index.html"));
});

const PORT = process.env.PORT || 5000;

sequelize
  .authenticate()
  .then(() => sequelize.sync())
  .then(async () => {
    // Enable foreign keys for SQLite after sync
    if (!process.env.DATABASE_URL) {
      await sequelize.query("PRAGMA foreign_keys = ON");
    }
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("Database connection failed:", err.message);
    console.error("Full error:", err);
    process.exit(1);
  });
