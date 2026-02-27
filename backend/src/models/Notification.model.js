// ✅ Purpose: Stores notifications for users
// e.g. "Someone commented on your issue"

const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
  {
    // Who RECEIVES the notification
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // Who TRIGGERED the notification
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // What type of notification is this?
    type: {
      type: String,
      enum: ["comment", "reply", "upvote", "support"],
      required: true,
    },

    // Which issue is this notification about?
    issue: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Issue",
      required: true,
    },

    // Human readable message
    // e.g. "Rahul commented on your issue"
    message: {
      type: String,
      required: true,
    },

    // Has the user seen this notification?
    isRead: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Fetch notifications for a user quickly
notificationSchema.index({ recipient: 1, isRead: 1, createdAt: -1 });

module.exports = mongoose.model("Notification", notificationSchema);