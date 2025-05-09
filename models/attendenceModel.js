const mongoose = require("mongoose");

const attendenceSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Types.ObjectId,
    required: true,
    ref: "crm_agent",
  },
  attendence_date: {
    type: String,
    required: true,
  },
  is_approved: {
    type: Boolean,
    default: false,
  },
  approved_by: {
    type: mongoose.Types.ObjectId,
  },
  current_status: {
    type: String,
  },
  entry_time: {
    type: Date,
    required: true,
  },
  exit_time: {
    type: Date,
    default: null,
  },
});
attendenceSchema.index({ user_id: 1, attendence_date: 1 }, { unique: true });
const Attendence = mongoose.model("attendence", attendenceSchema);

module.exports = { Attendence };
