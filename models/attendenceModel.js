const mongoose = require("mongoose");

const attendenceSchema = new mongoose.Schema({
  user_id: { type: String, required: true },
  attendence_date: { type: Date, required: true },
  isApproved: { type: Boolean, default: false },
  entry_time: { type: Date, required: true },
  exit_time: { type: Date, default: null },
});

const Attendence = mongoose.model("attendence", attendenceSchema);

module.exports = { Attendence };
