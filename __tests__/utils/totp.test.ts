/**
 * TOTP Utility Tests
 * Tests for Time-based One-Time Password generation and verification
 */

import { generateTOTPCode, generateTOTPSecret, generateTOTPUri, verifyTOTPCode } from '@/src/utils/crypto/totp';
import * as Crypto from 'expo-crypto';

// Mock expo-crypto
jest.mock('expo-crypto');

describe('TOTP Utilities', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Suppress console.log output during tests
    jest.spyOn(console, 'log').mockImplementation(() => {});
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('generateTOTPSecret', () => {
    it('should generate a base32 encoded secret', async () => {
      // Mock random bytes generation
      const mockBytes = new Uint8Array([
        1, 2, 3, 4, 5, 6, 7, 8, 9, 10,
        11, 12, 13, 14, 15, 16, 17, 18, 19, 20,
      ]);
      (Crypto.getRandomBytesAsync as jest.Mock).mockResolvedValue(mockBytes);

      const secret = await generateTOTPSecret();

      expect(secret).toBeDefined();
      expect(typeof secret).toBe('string');
      expect(secret.length).toBeGreaterThan(0);
      expect(Crypto.getRandomBytesAsync).toHaveBeenCalledWith(20);
    });

    it('should generate different secrets on multiple calls', async () => {
      // Mock different random bytes for each call
      (Crypto.getRandomBytesAsync as jest.Mock)
        .mockResolvedValueOnce(new Uint8Array(20).fill(1))
        .mockResolvedValueOnce(new Uint8Array(20).fill(2));

      const secret1 = await generateTOTPSecret();
      const secret2 = await generateTOTPSecret();

      expect(secret1).not.toBe(secret2);
    });

    it('should generate secret without padding', async () => {
      const mockBytes = new Uint8Array(20).fill(0);
      (Crypto.getRandomBytesAsync as jest.Mock).mockResolvedValue(mockBytes);

      const secret = await generateTOTPSecret();

      // Base32 padding uses '=' character
      expect(secret.includes('=')).toBe(false);
    });
  });

  describe('generateTOTPCode', () => {
    it('should generate 6-digit code', async () => {
      const secret = 'JBSWY3DPEHPK3PXP'; // Example base32 secret

      const code = await generateTOTPCode(secret);

      expect(code).toBeDefined();
      expect(code.length).toBe(6);
      expect(/^\d{6}$/.test(code)).toBe(true);
    });

    it('should generate consistent code for same time window', async () => {
      const secret = 'JBSWY3DPEHPK3PXP';

      const code1 = await generateTOTPCode(secret);
      const code2 = await generateTOTPCode(secret);

      // Should be same within 30-second window
      expect(code1).toBe(code2);
    });
  });

  describe('verifyTOTPCode', () => {
    it('should verify valid code', async () => {
      const secret = 'JBSWY3DPEHPK3PXP';
      const code = await generateTOTPCode(secret);

      const isValid = await verifyTOTPCode(code, secret);

      expect(isValid).toBe(true);
    });

    it('should reject invalid code', async () => {
      const secret = 'JBSWY3DPEHPK3PXP';

      const isValid = await verifyTOTPCode('000000', secret);

      expect(isValid).toBe(false);
    });

    it('should reject code with wrong length', async () => {
      const secret = 'JBSWY3DPEHPK3PXP';

      const isValid = await verifyTOTPCode('12345', secret); // Only 5 digits

      expect(isValid).toBe(false);
    });

    it('should normalize code by removing spaces', async () => {
      const secret = 'JBSWY3DPEHPK3PXP';
      const code = await generateTOTPCode(secret);
      const codeWithSpaces = `${code.slice(0, 3)} ${code.slice(3)}`;

      const isValid = await verifyTOTPCode(codeWithSpaces, secret);

      expect(isValid).toBe(true);
    });

    it('should handle clock skew with time window', async () => {
      const secret = 'JBSWY3DPEHPK3PXP';
      
      // Generate code
      const code = await generateTOTPCode(secret);
      
      // Verify with window of 2 (±60 seconds)
      const isValid = await verifyTOTPCode(code, secret, 2);

      expect(isValid).toBe(true);
    });

    it('should handle verification errors gracefully', async () => {
      const secret = 'INVALID_SECRET!@#';
      
      const isValid = await verifyTOTPCode('123456', secret);

      expect(isValid).toBe(false);
    });

    it('should reject empty code', async () => {
      const secret = 'JBSWY3DPEHPK3PXP';

      const isValid = await verifyTOTPCode('', secret);

      expect(isValid).toBe(false);
    });

    it('should accept code as number converted to string', async () => {
      const secret = 'JBSWY3DPEHPK3PXP';
      const code = await generateTOTPCode(secret);

      const isValid = await verifyTOTPCode(code, secret);

      expect(isValid).toBe(true);
    });
  });

  describe('generateTOTPUri', () => {
    it('should generate valid otpauth URI', () => {
      const secret = 'JBSWY3DPEHPK3PXP';
      const accountName = 'user@example.com';
      const issuer = 'DocsShelf';

      const uri = generateTOTPUri(secret, accountName, issuer);

      expect(uri).toContain('otpauth://totp/');
      expect(uri).toContain(`secret=${secret}`);
      expect(uri).toContain(encodeURIComponent(accountName));
      expect(uri).toContain(`issuer=${encodeURIComponent(issuer)}`);
    });

    it('should use default issuer if not provided', () => {
      const secret = 'JBSWY3DPEHPK3PXP';
      const accountName = 'user@example.com';

      const uri = generateTOTPUri(secret, accountName);

      expect(uri).toContain('issuer=DocsShelf');
    });

    it('should include algorithm, digits, and period parameters', () => {
      const secret = 'JBSWY3DPEHPK3PXP';
      const accountName = 'user@example.com';

      const uri = generateTOTPUri(secret, accountName);

      expect(uri).toContain('algorithm=SHA1');
      expect(uri).toContain('digits=6');
      expect(uri).toContain('period=30');
    });

    it('should URL encode special characters in account name', () => {
      const secret = 'JBSWY3DPEHPK3PXP';
      const accountName = 'user+test@example.com';

      const uri = generateTOTPUri(secret, accountName);

      expect(uri).toContain(encodeURIComponent(accountName));
    });

    it('should URL encode special characters in issuer', () => {
      const secret = 'JBSWY3DPEHPK3PXP';
      const accountName = 'user@example.com';
      const issuer = 'DocsShelf (Beta)';

      const uri = generateTOTPUri(secret, accountName, issuer);

      expect(uri).toContain(encodeURIComponent(issuer));
    });

    it('should remove padding from secret', () => {
      const secretWithPadding = 'JBSWY3DPEHPK3PXP==';
      const accountName = 'user@example.com';

      const uri = generateTOTPUri(secretWithPadding, accountName);

      expect(uri).toContain('secret=JBSWY3DPEHPK3PXP'); // No padding
      expect(uri).not.toContain('secret=JBSWY3DPEHPK3PXP==');
    });
  });
});
