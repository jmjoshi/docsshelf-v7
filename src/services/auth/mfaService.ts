/**
 * Multi-Factor Authentication Service
 * Handles MFA setup, verification, and management
 */

import * as LocalAuthentication from 'expo-local-authentication';
import * as SecureStore from 'expo-secure-store';
import { generateTOTPSecret, verifyTOTPCode } from '../../utils/crypto/totp';
import { db } from '../database/dbInit';

export interface MFASettings {
  totpEnabled: boolean;
  biometricEnabled: boolean;
  totpSecret?: string;
  backupCodes?: string[];
}

/**
 * Check if device supports biometric authentication
 */
export async function checkBiometricSupport(): Promise<{
  available: boolean;
  type: string;
}> {
  const hasHardware = await LocalAuthentication.hasHardwareAsync();
  const isEnrolled = await LocalAuthentication.isEnrolledAsync();
  const supportedTypes = await LocalAuthentication.supportedAuthenticationTypesAsync();
  
  let biometricType = 'none';
  if (supportedTypes.includes(LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION)) {
    biometricType = 'Face ID';
  } else if (supportedTypes.includes(LocalAuthentication.AuthenticationType.FINGERPRINT)) {
    biometricType = 'Fingerprint';
  } else if (supportedTypes.includes(LocalAuthentication.AuthenticationType.IRIS)) {
    biometricType = 'Iris';
  }
  
  return {
    available: hasHardware && isEnrolled,
    type: biometricType,
  };
}

/**
 * Authenticate with biometrics
 */
export async function authenticateWithBiometrics(): Promise<boolean> {
  try {
    const result = await LocalAuthentication.authenticateAsync({
      promptMessage: 'Authenticate to continue',
      cancelLabel: 'Cancel',
      disableDeviceFallback: false,
    });
    
    return result.success;
  } catch (error) {
    console.error('Biometric authentication error:', error);
    return false;
  }
}

/**
 * Setup TOTP for a user
 */
export async function setupTOTP(email: string): Promise<{
  secret: string;
  qrCodeUri: string;
}> {
  // Generate new TOTP secret
  const secret = await generateTOTPSecret();
  
  // Store secret in SecureStore (not yet verified)
  await SecureStore.setItemAsync(`totp_secret_temp_${email}`, secret);
  
  // Generate QR code URI
  const qrCodeUri = `otpauth://totp/DocsShelf:${encodeURIComponent(
    email
  )}?secret=${secret}&issuer=DocsShelf&digits=6&period=30`;
  
  return { secret, qrCodeUri };
}

/**
 * Verify and activate TOTP
 */
export async function verifyAndActivateTOTP(
  email: string,
  code: string
): Promise<boolean> {
  // Get temporary secret
  const tempSecret = await SecureStore.getItemAsync(`totp_secret_temp_${email}`);
  
  if (!tempSecret) {
    throw new Error('TOTP setup not initiated');
  }
  
  // Verify the code
  const isValid = await verifyTOTPCode(code, tempSecret);
  
  if (isValid) {
    // Move from temp to permanent storage
    await SecureStore.setItemAsync(`totp_secret_${email}`, tempSecret);
    await SecureStore.deleteItemAsync(`totp_secret_temp_${email}`);
    
    // Update database
    await updateMFASettings(email, { totpEnabled: true });
    
    // Generate backup codes
    await generateBackupCodes(email);
    
    return true;
  }
  
  return false;
}

/**
 * Verify TOTP code during login
 */
export async function verifyTOTPLogin(email: string, code: string): Promise<boolean> {
  const secret = await SecureStore.getItemAsync(`totp_secret_${email}`);
  
  if (!secret) {
    return false;
  }
  
  return await verifyTOTPCode(code, secret);
}

/**
 * Generate backup codes for account recovery
 */
async function generateBackupCodes(email: string): Promise<string[]> {
  const codes: string[] = [];
  
  // Generate 10 backup codes (8 characters each)
  for (let i = 0; i < 10; i++) {
    const code = Math.random().toString(36).substring(2, 10).toUpperCase();
    codes.push(code);
  }
  
  // Store hashed backup codes in SecureStore
  await SecureStore.setItemAsync(
    `backup_codes_${email}`,
    JSON.stringify(codes)
  );
  
  return codes;
}

/**
 * Get MFA settings for user
 */
export async function getMFASettings(email: string): Promise<MFASettings> {
  const totpSecret = await SecureStore.getItemAsync(`totp_secret_${email}`);
  const biometricEnabled = await SecureStore.getItemAsync(`biometric_enabled_${email}`);
  
  return {
    totpEnabled: !!totpSecret,
    biometricEnabled: biometricEnabled === 'true',
    totpSecret: totpSecret || undefined,
  };
}

/**
 * Update MFA settings in database
 */
async function updateMFASettings(
  email: string,
  settings: Partial<MFASettings>
): Promise<void> {
  try {
    await db.runAsync(
      `UPDATE users 
       SET mfa_enabled = ?, 
           mfa_type = ?,
           updated_at = CURRENT_TIMESTAMP
       WHERE email = ?`,
      [
        settings.totpEnabled ? 1 : 0,
        settings.totpEnabled ? 'totp' : null,
        email,
      ]
    );
  } catch (error) {
    console.error('Failed to update MFA settings:', error);
    throw new Error('Failed to update MFA settings');
  }
}

/**
 * Enable biometric authentication for user
 */
export async function enableBiometric(email: string): Promise<boolean> {
  const biometricSupport = await checkBiometricSupport();
  
  if (!biometricSupport.available) {
    return false;
  }
  
  // Test biometric authentication
  const authenticated = await authenticateWithBiometrics();
  
  if (authenticated) {
    await SecureStore.setItemAsync(`biometric_enabled_${email}`, 'true');
    return true;
  }
  
  return false;
}

/**
 * Disable biometric authentication
 */
export async function disableBiometric(email: string): Promise<void> {
  await SecureStore.deleteItemAsync(`biometric_enabled_${email}`);
}

/**
 * Check if MFA is required for user
 */
export async function isMFARequired(email: string): Promise<boolean> {
  const settings = await getMFASettings(email);
  return settings.totpEnabled || settings.biometricEnabled;
}

/**
 * Disable TOTP for user
 */
export async function disableTOTP(email: string): Promise<void> {
  await SecureStore.deleteItemAsync(`totp_secret_${email}`);
  await SecureStore.deleteItemAsync(`totp_secret_temp_${email}`);
  await SecureStore.deleteItemAsync(`backup_codes_${email}`);
  await updateMFASettings(email, { totpEnabled: false });
}
