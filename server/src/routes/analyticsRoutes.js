import express from 'express';
import * as analyticsController from '../controllers/analyticsController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

router.use(authenticate); // Only GET requests, no CSRF needed for analytics fetches

router.get('/summary', analyticsController.getSummary);
router.get('/category', analyticsController.getCategoryBreakdown);
router.get('/monthly-trend', analyticsController.getMonthlyTrend);

export default router;
