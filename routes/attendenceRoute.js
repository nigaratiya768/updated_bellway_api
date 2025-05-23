const express = require("express");
const {
  addAttendence,
  getAttendences,
  getAttendencesByUser,
  getAttendenceByApproval,
  makeApproved,
  updateExitTime,
  updateCurrentStatus,
  getOurAttendences,
} = require("../controllers/attendenceController");

const router = express.Router();
router.post("/add_attendence", addAttendence);
router.put("/make_approved", makeApproved);
router.put("/update_current_status", updateCurrentStatus);
router.get("/get_attendences", getAttendences);
router.get("/get_our_attendences", getOurAttendences);
router.get("/getAttendenceByApproval", getAttendenceByApproval);
router.put("/updateExitTime", updateExitTime);
router.get("/get_attendences_by_user_id/:user_id", getAttendencesByUser);
module.exports = router;
