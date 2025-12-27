# Quick Start Guide - User Profile Fetch Component

## 🚀 Get Started in 3 Minutes

### Step 1: Install Dependencies (30 seconds)
```bash
npm install
```

### Step 2: Start Backend Server (10 seconds)
```bash
npm start
```

You should see:
```
========================================
User Profile Service - Starting
========================================
[Cache] Cache warmed with 1000 users in 0ms
[Server] Listening on port 3000
========================================
```

### Step 3: Test the Endpoint (10 seconds)
```bash
# Health check
curl http://localhost:3000/api/health

# Get user profile
curl http://localhost:3000/api/user/1
```

## 📊 Run Performance Test (5 minutes)

### Install k6 (one-time setup)
```bash
# macOS
brew install k6

# Linux
sudo apt-key adv --keyserver hkp://keyserver.ubuntu.com:80 --recv-keys C5AD17C747E3415A3642D57D77C6C491D6AC1D69
echo "deb https://dl.k6.io/deb stable main" | sudo tee /etc/apt/sources.list.d/k6.list
sudo apt-get update
sudo apt-get install k6

# Windows
choco install k6
```

### Run the Test
Open a **new terminal** (keep server running) and execute:
```bash
k6 run performance-tests/user-profile-load-test.js
```

This will:
- Send 100 requests/second for 5 minutes
- Test p95 < 200ms threshold
- Display comprehensive metrics

## 📝 Complete the Report

1. **Copy template:**
   ```bash
   cp PERFORMANCE_REPORT_TEMPLATE.md PERFORMANCE_REPORT.md
   ```

2. **Fill in metrics from k6 output:**
   - Find the `http_req_duration` section
   - Copy p95, p99, avg, min, max values
   - Fill in all `[TO BE FILLED]` sections

3. **Key sections to complete:**
   - Section 5.1: Latency Metrics (from k6 output)
   - Section 5.2: Throughput Metrics (from k6 output)
   - Section 6: Analysis and conclusions

## 📚 Full Documentation

- **[README.md](README.md)** - Complete project overview
- **[EXECUTION_GUIDE.md](EXECUTION_GUIDE.md)** - Detailed instructions
- **[PERFORMANCE_REPORT_TEMPLATE.md](PERFORMANCE_REPORT_TEMPLATE.md)** - Report template

## ✅ Success Criteria

Your implementation is successful if:
- [x] Backend starts without errors
- [x] Health endpoint returns 200 OK
- [x] User endpoint returns valid JSON
- [x] k6 test shows p95 < 200ms ✓
- [x] All report sections completed

## 🎯 Expected Performance

Based on initial testing:
- Average latency: ~2ms per request
- p95 latency: Expected < 50ms (well below 200ms requirement)
- Throughput: 100 RPS sustained
- Error rate: 0%

## 🔧 Troubleshooting

**Port 3000 in use?**
```bash
PORT=8080 npm start
```

**Module not found?**
```bash
rm -rf node_modules && npm install
```

**k6 test fails?**
- Verify server is running: `curl http://localhost:3000/api/health`
- Check server terminal for errors
- Restart server if needed

## 📞 Need Help?

See detailed troubleshooting in [EXECUTION_GUIDE.md](EXECUTION_GUIDE.md).

---

**Made for academic excellence** 🎓
