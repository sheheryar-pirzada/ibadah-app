// utils/notification-settings.ts
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = 'notification_settings';

export type PrayerKey = 'fajr' | 'dhuhr' | 'asr' | 'maghrib' | 'isha';

export interface NotificationSettings {
  enabled: boolean;
  prayers: {
    fajr: boolean;
    dhuhr: boolean;
    asr: boolean;
    maghrib: boolean;
    isha: boolean;
  };
  reminders: {
    enabled: boolean;
    fajr: boolean;
    dhuhr: boolean;
    asr: boolean;
    maghrib: boolean;
    isha: boolean;
  };
  reminderMinutesBefore: number; // Minutes before prayer time ends to send reminder
  duas: boolean;
  duaOffsetMinutes: number; // Minutes after Fajr/Maghrib for dua notifications
}

const DEFAULT_SETTINGS: NotificationSettings = {
  enabled: false,
  prayers: {
    fajr: true,
    dhuhr: true,
    asr: true,
    maghrib: true,
    isha: true,
  },
  reminders: {
    enabled: false,
    fajr: true,
    dhuhr: true,
    asr: true,
    maghrib: true,
    isha: true,
  },
  reminderMinutesBefore: 15,
  duas: true,
  duaOffsetMinutes: 30,
};

/**
 * Get notification settings from storage
 */
export async function getNotificationSettings(): Promise<NotificationSettings> {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEY);
    if (data) {
      const settings = JSON.parse(data) as NotificationSettings;
      // Validate and merge with defaults
      return {
        ...DEFAULT_SETTINGS,
        ...settings,
        prayers: {
          ...DEFAULT_SETTINGS.prayers,
          ...(settings.prayers || {}),
        },
        reminders: {
          ...DEFAULT_SETTINGS.reminders,
          ...(settings.reminders || {}),
        },
      };
    }
  } catch (error) {
    console.error('Error loading notification settings:', error);
  }
  return DEFAULT_SETTINGS;
}

/**
 * Save notification settings to storage
 */
export async function saveNotificationSettings(settings: NotificationSettings): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  } catch (error) {
    console.error('Error saving notification settings:', error);
    throw error;
  }
}

/**
 * Update master toggle
 */
export async function updateNotificationEnabled(enabled: boolean): Promise<void> {
  const settings = await getNotificationSettings();
  settings.enabled = enabled;
  await saveNotificationSettings(settings);
}

/**
 * Update individual prayer toggle
 */
export async function updatePrayerToggle(prayer: PrayerKey, enabled: boolean): Promise<void> {
  const settings = await getNotificationSettings();
  settings.prayers[prayer] = enabled;
  await saveNotificationSettings(settings);
}

/**
 * Update dua notifications toggle
 */
export async function updateDuaToggle(enabled: boolean): Promise<void> {
  const settings = await getNotificationSettings();
  settings.duas = enabled;
  await saveNotificationSettings(settings);
}

/**
 * Update dua offset minutes
 */
export async function updateDuaOffsetMinutes(minutes: number): Promise<void> {
  const settings = await getNotificationSettings();
  settings.duaOffsetMinutes = minutes;
  await saveNotificationSettings(settings);
}

/**
 * Update reminders master toggle
 */
export async function updateRemindersEnabled(enabled: boolean): Promise<void> {
  const settings = await getNotificationSettings();
  settings.reminders.enabled = enabled;
  await saveNotificationSettings(settings);
}

/**
 * Update individual reminder prayer toggle
 */
export async function updateReminderPrayerToggle(prayer: PrayerKey, enabled: boolean): Promise<void> {
  const settings = await getNotificationSettings();
  settings.reminders[prayer] = enabled;
  await saveNotificationSettings(settings);
}

/**
 * Reset to default settings
 */
export async function resetNotificationSettings(): Promise<void> {
  await saveNotificationSettings(DEFAULT_SETTINGS);
}

