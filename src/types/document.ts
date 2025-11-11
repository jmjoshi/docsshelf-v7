/**
 * TypeScript type definitions for Document domain
 */

export interface Document {
  id: number;
  user_id: number;
  category_id: number | null;
  filename: string;
  original_filename: string;
  file_path: string;
  file_size: number;
  mime_type: string;
  encryption_key: string;
  encryption_iv: string;
  checksum: string;
  thumbnail_path: string | null;
  page_count: number;
  ocr_text: string | null;
  ocr_confidence: number | null;
  is_favorite: boolean;
  created_at: string;
  updated_at: string;
  last_accessed_at: string | null;
}

export interface DocumentCreateInput {
  category_id?: number | null;
  original_filename: string;
  file_size: number;
  mime_type: string;
  file_content: ArrayBuffer | Uint8Array; // Raw file content to encrypt
  page_count?: number;
}

export interface DocumentUpdateInput {
  category_id?: number | null;
  filename?: string;
  is_favorite?: boolean;
  ocr_text?: string | null;
  ocr_confidence?: number | null;
}

export interface DocumentWithCategory extends Document {
  category_name: string | null;
  category_icon: string | null;
  category_color: string | null;
}

export interface DocumentSearchResult extends DocumentWithCategory {
  relevance_score: number;
  match_snippet: string | null;
  tags: Tag[];
}

export interface Tag {
  id: number;
  user_id: number;
  name: string;
  color: string;
  created_at: string;
}

export interface TagCreateInput {
  name: string;
  color?: string;
}

export interface DocumentStats {
  totalDocuments: number;
  totalSize: number;
  totalSizeFormatted: string;
  documentsByType: Record<string, number>;
  recentlyAdded: number; // Last 7 days
  recentlyAccessed: number; // Last 7 days
}

export interface DocumentFilter {
  category_id?: number | null;
  is_favorite?: boolean;
  mime_type?: string;
  date_from?: string;
  date_to?: string;
  tags?: number[];
  search_query?: string;
  sort_by?: 'created_at' | 'updated_at' | 'filename' | 'file_size' | 'last_accessed_at';
  sort_order?: 'ASC' | 'DESC';
  limit?: number;
  offset?: number;
}

/**
 * Supported document MIME types
 */
export const SUPPORTED_MIME_TYPES = {
  // Images
  'image/jpeg': ['.jpg', '.jpeg'],
  'image/png': ['.png'],
  'image/gif': ['.gif'],
  'image/webp': ['.webp'],
  'image/heic': ['.heic'],
  'image/heif': ['.heif'],
  
  // PDFs
  'application/pdf': ['.pdf'],
  
  // Documents
  'application/msword': ['.doc'],
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
  'application/vnd.ms-excel': ['.xls'],
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
  'application/vnd.ms-powerpoint': ['.ppt'],
  'application/vnd.openxmlformats-officedocument.presentationml.presentation': ['.pptx'],
  
  // Text
  'text/plain': ['.txt'],
  'text/csv': ['.csv'],
  'text/markdown': ['.md'],
  
  // Archives
  'application/zip': ['.zip'],
  'application/x-rar-compressed': ['.rar'],
} as const;

export type SupportedMimeType = keyof typeof SUPPORTED_MIME_TYPES;

/**
 * Document type categories for classification
 */
export enum DocumentType {
  UNKNOWN = 'unknown',
  INVOICE = 'invoice',
  RECEIPT = 'receipt',
  CONTRACT = 'contract',
  ID_CARD = 'id_card',
  BUSINESS_CARD = 'business_card',
  LETTER = 'letter',
  FORM = 'form',
  REPORT = 'report',
  CERTIFICATE = 'certificate',
  LEGAL = 'legal',
  FINANCIAL = 'financial',
  MEDICAL = 'medical',
  EDUCATIONAL = 'educational',
  PERSONAL = 'personal',
  OTHER = 'other',
}

/**
 * Document validation rules
 */
export const DOCUMENT_VALIDATION = {
  MAX_FILE_SIZE: 50 * 1024 * 1024, // 50 MB
  MAX_FILENAME_LENGTH: 255,
  MIN_FILENAME_LENGTH: 1,
  THUMBNAIL_MAX_SIZE: 200, // 200x200 pixels
  THUMBNAIL_QUALITY: 0.8, // 80% quality
} as const;

/**
 * OCR confidence thresholds
 */
export const OCR_THRESHOLDS = {
  HIGH: 0.9, // High confidence (>90%)
  MEDIUM: 0.7, // Medium confidence (70-90%)
  LOW: 0.5, // Low confidence (50-70%)
  UNUSABLE: 0.5, // Below 50% is considered unusable
} as const;

/**
 * File size formatter utility type
 */
export interface FileSizeFormatted {
  value: number;
  unit: 'B' | 'KB' | 'MB' | 'GB';
  formatted: string;
}

/**
 * Upload progress tracking
 */
export interface UploadProgress {
  uploadId: string;
  filename: string;
  totalBytes: number;
  uploadedBytes: number;
  percentage: number;
  status: 'pending' | 'encrypting' | 'uploading' | 'processing' | 'complete' | 'error';
  error?: string;
  startTime: number;
  estimatedTimeRemaining?: number;
}

/**
 * Document encryption metadata
 */
export interface EncryptionMetadata {
  algorithm: 'AES-256-GCM' | 'AES-256-CBC';
  key: string; // Base64 encoded
  iv: string; // Base64 encoded
  authTag?: string; // For GCM mode
}

/**
 * Document picker result
 */
export interface DocumentPickerResult {
  uri: string;
  name: string;
  size: number;
  mimeType?: string;
  lastModified?: number;
}

/**
 * Document upload options
 */
export interface DocumentUploadOptions {
  categoryId?: number | null;
  autoOCR?: boolean;
  generateThumbnail?: boolean;
  onProgress?: (progress: UploadProgress) => void;
}
