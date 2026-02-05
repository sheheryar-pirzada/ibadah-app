/**
 * @jest-environment node
 */

// Simplified unit tests for DuaManager that don't require React Native runtime

// Mock AsyncStorage before importing
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(() => Promise.resolve(null)),
  setItem: jest.fn(() => Promise.resolve()),
  removeItem: jest.fn(() => Promise.resolve()),
  clear: jest.fn(() => Promise.resolve()),
}));

import { DuaManager } from '@/utils/duas';
import { allDuas, DuaCategory } from '@/utils/duas-data';
import AsyncStorage from '@react-native-async-storage/async-storage';

describe('DuaManager', () => {
  let manager: DuaManager;

  beforeEach(async () => {
    jest.clearAllMocks();
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);
    manager = DuaManager.getInstance();
    await manager.initialize();
  });

  describe('getInstance', () => {
    it('should return a singleton instance', () => {
      const instance1 = DuaManager.getInstance();
      const instance2 = DuaManager.getInstance();
      expect(instance1).toBe(instance2);
    });
  });

  describe('getAllDuas', () => {
    it('should return all duas', () => {
      const duas = manager.getAllDuas();
      expect(duas).toEqual(allDuas);
      expect(duas.length).toBeGreaterThan(0);
    });
  });

  describe('getDuasByCategory', () => {
    it('should return duas filtered by category', () => {
      const morningDuas = manager.getDuasByCategory('morning');
      expect(morningDuas.length).toBeGreaterThan(0);
      expect(morningDuas.every(dua => dua.category === 'morning')).toBe(true);
    });

    it('should return empty array for category with no duas', () => {
      const duas = manager.getDuasByCategory('nonexistent' as DuaCategory);
      expect(duas).toEqual([]);
    });
  });

  describe('getDuaById', () => {
    it('should return the correct dua by ID', () => {
      const firstDua = allDuas[0];
      const dua = manager.getDuaById(firstDua.id);
      expect(dua).toBeDefined();
      expect(dua?.id).toBe(firstDua.id);
      expect(dua?.title).toBe(firstDua.title);
    });

    it('should return undefined for non-existent ID', () => {
      const dua = manager.getDuaById('non-existent-id');
      expect(dua).toBeUndefined();
    });
  });

  describe('searchDuas', () => {
    it('should find duas by title', () => {
      const firstDua = allDuas[0];
      const titleWord = firstDua.title.split(' ')[0];
      const results = manager.searchDuas(titleWord);
      expect(results.length).toBeGreaterThan(0);
      expect(results.some(dua => dua.id === firstDua.id)).toBe(true);
    });

    it('should be case-insensitive for Latin text', () => {
      const results1 = manager.searchDuas('Allah');
      const results2 = manager.searchDuas('allah');
      const results3 = manager.searchDuas('ALLAH');

      expect(results1.length).toBe(results2.length);
      expect(results2.length).toBe(results3.length);
    });

    it('should return empty array for no matches', () => {
      const results = manager.searchDuas('xyz123nonexistent');
      expect(results).toEqual([]);
    });
  });

  describe('favorites', () => {
    it('should initially have no favorites', () => {
      const favorites = manager.getFavoriteDuas();
      expect(favorites).toEqual([]);
    });

    it('should add a dua to favorites', async () => {
      // Use a unique dua for this test to avoid singleton interference
      const testDua = allDuas[1];

      expect(manager.isFavorite(testDua.id)).toBe(false);

      await manager.toggleFavorite(testDua.id);

      expect(manager.isFavorite(testDua.id)).toBe(true);

      const favorites = manager.getFavoriteDuas();
      expect(favorites.some(d => d.id === testDua.id)).toBe(true);
    });

    it('should remove a dua from favorites on second toggle', async () => {
      // Use a unique dua for this test
      const testDua = allDuas[2];

      // First ensure it's not already a favorite (singleton state from other tests)
      if (manager.isFavorite(testDua.id)) {
        await manager.toggleFavorite(testDua.id);
      }
      expect(manager.isFavorite(testDua.id)).toBe(false);

      // Add to favorites
      await manager.toggleFavorite(testDua.id);
      expect(manager.isFavorite(testDua.id)).toBe(true);

      // Remove from favorites
      await manager.toggleFavorite(testDua.id);
      expect(manager.isFavorite(testDua.id)).toBe(false);
    });

    it('should persist favorites to AsyncStorage', async () => {
      const testDua = allDuas[3];
      await manager.toggleFavorite(testDua.id);

      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        'favorite_duas',
        expect.stringContaining(testDua.id)
      );
    });
  });

  describe('getTimeBasedDuas', () => {
    it('should return category and duas based on time', () => {
      const result = manager.getTimeBasedDuas();

      expect(result).toHaveProperty('category');
      expect(result).toHaveProperty('duas');
      expect(['morning', 'evening']).toContain(result.category);
      expect(Array.isArray(result.duas)).toBe(true);
    });
  });
});
