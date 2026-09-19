import express from 'express';
import * as analyticsController from '../controllers/analyticsController.js';
import { authenticate } from '../middleware/auth.js';

import { cacheMiddleware } from '../middleware/cacheMiddleware.js';

const router = express.Router();

router.use(authenticate); // Only GET requests, no CSRF needed for analytics fetches

router.get('/summary', cacheMiddleware('analytics:summary', 600), analyticsController.getSummary);
router.get('/category', cacheMiddleware('analytics:category', 600), analyticsController.getCategoryBreakdown);
router.get('/monthly-trend', cacheMiddleware('analytics:monthly-trend', 600), analyticsController.getMonthlyTrend);

export default router;
