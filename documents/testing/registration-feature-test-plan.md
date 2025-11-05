# Registration Feature Test Plan

## Unit Tests

### 1. Password Validation
- **File:** src/utils/validators/passwordValidator.ts
- **Tests:**
  - Valid password returns valid=true
  - Too short, missing uppercase, lowercase, number, or symbol returns correct error message

### 2. Registration Logic
- **File:** src/screens/Auth/RegisterScreen.tsx
- **Tests:**
  - Valid input triggers hashing and secure storage
  - Invalid password shows error
  - Hashing/storage errors show error
  - Mocks: argon2, SecureStore

## Integration Tests

### 1. Registration Screen
- **File:** src/screens/Auth/RegisterScreen.tsx
- **Tests:**
  - Simulate user input for email/password
  - Submit form, verify UI feedback
  - Confirm credentials stored securely (mock SecureStore)

## Test Frameworks & Setup
- **Jest**: Unit tests
- **React Native Testing Library**: UI/integration tests
- **Setup:**
  - Add `jest` and `@testing-library/react-native` to devDependencies
  - Configure Jest for React Native
  - Mock native modules for isolated tests

## Example Test File Structure
- __tests__/passwordValidator.test.ts
- __tests__/RegisterScreen.test.tsx

## Notes
- All tests should run with `npm test`.
- Use mocks for argon2 and SecureStore to avoid side effects.
- See Jest and React Native Testing Library docs for details.
