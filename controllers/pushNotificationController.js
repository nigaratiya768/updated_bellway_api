const notificationModel = require("../models/notificationModel");
const { NotificationModel } = require("../models/pushNotification");
const send = require("../notification_service/notificationService");

const addNotification = async (req, res) => {
  try {
    const { title, description, from_agent_id, to_agent_id } = req.body;
    console.log("req.body", req.body);
    if (!title || !description || !from_agent_id || !to_agent_id) {
      return res.status(400).json({ msg: "enter required field" });
    }
    const notification = new NotificationModel({
      title,
      description,
      from_agent_id,
      to_agent_id,
    });
    await notification.save();
    send(from_agent_id, notification);
    return res.status(200).json({ msg: "notification saved" });
  } catch (error) {
    console.log("error in addNotification", error);
    return resizeBy.status(500).json({ msg: "server error" });
  }
};
const getNotifications = async (req, res) => {
  try {
    const user_id = req.query.user_id;
    const role = req.query.role;

    const notifications =
      role == "admin"
        ? await NotificationModel.find()
        : await NotificationModel.find({
            to_agent_id: user_id,
          });
    return res.status(200).json(notifications);
  } catch (error) {
    console.log("error in getNotification", error);
    return res.status(500).json({ msg: "server error" });
  }
};

const getNotificationCount = async (req, res) => {
  try {
    const user_id = req.query.user_id;
    const role = req.query.role;
    let count =
      role == "admin"
        ? await NotificationModel.countDocuments()
        : await NotificationModel.countDocuments({ to_agent_id: user_id });
    console.log("count", count);
    return res.status(200).json({ count });
  } catch (error) {
    console.log("error in counting notification", error);
    return res.status(500).json({ msg: "server error" });
  }
};

const getNotification = async (req, res) => {
  try {
    const id = req.params.id;
    if (!id) {
      return res.status(400).json({ msg: "id not found" });
    }
    const notification = await NotificationModel.findById({ id });
    return res.status(200).json(notification);
  } catch (error) {
    console.log("error in getNotification", error);
    return res.status(500).json({ msg: "server error" });
  }
};

const updateNotification = async (req, res) => {
  try {
    const id = req.params.id;
    if (!id) {
      return res.status(400).json({ msg: "id not found" });
    }
    let { title, description, from_agent_id, to_agent_id } = req.body;

    const notification = await NotificationModel.findOneAndUpdate(
      { id },
      { title, description, from_agent_id, to_agent_id }
    );
    return res
      .status(200)
      .json({ msg: "notification updated successfullysss" });
  } catch (error) {
    console.log("error in updateNotification", error);
    return res.status(500).json({ msg: "server error" });
  }
};

module.exports = {
  addNotification,
  getNotifications,
  getNotification,
  updateNotification,
  getNotificationCount,
};
