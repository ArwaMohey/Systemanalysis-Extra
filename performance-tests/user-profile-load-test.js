/**
 * k6 Performance Test Script
 * User Profile Fetch Component Load Test
 * 
 * Test Configuration:
 * - Target: GET /api/user/:id
 * - Load: 100 requests per second (constant rate)
 * - Duration: 5 minutes (300 seconds)
 * - Performance threshold: p95 < 200ms
 * 
 * Usage:
 *   k6 run performance-tests/user-profile-load-test.js
 * 
 * With results export:
 *   k6 run --out json=k6-results.json performance-tests/user-profile-load-test.js
 */

import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate } from 'k6/metrics';

// Custom metrics
const errorRate = new Rate('errors');

// Test configuration
export const options = {
  // Constant rate of 100 RPS for 5 minutes
  scenarios: {
    constant_load: {
      executor: 'constant-arrival-rate',
      rate: 100,              // 100 requests per second
      timeUnit: '1s',         // per second
      duration: '5m',         // 5 minutes total duration
      preAllocatedVUs: 10,    // Pre-allocated virtual users
      maxVUs: 50,             // Maximum virtual users if needed
    },
  },

  // Performance thresholds
  thresholds: {
    'http_req_duration': [
      'p(95)<200',           // 95th percentile must be < 200ms (PRIMARY REQUIREMENT)
      'p(99)<500',           // 99th percentile should be < 500ms
    ],
    'http_req_failed': ['rate<0.01'],  // Error rate must be < 1%
    'errors': ['rate<0.01'],            // Custom error rate < 1%
  },
};

// Configuration
const BASE_URL = __ENV.BASE_URL || 'http://localhost:3000';
const MAX_USER_ID = 1000; // Should match cache size in cache.js

/**
 * Main test scenario
 * Fetches random user profiles to simulate realistic load
 */
export default function() {
  // Generate random user ID between 1 and MAX_USER_ID
  const userId = Math.floor(Math.random() * MAX_USER_ID) + 1;
  const url = `${BASE_URL}/api/user/${userId}`;

  // Execute HTTP GET request
  const response = http.get(url);

  // Validate response
  const checkResult = check(response, {
    'status is 200': (r) => r.status === 200,
    'response has user id': (r) => {
      try {
        const body = JSON.parse(r.body);
        return body.id !== undefined;
      } catch (e) {
        return false;
      }
    },
    'response has user name': (r) => {
      try {
        const body = JSON.parse(r.body);
        return body.name !== undefined;
      } catch (e) {
        return false;
      }
    },
    'response has user email': (r) => {
      try {
        const body = JSON.parse(r.body);
        return body.email !== undefined;
      } catch (e) {
        return false;
      }
    },
    'response time < 200ms': (r) => r.timings.duration < 200,
  });

  // Track errors
  errorRate.add(!checkResult);
}

/**
 * Setup function - runs once before test
 * Verifies server is ready
 */
export function setup() {
  console.log('===========================================');
  console.log('k6 Performance Test - User Profile Service');
  console.log('===========================================');
  console.log('Target:', BASE_URL);
  console.log('Load: 100 RPS');
  console.log('Duration: 5 minutes');
  console.log('Threshold: p95 < 200ms');
  console.log('===========================================\n');

  // Health check
  const healthResponse = http.get(`${BASE_URL}/api/health`);
  if (healthResponse.status !== 200) {
    throw new Error(`Server not ready. Health check failed with status ${healthResponse.status}`);
  }

  console.log('✓ Server health check passed');
  console.log('✓ Starting load test...\n');
}

/**
 * Teardown function - runs once after test
 * Prints summary
 */
export function teardown(data) {
  console.log('\n===========================================');
  console.log('Test completed');
  console.log('===========================================');
  console.log('Check the summary above for detailed metrics');
  console.log('Key metrics to review:');
  console.log('  - http_req_duration (p95)');
  console.log('  - http_req_duration (p99)');
  console.log('  - http_req_failed (rate)');
  console.log('  - iterations (total requests)');
  console.log('===========================================\n');
}
