import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = 'quran_translation_settings';

export interface TranslationSettings {
  translationId: number;
  translationName: string;
  languageName?: string;
}

// Default to M.A.S. Abdel Haleem (resource_id 85 on api.quran.com)
const DEFAULT_SETTINGS: TranslationSettings = {
  translationId: 85,
  translationName: 'M.A.S. Abdel Haleem',
  languageName: 'English',
};

export async function getTranslationSettings(): Promise<TranslationSettings> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<TranslationSettings>;
      if (typeof parsed.translationId === 'number' && typeof parsed.translationName === 'string') {
        return {
          translationId: parsed.translationId,
          translationName: parsed.translationName,
          languageName: parsed.languageName,
        };
      }
    }
  } catch (error) {
    console.error('Error loading translation settings:', error);
  }
  return DEFAULT_SETTINGS;
}

export async function saveTranslationSettings(settings: TranslationSettings): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  } catch (error) {
    console.error('Error saving translation settings:', error);
    throw error;
  }
}

export async function updateTranslation(settings: TranslationSettings): Promise<void> {
  await saveTranslationSettings(settings);
}

export async function resetTranslationSettings(): Promise<void> {
  await saveTranslationSettings(DEFAULT_SETTINGS);
}

