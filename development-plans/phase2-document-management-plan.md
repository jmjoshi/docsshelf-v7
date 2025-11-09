# Phase 2: Core Document Management - Development Plan

## Overview
This plan outlines the implementation of **Phase 2: Core Document Management** features following the successful completion of Phase 1 (Authentication & MFA). We'll implement features FR-MAIN-001 through FR-MAIN-004 with production-quality code, security, and adherence to technical requirements.

## Timeline: 2-3 Weeks (Based on Roadmap)

---

## Feature 1: Category & Folder Management (FR-MAIN-001)
**Priority**: 🔴 CRITICAL | **Effort**: Medium | **Timeline**: 1-2 weeks

### Requirements
- Create, edit, delete categories and folders
- Nested folder structure support
- Category icons and color coding
- Custom organization rules
- Bulk category operations
- Category usage analytics

### Technical Implementation

#### 1.1 Database Schema
```sql
-- Categories table
CREATE TABLE IF NOT EXISTS categories (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  description TEXT,
  icon TEXT DEFAULT 'folder',
  color TEXT DEFAULT '#007AFF',
  parent_id INTEGER,
  user_id INTEGER NOT NULL,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (parent_id) REFERENCES categories(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Indexes for performance
CREATE INDEX idx_categories_user_id ON categories(user_id);
CREATE INDEX idx_categories_parent_id ON categories(parent_id);
CREATE INDEX idx_categories_name ON categories(name);
```

#### 1.2 Components to Create
- `src/services/database/categoryService.ts` - CRUD operations
- `src/screens/Documents/CategoryManagement.tsx` - Main category screen
- `src/components/documents/CategoryTree.tsx` - Tree view component
- `src/components/documents/CategoryCard.tsx` - Category display
- `src/components/documents/CategoryForm.tsx` - Create/edit form
- `src/store/slices/categorySlice.ts` - Redux state management
- `src/types/category.ts` - TypeScript interfaces

#### 1.3 Features to Implement
✅ Create category with name, description, icon, color
✅ Edit category details
✅ Delete category (with cascade or move documents option)
✅ Nested folder structure (unlimited depth)
✅ Drag & drop to reorder categories
✅ Search categories by name
✅ Category statistics (document count, size)
✅ Bulk operations (delete, move)
✅ Icon picker (50+ icons)
✅ Color picker (Material Design colors)

#### 1.4 Security Considerations
- User can only access their own categories
- Validate category ownership before operations
- Sanitize input to prevent SQL injection
- Encrypt category names if they contain sensitive info

#### 1.5 Performance
- Lazy load categories (load on demand)
- Cache category tree in Redux
- Optimize SQL queries with indexes
- Virtual scrolling for large category lists

---

## Feature 2: Document Upload & File Management (FR-MAIN-002)
**Priority**: 🔴 CRITICAL | **Effort**: Medium-High | **Timeline**: 2-3 weeks

### Requirements
- Multi-file selection and upload
- Support PDF, images, text files, Office docs
- File size and format validation
- Upload progress indicators
- Duplicate detection
- File metadata extraction
- Local file system management
- AES-256 encryption

### Technical Implementation

#### 2.1 Database Schema
```sql
-- Documents table
CREATE TABLE IF NOT EXISTS documents (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  category_id INTEGER,
  filename TEXT NOT NULL,
  original_filename TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_size INTEGER NOT NULL,
  mime_type TEXT NOT NULL,
  encryption_key TEXT NOT NULL, -- Encrypted with device key
  encryption_iv TEXT NOT NULL,
  checksum TEXT NOT NULL, -- SHA-256 hash for integrity
  thumbnail_path TEXT,
  page_count INTEGER DEFAULT 1,
  ocr_text TEXT,
  ocr_confidence REAL,
  is_favorite BOOLEAN DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_accessed_at TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL
);

-- Document tags (many-to-many)
CREATE TABLE IF NOT EXISTS document_tags (
  document_id INTEGER NOT NULL,
  tag_id INTEGER NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (document_id, tag_id),
  FOREIGN KEY (document_id) REFERENCES documents(id) ON DELETE CASCADE,
  FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE
);

-- Tags table
CREATE TABLE IF NOT EXISTS tags (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  name TEXT NOT NULL,
  color TEXT DEFAULT '#666666',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE(user_id, name)
);

-- Indexes
CREATE INDEX idx_documents_user_id ON documents(user_id);
CREATE INDEX idx_documents_category_id ON documents(category_id);
CREATE INDEX idx_documents_filename ON documents(filename);
CREATE INDEX idx_documents_created_at ON documents(created_at);
CREATE INDEX idx_documents_ocr_text ON documents(ocr_text);
CREATE UNIQUE INDEX idx_documents_checksum ON documents(checksum, user_id);
```

#### 2.2 Required npm Packages
```bash
npm install react-native-document-picker
npm install react-native-fs
npm install react-native-image-resizer
npm install react-native-pdf
npm install react-native-view-shot
npm install @react-native-community/netinfo
npm install mime-types
npm install crypto-js
```

#### 2.3 Components to Create
- `src/services/storage/fileStorageService.ts` - File operations
- `src/services/encryption/fileEncryptionService.ts` - Encryption
- `src/services/documents/documentService.ts` - Document CRUD
- `src/services/documents/thumbnailService.ts` - Thumbnail generation
- `src/screens/Documents/DocumentUpload.tsx` - Upload screen
- `src/screens/Documents/DocumentList.tsx` - Document list
- `src/screens/Documents/DocumentViewer.tsx` - View documents
- `src/components/documents/DocumentCard.tsx` - Document display
- `src/components/documents/FilePreview.tsx` - File preview
- `src/components/documents/UploadProgress.tsx` - Progress indicator
- `src/store/slices/documentSlice.ts` - Redux state
- `src/types/document.ts` - TypeScript interfaces

#### 2.4 Features to Implement
✅ Select files from device (document picker)
✅ Validate file type and size (max 50MB per file)
✅ Encrypt files with AES-256-GCM
✅ Generate unique filenames to prevent collisions
✅ Calculate SHA-256 checksum for integrity
✅ Detect duplicates by checksum
✅ Store encrypted files in app directory
✅ Generate thumbnails for PDFs and images
✅ Extract metadata (file size, page count, creation date)
✅ Upload progress with pause/resume
✅ Batch upload (multiple files)
✅ Categorize during upload
✅ Add tags during upload

#### 2.5 File Storage Structure
```
Documents/
  ├── files/
  │   ├── encrypted/
  │   │   ├── {user_id}/
  │   │   │   ├── {year}/
  │   │   │   │   ├── {month}/
  │   │   │   │   │   ├── {document_id}.enc
  │   └── temp/
  │       ├── uploads/
  │       └── processing/
  ├── thumbnails/
  │   ├── {user_id}/
  │   │   ├── {document_id}.jpg
  └── backups/
```

#### 2.6 Security Considerations
- Encrypt all files with AES-256-GCM
- Store encryption keys in device keystore
- Validate file types (prevent executable uploads)
- Scan for malware signatures (basic)
- Verify checksums before/after storage
- Secure deletion (overwrite with zeros)
- Audit all file operations

#### 2.7 Performance
- Process files in background threads
- Generate thumbnails asynchronously
- Compress images before storage
- Use streaming for large files
- Implement file caching
- Optimize database queries

---

## Feature 3: Document Scanning & Camera Integration (FR-MAIN-003)
**Priority**: 🟡 HIGH | **Effort**: Medium | **Timeline**: 1-2 weeks

### Requirements
- Camera-based document scanning
- Edge detection and perspective correction
- Multi-page document scanning
- Image enhancement
- Scan quality validation
- Batch scanning workflow

### Technical Implementation

#### 3.1 Required npm Packages
```bash
npm install react-native-camera
npm install react-native-vision-camera  # Alternative, more modern
npm install react-native-image-crop-picker
npm install opencv-react-native  # For edge detection (if needed)
npm install @react-native-community/cameraroll
```

#### 3.2 Components to Create
- `src/services/scanning/documentScannerService.ts` - Scanning logic
- `src/services/scanning/imageProcessingService.ts` - Enhancement
- `src/services/scanning/edgeDetectionService.ts` - Edge detection
- `src/screens/Documents/CameraScanner.tsx` - Camera screen
- `src/screens/Documents/ScanReview.tsx` - Review scanned docs
- `src/components/scanning/ScanOverlay.tsx` - Camera overlay
- `src/components/scanning/EdgeDetector.tsx` - Edge detection UI
- `src/components/scanning/ImageEditor.tsx` - Edit scanned image

#### 3.3 Features to Implement
✅ Open camera with document scanning overlay
✅ Auto-detect document edges
✅ Capture photo with flash control
✅ Perspective correction (deskew)
✅ Image enhancement (brightness, contrast, sharpness)
✅ Convert to grayscale/color/black&white
✅ Multi-page scanning (scan multiple pages)
✅ Review and retake
✅ Crop and rotate
✅ Quality check (blur detection)
✅ Save as PDF or image
✅ Batch scan mode (scan 10+ pages quickly)

#### 3.4 Security Considerations
- Request camera permissions properly
- Store scanned images encrypted
- Clear temp files after processing
- No external API calls (all local)

#### 3.5 Performance
- Optimize image processing algorithms
- Process images on native thread
- Compress scanned images (reduce size by 80%)
- Generate thumbnails automatically

---

## Feature 4: OCR & Intelligent Document Processing (FR-MAIN-004)
**Priority**: 🟡 HIGH | **Effort**: High | **Timeline**: 2-3 weeks

### Requirements
- Text extraction from images and PDFs
- Automatic document categorization
- Smart folder suggestion
- Document type recognition
- Key information extraction
- Confidence scoring

### Technical Implementation

#### 4.1 Required npm Packages
```bash
npm install @react-native-ml-kit/text-recognition
npm install tesseract.js  # Fallback for complex OCR
npm install natural  # NLP for categorization
npm install compromise  # Text analysis
npm install pdf-parse  # PDF text extraction
```

#### 4.2 Components to Create
- `src/services/ocr/ocrService.ts` - OCR engine
- `src/services/ocr/textExtractionService.ts` - Extract from PDF
- `src/services/ai/categorizationService.ts` - Auto-categorize
- `src/services/ai/documentClassifierService.ts` - Classify docs
- `src/services/ai/keyInfoExtractorService.ts` - Extract key data
- `src/screens/Documents/OCRReview.tsx` - Review OCR results
- `src/components/ocr/TextHighlight.tsx` - Highlight extracted text
- `src/components/ocr/ConfidenceIndicator.tsx` - Show confidence

#### 4.3 Features to Implement
✅ OCR text extraction from images (ML Kit)
✅ OCR text extraction from PDF files
✅ Language detection (support 50+ languages)
✅ Confidence scoring for OCR results
✅ Document type classification:
  - Invoice
  - Receipt
  - Contract
  - ID Card
  - Business Card
  - Letter
  - Form
  - Other
✅ Extract key information:
  - Dates
  - Amounts/Prices
  - Names
  - Email addresses
  - Phone numbers
  - Addresses
✅ Auto-suggest category based on content
✅ Auto-tagging based on keywords
✅ Search by OCR text (full-text search)
✅ Edit OCR results manually
✅ Batch OCR processing

#### 4.4 AI/ML Models
- Use ML Kit for basic OCR (on-device)
- Train custom model for document classification
- Use keyword matching for category suggestion
- Implement fuzzy matching for search

#### 4.5 Security Considerations
- All OCR processing on-device (no cloud)
- Encrypt OCR text in database
- No telemetry or data sharing
- Clear ML Kit cache regularly

#### 4.6 Performance
- Process OCR in background
- Cache OCR results
- Optimize for low-end devices (reduce accuracy if needed)
- Batch process during idle time
- Show progress for long operations

---

## Implementation Order

### Week 1: Categories & Database Foundation
1. ✅ Create database schema and migrations
2. ✅ Implement categoryService (CRUD operations)
3. ✅ Create Redux slice for categories
4. ✅ Build CategoryManagement screen
5. ✅ Build CategoryTree component
6. ✅ Build CategoryForm component
7. ✅ Test category operations
8. ✅ Add icon and color pickers

### Week 2: Document Upload & Storage
1. ✅ Install required packages
2. ✅ Create file storage structure
3. ✅ Implement fileStorageService
4. ✅ Implement fileEncryptionService
5. ✅ Implement documentService
6. ✅ Build DocumentUpload screen
7. ✅ Build DocumentList screen
8. ✅ Build DocumentCard component
9. ✅ Implement thumbnail generation
10. ✅ Test upload and retrieval

### Week 3: Scanning & OCR
1. ✅ Install camera and OCR packages
2. ✅ Implement documentScannerService
3. ✅ Implement ocrService
4. ✅ Build CameraScanner screen
5. ✅ Build ScanReview screen
6. ✅ Implement edge detection
7. ✅ Implement image enhancement
8. ✅ Implement document classification
9. ✅ Test scanning workflow
10. ✅ Test OCR accuracy

---

## Testing Strategy

### Unit Tests
- Category CRUD operations
- File encryption/decryption
- OCR text extraction
- Document classification
- Checksum calculation

### Integration Tests
- Upload workflow (select → encrypt → store → thumbnail)
- Scan workflow (capture → process → OCR → categorize → save)
- Category tree navigation
- Document search

### E2E Tests
- Create category → Upload document → View document
- Scan document → Auto-categorize → Save
- Search documents by OCR text
- Delete category with documents

### Performance Tests
- Upload 100 documents
- Generate 100 thumbnails
- OCR 50 documents
- Search 10,000 documents

---

## Security Checklist

✅ All files encrypted with AES-256-GCM
✅ Encryption keys stored in device keystore
✅ File integrity verified with SHA-256
✅ User can only access their own data
✅ SQL injection prevention (parameterized queries)
✅ File type validation (prevent malicious uploads)
✅ Secure file deletion (overwrite)
✅ Audit logging for all operations
✅ No external API calls (offline-first)
✅ OWASP Mobile Top 10 compliance

---

## Compliance Checklist

✅ GDPR compliance (user data export/delete)
✅ WCAG 2.1 accessibility (screen reader support)
✅ App store policies (no prohibited content)
✅ Data retention policies (user-configurable)
✅ Privacy policy display
✅ User consent for camera/storage

---

## Success Metrics

### Performance
- ✅ App launch < 2 seconds
- ✅ Upload 10MB file < 5 seconds
- ✅ OCR processing < 10 seconds per page
- ✅ Search 10,000 documents < 500ms
- ✅ Memory usage < 80MB
- ✅ Battery drain < 5% per hour

### User Experience
- ✅ Intuitive category management
- ✅ Fast document upload
- ✅ High OCR accuracy (>90%)
- ✅ Smart categorization (>80% accuracy)
- ✅ Smooth camera scanning
- ✅ Clear error messages

### Security
- ✅ Zero security breaches
- ✅ 100% data encryption
- ✅ Passed security audit
- ✅ No data leaks

---

## Next Steps After Phase 2

**Phase 3: Search & Organization**
- Advanced search & filtering
- Tags & metadata management
- Document sorting & list views
- Favorites & recently used

**Phase 4: Security & Compliance**
- Data encryption audit
- GDPR compliance verification
- Backup & recovery
- Audit logging dashboard

**Phase 5: Sharing & Collaboration**
- Local sharing (NFC/QR)
- Network sharing
- External export
- Comments & annotations

---

## Conclusion

This plan provides a comprehensive roadmap for implementing Phase 2 features with production-quality code, security, and adherence to technical requirements. Each feature will be developed incrementally, tested thoroughly, and committed with proper documentation.

Let's build an amazing document management system! 🚀
