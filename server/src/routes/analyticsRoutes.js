const express = require('express');
const analyticsController = require('../controllers/analyticsController');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

router.use(authenticate); // Only GET requests, no CSRF needed for analytics fetches

router.get('/summary', analyticsController.getSummary);
router.get('/category', analyticsController.getCategoryBreakdown);
router.get('/monthly-trend', analyticsController.getMonthlyTrend);

module.exports = router;
