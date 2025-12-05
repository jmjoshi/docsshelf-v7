# DocsShelf v7 - Comprehensive Testing Strategy

**Last Updated:** November 27, 2025  
**Project Version:** 1.0.0  
**Test Coverage Target:** 80%+  
**Status:** In Progress

---

## Table of Contents

1. [Testing Overview](#testing-overview)
2. [Automated Test Coverage](#automated-test-coverage)
3. [Manual Test Coverage](#manual-test-coverage)
4. [Test Execution Guide](#test-execution-guide)
5. [Test Results](#test-results)

---

## Testing Overview

### Testing Pyramid

```
                    Manual E2E Tests (5%)
                   /                    \
              Integration Tests (15%)
             /                          \
        Unit Tests (80%)
```

### Testing Tools & Frameworks

- **Unit Testing:** Jest + React Native Testing Library
- **Integration Testing:** Jest with database mocks
- **E2E Testing:** Manual testing on physical devices
- **Coverage Reporting:** Jest Coverage
- **CI/CD:** GitHub Actions (future)

### Test Categories

1. **Unit Tests** - Individual functions and components
2. **Integration Tests** - Service layer with database
3. **Component Tests** - React components with user interactions
4. **E2E Tests** - Full user workflows on devices

---

## Automated Test Coverage

### 1. Authentication & Security Tests

#### Password Validation Tests ✅
**File:** `__tests__/passwordValidator.test.ts`

- ✅ Rejects passwords shorter than 12 characters
- ✅ Requires uppercase letter
- ✅ Requires lowercase letter
- ✅ Requires number
- ✅ Requires special character
- ✅ Accepts valid passwords meeting all criteria

#### Password Hashing Tests
**File:** `__tests__/services/passwordHash.test.ts` (TO CREATE)

- Generate salt produces unique values
- Hash password with same salt produces same hash
- Hash password with different salt produces different hash
- Verify password matches correct hash
- Verify password rejects incorrect hash

#### User Registration Tests
**File:** `__tests__/services/userService.test.ts` (TO CREATE)

- Create user with valid data
- Reject duplicate email addresses
- Hash password before storage
- Generate salt for each user
- Create user profile with user record
- Validate all required fields

#### Login Tests
**File:** `__tests__/services/authService.test.ts` (TO CREATE)

- Successful login with correct credentials
- Failed login with incorrect password
- Failed login with non-existent email
- Account lockout after 5 failed attempts
- Lockout duration of 30 minutes
- Reset failed attempts on successful login
- Failed attempts isolated per user account

#### MFA Tests
**File:** `__tests__/services/mfaService.test.ts` (TO CREATE)

- Generate TOTP secret
- Generate QR code data URL
- Verify valid TOTP code (current time)
- Verify valid TOTP code (±60s window)
- Reject invalid TOTP code
- Reject expired TOTP code
- Enable MFA updates database
- Disable MFA clears database

#### Biometric Tests
**File:** `__tests__/services/biometricService.test.ts` (TO CREATE)

- Check device hardware support
- Check user enrollment status
- Enable biometric updates database
- Disable biometric updates database

### 2. Database Tests

#### Database Initialization Tests
**File:** `__tests__/services/dbInit.test.ts` (TO CREATE)

- Database initializes successfully
- All tables created (users, documents, categories, etc.)
- Indexes created correctly
- PRAGMA settings applied
- Version tracking works

#### Database Migration Tests
**File:** `__tests__/services/dbMigration.test.ts` (TO CREATE)

- Migration v0→v1 adds user_profiles table
- Migration v1→v2 adds categories table
- Migration v2→v3 adds tags table
- Migration v3→v4 adds backup_history table
- Migration v4→v5 adds audit_log table
- Migration v5→v6 adds biometric_enabled and app_preferences table
- Idempotent migrations (safe to run multiple times)
- No data loss during migrations

#### User Service Tests
**File:** `__tests__/services/userService.test.ts` (TO CREATE)

- Get current user ID
- Get user by ID
- Get user by email
- Update user profile
- Update password with salt
- Delete user and cascade to related records

### 3. Document Management Tests

#### Document Service Tests
**File:** `__tests__/services/documentService.test.ts` (TO CREATE)

- Upload document with encryption
- Download document with decryption
- Get document by ID
- Get documents with filters (category, date range, favorites)
- Update document metadata
- Toggle favorite status
- Delete document and cleanup files
- Get document statistics

#### Encryption Tests
**File:** `__tests__/utils/encryption.test.ts` (TO CREATE)

- Encrypt data produces different ciphertext each time (IV randomization)
- Decrypt ciphertext returns original data
- HMAC verification succeeds for valid data
- HMAC verification fails for tampered data
- Calculate checksum produces consistent hash
- Format file size displays correctly (B, KB, MB, GB)

#### Document Validation Tests
**File:** `__tests__/services/documentValidation.test.ts` (TO CREATE)

- Reject files exceeding max size (100MB)
- Reject filenames exceeding max length (255 chars)
- Accept all MIME types (universal encryption)
- Validate document ID exists
- Validate user owns document

### 4. Category Management Tests

#### Category Service Tests
**File:** `__tests__/services/categoryService.test.ts` (TO CREATE)

- Create category with user isolation
- Get all categories for user
- Get category by ID
- Update category (name, icon, color, parent)
- Delete category (with cascade or reassign)
- Get category tree structure
- Prevent circular parent relationships
- Validate max nesting depth (10 levels)
- Get document count per category

### 5. Backup & Restore Tests

#### Encrypted Backup Tests
**File:** `__tests__/services/backupService.test.ts` (TO CREATE)

- Create encrypted backup with all data
- Backup includes: users, profiles, categories, documents, tags, audit_log
- Encrypted backup file created
- Backup metadata saved to backup_history
- Restore from encrypted backup
- Restore validates backup integrity (HMAC)
- Restore decrypts all data correctly
- Restore preserves relationships (foreign keys)

#### Unencrypted Backup Tests
**File:** `__tests__/services/unencryptedBackupService.test.ts` (TO CREATE)

- Create unencrypted backup (JSON format)
- Backup includes all tables
- File documents included as base64
- Backup saved to user-selected location
- Restore from unencrypted backup
- Restore validates JSON structure
- Restore imports all data correctly

### 6. Preferences & Settings Tests

#### Preference Service Tests
**File:** `__tests__/services/preferenceService.test.ts` (TO CREATE)

- Get preferences returns defaults when none saved
- Set single preference updates database
- Set multiple preferences in transaction
- Reset preferences clears all and restores defaults
- Get single preference value
- Preferences isolated per user

#### Security Settings Tests
**File:** `__tests__/screens/SecuritySettings.test.tsx` (TO CREATE)

- MFA toggle enables MFA
- MFA toggle disables MFA
- Biometric toggle enables biometric
- Biometric toggle disables biometric
- Change password navigates to change password screen
- Security log navigates to security log screen
- Settings load from database on mount

### 7. Audit & Logging Tests

#### Audit Service Tests
**File:** `__tests__/services/auditService.test.ts` (TO CREATE)

- Log audit entry creates record
- Get audit logs returns entries for user
- Filter audit logs by action type
- Export audit logs to CSV format
- Audit logs include: action, details, IP, timestamp
- GDPR compliance: user data export includes audit logs

### 8. UI Component Tests

#### Registration Screen Tests
**File:** `__tests__/RegisterScreen.test.tsx` ✅

- ✅ Renders all input fields
- ✅ Shows password validation errors
- ✅ Disables register button when invalid
- ✅ Enables register button when valid

#### Change Password Screen Tests
**File:** `__tests__/screens/ChangePasswordScreen.test.tsx` (TO CREATE)

- Current password field renders
- New password field renders with strength indicator
- Confirm password field renders
- Strength indicator updates as password typed
- Validates current password matches database
- Validates new password meets requirements
- Validates confirm password matches new password
- Submit button disabled when invalid
- Toast shown on success

#### Security Log Screen Tests
**File:** `__tests__/screens/SecurityLogScreen.test.tsx` (TO CREATE)

- Renders loading state initially
- Displays audit log entries
- Filter tabs work (All/Login/Security)
- Badge counts update per filter
- Pull to refresh reloads data
- Export button shares CSV data
- Empty state shows when no logs

#### Document Management Screen Tests
**File:** `__tests__/screens/DocumentManagementScreen.test.tsx` (TO CREATE)

- Renders storage overview cards
- Displays category breakdown
- Delete all documents shows confirmation
- Delete by category shows confirmation
- Find duplicates displays results
- Optimize database shows success message
- Storage bar renders correctly

---

## Manual Test Coverage

See: [MANUAL_TESTING_CHECKLIST.md](./MANUAL_TESTING_CHECKLIST.md)

### Critical Manual Tests

1. **Authentication Flow** (Physical Device Required)
   - Registration → MFA Setup → Login → MFA Verify
   - Biometric authentication prompt
   - Account lockout and unlock
   
2. **Document Operations** (File System Access Required)
   - Upload various file types (PDF, images, docs)
   - Download and view documents
   - PDF viewer functionality
   - Camera scan feature
   
3. **Backup & Restore** (File System Access Required)
   - Create encrypted backup
   - Share backup to external storage
   - Restore from backup on clean install
   - USB backup to external drive
   
4. **Performance Testing** (Physical Device Required)
   - App launch time (<2s)
   - Document search speed (<500ms)
   - Handle 1000+ documents
   - Smooth scrolling and navigation
   
5. **Platform-Specific Tests**
   - iOS: Face ID, Touch ID, Files app integration
   - Android: Fingerprint, File picker, SAF integration

---

## Test Execution Guide

### Running All Tests

```powershell
# Run all tests
npm test

# Run tests with coverage
npm test -- --coverage

# Run specific test file
npm test -- passwordValidator.test.ts

# Run tests in watch mode
npm test -- --watch

# Run tests matching pattern
npm test -- --testNamePattern="password"
```

### Coverage Thresholds

```json
{
  "coverageThresholds": {
    "global": {
      "branches": 70,
      "functions": 75,
      "lines": 80,
      "statements": 80
    }
  }
}
```

### Test File Naming Convention

- Unit tests: `*.test.ts` or `*.test.tsx`
- Integration tests: `*.integration.test.ts`
- E2E tests: `*.e2e.js` (Detox/Appium)

---

## Test Results

### Current Coverage Status

**Last Run:** November 27, 2025

| Category | Files | Coverage | Status |
|----------|-------|----------|--------|
| Utils | 2/5 | 40% | 🟡 In Progress |
| Services | 0/12 | 0% | 🔴 Not Started |
| Screens | 1/15 | 7% | 🔴 Not Started |
| Components | 0/8 | 0% | 🔴 Not Started |
| **Overall** | **3/40** | **8%** | 🔴 **Critical** |

### Test Execution Results

```
PASS  __tests__/passwordValidator.test.ts
PASS  __tests__/RegisterScreen.test.tsx

Test Suites: 2 passed, 2 total
Tests:       8 passed, 8 total
Snapshots:   0 total
Time:        3.456 s
```

### Known Test Failures

None currently.

### Test Gaps (High Priority)

1. 🔴 **Database Operations** - No tests for any database services
2. 🔴 **Encryption** - No tests for encryption/decryption
3. 🔴 **Document Management** - No tests for document upload/download
4. 🔴 **Backup/Restore** - No tests for backup creation/restoration
5. 🟡 **Security Features** - Partial coverage for password validation only

---

## CI/CD Integration (Future)

### GitHub Actions Workflow

```yaml
name: Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
      - run: npm install
      - run: npm test -- --coverage
      - uses: codecov/codecov-action@v2
```

---

## Test Maintenance

### When to Update Tests

- ✅ Before committing new features
- ✅ When fixing bugs (add regression test)
- ✅ When refactoring code
- ✅ After code review feedback
- ✅ When coverage drops below threshold

### Test Review Checklist

- [ ] Tests are independent (no test depends on another)
- [ ] Tests are deterministic (same input = same output)
- [ ] Tests clean up after themselves (no side effects)
- [ ] Test names clearly describe what is being tested
- [ ] Tests cover happy path and edge cases
- [ ] Tests include error scenarios
- [ ] Mock external dependencies (network, file system)

---

**Next Actions:**

1. Implement all pending unit tests (Services layer priority)
2. Set up Jest coverage reporting in package.json
3. Create manual testing checklist document
4. Run automated tests and fix failures
5. Achieve 80%+ code coverage before v1.0 release
