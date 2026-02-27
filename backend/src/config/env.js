// src/config/env.js
// ✅ Purpose: Load environment variables and validate they exist
// Without this, our app might crash in weird ways if a secret is missing

require("dotenv").config(); // Load .env file

// List of ALL required environment variables
const requiredEnvVars = [
  "PORT",
  "MONGO_URI",
  "JWT_SECRET",
  "JWT_EXPIRES_IN",
  "CLOUDINARY_CLOUD_NAME",
  "CLOUDINARY_API_KEY",
  "CLOUDINARY_API_SECRET",
];

// Check each one — if any is missing, crash immediately with a clear message
requiredEnvVars.forEach((varName) => {
  if (!process.env[varName]) {
    console.error(`❌ Missing required environment variable: ${varName}`);
    process.exit(1); // Stop the server
  }
});

// Export all config values in one clean object
// This way we import from ONE place throughout the app
module.exports = {
  PORT: process.env.PORT || 5000,
  NODE_ENV: process.env.NODE_ENV || "development",
  MONGO_URI: process.env.MONGO_URI,
  JWT_SECRET: process.env.JWT_SECRET,
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN,
  CLOUDINARY: {
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  },
  AI_SERVICE_URL: process.env.AI_SERVICE_URL || "http://localhost:8000",
};