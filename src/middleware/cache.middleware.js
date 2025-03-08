const redisCache = require('../utils/redis-cache');

// Cache middleware factory
const cacheMiddleware = (options = {}) => {
  return async (req, res, next) => {
    // Skip caching for non-GET requests unless explicitly enabled
    if (req.method !== 'GET' && !options.cacheNonGet) {
      return next();
    }
    
    const ttl = options.ttl || parseInt(process.env.DEFAULT_CACHE_TTL) || 3600;
    const prefix = options.prefix || 'api';
    
    // Generate cache key based on URL and query parameters
    const cacheKey = redisCache.generateKey(prefix, {
      url: req.originalUrl || req.url,
      ...req.query
    });
    
    try {
      // Try to get from cache
      const cachedData = await redisCache.get(cacheKey);
      
      if (cachedData) {
        // Log cache hit
        const responseTime = Date.now() - req.startTime;
        console.log(`CACHE HIT: ${cacheKey} - ${responseTime}ms`);
        
        // Add cache headers
        res.setHeader('X-Cache', 'HIT');
        res.setHeader('X-Cache-Key', cacheKey);
        
        // Return cached data with metadata
        return res.json({
          data: cachedData,
          metadata: {
            source: 'cache',
            responseTime,
            cacheKey
          }
        });
      }
      
      // If not in cache, store original json method and override it
      const originalJson = res.json;
      
      res.json = function(data) {
        const responseTime = Date.now() - req.startTime;
        console.log(`CACHE MISS: ${cacheKey} - ${responseTime}ms`);
        
        // Store in cache (only cache successful responses)
        if (res.statusCode >= 200 && res.statusCode < 300) {
          redisCache.set(cacheKey, data, ttl);
        }
        
        // Add cache headers
        res.setHeader('X-Cache', 'MISS');
        res.setHeader('X-Cache-Key', cacheKey);
        
        // Return original data with metadata
        return originalJson.call(this, {
          data,
          metadata: {
            source: 'database',
            responseTime,
            cacheKey,
            cacheTTL: `${ttl}s`
          }
        });
      };
      
      next();
    } catch (error) {
      console.error('Cache middleware error:', error);
      next();
    }
  };
};

module.exports = cacheMiddleware;