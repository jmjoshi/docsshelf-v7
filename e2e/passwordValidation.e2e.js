import { beforeAll, describe, it } from '@jest/globals';
// E2E test for password validation logic
const { device, expect, element, by } = require('detox');

describe('Password Validation', () => {
  beforeAll(async () => {
    await device.launchApp();
  });

  it('should reject short password', async () => {
    await element(by.placeholder('Password')).typeText('Short1!');
    await element(by.text('Register')).tap();
    await expect(element(by.text('Password must be at least 12 characters.'))).toBeVisible();
  });

  it('should reject password missing uppercase', async () => {
    await element(by.placeholder('Password')).clearText();
    await element(by.placeholder('Password')).typeText('weakpassword123!');
    await element(by.text('Register')).tap();
    await expect(element(by.text('Password must include an uppercase letter.'))).toBeVisible();
  });

  it('should reject password missing lowercase', async () => {
    await element(by.placeholder('Password')).clearText();
    await element(by.placeholder('Password')).typeText('WEAKPASSWORD123!');
    await element(by.text('Register')).tap();
    await expect(element(by.text('Password must include a lowercase letter.'))).toBeVisible();
  });

  it('should reject password missing number', async () => {
    await element(by.placeholder('Password')).clearText();
    await element(by.placeholder('Password')).typeText('WeakPassword!');
    await element(by.text('Register')).tap();
    await expect(element(by.text('Password must include a number.'))).toBeVisible();
  });

  it('should reject password missing symbol', async () => {
    await element(by.placeholder('Password')).clearText();
    await element(by.placeholder('Password')).typeText('WeakPassword123');
    await element(by.text('Register')).tap();
    await expect(element(by.text('Password must include a symbol.'))).toBeVisible();
  });
});
