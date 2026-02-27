const express = require("express");
const router = express.Router();

const {
  getUserProfile,
  updateProfile,
  changePassword,
} = require("../controllers/user.controller");

const { protect } = require("../middleware/auth.middleware");
const upload = require("../middleware/upload.middleware");

router.get("/:id", getUserProfile);
router.put("/profile", protect, upload.single("avatar"), updateProfile);
router.put("/change-password", protect, changePassword);

module.exports = router;