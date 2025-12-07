/**
 * Password Recovery Service
 * Handles password reset requests, token generation, and validation
 * FR-LOGIN-006 implementation
 */

import * as Crypto from 'expo-crypto';
import * as SecureStore from 'expo-secure-store';
import { getUserPasswordHashKey, getUserSaltKey } from '../../utils/auth/secureStoreKeys';
import { emailService } from '../email/emailService';

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
 */
async function sendPasswordResetEmail(
  email: string,
  resetLink: string,
  expiresAt: Date
): Promise<void> {
  const textBody = `
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

  const htmlBody = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background-color: #007AFF; color: white; padding: 20px; text-align: center; }
    .content { padding: 20px; background-color: #f9f9f9; }
    .button { display: inline-block; padding: 12px 24px; background-color: #007AFF; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
    .footer { padding: 20px; text-align: center; color: #666; font-size: 12px; }
    .warning { background-color: #fff3cd; border-left: 4px solid #ffc107; padding: 10px; margin: 15px 0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Password Reset Request</h1>
    </div>
    <div class="content">
      <p>Hello,</p>
      <p>We received a request to reset your password for your DocsShelf account (<strong>${email}</strong>).</p>
      <p>To reset your password, click the button below:</p>
      <center>
        <a href="${resetLink}" class="button">Reset Password</a>
      </center>
      <p>Or copy and paste this link into your browser:</p>
      <p style="word-break: break-all; background-color: #f0f0f0; padding: 10px; border-radius: 5px;">${resetLink}</p>
      <div class="warning">
        <strong>⚠️ Security Information:</strong>
        <ul>
          <li>This link will expire at: <strong>${expiresAt.toLocaleString()}</strong></li>
          <li>The link can only be used once</li>
          <li>If you didn't request this reset, you can safely ignore this email</li>
        </ul>
      </div>
    </div>
    <div class="footer">
      <p>This is an automated message from DocsShelf. Please do not reply to this email.</p>
      <p>&copy; ${new Date().getFullYear()} DocsShelf. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
  `;
  
  console.log('[Password Reset] Sending email to:', email);
  
  try {
    const result = await emailService.send({
      to: email,
      subject: 'Password Reset Request - DocsShelf',
      body: textBody,
      html: htmlBody,
    });

    if (result.success) {
      console.log('[Password Reset] Email sent successfully');
    } else {
      console.error('[Password Reset] Email send failed:', result.error);
      // Don't throw error to avoid breaking the flow
      // The reset token is still valid even if email fails
    }
  } catch (error) {
    console.error('[Password Reset] Email service error:', error);
    // Continue even if email fails
  }
}

/**
 * Send password reset confirmation email
 */
async function sendPasswordResetConfirmation(email: string): Promise<void> {
  const textBody = `
Password Reset Successful - DocsShelf

Your DocsShelf account password (${email}) has been successfully reset.

If you did not make this change, please contact support immediately and consider:
1. Enabling two-factor authentication
2. Reviewing your recent account activity
3. Updating your recovery email

Your account security is important to us.

- The DocsShelf Team
  `;

  const htmlBody = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background-color: #4caf50; color: white; padding: 20px; text-align: center; }
    .content { padding: 20px; background-color: #f9f9f9; }
    .footer { padding: 20px; text-align: center; color: #666; font-size: 12px; }
    .success-icon { font-size: 48px; text-align: center; margin: 20px 0; }
    .warning { background-color: #fff3cd; border-left: 4px solid #ffc107; padding: 10px; margin: 15px 0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>✓ Password Reset Successful</h1>
    </div>
    <div class="content">
      <p>Hello,</p>
      <p>Your DocsShelf account password (<strong>${email}</strong>) has been successfully reset.</p>
      <p>You can now log in with your new password.</p>
      <div class="warning">
        <strong>⚠️ Didn't make this change?</strong>
        <p>If you did not reset your password, please contact support immediately and consider:</p>
        <ul>
          <li>Enabling two-factor authentication</li>
          <li>Reviewing your recent account activity</li>
          <li>Updating your recovery email</li>
        </ul>
      </div>
      <p>Your account security is important to us.</p>
    </div>
    <div class="footer">
      <p>This is an automated message from DocsShelf. Please do not reply to this email.</p>
      <p>&copy; ${new Date().getFullYear()} DocsShelf. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
  `;
  
  console.log('[Password Reset] Sending confirmation email to:', email);
  
  try {
    const result = await emailService.send({
      to: email,
      subject: 'Password Reset Successful - DocsShelf',
      body: textBody,
      html: htmlBody,
    });

    if (result.success) {
      console.log('[Password Reset] Confirmation email sent successfully');
    } else {
      console.error('[Password Reset] Confirmation email send failed:', result.error);
    }
  } catch (error) {
    console.error('[Password Reset] Confirmation email service error:', error);
  }
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
