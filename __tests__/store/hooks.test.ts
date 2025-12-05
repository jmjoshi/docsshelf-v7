/**
 * Tests for Redux Store Hooks
 * Testing typed Redux hooks
 */

import { useAppDispatch, useAppSelector } from '../../src/store/hooks';

describe('Redux Store Hooks', () => {
  describe('useAppDispatch', () => {
    it('should be defined', () => {
      expect(useAppDispatch).toBeDefined();
    });

    it('should be a function', () => {
      expect(typeof useAppDispatch).toBe('function');
    });
  });

  describe('useAppSelector', () => {
    it('should be defined', () => {
      expect(useAppSelector).toBeDefined();
    });

    it('should be a function', () => {
      expect(typeof useAppSelector).toBe('function');
    });
  });

  describe('hooks availability', () => {
    it('should export both hooks', () => {
      expect(useAppDispatch).toBeTruthy();
      expect(useAppSelector).toBeTruthy();
    });
  });
});
