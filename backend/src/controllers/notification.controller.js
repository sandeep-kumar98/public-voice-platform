// ✅ Purpose: Handle user notifications

const Notification = require("../models/Notification.model");
const { sendSuccess, sendError } = require("../utils/apiResponse");

// ─────────────────────────────────────────
// 🔔 GET MY NOTIFICATIONS
// GET /api/notifications
// ─────────────────────────────────────────

const getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({
      recipient: req.user._id,
    })
      .populate("sender", "name avatar")
      .populate("issue", "title")
      .sort({ createdAt: -1 })
      .limit(20); // last 20 notifications

    // Count unread notifications
    const unreadCount = await Notification.countDocuments({
      recipient: req.user._id,
      isRead: false,
    });

    return sendSuccess(res, 200, "Notifications fetched!", {
      notifications,
      unreadCount,
    });
  } catch (error) {
    console.error("Get notifications error:", error);
    return sendError(res, 500, error.message);
  }
};

// ─────────────────────────────────────────
// ✅ MARK ALL AS READ
// PUT /api/notifications/read
// ─────────────────────────────────────────

const markAllRead = async (req, res) => {
  try {
    await Notification.updateMany(
      { recipient: req.user._id, isRead: false },
      { isRead: true }
    );

    return sendSuccess(res, 200, "All notifications marked as read!");
  } catch (error) {
    console.error("Mark read error:", error);
    return sendError(res, 500, error.message);
  }
};

// ─────────────────────────────────────────
// ✅ MARK SINGLE NOTIFICATION AS READ
// PUT /api/notifications/:id/read
// ─────────────────────────────────────────

const markOneRead = async (req, res) => {
  try {
    await Notification.findByIdAndUpdate(req.params.id, { isRead: true });
    return sendSuccess(res, 200, "Notification marked as read!");
  } catch (error) {
    return sendError(res, 500, error.message);
  }
};

// ─────────────────────────────────────────
// 🗑️ DELETE ALL NOTIFICATIONS
// DELETE /api/notifications
// ─────────────────────────────────────────

const deleteAllNotifications = async (req, res) => {
  try {
    await Notification.deleteMany({ recipient: req.user._id });
    return sendSuccess(res, 200, "All notifications deleted!");
  } catch (error) {
    return sendError(res, 500, error.message);
  }
};

module.exports = {
  getNotifications,
  markAllRead,
  markOneRead,
  deleteAllNotifications,
};