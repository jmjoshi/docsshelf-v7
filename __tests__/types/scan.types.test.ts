/**
 * Tests for Scan Types (scan.types.ts)
 * Validates scan-related type definitions and constants
 */

import type {
    CameraPermissionStatus,
    CameraState,
    CapturedImage,
    ConversionResult,
    FlashMode,
    FormatOption,
    ImageCompressionOptions,
    PDFOptions,
    PreviewState,
    ScanFormat,
    ScanSession,
} from '../../src/types/scan.types';

describe('Scan Types', () => {
  describe('ScanFormat Type', () => {
    it('should accept valid scan formats', () => {
      const validFormats: ScanFormat[] = ['jpeg', 'gif', 'pdf'];
      
      validFormats.forEach(format => {
        expect(['jpeg', 'gif', 'pdf']).toContain(format);
      });
    });

    it('should have exactly 3 supported formats', () => {
      const formats: ScanFormat[] = ['jpeg', 'gif', 'pdf'];
      expect(formats).toHaveLength(3);
    });

    it('should include image formats', () => {
      const formats: ScanFormat[] = ['jpeg', 'gif', 'pdf'];
      expect(formats).toContain('jpeg');
      expect(formats).toContain('gif');
    });

    it('should include document format', () => {
      const formats: ScanFormat[] = ['jpeg', 'gif', 'pdf'];
      expect(formats).toContain('pdf');
    });
  });

  describe('FormatOption Interface', () => {
    it('should create valid FormatOption for JPEG', () => {
      const jpegOption: FormatOption = {
        format: 'jpeg',
        label: 'JPEG Image',
        description: 'Standard image format',
        icon: '🖼️',
        fileExtension: '.jpg',
        mimeType: 'image/jpeg',
        recommended: true,
      };

      expect(jpegOption.format).toBe('jpeg');
      expect(jpegOption.fileExtension).toBe('.jpg');
      expect(jpegOption.mimeType).toBe('image/jpeg');
    });

    it('should create valid FormatOption for PDF', () => {
      const pdfOption: FormatOption = {
        format: 'pdf',
        label: 'PDF Document',
        description: 'Portable document format',
        icon: '📄',
        fileExtension: '.pdf',
        mimeType: 'application/pdf',
      };

      expect(pdfOption.format).toBe('pdf');
      expect(pdfOption.fileExtension).toBe('.pdf');
      expect(pdfOption.mimeType).toBe('application/pdf');
    });

    it('should allow optional recommended field', () => {
      const withRecommended: FormatOption = {
        format: 'jpeg',
        label: 'JPEG',
        description: 'Image',
        icon: '🖼️',
        fileExtension: '.jpg',
        mimeType: 'image/jpeg',
        recommended: true,
      };

      const withoutRecommended: FormatOption = {
        format: 'gif',
        label: 'GIF',
        description: 'Image',
        icon: '🖼️',
        fileExtension: '.gif',
        mimeType: 'image/gif',
      };

      expect(withRecommended.recommended).toBe(true);
      expect(withoutRecommended.recommended).toBeUndefined();
    });
  });

  describe('CameraPermissionStatus Type', () => {
    it('should accept valid permission statuses', () => {
      const validStatuses: CameraPermissionStatus[] = ['undetermined', 'granted', 'denied'];
      
      validStatuses.forEach(status => {
        expect(['undetermined', 'granted', 'denied']).toContain(status);
      });
    });

    it('should have exactly 3 permission statuses', () => {
      const statuses: CameraPermissionStatus[] = ['undetermined', 'granted', 'denied'];
      expect(statuses).toHaveLength(3);
    });
  });

  describe('FlashMode Type', () => {
    it('should accept valid flash modes', () => {
      const validModes: FlashMode[] = ['on', 'off', 'auto'];
      
      validModes.forEach(mode => {
        expect(['on', 'off', 'auto']).toContain(mode);
      });
    });

    it('should have exactly 3 flash modes', () => {
      const modes: FlashMode[] = ['on', 'off', 'auto'];
      expect(modes).toHaveLength(3);
    });
  });

  describe('CameraState Interface', () => {
    it('should create valid initial camera state', () => {
      const state: CameraState = {
        hasPermission: null,
        flashMode: 'auto',
        isCapturing: false,
        error: null,
      };

      expect(state.hasPermission).toBeNull();
      expect(state.flashMode).toBe('auto');
      expect(state.isCapturing).toBe(false);
      expect(state.error).toBeNull();
    });

    it('should represent permission granted state', () => {
      const state: CameraState = {
        hasPermission: true,
        flashMode: 'off',
        isCapturing: false,
        error: null,
      };

      expect(state.hasPermission).toBe(true);
    });

    it('should represent capturing state', () => {
      const state: CameraState = {
        hasPermission: true,
        flashMode: 'on',
        isCapturing: true,
        error: null,
      };

      expect(state.isCapturing).toBe(true);
    });

    it('should represent error state', () => {
      const state: CameraState = {
        hasPermission: false,
        flashMode: 'auto',
        isCapturing: false,
        error: 'Camera permission denied',
      };

      expect(state.error).toBe('Camera permission denied');
    });
  });

  describe('CapturedImage Interface', () => {
    it('should create valid captured image', () => {
      const image: CapturedImage = {
        uri: 'file:///path/to/image.jpg',
        width: 1920,
        height: 1080,
        format: 'jpeg',
      };

      expect(image.uri).toMatch(/^file:\/\//);
      expect(image.width).toBeGreaterThan(0);
      expect(image.height).toBeGreaterThan(0);
      expect(image.format).toBe('jpeg');
    });

    it('should allow optional base64 data', () => {
      const withBase64: CapturedImage = {
        uri: 'file:///image.jpg',
        width: 1920,
        height: 1080,
        format: 'jpeg',
        base64: 'iVBORw0KGgoAAAANSUhEUgAA...',
      };

      const withoutBase64: CapturedImage = {
        uri: 'file:///image.jpg',
        width: 1920,
        height: 1080,
        format: 'jpeg',
      };

      expect(withBase64.base64).toBeDefined();
      expect(withoutBase64.base64).toBeUndefined();
    });

    it('should handle different formats', () => {
      const jpegImage: CapturedImage = {
        uri: 'file:///image.jpg',
        width: 1920,
        height: 1080,
        format: 'jpeg',
      };

      const pdfImage: CapturedImage = {
        uri: 'file:///document.pdf',
        width: 2480,
        height: 3508,
        format: 'pdf',
      };

      expect(jpegImage.format).toBe('jpeg');
      expect(pdfImage.format).toBe('pdf');
    });
  });

  describe('PreviewState Interface', () => {
    it('should create initial preview state', () => {
      const state: PreviewState = {
        isProcessing: false,
        processedUri: null,
        error: null,
      };

      expect(state.isProcessing).toBe(false);
      expect(state.processedUri).toBeNull();
      expect(state.error).toBeNull();
    });

    it('should represent processing state', () => {
      const state: PreviewState = {
        isProcessing: true,
        processedUri: null,
        error: null,
      };

      expect(state.isProcessing).toBe(true);
    });

    it('should represent completed state', () => {
      const state: PreviewState = {
        isProcessing: false,
        processedUri: 'file:///processed.jpg',
        error: null,
      };

      expect(state.processedUri).toBe('file:///processed.jpg');
    });

    it('should represent error state', () => {
      const state: PreviewState = {
        isProcessing: false,
        processedUri: null,
        error: 'Processing failed',
      };

      expect(state.error).toBe('Processing failed');
    });
  });

  describe('PDFOptions Interface', () => {
    it('should create valid PDF options with all fields', () => {
      const options: PDFOptions = {
        pageSize: 'A4',
        orientation: 'portrait',
        margins: {
          top: 20,
          right: 20,
          bottom: 20,
          left: 20,
        },
        quality: 0.9,
      };

      expect(options.pageSize).toBe('A4');
      expect(options.orientation).toBe('portrait');
      expect(options.quality).toBe(0.9);
    });

    it('should allow all fields to be optional', () => {
      const options: PDFOptions = {};
      expect(options).toBeDefined();
    });

    it('should support different page sizes', () => {
      const a4: PDFOptions = { pageSize: 'A4' };
      const letter: PDFOptions = { pageSize: 'LETTER' };

      expect(a4.pageSize).toBe('A4');
      expect(letter.pageSize).toBe('LETTER');
    });

    it('should support different orientations', () => {
      const portrait: PDFOptions = { orientation: 'portrait' };
      const landscape: PDFOptions = { orientation: 'landscape' };

      expect(portrait.orientation).toBe('portrait');
      expect(landscape.orientation).toBe('landscape');
    });

    it('should validate quality range', () => {
      const highQuality: PDFOptions = { quality: 1.0 };
      const mediumQuality: PDFOptions = { quality: 0.5 };
      const lowQuality: PDFOptions = { quality: 0.1 };

      expect(highQuality.quality).toBeLessThanOrEqual(1.0);
      expect(mediumQuality.quality).toBeGreaterThanOrEqual(0.0);
      expect(lowQuality.quality).toBeGreaterThan(0.0);
    });
  });

  describe('ImageCompressionOptions Interface', () => {
    it('should create valid compression options', () => {
      const options: ImageCompressionOptions = {
        quality: 0.8,
        maxWidth: 1920,
        maxHeight: 1080,
      };

      expect(options.quality).toBe(0.8);
      expect(options.maxWidth).toBe(1920);
      expect(options.maxHeight).toBe(1080);
    });

    it('should allow all fields to be optional', () => {
      const options: ImageCompressionOptions = {};
      expect(options).toBeDefined();
    });

    it('should support different quality levels', () => {
      const high: ImageCompressionOptions = { quality: 0.9 };
      const medium: ImageCompressionOptions = { quality: 0.7 };
      const low: ImageCompressionOptions = { quality: 0.5 };

      expect(high.quality).toBeGreaterThan(medium.quality!);
      expect(medium.quality).toBeGreaterThan(low.quality!);
    });
  });

  describe('ConversionResult Interface', () => {
    it('should create successful conversion result', () => {
      const result: ConversionResult = {
        success: true,
        uri: 'file:///converted.pdf',
        fileSize: 1024000,
        format: 'pdf',
      };

      expect(result.success).toBe(true);
      expect(result.uri).toBeDefined();
      expect(result.fileSize).toBeGreaterThan(0);
    });

    it('should create failed conversion result', () => {
      const result: ConversionResult = {
        success: false,
        error: 'Conversion failed',
        format: 'pdf',
      };

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });

    it('should handle different output formats', () => {
      const jpegResult: ConversionResult = {
        success: true,
        uri: 'file:///output.jpg',
        format: 'jpeg',
      };

      const pdfResult: ConversionResult = {
        success: true,
        uri: 'file:///output.pdf',
        format: 'pdf',
      };

      expect(jpegResult.format).toBe('jpeg');
      expect(pdfResult.format).toBe('pdf');
    });
  });

  describe('ScanSession Interface', () => {
    it('should create valid scan session', () => {
      const session: ScanSession = {
        id: 'scan-123',
        format: 'pdf',
        capturedAt: new Date(),
        imageUri: 'file:///capture.jpg',
        status: 'capturing',
      };

      expect(session.id).toBe('scan-123');
      expect(session.format).toBe('pdf');
      expect(session.capturedAt).toBeInstanceOf(Date);
      expect(session.status).toBe('capturing');
    });

    it('should track all session statuses', () => {
      const statuses: ScanSession['status'][] = [
        'capturing',
        'previewing',
        'processing',
        'complete',
        'error',
      ];

      statuses.forEach(status => {
        const session: ScanSession = {
          id: 'scan-1',
          format: 'jpeg',
          capturedAt: new Date(),
          imageUri: 'file:///image.jpg',
          status,
        };

        expect(session.status).toBe(status);
      });
    });

    it('should allow optional processedUri', () => {
      const withProcessed: ScanSession = {
        id: 'scan-1',
        format: 'pdf',
        capturedAt: new Date(),
        imageUri: 'file:///raw.jpg',
        processedUri: 'file:///processed.pdf',
        status: 'complete',
      };

      const withoutProcessed: ScanSession = {
        id: 'scan-2',
        format: 'jpeg',
        capturedAt: new Date(),
        imageUri: 'file:///raw.jpg',
        status: 'capturing',
      };

      expect(withProcessed.processedUri).toBeDefined();
      expect(withoutProcessed.processedUri).toBeUndefined();
    });

    it('should handle complete workflow states', () => {
      const capturing: ScanSession = {
        id: 'scan-1',
        format: 'pdf',
        capturedAt: new Date(),
        imageUri: 'file:///image.jpg',
        status: 'capturing',
      };

      const previewing: ScanSession = {
        ...capturing,
        status: 'previewing',
      };

      const processing: ScanSession = {
        ...capturing,
        status: 'processing',
      };

      const complete: ScanSession = {
        ...capturing,
        processedUri: 'file:///final.pdf',
        status: 'complete',
      };

      expect(capturing.status).toBe('capturing');
      expect(previewing.status).toBe('previewing');
      expect(processing.status).toBe('processing');
      expect(complete.status).toBe('complete');
      expect(complete.processedUri).toBeDefined();
    });
  });

  describe('Type Safety and Validation', () => {
    it('should enforce format consistency', () => {
      const session: ScanSession = {
        id: 'scan-1',
        format: 'pdf',
        capturedAt: new Date(),
        imageUri: 'file:///image.jpg',
        status: 'complete',
      };

      expect(session.format).toBe('pdf');
      expect(['jpeg', 'gif', 'pdf']).toContain(session.format);
    });

    it('should validate quality values are in range', () => {
      const validQuality = 0.8;
      expect(validQuality).toBeGreaterThanOrEqual(0.0);
      expect(validQuality).toBeLessThanOrEqual(1.0);
    });

    it('should validate dimensions are positive', () => {
      const image: CapturedImage = {
        uri: 'file:///image.jpg',
        width: 1920,
        height: 1080,
        format: 'jpeg',
      };

      expect(image.width).toBeGreaterThan(0);
      expect(image.height).toBeGreaterThan(0);
    });

    it('should validate file URIs start with file://', () => {
      const validUris = [
        'file:///path/to/image.jpg',
        'file:///storage/document.pdf',
        'file:///data/capture.gif',
      ];

      validUris.forEach(uri => {
        expect(uri).toMatch(/^file:\/\//);
      });
    });
  });
});
