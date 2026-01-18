// utils/reciter-settings.ts
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = 'quran_reciter_settings';

export interface ReciterSettings {
  reciterId: number;
  reciterName: string;
  reciterStyle: string | null;
}

// Default to Mishary Rashid al-Afasy
const DEFAULT_SETTINGS: ReciterSettings = {
  reciterId: 7,
  reciterName: "Mishari Rashid al-`Afasy",
  reciterStyle: null,
};

/**
 * Get reciter settings from storage
 */
export async function getReciterSettings(): Promise<ReciterSettings> {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEY);
    if (data) {
      const settings = JSON.parse(data) as ReciterSettings;
      // Validate settings have required fields
      if (typeof settings.reciterId === 'number' && typeof settings.reciterName === 'string') {
        return settings;
      }
    }
  } catch (error) {
    console.error('Error loading reciter settings:', error);
  }
  return DEFAULT_SETTINGS;
}

/**
 * Save reciter settings to storage
 */
export async function saveReciterSettings(settings: ReciterSettings): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  } catch (error) {
    console.error('Error saving reciter settings:', error);
    throw error;
  }
}

/**
 * Update selected reciter
 */
export async function updateReciter(
  reciterId: number,
  reciterName: string,
  reciterStyle: string | null
): Promise<void> {
  await saveReciterSettings({
    reciterId,
    reciterName,
    reciterStyle,
  });
}

/**
 * Get the display name for a reciter (with style if available)
 */
export function getReciterDisplayName(name: string, style: string | null): string {
  if (style) {
    return `${name} (${style})`;
  }
  return name;
}

/**
 * Reset to default reciter
 */
export async function resetReciterSettings(): Promise<void> {
  await saveReciterSettings(DEFAULT_SETTINGS);
}
