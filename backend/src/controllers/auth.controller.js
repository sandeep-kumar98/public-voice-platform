// ✅ Purpose: Handle signup, login, logout, and get current user
// Controller = the actual business logic for each route

const User = require("../models/User.model");
const generateToken = require("../utils/generateToken");
const { sendSuccess, sendError } = require("../utils/apiResponse");

// ─────────────────────────────────────────
// 📝 SIGNUP
// POST /api/auth/signup
// ─────────────────────────────────────────

const signup = async (req, res) => {
  try {
    const { name, email, password, city, state, country } = req.body;

    // 1. Check all required fields
    if (!name || !email || !password) {
      return sendError(res, 400, "Name, email and password are required.");
    }

    // 2. Check if email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return sendError(res, 400, "Email already registered. Please login.");
    }

    // 3. Create new user
    // Password hashing happens automatically in User.model.js (pre save hook)
    const user = await User.create({
      name,
      email,
      password,
      location: {
        city: city || "",
        state: state || "",
        country: country || "India",
      },
    });

    // 4. Generate JWT token
    const token = generateToken(user._id);

    // 5. Send response (never send password back)
    return sendSuccess(res, 201, "Account created successfully!", {
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        role: user.role,
        location: user.location,
      },
    });
  } catch (error) {
    console.error("Signup error FULL:", error.message);
    return sendError(res, 500, error.message); // show real error
  }
};

// ─────────────────────────────────────────
// 🔑 LOGIN
// POST /api/auth/login
// ─────────────────────────────────────────

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1. Check fields
    if (!email || !password) {
      return sendError(res, 400, "Email and password are required.");
    }

    // 2. Find user by email
    // We use .select("+password") because password has select:false in schema
    const user = await User.findOne({ email }).select("+password");

    if (!user) {
      // Don't say "email not found" — security best practice
      return sendError(res, 401, "Invalid email or password.");
    }

    // 3. Check if user is banned
    if (user.isBanned) {
      return sendError(res, 403, "Your account has been banned.");
    }

    // 4. Compare entered password with hashed password in DB
    const isPasswordCorrect = await user.comparePassword(password);

    if (!isPasswordCorrect) {
      return sendError(res, 401, "Invalid email or password.");
    }

    // 5. Generate token
    const token = generateToken(user._id);

    // 6. Send response
    return sendSuccess(res, 200, "Login successful!", {
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        role: user.role,
        location: user.location,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    return sendError(res, 500, "Login failed. Please try again.");
  }
};

// ─────────────────────────────────────────
// 🚪 LOGOUT
// POST /api/auth/logout
// ─────────────────────────────────────────
// JWT is stateless — logout is handled on frontend
// by deleting the token from localStorage
// We just send a success response here

const logout = (req, res) => {
  return sendSuccess(res, 200, "Logged out successfully!");
};

// ─────────────────────────────────────────
// 👤 GET CURRENT USER
// GET /api/auth/me
// Protected route — requires token
// ─────────────────────────────────────────

const getMe = async (req, res) => {
  try {
    // req.user is set by protect middleware
    const user = await User.findById(req.user._id);

    if (!user) {
      return sendError(res, 404, "User not found.");
    }

    return sendSuccess(res, 200, "User fetched successfully!", { user });
  } catch (error) {
    console.error("GetMe error:", error);
    return sendError(res, 500, "Could not fetch user.");
  }
};

module.exports = { signup, login, logout, getMe };