const express = require("express");
const router = express.Router();
const adminController = require("../controllers/adminController");
const { authenticateJWT } = require("../middleware/authMiddleware");

// Middleware для проверки роли
function isAdmin(req, res, next) {
  if (req.user && req.user.role === "admin") {
    next();
  } else {
    res.redirect("/dashboard");
  }
}

// Маршруты администратора
router.get("/", authenticateJWT, isAdmin, adminController.adminDashboard);
router.get("/users", authenticateJWT, isAdmin, adminController.manageUsers);
router.get("/edit-user/:id", authenticateJWT, isAdmin, adminController.editUserForm);
router.put("/edit-user/:id", authenticateJWT, isAdmin, adminController.editUser);
router.get("/delete-user/:id", authenticateJWT, isAdmin, adminController.deleteUser);

module.exports = router;