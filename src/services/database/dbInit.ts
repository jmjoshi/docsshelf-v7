/**
 * Database initialization and schema management
 * Uses expo-sqlite for local database storage
 * Production-grade with versioning and migrations
 */

import * as SQLite from 'expo-sqlite';

const DATABASE_NAME = 'docsshelf.db';
const DATABASE_VERSION = 1;

// Singleton database instance
let dbInstance: SQLite.SQLiteDatabase | null = null;
let isInitialized = false;

/**
 * Initialize and return database instance
 */
export function getDatabase(): SQLite.SQLiteDatabase {
  if (!dbInstance) {
    dbInstance = SQLite.openDatabaseSync(DATABASE_NAME);
  }
  return dbInstance;
}

// Export db instance for convenience
export const db = getDatabase();

/**
 * Get current database version
 */
async function getDatabaseVersion(db: SQLite.SQLiteDatabase): Promise<number> {
  try {
    const result = await db.getFirstAsync<{ user_version: number }>('PRAGMA user_version');
    return result?.user_version ?? 0;
  } catch (error) {
    console.error('Failed to get database version:', error);
    return 0;
  }
}

/**
 * Set database version
 */
async function setDatabaseVersion(db: SQLite.SQLiteDatabase, version: number): Promise<void> {
  try {
    await db.execAsync(`PRAGMA user_version = ${version}`);
  } catch (error) {
    console.error('Failed to set database version:', error);
    throw error;
  }
}

/**
 * Create all required database tables
 */
export async function initializeDatabase(): Promise<void> {
  if (isInitialized) {
    console.log('Database already initialized, skipping...');
    return;
  }

  const db = getDatabase();
  
  try {
    const currentVersion = await getDatabaseVersion(db);
    console.log(`Current database version: ${currentVersion}`);

    if (currentVersion === 0) {
      // First-time initialization
      console.log('Creating database tables...');
      
      // Create users table with all profile information
      await db.execAsync(`
        CREATE TABLE IF NOT EXISTS users (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          first_name TEXT NOT NULL,
          last_name TEXT NOT NULL,
          email TEXT NOT NULL UNIQUE,
          mobile_phone TEXT,
          home_phone TEXT,
          work_phone TEXT,
          mfa_enabled INTEGER DEFAULT 0,
          mfa_type TEXT,
          created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
          updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
        );
      `);

      // Create index on email for faster lookups
      await db.execAsync(`
        CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
      `);

      await setDatabaseVersion(db, DATABASE_VERSION);
      console.log(`Database initialized successfully (version ${DATABASE_VERSION})`);
    } else if (currentVersion < DATABASE_VERSION) {
      // Run migrations
      console.log(`Migrating database from version ${currentVersion} to ${DATABASE_VERSION}`);
      await runMigrations(db, currentVersion);
    }

    isInitialized = true;
  } catch (error) {
    console.error('Database initialization failed:', error);
    throw error;
  }
}

/**
 * Run database migrations
 */
async function runMigrations(db: SQLite.SQLiteDatabase, _fromVersion: number): Promise<void> {
  try {
    // Future migrations go here
    // Example:
    // if (fromVersion < 2) {
    //   await db.execAsync('ALTER TABLE users ADD COLUMN new_field TEXT');
    // }
    
    await setDatabaseVersion(db, DATABASE_VERSION);
    console.log('Migrations completed successfully');
  } catch (error) {
    console.error('Migration failed:', error);
    throw error;
  }
}

/**
 * Check if database is initialized
 */
export function isDatabaseInitialized(): boolean {
  return isInitialized;
}

/**
 * Drop all tables (for development/testing)
 */
export async function resetDatabase(): Promise<void> {
  const db = getDatabase();
  
  try {
    await db.execAsync('DROP TABLE IF EXISTS users;');
    await initializeDatabase();
    console.log('Database reset successfully');
  } catch (error) {
    console.error('Database reset failed:', error);
    throw error;
  }
}
