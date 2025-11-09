/**
 * TOTP (Time-based One-Time Password) implementation
 * Production-ready implementation using expo-crypto and hi-base32
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
  
  // Convert Uint8Array to regular array for hi-base32
  const byteArray = Array.from(randomBytes);
  
  // Convert to base32 using proven library
  // Keep padding for maximum compatibility
  return base32.encode(byteArray);
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
 * Generate HOTP (HMAC-based One-Time Password) - RFC 4226
 * @param secret - Base32 encoded secret
 * @param counter - Counter value (time-based for TOTP)
 * @returns 6-digit code
 */
async function generateHOTP(secret: string, counter: number): Promise<string> {
  try {
    // Decode base32 secret - ensure it has padding
    const paddedSecret = padBase32(secret.toUpperCase());
    const keyBytes = base32.decode.asBytes(paddedSecret);
    const key = new Uint8Array(keyBytes);
    
    // Convert counter to 8-byte buffer (big-endian)
    const buffer = new ArrayBuffer(8);
    const view = new DataView(buffer);
    view.setUint32(4, counter, false); // Big-endian, high 32 bits are 0
    const counterBytes = new Uint8Array(buffer);
    
    // Compute HMAC-SHA1 using expo-crypto
    const hmac = await computeHMACSHA1(key, counterBytes);
    
    // Dynamic truncation (RFC 4226 Section 5.3)
    const offset = hmac[hmac.length - 1] & 0x0f;
    const code =
      ((hmac[offset] & 0x7f) << 24) |
      ((hmac[offset + 1] & 0xff) << 16) |
      ((hmac[offset + 2] & 0xff) << 8) |
      (hmac[offset + 3] & 0xff);
    
    // Generate 6-digit OTP
    const otp = code % Math.pow(10, TOTP_DIGITS);
    return otp.toString().padStart(TOTP_DIGITS, '0');
  } catch (error) {
    console.error('HOTP generation error:', error);
    throw error;
  }
}

/**
 * Add padding to base32 string if missing
 */
function padBase32(secret: string): string {
  // Base32 padding: strings should be multiples of 8 characters
  const remainder = secret.length % 8;
  if (remainder === 0) {
    return secret;
  }
  return secret + '='.repeat(8 - remainder);
}

/**
 * Compute HMAC-SHA1 using expo-crypto
 * Implementation follows RFC 2104
 */
async function computeHMACSHA1(key: Uint8Array, message: Uint8Array): Promise<Uint8Array> {
  const blockSize = 64; // SHA-1 block size
  
  // Hash the key if it's too long
  let processedKey = key;
  if (key.length > blockSize) {
    const hashedKey = await Crypto.digestStringAsync(
      Crypto.CryptoDigestAlgorithm.SHA1,
      arrayToHex(key)
    );
    processedKey = hexToBytes(hashedKey);
  }
  
  // Pad key to block size
  const paddedKey = new Uint8Array(blockSize);
  paddedKey.set(processedKey);
  
  // Create ipad and opad
  const ipad = new Uint8Array(blockSize);
  const opad = new Uint8Array(blockSize);
  for (let i = 0; i < blockSize; i++) {
    ipad[i] = paddedKey[i] ^ 0x36;
    opad[i] = paddedKey[i] ^ 0x5c;
  }
  
  // Inner hash: H(K XOR ipad || message)
  const innerInput = new Uint8Array(blockSize + message.length);
  innerInput.set(ipad);
  innerInput.set(message, blockSize);
  const innerHash = await Crypto.digestStringAsync(
    Crypto.CryptoDigestAlgorithm.SHA1,
    arrayToHex(innerInput)
  );
  
  // Outer hash: H(K XOR opad || inner_hash)
  const outerInput = new Uint8Array(blockSize + 20); // SHA-1 produces 20 bytes
  outerInput.set(opad);
  outerInput.set(hexToBytes(innerHash), blockSize);
  const outerHash = await Crypto.digestStringAsync(
    Crypto.CryptoDigestAlgorithm.SHA1,
    arrayToHex(outerInput)
  );
  
  return hexToBytes(outerHash);
}

/**
 * Convert byte array to hex string
 */
function arrayToHex(bytes: Uint8Array): string {
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

/**
 * Convert hex string to byte array
 */
function hexToBytes(hex: string): Uint8Array {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < hex.length; i += 2) {
    bytes[i / 2] = parseInt(hex.substring(i, i + 2), 16);
  }
  return bytes;
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
  const params = new URLSearchParams({
    secret: secret,
    issuer: issuer,
    algorithm: 'SHA1',
    digits: TOTP_DIGITS.toString(),
    period: TOTP_PERIOD.toString(),
  });
  
  return `otpauth://totp/${encodeURIComponent(issuer)}:${encodeURIComponent(
    accountName
  )}?${params.toString()}`;
}
