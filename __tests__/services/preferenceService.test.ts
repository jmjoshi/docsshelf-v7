/**
 * Preference Service Tests
 * Tests for app preferences persistence
 */

import type { AppPreference } from '@/src/services/database/preferenceService';
import * as preferenceService from '@/src/services/database/preferenceService';
import * as SQLite from 'expo-sqlite';

// Default preferences for testing (must match src/services/database/preferenceService.ts)
const DEFAULT_PREFERENCES: AppPreference = {
  darkMode: false,
  compactView: false,
  showThumbnails: true,
  notifications: true,
  autoBackup: false,
  autoBackupFrequency: 'weekly',
  defaultSortMode: 'date',
  defaultViewMode: 'all',
};

// Mock expo-sqlite
jest.mock('expo-sqlite');

// Mock userService to return a default userId
jest.mock('@/src/services/database/userService', () => ({
  getCurrentUserId: jest.fn(() => Promise.resolve(1)),
  getCurrentUserEmail: jest.fn(() => Promise.resolve('test@example.com')),
}));

// Mock dbInit to return our mocked database
let mockDb: any;
jest.mock('@/src/services/database/dbInit', () => ({
  getDatabase: jest.fn(() => mockDb),
}));

describe('Preference Service', () => {
  let mockExecAsync: jest.Mock;
  let mockGetFirstAsync: jest.Mock;
  let mockGetAllAsync: jest.Mock;
  let mockRunAsync: jest.Mock;
  let mockWithTransactionAsync: jest.Mock;

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();

    // Create mock functions
    mockExecAsync = jest.fn().mockResolvedValue(undefined);
    mockGetFirstAsync = jest.fn();
    mockGetAllAsync = jest.fn();
    mockRunAsync = jest.fn().mockResolvedValue({ changes: 1 });
    mockWithTransactionAsync = jest.fn(async (callback) => {
      return await callback();
    });

    // Create mock database
    mockDb = {
      execAsync: mockExecAsync,
      getFirstAsync: mockGetFirstAsync,
      getAllAsync: mockGetAllAsync,
      runAsync: mockRunAsync,
      withTransactionAsync: mockWithTransactionAsync,
    };

    // Mock SQLite.openDatabaseSync
    (SQLite.openDatabaseSync as jest.Mock).mockReturnValue(mockDb);
  });

  describe('getPreferences', () => {
    it('should return default preferences when no saved preferences exist', async () => {
      mockGetAllAsync.mockResolvedValue([]);

      const preferences = await preferenceService.getPreferences(1);

      expect(preferences).toEqual(DEFAULT_PREFERENCES);
      expect(mockGetAllAsync).toHaveBeenCalledWith(
        'SELECT preference_key, preference_value FROM app_preferences WHERE user_id = ?',
        [1]
      );
    });

    it('should merge saved preferences with defaults', async () => {
      mockGetAllAsync.mockResolvedValue([
        { preference_key: 'darkMode', preference_value: 'true' },
        { preference_key: 'compactView', preference_value: 'true' },
      ]);

      const preferences = await preferenceService.getPreferences(1);

      expect(preferences).toEqual({
        ...DEFAULT_PREFERENCES,
        darkMode: true,
        compactView: true,
      });
    });

    it('should parse boolean values correctly', async () => {
      mockGetAllAsync.mockResolvedValue([
        { preference_key: 'notifications', preference_value: 'false' },
        { preference_key: 'autoBackup', preference_value: 'true' },
      ]);

      const preferences = await preferenceService.getPreferences(1);

      expect(preferences.notifications).toBe(false);
      expect(preferences.autoBackup).toBe(true);
    });

    it('should parse string values correctly', async () => {
      mockGetAllAsync.mockResolvedValue([
        { preference_key: 'autoBackupFrequency', preference_value: '"monthly"' },
        { preference_key: 'defaultSortMode', preference_value: '"name"' },
      ]);

      const preferences = await preferenceService.getPreferences(1);

      expect(preferences.autoBackupFrequency).toBe('monthly');
      expect(preferences.defaultSortMode).toBe('name');
    });

    it('should handle all user isolation', async () => {
      mockGetAllAsync.mockResolvedValue([
        { preference_key: 'darkMode', preference_value: 'true' },
      ]);

      await preferenceService.getPreferences();

      expect(mockGetAllAsync).toHaveBeenCalledWith(
        'SELECT preference_key, preference_value FROM app_preferences WHERE user_id = ?',
        [1]
      );
    });

    it('should handle database errors gracefully', async () => {
      mockGetAllAsync.mockRejectedValue(new Error('Database error'));

      // Service catches errors and returns defaults
      const prefs = await preferenceService.getPreferences(1);
      expect(prefs).toEqual(DEFAULT_PREFERENCES);
    });
  });

  describe('getPreference', () => {
    it('should return specific preference value', async () => {
      // Mock getAllAsync to return the preference
      mockGetAllAsync.mockResolvedValue([
        { preference_key: 'darkMode', preference_value: 'true' },
      ]);

      const value = await preferenceService.getPreference('darkMode', 1);

      expect(value).toBe(true);
    });

    it('should return default value when preference not found', async () => {
      mockGetAllAsync.mockResolvedValue([]);

      const value = await preferenceService.getPreference('darkMode', 1);

      expect(value).toBe(DEFAULT_PREFERENCES.darkMode);
    });

    it('should parse boolean string values', async () => {
      mockGetAllAsync.mockResolvedValue([
        { preference_key: 'notifications', preference_value: 'false' },
      ]);

      const value = await preferenceService.getPreference('notifications', 1);

      expect(value).toBe(false);
    });

    it('should return string values as-is', async () => {
      mockGetAllAsync.mockResolvedValue([
        { preference_key: 'autoBackupFrequency', preference_value: '"daily"' },
      ]);

      const value = await preferenceService.getPreference('autoBackupFrequency', 1);

      expect(value).toBe('daily');
    });
  });

  describe('setPreference', () => {
    it('should insert or update single preference', async () => {
      await preferenceService.setPreference('darkMode', true, 1);

      expect(mockRunAsync).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO app_preferences'),
        [1, 'darkMode', 'true', 'true']
      );
    });

    it('should convert boolean to string', async () => {
      await preferenceService.setPreference('compactView', false, 1);

      expect(mockRunAsync).toHaveBeenCalledWith(
        expect.any(String),
        [1, 'compactView', 'false', 'false']
      );
    });

    it('should handle string values', async () => {
      await preferenceService.setPreference('defaultSortMode', 'name', 1);

      expect(mockRunAsync).toHaveBeenCalledWith(
        expect.any(String),
        [1, 'defaultSortMode', '"name"', '"name"']
      );
    });

    it('should use default userId when not provided', async () => {
      await preferenceService.setPreference('darkMode', true);

      expect(mockRunAsync).toHaveBeenCalledWith(
        expect.any(String),
        [1, 'darkMode', 'true', 'true']
      );
    });
  });

  describe('setPreferences', () => {
    it('should batch update multiple preferences in transaction', async () => {
      const updates: Partial<AppPreference> = {
        darkMode: true,
        compactView: false,
        autoBackupFrequency: 'weekly',
      };

      await preferenceService.setPreferences(updates, 1);

      expect(mockWithTransactionAsync).toHaveBeenCalled();
      expect(mockRunAsync).toHaveBeenCalledTimes(3);
      expect(mockRunAsync).toHaveBeenCalledWith(
        expect.any(String),
        [1, 'darkMode', 'true', 'true']
      );
      expect(mockRunAsync).toHaveBeenCalledWith(
        expect.any(String),
        [1, 'compactView', 'false', 'false']
      );
      expect(mockRunAsync).toHaveBeenCalledWith(
        expect.any(String),
        [1, 'autoBackupFrequency', '"weekly"', '"weekly"']
      );
    });

    it('should handle empty updates object', async () => {
      await preferenceService.setPreferences({}, 1);

      expect(mockWithTransactionAsync).toHaveBeenCalled();
      expect(mockRunAsync).not.toHaveBeenCalled();
    });

    it('should rollback transaction on error', async () => {
      mockRunAsync.mockRejectedValueOnce(new Error('Update failed'));

      await expect(
        preferenceService.setPreferences({ darkMode: true }, 1)
      ).rejects.toThrow('Update failed');
    });
  });

  describe('resetPreferences', () => {
    it('should delete all preferences for user', async () => {
      await preferenceService.resetPreferences(1);

      expect(mockRunAsync).toHaveBeenCalledWith(
        'DELETE FROM app_preferences WHERE user_id = ?',
        [1]
      );
    });

    it('should use default userId when not provided', async () => {
      await preferenceService.resetPreferences();

      expect(mockRunAsync).toHaveBeenCalledWith(
        'DELETE FROM app_preferences WHERE user_id = ?',
        [1]
      );
    });

    it('should return defaults after reset', async () => {
      mockGetAllAsync.mockResolvedValue([]);

      await preferenceService.resetPreferences(1);
      const preferences = await preferenceService.getPreferences(1);

      expect(preferences).toEqual(DEFAULT_PREFERENCES);
    });
  });

  describe('Integration: Full preference workflow', () => {
    it('should handle complete preference lifecycle', async () => {
      // Start with no preferences
      mockGetAllAsync.mockResolvedValue([]);
      let prefs = await preferenceService.getPreferences(1);
      expect(prefs).toEqual(DEFAULT_PREFERENCES);

      // Set individual preference
      await preferenceService.setPreference('darkMode', true, 1);
      mockGetAllAsync.mockResolvedValue([
        { preference_key: 'darkMode', preference_value: 'true' },
      ]);
      prefs = await preferenceService.getPreferences(1);
      expect(prefs.darkMode).toBe(true);

      // Batch update preferences
      await preferenceService.setPreferences({
        compactView: true,
        autoBackup: true,
      }, 1);
      mockGetAllAsync.mockResolvedValue([
        { preference_key: 'darkMode', preference_value: 'true' },
        { preference_key: 'compactView', preference_value: 'true' },
        { preference_key: 'autoBackup', preference_value: 'true' },
      ]);
      prefs = await preferenceService.getPreferences(1);
      expect(prefs.darkMode).toBe(true);
      expect(prefs.compactView).toBe(true);
      expect(prefs.autoBackup).toBe(true);

      // Reset preferences
      await preferenceService.resetPreferences(1);
      mockGetAllAsync.mockResolvedValue([]);
      prefs = await preferenceService.getPreferences(1);
      expect(prefs).toEqual(DEFAULT_PREFERENCES);
    });
  });

  describe('User isolation', () => {
    it('should isolate preferences between users', async () => {
      // User 1 preferences
      mockGetAllAsync.mockResolvedValueOnce([
        { preference_key: 'darkMode', preference_value: 'true' },
      ]);
      const prefs1 = await preferenceService.getPreferences(1);
      expect(prefs1.darkMode).toBe(true);

      // User 2 preferences
      mockGetAllAsync.mockResolvedValueOnce([
        { preference_key: 'darkMode', preference_value: 'false' },
      ]);
      const prefs2 = await preferenceService.getPreferences(2);
      expect(prefs2.darkMode).toBe(false);

      // Verify different queries for different users
      expect(mockGetAllAsync).toHaveBeenNthCalledWith(
        1,
        expect.any(String),
        [1]
      );
      expect(mockGetAllAsync).toHaveBeenNthCalledWith(
        2,
        expect.any(String),
        [2]
      );
    });
  });
});
