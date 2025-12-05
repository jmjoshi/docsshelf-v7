/**
 * SecureStore Keys Utility Tests
 * Tests for email sanitization and key generation
 */

import {
    CURRENT_USER_EMAIL_KEY,
    getUserPasswordHashKey,
    getUserSaltKey,
    sanitizeEmailForKey,
} from '@/src/utils/auth/secureStoreKeys';

describe('SecureStore Keys Utility', () => {
  describe('sanitizeEmailForKey', () => {
    it('should replace @ with _at_', () => {
      expect(sanitizeEmailForKey('user@example.com')).toBe('user_at_example.com');
    });

    it('should replace + with _', () => {
      expect(sanitizeEmailForKey('user+test@example.com')).toBe('user_test_at_example.com');
    });

    it('should replace multiple special characters', () => {
      expect(sanitizeEmailForKey('test+alias@domain.co.uk')).toBe('test_alias_at_domain.co.uk');
    });

    it('should keep dots, hyphens, and underscores', () => {
      expect(sanitizeEmailForKey('user.name-test@example.com')).toBe('user.name-test_at_example.com');
    });

    it('should replace spaces with _', () => {
      expect(sanitizeEmailForKey('user name@example.com')).toBe('user_name_at_example.com');
    });

    it('should handle multiple @ symbols', () => {
      expect(sanitizeEmailForKey('user@@example.com')).toBe('user_at__at_example.com');
    });

    it('should replace special characters like ! # $', () => {
      expect(sanitizeEmailForKey('user!#$@example.com')).toBe('user____at_example.com');
    });

    it('should handle already clean email', () => {
      expect(sanitizeEmailForKey('user_at_example.com')).toBe('user_at_example.com');
    });

    it('should handle email with numbers', () => {
      expect(sanitizeEmailForKey('user123@example.com')).toBe('user123_at_example.com');
    });

    it('should handle uppercase letters', () => {
      expect(sanitizeEmailForKey('User@Example.COM')).toBe('User_at_Example.COM');
    });
  });

  describe('getUserSaltKey', () => {
    it('should generate correct salt key', () => {
      expect(getUserSaltKey('user@example.com')).toBe('user_user_at_example.com_salt');
    });

    it('should handle email with special characters', () => {
      expect(getUserSaltKey('test+alias@domain.com')).toBe('user_test_alias_at_domain.com_salt');
    });

    it('should generate consistent keys for same email', () => {
      const email = 'user@example.com';
      const key1 = getUserSaltKey(email);
      const key2 = getUserSaltKey(email);
      expect(key1).toBe(key2);
    });

    it('should generate different keys for different emails', () => {
      const key1 = getUserSaltKey('user1@example.com');
      const key2 = getUserSaltKey('user2@example.com');
      expect(key1).not.toBe(key2);
    });
  });

  describe('getUserPasswordHashKey', () => {
    it('should generate correct password hash key', () => {
      expect(getUserPasswordHashKey('user@example.com')).toBe('user_user_at_example.com_password_hash');
    });

    it('should handle email with special characters', () => {
      expect(getUserPasswordHashKey('test+alias@domain.com')).toBe('user_test_alias_at_domain.com_password_hash');
    });

    it('should generate consistent keys for same email', () => {
      const email = 'user@example.com';
      const key1 = getUserPasswordHashKey(email);
      const key2 = getUserPasswordHashKey(email);
      expect(key1).toBe(key2);
    });

    it('should generate different keys for different emails', () => {
      const key1 = getUserPasswordHashKey('user1@example.com');
      const key2 = getUserPasswordHashKey('user2@example.com');
      expect(key1).not.toBe(key2);
    });

    it('should generate different keys than salt key', () => {
      const email = 'user@example.com';
      const saltKey = getUserSaltKey(email);
      const hashKey = getUserPasswordHashKey(email);
      expect(saltKey).not.toBe(hashKey);
    });
  });

  describe('CURRENT_USER_EMAIL_KEY', () => {
    it('should be a fixed string', () => {
      expect(CURRENT_USER_EMAIL_KEY).toBe('user_email');
    });

    it('should be of type string', () => {
      expect(typeof CURRENT_USER_EMAIL_KEY).toBe('string');
    });
  });

  describe('key uniqueness', () => {
    it('should generate unique keys for different purposes', () => {
      const email = 'user@example.com';
      const saltKey = getUserSaltKey(email);
      const hashKey = getUserPasswordHashKey(email);
      
      expect(saltKey).not.toBe(hashKey);
      expect(saltKey).not.toBe(CURRENT_USER_EMAIL_KEY);
      expect(hashKey).not.toBe(CURRENT_USER_EMAIL_KEY);
    });

    it('should handle case sensitivity in email', () => {
      const key1 = getUserSaltKey('User@Example.com');
      const key2 = getUserSaltKey('user@example.com');
      
      // Keys should be different because email is case-sensitive
      expect(key1).not.toBe(key2);
    });
  });
});
