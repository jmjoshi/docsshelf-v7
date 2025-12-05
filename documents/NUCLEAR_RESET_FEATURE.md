# Nuclear Database Reset Feature

## Overview
A comprehensive database cleanup functionality that permanently deletes ALL user data. This is an administrative-level operation with multiple safety confirmations.

## Location
**Settings → Document Management → Danger Zone → Nuclear Database Reset**

---

## What Gets Deleted

When executed, this operation permanently removes:

### ✅ All Documents & Files
- Every document and associated file data
- All document metadata and properties

### ✅ All Categories
- User-created categories
- Category associations

### ✅ All Tags
- User-created tags
- Tag associations (document_tags)

### ✅ Security & Audit Logs
- Most audit logs (keeps only the reset action log)
- Failed login attempts

### ✅ Backup References
- Links to backup data (if any)

### ❌ What is NOT Deleted
- User account credentials
- User preferences (optional - can be configured)

---

## Safety Features

### 1. **Two-Stage Confirmation**
The feature requires **TWO separate confirmations**:

**First Alert:**
```
⚠️ DANGER: Nuclear Database Reset

This will PERMANENTLY DELETE EVERYTHING:
• All documents and files
• All categories
• All tags and associations
• All security logs
• All user preferences
• All backups references

Your account will remain but all data will be lost forever.

THIS CANNOT BE UNDONE!
```

**Second Alert (Final Warning):**
```
⚠️ FINAL WARNING

Are you ABSOLUTELY SURE you want to delete everything?

This is your last chance to cancel.
```

### 2. **Visual Warnings**
- Red danger zone section with warning icon
- Nuclear icon with red styling
- Red bordered card with shadow effect
- Multiple warning texts throughout UI

### 3. **Transaction Safety**
- Uses SQLite transactions (BEGIN/COMMIT/ROLLBACK)
- Atomic operation - either all deletes succeed or all are rolled back
- Error handling with automatic rollback on failure

### 4. **Audit Trail**
- Logs the nuclear reset action BEFORE deletion
- Records timestamp and user who initiated the action
- Keeps the reset log entry for accountability

---

## Technical Details

### Database Operations Order
Deletions happen in this specific order to respect foreign key constraints:

1. `document_tags` - Remove all tag associations
2. `documents` - Delete all documents
3. `categories` - Remove all categories
4. `tags` - Delete all tags
5. `audit_log` - Clear logs (except reset action)
6. `failed_login_attempts` - Clear failed attempts

### Post-Deletion Optimization
After successful deletion:
- `VACUUM` - Reclaims disk space
- `ANALYZE` - Updates query optimizer statistics

### Transaction Handling
```sql
BEGIN TRANSACTION;
-- All delete operations
COMMIT; -- Only if all succeed
ROLLBACK; -- If any operation fails
```

---

## User Interface

### Danger Zone Section
Located at the bottom of Document Management screen with:

- **Header:** Red warning icon + "Danger Zone" title
- **Card:** Red-bordered card with nuclear icon
- **Button:** Full-width button with nuclear icon and detailed description
- **Notice:** Red warning box with critical safety information

### Visual Design
```
🔴 Danger Zone
┌─────────────────────────────────────┐
│ ☢️  ⚠️ Nuclear Database Reset       │
│                                     │
│  Permanently delete ALL data        │
│  including documents, categories,   │
│  tags, and logs...                  │
│                                  >  │
└─────────────────────────────────────┘

⛔ WARNING: This is an administrative
function that will permanently destroy
all your data...
```

---

## Usage Instructions

### How to Execute Nuclear Reset

1. **Navigate to Screen**
   - Go to Settings
   - Select "Document Management"
   - Scroll to bottom "Danger Zone" section

2. **Initiate Reset**
   - Tap "Nuclear Database Reset" button
   - Read the first warning carefully

3. **First Confirmation**
   - Review what will be deleted
   - Tap "Continue" if you want to proceed
   - OR tap "Cancel" to abort

4. **Final Confirmation**
   - Read the final warning
   - Tap "YES, DELETE EVERYTHING" to confirm
   - OR tap "Cancel" as last chance to abort

5. **Execution**
   - Database wipe begins
   - Progress indicator shows operation in progress
   - Wait for completion (usually takes 1-3 seconds)

6. **Completion**
   - Success toast notification appears
   - Confirmation dialog shows operation complete
   - Stats refresh to show empty state

### What Happens Next
- Screen shows 0 documents, 0 storage used
- All category cards disappear
- Database is optimized and clean
- You can start fresh with new documents

---

## Error Handling

### If Reset Fails
1. Automatic rollback of all changes
2. Error toast notification shown
3. Alert dialog with error details
4. Data remains untouched (no partial deletion)

### Common Failure Scenarios
- Database locked by another operation
- Insufficient permissions
- Corrupted database file
- Storage issues

### Recovery Steps
1. Close any other operations
2. Restart the app
3. Try again
4. If persists, contact support

---

## Security Considerations

### Audit Trail
- Reset action logged before deletion
- Timestamp recorded
- User ID captured
- Log entry preserved for accountability

### Authorization
- User must be logged in
- Requires current user session
- No additional password verification (can be added if needed)

### Data Recovery
⚠️ **IMPORTANT:** Once executed, data CANNOT be recovered unless:
- You have external backups
- You exported data before reset
- File system recovery tools may work (not guaranteed)

---

## Use Cases

### When to Use Nuclear Reset
✅ Starting completely fresh
✅ Testing/development environment cleanup
✅ Selling/transferring device
✅ Removing all traces of data
✅ Fixing corrupted database issues
✅ Privacy/security concerns requiring data wipe

### When NOT to Use
❌ Just want to delete some documents (use selective delete)
❌ Want to remove one category (use category delete)
❌ Need to free up space (use optimize database)
❌ Having minor issues (try other troubleshooting first)
❌ Uncertain about consequences

---

## Best Practices

### Before Using Nuclear Reset

1. **Backup Important Data**
   - Use Settings → Backup feature
   - Export important documents
   - Save backup file securely

2. **Document What You Have**
   - Note which documents you have
   - List important categories/tags
   - Screenshot any configurations

3. **Verify Backups**
   - Test backup file integrity
   - Ensure you can restore if needed
   - Keep backups in multiple locations

4. **Understand Consequences**
   - Data loss is permanent
   - No undo functionality
   - Must rebuild from scratch

### After Nuclear Reset

1. **Verify Clean State**
   - Check Document Management shows 0 documents
   - Confirm categories list is empty
   - Verify tags list is empty

2. **Restore from Backup (if needed)**
   - Go to Settings → Restore Backup
   - Select your backup file
   - Wait for restoration to complete

3. **Rebuild if Starting Fresh**
   - Create new categories
   - Set up tags
   - Upload new documents

---

## Developer Notes

### Code Location
`src/screens/Settings/DocumentManagementScreen.tsx`

### Key Functions
```typescript
handleNuclearReset()      // Initial warning dialog
confirmNuclearReset()     // Final confirmation dialog
executeNuclearReset()     // Actual deletion logic
```

### Database Queries
All delete operations use parameterized queries to prevent SQL injection:
```typescript
await db.runAsync('DELETE FROM documents WHERE user_id = ?', [userId]);
```

### State Management
- `loading` state prevents multiple simultaneous executions
- Stats automatically refresh after completion
- Error handling with try-catch blocks

### Testing Considerations
- Test with various data volumes
- Verify transaction rollback on errors
- Check audit log preservation
- Confirm foreign key cascade behavior

---

## Future Enhancements

### Potential Improvements
1. **Additional Authentication**
   - Require password re-entry
   - Add biometric confirmation
   - Implement admin PIN code

2. **Selective Cleanup**
   - Option to keep categories/tags
   - Preserve audit logs
   - Keep user preferences

3. **Automated Backup**
   - Auto-create backup before reset
   - Prompt to backup if none exists
   - Quick restore option

4. **Scheduled Resets**
   - Auto-cleanup after X days
   - Periodic maintenance mode
   - Data retention policies

5. **Recovery Options**
   - Temporary "trash" before permanent delete
   - 24-hour recovery window
   - Soft delete with hard delete after period

---

## Troubleshooting

### Button is Disabled
**Cause:** Loading state is active
**Fix:** Wait for current operation to complete

### Alert Not Appearing
**Cause:** Permission issues or app state
**Fix:** Restart app, ensure you're logged in

### Operation Hangs
**Cause:** Large database or locked database
**Fix:** Force close app, restart, try again

### Partial Deletion
**Cause:** Should not happen due to transactions
**Fix:** Run nuclear reset again to complete

### Database Corrupted After Reset
**Cause:** Interrupted operation or storage issues
**Fix:** Reinstall app (creates fresh database)

---

## Comparison with Other Delete Options

| Feature | Delete Single Doc | Delete Category | Delete All Docs | Nuclear Reset |
|---------|------------------|-----------------|-----------------|---------------|
| **Scope** | One document | One category | All documents | Everything |
| **Categories** | ❌ Preserved | ✅ Deleted | ❌ Preserved | ✅ Deleted |
| **Tags** | ❌ Preserved | ❌ Preserved | ❌ Preserved | ✅ Deleted |
| **Logs** | ❌ Preserved | ❌ Preserved | ❌ Preserved | ✅ Cleared |
| **Confirmations** | 1 | 1 | 1 | 2 |
| **Warning Level** | Normal | Normal | High | Critical |
| **Undo** | ❌ No | ❌ No | ❌ No | ❌ No |
| **Backup Suggested** | ❌ No | ⚠️ Optional | ⚠️ Optional | ✅ Yes |
| **Use Case** | Single cleanup | Category cleanup | Document reset | Full reset |

---

## Support & Contact

### Need Help?
- Check app documentation
- Review error messages carefully
- Contact support if issues persist

### Report Issues
- Describe what you were trying to do
- Include any error messages
- Note if partial deletion occurred
- Provide app version and device info

---

## Change Log

### Version 1.0 (November 29, 2025)
- ✅ Initial implementation
- ✅ Two-stage confirmation system
- ✅ Transaction safety with rollback
- ✅ Audit trail preservation
- ✅ Post-deletion optimization
- ✅ Visual danger zone UI
- ✅ Comprehensive error handling

---

**⚠️ REMEMBER: This operation is PERMANENT and IRREVERSIBLE. Always backup your data before using Nuclear Reset!**
