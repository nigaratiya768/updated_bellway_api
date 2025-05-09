const express = require("express");
const multer = require("multer");
const excel = express();
const path = require("path");
const fs = require("fs");
const { createGeolocation } = require("../controllers/crmGeolocation");

const router = express.Router();
const destinationPath = path.join(__dirname, "../public", "uploads");
if (!fs.existsSync(destinationPath)) {
  fs.mkdirSync(destinationPath, { recursive: true });
}
excel.use("../public", express.static(path.resolve(__dirname, "../public")));
var storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, destinationPath);
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  },
});
var upload = multer({ storage: storage });

router
  .route("/create_geolocation")
  .post(upload.single("file"), createGeolocation);

module.exports = router;
