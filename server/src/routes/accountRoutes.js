const express = require('express');
const router = express.Router();
const accountController = require('../controllers/accountController');

const { authenticate } = require('../middleware/auth');

router.get('/', authenticate, accountController.getAccounts);
router.post('/', authenticate, accountController.createAccount);

module.exports = router;
