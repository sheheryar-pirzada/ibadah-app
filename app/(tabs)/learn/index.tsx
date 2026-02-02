import { ThemedBlurView } from '@/components/ThemedBlurView';
import { IconSymbol } from '@/components/ui/IconSymbol';
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
      className="flex-1"
      style={{ backgroundColor }}
      contentInsetAdjustmentBehavior="automatic"
      contentContainerStyle={{ paddingTop: 16 }}
      showsVerticalScrollIndicator={false}
    >
      <LinearGradient
        colors={gradientColors}
        style={StyleSheet.absoluteFillObject}
      />

      {/* Progress Overview Card */}
      <Animated.View entering={FadeInDown.duration(600)} className="px-4 mb-6">
        <ThemedBlurView
          intensity={25}
          className="p-5 rounded-3xl overflow-hidden"
          style={{ borderColor: cardBorder, borderWidth: 0.5, borderCurve: 'continuous' }}
        >
          <Text
            className="text-lg font-tajawal-bold mb-4"
            style={{ color: textColor }}
          >
            Your Progress
          </Text>

          <View className="flex-row justify-around items-center mb-5">
            <View className="items-center flex-1">
              <Text
                className="text-[28px] font-tajawal-bold"
                style={{ color: accentColor }}
              >
                {stats?.lettersLearned ?? 0}
              </Text>
              <Text
                className="text-xs font-tajawal mt-1"
                style={{ color: textMuted }}
              >
                of {totalLetters} Letters
              </Text>
            </View>

            <View className="w-px h-10 bg-gray-500/20" />

            <View className="items-center flex-1">
              <Text
                className="text-[28px] font-tajawal-bold"
                style={{ color: accentColor }}
              >
                {stats?.lessonsCompleted ?? 0}
              </Text>
              <Text
                className="text-xs font-tajawal mt-1"
                style={{ color: textMuted }}
              >
                Lessons Done
              </Text>
            </View>

            <View className="w-px h-10 bg-gray-500/20" />

            <View className="items-center flex-1">
              <Text
                className="text-[28px] font-tajawal-bold"
                style={{ color: accentColor }}
              >
                {stats?.currentStreak ?? 0}
              </Text>
              <Text
                className="text-xs font-tajawal mt-1"
                style={{ color: textMuted }}
              >
                Day Streak
              </Text>
            </View>
          </View>

          {/* Progress Bar */}
          <View className="mt-2">
            <View
              className="h-2 rounded overflow-hidden"
              style={{ backgroundColor: resolvedTheme === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' }}
            >
              <View
                className="h-full rounded"
                style={{
                  backgroundColor: getProgressColor(arabicProgress.getOverallProgress().overallProgress),
                  width: `${arabicProgress.getOverallProgress().overallProgress}%`,
                }}
              />
            </View>
            <Text
              className="text-xs font-tajawal mt-2 text-center"
              style={{ color: textMuted }}
            >
              {arabicProgress.getOverallProgress().overallProgress}% Complete
            </Text>
          </View>
        </ThemedBlurView>
      </Animated.View>

      {/* Quick Actions */}
      <Animated.View entering={FadeInUp.delay(200).duration(600)} className="px-4 mb-6">
        <Text
          className="text-xl font-tajawal-bold mb-3"
          style={{ color: textColor }}
        >
          Quick Start
        </Text>

        <View className="flex-row gap-3">
          <Pressable
            onPress={() => router.push('/(tabs)/learn/alphabet')}
            className="flex-1 active:opacity-70 active:scale-[0.98]"
          >
            <ThemedBlurView
              intensity={20}
              className="p-5 h-[140px] rounded-[20px] items-center justify-between overflow-hidden"
              style={{ borderColor: cardBorder, borderWidth: 0.5, borderCurve: 'continuous' }}
            >
              <Text
              style={{ color: accentColor }}
              className="text-[32px] font-amiri">أ</Text>
              <View className="items-center">
                <Text
                  className="text-base font-tajawal-bold"
                  style={{ color: textColor }}
                >
                  Alphabet
                </Text>
                <Text
                  className="text-xs font-tajawal mt-1"
                  style={{ color: textMuted }}
                >
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
            className="flex-1 active:opacity-70 active:scale-[0.98]"
          >
            <ThemedBlurView
              intensity={20}
              className="p-5 h-[140px] rounded-[20px] items-center justify-between overflow-hidden"
              style={{ borderColor: cardBorder, borderWidth: 0.5, borderCurve: 'continuous' }}
            >
              <IconSymbol name="books.vertical.fill" size={50} color={accentColor} />
              <View className="items-center">
                <Text
                  className="text-base font-tajawal-bold"
                  style={{ color: textColor }}
                >
                  Continue
                </Text>
                <Text
                  className="text-xs font-tajawal mt-1"
                  style={{ color: textMuted }}
                >
                  {stats?.lessonsInProgress ?? 0} in progress
                </Text>
              </View>
            </ThemedBlurView>
          </Pressable>
        </View>
      </Animated.View>

      {/* Category Filter */}
      <Animated.View entering={FadeInUp.delay(300).duration(600)} className="px-4 mb-6">
        <Text
          className="text-xl font-tajawal-bold mb-3"
          style={{ color: textColor }}
        >
          Lessons
        </Text>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          className="-mx-4"
          contentContainerStyle={{ paddingHorizontal: 16, gap: 8 }}
        >
          <Pressable
            onPress={() => setSelectedCategory('all')}
            className="px-4 pt-3 pb-2 rounded-[20px] items-center justify-center"
            style={{
              backgroundColor: selectedCategory === 'all' ? accentColor : 'rgba(128, 128, 128, 0.1)',
              borderCurve: 'continuous',
            }}
          >
            <Text
              className="text-sm font-tajawal-medium"
              style={{ color: selectedCategory === 'all' ? '#fff' : textSecondary }}
            >
              All ({allLessons.length})
            </Text>
          </Pressable>

          {categories.map((cat) => (
            <Pressable
              key={cat.id}
              onPress={() => setSelectedCategory(cat.id)}
              className="px-4 pt-3 pb-2 rounded-[20px] items-center justify-center"
              style={{
                backgroundColor: selectedCategory === cat.id ? accentColor : 'rgba(128, 128, 128, 0.1)',
                borderCurve: 'continuous',
              }}
            >
              <Text
                className="text-sm font-tajawal-medium"
                style={{ color: selectedCategory === cat.id ? '#fff' : textSecondary }}
              >
                {cat.label} ({cat.count})
              </Text>
            </Pressable>
          ))}
        </ScrollView>
      </Animated.View>

      {/* Lessons List */}
      <View className="px-4 gap-3">
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
                className="active:opacity-70 active:scale-[0.98]"
              >
                <ThemedBlurView
                  intensity={20}
                  className="p-4 rounded-[20px] overflow-hidden"
                  style={{
                    borderColor: isCompleted ? '#22c55e' : cardBorder,
                    borderWidth: 0.5,
                    borderCurve: 'continuous',
                  }}
                >
                  <View className="flex-row justify-between items-start mb-2">
                    <View className="flex-1 mr-3">
                      <View className="flex-row items-center gap-2">
                        <Text
                          className="text-base font-tajawal-bold"
                          style={{ color: textColor }}
                        >
                          {lesson.title}
                        </Text>
                        {isCompleted && <Text className="text-base text-green-500">✓</Text>}
                      </View>
                      {lesson.titleArabic && (
                        <Text
                          className="text-sm font-amiri mt-0.5"
                          style={{ color: textSecondary }}
                        >
                          {lesson.titleArabic}
                        </Text>
                      )}
                    </View>
                    <View
                      className="px-2.5 pt-1.5 pb-1 rounded-xl"
                      style={{
                        backgroundColor:
                          lesson.level === 'beginner'
                            ? 'rgba(34, 197, 94, 0.2)'
                            : lesson.level === 'intermediate'
                            ? 'rgba(234, 179, 8, 0.2)'
                            : 'rgba(239, 68, 68, 0.2)',
                      }}
                    >
                      <Text
                        className="text-sm font-tajawal-medium capitalize"
                        style={{
                          color:
                            lesson.level === 'beginner'
                              ? '#22c55e'
                              : lesson.level === 'intermediate'
                              ? '#eab308'
                              : '#ef4444',
                        }}
                      >
                        {lesson.level}
                      </Text>
                    </View>
                  </View>

                  <Text
                    className="text-[13px] font-tajawal leading-[18px] mb-3"
                    style={{ color: textMuted }}
                    numberOfLines={2}
                  >
                    {lesson.description}
                  </Text>

                  <View className="flex-row justify-between items-center">
                    <Text
                      className="text-xs font-tajawal"
                      style={{ color: textMuted }}
                    >
                      {lesson.content.length} items • {lesson.category}
                    </Text>
                    {isInProgress && progress && (
                      <View className="w-[60px] h-1 bg-gray-500/20 rounded-sm overflow-hidden">
                        <View
                          className="h-full rounded-sm"
                          style={{ width: `${progress.contentProgress}%`, backgroundColor: accentColor }}
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

      <View className="h-[100px]" />
    </ScrollView>
  );
}
