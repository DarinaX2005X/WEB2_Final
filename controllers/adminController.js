const User = require("../models/User");

exports.adminDashboard = (req, res) => {
  res.render("admin", { user: req.user });
};

exports.manageUsers = async (req, res) => {
  try {
    const users = await User.find();
    res.render("manageUsers", { users });
  } catch (error) {
    res.status(500).send("Server Error");
  }
};
