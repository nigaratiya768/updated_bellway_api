const express = require("express");

const {
  addNotification,
  updateNotification,
  getNotifications,
  getNotification,
  getNotificationCount,
} = require("../controllers/pushNotificationController");

const router = express.Router();
router.post("/create_notification", addNotification);
router.put("/update_notification", updateNotification);
router.get("/get_all_notification", getNotifications);
router.get("/get_notification_count", getNotificationCount);
router.get("/get_notification", getNotification);

module.exports = router;
