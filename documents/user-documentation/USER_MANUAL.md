# DocsShelf User Manual

## Welcome to DocsShelf! 📱

DocsShelf is your secure, personal document management system for Android. Store, organize, and access your important documents anytime, anywhere.

---

## Table of Contents

1. [Getting Started](#getting-started)
2. [Account Management](#account-management)
3. [Document Management](#document-management)
4. [Categories](#categories)
5. [File Explorer](#file-explorer)
6. [Search & Filter](#search--filter)
7. [Security Features](#security-features)
8. [Settings](#settings)
9. [Tips & Best Practices](#tips--best-practices)
10. [Troubleshooting](#troubleshooting)

---

## Getting Started

### First Time Setup

1. **Registration**
   - Open DocsShelf
   - Tap "Register" on the welcome screen
   - Enter your email address
   - Create a strong password (minimum 8 characters with uppercase, lowercase, number, and special character)
   - Tap "Register"

2. **Login**
   - Enter your registered email
   - Enter your password
   - Tap "Login"

3. **Security Setup (Optional but Recommended)**
   - Enable biometric authentication (fingerprint/face unlock)
   - Set up two-factor authentication (MFA) for extra security

---

## Account Management

### Login

- Enter your email and password
- If MFA is enabled, enter the 6-digit code from your authenticator app
- Maximum 5 login attempts allowed (account locks for 15 minutes after 5 failed attempts)

### Password Reset

If you forget your password:

1. Tap "Forgot Password?" on login screen
2. Enter your registered email
3. Check your email for the reset link
4. Click the link (valid for 1 hour)
5. Create a new password
6. Login with your new password

### Account Security

**Failed Login Protection:**
- After 5 incorrect login attempts, your account locks for 15 minutes
- You'll receive an email notification about the lockout
- Reset your password to unlock immediately

**Two-Factor Authentication (MFA):**
- Go to Settings → Security → Two-Factor Authentication
- Scan QR code with authenticator app (Google Authenticator, Authy, etc.)
- Save backup codes in a safe place
- Enter 6-digit code at login after password

**Biometric Authentication:**
- Go to Settings → Security → Biometric Login
- Enable fingerprint or face unlock
- Your device must support biometric authentication

---

## Document Management

### Uploading Documents

**Method 1: Camera Scan**
1. Tap the **Camera icon** (scan button) in the bottom navigation
2. Grant camera permissions if prompted
3. Position document in frame
4. Tap capture button
5. Review the image
6. Add document details:
   - **Filename**: Name your document
   - **Category**: Select or create a category
   - **Tags**: Add tags for easy searching (optional)
7. Tap "Save"

**Method 2: File Upload**
1. Go to Documents tab
2. Tap "Upload" or "+" button
3. Select file from your device
4. Add document details (filename, category, tags)
5. Tap "Save"

**Supported File Types:**
- PDF documents
- Images (JPG, PNG)
- Scanned documents

### Viewing Documents

1. Tap any document to open it
2. View document details:
   - Original filename
   - Category
   - Tags
   - Upload date
   - File size
   - File type
3. Use pinch-to-zoom for images
4. Scroll through PDF pages

### Document Actions

When viewing a document, tap the action buttons:

- **✏️ Edit**: Rename document or change category/tags
- **📤 Share**: Share document via email, messaging, etc.
- **🖨️ Print**: Print document (requires printer setup)
- **📋 Copy**: Create a duplicate of the document
- **ℹ️ Info**: View detailed document information
- **📁 Move**: Move to different category
- **🗑️ Delete**: Delete document (with confirmation)

### Editing Documents

1. Open a document
2. Tap "Edit" button
3. Modify:
   - Document name
   - Category assignment
   - Tags
4. Tap "Save"

### Deleting Documents

1. Open a document
2. Tap "Delete" button
3. Confirm deletion
4. Document is permanently removed

---

## Categories

### What are Categories?

Categories help you organize documents into folders, like:
- 📄 Receipts
- 🏥 Medical Records
- 🚗 Vehicle Documents
- 💼 Work Documents
- 🏠 Home & Utilities
- 💰 Financial
- 📋 Personal ID

### Creating Categories

1. Go to **Categories** tab
2. Tap "+" or "Add Category" button
3. Enter category details:
   - **Name**: Category name (e.g., "Tax Documents")
   - **Icon**: Choose an emoji icon
   - **Color**: Pick a color for easy identification
   - **Description**: Optional description
4. Tap "Save"

### Managing Categories

**Edit Category:**
1. Long-press on category or tap options (⋮)
2. Select "Edit"
3. Update name, icon, color, or description
4. Tap "Save"

**Delete Category:**
1. Long-press on category or tap options (⋮)
2. Select "Delete"
3. Confirm deletion
4. Choose what to do with documents:
   - Move to another category
   - Move to "Uncategorized"
   - Delete documents (use with caution!)

**Organize Subcategories:**
- Create nested categories (e.g., Medical → Lab Reports)
- Drag and drop to reorganize
- Up to 3 levels of nesting supported

---

## File Explorer

### Navigating the Explorer

The File Explorer provides a Windows-like tree view of all your categories and documents:

1. Go to **Explorer** tab
2. See all categories in expandable tree structure
3. Tap folder icon to expand/collapse categories
4. Tap document to view it

### Explorer Features

**Expand/Collapse:**
- Tap any category to expand and see contents
- Tap again to collapse

**Expand All / Collapse All:**
- Use toolbar buttons to expand or collapse entire tree
- Useful for getting overview or decluttering view

**Search in Explorer:**
- Type in search box to filter categories and documents
- Matching items are highlighted
- Click filtered results to expand and view

**Refresh:**
- Pull down to refresh
- Or tap refresh button in toolbar

---

## Search & Filter

### Searching Documents

**Quick Search:**
1. Go to Documents or Explorer tab
2. Tap search bar
3. Type document name, category, or tag
4. Results appear instantly

**Search Tips:**
- Search by document name
- Search by category name
- Search by tags
- Search is case-insensitive
- Partial matches work (e.g., "rec" finds "receipt")

### Filtering by Category

1. Go to Documents tab
2. Tap filter icon
3. Select category to show only documents in that category
4. Tap "Clear Filter" to see all documents

### Using Tags

**Add Tags to Documents:**
- Tags are keywords for better organization
- Examples: "urgent", "2024", "taxes", "insurance"
- Add multiple tags separated by commas

**Search by Tags:**
- Type tag name in search bar
- All documents with that tag appear

---

## Security Features

### Data Security

**Encryption:**
- All passwords are encrypted using industry-standard PBKDF2-SHA256
- Documents stored securely on your device
- No cloud storage - your data stays private

**Secure Storage:**
- Uses Android Secure Store for sensitive data
- Protected by device encryption
- Cannot be accessed by other apps

### Biometric Authentication

**Setup Fingerprint/Face Unlock:**
1. Go to Settings → Security
2. Tap "Biometric Authentication"
3. Toggle "Enable Biometric Login"
4. Authenticate with your biometric
5. Biometric required on next login

**Disable Biometric:**
1. Go to Settings → Security
2. Toggle off "Enable Biometric Login"
3. Will use password only

### Two-Factor Authentication (MFA)

**Enable MFA:**
1. Go to Settings → Security → Two-Factor Authentication
2. Tap "Enable MFA"
3. Install authenticator app if not already installed:
   - Google Authenticator
   - Microsoft Authenticator
   - Authy
4. Scan QR code with authenticator app
5. Enter 6-digit code to verify
6. **Important**: Save backup codes shown
7. Store backup codes in safe place

**Login with MFA:**
1. Enter email and password
2. Open authenticator app
3. Enter current 6-digit code
4. Code changes every 30 seconds

**Disable MFA:**
1. Go to Settings → Security → Two-Factor Authentication
2. Tap "Disable MFA"
3. Enter current MFA code to confirm

**Lost Device / Authenticator?**
- Use backup codes to login
- Each backup code can be used once
- Contact support if all codes are lost

### Session Management

**Auto-Logout:**
- Inactive sessions expire after 15 minutes
- Tap anywhere to stay active
- Login required after expiration

**Manual Logout:**
1. Go to Settings
2. Tap "Logout"
3. Confirm logout
4. All local session data cleared

---

## Settings

### Profile Settings

**Update Email:**
1. Go to Settings → Profile
2. Tap "Email"
3. Enter new email
4. Verify new email
5. Update saved

**Change Password:**
1. Go to Settings → Security
2. Tap "Change Password"
3. Enter current password
4. Enter new password (must meet requirements)
5. Confirm new password
6. Tap "Save"

### Display Settings

**Theme:**
- Go to Settings → Appearance
- Choose Light or Dark mode
- Or select "System Default" to match device theme

**Language:**
- Go to Settings → Language
- Select preferred language
- App restarts to apply changes

### Storage Settings

**View Storage Usage:**
- Settings → Storage
- See total space used by documents
- View breakdown by category
- See largest files

**Clear Cache:**
- Settings → Storage → Clear Cache
- Removes temporary files
- Frees up space
- Documents remain intact

### Backup & Sync (Coming Soon)

**Local Backup:**
- Export all documents to device storage
- Create encrypted backup file
- Restore from backup

**Cloud Sync (Future Feature):**
- Automatic sync to cloud storage
- Access from multiple devices
- End-to-end encryption

---

## Tips & Best Practices

### Organization Tips

1. **Use Descriptive Names**
   - Name documents clearly: "2024-Tax-Return.pdf" instead of "doc1.pdf"
   - Include dates in filename: "2024-01-15-Receipt.jpg"

2. **Create Logical Categories**
   - Don't create too many categories (aim for 5-10 main categories)
   - Use subcategories for detailed organization
   - Examples: Financial → Tax Returns → 2024

3. **Use Tags Effectively**
   - Add relevant tags: year, urgency, type
   - Use consistent tag naming
   - Examples: "2024", "urgent", "paid", "pending"

4. **Regular Cleanup**
   - Review documents monthly
   - Delete outdated documents
   - Archive old documents to external storage

### Security Best Practices

1. **Strong Passwords**
   - Use unique password for DocsShelf
   - Minimum 8 characters
   - Mix uppercase, lowercase, numbers, symbols
   - Don't reuse passwords from other apps

2. **Enable Security Features**
   - Turn on biometric authentication
   - Enable two-factor authentication
   - Save MFA backup codes safely

3. **Keep App Updated**
   - Install updates when available
   - Updates include security fixes
   - Check for updates in Play Store

4. **Secure Your Device**
   - Use device lock screen (PIN/pattern/biometric)
   - Don't root your device (reduces security)
   - Install apps only from official sources

### Performance Tips

1. **Optimize Storage**
   - Compress large images before upload
   - Use PDF instead of multiple images when possible
   - Clear cache periodically

2. **Better Scanning**
   - Use good lighting when scanning
   - Hold device steady
   - Ensure document is flat and in frame
   - Use higher resolution for small text

---

## Troubleshooting

### Login Issues

**"Invalid email or password"**
- Check email spelling
- Verify password (case-sensitive)
- Use "Forgot Password?" if needed

**"Account locked"**
- Too many failed attempts
- Wait 15 minutes
- Or reset password to unlock immediately
- Check email for security notification

**MFA code not working**
- Ensure device time is correct (sync time)
- Code changes every 30 seconds
- Try next code if current one expired
- Use backup code if authenticator lost

### Document Upload Issues

**"Upload failed"**
- Check internet connection (if sync enabled)
- Ensure sufficient storage space
- Try smaller file size
- Check file format is supported

**Camera not working**
- Grant camera permission in device settings
- Restart app
- Check if camera works in other apps
- Ensure camera lens is clean

**Can't see uploaded document**
- Pull down to refresh
- Check correct category selected
- Check if filtered view is active
- Restart app

### Search Issues

**Search returns no results**
- Check spelling
- Try partial word search
- Check if documents exist in category
- Clear search filters

**Search too slow**
- Large document library (optimize)
- Clear cache
- Restart app
- Close other apps to free memory

### App Performance Issues

**App running slow**
- Clear cache: Settings → Storage → Clear Cache
- Close and restart app
- Check device storage (need at least 500MB free)
- Update to latest version

**App crashes**
- Update to latest version
- Restart device
- Clear cache
- Reinstall app (backup documents first)

**Battery drain**
- Close app when not in use
- Reduce scan quality if not needed
- Check for app updates
- Disable unnecessary features

---

## Frequently Asked Questions (FAQ)

### General

**Q: Is DocsShelf free?**
A: Yes, DocsShelf is completely free to use with no ads.

**Q: Does DocsShelf work offline?**
A: Yes, all documents are stored locally on your device and accessible offline.

**Q: Can I use DocsShelf on multiple devices?**
A: Currently, DocsShelf stores documents locally on one device. Cloud sync is a planned future feature.

**Q: What file types are supported?**
A: PDF documents, JPG/PNG images, and scanned documents.

**Q: Is there a file size limit?**
A: Individual files should be under 50MB for optimal performance.

### Security

**Q: Are my documents encrypted?**
A: Documents are stored securely using Android's secure storage. Passwords are encrypted with PBKDF2-SHA256.

**Q: Can anyone access my documents?**
A: No, documents are protected by your password and optional biometric authentication.

**Q: What happens if I forget my password?**
A: Use the "Forgot Password?" feature to reset via email. Your documents will remain intact.

**Q: Can I backup my documents?**
A: Local device backup is recommended. Cloud backup is a planned feature.

### Features

**Q: How many documents can I store?**
A: Limited only by your device storage capacity.

**Q: Can I edit PDFs?**
A: Currently viewing only. PDF editing is a planned future feature.

**Q: Can I share documents with others?**
A: Yes, use the Share button to send via email, messaging, etc.

**Q: Can I print documents?**
A: Yes, if your device is connected to a compatible printer.

---

## Support & Feedback

### Need Help?

**In-App Support:**
- Settings → Help & Support
- Settings → Report a Bug
- Settings → Send Feedback

**Common Issues:**
- Check this user manual first
- Visit Troubleshooting section
- Check for app updates

### Report a Bug

If you encounter a bug:
1. Go to Settings → Report a Bug
2. Describe the issue in detail
3. Include steps to reproduce
4. Attach screenshots if helpful
5. Submit report

### Feature Requests

Have an idea for DocsShelf?
1. Go to Settings → Send Feedback
2. Describe your feature idea
3. Explain how it would help you
4. Submit feedback

---

## Privacy Policy

**Data Collection:**
- DocsShelf does not collect personal data
- Documents stay on your device
- No analytics or tracking
- No third-party data sharing

**Permissions:**
- Camera: For scanning documents
- Storage: For saving and retrieving documents
- Biometric: For fingerprint/face unlock (optional)

**Your Privacy:**
- No cloud storage (currently)
- No account syncing to external servers
- Email only used for password reset
- Full control over your data

---

## Version Information

**Current Version:** 7.0.0  
**Last Updated:** December 2025  
**Platform:** Android 7.0+  

**What's New:**
- Enhanced document viewer with action menu
- Improved File Explorer with search
- Better security with MFA support
- Biometric authentication
- Account lockout protection
- Password reset via email
- Professional email templates
- Status bar fixes
- Performance improvements

---

## About DocsShelf

DocsShelf is designed to help you organize and secure your important documents. Whether it's receipts, medical records, or personal documents, DocsShelf keeps everything organized and accessible.

**Key Features:**
- 📱 Scan documents with your camera
- 📁 Organize with categories and tags
- 🔍 Fast search and filter
- 🔒 Bank-level security
- 👆 Biometric authentication
- 🔐 Two-factor authentication (MFA)
- 📊 File Explorer with tree view
- 📤 Easy sharing and printing
- 🎨 Light and dark themes
- 🚫 No ads, no tracking

**Mission:**
To provide a simple, secure, and private way to manage personal documents without compromising your privacy or security.

---

## License & Credits

**DocsShelf v7**  
Copyright © 2024-2025

**Open Source Libraries:**
- React Native
- Expo
- Redux Toolkit
- SQLite
- React Navigation
- Expo Vector Icons

**Third-Party Services:**
- Email service integration (optional)
- Biometric authentication (device)

---

## Contact

**For support, questions, or feedback:**

📧 Email: support@docsshelf.app  
🌐 Website: www.docsshelf.app  
📱 App Version: Check Settings → About

---

**Thank you for using DocsShelf!** 🙏

We hope this app makes managing your documents easier and more secure. If you find DocsShelf helpful, please consider rating it on the Google Play Store.

*Keep your documents safe, organized, and always accessible.*

---

*User Manual - DocsShelf v7.0.0 - December 2025*
