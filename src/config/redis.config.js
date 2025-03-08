const redis = require('redis');

// Create Redis client instance
const createRedisClient = async () => {
  try {
    const client = redis.createClient({
      url: process.env.REDIS_URL || 'redis://localhost:6379',
      password: process.env.REDIS_PASSWORD || undefined
    });

    // Register event handlers
    client.on('error', (err) => console.error('Redis error:', err));
    client.on('connect', () => console.log('Connected to Redis'));
    client.on('reconnecting', () => console.log('Redis reconnecting...'));
    client.on('ready', () => console.log('Redis client ready'));

    // Connect to Redis
    await client.connect();
    
    return client;
  } catch (error) {
    console.error('Redis connection error:', error);
    // Return a dummy client for fallback if Redis is not available
    return createFallbackClient();
  }
};

// Create an in-memory fallback client if Redis is unavailable
const createFallbackClient = () => {
  console.warn('Using in-memory fallback cache');
  
  const cache = new Map();
  const expirations = new Map();
  
  return {
    isConnected: false,
    get: async (key) => {
      const now = Date.now();
      if (expirations.has(key) && expirations.get(key) < now) {
        cache.delete(key);
        expirations.delete(key);
        return null;
      }
      return cache.get(key);
    },
    set: async (key, value, options) => {
      cache.set(key, value);
      
      // Handle expiration
      if (options && options.EX) {
        const expireAt = Date.now() + (options.EX * 1000);
        expirations.set(key, expireAt);
      }
      
      return 'OK';
    },
    del: async (key) => {
      const deleted = cache.delete(key);
      expirations.delete(key);
      return deleted ? 1 : 0;
    },
    keys: async (pattern) => {
      // Simple pattern matching for memory cache
      const regex = new RegExp(
        pattern.replace('*', '.*').replace('?', '.')
      );
      
      return Array.from(cache.keys()).filter(key => regex.test(key));
    },
    flushAll: async () => {
      cache.clear();
      expirations.clear();
      return 'OK';
    },
    quit: async () => true
  };
};


module.exports = { createRedisClient };