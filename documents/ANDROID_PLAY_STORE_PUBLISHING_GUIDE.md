# Android Play Store Publishing Guide

Complete step-by-step guide for building and publishing DocsShelf to the Google Play Store.

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [Build Configuration](#build-configuration)
3. [Creating Release Build](#creating-release-build)
4. [Testing the Release Build](#testing-the-release-build)
5. [Google Play Console Setup](#google-play-console-setup)
6. [App Listing Creation](#app-listing-creation)
7. [Upload and Release](#upload-and-release)
8. [Post-Release](#post-release)

---

## Prerequisites

### 1. Google Play Developer Account
- **Cost**: One-time $25 registration fee
- **Setup**: Go to [Google Play Console](https://play.google.com/console)
- **Requirements**: Valid Google account and payment method
- **Verification**: Identity verification required (may take 1-2 days)

### 2. Development Environment
- **Node.js**: v16 or higher
- **Java JDK**: Version 17 (required for Android builds)
- **Android Studio**: Latest stable version (for testing and debugging)
- **EAS CLI**: Expo Application Services CLI installed globally

### 3. Required Files and Assets
- App icon (512x512 PNG, without transparency)
- Feature graphic (1024x500 PNG)
- Screenshots (minimum 2, up to 8 per device type)
- Privacy policy URL (required)
- App description and promotional text

---

## Build Configuration

### Step 1: Verify Package Configuration

**File**: `package.json`

Ensure your package.json has correct app information:

```json
{
  "name": "docsshelf",
  "version": "1.0.0"
}
```

**Explanation**: The version number follows semantic versioning (MAJOR.MINOR.PATCH). For initial release, use 1.0.0.

### Step 2: Configure App.json

**File**: `app.json`

Verify and update the following critical fields:

```json
{
  "expo": {
    "name": "DocsShelf",
    "slug": "docsshelf",
    "version": "1.0.0",
    "android": {
      "package": "com.yourcompany.docsshelf",
      "versionCode": 1,
      "permissions": [],
      "adaptiveIcon": {
        "foregroundImage": "./assets/images/adaptive-icon.png",
        "backgroundColor": "#ffffff"
      }
    }
  }
}
```

**Key Fields Explained**:
- `package`: Unique identifier (reverse domain notation). Once published, this CANNOT be changed
- `versionCode`: Integer that must increment with each release (1, 2, 3...)
- `version`: User-facing version string (1.0.0, 1.0.1, etc.)
- `permissions`: List only required permissions (fewer is better for user trust)

### Step 3: Configure EAS Build

**File**: `eas.json`

Review your build configuration:

```json
{
  "build": {
    "production": {
      "android": {
        "buildType": "apk",
        "gradleCommand": ":app:assembleRelease"
      }
    }
  }
}
```

**Build Types**:
- **APK**: Single file, good for testing and initial releases
- **AAB (Android App Bundle)**: Required for Play Store (Google's preferred format)
  - Smaller download sizes
  - Dynamic delivery support
  - Required for apps over 150MB

**Important**: For Play Store, change `buildType` to `"aab"` for final submission.

---

## Creating Release Build

### Option A: Using EAS Build (Recommended)

#### Step 1: Install EAS CLI

```powershell
npm install -g eas-cli
```

**Explanation**: EAS CLI is Expo's cloud build service. It handles complex build configurations and signing automatically.

#### Step 2: Login to EAS

```powershell
eas login
```

**Explanation**: You'll need an Expo account. If you don't have one, create it at [expo.dev](https://expo.dev).

#### Step 3: Configure EAS Project

```powershell
eas build:configure
```

**Explanation**: This command:
- Links your project to EAS
- Generates build credentials
- Creates or updates eas.json

#### Step 4: Create Android App Bundle

```powershell
eas build --platform android --profile production
```

**What Happens**:
1. Code is uploaded to EAS servers
2. Dependencies are installed
3. Native code is compiled
4. App is signed with release keystore
5. AAB file is generated and uploaded

**Duration**: 10-20 minutes depending on project size.

**Output**: Download link for the .aab file

### Option B: Local Build

#### Step 1: Clean Previous Builds

```powershell
cd android
.\gradlew clean
```

**Explanation**: Removes old build artifacts to ensure a fresh build.

#### Step 2: Generate Release Keystore (First Time Only)

```powershell
keytool -genkeypair -v -storetype PKCS12 -keystore release.keystore -alias release-key -keyalg RSA -keysize 2048 -validity 10000
```

**Important Information to Remember**:
- **Keystore password**: Used to protect the keystore file
- **Key password**: Used to protect the specific key
- **Alias**: Name of the key (use: release-key)

**⚠️ CRITICAL**: Store these credentials securely! Losing them means you cannot update your app.

**Best Practice**: Store keystore in a secure location:
- Use password manager for credentials
- Backup keystore to encrypted cloud storage
- Never commit keystore to version control

#### Step 3: Configure Gradle Signing

**File**: `android/app/build.gradle`

Add signing configuration (if not already present):

```gradle
android {
    signingConfigs {
        release {
            storeFile file('path/to/release.keystore')
            storePassword 'your-keystore-password'
            keyAlias 'release-key'
            keyPassword 'your-key-password'
        }
    }
    
    buildTypes {
        release {
            signingConfig signingConfigs.release
            minifyEnabled true
            proguardFiles getDefaultProguardFile('proguard-android-optimize.txt'), 'proguard-rules.pro'
        }
    }
}
```

**Security Note**: For production, use environment variables or gradle.properties instead of hardcoding passwords.

#### Step 4: Build Release APK/AAB

**For AAB (Play Store)**:
```powershell
cd android
.\gradlew bundleRelease
```

**Output Location**: `android/app/build/outputs/bundle/release/app-release.aab`

**For APK (Testing)**:
```powershell
cd android
.\gradlew assembleRelease
```

**Output Location**: `android/app/build/outputs/apk/release/app-release.apk`

**Build Process Explained**:
1. Gradle compiles all Java/Kotlin code
2. Resources are processed and optimized
3. Native libraries are included
4. Code is minified (ProGuard/R8)
5. App is signed with release key
6. Output file is generated

---

## Testing the Release Build

### Step 1: Install on Physical Device

**For APK**:
```powershell
adb install android/app/build/outputs/apk/release/app-release.apk
```

**For AAB** (convert to APK first using bundletool):
```powershell
# Download bundletool from GitHub
java -jar bundletool.jar build-apks --bundle=app-release.aab --output=app.apks --mode=universal
java -jar bundletool.jar install-apks --apks=app.apks
```

**Explanation**: AAB files cannot be directly installed. They must be converted to APK sets first.

### Step 2: Testing Checklist

Test thoroughly before submitting:

- [ ] App launches successfully
- [ ] All features work as expected
- [ ] No crashes or ANR (Application Not Responding) errors
- [ ] Permissions are requested properly
- [ ] Sign-up and login flows work
- [ ] Data persistence works correctly
- [ ] App handles network errors gracefully
- [ ] Back button behaves correctly
- [ ] App works on different screen sizes
- [ ] Performance is acceptable (no lag)
- [ ] Battery usage is reasonable

### Step 3: Check Build Information

```powershell
# View APK information
aapt dump badging android/app/build/outputs/apk/release/app-release.apk

# Check signature
jarsigner -verify -verbose -certs android/app/build/outputs/apk/release/app-release.apk
```

**Explanation**: Verify the package name, version code, and signing certificate are correct.

---

## Google Play Console Setup

### Step 1: Create Application

1. Go to [Google Play Console](https://play.google.com/console)
2. Click **"Create app"**
3. Fill in the form:
   - **App name**: DocsShelf (must be unique on Play Store)
   - **Default language**: English (United States)
   - **App or Game**: App
   - **Free or Paid**: Free (for this app)
   - Accept declarations and click **"Create app"**

**Explanation**: The app name shown here is what users see in the Play Store. It can be different from your package name.

### Step 2: Set Up Store Presence

Navigate to **"Store presence" > "Main store listing"**

#### App Details

**App name**: DocsShelf (60 characters max)

**Short description**: (80 characters max)
```
Secure document storage with military-grade encryption. Your documents, your control.
```

**Full description**: (4000 characters max)
```
DocsShelf - Secure Document Management

Store, organize, and protect your important documents with military-grade encryption. DocsShelf keeps your sensitive information safe with advanced security features.

KEY FEATURES:

🔒 Military-Grade Security
• AES-256 encryption for all documents
• Argon2id password hashing
• Biometric authentication support
• No data stored in the cloud - your documents stay on your device

📁 Smart Organization
• Intuitive folder structure
• Quick search functionality
• Tag and categorize documents
• Easy document scanning

🎨 Beautiful & Intuitive
• Clean, modern interface
• Dark mode support
• Smooth animations
• Accessible design

💪 Full Control
• Local storage - you own your data
• Optional encrypted backups
• Export documents anytime
• No subscription required

PERFECT FOR:
• Personal documents (ID cards, passports, certificates)
• Financial records (tax documents, receipts, invoices)
• Medical records
• Legal documents
• Any sensitive information

PRIVACY FIRST:
DocsShelf is built with privacy as the top priority. Your documents never leave your device unless you explicitly export them. No accounts, no cloud sync, no tracking.

Download DocsShelf today and take control of your document security!
```

**App icon**: Upload 512x512 PNG (no transparency)
- Use your app icon from `assets/images/icon.png`
- Ensure it follows [Google's guidelines](https://support.google.com/googleplay/android-developer/answer/9866151)

**Feature Graphic**: 1024x500 PNG
- Create an attractive banner featuring your app
- Should include app name and key visual elements
- No transparency allowed

#### Screenshots

**Phone screenshots** (REQUIRED):
- Minimum: 2 screenshots
- Maximum: 8 screenshots
- Dimensions: Between 320px and 3840px
- Aspect ratio: Between 16:9 and 9:16
- Format: PNG or JPEG (no alpha/transparency)

**Recommended screenshots**:
1. Main document list screen
2. Document viewer
3. Security features (password/biometric)
4. Scan document feature
5. Folder organization

**7-inch tablet screenshots** (OPTIONAL but recommended):
- Same requirements as phone
- Shows app optimized for tablets

**10-inch tablet screenshots** (OPTIONAL):
- Same requirements as phone
- Shows app on larger screens

#### Categorization

**App category**: Productivity

**Tags** (up to 5):
- Document management
- Security
- Encryption
- Privacy
- Organization

#### Contact Details

**Email**: your-support-email@domain.com
- Must be a valid email for user support

**Website** (optional): https://yourwebsite.com

**Privacy Policy URL** (REQUIRED):
- Must be publicly accessible
- Should explain data collection practices
- Required by Google Play policy

### Step 3: Content Rating

Navigate to **"Policy" > "App content"**

#### Complete Content Rating Questionnaire

1. Click **"Start questionnaire"**
2. Enter email address
3. Select category: **"Utility, Productivity, Communication or Other"**
4. Answer questions honestly:
   - Does your app contain violence? **No**
   - Does your app contain sexual content? **No**
   - Does your app contain offensive language? **No**
   - Does your app contain drug references? **No**
   - Does your app contain gambling? **No**

5. Submit questionnaire

**Explanation**: Based on answers, Google assigns age ratings (e.g., Everyone, Teen, Mature). DocsShelf should receive "Everyone" rating.

### Step 4: Target Audience and Content

1. **Target age groups**: Select appropriate ages (likely "18 and over" for document management)
2. **Store presence**: Select "No" for children-directed content
3. **Appeal**: Select "No" for designed to appeal to children

### Step 5: App Access

1. Navigate to **"App content" > "App access"**
2. If all features are available to all users:
   - Select **"All functionality is available without special access"**
3. If restricted features exist:
   - Select **"Not all functionality is available"**
   - Provide demo credentials if needed

### Step 6: Ads Declaration

Navigate to **"App content" > "Ads"**

- Select **"No"** if app doesn't contain ads
- Select **"Yes"** if app shows advertisements

**Explanation**: DocsShelf doesn't contain ads, so select "No".

### Step 7: Data Safety

Navigate to **"App content" > "Data safety"**

This section is critical and requires careful attention:

#### Data Collection

**Does your app collect or share user data?**
- Select **"Yes"** if you collect ANY data
- Select **"No"** if absolutely no data is collected

For DocsShelf (local-only storage):
- Select **"No"** if truly no data leaves the device
- If you add analytics or crash reporting later, this must be updated

#### Data Types

If you selected "Yes", specify what data types:
- Personal information (name, email, etc.)
- Financial information
- Location
- Photos and videos
- Files and documents
- App activity
- Device or other identifiers

#### Security Practices

Describe your security practices:
- Data is encrypted in transit: **Yes** (if network features exist)
- Data is encrypted at rest: **Yes** (documents are encrypted)
- Users can request data deletion: **Yes/No** (depends on implementation)

**Save** when complete.

---

## Upload and Release

### Step 1: Create Release

1. Navigate to **"Release" > "Production"**
2. Click **"Create new release"**

**Explanation**: Production track is for public releases. Other tracks include:
- **Internal testing**: Up to 100 testers
- **Closed testing**: Specific testers via email
- **Open testing**: Anyone with link can test

### Step 2: Upload App Bundle

1. Click **"Upload"** under "App bundles"
2. Select your `app-release.aab` file
3. Wait for upload to complete (may take several minutes)

**What happens**:
- Google scans for malware
- Bundle is analyzed for issues
- APK variants are generated for different devices

### Step 3: Release Name and Notes

**Release name**: `1.0.0 - Initial Release`

**Release notes** (500 characters per language):
```
🎉 Welcome to DocsShelf!

• Secure document storage with military-grade encryption
• Organize documents in folders
• Quick search functionality
• Biometric authentication
• Dark mode support
• Document scanning
• Complete privacy - your data stays on your device

Thank you for using DocsShelf!
```

**Explanation**: Release notes appear in the "What's New" section. Be concise and highlight new features.

### Step 4: Review Release

Before submitting, review:

- [ ] Correct AAB file uploaded
- [ ] Version code increments from previous release
- [ ] Release notes are accurate
- [ ] Store listing is complete
- [ ] All content rating questions answered
- [ ] Data safety section filled
- [ ] Privacy policy URL is working

### Step 5: Rollout Percentage (Optional)

**Staged rollout**: Release to a percentage of users first
- Start with 20% to catch issues
- Increase gradually: 50% → 100%

**Full rollout**: Release to all users immediately

**Recommendation**: For initial release, use full rollout. For updates, consider staged rollout.

### Step 6: Submit for Review

1. Click **"Review release"**
2. Review all information
3. Click **"Start rollout to Production"**

**What happens next**:
1. Google reviews your app (usually 1-3 days)
2. Automated checks run (security, policy compliance)
3. Manual review (if flagged)
4. App goes live if approved

### Step 7: Review Status Tracking

Navigate to **"Release" > "Publishing overview"**

**Status indicators**:
- **In review**: Google is reviewing your app
- **Approved**: App passed review
- **Published**: App is live on Play Store
- **Rejected**: App violates policies (review feedback)

**Average review time**: 1-3 days, but can be up to 7 days

---

## Post-Release

### Step 1: Monitor Launch

After app goes live:

1. **Check store listing**: Verify app appears correctly
2. **Test installation**: Download from Play Store on test device
3. **Monitor reviews**: Respond to user feedback
4. **Check crashes**: Use Play Console crash reporting

Navigate to **"Quality" > "Android vitals"** for:
- Crash rate
- ANR (App Not Responding) rate
- Wake locks
- Battery usage

### Step 2: Respond to Reviews

Best practices:
- Respond within 24-48 hours
- Be professional and courteous
- Address specific issues mentioned
- Thank users for positive feedback
- Offer solutions for problems

### Step 3: Analyze Statistics

Navigate to **"Statistics"**:
- **Installs**: Track new installs over time
- **Uninstalls**: Monitor uninstall rate
- **Ratings**: Average rating and distribution
- **User acquisition**: How users found your app

### Step 4: Regular Updates

Plan for updates:
- **Bug fixes**: Release patches as needed
- **Feature updates**: Add new functionality
- **Security updates**: Keep dependencies current
- **Android version updates**: Support new Android versions

**Update frequency**: Aim for monthly updates to maintain engagement

### Step 5: App Bundle Explorer

Navigate to **"Release" > "App bundle explorer"**

View generated APKs:
- Different device configurations
- APK sizes for various devices
- Supported features per APK

**Explanation**: Google generates optimized APKs for different:
- Screen densities
- CPU architectures (arm64-v8a, armeabi-v7a, x86, x86_64)
- Language configurations

---

## Publishing Subsequent Updates

### Step 1: Update Version Numbers

**In app.json**:
```json
{
  "expo": {
    "version": "1.0.1",  // Increment version string
    "android": {
      "versionCode": 2   // MUST increment (2, 3, 4...)
    }
  }
}
```

**Version increment rules**:
- **Major** (1.0.0 → 2.0.0): Breaking changes, major features
- **Minor** (1.0.0 → 1.1.0): New features, backwards compatible
- **Patch** (1.0.0 → 1.0.1): Bug fixes only

**versionCode**: Must always increment by at least 1

### Step 2: Build New Release

```powershell
# EAS Build
eas build --platform android --profile production

# OR Local Build
cd android
.\gradlew clean
.\gradlew bundleRelease
```

### Step 3: Create New Release in Console

1. Navigate to **"Release" > "Production"**
2. Click **"Create new release"**
3. Upload new AAB
4. Update release notes with changes
5. Review and submit

### Step 4: Staged Rollout for Updates

Recommended for updates:
1. Start with 20% rollout
2. Monitor crashes and ratings for 24-48 hours
3. If stable, increase to 50%
4. Monitor for another 24 hours
5. Complete rollout to 100%

**To halt rollout**: Click "Halt rollout" if critical issues found

---

## Common Issues and Solutions

### Issue 1: App Bundle Not Accepted

**Error**: "Upload failed: App bundle contains..."

**Solutions**:
- Ensure version code is higher than previous
- Check package name hasn't changed
- Verify signing certificate matches
- Remove debuggable flag from manifest

### Issue 2: Policy Violation

**Error**: App removed or rejected for policy violation

**Solutions**:
- Review Google Play policies
- Check permissions requested
- Update privacy policy
- Remove prohibited content
- Appeal if you believe it's an error

### Issue 3: Signing Certificate Issue

**Error**: "Upload failed: You uploaded an APK that is signed with a different certificate"

**Solutions**:
- Use same keystore as initial release
- Verify keystore alias and passwords
- Cannot change certificate after first release
- If keystore is lost, must create new app listing

### Issue 4: Long Review Times

**Issue**: App stuck in review for over 7 days

**Solutions**:
- Check for email from Google Play team
- Verify all required sections completed
- Contact Google Play support
- Check publishing status page

### Issue 5: Low Visibility

**Issue**: App not appearing in search

**Solutions**:
- Optimize app title and description
- Add relevant keywords naturally
- Encourage reviews from users
- Add more screenshots
- Create promotional campaigns
- Update regularly (signals active development)

---

## Best Practices

### Security
- Never commit keystores to version control
- Use different signing keys for debug and release
- Enable Play App Signing for key management
- Rotate API keys regularly

### Optimization
- Use Android App Bundle (AAB) for smaller downloads
- Enable R8/ProGuard for code shrinking
- Optimize images and assets
- Test on multiple devices and Android versions

### Store Listing
- Use high-quality screenshots
- Write clear, benefit-focused descriptions
- Update feature graphic for promotions
- Localize for different markets
- Use keywords naturally in description

### User Engagement
- Respond to all reviews
- Fix reported bugs quickly
- Add requested features
- Keep app updated
- Send push notifications sparingly

### Analytics
- Monitor crash-free rate (aim for >99%)
- Track ANR rate (keep below 1%)
- Review retention metrics
- Analyze user acquisition channels

---

## Checklist for First Release

Before submitting:

- [ ] Package name is correct and unique
- [ ] Version code is 1, version string is 1.0.0
- [ ] App icon meets requirements (512x512, PNG, no transparency)
- [ ] Feature graphic created (1024x500, PNG)
- [ ] Minimum 2 phone screenshots added
- [ ] App title is unique and descriptive
- [ ] Short description under 80 characters
- [ ] Full description compelling and complete
- [ ] Privacy policy URL added and accessible
- [ ] Content rating questionnaire completed
- [ ] Data safety section filled accurately
- [ ] Target audience selected
- [ ] App category chosen
- [ ] Release notes written
- [ ] AAB built and tested thoroughly
- [ ] No crashes or critical bugs
- [ ] All permissions justified
- [ ] Keystore backed up securely
- [ ] Support email configured

---

## Resources

### Official Documentation
- [Google Play Console Help](https://support.google.com/googleplay/android-developer)
- [Android Developer Guide](https://developer.android.com/distribute)
- [App Bundle Format](https://developer.android.com/guide/app-bundle)
- [Play Console API](https://developers.google.com/android-publisher)

### Tools
- [Bundletool](https://github.com/google/bundletool): Test app bundles locally
- [Android Asset Studio](https://romannurik.github.io/AndroidAssetStudio/): Generate icons and assets
- [Fastlane](https://fastlane.tools/): Automate releases

### Policy Documents
- [Google Play Developer Policy](https://play.google.com/about/developer-content-policy/)
- [Restricted Content](https://support.google.com/googleplay/android-developer/answer/9888076)
- [Target API Level Requirements](https://support.google.com/googleplay/android-developer/answer/11926878)

---

## Appendix: Automated Release with Fastlane (Advanced)

For frequent releases, consider automating with Fastlane:

### Install Fastlane

```powershell
gem install fastlane
```

### Initialize Fastlane

```powershell
cd android
fastlane init
```

### Configure Fastlane (android/fastlane/Fastfile)

```ruby
default_platform(:android)

platform :android do
  desc "Deploy a new version to the Google Play"
  lane :deploy do
    gradle(task: "clean bundleRelease")
    upload_to_play_store(
      track: 'production',
      release_status: 'draft',
      skip_upload_metadata: true,
      skip_upload_images: true,
      skip_upload_screenshots: true
    )
  end
end
```

### Deploy with Fastlane

```powershell
cd android
fastlane deploy
```

**Benefits**:
- Automated build and upload
- Consistent release process
- Reduces human error
- Integrated with CI/CD pipelines

---

## Conclusion

Publishing to Google Play Store involves careful preparation, thorough testing, and attention to detail. Follow this guide step-by-step for your first release, and subsequent updates will become routine.

**Key Takeaways**:
1. Keep keystore secure - losing it means starting over
2. Test thoroughly before submitting
3. Complete all Play Console sections fully
4. Monitor app health after launch
5. Respond to user feedback promptly
6. Update regularly to maintain engagement

Good luck with your app launch! 🚀
