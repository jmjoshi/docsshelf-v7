/**
 * Preference Service
 * Handles persistent user preferences storage
 */

import { getDatabase } from './dbInit';
import { getCurrentUserId } from './userService';

/**
 * App preferences interface
 */
export interface AppPreference {
  darkMode: boolean;
  compactView: boolean;
  showThumbnails: boolean;
  notifications: boolean;
  autoBackup: boolean;
  autoBackupFrequency: 'daily' | 'weekly' | 'monthly';
  defaultSortMode: 'date' | 'name' | 'size' | 'type';
  defaultViewMode: 'all' | 'favorites' | 'recent';
}

/**
 * Default preferences
 */
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

/**
 * Get all user preferences
 */
export async function getPreferences(userId?: number): Promise<AppPreference> {
  try {
    const currentUserId = userId || (await getCurrentUserId());
    if (!currentUserId) {
      return DEFAULT_PREFERENCES;
    }

    const db = getDatabase();
    const prefs = await db.getAllAsync<{ preference_key: string; preference_value: string }>(
      'SELECT preference_key, preference_value FROM app_preferences WHERE user_id = ?',
      [currentUserId]
    );

    // Start with defaults
    const result = { ...DEFAULT_PREFERENCES };

    // Override with saved preferences
    for (const pref of prefs) {
      try {
        const key = pref.preference_key as keyof AppPreference;
        const value = JSON.parse(pref.preference_value);
        (result as any)[key] = value;
      } catch (error) {
        console.error(`Failed to parse preference ${pref.preference_key}:`, error);
      }
    }

    return result;
  } catch (error) {
    console.error('Failed to get preferences:', error);
    return DEFAULT_PREFERENCES;
  }
}

/**
 * Set a single preference
 */
export async function setPreference(
  key: keyof AppPreference,
  value: any,
  userId?: number
): Promise<void> {
  try {
    const currentUserId = userId || (await getCurrentUserId());
    if (!currentUserId) {
      throw new Error('User not authenticated');
    }

    const db = getDatabase();
    const jsonValue = JSON.stringify(value);

    await db.runAsync(
      `INSERT INTO app_preferences (user_id, preference_key, preference_value, updated_at)
       VALUES (?, ?, ?, CURRENT_TIMESTAMP)
       ON CONFLICT(user_id, preference_key)
       DO UPDATE SET preference_value = ?, updated_at = CURRENT_TIMESTAMP`,
      [currentUserId, key, jsonValue, jsonValue]
    );
  } catch (error) {
    console.error(`Failed to set preference ${key}:`, error);
    throw error;
  }
}

/**
 * Set multiple preferences at once
 */
export async function setPreferences(
  preferences: Partial<AppPreference>,
  userId?: number
): Promise<void> {
  try {
    const currentUserId = userId || (await getCurrentUserId());
    if (!currentUserId) {
      throw new Error('User not authenticated');
    }

    const db = getDatabase();

    // Use a transaction for atomic updates
    await db.withTransactionAsync(async () => {
      for (const [key, value] of Object.entries(preferences)) {
        const jsonValue = JSON.stringify(value);
        await db.runAsync(
          `INSERT INTO app_preferences (user_id, preference_key, preference_value, updated_at)
           VALUES (?, ?, ?, CURRENT_TIMESTAMP)
           ON CONFLICT(user_id, preference_key)
           DO UPDATE SET preference_value = ?, updated_at = CURRENT_TIMESTAMP`,
          [currentUserId, key, jsonValue, jsonValue]
        );
      }
    });
  } catch (error) {
    console.error('Failed to set preferences:', error);
    throw error;
  }
}

/**
 * Reset preferences to defaults
 */
export async function resetPreferences(userId?: number): Promise<void> {
  try {
    const currentUserId = userId || (await getCurrentUserId());
    if (!currentUserId) {
      throw new Error('User not authenticated');
    }

    const db = getDatabase();
    await db.runAsync('DELETE FROM app_preferences WHERE user_id = ?', [currentUserId]);
  } catch (error) {
    console.error('Failed to reset preferences:', error);
    throw error;
  }
}

/**
 * Get a single preference value
 */
export async function getPreference<K extends keyof AppPreference>(
  key: K,
  userId?: number
): Promise<AppPreference[K]> {
  const prefs = await getPreferences(userId);
  return prefs[key];
}
