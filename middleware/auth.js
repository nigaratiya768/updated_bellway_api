const User = require("../models/agentModel");
const jwt = require("jsonwebtoken");

const auth = async (req, res, next) => {
  try {
    const token = req.header("authorization")?.split(" ")[1];
    console.log("token", token, req.header("authorization"));
    if (!token)
      return res.status(403).json({ msg: "please provide valid auth token " });

    try {
      console.log("---------verfing token -------------");
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      console.log("clams", decoded);
      const user = await User.findOne({ _id: decoded.id });
      console.log("user", user);
      req.user = user;
      next();
    } catch (err) {
      console.log("err", err);
      return res.status(401).json({ msg: "Unauthorized" });
    }
  } catch (error) {
    console.log("token error", error);
    return res.status(500).json({ msg: "please provide valid auth token " });
  }
};

module.exports = auth;
