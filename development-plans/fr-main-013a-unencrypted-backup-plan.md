# FR-MAIN-013A Implementation Plan: Unencrypted Backup to USB/External Storage

**Requirement ID:** FR-MAIN-013A  
**Priority:** High (Next after First Android Build)  
**Estimated Duration:** 3-4 days  
**Dependencies:** FR-MAIN-013 (Encrypted Backup - Complete ✅)  
**Created:** November 22, 2025  
**Status:** Planning

---

## 📋 Requirement Summary

### User Story
> As a user, I want my documents to be backed up to storage devices such as USB pen drive, external disk drive, memory stick **unencrypted** so that I can view it with any device such as Windows PC, iOS devices, Android devices and tablets.

### Expected Behavior
- App backs up documents to USB/external storage via wired connection (Lightning/USB-C adapters)
- **Key Difference from FR-MAIN-013:** Backup is **UNENCRYPTED** (plain files)
- User must give explicit permission before creating unencrypted backup
- Documents stored in human-readable format (JPEG, PDF, etc.)
- Accessible on any device without DocsShelf app
- User can select specific documents, multiple documents, or all documents
- Works on iOS (Lightning/USB-C adapters) and Android (USB OTG/USB-C)

---

## 🎯 Key Features

### 1. **Unencrypted Backup Format**
- Documents saved as plain files (original format: JPEG, PDF, PNG, etc.)
- No `.enc` extension
- No encryption applied
- Folder structure: `DocsShelf_Backup_YYYYMMDD_HHMMSS/`
  - `manifest.json` - Backup metadata
  - `documents/` - Plain document files with original names
  - `categories.json` - Category structure (optional)

### 2. **Security Warnings & User Consent**
- **Before backup starts:** Show prominent warning dialog
  - "⚠️ **Security Warning**: This backup will NOT be encrypted"
  - "Anyone with access to these files can view your documents"
  - "Only use this for backups you control and trust"
  - Checkbox: "I understand the security risks"
  - "Cancel" / "Continue" buttons

### 3. **Document Selection**
- Select all documents (default)
- Select by category
- Multi-select individual documents
- Show count: "X documents selected"

### 4. **Backup Progress UI**
- Progress dialog showing:
  - Current file being copied
  - Progress bar (X of Y files)
  - Estimated time remaining
  - "Cancel" button

### 5. **Cross-Platform File Access**
- **Windows:** Access via File Explorer when USB drive connected
- **macOS:** Access via Finder when USB drive connected
- **iOS:** Access via Files app (after importing to device)
- **Android:** Access via Files app or any file manager
- No DocsShelf app required to view files

---

## 🔒 Security Considerations

### Critical Security Warnings

**⚠️ UNENCRYPTED BACKUPS ARE A SECURITY RISK**

1. **Data Exposure**
   - Documents stored in plain text/plain format
   - Anyone with physical access can read them
   - No password protection
   - No encryption

2. **User Must Understand Risks**
   - Show warning EVERY time unencrypted backup is created
   - Require explicit checkbox confirmation
   - Log user consent in audit log
   - Consider adding "Are you sure?" double confirmation

3. **Recommended Use Cases (Document in UI)**
   - ✅ Personal USB drive kept secure
   - ✅ Backup to home computer you control
   - ✅ Temporary transfer between own devices
   - ❌ Shared USB drives
   - ❌ Public computers
   - ❌ Unsecured storage

4. **Contrast with FR-MAIN-013 (Encrypted Backup)**
   - FR-MAIN-013: `.docsshelf` file with AES-256 encryption, requires DocsShelf app to restore
   - FR-MAIN-013A: Plain files, accessible anywhere, **NO SECURITY**

---

## 🛠️ Technical Implementation

### Phase 1: Unencrypted Export Service (Day 1-2)

#### File: `src/services/backup/unencryptedBackupService.ts`

```typescript
/**
 * Unencrypted Backup Service
 * Creates plain file backups (NO ENCRYPTION)
 * WARNING: Security risk - user must consent
 */

export interface UnencryptedBackupOptions {
  documentIds: number[]; // Specific documents to backup
  includeCategories?: boolean; // Include category structure
  userId: number;
}

export interface UnencryptedBackupResult {
  success: boolean;
  backupPath: string; // Path to backup folder
  fileCount: number;
  totalSize: number;
  timestamp: string;
  error?: string;
}

export interface BackupProgress {
  currentFile: string;
  filesCompleted: number;
  totalFiles: number;
  bytesCompleted: number;
  totalBytes: number;
  percentComplete: number;
}

// Main backup function
export async function createUnencryptedBackup(
  options: UnencryptedBackupOptions,
  progressCallback?: (progress: BackupProgress) => void
): Promise<UnencryptedBackupResult> {
  // 1. Create backup folder: DocsShelf_Backup_YYYYMMDD_HHMMSS/
  // 2. Create documents/ subfolder
  // 3. For each selected document:
  //    - Read ENCRYPTED file from database
  //    - DECRYPT to plain format
  //    - Save with ORIGINAL FILENAME (no .enc extension)
  //    - Copy to documents/ folder
  // 4. Create manifest.json with metadata
  // 5. Optionally export categories.json
  // 6. Use expo-sharing to share folder via Files app
  // 7. User selects USB drive as destination
  // 8. Save backup history in database
}

// Helper functions
export async function getDocumentsForBackup(
  documentIds: number[],
  userId: number
): Promise<Document[]> {
  // Fetch documents from database
}

export async function decryptAndSaveDocument(
  doc: Document,
  outputPath: string,
  progressCallback?: (progress: BackupProgress) => void
): Promise<void> {
  // Read encrypted file
  // Decrypt using encryption service
  // Save as plain file with original name
}

export async function createBackupManifest(
  documents: Document[],
  backupPath: string
): Promise<void> {
  // Create manifest.json with:
  // - Backup timestamp
  // - Document count
  // - Total size
  // - List of files with metadata
  // - Warning: "UNENCRYPTED BACKUP"
}

export async function shareBackupFolder(
  backupPath: string
): Promise<void> {
  // Use expo-sharing to open share dialog
  // User can save to Files app
  // Then transfer to USB drive
}
```

#### Integration with Existing Services

```typescript
// Use existing encryption service for decryption
import { decryptData } from '../../utils/crypto/encryption';

// Use existing document service
import { getDocumentById, getDocumentsByUser } from '../database/documentService';

// Use existing audit service
import { logAuditEvent } from '../database/auditService';
```

---

### Phase 2: UI Components (Day 2-3)

#### File: `src/screens/Settings/UnencryptedBackupScreen.tsx`

```typescript
/**
 * Unencrypted Backup Screen
 * Allows users to create plain file backups
 * CRITICAL: Shows security warnings
 */

export default function UnencryptedBackupScreen() {
  // State
  const [selectedDocuments, setSelectedDocuments] = useState<number[]>([]);
  const [selectAll, setSelectAll] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [progress, setProgress] = useState<BackupProgress | null>(null);
  const [showSecurityWarning, setShowSecurityWarning] = useState(false);
  const [userConsent, setUserConsent] = useState(false);

  // UI Sections:
  // 1. Security Warning Banner (always visible)
  // 2. Document Selection (checkboxes)
  // 3. "Create Unencrypted Backup" button (red, prominent)
  // 4. Progress dialog (during backup)
  // 5. Success/Error dialog

  return (
    <SafeAreaView>
      {/* Security Warning Banner */}
      <View style={styles.warningBanner}>
        <Icon name="warning" size={24} color="#ff3b30" />
        <Text style={styles.warningText}>
          ⚠️ Unencrypted backups are NOT secure. Anyone with access can view your documents.
        </Text>
      </View>

      {/* Document Selection */}
      <View style={styles.selectionSection}>
        <Text style={styles.sectionTitle}>Select Documents</Text>
        <Checkbox
          label="Select All Documents"
          checked={selectAll}
          onChange={handleSelectAll}
        />
        {!selectAll && (
          <FlatList
            data={documents}
            renderItem={({ item }) => (
              <Checkbox
                label={item.title}
                checked={selectedDocuments.includes(item.id)}
                onChange={() => handleToggleDocument(item.id)}
              />
            )}
          />
        )}
        <Text style={styles.countText}>
          {selectedDocuments.length} documents selected
        </Text>
      </View>

      {/* Create Backup Button */}
      <Button
        title="Create Unencrypted Backup"
        onPress={() => setShowSecurityWarning(true)}
        color="#ff3b30" // Red to indicate danger
        disabled={selectedDocuments.length === 0}
      />

      {/* Security Warning Modal */}
      <SecurityWarningModal
        visible={showSecurityWarning}
        onConfirm={handleCreateBackup}
        onCancel={() => setShowSecurityWarning(false)}
      />

      {/* Progress Dialog */}
      <ProgressDialog
        visible={isCreating}
        progress={progress}
        onCancel={handleCancelBackup}
      />
    </SafeAreaView>
  );
}
```

#### File: `src/components/backup/SecurityWarningModal.tsx`

```typescript
/**
 * Security Warning Modal
 * Shows prominent warning before creating unencrypted backup
 * Requires user acknowledgment
 */

export default function SecurityWarningModal({ visible, onConfirm, onCancel }) {
  const [consentChecked, setConsentChecked] = useState(false);

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.dialog}>
          {/* Warning Icon */}
          <Icon name="warning" size={64} color="#ff3b30" />

          {/* Title */}
          <Text style={styles.title}>⚠️ Security Warning</Text>

          {/* Warning Text */}
          <Text style={styles.warningText}>
            This backup will NOT be encrypted.
            {'\n\n'}
            Anyone with access to these files can view your documents.
            {'\n\n'}
            Only use this for backups you personally control and trust.
          </Text>

          {/* Recommendations */}
          <View style={styles.recommendationsBox}>
            <Text style={styles.recommendationsTitle}>✅ Safe Use Cases:</Text>
            <Text style={styles.recommendationItem}>• Personal USB drive kept secure</Text>
            <Text style={styles.recommendationItem}>• Backup to your own computer</Text>
            <Text style={styles.recommendationItem}>• Transfer between your own devices</Text>
            
            <Text style={styles.recommendationsTitle}>❌ DO NOT use for:</Text>
            <Text style={styles.recommendationItem}>• Shared USB drives</Text>
            <Text style={styles.recommendationItem}>• Public computers</Text>
            <Text style={styles.recommendationItem}>• Unsecured storage</Text>
          </View>

          {/* Consent Checkbox */}
          <Checkbox
            label="I understand the security risks and want to proceed"
            checked={consentChecked}
            onChange={setConsentChecked}
          />

          {/* Buttons */}
          <View style={styles.buttonRow}>
            <Button
              title="Cancel"
              onPress={onCancel}
              style={styles.cancelButton}
            />
            <Button
              title="Continue"
              onPress={onConfirm}
              disabled={!consentChecked}
              color="#ff3b30"
            />
          </View>
        </View>
      </View>
    </Modal>
  );
}
```

---

### Phase 3: Navigation & Integration (Day 3)

#### Add to Backup Screen

**File: `src/screens/Settings/BackupScreen.tsx`**

```typescript
// Add new button for unencrypted backup

<View style={styles.backupOptions}>
  {/* Existing encrypted backup button */}
  <Button
    title="Create Encrypted Backup (.docsshelf)"
    onPress={handleExportBackup}
    icon="lock"
  />

  {/* NEW: Unencrypted backup button */}
  <View style={styles.spacer} />
  <Button
    title="Create Plain File Backup (UNENCRYPTED)"
    onPress={() => router.push('/settings/unencrypted-backup')}
    icon="warning"
    color="#ff3b30"
  />
  <Text style={styles.warningSubtext}>
    ⚠️ Not encrypted - use only for personal, secure storage
  </Text>
</View>
```

#### Add Route

**File: `app/settings/unencrypted-backup.tsx`**

```typescript
import UnencryptedBackupScreen from '../../src/screens/Settings/UnencryptedBackupScreen';

export default UnencryptedBackupScreen;
```

---

### Phase 4: Testing (Day 4)

#### Test Cases

**1. Security Warning Tests**
- [ ] Warning modal appears before backup creation
- [ ] "Continue" button disabled until checkbox checked
- [ ] Warning text clearly explains risks
- [ ] Can cancel without creating backup

**2. Document Selection Tests**
- [ ] Can select all documents
- [ ] Can select specific documents
- [ ] Can select multiple documents
- [ ] Selection count updates correctly
- [ ] Cannot create backup with 0 documents selected

**3. Backup Creation Tests**
- [ ] Progress dialog shows during backup
- [ ] Files created in correct format (no .enc extension)
- [ ] Original filenames preserved
- [ ] Manifest.json created with metadata
- [ ] Category structure exported (if selected)
- [ ] Backup history saved in database

**4. File Access Tests (Critical)**
- [ ] **iOS:** Save to Files app, transfer to USB drive via adapter
- [ ] **Android:** Save to Files app, transfer to USB storage
- [ ] **Windows:** Open backup folder, view documents
- [ ] **macOS:** Open backup folder, view documents
- [ ] **Verify:** Documents are NOT encrypted (can open without DocsShelf)

**5. Error Handling Tests**
- [ ] Handle permission denied for file system
- [ ] Handle insufficient storage space
- [ ] Handle USB drive disconnected during backup
- [ ] Handle user cancel during backup
- [ ] Show appropriate error messages

**6. Audit Logging Tests**
- [ ] User consent logged
- [ ] Backup creation logged
- [ ] Document IDs logged
- [ ] Timestamp logged
- [ ] Can export audit log for compliance

---

## 📱 Platform-Specific Implementation Notes

### iOS (Lightning/USB-C Adapters)

**Adapter Requirements:**
- Lightning to USB Camera Adapter (older iPhones)
- USB-C to USB Adapter (iPhone 15+)
- iPad Pro (2018+) with USB-C

**File Access:**
1. Create backup folder with `expo-file-system`
2. Use `expo-sharing` to open Share Sheet
3. User selects "Save to Files"
4. User navigates to USB drive (if connected)
5. Or saves to Files app first, then copies to USB later

**Limitations:**
- iOS does not allow direct USB drive access from apps
- Must use Files app as intermediary
- User must manually copy to USB if desired

### Android (USB OTG/USB-C)

**Adapter Requirements:**
- USB OTG adapter (older Android phones)
- Direct USB-C connection (newer Android phones)

**File Access:**
1. Create backup folder with `expo-file-system`
2. Use `expo-sharing` or `expo-file-system` to save to external storage
3. Android allows direct access to USB storage
4. User can save directly to mounted USB drive

**Advantages:**
- More flexible USB access than iOS
- Can write directly to USB storage (with permissions)

---

## 📊 Database Schema Changes

### Add to `backup_history` table

```sql
-- Add column for backup type
ALTER TABLE backup_history ADD COLUMN backup_type TEXT NOT NULL DEFAULT 'encrypted';
-- Values: 'encrypted' (FR-MAIN-013), 'unencrypted' (FR-MAIN-013A)

-- Add column for user consent
ALTER TABLE backup_history ADD COLUMN user_consent INTEGER DEFAULT 0;
-- 1 = User acknowledged security risks, 0 = Encrypted backup (no consent needed)

-- Add column for selected documents
ALTER TABLE backup_history ADD COLUMN document_ids TEXT;
-- JSON array of document IDs included in backup
```

**Migration Script:**
```typescript
// dbInit.ts - Upgrade to v5
case 4:
  await db.execAsync(`
    ALTER TABLE backup_history ADD COLUMN backup_type TEXT NOT NULL DEFAULT 'encrypted';
    ALTER TABLE backup_history ADD COLUMN user_consent INTEGER DEFAULT 0;
    ALTER TABLE backup_history ADD COLUMN document_ids TEXT;
  `);
  console.log('Database upgraded to v5 (FR-MAIN-013A support)');
```

---

## 📝 User Documentation

### In-App Help Text

**Backup Screen:**

> **Encrypted Backup (.docsshelf)**  
> Creates a secure, encrypted backup file. Requires DocsShelf app to restore.  
> ✅ Recommended for sensitive documents

> **Plain File Backup (UNENCRYPTED)**  
> Creates plain, readable files accessible on any device.  
> ⚠️ **NOT SECURE** - Only use for personal, trusted storage

**Unencrypted Backup Screen:**

> This feature creates a backup of your documents as plain, unencrypted files. Anyone with access to these files can view your documents without needing the DocsShelf app.
>
> **When to use:**
> - Backing up to a personal USB drive you keep secure
> - Transferring files to your own computer
> - Viewing documents on devices without DocsShelf
>
> **When NOT to use:**
> - Shared or public USB drives
> - Cloud storage (use encrypted backup instead)
> - Any storage you don't personally control

---

## ✅ Acceptance Criteria

### Must Have (MVP)
- [ ] User can select documents for unencrypted backup
- [ ] Security warning shown before backup creation
- [ ] User must explicitly consent (checkbox)
- [ ] Documents saved as plain files (no encryption)
- [ ] Original filenames preserved
- [ ] Manifest.json created with backup metadata
- [ ] Backup accessible via expo-sharing
- [ ] User can transfer to USB via Files app (iOS) or direct (Android)
- [ ] Backup history logged with consent flag
- [ ] Works on both iOS and Android

### Should Have
- [ ] Progress indicator during backup creation
- [ ] Ability to cancel during backup
- [ ] Category structure exported (optional)
- [ ] Error handling with user-friendly messages
- [ ] Audit logging of all backup operations

### Nice to Have (Future)
- [ ] Automatic backup scheduling (FR-MAIN-013 feature)
- [ ] Multiple backup profiles
- [ ] Backup encryption toggle per document
- [ ] Batch document selection by category

---

## 🚧 Implementation Risks & Mitigations

### Risk 1: Users Don't Understand Security Risks
**Impact:** High - Data breach, privacy violation  
**Mitigation:**
- Multiple warning dialogs
- Required checkbox confirmation
- Red color scheme for all unencrypted backup UI
- Clear, simple language explaining risks
- Document in-app help and FAQ

### Risk 2: iOS File System Limitations
**Impact:** Medium - Poor UX, user confusion  
**Mitigation:**
- Clear instructions for iOS users
- Show step-by-step guide for USB transfer
- Provide alternative: save to Files app first
- Test on physical iOS devices with USB adapters

### Risk 3: Large Backups Timeout or Fail
**Impact:** Medium - User frustration, incomplete backups  
**Mitigation:**
- Implement chunked file processing
- Show detailed progress (X of Y files)
- Allow cancel and resume (future enhancement)
- Test with 1000+ documents

### Risk 4: Accidental Unencrypted Backup
**Impact:** High - Security breach  
**Mitigation:**
- Always default to encrypted backup
- Make unencrypted backup hard to access (separate screen)
- Require explicit navigation and consent
- Log all unencrypted backup creation in audit log

---

## 📅 Implementation Timeline

### Day 1: Service Layer
- Create `unencryptedBackupService.ts`
- Implement document decryption and plain file export
- Create manifest generation
- Integration with expo-sharing
- Unit tests for service functions

### Day 2: UI Components (Part 1)
- Create `UnencryptedBackupScreen.tsx`
- Implement document selection UI
- Create security warning modal
- Progress dialog component
- Styling and layout

### Day 3: UI Components (Part 2) & Integration
- Complete UI components
- Add navigation route
- Integrate with BackupScreen
- Database migration to v5
- Integration tests

### Day 4: Testing & Documentation
- Manual testing on physical devices (iOS & Android)
- Test USB transfer workflow
- Verify file accessibility on Windows/macOS
- Update user documentation
- Code review and refinements

---

## 🔗 Related Requirements

- **FR-MAIN-013** (Parent): Encrypted backup to USB (Complete ✅)
- **FR-MAIN-012** (Sibling): Cloud backup (Pending)
- **FR-MAIN-012A** (Sibling): Cross-device sync (Pending)
- **FR-MAIN-014** (Future): Wireless backup to USB (Pending)

---

## 📌 Summary

FR-MAIN-013A extends the existing encrypted backup feature (FR-MAIN-013) by adding the ability to create **unencrypted, plain file backups** accessible on any device without the DocsShelf app.

**Key Differentiators:**
- **FR-MAIN-013:** `.docsshelf` encrypted file, requires DocsShelf app, secure
- **FR-MAIN-013A:** Plain files (JPEG, PDF, etc.), accessible anywhere, **NOT SECURE**

**Critical Success Factors:**
1. Clear, prominent security warnings
2. Explicit user consent required
3. Proper audit logging for compliance
4. Seamless USB/external storage integration
5. Cross-platform file accessibility

**Implementation Priority:** HIGH - Provides essential feature for users needing cross-device document access without installing DocsShelf on every device.

---

**Status:** Ready for Implementation  
**Estimated Effort:** 3-4 days  
**Dependencies:** None (FR-MAIN-013 already complete)  
**Risk Level:** Medium (security implications, but mitigated with warnings)  

---

**Created by:** GitHub Copilot  
**Date:** November 22, 2025  
**Next Steps:** Begin implementation with Phase 1 (Service Layer)
