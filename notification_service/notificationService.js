const agentModel = require("../models/agentModel");
const { NotificationModel } = require("../models/pushNotification");
const firebase = require("./firebaseConfig");

async function send(userId, notification) {
  const user = await agentModel.findById(userId);

  if (user) {
    // ------------code to send notification--------------//
    if (!user.device_token) {
      console.log("device_token not found");
      return;
    }
    if (notification) {
      const newNotification = new NotificationModel({
        title: notification.title,
        description: notification.description,

        to_agent_id: userId,
      });
      await newNotification.save();
      const message = {
        notification: {
          title: notification.title,
          body: notification.description,
        },
        token: user.device_token,
        android: {
          notification: {
            sound: "default",
            priority: "high",
            clickAction: "OPEN_ACTIVITY",
          },
        },
        apns: {
          payload: {
            aps: {
              alert: {
                title: notification.title,
                body: notification.description,
              },
              sound: "default",
              badge: 1,
            },
          },
        },
      };

      try {
        const response = await firebase.messaging().send(message);
        console.log("firebase response: ", response);
      } catch (error) {
        console.log("notification error while sending it", error);
      }
    }
    //------------code to send notification--------------//
  } else {
    console.log("user not found", userId);
  }
}

module.exports = send;
