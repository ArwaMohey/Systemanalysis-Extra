/**
 * High-Performance User Profile Service
 * 
 * Architecture:
 * - Express.js web framework
 * - In-memory cache with cache warming
 * - Optimized for p95 < 200ms at 100 RPS
 * 
 * Low-latency design patterns:
 * 1. Cache warming at startup
 * 2. No blocking I/O for reads
 * 3. Simple request pipeline
 * 4. Minimal middleware overhead
 */

const express = require('express');
const userProfileCache = require('./cache');
const routes = require('./routes');

const app = express();
const PORT = process.env.PORT || 3000;

// Minimal middleware for performance
app.use(express.json());

// Disable X-Powered-By header for security
app.disable('x-powered-by');

// Mount API routes
app.use('/api', routes);

// Initialize cache before starting server
async function startServer() {
  console.log('========================================');
  console.log('User Profile Service - Starting');
  console.log('========================================');
  
  // Cache warming - critical for low latency
  userProfileCache.warmCache();
  
  // Start HTTP server
  app.listen(PORT, () => {
    console.log(`\n[Server] Listening on port ${PORT}`);
    console.log(`[Server] Health check: http://localhost:${PORT}/api/health`);
    console.log(`[Server] User endpoint: http://localhost:${PORT}/api/user/:id`);
    console.log('========================================\n');
  });
}

// Start the application
startServer().catch(err => {
  console.error('Failed to start server:', err);
  process.exit(1);
});

module.exports = app;
