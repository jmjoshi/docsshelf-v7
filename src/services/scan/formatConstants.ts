/**
 * Format Selection Constants
 * Defines available scan formats and their properties
 * Part of FR-MAIN-003: Document Scanning Feature
 */

import type { FormatOption, ScanFormat } from '../../types/scan.types';

/**
 * Available scan formats with their properties
 */
export const SCAN_FORMATS: FormatOption[] = [
  {
    format: 'jpeg',
    label: 'JPEG',
    description: 'Best for photos and images',
    icon: 'image',
    fileExtension: '.jpg',
    mimeType: 'image/jpeg',
    recommended: true,
  },
  {
    format: 'pdf',
    label: 'PDF',
    description: 'Standard document format',
    icon: 'document-text',
    fileExtension: '.pdf',
    mimeType: 'application/pdf',
    recommended: false,
  },
  {
    format: 'gif',
    label: 'GIF',
    description: 'Compact file size',
    icon: 'sparkles',
    fileExtension: '.gif',
    mimeType: 'image/gif',
    recommended: false,
  },
];

/**
 * Get format option by format type
 */
export function getFormatOption(format: ScanFormat): FormatOption | undefined {
  return SCAN_FORMATS.find((f) => f.format === format);
}

/**
 * Get format label
 */
export function getFormatLabel(format: ScanFormat): string {
  return getFormatOption(format)?.label || format.toUpperCase();
}

/**
 * Get format description
 */
export function getFormatDescription(format: ScanFormat): string {
  return getFormatOption(format)?.description || '';
}

/**
 * Get recommended format
 */
export function getRecommendedFormat(): ScanFormat {
  return SCAN_FORMATS.find((f) => f.recommended)?.format || 'jpeg';
}

/**
 * Default scan options
 */
export const DEFAULT_SCAN_OPTIONS = {
  format: 'jpeg' as ScanFormat,
  quality: 0.8,
  maxWidth: 2048,
  maxHeight: 2048,
};
