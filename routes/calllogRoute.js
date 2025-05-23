const express = require("express");

const {
  Add_CallLog,
  getCallLogById,
  getCallLogByIdAndDate,
  deleteAllCallLog,
  GetAllUserCallLogById,
  GetAllUserCallLogByDateWise,
  GetCallLogByIdAndDateRange,
  GetUserCallAccordingToTeamLeader,
  GetAllUserCallLogByIdTeam,
  GetUserCallAccordingToGroupLeader,
  GetAllUserCallLogByAdminId,
  addCallLog,
  updateCallLog,
  callReport,
} = require("../controllers/callLogController");

const router = express.Router();
router.route("/add_call_log").post(Add_CallLog);
router.route("/add_new_call_log").post(addCallLog);
router.route("/update_call_log").put(updateCallLog);
router.route("/call_report").get(callReport);
router.route("/get_call_log_by_id/:id").get(getCallLogById);
router.route("/get_call_log_by_id_date").post(getCallLogByIdAndDate);
router.route("/delete_all_call_log").delete(deleteAllCallLog);
router.route("/GetAllUserCallLogById").get(GetAllUserCallLogById);
router.route("/GetAllUserCallLogByAdminId").get(GetAllUserCallLogByAdminId);

router.route("/GetAllUserCallLogByIdTeam").post(GetAllUserCallLogByIdTeam);

router
  .route("/GetUserCallAccordingToTeamLeader")
  .post(GetUserCallAccordingToTeamLeader);
router
  .route("/GetUserCallAccordingTogroupLeader")
  .post(GetUserCallAccordingToGroupLeader);
router.route("/GetAllUserCallLogByDateWise").post(GetAllUserCallLogByDateWise);
router.route("/GetCallLogByIdAndDateRange").post(GetCallLogByIdAndDateRange);

module.exports = router;
