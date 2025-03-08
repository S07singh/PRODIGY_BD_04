require('dotenv').config();
const express = require('express');
const routes = require('./src/routes');
const performanceMiddleware = require('./src/middleware/performance.middleware');

const app = express();

// Middleware
app.use(express.json());
app.use(performanceMiddleware);

// Routes
app.use('/api', routes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    error: 'Something went wrong!',
    message: err.message
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Redis cache enabled with default TTL: ${process.env.DEFAULT_CACHE_TTL}s`);
});

module.exports = app; // For testing