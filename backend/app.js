const express = require("express");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");

const app = express();

// ── MANUAL CORS FIX ──
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }
  next();
});

// ── LOGGING ──
app.use(morgan("dev"));

// ── BODY PARSING ──
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// ── HEALTH CHECK ──
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "🌍 Public Voice Platform API is running!",
    version: "1.0.0",
  });
});

// ── ROUTES ──
app.use("/api/auth", require("./src/routes/auth.routes"));
app.use("/api/issues", require("./src/routes/issue.routes"));
app.use("/api/votes", require("./src/routes/vote.routes"));
app.use("/api/petitions", require("./src/routes/petition.routes"));
app.use("/api/comments", require("./src/routes/comment.routes"));
app.use("/api/notifications", require("./src/routes/notification.routes"));
app.use("/api/users", require("./src/routes/user.routes"));
app.use("/api/admin", require("./src/routes/admin.routes"));

// ── 404 HANDLER ──
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`,
  });
});

// ── ERROR HANDLER ──
app.use((err, req, res, next) => {
  console.error("🔥 Error:", err.message);
  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || "Internal Server Error",
  });
});

module.exports = app;