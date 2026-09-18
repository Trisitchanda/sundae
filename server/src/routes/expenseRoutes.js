const express = require('express');
const expenseController = require('../controllers/expenseController');
const { authenticate } = require('../middleware/auth');
const { csrfProtection } = require('../middleware/csrf');

const router = express.Router();

router.use(authenticate);

router.get('/', expenseController.getExpenses);
router.post('/', csrfProtection, expenseController.createExpense);
router.put('/:id', csrfProtection, expenseController.updateExpense);
router.delete('/:id', csrfProtection, expenseController.deleteExpense);

module.exports = router;
