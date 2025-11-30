/**
 * Performance Monitoring Utility
 * Tracks app performance metrics for optimization
 */

import { isDevelopment } from '../../config/env';

export interface PerformanceMetric {
  name: string;
  startTime: number;
  endTime?: number;
  duration?: number;
  metadata?: Record<string, any>;
}

export interface PerformanceReport {
  appLaunchTime?: number;
  operations: PerformanceMetric[];
  memoryUsage?: {
    current: number;
    peak: number;
    average: number;
  };
  slowOperations: PerformanceMetric[]; // > 500ms
  timestamp: string;
}

class PerformanceMonitor {
  private metrics: Map<string, PerformanceMetric> = new Map();
  private completedMetrics: PerformanceMetric[] = [];
  private appLaunchStart?: number;
  private enabled: boolean = isDevelopment;
  private memorySnapshots: number[] = [];

  /**
   * Enable or disable performance monitoring
   */
  setEnabled(enabled: boolean) {
    this.enabled = enabled;
  }

  /**
   * Mark app launch start (call as early as possible)
   */
  markAppLaunchStart() {
    if (!this.enabled) return;
    this.appLaunchStart = Date.now();
  }

  /**
   * Mark app launch complete
   */
  markAppLaunchComplete() {
    if (!this.enabled || !this.appLaunchStart) return;
    
    const launchTime = Date.now() - this.appLaunchStart;
    
    if (isDevelopment) {
      console.log(`[Performance] App launch: ${launchTime}ms`);
      
      if (launchTime > 2000) {
        console.warn(`[Performance] App launch exceeded 2s target: ${launchTime}ms`);
      }
    }

    return launchTime;
  }

  /**
   * Start tracking an operation
   */
  startOperation(name: string, metadata?: Record<string, any>) {
    if (!this.enabled) return;

    const metric: PerformanceMetric = {
      name,
      startTime: Date.now(),
      metadata,
    };

    this.metrics.set(name, metric);
  }

  /**
   * End tracking an operation
   */
  endOperation(name: string, additionalMetadata?: Record<string, any>) {
    if (!this.enabled) return;

    const metric = this.metrics.get(name);
    if (!metric) {
      console.warn(`[Performance] No start time found for operation: ${name}`);
      return;
    }

    metric.endTime = Date.now();
    metric.duration = metric.endTime - metric.startTime;

    if (additionalMetadata) {
      metric.metadata = { ...metric.metadata, ...additionalMetadata };
    }

    // Log slow operations
    if (isDevelopment && metric.duration > 500) {
      console.warn(
        `[Performance] Slow operation: ${name} took ${metric.duration}ms`,
        metric.metadata
      );
    }

    this.completedMetrics.push(metric);
    this.metrics.delete(name);

    return metric.duration;
  }

  /**
   * Measure an async operation
   */
  async measureAsync<T>(
    name: string,
    operation: () => Promise<T>,
    metadata?: Record<string, any>
  ): Promise<T> {
    if (!this.enabled) return operation();

    this.startOperation(name, metadata);
    try {
      const result = await operation();
      this.endOperation(name, { success: true });
      return result;
    } catch (error) {
      this.endOperation(name, { success: false, error: String(error) });
      throw error;
    }
  }

  /**
   * Measure a synchronous operation
   */
  measure<T>(
    name: string,
    operation: () => T,
    metadata?: Record<string, any>
  ): T {
    if (!this.enabled) return operation();

    this.startOperation(name, metadata);
    try {
      const result = operation();
      this.endOperation(name, { success: true });
      return result;
    } catch (error) {
      this.endOperation(name, { success: false, error: String(error) });
      throw error;
    }
  }

  /**
   * Take a memory snapshot (approximate)
   */
  snapshotMemory() {
    if (!this.enabled) return;

    // Note: React Native doesn't have direct memory API
    // This is a placeholder for native module integration
    // In production, you would use native modules or performance APIs
    
    if (global.performance && (global.performance as any).memory) {
      const memory = (global.performance as any).memory;
      const usedMB = memory.usedJSHeapSize / 1024 / 1024;
      this.memorySnapshots.push(usedMB);
      
      if (isDevelopment && usedMB > 200) {
        console.warn(`[Performance] High memory usage: ${usedMB.toFixed(2)}MB`);
      }
    }
  }

  /**
   * Get slow operations (> 500ms)
   */
  getSlowOperations(): PerformanceMetric[] {
    return this.completedMetrics.filter(m => m.duration && m.duration > 500);
  }

  /**
   * Get operations by name
   */
  getOperationsByName(name: string): PerformanceMetric[] {
    return this.completedMetrics.filter(m => m.name === name);
  }

  /**
   * Get average duration for operation
   */
  getAverageOperationTime(name: string): number {
    const operations = this.getOperationsByName(name);
    if (operations.length === 0) return 0;

    const total = operations.reduce((sum, op) => sum + (op.duration || 0), 0);
    return total / operations.length;
  }

  /**
   * Get memory statistics
   */
  getMemoryStats() {
    if (this.memorySnapshots.length === 0) return null;

    return {
      current: this.memorySnapshots[this.memorySnapshots.length - 1],
      peak: Math.max(...this.memorySnapshots),
      average: this.memorySnapshots.reduce((a, b) => a + b, 0) / this.memorySnapshots.length,
    };
  }

  /**
   * Generate performance report
   */
  generateReport(): PerformanceReport {
    const slowOperations = this.getSlowOperations();
    const memoryUsage = this.getMemoryStats();

    return {
      appLaunchTime: this.appLaunchStart ? Date.now() - this.appLaunchStart : undefined,
      operations: this.completedMetrics,
      memoryUsage: memoryUsage || undefined,
      slowOperations,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Export report as JSON
   */
  exportReport(): string {
    const report = this.generateReport();
    return JSON.stringify(report, null, 2);
  }

  /**
   * Log performance summary
   */
  logSummary() {
    if (!this.enabled || !isDevelopment) return;

    console.log('\n=== Performance Summary ===');
    
    if (this.appLaunchStart) {
      const launchTime = Date.now() - this.appLaunchStart;
      console.log(`App Launch: ${launchTime}ms`);
    }

    const slowOps = this.getSlowOperations();
    if (slowOps.length > 0) {
      console.log(`\nSlow Operations (> 500ms): ${slowOps.length}`);
      slowOps.forEach(op => {
        console.log(`  - ${op.name}: ${op.duration}ms`, op.metadata);
      });
    }

    const memoryStats = this.getMemoryStats();
    if (memoryStats) {
      console.log(`\nMemory Usage:`);
      console.log(`  - Current: ${memoryStats.current.toFixed(2)}MB`);
      console.log(`  - Peak: ${memoryStats.peak.toFixed(2)}MB`);
      console.log(`  - Average: ${memoryStats.average.toFixed(2)}MB`);
    }

    console.log(`\nTotal Operations: ${this.completedMetrics.length}`);
    console.log('===========================\n');
  }

  /**
   * Clear all metrics
   */
  clear() {
    this.metrics.clear();
    this.completedMetrics = [];
    this.memorySnapshots = [];
    this.appLaunchStart = undefined;
  }

  /**
   * Get all metrics
   */
  getAllMetrics(): PerformanceMetric[] {
    return [...this.completedMetrics];
  }
}

// Export singleton instance
export const performanceMonitor = new PerformanceMonitor();

// Helper functions for common operations
export const performanceHelpers = {
  /**
   * Measure database query
   */
  measureQuery: async <T>(
    queryName: string,
    query: () => Promise<T>
  ): Promise<T> => {
    return performanceMonitor.measureAsync(`db:${queryName}`, query, {
      type: 'database',
    });
  },

  /**
   * Measure search operation
   */
  measureSearch: async <T>(
    searchQuery: string,
    search: () => Promise<T>
  ): Promise<T> => {
    return performanceMonitor.measureAsync('search', search, {
      query: searchQuery,
      type: 'search',
    });
  },

  /**
   * Measure document upload
   */
  measureUpload: async <T>(
    fileName: string,
    fileSize: number,
    upload: () => Promise<T>
  ): Promise<T> => {
    return performanceMonitor.measureAsync('upload', upload, {
      fileName,
      fileSize,
      type: 'upload',
    });
  },

  /**
   * Measure encryption
   */
  measureEncryption: async <T>(
    dataSize: number,
    encrypt: () => Promise<T>
  ): Promise<T> => {
    return performanceMonitor.measureAsync('encryption', encrypt, {
      dataSize,
      type: 'encryption',
    });
  },

  /**
   * Measure screen render
   */
  measureScreenRender: (screenName: string, renderFn: () => void) => {
    return performanceMonitor.measure(`screen:${screenName}`, renderFn, {
      type: 'render',
    });
  },
};

// Types exported at top of file
