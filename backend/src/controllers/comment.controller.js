// ✅ Purpose: Handle comments and replies on issues

const Comment = require("../models/Comment.model");
const Issue = require("../models/Issue.model");
const Notification = require("../models/Notification.model");
const { sendSuccess, sendError } = require("../utils/apiResponse");

// ─────────────────────────────────────────
// 💬 ADD COMMENT
// POST /api/comments/:issueId
// Body: { content, parentComment (optional) }
// ─────────────────────────────────────────

const addComment = async (req, res) => {
  try {
    const { issueId } = req.params;
    const { content, parentComment } = req.body;
    const userId = req.user._id;

    // 1. Validate content
    if (!content || content.trim() === "") {
      return sendError(res, 400, "Comment content is required.");
    }

    // 2. Check if issue exists
    const issue = await Issue.findById(issueId);
    if (!issue) {
      return sendError(res, 404, "Issue not found.");
    }

    // 3. If parentComment provided, verify it exists
    if (parentComment) {
      const parent = await Comment.findById(parentComment);
      if (!parent) {
        return sendError(res, 404, "Parent comment not found.");
      }
    }

    // 4. Create comment
    const comment = await Comment.create({
      content: content.trim(),
      author: userId,
      issue: issueId,
      parentComment: parentComment || null,
    });

    // 5. Increment comment count on issue
    await Issue.findByIdAndUpdate(issueId, {
      $inc: { commentCount: 1 },
    });

    // 6. Send notification to issue author
    if (issue.author.toString() !== userId.toString()) {
      await Notification.create({
        recipient: issue.author,
        sender: userId,
        type: parentComment ? "reply" : "comment",
        issue: issueId,
        message: parentComment
          ? `${req.user.name} replied to a comment on "${issue.title}"`
          : `${req.user.name} commented on your issue "${issue.title}"`,
      });
    }

    // 7. Populate author before sending
    await comment.populate("author", "name avatar");

    return sendSuccess(res, 201, "Comment added!", { comment });
  } catch (error) {
    console.error("Comment error:", error);
    return sendError(res, 500, error.message);
  }
};

// ─────────────────────────────────────────
// 📋 GET COMMENTS FOR AN ISSUE
// GET /api/comments/:issueId
// Returns top-level comments with their replies
// ─────────────────────────────────────────

const getComments = async (req, res) => {
  try {
    const { issueId } = req.params;

    // Get all top-level comments (no parent)
    const comments = await Comment.find({
      issue: issueId,
      parentComment: null,
      isDeleted: false,
    })
      .populate("author", "name avatar")
      .sort({ createdAt: -1 });

    // Get replies for each comment
    const commentsWithReplies = await Promise.all(
      comments.map(async (comment) => {
        const replies = await Comment.find({
          parentComment: comment._id,
          isDeleted: false,
        }).populate("author", "name avatar").sort({ createdAt: 1 });

        return {
          ...comment.toObject(),
          replies,
        };
      })
    );

    return sendSuccess(res, 200, "Comments fetched!", {
      comments: commentsWithReplies,
    });
  } catch (error) {
    console.error("Get comments error:", error);
    return sendError(res, 500, error.message);
  }
};

// ─────────────────────────────────────────
// 🗑️ DELETE COMMENT
// DELETE /api/comments/:commentId
// Only author can delete their comment
// ─────────────────────────────────────────

const deleteComment = async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.commentId);

    if (!comment) {
      return sendError(res, 404, "Comment not found.");
    }

    // Only author or admin can delete
    const isAuthor = comment.author.toString() === req.user._id.toString();
    const isAdmin = req.user.role === "admin";

    if (!isAuthor && !isAdmin) {
      return sendError(res, 403, "You can only delete your own comments.");
    }

    // Soft delete — keep in DB but hide content
    comment.isDeleted = true;
    comment.content = "This comment has been deleted.";
    await comment.save();

    // Decrement comment count on issue
    await Issue.findByIdAndUpdate(comment.issue, {
      $inc: { commentCount: -1 },
    });

    return sendSuccess(res, 200, "Comment deleted!");
  } catch (error) {
    console.error("Delete comment error:", error);
    return sendError(res, 500, error.message);
  }
};

module.exports = { addComment, getComments, deleteComment };