# Frequently Asked Questions (FAQ)

## Getting Started

### How do I create an account?
1. Open DocsShelf
2. Tap "Create Account" on the login screen
3. Enter your email address
4. Create a strong master password (at least 8 characters with uppercase, lowercase, number, and special character)
5. Agree to the Terms of Service and Privacy Policy
6. Tap "Register"

Your account is created instantly and your data is encrypted with your master password.

### What are the password requirements?
Your master password must:
- Be at least 8 characters long
- Contain at least one uppercase letter (A-Z)
- Contain at least one lowercase letter (a-z)
- Contain at least one number (0-9)
- Contain at least one special character (!@#$%^&*)

**Important**: Your master password is the key to your encrypted data. Choose a strong password you can remember, as it cannot be recovered if forgotten.

### Can I use the app without an account?
No, an account is required to use DocsShelf. This ensures your documents are securely encrypted and backed up to your personal account.

### How do I enable Face ID/Touch ID?
1. Go to **Settings** → **Security**
2. Tap **Biometric Authentication**
3. Enable Face ID or Touch ID
4. Confirm with your device biometrics

Once enabled, you can unlock DocsShelf using your face or fingerprint instead of typing your password each time.

### Is DocsShelf free?
Yes, DocsShelf is currently free to use with all features included.

---

## Security & Privacy

### How secure is DocsShelf?
DocsShelf uses military-grade AES-256 encryption to protect your documents:
- **End-to-end encryption**: Your documents are encrypted on your device before being stored
- **Local-first**: All data stored locally on your device by default
- **Zero-knowledge**: Only you have the encryption key (your master password)
- **Secure storage**: Uses your device's secure storage for encryption keys

### What encryption does DocsShelf use?
DocsShelf uses **AES-256 encryption**, the same encryption standard used by banks and governments worldwide. This means your documents are encrypted with a 256-bit key, making them virtually impossible to decrypt without your master password.

### Can you recover my password if I forget it?
**No, we cannot recover your password.** This is actually a security feature:
- Your master password never leaves your device
- We never store your password on our servers
- Even we cannot decrypt your documents without your password

This "zero-knowledge" approach ensures maximum privacy, but it means **you must remember your password**. We recommend:
- Writing it down and storing it in a safe place
- Using a password manager
- Creating regular backups so you can restore to a new device if needed

### Who can access my documents?
Only you. DocsShelf follows a "zero-knowledge" security model:
- Documents are encrypted on your device with your master password
- We never have access to your unencrypted documents
- We never have access to your master password
- Even our servers (if used for backup) only store encrypted data we cannot read

### Is my data stored in the cloud?
By default, your documents are **stored locally on your device**. You have optional cloud backup features:
- **Cloud Backup**: Encrypted backups to your cloud storage (future feature)
- **USB Backup**: Export encrypted backups to USB drives
- **Unencrypted Backup**: Export for migration purposes (use cautiously)

All cloud backups are encrypted with your master password, so we cannot read them.

### Can I use DocsShelf offline?
**Yes, absolutely!** DocsShelf is designed to work offline:
- All documents stored locally on your device
- No internet connection required for document management
- Scan, view, search, and organize completely offline
- Internet only needed for cloud backup features

### How do you protect my privacy?
We take privacy seriously:
- **Minimal data collection**: We only collect your email for account creation
- **No tracking**: No analytics, no third-party trackers
- **Local storage**: Documents never leave your device unless you explicitly backup
- **Encrypted backups**: Even backups are encrypted and unreadable to us
- **Open source**: Our code is open for security audits (planned)

See our [Privacy Policy](../legal/PRIVACY_POLICY.md) for complete details.

---

## Document Management

### What file types are supported?
DocsShelf supports a wide variety of file types:
- **Images**: JPG, JPEG, PNG, GIF, BMP, WEBP
- **Documents**: PDF, TXT, DOC, DOCX
- **Spreadsheets**: XLS, XLSX, CSV
- **Other**: Most common file formats

If you try to upload an unsupported file type, you'll receive a notification.

### What's the maximum file size?
- **Per document**: 50MB maximum
- **Total storage**: Limited by your device's available storage

If you need to store larger files, consider:
- Compressing PDF files
- Reducing image quality
- Splitting large documents into multiple files

### How many documents can I store?
There's no hard limit on the number of documents. Storage is limited only by your device's available storage space. You can view your storage usage in **Settings** → **Storage**.

### Can I scan multiple pages at once?
Yes! DocsShelf supports multi-page scanning:
1. Open the scanner (camera icon)
2. Take a photo of the first page
3. Tap "Add Page" to capture additional pages
4. Continue adding pages as needed
5. Tap "Done" when finished
6. Convert to PDF to create a single multi-page document

### How do I bulk delete documents?
Currently, documents must be deleted individually:
1. Open the document
2. Tap the delete icon (trash can)
3. Confirm deletion

**Note**: Bulk operations are planned for a future update.

### Can I share documents with others?
Currently, DocsShelf is designed for personal document management and doesn't include sharing features. You can:
- Export documents to other apps using your device's share function
- Create an unencrypted backup and share the backup file
- Email documents using your device's email client

**Note**: Secure document sharing is planned for a future update.

### How do I export a document?
To export a document from DocsShelf:
1. Open the document you want to export
2. Tap the share icon
3. Choose where to export (email, another app, cloud storage, etc.)

The document will be exported in its original unencrypted format.

---

## Backup & Restore

### How often should I backup?
We recommend:
- **Weekly backups** for active users (frequent document changes)
- **Monthly backups** for light users (occasional document changes)
- **Before major events**: Before device upgrades, OS updates, or switching devices

You can set up automatic backup reminders in **Settings** → **Backup**.

### Where are backups stored?
DocsShelf offers multiple backup options:
- **USB Backup**: Stored on a USB drive connected to your device
- **Cloud Backup**: Stored in your cloud storage (future feature)
- **Local Backup**: Exported to your device's files/downloads folder

You choose where to store backups based on your preference.

### Can I backup to multiple locations?
Yes! We recommend using multiple backup locations for maximum safety:
- Keep a USB backup at home
- Keep a cloud backup online (when available)
- Export occasional backups to external storage

This "3-2-1 backup strategy" protects against device failure, theft, or data loss.

### How long does backup take?
Backup time depends on:
- Number of documents
- Total size of documents
- Backup destination (USB vs. cloud)

Typical backup times:
- **100 documents (~100MB)**: 30-60 seconds
- **1,000 documents (~1GB)**: 3-5 minutes
- **10,000 documents (~10GB)**: 15-30 minutes

Large backups are processed in the background so you can continue using the app.

### What happens if backup fails?
If a backup fails, you'll see an error message explaining why. Common causes:
- **No storage space**: Free up space on the backup destination
- **Connection lost**: Check USB connection or internet connection
- **Interrupted**: The app was closed during backup

You can retry the backup after resolving the issue. Your documents are safe - backup failures don't affect your existing data.

### Can I restore to a different device?
**Yes!** This is one of the main purposes of backups:
1. Install DocsShelf on your new device
2. Create an account (or log in to your existing account)
3. Go to **Settings** → **Restore**
4. Choose your backup file
5. Enter your master password (must be the same password used when creating the backup)
6. Wait for the restore to complete

All your documents, categories, and tags will be restored to the new device.

### How do I verify my backup worked?
To verify a successful backup:
1. Check the backup completion message
2. Go to **Settings** → **Backup**
3. View "Last Backup" date and time
4. Optionally: Check the backup file size matches your expected document size

For maximum confidence, you can test a restore on a test device or in a test account.

---

## Troubleshooting

### App won't open / crashes on launch
Try these steps in order:
1. **Force close and reopen**: Close the app completely and reopen
2. **Restart device**: Turn your device off and on
3. **Check storage**: Ensure you have at least 500MB free storage
4. **Update app**: Check for app updates in the App Store/Play Store
5. **Reinstall**: Uninstall and reinstall (⚠️ backup first!)

If the problem persists, contact support with your device model and OS version.

### Camera not working for scanning
If the scanner camera isn't working:
1. **Check permissions**: Go to device Settings → DocsShelf → Enable Camera permission
2. **Close other camera apps**: Close any apps using the camera
3. **Restart app**: Force close DocsShelf and reopen
4. **Restart device**: Turn your device off and on
5. **Check for OS updates**: Update to the latest iOS/Android version

If problems continue, you can still upload photos from your gallery instead.

### USB backup not connecting
For USB backup connection issues:
1. **Check USB connection**: Ensure USB drive is properly connected
2. **Enable permissions**: Grant USB access permission when prompted
3. **Check USB format**: USB drive should be formatted as FAT32, exFAT, or NTFS
4. **Check USB space**: Ensure USB drive has enough free space
5. **Try different USB**: Some USB drives may not be compatible
6. **Use USB adapter**: Some devices require USB-C or Lightning adapters

**Note**: USB backup is only available on devices that support USB OTG (On-The-Go).

### Search not finding my documents
If search isn't returning expected results:
1. **Check spelling**: Verify the search term is spelled correctly
2. **Try different terms**: Use alternative keywords or partial words
3. **Check filters**: Remove category or date filters that might be limiting results
4. **Rebuild search index**: Go to Settings → Advanced → Rebuild Search Index
5. **Wait for indexing**: New documents may take a few moments to become searchable

Search looks for matches in:
- Document filename
- Document tags
- Document notes/description
- Category name

### Biometric authentication not working
If Face ID/Touch ID/Fingerprint isn't working:
1. **Check device settings**: Ensure biometrics are set up in device Settings
2. **Re-enable in app**: Go to Settings → Security → Toggle biometrics off and on
3. **Use fallback**: Tap "Use Password" to enter your master password instead
4. **Check device support**: Ensure your device supports biometric authentication
5. **Update device**: Update to the latest OS version

You can always use your master password as a fallback.

### Backup restore failed
If restore fails:
1. **Check password**: Ensure you're using the same master password used to create the backup
2. **Check file integrity**: Ensure the backup file isn't corrupted (verify file size)
3. **Check storage space**: Ensure device has enough free space for all documents
4. **Use correct backup type**: Match the restore method to backup type (USB, cloud, etc.)
5. **Try older backup**: If available, try restoring from an earlier backup

If restore continues to fail, contact support with the error message.

### Documents appear corrupted
If documents appear damaged or won't open:
1. **Check original file**: Verify the original file wasn't corrupted before upload
2. **Re-upload**: Delete and re-upload the document
3. **Try different viewer**: Export and open in another app
4. **Restore from backup**: Restore the document from your most recent backup
5. **Check file format**: Ensure the file format is supported

Corruption can occur due to:
- Device storage issues
- Interruption during upload
- Original file already corrupted

### App running slowly
If DocsShelf is performing slowly:
1. **Close background apps**: Free up device memory
2. **Clear cache**: Go to Settings → Storage → Clear Cache
3. **Check storage**: Ensure device has at least 500MB free space
4. **Reduce document load**: Archive old documents to a separate category
5. **Restart device**: Turn device off and on
6. **Update app**: Install the latest app version
7. **Optimize database**: Go to Settings → Advanced → Optimize Database

Performance depends on:
- Number of documents (>5,000 may slow down)
- Device age and model
- Available device storage
- Background processes

### Storage space issues
If you're running out of storage:
1. **View usage**: Settings → Storage to see what's using space
2. **Clear cache**: Settings → Storage → Clear Cache (recovers temp files)
3. **Delete old documents**: Remove documents you no longer need
4. **Archive to backup**: Create a backup, then delete old documents
5. **Export and delete**: Export important documents to cloud storage, then delete from app
6. **Free device storage**: Delete apps, photos, videos from your device

DocsShelf storage = Documents + Database + Cache

---

## Features & Functionality

### Can I organize documents in folders?
Yes! DocsShelf uses **categories** which work like folders:
- Create categories from the Categories tab
- Create subcategories (nested folders) by setting a parent category
- Move documents between categories
- Filter documents by category

Categories can be nested multiple levels deep for detailed organization.

### How do I create subcategories?
To create a subcategory (nested category):
1. Go to the **Categories** tab
2. Tap "+" to create a new category
3. Fill in the category name
4. Tap "Parent Category" and select the parent
5. Save

The subcategory will appear nested under its parent category.

### Can I add multiple tags to one document?
Yes! Documents can have unlimited tags:
1. Open a document
2. Tap "Edit" or the tags section
3. Add multiple tags separated by commas
4. Save

Tags are great for cross-category organization. Example: A document in "Work" category can have tags like "urgent", "client-xyz", "2024".

### Does DocsShelf support OCR (text recognition)?
OCR (Optical Character Recognition) is **not currently available** but is planned for a future update. This feature will:
- Extract text from scanned images
- Make scanned documents searchable
- Allow copying text from images

In the meantime, you can use external OCR apps and import the results.

### Can I edit documents in the app?
DocsShelf doesn't include a document editor. You can:
- **Edit metadata**: Change filename, category, tags, notes
- **Edit images**: Crop, rotate, adjust scanned images
- **Export to edit**: Export to your favorite editing app, then re-upload

Full document editing is planned for a future update.

### How do I mark documents as favorites?
To favorite a document:
1. Open the document
2. Tap the star icon (☆)
3. The star turns filled (★) to indicate it's favorited

View all your favorites by:
- Tapping the "Favorites" filter in the Documents tab
- Searching and filtering by favorites

### Can I set reminders for documents?
Document reminders (e.g., "Renew passport in 6 months") are **not currently available** but are planned for a future update.

In the meantime, you can:
- Add notes to documents with important dates
- Use your device's calendar or reminders app
- Create a "Needs Attention" category for time-sensitive documents

---

## Technical Questions

### What devices are supported?
DocsShelf supports:
- **iOS**: iPhone and iPad running iOS 13.0 or later
- **Android**: Phones and tablets running Android 6.0 (Marshmallow) or later

Recommended:
- iOS 15.0+ for best performance
- Android 10.0+ for best performance

### What iOS/Android version do I need?
**Minimum requirements**:
- iOS 13.0 or later
- Android 6.0 (Marshmallow, API level 23) or later

**Recommended**:
- iOS 15.0+ for optimal performance and security
- Android 10.0+ for optimal performance and security

Check your device's current OS version in Settings → About.

### How much storage does the app need?
**App installation**: ~50-100MB

**Runtime storage depends on your usage**:
- 100 documents (~10MB): ~50MB total
- 1,000 documents (~100MB): ~200MB total
- 10,000 documents (~1GB): ~1.5GB total

The app uses storage for:
- Documents (your files)
- Database (metadata and index)
- Cache (thumbnails and temp files)

Free up space anytime by clearing cache in Settings → Storage.

### Can I use DocsShelf on multiple devices?
Currently, DocsShelf is designed for **single-device use**. To transfer documents between devices:
1. Create a backup on Device A
2. Transfer the backup file to Device B
3. Restore the backup on Device B

**Note**: Multi-device sync is planned for a future update, which will automatically sync documents across all your devices.

### Does it work on tablets?
**Yes!** DocsShelf works on both phones and tablets:
- **iPad**: Full support for all iPad models (iOS 13+)
- **Android Tablets**: Full support (Android 6.0+)

Tablet optimizations (like multi-column layouts) are being added in future updates.

### Is there a desktop version?
DocsShelf is currently **mobile-only** (iOS and Android). 

A desktop version (Windows, macOS, Linux) is being considered for future development. In the meantime, you can:
- Use Android emulator on PC (BlueStacks, etc.)
- Access documents by exporting to cloud storage accessible from desktop

### Can I sync between devices?
Automatic sync between devices is **not currently available** but is planned for a future update.

Current workaround:
1. Backup on Device A
2. Restore on Device B
3. Manually keep backups current

Future sync will automatically keep all your devices in sync with real-time updates.

---

## Still Need Help?

### Contact Support
- **Email**: support@docsshelf.app
- **Response time**: Within 24-48 hours

### Report a Bug
Found a bug? Help us improve DocsShelf:
- **Email**: bugs@docsshelf.app
- **Include**: Device model, OS version, steps to reproduce

### Request a Feature
Have an idea for a new feature?
- **Email**: feedback@docsshelf.app
- **GitHub**: Open an issue (if repository is public)

### Check for Updates
Always ensure you're running the latest version:
- **iOS**: App Store → Updates
- **Android**: Play Store → My Apps & Games → Update

---

**Last Updated**: January 2025  
**App Version**: 1.0.0
