const express = require("express");
const router = express.Router();

const {
  getAnalytics,
  getAllUsers,
  toggleBanUser,
  toggleFlagIssue,
  resolveIssue,
  adminDeleteIssue,
} = require("../controllers/admin.controller");

const { protect, adminOnly } = require("../middleware/auth.middleware");

router.use(protect, adminOnly);

router.get("/analytics", getAnalytics);
router.get("/users", getAllUsers);
router.put("/users/:id/ban", toggleBanUser);
router.put("/issues/:id/flag", toggleFlagIssue);
router.put("/issues/:id/resolve", resolveIssue);
router.delete("/issues/:id", adminDeleteIssue);

module.exports = router;