import express from 'express';
import * as authController from '../controllers/authController.js';
import { authenticate } from '../middleware/auth.js';
import { csrfProtection } from '../middleware/csrf.js';
import { validate } from '../middleware/validate.js';
import { registerSchema, loginSchema, changePasswordSchema } from '../schemas/auth.schemas.js';

const router = express.Router();

router.post('/register', validate(registerSchema), authController.register);
router.post('/login', validate(loginSchema), authController.login);
router.post('/refresh', authController.refresh);
router.post('/logout', authenticate, authController.logout);

// Protected routes (also require CSRF check if mutation)
router.get('/me', authenticate, authController.me);
router.post('/change-password', authenticate, csrfProtection, validate(changePasswordSchema), authController.changePassword);

export default router;
