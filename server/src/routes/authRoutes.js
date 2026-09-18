const express = require('express');
const authController = require('../controllers/authController');
const { authenticate } = require('../middleware/auth');
const { csrfProtection } = require('../middleware/csrf');

const router = express.Router();

router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/refresh', authController.refresh);
router.post('/logout', authenticate, authController.logout);

// Protected routes (also require CSRF check if mutation)
router.get('/me', authenticate, authController.me);
router.post('/change-password', authenticate, csrfProtection, authController.changePassword);

module.exports = router;
