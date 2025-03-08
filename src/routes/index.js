const express = require('express');
const userRoutes = require('./user.routes');
const performanceRoutes = require('./performance.routes');

const router = express.Router();

// Register route modules
router.use('/users', userRoutes);
router.use('/performance', performanceRoutes);

// Health check endpoint
router.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

module.exports = router;