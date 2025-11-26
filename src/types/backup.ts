/**
 * Backup Type Definitions
 * Types for backup/restore functionality including USB and external storage
 */

import { Document } from './document';

/**
 * Backup manifest structure
 * Contains metadata about the backup
 */
export interface BackupManifest {
  backup_version: string; // Format version (e.g., "1.0")
  app_version: string; // App version that created backup
  created_at: string; // ISO 8601 timestamp
  device_platform: 'ios' | 'android'; // Platform that created backup
  document_count: number; // Number of documents in backup
  category_count: number; // Number of categories in backup
  total_size_bytes: number; // Total backup size in bytes
  encryption: {
    algorithm: string; // e.g., "AES-256-CTR"
    hmac: string; // e.g., "HMAC-SHA256"
  };
  documents: BackupDocumentMetadata[]; // Document metadata
  categories: BackupCategoryMetadata[]; // Category metadata
  notes?: string; // Optional user notes
}

/**
 * Document metadata in backup
 */
export interface BackupDocumentMetadata {
  id: number; // Original document ID
  filename: string; // Encrypted filename in backup
  original_filename: string; // Original user-visible filename
  size: number; // File size in bytes
  mime_type: string; // MIME type
  category_id: number | null; // Category ID
  is_favorite: boolean; // Favorite status
  tags?: string[]; // Document tags
  created_at: number; // Unix timestamp
  updated_at: number; // Unix timestamp
}

/**
 * Category metadata in backup
 */
export interface BackupCategoryMetadata {
  id: number; // Original category ID
  name: string; // Category name
  parent_id: number | null; // Parent category ID
  icon: string; // Icon name
  color: string; // Color hex code
  sort_order: number; // Display order
  created_at: number; // Unix timestamp
}

/**
 * Backup history record (database table)
 */
export interface BackupHistory {
  id: number;
  backup_type: 'export' | 'import'; // Type of operation
  encryption_type: 'encrypted' | 'unencrypted'; // FR-MAIN-013A: Track encryption status
  backup_location: 'usb' | 'files_app' | 'downloads' | 'other'; // Where backup was saved/loaded
  backup_filename: string; // Backup filename
  backup_size: number; // Size in bytes
  document_count: number; // Number of documents
  category_count: number; // Number of categories
  backup_hash: string; // SHA256 checksum
  status: 'completed' | 'failed'; // Operation status
  error_message?: string; // Error if failed
  created_at: number; // Unix timestamp
  restored_at?: number; // Unix timestamp (for imports)
  user_id?: number; // For future multi-user support
  user_consent?: boolean; // FR-MAIN-013A: User acknowledged security risks for unencrypted
  document_ids?: string; // FR-MAIN-013A: JSON array of selected document IDs
  notes?: string; // User notes
}

/**
 * Backup creation options
 */
export interface BackupExportOptions {
  includeCategories?: boolean; // Include categories (default: true)
  includeDocuments?: boolean; // Include documents (default: true)
  categoryIds?: number[]; // Specific categories to backup (optional)
  compression?: boolean; // Compress backup (default: true)
  notes?: string; // User notes for backup
}

/**
 * Backup import options
 */
export interface BackupImportOptions {
  skipDuplicates?: boolean; // Skip duplicate documents (default: true)
  mergeCategories?: boolean; // Merge with existing categories (default: true)
  replaceExisting?: boolean; // Replace existing documents (default: false)
  dryRun?: boolean; // Validate only, don't import (default: false)
}

/**
 * Backup validation result
 */
export interface BackupValidationResult {
  valid: boolean; // Is backup valid?
  manifest?: BackupManifest; // Manifest if valid
  errors?: string[]; // Validation errors
  warnings?: string[]; // Validation warnings
  checksumValid?: boolean; // Checksum validation result
  canImport?: boolean; // Can this backup be imported?
}

/**
 * Backup import result
 */
export interface BackupImportResult {
  success: boolean; // Was import successful?
  documentsImported: number; // Number of documents imported
  documentsSkipped: number; // Number skipped (duplicates)
  categoriesImported: number; // Number of categories imported
  categoriesMerged: number; // Number merged with existing
  errors?: string[]; // Errors encountered
  warnings?: string[]; // Warnings encountered
  duration: number; // Import duration in ms
}

/**
 * Backup export result
 */
export interface BackupExportResult {
  success: boolean; // Was export successful?
  backupPath: string; // Path to backup file
  backupSize: number; // Size in bytes
  documentsIncluded: number; // Number of documents
  categoriesIncluded: number; // Number of categories
  checksum: string; // SHA256 checksum
  duration: number; // Export duration in ms
  error?: string; // Error message if failed
}

/**
 * Backup progress callback
 */
export interface BackupProgress {
  stage: 'collecting' | 'packaging' | 'compressing' | 'encrypting' | 'writing' | 'complete'; // Current stage
  current: number; // Current item number
  total: number; // Total items
  message: string; // Human-readable message
  percentage: number; // Progress percentage (0-100)
}

/**
 * Backup file structure
 * Represents the internal structure of a .docsshelf backup file
 */
export interface BackupFileStructure {
  'manifest.json': string; // JSON string of BackupManifest
  'database.json': string; // JSON string of categories
  'checksum.sha256': string; // Checksum file content
  documents: {
    [filename: string]: Uint8Array; // Encrypted document files
  };
}

/**
 * Checksum file structure
 */
export interface BackupChecksums {
  'manifest.json': string; // SHA256 hash
  'database.json': string; // SHA256 hash
  documents: {
    [filename: string]: string; // SHA256 hash for each document
  };
}

/**
 * Duplicate detection result
 */
export interface DuplicateCheckResult {
  isDuplicate: boolean; // Is this a duplicate?
  existingDocument?: Document; // Existing document if duplicate
  conflictReason?: 'same_filename' | 'same_content' | 'same_hash'; // Why it's a duplicate
}

/**
 * Category merge strategy
 */
export type CategoryMergeStrategy = 
  | 'skip' // Skip if category exists
  | 'merge' // Merge documents into existing category
  | 'rename' // Create new category with unique name
  | 'replace'; // Replace existing category

/**
 * Backup statistics
 */
export interface BackupStats {
  totalBackups: number; // Total backup count
  totalExports: number; // Export count
  totalImports: number; // Import count
  lastBackupDate?: number; // Unix timestamp
  lastBackupSize?: number; // Size in bytes
  totalBackupSize: number; // Sum of all backup sizes
  oldestBackupDate?: number; // Unix timestamp
  newestBackupDate?: number; // Unix timestamp
}

/**
 * Backup settings
 */
export interface BackupSettings {
  autoBackupEnabled: boolean; // Enable automatic backups
  backupFrequency: 'daily' | 'weekly' | 'monthly' | 'manual'; // Backup frequency
  backupLocation: string; // Default backup location
  compressionEnabled: boolean; // Enable compression
  includeDocuments: boolean; // Include documents in backup
  includeCategories: boolean; // Include categories in backup
  maxBackupHistory: number; // Max backup history to keep
  notifyOnBackup: boolean; // Show notification after backup
}

/**
 * Export constants
 */
export const BACKUP_FILE_EXTENSION = '.docsshelf';
export const BACKUP_VERSION = '1.0';
export const BACKUP_MIME_TYPE = 'application/x-docsshelf-backup';

/**
 * Export backup manifest schema version
 * Increment this when manifest structure changes
 */
export const BACKUP_MANIFEST_VERSION = 1;

/**
 * Maximum backup file size (500 MB)
 * Warn user if backup exceeds this
 */
export const MAX_BACKUP_SIZE_WARNING = 500 * 1024 * 1024;

/**
 * Chunk size for streaming large backups (8 MB)
 */
export const BACKUP_CHUNK_SIZE = 8 * 1024 * 1024;

// ============================================
// FR-MAIN-013A: Unencrypted Backup Types
// ============================================

/**
 * Unencrypted backup options (FR-MAIN-013A)
 * Creates plain file backups WITHOUT encryption
 */
export interface UnencryptedBackupOptions {
  documentIds: number[]; // Specific documents to backup
  includeCategories?: boolean; // Include category structure (default: false)
  userId: number; // User ID for filtering
  userConsent: boolean; // User acknowledged security risks
}

/**
 * Unencrypted backup result (FR-MAIN-013A)
 */
export interface UnencryptedBackupResult {
  success: boolean;
  backupFolderUri: string; // URI to backup folder for sharing
  fileCount: number; // Number of files exported
  totalSizeBytes: number; // Total size in bytes
  timestamp: string; // ISO 8601 timestamp
  documentIds: number[]; // IDs of exported documents
  error?: string; // Error message if failed
}

/**
 * Unencrypted backup progress (FR-MAIN-013A)
 */
export interface UnencryptedBackupProgress {
  currentFile: string; // Current file being processed
  filesCompleted: number; // Files completed so far
  totalFiles: number; // Total files to process
  bytesCompleted: number; // Bytes completed so far
  totalBytes: number; // Total bytes to process
  percentComplete: number; // Percentage (0-100)
  estimatedTimeRemaining?: number; // Seconds remaining (optional)
}

/**
 * Unencrypted backup manifest (FR-MAIN-013A)
 * Stored as manifest.json in backup folder
 */
export interface UnencryptedBackupManifest {
  backup_version: string; // "1.0"
  app_version: string; // App version
  created_at: string; // ISO 8601 timestamp
  device_platform: 'ios' | 'android';
  encryption_type: 'unencrypted'; // Always 'unencrypted'
  warning: string; // Security warning text
  document_count: number;
  total_size_bytes: number;
  documents: UnencryptedDocumentMetadata[];
  categories?: UnencryptedCategoryMetadata[]; // Optional
}

/**
 * Unencrypted document metadata (FR-MAIN-013A)
 */
export interface UnencryptedDocumentMetadata {
  id: number; // Original document ID
  filename: string; // Plain filename (no .enc extension)
  original_filename: string; // Same as filename for unencrypted
  size: number; // File size in bytes
  mime_type: string; // MIME type
  category_name?: string; // Human-readable category name
  is_favorite: boolean;
  created_at: string; // ISO 8601 timestamp
  updated_at: string; // ISO 8601 timestamp
}

/**
 * Unencrypted category metadata (FR-MAIN-013A)
 */
export interface UnencryptedCategoryMetadata {
  id: number;
  name: string;
  parent_name?: string; // Parent category name (human-readable)
  icon: string;
  color: string;
  created_at: string; // ISO 8601 timestamp
}
