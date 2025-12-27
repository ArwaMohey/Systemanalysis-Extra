# System Architecture

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    PERFORMANCE TEST (k6)                     │
│                                                               │
│  • 100 Requests/Second                                        │
│  • 5 Minutes Duration                                         │
│  • Enforces p95 < 200ms                                       │
└──────────────────────┬──────────────────────────────────────┘
                       │ HTTP GET /api/user/:id
                       ▼
┌─────────────────────────────────────────────────────────────┐
│                  EXPRESS.JS WEB SERVER                       │
│                       (Port 3000)                            │
│                                                               │
│  Endpoints:                                                   │
│  • GET /api/user/:id  → User Profile Fetch                   │
│  • GET /api/health    → Health Check                         │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│                    ROUTE HANDLER                             │
│                   (routes.js)                                │
│                                                               │
│  • Request Validation                                         │
│  • Error Handling                                             │
│  • Response Formatting                                        │
└──────────────────────┬──────────────────────────────────────┘
                       │ O(1) Lookup
                       ▼
┌─────────────────────────────────────────────────────────────┐
│                  IN-MEMORY CACHE                             │
│                    (cache.js)                                │
│                                                               │
│  • JavaScript Map (Hash Table)                                │
│  • 1,000 User Profiles Pre-loaded                            │
│  • Cache Warmed at Startup                                    │
│  • Zero I/O Latency                                           │
└─────────────────────────────────────────────────────────────┘
```

## Request Flow

```
Client Request
     │
     ├─→ HTTP GET /api/user/123
     │
     ▼
Express.js Router
     │
     ├─→ Parse user ID from URL
     ├─→ Validate input (is numeric? > 0?)
     │
     ▼
Route Handler (routes.js)
     │
     ├─→ Call cache.getUserProfile(123)
     │
     ▼
In-Memory Cache (cache.js)
     │
     ├─→ Map.get(123)  ← O(1) operation
     ├─→ Returns user object or null
     │
     ▼
Response Generation
     │
     ├─→ Found: { id, name, email }  → 200 OK
     └─→ Not Found: { error }        → 404 Not Found
```

## Data Flow

```
Application Startup
        │
        ▼
┌──────────────────┐
│ Cache Warming    │
│                  │
│ Loop: 1 to 1000  │
│  Map.set(i, {    │
│    id: i,        │
│    name: UserI,  │
│    email: ...    │
│  })              │
└────────┬─────────┘
         │
         ▼
    Cache Ready
    (1000 users)
         │
         ▼
   Server Starts
   (Listening on :3000)
```

## Low-Latency Design Pattern Implementation

```
┌─────────────────────────────────────────────────────────────┐
│  DESIGN PATTERN 1: In-Memory Caching                        │
│                                                               │
│  Problem:  Database queries add 10-100ms latency             │
│  Solution: Store all data in RAM                             │
│  Result:   O(1) access time, ~0.001ms lookup                 │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│  DESIGN PATTERN 2: Cache Warming                            │
│                                                               │
│  Problem:  Cold start causes inconsistent latency            │
│  Solution: Pre-load cache at application startup             │
│  Result:   First request as fast as 1000th request           │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│  DESIGN PATTERN 3: No Blocking Operations                   │
│                                                               │
│  Problem:  Async I/O adds scheduling overhead                │
│  Solution: Synchronous in-memory reads                       │
│  Result:   Predictable execution path                        │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│  DESIGN PATTERN 4: Tail Latency Optimization                │
│                                                               │
│  Problem:  p99 latency spikes hurt user experience           │
│  Solution: Consistent code path, no external deps            │
│  Result:   Tight latency distribution, low p95/p99           │
└─────────────────────────────────────────────────────────────┘
```

## Performance Characteristics

```
Latency Distribution (Expected)
    
     │
100% │░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░  p99: ~10ms
     │░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░
 95% │░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░       p95: ~5ms
     │░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░
 90% │░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░             p90: ~4ms
     │░░░░░░░░░░░░░░░░░░░░░░░░░░░░
 50% │░░░░░░░░░░░░░░                             p50: ~2ms
     │░░░░░░░░░░░░
  0% │░░░░░░░░░                                  min: ~1ms
     └────────────────────────────────────────→
      0ms     50ms    100ms   150ms   200ms
                                        ↑
                            Requirement Threshold
```

## Technology Stack Layers

```
┌────────────────────────────────────┐
│     Load Testing Layer             │  k6 (JavaScript-based)
├────────────────────────────────────┤
│     Application Layer              │  Express.js 4.18
├────────────────────────────────────┤
│     Runtime Layer                  │  Node.js (v14+)
├────────────────────────────────────┤
│     Operating System               │  Linux/macOS/Windows
└────────────────────────────────────┘
```

## Component Dependencies

```
server.js
    │
    ├─→ Imports: express, cache, routes
    ├─→ Initializes: Express app
    ├─→ Calls: cache.warmCache()
    └─→ Starts: HTTP server
    
routes.js
    │
    ├─→ Imports: express, cache
    ├─→ Defines: GET /api/user/:id
    ├─→ Defines: GET /api/health
    └─→ Exports: Express router
    
cache.js
    │
    ├─→ Implements: UserProfileCache class
    ├─→ Methods: warmCache(), getUserProfile()
    └─→ Exports: Singleton instance
```

## Scalability Considerations

```
Current Implementation (Single Node)
┌──────────────────┐
│   Node Process   │  100 RPS
│   In-Memory      │
└──────────────────┘

Horizontal Scaling (Future)
┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐
│   Node Process   │  │   Node Process   │  │   Node Process   │
│   In-Memory      │  │   In-Memory      │  │   In-Memory      │
└────────┬─────────┘  └────────┬─────────┘  └────────┬─────────┘
         │                     │                     │
         └─────────────────────┼─────────────────────┘
                               │
                        ┌──────▼──────┐
                        │ Load Balance │ → 1000+ RPS
                        └─────────────┘

Shared Cache (Alternative)
┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐
│   Node Process   │  │   Node Process   │  │   Node Process   │
└────────┬─────────┘  └────────┬─────────┘  └────────┬─────────┘
         │                     │                     │
         └─────────────────────┼─────────────────────┘
                               │
                        ┌──────▼──────┐
                        │    Redis    │ → Shared cache
                        └─────────────┘
```

## Performance Monitoring Points

```
┌─────────────┐     ┌──────────────┐     ┌─────────────┐
│   Client    │────→│   Network    │────→│   Server    │
│             │     │              │     │             │
│ Metrics:    │     │ Metrics:     │     │ Metrics:    │
│ • Response  │     │ • RTT        │     │ • CPU       │
│ • Status    │     │ • Bandwidth  │     │ • Memory    │
│ • Latency   │     │ • Packet Loss│     │ • Latency   │
└─────────────┘     └──────────────┘     └──────┬──────┘
                                                 │
                                          ┌──────▼──────┐
                                          │    Cache    │
                                          │             │
                                          │ Metrics:    │
                                          │ • Hit Rate  │
                                          │ • Size      │
                                          │ • Evictions │
                                          └─────────────┘
```

## Key Performance Indicators (KPIs)

```
Primary KPI:
  p95 Latency < 200ms
  │
  ├─ Measured by: k6 http_req_duration p(95)
  ├─ Target: < 200ms
  └─ Expected: < 50ms

Secondary KPIs:
  • p99 Latency < 500ms
  • Error Rate < 1%
  • Throughput ≥ 100 RPS
  • Availability > 99.9%
```

---

## File Structure

```
Systemanalysis-Extra/
│
├── src/
│   ├── server.js          # Application entry point
│   ├── routes.js          # API routes and handlers
│   └── cache.js           # In-memory cache implementation
│
├── performance-tests/
│   └── user-profile-load-test.js  # k6 performance test
│
├── README.md              # Project overview
├── QUICK_START.md         # Quick start guide
├── EXECUTION_GUIDE.md     # Detailed execution instructions
├── PERFORMANCE_REPORT_TEMPLATE.md  # Report template
├── ARCHITECTURE.md        # This file
│
├── package.json           # Node.js dependencies
└── .gitignore            # Git ignore rules
```

---

**Design Philosophy:** Optimize for the common case (p50), guarantee the tail case (p95), monitor the worst case (p99)
