/**
 * Tests for Backup Type Constants (backup.ts)
 * Validates backup configuration constants and type definitions
 */

import {
  BACKUP_FILE_EXTENSION,
  BACKUP_VERSION,
  BACKUP_MIME_TYPE,
  BACKUP_MANIFEST_VERSION,
  MAX_BACKUP_SIZE_WARNING,
  BACKUP_CHUNK_SIZE,
} from '../../src/types/backup';

describe('Backup Constants', () => {
  describe('File Extension', () => {
    it('should have correct file extension', () => {
      expect(BACKUP_FILE_EXTENSION).toBe('.docsshelf');
    });

    it('should start with a dot', () => {
      expect(BACKUP_FILE_EXTENSION).toMatch(/^\./);
    });

    it('should be lowercase', () => {
      expect(BACKUP_FILE_EXTENSION).toBe(BACKUP_FILE_EXTENSION.toLowerCase());
    });

    it('should not contain spaces', () => {
      expect(BACKUP_FILE_EXTENSION).not.toMatch(/\s/);
    });
  });

  describe('Backup Version', () => {
    it('should have version 1.0', () => {
      expect(BACKUP_VERSION).toBe('1.0');
    });

    it('should be a valid version string', () => {
      expect(BACKUP_VERSION).toMatch(/^\d+\.\d+$/);
    });

    it('should be a string type', () => {
      expect(typeof BACKUP_VERSION).toBe('string');
    });
  });

  describe('MIME Type', () => {
    it('should have correct MIME type', () => {
      expect(BACKUP_MIME_TYPE).toBe('application/x-docsshelf-backup');
    });

    it('should start with application/', () => {
      expect(BACKUP_MIME_TYPE).toMatch(/^application\//);
    });

    it('should use x- prefix for custom type', () => {
      expect(BACKUP_MIME_TYPE).toContain('x-');
    });

    it('should be lowercase', () => {
      expect(BACKUP_MIME_TYPE).toBe(BACKUP_MIME_TYPE.toLowerCase());
    });

    it('should not contain spaces', () => {
      expect(BACKUP_MIME_TYPE).not.toMatch(/\s/);
    });
  });

  describe('Manifest Version', () => {
    it('should have manifest version 1', () => {
      expect(BACKUP_MANIFEST_VERSION).toBe(1);
    });

    it('should be a positive integer', () => {
      expect(BACKUP_MANIFEST_VERSION).toBeGreaterThan(0);
      expect(Number.isInteger(BACKUP_MANIFEST_VERSION)).toBe(true);
    });

    it('should be a number type', () => {
      expect(typeof BACKUP_MANIFEST_VERSION).toBe('number');
    });
  });

  describe('Maximum Backup Size Warning', () => {
    it('should be 500MB in bytes', () => {
      expect(MAX_BACKUP_SIZE_WARNING).toBe(500 * 1024 * 1024);
      expect(MAX_BACKUP_SIZE_WARNING).toBe(524288000);
    });

    it('should be a reasonable limit', () => {
      expect(MAX_BACKUP_SIZE_WARNING).toBeGreaterThan(0);
      expect(MAX_BACKUP_SIZE_WARNING).toBeLessThanOrEqual(1024 * 1024 * 1024); // <= 1GB
    });

    it('should be larger than max document size (50MB)', () => {
      const maxDocSize = 50 * 1024 * 1024;
      expect(MAX_BACKUP_SIZE_WARNING).toBeGreaterThan(maxDocSize);
    });

    it('should be a positive number', () => {
      expect(MAX_BACKUP_SIZE_WARNING).toBeGreaterThan(0);
      expect(typeof MAX_BACKUP_SIZE_WARNING).toBe('number');
    });
  });

  describe('Backup Chunk Size', () => {
    it('should be 8MB in bytes', () => {
      expect(BACKUP_CHUNK_SIZE).toBe(8 * 1024 * 1024);
      expect(BACKUP_CHUNK_SIZE).toBe(8388608);
    });

    it('should be a reasonable chunk size', () => {
      expect(BACKUP_CHUNK_SIZE).toBeGreaterThan(0);
      expect(BACKUP_CHUNK_SIZE).toBeLessThanOrEqual(16 * 1024 * 1024); // <= 16MB
    });

    it('should be smaller than max backup warning size', () => {
      expect(BACKUP_CHUNK_SIZE).toBeLessThan(MAX_BACKUP_SIZE_WARNING);
    });

    it('should be a positive number', () => {
      expect(BACKUP_CHUNK_SIZE).toBeGreaterThan(0);
      expect(typeof BACKUP_CHUNK_SIZE).toBe('number');
    });

    it('should be a multiple of 1MB', () => {
      const oneMB = 1024 * 1024;
      expect(BACKUP_CHUNK_SIZE % oneMB).toBe(0);
    });
  });

  describe('Constants Consistency', () => {
    it('should have all constants defined', () => {
      expect(BACKUP_FILE_EXTENSION).toBeDefined();
      expect(BACKUP_VERSION).toBeDefined();
      expect(BACKUP_MIME_TYPE).toBeDefined();
      expect(BACKUP_MANIFEST_VERSION).toBeDefined();
      expect(MAX_BACKUP_SIZE_WARNING).toBeDefined();
      expect(BACKUP_CHUNK_SIZE).toBeDefined();
    });

    it('should have correct types', () => {
      expect(typeof BACKUP_FILE_EXTENSION).toBe('string');
      expect(typeof BACKUP_VERSION).toBe('string');
      expect(typeof BACKUP_MIME_TYPE).toBe('string');
      expect(typeof BACKUP_MANIFEST_VERSION).toBe('number');
      expect(typeof MAX_BACKUP_SIZE_WARNING).toBe('number');
      expect(typeof BACKUP_CHUNK_SIZE).toBe('number');
    });

    it('should have logical size relationships', () => {
      // Chunk size should be smaller than warning size
      expect(BACKUP_CHUNK_SIZE).toBeLessThan(MAX_BACKUP_SIZE_WARNING);
      
      // Warning size should allow multiple chunks
      const minChunks = 10;
      expect(MAX_BACKUP_SIZE_WARNING).toBeGreaterThanOrEqual(BACKUP_CHUNK_SIZE * minChunks);
    });
  });

  describe('File Naming Validation', () => {
    it('should create valid backup filename', () => {
      const timestamp = Date.now();
      const filename = `backup_${timestamp}${BACKUP_FILE_EXTENSION}`;
      
      expect(filename).toMatch(/^backup_\d+\.docsshelf$/);
    });

    it('should support different backup naming patterns', () => {
      const patterns = [
        `backup_2024_01_15${BACKUP_FILE_EXTENSION}`,
        `docsshelf_backup${BACKUP_FILE_EXTENSION}`,
        `my_documents${BACKUP_FILE_EXTENSION}`,
      ];

      patterns.forEach(pattern => {
        expect(pattern).toContain(BACKUP_FILE_EXTENSION);
      });
    });
  });

  describe('Version Compatibility', () => {
    it('should be able to parse version string', () => {
      const parts = BACKUP_VERSION.split('.');
      expect(parts).toHaveLength(2);
      expect(parseInt(parts[0])).toBeGreaterThanOrEqual(1);
      expect(parseInt(parts[1])).toBeGreaterThanOrEqual(0);
    });

    it('should support version comparison', () => {
      const currentMajor = parseInt(BACKUP_VERSION.split('.')[0]);
      const currentMinor = parseInt(BACKUP_VERSION.split('.')[1]);
      
      expect(currentMajor).toBe(1);
      expect(currentMinor).toBe(0);
    });
  });

  describe('Size Calculations', () => {
    it('should calculate number of chunks needed for a backup', () => {
      const backupSize = 100 * 1024 * 1024; // 100MB
      const chunksNeeded = Math.ceil(backupSize / BACKUP_CHUNK_SIZE);
      
      expect(chunksNeeded).toBeGreaterThan(0);
      expect(chunksNeeded).toBe(13); // 100MB / 8MB = 12.5, rounded up to 13
    });

    it('should determine if backup exceeds warning threshold', () => {
      const smallBackup = 100 * 1024 * 1024; // 100MB
      const largeBackup = 600 * 1024 * 1024; // 600MB
      
      expect(smallBackup).toBeLessThan(MAX_BACKUP_SIZE_WARNING);
      expect(largeBackup).toBeGreaterThan(MAX_BACKUP_SIZE_WARNING);
    });

    it('should handle edge case sizes', () => {
      // Exactly at warning threshold
      expect(MAX_BACKUP_SIZE_WARNING).toBe(MAX_BACKUP_SIZE_WARNING);
      
      // One byte over threshold
      const overThreshold = MAX_BACKUP_SIZE_WARNING + 1;
      expect(overThreshold).toBeGreaterThan(MAX_BACKUP_SIZE_WARNING);
      
      // One byte under threshold
      const underThreshold = MAX_BACKUP_SIZE_WARNING - 1;
      expect(underThreshold).toBeLessThan(MAX_BACKUP_SIZE_WARNING);
    });
  });

  describe('Memory Efficiency', () => {
    it('should use chunk size appropriate for mobile devices', () => {
      // 8MB chunks are reasonable for mobile memory
      const maxReasonableChunk = 16 * 1024 * 1024; // 16MB
      const minReasonableChunk = 1 * 1024 * 1024; // 1MB
      
      expect(BACKUP_CHUNK_SIZE).toBeLessThanOrEqual(maxReasonableChunk);
      expect(BACKUP_CHUNK_SIZE).toBeGreaterThanOrEqual(minReasonableChunk);
    });

    it('should allow efficient streaming', () => {
      // Multiple chunks should fit within warning size
      const chunksInMaxBackup = Math.floor(MAX_BACKUP_SIZE_WARNING / BACKUP_CHUNK_SIZE);
      expect(chunksInMaxBackup).toBeGreaterThan(10); // Should support many chunks
    });
  });

  describe('Format Validation', () => {
    it('should validate backup file extension format', () => {
      const testFilenames = [
        'backup.docsshelf',
        'my_backup.docsshelf',
        'backup_2024.docsshelf',
      ];

      testFilenames.forEach(filename => {
        expect(filename).toMatch(new RegExp(`${BACKUP_FILE_EXTENSION.replace('.', '\\.')}$`));
      });
    });

    it('should reject invalid extensions', () => {
      const invalidFilenames = [
        'backup.docshelf', // typo
        'backup.docsshel', // incomplete
        'backup.DOCSSHELF', // uppercase
        'backup.docs', // wrong extension
      ];

      invalidFilenames.forEach(filename => {
        expect(filename.endsWith(BACKUP_FILE_EXTENSION)).toBe(false);
      });
    });
  });
});
