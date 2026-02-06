/**
 * @jest-environment node
 */

import {
  getPrayerName,
  getRakats,
  getRakatItems,
  getImmersiveColors,
  getPrayerDescription,
  formatTimeDiff,
  getIslamicDate,
  getIslamicDateString,
  PrayerKey,
} from '@/utils/prayer-ui';

describe('prayer-ui', () => {
  describe('getPrayerName', () => {
    it('should return correct name for each prayer', () => {
      expect(getPrayerName('fajr')).toBe('Fajr');
      expect(getPrayerName('sunrise')).toBe('Sunrise');
      expect(getPrayerName('dhuhr')).toBe('Dhuhr');
      expect(getPrayerName('asr')).toBe('Asr');
      expect(getPrayerName('maghrib')).toBe('Maghrib');
      expect(getPrayerName('isha')).toBe('Isha');
    });
  });

  describe('getRakats', () => {
    it('should return correct rakats for Fajr', () => {
      const rakats = getRakats('fajr');
      expect(rakats).toEqual({
        sunnahBefore: 2,
        fard: 2,
        sunnahAfter: 0,
        nafl: 0,
        witr: 0,
        naflAfter: 0,
      });
    });

    it('should return correct rakats for Dhuhr', () => {
      const rakats = getRakats('dhuhr');
      expect(rakats).toEqual({
        sunnahBefore: 4,
        fard: 4,
        sunnahAfter: 2,
        nafl: 2,
        witr: 0,
        naflAfter: 0,
      });
    });

    it('should return correct rakats for Asr', () => {
      const rakats = getRakats('asr');
      expect(rakats).toEqual({
        sunnahBefore: 4,
        fard: 4,
        sunnahAfter: 0,
        nafl: 0,
        witr: 0,
        naflAfter: 0,
      });
    });

    it('should return correct rakats for Maghrib', () => {
      const rakats = getRakats('maghrib');
      expect(rakats).toEqual({
        sunnahBefore: 0,
        fard: 3,
        sunnahAfter: 2,
        nafl: 2,
        witr: 0,
        naflAfter: 0,
      });
    });

    it('should return correct rakats for Isha', () => {
      const rakats = getRakats('isha');
      expect(rakats).toEqual({
        sunnahBefore: 4,
        fard: 4,
        sunnahAfter: 2,
        nafl: 2,
        witr: 3,
        naflAfter: 2,
      });
    });

    it('should return zero rakats for Sunrise', () => {
      const rakats = getRakats('sunrise');
      expect(rakats).toEqual({
        sunnahBefore: 0,
        fard: 0,
        sunnahAfter: 0,
        nafl: 0,
        witr: 0,
        naflAfter: 0,
      });
    });

    it('should verify total rakats per prayer', () => {
      // Fajr: 2 + 2 = 4
      const fajr = getRakats('fajr');
      expect(fajr.sunnahBefore + fajr.fard).toBe(4);

      // Dhuhr: 4 + 4 + 2 + 2 = 12
      const dhuhr = getRakats('dhuhr');
      expect(dhuhr.sunnahBefore + dhuhr.fard + dhuhr.sunnahAfter + dhuhr.nafl).toBe(12);

      // Asr: 4 + 4 = 8
      const asr = getRakats('asr');
      expect(asr.sunnahBefore + asr.fard).toBe(8);

      // Maghrib: 3 + 2 + 2 = 7
      const maghrib = getRakats('maghrib');
      expect(maghrib.fard + maghrib.sunnahAfter + maghrib.nafl).toBe(7);

      // Isha: 4 + 4 + 2 + 2 + 3 + 2 = 17
      const isha = getRakats('isha');
      expect(
        isha.sunnahBefore + isha.fard + isha.sunnahAfter +
        isha.nafl + isha.witr + isha.naflAfter
      ).toBe(17);
    });
  });

  describe('getRakatItems', () => {
    it('should return ordered items for Fajr', () => {
      const items = getRakatItems('fajr');
      expect(items).toEqual([
        { label: 'Sunnat', count: 2, type: 'sunnah' },
        { label: 'Farz', count: 2, type: 'fard' },
      ]);
    });

    it('should return ordered items for Isha including Witr', () => {
      const items = getRakatItems('isha');
      expect(items).toEqual([
        { label: 'Sunnat', count: 4, type: 'sunnah' },
        { label: 'Farz', count: 4, type: 'fard' },
        { label: 'Sunnat', count: 2, type: 'sunnah' },
        { label: 'Nafl', count: 2, type: 'nafl' },
        { label: 'Witr', count: 3, type: 'witr' },
        { label: 'Nafl', count: 2, type: 'nafl' },
      ]);
    });

    it('should return empty array for Sunrise', () => {
      const items = getRakatItems('sunrise');
      expect(items).toEqual([]);
    });

    it('should only include items with count > 0', () => {
      const items = getRakatItems('maghrib');
      // Maghrib has no sunnahBefore, so first item should be Farz
      expect(items[0].label).toBe('Farz');
      expect(items.every(item => item.count > 0)).toBe(true);
    });
  });

  describe('getImmersiveColors', () => {
    const prayers: PrayerKey[] = ['fajr', 'sunrise', 'dhuhr', 'asr', 'maghrib', 'isha'];

    it.each(prayers)('should return valid colors for %s', (prayer) => {
      const colors = getImmersiveColors(prayer);

      expect(colors).toHaveProperty('primary');
      expect(colors).toHaveProperty('secondary');
      expect(colors).toHaveProperty('expanding');
      expect(colors.expanding).toHaveProperty('light');
      expect(colors.expanding).toHaveProperty('dark');

      // Verify colors are valid hex codes
      expect(colors.primary).toMatch(/^#[0-9A-Fa-f]{6}$/);
      expect(colors.secondary).toMatch(/^#[0-9A-Fa-f]{6}$/);

      // Verify expanding arrays have 3 colors each
      expect(colors.expanding.light).toHaveLength(3);
      expect(colors.expanding.dark).toHaveLength(3);
    });

    it('should return unique color schemes for different prayers', () => {
      const fajrColors = getImmersiveColors('fajr');
      const ishaColors = getImmersiveColors('isha');
      const maghribColors = getImmersiveColors('maghrib');

      expect(fajrColors.primary).not.toBe(ishaColors.primary);
      expect(ishaColors.primary).not.toBe(maghribColors.primary);
    });

    it('should return default colors for unknown prayer', () => {
      const colors = getImmersiveColors('unknown' as PrayerKey);
      expect(colors.primary).toBe('#90A4AE');
      expect(colors.secondary).toBe('#455A64');
    });
  });

  describe('getPrayerDescription', () => {
    it('should return non-empty description for each prayer', () => {
      const prayers: PrayerKey[] = ['fajr', 'sunrise', 'dhuhr', 'asr', 'maghrib', 'isha'];

      prayers.forEach(prayer => {
        const description = getPrayerDescription(prayer);
        expect(description).toBeTruthy();
        expect(description.length).toBeGreaterThan(20);
      });
    });

    it('should mention obligatory rakats in descriptions', () => {
      expect(getPrayerDescription('fajr')).toContain('2');
      expect(getPrayerDescription('dhuhr')).toContain('4');
      expect(getPrayerDescription('maghrib')).toContain('3');
    });
  });

  describe('formatTimeDiff', () => {
    it('should format zero milliseconds', () => {
      expect(formatTimeDiff(0)).toBe('00:00:00');
    });

    it('should format seconds correctly', () => {
      expect(formatTimeDiff(1000)).toBe('00:00:01');
      expect(formatTimeDiff(30000)).toBe('00:00:30');
      expect(formatTimeDiff(59000)).toBe('00:00:59');
    });

    it('should format minutes correctly', () => {
      expect(formatTimeDiff(60000)).toBe('00:01:00');
      expect(formatTimeDiff(300000)).toBe('00:05:00');
      expect(formatTimeDiff(3540000)).toBe('00:59:00');
    });

    it('should format hours correctly', () => {
      expect(formatTimeDiff(3600000)).toBe('01:00:00');
      expect(formatTimeDiff(7200000)).toBe('02:00:00');
    });

    it('should format combined time correctly', () => {
      // 1 hour, 30 minutes, 45 seconds
      const ms = 3600000 + 1800000 + 45000;
      expect(formatTimeDiff(ms)).toBe('01:30:45');
    });

    it('should pad single digits with zeros', () => {
      expect(formatTimeDiff(3661000)).toBe('01:01:01');
    });

    it('should handle large values', () => {
      // 23 hours, 59 minutes, 59 seconds
      const ms = 23 * 3600000 + 59 * 60000 + 59 * 1000;
      expect(formatTimeDiff(ms)).toBe('23:59:59');
    });
  });

  describe('getIslamicDate', () => {
    it('should return object with required properties', () => {
      const date = new Date('2024-01-15');
      const islamic = getIslamicDate(date);

      expect(islamic).toHaveProperty('day');
      expect(islamic).toHaveProperty('month');
      expect(islamic).toHaveProperty('year');
      expect(islamic).toHaveProperty('monthName');
    });

    it('should return valid day (1-30)', () => {
      const islamic = getIslamicDate(new Date());
      expect(islamic.day).toBeGreaterThanOrEqual(1);
      expect(islamic.day).toBeLessThanOrEqual(30);
    });

    it('should return valid month (1-12)', () => {
      const islamic = getIslamicDate(new Date());
      expect(islamic.month).toBeGreaterThanOrEqual(1);
      expect(islamic.month).toBeLessThanOrEqual(12);
    });

    it('should return valid Hijri year', () => {
      const islamic = getIslamicDate(new Date('2024-01-15'));
      // Around 2024, Hijri year should be around 1445-1446
      expect(islamic.year).toBeGreaterThanOrEqual(1440);
      expect(islamic.year).toBeLessThanOrEqual(1450);
    });

    it('should return valid month name', () => {
      const validMonths = [
        'Muharram', 'Safar', 'Rabi al-Awwal', 'Rabi al-Thani',
        'Jumada al-Awwal', 'Jumada al-Thani', 'Rajab', "Sha'ban",
        'Ramadan', 'Shawwal', "Dhul Qi'dah", 'Dhul Hijjah',
      ];
      const islamic = getIslamicDate(new Date());
      expect(validMonths).toContain(islamic.monthName);
    });

    it('should use current date when no argument provided', () => {
      const islamic1 = getIslamicDate();
      const islamic2 = getIslamicDate(new Date());

      expect(islamic1.day).toBe(islamic2.day);
      expect(islamic1.month).toBe(islamic2.month);
      expect(islamic1.year).toBe(islamic2.year);
    });

    it('should convert known date correctly', () => {
      // January 1, 2024 should be approximately 19 Jumada al-Thani 1445
      const islamic = getIslamicDate(new Date('2024-01-01'));
      expect(islamic.year).toBe(1445);
      // Allow some variance due to calculation method differences
      expect(islamic.month).toBeGreaterThanOrEqual(5);
      expect(islamic.month).toBeLessThanOrEqual(7);
    });
  });

  describe('getIslamicDateString', () => {
    it('should return formatted string with day, month name, and year', () => {
      const dateString = getIslamicDateString(new Date('2024-01-15'));

      // Should match pattern like "5 Rajab 1445 AH"
      expect(dateString).toMatch(/^\d{1,2} [A-Za-z\-']+ \d{4} AH$/);
    });

    it('should include AH suffix', () => {
      const dateString = getIslamicDateString(new Date());
      expect(dateString).toContain('AH');
    });

    it('should include month name', () => {
      const islamic = getIslamicDate(new Date());
      const dateString = getIslamicDateString(new Date());

      expect(dateString).toContain(islamic.monthName);
    });
  });
});
