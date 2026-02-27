// ✅ Purpose: Vote endpoints

const express = require("express");
const router = express.Router();
const { voteIssue, getUserVote } = require("../controllers/vote.controller");
const { protect } = require("../middleware/auth.middleware");

// All vote routes require login
router.post("/:issueId", protect, voteIssue);
router.get("/:issueId", protect, getUserVote);

module.exports = router;