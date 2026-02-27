// server.js
// ✅ Purpose: Entry point of the application
// Connects to database, then starts the HTTP server

const app = require("./app");
const connectDB = require("./src/config/db");
const { PORT } = require("./src/config/env");

// ─────────────────────────────────────────
// 🚀 START SERVER
// ─────────────────────────────────────────

const startServer = async () => {
  try {
    // Step 1: Connect to MongoDB FIRST
    // We don't want the server accepting requests before DB is ready
    await connectDB();

    // Step 2: Start the Express server
    app.listen(PORT, () => {
      console.log("─────────────────────────────────────");
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`🌍 Environment: ${process.env.NODE_ENV}`);
      console.log(`📡 API URL: http://localhost:${PORT}`);
      console.log("─────────────────────────────────────");
    });
  } catch (error) {
    console.error("❌ Failed to start server:", error);
    process.exit(1);
  }
};
console.log("MONGO_URI:", process.env.MONGO_URI);
// Handle unexpected errors that aren't caught anywhere
process.on("unhandledRejection", (err) => {
  console.error("🔥 Unhandled Promise Rejection:", err.message);
  process.exit(1);
});

process.on("uncaughtException", (err) => {
  console.error("🔥 Uncaught Exception:", err.message);
  process.exit(1);
});

// Start it up!
startServer();