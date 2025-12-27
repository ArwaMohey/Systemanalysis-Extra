/**
 * User Profile Routes
 * 
 * Implements the GET /api/user/:id endpoint
 * Optimized for low-latency reads with in-memory caching
 */

const express = require('express');
const userProfileCache = require('./cache');

const router = express.Router();

/**
 * GET /api/user/:id
 * 
 * Fetch user profile by ID
 * Response: { id, name, email } or 404
 */
router.get('/user/:id', (req, res) => {
  const userId = parseInt(req.params.id);

  // Validate input
  if (isNaN(userId) || userId < 1) {
    return res.status(400).json({
      error: 'Invalid user ID'
    });
  }

  // Fetch from cache - O(1) operation
  const user = userProfileCache.getUserProfile(userId);

  if (!user) {
    return res.status(404).json({
      error: 'User not found'
    });
  }

  // Return user profile
  res.json(user);
});

/**
 * GET /api/health
 * 
 * Health check endpoint for monitoring
 */
router.get('/health', (req, res) => {
  const cacheStats = userProfileCache.getStats();
  res.json({
    status: 'healthy',
    cache: cacheStats,
    timestamp: new Date().toISOString()
  });
});

module.exports = router;
