const User = require("../models/User");

const mongoose = require('mongoose');
// Helper function for error handling
const handleError = (res, error, message = "Server Error") => {
  console.error(`Admin Controller Error: ${message}`, error);
  res.status(500).send(message);
};

exports.adminDashboard = async (req, res) => {
  try {
    const users = await User.find().select("-password"); // Exclude passwords
    res.render("admin", {
      user: req.user,
      users,
      currentPage: "dashboard"
    });
  } catch (error) {
    handleError(res, error, "Failed to load admin dashboard");
  }
};

exports.manageUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password");
    res.render("manageUsers", {
      users,
      currentPage: "users"
    });
  } catch (error) {
    handleError(res, error, "Failed to load users");
  }
};

exports.editUserForm = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");
    
    if (!user) {
      return res.status(404).send("User not found");
    }
    
    res.render("editUser", {
      user,
      currentPage: "users"
    });
  } catch (error) {
    handleError(res, error, "Failed to load edit form");
  }
};

// controllers/adminController.js
exports.editUser = async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).send("Invalid user ID format");
    }

    const { username, email, role } = req.body;
    
    const updatedUser = await User.findByIdAndUpdate(
      id,
      { username, email, role },
      { 
        new: true,
        runValidators: true,
        context: 'query'
      }
    );

    if (!updatedUser) {
      return res.status(404).send("User not found");
    }

    res.redirect("/admin");
  } catch (error) {
    console.error("Update error:", error);
    // Fallback to simple error message if error view doesn't exist
    res.status(500).send(error.message.includes("validation") 
      ? `Validation error: ${error.message}`
      : "Server Error"
    );
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedUser = await User.findByIdAndDelete(id);

    if (!deletedUser) {
      return res.status(404).send("User not found");
    }

    res.redirect("/admin/users");
  } catch (error) {
    handleError(res, error, "Failed to delete user");
  }
};