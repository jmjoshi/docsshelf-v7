/**
 * User database service for CRUD operations
 */

import { UserProfile } from '../../types/user';
import { getDatabase } from './dbInit';

/**
 * Create a new user profile in the database
 */
export async function createUser(profile: UserProfile): Promise<number> {
  const db = getDatabase();
  
  try {
    const result = await db.runAsync(
      `INSERT INTO users (first_name, last_name, email, mobile_phone, home_phone, work_phone)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        profile.firstName,
        profile.lastName,
        profile.email,
        profile.phoneNumbers.mobile || null,
        profile.phoneNumbers.home || null,
        profile.phoneNumbers.work || null,
      ]
    );

    return result.lastInsertRowId;
  } catch (error) {
    console.error('Create user failed:', error);
    throw new Error('Failed to create user profile');
  }
}

/**
 * Get user profile by email
 */
export async function getUserByEmail(email: string): Promise<UserProfile | null> {
  const db = getDatabase();
  
  try {
    const result = await db.getFirstAsync<{
      id: number;
      first_name: string;
      last_name: string;
      email: string;
      mobile_phone: string | null;
      home_phone: string | null;
      work_phone: string | null;
      created_at: string;
      updated_at: string;
    }>(
      'SELECT * FROM users WHERE email = ?',
      [email]
    );

    if (!result) {
      return null;
    }

    return {
      id: result.id,
      firstName: result.first_name,
      lastName: result.last_name,
      email: result.email,
      phoneNumbers: {
        mobile: result.mobile_phone || undefined,
        home: result.home_phone || undefined,
        work: result.work_phone || undefined,
      },
      createdAt: result.created_at,
      updatedAt: result.updated_at,
    };
  } catch (error) {
    console.error('Get user failed:', error);
    throw new Error('Failed to retrieve user profile');
  }
}

/**
 * Update user profile
 */
export async function updateUser(email: string, profile: Partial<UserProfile>): Promise<void> {
  const db = getDatabase();
  
  try {
    await db.runAsync(
      `UPDATE users 
       SET first_name = COALESCE(?, first_name),
           last_name = COALESCE(?, last_name),
           mobile_phone = COALESCE(?, mobile_phone),
           home_phone = COALESCE(?, home_phone),
           work_phone = COALESCE(?, work_phone),
           updated_at = CURRENT_TIMESTAMP
       WHERE email = ?`,
      [
        profile.firstName || null,
        profile.lastName || null,
        profile.phoneNumbers?.mobile || null,
        profile.phoneNumbers?.home || null,
        profile.phoneNumbers?.work || null,
        email,
      ]
    );
  } catch (error) {
    console.error('Update user failed:', error);
    throw new Error('Failed to update user profile');
  }
}

/**
 * Delete user profile
 */
export async function deleteUser(email: string): Promise<void> {
  const db = getDatabase();
  
  try {
    await db.runAsync('DELETE FROM users WHERE email = ?', [email]);
  } catch (error) {
    console.error('Delete user failed:', error);
    throw new Error('Failed to delete user profile');
  }
}

/**
 * Check if user exists
 */
export async function userExists(email: string): Promise<boolean> {
  const db = getDatabase();
  
  try {
    const result = await db.getFirstAsync<{ count: number }>(
      'SELECT COUNT(*) as count FROM users WHERE email = ?',
      [email]
    );

    return (result?.count ?? 0) > 0;
  } catch (error) {
    console.error('User exists check failed:', error);
    return false;
  }
}

/**
 * Get current authenticated user's email from SecureStore
 */
export async function getCurrentUserEmail(): Promise<string | null> {
  try {
    const { getItemAsync } = await import('expo-secure-store');
    return await getItemAsync('user_email');
  } catch (error) {
    console.error('Get current user email failed:', error);
    return null;
  }
}

/**
 * Get current authenticated user's ID
 */
export async function getCurrentUserId(): Promise<number | null> {
  try {
    const email = await getCurrentUserEmail();
    if (!email) {
      return null;
    }

    const user = await getUserByEmail(email);
    return user?.id || null;
  } catch (error) {
    console.error('Get current user ID failed:', error);
    return null;
  }
}

/**
 * Get current authenticated user's profile
 */
export async function getCurrentUserProfile(): Promise<UserProfile | null> {
  try {
    const email = await getCurrentUserEmail();
    if (!email) {
      return null;
    }

    return await getUserByEmail(email);
  } catch (error) {
    console.error('Get current user profile failed:', error);
    return null;
  }
}
