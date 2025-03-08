const redisCache = require('../utils/redis-cache');

// In-memory performance stats storage
let performanceStats = {
  cached: [],
  uncached: [],
  lastRun: null
};

// Helper function to calculate average
const calculateAverage = (arr) => {
  if (!arr.length) return 0;
  return arr.reduce((sum, val) => sum + val, 0) / arr.length;
};

// Run a performance test comparing cached vs uncached responses
const runPerformanceTest = async (req, res) => {
  try {
    const iterations = parseInt(req.query.iterations) || 5;
    const endpoint = req.query.endpoint || '/api/users';
    const baseUrl = `http://${req.get('host')}`;
    
    const results = {
      uncached: [],
      cached: [],
      timestamp: new Date().toISOString()
    };
    
    // Clear cache for target endpoint
    await redisCache.delByPattern(`*${endpoint}*`);
    
    // Test uncached responses
    console.log(`Running ${iterations} uncached requests to ${endpoint}`);
    for (let i = 0; i < iterations; i++) {
      const start = Date.now();
      const response = await fetch(`${baseUrl}${endpoint}`);
      await response.json(); // Consume response
      const duration = Date.now() - start;
      results.uncached.push(duration);
    }
    
    // Test cached responses
    console.log(`Running ${iterations} cached requests to ${endpoint}`);
    for (let i = 0; i < iterations; i++) {
      const start = Date.now();
      const response = await fetch(`${baseUrl}${endpoint}`);
      await response.json(); // Consume response
      const duration = Date.now() - start;
      results.cached.push(duration);
    }
    
    // Calculate statistics
    const avgUncached = calculateAverage(results.uncached);
    const avgCached = calculateAverage(results.cached);
    const improvement = ((avgUncached - avgCached) / avgUncached * 100).toFixed(2);
    
    // Store results in memory
    performanceStats = {
      cached: results.cached,
      uncached: results.uncached,
      lastRun: results.timestamp
    };
    
    res.json({
      results,
      statistics: {
        avgUncached: `${avgUncached.toFixed(2)}ms`,
        avgCached: `${avgCached.toFixed(2)}ms`,
        improvement: `${improvement}%`, 
        speedup: `${(avgUncached / avgCached).toFixed(2)}x`
      },
      endpoint,
      iterations
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get stored performance stats
const getPerformanceStats = (req, res) => {
  if (!performanceStats.lastRun) {
    return res.status(404).json({ 
      error: 'No performance tests have been run yet',
      hint: 'Run a test using GET /api/performance/test first'
    });
  }
  
  const avgUncached = calculateAverage(performanceStats.uncached);
  const avgCached = calculateAverage(performanceStats.cached);
  const improvement = ((avgUncached - avgCached) / avgUncached * 100).toFixed(2);
  
  res.json({
    raw: performanceStats,
    statistics: {
      avgUncached: `${avgUncached.toFixed(2)}ms`,
      avgCached: `${avgCached.toFixed(2)}ms`,
      improvement: `${improvement}%`,
      speedup: `${(avgUncached / avgCached).toFixed(2)}x`
    },
    lastRun: performanceStats.lastRun
  });
};

// Clear stored performance stats
const clearPerformanceStats = (req, res) => {
  performanceStats = {
    cached: [],
    uncached: [],
    lastRun: null
    
  };
  
  res.json({ message: 'Performance statistics cleared successfully' });
};

module.exports = {
  runPerformanceTest,
  getPerformanceStats,
  clearPerformanceStats
};