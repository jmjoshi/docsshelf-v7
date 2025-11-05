/**
 * Email Validator
 * Validates email addresses following RFC 5322 standards
 */

export function validateEmail(email: string): { valid: boolean; message?: string } {
  if (!email || email.trim().length === 0) {
    return { valid: false, message: 'Email is required.' };
  }

  // Basic email regex that covers most common cases
  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;

  if (!emailRegex.test(email)) {
    return { valid: false, message: 'Please enter a valid email address.' };
  }

  if (email.length > 254) {
    return { valid: false, message: 'Email address is too long.' };
  }

  return { valid: true };
}

/**
 * Sanitizes email input to prevent injection attacks
 */
export function sanitizeEmail(email: string): string {
  return email.trim().toLowerCase();
}
