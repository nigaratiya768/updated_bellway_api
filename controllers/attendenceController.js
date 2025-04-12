const agentModel = require("../models/agentModel");
const { Attendence } = require("../models/attendenceModel");

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

const makeApproved = async (req, res) => {
  try {
  } catch (error) {}
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

const getAttendencesByGroupLeader = () => {};
module.exports = {
  addAttendence,
  updateAttendence,
  getAttendences,
  getAttendencesByUser,
};
