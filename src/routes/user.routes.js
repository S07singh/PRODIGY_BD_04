const express = require('express');
const userController = require('../controllers/user.controller');
const cacheMiddleware = require('../middleware/cache.middleware');

const router = express.Router();

// User routes with caching
router.get('/', 
  cacheMiddleware({ 
    prefix: 'users:list', 
    ttl: parseInt(process.env.USERS_CACHE_TTL) || 300 
  }), 
  userController.getUsers
);

router.get('/:id', 
  cacheMiddleware({ 
    prefix: 'users:id', 
    ttl: parseInt(process.env.USER_CACHE_TTL) || 600 
  }), 
  userController.getUserById
);

// Routes that modify data and invalidate cache
router.post('/', userController.createUser);
router.put('/:id', userController.updateUser);
router.delete('/:id', userController.deleteUser);

module.exports = router;