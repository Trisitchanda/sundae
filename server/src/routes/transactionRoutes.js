const express = require('express');
const router = express.Router();
const transactionController = require('../controllers/transactionController');

const { authenticate } = require('../middleware/auth');

router.get('/', authenticate, transactionController.getTransactions);
router.post('/', authenticate, transactionController.createTransaction);
router.delete('/:id', authenticate, transactionController.deleteTransaction);

module.exports = router;
