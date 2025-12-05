/**
 * Email Validator Tests
 * Tests for email validation and sanitization
 */

import { sanitizeEmail, validateEmail } from '@/src/utils/validators/emailValidator';

describe('Email Validator', () => {
  describe('validateEmail', () => {
    it('should accept valid email addresses', () => {
      const validEmails = [
        'user@example.com',
        'john.doe@company.co.uk',
        'test+tag@gmail.com',
        'first_last@domain.org',
        'user123@test-domain.com',
        'a@b.co',
      ];

      validEmails.forEach((email) => {
        const result = validateEmail(email);
        expect(result.valid).toBe(true);
        expect(result.message).toBeUndefined();
      });
    });

    it('should reject empty email', () => {
      const result = validateEmail('');
      expect(result.valid).toBe(false);
      expect(result.message).toBe('Email is required.');
    });

    it('should reject whitespace-only email', () => {
      const result = validateEmail('   ');
      expect(result.valid).toBe(false);
      expect(result.message).toBe('Email is required.');
    });

    it('should reject email without @ symbol', () => {
      const result = validateEmail('userexample.com');
      expect(result.valid).toBe(false);
      expect(result.message).toBe('Please enter a valid email address.');
    });

    it('should reject email without domain', () => {
      const result = validateEmail('user@');
      expect(result.valid).toBe(false);
      expect(result.message).toBe('Please enter a valid email address.');
    });

    it('should reject email without local part', () => {
      const result = validateEmail('@example.com');
      expect(result.valid).toBe(false);
      expect(result.message).toBe('Please enter a valid email address.');
    });

    it('should reject email with multiple @ symbols', () => {
      const result = validateEmail('user@@example.com');
      expect(result.valid).toBe(false);
      expect(result.message).toBe('Please enter a valid email address.');
    });

    it('should accept email without TLD (localhost)', () => {
      // Note: 'user@localhost' is technically valid for local development
      const result = validateEmail('user@localhost');
      expect(result.valid).toBe(true);
    });

    it('should reject email with spaces', () => {
      const result = validateEmail('user name@example.com');
      expect(result.valid).toBe(false);
      expect(result.message).toBe('Please enter a valid email address.');
    });

    it('should reject email longer than 254 characters', () => {
      const longEmail = 'a'.repeat(250) + '@example.com'; // 263 characters
      const result = validateEmail(longEmail);
      expect(result.valid).toBe(false);
      expect(result.message).toBe('Email address is too long.');
    });

    it('should reject email with invalid characters', () => {
      const invalidEmails = [
        'user<>@example.com',
        'user"@example.com',
        'user,@example.com',
        'user;@example.com',
      ];

      invalidEmails.forEach((email) => {
        const result = validateEmail(email);
        expect(result.valid).toBe(false);
      });
    });

    it('should accept email with special characters in local part', () => {
      const validEmails = [
        'user+tag@example.com',
        'user.name@example.com',
        'user_name@example.com',
        'user-name@example.com',
      ];

      validEmails.forEach((email) => {
        const result = validateEmail(email);
        expect(result.valid).toBe(true);
      });
    });
  });

  describe('sanitizeEmail', () => {
    it('should convert email to lowercase', () => {
      expect(sanitizeEmail('User@Example.COM')).toBe('user@example.com');
    });

    it('should trim whitespace', () => {
      expect(sanitizeEmail('  user@example.com  ')).toBe('user@example.com');
    });

    it('should handle both trim and lowercase', () => {
      expect(sanitizeEmail('  User@Example.COM  ')).toBe('user@example.com');
    });

    it('should handle already clean email', () => {
      expect(sanitizeEmail('user@example.com')).toBe('user@example.com');
    });

    it('should handle email with tabs and newlines', () => {
      expect(sanitizeEmail('\tuser@example.com\n')).toBe('user@example.com');
    });
  });
});
