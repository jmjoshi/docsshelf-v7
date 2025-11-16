# FR-MAIN-012: Cloud Sync Across Devices - Implementation Plan

**Feature:** Cloud-Based Document Sync Across Logged-In Devices  
**Priority:** High  
**Estimated Complexity:** High (3-4 weeks)  
**Status:** In Development

**Note:** External storage backup features moved to FR-MAIN-013 (wired) and FR-MAIN-014 (wireless)

---

## Requirements Summary (Updated from PRD)

**User Story:**  
As a user, I want my documents to be backed up and synced across devices.

**Expected Behavior:**
- Automatic backup of documents to cloud storage
- Sync across all logged-in devices seamlessly
- Support multiple connection methods:
  - Cloud sync via internet
  - WiFi direct sync between devices on same network
  - Bluetooth sync for nearby devices
- Real-time or scheduled sync options
- Conflict resolution when same document edited on multiple devices

---

## Architecture Overview

### Components Required

#### 1. Storage Backend
- **Cloud Storage Integration**
  - AWS S3 bucket setup
  - Google Drive API integration
  - iCloud integration (iOS)
  - Authentication and authorization

#### 2. Sync Engine
- **Sync Service** (`src/services/sync/syncService.ts`)
  - Change detection (file hashing)
  - Conflict resolution (last-write-wins, versioning)
  - Delta sync (only changed files)
  - Background sync scheduler

#### 3. Device Communication
- **WiFi Sync** (`src/services/sync/wifiSyncService.ts`)
  - Local network discovery (mDNS/Bonjour)
  - Secure socket communication
  - Device pairing and authentication

- **Bluetooth Sync** (`src/services/sync/bluetoothSyncService.ts`)
  - Bluetooth LE pairing
  - Data transfer over BLE
  - iOS and Android compatibility

- **Wired Sync** (`src/services/sync/wiredSyncService.ts`)
  - USB device detection
  - File system access
  - Direct file transfer

#### 4. Backup Manager
- **Backup Service** (`src/services/backup/backupService.ts`)
  - Scheduled backups
  - Incremental backups
  - Backup verification
  - Restore functionality

#### 5. External Storage Access
- **Storage Service** (`src/services/storage/externalStorageService.ts`)
  - USB drive detection
  - File system permissions
  - Read/write operations
  - Device unmount handling

---

## Technical Stack

### React Native Packages Required

#### Cloud Storage
```json
{
  "@aws-sdk/client-s3": "^3.x.x",
  "@react-native-google-signin/google-signin": "^10.x.x",
  "react-native-icloud-storage": "^2.x.x"
}
```

#### Network Communication
```json
{
  "react-native-zeroconf": "^1.x.x",
  "react-native-tcp-socket": "^6.x.x",
  "react-native-udp": "^4.x.x"
}
```

#### Bluetooth
```json
{
  "react-native-ble-plx": "^3.x.x"
}
```

#### File System & Storage
```json
{
  "react-native-fs": "^2.x.x",
  "react-native-document-picker": "^9.x.x",
  "react-native-usb-device-manager": "^1.x.x"
}
```

#### Background Tasks
```json
{
  "react-native-background-fetch": "^4.x.x",
  "react-native-background-upload": "^6.x.x"
}
```

---

## Implementation Phases

### Phase 1: Cloud Backup (2 weeks)
**Priority:** High  
**Dependencies:** None

#### Tasks:
1. **AWS S3 Setup**
   - Create S3 bucket with encryption
   - Configure IAM policies
   - Setup Cognito for user authentication
   - Implement presigned URLs for secure uploads

2. **Backup Service Implementation**
   - Create `backupService.ts`
   - Implement upload queue
   - Add progress tracking
   - Handle network interruptions
   - Add retry logic

3. **Restore Functionality**
   - Download documents from S3
   - Decrypt and save to local database
   - Handle conflicts (local vs cloud)

4. **UI Components**
   - Backup settings screen
   - Manual backup trigger
   - Backup status indicator
   - Restore interface

#### Files to Create:
- `src/services/backup/backupService.ts`
- `src/services/cloud/s3Service.ts`
- `src/screens/Settings/BackupSettingsScreen.tsx`
- `src/components/backup/BackupStatusIndicator.tsx`

---

### Phase 2: WiFi Sync (2 weeks)
**Priority:** High  
**Dependencies:** Phase 1

#### Tasks:
1. **Device Discovery**
   - Implement mDNS service broadcasting
   - Discover other devices on local network
   - Display available devices in UI

2. **Secure Pairing**
   - Generate pairing codes
   - Implement device authentication
   - Exchange encryption keys

3. **Data Synchronization**
   - Implement sync protocol
   - Transfer document metadata
   - Transfer encrypted documents
   - Handle sync conflicts

4. **Background Sync**
   - Auto-sync when on WiFi
   - Configurable sync intervals
   - Battery-aware syncing

#### Files to Create:
- `src/services/sync/wifiSyncService.ts`
- `src/services/sync/deviceDiscovery.ts`
- `src/services/sync/syncProtocol.ts`
- `src/screens/Settings/WiFiSyncScreen.tsx`

---

### Phase 3: External Storage Backup (1.5 weeks)
**Priority:** Medium  
**Dependencies:** Phase 1

#### Tasks:
1. **USB Device Detection**
   - Detect connected USB devices
   - Request file system permissions
   - List available storage devices

2. **Backup to External Storage**
   - Copy encrypted documents to USB
   - Create backup manifest
   - Verify backup integrity

3. **Restore from External Storage**
   - Read backup manifest
   - Import documents from USB
   - Handle duplicates

4. **UI Components**
   - External storage screen
   - Device list
   - Backup/restore controls

#### Files to Create:
- `src/services/storage/externalStorageService.ts`
- `src/services/backup/usbBackupService.ts`
- `src/screens/Settings/ExternalStorageScreen.tsx`

---

### Phase 4: Bluetooth Sync (1.5 weeks)
**Priority:** Low  
**Dependencies:** Phase 2

#### Tasks:
1. **Bluetooth Pairing**
   - Scan for nearby devices
   - Implement BLE pairing
   - Secure connection establishment

2. **Data Transfer**
   - Transfer documents over BLE
   - Handle limited bandwidth
   - Progress indication

3. **UI Components**
   - Bluetooth devices list
   - Pairing interface
   - Transfer progress

#### Files to Create:
- `src/services/sync/bluetoothSyncService.ts`
- `src/screens/Settings/BluetoothSyncScreen.tsx`

---

### Phase 5: Wired Sync (1 week)
**Priority:** Low  
**Dependencies:** Phase 3

#### Tasks:
1. **Wired Connection Detection**
   - Detect USB-C/Lightning connections
   - Platform-specific implementations

2. **Direct Transfer**
   - File transfer over USB
   - High-speed sync

#### Files to Create:
- `src/services/sync/wiredSyncService.ts`

---

## Database Schema Changes

### New Tables

#### `sync_devices`
```sql
CREATE TABLE IF NOT EXISTS sync_devices (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  device_id TEXT UNIQUE NOT NULL,
  device_name TEXT NOT NULL,
  device_type TEXT NOT NULL, -- 'mobile', 'tablet', 'desktop'
  platform TEXT NOT NULL, -- 'ios', 'android'
  last_sync_at INTEGER,
  pairing_status TEXT DEFAULT 'unpaired', -- 'unpaired', 'paired', 'trusted'
  encryption_public_key TEXT,
  created_at INTEGER DEFAULT (strftime('%s', 'now')),
  updated_at INTEGER DEFAULT (strftime('%s', 'now'))
);
```

#### `sync_history`
```sql
CREATE TABLE IF NOT EXISTS sync_history (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  device_id TEXT NOT NULL,
  sync_type TEXT NOT NULL, -- 'cloud', 'wifi', 'bluetooth', 'usb'
  sync_direction TEXT NOT NULL, -- 'upload', 'download', 'bidirectional'
  documents_synced INTEGER DEFAULT 0,
  bytes_transferred INTEGER DEFAULT 0,
  status TEXT NOT NULL, -- 'in_progress', 'completed', 'failed'
  error_message TEXT,
  started_at INTEGER DEFAULT (strftime('%s', 'now')),
  completed_at INTEGER,
  FOREIGN KEY (device_id) REFERENCES sync_devices(device_id)
);
```

#### `backup_metadata`
```sql
CREATE TABLE IF NOT EXISTS backup_metadata (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  backup_location TEXT NOT NULL, -- 's3', 'usb', 'external'
  backup_path TEXT,
  backup_size INTEGER,
  document_count INTEGER,
  backup_hash TEXT, -- For integrity verification
  status TEXT DEFAULT 'pending', -- 'pending', 'completed', 'failed'
  created_at INTEGER DEFAULT (strftime('%s', 'now')),
  updated_at INTEGER DEFAULT (strftime('%s', 'now'))
);
```

#### `document_sync_status`
```sql
CREATE TABLE IF NOT EXISTS document_sync_status (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  document_id INTEGER NOT NULL,
  sync_status TEXT DEFAULT 'pending', -- 'pending', 'synced', 'conflict'
  cloud_sync_at INTEGER,
  last_modified_hash TEXT,
  conflict_version TEXT, -- JSON of conflicting version info
  FOREIGN KEY (document_id) REFERENCES documents(id) ON DELETE CASCADE
);
```

---

## Security Considerations

### 1. End-to-End Encryption
- All synced data remains encrypted
- Encryption keys never leave device
- Cloud storage only has encrypted blobs

### 2. Device Authentication
- Mutual TLS for device-to-device sync
- Device pairing with verification codes
- Trusted device list

### 3. Access Control
- User authentication required for all sync operations
- Revoke device access remotely
- Audit log of all sync activities

### 4. Data Integrity
- HMAC verification for all transferred data
- Checksum validation
- Rollback capability for failed syncs

---

## Configuration

### Settings UI (`src/screens/Settings/BackupSyncSettingsScreen.tsx`)

#### Options:
- **Automatic Backup**
  - Enable/disable
  - Backup frequency (hourly, daily, weekly)
  - WiFi-only backup
  - Battery level threshold

- **Cloud Backup**
  - Choose provider (S3, Google Drive, iCloud)
  - Storage quota display
  - Manual backup trigger

- **Device Sync**
  - Trusted devices list
  - Add/remove devices
  - Sync preferences per device

- **External Storage**
  - Backup to USB
  - Auto-backup when connected
  - Backup location selection

---

## Testing Strategy

### Unit Tests
- `backupService.test.ts` - Backup operations
- `syncService.test.ts` - Sync protocol
- `wifiSyncService.test.ts` - WiFi communication
- `s3Service.test.ts` - Cloud upload/download

### Integration Tests
- End-to-end backup and restore
- Multi-device sync scenarios
- Conflict resolution
- Network interruption handling

### E2E Tests
- Complete backup/restore flow
- Device pairing and sync
- External storage backup

---

## Performance Considerations

### 1. Bandwidth Optimization
- Delta sync (only changed files)
- Compression before transfer
- Adaptive transfer rate

### 2. Battery Optimization
- Sync only when charging (optional)
- Background sync throttling
- WiFi-only sync option

### 3. Storage Optimization
- Incremental backups
- Deduplicate identical files
- Compress old backups

---

## Risks & Mitigations

### Risk 1: Platform Limitations
**Issue:** iOS restricts background operations and USB access  
**Mitigation:** Use background fetch API, inform users of limitations

### Risk 2: Network Reliability
**Issue:** Sync may fail due to poor connectivity  
**Mitigation:** Implement robust retry logic, resume capability

### Risk 3: Storage Quota
**Issue:** Cloud storage may fill up  
**Mitigation:** Display usage, automatic cleanup of old backups

### Risk 4: Compatibility
**Issue:** Different app versions may have incompatible sync protocols  
**Mitigation:** Version negotiation, backward compatibility

---

## Success Metrics

### Phase 1 (Cloud Backup):
- ✅ Users can backup to cloud storage
- ✅ Restore documents from cloud
- ✅ <5% upload failure rate
- ✅ Progress indication works

### Phase 2 (WiFi Sync):
- ✅ Device discovery works on local network
- ✅ Secure pairing established
- ✅ Documents sync between devices
- ✅ Conflict resolution works

### Phase 3 (External Storage):
- ✅ Detect USB devices
- ✅ Backup to USB successful
- ✅ Restore from USB successful

### Phase 4-5 (Bluetooth/Wired):
- ✅ Bluetooth pairing works
- ✅ Data transfer successful
- ✅ Wired sync functional

---

## Timeline

| Phase | Duration | Start Date | End Date |
|-------|----------|------------|----------|
| Phase 1: Cloud Backup | 2 weeks | TBD | TBD |
| Phase 2: WiFi Sync | 2 weeks | After Phase 1 | TBD |
| Phase 3: External Storage | 1.5 weeks | After Phase 1 | TBD |
| Phase 4: Bluetooth Sync | 1.5 weeks | After Phase 2 | TBD |
| Phase 5: Wired Sync | 1 week | After Phase 3 | TBD |
| **Total** | **8 weeks** | | |

---

## Next Steps

1. **Immediate:**
   - Get user approval for this plan
   - Decide on cloud provider (AWS S3, Google Drive, or iCloud)
   - Setup cloud infrastructure

2. **Phase 1 Start:**
   - Install required packages
   - Setup AWS/Google Cloud accounts
   - Begin `backupService.ts` implementation

3. **Documentation:**
   - Update DEVELOPMENT_CONTEXT.md
   - Create API documentation
   - Write user guide for backup/sync

---

## Questions for User

1. **Cloud Provider Preference:**
   - AWS S3 (most flexible, requires AWS account)
   - Google Drive (easier for users, Google account required)
   - iCloud (iOS only, seamless for Apple users)
   - Multiple providers?

2. **Priority:**
   - Should we start with Phase 1 (Cloud Backup) immediately?
   - Or would you prefer a different feature first?

3. **Scope:**
   - Implement all phases or just Phase 1 for now?
   - Any phases to skip or delay?

4. **Budget:**
   - Cloud storage costs (AWS S3 ~$0.023/GB/month)
   - Expected user storage needs?

---

**Tags:** #fr-main-012 #backup-sync #planning #cloud-storage #device-sync #external-storage
