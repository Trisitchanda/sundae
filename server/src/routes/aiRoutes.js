import express from 'express';
const router = express.Router();
import * as aiController from '../controllers/aiController.js';
import { authenticate } from '../middleware/auth.js';
router.post('/analyze', authenticate, aiController.analyze);

export default router;
