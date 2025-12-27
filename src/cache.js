/**
 * User Profile Cache Service
 * 
 * Low-latency design patterns implemented:
 * 1. In-memory caching - All user data stored in memory for O(1) access
 * 2. Cache warming - Data pre-loaded at application startup
 * 3. No blocking I/O - Pure in-memory operations for read operations
 * 4. Optimized for tail latency - Consistent performance characteristics
 */

class UserProfileCache {
  constructor() {
    this.cache = new Map();
    this.initialized = false;
  }

  /**
   * Warm cache at startup with sample user data
   * In production, this would load from database during startup
   */
  warmCache() {
    console.log('[Cache] Starting cache warming...');
    const startTime = Date.now();

    // Generate 1000 sample users for realistic testing
    for (let i = 1; i <= 1000; i++) {
      this.cache.set(i, {
        id: i,
        name: `User${i}`,
        email: `user${i}@example.com`
      });
    }

    this.initialized = true;
    const duration = Date.now() - startTime;
    console.log(`[Cache] Cache warmed with ${this.cache.size} users in ${duration}ms`);
  }

  /**
   * Get user profile by ID - O(1) operation
   * @param {number} userId 
   * @returns {Object|null} User profile or null if not found
   */
  getUserProfile(userId) {
    if (!this.initialized) {
      throw new Error('Cache not initialized. Call warmCache() first.');
    }

    const user = this.cache.get(parseInt(userId));
    return user || null;
  }

  /**
   * Get cache statistics for monitoring
   */
  getStats() {
    return {
      size: this.cache.size,
      initialized: this.initialized
    };
  }
}

// Singleton instance
const userProfileCache = new UserProfileCache();

module.exports = userProfileCache;
