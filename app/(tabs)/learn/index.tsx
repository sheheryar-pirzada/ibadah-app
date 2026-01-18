import { ThemedBlurView } from '@/components/ThemedBlurView';
import { useTheme } from '@/contexts/ThemeContext';
import { useThemeColor } from '@/hooks/useThemeColor';
import { getTotalLetters } from '@/utils/arabic-alphabet-data';
import { allLessons, getCategories, LessonCategory } from '@/utils/arabic-lessons-data';
import { ArabicLearningStats, arabicProgress } from '@/utils/arabic-progress';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useFocusEffect } from 'expo-router';
import React, { useCallback, useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';

export default function LearnDashboard() {
  const { resolvedTheme } = useTheme();
  const [stats, setStats] = useState<ArabicLearningStats | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<LessonCategory | 'all'>('all');

  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const textMuted = useThemeColor({}, 'textMuted');
  const textSecondary = useThemeColor({}, 'textSecondary');
  const accentColor = useThemeColor({}, 'accent');
  const cardBorder = useThemeColor({}, 'cardBorder');

  const gradientColors = resolvedTheme === 'dark'
    ? (['rgba(0,0,0,0.3)', 'rgba(0,0,0,0.1)', 'rgba(0,0,0,0.4)'] as const)
    : (['rgba(255,255,255,0.1)', 'rgba(255,255,255,0.05)', 'rgba(255,255,255,0.15)'] as const);

  const loadProgress = useCallback(async () => {
    await arabicProgress.initialize();
    setStats(arabicProgress.getStats());
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadProgress();
    }, [loadProgress])
  );

  const categories = getCategories();
  const totalLetters = getTotalLetters();

  const filteredLessons = selectedCategory === 'all'
    ? allLessons
    : allLessons.filter((l) => l.category === selectedCategory);

  const getProgressColor = (progress: number) => {
    if (progress >= 80) return '#22c55e';
    if (progress >= 50) return accentColor;
    return textMuted;
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor }]}
      contentInsetAdjustmentBehavior="automatic"
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      <LinearGradient
        colors={gradientColors}
        style={StyleSheet.absoluteFillObject}
      />

      {/* Progress Overview Card */}
      <Animated.View entering={FadeInDown.duration(600)} style={styles.section}>
        <ThemedBlurView intensity={25} style={[styles.progressCard, { borderColor: cardBorder }]}>
          <Text style={[styles.progressTitle, { color: textColor }]}>Your Progress</Text>

          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={[styles.statNumber, { color: accentColor }]}>
                {stats?.lettersLearned ?? 0}
              </Text>
              <Text style={[styles.statLabel, { color: textMuted }]}>
                of {totalLetters} Letters
              </Text>
            </View>

            <View style={styles.statDivider} />

            <View style={styles.statItem}>
              <Text style={[styles.statNumber, { color: accentColor }]}>
                {stats?.lessonsCompleted ?? 0}
              </Text>
              <Text style={[styles.statLabel, { color: textMuted }]}>
                Lessons Done
              </Text>
            </View>

            <View style={styles.statDivider} />

            <View style={styles.statItem}>
              <Text style={[styles.statNumber, { color: accentColor }]}>
                {stats?.currentStreak ?? 0}
              </Text>
              <Text style={[styles.statLabel, { color: textMuted }]}>
                Day Streak
              </Text>
            </View>
          </View>

          {/* Progress Bar */}
          <View style={styles.progressBarContainer}>
            <View style={[styles.progressBarBg, { backgroundColor: resolvedTheme === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' }]}>
              <View
                style={[
                  styles.progressBarFill,
                  {
                    backgroundColor: getProgressColor(arabicProgress.getOverallProgress().overallProgress),
                    width: `${arabicProgress.getOverallProgress().overallProgress}%`,
                  },
                ]}
              />
            </View>
            <Text style={[styles.progressPercent, { color: textMuted }]}>
              {arabicProgress.getOverallProgress().overallProgress}% Complete
            </Text>
          </View>
        </ThemedBlurView>
      </Animated.View>

      {/* Quick Actions */}
      <Animated.View entering={FadeInUp.delay(200).duration(600)} style={styles.section}>
        <Text style={[styles.sectionTitle, { color: textColor }]}>Quick Start</Text>

        <View style={styles.quickActions}>
          <Pressable
            onPress={() => router.push('/(tabs)/learn/alphabet')}
            style={({ pressed }) => [styles.actionButton, pressed && styles.actionButtonPressed]}
          >
            <ThemedBlurView intensity={20} style={[styles.actionCard, { borderColor: cardBorder }]}>
              <Text style={styles.actionEmoji}>أ</Text>
              <View style={styles.actionTextContainer}>
                <Text style={[styles.actionTitle, { color: textColor }]}>Alphabet</Text>
                <Text style={[styles.actionSubtitle, { color: textMuted }]}>
                  {stats?.lettersLearned ?? 0}/{totalLetters} learned
                </Text>
              </View>
            </ThemedBlurView>
          </Pressable>

          <Pressable
            onPress={() => {
              const inProgress = allLessons.find(
                (l) => arabicProgress.getLessonStatus(l.id) === 'in_progress'
              );
              const firstLesson = inProgress || allLessons[0];
              if (firstLesson) {
                router.push(`/(tabs)/learn/lesson/${firstLesson.id}`);
              }
            }}
            style={({ pressed }) => [styles.actionButton, pressed && styles.actionButtonPressed]}
          >
            <ThemedBlurView intensity={20} style={[styles.actionCard, { borderColor: cardBorder }]}>
              <Text style={styles.actionEmoji}>📚</Text>
              <View style={styles.actionTextContainer}>
                <Text style={[styles.actionTitle, { color: textColor }]}>Continue</Text>
                <Text style={[styles.actionSubtitle, { color: textMuted }]}>
                  {stats?.lessonsInProgress ?? 0} in progress
                </Text>
              </View>
            </ThemedBlurView>
          </Pressable>
        </View>
      </Animated.View>

      {/* Category Filter */}
      <Animated.View entering={FadeInUp.delay(300).duration(600)} style={styles.section}>
        <Text style={[styles.sectionTitle, { color: textColor }]}>Lessons</Text>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.categoryScroll}
          contentContainerStyle={styles.categoryContainer}
        >
          <Pressable
            onPress={() => setSelectedCategory('all')}
            style={[
              styles.categoryChip,
              selectedCategory === 'all' && { backgroundColor: accentColor },
            ]}
          >
            <Text
              style={[
                styles.categoryText,
                { color: selectedCategory === 'all' ? '#fff' : textSecondary },
              ]}
            >
              All ({allLessons.length})
            </Text>
          </Pressable>

          {categories.map((cat) => (
            <Pressable
              key={cat.id}
              onPress={() => setSelectedCategory(cat.id)}
              style={[
                styles.categoryChip,
                selectedCategory === cat.id && { backgroundColor: accentColor },
              ]}
            >
              <Text
                style={[
                  styles.categoryText,
                  { color: selectedCategory === cat.id ? '#fff' : textSecondary },
                ]}
              >
                {cat.label} ({cat.count})
              </Text>
            </Pressable>
          ))}
        </ScrollView>
      </Animated.View>

      {/* Lessons List */}
      <View style={styles.lessonsContainer}>
        {filteredLessons.map((lesson, index) => {
          const status = arabicProgress.getLessonStatus(lesson.id);
          const progress = arabicProgress.getLessonProgress(lesson.id);
          const isCompleted = status === 'completed';
          const isInProgress = status === 'in_progress';

          return (
            <Animated.View
              key={lesson.id}
              entering={FadeInUp.delay(400 + index * 50).duration(500)}
            >
              <Pressable
                onPress={() => router.push(`/(tabs)/learn/lesson/${lesson.id}`)}
                style={({ pressed }) => pressed && styles.lessonCardPressed}
              >
                <ThemedBlurView
                  intensity={20}
                  style={[
                    styles.lessonCard,
                    { borderColor: isCompleted ? '#22c55e' : cardBorder },
                  ]}
                >
                  <View style={styles.lessonHeader}>
                    <View style={styles.lessonInfo}>
                      <View style={styles.lessonTitleRow}>
                        <Text style={[styles.lessonTitle, { color: textColor }]}>
                          {lesson.title}
                        </Text>
                        {isCompleted && <Text style={styles.checkmark}>✓</Text>}
                      </View>
                      {lesson.titleArabic && (
                        <Text style={[styles.lessonTitleArabic, { color: textSecondary }]}>
                          {lesson.titleArabic}
                        </Text>
                      )}
                    </View>
                    <View
                      style={[
                        styles.levelBadge,
                        {
                          backgroundColor:
                            lesson.level === 'beginner'
                              ? 'rgba(34, 197, 94, 0.2)'
                              : lesson.level === 'intermediate'
                              ? 'rgba(234, 179, 8, 0.2)'
                              : 'rgba(239, 68, 68, 0.2)',
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.levelText,
                          {
                            color:
                              lesson.level === 'beginner'
                                ? '#22c55e'
                                : lesson.level === 'intermediate'
                                ? '#eab308'
                                : '#ef4444',
                          },
                        ]}
                      >
                        {lesson.level}
                      </Text>
                    </View>
                  </View>

                  <Text style={[styles.lessonDescription, { color: textMuted }]} numberOfLines={2}>
                    {lesson.description}
                  </Text>

                  <View style={styles.lessonFooter}>
                    <Text style={[styles.lessonMeta, { color: textMuted }]}>
                      {lesson.content.length} items • {lesson.category}
                    </Text>
                    {isInProgress && progress && (
                      <View style={styles.lessonProgressBar}>
                        <View
                          style={[
                            styles.lessonProgressFill,
                            { width: `${progress.contentProgress}%`, backgroundColor: accentColor },
                          ]}
                        />
                      </View>
                    )}
                  </View>
                </ThemedBlurView>
              </Pressable>
            </Animated.View>
          );
        })}
      </View>

      <View style={styles.bottomPadding} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 16,
  },
  section: {
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontFamily: 'Tajawal-Bold',
    marginBottom: 12,
  },
  progressCard: {
    padding: 20,
    borderRadius: 24,
    borderWidth: 0.5,
    borderCurve: 'continuous',
    overflow: 'hidden',
  },
  progressTitle: {
    fontSize: 18,
    fontFamily: 'Tajawal-Bold',
    marginBottom: 16,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    marginBottom: 20,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statNumber: {
    fontSize: 28,
    fontFamily: 'Tajawal-Bold',
  },
  statLabel: {
    fontSize: 12,
    fontFamily: 'Tajawal-Regular',
    marginTop: 4,
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: 'rgba(128, 128, 128, 0.2)',
  },
  progressBarContainer: {
    marginTop: 8,
  },
  progressBarBg: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressPercent: {
    fontSize: 12,
    fontFamily: 'Tajawal-Regular',
    marginTop: 8,
    textAlign: 'center',
  },
  quickActions: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flex: 1,
  },
  actionButtonPressed: {
    opacity: 0.7,
    transform: [{ scale: 0.98 }],
  },
  actionCard: {
    padding: 20,
    height: 140,
    borderRadius: 20,
    borderWidth: 0.5,
    borderCurve: 'continuous',
    alignItems: 'center',
    justifyContent: 'space-between',
    overflow: 'hidden',
  },
  actionEmoji: {
    fontSize: 32,
    fontFamily: 'Amiri-Bold',
  },
  actionTextContainer: {
    alignItems: 'center',
  },
  actionTitle: {
    fontSize: 16,
    fontFamily: 'Tajawal-Bold',
  },
  actionSubtitle: {
    fontSize: 12,
    fontFamily: 'Tajawal-Regular',
    marginTop: 4,
  },
  categoryScroll: {
    marginHorizontal: -16,
  },
  categoryContainer: {
    paddingHorizontal: 16,
    gap: 8,
  },
  categoryChip: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderCurve: 'continuous',
    backgroundColor: 'rgba(128, 128, 128, 0.1)',
  },
  categoryText: {
    fontSize: 14,
    fontFamily: 'Tajawal-Medium',
  },
  lessonsContainer: {
    paddingHorizontal: 16,
    gap: 12,
  },
  lessonCard: {
    padding: 16,
    borderRadius: 20,
    borderWidth: 0.5,
    borderCurve: 'continuous',
    overflow: 'hidden',
  },
  lessonCardPressed: {
    opacity: 0.7,
    transform: [{ scale: 0.98 }],
  },
  lessonHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  lessonInfo: {
    flex: 1,
    marginRight: 12,
  },
  lessonTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  lessonTitle: {
    fontSize: 16,
    fontFamily: 'Tajawal-Bold',
  },
  checkmark: {
    fontSize: 16,
    color: '#22c55e',
  },
  lessonTitleArabic: {
    fontSize: 14,
    fontFamily: 'Amiri-Regular',
    marginTop: 2,
  },
  levelBadge: {
    paddingHorizontal: 10,
    paddingTop: 6,
    paddingBottom: 3,
    borderRadius: 12,
  },
  levelText: {
    fontSize: 14,
    fontFamily: 'Tajawal-Medium',
    textTransform: 'capitalize',
  },
  lessonDescription: {
    fontSize: 13,
    fontFamily: 'Tajawal-Regular',
    lineHeight: 18,
    marginBottom: 12,
  },
  lessonFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  lessonMeta: {
    fontSize: 12,
    fontFamily: 'Tajawal-Regular',
  },
  lessonProgressBar: {
    width: 60,
    height: 4,
    backgroundColor: 'rgba(128, 128, 128, 0.2)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  lessonProgressFill: {
    height: '100%',
    borderRadius: 2,
  },
  bottomPadding: {
    height: 100,
  },
});
