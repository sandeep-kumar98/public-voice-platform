// ✅ Purpose: Handle all issue CRUD operations

const Issue = require("../models/Issue.model");
const User = require("../models/User.model");
const { sendSuccess, sendError } = require("../utils/apiResponse");
const { calculatePriorityScore } = require("../services/trending.service");
// Add at the top of issue.controller.js
const { analyzeIssue } = require("../services/ai.service");

// ─────────────────────────────────────────
// 📝 CREATE ISSUE
// POST /api/issues
// Protected route
// ─────────────────────────────────────────

const createIssue = async (req, res) => {
  try {
    const { title, description, category, city, state, country, tags } =
      req.body;

    // 1. Validate required fields
    if (!title || !description || !category || !city || !state) {
      return sendError(
        res,
        400,
        "Title, description, category, city and state are required."
      );
    }

    // 2. Get image URL if uploaded (from Cloudinary via multer)
    const image = req.file ? req.file.path : null;

    // 3. Parse tags if sent as string "road,pothole,danger"
    let parsedTags = [];
    if (tags) {
      parsedTags =
        typeof tags === "string"
          ? tags.split(",").map((t) => t.trim())
          : tags;
    }

    // 4. Create the issue
    const issue = await Issue.create({
      title,
      description,
      category,
      image,
      location: {
        city,
        state,
        country: country || "India",
      },
      tags: parsedTags,
      author: req.user._id, // from protect middleware
    });

    // 5. Calculate initial priority score
    // 5. Calculate initial priority score
    issue.priorityScore = calculatePriorityScore(0, 0, issue.createdAt);

// 6. Run AI analysis (non-blocking)
    try {
      const aiResult = await analyzeIssue(title, description);
      issue.sentiment = aiResult.sentiment || "neutral";
      issue.isFlagged = aiResult.is_fake || false;
    } catch (err) {
      console.log("AI analysis skipped");
    }

    await issue.save();
    // 6. Increment user's issue count
    await User.findByIdAndUpdate(req.user._id, { $inc: { issueCount: 1 } });

    // 7. Populate author details before sending response
    await issue.populate("author", "name avatar location");

    return sendSuccess(res, 201, "Issue created successfully!", { issue });
  } catch (error) {
    console.error("Create issue error:", error);
    return sendError(res, 500, error.message);
  }
};

// ─────────────────────────────────────────
// 📋 GET ALL ISSUES
// GET /api/issues
// Public route
// Supports filters: ?city=&state=&category=&sort=&page=&limit=
// ─────────────────────────────────────────

const getAllIssues = async (req, res) => {
  try {
    const {
      city,
      state,
      category,
      sort = "trending", // default sort
      page = 1,
      limit = 10,
      search,
    } = req.query;

    // Build filter object dynamically
    const filter = {};

    // Only show non-flagged issues to public
    filter.isFlagged = false;

    if (city) filter["location.city"] = new RegExp(city, "i"); // case insensitive
    if (state) filter["location.state"] = new RegExp(state, "i");
    if (category) filter.category = category;

    // Search in title or description
    if (search) {
      filter.$or = [
        { title: new RegExp(search, "i") },
        { description: new RegExp(search, "i") },
      ];
    }

    // Sort options
    let sortOption = {};
    if (sort === "trending") sortOption = { priorityScore: -1 };
    else if (sort === "newest") sortOption = { createdAt: -1 };
    else if (sort === "mostVoted") sortOption = { voteCount: -1 };
    else if (sort === "mostSupported") sortOption = { supportCount: -1 };

    // Pagination
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    // Execute query
    const issues = await Issue.find(filter)
      .populate("author", "name avatar location")
      .sort(sortOption)
      .skip(skip)
      .limit(limitNum);

    // Total count for pagination
    const total = await Issue.countDocuments(filter);

    return sendSuccess(res, 200, "Issues fetched successfully!", {
      issues,
      pagination: {
        total,
        page: pageNum,
        pages: Math.ceil(total / limitNum),
        limit: limitNum,
      },
    });
  } catch (error) {
    console.error("Get issues error:", error);
    return sendError(res, 500, error.message);
  }
};

// ─────────────────────────────────────────
// 🔍 GET SINGLE ISSUE
// GET /api/issues/:id
// Public route
// ─────────────────────────────────────────

const getIssueById = async (req, res) => {
  try {
    const issue = await Issue.findById(req.params.id).populate(
      "author",
      "name avatar location bio"
    );

    if (!issue) {
      return sendError(res, 404, "Issue not found.");
    }

    return sendSuccess(res, 200, "Issue fetched successfully!", { issue });
  } catch (error) {
    console.error("Get issue error:", error);
    return sendError(res, 500, error.message);
  }
};

// ─────────────────────────────────────────
// ✏️ UPDATE ISSUE
// PUT /api/issues/:id
// Protected — only author can update
// ─────────────────────────────────────────

const updateIssue = async (req, res) => {
  try {
    const issue = await Issue.findById(req.params.id);

    if (!issue) {
      return sendError(res, 404, "Issue not found.");
    }

    // Check if logged in user is the author
    if (issue.author.toString() !== req.user._id.toString()) {
      return sendError(res, 403, "You can only edit your own issues.");
    }

    const { title, description, category, city, state, tags } = req.body;

    // Update only provided fields
    if (title) issue.title = title;
    if (description) issue.description = description;
    if (category) issue.category = category;
    if (city) issue.location.city = city;
    if (state) issue.location.state = state;
    if (tags) {
      issue.tags =
        typeof tags === "string"
          ? tags.split(",").map((t) => t.trim())
          : tags;
    }

    // Update image if new one uploaded
    if (req.file) {
      issue.image = req.file.path;
    }

    await issue.save();

    return sendSuccess(res, 200, "Issue updated successfully!", { issue });
  } catch (error) {
    console.error("Update issue error:", error);
    return sendError(res, 500, error.message);
  }
};

// ─────────────────────────────────────────
// 🗑️ DELETE ISSUE
// DELETE /api/issues/:id
// Protected — author or admin can delete
// ─────────────────────────────────────────

const deleteIssue = async (req, res) => {
  try {
    const issue = await Issue.findById(req.params.id);

    if (!issue) {
      return sendError(res, 404, "Issue not found.");
    }

    // Allow delete if user is author OR admin
    const isAuthor = issue.author.toString() === req.user._id.toString();
    const isAdmin = req.user.role === "admin";

    if (!isAuthor && !isAdmin) {
      return sendError(res, 403, "You can only delete your own issues.");
    }

    await Issue.findByIdAndDelete(req.params.id);

    // Decrement user's issue count
    await User.findByIdAndUpdate(issue.author, {
      $inc: { issueCount: -1 },
    });

    return sendSuccess(res, 200, "Issue deleted successfully!");
  } catch (error) {
    console.error("Delete issue error:", error);
    return sendError(res, 500, error.message);
  }
};

// ─────────────────────────────────────────
// 🔥 GET TRENDING ISSUES
// GET /api/issues/trending
// Public route
// ─────────────────────────────────────────

const getTrendingIssues = async (req, res) => {
  try {
    const issues = await Issue.find({ isFlagged: false })
      .populate("author", "name avatar")
      .sort({ priorityScore: -1 })
      .limit(10);

    return sendSuccess(res, 200, "Trending issues fetched!", { issues });
  } catch (error) {
    console.error("Trending error:", error);
    return sendError(res, 500, error.message);
  }
};

module.exports = {
  createIssue,
  getAllIssues,
  getIssueById,
  updateIssue,
  deleteIssue,
  getTrendingIssues,
};