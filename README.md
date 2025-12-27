# User Profile Fetch Component - Performance Testing Project

[![Node.js](https://img.shields.io/badge/Node.js-v14+-green.svg)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-4.18-blue.svg)](https://expressjs.com/)
[![k6](https://img.shields.io/badge/k6-Load%20Testing-purple.svg)](https://k6.io/)

A high-performance backend component implementing a User Profile Fetch service, optimized for low latency with comprehensive performance testing.

**Course:** System Analysis and Design  
**Objective:** Demonstrate p95 response time < 200ms under 100 requests per second

---

## Overview

This project implements a production-grade backend component with professional performance testing setup. The component serves read-only user profile data through a RESTful API endpoint, applying low-latency design patterns to achieve consistent sub-200ms response times at the 95th percentile under sustained load.

### Key Features

- ✅ **Low-Latency API**: GET /api/user/:id endpoint optimized for speed
- ✅ **In-Memory Caching**: O(1) lookup time with cache warming
- ✅ **Performance Testing**: Comprehensive k6 test suite with threshold enforcement
- ✅ **Production-Ready**: Professional code structure and error handling
- ✅ **Academic Quality**: Detailed documentation and performance report template

---

## Architecture

### Technology Stack

| Component | Technology | Purpose |
|-----------|-----------|---------|
| **Runtime** | Node.js | JavaScript runtime environment |
| **Framework** | Express.js | Lightweight web framework |
| **Cache** | In-Memory Map | Zero-latency data access |
| **Testing** | k6 | Load and performance testing |

### Low-Latency Design Patterns

1. **In-Memory Caching**
   - All user data stored in memory for O(1) access
   - No database calls during request handling
   - Predictable performance characteristics

2. **Cache Warming at Startup**
   - Data pre-loaded when application starts
   - Eliminates cold-start latency
   - Ensures consistent performance from first request

3. **Minimize Blocking Operations**
   - Pure in-memory operations for reads
   - No async overhead for cache access
   - Synchronous request pipeline

4. **Tail Latency Optimization**
   - Focus on p95 and p99 metrics
   - No external dependencies during requests
   - Consistent execution path

---

## Project Structure

```
Systemanalysis-Extra/
├── src/
│   ├── server.js           # Main application entry point
│   ├── routes.js           # API route definitions
│   └── cache.js            # In-memory cache implementation
├── performance-tests/
│   └── user-profile-load-test.js  # k6 performance test script
├── package.json            # Project dependencies and scripts
├── .gitignore             # Git ignore rules
├── README.md              # This file
├── EXECUTION_GUIDE.md     # Step-by-step execution instructions
└── PERFORMANCE_REPORT_TEMPLATE.md  # Empty report template
```

---

## Quick Start

### Prerequisites

- Node.js (v14 or higher)
- npm (comes with Node.js)
- k6 (for performance testing)

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd Systemanalysis-Extra

# Install dependencies
npm install
```

### Running the Server

```bash
# Start the backend component
npm start
```

The server will:
1. Warm the cache with 1000 user profiles
2. Start listening on port 3000
3. Display startup information

### Testing the API

```bash
# Health check
curl http://localhost:3000/api/health

# Fetch user profile
curl http://localhost:3000/api/user/1

# Test with invalid ID
curl http://localhost:3000/api/user/9999
```

### Running Performance Tests

```bash
# In a separate terminal (keep server running)
k6 run performance-tests/user-profile-load-test.js
```

The test will:
- Run for 5 minutes
- Send 100 requests per second
- Validate p95 < 200ms threshold
- Display detailed metrics

---

## API Documentation

### Endpoints

#### GET /api/user/:id

Fetch user profile by ID.

**Parameters:**
- `id` (path parameter): User ID (integer, 1-1000)

**Response (200 OK):**
```json
{
  "id": 1,
  "name": "User1",
  "email": "user1@example.com"
}
```

**Response (404 Not Found):**
```json
{
  "error": "User not found"
}
```

**Response (400 Bad Request):**
```json
{
  "error": "Invalid user ID"
}
```

#### GET /api/health

Health check and cache status.

**Response (200 OK):**
```json
{
  "status": "healthy",
  "cache": {
    "size": 1000,
    "initialized": true
  },
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

---

## Performance Testing

### Test Configuration

| Parameter | Value |
|-----------|-------|
| **Load** | 100 requests/second |
| **Duration** | 5 minutes (300 seconds) |
| **Total Requests** | ~30,000 requests |
| **Threshold** | p95 < 200ms |
| **Tool** | k6 Load Testing |

### Test Execution

```bash
# Basic test
k6 run performance-tests/user-profile-load-test.js

# With JSON output for analysis
k6 run --out json=k6-results.json performance-tests/user-profile-load-test.js

# With custom server URL
k6 run -e BASE_URL=http://localhost:8080 performance-tests/user-profile-load-test.js
```

### Performance Thresholds

The k6 test enforces the following thresholds:

- ✅ `http_req_duration`: p(95) < 200ms (PRIMARY REQUIREMENT)
- ✅ `http_req_duration`: p(99) < 500ms
- ✅ `http_req_failed`: rate < 1%
- ✅ `errors`: rate < 1%

---

## Documentation

### Detailed Guides

1. **[EXECUTION_GUIDE.md](EXECUTION_GUIDE.md)**
   - Complete setup instructions
   - Step-by-step test execution
   - Metrics collection guide
   - Troubleshooting tips

2. **[PERFORMANCE_REPORT_TEMPLATE.md](PERFORMANCE_REPORT_TEMPLATE.md)**
   - Empty report template with all sections
   - Instructions for filling each section
   - Professional format for academic submission

### Filling the Performance Report

1. Run the backend component
2. Execute the k6 performance test
3. Collect metrics from k6 output
4. Copy the template: `cp PERFORMANCE_REPORT_TEMPLATE.md PERFORMANCE_REPORT.md`
5. Fill in all `[TO BE FILLED]` sections with actual test results
6. Review and proofread

**Important:** Do NOT fabricate or estimate metrics. All values must come from actual test execution.

---

## Development

### Code Structure

**src/cache.js**
- UserProfileCache class implementation
- Cache warming logic
- O(1) lookup operations

**src/routes.js**
- Express route handlers
- Request validation
- Response formatting

**src/server.js**
- Application initialization
- Cache warming orchestration
- Server startup

### Adding More Users

To increase the user dataset, edit `src/cache.js`:

```javascript
// Current: 1000 users
for (let i = 1; i <= 1000; i++) {
  // ...
}

// To add more:
for (let i = 1; i <= 10000; i++) {
  // ...
}
```

### Customizing Performance Tests

Edit `performance-tests/user-profile-load-test.js` to adjust:
- Request rate: `rate: 100`
- Duration: `duration: '5m'`
- Thresholds: `'p(95)<200'`
- Virtual users: `preAllocatedVUs: 10`

---

## Performance Optimization Tips

### System-Level Optimizations

1. **Run on dedicated hardware** - Avoid shared/virtualized environments
2. **Disable unnecessary services** - Free up CPU and memory
3. **Use production mode** - Set `NODE_ENV=production`
4. **Increase file descriptors** - `ulimit -n 65536` on Linux/macOS

### Application-Level Optimizations

1. **Response compression** - Enable gzip for larger responses
2. **Connection pooling** - Reuse HTTP connections
3. **Async logging** - Don't block requests for logging
4. **Health check optimization** - Cache health check data

### Already Implemented

- ✅ In-memory caching (O(1) lookups)
- ✅ Cache warming at startup
- ✅ No blocking I/O during requests
- ✅ Minimal middleware stack
- ✅ Synchronous cache access

---

## Monitoring and Metrics

### Key Metrics to Monitor

**Latency Metrics:**
- p50 (median)
- p90 (90th percentile)
- p95 (95th percentile) - PRIMARY METRIC
- p99 (99th percentile)
- max (maximum)

**Throughput Metrics:**
- Requests per second (RPS)
- Total requests
- Success rate
- Error rate

**System Metrics:**
- CPU usage
- Memory usage
- Network I/O
- Process uptime

### Collecting Metrics

k6 automatically collects and displays all key metrics at the end of each test run.

---

## Best Practices

### Performance Testing

1. ✅ Run tests on stable, consistent hardware
2. ✅ Close unnecessary applications during testing
3. ✅ Run multiple test iterations for consistency
4. ✅ Monitor system resources during tests
5. ✅ Document test environment details
6. ✅ Save raw test output for reference

### Report Writing

1. ✅ Use actual measured values, never estimates
2. ✅ Include test environment specifications
3. ✅ Explain design decisions and trade-offs
4. ✅ Analyze threshold pass/fail results
5. ✅ Provide clear conclusions
6. ✅ Maintain professional formatting

---

## Troubleshooting

### Common Issues

**Port already in use:**
```bash
PORT=8080 npm start
```

**Module not found:**
```bash
rm -rf node_modules && npm install
```

**k6 test fails immediately:**
1. Verify server is running: `curl http://localhost:3000/api/health`
2. Check server logs for errors
3. Restart server if needed

**High latency or timeouts:**
1. Check system resources (CPU, memory)
2. Close other applications
3. Verify cache was warmed (check server logs)
4. Consider reducing load (edit k6 script)

For detailed troubleshooting, see [EXECUTION_GUIDE.md](EXECUTION_GUIDE.md).

---

## Academic Context

### Course Requirements

This project fulfills the requirements for:
- System Analysis and Design course
- Performance engineering principles
- Low-latency system design
- Professional software development

### Learning Objectives

Students will demonstrate:
1. Understanding of low-latency design patterns
2. Ability to implement performance-optimized components
3. Proficiency with performance testing tools
4. Skills in technical writing and reporting
5. Application of academic research to practical systems

### Grading Criteria

Components evaluated:
- ✅ Backend implementation quality
- ✅ Performance test configuration
- ✅ Achievement of p95 < 200ms requirement
- ✅ Report completeness and professionalism
- ✅ Code organization and documentation

---

## References

### Low-Latency System Design

- Dean, J., & Barroso, L. A. (2013). "The Tail at Scale." Communications of the ACM, 56(2), 74-80.
- [Design patterns for low-latency systems](https://mechanical-sympathy.blogspot.com/)
- [High Performance Browser Networking](https://hpbn.co/)

### Performance Testing

- [k6 Documentation](https://k6.io/docs/)
- [Load Testing Best Practices](https://k6.io/docs/testing-guides/test-types/)
- [Percentile calculations and interpretation](https://www.elastic.co/blog/averages-can-dangerous-use-percentile)

---

## License

MIT License - See LICENSE file for details

---

## Contributing

This is an academic project. For questions or improvements:
1. Fork the repository
2. Create a feature branch
3. Submit a pull request with clear description

---

## Authors

- **Course:** System Analysis and Design
- **Institution:** [Your Institution]
- **Semester:** [Your Semester]

---

## Acknowledgments

- Express.js team for the excellent web framework
- k6 team for the powerful load testing tool
- Academic research on low-latency systems

---

**Built with ❤️ for academic excellence and practical learning**
