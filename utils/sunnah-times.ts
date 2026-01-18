// utils/sunnah-times.ts
import { PrayerTimes, SunnahTimes, Coordinates, CalculationMethod, Madhab } from 'adhan';

/**
 * Get Sunnah times (Qiyam al-Layl times) for a given date and location
 * 
 * @param lat      latitude in decimal degrees
 * @param lng      longitude in decimal degrees
 * @param method   calculation method
 * @param madhab   madhab (Shafi or Hanafi)
 * @param date     JS Date (defaults to today)
 */
export function getSunnahTimes(
  lat: number,
  lng: number,
  method: keyof typeof CalculationMethod = 'MuslimWorldLeague',
  madhab: keyof typeof Madhab = 'Shafi',
  date: Date = new Date()
) {
  const coords = new Coordinates(lat, lng);
  const params = CalculationMethod[method]();
  params.madhab = Madhab[madhab];
  
  const prayerTimes = new PrayerTimes(coords, date, params);
  const sunnahTimes = new SunnahTimes(prayerTimes);
  
  return {
    middleOfTheNight: sunnahTimes.middleOfTheNight,
    lastThirdOfTheNight: sunnahTimes.lastThirdOfTheNight,
  };
}

/**
 * Format Sunnah times to "HH:mm" format
 */
export function formatSunnahTimes(sunnahTimes: { middleOfTheNight: Date; lastThirdOfTheNight: Date }) {
  const formatTime = (d: Date) =>
    d.toLocaleTimeString(undefined, {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
    
  return {
    middleOfTheNight: formatTime(sunnahTimes.middleOfTheNight),
    lastThirdOfTheNight: formatTime(sunnahTimes.lastThirdOfTheNight),
  };
}

/**
 * Get Sunnah times from an existing PrayerTimes object
 */
export function getSunnahTimesFromPrayerTimes(prayerTimes: PrayerTimes) {
  const sunnahTimes = new SunnahTimes(prayerTimes);
  
  return {
    middleOfTheNight: sunnahTimes.middleOfTheNight,
    lastThirdOfTheNight: sunnahTimes.lastThirdOfTheNight,
  };
}

