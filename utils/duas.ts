import AsyncStorage from '@react-native-async-storage/async-storage';
import { allDuas, Dua, DuaCategory } from './duas-data';

// Storage keys
const STORAGE_KEYS = {
  FAVORITE_DUAS: 'favorite_duas',
};

// Dua Manager class
export class DuaManager {
  private static instance: DuaManager;
  private favoriteDuaIds: string[] = [];

  static getInstance(): DuaManager {
    if (!DuaManager.instance) {
      DuaManager.instance = new DuaManager();
    }
    return DuaManager.instance;
  }

  // Initialize and load favorites
  async initialize(): Promise<void> {
    await this.loadFavorites();
  }

  // Load favorite duas from storage
  private async loadFavorites(): Promise<void> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.FAVORITE_DUAS);
      if (data) {
        this.favoriteDuaIds = JSON.parse(data);
      }
    } catch (error) {
      console.error('Error loading favorite duas:', error);
      this.favoriteDuaIds = [];
    }
  }

  // Save favorite duas to storage
  private async saveFavorites(): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.FAVORITE_DUAS, JSON.stringify(this.favoriteDuaIds));
    } catch (error) {
      console.error('Error saving favorite duas:', error);
    }
  }

  // Get duas by category
  getDuasByCategory(category: DuaCategory): Dua[] {
    return allDuas.filter(dua => dua.category === category);
  }

  // Get time-based duas (morning or evening based on current time)
  getTimeBasedDuas(): { category: 'morning' | 'evening'; duas: Dua[] } {
    const hour = new Date().getHours();
    
    // Morning: 3 AM to 12 PM (after Fajr until Dhuhr)
    // Evening: 3 PM to 7 PM (after Asr until Maghrib)
    if (hour >= 3 && hour < 12) {
      return {
        category: 'morning',
        duas: this.getDuasByCategory('morning'),
      };
    } else if (hour >= 15 && hour < 19) {
      return {
        category: 'evening',
        duas: this.getDuasByCategory('evening'),
      };
    }
    
    // Default to morning if time doesn't match
    return {
      category: 'morning',
      duas: this.getDuasByCategory('morning'),
    };
  }

  // Get all duas
  getAllDuas(): Dua[] {
    return allDuas;
  }

  // Search duas
  searchDuas(query: string): Dua[] {
    const lowerQuery = query.toLowerCase();
    return allDuas.filter(dua =>
      dua.title.toLowerCase().includes(lowerQuery) ||
      dua.arabic.includes(query) ||
      dua.transliteration.toLowerCase().includes(lowerQuery) ||
      dua.translation.toLowerCase().includes(lowerQuery)
    );
  }

  // Get dua by ID
  getDuaById(id: string): Dua | undefined {
    return allDuas.find(dua => dua.id === id);
  }

  // Toggle favorite
  async toggleFavorite(duaId: string): Promise<boolean> {
    const index = this.favoriteDuaIds.indexOf(duaId);
    if (index > -1) {
      this.favoriteDuaIds.splice(index, 1);
    } else {
      this.favoriteDuaIds.push(duaId);
    }
    await this.saveFavorites();
    return this.isFavorite(duaId);
  }

  // Check if dua is favorite
  isFavorite(duaId: string): boolean {
    return this.favoriteDuaIds.includes(duaId);
  }

  // Get favorite duas
  getFavoriteDuas(): Dua[] {
    return allDuas.filter(dua => this.favoriteDuaIds.includes(dua.id));
  }
}

// Export singleton instance
export const duaManager = DuaManager.getInstance();

