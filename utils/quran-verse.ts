import AsyncStorage from '@react-native-async-storage/async-storage';

export interface QuranVerse {
  id: string;
  arabic: string;
  english: string;
  surahNumber: number;
  surahName: string;
  surahNameEnglish: string;
  ayahNumber: number;
  juzNumber?: number;
}

interface StoredDailyVerse {
  verse: QuranVerse;
  date: string; // YYYY-MM-DD format
}

// Storage keys
const STORAGE_KEYS = {
  DAILY_VERSE: 'daily_quran_verse',
  CACHED_VERSES: 'cached_quran_verses',
};

// API endpoints
const QURAN_API_BASE = 'https://api.alquran.cloud/v1';

// Quran Verse Manager class (singleton pattern)
export class QuranVerseManager {
  private static instance: QuranVerseManager;
  private cachedVerses: QuranVerse[] = [];

  static getInstance(): QuranVerseManager {
    if (!QuranVerseManager.instance) {
      QuranVerseManager.instance = new QuranVerseManager();
    }
    return QuranVerseManager.instance;
  }

  // Initialize and load cached data
  async initialize(): Promise<void> {
    await this.loadCachedVerses();
  }

  // Load cached verses from storage
  private async loadCachedVerses(): Promise<void> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.CACHED_VERSES);
      if (data) {
        this.cachedVerses = JSON.parse(data);
      }
    } catch (error) {
      console.error('Error loading cached verses:', error);
      this.cachedVerses = [];
    }
  }

  // Save cached verses to storage
  private async saveCachedVerses(): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.CACHED_VERSES, JSON.stringify(this.cachedVerses));
    } catch (error) {
      console.error('Error saving cached verses:', error);
    }
  }

  // Get today's date string (YYYY-MM-DD)
  private getTodayDateString(): string {
    const today = new Date();
    return today.toISOString().split('T')[0];
  }

  // Get stored daily verse if it's for today
  private async getStoredDailyVerse(): Promise<QuranVerse | null> {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEYS.DAILY_VERSE);
      if (stored) {
        const data: StoredDailyVerse = JSON.parse(stored);
        if (data.date === this.getTodayDateString()) {
          const verse = data.verse;
          // Validate: ayah number should not be unreasonably large (max 286 verses in longest surah)
          // If it's > 300, it's likely the global verse number, so invalidate the cache
          if (verse.ayahNumber > 300) {
            await AsyncStorage.removeItem(STORAGE_KEYS.DAILY_VERSE);
            return null;
          }
          return verse;
        }
      }
    } catch (error) {
      console.error('Error getting stored daily verse:', error);
    }
    return null;
  }

  // Store daily verse for today
  private async storeDailyVerse(verse: QuranVerse): Promise<void> {
    try {
      const data: StoredDailyVerse = {
        verse,
        date: this.getTodayDateString(),
      };
      await AsyncStorage.setItem(STORAGE_KEYS.DAILY_VERSE, JSON.stringify(data));
    } catch (error) {
      console.error('Error storing daily verse:', error);
    }
  }

  // Get a deterministic random verse based on date (same verse for all users on same day)
  private async fetchDailyVerseForDate(): Promise<QuranVerse | null> {
    try {
      // Use date as seed for consistent daily verse
      const today = new Date();
      const dateSeed = Math.floor(today.getTime() / (1000 * 60 * 60 * 24));
      
      // Pick a surah based on date seed (cycling through all surahs)
      const surahNumber = (dateSeed % 114) + 1;
      
      // Fetch surah with Arabic text
      const surahResponse = await fetch(`${QURAN_API_BASE}/surah/${surahNumber}`);
      const surahData = await surahResponse.json();
      
      if (surahData.code !== 200 || !surahData.data) {
        throw new Error('Failed to fetch surah');
      }

      const surah = surahData.data;
      const verses = surah.ayahs || [];
    
      
      if (verses.length === 0) {
        throw new Error('No verses found');
      }

      // Pick a verse based on date seed (ensures same verse each day)
      const verseIndex = dateSeed % verses.length;
      const selectedVerse = verses[verseIndex];
      
      // The verses array should be in order, so we can use the index directly
      // Array is 0-based, ayah numbers are 1-based, so use verseIndex + 1
      // Only use numberInSurah if it exists and is a reasonable value (between 1 and array length)
      let ayahNumber = verseIndex + 1; // Default to index-based
      
      if (selectedVerse.numberInSurah !== undefined && 
          selectedVerse.numberInSurah !== null && 
          selectedVerse.numberInSurah > 0 && 
          selectedVerse.numberInSurah <= verses.length) {
        ayahNumber = selectedVerse.numberInSurah;
      }
      
      // NEVER use selectedVerse.number as it's the global verse number across all surahs

      // Get English translation for the same surah
      const translationResponse = await fetch(`${QURAN_API_BASE}/surah/${surahNumber}/en.sahih`);
      const translationData = await translationResponse.json();
      
      let englishText = '';
      if (translationData.code === 200 && translationData.data?.ayahs) {
        const translatedVerses = translationData.data.ayahs;
        // Verses should be in the same order, so we can use the index directly
        // But also try to find by numberInSurah for safety
        const translatedVerse = translatedVerses.find((v: any) => 
          (v.numberInSurah !== undefined && v.numberInSurah === ayahNumber)
        ) || translatedVerses[verseIndex];
        englishText = translatedVerse?.text || '';
      }

      const verse: QuranVerse = {
        id: `${surahNumber}:${ayahNumber}`,
        arabic: selectedVerse.text || '',
        english: englishText,
        surahNumber: surah.number || surahNumber,
        surahName: surah.name || `Surah ${surahNumber}`,
        surahNameEnglish: surah.englishName || `Chapter ${surahNumber}`,
        ayahNumber: ayahNumber,
      };

      return verse;
    } catch (error) {
      console.error('Error fetching daily verse for date:', error);
      return null;
    }
  }

  // Fetch a random verse from API
  private async fetchRandomVerse(): Promise<QuranVerse | null> {
    try {
      // Pick a random surah (1-114)
      const randomSurahNumber = Math.floor(Math.random() * 114) + 1;
      
      // Fetch surah with Arabic text
      const surahResponse = await fetch(`${QURAN_API_BASE}/surah/${randomSurahNumber}`);
      const surahData = await surahResponse.json();
      
      if (surahData.code !== 200 || !surahData.data) {
        throw new Error('Failed to fetch surah');
      }

      const surah = surahData.data;
      const verses = surah.ayahs || [];
      
      if (verses.length === 0) {
        throw new Error('No verses found');
      }

      // Pick a random verse from this surah
      const randomVerseIndex = Math.floor(Math.random() * verses.length);
      const selectedVerse = verses[randomVerseIndex];
      // Use numberInSurah if available, otherwise use array index + 1
      // Don't use selectedVerse.number as it might be the global verse number across all surahs
      const ayahNumber = selectedVerse.numberInSurah !== undefined 
        ? selectedVerse.numberInSurah 
        : (randomVerseIndex + 1);

      // Get English translation
      const translationResponse = await fetch(`${QURAN_API_BASE}/surah/${randomSurahNumber}/en.sahih`);
      const translationData = await translationResponse.json();
      
      let englishText = '';
      if (translationData.code === 200 && translationData.data?.ayahs) {
        const translatedVerses = translationData.data.ayahs;
        // Find the matching verse by numberInSurah (not by global number)
        const translatedVerse = translatedVerses.find((v: any) => 
          (v.numberInSurah !== undefined && v.numberInSurah === ayahNumber) ||
          (!v.numberInSurah && translatedVerses.indexOf(v) === randomVerseIndex)
        );
        englishText = translatedVerse?.text || translatedVerses[randomVerseIndex]?.text || '';
      }

      const verse: QuranVerse = {
        id: `${randomSurahNumber}:${ayahNumber}`,
        arabic: selectedVerse.text || '',
        english: englishText,
        surahNumber: surah.number || randomSurahNumber,
        surahName: surah.name || `Surah ${randomSurahNumber}`,
        surahNameEnglish: surah.englishName || `Chapter ${randomSurahNumber}`,
        ayahNumber: ayahNumber,
      };

      return verse;
    } catch (error) {
      console.error('Error fetching random verse:', error);
      return null;
    }
  }

  // Get today's daily verse (cached or fetched)
  async getDailyVerse(): Promise<QuranVerse | null> {
    // Check if we already have today's verse stored
    const storedVerse = await this.getStoredDailyVerse();
    if (storedVerse) {
      return storedVerse;
    }

    // Fetch new verse for today
    const verse = await this.fetchDailyVerseForDate();
    
    if (verse) {
      await this.storeDailyVerse(verse);
      // Cache it
      if (!this.cachedVerses.find(v => v.id === verse.id)) {
        this.cachedVerses.push(verse);
        await this.saveCachedVerses();
      }
    }

    return verse;
  }

  // Get a random verse (for manual refresh)
  async getRandomVerse(): Promise<QuranVerse | null> {
    const verse = await this.fetchRandomVerse();
    
    if (verse && !this.cachedVerses.find(v => v.id === verse.id)) {
      this.cachedVerses.push(verse);
      await this.saveCachedVerses();
    }

    return verse;
  }
}

// Export singleton instance
export const quranVerseManager = QuranVerseManager.getInstance();

