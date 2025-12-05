/**
 * Phone Validator Tests
 * Tests for phone number validation and formatting
 */

import { sanitizePhone, validatePhone } from '@/src/utils/validators/phoneValidator';

describe('Phone Validator', () => {
  describe('validatePhone', () => {
    it('should accept empty phone when not required', () => {
      const result = validatePhone('', false);
      expect(result.valid).toBe(true);
      expect(result.formatted).toBeUndefined();
    });

    it('should reject empty phone when required', () => {
      const result = validatePhone('', true);
      expect(result.valid).toBe(false);
      expect(result.message).toBe('Phone number is required');
    });

    it('should format 10-digit US number', () => {
      const result = validatePhone('1234567890');
      expect(result.valid).toBe(true);
      expect(result.formatted).toBe('(123) 456-7890');
    });

    it('should format US number with country code', () => {
      const result = validatePhone('11234567890');
      expect(result.valid).toBe(true);
      expect(result.formatted).toBe('+1 (123) 456-7890');
    });

    it('should accept phone with dashes', () => {
      const result = validatePhone('123-456-7890');
      expect(result.valid).toBe(true);
      expect(result.formatted).toBe('(123) 456-7890');
    });

    it('should accept phone with parentheses and spaces', () => {
      const result = validatePhone('(123) 456-7890');
      expect(result.valid).toBe(true);
      expect(result.formatted).toBe('(123) 456-7890');
    });

    it('should accept phone with dots', () => {
      const result = validatePhone('123.456.7890');
      expect(result.valid).toBe(true);
      expect(result.formatted).toBe('(123) 456-7890');
    });

    it('should format international number with + prefix', () => {
      const result = validatePhone('+442071234567'); // UK number
      expect(result.valid).toBe(true);
      expect(result.formatted).toBe('+442071234567');
    });

    it('should add + prefix to international number without it', () => {
      const result = validatePhone('442071234567'); // UK number without +
      expect(result.valid).toBe(true);
      expect(result.formatted).toBe('+442071234567');
    });

    it('should reject phone number too short', () => {
      const result = validatePhone('12345'); // Only 5 digits
      expect(result.valid).toBe(false);
      expect(result.message).toBe('Phone number must be between 7 and 15 digits');
    });

    it('should reject phone number too long', () => {
      const result = validatePhone('1234567890123456'); // 16 digits
      expect(result.valid).toBe(false);
      expect(result.message).toBe('Phone number must be between 7 and 15 digits');
    });

    it('should accept 7-digit local number', () => {
      const result = validatePhone('1234567');
      expect(result.valid).toBe(true);
      expect(result.formatted).toBe('+1234567');
    });

    it('should accept 15-digit international number', () => {
      const result = validatePhone('123456789012345'); // Max length
      expect(result.valid).toBe(true);
      expect(result.formatted).toBe('+123456789012345');
    });

    it('should handle phone with letters (remove them)', () => {
      const result = validatePhone('1-800-FLOWERS'); // 1-800-356-9377
      expect(result.valid).toBe(false); // Only 6 digits after removing letters
    });

    it('should handle whitespace-only input', () => {
      const result = validatePhone('   ', false);
      expect(result.valid).toBe(true);
    });

    it('should handle phone with special characters', () => {
      const result = validatePhone('+1 (123) 456-7890');
      expect(result.valid).toBe(true);
      expect(result.formatted).toBe('+1 (123) 456-7890');
    });
  });

  describe('sanitizePhone', () => {
    it('should remove all non-digit characters', () => {
      expect(sanitizePhone('(123) 456-7890')).toBe('1234567890');
    });

    it('should remove + prefix', () => {
      expect(sanitizePhone('+1234567890')).toBe('1234567890');
    });

    it('should remove spaces, dashes, and parentheses', () => {
      expect(sanitizePhone('+1 (123) 456-7890')).toBe('11234567890');
    });

    it('should remove dots', () => {
      expect(sanitizePhone('123.456.7890')).toBe('1234567890');
    });

    it('should handle already clean number', () => {
      expect(sanitizePhone('1234567890')).toBe('1234567890');
    });

    it('should handle empty string', () => {
      expect(sanitizePhone('')).toBe('');
    });

    it('should remove letters', () => {
      expect(sanitizePhone('1-800-CALL')).toBe('1800');
    });
  });
});
