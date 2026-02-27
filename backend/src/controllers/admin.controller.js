// ✅ Purpose: Admin only operations

const User = require("../models/User.model");
const Issue = require("../models/Issue.model");
const Comment = require("../models/Comment.model");
const Vote = require("../models/Vote.model");
const Petition = require("../models/Petition.model");
const { sendSuccess, sendError } = require("../utils/apiResponse");

// ─────────────────────────────────────────
// 📊 GET ANALYTICS DASHBOARD
// GET /api/admin/analytics
// ─────────────────────────────────────────

const getAnalytics = async (req, res) => {
  try {
    // Run all counts in parallel for speed
    const [
      totalUsers,
      totalIssues,
      totalComments,
      totalVotes,
      totalPetitions,
      openIssues,
      resolvedIssues,
      flaggedIssues,
      bannedUsers,
    ] = await Promise.all([
      User.countDocuments(),
      Issue.countDocuments(),
      Comment.countDocuments({ isDeleted: false }),
      Vote.countDocuments(),
      Petition.countDocuments(),
      Issue.countDocuments({ status: "open" }),
      Issue.countDocuments({ status: "resolved" }),
      Issue.countDocuments({ isFlagged: true }),
      User.countDocuments({ isBanned: true }),
    ]);

    // Get top 5 trending issues
    const trendingIssues = await Issue.find()
      .populate("author", "name")
      .sort({ priorityScore: -1 })
      .limit(5)
      .select("title voteCount supportCount commentCount location category");

    // Get category breakdown
    const categoryBreakdown = await Issue.aggregate([
      { $group: { _id: "$category", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    // Get new users in last 7 days
    const lastWeek = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const newUsersThisWeek = await User.countDocuments({
      createdAt: { $gte: lastWeek },
    });

    // Get new issues in last 7 days
    const newIssuesThisWeek = await Issue.countDocuments({
      createdAt: { $gte: lastWeek },
    });

    return sendSuccess(res, 200, "Analytics fetched!", {
      overview: {
        totalUsers,
        totalIssues,
        totalComments,
        totalVotes,
        totalPetitions,
        bannedUsers,
      },
      issues: {
        open: openIssues,
        resolved: resolvedIssues,
        flagged: flaggedIssues,
      },
      thisWeek: {
        newUsers: newUsersThisWeek,
        newIssues: newIssuesThisWeek,
      },
      trendingIssues,
      categoryBreakdown,
    });
  } catch (error) {
    console.error("Analytics error:", error);
    return sendError(res, 500, error.message);
  }
};

// ─────────────────────────────────────────
// 👥 GET ALL USERS
// GET /api/admin/users
// ─────────────────────────────────────────

const getAllUsers = async (req, res) => {
  try {
    const { page = 1, limit = 20, search } = req.query;

    const filter = {};
    if (search) {
      filter.$or = [
        { name: new RegExp(search, "i") },
        { email: new RegExp(search, "i") },
      ];
    }

    const users = await User.find(filter)
      .select("-password")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await User.countDocuments(filter);

    return sendSuccess(res, 200, "Users fetched!", {
      users,
      total,
      pages: Math.ceil(total / limit),
    });
  } catch (error) {
    return sendError(res, 500, error.message);
  }
};

// ─────────────────────────────────────────
// 🔨 BAN / UNBAN USER
// PUT /api/admin/users/:id/ban
// ─────────────────────────────────────────

const toggleBanUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return sendError(res, 404, "User not found.");
    }

    // Prevent banning other admins
    if (user.role === "admin") {
      return sendError(res, 403, "Cannot ban an admin user.");
    }

    // Toggle ban status
    user.isBanned = !user.isBanned;
    await user.save();

    const message = user.isBanned
      ? "User banned successfully!"
      : "User unbanned successfully!";

    return sendSuccess(res, 200, message, {
      userId: user._id,
      isBanned: user.isBanned,
    });
  } catch (error) {
    return sendError(res, 500, error.message);
  }
};

// ─────────────────────────────────────────
// 🚩 FLAG / UNFLAG ISSUE
// PUT /api/admin/issues/:id/flag
// ─────────────────────────────────────────

const toggleFlagIssue = async (req, res) => {
  try {
    const issue = await Issue.findById(req.params.id);

    if (!issue) {
      return sendError(res, 404, "Issue not found.");
    }

    issue.isFlagged = !issue.isFlagged;
    if (issue.isFlagged) issue.status = "flagged";
    await issue.save();

    const message = issue.isFlagged
      ? "Issue flagged successfully!"
      : "Issue unflagged successfully!";

    return sendSuccess(res, 200, message, {
      issueId: issue._id,
      isFlagged: issue.isFlagged,
    });
  } catch (error) {
    return sendError(res, 500, error.message);
  }
};

// ─────────────────────────────────────────
// ✅ MARK ISSUE AS RESOLVED
// PUT /api/admin/issues/:id/resolve
// ─────────────────────────────────────────

const resolveIssue = async (req, res) => {
  try {
    const issue = await Issue.findByIdAndUpdate(
      req.params.id,
      { status: "resolved", isResolved: true },
      { new: true }
    );

    if (!issue) {
      return sendError(res, 404, "Issue not found.");
    }

    return sendSuccess(res, 200, "Issue marked as resolved!", { issue });
  } catch (error) {
    return sendError(res, 500, error.message);
  }
};

// ─────────────────────────────────────────
// 🗑️ DELETE ANY ISSUE
// DELETE /api/admin/issues/:id
// ─────────────────────────────────────────

const adminDeleteIssue = async (req, res) => {
  try {
    const issue = await Issue.findByIdAndDelete(req.params.id);

    if (!issue) {
      return sendError(res, 404, "Issue not found.");
    }

    return sendSuccess(res, 200, "Issue deleted by admin!");
  } catch (error) {
    return sendError(res, 500, error.message);
  }
};

module.exports = {
  getAnalytics,
  getAllUsers,
  toggleBanUser,
  toggleFlagIssue,
  resolveIssue,
  adminDeleteIssue,
};