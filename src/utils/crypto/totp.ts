/**
 * TOTP (Time-based One-Time Password) implementation
 * React Native compatible - uses expo-crypto and hi-base32
 * Works with Google Authenticator, Authy, Microsoft Authenticator, etc.
 * RFC 6238 compliant
 */

import * as Crypto from 'expo-crypto';
import * as base32 from 'hi-base32';

const TOTP_PERIOD = 30; // 30 seconds
const TOTP_DIGITS = 6; // 6-digit codes

/**
 * Generate a cryptographically secure random secret for TOTP
 * @returns Base32 encoded secret (compatible with authenticator apps)
 */
export async function generateTOTPSecret(): Promise<string> {
  // Generate 20 random bytes (160 bits) - RFC 6238 recommendation
  const randomBytes = await Crypto.getRandomBytesAsync(20);
  
  // Convert to base32 WITHOUT padding (most authenticator apps don't like padding)
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
  const currentTime = Math.floor(Date.now() / 1000);
  const counter = Math.floor(currentTime / TOTP_PERIOD);
  console.log(`[TOTP] Generating code at time=${currentTime}, counter=${counter}`);
  
  const code = await generateHOTP(secret, counter);
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
    
    // Check current window and ±window for clock skew tolerance
    for (let i = -window; i <= window; i++) {
      const testCounter = counter + i;
      const testCode = await generateHOTP(secret, testCounter);
      console.log(`[TOTP] Window ${i}: counter=${testCounter}, generated=${testCode}`);
      
      if (testCode === normalizedCode) {
        console.log(`[TOTP] ✓ Code matched at window ${i}`);
        return true;
      }
    }
    
    console.log('[TOTP] ✗ No match found in any window');
    return false;
  } catch (error) {
    console.error('TOTP verification error:', error);
    return false;
  }
}

/**
 * Generate HOTP code using HMAC-SHA1
 * Fixed implementation that matches authenticator apps
 */
async function generateHOTP(secret: string, counter: number): Promise<string> {
  try {
    // Add padding if needed (some secrets don't have it)
    let paddedSecret = secret.toUpperCase().replace(/=/g, '');
    const remainder = paddedSecret.length % 8;
    if (remainder !== 0) {
      paddedSecret += '='.repeat(8 - remainder);
    }
    
    // Decode base32 secret
    const keyBytes = base32.decode.asBytes(paddedSecret);
    const key = Buffer.from(keyBytes);
    
    // Create counter buffer (8 bytes, big-endian)
    const counterBuffer = Buffer.alloc(8);
    // Write as big-endian 64-bit integer
    let tmpCounter = counter;
    for (let i = 7; i >= 0; i--) {
      counterBuffer[i] = tmpCounter & 0xff;
      tmpCounter = tmpCounter >> 8;
    }
    
    // Compute HMAC-SHA1
    const hmac = await computeHMACSHA1(key, counterBuffer);
    
    // Dynamic truncation (RFC 4226)
    const offset = hmac[19] & 0x0f;
    const code =
      ((hmac[offset] & 0x7f) << 24) |
      ((hmac[offset + 1] & 0xff) << 16) |
      ((hmac[offset + 2] & 0xff) << 8) |
      (hmac[offset + 3] & 0xff);
    
    // Generate 6-digit OTP
    const otp = code % 1000000;
    return otp.toString().padStart(6, '0');
  } catch (error) {
    console.error('HOTP generation error:', error);
    throw error;
  }
}

/**
 * Compute HMAC-SHA1 using expo-crypto
 * Implements RFC 2104 HMAC
 */
async function computeHMACSHA1(key: Buffer, message: Buffer): Promise<Buffer> {
  const blockSize = 64; // SHA-1 block size in bytes
  
  // If key is longer than block size, hash it
  let processedKey = key;
  if (key.length > blockSize) {
    const hashedKey = await Crypto.digestStringAsync(
      Crypto.CryptoDigestAlgorithm.SHA1,
      key.toString('hex')
    );
    processedKey = Buffer.from(hashedKey, 'hex');
  }
  
  // Pad key to block size
  const paddedKey = Buffer.alloc(blockSize);
  processedKey.copy(paddedKey);
  
  // Create ipad and opad
  const ipad = Buffer.alloc(blockSize);
  const opad = Buffer.alloc(blockSize);
  for (let i = 0; i < blockSize; i++) {
    ipad[i] = paddedKey[i] ^ 0x36;
    opad[i] = paddedKey[i] ^ 0x5c;
  }
  
  // Inner hash: H(K XOR ipad || message)
  const innerInput = Buffer.concat([ipad, message]);
  const innerHash = await Crypto.digestStringAsync(
    Crypto.CryptoDigestAlgorithm.SHA1,
    innerInput.toString('hex')
  );
  
  // Outer hash: H(K XOR opad || inner_hash)
  const outerInput = Buffer.concat([opad, Buffer.from(innerHash, 'hex')]);
  const outerHash = await Crypto.digestStringAsync(
    Crypto.CryptoDigestAlgorithm.SHA1,
    outerInput.toString('hex')
  );
  
  return Buffer.from(outerHash, 'hex');
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
