/**
 * Password Recovery Service
 * Handles password reset requests, token generation, and validation
 * FR-LOGIN-006 implementation
 */

import * as Crypto from 'expo-crypto';
import * as SecureStore from 'expo-secure-store';
import { getUserPasswordHashKey, getUserSaltKey } from '../../utils/auth/secureStoreKeys';

const RESET_TOKEN_EXPIRY_MS = 60 * 60 * 1000; // 1 hour

interface PasswordResetToken {
  token: string;
  email: string;
  expiresAt: number;
  used: boolean;
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
 * Generate a secure password reset token
 */
async function generateResetToken(): Promise<string> {
  const randomBytes = await Crypto.getRandomBytesAsync(32);
  return Array.from(randomBytes)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

/**
 * Request password reset
 * @returns Reset token and expiry time
 */
export async function requestPasswordReset(email: string): Promise<{
  token: string;
  expiresAt: Date;
  resetLink: string;
}> {
  const sanitizedEmail = sanitizeEmailForKey(email);
  const token = await generateResetToken();
  const expiresAt = Date.now() + RESET_TOKEN_EXPIRY_MS;
  
  const resetData: PasswordResetToken = {
    token,
    email,
    expiresAt,
    used: false,
  };
  
  try {
    // Store reset token
    await SecureStore.setItemAsync(
      `password_reset_${sanitizedEmail}`,
      JSON.stringify(resetData)
    );
    
    // In production, this would be a deep link to your app
    // For now, generate a mock reset link
    const resetLink = `docsshelf://reset-password?token=${token}&email=${encodeURIComponent(email)}`;
    
    // Send reset email
    await sendPasswordResetEmail(email, resetLink, new Date(expiresAt));
    
    console.log(`[Password Reset] Reset token generated for ${email}`);
    console.log(`[Password Reset] Token: ${token}`);
    console.log(`[Password Reset] Link: ${resetLink}`);
    
    return {
      token,
      expiresAt: new Date(expiresAt),
      resetLink,
    };
  } catch (error) {
    console.error('Failed to request password reset:', error);
    throw new Error('Failed to initiate password reset');
  }
}

/**
 * Validate password reset token
 */
export async function validateResetToken(
  email: string,
  token: string
): Promise<{ valid: boolean; message?: string }> {
  const sanitizedEmail = sanitizeEmailForKey(email);
  
  try {
    const data = await SecureStore.getItemAsync(`password_reset_${sanitizedEmail}`);
    if (!data) {
      return { valid: false, message: 'Invalid or expired reset token' };
    }
    
    const resetData: PasswordResetToken = JSON.parse(data);
    
    // Check if token matches
    if (resetData.token !== token) {
      return { valid: false, message: 'Invalid reset token' };
    }
    
    // Check if already used
    if (resetData.used) {
      return { valid: false, message: 'Reset token has already been used' };
    }
    
    // Check if expired
    if (Date.now() > resetData.expiresAt) {
      return { valid: false, message: 'Reset token has expired. Please request a new one.' };
    }
    
    return { valid: true };
  } catch (error) {
    console.error('Failed to validate reset token:', error);
    return { valid: false, message: 'Failed to validate reset token' };
  }
}

/**
 * Reset password using valid token
 */
export async function resetPassword(
  email: string,
  token: string,
  newPasswordHash: string,
  newSalt: string
): Promise<{ success: boolean; message?: string }> {
  // Validate token first
  const validation = await validateResetToken(email, token);
  if (!validation.valid) {
    return { success: false, message: validation.message };
  }
  
  const sanitizedEmail = sanitizeEmailForKey(email);
  
  try {
    // Update password in SecureStore for this specific user
    await SecureStore.setItemAsync(getUserSaltKey(email), newSalt);
    await SecureStore.setItemAsync(getUserPasswordHashKey(email), newPasswordHash);
    
    // Mark token as used
    const data = await SecureStore.getItemAsync(`password_reset_${sanitizedEmail}`);
    if (data) {
      const resetData: PasswordResetToken = JSON.parse(data);
      resetData.used = true;
      await SecureStore.setItemAsync(
        `password_reset_${sanitizedEmail}`,
        JSON.stringify(resetData)
      );
    }
    
    // Clear any account lockouts
    await SecureStore.deleteItemAsync(`failed_attempts_${sanitizedEmail}`);
    
    console.log(`[Password Reset] Password reset successful for ${email}`);
    
    // Send confirmation email
    await sendPasswordResetConfirmation(email);
    
    return { success: true };
  } catch (error) {
    console.error('Failed to reset password:', error);
    return { success: false, message: 'Failed to reset password' };
  }
}

/**
 * Send password reset email
 * TODO: Implement actual email sending service integration
 */
async function sendPasswordResetEmail(
  email: string,
  resetLink: string,
  expiresAt: Date
): Promise<void> {
  const message = `
    Password Reset Request - DocsShelf
    
    We received a request to reset your password for your DocsShelf account (${email}).
    
    To reset your password, click the link below:
    
    ${resetLink}
    
    This link will expire at: ${expiresAt.toLocaleString()}
    
    If you didn't request this password reset, please ignore this email. Your password will remain unchanged.
    
    For security reasons, this link can only be used once and will expire in 1 hour.
    
    If you're having trouble clicking the link, copy and paste it into your browser.
    
    - The DocsShelf Team
  `;
  
  console.log('[Email Notification] Password Reset Request', message);
  
  // TODO: Actual implementation with email service
  // await emailService.send({
  //   to: email,
  //   subject: 'Password Reset Request - DocsShelf',
  //   body: message,
  // });
}

/**
 * Send password reset confirmation email
 */
async function sendPasswordResetConfirmation(email: string): Promise<void> {
  const message = `
    Password Reset Successful - DocsShelf
    
    Your DocsShelf account password (${email}) has been successfully reset.
    
    If you did not make this change, please contact support immediately and consider:
    1. Enabling two-factor authentication
    2. Reviewing your recent account activity
    3. Updating your recovery email
    
    Your account security is important to us.
    
    - The DocsShelf Team
  `;
  
  console.log('[Email Notification] Password Reset Confirmation', message);
  
  // TODO: Actual implementation with email service
}

/**
 * Cancel password reset request
 */
export async function cancelPasswordReset(email: string): Promise<void> {
  const sanitizedEmail = sanitizeEmailForKey(email);
  
  try {
    await SecureStore.deleteItemAsync(`password_reset_${sanitizedEmail}`);
    console.log(`[Password Reset] Reset request cancelled for ${email}`);
  } catch (error) {
    console.error('Failed to cancel password reset:', error);
  }
}

/**
 * Check if there's a pending password reset request
 */
export async function hasPendingReset(email: string): Promise<boolean> {
  const sanitizedEmail = sanitizeEmailForKey(email);
  
  try {
    const data = await SecureStore.getItemAsync(`password_reset_${sanitizedEmail}`);
    if (!data) {
      return false;
    }
    
    const resetData: PasswordResetToken = JSON.parse(data);
    return !resetData.used && Date.now() < resetData.expiresAt;
  } catch (error) {
    console.error('Failed to check pending reset:', error);
    return false;
  }
}
