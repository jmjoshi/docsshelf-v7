/**
 * Tests for Environment Configuration
 * Testing environment variables and feature flags
 */

import { ENV, isDevelopment, isProduction, isTest } from '../../src/config/env';

describe('ENV Configuration', () => {
  describe('app configuration', () => {
    it('should have APP_NAME set to DocsShelf', () => {
      expect(ENV.APP_NAME).toBe('DocsShelf');
    });

    it('should have APP_VERSION set to 1.0.0', () => {
      expect(ENV.APP_VERSION).toBe('1.0.0');
    });

    it('should have NODE_ENV defined', () => {
      expect(ENV.NODE_ENV).toBeDefined();
    });
  });

  describe('security configuration', () => {
    it('should have ARGON2_ITERATIONS of 10', () => {
      expect(ENV.ARGON2_ITERATIONS).toBe(10);
    });

    it('should have ARGON2_MEMORY of 64MB (65536)', () => {
      expect(ENV.ARGON2_MEMORY).toBe(64 * 1024);
      expect(ENV.ARGON2_MEMORY).toBe(65536);
    });

    it('should have ARGON2_PARALLELISM of 4', () => {
      expect(ENV.ARGON2_PARALLELISM).toBe(4);
    });

    it('should have ARGON2_HASH_LENGTH of 32', () => {
      expect(ENV.ARGON2_HASH_LENGTH).toBe(32);
    });

    it('should have all required Argon2 properties', () => {
      expect(ENV).toHaveProperty('ARGON2_ITERATIONS');
      expect(ENV).toHaveProperty('ARGON2_MEMORY');
      expect(ENV).toHaveProperty('ARGON2_PARALLELISM');
      expect(ENV).toHaveProperty('ARGON2_HASH_LENGTH');
    });
  });

  describe('storage configuration', () => {
    it('should have MAX_FILE_SIZE of 50MB', () => {
      expect(ENV.MAX_FILE_SIZE).toBe(50 * 1024 * 1024);
      expect(ENV.MAX_FILE_SIZE).toBe(52428800);
    });

    it('should have SUPPORTED_FILE_TYPES array', () => {
      expect(Array.isArray(ENV.SUPPORTED_FILE_TYPES)).toBe(true);
      expect(ENV.SUPPORTED_FILE_TYPES.length).toBeGreaterThan(0);
    });

    it('should support PDF files', () => {
      expect(ENV.SUPPORTED_FILE_TYPES).toContain('pdf');
    });

    it('should support DOC files', () => {
      expect(ENV.SUPPORTED_FILE_TYPES).toContain('doc');
    });

    it('should support DOCX files', () => {
      expect(ENV.SUPPORTED_FILE_TYPES).toContain('docx');
    });

    it('should support TXT files', () => {
      expect(ENV.SUPPORTED_FILE_TYPES).toContain('txt');
    });

    it('should support JPG files', () => {
      expect(ENV.SUPPORTED_FILE_TYPES).toContain('jpg');
    });

    it('should support JPEG files', () => {
      expect(ENV.SUPPORTED_FILE_TYPES).toContain('jpeg');
    });

    it('should support PNG files', () => {
      expect(ENV.SUPPORTED_FILE_TYPES).toContain('png');
    });

    it('should have exactly 7 supported file types', () => {
      expect(ENV.SUPPORTED_FILE_TYPES).toHaveLength(7);
    });
  });

  describe('session configuration', () => {
    it('should have SESSION_TIMEOUT of 30 minutes (1800000ms)', () => {
      expect(ENV.SESSION_TIMEOUT).toBe(30 * 60 * 1000);
      expect(ENV.SESSION_TIMEOUT).toBe(1800000);
    });
  });

  describe('feature flags', () => {
    it('should have OCR_ENABLED set to true', () => {
      expect(ENV.FEATURES.OCR_ENABLED).toBe(true);
    });

    it('should have BIOMETRIC_AUTH set to true', () => {
      expect(ENV.FEATURES.BIOMETRIC_AUTH).toBe(true);
    });

    it('should have OFFLINE_MODE set to true', () => {
      expect(ENV.FEATURES.OFFLINE_MODE).toBe(true);
    });

    it('should have CLOUD_SYNC set to false', () => {
      expect(ENV.FEATURES.CLOUD_SYNC).toBe(false);
    });

    it('should have all required feature flags', () => {
      expect(ENV.FEATURES).toHaveProperty('OCR_ENABLED');
      expect(ENV.FEATURES).toHaveProperty('BIOMETRIC_AUTH');
      expect(ENV.FEATURES).toHaveProperty('OFFLINE_MODE');
      expect(ENV.FEATURES).toHaveProperty('CLOUD_SYNC');
    });
  });

  describe('environment helpers', () => {
    it('should define isDevelopment', () => {
      expect(typeof isDevelopment).toBe('boolean');
    });

    it('should define isProduction', () => {
      expect(typeof isProduction).toBe('boolean');
    });

    it('should define isTest', () => {
      expect(typeof isTest).toBe('boolean');
    });

    it('should have isTest true in test environment', () => {
      expect(isTest).toBe(true);
    });

    it('should only have one environment flag true', () => {
      const trueCount = [isDevelopment, isProduction, isTest].filter(Boolean).length;
      expect(trueCount).toBe(1);
    });
  });

  describe('configuration validation', () => {
    it('should have positive ARGON2_ITERATIONS', () => {
      expect(ENV.ARGON2_ITERATIONS).toBeGreaterThan(0);
    });

    it('should have positive ARGON2_MEMORY', () => {
      expect(ENV.ARGON2_MEMORY).toBeGreaterThan(0);
    });

    it('should have positive ARGON2_PARALLELISM', () => {
      expect(ENV.ARGON2_PARALLELISM).toBeGreaterThan(0);
    });

    it('should have positive ARGON2_HASH_LENGTH', () => {
      expect(ENV.ARGON2_HASH_LENGTH).toBeGreaterThan(0);
    });

    it('should have positive MAX_FILE_SIZE', () => {
      expect(ENV.MAX_FILE_SIZE).toBeGreaterThan(0);
    });

    it('should have positive SESSION_TIMEOUT', () => {
      expect(ENV.SESSION_TIMEOUT).toBeGreaterThan(0);
    });
  });

  describe('type validation', () => {
    it('should have correct types for all properties', () => {
      expect(typeof ENV.NODE_ENV).toBe('string');
      expect(typeof ENV.APP_NAME).toBe('string');
      expect(typeof ENV.APP_VERSION).toBe('string');
      expect(typeof ENV.ARGON2_ITERATIONS).toBe('number');
      expect(typeof ENV.ARGON2_MEMORY).toBe('number');
      expect(typeof ENV.ARGON2_PARALLELISM).toBe('number');
      expect(typeof ENV.ARGON2_HASH_LENGTH).toBe('number');
      expect(typeof ENV.MAX_FILE_SIZE).toBe('number');
      expect(typeof ENV.SESSION_TIMEOUT).toBe('number');
      expect(Array.isArray(ENV.SUPPORTED_FILE_TYPES)).toBe(true);
      expect(typeof ENV.FEATURES).toBe('object');
    });

    it('should have boolean feature flags', () => {
      expect(typeof ENV.FEATURES.OCR_ENABLED).toBe('boolean');
      expect(typeof ENV.FEATURES.BIOMETRIC_AUTH).toBe('boolean');
      expect(typeof ENV.FEATURES.OFFLINE_MODE).toBe('boolean');
      expect(typeof ENV.FEATURES.CLOUD_SYNC).toBe('boolean');
    });
  });
});
