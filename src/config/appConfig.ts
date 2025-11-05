/**
 * Application Configuration
 * Central configuration for app-wide settings
 */

export const AppConfig = {
  // Authentication
  auth: {
    minPasswordLength: 12,
    maxLoginAttempts: 5,
    lockoutDuration: 15 * 60 * 1000, // 15 minutes
    sessionTimeout: 30 * 60 * 1000, // 30 minutes
    requireBiometric: false, // Can be enabled by user
  },
  
  // Storage
  storage: {
    maxDocumentSize: 50 * 1024 * 1024, // 50MB
    maxTotalStorage: 5 * 1024 * 1024 * 1024, // 5GB
    compressionEnabled: true,
    encryptionEnabled: true,
  },
  
  // Performance
  performance: {
    maxConcurrentUploads: 3,
    thumbnailSize: 200,
    cacheSize: 100 * 1024 * 1024, // 100MB
    autoCleanupDays: 30,
  },
  
  // UI/UX
  ui: {
    defaultTheme: 'auto', // auto, light, dark
    animationsEnabled: true,
    hapticsEnabled: true,
    defaultLanguage: 'en',
  },
  
  // Compliance
  compliance: {
    gdprCompliant: true,
    ccpaCompliant: true,
    dataRetentionDays: 365,
    auditLogEnabled: true,
  },
};

export default AppConfig;
