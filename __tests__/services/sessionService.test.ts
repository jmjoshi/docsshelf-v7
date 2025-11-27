/**
 * Session Service Tests
 * Tests for session timeout, activity tracking, and automatic logout
 */

import * as sessionService from '@/src/services/auth/sessionService';
import * as SecureStore from 'expo-secure-store';

// Mock expo-secure-store
jest.mock('expo-secure-store');

// Mock react-native AppState
jest.mock('react-native', () => ({
  AppState: {
    addEventListener: jest.fn(() => ({ remove: jest.fn() })),
  },
}));

describe('Session Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    sessionService.stopActivityMonitoring();
    jest.useRealTimers();
  });

  describe('getSessionData', () => {
    it('should return null when no session exists', async () => {
      (SecureStore.getItemAsync as jest.Mock).mockResolvedValue(null);

      const session = await sessionService.getSessionData();

      expect(session).toBeNull();
      expect(SecureStore.getItemAsync).toHaveBeenCalledWith('session_data');
    });

    it('should return parsed session data', async () => {
      const mockSession = {
        lastActivity: Date.now(),
        sessionStart: Date.now(),
        isActive: true,
      };
      (SecureStore.getItemAsync as jest.Mock).mockResolvedValue(JSON.stringify(mockSession));

      const session = await sessionService.getSessionData();

      expect(session).toEqual(mockSession);
    });

    it('should return null on parse error', async () => {
      (SecureStore.getItemAsync as jest.Mock).mockResolvedValue('invalid-json');

      const session = await sessionService.getSessionData();

      expect(session).toBeNull();
    });
  });

  describe('startSession', () => {
    it('should create new session', async () => {
      const now = Date.now();
      jest.setSystemTime(now);
      
      (SecureStore.setItemAsync as jest.Mock).mockResolvedValue(undefined);

      await sessionService.startSession();

      expect(SecureStore.setItemAsync).toHaveBeenCalledWith(
        'session_data',
        expect.stringContaining('"isActive":true')
      );
      
      const savedData = (SecureStore.setItemAsync as jest.Mock).mock.calls[0][1];
      const parsed = JSON.parse(savedData);
      expect(parsed.lastActivity).toBe(now);
      expect(parsed.sessionStart).toBe(now);
      expect(parsed.isActive).toBe(true);
    });

    it('should throw on storage error', async () => {
      (SecureStore.setItemAsync as jest.Mock).mockRejectedValue(new Error('Storage error'));

      await expect(sessionService.startSession()).rejects.toThrow('Storage error');
    });
  });

  describe('updateActivity', () => {
    it('should update lastActivity timestamp', async () => {
      const now = Date.now();
      const sessionStart = now - 5 * 60 * 1000;
      jest.setSystemTime(now);
      
      (SecureStore.getItemAsync as jest.Mock).mockResolvedValue(JSON.stringify({
        lastActivity: sessionStart,
        sessionStart,
        isActive: true,
      }));
      (SecureStore.setItemAsync as jest.Mock).mockResolvedValue(undefined);

      await sessionService.updateActivity();

      const savedData = (SecureStore.setItemAsync as jest.Mock).mock.calls[0][1];
      const parsed = JSON.parse(savedData);
      expect(parsed.lastActivity).toBe(now);
      expect(parsed.sessionStart).toBe(sessionStart);
    });

    it('should start new session if none exists', async () => {
      (SecureStore.getItemAsync as jest.Mock).mockResolvedValue(null);
      (SecureStore.setItemAsync as jest.Mock).mockResolvedValue(undefined);

      await sessionService.updateActivity();

      expect(SecureStore.setItemAsync).toHaveBeenCalledWith(
        'session_data',
        expect.stringContaining('"isActive":true')
      );
    });

    it('should handle errors gracefully', async () => {
      (SecureStore.getItemAsync as jest.Mock).mockRejectedValue(new Error('Storage error'));

      await expect(sessionService.updateActivity()).resolves.not.toThrow();
    });
  });

  describe('endSession', () => {
    it('should delete session data', async () => {
      (SecureStore.deleteItemAsync as jest.Mock).mockResolvedValue(undefined);

      await sessionService.endSession();

      expect(SecureStore.deleteItemAsync).toHaveBeenCalledWith('session_data');
    });

    it('should stop activity monitoring', async () => {
      (SecureStore.deleteItemAsync as jest.Mock).mockResolvedValue(undefined);
      
      // Start monitoring first
      sessionService.startActivityMonitoring(jest.fn());
      
      await sessionService.endSession();

      // Monitoring should be stopped (no easy way to verify, but ensures no errors)
      expect(SecureStore.deleteItemAsync).toHaveBeenCalled();
    });

    it('should handle errors gracefully', async () => {
      (SecureStore.deleteItemAsync as jest.Mock).mockRejectedValue(new Error('Storage error'));

      await expect(sessionService.endSession()).resolves.not.toThrow();
    });
  });

  describe('isSessionValid', () => {
    it('should return false when no session exists', async () => {
      (SecureStore.getItemAsync as jest.Mock).mockResolvedValue(null);

      const isValid = await sessionService.isSessionValid();

      expect(isValid).toBe(false);
    });

    it('should return false when session inactive', async () => {
      (SecureStore.getItemAsync as jest.Mock).mockResolvedValue(JSON.stringify({
        lastActivity: Date.now(),
        sessionStart: Date.now(),
        isActive: false,
      }));

      const isValid = await sessionService.isSessionValid();

      expect(isValid).toBe(false);
    });

    it('should return true for valid session', async () => {
      const now = Date.now();
      jest.setSystemTime(now);
      
      (SecureStore.getItemAsync as jest.Mock).mockResolvedValue(JSON.stringify({
        lastActivity: now - 5 * 60 * 1000, // 5 minutes ago
        sessionStart: now - 10 * 60 * 1000,
        isActive: true,
      }));

      const isValid = await sessionService.isSessionValid();

      expect(isValid).toBe(true);
    });

    it('should return false for expired session (> 15 minutes)', async () => {
      const now = Date.now();
      jest.setSystemTime(now);
      
      (SecureStore.getItemAsync as jest.Mock).mockResolvedValue(JSON.stringify({
        lastActivity: now - 16 * 60 * 1000, // 16 minutes ago
        sessionStart: now - 20 * 60 * 1000,
        isActive: true,
      }));
      (SecureStore.deleteItemAsync as jest.Mock).mockResolvedValue(undefined);

      const isValid = await sessionService.isSessionValid();

      expect(isValid).toBe(false);
      expect(SecureStore.deleteItemAsync).toHaveBeenCalled();
    });

    it('should end session when expired', async () => {
      const now = Date.now();
      jest.setSystemTime(now);
      
      (SecureStore.getItemAsync as jest.Mock).mockResolvedValue(JSON.stringify({
        lastActivity: now - 20 * 60 * 1000,
        sessionStart: now - 30 * 60 * 1000,
        isActive: true,
      }));
      (SecureStore.deleteItemAsync as jest.Mock).mockResolvedValue(undefined);

      await sessionService.isSessionValid();

      expect(SecureStore.deleteItemAsync).toHaveBeenCalledWith('session_data');
    });
  });

  describe('getSessionRemainingTime', () => {
    it('should return 0 when no session', async () => {
      (SecureStore.getItemAsync as jest.Mock).mockResolvedValue(null);

      const remaining = await sessionService.getSessionRemainingTime();

      expect(remaining).toBe(0);
    });

    it('should return remaining time for active session', async () => {
      const now = Date.now();
      jest.setSystemTime(now);
      
      // Session with 10 minutes of activity
      (SecureStore.getItemAsync as jest.Mock).mockResolvedValue(JSON.stringify({
        lastActivity: now - 5 * 60 * 1000, // 5 minutes ago
        sessionStart: now - 10 * 60 * 1000,
        isActive: true,
      }));

      const remaining = await sessionService.getSessionRemainingTime();

      // Should have 10 minutes remaining (15 - 5)
      expect(remaining).toBe(10 * 60 * 1000);
    });

    it('should return 0 for expired session', async () => {
      const now = Date.now();
      jest.setSystemTime(now);
      
      (SecureStore.getItemAsync as jest.Mock).mockResolvedValue(JSON.stringify({
        lastActivity: now - 20 * 60 * 1000, // 20 minutes ago
        sessionStart: now - 25 * 60 * 1000,
        isActive: true,
      }));

      const remaining = await sessionService.getSessionRemainingTime();

      expect(remaining).toBe(0);
    });
  });

  describe('formatSessionTime', () => {
    it('should format minutes and seconds', () => {
      const formatted = sessionService.formatSessionTime(5 * 60 * 1000 + 30 * 1000);
      expect(formatted).toBe('5m 30s');
    });

    it('should format seconds only', () => {
      const formatted = sessionService.formatSessionTime(45 * 1000);
      expect(formatted).toBe('45s');
    });

    it('should handle zero time', () => {
      const formatted = sessionService.formatSessionTime(0);
      expect(formatted).toBe('0s');
    });

    it('should round down partial seconds', () => {
      const formatted = sessionService.formatSessionTime(1500);
      expect(formatted).toBe('1s');
    });
  });

  describe('getSessionDuration', () => {
    it('should return 0 when no session', async () => {
      (SecureStore.getItemAsync as jest.Mock).mockResolvedValue(null);

      const duration = await sessionService.getSessionDuration();

      expect(duration).toBe(0);
    });

    it('should return session duration', async () => {
      const now = Date.now();
      const sessionStart = now - 10 * 60 * 1000;
      jest.setSystemTime(now);
      
      (SecureStore.getItemAsync as jest.Mock).mockResolvedValue(JSON.stringify({
        lastActivity: now,
        sessionStart,
        isActive: true,
      }));

      const duration = await sessionService.getSessionDuration();

      expect(duration).toBe(10 * 60 * 1000);
    });
  });

  describe('startActivityMonitoring', () => {
    it('should setup monitoring', () => {
      const onExpired = jest.fn();
      
      sessionService.startActivityMonitoring(onExpired);

      // Should not throw
      expect(onExpired).not.toHaveBeenCalled();
      
      sessionService.stopActivityMonitoring();
    });

    it('should stop previous monitoring when started again', () => {
      const onExpired1 = jest.fn();
      const onExpired2 = jest.fn();
      
      sessionService.startActivityMonitoring(onExpired1);
      sessionService.startActivityMonitoring(onExpired2);

      // Should handle gracefully
      sessionService.stopActivityMonitoring();
    });
  });

  describe('stopActivityMonitoring', () => {
    it('should clear monitoring', () => {
      const onExpired = jest.fn();
      
      sessionService.startActivityMonitoring(onExpired);
      sessionService.stopActivityMonitoring();

      // Should not throw
      expect(onExpired).not.toHaveBeenCalled();
    });

    it('should handle multiple stops gracefully', () => {
      sessionService.stopActivityMonitoring();
      sessionService.stopActivityMonitoring();

      // Should not throw
    });
  });
});
