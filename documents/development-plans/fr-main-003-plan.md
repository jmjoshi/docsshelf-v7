# FR-MAIN-003: Document Scanning Feature - Development Plan

**Feature ID:** FR-MAIN-003  
**Feature Name:** Scanning Documents  
**Priority:** High  
**Status:** Planning  
**Created:** November 13, 2025

---

## 📋 Requirements Summary

### User Story
> "As a logged-in user, I want to be able to scan the document and upload it, so that I can easily store and access my documents."

### Expected Behavior
The system should allow a logged-in user to:
- Scan a document using their device's camera
- **Capture ONLY the image** (NO OCR - that's FR-MAIN-004)
- Save in multiple formats: **JPEG, GIF, and PDF**
- Select format in a simple, user-friendly manner during the scan process
- Upload the scanned document to the app

### Critical Requirements
1. ⚠️ **NO OCR** - This is purely image capture (OCR is FR-MAIN-004)
2. ✅ Format selection: JPEG, GIF, PDF
3. ✅ User-friendly format selector within scan flow
4. ✅ Camera permissions handling
5. ✅ Integration with existing document upload flow

---

## 🎯 Success Criteria

- [ ] User can open camera from document list screen
- [ ] User can capture document image using device camera
- [ ] User can select output format (JPEG/GIF/PDF) before or after capture
- [ ] Captured image is properly processed and saved in selected format
- [ ] Scanned document integrates with existing upload flow (category selection, etc.)
- [ ] Works on both Android and iOS
- [ ] Handles camera permissions properly (request, granted, denied states)
- [ ] Error handling for camera unavailable, storage full, etc.

---

## 🏗️ Technical Architecture

### Package Selection

#### Option 1: expo-camera (Recommended)
**Pros:**
- Official Expo package - well maintained
- Direct integration with Expo ecosystem
- Handles permissions automatically
- Good documentation
- Works with managed workflow

**Cons:**
- Basic features compared to dedicated solutions

**Installation:**
```bash
npx expo install expo-camera
```

#### Option 2: expo-image-picker (Alternative)
**Pros:**
- Already used in project for file picking
- Can access camera via `launchCameraAsync`
- Simpler implementation

**Cons:**
- Less control over camera UI
- Not ideal for document scanning workflow

**Decision:** Use `expo-camera` for full control over camera UI and document capture experience.

### Image Format Conversion

#### JPEG Format
- Native support from camera (default)
- No conversion needed

#### GIF Format
- Need image manipulation library
- Options:
  - `expo-image-manipulator` - For basic conversions
  - `react-native-image-to-gif` - Dedicated GIF conversion

#### PDF Format
- Need PDF generation library
- Options:
  - `react-native-pdf-lib` - Native PDF creation
  - `react-native-image-to-pdf` - Convert images to PDF
  - **Recommended:** `expo-print` - Official Expo solution for PDF generation

**Installation:**
```bash
npx expo install expo-camera expo-image-manipulator expo-print
```

---

## 📐 UI/UX Design

### User Flow

```
Document List Screen
    ↓
[Scan FAB Button] (New button next to Upload FAB)
    ↓
Format Selection Modal
├─ JPEG (recommended for photos)
├─ GIF (smaller file size)
└─ PDF (document format)
    ↓
Camera Screen
├─ Live camera preview
├─ Capture button
├─ Flash toggle
├─ Cancel button
└─ Format indicator (top)
    ↓
Image Preview Screen
├─ Show captured image
├─ Retake button
├─ Confirm button
└─ Format conversion indicator
    ↓
[Processing: Convert to selected format]
    ↓
Existing Document Upload Flow
├─ Category selection
├─ Metadata entry
└─ Upload
```

### Screen Components

1. **Format Selection Modal**
   - Location: Overlay on Document List Screen
   - Design: Bottom sheet with 3 large buttons
   - Each button shows:
     - Format name (JPEG/GIF/PDF)
     - Icon representing format
     - Brief description (e.g., "Best for photos", "Compact size", "Document standard")
   - Cancel option to dismiss

2. **Camera Screen**
   - Fullscreen camera view
   - UI Elements:
     - Top bar: Format badge (e.g., "Scanning as PDF")
     - Center: Camera preview
     - Bottom bar:
       - Flash toggle (left)
       - Capture button (center, large circular)
       - Cancel button (right)
   - Grid overlay (optional) to help align document

3. **Image Preview Screen**
   - Show captured image fullscreen
   - UI Elements:
     - Top bar: "Scanned as [FORMAT]"
     - Center: Image preview
     - Bottom bar:
       - "Retake" button (left)
       - "Use Image" button (right)
     - Processing indicator if converting format

---

## 🔧 Implementation Plan

### Phase 1: Setup & Permissions (30 min)
- [ ] Install required packages (expo-camera, expo-image-manipulator, expo-print)
- [ ] Create camera permissions utility
- [ ] Add permissions to app.json (android.permissions, ios.infoPlist)
- [ ] Test permission requests on both platforms

### Phase 2: Format Selection UI (45 min)
- [ ] Create FormatSelectionModal component
- [ ] Design format selection buttons with icons
- [ ] Add format descriptions
- [ ] Implement modal open/close logic
- [ ] Add format state management

### Phase 3: Camera Implementation (90 min)
- [ ] Create DocumentScanScreen component
- [ ] Implement expo-camera integration
- [ ] Add camera controls (capture, flash, cancel)
- [ ] Add format indicator in UI
- [ ] Handle camera errors (not available, etc.)
- [ ] Implement image capture logic

### Phase 4: Image Processing (60 min)
- [ ] Implement JPEG handling (direct from camera)
- [ ] Implement GIF conversion using expo-image-manipulator
- [ ] Implement PDF generation using expo-print
- [ ] Add conversion loading indicators
- [ ] Error handling for conversion failures

### Phase 5: Preview & Confirmation (45 min)
- [ ] Create ImagePreviewScreen component
- [ ] Display captured/converted image
- [ ] Implement retake functionality
- [ ] Implement confirm and pass to upload flow

### Phase 6: Integration with Upload Flow (30 min)
- [ ] Modify DocumentListScreen to add scan FAB
- [ ] Create navigation route for scan flow
- [ ] Pass scanned image to DocumentUploadScreen
- [ ] Pre-populate upload form with scanned file
- [ ] Ensure encryption works with scanned files

### Phase 7: Testing & Polish (60 min)
- [ ] Test on Android physical device
- [ ] Test on iOS physical device (if available)
- [ ] Test all three format outputs
- [ ] Test permission denied scenarios
- [ ] Test camera unavailable scenarios
- [ ] Polish UI/UX (loading states, transitions)
- [ ] Add error messages and user guidance

**Total Estimated Time:** 6 hours

---

## 📁 File Structure

```
app/
  scan/
    _layout.tsx               # Scan stack navigator
    format-selection.tsx      # Format selection modal/screen
    camera.tsx                # Camera capture screen
    preview.tsx               # Image preview screen

src/
  components/
    scan/
      FormatSelectionModal.tsx   # Reusable format selector
      CameraControls.tsx         # Camera UI controls
      DocumentOverlay.tsx        # Grid overlay for alignment
  
  services/
    scan/
      cameraService.ts          # Camera permission & capture
      imageConverter.ts         # JPEG/GIF/PDF conversion
      formatValidator.ts        # Format validation
  
  types/
    scan.types.ts               # TypeScript interfaces
  
  utils/
    imageProcessing.ts          # Image manipulation utilities
    pdfGenerator.ts             # PDF generation utilities
```

---

## 🎨 Component Specifications

### FormatSelectionModal Component

```typescript
interface FormatSelectionModalProps {
  visible: boolean;
  onClose: () => void;
  onSelectFormat: (format: 'jpeg' | 'gif' | 'pdf') => void;
}

type ScanFormat = 'jpeg' | 'gif' | 'pdf';

interface FormatOption {
  format: ScanFormat;
  label: string;
  description: string;
  icon: string;  // Icon name
  recommended?: boolean;
}
```

### DocumentScanScreen Component

```typescript
interface DocumentScanScreenProps {
  format: ScanFormat;
  onCapture: (imageUri: string) => void;
  onCancel: () => void;
}

interface CameraState {
  hasPermission: boolean | null;
  flashMode: 'on' | 'off' | 'auto';
  isCapturing: boolean;
  error: string | null;
}
```

### ImagePreviewScreen Component

```typescript
interface ImagePreviewScreenProps {
  imageUri: string;
  format: ScanFormat;
  onRetake: () => void;
  onConfirm: (processedUri: string) => void;
}

interface PreviewState {
  isProcessing: boolean;
  processedUri: string | null;
  error: string | null;
}
```

---

## 🔌 Service Layer

### cameraService.ts

```typescript
class CameraService {
  async requestPermissions(): Promise<boolean>;
  async checkPermissions(): Promise<boolean>;
  async captureImage(): Promise<string>;  // Returns URI
  async hasCamera(): Promise<boolean>;
}
```

### imageConverter.ts

```typescript
class ImageConverter {
  async convertToJpeg(uri: string, quality: number): Promise<string>;
  async convertToGif(uri: string): Promise<string>;
  async convertToPdf(uri: string, options?: PDFOptions): Promise<string>;
  
  getFileExtension(format: ScanFormat): string;
  getMimeType(format: ScanFormat): string;
}

interface PDFOptions {
  pageSize?: 'A4' | 'LETTER';
  orientation?: 'portrait' | 'landscape';
  margins?: {
    top: number;
    right: number;
    bottom: number;
    left: number;
  };
}
```

---

## 🧪 Testing Strategy

### Unit Tests
- [ ] Format selection logic
- [ ] Image conversion functions
- [ ] Permission handling
- [ ] File extension/MIME type utilities

### Integration Tests
- [ ] Camera capture → Preview flow
- [ ] Format selection → Camera → Preview flow
- [ ] Preview → Upload flow integration
- [ ] Permission request → Camera access flow

### Manual Testing Checklist
- [ ] Camera opens correctly
- [ ] All three formats can be selected
- [ ] Image captures successfully
- [ ] JPEG output is correct
- [ ] GIF output is correct
- [ ] PDF output is correct
- [ ] Preview shows correct image
- [ ] Retake works correctly
- [ ] Confirm passes to upload
- [ ] Upload flow works with scanned image
- [ ] Encrypted upload works
- [ ] Permission denied handled gracefully
- [ ] Camera unavailable handled gracefully
- [ ] Flash toggle works (if device supports)
- [ ] UI is responsive and intuitive

---

## ⚠️ Potential Challenges & Solutions

### Challenge 1: GIF Conversion
**Issue:** expo-image-manipulator doesn't directly support GIF output.  
**Solution:** 
- Option A: Use JPEG with high compression instead of GIF (simpler)
- Option B: Research `react-native-gifted-image` or similar libraries
- Option C: Convert on backend/server (future consideration)
- **Recommended:** Start with JPEG as "compact" option, revisit GIF later if needed

### Challenge 2: PDF Generation Quality
**Issue:** Images in PDF may be low quality or large file size.  
**Solution:**
- Use expo-print with HTML template embedding base64 image
- Optimize image before embedding (resize, compress)
- Set appropriate PDF page size to match document aspect ratio

### Challenge 3: Camera Not Available (Emulator)
**Issue:** Emulators don't have real cameras.  
**Solution:**
- Add fallback to expo-image-picker for emulator testing
- Detect emulator environment and show different UI
- Require physical device for full testing

### Challenge 4: iOS vs Android Differences
**Issue:** Camera APIs and permissions differ between platforms.  
**Solution:**
- expo-camera handles platform differences
- Test permission flows on both platforms
- Use platform-specific styling if needed

### Challenge 5: Large Image Files
**Issue:** High-resolution camera images can be very large.  
**Solution:**
- Compress images before saving (quality: 0.8 for JPEG)
- Resize to maximum dimensions (e.g., 2048x2048)
- Show file size to user before upload
- Existing encryption/upload handles large files

---

## 📊 Success Metrics

### Functional Metrics
- [ ] 100% of test cases pass
- [ ] Zero TypeScript errors
- [ ] Works on Android physical device
- [ ] Works on iOS physical device
- [ ] All three formats generate valid files

### User Experience Metrics
- [ ] Camera opens in < 2 seconds
- [ ] Format selection is intuitive (no user confusion)
- [ ] Image capture is instant (< 1 second)
- [ ] Format conversion completes in < 3 seconds
- [ ] Flow from scan to upload is seamless

### Code Quality Metrics
- [ ] All components are typed (TypeScript)
- [ ] Services are testable and modular
- [ ] Error handling is comprehensive
- [ ] Code follows existing project patterns
- [ ] Documentation is complete

---

## 🚀 Deployment Checklist

### Pre-Implementation
- [x] Requirements analysis complete
- [x] Technical design approved
- [x] Dependencies identified
- [ ] Development plan reviewed

### Implementation
- [ ] All phases completed
- [ ] Code reviewed
- [ ] TypeScript compilation passes
- [ ] Manual testing complete
- [ ] Edge cases tested

### Post-Implementation
- [ ] Feature documented in DEVELOPMENT_CONTEXT.md
- [ ] Changelog entry created
- [ ] Git commit with proper tags
- [ ] Tag created: FR-MAIN-003-COMPLETE
- [ ] Next feature (FR-MAIN-004) planned

---

## 📝 Notes & Decisions

### Decision Log

1. **Package Choice: expo-camera**
   - Date: November 13, 2025
   - Reasoning: Official Expo support, better control than image-picker
   - Alternative: expo-image-picker (simpler but less flexible)

2. **GIF Support: Deferred**
   - Date: November 13, 2025
   - Reasoning: No native library support, complex conversion
   - Alternative: Offer JPEG with high compression as "compact" option
   - Future: May revisit with server-side conversion

3. **PDF Generation: expo-print**
   - Date: November 13, 2025
   - Reasoning: Official Expo package, HTML-based, flexible
   - Alternative: react-native-pdf-lib (more complex)

4. **UI Pattern: Bottom Sheet for Format Selection**
   - Date: November 13, 2025
   - Reasoning: Modern, mobile-friendly, doesn't obscure context
   - Alternative: Full-screen modal (more disruptive)

### Open Questions
- Q: Should we allow multiple document scanning in one session?
  - A: Start with single scan, add batch later if needed (FR-MAIN-004?)

- Q: Should we auto-detect document edges and crop?
  - A: Not in FR-MAIN-003 (keep simple), consider for FR-MAIN-004 with OCR

- Q: Should we allow adjusting image (rotate, crop) before upload?
  - A: Nice-to-have, not required for FR-MAIN-003, add if time permits

---

## 🔗 Related Features

- **FR-MAIN-002:** Document Upload (completed) - Integration point
- **FR-MAIN-004:** OCR & Smart Categorization (next) - Will build on scan capability
- **FR-MAIN-001:** Categories (completed) - Used for scan upload destination

---

**Status:** Ready for Implementation  
**Next Step:** Begin Phase 1 - Setup & Permissions  
**Estimated Completion:** November 13-14, 2025 (1-2 dev sessions)
