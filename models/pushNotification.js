const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
  },
  date: {
    type: Date,
    default: Date.now(),
  },
  from_agent_id: {
    type: String,
  },
  to_agent_id: {
    type: String,
  },
  notification_type: {
    type: String,
    default: "normal",
  },
});

const NotificationModel = mongoose.model("notification", notificationSchema);

module.exports = { NotificationModel };
