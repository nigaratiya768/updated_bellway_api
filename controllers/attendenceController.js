const agentModel = require("../models/agentModel");
const { Attendence } = require("../models/attendenceModel");
const send = require("../notification_service/notificationService");
const moment = require("moment");
const addAttendence = async (req, res) => {
  try {
    const { user_id, attendence_date, entry_time, exit_time } = req.body;
    if (!user_id) {
      return res.status(400).json({ msg: "user id is missing" });
    }
    const attendence = new Attendence({
      user_id,
      attendence_date,
      entry_time,
      exit_time,
    });
    const user = await agentModel.findOne({ _id: user_id });
    console.log("user", user);
    if (user.role == "GroupLeader") {
      //send notification to admin
    }
    if (user.role == "TeamLeader") {
      //send notification to groupleader

      attendence.approved_by = user.assigntl;
      send(user.assigntl, {
        title: "attendence notification",
        description: `${user.agent_name} waiting for attendece approval`,
      });
    }
    if (user.role == "user") {
      //send notification to teamleader
      attendence.approved_by = user.assigntl;
      send(user.assigntl, {
        title: "attendence notification",
        description: `${user.agent_name} waiting for attendece approval`,
      });
    }
    await attendence.save();
    return res.status(200).json({ msg: "attendence done" });
  } catch (error) {
    console.log("error in addAttendence", error);
    return res.status(500).json({ msg: "server error" });
  }
};

const updateAttendence = async (req, res) => {
  try {
    const { user_id, exit_time } = req.body;
    const updateAttendence = await Attendence.findByIdAndUpdate(
      { _id },
      { exit_time }
    );
    await updateAttendence.save();
    return res.status(200).json({ msg: "attendence updated" });
  } catch (error) {
    console.log("error in updateAttendence", error);
    return res.status(500).json({ msg: "server" });
  }
};

const getAttendences = async (req, res) => {
  try {
    const { start_date, end_date, user_id } = req.query;
    let attendences = [];

    if (user_id && start_date && end_date) {
      console.log("user_id", user_id);
      const startDate = new Date(start_date);
      const endDate = new Date(end_date);
      console.log("user and date");
      attendences = await Attendence.find({
        user_id,
        attendence_date: {
          $gte: startDate,
          $lte: endDate,
        },
      });
      return res.status(200).json({ attendences });
    }
    // if (user_id) {
    //   console.log("user wise");
    //   attendences = await Attendence.find({ user_id });
    //   return res.status(200).json({ attendences });
    // }
    if (start_date && end_date) {
      const startDate = new Date(start_date);
      const endDate = new Date(end_date);
      console.log("only date wise");
      attendences = await Attendence.find({
        attendence_date: {
          $gte: startDate,
          $lte: endDate,
        },
      });
      return res.status(200).json({ attendences });
    }
  } catch (error) {
    console.log("error in getAttendences", error);
    return res.status(500).json({ msg: "server error" });
  }
};

const getOurAttendences = async (req, res) => {
  try {
    console.log("getour attendence", req.query);
    const { start_date, end_date, user_id } = req.query;
    let attendences = [];

    if (user_id && start_date && end_date) {
      console.log("user_id", user_id);

      const startDate = new Date(start_date);
      startDate.setDate(startDate.getDate() - 1);

      const endDate = new Date(end_date);
      console.log("user and date");
      attendences = await Attendence.find({
        user_id,
        // attendence_date: {
        //   $gte: startDate,
        //   $lte: endDate,
        // },
      }).populate("user_id");
      console.log("attendences123", attendences);
      return res.status(200).json({ attendences });
    }
    // if (user_id) {
    //   console.log("user wise");
    //   attendences = await Attendence.find({ user_id });
    //   return res.status(200).json({ attendences });
    // }
    if (user_id) {
      console.log("xyzuser_id", user_id);
      attendences = await Attendence.find({
        user_id,
      }).populate("user_id");
      console.log("attendence", attendences);
      return res.status(200).json({ attendences });
    }
  } catch (error) {
    console.log("error in getAttendences", error);
    return res.status(500).json({ msg: "server error" });
  }
};

const getAttendencesByUser = async (req, res) => {
  try {
    const { user_id } = req.params;
    let attendences = await Attendence.find({ user_id });
    return res.status(200).json({ attendences });
  } catch (error) {
    console.log("error in getAttendenceByUser", error);
    return res.status(500).json({ msg: "server error" });
  }
};

const getAttendenceByApproval = async (req, res) => {
  try {
    const approvedById = req.query.user_id;
    const {
      employee_id = undefined,
      start_date = new Date(),
      end_date = new Date(),
    } = req.query;
    let attendences = [];
    if (!approvedById) {
      return res.status(400).json({ msg: "please enter user id" });
    }
    console.log("user id approved", approvedById);
    console.log("query date", start_date, "end date", end_date);
    const user = await agentModel.findOne({ _id: approvedById });
    const startDate = moment(new Date(start_date), "YYYY-MM-DD")
      .startOf("day")
      .toDate();
    const endDate = moment(new Date(end_date), "YYYY-MM-DD")
      .endOf("day")
      .toDate();

    console.log("start date", startDate);
    console.log("end date", endDate);
    console.log("employee_id", employee_id);
    if (user.role == "admin") {
      attendences = await Attendence.find({
        ...(employee_id && employee_id != "undefined"
          ? { user_id: employee_id }
          : {}),
        entry_time: {
          $gte: startDate,
          $lte: endDate,
        },
      }).populate("user_id");
    } else {
      attendences = await Attendence.find({
        approved_by: approvedById,
        entry_time: {
          $gte: startDate,
          $lte: endDate,
        },
      }).populate("user_id");
    }

    return res.status(200).json({ attendences });
  } catch (error) {
    console.log("error", error);
    return res.status(500).json({ msg: "server error" });
  }
};

const makeApproved = async (req, res) => {
  try {
    const { _id, is_approved } = req.body;
    const attendence = await Attendence.findOneAndUpdate(
      { _id },
      { is_approved: is_approved }
    );

    const user = await agentModel.findOne({ _id: attendence.user_id });

    const status = is_approved ? "approved" : "rejected";
    send(attendence.user_id, {
      title: "Attendence status",
      description: `${user.agent_name}, your attendence is ` + status,
    });
    return res.status(200).json({ msg: "attendence updated" });
  } catch (error) {
    console.log("error in makeApproved", error);
    return res.status(500).json({ msg: "server error" });
  }
};

const updateCurrentStatus = async (req, res) => {
  try {
    console.log("req.body", req.body);
    const { _id, current_status } = req.body;
    const attendence_date = moment().format("DD-MM-YYYY");
    const attendence = await Attendence.findOneAndUpdate(
      { user_id: _id, attendence_date },
      { current_status: current_status }
    );
    console.log("attendence", attendence);
    const user = await agentModel.findOne({ _id: attendence.user_id });

    send(user.assigntl, {
      title: "user current status",
      description: `${user.agent_name}, is on ` + current_status,
    });
    return res.status(200).json({ msg: "current status updated" });
  } catch (error) {
    console.log("error updateCurrentStatus", error);
    return res.status(500).json({ msg: "server error" });
  }
};

const getAttendencesByTeamLeader = async () => {
  try {
    const { user_id } = req.params;
    let teamLeader = await agentModel.findById({ user_id });
    if (teamLeader.role == "team leader") {
    }
  } catch (error) {
    console.log("error in getAttendenceByTeamLeader", error);
    return res.status(500).json({ msg: "server error" });
  }
};

const updateExitTime = async (req, res) => {
  try {
    const { user_id } = req.body;
    const attendence_date = moment().format("DD-MM-YYYY");
    let updateAttendence = await Attendence.findOneAndUpdate(
      { user_id, attendence_date },
      { exit_time: new Date() }
    );

    return res.status(200).json(updateAttendence);
  } catch (error) {
    console.log("error in logOut", error);
    return res.status(500).json({ msg: "server error" });
  }
};

const getAttendencesByGroupLeader = () => {};
module.exports = {
  addAttendence,
  updateAttendence,
  getAttendences,
  getOurAttendences,
  getAttendencesByUser,
  getAttendenceByApproval,
  makeApproved,
  updateExitTime,
  updateCurrentStatus,
};
