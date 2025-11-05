/**
 * Phone number validation and formatting utility
 */

import { PhoneValidationResult } from '../../types/user';

/**
 * Validates and formats a phone number
 * Accepts various formats and returns standardized format
 * @param phone - The phone number to validate
 * @param required - Whether the phone number is required
 * @returns ValidationResult with formatted number
 */
export function validatePhone(phone: string, required: boolean = false): PhoneValidationResult {
  // If empty and not required, return valid
  if (!phone || phone.trim() === '') {
    if (required) {
      return {
        valid: false,
        message: 'Phone number is required',
      };
    }
    return {
      valid: true,
    };
  }

  // Remove all non-digit characters
  const digitsOnly = phone.replace(/\D/g, '');

  // Check for valid length
  // US numbers: 10 digits
  // International: typically 7-15 digits
  if (digitsOnly.length < 7 || digitsOnly.length > 15) {
    return {
      valid: false,
      message: 'Phone number must be between 7 and 15 digits',
    };
  }

  // Format US numbers (10 digits) as (XXX) XXX-XXXX
  let formatted: string;
  if (digitsOnly.length === 10) {
    formatted = `(${digitsOnly.slice(0, 3)}) ${digitsOnly.slice(3, 6)}-${digitsOnly.slice(6)}`;
  } else if (digitsOnly.length === 11 && digitsOnly[0] === '1') {
    // US number with country code
    formatted = `+1 (${digitsOnly.slice(1, 4)}) ${digitsOnly.slice(4, 7)}-${digitsOnly.slice(7)}`;
  } else {
    // International format: add + prefix if not present
    formatted = digitsOnly[0] === '1' ? `+${digitsOnly}` : `+${digitsOnly}`;
  }

  return {
    valid: true,
    formatted,
  };
}

/**
 * Sanitize phone number (remove formatting, keep digits only)
 */
export function sanitizePhone(phone: string): string {
  return phone.replace(/\D/g, '');
}
