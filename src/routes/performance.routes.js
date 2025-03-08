const express = require('express');
const performanceController = require('../controllers/performance.controller');

const router = express.Router();

// Performance testing endpoints
router.get('/test', performanceController.runPerformanceTest);
router.get('/stats', performanceController.getPerformanceStats);
router.post('/clear-stats', performanceController.clearPerformanceStats);

module.exports = router;