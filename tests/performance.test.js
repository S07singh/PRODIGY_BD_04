// Simple performance test script
const fetch = require('node-fetch');

// Configuration
const API_URL = process.env.API_URL || 'http://localhost:3000/api';
const ITERATIONS = process.env.TEST_ITERATIONS || 10;
const ENDPOINTS = [
  '/users',
  '/users/1',
  '/users/2'
];

// Test helper function
async function measureEndpoint(endpoint, clearCache = false) {
  const fullUrl = `${API_URL}${endpoint}`;
  
  // Clear cache if needed
  if (clearCache) {
    await fetch(`${API_URL}/performance/clear-stats`, { method: 'POST' });
  }
  
  const results = [];
  
  // Perform test iterations
  for (let i = 0; i < ITERATIONS; i++) {
    const start = Date.now();
    const response = await fetch(fullUrl);
    await response.json();
    const duration = Date.now() - start;
    results.push(duration);
    
    // Small delay between requests
    await new Promise(resolve => setTimeout(resolve, 50));
  }
  
  return {
    min: Math.min(...results),
    max: Math.max(...results),
    avg: results.reduce((sum, val) => sum + val, 0) / results.length,
    values: results
  };
}

async function runTests() {
  console.log(`Running ${ITERATIONS} iterations for each endpoint`);
  
  for (const endpoint of ENDPOINTS) {
    console.log(`\nTesting endpoint: ${endpoint}`);
    
    // Test with cold cache
    console.log('  Uncached performance:');
    const uncachedResults = await measureEndpoint(endpoint, true);
    console.log(`    Min: ${uncachedResults.min}ms`);
    console.log(`    Max: ${uncachedResults.max}ms`);
    console.log(`    Avg: ${uncachedResults.avg.toFixed(2)}ms`);
    
    // Test with warm cache
    console.log('  Cached performance:');
    const cachedResults = await measureEndpoint(endpoint);
    console.log(`    Min: ${cachedResults.min}ms`);
    console.log(`    Max: ${cachedResults.max}ms`);
    console.log(`    Avg: ${cachedResults.avg.toFixed(2)}ms`);
    
    // Calculate improvement
    const improvement = ((uncachedResults.avg - cachedResults.avg) / uncachedResults.avg * 100).toFixed(2);
    console.log(`  Performance improvement: ${improvement}%`);
    console.log(`  Speed-up factor: ${(uncachedResults.avg / cachedResults.avg).toFixed(2)}x`);
  }
}

// Run tests
runTests().catch(console.error);