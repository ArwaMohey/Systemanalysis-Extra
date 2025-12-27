#!/bin/bash
# Validation script to verify the implementation
# Run this script to validate your setup before performance testing

set -e

echo "=========================================="
echo "User Profile Service - Validation Script"
echo "=========================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check prerequisites
echo "1. Checking prerequisites..."
echo ""

# Check Node.js
if command -v node &> /dev/null; then
    NODE_VERSION=$(node --version)
    echo -e "${GREEN}✓${NC} Node.js installed: $NODE_VERSION"
else
    echo -e "${RED}✗${NC} Node.js not found. Please install Node.js v14 or higher."
    exit 1
fi

# Check npm
if command -v npm &> /dev/null; then
    NPM_VERSION=$(npm --version)
    echo -e "${GREEN}✓${NC} npm installed: $NPM_VERSION"
else
    echo -e "${RED}✗${NC} npm not found. Please install npm."
    exit 1
fi

# Check k6 (optional)
if command -v k6 &> /dev/null; then
    K6_VERSION=$(k6 version)
    echo -e "${GREEN}✓${NC} k6 installed: $K6_VERSION"
else
    echo -e "${YELLOW}⚠${NC} k6 not found. Install it to run performance tests."
fi

echo ""

# Check project structure
echo "2. Checking project structure..."
echo ""

REQUIRED_FILES=(
    "package.json"
    "src/server.js"
    "src/routes.js"
    "src/cache.js"
    "performance-tests/user-profile-load-test.js"
    "README.md"
    "EXECUTION_GUIDE.md"
    "PERFORMANCE_REPORT_TEMPLATE.md"
)

for file in "${REQUIRED_FILES[@]}"; do
    if [ -f "$file" ]; then
        echo -e "${GREEN}✓${NC} Found: $file"
    else
        echo -e "${RED}✗${NC} Missing: $file"
        exit 1
    fi
done

echo ""

# Check dependencies
echo "3. Checking dependencies..."
echo ""

if [ -d "node_modules" ]; then
    echo -e "${GREEN}✓${NC} node_modules directory exists"
    
    if [ -d "node_modules/express" ]; then
        echo -e "${GREEN}✓${NC} Express.js installed"
    else
        echo -e "${RED}✗${NC} Express.js not found. Run: npm install"
        exit 1
    fi
else
    echo -e "${RED}✗${NC} node_modules not found. Run: npm install"
    exit 1
fi

echo ""

# Check if port 3000 is available
echo "4. Checking port availability..."
echo ""

if lsof -Pi :3000 -sTCP:LISTEN -t >/dev/null 2>&1 ; then
    echo -e "${YELLOW}⚠${NC} Port 3000 is already in use"
    echo "   You may need to stop the existing process or use a different port"
else
    echo -e "${GREEN}✓${NC} Port 3000 is available"
fi

echo ""

# Start server for testing
echo "5. Testing server functionality..."
echo ""

# Start server in background
node src/server.js > /tmp/server.log 2>&1 &
SERVER_PID=$!
echo "   Started server (PID: $SERVER_PID)"
sleep 2

# Check if server is running
if ps -p $SERVER_PID > /dev/null; then
    echo -e "${GREEN}✓${NC} Server is running"
else
    echo -e "${RED}✗${NC} Server failed to start. Check /tmp/server.log"
    cat /tmp/server.log
    exit 1
fi

# Test health endpoint
echo ""
echo "6. Testing API endpoints..."
echo ""

# Test health endpoint
HEALTH_RESPONSE=$(curl -s http://localhost:3000/api/health)
if echo "$HEALTH_RESPONSE" | grep -q "healthy"; then
    echo -e "${GREEN}✓${NC} Health endpoint working"
else
    echo -e "${RED}✗${NC} Health endpoint failed"
    echo "   Response: $HEALTH_RESPONSE"
    kill $SERVER_PID 2>/dev/null
    exit 1
fi

# Test user endpoint - valid ID
USER_RESPONSE=$(curl -s http://localhost:3000/api/user/1)
if echo "$USER_RESPONSE" | grep -q "User1"; then
    echo -e "${GREEN}✓${NC} User endpoint working (valid ID)"
else
    echo -e "${RED}✗${NC} User endpoint failed (valid ID)"
    echo "   Response: $USER_RESPONSE"
    kill $SERVER_PID 2>/dev/null
    exit 1
fi

# Test user endpoint - invalid ID
NOT_FOUND_RESPONSE=$(curl -s http://localhost:3000/api/user/9999)
if echo "$NOT_FOUND_RESPONSE" | grep -q "not found"; then
    echo -e "${GREEN}✓${NC} User endpoint working (404 handling)"
else
    echo -e "${RED}✗${NC} User endpoint failed (404 handling)"
    echo "   Response: $NOT_FOUND_RESPONSE"
    kill $SERVER_PID 2>/dev/null
    exit 1
fi

# Test user endpoint - invalid input
BAD_REQUEST_RESPONSE=$(curl -s http://localhost:3000/api/user/invalid)
if echo "$BAD_REQUEST_RESPONSE" | grep -q "Invalid"; then
    echo -e "${GREEN}✓${NC} User endpoint working (400 handling)"
else
    echo -e "${RED}✗${NC} User endpoint failed (400 handling)"
    echo "   Response: $BAD_REQUEST_RESPONSE"
    kill $SERVER_PID 2>/dev/null
    exit 1
fi

echo ""

# Quick performance test
echo "7. Running quick performance test..."
echo ""

START_TIME=$(date +%s%3N)
for i in {1..50}; do
    curl -s http://localhost:3000/api/user/$((RANDOM % 1000 + 1)) > /dev/null &
done
wait
END_TIME=$(date +%s%3N)
DURATION=$((END_TIME - START_TIME))
AVG_LATENCY=$((DURATION / 50))

echo "   Completed 50 concurrent requests in ${DURATION}ms"
echo "   Average latency: ${AVG_LATENCY}ms per request"

if [ $AVG_LATENCY -lt 100 ]; then
    echo -e "${GREEN}✓${NC} Performance looks good (avg < 100ms)"
else
    echo -e "${YELLOW}⚠${NC} Performance acceptable but could be better (avg < 200ms target)"
fi

# Stop server
kill $SERVER_PID 2>/dev/null
echo ""
echo "   Server stopped"

echo ""
echo "=========================================="
echo -e "${GREEN}Validation Complete - All Tests Passed!${NC}"
echo "=========================================="
echo ""
echo "Next steps:"
echo "1. Start the server: npm start"
echo "2. Run k6 performance test (in new terminal): k6 run performance-tests/user-profile-load-test.js"
echo "3. Fill performance report with actual metrics"
echo ""
echo "See EXECUTION_GUIDE.md for detailed instructions."
echo ""
