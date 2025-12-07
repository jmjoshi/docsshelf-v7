/**
 * Account Security Service
 * Handles account lockout, failed login tracking, and security notifications
 * FR-LOGIN-005 implementation
 */

import * as SecureStore from 'expo-secure-store';
import { emailService } from '../email/emailService';

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
    console.log(`[AccountSecurity] Recording failed attempt for ${email}: count ${attempts.count} -> ${newCount}`);
    
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
    const previousAttempts = await getFailedAttempts(email);
    await SecureStore.deleteItemAsync(key);
    console.log(`[AccountSecurity] Reset failed attempts for ${email}: ${previousAttempts.count} failures cleared`);
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
 */
async function sendLockoutNotification(email: string, lockedUntil: number): Promise<void> {
  const lockoutDate = new Date(lockedUntil);
  
  const textBody = `
Security Alert: Account Lockout

Your DocsShelf account (${email}) has been locked due to multiple failed login attempts.

Lockout Details:
- Reason: 5 consecutive failed login attempts
- Locked Until: ${lockoutDate.toLocaleString()}
- Duration: 15 minutes

If this wasn't you, please secure your account immediately by resetting your password.

The lockout will automatically expire after 15 minutes, or you can reset your password to unlock immediately.

- The DocsShelf Team
  `;

  const htmlBody = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background-color: #d32f2f; color: white; padding: 20px; text-align: center; }
    .content { padding: 20px; background-color: #f9f9f9; }
    .footer { padding: 20px; text-align: center; color: #666; font-size: 12px; }
    .alert-box { background-color: #ffebee; border-left: 4px solid #d32f2f; padding: 15px; margin: 15px 0; }
    .info-table { width: 100%; background-color: white; border-collapse: collapse; margin: 15px 0; }
    .info-table td { padding: 10px; border: 1px solid #ddd; }
    .info-table td:first-child { font-weight: bold; width: 40%; background-color: #f5f5f5; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🔒 Security Alert: Account Lockout</h1>
    </div>
    <div class="content">
      <div class="alert-box">
        <strong>⚠️ Your account has been temporarily locked</strong>
        <p>Your DocsShelf account (<strong>${email}</strong>) has been locked due to multiple failed login attempts.</p>
      </div>
      
      <h3>Lockout Details:</h3>
      <table class="info-table">
        <tr>
          <td>Reason</td>
          <td>5 consecutive failed login attempts</td>
        </tr>
        <tr>
          <td>Locked Until</td>
          <td><strong>${lockoutDate.toLocaleString()}</strong></td>
        </tr>
        <tr>
          <td>Duration</td>
          <td>15 minutes</td>
        </tr>
      </table>
      
      <h3>What to do:</h3>
      <ul>
        <li><strong>If this was you:</strong> Wait 15 minutes and try again with the correct password</li>
        <li><strong>If this wasn't you:</strong> Reset your password immediately to secure your account</li>
      </ul>
      
      <p style="margin-top: 20px;">The lockout will automatically expire after 15 minutes, or you can reset your password to unlock immediately.</p>
    </div>
    <div class="footer">
      <p>This is an automated security message from DocsShelf. Please do not reply to this email.</p>
      <p>&copy; ${new Date().getFullYear()} DocsShelf. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
  `;
  
  console.log('[Account Security] Sending lockout notification to:', email);
  
  try {
    const result = await emailService.send({
      to: email,
      subject: '🔒 Security Alert: Account Lockout - DocsShelf',
      body: textBody,
      html: htmlBody,
    });

    if (result.success) {
      console.log('[Account Security] Lockout notification sent successfully');
    } else {
      console.error('[Account Security] Lockout notification send failed:', result.error);
    }
  } catch (error) {
    console.error('[Account Security] Lockout notification service error:', error);
  }
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
