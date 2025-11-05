/**
 * Environment Configuration
 * Centralized environment variables and configuration for the application
 */

export const ENV = {
  // Environment type
  NODE_ENV: process.env.NODE_ENV || 'development',
  
  // App Configuration
  APP_NAME: 'DocsShelf',
  APP_VERSION: '1.0.0',
  
  // Security Configuration
  ARGON2_ITERATIONS: 10,
  ARGON2_MEMORY: 64 * 1024, // 64MB
  ARGON2_PARALLELISM: 4,
  ARGON2_HASH_LENGTH: 32,
  
  // Storage Configuration
  MAX_FILE_SIZE: 50 * 1024 * 1024, // 50MB
  SUPPORTED_FILE_TYPES: ['pdf', 'doc', 'docx', 'txt', 'jpg', 'jpeg', 'png'],
  
  // Session Configuration
  SESSION_TIMEOUT: 30 * 60 * 1000, // 30 minutes in milliseconds
  
  // Feature Flags
  FEATURES: {
    OCR_ENABLED: true,
    BIOMETRIC_AUTH: true,
    OFFLINE_MODE: true,
    CLOUD_SYNC: false, // Disabled by default per requirements
  },
};

export const isDevelopment = ENV.NODE_ENV === 'development';
export const isProduction = ENV.NODE_ENV === 'production';
export const isTest = ENV.NODE_ENV === 'test';
