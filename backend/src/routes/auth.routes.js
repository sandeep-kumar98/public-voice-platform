// ✅ Purpose: Define all authentication URL endpoints

const express = require("express");
const router = express.Router();

const {
  signup,
  login,
  logout,
  getMe,
} = require("../controllers/auth.controller");

const { protect } = require("../middleware/auth.middleware");

// Public routes — no token needed
router.post("/signup", signup);
router.post("/login", login);
router.post("/logout", logout);

// Protected route — must be logged in
router.get("/me", protect, getMe);

module.exports = router;