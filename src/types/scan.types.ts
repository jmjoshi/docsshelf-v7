/**
 * Type definitions for document scanning feature (FR-MAIN-003)
 */

/**
 * Supported output formats for scanned documents
 */
export type ScanFormat = 'jpeg' | 'gif' | 'pdf';

/**
 * Format option for user selection
 */
export interface FormatOption {
  format: ScanFormat;
  label: string;
  description: string;
  icon: string;
  fileExtension: string;
  mimeType: string;
  recommended?: boolean;
}

/**
 * Camera permission status
 */
export type CameraPermissionStatus = 'undetermined' | 'granted' | 'denied';

/**
 * Flash mode options
 */
export type FlashMode = 'on' | 'off' | 'auto';

/**
 * Camera state
 */
export interface CameraState {
  hasPermission: boolean | null;
  flashMode: FlashMode;
  isCapturing: boolean;
  error: string | null;
}

/**
 * Captured image data
 */
export interface CapturedImage {
  uri: string;
  width: number;
  height: number;
  format: ScanFormat;
  base64?: string;
}

/**
 * Preview screen state
 */
export interface PreviewState {
  isProcessing: boolean;
  processedUri: string | null;
  error: string | null;
}

/**
 * PDF generation options
 */
export interface PDFOptions {
  pageSize?: 'A4' | 'LETTER';
  orientation?: 'portrait' | 'landscape';
  margins?: {
    top: number;
    right: number;
    bottom: number;
    left: number;
  };
  quality?: number; // 0.0 to 1.0
}

/**
 * Image compression options
 */
export interface ImageCompressionOptions {
  quality?: number; // 0.0 to 1.0
  maxWidth?: number;
  maxHeight?: number;
}

/**
 * Result of image conversion
 */
export interface ConversionResult {
  success: boolean;
  uri?: string;
  error?: string;
  fileSize?: number;
  format: ScanFormat;
}

/**
 * Scan session data
 */
export interface ScanSession {
  id: string;
  format: ScanFormat;
  capturedAt: Date;
  imageUri: string;
  processedUri?: string;
  status: 'capturing' | 'previewing' | 'processing' | 'complete' | 'error';
}
