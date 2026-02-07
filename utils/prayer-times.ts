// src/utils/prayerTimes.ts
import {
  PrayerTimes,
  CalculationMethod,
  Madhab,
  Coordinates,
  Prayer,
  HighLatitudeRule
} from 'adhan';
import { getPrayerSettings, type CalculationMethodKey, type MadhabKey } from './prayer-settings';

/**
 * Helper to format Date → "HH:mm"
 */
const formatTime = (d: Date) =>
  d.toLocaleTimeString(undefined, {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });

/**
 * Create PrayerTimes object with calculation parameters
 * If method/madhab are not provided, loads from saved settings
 *
 * @param lat      latitude in decimal degrees
 * @param lng      longitude in decimal degrees
 * @param method   optional: calculation method (defaults to saved setting)
 * @param madhab   optional: madhab (defaults to saved setting)
 * @param date     JS Date (defaults to today)
 */
export async function createPrayerTimes(
  lat: number,
  lng: number,
  method?: CalculationMethodKey,
  madhab?: MadhabKey,
  date: Date = new Date()
): Promise<PrayerTimes> {
  // Load settings if method/madhab not provided
  let finalMethod: CalculationMethodKey;
  let finalMadhab: MadhabKey;
  
  if (method && madhab) {
    finalMethod = method;
    finalMadhab = madhab;
  } else {
    const settings = await getPrayerSettings();
    finalMethod = method || settings.calculationMethod;
    finalMadhab = madhab || settings.madhab;
  }

  // 1. build calculation params
  const params = CalculationMethod[finalMethod]();
  params.madhab = Madhab[finalMadhab];

  // 2. Apply high latitude rule if needed (latitude > 48.5 or < -48.5)
  const coords = new Coordinates(lat, lng);
  if (Math.abs(lat) > 48.5) {
    params.highLatitudeRule = HighLatitudeRule.recommended(coords);
  }

  // 3. compute times
  return new PrayerTimes(coords, date, params);
}

/**
 * Synchronous version that requires method and madhab to be provided
 * Use this when you have the values already (for backwards compatibility)
 */
export function createPrayerTimesSync(
  lat: number,
  lng: number,
  method: CalculationMethodKey = 'MuslimWorldLeague',
  madhab: MadhabKey = 'Shafi',
  date: Date = new Date()
): PrayerTimes {
  // 1. build calculation params
  const params = CalculationMethod[method]();
  params.madhab = Madhab[madhab];

  // 2. Apply high latitude rule if needed (latitude > 48.5 or < -48.5)
  const coords = new Coordinates(lat, lng);
  if (Math.abs(lat) > 48.5) {
    params.highLatitudeRule = HighLatitudeRule.recommended(coords);
  }

  // 3. compute times
  return new PrayerTimes(coords, date, params);
}

/**
 * getPrayerTimesAdhan (async version that loads settings)
 *
 * @param lat      latitude in decimal degrees
 * @param lng      longitude in decimal degrees
 * @param method   optional: calculation method (defaults to saved setting)
 * @param madhab   optional: madhab (defaults to saved setting)
 * @param date     JS Date (defaults to today)
 */
export async function getPrayerTimesAdhan(
  lat: number,
  lng: number,
  method?: CalculationMethodKey,
  madhab?: MadhabKey,
  date: Date = new Date()
) {
  const times = await createPrayerTimes(lat, lng, method, madhab, date);

  return {
    fajr:    formatTime(times.fajr),
    sunrise: formatTime(times.sunrise),
    dhuhr:   formatTime(times.dhuhr),
    asr:     formatTime(times.asr),
    maghrib: formatTime(times.maghrib),
    isha:    formatTime(times.isha),
  };
}

/**
 * Synchronous version for backwards compatibility
 */
export function getPrayerTimesAdhanSync(
  lat: number,
  lng: number,
  method: CalculationMethodKey = 'MuslimWorldLeague',
  madhab: MadhabKey = 'Shafi',
  date: Date = new Date()
) {
  const times = createPrayerTimesSync(lat, lng, method, madhab, date);

  return {
    fajr:    formatTime(times.fajr),
    sunrise: formatTime(times.sunrise),
    dhuhr:   formatTime(times.dhuhr),
    asr:     formatTime(times.asr),
    maghrib: formatTime(times.maghrib),
    isha:    formatTime(times.isha),
  };
}

/**
 * Get current prayer using PrayerTimes convenience method
 */
export function getCurrentPrayer(prayerTimes: PrayerTimes, date?: Date): typeof Prayer[keyof typeof Prayer] {
  return prayerTimes.currentPrayer(date);
}

/**
 * Get next prayer using PrayerTimes convenience method
 */
export function getNextPrayer(prayerTimes: PrayerTimes, date?: Date): typeof Prayer[keyof typeof Prayer] {
  return prayerTimes.nextPrayer(date);
}

/**
 * Get time for a specific prayer using PrayerTimes convenience method
 */
export function getTimeForPrayer(
  prayerTimes: PrayerTimes,
  prayer: typeof Prayer[keyof typeof Prayer]
): Date | null {
  return prayerTimes.timeForPrayer(prayer);
}

/**
 * Convert prayer enum to PrayerKey type used in the app
 */
const VALID_PRAYER_KEYS = ['fajr', 'sunrise', 'dhuhr', 'asr', 'maghrib', 'isha'] as const;

export function prayerToKey(prayer: typeof Prayer[keyof typeof Prayer]): 'fajr' | 'sunrise' | 'dhuhr' | 'asr' | 'maghrib' | 'isha' | null {
  // Check for None explicitly (handles both enum and string comparison)
  if (prayer === Prayer.None || prayer === 'none') return null;
  // Validate it's a valid prayer key
  const prayerStr = String(prayer);
  if (VALID_PRAYER_KEYS.includes(prayerStr as any)) {
    return prayerStr as 'fajr' | 'sunrise' | 'dhuhr' | 'asr' | 'maghrib' | 'isha';
  }
  return null;
}
