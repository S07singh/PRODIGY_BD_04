const { createRedisClient } = require('../config/redis.config');

class RedisCache {
  constructor() {
    this.client = null;
    this.ttl = parseInt(process.env.DEFAULT_CACHE_TTL) || 3600; // Default: 1 hour
    this.initialized = false;
  }
  
  async initialize() {
    if (this.initialized) return;
    
    this.client = await createRedisClient();
    this.initialized = true;
  }
  
  async get(key) {
    if (!this.initialized) await this.initialize();
    
    try {
      const cachedData = await this.client.get(key);
      if (cachedData) {
        return JSON.parse(cachedData);
      }
      return null;
    } catch (error) {
      console.error('Cache get error:', error);
      return null;
    }
  }
  
  async set(key, data, ttl = this.ttl) {
    if (!this.initialized) await this.initialize();
    
    try {
      const serializedData = JSON.stringify(data);
      await this.client.set(key, serializedData, { EX: ttl });
      return true;
    } catch (error) {
      console.error('Cache set error:', error);
      return false;
    }
  }
  
  async del(key) {
    if (!this.initialized) await this.initialize();
    
    try {
      await this.client.del(key);
      return true;
    } catch (error) {
      console.error('Cache delete error:', error);
      return false;
    }
  }
  
  async delByPattern(pattern) {
    if (!this.initialized) await this.initialize();
    
    try {
      const keys = await this.client.keys(pattern);
      if (keys.length > 0) {
        console.log(`Invalidating ${keys.length} cache entries matching pattern: ${pattern}`);
        for (const key of keys) {
          await this.client.del(key);
        }
      }
      return keys.length;
    } catch (error) {
      console.error('Cache delete by pattern error:', error);
      return 0;
    }
  }
  
  generateKey(prefix, params = {}) {
    const sortedParams = Object.keys(params)
      .sort()
      .map(key => `${key}:${params[key]}`)
      .join('|');
    
    return `${prefix}:${sortedParams}`;
  }
  
  async flush() {
    if (!this.initialized) await this.initialize();
    
    try {
      await this.client.flushAll();
      return true;
    } catch (error) {
      console.error('Cache flush error:', error);
      return false;
    }
  }
  
  async close() {
    if (this.client) {
      await this.client.quit();
      this.initialized = false;
    }
  }
}

// Create singleton instance
const redisCacheInstance = new RedisCache();

module.exports = redisCacheInstance;