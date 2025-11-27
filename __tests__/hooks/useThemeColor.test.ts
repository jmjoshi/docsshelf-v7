/**
 * @jest-environment jsdom
 */

import { renderHook } from '@testing-library/react-native';
import { Colors } from '../../constants/theme';
import { useThemeColor } from '../../hooks/use-theme-color';

// Mock at module level - the hooks/use-color-scheme re-exports from react-native
// So we mock the return value directly
let mockColorSchemeValue: 'light' | 'dark' | null | undefined = 'light';

jest.mock('../../hooks/use-color-scheme', () => ({
  useColorScheme: () => mockColorSchemeValue,
}));

describe('useThemeColor', () => {
  beforeEach(() => {
    mockColorSchemeValue = 'light';
  });

  describe('with light theme', () => {
    beforeEach(() => {
      mockColorSchemeValue = 'light';
    });

    it('should return light theme color from theme constant', () => {
      const { result } = renderHook(() => useThemeColor({}, 'text'));
      expect(result.current).toBe(Colors.light.text);
    });

    it('should return light prop color when provided', () => {
      const customColor = '#FF0000';
      const { result } = renderHook(() =>
        useThemeColor({ light: customColor, dark: '#0000FF' }, 'text')
      );
      expect(result.current).toBe(customColor);
    });

    it('should return background color from theme', () => {
      const { result } = renderHook(() => useThemeColor({}, 'background'));
      expect(result.current).toBe(Colors.light.background);
    });

    it('should return tint color from theme', () => {
      const { result } = renderHook(() => useThemeColor({}, 'tint'));
      expect(result.current).toBe(Colors.light.tint);
    });

    it('should prioritize light prop over theme constant', () => {
      const customColor = '#CUSTOM';
      const { result } = renderHook(() =>
        useThemeColor({ light: customColor }, 'text')
      );
      expect(result.current).toBe(customColor);
      expect(result.current).not.toBe(Colors.light.text);
    });
  });

  describe('with dark theme', () => {
    beforeEach(() => {
      mockColorSchemeValue = 'dark';
    });

    it('should return dark theme color from theme constant', () => {
      const { result } = renderHook(() => useThemeColor({}, 'text'));
      expect(result.current).toBe(Colors.dark.text);
    });

    it('should return dark prop color when provided', () => {
      const customColor = '#0000FF';
      const { result } = renderHook(() =>
        useThemeColor({ light: '#FF0000', dark: customColor }, 'text')
      );
      expect(result.current).toBe(customColor);
    });

    it('should return background color from theme', () => {
      const { result } = renderHook(() => useThemeColor({}, 'background'));
      expect(result.current).toBe(Colors.dark.background);
    });

    it('should return tint color from theme', () => {
      const { result } = renderHook(() => useThemeColor({}, 'tint'));
      expect(result.current).toBe(Colors.dark.tint);
    });

    it('should prioritize dark prop over theme constant', () => {
      const customColor = '#CUSTOM';
      const { result } = renderHook(() =>
        useThemeColor({ dark: customColor }, 'text')
      );
      expect(result.current).toBe(customColor);
      expect(result.current).not.toBe(Colors.dark.text);
    });
  });

  describe('with null theme (fallback to light)', () => {
    beforeEach(() => {
      mockColorSchemeValue = null;
    });

    it('should fallback to light theme color', () => {
      const { result } = renderHook(() => useThemeColor({}, 'text'));
      expect(result.current).toBe(Colors.light.text);
    });

    it('should return light prop when provided', () => {
      const customColor = '#FF0000';
      const { result } = renderHook(() =>
        useThemeColor({ light: customColor }, 'text')
      );
      expect(result.current).toBe(customColor);
    });
  });

  describe('with different color names', () => {
    beforeEach(() => {
      mockColorSchemeValue = 'light';
    });

    it('should return icon color', () => {
      const { result } = renderHook(() => useThemeColor({}, 'icon'));
      expect(result.current).toBe(Colors.light.icon);
    });

    it('should return tabIconDefault color', () => {
      const { result } = renderHook(() => useThemeColor({}, 'tabIconDefault'));
      expect(result.current).toBe(Colors.light.tabIconDefault);
    });

    it('should return tabIconSelected color', () => {
      const { result } = renderHook(() => useThemeColor({}, 'tabIconSelected'));
      expect(result.current).toBe(Colors.light.tabIconSelected);
    });

    it('should return textSecondary color', () => {
      const { result } = renderHook(() => useThemeColor({}, 'textSecondary'));
      expect(result.current).toBe(Colors.light.textSecondary);
    });
  });

  describe('edge cases', () => {
    beforeEach(() => {
      mockColorSchemeValue = 'light';
    });

    it('should handle empty props object', () => {
      const { result } = renderHook(() => useThemeColor({}, 'text'));
      expect(result.current).toBe(Colors.light.text);
    });

    it('should handle only dark prop in light mode', () => {
      const { result } = renderHook(() =>
        useThemeColor({ dark: '#0000FF' }, 'text')
      );
      expect(result.current).toBe(Colors.light.text);
    });

    it('should handle only light prop in dark mode', () => {
      mockColorSchemeValue = 'dark';
      const { result } = renderHook(() =>
        useThemeColor({ light: '#FF0000' }, 'text')
      );
      expect(result.current).toBe(Colors.dark.text);
    });

    it('should handle undefined prop values', () => {
      const { result } = renderHook(() =>
        useThemeColor({ light: undefined, dark: undefined }, 'text')
      );
      expect(result.current).toBe(Colors.light.text);
    });
  });

  describe('theme switching', () => {
    it('should update color when theme changes from light to dark', () => {
      mockColorSchemeValue = 'light';
      const { result, rerender } = renderHook(() => useThemeColor({}, 'text'));
      
      expect(result.current).toBe(Colors.light.text);

      mockColorSchemeValue = 'dark';
      rerender({});

      expect(result.current).toBe(Colors.dark.text);
    });

    it('should update color when theme changes from dark to light', () => {
      mockColorSchemeValue = 'dark';
      const { result, rerender } = renderHook(() => useThemeColor({}, 'background'));
      
      expect(result.current).toBe(Colors.dark.background);

      mockColorSchemeValue = 'light';
      rerender({});

      expect(result.current).toBe(Colors.light.background);
    });

    it('should maintain custom prop color during theme switch', () => {
      const customLight = '#LIGHT';
      const customDark = '#DARK';

      mockColorSchemeValue = 'light';
      const { result, rerender } = renderHook(() =>
        useThemeColor({ light: customLight, dark: customDark }, 'text')
      );
      
      expect(result.current).toBe(customLight);

      mockColorSchemeValue = 'dark';
      rerender({});

      expect(result.current).toBe(customDark);
    });
  });
});
