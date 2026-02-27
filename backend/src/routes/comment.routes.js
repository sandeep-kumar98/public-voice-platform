// ✅ Purpose: Comment endpoints

const express = require("express");
const router = express.Router();

const {
  addComment,
  getComments,
  deleteComment,
} = require("../controllers/comment.controller");

const { protect } = require("../middleware/auth.middleware");

router.post("/:issueId", protect, addComment);
router.get("/:issueId", getComments);
router.delete("/:commentId", protect, deleteComment);

module.exports = router;