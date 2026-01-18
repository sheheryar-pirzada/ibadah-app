import AsyncStorage from '@react-native-async-storage/async-storage';

export type PrayerKey = 'fajr' | 'dhuhr' | 'asr' | 'maghrib' | 'isha';

export interface PrayerRecord {
  id: string;
  prayer: PrayerKey;
  completed: boolean;
  completedAt?: Date;
  scheduledTime: Date;
  date: string; // YYYY-MM-DD format
  timestamp: number;
}

export interface PrayerStats {
  totalPrayers: number;
  completedPrayers: number;
  completionRate: number;
  currentStreak: number;
  longestStreak: number;
  lastCompletedDate?: string;
}

export interface DailyStats {
  date: string;
  prayers: Record<PrayerKey, boolean>;
  completedCount: number;
  totalCount: number;
  completionRate: number;
}

export interface WeeklyStats {
  weekStart: string;
  weekEnd: string;
  totalPrayers: number;
  completedPrayers: number;
  completionRate: number;
  dailyStats: DailyStats[];
}

export interface MonthlyStats {
  month: string; // YYYY-MM format
  totalPrayers: number;
  completedPrayers: number;
  completionRate: number;
  averageDailyCompletion: number;
  bestDay: string;
  worstDay: string;
}

// Storage keys
const STORAGE_KEYS = {
  PRAYER_RECORDS: 'prayer_records',
  PRAYER_STATS: 'prayer_stats',
  USER_PREFERENCES: 'prayer_tracking_preferences',
};

// Prayer tracking class
export class PrayerTracker {
  private static instance: PrayerTracker;
  private records: PrayerRecord[] = [];
  private stats: PrayerStats | null = null;

  static getInstance(): PrayerTracker {
    if (!PrayerTracker.instance) {
      PrayerTracker.instance = new PrayerTracker();
    }
    return PrayerTracker.instance;
  }

  // Initialize and load data
  async initialize(): Promise<void> {
    await this.loadRecords();
    await this.loadStats();
  }

  // Load prayer records from storage
  private async loadRecords(): Promise<void> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.PRAYER_RECORDS);
      if (data) {
        this.records = JSON.parse(data).map((record: any) => ({
          ...record,
          scheduledTime: new Date(record.scheduledTime),
          completedAt: record.completedAt ? new Date(record.completedAt) : undefined,
        }));
      }
    } catch (error) {
      console.error('Error loading prayer records:', error);
      this.records = [];
    }
  }

  // Load stats from storage
  private async loadStats(): Promise<void> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.PRAYER_STATS);
      if (data) {
        this.stats = JSON.parse(data);
      }
    } catch (error) {
      console.error('Error loading prayer stats:', error);
      this.stats = null;
    }
  }

  // Save records to storage
  private async saveRecords(): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.PRAYER_RECORDS, JSON.stringify(this.records));
    } catch (error) {
      console.error('Error saving prayer records:', error);
    }
  }

  // Save stats to storage
  private async saveStats(): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.PRAYER_STATS, JSON.stringify(this.stats));
    } catch (error) {
      console.error('Error saving prayer stats:', error);
    }
  }

  // Create prayer records for a date
  async createPrayerRecords(date: Date, prayerTimes: Record<PrayerKey, Date>): Promise<void> {
    const dateStr = this.formatDate(date);
    
    // Remove existing records for this date
    this.records = this.records.filter(record => record.date !== dateStr);
    
    // Create new records
    const newRecords: PrayerRecord[] = Object.entries(prayerTimes).map(([prayer, time]) => ({
      id: `${dateStr}_${prayer}`,
      prayer: prayer as PrayerKey,
      completed: false,
      scheduledTime: time,
      date: dateStr,
      timestamp: Date.now(),
    }));
    
    this.records.push(...newRecords);
    await this.saveRecords();
    await this.updateStats();
  }

  // Mark prayer as completed
  async markPrayerCompleted(prayer: PrayerKey, date: string): Promise<void> {
    const record = this.records.find(r => r.prayer === prayer && r.date === date);
    if (record) {
      record.completed = true;
      record.completedAt = new Date();
      await this.saveRecords();
      await this.updateStats();
    }
  }

  // Mark prayer as incomplete
  async markPrayerIncomplete(prayer: PrayerKey, date: string): Promise<void> {
    const record = this.records.find(r => r.prayer === prayer && r.date === date);
    if (record) {
      record.completed = false;
      record.completedAt = undefined;
      await this.saveRecords();
      await this.updateStats();
    }
  }

  // Get records for a specific date
  getRecordsForDate(date: string): PrayerRecord[] {
    return this.records.filter(record => record.date === date);
  }

  // Get records for a date range
  getRecordsForDateRange(startDate: string, endDate: string): PrayerRecord[] {
    return this.records.filter(record => 
      record.date >= startDate && record.date <= endDate
    );
  }

  // Get daily stats
  getDailyStats(date: string): DailyStats {
    const records = this.getRecordsForDate(date);
    const prayers: Record<PrayerKey, boolean> = {
      fajr: false,
      dhuhr: false,
      asr: false,
      maghrib: false,
      isha: false,
    };
    
    let completedCount = 0;
    
    records.forEach(record => {
      prayers[record.prayer] = record.completed;
      if (record.completed) completedCount++;
    });
    
    return {
      date,
      prayers,
      completedCount,
      totalCount: 5,
      completionRate: (completedCount / 5) * 100,
    };
  }

  // Get weekly stats
  getWeeklyStats(weekStart: string): WeeklyStats {
    const weekEnd = this.addDays(weekStart, 6);

    const dailyStats: DailyStats[] = [];
    let totalPrayers = 0;
    let completedPrayers = 0;

    for (let i = 0; i < 7; i++) {
      const date = this.addDays(weekStart, i);
      const dayStats = this.getDailyStats(date);
      dailyStats.push(dayStats);
      totalPrayers += dayStats.totalCount;
      completedPrayers += dayStats.completedCount;
    }

    return {
      weekStart,
      weekEnd,
      totalPrayers,
      completedPrayers,
      completionRate: totalPrayers > 0 ? (completedPrayers / totalPrayers) * 100 : 0,
      dailyStats,
    };
  }

  // Get monthly stats
  getMonthlyStats(month: string): MonthlyStats {
    const records = this.records.filter(record => record.date.startsWith(month));

    const dailyCompletions: Record<string, number> = {};
    let totalPrayers = 0;
    let completedPrayers = 0;

    records.forEach(record => {
      if (!dailyCompletions[record.date]) {
        dailyCompletions[record.date] = 0;
      }
      totalPrayers++;
      if (record.completed) {
        completedPrayers++;
        dailyCompletions[record.date]++;
      }
    });

    const completionRates = Object.entries(dailyCompletions).map(([date, completed]) => ({
      date,
      rate: (completed / 5) * 100,
    }));

    // Handle empty data gracefully
    const defaultDate = `${month}-01`;
    const bestDay = completionRates.length > 0
      ? completionRates.reduce((best, current) => current.rate > best.rate ? current : best).date
      : defaultDate;

    const worstDay = completionRates.length > 0
      ? completionRates.reduce((worst, current) => current.rate < worst.rate ? current : worst).date
      : defaultDate;

    const daysCount = Object.keys(dailyCompletions).length;
    const totalCompleted = Object.values(dailyCompletions).reduce((sum, count) => sum + count, 0);
    const averageDailyCompletion = daysCount > 0 ? totalCompleted / daysCount : 0;

    return {
      month,
      totalPrayers,
      completedPrayers,
      completionRate: totalPrayers > 0 ? (completedPrayers / totalPrayers) * 100 : 0,
      averageDailyCompletion,
      bestDay,
      worstDay,
    };
  }

  // Update overall stats
  private async updateStats(): Promise<void> {
    const today = new Date();
    const todayStr = this.formatDate(today);

    // Calculate current streak (starting from today, going backwards through consecutive days)
    let currentStreak = 0;
    let checkDate = todayStr;

    while (true) {
      const dayStats = this.getDailyStats(checkDate);
      if (dayStats.completedCount === 5) {
        currentStreak++;
        checkDate = this.subtractDays(checkDate, 1);
      } else {
        break;
      }
    }

    // Calculate longest streak by finding all consecutive sequences
    let longestStreak = 0;
    const dates = [...new Set(this.records.map(r => r.date))].sort(); // Ascending order

    if (dates.length > 0) {
      let tempStreak = 0;
      let prevDate: string | null = null;

      for (const date of dates) {
        const dayStats = this.getDailyStats(date);

        if (dayStats.completedCount === 5) {
          // Check if this is consecutive with previous date
          if (prevDate === null || this.isNextDay(prevDate, date)) {
            tempStreak++;
          } else {
            // Gap in dates, reset streak
            tempStreak = 1;
          }
          longestStreak = Math.max(longestStreak, tempStreak);
          prevDate = date;
        } else {
          // Day not complete, reset streak
          tempStreak = 0;
          prevDate = null;
        }
      }
    }

    // Find last completed date (most recent day with at least one prayer completed)
    let lastCompletedDate: string | undefined;
    const sortedDatesDesc = [...new Set(this.records.map(r => r.date))].sort().reverse();
    for (const date of sortedDatesDesc) {
      const dayStats = this.getDailyStats(date);
      if (dayStats.completedCount > 0) {
        lastCompletedDate = date;
        break;
      }
    }

    const totalPrayers = this.records.length;
    const completedPrayers = this.records.filter(r => r.completed).length;

    this.stats = {
      totalPrayers,
      completedPrayers,
      completionRate: totalPrayers > 0 ? (completedPrayers / totalPrayers) * 100 : 0,
      currentStreak,
      longestStreak: Math.max(longestStreak, currentStreak), // Ensure current streak is considered
      lastCompletedDate,
    };

    await this.saveStats();
  }

  // Check if date2 is exactly one day after date1
  private isNextDay(date1: string, date2: string): boolean {
    const nextDay = this.addDays(date1, 1);
    return nextDay === date2;
  }

  // Subtract days from a date string
  private subtractDays(dateStr: string, days: number): string {
    return this.addDays(dateStr, -days);
  }

  // Get overall stats
  getStats(): PrayerStats | null {
    return this.stats;
  }

  // Helper methods
  private formatDate(date: Date): string {
    // Use local timezone formatting to avoid UTC conversion issues
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  // Parse date string as local timezone (not UTC)
  private parseLocalDate(dateStr: string): Date {
    const [year, month, day] = dateStr.split('-').map(Number);
    return new Date(year, month - 1, day);
  }

  private addDays(dateStr: string, days: number): string {
    const date = this.parseLocalDate(dateStr);
    date.setDate(date.getDate() + days);
    return this.formatDate(date);
  }

  // Clear all data (for testing/reset)
  async clearAllData(): Promise<void> {
    this.records = [];
    this.stats = null;
    await AsyncStorage.multiRemove([
      STORAGE_KEYS.PRAYER_RECORDS,
      STORAGE_KEYS.PRAYER_STATS,
    ]);
  }
}

// Export singleton instance
export const prayerTracker = PrayerTracker.getInstance(); 