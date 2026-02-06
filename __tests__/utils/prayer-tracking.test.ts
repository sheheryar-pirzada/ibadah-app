/**
 * @jest-environment node
 */

// Simplified unit tests for PrayerTracker that don't require React Native runtime

// Mock AsyncStorage before importing
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(() => Promise.resolve(null)),
  setItem: jest.fn(() => Promise.resolve()),
  removeItem: jest.fn(() => Promise.resolve()),
  multiRemove: jest.fn(() => Promise.resolve()),
  clear: jest.fn(() => Promise.resolve()),
}));

import { PrayerTracker, PrayerKey } from '@/utils/prayer-tracking';
import AsyncStorage from '@react-native-async-storage/async-storage';

describe('PrayerTracker', () => {
  let tracker: PrayerTracker;

  beforeEach(async () => {
    jest.clearAllMocks();
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);
    tracker = PrayerTracker.getInstance();
    await tracker.clearAllData();
    await tracker.initialize();
  });

  describe('getInstance', () => {
    it('should return a singleton instance', () => {
      const instance1 = PrayerTracker.getInstance();
      const instance2 = PrayerTracker.getInstance();
      expect(instance1).toBe(instance2);
    });
  });

  describe('markPrayerCompleted', () => {
    it('should mark a prayer as completed', async () => {
      const date = '2024-01-15';
      const prayer: PrayerKey = 'fajr';

      await tracker.markPrayerCompleted(prayer, date);

      const records = tracker.getRecordsForDate(date);
      const fajrRecord = records.find(r => r.prayer === 'fajr');

      expect(fajrRecord).toBeDefined();
      expect(fajrRecord?.completed).toBe(true);
      expect(fajrRecord?.completedAt).toBeDefined();
    });

    it('should create a record if it does not exist', async () => {
      const date = '2024-01-15';
      const prayer: PrayerKey = 'dhuhr';

      let records = tracker.getRecordsForDate(date);
      expect(records.length).toBe(0);

      await tracker.markPrayerCompleted(prayer, date);

      records = tracker.getRecordsForDate(date);
      expect(records.length).toBe(1);
      expect(records[0].prayer).toBe('dhuhr');
      expect(records[0].completed).toBe(true);
    });
  });

  describe('markPrayerIncomplete', () => {
    it('should mark a prayer as incomplete', async () => {
      const date = '2024-01-15';
      const prayer: PrayerKey = 'asr';

      await tracker.markPrayerCompleted(prayer, date);
      let records = tracker.getRecordsForDate(date);
      expect(records[0].completed).toBe(true);

      await tracker.markPrayerIncomplete(prayer, date);
      records = tracker.getRecordsForDate(date);
      expect(records[0].completed).toBe(false);
      expect(records[0].completedAt).toBeUndefined();
    });
  });

  describe('getDailyStats', () => {
    it('should return correct daily statistics', async () => {
      const date = '2024-01-15';

      await tracker.markPrayerCompleted('fajr', date);
      await tracker.markPrayerCompleted('dhuhr', date);
      await tracker.markPrayerCompleted('asr', date);

      const stats = tracker.getDailyStats(date);

      expect(stats.date).toBe(date);
      expect(stats.completedCount).toBe(3);
      expect(stats.totalCount).toBe(5);
      expect(stats.completionRate).toBe(60);
      expect(stats.prayers.fajr).toBe(true);
      expect(stats.prayers.dhuhr).toBe(true);
      expect(stats.prayers.asr).toBe(true);
      expect(stats.prayers.maghrib).toBe(false);
      expect(stats.prayers.isha).toBe(false);
    });

    it('should return zero completion for dates with no records', () => {
      const stats = tracker.getDailyStats('2024-01-20');

      expect(stats.completedCount).toBe(0);
      expect(stats.totalCount).toBe(5);
      expect(stats.completionRate).toBe(0);
    });
  });

  describe('getRecordsForDateRange', () => {
    it('should return records within the date range', async () => {
      await tracker.markPrayerCompleted('fajr', '2024-01-10');
      await tracker.markPrayerCompleted('dhuhr', '2024-01-15');
      await tracker.markPrayerCompleted('asr', '2024-01-20');

      const records = tracker.getRecordsForDateRange('2024-01-10', '2024-01-15');

      expect(records.length).toBe(2);
      expect(records.some(r => r.date === '2024-01-10')).toBe(true);
      expect(records.some(r => r.date === '2024-01-15')).toBe(true);
      expect(records.some(r => r.date === '2024-01-20')).toBe(false);
    });
  });

  describe('getWeeklyStats', () => {
    it('should return correct weekly statistics', async () => {
      const weekStart = '2024-01-15';

      // Complete all prayers on first day
      await tracker.markPrayerCompleted('fajr', '2024-01-15');
      await tracker.markPrayerCompleted('dhuhr', '2024-01-15');
      await tracker.markPrayerCompleted('asr', '2024-01-15');
      await tracker.markPrayerCompleted('maghrib', '2024-01-15');
      await tracker.markPrayerCompleted('isha', '2024-01-15');

      // Complete some prayers on second day
      await tracker.markPrayerCompleted('fajr', '2024-01-16');
      await tracker.markPrayerCompleted('dhuhr', '2024-01-16');

      const stats = tracker.getWeeklyStats(weekStart);

      expect(stats.weekStart).toBe('2024-01-15');
      expect(stats.weekEnd).toBe('2024-01-21');
      expect(stats.totalPrayers).toBe(35);
      expect(stats.completedPrayers).toBe(7);
      expect(stats.dailyStats.length).toBe(7);
    });
  });

  describe('getMonthlyStats', () => {
    it('should return correct monthly statistics', async () => {
      const month = '2024-01';

      await tracker.markPrayerCompleted('fajr', '2024-01-01');
      await tracker.markPrayerCompleted('dhuhr', '2024-01-01');
      await tracker.markPrayerCompleted('asr', '2024-01-15');

      const stats = tracker.getMonthlyStats(month);

      expect(stats.month).toBe(month);
      expect(stats.totalPrayers).toBe(3);
      expect(stats.completedPrayers).toBe(3);
      expect(stats.completionRate).toBe(100);
    });

    it('should handle empty month data', () => {
      const stats = tracker.getMonthlyStats('2023-12');

      expect(stats.totalPrayers).toBe(0);
      expect(stats.completedPrayers).toBe(0);
      expect(stats.completionRate).toBe(0);
    });
  });

  describe('clearAllData', () => {
    it('should clear all records and stats', async () => {
      await tracker.markPrayerCompleted('fajr', '2024-01-15');

      let records = tracker.getRecordsForDate('2024-01-15');
      expect(records.length).toBe(1);

      await tracker.clearAllData();

      records = tracker.getRecordsForDate('2024-01-15');
      expect(records.length).toBe(0);
      expect(tracker.getStats()).toBeNull();
    });
  });
});
