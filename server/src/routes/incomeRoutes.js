const express = require('express');
const incomeController = require('../controllers/incomeController');
const { authenticate } = require('../middleware/auth');
const { csrfProtection } = require('../middleware/csrf');

const router = express.Router();

router.use(authenticate);

router.get('/', incomeController.getIncome);
router.post('/', csrfProtection, incomeController.createOrUpdateIncome);

module.exports = router;
