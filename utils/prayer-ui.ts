export type PrayerKey = 'fajr' | 'sunrise' | 'dhuhr' | 'asr' | 'maghrib' | 'isha';

export interface ImmersiveColors {
  primary: string;
  secondary: string;
  expanding: {
    light: string[];
    dark: string[];
  };
}

export interface RakatInfo {
  fard: number;
  sunnah: number;
  nafl: number;
}

/**
 * Get immersive overlay colors based on prayer time
 */
export function getImmersiveColors(prayerKey: PrayerKey): ImmersiveColors {
  switch (prayerKey) {
    case 'fajr':
      return {
        primary: '#B3E5FC',
        secondary: '#0288D1',
        expanding: {
          light: ['#B3E5FC', '#4FC3F7', '#0288D1'],
          dark: ['#0288D1', '#01579B', '#001F3F'],
        },
      };
    case 'sunrise':
      return {
        primary: '#FFE082',
        secondary: '#FF8F00',
        expanding: {
          light: ['#FFF8E1', '#FFD54F', '#FF8F00'],
          dark: ['#FF8F00', '#EF6C00', '#BF360C'],
        },
      };
    case 'dhuhr':
      return {
        primary: '#FFF176',
        secondary: '#FBC02D',
        expanding: {
          light: ['#FFF176', '#FFD54F', '#FBC02D'],
          dark: ['#FBC02D', '#F57F17', '#9E7400'],
        },
      };
    case 'asr':
      return {
        primary: '#FFB74D',
        secondary: '#F57C00',
        expanding: {
          light: ['#FFE0B2', '#FFB74D', '#F57C00'],
          dark: ['#F57C00', '#E65100', '#8B4513'],
        },
      };
    case 'maghrib':
      return {
        primary: '#E57373',
        secondary: '#C62828',
        expanding: {
          light: ['#FFCDD2', '#E57373', '#C62828'],
          dark: ['#C62828', '#B71C1C', '#7B1FA2'],
        },
      };
    case 'isha':
      return {
        primary: '#7E57C2',
        secondary: '#4527A0',
        expanding: {
          light: ['#D1C4E9', '#7E57C2', '#4527A0'],
          dark: ['#4527A0', '#311B92', '#1A237E'],
        },
      };
    default:
      return {
        primary: '#90A4AE',
        secondary: '#455A64',
        expanding: {
          light: ['#CFD8DC', '#90A4AE', '#455A64'],
          dark: ['#455A64', '#263238', '#000'],
        },
      };
  }
}

/**
 * Get display name for a prayer
 */
export function getPrayerName(key: PrayerKey): string {
  const names: Record<PrayerKey, string> = {
    fajr: 'Fajr',
    sunrise: 'Sunrise',
    dhuhr: 'Dhuhr',
    asr: 'Asr',
    maghrib: 'Maghrib',
    isha: 'Isha',
  };
  return names[key];
}

/**
 * Get rakat information for a prayer
 */
export function getRakats(key: PrayerKey): RakatInfo {
  switch (key) {
    case 'fajr':
      return { fard: 2, sunnah: 2, nafl: 0 };
    case 'dhuhr':
      return { fard: 4, sunnah: 4, nafl: 2 };
    case 'asr':
      return { fard: 4, sunnah: 0, nafl: 2 };
    case 'maghrib':
      return { fard: 3, sunnah: 0, nafl: 2 };
    case 'isha':
      return { fard: 4, sunnah: 2, nafl: 2 };
    case 'sunrise':
      return { fard: 0, sunnah: 0, nafl: 0 };
    default:
      return { fard: 0, sunnah: 0, nafl: 0 };
  }
}

/**
 * Get description for a prayer
 */
export function getPrayerDescription(key: PrayerKey): string {
  const descriptions: Record<PrayerKey, string> = {
    fajr: "Fajr is performed at dawn before sunrise. It includes 2 obligatory rakats and 2 Sunnah mu'akkadah rakats that set a spiritual tone for the day.",
    sunrise: "Sunrise marks the end of Fajr; no prayer is performed at this time.",
    dhuhr: "Dhuhr is the midday prayer after the sun passes its zenith. It consists of 4 obligatory rakats, 4 Sunnah before, 2 Sunnah after, and additional voluntary nawafil prayers.",
    asr: "Asr is the late afternoon prayer. It has 4 obligatory rakats and follows with voluntary nawafil prayers for extra blessings.",
    maghrib: "Maghrib is the sunset prayer performed just after sunset. It includes 3 obligatory rakats and voluntary nawafil prayers.",
    isha: "Isha is the night prayer after twilight disappears. It consists of 4 obligatory rakats, 2 Sunnah mu'akkadah rakats, and voluntary nawafil prayers.",
  };
  return descriptions[key];
}

/**
 * Format milliseconds as HH:MM:SS countdown string
 */
export function formatTimeDiff(ms: number): string {
  const h = Math.floor(ms / 3600000);
  const m = Math.floor((ms % 3600000) / 60000);
  const s = Math.floor((ms % 60000) / 1000);
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}

/**
 * Format a Date object as localized time string (e.g., "5:30 AM")
 */
export function formatPrayerTime(date: Date): string {
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

/**
 * Get formatted current date string
 */
export function getCurrentDateString(): string {
  return new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

/**
 * Islamic month names
 */
const ISLAMIC_MONTHS = [
  'Muharram',
  'Safar',
  'Rabi al-Awwal',
  'Rabi al-Thani',
  'Jumada al-Awwal',
  'Jumada al-Thani',
  'Rajab',
  'Sha\'ban',
  'Ramadan',
  'Shawwal',
  'Dhul Qi\'dah',
  'Dhul Hijjah',
];

/**
 * Convert Gregorian date to Islamic (Hijri) date
 * Uses the Umm al-Qura calendar approximation
 */
export function getIslamicDate(date: Date = new Date()): { day: number; month: number; year: number; monthName: string } {
  // Julian Day Number calculation
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();

  // Calculate Julian Day Number
  const a = Math.floor((14 - month) / 12);
  const y = year + 4800 - a;
  const m = month + 12 * a - 3;
  const jd = day + Math.floor((153 * m + 2) / 5) + 365 * y + Math.floor(y / 4) - Math.floor(y / 100) + Math.floor(y / 400) - 32045;

  // Convert Julian Day to Islamic date
  const l = jd - 1948440 + 10632;
  const n = Math.floor((l - 1) / 10631);
  const l2 = l - 10631 * n + 354;
  const j = Math.floor((10985 - l2) / 5316) * Math.floor((50 * l2) / 17719) + Math.floor(l2 / 5670) * Math.floor((43 * l2) / 15238);
  const l3 = l2 - Math.floor((30 - j) / 15) * Math.floor((17719 * j) / 50) - Math.floor(j / 16) * Math.floor((15238 * j) / 43) + 29;
  const islamicMonth = Math.floor((24 * l3) / 709);
  const islamicDay = l3 - Math.floor((709 * islamicMonth) / 24);
  const islamicYear = 30 * n + j - 30;

  return {
    day: islamicDay,
    month: islamicMonth,
    year: islamicYear,
    monthName: ISLAMIC_MONTHS[islamicMonth - 1] || '',
  };
}

/**
 * Get formatted Islamic date string
 */
export function getIslamicDateString(date: Date = new Date()): string {
  const islamic = getIslamicDate(date);
  return `${islamic.day} ${islamic.monthName} ${islamic.year} AH`;
}
