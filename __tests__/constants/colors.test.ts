import { Colors, Shadows, BorderRadius, Spacing, Typography, Duration } from '../../constants/colors';

describe('Colors', () => {
  describe('Primary Colors', () => {
    it('should have primary color palette', () => {
      expect(Colors.primary.main).toBe('#2563EB');
      expect(Colors.primary.light).toBe('#3B82F6');
      expect(Colors.primary.dark).toBe('#1E40AF');
      expect(Colors.primary.contrast).toBe('#FFFFFF');
    });

    it('should have sufficient contrast for accessibility', () => {
      expect(Colors.primary.contrast).toBe('#FFFFFF');
    });
  });

  describe('Secondary Colors', () => {
    it('should have secondary color palette', () => {
      expect(Colors.secondary.main).toBe('#10B981');
      expect(Colors.secondary.light).toBe('#34D399');
      expect(Colors.secondary.dark).toBe('#059669');
      expect(Colors.secondary.contrast).toBe('#FFFFFF');
    });
  });

  describe('Accent Colors', () => {
    it('should have accent color palette', () => {
      expect(Colors.accent.main).toBe('#8B5CF6');
      expect(Colors.accent.light).toBe('#A78BFA');
      expect(Colors.accent.dark).toBe('#7C3AED');
      expect(Colors.accent.contrast).toBe('#FFFFFF');
    });
  });

  describe('Neutral/Gray Scale', () => {
    it('should have complete gray scale from 50 to 900', () => {
      expect(Colors.neutral[50]).toBe('#F9FAFB');
      expect(Colors.neutral[100]).toBe('#F3F4F6');
      expect(Colors.neutral[200]).toBe('#E5E7EB');
      expect(Colors.neutral[300]).toBe('#D1D5DB');
      expect(Colors.neutral[400]).toBe('#9CA3AF');
      expect(Colors.neutral[500]).toBe('#6B7280');
      expect(Colors.neutral[600]).toBe('#4B5563');
      expect(Colors.neutral[700]).toBe('#374151');
      expect(Colors.neutral[800]).toBe('#1F2937');
      expect(Colors.neutral[900]).toBe('#111827');
    });

    it('should progress from light to dark', () => {
      const neutralValues = Object.keys(Colors.neutral).map(Number);
      expect(neutralValues).toEqual([50, 100, 200, 300, 400, 500, 600, 700, 800, 900]);
    });
  });

  describe('Semantic Colors', () => {
    it('should have success colors', () => {
      expect(Colors.success.main).toBe('#10B981');
      expect(Colors.success.light).toBe('#D1FAE5');
      expect(Colors.success.dark).toBe('#065F46');
    });

    it('should have error colors', () => {
      expect(Colors.error.main).toBe('#EF4444');
      expect(Colors.error.light).toBe('#FEE2E2');
      expect(Colors.error.dark).toBe('#991B1B');
    });

    it('should have warning colors', () => {
      expect(Colors.warning.main).toBe('#F59E0B');
      expect(Colors.warning.light).toBe('#FEF3C7');
      expect(Colors.warning.dark).toBe('#92400E');
    });

    it('should have info colors', () => {
      expect(Colors.info.main).toBe('#3B82F6');
      expect(Colors.info.light).toBe('#DBEAFE');
      expect(Colors.info.dark).toBe('#1E3A8A');
    });
  });

  describe('Background Colors', () => {
    it('should have background variants', () => {
      expect(Colors.background.default).toBe('#FFFFFF');
      expect(Colors.background.paper).toBe('#F9FAFB');
      expect(Colors.background.elevated).toBe('#FFFFFF');
    });
  });

  describe('Text Colors', () => {
    it('should have text color variants', () => {
      expect(Colors.text.primary).toBe('#111827');
      expect(Colors.text.secondary).toBe('#6B7280');
      expect(Colors.text.disabled).toBe('#9CA3AF');
      expect(Colors.text.hint).toBe('#9CA3AF');
      expect(Colors.text.placeholder).toBe('#9CA3AF');
    });

    it('should use same color for disabled, hint, and placeholder', () => {
      expect(Colors.text.disabled).toBe(Colors.text.hint);
      expect(Colors.text.disabled).toBe(Colors.text.placeholder);
    });
  });

  describe('Border Colors', () => {
    it('should have border color variants', () => {
      expect(Colors.border.light).toBe('#E5E7EB');
      expect(Colors.border.main).toBe('#D1D5DB');
      expect(Colors.border.dark).toBe('#9CA3AF');
    });
  });

  describe('Surface Colors', () => {
    it('should have surface interaction states', () => {
      expect(Colors.surface.default).toBe('#FFFFFF');
      expect(Colors.surface.hover).toBe('#F9FAFB');
      expect(Colors.surface.active).toBe('#F3F4F6');
    });
  });
});

describe('Shadows', () => {
  it('should have small shadow configuration', () => {
    expect(Shadows.sm).toEqual({
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 2,
      elevation: 2,
    });
  });

  it('should have medium shadow configuration', () => {
    expect(Shadows.md).toEqual({
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 4,
    });
  });

  it('should have large shadow configuration', () => {
    expect(Shadows.lg).toEqual({
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.15,
      shadowRadius: 8,
      elevation: 8,
    });
  });

  it('should have extra large shadow configuration', () => {
    expect(Shadows.xl).toEqual({
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.2,
      shadowRadius: 16,
      elevation: 16,
    });
  });

  it('should increase shadow depth progressively', () => {
    expect(Shadows.sm.elevation).toBeLessThan(Shadows.md.elevation);
    expect(Shadows.md.elevation).toBeLessThan(Shadows.lg.elevation);
    expect(Shadows.lg.elevation).toBeLessThan(Shadows.xl.elevation);
  });

  it('should increase shadow opacity progressively', () => {
    expect(Shadows.sm.shadowOpacity).toBeLessThan(Shadows.md.shadowOpacity);
    expect(Shadows.md.shadowOpacity).toBeLessThan(Shadows.lg.shadowOpacity);
    expect(Shadows.lg.shadowOpacity).toBeLessThan(Shadows.xl.shadowOpacity);
  });
});

describe('BorderRadius', () => {
  it('should have all size variants', () => {
    expect(BorderRadius.xs).toBe(4);
    expect(BorderRadius.sm).toBe(6);
    expect(BorderRadius.md).toBe(8);
    expect(BorderRadius.lg).toBe(12);
    expect(BorderRadius.xl).toBe(16);
    expect(BorderRadius['2xl']).toBe(24);
    expect(BorderRadius.full).toBe(9999);
  });

  it('should increase progressively except full', () => {
    expect(BorderRadius.xs).toBeLessThan(BorderRadius.sm);
    expect(BorderRadius.sm).toBeLessThan(BorderRadius.md);
    expect(BorderRadius.md).toBeLessThan(BorderRadius.lg);
    expect(BorderRadius.lg).toBeLessThan(BorderRadius.xl);
    expect(BorderRadius.xl).toBeLessThan(BorderRadius['2xl']);
    expect(BorderRadius['2xl']).toBeLessThan(BorderRadius.full);
  });
});

describe('Spacing', () => {
  it('should have all size variants', () => {
    expect(Spacing.xs).toBe(4);
    expect(Spacing.sm).toBe(8);
    expect(Spacing.md).toBe(12);
    expect(Spacing.lg).toBe(16);
    expect(Spacing.xl).toBe(20);
    expect(Spacing['2xl']).toBe(24);
    expect(Spacing['3xl']).toBe(32);
    expect(Spacing['4xl']).toBe(40);
    expect(Spacing['5xl']).toBe(48);
  });

  it('should increase progressively', () => {
    expect(Spacing.xs).toBeLessThan(Spacing.sm);
    expect(Spacing.sm).toBeLessThan(Spacing.md);
    expect(Spacing.md).toBeLessThan(Spacing.lg);
    expect(Spacing.lg).toBeLessThan(Spacing.xl);
    expect(Spacing.xl).toBeLessThan(Spacing['2xl']);
    expect(Spacing['2xl']).toBeLessThan(Spacing['3xl']);
    expect(Spacing['3xl']).toBeLessThan(Spacing['4xl']);
    expect(Spacing['4xl']).toBeLessThan(Spacing['5xl']);
  });

  it('should follow 4px base unit', () => {
    expect(Spacing.xs % 4).toBe(0);
    expect(Spacing.sm % 4).toBe(0);
    expect(Spacing.md % 4).toBe(0);
    expect(Spacing.lg % 4).toBe(0);
    expect(Spacing.xl % 4).toBe(0);
  });
});

describe('Typography', () => {
  describe('Font Sizes', () => {
    it('should have all size variants', () => {
      expect(Typography.fontSize.xs).toBe(12);
      expect(Typography.fontSize.sm).toBe(14);
      expect(Typography.fontSize.base).toBe(16);
      expect(Typography.fontSize.lg).toBe(18);
      expect(Typography.fontSize.xl).toBe(20);
      expect(Typography.fontSize['2xl']).toBe(24);
      expect(Typography.fontSize['3xl']).toBe(30);
      expect(Typography.fontSize['4xl']).toBe(36);
      expect(Typography.fontSize['5xl']).toBe(48);
    });

    it('should increase progressively', () => {
      expect(Typography.fontSize.xs).toBeLessThan(Typography.fontSize.sm);
      expect(Typography.fontSize.sm).toBeLessThan(Typography.fontSize.base);
      expect(Typography.fontSize.base).toBeLessThan(Typography.fontSize.lg);
      expect(Typography.fontSize.lg).toBeLessThan(Typography.fontSize.xl);
      expect(Typography.fontSize.xl).toBeLessThan(Typography.fontSize['2xl']);
    });
  });

  describe('Font Weights', () => {
    it('should have all weight variants', () => {
      expect(Typography.fontWeight.light).toBe('300');
      expect(Typography.fontWeight.normal).toBe('400');
      expect(Typography.fontWeight.medium).toBe('500');
      expect(Typography.fontWeight.semibold).toBe('600');
      expect(Typography.fontWeight.bold).toBe('700');
      expect(Typography.fontWeight.extrabold).toBe('800');
    });

    it('should return string values for React Native compatibility', () => {
      expect(typeof Typography.fontWeight.normal).toBe('string');
      expect(typeof Typography.fontWeight.bold).toBe('string');
    });
  });

  describe('Line Heights', () => {
    it('should have line height variants', () => {
      expect(Typography.lineHeight.tight).toBe(1.25);
      expect(Typography.lineHeight.normal).toBe(1.5);
      expect(Typography.lineHeight.relaxed).toBe(1.75);
    });

    it('should increase progressively', () => {
      expect(Typography.lineHeight.tight).toBeLessThan(Typography.lineHeight.normal);
      expect(Typography.lineHeight.normal).toBeLessThan(Typography.lineHeight.relaxed);
    });
  });
});

describe('Duration', () => {
  it('should have animation duration variants', () => {
    expect(Duration.fast).toBe(150);
    expect(Duration.normal).toBe(300);
    expect(Duration.slow).toBe(500);
  });

  it('should increase progressively', () => {
    expect(Duration.fast).toBeLessThan(Duration.normal);
    expect(Duration.normal).toBeLessThan(Duration.slow);
  });

  it('should use millisecond values', () => {
    expect(Duration.fast).toBeGreaterThan(0);
    expect(Duration.normal).toBeGreaterThan(0);
    expect(Duration.slow).toBeGreaterThan(0);
  });
});
