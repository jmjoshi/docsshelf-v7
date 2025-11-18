/**
 * Utility functions for SecureStore key generation
 * Ensures consistent key naming across authentication flows
 */

/**
 * Sanitize email for use as SecureStore key component
 * Replaces special characters to create valid key names
 * 
 * @param email - User email address
 * @returns Sanitized string safe for SecureStore key usage
 * 
 * @example
 * sanitizeEmailForKey('user@example.com') // 'user_at_example.com'
 * sanitizeEmailForKey('test+alias@domain.co.uk') // 'test_alias_at_domain.co.uk'
 */
export function sanitizeEmailForKey(email: string): string {
  return email
    .replace(/@/g, '_at_')
    .replace(/[^a-zA-Z0-9.\-_]/g, '_');
}

/**
 * Generate SecureStore key for user's password salt
 * 
 * @param email - User email address
 * @returns SecureStore key for password salt
 */
export function getUserSaltKey(email: string): string {
  const emailKey = sanitizeEmailForKey(email);
  return `user_${emailKey}_salt`;
}

/**
 * Generate SecureStore key for user's password hash
 * 
 * @param email - User email address
 * @returns SecureStore key for password hash
 */
export function getUserPasswordHashKey(email: string): string {
  const emailKey = sanitizeEmailForKey(email);
  return `user_${emailKey}_password_hash`;
}

/**
 * Key for storing the current/last authenticated user's email
 * This is used to determine which user is currently logged in
 */
export const CURRENT_USER_EMAIL_KEY = 'user_email';
