# iOS App Store Publishing Guide

Complete step-by-step guide for building and publishing DocsShelf to the Apple App Store.

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [Apple Developer Account Setup](#apple-developer-account-setup)
3. [Certificates and Provisioning](#certificates-and-provisioning)
4. [Build Configuration](#build-configuration)
5. [Creating Release Build](#creating-release-build)
6. [Testing the Release Build](#testing-the-release-build)
7. [App Store Connect Setup](#app-store-connect-setup)
8. [App Listing Creation](#app-listing-creation)
9. [Upload and Submit](#upload-and-submit)
10. [Review Process](#review-process)
11. [Post-Release](#post-release)

---

## Prerequisites

### 1. Apple Developer Account

**Cost**: $99/year (individual) or $299/year (organization)

**Setup Process**:
1. Go to [Apple Developer Program](https://developer.apple.com/programs/)
2. Click **"Enroll"**
3. Sign in with your Apple ID
4. Choose account type:
   - **Individual**: Personal apps
   - **Organization**: Company apps (requires DUNS number)
5. Complete enrollment form
6. Pay annual fee
7. Wait for approval (usually 24-48 hours)

**Important**: You MUST have an active paid Apple Developer account to publish to App Store.

### 2. Development Environment

**Required**:
- **Mac Computer**: macOS 12.0 (Monterey) or later
- **Xcode**: Latest stable version (14.0+)
- **Node.js**: v16 or higher
- **CocoaPods**: For dependency management
- **EAS CLI**: Expo Application Services

**Why Mac is Required**: 
- iOS builds can only be created on macOS
- Xcode is macOS-only
- Code signing requires macOS tools

**Alternative**: Use EAS Build cloud service if you don't have a Mac

### 3. Required Assets

**App Icon**:
- 1024x1024 PNG
- No transparency
- No rounded corners (iOS adds them automatically)
- RGB color space

**Screenshots** (Required for each device size):
- iPhone 6.7" (1290x2796 or 2796x1290)
- iPhone 6.5" (1242x2688 or 2688x1242)
- iPad Pro 12.9" (2048x2732 or 2732x2048)

**Optional but Recommended**:
- App preview videos (up to 3 per device size)
- Promotional artwork
- Press kit

---

## Apple Developer Account Setup

### Step 1: Access Developer Portal

1. Go to [Apple Developer Portal](https://developer.apple.com/account)
2. Sign in with your Apple ID
3. Verify account is active (status shows "Active" under Membership)

### Step 2: Verify Team Information

Navigate to **"Membership"**:
- **Team ID**: Note this down (needed for builds)
- **Team Name**: Your name or organization name
- **Role**: Admin, App Manager, Developer, etc.

**Explanation**: Team ID is used in app configuration and build settings.

### Step 3: Register App Bundle Identifier

1. Navigate to **"Certificates, Identifiers & Profiles"**
2. Click **"Identifiers"**
3. Click the **"+"** button
4. Select **"App IDs"** and click **"Continue"**
5. Fill in details:
   - **Description**: DocsShelf
   - **Bundle ID**: Choose **"Explicit"**
   - **Bundle ID**: `com.yourcompany.docsshelf`
6. Select capabilities your app uses:
   - [ ] Push Notifications
   - [ ] iCloud
   - [ ] Face ID
   - [ ] etc.
7. Click **"Continue"** and then **"Register"**

**Important**: 
- Bundle ID CANNOT be changed after first app submission
- Must match exactly with your app configuration
- Use reverse domain notation (com.company.appname)
- Cannot contain special characters except period and hyphen

---

## Certificates and Provisioning

### Understanding iOS Code Signing

iOS apps must be signed with:
1. **Certificate**: Proves your identity as developer
2. **Provisioning Profile**: Links app, certificate, and devices

**Types of Certificates**:
- **Development**: For testing on devices
- **Distribution**: For App Store submission

### Option A: Using EAS Build (Easiest)

**Advantage**: EAS manages all certificates automatically

1. EAS creates certificates on your behalf
2. Stores them securely
3. Reuses them for future builds

**No manual certificate management needed!**

### Option B: Manual Certificate Management

#### Step 1: Create Certificate Signing Request (CSR)

**On Mac**:
1. Open **Keychain Access** app
2. Menu: **Keychain Access > Certificate Assistant > Request a Certificate from a Certificate Authority**
3. Fill in:
   - **User Email**: Your email
   - **Common Name**: Your name
   - **CA Email**: Leave empty
   - **Request**: Select **"Saved to disk"**
4. Click **"Continue"**
5. Save CSR file (e.g., `CertificateSigningRequest.certSigningRequest`)

**Explanation**: CSR contains your public key and identifies you to Apple.

#### Step 2: Create Distribution Certificate

**In Apple Developer Portal**:
1. Navigate to **"Certificates, Identifiers & Profiles" > "Certificates"**
2. Click **"+"** button
3. Select **"iOS Distribution (App Store and Ad Hoc)"**
4. Click **"Continue"**
5. Upload CSR file created in Step 1
6. Click **"Continue"**
7. Download certificate (`.cer` file)
8. Double-click to install in Keychain Access

**Important**: 
- Keep certificate and private key secure
- Back up to secure location
- Losing it requires creating a new one

#### Step 3: Create App Store Provisioning Profile

1. Navigate to **"Profiles"**
2. Click **"+"** button
3. Select **"App Store"** under Distribution
4. Click **"Continue"**
5. Select your App ID (Bundle Identifier)
6. Select your Distribution Certificate
7. Enter profile name: `DocsShelf App Store`
8. Click **"Generate"**
9. Download provisioning profile

**Explanation**: Provisioning profile authorizes your app to be signed with your certificate and submitted to App Store.

#### Step 4: Install Provisioning Profile

**On Mac**:
```bash
# Copy to Xcode provisioning profiles directory
cp ~/Downloads/DocsShelf_App_Store.mobileprovision ~/Library/MobileDevice/Provisioning\ Profiles/
```

**Or** double-click the `.mobileprovision` file to install.

---

## Build Configuration

### Step 1: Configure App.json

**File**: `app.json`

```json
{
  "expo": {
    "name": "DocsShelf",
    "slug": "docsshelf-v7",
    "version": "1.0.0",
    "ios": {
      "bundleIdentifier": "com.yourcompany.docsshelf",
      "buildNumber": "1",
      "supportsTablet": true,
      "infoPlist": {
        "NSCameraUsageDescription": "DocsShelf needs camera access to scan documents.",
        "NSPhotoLibraryUsageDescription": "DocsShelf needs photo library access to import document images.",
        "NSPhotoLibraryAddUsageDescription": "DocsShelf needs access to save scanned documents to your photo library.",
        "NSFaceIDUsageDescription": "DocsShelf uses Face ID to secure your documents.",
        "ITSAppUsesNonExemptEncryption": false
      },
      "icon": "./assets/images/icon.png"
    }
  }
}
```

**Key Fields Explained**:

- **bundleIdentifier**: Must match Bundle ID registered in Apple Developer Portal
- **buildNumber**: String that increments with each build ("1", "2", "3")
- **version**: User-facing version (1.0.0, 1.0.1, etc.)
- **supportsTablet**: Set true to support iPad
- **infoPlist**: iOS-specific settings

**Info.plist Usage Descriptions** (Required):
- Every permission must have a usage description
- Explains why app needs that permission
- Shown to user when permission is requested
- App rejection if missing or vague

**ITSAppUsesNonExemptEncryption**:
- Set to `false` if only using standard iOS encryption
- Set to `true` if implementing custom encryption (requires export compliance)

### Step 2: Configure EAS Build

**File**: `eas.json`

```json
{
  "build": {
    "production": {
      "ios": {
        "buildConfiguration": "Release",
        "autoIncrement": true
      }
    }
  },
  "submit": {
    "production": {
      "ios": {
        "appleId": "your-apple-id@email.com",
        "ascAppId": "your-app-store-connect-app-id",
        "appleTeamId": "YOUR_TEAM_ID"
      }
    }
  }
}
```

**Configuration Options**:

- **buildConfiguration**: "Release" for production builds
- **autoIncrement**: Automatically increments build number
- **appleId**: Your Apple ID email
- **ascAppId**: Found in App Store Connect (numeric ID)
- **appleTeamId**: Found in Apple Developer Portal

### Step 3: Update Package.json

```json
{
  "name": "docsshelf",
  "version": "1.0.0",
  "scripts": {
    "ios:build": "eas build --platform ios --profile production",
    "ios:submit": "eas submit --platform ios --profile production"
  }
}
```

**Explanation**: Creates convenient npm scripts for building and submitting.

---

## Creating Release Build

### Option A: Using EAS Build (Recommended)

#### Step 1: Install EAS CLI

```bash
npm install -g eas-cli
```

#### Step 2: Login to EAS

```bash
eas login
```

Enter your Expo credentials.

#### Step 3: Configure Project

```bash
eas build:configure
```

**What this does**:
- Links project to EAS
- Creates/updates `eas.json`
- Prompts for Apple Developer Team ID

#### Step 4: Start iOS Build

```bash
eas build --platform ios --profile production
```

**Build Process**:
1. Code uploaded to EAS servers
2. Dependencies installed
3. iOS project generated
4. You'll be prompted for credentials:
   - **Option 1**: Let EAS manage (recommended)
   - **Option 2**: Provide your own certificates
5. App compiled and signed
6. IPA file generated

**Duration**: 15-30 minutes

**Output**: Download link for `.ipa` file

#### Step 5: Monitor Build

- Visit [EAS Build Dashboard](https://expo.dev/accounts/[your-account]/projects/[project]/builds)
- View build logs in real-time
- Build status: queued → in progress → success/error

**If build fails**:
- Check build logs for errors
- Common issues: missing dependencies, configuration errors
- Fix and rebuild

### Option B: Local Build with Xcode

**Requirement**: Must have Mac with Xcode installed

#### Step 1: Generate iOS Project

```bash
npx expo prebuild --platform ios
```

**Explanation**: Generates native iOS project in `ios/` directory.

**What gets generated**:
- `ios/DocsShelf.xcworkspace`
- Native project files
- Podfile for dependencies

#### Step 2: Install iOS Dependencies

```bash
cd ios
pod install
```

**Explanation**: CocoaPods installs native iOS dependencies.

#### Step 3: Open in Xcode

```bash
open ios/DocsShelf.xcworkspace
```

**⚠️ Important**: Always open `.xcworkspace`, NOT `.xcodeproj`

#### Step 4: Configure Signing

**In Xcode**:
1. Select project in navigator
2. Select target: **DocsShelf**
3. Go to **"Signing & Capabilities"** tab
4. **Team**: Select your Apple Developer team
5. **Provisioning Profile**: Select "Automatic" or choose manual profile
6. **Signing Certificate**: Should auto-select Distribution certificate

**Automatic Signing** (Easier):
- Xcode manages certificates and profiles
- Recommended for most developers

**Manual Signing** (Advanced):
- You control specific certificates and profiles
- Needed for complex configurations

#### Step 5: Select Build Scheme

1. Top toolbar: Select **"Any iOS Device (arm64)"**
2. Scheme: Select **"DocsShelf"**
3. Build configuration: **"Release"**

**Explanation**: 
- "Any iOS Device" creates universal binary
- "Release" configuration optimizes for production

#### Step 6: Archive Build

1. Menu: **Product > Archive**
2. Wait for build to complete (10-20 minutes)
3. Xcode Organizer opens automatically

**Build Process**:
- Compiles all source code
- Links frameworks and libraries
- Optimizes assets
- Signs app with certificate
- Creates archive (.xcarchive)

#### Step 7: Validate Archive

**In Organizer**:
1. Select your archive
2. Click **"Validate App"**
3. Choose distribution method: **App Store Connect**
4. Select options:
   - [ ] Upload symbols for crash reporting (recommended)
   - [ ] Manage Version and Build Number
5. Click **"Validate"**
6. Wait for validation (2-5 minutes)

**Validation checks**:
- Code signing validity
- Entitlements correctness
- API usage compliance
- Asset requirements

**If validation fails**: Review errors and fix before proceeding.

#### Step 8: Export IPA (Optional)

To save IPA locally:
1. Click **"Distribute App"**
2. Select **"Ad Hoc"** or **"Development"**
3. Choose export options
4. Click **"Export"**
5. Save IPA file

**When to export**:
- Testing on specific devices
- Keeping backup of build
- Manual upload later

---

## Testing the Release Build

### Step 1: TestFlight Internal Testing

TestFlight allows you to test before public release.

**Setup**:
1. Upload build to App Store Connect (covered in next section)
2. Navigate to **"TestFlight"** tab
3. Build automatically appears after processing
4. Add internal testers (up to 100 testers)
5. Testers receive email invitation
6. Testers install via TestFlight app

**Testing Timeline**:
- Build processing: 10-30 minutes
- Immediate availability for internal testers
- No App Review required for internal testing

### Step 2: TestFlight External Testing

**For broader testing**:
1. Add external testers (up to 10,000)
2. Create external test group
3. Add testers via email or public link
4. Submit for Beta App Review (required)
5. Review takes 24-48 hours

**Beta App Review checks**:
- Basic functionality
- No crashes on launch
- Metadata compliance
- No obvious policy violations

### Step 3: Testing Checklist

Test thoroughly before submission:

**Functionality**:
- [ ] App launches successfully
- [ ] All features work correctly
- [ ] No crashes or freezes
- [ ] Smooth animations and transitions
- [ ] Data persists correctly

**UI/UX**:
- [ ] Interface looks correct on all supported devices
- [ ] Text is readable (accessibility)
- [ ] Dark mode works (if supported)
- [ ] Landscape orientation (if supported)
- [ ] iPad optimization (if supported)

**Permissions**:
- [ ] Permission dialogs show correct descriptions
- [ ] App handles permission denials gracefully
- [ ] No crashes when permissions denied

**Performance**:
- [ ] App responsive (no lag)
- [ ] Acceptable memory usage
- [ ] Battery consumption reasonable
- [ ] Network calls handle errors properly

**iOS Specific**:
- [ ] Back swipe gesture works
- [ ] Keyboard dismisses properly
- [ ] Safe area insets respected (notch devices)
- [ ] App works on older iOS versions (if supported)

### Step 4: Device Testing Matrix

Test on various devices:
- **iPhone SE** (smallest screen)
- **iPhone 13/14** (standard size)
- **iPhone 14 Pro Max** (largest phone)
- **iPad** (tablet optimization)
- **Various iOS versions** (minimum supported to latest)

**Can't access physical devices?**
- Use Xcode Simulator
- Use TestFlight with friends/family
- Rent device time from testing services

---

## App Store Connect Setup

### Step 1: Access App Store Connect

1. Go to [App Store Connect](https://appstoreconnect.apple.com)
2. Sign in with Apple Developer account
3. Navigate to **"My Apps"**

### Step 2: Create New App

1. Click **"+"** button
2. Select **"New App"**
3. Fill in form:
   - **Platform**: iOS
   - **Name**: DocsShelf (must be unique on App Store)
   - **Primary Language**: English (U.S.)
   - **Bundle ID**: Select `com.yourcompany.docsshelf`
   - **SKU**: Unique identifier (e.g., `docsshelf-001`)
   - **User Access**: Full Access or Limited Access
4. Click **"Create"**

**Field Explanations**:

- **Name**: App name shown on App Store (can be different from display name)
- **Bundle ID**: Must match your app's bundle identifier
- **SKU**: Internal tracking number, not visible to users
- **User Access**: Controls who can see this app in your team

### Step 3: Fill App Information

Navigate to **"App Information"** section:

#### General Information

**App Name**: DocsShelf (30 characters max)
- Shown under app icon
- Keep short and memorable

**Subtitle**: Secure Document Management (30 characters max)
- Brief tagline
- Appears under app name in search

**Privacy Policy URL**: https://yourwebsite.com/privacy (Required)
- Must be publicly accessible
- Required by App Store
- Should explain data practices

**Category**:
- **Primary**: Productivity
- **Secondary** (optional): Business

**Content Rights**: 
- Select if your app contains third-party content

#### Age Rating

Click **"Edit"** next to Age Rating:

Answer questionnaire honestly:
- **Violence**: None
- **Sexual content**: None  
- **Profanity**: None
- **Drugs/Alcohol**: None
- **Gambling**: None
- **Horror/Fear**: None
- **Mature themes**: None
- **Web content**: None (if no web browsing)
- **Privacy**: Select if app accesses user data
- **User Generated Content**: No
- **Location**: Yes/No (if using location services)

**Result**: Based on answers, Apple assigns rating (4+, 9+, 12+, 17+)
DocsShelf should receive **4+** rating.

---

## App Listing Creation

### Step 1: Prepare Marketing Assets

You'll need screenshots for required device sizes.

#### Required Screenshot Sizes

**iPhone 6.7" Display** (iPhone 14 Pro Max, 15 Pro Max):
- Portrait: 1290 x 2796 pixels
- Landscape: 2796 x 1290 pixels
- Required: Minimum 3 screenshots, maximum 10

**iPhone 6.5" Display** (iPhone 11 Pro Max, XS Max):
- Portrait: 1242 x 2688 pixels
- Landscape: 2688 x 1242 pixels
- Required: Minimum 3 screenshots, maximum 10

**iPhone 5.5" Display** (iPhone 8 Plus, 7 Plus) - Optional:
- Portrait: 1242 x 2208 pixels
- Landscape: 2208 x 1242 pixels

**iPad Pro 12.9" Display** (3rd gen+):
- Portrait: 2048 x 2732 pixels
- Landscape: 2732 x 2048 pixels
- Required if supporting iPad: Minimum 3 screenshots

**Creating Screenshots**:

**Option 1 - Use Simulator**:
```bash
# Launch simulator for iPhone 14 Pro Max
xcrun simctl boot "iPhone 14 Pro Max"
open -a Simulator

# Take screenshot: Cmd + S
# Screenshots saved to Desktop
```

**Option 2 - From Physical Device**:
- Take screenshots on device
- Transfer via AirDrop or cable
- Ensure correct dimensions

**Option 3 - Design Tools**:
- Use Figma, Sketch, or Photoshop
- Design promotional screenshots with:
  - App UI
  - Feature highlights
  - Text overlays explaining features

**Screenshot Best Practices**:
- Show actual app functionality
- Use high contrast for text
- Keep consistent color scheme
- Highlight key features
- First screenshot is most important (appears in search)

#### App Preview Videos (Optional)

**Specifications**:
- Format: M4V, MP4, or MOV
- Resolution: Same as screenshot sizes
- Duration: 15-30 seconds
- File size: Up to 500 MB
- Orientation: Portrait or landscape (match screenshots)

**Content Guidelines**:
- Show actual app footage (no animations/effects that aren't in app)
- Include audio (optional but recommended)
- Focus on key features
- Keep concise and engaging

### Step 2: Version Information

Navigate to app version (e.g., **"1.0 Prepare for Submission"**):

#### What's New in This Version

**Release Notes** (4000 characters max):
```
🎉 Welcome to DocsShelf v1.0!

DocsShelf is your secure, private document management solution with military-grade encryption.

✨ KEY FEATURES:

🔐 MAXIMUM SECURITY
• Military-grade AES-256 encryption
• Argon2id password hashing
• Face ID / Touch ID authentication
• All data stored locally on your device
• No cloud sync - your documents stay private

📁 SMART ORGANIZATION  
• Intuitive folder structure
• Powerful search functionality
• Custom tags and categories
• Quick document scanning

📱 BEAUTIFUL & INTUITIVE
• Clean, modern design
• Optimized for iPhone and iPad
• Dark mode support
• Smooth, responsive interface
• VoiceOver accessibility support

🎯 PERFECT FOR:
• Personal documents (ID, passport, certificates)
• Financial records (receipts, tax documents)
• Medical records and prescriptions
• Legal documents and contracts
• Any sensitive information

Your privacy is our priority. DocsShelf keeps everything local - no accounts, no cloud storage, no tracking.

Download now and take control of your document security! 🚀

Questions? Contact us at support@docsshelf.com
```

**Writing Good Release Notes**:
- Start with excitement (emojis okay for first release)
- Highlight key features clearly
- Use bullet points for readability
- Emphasize privacy and security
- Include contact information
- Keep professional but friendly tone

**For updates**, focus on:
- New features added
- Bugs fixed
- Improvements made
- Known issues addressed

#### Promotional Text (Optional)

**170 characters max** - appears above description:
```
Secure document storage with military-grade encryption. Keep your important documents safe and organized. Your data never leaves your device.
```

**Purpose**: 
- Quickly updatable without new version
- Highlights promotions or seasonal features
- Appears before main description

#### Description

**4000 characters max** - main app description:

```
DocsShelf - Your Private Document Vault

Take control of your document security with DocsShelf, the privacy-first document management app. Store, organize, and access your important documents with confidence, knowing they're protected by military-grade encryption.

🔒 UNCOMPROMISING SECURITY

Your sensitive documents deserve the highest level of protection:

• Military-grade AES-256 encryption for all stored documents
• Argon2id password hashing - industry-leading security
• Biometric authentication with Face ID and Touch ID
• Zero-knowledge architecture - only you can access your data
• All data stored locally on your device
• No cloud storage means no data breaches

Your documents never leave your device unless you explicitly share them.

📁 POWERFUL ORGANIZATION

Managing documents has never been easier:

• Create unlimited folders and subfolders
• Tag documents for quick filtering
• Lightning-fast search finds documents instantly
• Sort by name, date, type, or custom criteria
• Batch operations for efficiency
• Favorites for quick access to important documents

📸 ADVANCED DOCUMENT SCANNING

Turn paper documents into secure digital files:

• High-quality document scanning with automatic edge detection
• Multi-page document support
• Automatic perspective correction
• Built-in image enhancement
• OCR text recognition (coming soon)
• Import from Photos, Files, or Camera

🎨 BEAUTIFUL, INTUITIVE DESIGN

DocsShelf combines powerful features with elegant design:

• Clean, modern interface that's easy to navigate
• Optimized for both iPhone and iPad
• Full support for Dark Mode
• Smooth animations and transitions
• Accessibility features including VoiceOver
• Adapts to your preferred text size

📱 OPTIMIZED FOR ALL DEVICES

Whether you're on iPhone or iPad, DocsShelf adapts perfectly:

• Universal app - one purchase works everywhere
• iPad optimization with split-view support
• Works seamlessly across all your iOS devices
• Responsive design for all screen sizes
• Landscape and portrait orientation support

🎯 PERFECT FOR

DocsShelf is ideal for anyone who needs to securely store important documents:

PERSONAL USE
• Identification documents (passport, driver's license, insurance cards)
• Certificates (birth, marriage, education)
• Travel documents (visas, tickets, itineraries)
• Warranties and receipts

FINANCIAL
• Tax documents and returns
• Bank statements and records
• Investment documents
• Receipts for expenses

MEDICAL
• Health records and test results
• Prescriptions and medication info
• Insurance cards and documents
• Vaccination records

LEGAL
• Contracts and agreements
• Property documents
• Legal correspondence
• Estate planning documents

💪 WHY CHOOSE DOCSSHELF?

✓ Complete Privacy - No accounts, no tracking, no data collection
✓ One-Time Purchase - No subscriptions or hidden fees
✓ Offline Access - Works perfectly without internet
✓ Regular Updates - Continuously improving with new features
✓ Responsive Support - We're here to help
✓ Made with Care - Built by a small team that values your privacy

🔐 YOUR DATA, YOUR CONTROL

Unlike cloud-based solutions, DocsShelf gives you complete control:

• Documents stored only on your device
• No data sent to external servers
• No user accounts or registration required
• Export your data anytime in standard formats
• Delete everything instantly if needed

We believe your documents are YOUR business, not ours.

🆘 SUPPORT & FEEDBACK

We love hearing from our users! If you have questions, suggestions, or need assistance:

• Email: support@docsshelf.com
• Visit our website for FAQs and guides
• Rate and review to help others discover DocsShelf

Download DocsShelf today and experience peace of mind knowing your documents are secure, organized, and always accessible - all while maintaining complete privacy.

Your documents. Your device. Your privacy.
```

**Description Writing Tips**:
- Front-load important information
- Use headings and sections for scannability  
- Include keywords naturally (don't keyword stuff)
- Explain benefits, not just features
- Address user concerns (privacy, security)
- Include use cases users can relate to
- End with clear call to action

#### Keywords

**100 characters total** (comma-separated):
```
document,secure,vault,encryption,privacy,storage,scan,organize,manager,safe
```

**Keyword Strategy**:
- Research what users search for
- Include variations (e.g., "doc" and "document")
- Balance specific and general terms
- Don't repeat app name (Apple already indexes it)
- Check competitors' keywords for ideas
- Update based on search performance data

**Keyword Research Tools**:
- App Store search suggestions
- Competitor app titles and subtitles
- Google Trends
- App Annie / Sensor Tower

#### Support URL

Required: https://yourwebsite.com/support

**Should include**:
- FAQ section
- Contact form
- Troubleshooting guides
- Feature documentation

#### Marketing URL (Optional)

Optional: https://yourwebsite.com

Your main product website.

### Step 3: Upload Screenshots

For each required device size:

1. Click **"+"** under device screenshots
2. Select images (up to 10 per device size)
3. Drag to reorder (first screenshot is most important)
4. Preview how they'll appear

**Order matters**:
- First 2-3 screenshots shown in search results
- Put your best, most compelling screenshots first
- Tell a story with the sequence

### Step 4: App Review Information

**Contact Information**:
- **First Name**: Your first name
- **Last Name**: Your last name
- **Phone Number**: Valid phone number with country code
- **Email**: Your email address

**Purpose**: Apple may contact you during review if issues found.

**Notes** (optional):
Add any information to help reviewers:

```
DocsShelf is a local document storage app with encryption.

TEST ACCOUNT (if applicable):
Username: reviewer@docsshelf.com
Password: ReviewPass123!

TESTING INSTRUCTIONS:
1. Create a master password on first launch
2. Grant camera permission to test document scanning
3. Grant Face ID/Touch ID permission for biometric auth
4. Sample documents can be added via "+" button

FEATURES TO TEST:
- Document creation and viewing
- Folder organization
- Search functionality
- Document scanning (requires camera)
- Biometric authentication
- Settings and preferences

All data is stored locally on the device. No internet connection required.

If you have any questions, please contact: support@docsshelf.com
```

**Why provide notes**:
- Speeds up review process
- Prevents rejection due to misunderstanding
- Shows professionalism
- Helps reviewers test properly

**Attachment** (if needed):
- Upload demo video showing app usage
- Include if app has complex features
- Helps reviewers understand your app

### Step 5: Version Release

**Choose release option**:

1. **Manually release this version**
   - You control exact release time
   - Release after reviewing store listing
   - Good for coordinating with marketing

2. **Automatically release this version**
   - App goes live immediately after approval
   - No further action needed
   - Good for urgent updates

3. **Schedule release**
   - Choose specific date and time
   - Coordinate with events or launches
   - Requires approval before scheduled date

**Recommendation**: For first release, choose "Manually release" to review everything first.

---

## Upload and Submit

### Step 1: Upload Build

#### Option A: Upload from Xcode

**After archiving in Xcode**:

1. Xcode Organizer opens with your archive
2. Click **"Distribute App"**
3. Select **"App Store Connect"**
4. Click **"Next"**
5. Select **"Upload"**
6. Choose options:
   - [x] **Upload your app's symbols** (recommended - enables crash reporting)
   - [ ] **Manage Version and Build Number** (optional - let Xcode handle)
7. Click **"Next"**
8. Review summary
9. Click **"Upload"**
10. Wait for upload (5-15 minutes depending on app size)

**After upload**:
- Build appears in App Store Connect after processing
- Processing takes 10-30 minutes
- You'll receive email when ready

#### Option B: Upload via EAS

```bash
eas submit --platform ios --profile production
```

**What happens**:
1. EAS downloads your build
2. Uploads to App Store Connect
3. Shows upload progress
4. Confirms successful submission

**Prerequisites**:
- Build must exist in EAS
- App must exist in App Store Connect
- Correct credentials configured in `eas.json`

#### Option C: Manual Upload with Transporter

**Using Transporter app**:

1. Download [Transporter](https://apps.apple.com/app/transporter/id1450874784) from Mac App Store
2. Open Transporter
3. Sign in with Apple ID
4. Drag and drop your `.ipa` file
5. Click **"Deliver"**
6. Wait for upload and processing

**Advantage**: Independent of Xcode or EAS

### Step 2: Select Build for Submission

**In App Store Connect**:

1. Navigate to your app
2. Go to version preparation (e.g., "1.0")
3. Scroll to **"Build"** section
4. Click **"Select a build before you submit your app"**
5. Wait if "Processing" appears (builds need to finish processing)
6. Once available, click **"+"** next to your build
7. Select the build you just uploaded
8. Click **"Done"**

**Build Information Shown**:
- Version number (e.g., 1.0.0)
- Build number (e.g., 1)
- Upload date
- File size
- Supported devices
- SDK version

### Step 3: Export Compliance

**Question**: "Does your app use encryption?"

**Answer**:
- **Yes**: If app uses HTTPS, includes encryption, or handles sensitive data
- **No**: Only if app has zero encryption (very rare)

For DocsShelf (uses encryption): Select **"Yes"**

**Follow-up questions**:

1. **"Does your app qualify for any exemptions?"**
   - **Yes** if only using standard iOS encryption or HTTPS
   - Select: "Uses encryption exclusively for non-restricted purposes"

2. **"Does your app contain third-party encryption?"**
   - **No** if using only iOS built-in encryption
   - **Yes** if using third-party libraries (e.g., OpenSSL)

3. **Export Compliance Document**
   - Usually not needed for standard iOS encryption
   - Required if using custom/restricted cryptography

**Typical answer for most apps**:
```
✓ App uses encryption
✓ Qualifies for exemption (standard encryption)
✓ No third-party encryption
```

**Important**: Answer honestly. False answers can result in rejection or legal issues.

### Step 4: Advertising Identifier (IDFA)

**Question**: "Does this app use the Advertising Identifier (IDFA)?"

**Answer**:
- **Yes**: If app shows ads or tracks users for advertising
- **No**: If no ads or user tracking

For DocsShelf (no ads): Select **"No"**

**If Yes**, must specify usage:
- [ ] Serve ads within the app
- [ ] Attribute app installation to a previously served ad
- [ ] Attribute an action within the app to a previously served ad
- [ ] Limit Ad Tracking setting in iOS

### Step 5: Content Rights

**Question**: "Does your app contain, display, or access third-party content?"

**Answer**:
- **Yes**: If app shows content from other sources (APIs, user-generated content)
- **No**: If app only uses content you created or have rights to

**If Yes**:
- [ ] I have the rights to use this third-party content
- Explain what content and how you have rights

### Step 6: Submit for Review

**Final checklist before submission**:

- [ ] App name and subtitle are correct
- [ ] Description is complete and compelling
- [ ] Keywords are optimized
- [ ] Screenshots uploaded for all required sizes
- [ ] App preview video uploaded (if applicable)
- [ ] App icon is 1024x1024 PNG
- [ ] Build selected and processed
- [ ] Version release option chosen
- [ ] Contact information correct
- [ ] App review notes added
- [ ] Privacy policy URL working
- [ ] Support URL working
- [ ] Age rating appropriate
- [ ] Export compliance answered
- [ ] IDFA usage declared
- [ ] Content rights declared

**Submit**:
1. Click **"Save"** to save all changes
2. Click **"Add for Review"** or **"Submit for Review"**
3. Confirm submission
4. Status changes to **"Waiting for Review"**

**After submission**:
- Cannot edit app information until review completes
- Can withdraw from review if needed
- Receive email confirmation of submission

---

## Review Process

### Step 1: Understanding Review Status

**Status progression**:

1. **Prepare for Submission**
   - Initial state
   - Still editing app information
   - Build not yet selected

2. **Waiting for Review**
   - Submitted and in queue
   - Cannot edit
   - Typical wait: 24-48 hours

3. **In Review**
   - Apple team is testing your app
   - Duration: 1-24 hours typically
   - May receive questions from reviewers

4. **Pending Developer Release**
   - App approved!
   - Waiting for you to release (if manual release selected)
   - Can release immediately or schedule

5. **Ready for Sale**
   - App is live on App Store
   - Users can download
   - Congratulations! 🎉

**Other possible statuses**:

- **Rejected**: App violates guidelines - see rejection reasons
- **Metadata Rejected**: Store listing has issues, but app is approved
- **Developer Rejected**: You withdrew app from review
- **Invalid Binary**: Build has technical issues

### Step 2: Review Timeline

**Typical timeline**:
- **Submission to In Review**: 24-48 hours
- **In Review**: 1-24 hours
- **Total**: 1-3 days on average

**Factors affecting timeline**:
- Time of submission (avoid weekends/holidays)
- App complexity
- First submission vs update
- Policy changes or increased scrutiny
- Whether additional information needed

**Expedited Review**:
- Available for critical issues (crashes, security bugs)
- Request through App Store Connect
- Limited to 2 requests per year
- Requires justification
- Not guaranteed

### Step 3: Common Rejection Reasons

#### 1. Incomplete Information

**Issue**: Missing or incorrect metadata

**Examples**:
- Missing screenshots for required devices
- Invalid privacy policy URL
- Incomplete app description
- Contact information not working

**Solution**: Complete all required fields properly

#### 2. Crashes and Bugs

**Issue**: App crashes on launch or during testing

**Examples**:
- Crash on specific iOS version
- Crash when permission denied
- Network error not handled
- Memory issues

**Solution**: Test thoroughly on multiple devices and iOS versions

#### 3. Broken Links

**Issue**: URLs in app or metadata don't work

**Examples**:
- Privacy policy URL returns 404
- Support URL broken
- In-app links don't open

**Solution**: Test all URLs before submission

#### 4. Misleading

**Issue**: App functionality doesn't match description

**Examples**:
- Features in screenshots not in app
- Description claims features that don't exist
- App preview shows different app

**Solution**: Ensure marketing materials match actual app

#### 5. Performance Issues

**Issue**: App performs poorly

**Examples**:
- Extremely slow to load
- Laggy animations
- Excessive battery drain
- Takes too much storage

**Solution**: Optimize performance before submitting

#### 6. Privacy Issues

**Issue**: Privacy policy or data handling concerns

**Examples**:
- No privacy policy for app collecting data
- Collecting data without user consent
- Missing usage description in Info.plist
- Accessing unnecessary permissions

**Solution**: Be transparent about data practices

#### 7. Design Issues

**Issue**: App doesn't follow Human Interface Guidelines

**Examples**:
- Non-standard UI elements
- Poor accessibility
- Confusing navigation
- Layout issues on certain devices

**Solution**: Follow [Apple's Human Interface Guidelines](https://developer.apple.com/design/human-interface-guidelines/)

### Step 4: Responding to Rejection

**If app is rejected**:

1. **Read rejection message carefully**
   - Apple provides specific reasons
   - Often includes screenshots
   - May include suggested fixes

2. **Fix all issues mentioned**
   - Address every point in rejection
   - Don't ignore any feedback
   - Test fixes thoroughly

3. **Update Resolution Center**
   - Go to **"App Review" > "Resolution Center"**
   - Reply to Apple's message
   - Explain what you fixed
   - Be professional and courteous

4. **Submit new build** (if code changes needed)
   - Increment build number
   - Upload new build
   - Select new build in version

5. **Resubmit for review**
   - Usually faster second review
   - Often reviewed by same person

**Response example**:
```
Thank you for your review and feedback.

We have addressed all the issues mentioned:

1. Privacy Policy: We have added a comprehensive privacy policy at https://docsshelf.com/privacy that explains our data practices.

2. Crash on Permission Denial: We have fixed the crash that occurred when camera permission was denied. The app now handles this gracefully with a user-friendly message.

3. Usage Description: We have updated NSCameraUsageDescription in Info.plist with a more detailed explanation.

We have thoroughly tested these fixes on iPhone 12, iPhone 14 Pro Max, and iPad Pro running iOS 16 and iOS 17.

Please let us know if you need any additional information.

Best regards,
DocsShelf Team
```

### Step 5: Appeal Process

**If you believe rejection is unfair**:

1. **Review rejection carefully**
   - Ensure you understand Apple's concern
   - Check App Store Guidelines
   - Verify you're compliant

2. **Appeal through Resolution Center**
   - Provide detailed explanation
   - Include evidence of compliance
   - Reference specific guidelines
   - Be respectful and professional

3. **Contact App Review Board**
   - For serious disputes
   - When standard appeal doesn't work
   - Provide comprehensive documentation

**Appeal tips**:
- Be professional, never confrontational
- Provide evidence, not just opinions
- Reference specific guideline numbers
- Show how other approved apps do similar things
- Be patient - appeals take time

---

## Post-Release

### Step 1: Release the App

**If you selected "Manual Release"**:

1. Navigate to your app in App Store Connect
2. Status shows **"Pending Developer Release"**
3. Click **"Release This Version"**
4. App goes live within 24 hours (usually within 1-2 hours)

**App Store propagation**:
- USA: 15-30 minutes
- Other countries: Up to 24 hours
- Search indexing: 24-48 hours

### Step 2: Verify Store Listing

**Check your live listing**:

1. Open App Store app on iOS device
2. Search for "DocsShelf" (your app name)
3. Verify everything looks correct:
   - [ ] App icon displays properly
   - [ ] Screenshots look good
   - [ ] Description formatted correctly
   - [ ] Price/Free shows correctly
   - [ ] "Get" button works
   - [ ] App downloads and installs

**Share your app**:
- Direct link: `https://apps.apple.com/app/id[YOUR_APP_ID]`
- Find app ID in App Store Connect URL

### Step 3: Monitor App Analytics

**App Store Connect Analytics**:

Navigate to **"App Analytics"**:

**Key Metrics**:

1. **Impressions**
   - How many times your app was viewed in App Store
   - Product page views
   - Search result appearances

2. **Downloads**
   - Total installs
   - Updates vs new installs
   - Redownloads

3. **Sales** (for paid apps)
   - Revenue
   - Units sold
   - Proceeds

4. **Retention**
   - Day 1, 7, 30 retention rates
   - Returning users
   - Active devices

5. **Crashes**
   - Crash-free percentage (aim for >99%)
   - Crash reports and stack traces
   - Affected users

6. **App Store Views**
   - Source types (search, browse, referral)
   - Territory performance
   - Conversion rate (views to downloads)

**Access crashes**:
- **Xcode > Window > Organizer > Crashes**
- Download crash logs
- Symbolicate for readable stack traces
- Fix critical crashes immediately

### Step 4: Respond to Reviews

**Importance of reviews**:
- Affect App Store ranking
- Influence potential users
- Provide valuable feedback

**Best practices**:

1. **Respond quickly**
   - Within 24-48 hours
   - Shows you care about users

2. **Be professional**
   - Thank users for feedback
   - Never argue or be defensive
   - Stay positive

3. **Acknowledge issues**
   - If bug reported, acknowledge and promise fix
   - If user error, explain kindly
   - If feature request, consider it

4. **Response templates**:

**Positive review**:
```
Thank you so much for the 5-star review! We're thrilled that DocsShelf is helping you stay organized. If you ever need assistance, reach out at support@docsshelf.com. 😊
```

**Bug report**:
```
Thank you for reporting this issue. We're sorry for the inconvenience. Our team is investigating and will release a fix in the next update. Please contact support@docsshelf.com with more details so we can help sooner.
```

**Feature request**:
```
Great suggestion! We're always looking to improve DocsShelf. We've added this to our feature roadmap and will consider it for a future release. Thank you for your feedback!
```

**Negative review**:
```
We're sorry DocsShelf didn't meet your expectations. We'd love to understand what went wrong and make it right. Please email us at support@docsshelf.com so we can help resolve this.
```

### Step 5: Plan Updates

**Update strategy**:

**Bug Fix Updates** (1.0.1, 1.0.2):
- Release quickly for critical bugs
- Minimal changes to reduce risk
- Focus on stability

**Minor Updates** (1.1.0, 1.2.0):
- New features
- Improvements
- Non-breaking changes
- Monthly or bi-monthly cadence

**Major Updates** (2.0.0):
- Significant redesigns
- Major new functionality
- May break backwards compatibility
- Annual or semi-annual

**Update best practices**:
- Fix critical bugs within 1 week
- Release feature updates monthly
- Don't rush - test thoroughly
- Communicate changes clearly in release notes
- Consider phased release (gradual rollout)

### Step 6: Promote Your App

**App Store Optimization (ASO)**:

1. **Keywords**
   - Monitor keyword performance
   - Update based on search data
   - A/B test different keywords

2. **Screenshots**
   - Update to showcase new features
   - Seasonal variations
   - A/B test designs

3. **Icon**
   - Recognizable and memorable
   - Stands out in search results
   - Consider seasonal variants

4. **Reviews**
   - Prompt satisfied users to review
   - Use `SKStoreReviewController` (not spammy)
   - Time prompts strategically

**Marketing channels**:
- Website with press kit
- Social media presence
- Product Hunt launch
- Reddit communities (appropriate subreddits)
- Tech blogs and reviewers
- Email newsletter
- Paid advertising (Apple Search Ads)

### Step 7: Phased Release (For Updates)

**What is phased release?**
- Gradual rollout to users over 7 days
- Day 1: 1% of users
- Day 2: 2% of users
- Day 3: 5% of users
- Day 4: 10% of users
- Day 5: 20% of users
- Day 6: 50% of users
- Day 7: 100% of users

**Enable phased release**:
1. App Store Connect > Version
2. **Phased Release**: Toggle ON
3. Submit update

**Benefits**:
- Catch issues before all users affected
- Monitor crash rate with small percentage first
- Can pause if critical bug found
- Reduce server load (if applicable)

**Pause phased release**:
- Click "Pause Phased Release" in App Store Connect
- Stops at current percentage
- Resume or release to all users later

---

## Publishing Subsequent Updates

### Step 1: Create New Version

**In App Store Connect**:

1. Navigate to your app
2. Click **"+"** next to "iOS App"
3. Enter new version number (e.g., 1.1.0)
4. Click **"Create"**

### Step 2: Update Version Information

**Update app.json**:
```json
{
  "expo": {
    "version": "1.1.0",
    "ios": {
      "buildNumber": "2"  // Increment from previous
    }
  }
}
```

**Version number rules**:
- **Patch** (1.0.1): Bug fixes only
- **Minor** (1.1.0): New features, backwards compatible
- **Major** (2.0.0): Breaking changes

**Build number**: Must increment (can't reuse old numbers)

### Step 3: Write Release Notes

Focus on what's new:

```
What's New in Version 1.1.0:

✨ NEW FEATURES
• Cloud backup with end-to-end encryption (optional)
• Widget support for quick document access
• PDF annotation tools
• Dark mode improvements

🐛 BUG FIXES
• Fixed crash when scanning multi-page documents
• Improved search performance
• Resolved issue with document sorting
• Fixed Face ID authentication delay

💪 IMPROVEMENTS
• Faster app launch time
• Reduced memory usage
• Better iPad keyboard support
• Enhanced accessibility features

Thank you for using DocsShelf! Questions? Email support@docsshelf.com
```

### Step 4: Build and Upload

Same process as initial release:

**EAS Build**:
```bash
eas build --platform ios --profile production
eas submit --platform ios --profile production
```

**Or Xcode**:
1. Update version/build in Xcode
2. Archive
3. Upload to App Store Connect

### Step 5: Submit Update

1. Select new build
2. Update release notes
3. Change screenshots if needed
4. Submit for review

**Update review**:
- Usually faster than initial review (1-2 days)
- Especially if minor changes
- Still possible to be rejected

---

## Advanced Topics

### App Store Today Tab Feature

**How to get featured**:
- Build high-quality, innovative app
- Submit for consideration: [Contact App Store team](mailto:appstorepromotion@apple.com)
- Time launches with Apple events
- No guarantee, but worth trying

**Application includes**:
- App details
- What makes it unique
- Screenshots and videos
- Press coverage

### App Store Search Ads

**Paid advertising in App Store**:

1. Go to [Apple Search Ads](https://searchads.apple.com)
2. Create campaign
3. Set budget and bids
4. Choose keywords
5. Monitor performance

**Advantages**:
- Appear at top of search results
- Pay per install (CPI model)
- Highly targeted
- Good for launch boost

### Localization

**Support multiple languages**:

1. **In Xcode**: Add localizations
2. **App Store Connect**: Add localizations
3. Translate:
   - App name
   - Description
   - Screenshots
   - Keywords
   - What's New

**Top markets to consider**:
- English (US, UK, Australia, Canada)
- Spanish (Spain, Latin America)
- French
- German
- Japanese
- Chinese (Simplified, Traditional)
- Korean

### App Bundles

**Offer multiple apps together**:
1. Create multiple apps
2. App Store Connect > "My Apps" > "+"
3. Select "New App Bundle"
4. Add apps to bundle
5. Set bundle pricing (usually discounted)

### In-App Purchases (If Applicable)

**Setup**:
1. App Store Connect > App > "In-App Purchases"
2. Create IAP products:
   - Consumable
   - Non-consumable
   - Auto-renewable subscription
   - Non-renewing subscription
3. Implement StoreKit in app
4. Test with sandbox accounts
5. Submit with app for review

---

## Troubleshooting

### Build Processing Stuck

**Issue**: Build stuck at "Processing" for hours

**Solutions**:
1. Wait up to 48 hours (usually resolves)
2. Check email for issues from Apple
3. Ensure build was properly signed
4. Try uploading new build
5. Contact Apple Developer Support if persists

### Organizer Won't Upload

**Issue**: Xcode Organizer shows error during upload

**Solutions**:
1. Verify Apple ID credentials
2. Check team membership is active
3. Ensure certificates not expired
4. Try using Transporter app instead
5. Check firewall settings
6. Update Xcode to latest version

### Missing Compliance

**Issue**: Export compliance questions not appearing

**Solutions**:
1. May appear after selecting build
2. Check email from Apple
3. Manually set in `Info.plist`:
```xml
<key>ITSAppUsesNonExemptEncryption</key>
<false/>
```

### TestFlight Not Working

**Issue**: Testers can't install app

**Solutions**:
1. Verify testers accepted invitation
2. Ensure testers have TestFlight app installed
3. Check build finished processing
4. Verify build not expired (90 days)
5. Add testers' devices to provisioning profile (if not App Store profile)

### App Size Too Large

**Issue**: App over 200MB (cellular download limit)

**Solutions**:
1. Enable App Thinning (automatic with AAB)
2. Use On-Demand Resources
3. Compress assets
4. Remove unused code and resources
5. Optimize images and media

---

## Checklist for First iOS Release

**Pre-Submission**:
- [ ] Apple Developer account active ($99/year paid)
- [ ] Bundle ID registered in Developer Portal
- [ ] App icon 1024x1024 PNG ready
- [ ] Screenshots for required device sizes
- [ ] Privacy policy published and accessible
- [ ] Support URL working
- [ ] Version 1.0.0, build 1
- [ ] Info.plist usage descriptions complete
- [ ] App tested on multiple devices and iOS versions
- [ ] No crashes or critical bugs
- [ ] Performance acceptable

**App Store Connect**:
- [ ] App created in App Store Connect
- [ ] App name unique and appropriate
- [ ] Subtitle under 30 characters
- [ ] Description compelling (up to 4000 chars)
- [ ] Keywords optimized (100 chars)
- [ ] Screenshots uploaded for all required sizes
- [ ] App preview video (optional but good)
- [ ] Category selected
- [ ] Age rating completed
- [ ] Privacy policy URL added
- [ ] Support URL added
- [ ] Contact information correct
- [ ] App review information filled
- [ ] Notes for reviewer added

**Build**:
- [ ] Build created (EAS or Xcode)
- [ ] Build uploaded to App Store Connect
- [ ] Build finished processing
- [ ] Build selected in version
- [ ] Export compliance answered
- [ ] IDFA usage declared

**Final Check**:
- [ ] All sections show green checkmarks
- [ ] Version release option selected
- [ ] Ready to submit
- [ ] Submit for review clicked

---

## Resources

### Official Apple Resources
- [App Store Connect](https://appstoreconnect.apple.com)
- [Apple Developer Portal](https://developer.apple.com)
- [App Store Review Guidelines](https://developer.apple.com/app-store/review/guidelines/)
- [Human Interface Guidelines](https://developer.apple.com/design/human-interface-guidelines/)
- [App Store Marketing Guidelines](https://developer.apple.com/app-store/marketing/guidelines/)

### Documentation
- [TestFlight Documentation](https://developer.apple.com/testflight/)
- [Xcode Help](https://help.apple.com/xcode/)
- [Submitting Apps Guide](https://developer.apple.com/app-store/submissions/)
- [App Store Connect Help](https://help.apple.com/app-store-connect/)

### Tools
- [Xcode](https://developer.apple.com/xcode/): IDE and build tools
- [Transporter](https://apps.apple.com/app/transporter/id1450874784): Upload builds
- [TestFlight](https://developer.apple.com/testflight/): Beta testing
- [Fastlane](https://fastlane.tools/): Automation
- [App Store Connect API](https://developer.apple.com/app-store-connect/api/): Programmatic access

### Design Resources
- [SF Symbols](https://developer.apple.com/sf-symbols/): System icons
- [Apple Design Resources](https://developer.apple.com/design/resources/): UI templates
- [Screenshot Templates](https://www.figma.com/@apple): Official Figma templates

### Support
- [Apple Developer Forums](https://developer.apple.com/forums/)
- [Apple Developer Support](https://developer.apple.com/support/)
- [App Review Status](https://developer.apple.com/contact/app-store/): Check review delays

---

## Appendix: Fastlane Automation (Advanced)

For developers releasing frequent updates, Fastlane automates the process.

### Install Fastlane

```bash
# Using RubyGems
sudo gem install fastlane

# Or using Homebrew
brew install fastlane
```

### Initialize Fastlane

```bash
cd ios
fastlane init
```

**Follow prompts**:
1. Select "4. Manual setup"
2. Creates `fastlane/` directory
3. Creates `Fastfile` and `Appfile`

### Configure Fastfile

**File**: `ios/fastlane/Fastfile`

```ruby
default_platform(:ios)

platform :ios do
  desc "Push a new beta build to TestFlight"
  lane :beta do
    increment_build_number(xcodeproj: "DocsShelf.xcodeproj")
    build_app(scheme: "DocsShelf")
    upload_to_testflight
  end

  desc "Push a new release build to the App Store"
  lane :release do
    increment_build_number(xcodeproj: "DocsShelf.xcodeproj")
    build_app(scheme: "DocsShelf")
    upload_to_app_store(
      submit_for_review: true,
      automatic_release: false
    )
  end
end
```

### Configure Appfile

**File**: `ios/fastlane/Appfile`

```ruby
app_identifier("com.yourcompany.docsshelf")
apple_id("your-apple-id@email.com")
team_id("YOUR_TEAM_ID")
```

### Run Fastlane

**Beta release**:
```bash
cd ios
fastlane beta
```

**Production release**:
```bash
cd ios
fastlane release
```

**Benefits**:
- Automates entire process
- Consistent builds
- Reduces human error
- Integrates with CI/CD
- Handles screenshots, metadata, etc.

---

## Conclusion

Publishing to the iOS App Store requires careful attention to detail and patience, but following this guide systematically will lead to success.

**Key Takeaways**:

1. **Mac required** for local builds (or use EAS Build)
2. **$99/year** Apple Developer account necessary
3. **Code signing** is complex - let EAS or Xcode handle it
4. **TestFlight** is excellent for testing
5. **App Store review** takes 1-3 days typically
6. **Reviews matter** - respond professionally
7. **Update regularly** to maintain engagement
8. **ASO** (App Store Optimization) is crucial for discovery

**Success Tips**:
- Test exhaustively before submission
- Write clear, honest descriptions
- Provide detailed reviewer notes
- Monitor analytics post-launch
- Respond to user feedback
- Keep app updated
- Follow Apple's guidelines strictly

Good luck with your App Store launch! 🚀📱

For questions or issues, refer to [Apple Developer Support](https://developer.apple.com/support/) or [App Store Connect Help](https://help.apple.com/app-store-connect/).
