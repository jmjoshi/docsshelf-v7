import { validatePassword } from '../src/utils/validators/passwordValidator';

describe('validatePassword', () => {
  it('returns valid for strong password', () => {
    expect(validatePassword('StrongPass123!')).toEqual({ valid: true });
  });
  it('fails for short password', () => {
    expect(validatePassword('Short1!')).toEqual({ valid: false, message: 'Password must be at least 12 characters.' });
  });
  it('fails for missing uppercase', () => {
    expect(validatePassword('weakpassword123!')).toEqual({ valid: false, message: 'Password must include an uppercase letter.' });
  });
  it('fails for missing lowercase', () => {
    expect(validatePassword('WEAKPASSWORD123!')).toEqual({ valid: false, message: 'Password must include a lowercase letter.' });
  });
  it('fails for missing number', () => {
    expect(validatePassword('WeakPassword!')).toEqual({ valid: false, message: 'Password must include a number.' });
  });
  it('fails for missing symbol', () => {
    expect(validatePassword('WeakPassword123')).toEqual({ valid: false, message: 'Password must include a symbol.' });
  });
});
