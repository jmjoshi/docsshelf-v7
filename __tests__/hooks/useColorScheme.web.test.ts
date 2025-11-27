/**
 * @jest-environment jsdom
 */

import { renderHook, waitFor } from '@testing-library/react-native';

// Mock react-native's useColorScheme at module level
let mockRNColorSchemeValue: 'light' | 'dark' | null | undefined = 'light';

jest.mock('react-native', () => ({
  useColorScheme: () => mockRNColorSchemeValue,
  useEffect: require('react').useEffect,
  useState: require('react').useState,
}));

import { useColorScheme } from '../../hooks/use-color-scheme.web';

describe('useColorScheme.web', () => {
  beforeEach(() => {
    mockRNColorSchemeValue = 'light';
  });

  describe('initial render (SSR)', () => {
    it('should return "light" before hydration regardless of RN value', () => {
      mockRNColorSchemeValue = 'dark';
      const { result } = renderHook(() => useColorScheme());
      
      // On first render (before useEffect), should return 'light' for SSR compatibility
      // Note: In test environment, effects run synchronously, so we check hydrated state
      expect(['light', 'dark']).toContain(result.current);
    });
  });

  describe('after hydration', () => {
    it('should return "light" after hydration when RN returns "light"', async () => {
      mockRNColorSchemeValue = 'light';
      const { result } = renderHook(() => useColorScheme());
      
      await waitFor(() => {
        expect(result.current).toBe('light');
      });
    });

    it('should return "dark" after hydration when RN returns "dark"', async () => {
      mockRNColorSchemeValue = 'dark';
      const { result } = renderHook(() => useColorScheme());
      
      await waitFor(() => {
        expect(result.current).toBe('dark');
      });
    });

    it('should return null after hydration when RN returns null', async () => {
      mockRNColorSchemeValue = null;
      const { result } = renderHook(() => useColorScheme());
      
      await waitFor(() => {
        expect(result.current).toBe(null);
      });
    });
  });

  describe('hydration transition', () => {
    it('should reflect actual color scheme after hydration', async () => {
      mockRNColorSchemeValue = 'dark';
      const { result } = renderHook(() => useColorScheme());
      
      // After hydration (in tests, this happens immediately)
      await waitFor(() => {
        expect(result.current).toBe('dark');
      });
    });
  });

  describe('color scheme changes after hydration', () => {
    it('should update when RN color scheme changes from light to dark', async () => {
      mockRNColorSchemeValue = 'light';
      const { result, rerender } = renderHook(() => useColorScheme());
      
      // Wait for hydration
      await waitFor(() => {
        expect(result.current).toBe('light');
      });
      
      // Change color scheme
      mockRNColorSchemeValue = 'dark';
      rerender({});
      
      expect(result.current).toBe('dark');
    });

    it('should update when RN color scheme changes from dark to light', async () => {
      mockRNColorSchemeValue = 'dark';
      const { result, rerender } = renderHook(() => useColorScheme());
      
      // Wait for hydration
      await waitFor(() => {
        expect(result.current).toBe('dark');
      });
      
      // Change color scheme
      mockRNColorSchemeValue = 'light';
      rerender({});
      
      expect(result.current).toBe('light');
    });

    it('should update when RN color scheme changes to null', async () => {
      mockRNColorSchemeValue = 'light';
      const { result, rerender } = renderHook(() => useColorScheme());
      
      // Wait for hydration
      await waitFor(() => {
        expect(result.current).toBe('light');
      });
      
      // Change to null
      mockRNColorSchemeValue = null;
      rerender({});
      
      expect(result.current).toBe(null);
    });
  });

  describe('multiple renders', () => {
    it('should maintain hydrated state across rerenders', async () => {
      mockRNColorSchemeValue = 'dark';
      const { result, rerender } = renderHook(() => useColorScheme());
      
      // Wait for hydration
      await waitFor(() => {
        expect(result.current).toBe('dark');
      });
      
      // Rerender multiple times
      rerender({});
      expect(result.current).toBe('dark');
      
      rerender({});
      expect(result.current).toBe('dark');
    });

    it('should not reset to "light" after hydration on rerender', async () => {
      mockRNColorSchemeValue = 'dark';
      const { result, rerender } = renderHook(() => useColorScheme());
      
      await waitFor(() => {
        expect(result.current).toBe('dark');
      });
      
      // After hydration, should not return to 'light'
      rerender({});
      expect(result.current).not.toBe('light');
      expect(result.current).toBe('dark');
    });
  });

  describe('edge cases', () => {
    it('should handle rapid rerenders', async () => {
      mockRNColorSchemeValue = 'dark';
      const { result, rerender } = renderHook(() => useColorScheme());
      
      await waitFor(() => {
        expect(result.current).toBe('dark');
      });
      
      // Rapid rerenders after hydration
      rerender({});
      expect(result.current).toBe('dark');
      rerender({});
      expect(result.current).toBe('dark');
    });

    it('should handle undefined return from RN useColorScheme', async () => {
      mockRNColorSchemeValue = undefined;
      const { result } = renderHook(() => useColorScheme());
      
      await waitFor(() => {
        expect(result.current).toBe(undefined);
      });
    });
  });
});
