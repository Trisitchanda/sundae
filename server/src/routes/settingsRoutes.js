const express = require('express');
const settingsController = require('../controllers/settingsController');
const { authenticate } = require('../middleware/auth');
const { csrfProtection } = require('../middleware/csrf');

const router = express.Router();

router.use(authenticate);

router.put('/income', csrfProtection, settingsController.updateIncome);
router.put('/savings-goal', csrfProtection, settingsController.updateSavingsGoal);

module.exports = router;
