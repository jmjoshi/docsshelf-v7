# DocsShelf v7 - Manual Testing Checklist

**Version:** 1.0.0  
**Last Updated:** November 27, 2025  
**Test Environment:** Physical Devices (iOS & Android)  
**Tester:** _________________  
**Test Date:** _________________

---

## Pre-Testing Setup

- [ ] Install production APK/IPA on physical device
- [ ] Clear all app data (fresh install)
- [ ] Ensure device has internet connection (for initial setup)
- [ ] Have test files ready (PDFs, images, documents)
- [ ] External USB drive/adapter ready (for backup testing)

---

## 1. Authentication & Registration

### User Registration
- [ ] **Open app for first time**
  - [ ] Splash screen displays correctly
  - [ ] Navigates to registration screen
  
- [ ] **Fill registration form**
  - [ ] First Name: Enter valid name
  - [ ] Last Name: Enter valid name
  - [ ] Email: Enter valid email (test@example.com)
  - [ ] Phone Numbers: Enter 3 valid phone numbers
  - [ ] Password: Enter weak password → See error messages
  - [ ] Password: Enter strong password (12+ chars, mixed case, numbers, symbols)
  - [ ] Confirm Password: Enter mismatched → See error
  - [ ] Confirm Password: Enter matching → No error
  
- [ ] **Submit registration**
  - [ ] Register button enabled when all fields valid
  - [ ] Click Register
  - [ ] See success message
  - [ ] Navigate to MFA setup screen

### MFA Setup
- [ ] **TOTP Setup Screen**
  - [ ] QR code displays
  - [ ] Secret key displayed
  - [ ] Copy secret key works
  
- [ ] **Scan QR code**
  - [ ] Open authenticator app (Google Authenticator, Authy)
  - [ ] Scan QR code
  - [ ] Authenticator shows "DocsShelf" with 6-digit code
  
- [ ] **Verify TOTP**
  - [ ] Enter current 6-digit code
  - [ ] Submit verification
  - [ ] See success message
  - [ ] Navigate to dashboard
  
- [ ] **Skip MFA (Alternative Flow)**
  - [ ] Click "Skip for Now"
  - [ ] See confirmation dialog
  - [ ] Confirm skip
  - [ ] Navigate to dashboard

### Login Flow
- [ ] **Logout and Login**
  - [ ] Go to Settings → Security
  - [ ] Click Logout
  - [ ] Confirm logout
  - [ ] Return to login screen
  
- [ ] **Login with MFA**
  - [ ] Enter email
  - [ ] Enter password
  - [ ] Click Login
  - [ ] Navigate to MFA verification screen
  - [ ] Enter 6-digit TOTP code
  - [ ] Click Verify
  - [ ] Navigate to dashboard

- [ ] **Failed Login Attempts**
  - [ ] Enter correct email, wrong password
  - [ ] See error message
  - [ ] Repeat 4 more times (total 5 failed attempts)
  - [ ] See account locked message (30 min lockout)
  - [ ] Wait 5 minutes → Still locked
  - [ ] Wait 30 minutes → Able to login again

### Biometric Authentication
- [ ] **Enable Biometric**
  - [ ] Go to Settings → Security
  - [ ] Toggle Biometric Authentication ON
  - [ ] See device biometric prompt (Face ID/Touch ID/Fingerprint)
  - [ ] Authenticate successfully
  - [ ] See success toast
  
- [ ] **Login with Biometric**
  - [ ] Logout
  - [ ] Login screen shows biometric icon
  - [ ] Tap biometric icon
  - [ ] Authenticate with biometric
  - [ ] Bypass password and MFA
  - [ ] Navigate to dashboard

---

## 2. Dashboard & Navigation

### Dashboard Screen
- [ ] **Statistics Cards**
  - [ ] Total documents count displays
  - [ ] Total categories count displays
  - [ ] Total storage used displays (formatted: MB, GB)
  
- [ ] **Recent Documents Widget**
  - [ ] Shows last 5 uploaded documents
  - [ ] Document thumbnails display (if available)
  - [ ] Tap document → Navigate to document detail
  
- [ ] **Quick Action Buttons**
  - [ ] Upload Document button works
  - [ ] Scan Document button works (camera access)
  - [ ] Create Category button works

### Tab Navigation
- [ ] **Home Tab**
  - [ ] Tap Home → Shows dashboard
  - [ ] Icon highlighted when active
  
- [ ] **Documents Tab**
  - [ ] Tap Documents → Shows document list
  - [ ] All documents display correctly
  
- [ ] **Categories Tab**
  - [ ] Tap Categories → Shows category management
  - [ ] Category tree displays correctly
  
- [ ] **Settings Tab**
  - [ ] Tap Settings → Shows settings menu
  - [ ] All setting options visible

---

## 3. Document Management

### Document Upload
- [ ] **Upload from File Picker**
  - [ ] Tap Upload Document
  - [ ] Select category (or leave uncategorized)
  - [ ] Add tags (optional)
  - [ ] Tap "Choose File"
  - [ ] Select PDF file
  - [ ] See file name and size
  - [ ] Tap Upload
  - [ ] See upload progress (0% → 100%)
  - [ ] See success toast
  - [ ] Document appears in list

- [ ] **Upload Multiple File Types**
  - [ ] Upload PDF → Success
  - [ ] Upload JPG image → Success
  - [ ] Upload PNG image → Success
  - [ ] Upload DOCX document → Success
  - [ ] Upload TXT file → Success
  - [ ] Upload large file (>10MB) → Progress bar works
  - [ ] Upload file exceeding 100MB → See error

### Document Viewing
- [ ] **View PDF Document**
  - [ ] Tap PDF document in list
  - [ ] Document detail screen opens
  - [ ] Tap "View Document"
  - [ ] PDF viewer opens
  - [ ] Can scroll through pages
  - [ ] Zoom in/out works
  - [ ] Page navigation works
  
- [ ] **View Image Document**
  - [ ] Tap image document
  - [ ] Tap "View Document"
  - [ ] Image displays full screen
  - [ ] Pinch to zoom works
  - [ ] Double tap to zoom works

### Document Operations
- [ ] **Favorite Document**
  - [ ] Tap star icon on document
  - [ ] Star turns yellow/filled
  - [ ] Document moves to favorites section
  - [ ] Tap star again → Unfavorite
  
- [ ] **Edit Document Metadata**
  - [ ] Tap document → Tap Edit
  - [ ] Change filename
  - [ ] Change category
  - [ ] Add/remove tags
  - [ ] Tap Save
  - [ ] See success toast
  - [ ] Changes reflected in list
  
- [ ] **Delete Document**
  - [ ] Tap document → Tap Delete
  - [ ] See confirmation dialog
  - [ ] Confirm delete
  - [ ] Document removed from list
  - [ ] See success toast

### Search & Filter
- [ ] **Search Documents**
  - [ ] Tap search bar
  - [ ] Type document name
  - [ ] Results filter in real-time
  - [ ] Tap result → Opens document
  - [ ] Clear search → All documents return
  
- [ ] **Filter by Category**
  - [ ] Tap filter icon
  - [ ] Select category
  - [ ] Only documents in category shown
  - [ ] Clear filter → All documents return
  
- [ ] **Filter by Date**
  - [ ] Tap filter icon
  - [ ] Select "Last 7 days"
  - [ ] Only recent documents shown
  - [ ] Select "Last 30 days"
  - [ ] More documents shown

### Camera Scan
- [ ] **Scan Document**
  - [ ] Tap Scan Document
  - [ ] Camera opens
  - [ ] Grant camera permission
  - [ ] Point at document
  - [ ] Tap capture
  - [ ] See crop/adjust screen
  - [ ] Adjust corners if needed
  - [ ] Tap Done
  - [ ] Document uploaded successfully

---

## 4. Category Management

### Create Category
- [ ] **Create Root Category**
  - [ ] Go to Categories tab
  - [ ] Tap "Create Category"
  - [ ] Enter name: "Work"
  - [ ] Select icon: briefcase
  - [ ] Select color: blue
  - [ ] Leave parent as "None"
  - [ ] Tap Save
  - [ ] Category appears in list

- [ ] **Create Child Category**
  - [ ] Tap "Create Category"
  - [ ] Enter name: "Projects"
  - [ ] Select parent: "Work"
  - [ ] Tap Save
  - [ ] Category appears nested under "Work"
  - [ ] Indentation shows hierarchy

### Edit Category
- [ ] **Modify Category**
  - [ ] Tap category → Tap Edit
  - [ ] Change name
  - [ ] Change icon
  - [ ] Change color
  - [ ] Change parent
  - [ ] Tap Save
  - [ ] Changes reflected immediately

### Delete Category
- [ ] **Delete Empty Category**
  - [ ] Create category with no documents
  - [ ] Tap Delete
  - [ ] Confirm deletion
  - [ ] Category removed
  
- [ ] **Delete Category with Documents**
  - [ ] Tap Delete on category with documents
  - [ ] See options: Reassign or Delete documents
  - [ ] Select "Reassign to Uncategorized"
  - [ ] Confirm
  - [ ] Category deleted, documents moved

---

## 5. Backup & Restore

### Encrypted Backup
- [ ] **Create Encrypted Backup**
  - [ ] Go to Settings → Backup & Restore
  - [ ] Tap "Create Encrypted Backup"
  - [ ] See progress indicator
  - [ ] Backup completes
  - [ ] See success message with file location
  - [ ] Backup file appears in Files app
  
- [ ] **Share Encrypted Backup**
  - [ ] Tap "Share Backup"
  - [ ] Share sheet opens
  - [ ] Can send via email, cloud, messaging apps
  - [ ] Save to Files app
  - [ ] Copy to iCloud Drive / Google Drive

### Unencrypted Backup (USB)
- [ ] **Create Unencrypted Backup**
  - [ ] Connect USB drive with adapter
  - [ ] Tap "Create Unencrypted Backup"
  - [ ] Select USB drive location
  - [ ] See progress
  - [ ] Backup completes
  - [ ] JSON file created on USB drive
  
- [ ] **Verify Backup Contents**
  - [ ] Open backup JSON file on computer
  - [ ] Contains: users, documents, categories, tags
  - [ ] Document files in separate folder (base64 encoded)

### Restore from Backup
- [ ] **Restore Encrypted Backup**
  - [ ] Uninstall app (or use second device)
  - [ ] Reinstall app
  - [ ] Complete registration
  - [ ] Go to Settings → Backup & Restore
  - [ ] Tap "Restore from Backup"
  - [ ] Select encrypted backup file
  - [ ] Enter backup password (if set)
  - [ ] See progress
  - [ ] Restore completes
  - [ ] All documents restored
  - [ ] All categories restored
  - [ ] All settings restored
  
- [ ] **Restore Unencrypted Backup**
  - [ ] Connect USB drive
  - [ ] Tap "Restore from Unencrypted Backup"
  - [ ] Browse to USB drive
  - [ ] Select backup JSON file
  - [ ] See progress
  - [ ] Restore completes
  - [ ] Verify all data restored

---

## 6. Settings & Preferences

### Profile Settings
- [ ] **Edit Profile**
  - [ ] Go to Settings → Profile
  - [ ] Change first name
  - [ ] Change last name
  - [ ] Change email
  - [ ] Update phone numbers
  - [ ] Tap Save
  - [ ] See success toast
  - [ ] Changes persist after app restart

### Security Settings
- [ ] **Change Password**
  - [ ] Go to Settings → Security → Change Password
  - [ ] Enter current password (wrong) → See error
  - [ ] Enter current password (correct) → No error
  - [ ] Enter weak new password → See validation errors
  - [ ] Password strength indicator updates (Weak/Fair/Good/Strong)
  - [ ] Enter strong new password
  - [ ] Confirm new password
  - [ ] Tap Change Password
  - [ ] See success toast
  - [ ] Logout and login with new password → Works
  
- [ ] **View Security Log**
  - [ ] Go to Settings → Security → Security Log
  - [ ] See list of recent security events
  - [ ] Tap "All" filter → All events shown
  - [ ] Tap "Login" filter → Only login events
  - [ ] Tap "Security" filter → Only security events (password change, MFA)
  - [ ] Badge counts correct for each filter
  - [ ] Tap Export → Share sheet opens with CSV
  - [ ] Pull down to refresh → Log updates
  
- [ ] **MFA Toggle**
  - [ ] Toggle MFA OFF
  - [ ] See confirmation dialog
  - [ ] Confirm disable
  - [ ] MFA disabled in database
  - [ ] Login no longer requires MFA code
  - [ ] Toggle MFA ON
  - [ ] Navigate to MFA setup
  - [ ] Complete setup
  - [ ] Login requires MFA code again

### Preferences
- [ ] **Toggle Dark Mode**
  - [ ] Go to Settings → Preferences
  - [ ] Toggle Dark Mode ON
  - [ ] App theme changes to dark
  - [ ] Toggle Dark Mode OFF
  - [ ] App theme changes to light
  - [ ] Setting persists after app restart
  
- [ ] **Toggle Notifications**
  - [ ] Toggle Notifications ON → See toast
  - [ ] Toggle Notifications OFF → See toast
  - [ ] Setting persists after restart
  
- [ ] **Toggle Auto Backup**
  - [ ] Toggle Auto Backup ON → See toast
  - [ ] Toggle Auto Backup OFF → See toast
  - [ ] Setting persists after restart
  
- [ ] **Toggle Compact View**
  - [ ] Toggle Compact View ON
  - [ ] Document list shows more items per screen
  - [ ] Toggle Compact View OFF
  - [ ] Document list shows larger cards
  
- [ ] **Toggle Show Thumbnails**
  - [ ] Toggle Show Thumbnails OFF
  - [ ] Thumbnails hidden in document list
  - [ ] Toggle Show Thumbnails ON
  - [ ] Thumbnails appear again
  
- [ ] **Clear Cache**
  - [ ] Tap Clear Cache
  - [ ] See confirmation dialog
  - [ ] Confirm clear
  - [ ] See success toast (shows freed size)
  
- [ ] **Reset Settings**
  - [ ] Change several settings
  - [ ] Tap Reset Settings
  - [ ] Confirm reset
  - [ ] All settings return to defaults
  - [ ] See success toast

### Document Management
- [ ] **View Storage Stats**
  - [ ] Go to Settings → Document Management
  - [ ] See total documents count
  - [ ] See total storage used (formatted)
  - [ ] See storage breakdown by category
  - [ ] Visual storage bar shows category sizes
  - [ ] Each category shows document count and size
  
- [ ] **Delete by Category**
  - [ ] Tap trash icon next to category
  - [ ] See confirmation with document count
  - [ ] Confirm delete
  - [ ] All documents in category deleted
  - [ ] Storage stats update
  - [ ] See success toast
  
- [ ] **Delete All Documents**
  - [ ] Tap "Delete All Documents"
  - [ ] See confirmation with total count
  - [ ] Confirm delete
  - [ ] All documents deleted
  - [ ] Storage shows 0 documents
  - [ ] See success toast
  
- [ ] **Find Duplicates**
  - [ ] Upload 2 identical files
  - [ ] Tap "Find Duplicates"
  - [ ] See alert showing duplicate groups
  - [ ] If no duplicates → See "No duplicates found"
  
- [ ] **Optimize Database**
  - [ ] Tap "Optimize Database"
  - [ ] See confirmation
  - [ ] Confirm optimize
  - [ ] Database VACUUM runs
  - [ ] See success toast

### About
- [ ] **View App Info**
  - [ ] Go to Settings → About
  - [ ] App version displays (1.0.0)
  - [ ] Build number displays
  - [ ] App name and tagline display
  
- [ ] **Privacy Policy**
  - [ ] Tap Privacy Policy
  - [ ] Web view or modal opens
  - [ ] Policy content readable
  - [ ] Can scroll through policy
  - [ ] Close button works
  
- [ ] **Terms of Service**
  - [ ] Tap Terms of Service
  - [ ] Terms display in modal/web view
  - [ ] Can scroll through terms
  - [ ] Close button works
  
- [ ] **Contact Support**
  - [ ] Tap Contact Support
  - [ ] Email client opens
  - [ ] Pre-filled email address (support@docsshelf.com)
  - [ ] Can send email

---

## 7. Performance Testing

### App Launch
- [ ] **Cold Start**
  - [ ] Force quit app
  - [ ] Relaunch app
  - [ ] Time to interactive: < 2 seconds ⏱️
  - [ ] No loading delays
  
- [ ] **Warm Start**
  - [ ] Background app
  - [ ] Switch back to app
  - [ ] Resumes instantly
  - [ ] No re-authentication required (within session)

### Search Performance
- [ ] **Search with 100 Documents**
  - [ ] Upload 100 documents (or use test data)
  - [ ] Search for document name
  - [ ] Results appear: < 500ms ⏱️
  - [ ] No lag or stuttering
  
- [ ] **Search with 1000+ Documents**
  - [ ] Upload 1000+ documents (or use test data)
  - [ ] Search performance remains fast
  - [ ] Scrolling remains smooth

### Scrolling & Navigation
- [ ] **Smooth Scrolling**
  - [ ] Scroll through document list (100+ items)
  - [ ] No lag or frame drops
  - [ ] Smooth 60 FPS scrolling
  
- [ ] **Quick Navigation**
  - [ ] Switch between tabs rapidly
  - [ ] No crashes or freezes
  - [ ] Transitions smooth

### Memory Usage
- [ ] **Upload Large Files**
  - [ ] Upload 50MB file
  - [ ] Upload 100MB file (max limit)
  - [ ] App doesn't crash
  - [ ] No memory warnings
  
- [ ] **Extended Usage**
  - [ ] Use app continuously for 30 minutes
  - [ ] Upload, view, delete documents repeatedly
  - [ ] App remains responsive
  - [ ] No memory leaks or slowdowns

---

## 8. Platform-Specific Tests

### iOS Specific
- [ ] **Face ID**
  - [ ] Enable biometric authentication
  - [ ] Face ID prompt appears
  - [ ] Face recognition works
  - [ ] Login with Face ID successful
  
- [ ] **Touch ID**
  - [ ] On devices with Touch ID
  - [ ] Fingerprint prompt appears
  - [ ] Touch ID authentication works
  
- [ ] **Files App Integration**
  - [ ] Backups save to Files app
  - [ ] Can browse backups in Files
  - [ ] Can share via Files
  - [ ] iCloud Drive integration works
  
- [ ] **Share Sheet**
  - [ ] Share backup via iOS share sheet
  - [ ] All share options available (AirDrop, Messages, Mail)
  
- [ ] **iOS Permissions**
  - [ ] Camera permission prompt
  - [ ] Photo library permission prompt
  - [ ] Files access permission prompt

### Android Specific
- [ ] **Fingerprint Authentication**
  - [ ] Enable biometric authentication
  - [ ] Fingerprint scanner prompt appears
  - [ ] Fingerprint recognition works
  - [ ] Login with fingerprint successful
  
- [ ] **Storage Access Framework**
  - [ ] File picker uses SAF
  - [ ] Can browse all storage locations
  - [ ] USB drive access works
  - [ ] SD card access works
  
- [ ] **Share Intent**
  - [ ] Share backup via Android share sheet
  - [ ] All share options available
  
- [ ] **Android Permissions**
  - [ ] Camera permission prompt
  - [ ] Storage permission prompt
  - [ ] USB storage permission prompt
  
- [ ] **Back Button**
  - [ ] Hardware back button navigates correctly
  - [ ] Double back to exit app works
  - [ ] No unexpected back button behavior

---

## 9. Edge Cases & Error Scenarios

### Network Scenarios
- [ ] **Offline Mode**
  - [ ] Turn off WiFi and mobile data
  - [ ] App continues to work (offline-first)
  - [ ] Can upload documents (queued locally)
  - [ ] Can view documents
  - [ ] Can search documents
  - [ ] Login works (cached credentials)
  
- [ ] **Poor Network**
  - [ ] Enable slow network simulation
  - [ ] App remains responsive
  - [ ] Operations timeout gracefully
  - [ ] User sees appropriate messages

### Storage Scenarios
- [ ] **Low Storage**
  - [ ] Fill device storage to <100MB free
  - [ ] Try to upload large document
  - [ ] See low storage warning
  - [ ] Upload fails gracefully
  
- [ ] **Storage Full**
  - [ ] Fill device storage completely
  - [ ] App doesn't crash
  - [ ] User sees storage full message

### Data Scenarios
- [ ] **Corrupted Backup**
  - [ ] Manually edit backup JSON (break syntax)
  - [ ] Try to restore
  - [ ] See validation error
  - [ ] App doesn't crash
  
- [ ] **Invalid File Upload**
  - [ ] Try to upload 0-byte file
  - [ ] See validation error
  - [ ] Try to upload corrupted file
  - [ ] Encryption handles gracefully

### UI Scenarios
- [ ] **Rapid Tapping**
  - [ ] Rapidly tap buttons
  - [ ] No duplicate actions
  - [ ] No crashes
  
- [ ] **Screen Rotation**
  - [ ] Rotate device while using app
  - [ ] Layout adjusts correctly
  - [ ] No data loss
  - [ ] Forms preserve input
  
- [ ] **App Backgrounding**
  - [ ] Start document upload
  - [ ] Background app
  - [ ] Return to app
  - [ ] Upload continues or restarts appropriately

---

## 10. Accessibility Testing

### Screen Reader
- [ ] **VoiceOver (iOS) / TalkBack (Android)**
  - [ ] Enable screen reader
  - [ ] Navigate through app
  - [ ] All buttons have labels
  - [ ] All images have alt text
  - [ ] Forms are accessible
  
### Font Scaling
- [ ] **Large Text**
  - [ ] Enable large text in device settings
  - [ ] App text scales appropriately
  - [ ] No text truncation
  - [ ] Layout remains usable
  
### Color Contrast
- [ ] **High Contrast**
  - [ ] Enable high contrast mode
  - [ ] All text remains readable
  - [ ] Color-coded elements have alternative indicators

---

## Test Results Summary

**Test Date:** _________________  
**Tester:** _________________  
**Device:** _________________  
**OS Version:** _________________

**Total Tests:** 250+  
**Passed:** _____ / _____  
**Failed:** _____  
**Skipped:** _____  
**Pass Rate:** _____%

### Critical Issues Found

| # | Category | Issue Description | Severity | Status |
|---|----------|-------------------|----------|--------|
| 1 |  |  | 🔴 High / 🟡 Medium / 🟢 Low |  |
| 2 |  |  |  |  |
| 3 |  |  |  |  |

### Notes & Observations

_Add any additional observations, suggestions, or issues encountered during testing._

---

## Sign-Off

- [ ] All critical tests passed
- [ ] All high-priority issues documented
- [ ] App ready for production release

**Tester Signature:** _________________  
**Date:** _________________
