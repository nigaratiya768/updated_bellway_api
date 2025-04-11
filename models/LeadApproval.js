const mongoose = require('mongoose');

const LeadApprovalSchema = new mongoose.Schema({
  lead_id: {
    type: String, 
    // required: true
  },
  assign_to_agent: {
    type: String, 
    // required: true
  },
  role: {
    type: String,
    // required: true
  },
  user_id: {
    type: String, 
    // required: true
  },
  status: {
    type: String,
    // required: true,
    default: 'Not Approved'
  },
  created_at: {
    type: Date,
    default: Date.now
  }
});

const LeadApproval = mongoose.model('LeadApproval', LeadApprovalSchema);

module.exports = LeadApproval;
