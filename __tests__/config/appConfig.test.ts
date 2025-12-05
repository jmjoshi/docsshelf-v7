/**
 * Tests for Application Configuration
 * Testing app-wide settings and constants
 */

import { AppConfig } from '../../src/config/appConfig';

describe('AppConfig', () => {
  describe('auth configuration', () => {
    it('should have minPasswordLength of 12', () => {
      expect(AppConfig.auth.minPasswordLength).toBe(12);
    });

    it('should have maxLoginAttempts of 5', () => {
      expect(AppConfig.auth.maxLoginAttempts).toBe(5);
    });

    it('should have lockoutDuration of 15 minutes (900000ms)', () => {
      expect(AppConfig.auth.lockoutDuration).toBe(15 * 60 * 1000);
      expect(AppConfig.auth.lockoutDuration).toBe(900000);
    });

    it('should have sessionTimeout of 30 minutes (1800000ms)', () => {
      expect(AppConfig.auth.sessionTimeout).toBe(30 * 60 * 1000);
      expect(AppConfig.auth.sessionTimeout).toBe(1800000);
    });

    it('should have requireBiometric set to false by default', () => {
      expect(AppConfig.auth.requireBiometric).toBe(false);
    });

    it('should have all required auth properties', () => {
      expect(AppConfig.auth).toHaveProperty('minPasswordLength');
      expect(AppConfig.auth).toHaveProperty('maxLoginAttempts');
      expect(AppConfig.auth).toHaveProperty('lockoutDuration');
      expect(AppConfig.auth).toHaveProperty('sessionTimeout');
      expect(AppConfig.auth).toHaveProperty('requireBiometric');
    });
  });

  describe('storage configuration', () => {
    it('should have maxDocumentSize of 50MB', () => {
      expect(AppConfig.storage.maxDocumentSize).toBe(50 * 1024 * 1024);
      expect(AppConfig.storage.maxDocumentSize).toBe(52428800);
    });

    it('should have maxTotalStorage of 5GB', () => {
      expect(AppConfig.storage.maxTotalStorage).toBe(5 * 1024 * 1024 * 1024);
      expect(AppConfig.storage.maxTotalStorage).toBe(5368709120);
    });

    it('should have compressionEnabled set to true', () => {
      expect(AppConfig.storage.compressionEnabled).toBe(true);
    });

    it('should have encryptionEnabled set to true', () => {
      expect(AppConfig.storage.encryptionEnabled).toBe(true);
    });

    it('should have all required storage properties', () => {
      expect(AppConfig.storage).toHaveProperty('maxDocumentSize');
      expect(AppConfig.storage).toHaveProperty('maxTotalStorage');
      expect(AppConfig.storage).toHaveProperty('compressionEnabled');
      expect(AppConfig.storage).toHaveProperty('encryptionEnabled');
    });
  });

  describe('performance configuration', () => {
    it('should have maxConcurrentUploads of 3', () => {
      expect(AppConfig.performance.maxConcurrentUploads).toBe(3);
    });

    it('should have thumbnailSize of 200', () => {
      expect(AppConfig.performance.thumbnailSize).toBe(200);
    });

    it('should have cacheSize of 100MB', () => {
      expect(AppConfig.performance.cacheSize).toBe(100 * 1024 * 1024);
      expect(AppConfig.performance.cacheSize).toBe(104857600);
    });

    it('should have autoCleanupDays of 30', () => {
      expect(AppConfig.performance.autoCleanupDays).toBe(30);
    });

    it('should have all required performance properties', () => {
      expect(AppConfig.performance).toHaveProperty('maxConcurrentUploads');
      expect(AppConfig.performance).toHaveProperty('thumbnailSize');
      expect(AppConfig.performance).toHaveProperty('cacheSize');
      expect(AppConfig.performance).toHaveProperty('autoCleanupDays');
    });
  });

  describe('ui configuration', () => {
    it('should have defaultTheme set to auto', () => {
      expect(AppConfig.ui.defaultTheme).toBe('auto');
    });

    it('should have animationsEnabled set to true', () => {
      expect(AppConfig.ui.animationsEnabled).toBe(true);
    });

    it('should have hapticsEnabled set to true', () => {
      expect(AppConfig.ui.hapticsEnabled).toBe(true);
    });

    it('should have defaultLanguage set to en', () => {
      expect(AppConfig.ui.defaultLanguage).toBe('en');
    });

    it('should have all required ui properties', () => {
      expect(AppConfig.ui).toHaveProperty('defaultTheme');
      expect(AppConfig.ui).toHaveProperty('animationsEnabled');
      expect(AppConfig.ui).toHaveProperty('hapticsEnabled');
      expect(AppConfig.ui).toHaveProperty('defaultLanguage');
    });
  });

  describe('compliance configuration', () => {
    it('should have gdprCompliant set to true', () => {
      expect(AppConfig.compliance.gdprCompliant).toBe(true);
    });

    it('should have ccpaCompliant set to true', () => {
      expect(AppConfig.compliance.ccpaCompliant).toBe(true);
    });

    it('should have dataRetentionDays of 365', () => {
      expect(AppConfig.compliance.dataRetentionDays).toBe(365);
    });

    it('should have auditLogEnabled set to true', () => {
      expect(AppConfig.compliance.auditLogEnabled).toBe(true);
    });

    it('should have all required compliance properties', () => {
      expect(AppConfig.compliance).toHaveProperty('gdprCompliant');
      expect(AppConfig.compliance).toHaveProperty('ccpaCompliant');
      expect(AppConfig.compliance).toHaveProperty('dataRetentionDays');
      expect(AppConfig.compliance).toHaveProperty('auditLogEnabled');
    });
  });

  describe('configuration structure', () => {
    it('should have all top-level sections', () => {
      expect(AppConfig).toHaveProperty('auth');
      expect(AppConfig).toHaveProperty('storage');
      expect(AppConfig).toHaveProperty('performance');
      expect(AppConfig).toHaveProperty('ui');
      expect(AppConfig).toHaveProperty('compliance');
    });

    it('should have correct types for auth properties', () => {
      expect(typeof AppConfig.auth.minPasswordLength).toBe('number');
      expect(typeof AppConfig.auth.maxLoginAttempts).toBe('number');
      expect(typeof AppConfig.auth.lockoutDuration).toBe('number');
      expect(typeof AppConfig.auth.sessionTimeout).toBe('number');
      expect(typeof AppConfig.auth.requireBiometric).toBe('boolean');
    });

    it('should have correct types for storage properties', () => {
      expect(typeof AppConfig.storage.maxDocumentSize).toBe('number');
      expect(typeof AppConfig.storage.maxTotalStorage).toBe('number');
      expect(typeof AppConfig.storage.compressionEnabled).toBe('boolean');
      expect(typeof AppConfig.storage.encryptionEnabled).toBe('boolean');
    });

    it('should have correct types for performance properties', () => {
      expect(typeof AppConfig.performance.maxConcurrentUploads).toBe('number');
      expect(typeof AppConfig.performance.thumbnailSize).toBe('number');
      expect(typeof AppConfig.performance.cacheSize).toBe('number');
      expect(typeof AppConfig.performance.autoCleanupDays).toBe('number');
    });

    it('should have correct types for ui properties', () => {
      expect(typeof AppConfig.ui.defaultTheme).toBe('string');
      expect(typeof AppConfig.ui.animationsEnabled).toBe('boolean');
      expect(typeof AppConfig.ui.hapticsEnabled).toBe('boolean');
      expect(typeof AppConfig.ui.defaultLanguage).toBe('string');
    });

    it('should have correct types for compliance properties', () => {
      expect(typeof AppConfig.compliance.gdprCompliant).toBe('boolean');
      expect(typeof AppConfig.compliance.ccpaCompliant).toBe('boolean');
      expect(typeof AppConfig.compliance.dataRetentionDays).toBe('number');
      expect(typeof AppConfig.compliance.auditLogEnabled).toBe('boolean');
    });
  });

  describe('security validation', () => {
    it('should have secure password length minimum', () => {
      expect(AppConfig.auth.minPasswordLength).toBeGreaterThanOrEqual(12);
    });

    it('should have reasonable lockout duration', () => {
      expect(AppConfig.auth.lockoutDuration).toBeGreaterThan(0);
      expect(AppConfig.auth.lockoutDuration).toBeLessThanOrEqual(60 * 60 * 1000); // Max 1 hour
    });

    it('should have reasonable session timeout', () => {
      expect(AppConfig.auth.sessionTimeout).toBeGreaterThan(0);
      expect(AppConfig.auth.sessionTimeout).toBeLessThanOrEqual(24 * 60 * 60 * 1000); // Max 24 hours
    });

    it('should have encryption enabled for security', () => {
      expect(AppConfig.storage.encryptionEnabled).toBe(true);
    });

    it('should have audit logging enabled for compliance', () => {
      expect(AppConfig.compliance.auditLogEnabled).toBe(true);
    });
  });

  describe('storage limits validation', () => {
    it('should have reasonable document size limit', () => {
      expect(AppConfig.storage.maxDocumentSize).toBeGreaterThan(0);
      expect(AppConfig.storage.maxDocumentSize).toBeLessThanOrEqual(100 * 1024 * 1024); // Max 100MB
    });

    it('should have reasonable total storage limit', () => {
      expect(AppConfig.storage.maxTotalStorage).toBeGreaterThan(AppConfig.storage.maxDocumentSize);
    });

    it('should have reasonable cache size', () => {
      expect(AppConfig.performance.cacheSize).toBeGreaterThan(0);
      expect(AppConfig.performance.cacheSize).toBeLessThanOrEqual(500 * 1024 * 1024); // Max 500MB
    });
  });
});
