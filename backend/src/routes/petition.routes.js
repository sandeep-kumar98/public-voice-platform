// ✅ Purpose: Petition endpoints

const express = require("express");
const router = express.Router();

const {
  supportIssue,
  unsupportIssue,
  checkSupport,
} = require("../controllers/petition.controller");

const { protect } = require("../middleware/auth.middleware");

router.post("/:issueId", protect, supportIssue);
router.delete("/:issueId", protect, unsupportIssue);
router.get("/:issueId", protect, checkSupport);

module.exports = router;