// src/utils/apiResponse.js
// ✅ Purpose: Standardize all API responses across the app
// Instead of res.json({ data: ..., success: true }) scattered everywhere,
// we use these helpers so every response looks identical

/**
 * Send a success response
 * @param {object} res - Express response object
 * @param {number} statusCode - HTTP status code (200, 201, etc.)
 * @param {string} message - Human readable message
 * @param {any} data - The actual data to send
 */
const sendSuccess = (res, statusCode = 200, message = "Success", data = null) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
  });
};

/**
 * Send an error response
 * @param {object} res - Express response object
 * @param {number} statusCode - HTTP status code (400, 401, 404, 500)
 * @param {string} message - Error description
 */
const sendError = (res, statusCode = 500, message = "Something went wrong") => {
  return res.status(statusCode).json({
    success: false,
    message,
    data: null,
  });
};

module.exports = { sendSuccess, sendError };