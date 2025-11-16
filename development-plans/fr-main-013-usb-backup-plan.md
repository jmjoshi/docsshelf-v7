# FR-MAIN-013: USB/External Storage Backup (Wired) - Implementation Plan

**Feature:** Wired Backup to USB Drives and External Storage  
**Priority:** High  
**Estimated Complexity:** Medium-High (2-3 weeks)  
**Status:** In Development  
**Start Date:** November 15, 2025

---

## Requirements Summary (From PRD)

**User Story:**  
As a user, I want my documents to be backed up to storage devices such as USB pen drive, external disk drive, memory stick.

**Expected Behavior:**
- Automatic backup of documents to external storage devices
- Support for USB pen drives, external disk drives, memory sticks
- Wired connection via:
  - **iOS devices:** Lightning to USB adapter, USB-C adapter (newer iPhones/iPads)
  - **Android devices:** USB-C port, USB OTG adapter
- User-initiated backup (not fully automatic due to platform limitations)
- Restore capability from USB backup
- Backup verification and integrity checking

---

## Technical Feasibility Analysis

### iOS Limitations
- ❌ **No direct USB access** - iOS does not allow direct file system access to USB devices
- ✅ **Files app integration** - Can use document picker to select USB drive in Files app
- ✅ **Share extension** - Can export backup files to Files app, user chooses USB destination
- ⚠️ **Manual process** - User must manually select USB drive; cannot be fully automatic

### Android Capabilities
- ✅ **USB OTG support** - Direct access to USB devices via OTG
- ✅ **Storage Access Framework** - Can programmatically access external storage
- ✅ **Semi-automatic** - Can detect USB connection and prompt user
- ⚠️ **Permissions required** - Need MANAGE_EXTERNAL_STORAGE permission (Android 11+)

### Revised Approach
Instead of fully automatic wired backup, implement:
1. **Export Backup** - Create encrypted backup package
2. **Choose Destination** - User selects location (can be USB via Files app)
3. **Import Backup** - Restore from backup file (user selects from USB)

---

## Architecture Overview

### Components

#### 1. Backup Export Service
**File:** `src/services/backup/backupExportService.ts`

**Responsibilities:**
- Create backup package with all documents
- Include backup manifest (metadata)
- Compress backup for smaller file size
- Encrypt backup package
- Generate integrity checksum

**Backup Format:**
```
backup-YYYYMMDD-HHMMSS.docsshelf
├── manifest.json (backup metadata)
├── documents/ (encrypted document files)
│   ├── doc_1.enc
│   ├── doc_2.enc
│   └── ...
├── database.json (categories, metadata)
└── checksum.sha256 (integrity verification)
```

#### 2. Backup Import Service
**File:** `src/services/backup/backupImportService.ts`

**Responsibilities:**
- Read backup package
- Verify integrity with checksum
- Decrypt backup contents
- Import documents to database
- Handle duplicate detection
- Merge categories

#### 3. File System Service
**File:** `src/services/storage/fileSystemService.ts`

**Responsibilities:**
- Use expo-document-picker for file selection
- Use expo-sharing for export
- Create temporary backup files
- Clean up temporary files

#### 4. Backup UI
**File:** `src/screens/Settings/BackupScreen.tsx`

**Features:**
- Export backup button
- Import/restore backup button
- Backup history list
- Last backup timestamp
- Backup size display
- Settings (include/exclude options)

---

## Technical Stack

### Required Packages

```json
{
  "expo-document-picker": "^11.x.x",  // Already installed
  "expo-file-system": "^16.x.x",      // Already installed  
  "expo-sharing": "^12.x.x",          // For sharing backup files
  "react-native-zip-archive": "^6.x.x", // For compression
  "react-native-fs": "^2.x.x"         // Enhanced file operations
}
```

### Platform-Specific Configurations

**iOS (app.json):**
```json
{
  "ios": {
    "infoPlist": {
      "UIFileSharingEnabled": true,
      "LSSupportsOpeningDocumentsInPlace": true,
      "UISupportsDocumentBrowser": true
    }
  }
}
```

**Android (app.json):**
```json
{
  "android": {
    "permissions": [
      "READ_EXTERNAL_STORAGE",
      "WRITE_EXTERNAL_STORAGE",
      "MANAGE_EXTERNAL_STORAGE"
    ]
  }
}
```

---

## Implementation Phases

### Phase 1: Backup Export (Week 1)
**Duration:** 3-4 days

**Tasks:**
1. ✅ Install required packages
2. ✅ Create backupExportService.ts
3. ✅ Implement backup packaging logic
4. ✅ Add compression
5. ✅ Add encryption for backup
6. ✅ Generate manifest JSON
7. ✅ Create checksum

**Files to Create:**
- `src/services/backup/backupExportService.ts` (~300 lines)
- `src/types/backup.ts` (~100 lines)

**Testing:**
- Create backup with sample documents
- Verify backup file structure
- Test encryption/decryption
- Validate checksum

---

### Phase 2: Backup Import/Restore (Week 1)
**Duration:** 3-4 days

**Tasks:**
1. ✅ Create backupImportService.ts
2. ✅ Implement backup validation
3. ✅ Add checksum verification
4. ✅ Implement document import
5. ✅ Handle duplicate detection
6. ✅ Merge categories intelligently
7. ✅ Error handling and rollback

**Files to Create:**
- `src/services/backup/backupImportService.ts` (~350 lines)

**Testing:**
- Import valid backup
- Test with corrupted backup
- Test duplicate handling
- Verify data integrity

---

### Phase 3: Database Schema (Week 2)
**Duration:** 1 day

**Tasks:**
1. ✅ Add backup_history table
2. ✅ Update database version
3. ✅ Create migration script
4. ✅ Test migration

**Database Changes:**

```sql
-- Backup history tracking
CREATE TABLE IF NOT EXISTS backup_history (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  backup_type TEXT NOT NULL, -- 'export' or 'import'
  backup_location TEXT, -- 'usb', 'files_app', 'downloads'
  backup_filename TEXT NOT NULL,
  backup_size INTEGER,
  document_count INTEGER,
  category_count INTEGER,
  backup_hash TEXT, -- SHA256 checksum
  status TEXT DEFAULT 'completed', -- 'completed', 'failed'
  error_message TEXT,
  created_at INTEGER DEFAULT (strftime('%s', 'now')),
  restored_at INTEGER, -- For imports
  user_id INTEGER, -- For future multi-user support
  notes TEXT
);

-- Index for faster queries
CREATE INDEX IF NOT EXISTS idx_backup_history_created 
ON backup_history(created_at DESC);
```

**Files to Modify:**
- `src/services/database/dbInit.ts` (increment version to 4)

---

### Phase 4: UI Implementation (Week 2)
**Duration:** 3-4 days

**Tasks:**
1. ✅ Create BackupScreen.tsx
2. ✅ Add export backup button
3. ✅ Add import backup button
4. ✅ Show backup history
5. ✅ Add progress indicators
6. ✅ Style and polish

**Screen Layout:**
```
┌─────────────────────────────────┐
│  ← Backup & Restore             │
├─────────────────────────────────┤
│                                 │
│  📦 Export Backup               │
│  Create a backup of all docs    │
│  [Export to Files]              │
│                                 │
│  📥 Import Backup               │
│  Restore from backup file       │
│  [Choose File]                  │
│                                 │
│  ─────────────────────────      │
│                                 │
│  📊 Backup History              │
│                                 │
│  ✓ Nov 15, 2025 - 10:30 AM     │
│    45 documents, 23.4 MB        │
│    Exported to Files            │
│                                 │
│  ✓ Nov 12, 2025 - 3:45 PM      │
│    42 documents, 21.8 MB        │
│    Exported to Files            │
│                                 │
│  [Clear History]                │
│                                 │
└─────────────────────────────────┘
```

**Files to Create:**
- `src/screens/Settings/BackupScreen.tsx` (~400 lines)
- `src/components/backup/BackupHistoryItem.tsx` (~100 lines)
- `src/components/backup/BackupProgress.tsx` (~80 lines)

**Navigation:**
- Add route: `app/(tabs)/settings/backup.tsx`
- Add menu item in Settings tab

---

### Phase 5: Integration & Testing (Week 3)
**Duration:** 3-4 days

**Tasks:**
1. ✅ End-to-end testing
2. ✅ Test on physical iOS device
3. ✅ Test on physical Android device
4. ✅ Test large backups (100+ documents)
5. ✅ Test error scenarios
6. ✅ Performance optimization
7. ✅ Documentation

**Test Scenarios:**

**iOS Testing:**
- Export backup → Share to Files app → Save to iCloud Drive
- Export backup → Share via USB using iTunes File Sharing
- Import backup from Files app
- Import backup from iCloud Drive

**Android Testing:**
- Export backup → Save to USB OTG drive
- Export backup → Save to Downloads
- Import backup from USB drive
- Import backup from device storage

**Edge Cases:**
- Very large backup (500+ documents)
- Corrupted backup file
- Incomplete backup file
- Backup from newer app version
- Import duplicate documents
- Low storage space

---

## Backup File Format Specification

### manifest.json Structure
```json
{
  "backup_version": "1.0",
  "app_version": "1.0.0",
  "created_at": "2025-11-15T10:30:00Z",
  "device_platform": "ios",
  "document_count": 45,
  "category_count": 8,
  "total_size_bytes": 24567890,
  "encryption": {
    "algorithm": "AES-256-CTR",
    "hmac": "HMAC-SHA256"
  },
  "documents": [
    {
      "id": 1,
      "filename": "doc_1.enc",
      "original_filename": "contract.pdf",
      "size": 156789,
      "mime_type": "application/pdf",
      "category_id": 2,
      "created_at": 1699876543
    }
  ],
  "categories": [
    {
      "id": 1,
      "name": "Personal",
      "parent_id": null,
      "icon": "folder"
    }
  ]
}
```

### checksum.sha256 Structure
```
SHA256 checksums for backup verification:

manifest.json: abc123...
documents/doc_1.enc: def456...
documents/doc_2.enc: ghi789...
database.json: jkl012...
```

---

## Security Considerations

### Encryption
- ✅ Backup file itself is encrypted with user's master key
- ✅ Documents within backup remain encrypted
- ✅ HMAC verification prevents tampering
- ✅ Checksums ensure file integrity

### Privacy
- ✅ No cloud upload required
- ✅ User controls backup location
- ✅ Can backup to air-gapped USB drives
- ✅ No external services involved

### Access Control
- ✅ Backup requires user authentication
- ✅ Import requires user authentication
- ✅ Cannot import backup from different user (different encryption key)

---

## User Workflow

### Export Backup Workflow

```
1. User taps "Backup & Restore" in Settings
2. User taps "Export Backup"
3. App creates backup package (with progress)
   - "Collecting documents... (23/45)"
   - "Creating backup file..."
   - "Encrypting backup..."
4. Share sheet appears
5. User chooses destination:
   - Files app → USB drive
   - Save to Files (iCloud)
   - AirDrop to Mac
   - Email (for small backups)
6. Success message: "Backup saved successfully"
7. Entry added to backup history
```

### Import Backup Workflow

```
1. User taps "Import Backup"
2. Document picker opens
3. User navigates to USB drive (via Files app on iOS)
4. User selects .docsshelf backup file
5. App validates backup:
   - "Verifying backup integrity..."
   - "Checking encryption..."
6. App shows backup info:
   - Date: Nov 15, 2025
   - Documents: 45
   - Categories: 8
   - Size: 23.4 MB
7. User taps "Restore"
8. Import progress shown:
   - "Importing documents... (23/45)"
   - "Updating categories..."
9. Success message: "Restored 45 documents"
10. Navigate to documents list
```

---

## Error Handling

### Export Errors
- **Insufficient storage:** "Not enough space. Need 50 MB, have 10 MB."
- **No documents:** "No documents to backup."
- **Export failed:** "Backup failed. Please try again."

### Import Errors
- **Invalid file:** "This is not a valid backup file."
- **Corrupted backup:** "Backup file is corrupted or incomplete."
- **Checksum mismatch:** "Backup integrity check failed."
- **Wrong encryption key:** "Cannot decrypt backup. Wrong user?"
- **Version mismatch:** "Backup from newer app version. Please update app."

---

## Platform-Specific Implementation Notes

### iOS Approach
Since iOS doesn't allow direct USB access, we use:
1. **expo-sharing** to export backup file
2. User saves to Files app → On My iPhone or iCloud
3. User can copy to USB using Mac with iTunes File Sharing
4. **expo-document-picker** to import from Files app (including USB drives mounted in Files)

**Limitations:**
- Cannot automatically detect USB connection
- Cannot automatically write to USB
- User must manually use Files app

**Workaround:**
- Clear instructions in UI: "To backup to USB: Export → Save to Files → Connect USB to Mac → Copy via Finder"

### Android Approach
Better USB support via Storage Access Framework:
1. Can detect USB OTG connections
2. Can prompt user when USB connected: "USB drive detected. Backup now?"
3. Can write directly to USB via document picker
4. Better automation possible

**Advantages:**
- More automatic experience
- Direct USB access via OTG
- Notification when USB connected

---

## Performance Optimization

### Compression
- Use ZIP compression to reduce backup size by ~50-70%
- Stream compression for large backups (avoid memory issues)

### Incremental Backup (Future Enhancement)
- Track last backup timestamp
- Only include documents modified since last backup
- Smaller, faster backups

### Background Processing
- Use background tasks for large exports
- Show persistent notification during backup
- Allow user to continue using app

---

## Success Metrics

### Phase Completion Criteria

**Phase 1 (Export):**
- ✅ Can create backup package
- ✅ Backup includes all documents
- ✅ Backup is encrypted
- ✅ Checksum validates
- ✅ File size reasonable (<70% of original)

**Phase 2 (Import):**
- ✅ Can import valid backup
- ✅ All documents restored correctly
- ✅ Categories preserved
- ✅ Duplicates handled properly
- ✅ Invalid backups rejected

**Phase 3 (Database):**
- ✅ Migration successful
- ✅ Backup history tracked
- ✅ No data loss

**Phase 4 (UI):**
- ✅ Export works from UI
- ✅ Import works from UI
- ✅ History displays correctly
- ✅ Progress indicators clear
- ✅ Error messages helpful

**Phase 5 (Testing):**
- ✅ Works on iOS physical device
- ✅ Works on Android physical device
- ✅ Large backups work (500+ docs)
- ✅ Error handling robust
- ✅ Performance acceptable

---

## Timeline Summary

| Phase | Tasks | Duration | Dependencies |
|-------|-------|----------|--------------|
| 1. Export | Backup creation & packaging | 3-4 days | None |
| 2. Import | Restore from backup | 3-4 days | Phase 1 |
| 3. Database | Schema changes | 1 day | None |
| 4. UI | Screens and components | 3-4 days | Phase 1, 2 |
| 5. Testing | E2E testing | 3-4 days | All phases |
| **Total** | | **2-3 weeks** | |

---

## Next Steps

### Immediate (Today):
1. Install required packages
2. Create backup type definitions
3. Start backupExportService.ts implementation
4. Create backup file structure

### Week 1:
1. Complete export functionality
2. Complete import functionality
3. Test export/import cycle

### Week 2:
1. Add database schema
2. Build UI screens
3. Integrate services with UI

### Week 3:
1. Comprehensive testing on devices
2. Fix bugs
3. Optimize performance
4. Write documentation

---

## Questions/Decisions

### 1. Backup File Extension
**Decision:** Use `.docsshelf` extension
- Easy to identify
- Platform agnostic
- Associates with app

### 2. Compression Level
**Decision:** Use standard ZIP compression (level 6)
- Good balance of size vs speed
- Fast enough for mobile devices
- ~50-70% size reduction

### 3. Duplicate Handling on Import
**Decision:** Skip duplicates based on filename + size
- User sees: "Skipped 5 duplicates"
- Option to "Replace existing" or "Keep both"

### 4. Maximum Backup Size
**Decision:** No hard limit, but warn if >500MB
- Most backups will be <100MB
- Large backups work but take longer
- Warning: "This backup is large (500MB). It may take several minutes."

---

## Future Enhancements (Post-MVP)

### V2 Features:
- **Automatic scheduled backups** (when USB connected)
- **Incremental backups** (faster, smaller)
- **Cloud backup** (iCloud, Google Drive, Dropbox)
- **Backup encryption password** (separate from app)
- **Selective backup** (choose categories)
- **Backup to NAS** (network storage)
- **WiFi direct transfer** (to computer)

---

**Tags:** #fr-main-013 #usb-backup #external-storage #wired-backup #export #import #restore

**Status:** Ready to start implementation ✅
