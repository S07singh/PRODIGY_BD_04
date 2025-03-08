// Performance tracking middleware
const performanceMiddleware = (req, res, next) => {
    // Add start time to request
    req.startTime = Date.now();
    
    // Track original end method
    const originalEnd = res.end;
    
    // Override end method to calculate response time
    res.end = function(...args) {
      const responseTime = Date.now() - req.startTime;
      
      // Add response time header
      res.setHeader('X-Response-Time', `${responseTime}ms`);
      
      // Log performance data
      console.log(`${req.method} ${req.originalUrl} - ${responseTime}ms`);
      
      // Call original end method
      return originalEnd.apply(this, args);
    };
    
    next();
  };
  
  module.exports = performanceMiddleware;