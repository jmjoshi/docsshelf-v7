/**
 * TOTP (Time-based One-Time Password) implementation
 * Using proven otplib library for maximum compatibility
 * Works with Google Authenticator, Authy, Microsoft Authenticator, etc.
 * RFC 6238 compliant
 */

import { authenticator } from 'otplib';

// Configure otplib for compatibility
authenticator.options = {
  digits: 6,
  step: 30,
  window: 2, // Allow ±2 time steps (±60 seconds)
};

const TOTP_PERIOD = 30; // 30 seconds
const TOTP_DIGITS = 6; // 6-digit codes

/**
 * Generate a cryptographically secure random secret for TOTP
 * @returns Base32 encoded secret (compatible with authenticator apps)
 */
export async function generateTOTPSecret(): Promise<string> {
  // Use otplib's built-in secret generator (RFC 6238 compliant)
  const secret = authenticator.generateSecret();
  console.log('[TOTP] Generated secret:', secret);
  return secret;
}

/**
 * Generate current TOTP code from secret
 * @param secret - Base32 encoded secret
 * @returns 6-digit TOTP code
 */
export async function generateTOTPCode(secret: string): Promise<string> {
  const currentTime = Math.floor(Date.now() / 1000);
  const counter = Math.floor(currentTime / TOTP_PERIOD);
  console.log(`[TOTP] Generating code at time=${currentTime}, counter=${counter}`);
  
  // Use otplib's proven implementation
  const code = authenticator.generate(secret);
  console.log(`[TOTP] Generated code: ${code}`);
  return code;
}

/**
 * Verify a TOTP code against the secret
 * @param code - User provided code
 * @param secret - Base32 encoded secret
 * @param window - Number of time windows to check (default 2 = ±60 seconds)
 * @returns true if code is valid
 */
export async function verifyTOTPCode(
  code: string,
  secret: string,
  window: number = 2
): Promise<boolean> {
  try {
    // Normalize code (remove spaces, ensure string)
    const normalizedCode = String(code).replace(/\s/g, '');
    
    if (normalizedCode.length !== TOTP_DIGITS) {
      console.log(`[TOTP] Invalid code length: ${normalizedCode.length}, expected ${TOTP_DIGITS}`);
      return false;
    }
    
    const currentTime = Math.floor(Date.now() / 1000);
    const counter = Math.floor(currentTime / TOTP_PERIOD);
    
    console.log(`[TOTP] Current time: ${currentTime}, Counter: ${counter}`);
    console.log(`[TOTP] Verifying code: ${normalizedCode}`);
    console.log(`[TOTP] Secret: ${secret}`);
    console.log(`[TOTP] Checking ${window * 2 + 1} time windows (±${window * TOTP_PERIOD}s)`);
    
    // Use otplib's proven verification with time window
    authenticator.options = { ...authenticator.options, window };
    const isValid = authenticator.verify({ token: normalizedCode, secret });
    
    if (isValid) {
      console.log('[TOTP] ✓ Code verified successfully');
    } else {
      console.log('[TOTP] ✗ Code verification failed');
      // Debug: show what the expected code is
      const expected = authenticator.generate(secret);
      console.log(`[TOTP] Expected code: ${expected}`);
    }
    
    return isValid;
  } catch (error) {
    console.error('TOTP verification error:', error);
    return false;
  }
}

// Custom HMAC implementation removed - using otplib's proven implementation

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
  // Use otplib's keyuri function for maximum compatibility
  const uri = authenticator.keyuri(accountName, issuer, secret);
  console.log('[TOTP] Generated URI:', uri);
  return uri;
}
