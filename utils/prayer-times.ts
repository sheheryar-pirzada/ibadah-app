// src/utils/prayerTimes.ts
import {
  PrayerTimes,
  CalculationMethod,
  Madhab,
  Coordinates
} from 'adhan';

/**
 * getPrayerTimesAdhan
 *
 * @param lat      latitude in decimal degrees
 * @param lng      longitude in decimal degrees
 * @param method   e.g. 'MuslimWorldLeague' | 'NorthAmerica' | 'Karachi' | 'UmmAlQura' | 'Dubai' | 'Egypt' | 'Tehran' | 'Custom'
 * @param madhab   'Shafi' | 'Hanafi'
 * @param date     JS Date (defaults to today)
 */
export function getPrayerTimesAdhan(
  lat: number,
  lng: number,
  method: keyof typeof CalculationMethod = 'MuslimWorldLeague',
  madhab: keyof typeof Madhab = 'Shafi',
  date: Date = new Date()
) {
  // 1. build calculation params
  const params = CalculationMethod[method]();
  params.madhab = Madhab[madhab];

  // 2. compute times
  const coords = new Coordinates(lat, lng);
  const times = new PrayerTimes(coords, date, params);

  // 3. helper to format Date → "HH:mm"
  const fmt = (d: Date) =>
    d.toLocaleTimeString(undefined, {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });

  return {
    fajr:    fmt(times.fajr),
    sunrise: fmt(times.sunrise),
    dhuhr:   fmt(times.dhuhr),
    asr:     fmt(times.asr),
    maghrib: fmt(times.maghrib),
    isha:    fmt(times.isha),
  };
}
