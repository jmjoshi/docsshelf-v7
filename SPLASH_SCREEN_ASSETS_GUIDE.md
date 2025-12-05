# DocsShelf Splash Screen Assets

## Current Splash Configuration

The splash screen now uses:
- **Background Color (Light):** `#3b82f6` (Professional Blue)
- **Background Color (Dark):** `#1e3a8a` (Deep Blue)
- **Icon:** `splash-icon.png` (200x200px)

## Creating Professional Splash Icon

Since we can't create actual image files directly, here's how to create a professional splash icon:

### Option 1: Using Online Tools (Recommended)

1. **Go to Figma/Canva/Adobe Express:**
   - Create 1024x1024px canvas
   - Background: Transparent or white circle

2. **Design Elements:**
   - **Icon:** Document/folder icon (📁) or custom design
   - **Color Scheme:** 
     * Primary: #3b82f6 (blue)
     * Accent: #10b981 (green for "secure")
   - **Style:** Modern, minimal, professional

3. **Text (Optional for icon):**
   - "DS" monogram in bold font
   - Or just icon without text

4. **Export:**
   - PNG, 1024x1024px, transparent background
   - Save as `splash-icon.png`

### Option 2: Using AI Image Generator

Prompt:
```
Create a professional app icon for "DocsShelf", a secure document management app.
Style: Modern, minimal, flat design
Icon: Document or folder with a security shield
Colors: Blue (#3b82f6) and green (#10b981)
Size: 1024x1024px
Background: Transparent or white
No text in the icon
```

### Option 3: Simple Emoji-Based (Quick Start)

For now, the app uses a document emoji (📁) on a blue background. This works but isn't production-ready.

## Recommended Professional Design

```
┌─────────────────────┐
│                     │
│     ┌───────┐       │
│     │ 📄    │       │  ← Document icon
│     │  🔒   │       │  ← Small lock overlay (security)
│     └───────┘       │
│                     │
│    DocsShelf        │  ← App name below
│                     │
└─────────────────────┘
```

**Color Palette:**
- Primary Blue: `#3b82f6` (trust, professionalism)
- Accent Green: `#10b981` (security, success)
- Background: White or transparent
- Text: Dark gray `#1f2937` or white

## Files to Replace

1. **assets/images/splash-icon.png** - Main splash screen icon
2. **assets/images/icon.png** - App icon (512x512 or 1024x1024)
3. **assets/images/android-icon-foreground.png** - Android adaptive icon foreground
4. **assets/images/android-icon-background.png** - Android adaptive icon background
5. **assets/images/favicon.png** - Web favicon

## Splash Screen Behavior

**Light Mode:**
- Background: Blue `#3b82f6`
- Icon: White or multi-color on transparent
- Duration: 2-3 seconds while app loads

**Dark Mode:**
- Background: Deep blue `#1e3a8a`
- Icon: Same as light mode
- Smooth transition to app

## Next Steps

1. **Create the icon** using one of the methods above
2. **Replace** `assets/images/splash-icon.png` with your design
3. **Rebuild** the app:
   ```powershell
   npx expo prebuild --clean
   cd android
   .\gradlew assembleRelease
   ```
4. **Test** on emulator to see the new splash screen

## Current Implementation

The splash screen now shows:
- **Background:** Professional blue color
- **Icon:** Centered, 200px wide
- **Behavior:** Auto-hides when app is ready
- **Platforms:** iOS, Android, Web

The splash screen will appear automatically when the app launches, before any JavaScript loads.
