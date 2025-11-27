import {
  SUPPORTED_MIME_TYPES,
  DocumentType,
  DOCUMENT_VALIDATION,
  OCR_THRESHOLDS,
} from '../../src/types/document';

describe('Document Type Constants', () => {
  describe('SUPPORTED_MIME_TYPES', () => {
    describe('Images', () => {
      it('should support JPEG images', () => {
        expect(SUPPORTED_MIME_TYPES['image/jpeg']).toEqual(['.jpg', '.jpeg']);
      });

      it('should support PNG images', () => {
        expect(SUPPORTED_MIME_TYPES['image/png']).toEqual(['.png']);
      });

      it('should support GIF images', () => {
        expect(SUPPORTED_MIME_TYPES['image/gif']).toEqual(['.gif']);
      });

      it('should support modern image formats', () => {
        expect(SUPPORTED_MIME_TYPES['image/webp']).toEqual(['.webp']);
        expect(SUPPORTED_MIME_TYPES['image/heic']).toEqual(['.heic']);
        expect(SUPPORTED_MIME_TYPES['image/heif']).toEqual(['.heif']);
      });

      it('should support SVG images', () => {
        expect(SUPPORTED_MIME_TYPES['image/svg+xml']).toEqual(['.svg']);
      });
    });

    describe('PDFs', () => {
      it('should support PDF documents', () => {
        expect(SUPPORTED_MIME_TYPES['application/pdf']).toEqual(['.pdf']);
      });
    });

    describe('Microsoft Office Documents', () => {
      it('should support Word documents', () => {
        expect(SUPPORTED_MIME_TYPES['application/msword']).toEqual(['.doc']);
        expect(SUPPORTED_MIME_TYPES['application/vnd.openxmlformats-officedocument.wordprocessingml.document']).toEqual(['.docx']);
      });

      it('should support Excel spreadsheets', () => {
        expect(SUPPORTED_MIME_TYPES['application/vnd.ms-excel']).toEqual(['.xls']);
        expect(SUPPORTED_MIME_TYPES['application/vnd.openxmlformats-officedocument.spreadsheetml.sheet']).toEqual(['.xlsx']);
      });

      it('should support PowerPoint presentations', () => {
        expect(SUPPORTED_MIME_TYPES['application/vnd.ms-powerpoint']).toEqual(['.ppt']);
        expect(SUPPORTED_MIME_TYPES['application/vnd.openxmlformats-officedocument.presentationml.presentation']).toEqual(['.pptx']);
      });
    });

    describe('Text Files', () => {
      it('should support plain text', () => {
        expect(SUPPORTED_MIME_TYPES['text/plain']).toEqual(['.txt']);
      });

      it('should support CSV files', () => {
        expect(SUPPORTED_MIME_TYPES['text/csv']).toEqual(['.csv']);
      });

      it('should support markdown', () => {
        expect(SUPPORTED_MIME_TYPES['text/markdown']).toEqual(['.md']);
      });

      it('should support web formats', () => {
        expect(SUPPORTED_MIME_TYPES['text/html']).toEqual(['.html', '.htm']);
        expect(SUPPORTED_MIME_TYPES['text/css']).toEqual(['.css']);
        expect(SUPPORTED_MIME_TYPES['application/javascript']).toEqual(['.js']);
      });
    });

    describe('Code Files', () => {
      it('should support Python files', () => {
        expect(SUPPORTED_MIME_TYPES['text/x-python']).toEqual(['.py']);
      });

      it('should support Java files', () => {
        expect(SUPPORTED_MIME_TYPES['text/x-java']).toEqual(['.java']);
      });

      it('should support C/C++ files', () => {
        expect(SUPPORTED_MIME_TYPES['text/x-c']).toEqual(['.c', '.h']);
        expect(SUPPORTED_MIME_TYPES['text/x-c++']).toEqual(['.cpp', '.hpp']);
      });

      it('should support TypeScript files', () => {
        expect(SUPPORTED_MIME_TYPES['text/x-typescript']).toEqual(['.ts', '.tsx']);
      });
    });

    describe('Archives', () => {
      it('should support ZIP files', () => {
        expect(SUPPORTED_MIME_TYPES['application/zip']).toEqual(['.zip']);
      });

      it('should support various compression formats', () => {
        expect(SUPPORTED_MIME_TYPES['application/x-rar-compressed']).toEqual(['.rar']);
        expect(SUPPORTED_MIME_TYPES['application/x-7z-compressed']).toEqual(['.7z']);
        expect(SUPPORTED_MIME_TYPES['application/x-tar']).toEqual(['.tar']);
        expect(SUPPORTED_MIME_TYPES['application/gzip']).toEqual(['.gz']);
      });
    });

    describe('Media Files', () => {
      it('should support audio formats', () => {
        expect(SUPPORTED_MIME_TYPES['audio/mpeg']).toEqual(['.mp3']);
        expect(SUPPORTED_MIME_TYPES['audio/wav']).toEqual(['.wav']);
        expect(SUPPORTED_MIME_TYPES['audio/ogg']).toEqual(['.ogg']);
      });

      it('should support video formats', () => {
        expect(SUPPORTED_MIME_TYPES['video/mp4']).toEqual(['.mp4']);
        expect(SUPPORTED_MIME_TYPES['video/quicktime']).toEqual(['.mov']);
        expect(SUPPORTED_MIME_TYPES['video/webm']).toEqual(['.webm']);
      });
    });

    it('should have all extensions start with dot', () => {
      Object.values(SUPPORTED_MIME_TYPES).forEach(extensions => {
        extensions.forEach(ext => {
          expect(ext).toMatch(/^\./);
        });
      });
    });

    it('should have lowercase extensions', () => {
      Object.values(SUPPORTED_MIME_TYPES).forEach(extensions => {
        extensions.forEach(ext => {
          expect(ext).toBe(ext.toLowerCase());
        });
      });
    });
  });

  describe('DocumentType Enum', () => {
    it('should have all required document type categories', () => {
      expect(DocumentType.UNKNOWN).toBe('unknown');
      expect(DocumentType.INVOICE).toBe('invoice');
      expect(DocumentType.RECEIPT).toBe('receipt');
      expect(DocumentType.CONTRACT).toBe('contract');
      expect(DocumentType.ID_CARD).toBe('id_card');
      expect(DocumentType.BUSINESS_CARD).toBe('business_card');
      expect(DocumentType.LETTER).toBe('letter');
      expect(DocumentType.FORM).toBe('form');
      expect(DocumentType.REPORT).toBe('report');
      expect(DocumentType.CERTIFICATE).toBe('certificate');
      expect(DocumentType.LEGAL).toBe('legal');
      expect(DocumentType.FINANCIAL).toBe('financial');
      expect(DocumentType.MEDICAL).toBe('medical');
      expect(DocumentType.EDUCATIONAL).toBe('educational');
      expect(DocumentType.PERSONAL).toBe('personal');
      expect(DocumentType.OTHER).toBe('other');
    });

    it('should use snake_case for multi-word types', () => {
      expect(DocumentType.ID_CARD).toContain('_');
      expect(DocumentType.BUSINESS_CARD).toContain('_');
    });

    it('should have OTHER as fallback category', () => {
      expect(DocumentType.OTHER).toBe('other');
    });
  });

  describe('DOCUMENT_VALIDATION', () => {
    it('should have maximum file size of 50MB', () => {
      expect(DOCUMENT_VALIDATION.MAX_FILE_SIZE).toBe(50 * 1024 * 1024);
      expect(DOCUMENT_VALIDATION.MAX_FILE_SIZE).toBe(52428800);
    });

    it('should have reasonable filename length limits', () => {
      expect(DOCUMENT_VALIDATION.MAX_FILENAME_LENGTH).toBe(255);
      expect(DOCUMENT_VALIDATION.MIN_FILENAME_LENGTH).toBe(1);
    });

    it('should require at least 1 character filename', () => {
      expect(DOCUMENT_VALIDATION.MIN_FILENAME_LENGTH).toBeGreaterThan(0);
    });

    it('should have thumbnail constraints', () => {
      expect(DOCUMENT_VALIDATION.THUMBNAIL_MAX_SIZE).toBe(200);
      expect(DOCUMENT_VALIDATION.THUMBNAIL_QUALITY).toBe(0.8);
    });

    it('should have thumbnail quality between 0 and 1', () => {
      expect(DOCUMENT_VALIDATION.THUMBNAIL_QUALITY).toBeGreaterThan(0);
      expect(DOCUMENT_VALIDATION.THUMBNAIL_QUALITY).toBeLessThanOrEqual(1);
    });
  });

  describe('OCR_THRESHOLDS', () => {
    it('should have HIGH confidence threshold at 90%', () => {
      expect(OCR_THRESHOLDS.HIGH).toBe(0.9);
    });

    it('should have MEDIUM confidence threshold at 70%', () => {
      expect(OCR_THRESHOLDS.MEDIUM).toBe(0.7);
    });

    it('should have LOW confidence threshold at 50%', () => {
      expect(OCR_THRESHOLDS.LOW).toBe(0.5);
    });

    it('should have UNUSABLE threshold at 50%', () => {
      expect(OCR_THRESHOLDS.UNUSABLE).toBe(0.5);
    });

    it('should have descending threshold values', () => {
      expect(OCR_THRESHOLDS.HIGH).toBeGreaterThan(OCR_THRESHOLDS.MEDIUM);
      expect(OCR_THRESHOLDS.MEDIUM).toBeGreaterThan(OCR_THRESHOLDS.LOW);
      expect(OCR_THRESHOLDS.LOW).toBeGreaterThanOrEqual(OCR_THRESHOLDS.UNUSABLE);
    });

    it('should have all thresholds between 0 and 1', () => {
      expect(OCR_THRESHOLDS.HIGH).toBeLessThanOrEqual(1);
      expect(OCR_THRESHOLDS.HIGH).toBeGreaterThanOrEqual(0);
      expect(OCR_THRESHOLDS.MEDIUM).toBeLessThanOrEqual(1);
      expect(OCR_THRESHOLDS.MEDIUM).toBeGreaterThanOrEqual(0);
      expect(OCR_THRESHOLDS.LOW).toBeLessThanOrEqual(1);
      expect(OCR_THRESHOLDS.LOW).toBeGreaterThanOrEqual(0);
    });
  });
});
