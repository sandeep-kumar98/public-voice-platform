const express = require("express");
const router = express.Router();

const {
  getNotifications,
  markAllRead,
  markOneRead,
  deleteAllNotifications,
} = require("../controllers/notification.controller");

const { protect } = require("../middleware/auth.middleware");

router.get("/", protect, getNotifications);
router.put("/read", protect, markAllRead);
router.put("/:id/read", protect, markOneRead);
router.delete("/", protect, deleteAllNotifications);

module.exports = router;