/**
 * TOTP (Time-based One-Time Password) implementation
 * React Native compatible - uses jsotp library
 * Works with Google Authenticator, Authy, Microsoft Authenticator, etc.
 * RFC 6238 compliant
 */

import * as Crypto from 'expo-crypto';
import * as base32 from 'hi-base32';
import * as jsotp from 'jsotp';

const TOTP_PERIOD = 30; // 30 seconds
const TOTP_DIGITS = 6; // 6-digit codes

/**
 * Generate a cryptographically secure random secret for TOTP
 * @returns Base32 encoded secret (compatible with authenticator apps)
 */
export async function generateTOTPSecret(): Promise<string> {
  // Generate 20 random bytes (160 bits) - RFC 6238 recommendation
  const randomBytes = await Crypto.getRandomBytesAsync(20);
  
  // Convert to base32 using hi-base32 (remove padding for compatibility)
  const secret = base32.encode(Array.from(randomBytes)).replace(/=/g, '');
  
  console.log('[TOTP] Generated secret:', secret);
  return secret;
}

/**
 * Generate current TOTP code from secret
 * @param secret - Base32 encoded secret
 * @returns 6-digit TOTP code
 */
export async function generateTOTPCode(secret: string): Promise<string> {
  const totp = jsotp.TOTP(secret);
  const code = totp.now();
  
  const currentTime = Math.floor(Date.now() / 1000);
  console.log(`[TOTP] Generating code at time=${currentTime}`);
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
    
    console.log(`[TOTP] Verifying code: ${normalizedCode}`);
    console.log(`[TOTP] Secret: ${secret}`);
    console.log(`[TOTP] Window: ±${window} (±${window * TOTP_PERIOD}s)`);
    
    const currentTime = Math.floor(Date.now() / 1000);
    const currentCounter = Math.floor(currentTime / TOTP_PERIOD);
    
    // Use HOTP to generate codes for each time window
    const hotp = jsotp.HOTP(secret);
    
    // Check current time window and ±window for clock skew tolerance
    for (let i = -window; i <= window; i++) {
      const counter = currentCounter + i;
      const testCode = hotp.at(counter);
      
      console.log(`[TOTP] Window ${i}: counter=${counter}, code=${testCode}`);
      
      if (testCode === normalizedCode) {
        console.log(`[TOTP] ✓ Code verified at window ${i}`);
        return true;
      }
    }
    
    console.log('[TOTP] ✗ Code verification failed in all windows');
    return false;
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
  // Remove padding for URI (authenticator apps don't need it)
  const cleanSecret = secret.replace(/=/g, '');
  
  const uri = `otpauth://totp/${encodeURIComponent(issuer)}:${encodeURIComponent(
    accountName
  )}?secret=${cleanSecret}&issuer=${encodeURIComponent(issuer)}&algorithm=SHA1&digits=6&period=30`;
  
  console.log('[TOTP] Generated URI:', uri);
  return uri;
}
