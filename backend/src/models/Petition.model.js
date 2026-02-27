// ✅ Purpose: Tracks who supported/signed which issue petition

const mongoose = require("mongoose");

const petitionSchema = new mongoose.Schema(
  {
    // Who supported
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // Which issue they supported
    issue: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Issue",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// ─────────────────────────────────────────
// 🚫 PREVENT DUPLICATE SUPPORT
// ─────────────────────────────────────────
// One user can only support an issue once

petitionSchema.index({ user: 1, issue: 1 }, { unique: true });

module.exports = mongoose.model("Petition", petitionSchema);