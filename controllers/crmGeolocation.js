const CrmGeoLocation = require("../models/crmGeolocation");

const createGeolocation = async (req, res) => {
  try {
    console.log("req.file", req.file, req.body);
    const file_path = req.file.filename;

    const { user_id, picture, lat, lng, lead_id } = req.body;
    if (!user_id) {
      return res.status(400).json({ msg: "please enter user id" });
    }

    if (!lat) {
      return res.status(400).json({ msg: "please enter lat" });
    }
    if (!lng) {
      return res.status(400).json({ msg: "please enter lng" });
    }
    if (!lead_id) {
      return res.status(400).json({ msg: "please enter lead id" });
    }
    const geoLocation = new CrmGeoLocation({
      user_id,
      picture: file_path,
      lat,
      lng,
      lead_id,
      created_date: new Date(),
    });
    await geoLocation.save();
    return res.status(200).json({ msg: "geolocation successfully created" });
  } catch (error) {
    console.log("error in create geolocation ", error);
    return res.status(500).json({ msg: "server error" });
  }
};

const getGeolocation = async (req, res) => {
  try {
    const { _id } = req.body;
    if (!user_id) {
      return res.status(400).json({ msg: "please enter user_id" });
    }
    const geolocation = await CrmGeoLocation.findOne({ _id: _id });
    if (!geolocation) {
      return res.status(400).json({ msg: "location not found" });
    }
    return res.status(200).json(geolocation);
  } catch (error) {
    console.log("error in getgeolocation", error);
    return res.status(500).json({ msg: "server error" });
  }
};

const getGeolocations = async (req, res) => {
  try {
    const geolocations = await CrmGeoLocation.find();
    if (!geolocations) {
      return res.status(400).json({ msg: "locations not found" });
    }
    return res.status(200).json(geolocations);
  } catch (error) {
    console.log("error in getGeolocation", error);
    return res.status(500).json({ msg: "server error" });
  }
};

const updateGeolocation = async (req, res) => {
  try {
  } catch (error) {
    console.log("error in updating geolocation");
    return res.status(500).json({ msg: "server error" });
  }
};

module.exports = { createGeolocation, getGeolocation };
