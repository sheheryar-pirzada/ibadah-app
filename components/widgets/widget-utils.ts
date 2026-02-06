import AsyncStorage from '@react-native-async-storage/async-storage';
import { createPrayerTimesSync, getNextPrayer, prayerToKey } from '@/utils/prayer-times';
import { getPrayerSettings, type CalculationMethodKey, type MadhabKey } from '@/utils/prayer-settings';
import { formatPrayerTime, getPrayerName, getIslamicDateString, type PrayerKey } from '@/utils/prayer-ui';

const LOCATION_STORAGE_KEY = 'widget_location';

export interface WidgetLocation {
  latitude: number;
  longitude: number;
}

export interface PrayerTimeData {
  key: PrayerKey;
  name: string;
  time: string;
  timeMs: number;
  timeRemaining?: string;
}

/**
 * Format time remaining as "Xh Ym"
 */
function formatTimeRemaining(targetMs: number, nowMs: number = Date.now()): string {
  const diffMs = targetMs - nowMs;
  if (diffMs <= 0) return '0m';

  const totalMinutes = Math.floor(diffMs / 60000);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  return `${minutes}m`;
}

export interface WidgetData {
  hasLocation: boolean;
  currentDate: string;
  islamicDate: string;
  nextPrayer: PrayerTimeData | null;
  allPrayers: PrayerTimeData[];
  upcomingPrayers: PrayerTimeData[];
}

// Prayer order for cycling through the day
const PRAYER_ORDER: PrayerKey[] = ['fajr', 'sunrise', 'dhuhr', 'asr', 'maghrib', 'isha'];

/**
 * Save location for widget use
 */
export async function saveWidgetLocation(latitude: number, longitude: number): Promise<void> {
  try {
    await AsyncStorage.setItem(LOCATION_STORAGE_KEY, JSON.stringify({ latitude, longitude }));
  } catch (error) {
    console.error('Error saving widget location:', error);
  }
}

/**
 * Get saved widget location
 */
export async function getWidgetLocation(): Promise<WidgetLocation | null> {
  try {
    const data = await AsyncStorage.getItem(LOCATION_STORAGE_KEY);
    if (data) {
      return JSON.parse(data) as WidgetLocation;
    }
  } catch (error) {
    console.error('Error getting widget location:', error);
  }
  return null;
}

/**
 * Prepare all prayer data for widgets
 */
export async function getWidgetData(): Promise<WidgetData> {
  const location = await getWidgetLocation();

  if (!location) {
    return {
      hasLocation: false,
      currentDate: formatCurrentDate(),
      islamicDate: getIslamicDateString(),
      nextPrayer: null,
      allPrayers: [],
      upcomingPrayers: [],
    };
  }

  const settings = await getPrayerSettings();
  return getWidgetDataSync(
    location.latitude,
    location.longitude,
    settings.calculationMethod,
    settings.madhab
  );
}

/**
 * Synchronous version for when settings are already loaded
 */
export function getWidgetDataSync(
  latitude: number,
  longitude: number,
  method: CalculationMethodKey,
  madhab: MadhabKey,
  date: Date = new Date()
): WidgetData {
  const prayerTimes = createPrayerTimesSync(latitude, longitude, method, madhab, date);

  const allPrayers: PrayerTimeData[] = PRAYER_ORDER.map(key => ({
    key,
    name: getPrayerName(key),
    time: formatPrayerTime(prayerTimes[key]),
    timeMs: prayerTimes[key].getTime(),
  }));

  const nextPrayerEnum = getNextPrayer(prayerTimes, date);
  const nextPrayerKey = prayerToKey(nextPrayerEnum);

  let nextPrayer: PrayerTimeData | null = null;
  let upcomingPrayers: PrayerTimeData[] = [];
  const nowMs = date.getTime();

  if (nextPrayerKey) {
    const nextIndex = PRAYER_ORDER.indexOf(nextPrayerKey);
    const prayer = allPrayers[nextIndex];
    nextPrayer = {
      ...prayer,
      timeRemaining: formatTimeRemaining(prayer.timeMs, nowMs),
    };

    // Get up to 2 prayers after the next one (wrapping to next day if needed)
    upcomingPrayers = [];
    for (let i = 1; i <= 2; i++) {
      const idx = (nextIndex + i) % PRAYER_ORDER.length;
      upcomingPrayers.push(allPrayers[idx]);
    }
  } else {
    // If no next prayer (after Isha), next is Fajr tomorrow
    const fajr = allPrayers[0];
    nextPrayer = {
      ...fajr,
      timeRemaining: formatTimeRemaining(fajr.timeMs + 86400000, nowMs), // Add 24h for tomorrow
    };
    upcomingPrayers = [allPrayers[1], allPrayers[2]]; // Sunrise, Dhuhr
  }

  return {
    hasLocation: true,
    currentDate: formatCurrentDate(date),
    islamicDate: getIslamicDateString(date),
    nextPrayer,
    allPrayers,
    upcomingPrayers,
  };
}

/**
 * Format current date for display
 */
function formatCurrentDate(date: Date = new Date()): string {
  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
}

/**
 * Widget color theme
 */
export const widgetColors = {
  dark: {
    background: '#0F3D2C',
    backgroundSecondary: '#134832',
    text: '#FFFFFF',
    textSecondary: 'rgba(255, 255, 255, 0.7)',
    textMuted: 'rgba(255, 255, 255, 0.5)',
    accent: '#D4AF37',
    divider: 'rgba(255, 255, 255, 0.1)',
  },
  light: {
    background: '#F5F2E8',
    backgroundSecondary: '#FFFFFF',
    text: '#046307',
    textSecondary: '#2d5016',
    textMuted: '#5a7a4a',
    accent: '#D4AF37',
    divider: 'rgba(4, 99, 7, 0.1)',
  },
};
