/**
 * TOTP (Time-based One-Time Password) implementation
 * Using otplib - production-ready, battle-tested library
 * Works with Google Authenticator, Authy, Microsoft Authenticator, etc.
 */

import { authenticator } from 'otplib';

/**
 * Generate a cryptographically secure random secret for TOTP
 * @returns Base32 encoded secret (compatible with authenticator apps)
 */
export async function generateTOTPSecret(): Promise<string> {
  // Use otplib's proven secret generation
  return authenticator.generateSecret();
}

/**
 * Generate current TOTP code from secret
 * @param secret - Base32 encoded secret
 * @returns 6-digit TOTP code
 */
export async function generateTOTPCode(secret: string): Promise<string> {
  return authenticator.generate(secret);
}

/**
 * Verify a TOTP code against the secret
 * @param code - User provided code
 * @param secret - Base32 encoded secret
 * @param _window - Number of time windows to check (default 1 = ±30 seconds) - otplib handles this internally
 * @returns true if code is valid
 */
export async function verifyTOTPCode(
  code: string,
  secret: string,
  _window: number = 1
): Promise<boolean> {
  try {
    // otplib has built-in window support for clock skew (default is 1 window = ±30 seconds)
    return authenticator.verify({
      token: code,
      secret: secret,
    });
  } catch (error) {
    console.error('TOTP verification error:', error);
    return false;
  }
}



/**
 * Generate TOTP URI for QR code
 * @param secret - Base32 encoded secret
 * @param accountName - User's email or identifier
 * @param issuer - App name
 * @returns otpauth:// URI for QR code generation
 */
export function generateTOTPUri(
  secret: string,
  accountName: string,
  issuer: string = 'DocsShelf'
): string {
  return authenticator.keyuri(accountName, issuer, secret);
}
