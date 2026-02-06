import AsyncStorage from '@react-native-async-storage/async-storage';
import type { CalculationMethodKey, MadhabKey } from './prayer-settings';
import { getPrayerSettings } from './prayer-settings';

const BASE_URL = 'https://api.aladhan.com/v1';
const CACHE_KEY = 'ramadan_calendar_cache';

// Map app's CalculationMethodKey to AlAdhan API method numbers
const METHOD_MAP: Partial<Record<CalculationMethodKey, number>> = {
  Karachi: 1,
  NorthAmerica: 2,
  MuslimWorldLeague: 3,
  UmmAlQura: 4,
  Egyptian: 5,
  Tehran: 7,
  Dubai: 8,
  Kuwait: 9,
  Qatar: 10,
  Singapore: 11,
  Turkey: 13,
  MoonsightingCommittee: 15,
};

// Map app's MadhabKey to AlAdhan API school numbers
const SCHOOL_MAP: Record<MadhabKey, number> = {
  Shafi: 0,
  Hanafi: 1,
};

export interface RamadanDay {
  hijriDay: number;
  gregorianDate: string;
  gregorianDay: number;
  gregorianMonth: number;
  gregorianYear: number;
  weekday: string;
  sehriEnd: string;
  iftarTime: string;
}

export interface RamadanCalendarData {
  days: RamadanDay[];
  hijriYear: number;
  fetchedAt: number;
  latitude: number;
  longitude: number;
}

/**
 * Convert today's date to Hijri using AlAdhan API
 */
async function getCurrentHijriDate(): Promise<{ day: number; month: number; year: number }> {
  const now = new Date();
  const dd = String(now.getDate()).padStart(2, '0');
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const yyyy = now.getFullYear();

  const response = await fetch(`${BASE_URL}/gToH/${dd}-${mm}-${yyyy}`);
  const json = await response.json();

  if (json.code !== 200 || !json.data) {
    throw new Error('Failed to convert Gregorian to Hijri date');
  }

  return {
    day: parseInt(json.data.hijri.day, 10),
    month: parseInt(json.data.hijri.month.number, 10),
    year: parseInt(json.data.hijri.year, 10),
  };
}

/**
 * Determine the Hijri year for the upcoming or current Ramadan
 */
async function getRamadanHijriYear(): Promise<number> {
  const hijri = await getCurrentHijriDate();
  // If we're past Ramadan (month > 9), next Ramadan is next Hijri year
  if (hijri.month > 9) {
    return hijri.year + 1;
  }
  return hijri.year;
}

/**
 * Strip timezone label from AlAdhan time strings (e.g., "05:12 (EST)" → "05:12")
 */
function stripTimezone(timeStr: string): string {
  return timeStr.replace(/\s*\(.*\)/, '').trim();
}

/**
 * Get the weekday name from a Gregorian date string "dd-mm-yyyy"
 */
function getWeekday(dateStr: string): string {
  const [dd, mm, yyyy] = dateStr.split('-').map(Number);
  const date = new Date(yyyy, mm - 1, dd);
  return date.toLocaleDateString('en-US', { weekday: 'short' });
}

/**
 * Fetch the full Ramadan calendar from AlAdhan API
 */
export async function fetchRamadanCalendar(
  latitude: number,
  longitude: number,
): Promise<RamadanCalendarData> {
  // Check cache first
  const cached = await getCachedCalendar();
  if (cached && isCacheValid(cached, latitude, longitude)) {
    return cached;
  }

  const settings = await getPrayerSettings();
  const method = METHOD_MAP[settings.calculationMethod] ?? 3; // Default to MWL
  const school = SCHOOL_MAP[settings.madhab] ?? 0;
  const hijriYear = await getRamadanHijriYear();

  const url = `${BASE_URL}/hijriCalendar/${hijriYear}/9?latitude=${latitude}&longitude=${longitude}&method=${method}&school=${school}`;
  const response = await fetch(url);
  const json = await response.json();

  if (json.code !== 200 || !json.data || !Array.isArray(json.data)) {
    throw new Error('Failed to fetch Ramadan calendar');
  }

  const days: RamadanDay[] = json.data.map((day: any) => ({
    hijriDay: parseInt(day.date.hijri.day, 10),
    gregorianDate: day.date.readable,
    gregorianDay: parseInt(day.date.gregorian.day, 10),
    gregorianMonth: parseInt(day.date.gregorian.month.number, 10),
    gregorianYear: parseInt(day.date.gregorian.year, 10),
    weekday: getWeekday(day.date.gregorian.date),
    sehriEnd: stripTimezone(day.timings.Fajr),
    iftarTime: stripTimezone(day.timings.Maghrib),
  }));

  const calendarData: RamadanCalendarData = {
    days,
    hijriYear,
    fetchedAt: Date.now(),
    latitude,
    longitude,
  };

  // Cache the result
  await cacheCalendar(calendarData);

  return calendarData;
}

/**
 * Check if cached data is still valid (same day, same approximate location)
 */
function isCacheValid(
  cached: RamadanCalendarData,
  lat: number,
  lng: number,
): boolean {
  const ONE_DAY = 24 * 60 * 60 * 1000;
  const isRecent = Date.now() - cached.fetchedAt < ONE_DAY;
  // Allow ~10km location drift before refetching
  const isNearby =
    Math.abs(cached.latitude - lat) < 0.1 &&
    Math.abs(cached.longitude - lng) < 0.1;

  return isRecent && isNearby;
}

async function getCachedCalendar(): Promise<RamadanCalendarData | null> {
  try {
    const data = await AsyncStorage.getItem(CACHE_KEY);
    if (data) {
      return JSON.parse(data) as RamadanCalendarData;
    }
  } catch {
    // Ignore cache read errors
  }
  return null;
}

async function cacheCalendar(data: RamadanCalendarData): Promise<void> {
  try {
    await AsyncStorage.setItem(CACHE_KEY, JSON.stringify(data));
  } catch {
    // Ignore cache write errors
  }
}

/**
 * Get Ramadan status relative to today
 */
export function getRamadanStatus(data: RamadanCalendarData): {
  status: 'upcoming' | 'ongoing' | 'passed';
  currentDay?: number;
  daysUntil?: number;
  daysRemaining?: number;
  totalDays: number;
} {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const firstDay = new Date(
    data.days[0].gregorianYear,
    data.days[0].gregorianMonth - 1,
    data.days[0].gregorianDay,
  );
  firstDay.setHours(0, 0, 0, 0);

  const lastDay = new Date(
    data.days[data.days.length - 1].gregorianYear,
    data.days[data.days.length - 1].gregorianMonth - 1,
    data.days[data.days.length - 1].gregorianDay,
  );
  lastDay.setHours(0, 0, 0, 0);

  const totalDays = data.days.length;

  if (today < firstDay) {
    const diffMs = firstDay.getTime() - today.getTime();
    const daysUntil = Math.ceil(diffMs / (24 * 60 * 60 * 1000));
    return { status: 'upcoming', daysUntil, totalDays };
  }

  if (today > lastDay) {
    return { status: 'passed', totalDays };
  }

  // Ongoing - find current day
  const diffMs = today.getTime() - firstDay.getTime();
  const currentDay = Math.floor(diffMs / (24 * 60 * 60 * 1000)) + 1;
  const daysRemaining = totalDays - currentDay;
  return { status: 'ongoing', currentDay, daysRemaining, totalDays };
}

/**
 * Get today's Ramadan entry if we're in Ramadan
 */
export function getTodayRamadanEntry(data: RamadanCalendarData): RamadanDay | null {
  const today = new Date();
  const day = today.getDate();
  const month = today.getMonth() + 1;
  const year = today.getFullYear();

  return data.days.find(
    (d) => d.gregorianDay === day && d.gregorianMonth === month && d.gregorianYear === year,
  ) ?? null;
}
