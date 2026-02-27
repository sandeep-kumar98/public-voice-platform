// ✅ Purpose: Protect routes — only logged in users can access them
// Works like a security guard at the door
// Every protected request must carry a valid JWT token

const jwt = require("jsonwebtoken");
const User = require("../models/User.model");
const { JWT_SECRET } = require("../config/env");
const { sendError } = require("../utils/apiResponse");

const protect = async (req, res, next) => {
  try {
    let token;

    // Token comes in the header like:
    // Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1]; // get token after "Bearer "
    }

    // No token = not logged in
    if (!token) {
      return sendError(res, 401, "Not authorized. Please login first.");
    }

    // Verify the token is valid and not expired
    const decoded = jwt.verify(token, JWT_SECRET);
    // decoded = { id: "userId123", iat: ..., exp: ... }

    // Find the user from database using the id inside token
    const user = await User.findById(decoded.id).select("-password");

    if (!user) {
      return sendError(res, 401, "User no longer exists.");
    }

    // Check if user is banned
    if (user.isBanned) {
      return sendError(res, 403, "Your account has been banned.");
    }

    // Attach user to request object
    // Now any controller can access req.user
    req.user = user;

    next(); // move to the next function (the actual controller)
  } catch (error) {
    if (error.name === "JsonWebTokenError") {
      return sendError(res, 401, "Invalid token. Please login again.");
    }
    if (error.name === "TokenExpiredError") {
      return sendError(res, 401, "Token expired. Please login again.");
    }
    return sendError(res, 500, "Authentication error.");
  }
};

// ─────────────────────────────────────────
// 👑 ADMIN ONLY MIDDLEWARE
// ─────────────────────────────────────────
// Use AFTER protect middleware
// Example: router.delete("/user/:id", protect, adminOnly, deleteUser)

const adminOnly = (req, res, next) => {
  if (req.user && req.user.role === "admin") {
    next();
  } else {
    return sendError(res, 403, "Access denied. Admins only.");
  }
};

module.exports = { protect, adminOnly };