// ✅ Purpose: Tracks who voted on what (prevents duplicate votes)

const mongoose = require("mongoose");

const voteSchema = new mongoose.Schema(
  {
    // Who voted
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // Which issue was voted on
    issue: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Issue",
      required: true,
    },

    // Did they upvote or downvote?
    type: {
      type: String,
      enum: ["up", "down"],
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// ─────────────────────────────────────────
// 🚫 PREVENT DUPLICATE VOTES
// ─────────────────────────────────────────
// A user can only vote ONCE per issue
// This compound index enforces that at database level

voteSchema.index({ user: 1, issue: 1 }, { unique: true });

module.exports = mongoose.model("Vote", voteSchema);