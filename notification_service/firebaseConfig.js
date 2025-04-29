// import * as admin from "firebase-admin";

// import serviceAccount from "./find-my-player-f5356-firebase-adminsdk-dxb9z-3d3c6636b4.json"; //path of file which you downloaded

// const firebase = admin.initializeApp({
//   credential: admin.credential.cert(serviceAccount),
// });

var admin = require("firebase-admin");

var serviceAccount = require("./test-push-notification-e4dba-firebase-adminsdk-fbsvc-5f2a526e7b.json");

const firebase = admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

module.exports = firebase;
