/**
 * MFA Service Tests
 * Tests for Multi-Factor Authentication (TOTP and Biometric)
 */

import * as mfaService from '@/src/services/auth/mfaService';
import * as LocalAuthentication from 'expo-local-authentication';
import * as SecureStore from 'expo-secure-store';

import { db } from '@/src/services/database/dbInit';
import { generateTOTPSecret, generateTOTPUri, verifyTOTPCode } from '@/src/utils/crypto/totp';

// Mock expo-local-authentication
jest.mock('expo-local-authentication');

// Mock expo-secure-store
jest.mock('expo-secure-store');

// Mock TOTP utilities
jest.mock('@/src/utils/crypto/totp', () => ({
  generateTOTPSecret: jest.fn(() => Promise.resolve('JBSWY3DPEHPK3PXP')),
  generateTOTPUri: jest.fn((secret, email, issuer) => 
    `otpauth://totp/${issuer}:${email}?secret=${secret}&issuer=${issuer}`
  ),
  verifyTOTPCode: jest.fn((code, secret) => Promise.resolve(code === '123456')),
}));

// Mock database
jest.mock('@/src/services/database/dbInit', () => ({
  db: {
    runAsync: jest.fn(() => Promise.resolve({ changes: 1 })),
  },
}));

describe('MFA Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('checkBiometricSupport', () => {
    it('should return available when hardware and enrollment present', async () => {
      (LocalAuthentication.hasHardwareAsync as jest.Mock).mockResolvedValue(true);
      (LocalAuthentication.isEnrolledAsync as jest.Mock).mockResolvedValue(true);
      (LocalAuthentication.supportedAuthenticationTypesAsync as jest.Mock).mockResolvedValue([
        LocalAuthentication.AuthenticationType.FINGERPRINT,
      ]);

      const result = await mfaService.checkBiometricSupport();

      expect(result.available).toBe(true);
      expect(result.type).toBe('Fingerprint');
    });

    it('should detect Face ID', async () => {
      (LocalAuthentication.hasHardwareAsync as jest.Mock).mockResolvedValue(true);
      (LocalAuthentication.isEnrolledAsync as jest.Mock).mockResolvedValue(true);
      (LocalAuthentication.supportedAuthenticationTypesAsync as jest.Mock).mockResolvedValue([
        LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION,
      ]);

      const result = await mfaService.checkBiometricSupport();

      expect(result.type).toBe('Face ID');
    });

    it('should detect Iris scanner', async () => {
      (LocalAuthentication.hasHardwareAsync as jest.Mock).mockResolvedValue(true);
      (LocalAuthentication.isEnrolledAsync as jest.Mock).mockResolvedValue(true);
      (LocalAuthentication.supportedAuthenticationTypesAsync as jest.Mock).mockResolvedValue([
        LocalAuthentication.AuthenticationType.IRIS,
      ]);

      const result = await mfaService.checkBiometricSupport();

      expect(result.type).toBe('Iris');
    });

    it('should return unavailable when no hardware', async () => {
      (LocalAuthentication.hasHardwareAsync as jest.Mock).mockResolvedValue(false);
      (LocalAuthentication.isEnrolledAsync as jest.Mock).mockResolvedValue(true);

      const result = await mfaService.checkBiometricSupport();

      expect(result.available).toBe(false);
    });

    it('should return unavailable when not enrolled', async () => {
      (LocalAuthentication.hasHardwareAsync as jest.Mock).mockResolvedValue(true);
      (LocalAuthentication.isEnrolledAsync as jest.Mock).mockResolvedValue(false);

      const result = await mfaService.checkBiometricSupport();

      expect(result.available).toBe(false);
    });

    it('should return none when no biometric types supported', async () => {
      (LocalAuthentication.hasHardwareAsync as jest.Mock).mockResolvedValue(true);
      (LocalAuthentication.isEnrolledAsync as jest.Mock).mockResolvedValue(true);
      (LocalAuthentication.supportedAuthenticationTypesAsync as jest.Mock).mockResolvedValue([]);

      const result = await mfaService.checkBiometricSupport();

      expect(result.type).toBe('none');
    });
  });

  describe('authenticateWithBiometrics', () => {
    it('should return true on successful authentication', async () => {
      (LocalAuthentication.authenticateAsync as jest.Mock).mockResolvedValue({
        success: true,
      });

      const result = await mfaService.authenticateWithBiometrics();

      expect(result).toBe(true);
      expect(LocalAuthentication.authenticateAsync).toHaveBeenCalledWith({
        promptMessage: 'Authenticate to continue',
        cancelLabel: 'Cancel',
        disableDeviceFallback: true,
        fallbackLabel: '',
      });
    });

    it('should return false on failed authentication', async () => {
      (LocalAuthentication.authenticateAsync as jest.Mock).mockResolvedValue({
        success: false,
      });

      const result = await mfaService.authenticateWithBiometrics();

      expect(result).toBe(false);
    });

    it('should return false on authentication error', async () => {
      (LocalAuthentication.authenticateAsync as jest.Mock).mockRejectedValue(
        new Error('Biometric error')
      );

      const result = await mfaService.authenticateWithBiometrics();

      expect(result).toBe(false);
    });
  });

  describe('setupTOTP', () => {
    it('should generate TOTP secret and QR code URI', async () => {
      (SecureStore.setItemAsync as jest.Mock).mockResolvedValue(undefined);

      const result = await mfaService.setupTOTP('user@example.com');

      expect(result.secret).toBe('JBSWY3DPEHPK3PXP');
      expect(result.qrCodeUri).toContain('otpauth://totp/DocsShelf:user@example.com');
      expect(result.qrCodeUri).toContain('secret=JBSWY3DPEHPK3PXP');
    });

    it('should store temp secret with sanitized email key', async () => {
      (SecureStore.setItemAsync as jest.Mock).mockResolvedValue(undefined);

      await mfaService.setupTOTP('user@example.com');

      expect(SecureStore.setItemAsync).toHaveBeenCalledWith(
        'totp_secret_temp_user_at_example.com',
        'JBSWY3DPEHPK3PXP'
      );
    });

    it('should sanitize special characters in email', async () => {
      (SecureStore.setItemAsync as jest.Mock).mockResolvedValue(undefined);

      await mfaService.setupTOTP('user+test@example.com');

      expect(SecureStore.setItemAsync).toHaveBeenCalledWith(
        'totp_secret_temp_user_test_at_example.com',
        'JBSWY3DPEHPK3PXP'
      );
    });

    it('should call generateTOTPSecret utility', async () => {
      (SecureStore.setItemAsync as jest.Mock).mockResolvedValue(undefined);

      await mfaService.setupTOTP('user@example.com');

      expect(generateTOTPSecret).toHaveBeenCalled();
    });

    it('should call generateTOTPUri with correct parameters', async () => {
      (SecureStore.setItemAsync as jest.Mock).mockResolvedValue(undefined);

      await mfaService.setupTOTP('user@example.com');

      expect(generateTOTPUri).toHaveBeenCalledWith(
        'JBSWY3DPEHPK3PXP',
        'user@example.com',
        'DocsShelf'
      );
    });
  });

  describe('verifyAndActivateTOTP', () => {
    it('should verify and activate TOTP with correct code', async () => {
      (SecureStore.getItemAsync as jest.Mock).mockResolvedValue('JBSWY3DPEHPK3PXP');
      (SecureStore.setItemAsync as jest.Mock).mockResolvedValue(undefined);
      (SecureStore.deleteItemAsync as jest.Mock).mockResolvedValue(undefined);

      const result = await mfaService.verifyAndActivateTOTP('user@example.com', '123456');

      expect(result).toBe(true);
      expect(verifyTOTPCode).toHaveBeenCalledWith('123456', 'JBSWY3DPEHPK3PXP');
    });

    it('should move secret from temp to permanent storage', async () => {
      (SecureStore.getItemAsync as jest.Mock).mockResolvedValue('JBSWY3DPEHPK3PXP');
      (SecureStore.setItemAsync as jest.Mock).mockResolvedValue(undefined);
      (SecureStore.deleteItemAsync as jest.Mock).mockResolvedValue(undefined);

      await mfaService.verifyAndActivateTOTP('user@example.com', '123456');

      expect(SecureStore.setItemAsync).toHaveBeenCalledWith(
        'totp_secret_user_at_example.com',
        'JBSWY3DPEHPK3PXP'
      );
      expect(SecureStore.deleteItemAsync).toHaveBeenCalledWith(
        'totp_secret_temp_user_at_example.com'
      );
    });

    it('should update database MFA settings', async () => {
      (SecureStore.getItemAsync as jest.Mock).mockResolvedValue('JBSWY3DPEHPK3PXP');
      (SecureStore.setItemAsync as jest.Mock).mockResolvedValue(undefined);
      (SecureStore.deleteItemAsync as jest.Mock).mockResolvedValue(undefined);

      await mfaService.verifyAndActivateTOTP('user@example.com', '123456');

      expect(db.runAsync).toHaveBeenCalledWith(
        expect.stringContaining('UPDATE users'),
        expect.arrayContaining([1, 'totp', 'user@example.com'])
      );
    });

    it('should return false for incorrect code', async () => {
      (SecureStore.getItemAsync as jest.Mock).mockResolvedValue('JBSWY3DPEHPK3PXP');

      const result = await mfaService.verifyAndActivateTOTP('user@example.com', '000000');

      expect(result).toBe(false);
      expect(SecureStore.setItemAsync).not.toHaveBeenCalledWith(
        'totp_secret_user_at_example.com',
        expect.any(String)
      );
    });

    it('should throw error when setup not initiated', async () => {
      (SecureStore.getItemAsync as jest.Mock).mockResolvedValue(null);

      await expect(
        mfaService.verifyAndActivateTOTP('user@example.com', '123456')
      ).rejects.toThrow('TOTP setup not initiated');
    });
  });

  describe('verifyTOTPLogin', () => {
    it('should verify correct TOTP code during login', async () => {
      (SecureStore.getItemAsync as jest.Mock).mockResolvedValue('JBSWY3DPEHPK3PXP');

      const result = await mfaService.verifyTOTPLogin('user@example.com', '123456');

      expect(result).toBe(true);
      expect(verifyTOTPCode).toHaveBeenCalledWith('123456', 'JBSWY3DPEHPK3PXP');
    });

    it('should reject incorrect TOTP code', async () => {
      (SecureStore.getItemAsync as jest.Mock).mockResolvedValue('JBSWY3DPEHPK3PXP');

      const result = await mfaService.verifyTOTPLogin('user@example.com', '000000');

      expect(result).toBe(false);
    });

    it('should return false when no secret stored', async () => {
      (SecureStore.getItemAsync as jest.Mock).mockResolvedValue(null);

      const result = await mfaService.verifyTOTPLogin('user@example.com', '123456');

      expect(result).toBe(false);
    });
  });

  describe('getMFASettings', () => {
    it('should return MFA settings when TOTP enabled', async () => {
      (SecureStore.getItemAsync as jest.Mock).mockImplementation((key) => {
        if (key === 'totp_secret_user_at_example.com') return Promise.resolve('secret');
        if (key === 'biometric_enabled_user_at_example.com') return Promise.resolve('true');
        return Promise.resolve(null);
      });

      const settings = await mfaService.getMFASettings('user@example.com');

      expect(settings.totpEnabled).toBe(true);
      expect(settings.biometricEnabled).toBe(true);
      expect(settings.totpSecret).toBe('secret');
    });

    it('should return disabled settings when nothing enabled', async () => {
      (SecureStore.getItemAsync as jest.Mock).mockResolvedValue(null);

      const settings = await mfaService.getMFASettings('user@example.com');

      expect(settings.totpEnabled).toBe(false);
      expect(settings.biometricEnabled).toBe(false);
    });
  });

  describe('enableBiometric', () => {
    it('should enable biometric when supported and authenticated', async () => {
      (LocalAuthentication.hasHardwareAsync as jest.Mock).mockResolvedValue(true);
      (LocalAuthentication.isEnrolledAsync as jest.Mock).mockResolvedValue(true);
      (LocalAuthentication.supportedAuthenticationTypesAsync as jest.Mock).mockResolvedValue([
        LocalAuthentication.AuthenticationType.FINGERPRINT,
      ]);
      (LocalAuthentication.authenticateAsync as jest.Mock).mockResolvedValue({ success: true });
      (SecureStore.setItemAsync as jest.Mock).mockResolvedValue(undefined);

      const result = await mfaService.enableBiometric('user@example.com');

      expect(result).toBe(true);
      expect(SecureStore.setItemAsync).toHaveBeenCalledWith(
        'biometric_enabled_user_at_example.com',
        'true'
      );
    });

    it('should return false when biometric not supported', async () => {
      (LocalAuthentication.hasHardwareAsync as jest.Mock).mockResolvedValue(false);
      (LocalAuthentication.isEnrolledAsync as jest.Mock).mockResolvedValue(false);

      const result = await mfaService.enableBiometric('user@example.com');

      expect(result).toBe(false);
      expect(SecureStore.setItemAsync).not.toHaveBeenCalled();
    });

    it('should return false when authentication fails', async () => {
      (LocalAuthentication.hasHardwareAsync as jest.Mock).mockResolvedValue(true);
      (LocalAuthentication.isEnrolledAsync as jest.Mock).mockResolvedValue(true);
      (LocalAuthentication.supportedAuthenticationTypesAsync as jest.Mock).mockResolvedValue([
        LocalAuthentication.AuthenticationType.FINGERPRINT,
      ]);
      (LocalAuthentication.authenticateAsync as jest.Mock).mockResolvedValue({ success: false });

      const result = await mfaService.enableBiometric('user@example.com');

      expect(result).toBe(false);
      expect(SecureStore.setItemAsync).not.toHaveBeenCalled();
    });
  });

  describe('disableBiometric', () => {
    it('should delete biometric enabled flag', async () => {
      (SecureStore.deleteItemAsync as jest.Mock).mockResolvedValue(undefined);

      await mfaService.disableBiometric('user@example.com');

      expect(SecureStore.deleteItemAsync).toHaveBeenCalledWith(
        'biometric_enabled_user_at_example.com'
      );
    });
  });

  describe('isMFARequired', () => {
    it('should return true when TOTP enabled', async () => {
      (SecureStore.getItemAsync as jest.Mock).mockImplementation((key) => {
        if (key === 'totp_secret_user_at_example.com') return Promise.resolve('secret');
        return Promise.resolve(null);
      });

      const required = await mfaService.isMFARequired('user@example.com');

      expect(required).toBe(true);
    });

    it('should return true when biometric enabled', async () => {
      (SecureStore.getItemAsync as jest.Mock).mockImplementation((key) => {
        if (key === 'biometric_enabled_user_at_example.com') return Promise.resolve('true');
        return Promise.resolve(null);
      });

      const required = await mfaService.isMFARequired('user@example.com');

      expect(required).toBe(true);
    });

    it('should return false when neither enabled', async () => {
      (SecureStore.getItemAsync as jest.Mock).mockResolvedValue(null);

      const required = await mfaService.isMFARequired('user@example.com');

      expect(required).toBe(false);
    });
  });

  describe('disableTOTP', () => {
    it('should delete all TOTP-related keys', async () => {
      (SecureStore.deleteItemAsync as jest.Mock).mockResolvedValue(undefined);

      await mfaService.disableTOTP('user@example.com');

      expect(SecureStore.deleteItemAsync).toHaveBeenCalledWith('totp_secret_user_at_example.com');
      expect(SecureStore.deleteItemAsync).toHaveBeenCalledWith('totp_secret_temp_user_at_example.com');
      expect(SecureStore.deleteItemAsync).toHaveBeenCalledWith('backup_codes_user_at_example.com');
    });

    it('should update database to disable MFA', async () => {
      (SecureStore.deleteItemAsync as jest.Mock).mockResolvedValue(undefined);

      await mfaService.disableTOTP('user@example.com');

      expect(db.runAsync).toHaveBeenCalledWith(
        expect.stringContaining('UPDATE users'),
        expect.arrayContaining([0, null, 'user@example.com'])
      );
    });
  });
});
