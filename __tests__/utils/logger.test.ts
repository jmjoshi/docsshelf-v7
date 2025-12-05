/**
 * Logger Utility Tests
 * Tests for centralized logging functionality
 */

import { logger } from '@/src/utils/helpers/logger';

// Mock env module
jest.mock('@/src/config/env', () => ({
  isDevelopment: true,
  isProduction: false,
}));

describe('Logger Utility', () => {
  beforeEach(() => {
    // Clear logs before each test
    logger.clearLogs();
    
    // Mock console methods
    jest.spyOn(console, 'debug').mockImplementation(() => {});
    jest.spyOn(console, 'info').mockImplementation(() => {});
    jest.spyOn(console, 'warn').mockImplementation(() => {});
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('debug', () => {
    it('should log debug messages in development', () => {
      logger.debug('Test debug message');
      
      expect(console.debug).toHaveBeenCalled();
      const logs = logger.getLogs();
      expect(logs).toHaveLength(1);
      expect(logs[0].level).toBe('debug');
      expect(logs[0].message).toBe('Test debug message');
    });

    it('should include data in debug log', () => {
      const testData = { key: 'value' };
      logger.debug('Test with data', testData);
      
      const logs = logger.getLogs();
      expect(logs[0].data).toEqual(testData);
    });

    it('should include timestamp in debug log', () => {
      logger.debug('Test message');
      
      const logs = logger.getLogs();
      expect(logs[0].timestamp).toBeDefined();
      expect(new Date(logs[0].timestamp)).toBeInstanceOf(Date);
    });
  });

  describe('info', () => {
    it('should log info messages', () => {
      logger.info('Test info message');
      
      expect(console.info).toHaveBeenCalled();
      const logs = logger.getLogs();
      expect(logs).toHaveLength(1);
      expect(logs[0].level).toBe('info');
      expect(logs[0].message).toBe('Test info message');
    });

    it('should include data in info log', () => {
      const testData = { user: 'john' };
      logger.info('User action', testData);
      
      const logs = logger.getLogs();
      expect(logs[0].data).toEqual(testData);
    });
  });

  describe('warn', () => {
    it('should log warning messages', () => {
      logger.warn('Test warning');
      
      expect(console.warn).toHaveBeenCalled();
      const logs = logger.getLogs();
      expect(logs).toHaveLength(1);
      expect(logs[0].level).toBe('warn');
      expect(logs[0].message).toBe('Test warning');
    });

    it('should include data in warning log', () => {
      const warningData = { code: 'WARN_001' };
      logger.warn('Warning occurred', warningData);
      
      const logs = logger.getLogs();
      expect(logs[0].data).toEqual(warningData);
    });
  });

  describe('error', () => {
    it('should log error messages', () => {
      logger.error('Test error');
      
      expect(console.error).toHaveBeenCalled();
      const logs = logger.getLogs();
      expect(logs).toHaveLength(1);
      expect(logs[0].level).toBe('error');
      expect(logs[0].message).toBe('Test error');
    });

    it('should include error object with stack trace', () => {
      const error = new Error('Something went wrong');
      logger.error('Error occurred', error);
      
      const logs = logger.getLogs();
      expect(logs[0].stack).toBeDefined();
      expect(logs[0].stack).toContain('Error: Something went wrong');
    });

    it('should include additional data with error', () => {
      const error = new Error('Test error');
      const errorData = { userId: 123 };
      logger.error('Error with data', error, errorData);
      
      const logs = logger.getLogs();
      expect(logs[0].data).toEqual(errorData);
      expect(logs[0].stack).toBeDefined();
    });
  });

  describe('getLogs', () => {
    it('should return all logged entries', () => {
      logger.info('Message 1');
      logger.warn('Message 2');
      logger.error('Message 3');
      
      const logs = logger.getLogs();
      expect(logs).toHaveLength(3);
    });

    it('should return logs in order', () => {
      logger.info('First');
      logger.info('Second');
      logger.info('Third');
      
      const logs = logger.getLogs();
      expect(logs[0].message).toBe('First');
      expect(logs[1].message).toBe('Second');
      expect(logs[2].message).toBe('Third');
    });

    it('should return a copy of logs array', () => {
      logger.info('Test message');
      
      const logs1 = logger.getLogs();
      const logs2 = logger.getLogs();
      
      expect(logs1).not.toBe(logs2); // Different array instances
      expect(logs1).toEqual(logs2); // Same content
    });
  });

  describe('clearLogs', () => {
    it('should remove all logs', () => {
      logger.info('Message 1');
      logger.info('Message 2');
      
      logger.clearLogs();
      
      const logs = logger.getLogs();
      expect(logs).toHaveLength(0);
    });

    it('should allow logging after clearing', () => {
      logger.info('Before clear');
      logger.clearLogs();
      logger.info('After clear');
      
      const logs = logger.getLogs();
      expect(logs).toHaveLength(1);
      expect(logs[0].message).toBe('After clear');
    });
  });

  describe('exportLogs', () => {
    it('should export logs as JSON string', () => {
      logger.info('Test message', { key: 'value' });
      
      const exported = logger.exportLogs();
      
      expect(typeof exported).toBe('string');
      const parsed = JSON.parse(exported);
      expect(Array.isArray(parsed)).toBe(true);
      expect(parsed).toHaveLength(1);
    });

    it('should export formatted JSON', () => {
      logger.info('Test');
      
      const exported = logger.exportLogs();
      
      // Check if it's formatted (has newlines and indentation)
      expect(exported).toContain('\n');
      expect(exported).toContain('  '); // Indentation
    });

    it('should export empty array when no logs', () => {
      const exported = logger.exportLogs();
      
      expect(exported).toBe('[]');
    });
  });

  describe('log rotation', () => {
    it('should keep only last 1000 logs', () => {
      // Log more than max capacity
      for (let i = 0; i < 1100; i++) {
        logger.info(`Message ${i}`);
      }
      
      const logs = logger.getLogs();
      expect(logs).toHaveLength(1000);
    });

    it('should remove oldest logs when exceeding capacity', () => {
      // Log more than capacity
      for (let i = 0; i < 1100; i++) {
        logger.info(`Message ${i}`);
      }
      
      const logs = logger.getLogs();
      // First message should be Message 100, not Message 0
      expect(logs[0].message).toBe('Message 100');
      expect(logs[logs.length - 1].message).toBe('Message 1099');
    });
  });

  describe('multiple log levels', () => {
    it('should handle mixed log levels', () => {
      logger.debug('Debug message');
      logger.info('Info message');
      logger.warn('Warning message');
      logger.error('Error message');
      
      const logs = logger.getLogs();
      expect(logs).toHaveLength(4);
      expect(logs[0].level).toBe('debug');
      expect(logs[1].level).toBe('info');
      expect(logs[2].level).toBe('warn');
      expect(logs[3].level).toBe('error');
    });
  });

  describe('data serialization', () => {
    it('should handle complex data objects', () => {
      const complexData = {
        user: {
          id: 123,
          name: 'John Doe',
          roles: ['admin', 'user'],
        },
        timestamp: Date.now(),
      };
      
      logger.info('Complex data', complexData);
      
      const logs = logger.getLogs();
      expect(logs[0].data).toEqual(complexData);
    });

    it('should handle null and undefined data', () => {
      logger.info('With null', null);
      logger.info('With undefined', undefined);
      
      const logs = logger.getLogs();
      expect(logs[0].data).toBeNull();
      expect(logs[1].data).toBeUndefined();
    });
  });
});
