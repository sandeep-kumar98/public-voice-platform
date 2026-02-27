// ✅ Purpose: Connect Node.js backend to Python AI service

const axios = require("axios");
const { AI_SERVICE_URL } = require("../config/env");

/**
 * Analyze issue content using Python AI service
 * @param {string} title
 * @param {string} description
 * @returns {object} analysis result
 */

const analyzeIssue = async (title, description) => {
  try {
    const response = await axios.post(`${AI_SERVICE_URL}/ai/analyze`, {
      title,
      description,
    }, {
      timeout: 10000, // 10 second timeout
    });

    return response.data;
  } catch (error) {
    // If AI service is down, don't crash the main app
    console.error("AI Service error:", error.message);
    return {
      sentiment: "neutral",
      is_urgent: false,
      is_fake: false,
      fake_score: 0,
    };
  }
};

module.exports = { analyzeIssue };