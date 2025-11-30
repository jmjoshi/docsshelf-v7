/**
 * Database Optimization Utility
 * Performance enhancements for SQLite database
 */

import { logger } from '../../utils/helpers/logger';
import { db } from './dbInit';

/**
 * Optimize database performance with recommended PRAGMA settings
 */
export async function optimizeDatabasePerformance(): Promise<void> {
  try {
    logger.info('Optimizing database performance...');

    // Enable WAL (Write-Ahead Logging) mode for better concurrency
    // This allows reads while writing
    await db.execAsync('PRAGMA journal_mode=WAL;');
    logger.info('Enabled WAL mode');

    // Increase cache size to 10MB for better performance
    // Negative value means KB (cache_size = -10000 = 10MB)
    await db.execAsync('PRAGMA cache_size=-10000;');
    logger.info('Set cache size to 10MB');

    // Enable foreign key constraints
    await db.execAsync('PRAGMA foreign_keys=ON;');
    logger.info('Enabled foreign key constraints');

    // Set synchronous to NORMAL for better performance
    // FULL is slower but safer, NORMAL is good balance
    await db.execAsync('PRAGMA synchronous=NORMAL;');
    logger.info('Set synchronous mode to NORMAL');

    // Enable automatic index creation for temp tables
    await db.execAsync('PRAGMA automatic_index=ON;');
    logger.info('Enabled automatic indexing');

    // Set temp store to memory for faster temp operations
    await db.execAsync('PRAGMA temp_store=MEMORY;');
    logger.info('Set temp store to memory');

    // Optimize FTS5 tokenizer for better search performance
    await db.execAsync('PRAGMA fts5_tokenizer="unicode61 remove_diacritics 2";');
    logger.info('Optimized FTS5 tokenizer');

    logger.info('Database optimization complete');
  } catch (error) {
    logger.error('Database optimization failed', error as Error);
    throw error;
  }
}

/**
 * Add missing performance indexes
 * Run this to ensure all optimal indexes exist
 */
export async function addPerformanceIndexes(): Promise<void> {
  try {
    logger.info('Adding performance indexes...');

    // Document indexes for common queries
    await db.execAsync(`
      CREATE INDEX IF NOT EXISTS idx_documents_updated_at ON documents(updated_at DESC);
      CREATE INDEX IF NOT EXISTS idx_documents_file_size ON documents(file_size);
      CREATE INDEX IF NOT EXISTS idx_documents_last_accessed ON documents(last_accessed_at DESC);
      CREATE INDEX IF NOT EXISTS idx_documents_mime_type ON documents(mime_type);
    `);

    // Category indexes for hierarchy queries
    await db.execAsync(`
      CREATE INDEX IF NOT EXISTS idx_categories_sort_order ON categories(sort_order);
      CREATE INDEX IF NOT EXISTS idx_categories_updated_at ON categories(updated_at);
    `);

    // Tag indexes for filtering
    await db.execAsync(`
      CREATE INDEX IF NOT EXISTS idx_tags_name ON tags(name);
      CREATE INDEX IF NOT EXISTS idx_document_tags_tag_id ON document_tags(tag_id);
    `);

    // Audit log indexes for security queries
    await db.execAsync(`
      CREATE INDEX IF NOT EXISTS idx_audit_action ON audit_log(action);
      CREATE INDEX IF NOT EXISTS idx_audit_entity ON audit_log(entity_type, entity_id);
    `);

    // Composite indexes for complex queries
    await db.execAsync(`
      CREATE INDEX IF NOT EXISTS idx_documents_user_category 
      ON documents(user_id, category_id, created_at DESC);
      
      CREATE INDEX IF NOT EXISTS idx_documents_user_favorite 
      ON documents(user_id, is_favorite, created_at DESC);
    `);

    logger.info('Performance indexes added successfully');
  } catch (error) {
    logger.error('Failed to add performance indexes', error as Error);
    throw error;
  }
}

/**
 * Analyze database to update query planner statistics
 * Run this periodically (e.g., weekly) for optimal query performance
 */
export async function analyzeDatabaseStatistics(): Promise<void> {
  try {
    logger.info('Analyzing database statistics...');
    
    // ANALYZE command updates SQLite's query planner statistics
    await db.execAsync('ANALYZE;');
    
    logger.info('Database analysis complete');
  } catch (error) {
    logger.error('Database analysis failed', error as Error);
    throw error;
  }
}

/**
 * Vacuum database to reclaim space and defragment
 * WARNING: This can take time on large databases
 * Run during maintenance windows
 */
export async function vacuumDatabase(): Promise<void> {
  try {
    logger.info('Vacuuming database (this may take a while)...');
    
    // VACUUM rebuilds database file, removing free pages
    await db.execAsync('VACUUM;');
    
    logger.info('Database vacuum complete');
  } catch (error) {
    logger.error('Database vacuum failed', error as Error);
    throw error;
  }
}

/**
 * Get database size information
 */
export async function getDatabaseSize(): Promise<{
  pageCount: number;
  pageSize: number;
  totalSize: number; // in bytes
  freePagesCount: number;
  freeSpacePercent: number;
}> {
  try {
    const pageCount = await db.getFirstAsync<{ page_count: number }>('PRAGMA page_count;');
    const pageSize = await db.getFirstAsync<{ page_size: number }>('PRAGMA page_size;');
    const freePages = await db.getFirstAsync<{ freelist_count: number }>('PRAGMA freelist_count;');

    const totalPages = pageCount?.page_count || 0;
    const pageSizeBytes = pageSize?.page_size || 0;
    const freeCount = freePages?.freelist_count || 0;

    const totalSize = totalPages * pageSizeBytes;
    const freeSpacePercent = totalPages > 0 ? (freeCount / totalPages) * 100 : 0;

    return {
      pageCount: totalPages,
      pageSize: pageSizeBytes,
      totalSize,
      freePagesCount: freeCount,
      freeSpacePercent,
    };
  } catch (error) {
    logger.error('Failed to get database size', error as Error);
    throw error;
  }
}

/**
 * Check if database needs vacuum (> 10% free space)
 */
export async function needsVacuum(): Promise<boolean> {
  try {
    const sizeInfo = await getDatabaseSize();
    return sizeInfo.freeSpacePercent > 10;
  } catch (error) {
    logger.error('Failed to check vacuum need', error as Error);
    return false;
  }
}

/**
 * Optimize full-text search index
 */
export async function optimizeFTS(): Promise<void> {
  try {
    logger.info('Optimizing FTS5 index...');
    
    // Merge FTS5 segments for better search performance
    await db.execAsync("INSERT INTO documents_fts(documents_fts) VALUES('optimize');");
    
    logger.info('FTS5 optimization complete');
  } catch (error) {
    logger.error('FTS5 optimization failed', error as Error);
    throw error;
  }
}

/**
 * Get query performance information
 */
export async function getQueryPlan(query: string): Promise<any[]> {
  try {
    const plan = await db.getAllAsync(`EXPLAIN QUERY PLAN ${query}`);
    return plan;
  } catch (error) {
    logger.error('Failed to get query plan', error as Error);
    throw error;
  }
}

/**
 * Get database integrity check result
 */
export async function checkIntegrity(): Promise<boolean> {
  try {
    const result = await db.getFirstAsync<{ integrity_check: string }>('PRAGMA integrity_check;');
    return result?.integrity_check === 'ok';
  } catch (error) {
    logger.error('Integrity check failed', error as Error);
    return false;
  }
}

/**
 * Run comprehensive database maintenance
 * Call this during app idle time or maintenance windows
 */
export async function runDatabaseMaintenance(): Promise<void> {
  try {
    logger.info('Starting database maintenance...');

    // Step 1: Optimize settings
    await optimizeDatabasePerformance();

    // Step 2: Add missing indexes
    await addPerformanceIndexes();

    // Step 3: Update statistics
    await analyzeDatabaseStatistics();

    // Step 4: Optimize FTS
    await optimizeFTS();

    // Step 5: Check if vacuum needed
    const needsVac = await needsVacuum();
    if (needsVac) {
      logger.info('Database needs vacuum (> 10% free space)');
      await vacuumDatabase();
    }

    // Step 6: Integrity check
    const isHealthy = await checkIntegrity();
    if (!isHealthy) {
      logger.error('Database integrity check failed!', new Error('Integrity check failed'));
    }

    logger.info('Database maintenance complete');
  } catch (error) {
    logger.error('Database maintenance failed', error as Error);
    throw error;
  }
}

/**
 * Get database performance metrics
 */
export async function getDatabaseMetrics(): Promise<{
  size: ReturnType<typeof getDatabaseSize> extends Promise<infer T> ? T : never;
  needsVacuum: boolean;
  isHealthy: boolean;
}> {
  const size = await getDatabaseSize();
  const needsVac = await needsVacuum();
  const isHealthy = await checkIntegrity();

  return {
    size,
    needsVacuum: needsVac,
    isHealthy,
  };
}

// Auto-optimize on import (non-blocking)
optimizeDatabasePerformance().catch(err => {
  logger.warn('Auto-optimization failed', err);
});
