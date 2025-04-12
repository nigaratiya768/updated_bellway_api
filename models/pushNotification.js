const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
  },
  from_agent_id: {
    type: String,
  },
  to_agent_id: {
    type: String,
  },
});

const NotificationModel = mongoose.model("notification", notificationSchema);

module.exports = { NotificationModel };
