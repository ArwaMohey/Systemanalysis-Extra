# User Profile Fetch Component - Execution Guide

This guide provides step-by-step instructions for running the User Profile Fetch Component and executing performance tests.

---

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [Backend Component Setup](#backend-component-setup)
3. [Running the Backend Component](#running-the-backend-component)
4. [Executing the k6 Performance Test](#executing-the-k6-performance-test)
5. [Collecting Latency Metrics](#collecting-latency-metrics)
6. [Filling the Performance Report](#filling-the-performance-report)
7. [Troubleshooting](#troubleshooting)

---

## Prerequisites

Before you begin, ensure you have the following installed:

### Required Software

1. **Node.js** (v14 or higher)
   ```bash
   # Check Node.js version
   node --version
   
   # If not installed, download from: https://nodejs.org/
   ```

2. **npm** (comes with Node.js)
   ```bash
   # Check npm version
   npm --version
   ```

3. **k6** (Load Testing Tool)
   ```bash
   # Check k6 version
   k6 version
   
   # If not installed:
   # macOS (using Homebrew)
   brew install k6
   
   # Linux (Debian/Ubuntu)
   sudo gpg -k
   sudo gpg --no-default-keyring --keyring /usr/share/keyrings/k6-archive-keyring.gpg --keyserver hkp://keyserver.ubuntu.com:80 --recv-keys C5AD17C747E3415A3642D57D77C6C491D6AC1D69
   echo "deb [signed-by=/usr/share/keyrings/k6-archive-keyring.gpg] https://dl.k6.io/deb stable main" | sudo tee /etc/apt/sources.list.d/k6.list
   sudo apt-get update
   sudo apt-get install k6
   
   # Windows (using Chocolatey)
   choco install k6
   
   # Or download from: https://k6.io/docs/getting-started/installation/
   ```

### System Requirements
- **RAM:** Minimum 2GB available
- **CPU:** 2 cores or more recommended
- **Disk Space:** 100MB free space
- **Network:** Port 3000 available (or configure custom port)

---

## Backend Component Setup

### Step 1: Navigate to Project Directory
```bash
cd /path/to/Systemanalysis-Extra
```

### Step 2: Install Dependencies
```bash
npm install
```

This will install:
- `express`: Web framework for Node.js
- All other required dependencies

### Step 3: Verify Installation
```bash
# Check that node_modules directory was created
ls -la node_modules/

# Verify express was installed
npm list express
```

---

## Running the Backend Component

### Step 1: Start the Server

**Method 1: Using npm script (Recommended)**
```bash
npm start
```

**Method 2: Direct Node.js execution**
```bash
node src/server.js
```

### Step 2: Verify Server is Running

You should see output similar to:
```
========================================
User Profile Service - Starting
========================================
[Cache] Starting cache warming...
[Cache] Cache warmed with 1000 users in Xms

[Server] Listening on port 3000
[Server] Health check: http://localhost:3000/api/health
[Server] User endpoint: http://localhost:3000/api/user/:id
========================================
```

### Step 3: Test the Endpoint

**Test health endpoint:**
```bash
curl http://localhost:3000/api/health
```

Expected response:
```json
{
  "status": "healthy",
  "cache": {
    "size": 1000,
    "initialized": true
  },
  "timestamp": "2024-XX-XXTXX:XX:XX.XXXZ"
}
```

**Test user endpoint:**
```bash
curl http://localhost:3000/api/user/1
```

Expected response:
```json
{
  "id": 1,
  "name": "User1",
  "email": "user1@example.com"
}
```

**Test invalid user ID:**
```bash
curl http://localhost:3000/api/user/9999
```

Expected response (404):
```json
{
  "error": "User not found"
}
```

### Step 4: Keep Server Running

**IMPORTANT:** Keep the server running in this terminal. You will execute the k6 test in a separate terminal window.

---

## Executing the k6 Performance Test

### Step 1: Open a New Terminal Window

Keep the backend server running and open a second terminal.

### Step 2: Navigate to Project Directory
```bash
cd /path/to/Systemanalysis-Extra
```

### Step 3: Run the Performance Test

**Basic execution (console output only):**
```bash
k6 run performance-tests/user-profile-load-test.js
```

**With JSON output for detailed analysis:**
```bash
k6 run --out json=k6-results.json performance-tests/user-profile-load-test.js
```

**With custom base URL (if not using localhost:3000):**
```bash
k6 run -e BASE_URL=http://localhost:8080 performance-tests/user-profile-load-test.js
```

### Step 4: Monitor Test Execution

The test will:
1. Run a health check on the server
2. Execute a 5-minute load test at 100 RPS
3. Display real-time progress
4. Show summary statistics at the end

**Expected console output during test:**
```
===========================================
k6 Performance Test - User Profile Service
===========================================
Target: http://localhost:3000
Load: 100 RPS
Duration: 5 minutes
Threshold: p95 < 200ms
===========================================

✓ Server health check passed
✓ Starting load test...

running (5m00.0s), 00/10 VUs, 30000 complete and 0 interrupted iterations
constant_load ✓ [======================================] 10/50 VUs  5m0s  100.00 iters/s

[... test progress ...]
```

### Step 5: Wait for Completion

The test will run for **5 minutes (300 seconds)**. Do not interrupt the test to ensure accurate results.

---

## Collecting Latency Metrics

### After Test Completion

When the test finishes, k6 will display a comprehensive summary. **Save this output** for your performance report.

### Key Metrics to Collect

#### 1. HTTP Request Duration (Latency)
```
http_req_duration....: avg=XXms min=XXms med=XXms max=XXms p(90)=XXms p(95)=XXms
```

**Collect these values:**
- `avg`: Average latency
- `min`: Minimum latency
- `med`: Median (p50) latency
- `max`: Maximum latency
- `p(90)`: 90th percentile latency
- `p(95)`: **95th percentile latency (PRIMARY METRIC)**
- `p(99)`: 99th percentile latency (if shown)

#### 2. Throughput Metrics
```
iterations...........: XXXXX
http_reqs............: XXXXX
http_req_failed......: X.XX%
```

**Collect these values:**
- Total number of iterations
- Total HTTP requests
- HTTP request failure rate

#### 3. Threshold Results
```
✓ http_req_duration...: p(95)<200
✓ http_req_failed.....: rate<0.01
```

**Note:** Check marks (✓) indicate passed thresholds, X marks indicate failures.

### Saving Test Results

#### Method 1: Copy Console Output
1. Select and copy the entire summary section from the console
2. Paste into a text file: `test-results.txt`

#### Method 2: Use JSON Output (Recommended)
If you ran with `--out json=k6-results.json`:
```bash
# View summary from JSON
k6 inspect k6-results.json

# Or parse with jq (if installed)
cat k6-results.json | jq -r 'select(.type=="Point" and .metric=="http_req_duration") | .data.value' | sort -n
```

#### Method 3: Take Screenshots
1. Take a screenshot of the k6 summary output
2. Save as `k6-test-results-screenshot.png`

### System Information to Collect

**Collect this information about your test environment:**

```bash
# Operating System
uname -a

# Node.js version
node --version

# npm version
npm --version

# k6 version
k6 version

# CPU information
# Linux/macOS:
lscpu
# or
sysctl -n machdep.cpu.brand_string

# Memory information
# Linux:
free -h
# macOS:
vm_stat
```

---

## Filling the Performance Report

### Step 1: Open the Report Template
```bash
# Copy the template to create your report
cp PERFORMANCE_REPORT_TEMPLATE.md PERFORMANCE_REPORT.md

# Open in your text editor
code PERFORMANCE_REPORT.md  # VS Code
# or
nano PERFORMANCE_REPORT.md  # Terminal editor
```

### Step 2: Fill in Each Section

Follow this systematic approach to fill the report:

#### Section 1: Introduction
1. Fill in the date and author name
2. Describe the purpose (testing the User Profile Fetch Component)
3. Define the scope (100 RPS, 5 minutes, p95 < 200ms)
4. List the specific requirements

#### Section 2: Architecture
1. Describe the technology stack:
   - Runtime: Node.js (your version)
   - Framework: Express.js v4.18.2
   - Cache: In-memory Map
   - Load Testing: k6 (your version)
2. Explain the component responsibility
3. Describe the data structure

#### Section 3: Low-Latency Design Patterns
1. **In-Memory Caching:**
   - Explain the Map-based cache
   - Mention O(1) lookup time
   - Describe the 1000-user dataset

2. **Cache Warming:**
   - Explain startup initialization
   - Mention the cache warming log output
   - Note the warming duration from server startup

3. **Minimize Blocking Operations:**
   - No database calls during requests
   - Synchronous cache access
   - Direct memory reads

4. **Tail Latency Optimization:**
   - Predictable execution path
   - No external dependencies
   - Consistent performance

#### Section 4: Test Configuration

**Fill in Test Environment table:**
| Parameter | Value |
|-----------|-------|
| Operating System | [Your OS from `uname -a`] |
| CPU | [Your CPU info] |
| Memory | [Your RAM info] |
| Node.js Version | [From `node --version`] |
| k6 Version | [From `k6 version`] |

**Fill in Load Profile table:**
| Parameter | Value |
|-----------|-------|
| Request Rate | 100 RPS |
| Test Duration | 5 minutes (300 seconds) |
| Total Requests | ~30,000 requests |
| Virtual Users | 10 (pre-allocated) |
| Ramp-up Time | Immediate (constant rate) |

**Fill in Performance Thresholds:**
Copy the threshold results from k6 output (✓ or X marks)

#### Section 5: Results

**Fill in Latency Metrics table:**
Copy values from k6's `http_req_duration` summary:
| Metric | Value | Unit |
|--------|-------|------|
| Minimum | [min value from k6] | ms |
| Average | [avg value from k6] | ms |
| Median (p50) | [med value from k6] | ms |
| p90 | [p(90) value from k6] | ms |
| **p95** | **[p(95) value from k6]** | **ms** |
| p99 | [p(99) value if shown] | ms |
| Maximum | [max value from k6] | ms |

**Fill in Throughput Metrics table:**
| Metric | Value | Unit |
|--------|-------|------|
| Total Requests | [iterations from k6] | requests |
| Successful Requests | [calculate: total - failed] | requests |
| Failed Requests | [http_req_failed count] | requests |
| Requests per Second (avg) | [should be ~100] | req/s |
| Error Rate | [http_req_failed % from k6] | % |

**Fill in Performance Threshold Analysis:**
- For p95 < 200ms: State whether it passed and the actual value
- For Error Rate < 1%: State whether it passed and the actual rate

#### Section 6: Conclusion

1. **Summary of Findings:**
   - Did the component meet requirements? (Yes/No)
   - What was the actual p95 latency?
   - Overall performance assessment

2. **Performance Objective Achievement:**
   Fill in the actual values and Pass/Fail status

3. **Low-Latency Design Patterns Effectiveness:**
   - Discuss how in-memory caching contributed to low latency
   - Explain how cache warming ensured consistent performance
   - Analyze the impact of avoiding blocking operations

4. **Lessons Learned:**
   - What you learned about performance testing
   - Insights about low-latency system design
   - Any challenges encountered

5. **Future Improvements:**
   - Potential optimizations (e.g., response compression)
   - Scalability considerations (e.g., distributed caching)
   - Additional monitoring suggestions

6. **Final Remarks:**
   - Overall assessment of the component
   - Production readiness statement
   - Academic and professional quality statement

### Step 3: Review and Proofread

1. Ensure all `[TO BE FILLED]` placeholders are replaced
2. Check that all metrics have proper units
3. Verify calculations (e.g., success rate = total - failed)
4. Ensure professional formatting
5. Proofread for spelling and grammar

### Step 4: Add Optional Enhancements

**Optional additions:**
- Add an architecture diagram (using tools like draw.io, Lucidchart)
- Include latency distribution graphs (can be created from k6 JSON output)
- Add the raw k6 output to the Appendix
- Include server configuration details

---

## Troubleshooting

### Server Issues

**Problem: Port 3000 already in use**
```bash
# Solution 1: Use a different port
PORT=8080 npm start

# Solution 2: Find and kill the process using port 3000
# Linux/macOS:
lsof -ti:3000 | xargs kill -9

# Windows:
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

**Problem: Module not found errors**
```bash
# Solution: Reinstall dependencies
rm -rf node_modules
npm install
```

**Problem: Server crashes or hangs**
```bash
# Solution: Check Node.js memory
# Start with increased memory if needed
node --max-old-space-size=4096 src/server.js
```

### k6 Test Issues

**Problem: k6 command not found**
```bash
# Verify k6 installation
which k6

# Reinstall k6 if needed (see Prerequisites section)
```

**Problem: Test fails immediately**
```bash
# Verify server is running
curl http://localhost:3000/api/health

# Check server logs in the other terminal
# Restart server if needed
```

**Problem: High error rates during test**
- Check server logs for errors
- Verify system has enough resources (CPU, memory)
- Reduce load if system cannot handle 100 RPS
- Check network connectivity

**Problem: Test timeout or hangs**
```bash
# Interrupt the test: Ctrl+C
# Check if server is responsive
curl http://localhost:3000/api/health

# Restart both server and test
```

### Performance Issues

**Problem: p95 latency exceeds 200ms**

Potential causes and solutions:
1. **Insufficient system resources:**
   - Close other applications
   - Use a more powerful machine
   - Reduce background processes

2. **Cold start issues:**
   - Ensure cache warming completed
   - Check server startup logs
   - Verify cache was initialized

3. **Network latency:**
   - Test locally (localhost) to eliminate network factors
   - Check for network congestion

4. **System under load:**
   - Monitor CPU usage during test
   - Monitor memory usage during test
   - Consider reducing virtual users in k6 config

### Metric Collection Issues

**Problem: Missing metrics in k6 output**
```bash
# Use JSON output for complete data
k6 run --out json=k6-results.json performance-tests/user-profile-load-test.js

# Parse JSON for specific metrics
cat k6-results.json | grep "http_req_duration"
```

**Problem: Cannot calculate percentiles**
```bash
# k6 calculates percentiles automatically
# Check the summary section at the end of the test
# Look for: p(90)=XXms p(95)=XXms p(99)=XXms
```

---

## Additional Resources

### k6 Documentation
- Official k6 docs: https://k6.io/docs/
- k6 metrics reference: https://k6.io/docs/using-k6/metrics/
- k6 thresholds: https://k6.io/docs/using-k6/thresholds/

### Performance Testing Best Practices
- Monitor system resources during tests (CPU, memory, disk, network)
- Run tests multiple times to ensure consistency
- Document any anomalies or outliers
- Compare results across different test runs

### Academic References
- "The Tail at Scale" by Jeffrey Dean and Luiz André Barroso
- "Low-Latency Systems: Architecture and Design Patterns"
- Performance testing methodologies and standards

---

## Summary Checklist

Use this checklist to ensure you've completed all steps:

- [ ] Installed Node.js and npm
- [ ] Installed k6
- [ ] Installed project dependencies (`npm install`)
- [ ] Started the backend server (`npm start`)
- [ ] Verified server is running (health check)
- [ ] Tested user endpoint manually
- [ ] Ran k6 performance test for 5 minutes
- [ ] Collected all latency metrics from k6 output
- [ ] Collected system information
- [ ] Saved test results (console output or JSON)
- [ ] Copied report template to PERFORMANCE_REPORT.md
- [ ] Filled in all sections of the report
- [ ] Replaced all `[TO BE FILLED]` placeholders
- [ ] Reviewed and proofread the report
- [ ] Verified all metrics and calculations
- [ ] Added optional enhancements (diagrams, graphs)
- [ ] Report is ready for submission

---

**End of Execution Guide**

For questions or issues not covered in this guide, refer to the project documentation or contact the course instructor.
