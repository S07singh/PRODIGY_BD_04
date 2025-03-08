const { 
    invalidateUserCache, 
    invalidateAllUsersCache, 
    invalidateUserListCache 
  } = require('../utils/cache-invalidation');
  
  // In-memory users for demo purposes
  // In a real app, this would be replaced with database access
  let users = [
    { id: 1, name: 'Alice Johnson', email: 'alice@example.com', role: 'admin' },
    { id: 2, name: 'Bob Smith', email: 'bob@example.com', role: 'user' },
    { id: 3, name: 'Charlie Davis', email: 'charlie@example.com', role: 'user' }
  ];
  
  // Simulate database latency
  const simulateDbLatency = async () => {
    const minLatency = 200;
    const maxLatency = 500;
    const latency = Math.floor(Math.random() * (maxLatency - minLatency + 1)) + minLatency;
    await new Promise(resolve => setTimeout(resolve, latency));
  };
  
  // Controller methods
  const getUsers = async (req, res) => {
    try {
      // Simulate database query latency
      await simulateDbLatency();
      
      // Apply filters if provided
      let filteredUsers = [...users];
      
      if (req.query.role) {
        filteredUsers = filteredUsers.filter(user => user.role === req.query.role);
      }
      
      res.json(filteredUsers);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };
  
  const getUserById = async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      
      // Simulate database query latency
      await simulateDbLatency();
      
      const user = users.find(u => u.id === userId);
      
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
      
      res.json(user);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };
  
  const createUser = async (req, res) => {
    try {
      const { name, email, role } = req.body;
      
      if (!name || !email) {
        return res.status(400).json({ error: 'Name and email are required' });
      }
      
      // Simulate database operation
      await simulateDbLatency();
      
      // Create new user
      const newId = users.length > 0 ? Math.max(...users.map(u => u.id)) + 1 : 1;
      const newUser = {
        id: newId,
        name,
        email,
        role: role || 'user'
      };
      
      users.push(newUser);
      
      // Invalidate user list cache
      await invalidateUserListCache();
      
      res.status(201).json(newUser);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };
  
  const updateUser = async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      const { name, email, role } = req.body;
      
      // Simulate database operation
      await simulateDbLatency();
      
      const userIndex = users.findIndex(u => u.id === userId);
      
      if (userIndex === -1) {
        return res.status(404).json({ error: 'User not found' });
      }
      
      // Update user properties
      const updatedUser = {
        ...users[userIndex],
        ...(name && { name }),
        ...(email && { email }),
        ...(role && { role })
      };
      
      users[userIndex] = updatedUser;
      
      // Invalidate both specific user cache and potentially list cache
      await Promise.all([
        invalidateUserCache(userId),
        invalidateUserListCache()
      ]);
      
      res.json(updatedUser);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };
  
  const deleteUser = async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      
      // Simulate database operation
      await simulateDbLatency();
      
      const userIndex = users.findIndex(u => u.id === userId);
      
      if (userIndex === -1) {
        return res.status(404).json({ error: 'User not found' });
      }
      
      // Remove user
      const deletedUser = users[userIndex];
      users = users.filter(u => u.id !== userId);
      
      // Invalidate caches
      await Promise.all([
        invalidateUserCache(userId),
        invalidateUserListCache()
      ]);
      
      res.json({ message: 'User deleted successfully', user: deletedUser });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };
  
  module.exports = {
    getUsers,
    getUserById,
    createUser,
    updateUser,
    deleteUser
  };