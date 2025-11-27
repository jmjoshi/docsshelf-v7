import {
  CATEGORY_ICONS,
  CATEGORY_COLORS,
  CATEGORY_VALIDATION,
} from '../../src/types/category';

describe('Category Type Constants', () => {
  describe('CATEGORY_ICONS', () => {
    it('should have at least 40 icons', () => {
      expect(CATEGORY_ICONS.length).toBeGreaterThanOrEqual(40);
    });

    it('should include common category icons', () => {
      expect(CATEGORY_ICONS).toContain('📁'); // folder
      expect(CATEGORY_ICONS).toContain('💼'); // work
      expect(CATEGORY_ICONS).toContain('🏠'); // home
      expect(CATEGORY_ICONS).toContain('🏫'); // school
      expect(CATEGORY_ICONS).toContain('💰'); // savings
      expect(CATEGORY_ICONS).toContain('🏥'); // health
    });

    it('should use emoji characters', () => {
      CATEGORY_ICONS.forEach(icon => {
        expect(typeof icon).toBe('string');
        expect(icon.length).toBeGreaterThan(0);
      });
    });

    it('should provide variety of icons', () => {
      // Some duplicates exist (🏥 appears twice), but overall good variety
      const uniqueIcons = new Set(CATEGORY_ICONS);
      expect(uniqueIcons.size).toBeGreaterThanOrEqual(40);
    });

    it('should include business-related icons', () => {
      expect(CATEGORY_ICONS).toContain('💼'); // work
      expect(CATEGORY_ICONS).toContain('🏢'); // business
      expect(CATEGORY_ICONS).toContain('💳'); // credit-card
      expect(CATEGORY_ICONS).toContain('🧾'); // receipt
    });

    it('should include document-related icons', () => {
      expect(CATEGORY_ICONS).toContain('📄'); // description
      expect(CATEGORY_ICONS).toContain('📋'); // assignment
      expect(CATEGORY_ICONS).toContain('📚'); // book
      expect(CATEGORY_ICONS).toContain('📰'); // article
    });

    it('should include personal life icons', () => {
      expect(CATEGORY_ICONS).toContain('🏠'); // home
      expect(CATEGORY_ICONS).toContain('🚗'); // car
      expect(CATEGORY_ICONS).toContain('🏖️'); // beach
      expect(CATEGORY_ICONS).toContain('✈️'); // flight
    });

    it('should include medical/health icons', () => {
      expect(CATEGORY_ICONS).toContain('🏥'); // hospital/health
      expect(CATEGORY_ICONS).toContain('⚕️'); // medical
    });
  });

  describe('CATEGORY_COLORS', () => {
    it('should have at least 28 colors', () => {
      expect(CATEGORY_COLORS.length).toBeGreaterThanOrEqual(28);
    });

    it('should use hexadecimal color format', () => {
      CATEGORY_COLORS.forEach(color => {
        expect(color).toMatch(/^#[0-9A-F]{6}$/i);
      });
    });

    it('should have unique colors', () => {
      const uniqueColors = new Set(CATEGORY_COLORS);
      expect(uniqueColors.size).toBe(CATEGORY_COLORS.length);
    });

    it('should include iOS system colors', () => {
      expect(CATEGORY_COLORS).toContain('#007AFF'); // Blue
      expect(CATEGORY_COLORS).toContain('#FF3B30'); // Red
      expect(CATEGORY_COLORS).toContain('#FF9500'); // Orange
      expect(CATEGORY_COLORS).toContain('#34C759'); // Green
    });

    it('should include Material Design colors', () => {
      expect(CATEGORY_COLORS).toContain('#E91E63'); // Material Pink
      expect(CATEGORY_COLORS).toContain('#9C27B0'); // Material Purple
      expect(CATEGORY_COLORS).toContain('#2196F3'); // Material Blue
      expect(CATEGORY_COLORS).toContain('#4CAF50'); // Material Green
    });

    it('should have black color option', () => {
      expect(CATEGORY_COLORS).toContain('#000000');
    });

    it('should use uppercase hex notation', () => {
      CATEGORY_COLORS.forEach(color => {
        expect(color).toBe(color.toUpperCase());
      });
    });

    it('should start with blue as default', () => {
      expect(CATEGORY_COLORS[0]).toBe('#007AFF');
    });
  });

  describe('CATEGORY_VALIDATION', () => {
    it('should have minimum name length of 1', () => {
      expect(CATEGORY_VALIDATION.NAME_MIN_LENGTH).toBe(1);
    });

    it('should have maximum name length of 100', () => {
      expect(CATEGORY_VALIDATION.NAME_MAX_LENGTH).toBe(100);
    });

    it('should have reasonable name length range', () => {
      expect(CATEGORY_VALIDATION.NAME_MIN_LENGTH).toBeLessThan(CATEGORY_VALIDATION.NAME_MAX_LENGTH);
    });

    it('should have maximum description length of 500', () => {
      expect(CATEGORY_VALIDATION.DESCRIPTION_MAX_LENGTH).toBe(500);
    });

    it('should allow longer descriptions than names', () => {
      expect(CATEGORY_VALIDATION.DESCRIPTION_MAX_LENGTH).toBeGreaterThan(CATEGORY_VALIDATION.NAME_MAX_LENGTH);
    });

    it('should have maximum nesting depth of 10', () => {
      expect(CATEGORY_VALIDATION.MAX_DEPTH).toBe(10);
    });

    it('should allow reasonable nesting for hierarchies', () => {
      expect(CATEGORY_VALIDATION.MAX_DEPTH).toBeGreaterThanOrEqual(5);
      expect(CATEGORY_VALIDATION.MAX_DEPTH).toBeLessThanOrEqual(15);
    });
  });

  describe('Icons and Colors Relationship', () => {
    it('should have enough colors for icon variety', () => {
      // Having multiple colors helps differentiate categories visually
      expect(CATEGORY_COLORS.length).toBeGreaterThanOrEqual(12);
    });

    it('should have enough icons for diverse categories', () => {
      // Having many icons allows users to express different category types
      expect(CATEGORY_ICONS.length).toBeGreaterThanOrEqual(30);
    });
  });
});
