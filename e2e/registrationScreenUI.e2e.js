import { beforeAll, describe, it } from '@jest/globals';
// E2E test for registration screen UI and flow
const { device, expect, element, by } = require('detox');

describe('Registration Screen UI', () => {
  beforeAll(async () => {
    await device.launchApp();
  });

  it('should display all input fields and button', async () => {
    await expect(element(by.placeholder('Email'))).toBeVisible();
    await expect(element(by.placeholder('Password'))).toBeVisible();
    await expect(element(by.text('Register'))).toBeVisible();
  });

  it('should show error for invalid input', async () => {
    await element(by.placeholder('Email')).typeText('user@example.com');
    await element(by.placeholder('Password')).typeText('short');
    await element(by.text('Register')).tap();
    await expect(element(by.text('Password must be at least 12 characters.'))).toBeVisible();
  });

  it('should register successfully with valid input', async () => {
    await element(by.placeholder('Email')).clearText();
    await element(by.placeholder('Password')).clearText();
    await element(by.placeholder('Email')).typeText('user@example.com');
    await element(by.placeholder('Password')).typeText('StrongPass123!');
    await element(by.text('Register')).tap();
    await expect(element(by.text('Account created securely!'))).toBeVisible();
  });
});
