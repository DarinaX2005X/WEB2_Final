const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { authenticate } = require('../middleware/authMiddleware');

router.post('/profile/update', authenticate, userController.updateProfile);

module.exports = router;
