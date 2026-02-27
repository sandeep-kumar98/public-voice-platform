// ✅ Purpose: Defines structure of comments and replies

const mongoose = require("mongoose");

const commentSchema = new mongoose.Schema(
  {
    content: {
      type: String,
      required: [true, "Comment cannot be empty"],
      trim: true,
      minlength: [1, "Comment too short"],
      maxlength: [500, "Comment cannot exceed 500 characters"],
    },

    // Who wrote this comment
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // Which issue this comment belongs to
    issue: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Issue",
      required: true,
    },

    // If this is a REPLY, this points to the parent comment
    // If this is a TOP-LEVEL comment, this is null
    parentComment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Comment",
      default: null,
    },

    // Soft delete — we don't actually delete from DB
    // We just hide the content and show "Comment deleted"
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Index for fast fetching of comments per issue
commentSchema.index({ issue: 1, createdAt: -1 });

module.exports = mongoose.model("Comment", commentSchema);