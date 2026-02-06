// utils/quran-search-settings.ts
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEYS = {
  MODE: 'quran_search_mode',
  READ_BY_VERSE: 'quran_search_read_by_verse',
} as const;

export type QuranSearchMode = 'Search' | 'Read';

const MODE_VALUES: QuranSearchMode[] = ['Search', 'Read'];

export interface QuranSearchPreferences {
  mode: QuranSearchMode;
  readByVerse: boolean;
}

const DEFAULT_PREFERENCES: QuranSearchPreferences = {
  mode: 'Search',
  readByVerse: true,
};

/**
 * Load quran search preferences from storage
 */
export async function getQuranSearchPreferences(): Promise<QuranSearchPreferences> {
  try {
    const [modeRaw, readByVerseRaw] = await Promise.all([
      AsyncStorage.getItem(STORAGE_KEYS.MODE),
      AsyncStorage.getItem(STORAGE_KEYS.READ_BY_VERSE),
    ]);

    const mode =
      modeRaw && MODE_VALUES.includes(modeRaw as QuranSearchMode)
        ? (modeRaw as QuranSearchMode)
        : DEFAULT_PREFERENCES.mode;

    const readByVerse =
      readByVerseRaw !== null
        ? readByVerseRaw === 'true'
        : DEFAULT_PREFERENCES.readByVerse;

    return { mode, readByVerse };
  } catch (error) {
    console.error('Error loading quran search preferences:', error);
    return DEFAULT_PREFERENCES;
  }
}

/**
 * Save quran search mode
 */
export async function saveQuranSearchMode(mode: QuranSearchMode): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.MODE, mode);
  } catch (error) {
    console.error('Error saving quran search mode:', error);
  }
}

/**
 * Save read-by-verse preference (true = by verse, false = by page)
 */
export async function saveQuranSearchReadByVerse(readByVerse: boolean): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.READ_BY_VERSE, String(readByVerse));
  } catch (error) {
    console.error('Error saving quran search read-by-verse:', error);
  }
}
