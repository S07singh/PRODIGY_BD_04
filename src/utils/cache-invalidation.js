const redisCache = require('./redis-cache');

// Cache key patterns for invalidation
const CACHE_PATTERNS = {
  ALL_USERS: 'users:*',
  USER_BY_ID: (id) => `users:id:${id}*`,
  USER_LIST: 'users:list*'
};

// Cache invalidation methods
const invalidateUserCache = async (userId) => {
  const pattern = CACHE_PATTERNS.USER_BY_ID(userId);
  const count = await redisCache.delByPattern(pattern);
  console.log(`Invalidated ${count} cache entries for user #${userId}`);
  return count;
};

const invalidateAllUsersCache = async () => {
  const count = await redisCache.delByPattern(CACHE_PATTERNS.ALL_USERS);
  console.log(`Invalidated ${count} user cache entries`);
  return count;
};

const invalidateUserListCache = async () => {
  const count = await redisCache.delByPattern(CACHE_PATTERNS.USER_LIST);
  console.log(`Invalidated ${count} user list cache entries`);
  return count;
};

module.exports = {
  CACHE_PATTERNS,
  invalidateUserCache,
  invalidateAllUsersCache,
  invalidateUserListCache
};