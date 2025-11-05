/**
 * Database initialization and schema management
 * Uses expo-sqlite for local database storage
 */

import * as SQLite from 'expo-sqlite';

const DATABASE_NAME = 'docsshelf.db';

/**
 * Initialize and return database instance
 */
export function getDatabase(): SQLite.SQLiteDatabase {
  return SQLite.openDatabaseSync(DATABASE_NAME);
}

/**
 * Create all required database tables
 */
export async function initializeDatabase(): Promise<void> {
  const db = getDatabase();
  
  try {
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
        created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Create index on email for faster lookups
    await db.execAsync(`
      CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
    `);

    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Database initialization failed:', error);
    throw error;
  }
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
