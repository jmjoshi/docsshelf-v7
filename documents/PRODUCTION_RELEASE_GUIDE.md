# DocsShelf v1.0 - Production Release Guide

**Document Created:** December 7, 2025  
**Last Updated:** December 7, 2025  
**Current Build:** v1.0.0-release (Git Commit: 045e9b9)  
**Target Platform:** Android (Google Play Store)  
**Status:** Ready for Production Release 🚀

---

## 📋 Document Purpose

This guide provides a **complete step-by-step checklist** for releasing DocsShelf v1.0 to production. Follow these steps in order to ensure a smooth, professional launch.

---

## ✅ Pre-Release Checklist

Before starting the release process, verify:

- [x] All code committed and pushed to GitHub (Commit: 045e9b9)
- [x] Release APK built and tested on physical device
- [x] All features working (email service, user docs, UI polish)
- [x] Zero TypeScript errors, zero ESLint warnings
- [x] 802 tests passing (80%+ coverage)
- [ ] Privacy Policy and Terms of Service reviewed
- [ ] Support email configured
- [ ] Email service provider configured
- [ ] App signing keys ready
- [ ] App store assets prepared

---

## 🚀 PRODUCTION RELEASE ROADMAP

### Phase 1: Email Infrastructure Setup (1-2 hours)

#### Step 1.1: Create Support Email Address
**Priority:** 🔴 CRITICAL  
**Estimated Time:** 30 minutes

**Options:**

**Option A: ImprovMX (FREE - Recommended for MVP)**
1. Go to https://improvmx.com/
2. Sign up for free account
3. Add domain: `docsshelf.app` (or your domain)
4. Create alias: `support@docsshelf.app` → forward to your personal email
5. Verify domain with DNS records
6. Test by sending email to support@docsshelf.app

**Option B: Google Workspace ($6/month)**
1. Go to https://workspace.google.com/
2. Sign up for Business Starter plan
3. Add domain and verify ownership
4. Create user: support@docsshelf.app
5. Configure Gmail access
6. Test email sending/receiving

**Option C: Zoho Mail (FREE for 1 user)**
1. Go to https://www.zoho.com/mail/
2. Sign up for free plan (1 domain, 5 users)
3. Add domain and verify with DNS
4. Create mailbox: support@docsshelf.app
5. Configure email client
6. Test email functionality

**Deliverable:** Working support@docsshelf.app email address

---

#### Step 1.2: Configure Email Service Provider
**Priority:** 🔴 CRITICAL  
**Estimated Time:** 1 hour

**Recommended: SendGrid (FREE tier - 100 emails/day)**

1. **Sign Up for SendGrid**
   ```
   URL: https://signup.sendgrid.com/
   Plan: Free (100 emails/day forever)
   ```

2. **Create API Key**
   - Navigate to Settings → API Keys
   - Click "Create API Key"
   - Name: `DocsShelf Production`
   - Permissions: Full Access (or Restricted - Mail Send only)
   - Copy API key (you'll only see it once!)
   - Store securely (1Password, LastPass, etc.)

3. **Verify Sender Identity**
   - Navigate to Settings → Sender Authentication
   - Click "Verify a Single Sender"
   - Enter details:
     * From Name: `DocsShelf`
     * From Email: `noreply@docsshelf.app`
     * Reply To: `support@docsshelf.app`
     * Company Address: Your address
   - Check email and click verification link
   - Status should show "Verified" ✅

4. **Update App Configuration**
   
   Edit `src/services/email/emailService.ts`:
   ```typescript
   const emailConfig: EmailConfig = {
     provider: 'sendgrid',  // Changed from 'console-only'
     apiKey: 'YOUR_SENDGRID_API_KEY_HERE',  // Paste API key
     fromEmail: 'noreply@docsshelf.app',
     fromName: 'DocsShelf',
   };
   ```

5. **Test Email Sending**
   - Trigger password reset in app
   - Check email arrives at test address
   - Verify HTML formatting looks correct
   - Test reset link works

**Alternative: Mailgun (FREE tier - 5,000 emails/month for 3 months)**

1. Sign up at https://signup.mailgun.com/
2. Add domain and verify DNS records
3. Create API key
4. Update `emailConfig.provider = 'mailgun'`
5. Add Mailgun domain and API key
6. Test email sending

**Deliverable:** Working email service sending password reset emails

---

### Phase 2: App Store Preparation (3-4 hours)

#### Step 2.1: Create App Store Assets
**Priority:** 🟡 HIGH  
**Estimated Time:** 2 hours

**Required Assets:**

1. **App Icon (512x512 PNG)**
   - Current: Blue background with "DS" logo
   - Recommendation: Keep existing or enhance with professional designer
   - Requirements: No transparency, square, high resolution
   - Export from: Figma, Sketch, or assets/images/icon.png

2. **Feature Graphic (1024x500 PNG)**
   - Showcase app's main features
   - Use app screenshots with overlay text
   - Example text: "Secure Document Management | Local-First | End-to-End Encrypted"
   - Tools: Canva, Figma, Adobe Express

3. **Screenshots (REQUIRED - at least 2, max 8)**
   
   **Phone Screenshots (1080x1920 or 1080x2340):**
   - Screenshot 1: Home Dashboard (showing stats)
   - Screenshot 2: Document List (with documents)
   - Screenshot 3: Document Viewer (showing image/PDF)
   - Screenshot 4: Category Management
   - Screenshot 5: File Explorer
   - Screenshot 6: Settings Screen
   - Screenshot 7: Backup Screen
   - Screenshot 8: Security Settings
   
   **How to Capture:**
   ```powershell
   # On physical device
   adb -s R9ZX90HXSVA shell screencap -p /sdcard/screenshot.png
   adb -s R9ZX90HXSVA pull /sdcard/screenshot.png ./screenshots/
   
   # Or use device's screenshot function:
   # Android: Power + Volume Down
   # Then pull from device via USB
   ```
   
   **Post-Processing:**
   - Resize to 1080x1920 or 1080x2340
   - Add device frame (optional - use mockuphone.com)
   - Remove sensitive data (test account names, etc.)
   - Save as PNG or JPEG

4. **Video Preview (Optional but recommended - max 30 seconds)**
   - Screen recording of key features
   - Add voiceover or text overlays
   - Show: Upload → Organize → Secure → Backup flow
   - Tools: OBS Studio, ScreenFlow, Camtasia

**Deliverable:** All assets saved in `assets/app-store/` folder

---

#### Step 2.2: Write App Store Listing
**Priority:** 🟡 HIGH  
**Estimated Time:** 1 hour

**App Title (30 characters max)**
```
DocsShelf - Secure Documents
```

**Short Description (80 characters max)**
```
Private document manager with military-grade encryption. Local storage only.
```

**Full Description (4000 characters max)**

```markdown
Secure Your Documents with Military-Grade Encryption 🔒

DocsShelf is a privacy-focused document management app that keeps your files safe with end-to-end encryption. All your documents stay on your device - no cloud, no tracking, no data mining.

🔐 BANK-LEVEL SECURITY
• AES-256 encryption for all documents
• Zero-knowledge architecture - only you can access your files
• Multi-factor authentication (MFA) with TOTP
• Biometric authentication (fingerprint/face ID)
• Automatic account lockout after failed attempts

📂 POWERFUL ORGANIZATION
• Unlimited categories and subcategories
• Tag system for flexible organization
• Windows Explorer-like file browser
• Full-text search across all documents
• Smart filters by category, tags, and date

📸 SCAN & UPLOAD
• Camera scanning with instant upload
• Support for PDF, images, and text files
• Automatic file encryption on upload
• Preview thumbnails and metadata

💾 BACKUP & RESTORE
• Encrypted backups to external storage
• Plain file export for easy sharing
• Complete backup history
• One-click restore functionality

🎨 BEAUTIFUL INTERFACE
• Modern, intuitive design
• Dark mode support
• Professional document viewer
• Smooth animations and haptic feedback

✅ PRIVACY FIRST
• 100% local storage - no cloud required
• No ads, no trackers, no data collection
• GDPR and CCPA compliant
• Open source - verify the code yourself

📱 PERFECT FOR:
• Professionals managing sensitive documents
• Students organizing academic papers
• Anyone who values privacy and security
• Users seeking alternatives to cloud storage

🆓 FREE & OPEN SOURCE
DocsShelf is completely free with no premium tiers, subscriptions, or hidden costs. Your privacy is not for sale.

SUPPORT
Need help? Contact us at support@docsshelf.app
GitHub: https://github.com/jmjoshi/docsshelf-v7
Documentation: User Manual available in app

Download DocsShelf today and take control of your documents! 🚀
```

**Category**
```
Productivity
```

**Content Rating**
```
Everyone
```

**Contact Email**
```
support@docsshelf.app
```

**Privacy Policy URL**
```
https://github.com/jmjoshi/docsshelf-v7/blob/master/documents/legal/PRIVACY_POLICY.md
```

**Deliverable:** App store listing document saved as `documents/APP_STORE_LISTING.md`

---

#### Step 2.3: Prepare Legal Documents
**Priority:** 🔴 CRITICAL  
**Estimated Time:** 30 minutes

**Review Existing Documents:**

1. **Privacy Policy** ✅
   - Location: `documents/legal/PRIVACY_POLICY.md`
   - Status: Complete
   - Action: Review and ensure support email is correct

2. **Terms of Service** ✅
   - Location: `documents/legal/TERMS_OF_SERVICE.md`
   - Status: Complete
   - Action: Review and ensure support email is correct

3. **Update Contact Information**
   
   Edit both files to replace placeholder with real support email:
   ```markdown
   # Before
   Contact us at: support@docsshelf.com
   
   # After
   Contact us at: support@docsshelf.app
   ```

4. **Create HTML Versions (for app store)**
   
   Convert to HTML for hosting:
   ```powershell
   # If you have a website/GitHub Pages
   # Save as privacy-policy.html and terms-of-service.html
   # Upload to: https://yourdomain.com/privacy-policy.html
   
   # Or use GitHub as host
   # GitHub will render the .md files at:
   # https://github.com/jmjoshi/docsshelf-v7/blob/master/documents/legal/PRIVACY_POLICY.md
   ```

**Deliverable:** Legal documents reviewed with correct contact information

---

### Phase 3: Android Release Build (2-3 hours)

#### Step 3.1: Generate App Signing Key
**Priority:** 🔴 CRITICAL  
**Estimated Time:** 30 minutes

**Create Upload Key (for Google Play Store):**

```powershell
# Navigate to android/app folder
cd C:\Projects\docsshelf-v7\android\app

# Generate keystore (Run this ONCE only!)
keytool -genkeypair -v -storetype PKCS12 -keystore docsshelf-upload-key.keystore -alias docsshelf-key -keyalg RSA -keysize 2048 -validity 10000

# You'll be prompted for:
# Keystore password: [Choose strong password - SAVE THIS!]
# Re-enter password: [Same password]
# First and last name: Your Name
# Organizational unit: DocsShelf Development
# Organization: Your Company
# City: Your City
# State: Your State
# Country code: US (or your country)
# Confirm: yes
# Key password: [Press Enter to use same as keystore password]
```

**CRITICAL: Backup Your Keystore!**
```powershell
# Copy keystore to safe location (DO NOT COMMIT TO GIT!)
Copy-Item docsshelf-upload-key.keystore -Destination "C:\Users\$env:USERNAME\Documents\DocsShelf_Keys\"

# Also backup to:
# - External USB drive
# - Password manager (1Password, LastPass)
# - Encrypted cloud storage (NOT GitHub!)
```

**Configure Gradle to Use Keystore:**

1. Create `android/gradle.properties` (if not exists)
2. Add keystore configuration:
   ```properties
   DOCSSHELF_UPLOAD_STORE_FILE=docsshelf-upload-key.keystore
   DOCSSHELF_UPLOAD_KEY_ALIAS=docsshelf-key
   DOCSSHELF_UPLOAD_STORE_PASSWORD=your_keystore_password
   DOCSSHELF_UPLOAD_KEY_PASSWORD=your_key_password
   ```

3. Edit `android/app/build.gradle`:
   ```gradle
   android {
       ...
       signingConfigs {
           release {
               if (project.hasProperty('DOCSSHELF_UPLOAD_STORE_FILE')) {
                   storeFile file(DOCSSHELF_UPLOAD_STORE_FILE)
                   storePassword DOCSSHELF_UPLOAD_STORE_PASSWORD
                   keyAlias DOCSSHELF_UPLOAD_KEY_ALIAS
                   keyPassword DOCSSHELF_UPLOAD_KEY_PASSWORD
               }
           }
       }
       buildTypes {
           release {
               ...
               signingConfig signingConfigs.release
           }
       }
   }
   ```

**Deliverable:** Signed keystore file (backed up securely)

---

#### Step 3.2: Build Signed Release APK
**Priority:** 🔴 CRITICAL  
**Estimated Time:** 15 minutes

```powershell
# Clean previous builds
cd C:\Projects\docsshelf-v7\android
.\gradlew clean

# Build signed release APK/AAB
.\gradlew bundleRelease  # For AAB (recommended for Play Store)
# OR
.\gradlew assembleRelease  # For APK (for testing)

# Wait for build to complete (2-5 minutes)
# Success message: "BUILD SUCCESSFUL"

# Locate the built files:
# AAB: android\app\build\outputs\bundle\release\app-release.aab
# APK: android\app\build\outputs\apk\release\app-release.apk
```

**Verify Build:**
```powershell
# Check file exists and size
Get-ChildItem android\app\build\outputs\bundle\release\app-release.aab | Select-Object Name, Length

# Expected size: 30-50 MB for AAB

# Install APK on device for final testing
adb install -r android\app\build\outputs\apk\release\app-release.apk

# Test all features:
# - Registration and login
# - Document upload and viewing
# - Backup and restore
# - Settings changes
# - MFA setup
# - Password reset (if email configured)
```

**Deliverable:** Signed app-release.aab file ready for upload

---

#### Step 3.3: Optimize and Finalize Build
**Priority:** 🟢 MEDIUM  
**Estimated Time:** 30 minutes

**Enable ProGuard (Code Shrinking):**

Edit `android/app/build.gradle`:
```gradle
buildTypes {
    release {
        minifyEnabled true
        shrinkResources true
        proguardFiles getDefaultProguardFile('proguard-android-optimize.txt'), 'proguard-rules.pro'
        signingConfig signingConfigs.release
    }
}
```

**Verify AndroidManifest.xml:**

Check `android/app/src/main/AndroidManifest.xml`:
```xml
<manifest>
    <application
        android:allowBackup="false"
        android:icon="@mipmap/ic_launcher"
        android:label="DocsShelf"
        android:usesCleartextTraffic="false">
        <!-- Ensure label and icon are correct -->
    </application>
</manifest>
```

**Update Version Information:**

Edit `android/app/build.gradle`:
```gradle
android {
    defaultConfig {
        applicationId "com.docsshelf.app"
        versionCode 1  // Increment for each release (1, 2, 3...)
        versionName "1.0.0"  // User-visible version
    }
}
```

**Rebuild with Optimizations:**
```powershell
cd android
.\gradlew clean
.\gradlew bundleRelease
```

**Deliverable:** Optimized, production-ready AAB file

---

### Phase 4: Google Play Console Setup (1-2 hours)

#### Step 4.1: Create Google Play Developer Account
**Priority:** 🔴 CRITICAL  
**Estimated Time:** 30 minutes  
**Cost:** $25 USD (one-time fee)

1. **Sign Up**
   ```
   URL: https://play.google.com/console/signup
   ```

2. **Complete Registration**
   - Use Google account (personal or business)
   - Pay $25 registration fee (credit card)
   - Accept Developer Distribution Agreement
   - Verify email address

3. **Complete Developer Profile**
   - Developer name: Your name or "DocsShelf Development"
   - Website: https://github.com/jmjoshi/docsshelf-v7
   - Email: support@docsshelf.app
   - Phone number: Your phone

**Deliverable:** Active Google Play Developer account

---

#### Step 4.2: Create App in Play Console
**Priority:** 🔴 CRITICAL  
**Estimated Time:** 1 hour

1. **Create New App**
   - Click "Create app"
   - App name: `DocsShelf - Secure Documents`
   - Default language: English (United States)
   - App or game: App
   - Free or paid: Free
   - Click "Create app"

2. **Set Up App Content**
   
   **Privacy Policy:**
   - URL: https://github.com/jmjoshi/docsshelf-v7/blob/master/documents/legal/PRIVACY_POLICY.md
   
   **App Access:**
   - Select "All functionality is available without restrictions"
   
   **Ads:**
   - Select "No, my app does not contain ads"
   
   **Content Rating:**
   - Complete questionnaire
   - Select "Productivity" category
   - App does not contain violence, mature content, etc.
   - Get rating: Everyone
   
   **Target Audience:**
   - Age groups: 18 and over
   - Appeal to children: No
   
   **News App:**
   - Is this a news app? No
   
   **Data Safety:**
   - Data collection and sharing:
     * User data collected: Email address, phone numbers (optional)
     * Data encrypted in transit: Yes
     * Data encrypted at rest: Yes
     * User can request data deletion: Yes
   - Security practices:
     * Data is encrypted: Yes
     * App follows security best practices: Yes
     * Independent security review: Not yet (plan for future)

3. **Store Settings**
   
   **App Category:**
   - Category: Productivity
   - Tags: document management, encryption, privacy, security, local storage
   
   **Contact Details:**
   - Email: support@docsshelf.app
   - Website: https://github.com/jmjoshi/docsshelf-v7
   - Phone: (Optional)
   
   **External Marketing:**
   - Allow Google to feature app: Yes

**Deliverable:** App created in Play Console with all required fields

---

#### Step 4.3: Upload Release Bundle
**Priority:** 🔴 CRITICAL  
**Estimated Time:** 30 minutes

1. **Create Release**
   - Navigate to "Production" track (left sidebar)
   - Click "Create new release"
   
2. **Upload Bundle**
   - Click "Upload"
   - Select `android/app/build/outputs/bundle/release/app-release.aab`
   - Wait for upload (may take 5-10 minutes)
   - Google will process and verify the bundle

3. **Release Name**
   ```
   1.0.0 (Initial Release)
   ```

4. **Release Notes** (Copy for each language)
   ```
   🎉 Welcome to DocsShelf v1.0!
   
   Secure document management with military-grade encryption.
   
   ✨ Features:
   • End-to-end encryption (AES-256)
   • Document scanning and upload
   • Unlimited categories and subcategories
   • File Explorer interface
   • Full-text search
   • Backup and restore
   • Dark mode
   • Biometric authentication
   • Multi-factor authentication (MFA)
   
   🔒 Privacy First:
   • 100% local storage
   • Zero-knowledge architecture
   • No cloud, no tracking
   • GDPR/CCPA compliant
   
   📧 Support: support@docsshelf.app
   ```

5. **Review Release**
   - Verify app name, icon, version
   - Check all required sections completed
   - Review content rating
   - Save as draft (don't submit yet)

**Deliverable:** Release draft ready for submission

---

### Phase 5: Store Listing (1 hour)

#### Step 5.1: Complete Store Listing
**Priority:** 🟡 HIGH  
**Estimated Time:** 1 hour

1. **Main Store Listing**
   - Navigate to "Store presence" → "Main store listing"
   
2. **App Name**
   ```
   DocsShelf - Secure Documents
   ```

3. **Short Description** (80 chars max)
   ```
   Private document manager with military-grade encryption. Local storage only.
   ```

4. **Full Description** (4000 chars max)
   - Paste description from Step 2.2

5. **App Icon**
   - Upload: 512x512 PNG
   - File: `assets/images/icon.png` (or prepared 512x512 version)

6. **Feature Graphic**
   - Upload: 1024x500 PNG
   - Created in Step 2.1

7. **Phone Screenshots**
   - Upload 2-8 screenshots
   - Order: Home → Documents → Viewer → Categories → Explorer → Settings
   - Files from Step 2.1

8. **Video (Optional)**
   - YouTube URL of app preview video

9. **Save Changes**

**Deliverable:** Complete store listing with all assets

---

### Phase 6: Pre-Launch Testing (Optional but Recommended - 1-2 days)

#### Step 6.1: Internal Testing Track
**Priority:** 🟢 MEDIUM  
**Estimated Time:** 1-2 days

1. **Create Internal Testing Release**
   - Navigate to "Internal testing" track
   - Upload same AAB file
   - Add release notes
   
2. **Add Testers**
   - Create internal testing group
   - Add email addresses (friends, family, colleagues)
   - Send testing link
   
3. **Collect Feedback**
   - Ask testers to install and test all features
   - Review crash reports in Play Console
   - Fix critical bugs if found
   
4. **Update Release if Needed**
   - Increment versionCode (2, 3, etc.)
   - Rebuild AAB with fixes
   - Upload new version to internal testing

**Deliverable:** Validated app with no critical bugs

---

### Phase 7: Launch! (15 minutes)

#### Step 7.1: Submit for Review
**Priority:** 🔴 CRITICAL  
**Estimated Time:** 15 minutes

1. **Final Checklist**
   - [ ] Email service configured and tested
   - [ ] Support email working
   - [ ] All store listing sections complete
   - [ ] Privacy policy and terms reviewed
   - [ ] Screenshots look professional
   - [ ] Release bundle uploaded
   - [ ] Content rating received
   - [ ] Data safety form complete
   - [ ] Release notes written

2. **Submit to Production**
   - Navigate to "Production" track
   - Open your release draft
   - Click "Review release"
   - Review all warnings (resolve if critical)
   - Click "Start rollout to Production"
   - Confirm: "Rollout to 100% of users"
   - Click "Rollout"

3. **Wait for Review**
   - Review time: Typically 1-3 days (can be up to 7 days)
   - You'll receive email updates
   - Check Play Console for status

4. **Monitor After Launch**
   - Check for crash reports
   - Monitor user reviews
   - Respond to feedback
   - Watch download stats

**Deliverable:** App submitted to Google Play Store! 🎉

---

## 📊 POST-LAUNCH CHECKLIST

### Week 1 After Launch

- [ ] Monitor crash reports daily (Play Console → Quality → Crashes)
- [ ] Respond to user reviews within 24 hours
- [ ] Check support email daily
- [ ] Track download numbers
- [ ] Share launch announcement (social media, GitHub)
- [ ] Update README with Play Store link

### Week 2-4 After Launch

- [ ] Collect user feedback
- [ ] Plan first update based on feedback
- [ ] Fix any reported bugs
- [ ] Prepare v1.0.1 release
- [ ] Consider iOS version (if demand exists)

---

## 🛠️ TROUBLESHOOTING

### Common Issues

**Issue: Email service not working**
- Check API key is correct in emailService.ts
- Verify sender email is verified in SendGrid/Mailgun
- Check spam folder for test emails
- Review SendGrid activity log

**Issue: Keystore password forgotten**
- **NO RECOVERY POSSIBLE** - you'll need to create new keystore
- New keystore = new app in Play Store
- ALWAYS backup keystore securely!

**Issue: Build fails with signing error**
- Check gradle.properties has correct keystore path
- Verify keystore file exists in android/app folder
- Ensure passwords in gradle.properties match keystore

**Issue: Play Console rejects bundle**
- Ensure versionCode is higher than any previous version
- Check package name matches (com.docsshelf.app)
- Verify bundle is signed with correct keystore

**Issue: App crashes after release**
- Check Play Console → Quality → Crashes
- Enable ProGuard rules for problematic libraries
- Test release build thoroughly before submitting

---

## 📞 SUPPORT RESOURCES

**Google Play Console Help**
- https://support.google.com/googleplay/android-developer

**SendGrid Documentation**
- https://docs.sendgrid.com/

**React Native Documentation**
- https://reactnative.dev/docs/signed-apk-android

**DocsShelf Support**
- Email: support@docsshelf.app
- GitHub: https://github.com/jmjoshi/docsshelf-v7/issues

---

## 🎯 SUCCESS METRICS

**Define Success for v1.0:**
- ✅ App live on Google Play Store
- ✅ Zero critical crashes in first week
- ✅ 50+ downloads in first month
- ✅ 4+ star average rating
- ✅ Email service functioning properly
- ✅ Positive user feedback

**Track These KPIs:**
- Daily active users (DAU)
- Crash-free users percentage (target: >99%)
- User retention (Day 1, Day 7, Day 30)
- Average session duration
- Feature usage (most used features)
- User ratings and reviews

---

## 🎉 CONGRATULATIONS!

Once your app is live on Google Play Store, you've successfully launched DocsShelf v1.0! 

**Next Steps:**
1. Celebrate your achievement! 🎊
2. Monitor and respond to users
3. Plan v1.1 with user-requested features
4. Consider iOS version
5. Keep improving based on feedback

**Thank you for building with privacy and security in mind!** 🔒

---

**Document Version:** 1.0  
**Last Updated:** December 7, 2025  
**Author:** DocsShelf Development Team
