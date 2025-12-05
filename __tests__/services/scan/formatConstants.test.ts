/**
 * Tests for Format Constants
 * Testing scan format utilities and constants
 */

import {
    DEFAULT_SCAN_OPTIONS,
    SCAN_FORMATS,
    getFormatDescription,
    getFormatLabel,
    getFormatOption,
    getRecommendedFormat,
} from '../../../src/services/scan/formatConstants';
import type { ScanFormat } from '../../../src/types/scan.types';

describe('Format Constants', () => {
  describe('SCAN_FORMATS', () => {
    it('should define all required formats', () => {
      expect(SCAN_FORMATS).toHaveLength(3);
      
      const formats = SCAN_FORMATS.map(f => f.format);
      expect(formats).toContain('jpeg');
      expect(formats).toContain('pdf');
      expect(formats).toContain('gif');
    });

    it('should have JPEG format with correct properties', () => {
      const jpeg = SCAN_FORMATS.find(f => f.format === 'jpeg');
      
      expect(jpeg).toBeDefined();
      expect(jpeg?.label).toBe('JPEG');
      expect(jpeg?.description).toBe('Best for photos and images');
      expect(jpeg?.icon).toBe('image');
      expect(jpeg?.fileExtension).toBe('.jpg');
      expect(jpeg?.mimeType).toBe('image/jpeg');
      expect(jpeg?.recommended).toBe(true);
    });

    it('should have PDF format with correct properties', () => {
      const pdf = SCAN_FORMATS.find(f => f.format === 'pdf');
      
      expect(pdf).toBeDefined();
      expect(pdf?.label).toBe('PDF');
      expect(pdf?.description).toBe('Standard document format');
      expect(pdf?.icon).toBe('document-text');
      expect(pdf?.fileExtension).toBe('.pdf');
      expect(pdf?.mimeType).toBe('application/pdf');
      expect(pdf?.recommended).toBe(false);
    });

    it('should have GIF format with correct properties', () => {
      const gif = SCAN_FORMATS.find(f => f.format === 'gif');
      
      expect(gif).toBeDefined();
      expect(gif?.label).toBe('GIF');
      expect(gif?.description).toBe('Compact file size');
      expect(gif?.icon).toBe('sparkles');
      expect(gif?.fileExtension).toBe('.gif');
      expect(gif?.mimeType).toBe('image/gif');
      expect(gif?.recommended).toBe(false);
    });

    it('should have exactly one recommended format', () => {
      const recommended = SCAN_FORMATS.filter(f => f.recommended);
      expect(recommended).toHaveLength(1);
      expect(recommended[0].format).toBe('jpeg');
    });
  });

  describe('getFormatOption', () => {
    it('should return JPEG format option', () => {
      const option = getFormatOption('jpeg');
      
      expect(option).toBeDefined();
      expect(option?.format).toBe('jpeg');
      expect(option?.label).toBe('JPEG');
    });

    it('should return PDF format option', () => {
      const option = getFormatOption('pdf');
      
      expect(option).toBeDefined();
      expect(option?.format).toBe('pdf');
      expect(option?.label).toBe('PDF');
    });

    it('should return GIF format option', () => {
      const option = getFormatOption('gif');
      
      expect(option).toBeDefined();
      expect(option?.format).toBe('gif');
      expect(option?.label).toBe('GIF');
    });

    it('should return undefined for invalid format', () => {
      const option = getFormatOption('invalid' as ScanFormat);
      expect(option).toBeUndefined();
    });
  });

  describe('getFormatLabel', () => {
    it('should return "JPEG" for jpeg format', () => {
      expect(getFormatLabel('jpeg')).toBe('JPEG');
    });

    it('should return "PDF" for pdf format', () => {
      expect(getFormatLabel('pdf')).toBe('PDF');
    });

    it('should return "GIF" for gif format', () => {
      expect(getFormatLabel('gif')).toBe('GIF');
    });

    it('should return uppercase format for unknown format', () => {
      expect(getFormatLabel('unknown' as ScanFormat)).toBe('UNKNOWN');
    });
  });

  describe('getFormatDescription', () => {
    it('should return description for JPEG', () => {
      expect(getFormatDescription('jpeg')).toBe('Best for photos and images');
    });

    it('should return description for PDF', () => {
      expect(getFormatDescription('pdf')).toBe('Standard document format');
    });

    it('should return description for GIF', () => {
      expect(getFormatDescription('gif')).toBe('Compact file size');
    });

    it('should return empty string for unknown format', () => {
      expect(getFormatDescription('unknown' as ScanFormat)).toBe('');
    });
  });

  describe('getRecommendedFormat', () => {
    it('should return jpeg as recommended format', () => {
      expect(getRecommendedFormat()).toBe('jpeg');
    });
  });

  describe('DEFAULT_SCAN_OPTIONS', () => {
    it('should have correct default format', () => {
      expect(DEFAULT_SCAN_OPTIONS.format).toBe('jpeg');
    });

    it('should have quality of 0.8', () => {
      expect(DEFAULT_SCAN_OPTIONS.quality).toBe(0.8);
    });

    it('should have maxWidth of 2048', () => {
      expect(DEFAULT_SCAN_OPTIONS.maxWidth).toBe(2048);
    });

    it('should have maxHeight of 2048', () => {
      expect(DEFAULT_SCAN_OPTIONS.maxHeight).toBe(2048);
    });

    it('should have all required properties', () => {
      expect(DEFAULT_SCAN_OPTIONS).toHaveProperty('format');
      expect(DEFAULT_SCAN_OPTIONS).toHaveProperty('quality');
      expect(DEFAULT_SCAN_OPTIONS).toHaveProperty('maxWidth');
      expect(DEFAULT_SCAN_OPTIONS).toHaveProperty('maxHeight');
    });
  });
});
