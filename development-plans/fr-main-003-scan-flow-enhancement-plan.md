# Scan Flow Enhancement: Post-Upload Options Loop

**Feature ID:** FR-MAIN-003-Enhancement  
**Priority:** High  
**Status:** Complete  
**Created:** December 6, 2025  
**Last Updated:** December 6, 2025

---

## 📋 Overview

Enhance the document scanning flow to provide users with options after uploading a scanned document. Instead of automatically navigating away, users can choose to:
1. **Scan More** - Continue scanning additional documents (loop back to scan flow)
2. **View Document** - See the document they just uploaded
3. **Done** - Go to documents list and end the scanning session

---

## 🎯 Objectives

1. **Improve user workflow** - Allow batch scanning without navigating through menus
2. **Provide flexibility** - Let users choose their next action after upload
3. **Maintain traditional flow** - Keep direct navigation for non-scan uploads
4. **Enable scan loops** - Support multiple consecutive scans efficiently

---

## 🎨 User Stories

**US-1:** As a user scanning multiple documents, I want to continue scanning after each upload without going back to the main menu, so I can batch process documents efficiently.

**US-2:** As a user who just scanned a document, I want to view it immediately to verify it was captured correctly.

**US-3:** As a user finishing a scan session, I want to go directly to my documents list to see all my scanned items.

**US-4:** As a user using the file picker (not camera), I want the app to navigate directly to the document view as before (no modal interruption).

---

## 🏗️ Technical Implementation

### Modified Components

#### 1. DocumentUploadScreen.tsx

**New State Variables:**
```typescript
const [showPostUploadModal, setShowPostUploadModal] = useState(false);
const [uploadedDocumentId, setUploadedDocumentId] = useState<number | null>(null);
const [isFromScan, setIsFromScan] = useState(false);
```

**Updated Upload Success Handler:**
```typescript
// Success - show toast
await hapticFeedback.success();
if (toast) {
  toast.show('Document uploaded successfully', {
    type: 'success',
    duration: 2000,
  });
}

// If this is from scan flow, show post-upload options modal
// Otherwise, navigate directly to document view (traditional upload)
if (isFromScan) {
  setUploadedDocumentId(result.id);
  setShowPostUploadModal(true);
} else {
  // Traditional file picker upload - go straight to document view
  router.push(`/document/${result.id}`);
}
```

**New Modal Handlers:**
```typescript
const handleScanMore = () => {
  setShowPostUploadModal(false);
  // Reset the upload form
  setSelectedFile(null);
  setUploadedDocumentId(null);
  processedUriRef.current = null;
  
  // Navigate back to scan flow
  router.replace('/scan');
};

const handleViewDocument = () => {
  setShowPostUploadModal(false);
  if (uploadedDocumentId) {
    router.replace(`/document/${uploadedDocumentId}`);
  }
};

const handleDone = () => {
  setShowPostUploadModal(false);
  // Navigate to documents list
  router.replace('/(tabs)/documents');
};
```

**New Modal UI:**
```tsx
<Modal
  visible={showPostUploadModal}
  transparent
  animationType="fade"
  onRequestClose={handleDone}
>
  <View style={styles.postUploadModalOverlay}>
    <View style={styles.postUploadModalContainer}>
      <View style={styles.postUploadHeader}>
        <Text style={styles.postUploadTitle}>✓ Document Uploaded</Text>
        <Text style={styles.postUploadSubtitle}>What would you like to do next?</Text>
      </View>

      <View style={styles.postUploadOptions}>
        <TouchableOpacity style={styles.postUploadButton} onPress={handleScanMore}>
          <Text style={styles.postUploadButtonIcon}>📷</Text>
          <Text style={styles.postUploadButtonText}>Scan More</Text>
          <Text style={styles.postUploadButtonSubtext}>Continue scanning documents</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.postUploadButton} onPress={handleViewDocument}>
          <Text style={styles.postUploadButtonIcon}>👁️</Text>
          <Text style={styles.postUploadButtonText}>View Document</Text>
          <Text style={styles.postUploadButtonSubtext}>See what you just uploaded</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.postUploadButton, styles.postUploadButtonDone]} onPress={handleDone}>
          <Text style={styles.postUploadButtonIcon}>✓</Text>
          <Text style={styles.postUploadButtonText}>Done</Text>
          <Text style={styles.postUploadButtonSubtext}>Go to documents list</Text>
        </TouchableOpacity>
      </View>
    </View>
  </View>
</Modal>
```

---

## 🔄 Flow Diagrams

### Scan Flow with Loop

```
┌─────────────────┐
│  Documents List │
└────────┬────────┘
         │ Tap Scan FAB
         ▼
┌─────────────────┐
│ Format Selection│
└────────┬────────┘
         │ Select Format
         ▼
┌─────────────────┐
│  Camera Screen  │
└────────┬────────┘
         │ Capture
         ▼
┌─────────────────┐
│ Image Preview   │
└────────┬────────┘
         │ Confirm
         ▼
┌─────────────────┐
│ Document Upload │
└────────┬────────┘
         │ Upload Success
         ▼
┌─────────────────────────┐
│ Post-Upload Options     │
│                         │
│ 1. 📷 Scan More    ─────┼──┐ (Loop back)
│ 2. 👁️ View Document     │  │
│ 3. ✓ Done               │  │
└───┬─────────┬───────────┘  │
    │         │                │
    │         └──────┐         │
    ▼                ▼         │
┌───────┐    ┌────────────┐   │
│ Done  │    │   View     │   │
│  to   │    │  Document  │   │
│ List  │    └────────────┘   │
└───────┘                      │
    ▲                          │
    └──────────────────────────┘
```

### Traditional Upload Flow (Unchanged)

```
┌─────────────────┐
│  Documents List │
└────────┬────────┘
         │ Tap Upload FAB
         ▼
┌─────────────────┐
│ Document Upload │
│ (File Picker)   │
└────────┬────────┘
         │ Upload Success
         ▼
┌─────────────────┐
│  View Document  │ (Direct navigation, no modal)
└─────────────────┘
```

---

## 🎨 UI/UX Design

### Modal Design
- **Centered modal** with semi-transparent overlay
- **Green success checkmark** at top
- **Three large tap targets** for easy selection
- **Icons** for visual clarity (📷 👁️ ✓)
- **Descriptive subtitles** explaining each option
- **"Done" option visually distinct** with green background

### Design Principles
- Clear visual hierarchy
- Large touch targets (44x44 minimum)
- Intuitive icons
- No confusing buttons
- Cannot be dismissed accidentally
- Haptic feedback on selection

---

## 📦 Dependencies

**No New Dependencies Required**
- Uses existing React Native Modal
- Uses existing navigation (expo-router)
- Uses existing haptic feedback utilities

---

## 🧪 Testing Strategy

### Test Coverage

**File:** `__tests__/screens/DocumentUploadFlow.test.tsx`

**Test Cases:**
1. ✅ Post-upload modal displays after scan upload
2. ✅ Three options are visible in modal
3. ✅ "Scan More" navigates back to scan flow
4. ✅ "Scan More" resets upload form state
5. ✅ "View Document" navigates to document viewer
6. ✅ "Done" navigates to documents list
7. ✅ Modal closes after option selection
8. ✅ Traditional uploads skip the modal
9. ✅ Back button triggers "Done" behavior
10. ✅ Multiple scan cycles work correctly

**Test Count:** 10 test cases

---

## ✅ Success Criteria

1. ✅ Modal appears only for scanned documents, not file picker uploads
2. ✅ All three options work correctly
3. ✅ "Scan More" allows continuous scanning without menu navigation
4. ✅ "View Document" shows the just-uploaded document
5. ✅ "Done" returns to documents list
6. ✅ Upload form state is properly reset between scans
7. ✅ No memory leaks or navigation stack issues
8. ✅ Haptic feedback on successful upload
9. ✅ UI is responsive and visually appealing
10. ✅ All tests pass

---

## 🚀 Implementation Summary

### Files Modified (1)
- `src/screens/Documents/DocumentUploadScreen.tsx`
  - Added 3 new state variables
  - Added 3 new modal handlers
  - Added post-upload modal UI
  - Added 10 new styles
  - Modified upload success logic
  - ~100 lines added

### Files Added (1)
- `__tests__/screens/DocumentUploadFlow.test.tsx`
  - 10 test cases
  - Full coverage of new flow
  - ~250 lines

### Total Impact
- **Lines Added:** ~350 lines
- **Files Changed:** 1
- **New Files:** 1 (test)
- **New Dependencies:** 0

---

## 🔮 Future Enhancements

1. **Remember user preference** - Save last selected option (Scan More vs Done)
2. **Quick action shortcuts** - Swipe gestures on modal
3. **Batch category assignment** - Assign all scanned docs to same category
4. **Scan statistics** - Show count of documents scanned in session
5. **Auto-scan mode** - Continuous scanning without confirmation
6. **Custom workflows** - Let users define their preferred post-scan action

---

## 📝 User Documentation

### How to Use Batch Scanning

**Step 1:** Tap the green camera button on the Documents screen

**Step 2:** Select your desired format (JPEG, PDF, or GIF)

**Step 3:** Take a photo of your document

**Step 4:** Review and confirm the image

**Step 5:** Document uploads automatically

**Step 6:** Choose your next action:
- **📷 Scan More** - Scan another document immediately
- **👁️ View Document** - See what you just scanned
- **✓ Done** - Return to your documents list

**Tip:** Use "Scan More" to quickly scan multiple documents in one session!

---

## 🏁 Completion Checklist

- [x] State management for modal and scan tracking
- [x] Modal UI with three options
- [x] "Scan More" handler and navigation
- [x] "View Document" handler and navigation
- [x] "Done" handler and navigation
- [x] Form reset logic for scan loops
- [x] Traditional upload flow preserved
- [x] Styles for modal components
- [x] Unit tests written
- [x] Integration tests written
- [x] Documentation updated
- [x] Ready for commit

---

**Status:** Complete ✅  
**Test Coverage:** 10 test cases  
**No Breaking Changes:** Traditional upload flow unaffected  
**Ready for Production:** Yes
