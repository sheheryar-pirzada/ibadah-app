import AsyncStorage from '@react-native-async-storage/async-storage';
import { getTotalLessons } from './arabic-lessons-data';
import { getTotalLetters } from './arabic-alphabet-data';

const STORAGE_KEYS = {
  LETTER_PROGRESS: 'arabic_letter_progress',
  LESSON_PROGRESS: 'arabic_lesson_progress',
  LEARNING_STATS: 'arabic_learning_stats',
  LAST_ACTIVITY: 'arabic_last_activity',
};

export type LessonStatus = 'locked' | 'available' | 'in_progress' | 'completed';

export interface LetterProgress {
  letterId: string;
  learned: boolean;
  learnedAt?: string;
  practiceCount: number;
}

export interface LessonProgress {
  lessonId: string;
  status: LessonStatus;
  startedAt?: string;
  completedAt?: string;
  lastAccessedAt?: string;
  score?: number;
  contentProgress: number; // 0-100 percentage
}

export interface ArabicLearningStats {
  lettersLearned: number;
  lessonsCompleted: number;
  lessonsInProgress: number;
  currentStreak: number;
  longestStreak: number;
  totalTimeMinutes: number;
  lastActivityDate?: string;
}

class ArabicProgressManager {
  private static instance: ArabicProgressManager;
  private letterProgress: Map<string, LetterProgress> = new Map();
  private lessonProgress: Map<string, LessonProgress> = new Map();
  private stats: ArabicLearningStats = {
    lettersLearned: 0,
    lessonsCompleted: 0,
    lessonsInProgress: 0,
    currentStreak: 0,
    longestStreak: 0,
    totalTimeMinutes: 0,
  };
  private initialized = false;

  private constructor() {}

  static getInstance(): ArabicProgressManager {
    if (!ArabicProgressManager.instance) {
      ArabicProgressManager.instance = new ArabicProgressManager();
    }
    return ArabicProgressManager.instance;
  }

  async initialize(): Promise<void> {
    if (this.initialized) return;

    try {
      await Promise.all([
        this.loadLetterProgress(),
        this.loadLessonProgress(),
        this.loadStats(),
      ]);
      this.initialized = true;
    } catch (error) {
      console.error('Error initializing ArabicProgressManager:', error);
    }
  }

  private async loadLetterProgress(): Promise<void> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.LETTER_PROGRESS);
      if (data) {
        const parsed: LetterProgress[] = JSON.parse(data);
        parsed.forEach((progress) => {
          this.letterProgress.set(progress.letterId, progress);
        });
      }
    } catch (error) {
      console.error('Error loading letter progress:', error);
    }
  }

  private async loadLessonProgress(): Promise<void> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.LESSON_PROGRESS);
      if (data) {
        const parsed: LessonProgress[] = JSON.parse(data);
        parsed.forEach((progress) => {
          this.lessonProgress.set(progress.lessonId, progress);
        });
      }
    } catch (error) {
      console.error('Error loading lesson progress:', error);
    }
  }

  private async loadStats(): Promise<void> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.LEARNING_STATS);
      if (data) {
        this.stats = JSON.parse(data);
      }
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  }

  private async saveLetterProgress(): Promise<void> {
    try {
      const data = Array.from(this.letterProgress.values());
      await AsyncStorage.setItem(STORAGE_KEYS.LETTER_PROGRESS, JSON.stringify(data));
    } catch (error) {
      console.error('Error saving letter progress:', error);
    }
  }

  private async saveLessonProgress(): Promise<void> {
    try {
      const data = Array.from(this.lessonProgress.values());
      await AsyncStorage.setItem(STORAGE_KEYS.LESSON_PROGRESS, JSON.stringify(data));
    } catch (error) {
      console.error('Error saving lesson progress:', error);
    }
  }

  private async saveStats(): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.LEARNING_STATS, JSON.stringify(this.stats));
    } catch (error) {
      console.error('Error saving stats:', error);
    }
  }

  private getDateString(date: Date = new Date()): string {
    return date.toISOString().split('T')[0];
  }

  private async updateStreak(): Promise<void> {
    const today = this.getDateString();
    const lastActivity = this.stats.lastActivityDate;

    if (!lastActivity) {
      this.stats.currentStreak = 1;
    } else if (lastActivity === today) {
      // Same day, no change
    } else {
      const lastDate = new Date(lastActivity);
      const todayDate = new Date(today);
      const diffTime = todayDate.getTime() - lastDate.getTime();
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays === 1) {
        this.stats.currentStreak += 1;
      } else {
        this.stats.currentStreak = 1;
      }
    }

    if (this.stats.currentStreak > this.stats.longestStreak) {
      this.stats.longestStreak = this.stats.currentStreak;
    }

    this.stats.lastActivityDate = today;
    await this.saveStats();
  }

  // Letter Progress Methods
  async markLetterLearned(letterId: string): Promise<void> {
    await this.initialize();

    const existing = this.letterProgress.get(letterId);
    const now = new Date().toISOString();

    if (existing) {
      if (!existing.learned) {
        existing.learned = true;
        existing.learnedAt = now;
        this.stats.lettersLearned += 1;
      }
      existing.practiceCount += 1;
    } else {
      this.letterProgress.set(letterId, {
        letterId,
        learned: true,
        learnedAt: now,
        practiceCount: 1,
      });
      this.stats.lettersLearned += 1;
    }

    await this.updateStreak();
    await Promise.all([this.saveLetterProgress(), this.saveStats()]);
  }

  async markLetterUnlearned(letterId: string): Promise<void> {
    await this.initialize();

    const existing = this.letterProgress.get(letterId);
    if (existing && existing.learned) {
      existing.learned = false;
      existing.learnedAt = undefined;
      this.stats.lettersLearned = Math.max(0, this.stats.lettersLearned - 1);
      await Promise.all([this.saveLetterProgress(), this.saveStats()]);
    }
  }

  async incrementLetterPractice(letterId: string): Promise<void> {
    await this.initialize();

    const existing = this.letterProgress.get(letterId);
    if (existing) {
      existing.practiceCount += 1;
    } else {
      this.letterProgress.set(letterId, {
        letterId,
        learned: false,
        practiceCount: 1,
      });
    }

    await this.updateStreak();
    await this.saveLetterProgress();
  }

  getLetterProgress(letterId: string): LetterProgress | undefined {
    return this.letterProgress.get(letterId);
  }

  isLetterLearned(letterId: string): boolean {
    const progress = this.letterProgress.get(letterId);
    return progress?.learned ?? false;
  }

  getAllLetterProgress(): LetterProgress[] {
    return Array.from(this.letterProgress.values());
  }

  // Lesson Progress Methods
  async startLesson(lessonId: string): Promise<void> {
    await this.initialize();

    const now = new Date().toISOString();
    const existing = this.lessonProgress.get(lessonId);

    if (existing) {
      if (existing.status === 'available' || existing.status === 'locked') {
        existing.status = 'in_progress';
        existing.startedAt = now;
        this.stats.lessonsInProgress += 1;
      }
      existing.lastAccessedAt = now;
    } else {
      this.lessonProgress.set(lessonId, {
        lessonId,
        status: 'in_progress',
        startedAt: now,
        lastAccessedAt: now,
        contentProgress: 0,
      });
      this.stats.lessonsInProgress += 1;
    }

    await this.updateStreak();
    await Promise.all([this.saveLessonProgress(), this.saveStats()]);
  }

  async updateLessonProgress(lessonId: string, contentProgress: number): Promise<void> {
    await this.initialize();

    const now = new Date().toISOString();
    const existing = this.lessonProgress.get(lessonId);

    if (existing) {
      existing.contentProgress = Math.min(100, Math.max(0, contentProgress));
      existing.lastAccessedAt = now;
    } else {
      this.lessonProgress.set(lessonId, {
        lessonId,
        status: 'in_progress',
        startedAt: now,
        lastAccessedAt: now,
        contentProgress: Math.min(100, Math.max(0, contentProgress)),
      });
    }

    await this.saveLessonProgress();
  }

  async completeLesson(lessonId: string, score?: number): Promise<void> {
    await this.initialize();

    const now = new Date().toISOString();
    const existing = this.lessonProgress.get(lessonId);

    if (existing) {
      if (existing.status !== 'completed') {
        if (existing.status === 'in_progress') {
          this.stats.lessonsInProgress = Math.max(0, this.stats.lessonsInProgress - 1);
        }
        this.stats.lessonsCompleted += 1;
      }
      existing.status = 'completed';
      existing.completedAt = now;
      existing.lastAccessedAt = now;
      existing.contentProgress = 100;
      if (score !== undefined) {
        existing.score = score;
      }
    } else {
      this.lessonProgress.set(lessonId, {
        lessonId,
        status: 'completed',
        completedAt: now,
        lastAccessedAt: now,
        contentProgress: 100,
        score,
      });
      this.stats.lessonsCompleted += 1;
    }

    await this.updateStreak();
    await Promise.all([this.saveLessonProgress(), this.saveStats()]);
  }

  getLessonProgress(lessonId: string): LessonProgress | undefined {
    return this.lessonProgress.get(lessonId);
  }

  getLessonStatus(lessonId: string): LessonStatus {
    const progress = this.lessonProgress.get(lessonId);
    return progress?.status ?? 'available';
  }

  isLessonCompleted(lessonId: string): boolean {
    const progress = this.lessonProgress.get(lessonId);
    return progress?.status === 'completed';
  }

  getAllLessonProgress(): LessonProgress[] {
    return Array.from(this.lessonProgress.values());
  }

  // Stats Methods
  getStats(): ArabicLearningStats {
    return { ...this.stats };
  }

  async addStudyTime(minutes: number): Promise<void> {
    await this.initialize();
    this.stats.totalTimeMinutes += minutes;
    await this.saveStats();
  }

  getOverallProgress(): {
    lettersProgress: number;
    lessonsProgress: number;
    overallProgress: number;
  } {
    const totalLetters = getTotalLetters();
    const totalLessons = getTotalLessons();

    const lettersProgress = totalLetters > 0
      ? Math.round((this.stats.lettersLearned / totalLetters) * 100)
      : 0;

    const lessonsProgress = totalLessons > 0
      ? Math.round((this.stats.lessonsCompleted / totalLessons) * 100)
      : 0;

    const overallProgress = Math.round((lettersProgress + lessonsProgress) / 2);

    return {
      lettersProgress,
      lessonsProgress,
      overallProgress,
    };
  }

  // Reset Methods
  async resetAllProgress(): Promise<void> {
    this.letterProgress.clear();
    this.lessonProgress.clear();
    this.stats = {
      lettersLearned: 0,
      lessonsCompleted: 0,
      lessonsInProgress: 0,
      currentStreak: 0,
      longestStreak: 0,
      totalTimeMinutes: 0,
    };

    await Promise.all([
      AsyncStorage.removeItem(STORAGE_KEYS.LETTER_PROGRESS),
      AsyncStorage.removeItem(STORAGE_KEYS.LESSON_PROGRESS),
      AsyncStorage.removeItem(STORAGE_KEYS.LEARNING_STATS),
      AsyncStorage.removeItem(STORAGE_KEYS.LAST_ACTIVITY),
    ]);
  }
}

export const arabicProgress = ArabicProgressManager.getInstance();
