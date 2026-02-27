// ✅ Purpose: Handle user profile operations

const User = require("../models/User.model");
const Issue = require("../models/Issue.model");
const { sendSuccess, sendError } = require("../utils/apiResponse");

// ─────────────────────────────────────────
// 👤 GET USER PROFILE BY ID
// GET /api/users/:id
// Public route
// ─────────────────────────────────────────

const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select(
      "-password -isBanned"
    );

    if (!user) {
      return sendError(res, 404, "User not found.");
    }

    // Get user's issues
    const issues = await Issue.find({
      author: req.params.id,
      isFlagged: false,
    })
      .sort({ createdAt: -1 })
      .limit(10);

    return sendSuccess(res, 200, "User profile fetched!", {
      user,
      issues,
    });
  } catch (error) {
    console.error("Get profile error:", error);
    return sendError(res, 500, error.message);
  }
};

// ─────────────────────────────────────────
// ✏️ UPDATE MY PROFILE
// PUT /api/users/profile
// Protected route
// ─────────────────────────────────────────

const updateProfile = async (req, res) => {
  try {
    const { name, bio, city, state, country } = req.body;

    // Build update object with only provided fields
    const updateData = {};
    if (name) updateData.name = name;
    if (bio) updateData.bio = bio;
    if (city) updateData["location.city"] = city;
    if (state) updateData["location.state"] = state;
    if (country) updateData["location.country"] = country;

    // If new avatar image uploaded
    if (req.file) {
      updateData.avatar = req.file.path;
    }

    const user = await User.findByIdAndUpdate(
      req.user._id,
      updateData,
      { new: true } // return updated document
    );

    return sendSuccess(res, 200, "Profile updated successfully!", { user });
  } catch (error) {
    console.error("Update profile error:", error);
    return sendError(res, 500, error.message);
  }
};

// ─────────────────────────────────────────
// 🔒 CHANGE PASSWORD
// PUT /api/users/change-password
// Protected route
// ─────────────────────────────────────────

const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return sendError(res, 400, "Current and new password are required.");
    }

    if (newPassword.length < 6) {
      return sendError(res, 400, "New password must be at least 6 characters.");
    }

    // Get user with password
    const user = await User.findById(req.user._id).select("+password");

    // Verify current password
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return sendError(res, 401, "Current password is incorrect.");
    }

    // Update password (pre save hook will hash it)
    user.password = newPassword;
    await user.save();

    return sendSuccess(res, 200, "Password changed successfully!");
  } catch (error) {
    console.error("Change password error:", error);
    return sendError(res, 500, error.message);
  }
};

module.exports = { getUserProfile, updateProfile, changePassword };