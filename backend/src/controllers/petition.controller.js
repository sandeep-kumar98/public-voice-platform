// ✅ Purpose: Handle issue petition (support/unsupport)

const Petition = require("../models/Petition.model");
const Issue = require("../models/Issue.model");
const Notification = require("../models/Notification.model");
const { sendSuccess, sendError } = require("../utils/apiResponse");
const { calculatePriorityScore } = require("../services/trending.service");

// ─────────────────────────────────────────
// ✊ SUPPORT AN ISSUE (sign petition)
// POST /api/petitions/:issueId
// ─────────────────────────────────────────

const supportIssue = async (req, res) => {
  try {
    const { issueId } = req.params;
    const userId = req.user._id;

    // 1. Check if issue exists
    const issue = await Issue.findById(issueId);
    if (!issue) {
      return sendError(res, 404, "Issue not found.");
    }

    // 2. Check if already supported
    const existing = await Petition.findOne({ user: userId, issue: issueId });
    if (existing) {
      return sendError(res, 400, "You have already supported this issue.");
    }

    // 3. Create support record
    await Petition.create({ user: userId, issue: issueId });

    // 4. Update support count and priority score
    issue.supportCount += 1;
    issue.priorityScore = calculatePriorityScore(
      issue.voteCount,
      issue.supportCount,
      issue.createdAt
    );
    await issue.save();

    // 5. Notify issue author
    if (issue.author.toString() !== userId.toString()) {
      await Notification.create({
        recipient: issue.author,
        sender: userId,
        type: "support",
        issue: issueId,
        message: `${req.user.name} supported your issue "${issue.title}"`,
      });
    }

    return sendSuccess(res, 201, "You have supported this issue!", {
      supportCount: issue.supportCount,
    });
  } catch (error) {
    console.error("Support error:", error);
    return sendError(res, 500, error.message);
  }
};

// ─────────────────────────────────────────
// 💔 UNSUPPORT AN ISSUE
// DELETE /api/petitions/:issueId
// ─────────────────────────────────────────

const unsupportIssue = async (req, res) => {
  try {
    const { issueId } = req.params;
    const userId = req.user._id;

    // 1. Find the support record
    const petition = await Petition.findOne({ user: userId, issue: issueId });
    if (!petition) {
      return sendError(res, 404, "You have not supported this issue.");
    }

    // 2. Delete support record
    await Petition.findByIdAndDelete(petition._id);

    // 3. Update support count
    const issue = await Issue.findById(issueId);
    issue.supportCount = Math.max(0, issue.supportCount - 1); // never go below 0
    issue.priorityScore = calculatePriorityScore(
      issue.voteCount,
      issue.supportCount,
      issue.createdAt
    );
    await issue.save();

    return sendSuccess(res, 200, "Support removed!", {
      supportCount: issue.supportCount,
    });
  } catch (error) {
    console.error("Unsupport error:", error);
    return sendError(res, 500, error.message);
  }
};

// ─────────────────────────────────────────
// 🔍 CHECK IF USER SUPPORTED AN ISSUE
// GET /api/petitions/:issueId
// ─────────────────────────────────────────

const checkSupport = async (req, res) => {
  try {
    const petition = await Petition.findOne({
      user: req.user._id,
      issue: req.params.issueId,
    });

    return sendSuccess(res, 200, "Support status fetched!", {
      supported: !!petition, // true or false
    });
  } catch (error) {
    return sendError(res, 500, error.message);
  }
};

module.exports = { supportIssue, unsupportIssue, checkSupport };