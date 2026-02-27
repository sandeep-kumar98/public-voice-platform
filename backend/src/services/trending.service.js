// ✅ Purpose: Calculate priority score for each issue
// This determines how issues are ranked in the trending feed

/**
 * Calculate priority score for an issue
 * Formula: (votes x 3) + (supports x 2) + recencyBoost
 *
 * @param {number} voteCount - total votes on issue
 * @param {number} supportCount - total petition supporters
 * @param {Date} createdAt - when issue was created
 * @returns {number} priority score
 */

const calculatePriorityScore = (voteCount, supportCount, createdAt) => {
  // How many hours old is this issue?
  const hoursOld =
    (Date.now() - new Date(createdAt).getTime()) / (1000 * 60 * 60);

  // Newer issues get a boost (decays over time)
  // A brand new issue gets +100, a 10hr old issue gets +9, etc.
  const recencyBoost = 100 / (hoursOld + 1);

  // Final score formula
  const score = voteCount * 3 + supportCount * 2 + recencyBoost;

  return Math.round(score * 100) / 100; // round to 2 decimal places
};

module.exports = { calculatePriorityScore };