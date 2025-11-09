/**
 * Account Security Service
 * Handles account lockout, failed login tracking, and security notifications
 * FR-LOGIN-005 implementation
 */

import * as SecureStore from 'expo-secure-store';

const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_DURATION_MS = 15 * 60 * 1000; // 15 minutes

interface FailedLoginAttempt {
  count: number;
  lockedUntil?: number;
  lastAttempt: number;
}

/**
 * Sanitize email for use as SecureStore key
 */
function sanitizeEmailForKey(email: string): string {
  return email
    .replace(/@/g, '_at_')
    .replace(/[^a-zA-Z0-9.\-_]/g, '_');
}

/**
 * Get failed login attempts for user
 */
export async function getFailedAttempts(email: string): Promise<FailedLoginAttempt> {
  const sanitizedEmail = sanitizeEmailForKey(email);
  const key = `failed_attempts_${sanitizedEmail}`;
  
  try {
    const data = await SecureStore.getItemAsync(key);
    if (!data) {
      return { count: 0, lastAttempt: Date.now() };
    }
    return JSON.parse(data);
  } catch (error) {
    console.error('Failed to get failed attempts:', error);
    return { count: 0, lastAttempt: Date.now() };
  }
}

/**
 * Record a failed login attempt
 * @returns true if account is now locked, false otherwise
 */
export async function recordFailedAttempt(email: string): Promise<boolean> {
  const sanitizedEmail = sanitizeEmailForKey(email);
  const key = `failed_attempts_${sanitizedEmail}`;
  
  try {
    const attempts = await getFailedAttempts(email);
    const newCount = attempts.count + 1;
    
    let lockedUntil: number | undefined;
    if (newCount >= MAX_FAILED_ATTEMPTS) {
      lockedUntil = Date.now() + LOCKOUT_DURATION_MS;
      console.log(`Account locked for ${email} until ${new Date(lockedUntil).toISOString()}`);
      
      // Send lockout notification (implementation depends on email service)
      await sendLockoutNotification(email, lockedUntil);
    }
    
    const failedAttempt: FailedLoginAttempt = {
      count: newCount,
      lockedUntil,
      lastAttempt: Date.now(),
    };
    
    await SecureStore.setItemAsync(key, JSON.stringify(failedAttempt));
    
    return newCount >= MAX_FAILED_ATTEMPTS;
  } catch (error) {
    console.error('Failed to record failed attempt:', error);
    return false;
  }
}

/**
 * Reset failed login attempts (after successful login)
 */
export async function resetFailedAttempts(email: string): Promise<void> {
  const sanitizedEmail = sanitizeEmailForKey(email);
  const key = `failed_attempts_${sanitizedEmail}`;
  
  try {
    await SecureStore.deleteItemAsync(key);
  } catch (error) {
    console.error('Failed to reset failed attempts:', error);
  }
}

/**
 * Check if account is currently locked
 * @returns Object with isLocked boolean and remaining time in milliseconds
 */
export async function isAccountLocked(email: string): Promise<{
  isLocked: boolean;
  remainingTime: number;
  attemptsRemaining: number;
}> {
  const attempts = await getFailedAttempts(email);
  
  if (attempts.lockedUntil) {
    const now = Date.now();
    if (now < attempts.lockedUntil) {
      // Account is still locked
      return {
        isLocked: true,
        remainingTime: attempts.lockedUntil - now,
        attemptsRemaining: 0,
      };
    } else {
      // Lockout period expired, reset attempts
      await resetFailedAttempts(email);
      return {
        isLocked: false,
        remainingTime: 0,
        attemptsRemaining: MAX_FAILED_ATTEMPTS,
      };
    }
  }
  
  return {
    isLocked: false,
    remainingTime: 0,
    attemptsRemaining: MAX_FAILED_ATTEMPTS - attempts.count,
  };
}

/**
 * Format remaining lockout time for display
 */
export function formatLockoutTime(milliseconds: number): string {
  const minutes = Math.ceil(milliseconds / (60 * 1000));
  if (minutes === 1) {
    return '1 minute';
  }
  return `${minutes} minutes`;
}

/**
 * Send lockout notification email
 * TODO: Implement actual email sending service integration
 */
async function sendLockoutNotification(email: string, lockedUntil: number): Promise<void> {
  // Placeholder for email service integration
  // In production, integrate with services like:
  // - SendGrid
  // - AWS SES
  // - Firebase Cloud Functions
  // - Expo Notifications (push)
  
  const lockoutDate = new Date(lockedUntil);
  const message = `
    Security Alert: Account Lockout
    
    Your DocsShelf account (${email}) has been locked due to multiple failed login attempts.
    
    Lockout Details:
    - Reason: 5 consecutive failed login attempts
    - Locked Until: ${lockoutDate.toLocaleString()}
    - Duration: 15 minutes
    
    If this wasn't you, please secure your account immediately.
    
    The lockout will automatically expire after 15 minutes, or you can reset your password to unlock immediately.
    
    - The DocsShelf Team
  `;
  
  console.log('[Email Notification]', message);
  
  // TODO: Actual implementation
  // await emailService.send({
  //   to: email,
  //   subject: 'Security Alert: Account Lockout - DocsShelf',
  //   body: message,
  // });
}

/**
 * Get account security status summary
 */
export async function getAccountSecurityStatus(email: string): Promise<{
  failedAttempts: number;
  isLocked: boolean;
  lockedUntil?: Date;
  attemptsRemaining: number;
}> {
  const attempts = await getFailedAttempts(email);
  const lockStatus = await isAccountLocked(email);
  
  return {
    failedAttempts: attempts.count,
    isLocked: lockStatus.isLocked,
    lockedUntil: attempts.lockedUntil ? new Date(attempts.lockedUntil) : undefined,
    attemptsRemaining: lockStatus.attemptsRemaining,
  };
}
