const express = require('express');
const router = express.Router();
const transactionController = require('../controllers/transactionController');
const { authenticate } = require('../middleware/authMiddleware');

router.post('/', authenticate, transactionController.createTransaction);
router.post('/edit/:id', authenticate, transactionController.editTransaction);
router.post('/delete/:id', authenticate, transactionController.deleteTransaction);

module.exports = router;
