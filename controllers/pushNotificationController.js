const { NotificationModel } = require("../models/pushNotification");

const addNotification = async (req, res) => {
  try {
    const { title, description, from_agent_id, to_agent_id } = req.body;
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
    return res.status(200).json({ msg: "notification saved" });
  } catch (error) {
    console.log("error in addNotification", error);
    return resizeBy.status(500).json({ msg: "server error" });
  }
};
const getNotifications = async (req, res) => {
  try {
    const notifications = await NotificationModel.find();
    return res.status(200).json(notifications);
  } catch (error) {
    console.log("error in getNotification", error);
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
};
