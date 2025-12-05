/**
 * Backup Export Service Tests
 * Tests backup creation and export functionality
 * Part of Phase 2: Backup Service Testing
 */

import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import JSZip from 'jszip';
import {
    clearBackupHistory,
    createBackup,
    deleteBackupHistory,
    getBackupHistory,
    getBackupStats,
    shareBackup,
} from '../../../src/services/backup/backupExportService';
import * as categoryService from '../../../src/services/database/categoryService';
import * as dbInit from '../../../src/services/database/dbInit';
import * as documentService from '../../../src/services/database/documentService';
import * as encryption from '../../../src/utils/crypto/encryption';

// Mock dependencies
jest.mock('expo-file-system/legacy');
jest.mock('expo-sharing');
jest.mock('jszip');
jest.mock('../../../src/services/database/categoryService');
jest.mock('../../../src/services/database/documentService');
jest.mock('../../../src/services/database/dbInit');
jest.mock('../../../src/utils/crypto/encryption');

const mockFileSystem = FileSystem as jest.Mocked<typeof FileSystem>;
const mockSharing = Sharing as jest.Mocked<typeof Sharing>;
const mockCategoryService = categoryService as jest.Mocked<typeof categoryService>;
const mockDocumentService = documentService as jest.Mocked<typeof documentService>;
const mockDbInit = dbInit as jest.Mocked<typeof dbInit>;
const mockEncryption = encryption as jest.Mocked<typeof encryption>;

describe('Backup Export Service', () => {
  // Mock data
  const mockCategory = {
    id: 1,
    user_id: 1,
    name: 'Documents',
    parent_id: null,
    icon: 'folder',
    color: '#3b82f6',
    sort_order: 0,
    created_at: '2025-11-27T00:00:00Z',
    updated_at: '2025-11-27T00:00:00Z',
  };

  const mockDocument = {
    id: 1,
    user_id: 1,
    category_id: 1,
    original_filename: 'test.pdf',
    stored_filename: 'encrypted_test.bin',
    file_size: 1024,
    mime_type: 'application/pdf',
    encryption_key: 'key123',
    encryption_iv: 'iv123',
    encryption_hmac: 'hmac123',
    checksum: 'checksum123',
    is_favorite: false,
    tags: null,
    notes: null,
    created_at: '2025-11-27T00:00:00Z',
    updated_at: '2025-11-27T00:00:00Z',
  };

  const mockDocumentContent = new Uint8Array([1, 2, 3, 4, 5]);

  const mockDatabase = {
    getAllAsync: jest.fn(),
    runAsync: jest.fn(),
    execAsync: jest.fn(),
  };

  let mockZipInstance: any;

  beforeEach(() => {
    // Clear all mocks
    jest.clearAllMocks();

    // Setup FileSystem mocks
    mockFileSystem.cacheDirectory = 'file:///cache/';
    mockFileSystem.makeDirectoryAsync = jest.fn().mockResolvedValue(undefined);
    mockFileSystem.deleteAsync = jest.fn().mockResolvedValue(undefined);
    mockFileSystem.getInfoAsync = jest.fn().mockResolvedValue({ exists: true, size: 1024 });
    mockFileSystem.readAsStringAsync = jest.fn().mockResolvedValue('base64content');
    mockFileSystem.writeAsStringAsync = jest.fn().mockResolvedValue(undefined);

    // Setup Sharing mock
    mockSharing.isAvailableAsync = jest.fn().mockResolvedValue(true);
    mockSharing.shareAsync = jest.fn().mockResolvedValue(undefined);

    // Setup JSZip mock
    mockZipInstance = {
      file: jest.fn().mockReturnThis(),
      generateAsync: jest.fn().mockResolvedValue('zipbase64content'),
    };
    (JSZip as unknown as jest.Mock).mockImplementation(() => mockZipInstance);

    // Setup database mock
    mockDbInit.getDatabase = jest.fn().mockReturnValue(mockDatabase);
    mockDatabase.getAllAsync.mockResolvedValue([]);
    mockDatabase.runAsync.mockResolvedValue({ lastInsertRowId: 1, changes: 1 });

    // Setup category service mock
    mockCategoryService.getCategories.mockResolvedValue([mockCategory]);

    // Setup document service mock
    mockDocumentService.getDocuments.mockResolvedValue([mockDocument]);
    mockDocumentService.readDocument.mockResolvedValue(mockDocumentContent);

    // Setup encryption mock
    mockEncryption.calculateChecksum.mockResolvedValue('checksum123');
  });

  describe('createBackup', () => {
    it('should create backup with default options', async () => {
      const result = await createBackup();

      expect(result.success).toBe(true);
      expect(result.backupPath).toContain('backup_');
      expect(result.backupPath).toContain('.docsshelf');
      expect(mockFileSystem.makeDirectoryAsync).toHaveBeenCalled();
      expect(mockCategoryService.getCategories).toHaveBeenCalled();
      expect(mockDocumentService.getDocuments).toHaveBeenCalled();
    });

    it('should create backup with categories only', async () => {
      const result = await createBackup({
        includeCategories: true,
        includeDocuments: false,
      });

      expect(result.success).toBe(true);
      expect(mockCategoryService.getCategories).toHaveBeenCalled();
      expect(mockDocumentService.getDocuments).not.toHaveBeenCalled();
    });

    it('should create backup with documents only', async () => {
      const result = await createBackup({
        includeCategories: false,
        includeDocuments: true,
      });

      expect(result.success).toBe(true);
      expect(mockCategoryService.getCategories).not.toHaveBeenCalled();
      expect(mockDocumentService.getDocuments).toHaveBeenCalled();
    });

    it('should filter by category IDs', async () => {
      await createBackup({
        categoryIds: [1],
      });

      expect(mockCategoryService.getCategories).toHaveBeenCalled();
      expect(mockDocumentService.getDocuments).toHaveBeenCalled();
    });

    it('should report progress during backup', async () => {
      const progressCallback = jest.fn();

      await createBackup({}, progressCallback);

      expect(progressCallback).toHaveBeenCalled();
      const firstCall = progressCallback.mock.calls[0][0];
      expect(firstCall).toHaveProperty('stage');
      expect(firstCall).toHaveProperty('percentage');
      expect(firstCall).toHaveProperty('message');
    });

    it('should include notes in backup', async () => {
      const notes = 'Test backup notes';

      const result = await createBackup({ notes });

      expect(result.success).toBe(true);
      expect(mockZipInstance.file).toHaveBeenCalledWith(
        'manifest.json',
        expect.any(String)
      );
    });

    it('should calculate checksums for documents', async () => {
      await createBackup();

      expect(mockEncryption.calculateChecksum).toHaveBeenCalled();
    });

    it('should create ZIP with manifest', async () => {
      await createBackup();

      expect(mockZipInstance.file).toHaveBeenCalledWith(
        'manifest.json',
        expect.any(String)
      );
      expect(mockZipInstance.generateAsync).toHaveBeenCalledWith({
        type: 'base64',
        compression: 'DEFLATE',
      });
    });

    it('should handle backup creation error', async () => {
      mockCategoryService.getCategories.mockRejectedValue(new Error('Database error'));

      const result = await createBackup();

      expect(result.success).toBe(false);
      expect(result.error).toContain('Database error');
    });

    it('should cleanup temporary directory on error', async () => {
      mockDocumentService.getDocuments.mockRejectedValue(new Error('Read error'));

      await createBackup();

      expect(mockFileSystem.deleteAsync).toHaveBeenCalled();
    });

    it('should handle empty document list', async () => {
      mockDocumentService.getDocuments.mockResolvedValue([]);

      const result = await createBackup();

      expect(result.success).toBe(true);
    });

    it('should handle empty category list', async () => {
      mockCategoryService.getCategories.mockResolvedValue([]);

      const result = await createBackup();

      expect(result.success).toBe(true);
    });

    it('should record backup in history', async () => {
      await createBackup();

      expect(mockDatabase.runAsync).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO backup_history'),
        expect.any(Array)
      );
    });

    it('should return backup metadata', async () => {
      const result = await createBackup();

      expect(result.documentCount).toBe(1);
      expect(result.categoryCount).toBe(1);
      expect(result.totalSize).toBeGreaterThan(0);
      expect(result.duration).toBeGreaterThan(0);
    });
  });

  describe('shareBackup', () => {
    const mockBackupPath = 'file:///cache/backup_123.docsshelf';

    it('should share backup successfully', async () => {
      const result = await shareBackup(mockBackupPath);

      expect(result).toBe(true);
      expect(mockSharing.isAvailableAsync).toHaveBeenCalled();
      expect(mockSharing.shareAsync).toHaveBeenCalledWith(mockBackupPath);
    });

    it('should handle sharing not available', async () => {
      mockSharing.isAvailableAsync.mockResolvedValue(false);

      const result = await shareBackup(mockBackupPath);

      expect(result).toBe(false);
      expect(mockSharing.shareAsync).not.toHaveBeenCalled();
    });

    it('should handle sharing error', async () => {
      mockSharing.shareAsync.mockRejectedValue(new Error('Share failed'));

      const result = await shareBackup(mockBackupPath);

      expect(result).toBe(false);
    });

    it('should validate backup file exists', async () => {
      mockFileSystem.getInfoAsync.mockResolvedValue({ exists: false });

      const result = await shareBackup(mockBackupPath);

      expect(result).toBe(false);
    });
  });

  describe('getBackupHistory', () => {
    const mockHistory = [
      {
        id: 1,
        backup_type: 'export',
        file_path: 'backup_1.docsshelf',
        file_size: 1024,
        document_count: 5,
        category_count: 2,
        created_at: '2025-11-27T00:00:00Z',
      },
    ];

    it('should retrieve backup history', async () => {
      mockDatabase.getAllAsync.mockResolvedValue(mockHistory);

      const history = await getBackupHistory();

      expect(history).toEqual(mockHistory);
      expect(mockDatabase.getAllAsync).toHaveBeenCalledWith(
        expect.stringContaining('SELECT * FROM backup_history')
      );
    });

    it('should return empty array when no history', async () => {
      mockDatabase.getAllAsync.mockResolvedValue([]);

      const history = await getBackupHistory();

      expect(history).toEqual([]);
    });

    it('should handle database error', async () => {
      mockDatabase.getAllAsync.mockRejectedValue(new Error('DB error'));

      await expect(getBackupHistory()).rejects.toThrow('DB error');
    });
  });

  describe('deleteBackupHistory', () => {
    it('should delete backup history entry', async () => {
      await deleteBackupHistory(1);

      expect(mockDatabase.runAsync).toHaveBeenCalledWith(
        expect.stringContaining('DELETE FROM backup_history'),
        [1]
      );
    });

    it('should handle delete error', async () => {
      mockDatabase.runAsync.mockRejectedValue(new Error('Delete failed'));

      await expect(deleteBackupHistory(1)).rejects.toThrow('Delete failed');
    });
  });

  describe('clearBackupHistory', () => {
    it('should clear all backup history', async () => {
      await clearBackupHistory();

      expect(mockDatabase.runAsync).toHaveBeenCalledWith(
        expect.stringContaining('DELETE FROM backup_history')
      );
    });

    it('should handle clear error', async () => {
      mockDatabase.runAsync.mockRejectedValue(new Error('Clear failed'));

      await expect(clearBackupHistory()).rejects.toThrow('Clear failed');
    });
  });

  describe('getBackupStats', () => {
    const mockStats = {
      total_backups: 10,
      total_exports: 8,
      total_imports: 2,
      total_size: 10240,
    };

    it('should retrieve backup statistics', async () => {
      mockDatabase.getAllAsync.mockResolvedValue([mockStats]);

      const stats = await getBackupStats();

      expect(stats).toEqual(mockStats);
      expect(mockDatabase.getAllAsync).toHaveBeenCalled();
    });

    it('should return default stats when no data', async () => {
      mockDatabase.getAllAsync.mockResolvedValue([]);

      const stats = await getBackupStats();

      expect(stats.total_backups).toBe(0);
      expect(stats.total_exports).toBe(0);
    });

    it('should handle stats error', async () => {
      mockDatabase.getAllAsync.mockRejectedValue(new Error('Stats error'));

      await expect(getBackupStats()).rejects.toThrow('Stats error');
    });
  });

  describe('Edge Cases', () => {
    it('should handle large document list', async () => {
      const largeDocs = Array.from({ length: 100 }, (_, i) => ({
        ...mockDocument,
        id: i + 1,
      }));
      mockDocumentService.getDocuments.mockResolvedValue(largeDocs);

      const result = await createBackup();

      expect(result.success).toBe(true);
      expect(result.documentCount).toBe(100);
    });

    it('should handle documents without category', async () => {
      const docWithoutCategory = { ...mockDocument, category_id: null };
      mockDocumentService.getDocuments.mockResolvedValue([docWithoutCategory]);

      const result = await createBackup({ categoryIds: [1] });

      expect(result.success).toBe(true);
    });

    it('should handle concurrent backup creation', async () => {
      const promise1 = createBackup();
      const promise2 = createBackup();

      const results = await Promise.all([promise1, promise2]);

      expect(results[0].success).toBe(true);
      expect(results[1].success).toBe(true);
      expect(results[0].backupPath).not.toBe(results[1].backupPath);
    });

    it('should handle backup with compression disabled', async () => {
      await createBackup({ compression: false });

      expect(mockZipInstance.generateAsync).toHaveBeenCalledWith({
        type: 'base64',
        compression: 'STORE',
      });
    });

    it('should sanitize backup filename', async () => {
      const result = await createBackup();

      expect(result.backupPath).toMatch(/backup_\d+\.docsshelf$/);
    });
  });
});
