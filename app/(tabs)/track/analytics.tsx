import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';

import { BackgroundImage } from '@/components/BackgroundImage';
import { useBackground } from '@/contexts/BackgroundContext';
import { useTheme } from '@/contexts/ThemeContext';
import { useThemeColor } from '@/hooks/useThemeColor';
import { MonthlyStats, prayerTracker, WeeklyStats } from '@/utils/prayer-tracking';
import { Image } from 'expo-image';

const PERIOD_OPTIONS = ['This Week', 'This Month'];

export default function AnalyticsScreen() {
  const router = useRouter();
  const { resolvedTheme } = useTheme();
  const { backgroundKey } = useBackground();
  const isDark = resolvedTheme === 'dark';
  const [weeklyStats, setWeeklyStats] = useState<WeeklyStats | null>(null);
  const [monthlyStats, setMonthlyStats] = useState<MonthlyStats | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month'>('week');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  // Theme colors
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const textMuted = useThemeColor({}, 'textMuted');
  const accentColor = useThemeColor({}, 'accent');
  // const cardBackground = useThemeColor({}, 'cardBackground'); // Unused in original mapping? Using dynamic instead
  const cardBorder = useThemeColor({}, 'cardBorder');
  const borderColor = useThemeColor({}, 'border');

  const getChipBackground = (isSelected: boolean) => {
    if (backgroundKey === 'solid') {
      return isSelected
        ? (isDark ? 'rgba(212,175,55,0.25)' : 'rgba(212,175,55,0.2)')
        : 'transparent';
    }
    return isSelected ? `${accentColor}40` : 'transparent';
  };

  const chartValue = useSharedValue(0);

  // Gradient overlay - adjust opacity based on theme
  const gradientColors = isDark
    ? (['rgba(0,0,0,0.3)', 'rgba(0,0,0,0.1)', 'rgba(0,0,0,0.4)'] as const)
    : (['rgba(255,255,255,0.1)', 'rgba(255,255,255,0.05)', 'rgba(255,255,255,0.15)'] as const);

  // Blur tint based on theme
  const blurTint = isDark ? 'dark' : 'light';

  useEffect(() => {
    loadAnalytics();
  }, [selectedPeriod]);

  useEffect(() => {
    setSelectedPeriod(selectedIndex === 0 ? 'week' : 'month');
  }, [selectedIndex]);

  const loadAnalytics = async () => {
    try {
      const today = new Date();

      if (selectedPeriod === 'week') {
        // Get current week start (Monday)
        const weekStart = getWeekStart(today);
        const stats = prayerTracker.getWeeklyStats(formatDate(weekStart));
        setWeeklyStats(stats);
        chartValue.value = withSpring(stats.completionRate / 100, {
          damping: 15,
          stiffness: 100,
        });
      } else {
        // Get current month
        const monthStr = formatMonth(today);
        const stats = prayerTracker.getMonthlyStats(monthStr);
        setMonthlyStats(stats);
        chartValue.value = withSpring(stats.completionRate / 100, {
          damping: 15,
          stiffness: 100,
        });
      }
    } catch (error) {
      console.error('Error loading analytics:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getWeekStart = (date: Date): Date => {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Adjust when day is Sunday
    return new Date(d.setDate(diff));
  };

  const formatDate = (date: Date): string => {
    return date.toISOString().split('T')[0];
  };

  const formatMonth = (date: Date): string => {
    return date.toISOString().slice(0, 7); // YYYY-MM format
  };

  // Parse date string as local timezone (not UTC)
  const parseLocalDate = (dateStr: string): Date => {
    const [year, month, day] = dateStr.split('-').map(Number);
    return new Date(year, month - 1, day);
  };

  const formatDisplayDate = (dateStr: string): string => {
    const date = parseLocalDate(dateStr);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
  };

  const getDayName = (dateStr: string): string => {
    const date = parseLocalDate(dateStr);
    return date.toLocaleDateString('en-US', { weekday: 'short' });
  };

  const animatedChartStyle = useAnimatedStyle(() => ({
    width: `${chartValue.value * 100}%`,
  }));

  if (isLoading) {
    return (
      <BackgroundImage>
      <View className="items-center justify-center" style={{ flex: 1, backgroundColor: 'transparent' }}>
        <Text style={{ fontFamily: 'Tajawal-Bold', color: textColor }} className="text-lg font-medium">Loading analytics...</Text>
      </View>
      </BackgroundImage>
    );
  }

  return (
    <BackgroundImage>
    <View style={{ flex: 1, backgroundColor: 'transparent' }}>
      <LinearGradient
        colors={gradientColors}
        style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
      />

      <ScrollView
        contentInsetAdjustmentBehavior='automatic'
        contentContainerClassName="pt-6 pb-12 px-5"
        showsVerticalScrollIndicator={false}
      >
        {/* Period Selector */}
        <View
          className="mb-6 rounded-[20px] overflow-hidden border-[0.5px]"
          style={{ borderColor: cardBorder }}
        >
          <BlurView intensity={25} tint={blurTint} className="p-1">
            <View className="flex-row gap-1">
              {PERIOD_OPTIONS.map((option, index) => {
                const isSelected = selectedIndex === index;
                return (
                  <TouchableOpacity
                    key={option}
                    className="flex-1 py-3 px-4 rounded-2xl border-[0.5px] items-center justify-center"
                    style={{
                      backgroundColor: getChipBackground(isSelected),
                      borderColor: isSelected ? accentColor : 'transparent',
                    }}
                    onPress={() => {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      setSelectedIndex(index);
                    }}
                    activeOpacity={0.7}
                  >
                    <Text
                      className="text-[15px]"
                      style={{
                        color: isSelected ? accentColor : textMuted,
                        fontWeight: isSelected ? 'bold' : 'medium',
                      }}
                    >
                      {option}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </BlurView>
        </View>

        {/* Overall Stats */}
        <View
          className="mb-6 rounded-[36px] overflow-hidden border-[0.5px]"
          style={{ borderColor: cardBorder }}
        >
          <BlurView intensity={25} tint={blurTint} className="p-6">
            <Text className="text-xl font-tajawal-bold mb-5 text-center" style={{ color: textColor }}>
              {selectedPeriod === 'week' ? 'Weekly' : 'Monthly'} Overview
            </Text>

            {selectedPeriod === 'week' && weeklyStats && (
              <View className="flex-row justify-around">
                <View className="items-center">
                  <Text className="text-3xl font-tajawal-bold mb-1" style={{ color: accentColor }}>{weeklyStats.completedPrayers}</Text>
                  <Text className="text-xs font-tajawal-medium uppercase tracking-widest" style={{ color: textMuted }}>Completed</Text>
                </View>
                <View className="items-center">
                  <Text className="text-3xl font-tajawal-bold mb-1" style={{ color: accentColor }}>{weeklyStats.totalPrayers}</Text>
                  <Text className="text-xs font-tajawal-medium uppercase tracking-widest" style={{ color: textMuted }}>Total</Text>
                </View>
                <View className="items-center">
                  <Text className="text-3xl font-tajawal-bold mb-1" style={{ color: accentColor }}>{Math.round(weeklyStats.completionRate)}%</Text>
                  <Text className="text-xs font-tajawal-medium uppercase tracking-widest" style={{ color: textMuted }}>Rate</Text>
                </View>
              </View>
            )}

            {selectedPeriod === 'month' && monthlyStats && (
              <View className="flex-row justify-around">
                <View className="items-center">
                  <Text className="text-3xl font-tajawal-bold mb-1" style={{ color: accentColor }}>{monthlyStats.completedPrayers}</Text>
                  <Text className="text-xs font-tajawal-medium uppercase tracking-widest" style={{ color: textMuted }}>Completed</Text>
                </View>
                <View className="items-center">
                  <Text className="text-3xl font-tajawal-bold mb-1" style={{ color: accentColor }}>{Math.round(monthlyStats.averageDailyCompletion)}</Text>
                  <Text className="text-xs font-tajawal-medium uppercase tracking-widest" style={{ color: textMuted }}>Avg/Day</Text>
                </View>
                <View className="items-center">
                  <Text className="text-3xl font-tajawal-bold mb-1" style={{ color: accentColor }}>{Math.round(monthlyStats.completionRate)}%</Text>
                  <Text className="text-xs font-tajawal-medium uppercase tracking-widest" style={{ color: textMuted }}>Rate</Text>
                </View>
              </View>
            )}
          </BlurView>
        </View>

        {/* Progress Chart */}
        <View
          className="mb-6 rounded-[36px] overflow-hidden border-[0.5px]"
          style={{ borderColor: cardBorder }}
        >
          <BlurView intensity={25} tint={blurTint} className="p-6">
            <Text className="text-lg font-tajawal-bold mb-4" style={{ color: textColor }}>Completion Progress</Text>

            <View className="mb-4">
              <View
                className="h-3 rounded-md overflow-hidden mb-2"
                style={{ backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(4,99,7,0.1)' }}
              >
                <Animated.View className="h-full rounded-md" style={[{ backgroundColor: accentColor }, animatedChartStyle]} />
              </View>
              <Text className="text-sm font-tajawal-medium text-center mt-2.5" style={{ color: textMuted }}>
                {selectedPeriod === 'week'
                  ? `${weeklyStats?.completionRate.toFixed(1)}% completed this week`
                  : `${monthlyStats?.completionRate.toFixed(1)}% completed this month`
                }
              </Text>
            </View>
          </BlurView>
        </View>

        {/* Daily Breakdown (Weekly) */}
        {selectedPeriod === 'week' && weeklyStats && (
          <View
            className="mb-6 rounded-[36px] overflow-hidden border-[0.5px]"
            style={{ borderColor: cardBorder }}
          >
            <BlurView intensity={25} tint={blurTint} className="p-6">
              <Text className="text-lg font-tajawal-bold mb-4" style={{ color: textColor }}>Daily Breakdown</Text>

              <View className="gap-3">
                {weeklyStats.dailyStats.map((day, index) => (
                  <View key={day.date}
                    className="flex-row justify-between items-center py-3 px-4 rounded-xl border-[0.5px]"
                    style={{
                      backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(4,99,7,0.05)',
                      borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(4,99,7,0.1)'
                    }}
                  >
                    <View className="flex-1">
                      <Text className="text-base font-tajawal-bold" style={{ color: textColor }}>{getDayName(day.date)}</Text>
                      <Text className="text-xs font-tajawal" style={{ color: textMuted }}>{formatDisplayDate(day.date)}</Text>
                    </View>

                    <View className="items-end gap-1">
                      <View
                        className="w-20 h-1.5 rounded-full overflow-hidden"
                        style={{ backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(4,99,7,0.1)' }}
                      >
                        <View
                          className="h-full rounded-full"
                          style={{
                            width: `${day.completionRate}%`,
                            backgroundColor: accentColor
                          }}
                        />
                      </View>
                      <Text className="text-xs font-tajawal-medium" style={{ color: textMuted }}>
                        {day.completedCount}/5
                      </Text>
                    </View>
                  </View>
                ))}
              </View>
            </BlurView>
          </View>
        )}

        {/* Monthly Insights */}
        {selectedPeriod === 'month' && monthlyStats && (
          <View
            className="rounded-[36px] overflow-hidden border-[0.5px]"
            style={{ borderColor: cardBorder }}
          >
            <BlurView intensity={25} tint={blurTint} className="p-6">
              <Text className="text-lg font-tajawal-bold mb-4" style={{ color: textColor }}>Monthly Insights</Text>

              <View className="gap-3">
                <View
                  className="flex-row items-center gap-3 py-3 px-4 rounded-xl border-[0.5px]"
                  style={{
                    backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(4,99,7,0.05)',
                    borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(4,99,7,0.1)'
                  }}
                >
                  <Image
                    source="sf:arrow.up.right"
                    style={{ width: 20, aspectRatio: 1 }}
                    sfEffect={{
                      effect: 'wiggle',
                      scope: 'by-layer',
                    }}
                    transition={{
                      effect: 'sf:down-up',
                    }}
                    tintColor={accentColor}
                  />
                  <Text className="text-sm font-tajawal-medium flex-1" style={{ color: textColor }}>
                    Best day: {formatDisplayDate(monthlyStats.bestDay)}
                  </Text>
                </View>

                <View
                  className="flex-row items-center gap-3 py-3 px-4 rounded-xl border-[0.5px]"
                  style={{
                    backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(4,99,7,0.05)',
                    borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(4,99,7,0.1)'
                  }}
                >
                  <Image
                    source="sf:arrow.down.right"
                    style={{ width: 20, aspectRatio: 1 }}
                    sfEffect={{
                      effect: 'wiggle',
                      scope: 'by-layer',
                    }}
                    transition={{
                      effect: 'sf:down-up',
                    }}
                    tintColor={isDark ? '#ff6b6b' : '#d32f2f'}
                  />
                  <Text className="text-sm font-tajawal-medium flex-1" style={{ color: textColor }}>
                    Needs improvement: {formatDisplayDate(monthlyStats.worstDay)}
                  </Text>
                </View>

                <View
                  className="flex-row items-center gap-3 py-3 px-4 rounded-xl border-[0.5px]"
                  style={{
                    backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(4,99,7,0.05)',
                    borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(4,99,7,0.1)'
                  }}
                >
                  <Image
                    source="sf:chart.bar.fill"
                    style={{ width: 20, aspectRatio: 1 }}
                    sfEffect={{
                      effect: 'breathe',
                      scope: 'by-layer',
                    }}
                    transition={{
                      effect: 'sf:down-up',
                    }}
                    tintColor={isDark ? '#4fc3f7' : '#0277bd'}
                  />
                  <Text className="text-sm font-tajawal-medium flex-1" style={{ color: textColor }}>
                    Average: {Math.round(monthlyStats.averageDailyCompletion)} prayers per day
                  </Text>
                </View>
              </View>
            </BlurView>
          </View>
        )}
      </ScrollView>
    </View>
    </BackgroundImage>
  );
}
