/**
 * Image Converter Service Tests
 * Tests for FR-MAIN-003: Document Scanning Feature
 * Covers image format conversion (JPEG, GIF, PDF)
 */

import { imageConverter } from '../../../src/services/scan/imageConverter';
import * as FileSystem from 'expo-file-system';
import * as ImageManipulator from 'expo-image-manipulator';
import * as Print from 'expo-print';

// Mock expo modules
jest.mock('expo-file-system');
jest.mock('expo-image-manipulator', () => ({
  manipulateAsync: jest.fn(),
  SaveFormat: {
    JPEG: 'jpeg',
    PNG: 'png',
  },
}));
jest.mock('expo-print', () => ({
  printToFileAsync: jest.fn(),
}));

describe('ImageConverter', () => {
  const mockUri = 'file:///test/image.jpg';
  const mockConvertedUri = 'file:///test/converted.jpg';
  const mockPdfUri = 'file:///test/output.pdf';

  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, 'log').mockImplementation(() => {});
    jest.spyOn(console, 'error').mockImplementation(() => {});
    jest.spyOn(console, 'warn').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('convertToJpeg', () => {
    it('should convert image to JPEG with default options', async () => {
      (FileSystem.getInfoAsync as jest.Mock).mockResolvedValue({
        exists: true,
        isDirectory: false,
        size: 1024000,
      });

      (ImageManipulator.manipulateAsync as jest.Mock).mockResolvedValue({
        uri: mockConvertedUri,
        width: 1920,
        height: 1080,
      });

      const result = await imageConverter.convertToJpeg(mockUri);

      expect(result.success).toBe(true);
      expect(result.uri).toBe(mockConvertedUri);
      expect(result.format).toBe('jpeg');
      expect(result.fileSize).toBe(1024000);
    });

    it('should apply custom quality compression', async () => {
      (FileSystem.getInfoAsync as jest.Mock).mockResolvedValue({
        exists: true,
        isDirectory: false,
        size: 500000,
      });

      (ImageManipulator.manipulateAsync as jest.Mock).mockResolvedValue({
        uri: mockConvertedUri,
      });

      await imageConverter.convertToJpeg(mockUri, { quality: 0.5 });

      expect(ImageManipulator.manipulateAsync).toHaveBeenCalledWith(
        mockUri,
        [],
        expect.objectContaining({
          compress: 0.5,
          format: ImageManipulator.SaveFormat.JPEG,
        })
      );
    });

    it('should resize image when maxWidth/maxHeight provided', async () => {
      (FileSystem.getInfoAsync as jest.Mock).mockResolvedValue({
        exists: true,
        isDirectory: false,
        size: 1024000,
      });

      (ImageManipulator.manipulateAsync as jest.Mock).mockResolvedValue({
        uri: mockConvertedUri,
      });

      await imageConverter.convertToJpeg(mockUri, {
        quality: 0.8,
        maxWidth: 1024,
        maxHeight: 768,
      });

      expect(ImageManipulator.manipulateAsync).toHaveBeenCalledWith(
        mockUri,
        [
          {
            resize: {
              width: 1024,
              height: 768,
            },
          },
        ],
        expect.any(Object)
      );
    });

    it('should return error when image file not found', async () => {
      (FileSystem.getInfoAsync as jest.Mock).mockResolvedValue({
        exists: false,
      });

      const result = await imageConverter.convertToJpeg(mockUri);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Image file not found');
      expect(result.format).toBe('jpeg');
    });

    it('should handle conversion errors', async () => {
      (FileSystem.getInfoAsync as jest.Mock).mockResolvedValue({
        exists: true,
        isDirectory: false,
      });

      const error = new Error('Manipulation failed');
      (ImageManipulator.manipulateAsync as jest.Mock).mockRejectedValue(error);

      const result = await imageConverter.convertToJpeg(mockUri);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Manipulation failed');
      expect(console.error).toHaveBeenCalledWith('Error converting to JPEG:', error);
    });
  });

  describe('convertToGif', () => {
    it('should convert image using JPEG compression (GIF alternative)', async () => {
      (FileSystem.getInfoAsync as jest.Mock).mockResolvedValue({
        exists: true,
        isDirectory: false,
        size: 800000,
      });

      (ImageManipulator.manipulateAsync as jest.Mock).mockResolvedValue({
        uri: mockConvertedUri,
      });

      const result = await imageConverter.convertToGif(mockUri);

      expect(result.success).toBe(true);
      expect(result.format).toBe('gif');
      expect(console.warn).toHaveBeenCalledWith(
        'GIF format not fully supported, using compressed JPEG instead'
      );
    });

    it('should apply higher compression for smaller file size', async () => {
      (FileSystem.getInfoAsync as jest.Mock).mockResolvedValue({
        exists: true,
        isDirectory: false,
      });

      (ImageManipulator.manipulateAsync as jest.Mock).mockResolvedValue({
        uri: mockConvertedUri,
      });

      await imageConverter.convertToGif(mockUri);

      expect(ImageManipulator.manipulateAsync).toHaveBeenCalledWith(
        mockUri,
        expect.arrayContaining([
          expect.objectContaining({
            resize: {
              width: 1024,
              height: 1024,
            },
          }),
        ]),
        expect.objectContaining({
          compress: 0.7,
        })
      );
    });

    it('should handle GIF conversion errors', async () => {
      (FileSystem.getInfoAsync as jest.Mock).mockRejectedValue(new Error('File access error'));

      const result = await imageConverter.convertToGif(mockUri);

      expect(result.success).toBe(false);
      expect(result.error).toBe('File access error'); // Actual error from FileSystem
      expect(result.format).toBe('gif');
    });
  });

  describe('convertToPdf', () => {
    it('should convert image to PDF with default options', async () => {
      // Mock JPEG compression
      (FileSystem.getInfoAsync as jest.Mock)
        .mockResolvedValueOnce({ exists: true, isDirectory: false })
        .mockResolvedValueOnce({ exists: true, isDirectory: false, size: 500000 })
        .mockResolvedValueOnce({ exists: true, isDirectory: false, size: 500000 }); // Third call for final PDF file

      (ImageManipulator.manipulateAsync as jest.Mock).mockResolvedValue({
        uri: mockConvertedUri,
      });

      (FileSystem.readAsStringAsync as jest.Mock).mockResolvedValue('base64data');

      (Print.printToFileAsync as jest.Mock).mockResolvedValue({
        uri: mockPdfUri,
      });

      const result = await imageConverter.convertToPdf(mockUri);

      expect(result.success).toBe(true);
      expect(result.uri).toBe(mockPdfUri);
      expect(result.format).toBe('pdf');
    });

    it('should apply custom page size and margins', async () => {
      (FileSystem.getInfoAsync as jest.Mock)
        .mockResolvedValueOnce({ exists: true, isDirectory: false })
        .mockResolvedValueOnce({ exists: true, isDirectory: false });

      (ImageManipulator.manipulateAsync as jest.Mock).mockResolvedValue({
        uri: mockConvertedUri,
      });

      (FileSystem.readAsStringAsync as jest.Mock).mockResolvedValue('base64data');

      (Print.printToFileAsync as jest.Mock).mockResolvedValue({
        uri: mockPdfUri,
      });

      await imageConverter.convertToPdf(mockUri, {
        pageSize: 'LETTER',
        margins: { top: 10, right: 10, bottom: 10, left: 10 },
        quality: 0.9,
      });

      expect(Print.printToFileAsync).toHaveBeenCalledWith(
        expect.objectContaining({
          width: 612, // Letter width
          height: 792, // Letter height
        })
      );
    });

    it('should embed base64 image in HTML template', async () => {
      const mockBase64 = 'mockBase64String';

      (FileSystem.getInfoAsync as jest.Mock)
        .mockResolvedValueOnce({ exists: true, isDirectory: false })
        .mockResolvedValueOnce({ exists: true, isDirectory: false });

      (ImageManipulator.manipulateAsync as jest.Mock).mockResolvedValue({
        uri: mockConvertedUri,
      });

      (FileSystem.readAsStringAsync as jest.Mock).mockResolvedValue(mockBase64);

      (Print.printToFileAsync as jest.Mock).mockResolvedValue({
        uri: mockPdfUri,
      });

      await imageConverter.convertToPdf(mockUri);

      const printCall = (Print.printToFileAsync as jest.Mock).mock.calls[0][0];
      expect(printCall.html).toContain(`data:image/jpeg;base64,${mockBase64}`);
    });

    it('should return error if image compression fails', async () => {
      (FileSystem.getInfoAsync as jest.Mock).mockResolvedValue({
        exists: false,
      });

      const result = await imageConverter.convertToPdf(mockUri);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Failed to compress image before PDF conversion');
    });

    it('should handle PDF generation errors', async () => {
      (FileSystem.getInfoAsync as jest.Mock)
        .mockResolvedValueOnce({ exists: true, isDirectory: false })
        .mockResolvedValueOnce({ exists: true, isDirectory: false });

      (ImageManipulator.manipulateAsync as jest.Mock).mockResolvedValue({
        uri: mockConvertedUri,
      });

      (FileSystem.readAsStringAsync as jest.Mock).mockResolvedValue('base64data');

      const error = new Error('PDF generation failed');
      (Print.printToFileAsync as jest.Mock).mockRejectedValue(error);

      const result = await imageConverter.convertToPdf(mockUri);

      expect(result.success).toBe(false);
      expect(result.error).toBe('PDF generation failed');
      expect(console.error).toHaveBeenCalledWith('Error converting to PDF:', error);
    });
  });

  describe('convert', () => {
    it('should route to convertToJpeg for jpeg format', async () => {
      (FileSystem.getInfoAsync as jest.Mock).mockResolvedValue({
        exists: true,
        isDirectory: false,
      });

      (ImageManipulator.manipulateAsync as jest.Mock).mockResolvedValue({
        uri: mockConvertedUri,
      });

      const result = await imageConverter.convert(mockUri, 'jpeg');

      expect(result.format).toBe('jpeg');
      expect(ImageManipulator.manipulateAsync).toHaveBeenCalled();
    });

    it('should route to convertToGif for gif format', async () => {
      (FileSystem.getInfoAsync as jest.Mock).mockResolvedValue({
        exists: true,
        isDirectory: false,
      });

      (ImageManipulator.manipulateAsync as jest.Mock).mockResolvedValue({
        uri: mockConvertedUri,
      });

      const result = await imageConverter.convert(mockUri, 'gif');

      expect(result.format).toBe('gif');
    });

    it('should route to convertToPdf for pdf format', async () => {
      (FileSystem.getInfoAsync as jest.Mock)
        .mockResolvedValueOnce({ exists: true, isDirectory: false })
        .mockResolvedValueOnce({ exists: true, isDirectory: false });

      (ImageManipulator.manipulateAsync as jest.Mock).mockResolvedValue({
        uri: mockConvertedUri,
      });

      (FileSystem.readAsStringAsync as jest.Mock).mockResolvedValue('base64data');

      (Print.printToFileAsync as jest.Mock).mockResolvedValue({
        uri: mockPdfUri,
      });

      const result = await imageConverter.convert(mockUri, 'pdf');

      expect(result.format).toBe('pdf');
      expect(Print.printToFileAsync).toHaveBeenCalled();
    });

    it('should return error for unsupported format', async () => {
      const result = await imageConverter.convert(mockUri, 'unsupported' as any);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Unsupported format');
    });
  });

  describe('getFileExtension', () => {
    it('should return .jpg for jpeg format', () => {
      expect(imageConverter.getFileExtension('jpeg')).toBe('.jpg');
    });

    it('should return .gif for gif format', () => {
      expect(imageConverter.getFileExtension('gif')).toBe('.gif');
    });

    it('should return .pdf for pdf format', () => {
      expect(imageConverter.getFileExtension('pdf')).toBe('.pdf');
    });

    it('should return .jpg for unknown format', () => {
      expect(imageConverter.getFileExtension('unknown' as any)).toBe('.jpg');
    });
  });

  describe('getMimeType', () => {
    it('should return image/jpeg for jpeg format', () => {
      expect(imageConverter.getMimeType('jpeg')).toBe('image/jpeg');
    });

    it('should return image/gif for gif format', () => {
      expect(imageConverter.getMimeType('gif')).toBe('image/gif');
    });

    it('should return application/pdf for pdf format', () => {
      expect(imageConverter.getMimeType('pdf')).toBe('application/pdf');
    });

    it('should return image/jpeg for unknown format', () => {
      expect(imageConverter.getMimeType('unknown' as any)).toBe('image/jpeg');
    });
  });

  describe('getFormatName', () => {
    it('should return JPEG for jpeg format', () => {
      expect(imageConverter.getFormatName('jpeg')).toBe('JPEG');
    });

    it('should return GIF for gif format', () => {
      expect(imageConverter.getFormatName('gif')).toBe('GIF');
    });

    it('should return PDF for pdf format', () => {
      expect(imageConverter.getFormatName('pdf')).toBe('PDF');
    });

    it('should return Unknown for unknown format', () => {
      expect(imageConverter.getFormatName('unknown' as any)).toBe('Unknown');
    });
  });

  describe('estimateFileSize', () => {
    it('should estimate 30% of original size for JPEG', async () => {
      (FileSystem.getInfoAsync as jest.Mock).mockResolvedValue({
        exists: true,
        isDirectory: false,
        size: 1000000,
      });

      const estimate = await imageConverter.estimateFileSize(mockUri, 'jpeg');

      expect(estimate).toBe(300000); // 30% of 1MB
    });

    it('should estimate 40% of original size for GIF', async () => {
      (FileSystem.getInfoAsync as jest.Mock).mockResolvedValue({
        exists: true,
        isDirectory: false,
        size: 1000000,
      });

      const estimate = await imageConverter.estimateFileSize(mockUri, 'gif');

      expect(estimate).toBe(400000); // 40% of 1MB
    });

    it('should estimate 50% of original size for PDF', async () => {
      (FileSystem.getInfoAsync as jest.Mock).mockResolvedValue({
        exists: true,
        isDirectory: false,
        size: 1000000,
      });

      const estimate = await imageConverter.estimateFileSize(mockUri, 'pdf');

      expect(estimate).toBe(500000); // 50% of 1MB
    });

    it('should return null if file does not exist', async () => {
      (FileSystem.getInfoAsync as jest.Mock).mockResolvedValue({
        exists: false,
      });

      const estimate = await imageConverter.estimateFileSize(mockUri, 'jpeg');

      expect(estimate).toBeNull();
    });

    it('should return null if file is a directory', async () => {
      (FileSystem.getInfoAsync as jest.Mock).mockResolvedValue({
        exists: true,
        isDirectory: true,
      });

      const estimate = await imageConverter.estimateFileSize(mockUri, 'jpeg');

      expect(estimate).toBeNull();
    });

    it('should return null if file size is unavailable', async () => {
      (FileSystem.getInfoAsync as jest.Mock).mockResolvedValue({
        exists: true,
        isDirectory: false,
        size: undefined,
      });

      const estimate = await imageConverter.estimateFileSize(mockUri, 'jpeg');

      expect(estimate).toBeNull();
    });

    it('should handle errors and return null', async () => {
      const error = new Error('File system error');
      (FileSystem.getInfoAsync as jest.Mock).mockRejectedValue(error);

      const estimate = await imageConverter.estimateFileSize(mockUri, 'jpeg');

      expect(estimate).toBeNull();
      expect(console.error).toHaveBeenCalledWith('Error estimating file size:', error);
    });
  });
});
