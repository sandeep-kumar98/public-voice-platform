// ✅ Purpose: Defines structure of every issue/post

const mongoose = require("mongoose");

const issueSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
      minlength: [10, "Title must be at least 10 characters"],
      maxlength: [150, "Title cannot exceed 150 characters"],
    },

    description: {
      type: String,
      required: [true, "Description is required"],
      minlength: [20, "Description must be at least 20 characters"],
      maxlength: [2000, "Description cannot exceed 2000 characters"],
    },

    image: {
      type: String,
      default: null,                     // optional image
    },

    category: {
      type: String,
      required: [true, "Category is required"],
      enum: [
        "Road",
        "Water",
        "Electricity",
        "Sanitation",
        "Crime",
        "Education",
        "Health",
        "Environment",
        "Other",
      ],
    },

    location: {
      city: {
        type: String,
        required: [true, "City is required"],
        trim: true,
      },
      state: {
        type: String,
        required: [true, "State is required"],
        trim: true,
      },
      country: {
        type: String,
        default: "India",
      },
    },

    // Who posted this issue
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",                       // links to User model
      required: true,
    },

    status: {
      type: String,
      enum: ["open", "resolved", "flagged"],
      default: "open",
    },

    tags: [String],                      // e.g. ["pothole", "road", "danger"]

    // Cached counts for fast querying (we update these on each vote/support)
    voteCount: {
      type: Number,
      default: 0,
    },

    supportCount: {
      type: Number,
      default: 0,
    },

    commentCount: {
      type: Number,
      default: 0,
    },

    // Calculated ranking score (votes + recency + location)
    priorityScore: {
      type: Number,
      default: 0,
    },

    // Set by AI service
    sentiment: {
      type: String,
      enum: ["urgent", "neutral", "positive"],
      default: "neutral",
    },

    // Flagged by AI or admin
    isFlagged: {
      type: Boolean,
      default: false,
    },

    isResolved: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// ─────────────────────────────────────────
// 🔍 INDEX for fast search and filtering
// ─────────────────────────────────────────
// These make database queries much faster

issueSchema.index({ "location.city": 1 });       // filter by city
issueSchema.index({ "location.state": 1 });      // filter by state
issueSchema.index({ category: 1 });              // filter by category
issueSchema.index({ priorityScore: -1 });        // sort by trending
issueSchema.index({ createdAt: -1 });            // sort by newest
issueSchema.index({ voteCount: -1 });            // sort by most voted

module.exports = mongoose.model("Issue", issueSchema);