const express = require("express");
const {
  addAttendence,
  getAttendences,
  getAttendencesByUser,
} = require("../controllers/attendenceController");

const router = express.Router();
router.post("/add_attendence", addAttendence);
router.get("/get_attendences", getAttendences);
router.get("/get_attendences_by_user_id/:user_id", getAttendencesByUser);
module.exports = router;
