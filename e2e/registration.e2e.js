import { beforeAll, describe, it } from '@jest/globals';
// Example Detox E2E test for registration screen
const { device, expect, element, by } = require('detox');

describe('Registration Flow', () => {
  beforeAll(async () => {
    await device.launchApp();
  });

  it('should show registration screen', async () => {
    await expect(element(by.text('Create Account'))).toBeVisible();
  });

  it('should show error for invalid password', async () => {
    await element(by.placeholder('Email')).typeText('user@example.com');
    await element(by.placeholder('Password')).typeText('short');
    await element(by.text('Register')).tap();
    await expect(element(by.text('Password must be at least 12 characters.'))).toBeVisible();
  });

  it('should register with valid input', async () => {
    await element(by.placeholder('Email')).clearText();
    await element(by.placeholder('Password')).clearText();
    await element(by.placeholder('Email')).typeText('user@example.com');
    await element(by.placeholder('Password')).typeText('StrongPass123!');
    await element(by.text('Register')).tap();
    await expect(element(by.text('Account created securely!'))).toBeVisible();
  });
});
