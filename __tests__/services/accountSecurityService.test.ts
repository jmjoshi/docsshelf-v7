/**
 * Account Security Service Tests
 * Tests for account lockout, failed login tracking, and security notifications
 */

import * as accountSecurityService from '@/src/services/auth/accountSecurityService';
import * as SecureStore from 'expo-secure-store';

// Mock expo-secure-store
jest.mock('expo-secure-store');

describe('Account Security Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset time for consistent testing
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('getFailedAttempts', () => {
    it('should return default for new user', async () => {
      (SecureStore.getItemAsync as jest.Mock).mockResolvedValue(null);

      const attempts = await accountSecurityService.getFailedAttempts('test@example.com');

      expect(attempts.count).toBe(0);
      expect(attempts.lastAttempt).toBeDefined();
    });

    it('should return stored attempts', async () => {
      const mockData = {
        count: 3,
        lastAttempt: Date.now(),
      };
      (SecureStore.getItemAsync as jest.Mock).mockResolvedValue(JSON.stringify(mockData));

      const attempts = await accountSecurityService.getFailedAttempts('test@example.com');

      expect(attempts.count).toBe(3);
      expect(attempts.lastAttempt).toBe(mockData.lastAttempt);
    });

    it('should sanitize email in storage key', async () => {
      (SecureStore.getItemAsync as jest.Mock).mockResolvedValue(null);

      await accountSecurityService.getFailedAttempts('user@example.com');

      expect(SecureStore.getItemAsync).toHaveBeenCalledWith('failed_attempts_user_at_example.com');
    });

    it('should handle special characters in email', async () => {
      (SecureStore.getItemAsync as jest.Mock).mockResolvedValue(null);

      await accountSecurityService.getFailedAttempts('user+test@example.com');

      expect(SecureStore.getItemAsync).toHaveBeenCalledWith('failed_attempts_user_test_at_example.com');
    });

    it('should return default on parse error', async () => {
      (SecureStore.getItemAsync as jest.Mock).mockResolvedValue('invalid-json');

      const attempts = await accountSecurityService.getFailedAttempts('test@example.com');

      expect(attempts.count).toBe(0);
    });
  });

  describe('recordFailedAttempt', () => {
    it('should increment failed attempts', async () => {
      (SecureStore.getItemAsync as jest.Mock).mockResolvedValue(JSON.stringify({
        count: 2,
        lastAttempt: Date.now(),
      }));
      (SecureStore.setItemAsync as jest.Mock).mockResolvedValue(undefined);

      const isLocked = await accountSecurityService.recordFailedAttempt('test@example.com');

      expect(isLocked).toBe(false);
      expect(SecureStore.setItemAsync).toHaveBeenCalledWith(
        'failed_attempts_test_at_example.com',
        expect.stringContaining('"count":3')
      );
    });

    it('should lock account after 5 failed attempts', async () => {
      (SecureStore.getItemAsync as jest.Mock).mockResolvedValue(JSON.stringify({
        count: 4,
        lastAttempt: Date.now(),
      }));
      (SecureStore.setItemAsync as jest.Mock).mockResolvedValue(undefined);

      const isLocked = await accountSecurityService.recordFailedAttempt('test@example.com');

      expect(isLocked).toBe(true);
      expect(SecureStore.setItemAsync).toHaveBeenCalledWith(
        'failed_attempts_test_at_example.com',
        expect.stringContaining('"count":5')
      );
    });

    it('should set lockout timestamp when locked', async () => {
      const now = Date.now();
      jest.setSystemTime(now);
      
      (SecureStore.getItemAsync as jest.Mock).mockResolvedValue(JSON.stringify({
        count: 4,
        lastAttempt: now,
      }));
      (SecureStore.setItemAsync as jest.Mock).mockResolvedValue(undefined);

      await accountSecurityService.recordFailedAttempt('test@example.com');

      const savedData = (SecureStore.setItemAsync as jest.Mock).mock.calls[0][1];
      const parsed = JSON.parse(savedData);
      expect(parsed.lockedUntil).toBeGreaterThan(now);
      expect(parsed.lockedUntil).toBeLessThanOrEqual(now + 16 * 60 * 1000);
    });

    it('should start from 1 for first failed attempt', async () => {
      (SecureStore.getItemAsync as jest.Mock).mockResolvedValue(null);
      (SecureStore.setItemAsync as jest.Mock).mockResolvedValue(undefined);

      const isLocked = await accountSecurityService.recordFailedAttempt('test@example.com');

      expect(isLocked).toBe(false);
      expect(SecureStore.setItemAsync).toHaveBeenCalledWith(
        'failed_attempts_test_at_example.com',
        expect.stringContaining('"count":1')
      );
    });
  });

  describe('resetFailedAttempts', () => {
    it('should delete failed attempts record', async () => {
      (SecureStore.getItemAsync as jest.Mock).mockResolvedValue(JSON.stringify({
        count: 3,
        lastAttempt: Date.now(),
      }));
      (SecureStore.deleteItemAsync as jest.Mock).mockResolvedValue(undefined);

      await accountSecurityService.resetFailedAttempts('test@example.com');

      expect(SecureStore.deleteItemAsync).toHaveBeenCalledWith('failed_attempts_test_at_example.com');
    });

    it('should handle non-existent records gracefully', async () => {
      (SecureStore.getItemAsync as jest.Mock).mockResolvedValue(null);
      (SecureStore.deleteItemAsync as jest.Mock).mockResolvedValue(undefined);

      await expect(accountSecurityService.resetFailedAttempts('test@example.com')).resolves.not.toThrow();
    });
  });

  describe('isAccountLocked', () => {
    it('should return not locked for normal account', async () => {
      (SecureStore.getItemAsync as jest.Mock).mockResolvedValue(JSON.stringify({
        count: 2,
        lastAttempt: Date.now(),
      }));

      const result = await accountSecurityService.isAccountLocked('test@example.com');

      expect(result.isLocked).toBe(false);
      expect(result.remainingTime).toBe(0);
      expect(result.attemptsRemaining).toBe(3);
    });

    it('should return locked when lockout active', async () => {
      const now = Date.now();
      const lockedUntil = now + 10 * 60 * 1000; // 10 minutes
      jest.setSystemTime(now);
      
      (SecureStore.getItemAsync as jest.Mock).mockResolvedValue(JSON.stringify({
        count: 5,
        lockedUntil,
        lastAttempt: now,
      }));

      const result = await accountSecurityService.isAccountLocked('test@example.com');

      expect(result.isLocked).toBe(true);
      expect(result.remainingTime).toBe(10 * 60 * 1000);
      expect(result.attemptsRemaining).toBe(0);
    });

    it('should reset after lockout expired', async () => {
      const now = Date.now();
      const pastLockout = now - 1000; // Expired 1 second ago
      jest.setSystemTime(now);
      
      (SecureStore.getItemAsync as jest.Mock).mockResolvedValue(JSON.stringify({
        count: 5,
        lockedUntil: pastLockout,
        lastAttempt: pastLockout,
      }));
      (SecureStore.deleteItemAsync as jest.Mock).mockResolvedValue(undefined);

      const result = await accountSecurityService.isAccountLocked('test@example.com');

      expect(result.isLocked).toBe(false);
      expect(result.attemptsRemaining).toBe(5);
      expect(SecureStore.deleteItemAsync).toHaveBeenCalled();
    });

    it('should return correct attempts remaining', async () => {
      (SecureStore.getItemAsync as jest.Mock).mockResolvedValue(JSON.stringify({
        count: 1,
        lastAttempt: Date.now(),
      }));

      const result = await accountSecurityService.isAccountLocked('test@example.com');

      expect(result.attemptsRemaining).toBe(4);
    });
  });

  describe('formatLockoutTime', () => {
    it('should format single minute', () => {
      const formatted = accountSecurityService.formatLockoutTime(60 * 1000);
      expect(formatted).toBe('1 minute');
    });

    it('should format multiple minutes', () => {
      const formatted = accountSecurityService.formatLockoutTime(5 * 60 * 1000);
      expect(formatted).toBe('5 minutes');
    });

    it('should round up partial minutes', () => {
      const formatted = accountSecurityService.formatLockoutTime(90 * 1000);
      expect(formatted).toBe('2 minutes');
    });

    it('should handle zero time', () => {
      const formatted = accountSecurityService.formatLockoutTime(0);
      expect(formatted).toBe('0 minutes');
    });
  });

  describe('getAccountSecurityStatus', () => {
    it('should return comprehensive security status', async () => {
      const now = Date.now();
      (SecureStore.getItemAsync as jest.Mock).mockResolvedValue(JSON.stringify({
        count: 3,
        lastAttempt: now,
      }));

      const status = await accountSecurityService.getAccountSecurityStatus('test@example.com');

      expect(status.failedAttempts).toBe(3);
      expect(status.isLocked).toBe(false);
      expect(status.attemptsRemaining).toBe(2);
      expect(status.lockedUntil).toBeUndefined();
    });

    it('should include lockout time when locked', async () => {
      const now = Date.now();
      const lockedUntil = now + 15 * 60 * 1000;
      jest.setSystemTime(now);
      
      (SecureStore.getItemAsync as jest.Mock).mockResolvedValue(JSON.stringify({
        count: 5,
        lockedUntil,
        lastAttempt: now,
      }));

      const status = await accountSecurityService.getAccountSecurityStatus('test@example.com');

      expect(status.failedAttempts).toBe(5);
      expect(status.isLocked).toBe(true);
      expect(status.lockedUntil).toEqual(new Date(lockedUntil));
    });
  });
});
