# Performance Optimization Plan - DocsShelf v7

**Created:** November 27, 2025  
**Status:** In Progress  
**Priority:** High  
**Target:** Meet production performance requirements

---

## 🎯 Performance Requirements (From PRD)

### Critical Metrics
- ✅ **App Launch:** < 2 seconds (cold start)
- ✅ **Search Response:** < 500ms for 10,000+ documents
- ✅ **Animations:** 60fps consistently
- ✅ **Memory Usage:** < 200MB average
- ✅ **Storage Operations:** < 1s for document save/load

---

## 📊 Current Performance Baseline

### To Be Measured:
1. **App Launch Time**
   - Cold start (first launch)
   - Warm start (app in background)
   - Hot start (app in memory)

2. **Search Performance**
   - Empty database
   - 100 documents
   - 1,000 documents
   - 10,000 documents

3. **UI Responsiveness**
   - Frame rate during animations
   - Scroll performance
   - Input lag

4. **Memory Footprint**
   - Idle state
   - Active document viewing
   - Search operations
   - Large file operations

5. **Storage Operations**
   - Document upload time (by size: 1MB, 10MB, 50MB)
   - Document retrieval time
   - Backup creation time
   - Database query time

---

## 🔧 Phase 1: Measurement & Profiling

### Step 1: Add Performance Monitoring

**Create Performance Service:**
```typescript
// src/utils/performance/performanceMonitor.ts
export class PerformanceMonitor {
  // Track app launch time
  // Track operation durations
  // Track memory usage
  // Track frame drops
  // Export performance reports
}
```

**Implementation Tasks:**
- [ ] Create `performanceMonitor.ts` utility
- [ ] Add launch time tracking
- [ ] Add operation timing (search, upload, etc.)
- [ ] Add memory tracking hooks
- [ ] Add FPS monitoring for animations
- [ ] Create performance report export

### Step 2: Measure Current Performance

**Benchmarking Script:**
```typescript
// scripts/benchmark-performance.ts
// Run automated performance tests
// - Populate database with test data
// - Measure search at different data volumes
// - Measure document operations
// - Generate performance report
```

**Tasks:**
- [ ] Create benchmark script
- [ ] Generate test data (100, 1K, 10K documents)
- [ ] Run baseline measurements
- [ ] Document current performance metrics

### Step 3: Identify Bottlenecks

**Analysis Areas:**
- [ ] Profile Redux state updates
- [ ] Profile database queries
- [ ] Profile encryption/decryption operations
- [ ] Profile React component renders
- [ ] Profile list rendering (FlatList optimization)

---

## 🚀 Phase 2: App Launch Optimization

### Current Architecture:
```
Launch → Initialize DB → Load Schema → Verify Integrity → Check User → Navigate
```

### Optimization Strategies:

#### 1. Lazy Database Initialization ⭐ HIGH IMPACT
**Problem:** Database initialized on every launch
**Solution:** Initialize only when needed

```typescript
// Defer database init until user logs in
// Cache schema for faster subsequent checks
// Use SQLite WAL mode for better performance
```

**Expected Improvement:** -500ms to -1s

#### 2. Reduce Initial Bundle Size
**Actions:**
- [ ] Enable Hermes engine (if not already)
- [ ] Code splitting for routes
- [ ] Lazy load screens not needed at launch
- [ ] Optimize image assets

**Expected Improvement:** -200ms to -500ms

#### 3. Splash Screen Optimization
**Actions:**
- [ ] Keep splash screen visible during critical initialization
- [ ] Show progress indicator for long operations
- [ ] Pre-render first screen during init

**Expected Improvement:** Better perceived performance

---

## 🔍 Phase 3: Search Performance Optimization

### Current Implementation:
- SQLite FTS5 full-text search
- Searches across filename, OCR text, tags

### Optimization Strategies:

#### 1. Query Optimization ⭐ HIGH IMPACT
**Tasks:**
- [ ] Add database indexes for common queries
- [ ] Optimize FTS5 tokenization
- [ ] Implement search result pagination (50 results/page)
- [ ] Cache recent search results

```sql
-- Add indexes
CREATE INDEX idx_documents_category ON documents(category_id);
CREATE INDEX idx_documents_favorite ON documents(is_favorite);
CREATE INDEX idx_documents_created ON documents(created_at);
CREATE INDEX idx_documents_updated ON documents(updated_at);
```

**Expected Improvement:** < 100ms for 10K documents

#### 2. Search Debouncing ⭐ MEDIUM IMPACT
**Implementation:**
```typescript
// Debounce search input (300ms)
// Show "Searching..." indicator
// Cancel previous searches
```

**Expected Improvement:** Reduced unnecessary queries

#### 3. Result Limiting
**Tasks:**
- [ ] Limit initial results to 50
- [ ] Implement virtual scrolling for results
- [ ] Add "Load More" pagination

**Expected Improvement:** Faster initial display

---

## 📱 Phase 4: UI/Animation Performance

### Target: 60fps Consistently

#### 1. List Optimization ⭐ HIGH IMPACT
**Document List (FlatList):**
```typescript
// Current issues to fix:
<FlatList
  data={documents}
  renderItem={renderDocument}
  keyExtractor={(item) => item.id.toString()}
  
  // Add these optimizations:
  removeClippedSubviews={true}
  maxToRenderPerBatch={10}
  updateCellsBatchingPeriod={50}
  initialNumToRender={10}
  windowSize={21}
  getItemLayout={(data, index) => ({
    length: ITEM_HEIGHT,
    offset: ITEM_HEIGHT * index,
    index,
  })}
/>
```

**Tasks:**
- [ ] Add FlatList optimizations to document list
- [ ] Add FlatList optimizations to category list
- [ ] Implement virtual scrolling for large lists
- [ ] Memoize list item components

**Expected Improvement:** 60fps scrolling

#### 2. Animation Optimization
**Tasks:**
- [ ] Use `react-native-reanimated` for complex animations
- [ ] Avoid animating expensive properties (e.g., `transform` instead of `top/left`)
- [ ] Use `useNativeDriver: true` for all animations
- [ ] Reduce animation complexity during scroll

**Expected Improvement:** Smooth 60fps animations

#### 3. Image Optimization
**Tasks:**
- [ ] Lazy load thumbnails (off-screen images)
- [ ] Reduce thumbnail size (200px max as defined in config)
- [ ] Use `FastImage` or optimize `Image` component
- [ ] Cache decoded images

**Expected Improvement:** Faster image display, lower memory

---

## 💾 Phase 5: Memory Optimization

### Target: < 200MB Average Usage

#### 1. Image Memory Management ⭐ HIGH IMPACT
**Tasks:**
- [ ] Clear unused image caches
- [ ] Limit number of cached thumbnails (100 max)
- [ ] Release large images when off-screen
- [ ] Use lower quality for thumbnails

**Expected Improvement:** -50MB to -100MB

#### 2. Document List Memory
**Tasks:**
- [ ] Paginate document loading (load 50 at a time)
- [ ] Clear OCR text from memory (load on demand)
- [ ] Release closed document content

**Expected Improvement:** -30MB to -50MB

#### 3. Redux Store Optimization
**Tasks:**
- [ ] Don't store large binary data in Redux
- [ ] Clear old search results
- [ ] Implement state cleanup on unmount
- [ ] Use Redux persist selectively (not everything)

**Expected Improvement:** -20MB to -30MB

---

## 🗄️ Phase 6: Database Performance

### Current: SQLite with encryption

#### 1. Query Optimization ⭐ HIGH IMPACT
**Tasks:**
- [ ] Add missing indexes (see Phase 3)
- [ ] Use prepared statements
- [ ] Batch inserts/updates
- [ ] Optimize JOIN queries

**Expected Improvement:** 2-5x faster queries

#### 2. Connection Management
**Tasks:**
- [ ] Implement connection pooling
- [ ] Use WAL (Write-Ahead Logging) mode
- [ ] Optimize cache size
- [ ] Regular VACUUM operations

```sql
-- Enable WAL mode for better concurrency
PRAGMA journal_mode=WAL;

-- Increase cache size (10MB)
PRAGMA cache_size=-10000;

-- Enable foreign keys
PRAGMA foreign_keys=ON;
```

**Expected Improvement:** Better concurrent access

#### 3. Transaction Optimization
**Tasks:**
- [ ] Batch multiple operations in single transaction
- [ ] Use IMMEDIATE transactions for writes
- [ ] Avoid nested transactions

**Expected Improvement:** 10x faster bulk operations

---

## 📦 Phase 7: Storage Performance

### Document Operations

#### 1. Encryption Optimization ⭐ MEDIUM IMPACT
**Tasks:**
- [ ] Use streaming encryption for large files (> 10MB)
- [ ] Parallelize encryption for multiple files
- [ ] Optimize AES-JS performance (consider native module)
- [ ] Cache encryption keys (don't re-derive)

**Expected Improvement:** 2x faster encryption

#### 2. File System Optimization
**Tasks:**
- [ ] Use FileSystem caching
- [ ] Batch file operations
- [ ] Compress before encrypt for better performance
- [ ] Optimize thumbnail generation

**Expected Improvement:** Faster uploads/downloads

---

## 📈 Phase 8: Monitoring & Continuous Improvement

### Production Monitoring

**Implement:**
1. **Performance Metrics Collection**
   - Track key metrics in production
   - Log slow operations (> 500ms)
   - Track memory spikes
   - Monitor crash reports

2. **Performance Dashboard**
   - Display metrics in dev mode
   - Export performance reports
   - Compare against baseline

3. **Automated Testing**
   - Performance regression tests
   - Benchmark suite in CI/CD
   - Alert on performance degradation

---

## ✅ Success Criteria

### Must Have:
- ✅ App launch < 2s (cold start)
- ✅ Search < 500ms (10K documents)
- ✅ 60fps animations
- ✅ Memory < 200MB
- ✅ No UI freezes > 100ms

### Nice to Have:
- 📊 Performance monitoring dashboard
- 📊 Automated performance tests
- 📊 Performance comparison reports

---

## 🔧 Implementation Order

### Week 1: Measurement (Phase 1)
1. Create performance monitoring utility
2. Add instrumentation to key operations
3. Run baseline measurements
4. Identify bottlenecks

### Week 2: Quick Wins (Phases 2-3)
1. App launch optimization
2. Database indexes
3. Search query optimization
4. FlatList optimization

### Week 3: Deep Optimization (Phases 4-6)
1. Memory management
2. Animation optimization
3. Encryption optimization
4. Transaction batching

### Week 4: Testing & Monitoring (Phases 7-8)
1. Performance testing
2. Load testing
3. Monitoring implementation
4. Documentation

---

## 📝 Testing Strategy

### Performance Test Cases:
1. **Launch Performance**
   - Measure on device (not emulator)
   - Test cold, warm, hot starts
   - Test with 0, 100, 1K, 10K documents

2. **Search Performance**
   - Test empty database
   - Test with various document counts
   - Test complex queries
   - Test concurrent searches

3. **Memory Testing**
   - Monitor during 30min session
   - Test with large files
   - Test memory leaks (instruments/profiler)

4. **Stress Testing**
   - Upload 100 documents rapidly
   - Perform 1000 searches
   - Navigate quickly between screens
   - Background/foreground cycles

---

## 🎯 Next Steps

**Immediate Actions:**
1. Create performanceMonitor.ts utility
2. Add launch time tracking
3. Run baseline measurements on device
4. Add database indexes
5. Optimize FlatLists

**Commands to Use:**
```powershell
# Performance profiling on device
npx react-native run-android --variant=release
npx react-native run-ios --configuration Release

# Memory profiling
# iOS: Xcode Instruments
# Android: Android Studio Profiler

# Benchmark tests
npm run benchmark
```

---

**END OF PERFORMANCE OPTIMIZATION PLAN**
