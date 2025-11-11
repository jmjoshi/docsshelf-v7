/**
 * Database initialization and schema management
 * Uses expo-sqlite for local database storage
 * Production-grade with versioning and migrations
 */

import * as SQLite from 'expo-sqlite';

const DATABASE_NAME = 'docsshelf.db';
// Database version - increment when schema changes
const DATABASE_VERSION = 3;

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

      // Create categories table for document organization
      await db.execAsync(`
        CREATE TABLE IF NOT EXISTS categories (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL,
          description TEXT,
          icon TEXT DEFAULT 'folder',
          color TEXT DEFAULT '#007AFF',
          parent_id INTEGER,
          user_id INTEGER NOT NULL,
          sort_order INTEGER DEFAULT 0,
          created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
          updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (parent_id) REFERENCES categories(id) ON DELETE CASCADE,
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        );
      `);

      // Create indexes for category queries
      await db.execAsync(`
        CREATE INDEX IF NOT EXISTS idx_categories_user_id ON categories(user_id);
        CREATE INDEX IF NOT EXISTS idx_categories_parent_id ON categories(parent_id);
        CREATE INDEX IF NOT EXISTS idx_categories_name ON categories(name);
      `);

      // Create documents table for file metadata
      await db.execAsync(`
        CREATE TABLE IF NOT EXISTS documents (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          user_id INTEGER NOT NULL,
          category_id INTEGER,
          filename TEXT NOT NULL,
          original_filename TEXT NOT NULL,
          file_path TEXT NOT NULL,
          file_size INTEGER NOT NULL,
          mime_type TEXT NOT NULL,
          encryption_key TEXT NOT NULL,
          encryption_iv TEXT NOT NULL,
          checksum TEXT NOT NULL,
          thumbnail_path TEXT,
          page_count INTEGER DEFAULT 1,
          ocr_text TEXT,
          ocr_confidence REAL,
          is_favorite INTEGER DEFAULT 0,
          created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
          updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
          last_accessed_at TEXT,
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
          FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL
        );
      `);

      // Create indexes for document queries
      await db.execAsync(`
        CREATE INDEX IF NOT EXISTS idx_documents_user_id ON documents(user_id);
        CREATE INDEX IF NOT EXISTS idx_documents_category_id ON documents(category_id);
        CREATE INDEX IF NOT EXISTS idx_documents_filename ON documents(filename);
        CREATE INDEX IF NOT EXISTS idx_documents_created_at ON documents(created_at);
        CREATE INDEX IF NOT EXISTS idx_documents_is_favorite ON documents(is_favorite);
        CREATE UNIQUE INDEX IF NOT EXISTS idx_documents_checksum ON documents(checksum, user_id);
      `);

      // Create full-text search virtual table for OCR text
      await db.execAsync(`
        CREATE VIRTUAL TABLE IF NOT EXISTS documents_fts USING fts5(
          document_id UNINDEXED,
          filename,
          ocr_text,
          content='documents',
          content_rowid='id'
        );
      `);

      // Create tags table for document tagging
      await db.execAsync(`
        CREATE TABLE IF NOT EXISTS tags (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          user_id INTEGER NOT NULL,
          name TEXT NOT NULL,
          color TEXT DEFAULT '#666666',
          created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
          UNIQUE(user_id, name COLLATE NOCASE)
        );
      `);

      // Create document_tags junction table
      await db.execAsync(`
        CREATE TABLE IF NOT EXISTS document_tags (
          document_id INTEGER NOT NULL,
          tag_id INTEGER NOT NULL,
          created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
          PRIMARY KEY (document_id, tag_id),
          FOREIGN KEY (document_id) REFERENCES documents(id) ON DELETE CASCADE,
          FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE
        );
      `);

      // Create audit log table for security
      await db.execAsync(`
        CREATE TABLE IF NOT EXISTS audit_log (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          user_id INTEGER NOT NULL,
          action TEXT NOT NULL,
          entity_type TEXT NOT NULL,
          entity_id INTEGER,
          details TEXT,
          ip_address TEXT,
          created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        );
      `);

      // Create index for audit queries
      await db.execAsync(`
        CREATE INDEX IF NOT EXISTS idx_audit_user_id ON audit_log(user_id);
        CREATE INDEX IF NOT EXISTS idx_audit_created_at ON audit_log(created_at);
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
async function runMigrations(db: SQLite.SQLiteDatabase, fromVersion: number): Promise<void> {
  try {
    console.log(`Running migrations from version ${fromVersion}`);

    // Migration from version 1 to 2: Add Phase 2 tables
    if (fromVersion < 2) {
      console.log('Migrating to version 2: Adding categories, documents, tags tables');
      
      // Create categories table
      await db.execAsync(`
        CREATE TABLE IF NOT EXISTS categories (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL,
          description TEXT,
          icon TEXT DEFAULT 'folder',
          color TEXT DEFAULT '#007AFF',
          parent_id INTEGER,
          user_id INTEGER NOT NULL,
          sort_order INTEGER DEFAULT 0,
          created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
          updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (parent_id) REFERENCES categories(id) ON DELETE CASCADE,
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        );
      `);

      await db.execAsync(`
        CREATE INDEX IF NOT EXISTS idx_categories_user_id ON categories(user_id);
        CREATE INDEX IF NOT EXISTS idx_categories_parent_id ON categories(parent_id);
        CREATE INDEX IF NOT EXISTS idx_categories_name ON categories(name);
      `);

      // Create documents table
      await db.execAsync(`
        CREATE TABLE IF NOT EXISTS documents (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          user_id INTEGER NOT NULL,
          category_id INTEGER,
          filename TEXT NOT NULL,
          original_filename TEXT NOT NULL,
          file_path TEXT NOT NULL,
          file_size INTEGER NOT NULL,
          mime_type TEXT NOT NULL,
          encryption_key TEXT NOT NULL,
          encryption_iv TEXT NOT NULL,
          encryption_hmac TEXT,
          encryption_hmac_key TEXT,
          checksum TEXT NOT NULL,
          thumbnail_path TEXT,
          page_count INTEGER DEFAULT 1,
          ocr_text TEXT,
          ocr_confidence REAL,
          is_favorite INTEGER DEFAULT 0,
          created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
          updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
          last_accessed_at TEXT,
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
          FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL
        );
      `);

      await db.execAsync(`
        CREATE INDEX IF NOT EXISTS idx_documents_user_id ON documents(user_id);
        CREATE INDEX IF NOT EXISTS idx_documents_category_id ON documents(category_id);
        CREATE INDEX IF NOT EXISTS idx_documents_filename ON documents(filename);
        CREATE INDEX IF NOT EXISTS idx_documents_created_at ON documents(created_at);
        CREATE INDEX IF NOT EXISTS idx_documents_is_favorite ON documents(is_favorite);
        CREATE UNIQUE INDEX IF NOT EXISTS idx_documents_checksum ON documents(checksum, user_id);
      `);

      // Create FTS table
      await db.execAsync(`
        CREATE VIRTUAL TABLE IF NOT EXISTS documents_fts USING fts5(
          document_id UNINDEXED,
          filename,
          ocr_text,
          content='documents',
          content_rowid='id'
        );
      `);

      // Create tags table
      await db.execAsync(`
        CREATE TABLE IF NOT EXISTS tags (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          user_id INTEGER NOT NULL,
          name TEXT NOT NULL,
          color TEXT DEFAULT '#666666',
          created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
          UNIQUE(user_id, name COLLATE NOCASE)
        );
      `);

      // Create document_tags junction table
      await db.execAsync(`
        CREATE TABLE IF NOT EXISTS document_tags (
          document_id INTEGER NOT NULL,
          tag_id INTEGER NOT NULL,
          created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
          PRIMARY KEY (document_id, tag_id),
          FOREIGN KEY (document_id) REFERENCES documents(id) ON DELETE CASCADE,
          FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE
        );
      `);

      // Create audit log table
      await db.execAsync(`
        CREATE TABLE IF NOT EXISTS audit_log (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          user_id INTEGER NOT NULL,
          action TEXT NOT NULL,
          entity_type TEXT NOT NULL,
          entity_id INTEGER,
          details TEXT,
          ip_address TEXT,
          created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        );
      `);

      await db.execAsync(`
        CREATE INDEX IF NOT EXISTS idx_audit_user_id ON audit_log(user_id);
        CREATE INDEX IF NOT EXISTS idx_audit_created_at ON audit_log(created_at);
      `);

      console.log('Migration to version 2 completed');
    }

    // Migration from version 2 to 3: Add HMAC fields for authenticated encryption
    if (fromVersion < 3) {
      console.log('Migrating to version 3: Adding HMAC fields for authenticated encryption');
      
      // Add HMAC columns to documents table
      await db.execAsync(`
        ALTER TABLE documents ADD COLUMN encryption_hmac TEXT;
      `);
      
      await db.execAsync(`
        ALTER TABLE documents ADD COLUMN encryption_hmac_key TEXT;
      `);
      
      console.log('Migration to version 3 completed');
    }
    
    await setDatabaseVersion(db, DATABASE_VERSION);
    console.log('All migrations completed successfully');
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
    // Drop tables in reverse order of dependencies
    await db.execAsync('DROP TABLE IF EXISTS audit_log;');
    await db.execAsync('DROP TABLE IF EXISTS document_tags;');
    await db.execAsync('DROP TABLE IF EXISTS tags;');
    await db.execAsync('DROP TABLE IF EXISTS documents_fts;');
    await db.execAsync('DROP TABLE IF EXISTS documents;');
    await db.execAsync('DROP TABLE IF EXISTS categories;');
    await db.execAsync('DROP TABLE IF EXISTS users;');
    
    // Reset initialization flag
    isInitialized = false;
    
    // Reinitialize
    await initializeDatabase();
    console.log('Database reset successfully');
  } catch (error) {
    console.error('Database reset failed:', error);
    throw error;
  }
}
