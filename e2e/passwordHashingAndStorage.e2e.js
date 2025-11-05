import { beforeAll, describe, it } from '@jest/globals';
// E2E test for Argon2 password hashing and secure storage
const { device, expect, element, by } = require('detox');

describe('Password Hashing and Storage', () => {
  beforeAll(async () => {
    await device.launchApp();
  });

  it('should hash and store password securely', async () => {
    await element(by.placeholder('Email')).typeText('user@example.com');
    await element(by.placeholder('Password')).typeText('StrongPass123!');
    await element(by.text('Register')).tap();
    await expect(element(by.text('Account created securely!'))).toBeVisible();
    // Additional checks for secure storage can be added with Detox helpers or custom native code
  });
});
