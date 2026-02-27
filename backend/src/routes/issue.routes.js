// ✅ Purpose: Define all issue endpoints

const express = require("express");
const router = express.Router();

const {
  createIssue,
  getAllIssues,
  getIssueById,
  updateIssue,
  deleteIssue,
  getTrendingIssues,
} = require("../controllers/issue.controller");

const { protect } = require("../middleware/auth.middleware");
const upload = require("../middleware/upload.middleware");

// Public routes
router.get("/", getAllIssues);
router.get("/trending", getTrendingIssues);
router.get("/:id", getIssueById);

// Protected routes (must be logged in)
router.post("/", protect, upload.single("image"), createIssue);
router.put("/:id", protect, upload.single("image"), updateIssue);
router.delete("/:id", protect, deleteIssue);

module.exports = router;