// ✅ Purpose: Handle upvote and downvote on issues

const Vote = require("../models/Vote.model");
const Issue = require("../models/Issue.model");
const Notification = require("../models/Notification.model");
const { sendSuccess, sendError } = require("../utils/apiResponse");
const { calculatePriorityScore } = require("../services/trending.service");

// ─────────────────────────────────────────
// 👍 VOTE ON ISSUE (upvote or downvote)
// POST /api/votes/:issueId
// Body: { type: "up" or "down" }
// ─────────────────────────────────────────

const voteIssue = async (req, res) => {
  try {
    const { issueId } = req.params;
    const { type } = req.body; // "up" or "down"
    const userId = req.user._id;

    // 1. Validate vote type
    if (!type || !["up", "down"].includes(type)) {
      return sendError(res, 400, 'Vote type must be "up" or "down".');
    }

    // 2. Check if issue exists
    const issue = await Issue.findById(issueId);
    if (!issue) {
      return sendError(res, 404, "Issue not found.");
    }

    // 3. Check if user already voted on this issue
    const existingVote = await Vote.findOne({ user: userId, issue: issueId });

    if (existingVote) {
      // If same vote type → remove vote (toggle off)
      if (existingVote.type === type) {
        await Vote.findByIdAndDelete(existingVote._id);

        // Update vote count
        issue.voteCount += type === "up" ? -1 : 1;
        issue.priorityScore = calculatePriorityScore(
          issue.voteCount,
          issue.supportCount,
          issue.createdAt
        );
        await issue.save();

        return sendSuccess(res, 200, "Vote removed!", {
          voteCount: issue.voteCount,
        });
      }

      // If different vote type → change vote (up to down or down to up)
      existingVote.type = type;
      await existingVote.save();

      // Update count: remove old vote effect, add new
      issue.voteCount += type === "up" ? 2 : -2;
      issue.priorityScore = calculatePriorityScore(
        issue.voteCount,
        issue.supportCount,
        issue.createdAt
      );
      await issue.save();

      return sendSuccess(res, 200, "Vote changed!", {
        voteCount: issue.voteCount,
      });
    }

    // 4. Create new vote
    await Vote.create({ user: userId, issue: issueId, type });

    // 5. Update issue vote count
    issue.voteCount += type === "up" ? 1 : -1;
    issue.priorityScore = calculatePriorityScore(
      issue.voteCount,
      issue.supportCount,
      issue.createdAt
    );
    await issue.save();

    // 6. Send notification to issue author (only for upvotes)
    if (type === "up" && issue.author.toString() !== userId.toString()) {
      await Notification.create({
        recipient: issue.author,
        sender: userId,
        type: "upvote",
        issue: issueId,
        message: `${req.user.name} upvoted your issue "${issue.title}"`,
      });
    }

    return sendSuccess(res, 201, "Vote recorded!", {
      voteCount: issue.voteCount,
    });
  } catch (error) {
    console.error("Vote error:", error);
    return sendError(res, 500, error.message);
  }
};

// ─────────────────────────────────────────
// 🔍 GET USER'S VOTE ON AN ISSUE
// GET /api/votes/:issueId
// ─────────────────────────────────────────

const getUserVote = async (req, res) => {
  try {
    const vote = await Vote.findOne({
      user: req.user._id,
      issue: req.params.issueId,
    });

    return sendSuccess(res, 200, "Vote fetched!", {
      vote: vote ? vote.type : null, // "up", "down", or null
    });
  } catch (error) {
    return sendError(res, 500, error.message);
  }
};

module.exports = { voteIssue, getUserVote };