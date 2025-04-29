const mongoose = require("mongoose");

const callLogSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      //required: true,
      trim: true,
    },
    user_id: {
      type: mongoose.Types.ObjectId,
      ref: "crm_agent",
      required: true,
      trim: true,
    },
    lead_id: {
      type: mongoose.Types.ObjectId,
      ref: "crm_lead",
      required: true,
    },
    call_start_time: {
      type: Date,
    },
    call_end_time: {
      type: Date,
    },
    datetime: {
      type: String,
      trim: true,
    },
    calldate: {
      type: String,
      trim: true,
    },
    duration: {
      type: Number,
      trim: true,
    },
    phone_number: {
      type: Number,
      trim: true,
    },
    rawtype: {
      type: Number,
      trim: true,
    },
    type: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("crm_calllog", callLogSchema);
