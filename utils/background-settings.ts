import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = 'background_settings';

export type BackgroundKey = 'solid' | 'grain1' | 'grain2' | 'grain3';

export interface BackgroundSettings {
  key: BackgroundKey;
}

const DEFAULT_SETTINGS: BackgroundSettings = {
  key: 'solid',
};

const VALID_KEYS: BackgroundKey[] = ['solid', 'grain1', 'grain2', 'grain3'];

/** Theme to apply when this background is selected. Solid leaves theme unchanged. */
export const BACKGROUND_TO_THEME: Record<BackgroundKey, 'light' | 'dark' | null> = {
  solid: null,
  grain1: 'light',
  grain2: 'light',
  grain3: 'dark',
};

/** Returns the theme to set when the given background is selected, or null to leave theme unchanged. */
export function getThemeForBackground(key: BackgroundKey): 'light' | 'dark' | null {
  return BACKGROUND_TO_THEME[key];
}

/** Image sources for grain backgrounds (require() in RN). Used by BackgroundImage and the settings picker. */
export const BACKGROUND_IMAGE_SOURCES: Record<'grain1' | 'grain2' | 'grain3', number> = {
  grain1: require('@/assets/backgrounds/grain1.jpg'),
  grain2: require('@/assets/backgrounds/grain2.png'),
  grain3: require('@/assets/backgrounds/grain3.jpeg'),
};

/** Returns the image source for the given key, or null for solid (theme) background. */
export function getBackgroundImageSource(key: BackgroundKey): number | null {
  if (key === 'solid') return null;
  return BACKGROUND_IMAGE_SOURCES[key] ?? null;
}

export async function getBackgroundSettings(): Promise<BackgroundSettings> {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEY);
    if (data) {
      const parsed = JSON.parse(data) as { key?: string };
      const key = parsed?.key;
      // Migrate legacy keys
      if (key === 'none') return { key: 'solid' };
      if (key === 'grain') return { key: 'grain1' };
      if (typeof key === 'string' && VALID_KEYS.includes(key as BackgroundKey)) {
        return { key: key as BackgroundKey };
      }
    }
  } catch (error) {
    console.error('Error loading background settings:', error);
  }
  return DEFAULT_SETTINGS;
}

export async function setBackgroundKey(key: BackgroundKey): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify({ key }));
  } catch (error) {
    console.error('Error saving background settings:', error);
  }
}
