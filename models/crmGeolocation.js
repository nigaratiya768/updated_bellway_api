const mongoose = require("mongoose");

const geoLocation = new mongoose.Schema({
  user_id: {
    type: String,
    required: true,
  },
  picture: {
    type: String,
    required: true,
  },
  lat: {
    type: Number,
    required: true,
  },
  lng: {
    type: Number,
    required: true,
  },
  lead_id: {
    type: String,
    required: true,
  },
  created_date: {
    type: Date,
  },
  updated_date: {
    type: Date,
  },
});

const CrmGeoLocation = mongoose.model("crm-geolocation", geoLocation);

module.exports = CrmGeoLocation;
