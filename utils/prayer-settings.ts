// utils/prayer-settings.ts
import AsyncStorage from '@react-native-async-storage/async-storage';
import { CalculationMethod, Madhab } from 'adhan';

const STORAGE_KEY = 'prayer_settings';

export type CalculationMethodKey = keyof typeof CalculationMethod;
export type MadhabKey = keyof typeof Madhab;

export interface PrayerSettings {
  calculationMethod: CalculationMethodKey;
  madhab: MadhabKey;
}

const DEFAULT_SETTINGS: PrayerSettings = {
  calculationMethod: 'MuslimWorldLeague',
  madhab: 'Shafi',
};

/**
 * Get prayer settings from storage
 */
export async function getPrayerSettings(): Promise<PrayerSettings> {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEY);
    if (data) {
      const settings = JSON.parse(data) as PrayerSettings;
      // Validate settings
      if (
        typeof settings.calculationMethod === 'string' &&
        typeof settings.madhab === 'string' &&
        settings.calculationMethod in CalculationMethod &&
        settings.madhab in Madhab
      ) {
        return settings;
      }
    }
  } catch (error) {
    console.error('Error loading prayer settings:', error);
  }
  return DEFAULT_SETTINGS;
}

/**
 * Save prayer settings to storage
 */
export async function savePrayerSettings(settings: PrayerSettings): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  } catch (error) {
    console.error('Error saving prayer settings:', error);
    throw error;
  }
}

/**
 * Update calculation method
 */
export async function updateCalculationMethod(method: CalculationMethodKey): Promise<void> {
  const settings = await getPrayerSettings();
  settings.calculationMethod = method;
  await savePrayerSettings(settings);
}

/**
 * Update madhab
 */
export async function updateMadhab(madhab: MadhabKey): Promise<void> {
  const settings = await getPrayerSettings();
  settings.madhab = madhab;
  await savePrayerSettings(settings);
}

/**
 * Reset to default settings
 */
export async function resetPrayerSettings(): Promise<void> {
  await savePrayerSettings(DEFAULT_SETTINGS);
}

/**
 * Get all available calculation method keys with display names
 */
export function getCalculationMethodOptions(): Array<{ key: CalculationMethodKey; name: string }> {
  return [
    { key: 'MuslimWorldLeague', name: 'Muslim World League' },
    { key: 'Egyptian', name: 'Egyptian General Authority' },
    { key: 'Karachi', name: 'University of Islamic Sciences, Karachi' },
    { key: 'UmmAlQura', name: 'Umm Al-Qura University, Makkah' },
    { key: 'Dubai', name: 'Dubai' },
    { key: 'MoonsightingCommittee', name: 'Moonsighting Committee' },
    { key: 'NorthAmerica', name: 'North America' },
    { key: 'Kuwait', name: 'Kuwait' },
    { key: 'Qatar', name: 'Qatar' },
    { key: 'Singapore', name: 'Singapore' },
    { key: 'Tehran', name: 'Institute of Geophysics, University of Tehran' },
    { key: 'Turkey', name: 'Turkish Directorate of Religious Affairs' },
    { key: 'Other', name: 'Other' },
  ];
}

/**
 * Get all available madhab keys with display names
 */
export function getMadhabOptions(): Array<{ key: MadhabKey; name: string }> {
  return [
    { key: 'Shafi', name: 'Shafi\'i' },
    { key: 'Hanafi', name: 'Hanafi' },
  ];
}

