# FR-MAIN-020: Settings Enhancement - Document Management & Security Features

**Feature ID:** FR-MAIN-020  
**Priority:** HIGH  
**Status:** Planning  
**Created:** November 27, 2025  
**Target Completion:** November 27, 2025

---

## 📋 Overview

This plan addresses gaps in the Settings screens identified during comprehensive review for v1.0 production release. Focus areas: document management features, security enhancements, and completing placeholder functionality.

---

## 🔍 Current State Analysis

### Existing Settings Screens

1. **Profile** (✅ Complete)
   - Edit user information (name, email, phones)
   - Save/cancel functionality
   - Input validation
   - Status: Production-ready

2. **Security** (🚧 70% Complete)
   - ✅ MFA toggle (UI only)
   - ✅ Biometric toggle (UI only)
   - ✅ Auto-lock toggle
   - ✅ Logout functionality
   - ⚠️ MFA setup navigation (placeholder)
   - ⚠️ Change password (placeholder)
   - ⚠️ Security log viewer (placeholder)
   - ⚠️ Toggles not connected to actual services

3. **Preferences** (🚧 80% Complete)
   - ✅ Dark mode toggle (follows system)
   - ✅ Compact view toggle (UI state only)
   - ✅ Show thumbnails toggle (UI state only)
   - ✅ Notifications toggle
   - ✅ Auto backup toggle
   - ✅ Reset settings functionality
   - ⚠️ Clear cache (placeholder)
   - ⚠️ Preferences not persisted to database
   - ⚠️ Toggles don't affect actual app behavior

4. **Backup & Restore** (✅ Complete)
   - Full encrypted backup export
   - Unencrypted backup export with warnings
   - Backup restore with options
   - Backup history
   - Status: Production-ready

5. **About** (✅ Complete)
   - App version
   - Privacy policy link
   - Terms of service link
   - Open source licenses
   - Status: Production-ready

### Missing Screens

6. **Document Management** (❌ Not Implemented)
   - No dedicated document management settings
   - No storage usage information
   - No bulk operations
   - No document cleanup options
   - No document import/export settings

---

## 🎯 Implementation Goals

### Primary Objectives

1. **Complete Security Settings**
   - Wire up MFA toggle to actual MFA service
   - Implement biometric authentication
   - Create change password screen
   - Build security log viewer
   - Connect all toggles to database

2. **Enhance Preferences**
   - Implement cache clearing functionality
   - Persist all preferences to database
   - Make toggles actually control app behavior
   - Add storage usage display

3. **Add Document Management Settings**
   - NEW screen for document-specific settings
   - Storage usage breakdown
   - Bulk document operations
   - Document cleanup tools
   - Document retention policies

### Secondary Objectives

4. **Improve UX**
   - Add loading states to all operations
   - Better error handling
   - Toast notifications instead of alerts
   - Confirmation dialogs for destructive actions

5. **Add Help & Support**
   - In-app FAQ
   - Contact support options
   - Tutorial/walkthrough
   - User guide links

---

## 📦 Technical Implementation

### Phase 1: Security Settings Enhancement

#### 1.1 MFA Toggle Integration

**Current State:**
```typescript
// SecuritySettingsScreen.tsx - Line 23
const [mfaEnabled, setMfaEnabled] = useState(false); // Placeholder state

handleToggleMFA() {
  Alert.alert('Coming Soon', 'MFA setup wizard will be available soon');
}
```

**Required Changes:**

**File:** `src/screens/Settings/SecuritySettingsScreen.tsx`

```typescript
import { mfaService } from '@/src/services/auth/mfaService';

// Load actual MFA status from database
useEffect(() => {
  loadMFAStatus();
}, []);

const loadMFAStatus = async () => {
  try {
    const user = await getCurrentUser();
    setMfaEnabled(user?.mfa_enabled === 1);
  } catch (error) {
    console.error('Failed to load MFA status:', error);
  }
};

const handleToggleMFA = async () => {
  if (mfaEnabled) {
    // Disable MFA
    Alert.alert(
      'Disable MFA',
      'Are you sure you want to disable Multi-Factor Authentication?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Disable',
          style: 'destructive',
          onPress: async () => {
            try {
              await mfaService.disable();
              setMfaEnabled(false);
              toast.show('MFA disabled', { type: 'success' });
            } catch (error) {
              toast.show('Failed to disable MFA', { type: 'error' });
            }
          },
        },
      ]
    );
  } else {
    // Navigate to MFA setup
    router.push('/settings/mfa-setup');
  }
};
```

**New Route:** `app/settings/mfa-setup.tsx`
- Reuse existing MFA setup screen from auth flow
- Import from `app/(auth)/mfa-setup.tsx`
- Add "Back to Settings" navigation

**Dependencies:**
- Existing: `src/services/auth/mfaService.ts` ✅
- Existing: `src/screens/Auth/MFASetupScreen.tsx` ✅

**Estimated Time:** 1-2 hours

#### 1.2 Biometric Authentication

**Current State:**
```typescript
const handleToggleBiometric = () => {
  Alert.alert('Coming Soon', 'Biometric authentication will be available soon');
};
```

**Required Changes:**

**File:** `src/screens/Settings/SecuritySettingsScreen.tsx`

```typescript
import * as LocalAuthentication from 'expo-local-authentication';

const handleToggleBiometric = async () => {
  if (!biometricEnabled) {
    // Check if device supports biometric
    const hasHardware = await LocalAuthentication.hasHardwareAsync();
    const isEnrolled = await LocalAuthentication.isEnrolledAsync();

    if (!hasHardware) {
      Alert.alert('Not Supported', 'Your device does not support biometric authentication');
      return;
    }

    if (!isEnrolled) {
      Alert.alert(
        'Not Configured',
        'Please set up fingerprint or face recognition in your device settings first'
      );
      return;
    }

    // Test biometric
    const result = await LocalAuthentication.authenticateAsync({
      promptMessage: 'Verify your identity to enable biometric login',
    });

    if (result.success) {
      await updateBiometricSetting(true);
      setBiometricEnabled(true);
      toast.show('Biometric authentication enabled', { type: 'success' });
    }
  } else {
    // Disable biometric
    await updateBiometricSetting(false);
    setBiometricEnabled(false);
    toast.show('Biometric authentication disabled', { type: 'info' });
  }
};

const updateBiometricSetting = async (enabled: boolean) => {
  const db = await getDatabase();
  const userId = await getCurrentUserId();
  await db.runAsync(
    'UPDATE users SET biometric_enabled = ? WHERE id = ?',
    [enabled ? 1 : 0, userId]
  );
};
```

**Database Changes:**
- Add `biometric_enabled` column to `users` table (if not exists)
- Migration in `dbInit.ts`

**Dependencies:**
- `expo-local-authentication` ✅ Already installed

**Estimated Time:** 2-3 hours

#### 1.3 Change Password Screen

**Current State:**
```typescript
handleChangePassword() {
  Alert.alert('Coming Soon', 'Password change screen will be available soon');
}
```

**Required Changes:**

**New File:** `src/screens/Settings/ChangePasswordScreen.tsx`

```typescript
export default function ChangePasswordScreen() {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState({});

  const handleSubmit = async () => {
    // Validate current password
    const user = await getCurrentUser();
    const isValid = await verifyPassword(currentPassword, user.password_hash);
    
    if (!isValid) {
      setErrors({ current: 'Current password is incorrect' });
      return;
    }

    // Validate new password
    const validation = validatePassword(newPassword);
    if (!validation.isValid) {
      setErrors({ new: validation.errors.join('\n') });
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrors({ confirm: 'Passwords do not match' });
      return;
    }

    // Update password
    const newHash = await hashPassword(newPassword);
    await updateUserPassword(user.id, newHash);
    
    toast.show('Password changed successfully', { type: 'success' });
    router.back();
  };

  return (
    // Form with current password, new password, confirm password
    // Submit button
    // Password strength indicator
    // Validation error messages
  );
}
```

**New Route:** `app/settings/change-password.tsx`

**Dependencies:**
- Existing: `src/utils/crypto/passwordHash.ts` ✅
- Existing: `src/utils/validators/passwordValidator.ts` ✅

**Estimated Time:** 2-3 hours

#### 1.4 Security Log Viewer

**Current State:**
```typescript
handleViewSecurityLog() {
  Alert.alert('Coming Soon', 'Security log viewer will be available soon');
}
```

**Required Changes:**

**New File:** `src/screens/Settings/SecurityLogScreen.tsx`

```typescript
export default function SecurityLogScreen() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [filter, setFilter] = useState<'all' | 'login' | 'security'>('all');

  useEffect(() => {
    loadSecurityLogs();
  }, [filter]);

  const loadSecurityLogs = async () => {
    const userId = await getCurrentUserId();
    const allLogs = await getAuditLogs(userId, {
      actions: filter === 'login' ? ['LOGIN', 'LOGOUT', 'FAILED_LOGIN'] 
              : filter === 'security' ? ['MFA_ENABLED', 'MFA_DISABLED', 'PASSWORD_CHANGE']
              : undefined,
      limit: 100,
    });
    setLogs(allLogs);
  };

  return (
    // FlatList of audit logs
    // Filter tabs: All, Login, Security
    // Each log shows: timestamp, action, details, IP address
    // Pull to refresh
    // Export logs option
  );
}
```

**New Route:** `app/settings/security-log.tsx`

**Dependencies:**
- Existing: `src/services/database/auditService.ts` ✅

**Estimated Time:** 2-3 hours

---

### Phase 2: Preferences Enhancement

#### 2.1 Persist Preferences to Database

**Current Issue:** Preferences only stored in component state, lost on app restart

**Solution:** Create `app_preferences` table

**Database Migration (v6):**

```sql
CREATE TABLE IF NOT EXISTS app_preferences (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  preference_key TEXT NOT NULL,
  preference_value TEXT NOT NULL,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE(user_id, preference_key)
);

CREATE INDEX idx_preferences_user ON app_preferences(user_id);
```

**New Service:** `src/services/database/preferenceService.ts`

```typescript
export interface AppPreference {
  darkMode: boolean;
  compactView: boolean;
  showThumbnails: boolean;
  notifications: boolean;
  autoBackup: boolean;
  autoBackupFrequency: 'daily' | 'weekly' | 'monthly';
  defaultSortMode: 'date' | 'name' | 'size' | 'type';
  defaultViewMode: 'all' | 'favorites' | 'recent';
}

export async function getPreferences(userId: number): Promise<AppPreference> {
  const db = await getDatabase();
  const prefs = await db.getAllAsync(
    'SELECT * FROM app_preferences WHERE user_id = ?',
    [userId]
  );
  
  // Convert rows to preference object with defaults
  const defaults: AppPreference = {
    darkMode: false,
    compactView: false,
    showThumbnails: true,
    notifications: true,
    autoBackup: false,
    autoBackupFrequency: 'weekly',
    defaultSortMode: 'date',
    defaultViewMode: 'all',
  };

  const result = { ...defaults };
  for (const pref of prefs as any[]) {
    result[pref.preference_key as keyof AppPreference] = JSON.parse(pref.preference_value);
  }
  
  return result;
}

export async function setPreference(
  userId: number,
  key: keyof AppPreference,
  value: any
): Promise<void> {
  const db = await getDatabase();
  await db.runAsync(
    `INSERT INTO app_preferences (user_id, preference_key, preference_value, updated_at)
     VALUES (?, ?, ?, CURRENT_TIMESTAMP)
     ON CONFLICT(user_id, preference_key)
     DO UPDATE SET preference_value = ?, updated_at = CURRENT_TIMESTAMP`,
    [userId, key, JSON.stringify(value), JSON.stringify(value)]
  );
}
```

**Update PreferencesScreen:**

```typescript
// Load preferences on mount
useEffect(() => {
  loadPreferences();
}, []);

const loadPreferences = async () => {
  const userId = await getCurrentUserId();
  const prefs = await getPreferences(userId);
  setCompactViewEnabled(prefs.compactView);
  setShowThumbnailsEnabled(prefs.showThumbnails);
  // ... set all preferences
};

// Save preferences when changed
const handleToggleCompactView = async (value: boolean) => {
  setCompactViewEnabled(value);
  const userId = await getCurrentUserId();
  await setPreference(userId, 'compactView', value);
};
```

**Estimated Time:** 3-4 hours

#### 2.2 Implement Clear Cache

**Current State:**
```typescript
handleClearCache() {
  // TODO: Implement cache clearing
  Alert.alert('Success', 'Cache cleared successfully');
}
```

**Required Changes:**

```typescript
const handleClearCache = async () => {
  Alert.alert(
    'Clear Cache',
    'This will clear thumbnails and temporary files. Your documents will not be affected.',
    [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Clear Cache',
        style: 'destructive',
        onPress: async () => {
          try {
            const thumbnailsDir = getThumbnailsDirectory();
            const tempDir = FileSystem.cacheDirectory;

            // Delete all thumbnails
            if (await thumbnailsDir.exists()) {
              for await (const file of thumbnailsDir) {
                if (file.isFile) {
                  await file.delete();
                }
              }
            }

            // Clear Expo cache directory
            if (tempDir) {
              await FileSystem.deleteAsync(tempDir, { idempotent: true });
            }

            // Recalculate cache size
            const newSize = await calculateCacheSize();
            
            toast.show(`Cache cleared (freed ${formatFileSize(newSize)})`, { 
              type: 'success' 
            });
          } catch (error) {
            toast.show('Failed to clear cache', { type: 'error' });
          }
        },
      },
    ]
  );
};

const calculateCacheSize = async (): Promise<number> => {
  let totalSize = 0;
  const thumbnailsDir = getThumbnailsDirectory();
  
  if (await thumbnailsDir.exists()) {
    for await (const file of thumbnailsDir) {
      if (file.isFile) {
        const info = await file.stat();
        totalSize += info.size || 0;
      }
    }
  }
  
  return totalSize;
};
```

**Estimated Time:** 1-2 hours

---

### Phase 3: Document Management Settings (NEW)

#### 3.1 Create Document Management Screen

**New File:** `src/screens/Settings/DocumentManagementScreen.tsx`

**Features:**

1. **Storage Usage**
   - Total storage used
   - Documents count
   - Average document size
   - Largest documents list
   - By category breakdown
   - Visual chart/progress bar

2. **Bulk Operations**
   - Delete all documents
   - Delete documents by category
   - Delete documents older than X days
   - Delete documents by size (> X MB)
   - Export all documents
   - Re-encrypt all documents (with new key)

3. **Cleanup Tools**
   - Find and remove duplicates
   - Remove orphaned files (DB records without files)
   - Remove orphaned files (files without DB records)
   - Optimize database (VACUUM)
   - Rebuild search index

4. **Document Retention**
   - Auto-delete after X days
   - Maximum document count
   - Maximum storage size
   - Warn when limits reached

**Implementation:**

```typescript
export default function DocumentManagementScreen() {
  const [stats, setStats] = useState<DocumentStats | null>(null);
  const [storageBreakdown, setStorageBreakdown] = useState<CategoryStorage[]>([]);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    const docStats = await getDocumentStats();
    const breakdown = await getStorageByCategory();
    setStats(docStats);
    setStorageBreakdown(breakdown);
  };

  const handleDeleteAll = () => {
    Alert.alert(
      'Delete All Documents',
      'This will permanently delete ALL documents and cannot be undone. Are you absolutely sure?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete All',
          style: 'destructive',
          onPress: async () => {
            try {
              const count = await deleteAllDocuments();
              toast.show(`Deleted ${count} documents`, { type: 'success' });
              loadStats();
            } catch (error) {
              toast.show('Failed to delete documents', { type: 'error' });
            }
          },
        },
      ]
    );
  };

  const handleFindDuplicates = async () => {
    const duplicates = await findDuplicateDocuments();
    if (duplicates.length === 0) {
      Alert.alert('No Duplicates', 'No duplicate documents found');
    } else {
      router.push({
        pathname: '/settings/duplicates',
        params: { duplicates: JSON.stringify(duplicates) },
      });
    }
  };

  return (
    <ScrollView>
      {/* Storage Usage Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Storage Usage</Text>
        
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>Total Documents</Text>
          <Text style={styles.statValue}>{stats?.totalDocuments || 0}</Text>
        </View>

        <View style={styles.statCard}>
          <Text style={styles.statLabel}>Total Storage</Text>
          <Text style={styles.statValue}>
            {formatFileSize(stats?.totalSize || 0)}
          </Text>
        </View>

        {/* Storage breakdown by category */}
        {storageBreakdown.map((cat) => (
          <View key={cat.id} style={styles.categoryRow}>
            <Text>{cat.name}</Text>
            <Text>{formatFileSize(cat.size)} ({cat.count} docs)</Text>
          </View>
        ))}
      </View>

      {/* Bulk Operations Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Bulk Operations</Text>

        <TouchableOpacity style={styles.dangerButton} onPress={handleDeleteAll}>
          <Text style={styles.dangerButtonText}>Delete All Documents</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.button} onPress={handleFindDuplicates}>
          <Text style={styles.buttonText}>Find Duplicates</Text>
        </TouchableOpacity>
      </View>

      {/* Cleanup Tools Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Cleanup Tools</Text>

        <TouchableOpacity style={styles.button} onPress={handleOptimizeDatabase}>
          <Text style={styles.buttonText}>Optimize Database</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.button} onPress={handleRebuildIndex}>
          <Text style={styles.buttonText}>Rebuild Search Index</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}
```

**New Service Functions:**

```typescript
// src/services/database/documentService.ts

export async function deleteAllDocuments(userId?: number): Promise<number> {
  const currentUserId = userId || (await getCurrentUserId());
  const docs = await getDocuments({ userId: currentUserId });
  
  for (const doc of docs) {
    await deleteDocument(doc.id, currentUserId);
  }
  
  return docs.length;
}

export async function findDuplicateDocuments(
  userId?: number
): Promise<DuplicateGroup[]> {
  const currentUserId = userId || (await getCurrentUserId());
  const db = await getDatabase();
  
  const duplicates = await db.getAllAsync<any>(
    `SELECT filename, file_size, COUNT(*) as count, 
            GROUP_CONCAT(id) as ids
     FROM documents
     WHERE user_id = ?
     GROUP BY filename, file_size
     HAVING count > 1`,
    [currentUserId]
  );
  
  return duplicates.map((d) => ({
    filename: d.filename,
    size: d.file_size,
    count: d.count,
    documentIds: d.ids.split(',').map(Number),
  }));
}

export async function getStorageByCategory(
  userId?: number
): Promise<CategoryStorage[]> {
  const currentUserId = userId || (await getCurrentUserId());
  const db = await getDatabase();
  
  const results = await db.getAllAsync<any>(
    `SELECT c.id, c.name, 
            COUNT(d.id) as count,
            SUM(d.file_size) as size
     FROM categories c
     LEFT JOIN documents d ON d.category_id = c.id
     WHERE c.user_id = ?
     GROUP BY c.id
     ORDER BY size DESC`,
    [currentUserId]
  );
  
  return results;
}

export async function optimizeDatabase(): Promise<void> {
  const db = await getDatabase();
  await db.execAsync('VACUUM');
}

export async function rebuildSearchIndex(): Promise<void> {
  const db = await getDatabase();
  await db.execAsync('DELETE FROM documents_fts');
  await db.execAsync(
    `INSERT INTO documents_fts(rowid, filename, ocr_text, original_filename)
     SELECT id, filename, ocr_text, original_filename FROM documents`
  );
}
```

**New Route:** `app/settings/document-management.tsx`

**Estimated Time:** 4-6 hours

#### 3.2 Update Settings Menu

**File:** `app/(tabs)/explore.tsx`

Add new menu item:

```typescript
const settingsItems = [
  // ... existing items
  {
    id: 'document-management',
    title: 'Document Management',
    subtitle: 'Storage, cleanup, and bulk operations',
    icon: 'folder.badge.gearshape',
    color: '#FF9500',
    onPress: () => router.push('/settings/document-management' as any),
  },
  // ... rest of items
];
```

---

## 📊 Implementation Summary

### Files to Create (10 new files)

1. `development-plans/fr-main-020-settings-enhancement-plan.md` (THIS FILE)
2. `src/screens/Settings/ChangePasswordScreen.tsx`
3. `src/screens/Settings/SecurityLogScreen.tsx`
4. `src/screens/Settings/DocumentManagementScreen.tsx`
5. `src/screens/Settings/DuplicatesScreen.tsx`
6. `src/services/database/preferenceService.ts`
7. `app/settings/change-password.tsx`
8. `app/settings/security-log.tsx`
9. `app/settings/document-management.tsx`
10. `app/settings/duplicates.tsx`

### Files to Modify (5 existing files)

1. `src/screens/Settings/SecuritySettingsScreen.tsx` - Wire up MFA, biometric, navigation
2. `src/screens/Settings/PreferencesScreen.tsx` - Persistence, cache clearing
3. `src/services/database/dbInit.ts` - Add v6 migration for preferences table
4. `src/services/database/documentService.ts` - Add bulk operations
5. `app/(tabs)/explore.tsx` - Add document management menu item

### Database Changes

**Schema v6:**
- Add `app_preferences` table
- Add `biometric_enabled` column to `users` table (if not exists)

### Estimated Total Time

- **Phase 1 (Security):** 8-10 hours
- **Phase 2 (Preferences):** 4-6 hours
- **Phase 3 (Document Management):** 6-8 hours
- **Testing:** 2-3 hours
- **Documentation:** 1-2 hours

**Total:** 21-29 hours (~3-4 days)

---

## 🧪 Testing Plan

### Unit Tests

1. **preferenceService.test.ts**
   - getPreferences() returns defaults
   - setPreference() persists value
   - Multiple preferences work independently

2. **documentService.test.ts** (additions)
   - deleteAllDocuments() removes all
   - findDuplicateDocuments() finds matches
   - getStorageByCategory() calculates correctly
   - optimizeDatabase() runs without error
   - rebuildSearchIndex() populates FTS table

### Integration Tests

1. **SecuritySettings.e2e.js**
   - Toggle MFA on/off
   - Enable biometric
   - Change password flow
   - View security logs

2. **Preferences.e2e.js**
   - Toggle preferences
   - Preferences persist after restart
   - Clear cache reduces storage
   - Reset settings restores defaults

3. **DocumentManagement.e2e.js**
   - View storage stats
   - Find duplicates
   - Delete all documents (with confirmation)
   - Optimize database

### Manual Testing Checklist

- [ ] MFA toggle enables/disables correctly
- [ ] Biometric prompt appears and works
- [ ] Change password validates and updates
- [ ] Security log displays recent activity
- [ ] Preferences persist after app restart
- [ ] Clear cache removes thumbnails
- [ ] Storage stats show correct numbers
- [ ] Find duplicates identifies matches
- [ ] Delete all documents removes everything
- [ ] Optimize database runs successfully

---

## 🚀 Rollout Plan

### Step 1: Security Settings (Day 1)
1. Wire up MFA toggle
2. Implement biometric authentication
3. Create change password screen
4. Build security log viewer
5. Test all security features
6. Commit: `feat(FR-MAIN-020): Complete security settings functionality`

### Step 2: Preferences Enhancement (Day 2)
1. Create preferences database schema
2. Build preferenceService
3. Update PreferencesScreen with persistence
4. Implement cache clearing
5. Test preference persistence
6. Commit: `feat(FR-MAIN-020): Enhance preferences with persistence and cache clearing`

### Step 3: Document Management (Day 3)
1. Create DocumentManagementScreen
2. Add bulk operation services
3. Implement cleanup tools
4. Add storage breakdown UI
5. Test all bulk operations
6. Commit: `feat(FR-MAIN-020): Add document management settings screen`

### Step 4: Testing & Polish (Day 4)
1. Write unit tests
2. Run integration tests
3. Fix any bugs found
4. Update documentation
5. Final commit and push
6. Commit: `test(FR-MAIN-020): Add comprehensive tests for settings enhancement`

---

## 📝 Notes & Considerations

### Security

- Change password requires current password verification
- MFA disable requires confirmation
- Biometric setup requires device support check
- Security logs show sensitive operations
- Bulk delete operations require double confirmation

### Performance

- Storage calculations may be slow with many documents
- Find duplicates can take time with large collections
- Database optimization (VACUUM) blocks other operations
- Consider progress indicators for long operations

### UX

- Use toast notifications instead of alerts where appropriate
- Add loading spinners for async operations
- Confirm all destructive actions
- Show success/error feedback
- Provide helpful error messages

### Compatibility

- Biometric authentication requires device support
- expo-local-authentication already installed
- All file operations use expo-file-system
- Database operations use expo-sqlite v2 API

---

## ✅ Definition of Done

- [ ] All placeholder alerts replaced with functionality
- [ ] All toggles connected to database
- [ ] All new screens implemented
- [ ] Database migrations tested
- [ ] Unit tests written and passing
- [ ] Integration tests written and passing
- [ ] Manual testing completed
- [ ] Documentation updated (DEVELOPMENT_CONTEXT.md)
- [ ] Commands added to COMMAND_REFERENCE.md
- [ ] Code committed with proper tags
- [ ] Changes pushed to GitHub
- [ ] FIRST_RELEASE_ESSENTIALS.md updated to 100%

---

**Status:** Ready for Implementation  
**Next Step:** Begin Phase 1 - Security Settings Enhancement
