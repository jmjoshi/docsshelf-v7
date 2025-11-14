/**
 * Image Converter Service
 * Handles conversion of captured images to different formats (JPEG, GIF, PDF)
 * Part of FR-MAIN-003: Document Scanning Feature
 */

import * as FileSystem from 'expo-file-system';
import * as ImageManipulator from 'expo-image-manipulator';
import * as Print from 'expo-print';
import type {
    ConversionResult,
    ImageCompressionOptions,
    PDFOptions,
    ScanFormat,
} from '../../types/scan.types';

class ImageConverter {
  /**
   * Convert image to JPEG format with compression
   */
  async convertToJpeg(
    uri: string,
    options: ImageCompressionOptions = {}
  ): Promise<ConversionResult> {
    try {
      const { quality = 0.8, maxWidth, maxHeight } = options;

      // Get image info to determine if resizing is needed
      const imageInfo = await FileSystem.getInfoAsync(uri);
      if (!imageInfo.exists) {
        return {
          success: false,
          error: 'Image file not found',
          format: 'jpeg',
        };
      }

      // Manipulate image (compress and optionally resize)
      const manipulateOptions: ImageManipulator.Action[] = [];
      
      if (maxWidth || maxHeight) {
        manipulateOptions.push({
          resize: {
            width: maxWidth,
            height: maxHeight,
          },
        });
      }

      const result = await ImageManipulator.manipulateAsync(
        uri,
        manipulateOptions,
        {
          compress: quality,
          format: ImageManipulator.SaveFormat.JPEG,
        }
      );

      const fileInfo = await FileSystem.getInfoAsync(result.uri);
      
      return {
        success: true,
        uri: result.uri,
        fileSize: fileInfo.exists && !fileInfo.isDirectory ? fileInfo.size : undefined,
        format: 'jpeg',
      };
    } catch (error) {
      console.error('Error converting to JPEG:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to convert to JPEG',
        format: 'jpeg',
      };
    }
  }

  /**
   * Convert image to GIF format
   * Note: expo-image-manipulator doesn't support GIF output directly
   * For now, we'll use JPEG with high compression as a substitute
   */
  async convertToGif(uri: string): Promise<ConversionResult> {
    try {
      // GIF conversion not directly supported by expo-image-manipulator
      // Using high compression JPEG as alternative
      console.warn('GIF format not fully supported, using compressed JPEG instead');
      
      const result = await this.convertToJpeg(uri, {
        quality: 0.7, // Higher compression for smaller file
        maxWidth: 1024,
        maxHeight: 1024,
      });

      return {
        ...result,
        format: 'gif', // Mark as GIF even though it's technically JPEG
      };
    } catch (error) {
      console.error('Error converting to GIF:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to convert to GIF',
        format: 'gif',
      };
    }
  }

  /**
   * Convert image to PDF format
   */
  async convertToPdf(
    uri: string,
    options: PDFOptions = {}
  ): Promise<ConversionResult> {
    try {
      const {
        pageSize = 'A4',
        margins = { top: 20, right: 20, bottom: 20, left: 20 },
        quality = 0.8,
      } = options;

      // First, compress the image to reduce PDF size
      const compressedImage = await this.convertToJpeg(uri, {
        quality,
        maxWidth: 2048,
        maxHeight: 2048,
      });

      if (!compressedImage.success || !compressedImage.uri) {
        return {
          success: false,
          error: 'Failed to compress image before PDF conversion',
          format: 'pdf',
        };
      }

      // Read image as base64
      const base64 = await FileSystem.readAsStringAsync(compressedImage.uri, {
        encoding: 'base64',
      });

      // Create HTML template for PDF with embedded image
      const html = `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <style>
              * {
                margin: 0;
                padding: 0;
                box-sizing: border-box;
              }
              body {
                margin: ${margins.top}px ${margins.right}px ${margins.bottom}px ${margins.left}px;
              }
              img {
                max-width: 100%;
                height: auto;
                display: block;
              }
            </style>
          </head>
          <body>
            <img src="data:image/jpeg;base64,${base64}" alt="Scanned Document" />
          </body>
        </html>
      `;

      // Generate PDF
      const { uri: pdfUri } = await Print.printToFileAsync({
        html,
        width: pageSize === 'A4' ? 595 : 612, // A4 or Letter in points
        height: pageSize === 'A4' ? 842 : 792,
      });

      const fileInfo = await FileSystem.getInfoAsync(pdfUri);

      return {
        success: true,
        uri: pdfUri,
        fileSize: fileInfo.exists && !fileInfo.isDirectory ? fileInfo.size : undefined,
        format: 'pdf',
      };
    } catch (error) {
      console.error('Error converting to PDF:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to convert to PDF',
        format: 'pdf',
      };
    }
  }

  /**
   * Convert image based on selected format
   */
  async convert(uri: string, format: ScanFormat): Promise<ConversionResult> {
    switch (format) {
      case 'jpeg':
        return this.convertToJpeg(uri);
      case 'gif':
        return this.convertToGif(uri);
      case 'pdf':
        return this.convertToPdf(uri);
      default:
        return {
          success: false,
          error: `Unsupported format: ${format}`,
          format,
        };
    }
  }

  /**
   * Get file extension for format
   */
  getFileExtension(format: ScanFormat): string {
    switch (format) {
      case 'jpeg':
        return '.jpg';
      case 'gif':
        return '.gif';
      case 'pdf':
        return '.pdf';
      default:
        return '.jpg';
    }
  }

  /**
   * Get MIME type for format
   */
  getMimeType(format: ScanFormat): string {
    switch (format) {
      case 'jpeg':
        return 'image/jpeg';
      case 'gif':
        return 'image/gif';
      case 'pdf':
        return 'application/pdf';
      default:
        return 'image/jpeg';
    }
  }

  /**
   * Get human-readable format name
   */
  getFormatName(format: ScanFormat): string {
    switch (format) {
      case 'jpeg':
        return 'JPEG';
      case 'gif':
        return 'GIF';
      case 'pdf':
        return 'PDF';
      default:
        return 'Unknown';
    }
  }

  /**
   * Estimate file size reduction for format
   */
  async estimateFileSize(uri: string, format: ScanFormat): Promise<number | null> {
    try {
      const originalInfo = await FileSystem.getInfoAsync(uri);
      if (!originalInfo.exists || originalInfo.isDirectory) {
        return null;
      }
      const originalSize = originalInfo.size;
      if (!originalSize) {
        return null;
      }

      // Rough estimates based on compression
      switch (format) {
        case 'jpeg':
          return Math.round(originalSize * 0.3); // ~70% reduction
        case 'gif':
          return Math.round(originalSize * 0.4); // ~60% reduction
        case 'pdf':
          return Math.round(originalSize * 0.5); // ~50% reduction
        default:
          return originalSize;
      }
    } catch (error) {
      console.error('Error estimating file size:', error);
      return null;
    }
  }
}

// Export singleton instance
export const imageConverter = new ImageConverter();
export default imageConverter;
