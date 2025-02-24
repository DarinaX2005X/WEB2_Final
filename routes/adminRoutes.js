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
router.get("/admin", authenticateJWT, isAdmin, adminController.adminDashboard);
router.get(
  "/admin/users",
  authenticateJWT,
  isAdmin,
  adminController.manageUsers
);

module.exports = router;
