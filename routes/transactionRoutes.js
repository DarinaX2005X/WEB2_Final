const express = require('express');
const router = express.Router();
const transactionController = require('../controllers/transactionController');
const { authenticateJWT } = require('../middleware/authMiddleware');

router.post('/', authenticateJWT, transactionController.createTransaction);
router.post('/edit/:id', authenticateJWT, transactionController.editTransaction);
router.post('/delete/:id', authenticateJWT, transactionController.deleteTransaction);

module.exports = router;
