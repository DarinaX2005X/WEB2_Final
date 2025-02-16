const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { authenticateJWT } = require('../middleware/authMiddleware');

router.post('/profile/update', authenticateJWT, userController.updateProfile);

module.exports = router;
