# Build Number System

## Overview

DocsShelf uses an automated build numbering system to track releases and help identify which build is running on any device.

## Files Involved

1. **`version.json`** - Master version information file
   - `version`: Semantic version (e.g., "1.0.0")
   - `buildNumber`: Auto-incremented build number
   - `buildDate`: ISO timestamp of last build
   - `buildType`: "release" or "debug"
   - `gitCommit`: Short git commit hash
   - `features`: Array of features in this build

2. **`app.json`** - Expo configuration
   - `expo.version`: Matches version.json
   - `expo.android.versionCode`: Matches buildNumber (required for Play Store)

3. **`package.json`** - NPM package version
   - `version`: Matches version.json

## Build Scripts

### Increment Build Number Only
```bash
npm run build:increment
```
- Increments `buildNumber` by 1
- Updates `versionCode` in app.json
- Updates `buildDate` and `gitCommit`
- Use this for each new build/release

### Increment Version (Patch)
```bash
npm run version:patch
```
- Increments patch version: 1.0.0 → 1.0.1
- Also increments build number
- Use for bug fixes

### Increment Version (Minor)
```bash
npm run version:minor
```
- Increments minor version: 1.0.0 → 1.1.0
- Also increments build number
- Use for new features

### Increment Version (Major)
```bash
npm run version:major
```
- Increments major version: 1.0.0 → 2.0.0
- Also increments build number
- Use for breaking changes

## Workflow

### Before Every Build

1. **Increment the build number:**
   ```bash
   npm run build:increment
   ```

2. **Commit the version files:**
   ```bash
   git add version.json app.json package.json
   git commit -m "build: increment to build X"
   ```

3. **Build the app:**
   ```bash
   # For Android release
   cd android
   ./gradlew assembleRelease
   
   # Or for development
   npm run android
   ```

### For Feature Releases

1. **Increment version (patch/minor/major):**
   ```bash
   npm run version:minor  # or patch/major
   ```

2. **Update features in version.json manually:**
   ```json
   {
     "features": [
       "FR-MAIN-XXX: New Feature Name"
     ]
   }
   ```

3. **Commit and build:**
   ```bash
   git add version.json app.json package.json
   git commit -m "release: version X.Y.Z with new features"
   npm run build:increment
   git add version.json app.json
   git commit -m "build: increment build number"
   # Then build...
   ```

## Where Build Info Appears

### About Screen
The About screen (`src/screens/Settings/AboutScreen.tsx`) displays:
- Version number (e.g., "1.0.0")
- Build number (e.g., "Build 2")
- Build type (release/debug)
- Build date
- Git commit hash

Users can access this via: Settings → About

### Build Info Display Format
```
Version 1.0.0
Build 2 • release
Dec 7, 2025
abc1234
```

## Current Build

**Version:** 1.0.0  
**Build:** 2  
**Features in this build:**
- FR-MAIN-003: Scan Flow Enhancement
- FR-MAIN-022: File Explorer Interface

## Notes

- **Build number must always increment** - Never reuse a build number
- **Android versionCode** must always increase for Play Store updates
- The script automatically gets the git commit hash
- Always commit version file changes before building
- Build number and versionCode are kept in sync automatically

## Troubleshooting

### "Build number mismatch"
If version.json and app.json get out of sync:
```bash
node scripts/increment-build.js
```

### "Cannot find version.json"
Make sure you're running commands from the project root directory.

### "Git commit not found"
If you see "unknown" for git commit:
- Make sure you're in a git repository
- Commit your changes before building

## Future Enhancements

- [ ] iOS build number sync (CFBundleVersion)
- [ ] Automatic changelog generation
- [ ] CI/CD integration
- [ ] Build notification system
- [ ] Beta build tracking
