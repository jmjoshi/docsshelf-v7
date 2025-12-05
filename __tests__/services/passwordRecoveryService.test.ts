/**
 * Tests for Password Recovery Service
 * Testing password reset functionality
 */

import * as Crypto from 'expo-crypto';
import * as SecureStore from 'expo-secure-store';
import {
    cancelPasswordReset,
    hasPendingReset,
    requestPasswordReset,
    resetPassword,
    validateResetToken,
} from '../../src/services/auth/passwordRecoveryService';

// Mock console methods
const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();
const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

describe('Password Recovery Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterAll(() => {
    consoleLogSpy.mockRestore();
    consoleErrorSpy.mockRestore();
  });

  describe('requestPasswordReset', () => {
    it('should generate a reset token and expiry', async () => {
      const email = 'user@example.com';
      const result = await requestPasswordReset(email);

      expect(result.token).toBeDefined();
      expect(result.token).toHaveLength(64); // 32 bytes * 2 hex chars
      expect(result.expiresAt).toBeInstanceOf(Date);
      expect(result.resetLink).toContain('docsshelf://reset-password');
      expect(result.resetLink).toContain(encodeURIComponent(email));
    });

    it('should store reset token in SecureStore', async () => {
      const email = 'test@example.com';
      await requestPasswordReset(email);

      expect(SecureStore.setItemAsync).toHaveBeenCalledWith(
        'password_reset_test_at_example.com',
        expect.any(String)
      );
    });

    it('should set expiry to 1 hour from now', async () => {
      const now = Date.now();
      const email = 'user@example.com';
      const result = await requestPasswordReset(email);

      const expectedExpiry = now + 60 * 60 * 1000; // 1 hour
      const actualExpiry = result.expiresAt.getTime();

      expect(actualExpiry).toBeGreaterThanOrEqual(expectedExpiry - 1000); // Allow 1s tolerance
      expect(actualExpiry).toBeLessThanOrEqual(expectedExpiry + 1000);
    });

    it('should generate unique tokens for multiple requests', async () => {
      const result1 = await requestPasswordReset('user1@example.com');
      const result2 = await requestPasswordReset('user2@example.com');

      expect(result1.token).not.toBe(result2.token);
    });

    it('should sanitize email in storage key', async () => {
      const email = 'user+test@example.com';
      await requestPasswordReset(email);

      expect(SecureStore.setItemAsync).toHaveBeenCalledWith(
        'password_reset_user_test_at_example.com',
        expect.any(String)
      );
    });

    it('should log reset request', async () => {
      const email = 'user@example.com';
      await requestPasswordReset(email);

      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining('[Password Reset] Reset token generated for')
      );
    });

    it('should handle storage errors', async () => {
      (SecureStore.setItemAsync as jest.Mock).mockRejectedValueOnce(new Error('Storage error'));

      await expect(requestPasswordReset('user@example.com')).rejects.toThrow(
        'Failed to initiate password reset'
      );
    });
  });

  describe('validateResetToken', () => {
    it('should validate a valid token', async () => {
      const email = 'user@example.com';
      const { token } = await requestPasswordReset(email);

      const result = await validateResetToken(email, token);

      expect(result.valid).toBe(true);
      expect(result.message).toBeUndefined();
    });

    it('should reject invalid token', async () => {
      const email = 'user@example.com';
      await requestPasswordReset(email);

      const result = await validateResetToken(email, 'invalid_token');

      expect(result.valid).toBe(false);
      expect(result.message).toBe('Invalid reset token');
    });

    it('should reject non-existent token', async () => {
      const result = await validateResetToken('nobody@example.com', 'any_token');

      expect(result.valid).toBe(false);
      expect(result.message).toBe('Invalid or expired reset token');
    });

    it('should reject used token', async () => {
      const email = 'user@example.com';
      const { token } = await requestPasswordReset(email);

      // Mark token as used
      const storedData = await SecureStore.getItemAsync('password_reset_user_at_example.com');
      const resetData = JSON.parse(storedData!);
      resetData.used = true;
      await SecureStore.setItemAsync(
        'password_reset_user_at_example.com',
        JSON.stringify(resetData)
      );

      const result = await validateResetToken(email, token);

      expect(result.valid).toBe(false);
      expect(result.message).toBe('Reset token has already been used');
    });

    it('should reject expired token', async () => {
      const email = 'user@example.com';
      const { token } = await requestPasswordReset(email);

      // Set token to expired
      const storedData = await SecureStore.getItemAsync('password_reset_user_at_example.com');
      const resetData = JSON.parse(storedData!);
      resetData.expiresAt = Date.now() - 1000; // 1 second ago
      await SecureStore.setItemAsync(
        'password_reset_user_at_example.com',
        JSON.stringify(resetData)
      );

      const result = await validateResetToken(email, token);

      expect(result.valid).toBe(false);
      expect(result.message).toContain('expired');
    });

    it('should handle validation errors', async () => {
      (SecureStore.getItemAsync as jest.Mock).mockRejectedValueOnce(new Error('Storage error'));

      const result = await validateResetToken('user@example.com', 'any_token');

      expect(result.valid).toBe(false);
      expect(result.message).toBe('Failed to validate reset token');
    });
  });

  describe('resetPassword', () => {
    it('should reset password with valid token', async () => {
      const email = 'user@example.com';
      const { token } = await requestPasswordReset(email);
      const newHash = 'new_password_hash';
      const newSalt = 'new_salt';

      const result = await resetPassword(email, token, newHash, newSalt);

      expect(result.success).toBe(true);
      expect(SecureStore.setItemAsync).toHaveBeenCalledWith(
        'user_user_at_example.com_salt',
        newSalt
      );
      expect(SecureStore.setItemAsync).toHaveBeenCalledWith(
        'user_user_at_example.com_password_hash',
        newHash
      );
    });

    it('should mark token as used after reset', async () => {
      const email = 'user@example.com';
      const { token } = await requestPasswordReset(email);

      await resetPassword(email, token, 'hash', 'salt');

      const storedData = await SecureStore.getItemAsync('password_reset_user_at_example.com');
      const resetData = JSON.parse(storedData!);

      expect(resetData.used).toBe(true);
    });

    it('should clear failed login attempts', async () => {
      const email = 'user@example.com';
      const { token } = await requestPasswordReset(email);

      await resetPassword(email, token, 'hash', 'salt');

      expect(SecureStore.deleteItemAsync).toHaveBeenCalledWith(
        'failed_attempts_user_at_example.com'
      );
    });

    it('should reject invalid token', async () => {
      const result = await resetPassword('user@example.com', 'invalid_token', 'hash', 'salt');

      expect(result.success).toBe(false);
      expect(result.message).toBeDefined();
    });

    it('should reject expired token', async () => {
      const email = 'user@example.com';
      const { token } = await requestPasswordReset(email);

      // Expire token
      const storedData = await SecureStore.getItemAsync('password_reset_user_at_example.com');
      const resetData = JSON.parse(storedData!);
      resetData.expiresAt = Date.now() - 1000;
      await SecureStore.setItemAsync(
        'password_reset_user_at_example.com',
        JSON.stringify(resetData)
      );

      const result = await resetPassword(email, token, 'hash', 'salt');

      expect(result.success).toBe(false);
      expect(result.message).toContain('expired');
    });

    it('should reject used token', async () => {
      const email = 'user@example.com';
      const { token } = await requestPasswordReset(email);

      // Use token once
      await resetPassword(email, token, 'hash1', 'salt1');

      // Try to use again
      const result = await resetPassword(email, token, 'hash2', 'salt2');

      expect(result.success).toBe(false);
      expect(result.message).toContain('already been used');
    });

    it('should handle reset errors', async () => {
      const email = 'user@example.com';
      const { token } = await requestPasswordReset(email);

      (SecureStore.setItemAsync as jest.Mock).mockRejectedValueOnce(new Error('Storage error'));

      const result = await resetPassword(email, token, 'hash', 'salt');

      expect(result.success).toBe(false);
      expect(result.message).toBe('Failed to reset password');
    });

    it('should log successful reset', async () => {
      const email = 'user@example.com';
      const { token } = await requestPasswordReset(email);

      await resetPassword(email, token, 'hash', 'salt');

      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining('[Password Reset] Password reset successful')
      );
    });
  });

  describe('cancelPasswordReset', () => {
    it('should delete reset token', async () => {
      const email = 'user@example.com';
      await requestPasswordReset(email);

      await cancelPasswordReset(email);

      expect(SecureStore.deleteItemAsync).toHaveBeenCalledWith(
        'password_reset_user_at_example.com'
      );
    });

    it('should handle deletion errors gracefully', async () => {
      (SecureStore.deleteItemAsync as jest.Mock).mockRejectedValueOnce(
        new Error('Storage error')
      );

      await expect(cancelPasswordReset('user@example.com')).resolves.not.toThrow();
    });

    it('should log cancellation', async () => {
      const email = 'user@example.com';
      await cancelPasswordReset(email);

      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining('[Password Reset] Reset request cancelled')
      );
    });
  });

  describe('hasPendingReset', () => {
    it('should return true for pending reset', async () => {
      const email = 'user@example.com';
      await requestPasswordReset(email);

      const hasPending = await hasPendingReset(email);

      expect(hasPending).toBe(true);
    });

    it('should return false for no reset', async () => {
      const hasPending = await hasPendingReset('nobody@example.com');

      expect(hasPending).toBe(false);
    });

    it('should return false for used token', async () => {
      const email = 'user@example.com';
      const { token } = await requestPasswordReset(email);

      await resetPassword(email, token, 'hash', 'salt');

      const hasPending = await hasPendingReset(email);

      expect(hasPending).toBe(false);
    });

    it('should return false for expired token', async () => {
      const email = 'user@example.com';
      await requestPasswordReset(email);

      // Expire token
      const storedData = await SecureStore.getItemAsync('password_reset_user_at_example.com');
      const resetData = JSON.parse(storedData!);
      resetData.expiresAt = Date.now() - 1000;
      await SecureStore.setItemAsync(
        'password_reset_user_at_example.com',
        JSON.stringify(resetData)
      );

      const hasPending = await hasPendingReset(email);

      expect(hasPending).toBe(false);
    });

    it('should handle check errors', async () => {
      (SecureStore.getItemAsync as jest.Mock).mockRejectedValueOnce(new Error('Storage error'));

      const hasPending = await hasPendingReset('user@example.com');

      expect(hasPending).toBe(false);
    });
  });

  describe('email sanitization', () => {
    it('should sanitize email with special characters', async () => {
      const email = 'user+test@example.com';
      await requestPasswordReset(email);

      expect(SecureStore.setItemAsync).toHaveBeenCalledWith(
        'password_reset_user_test_at_example.com',
        expect.any(String)
      );
    });

    it('should handle multiple @ symbols', async () => {
      const email = 'user@@example.com';
      await requestPasswordReset(email);

      expect(SecureStore.setItemAsync).toHaveBeenCalledWith(
        'password_reset_user_at__at_example.com',
        expect.any(String)
      );
    });

    it('should preserve dots and hyphens', async () => {
      const email = 'user.name-test@example.com';
      await requestPasswordReset(email);

      expect(SecureStore.setItemAsync).toHaveBeenCalledWith(
        'password_reset_user.name-test_at_example.com',
        expect.any(String)
      );
    });
  });

  describe('security properties', () => {
    it('should generate cryptographically secure tokens', async () => {
      const { token } = await requestPasswordReset('user@example.com');

      expect(Crypto.getRandomBytesAsync).toHaveBeenCalledWith(32);
      expect(token).toMatch(/^[0-9a-f]{64}$/); // Hex string
    });

    it('should not expose token in error messages', async () => {
      const email = 'user@example.com';
      const { token } = await requestPasswordReset(email);

      const result = await validateResetToken(email, 'wrong_token');

      expect(result.message).not.toContain(token);
    });

    it('should enforce single use of tokens', async () => {
      const email = 'user@example.com';
      const { token } = await requestPasswordReset(email);

      await resetPassword(email, token, 'hash1', 'salt1');
      const result = await resetPassword(email, token, 'hash2', 'salt2');

      expect(result.success).toBe(false);
    });

    it('should enforce token expiry', async () => {
      const email = 'user@example.com';
      const { token, expiresAt } = await requestPasswordReset(email);

      const oneHourFromNow = Date.now() + 60 * 60 * 1000;
      expect(expiresAt.getTime()).toBeLessThanOrEqual(oneHourFromNow + 1000);
    });
  });
});
