import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useState } from 'react';
import {
  Dimensions,
  Pressable,
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

import { useTheme } from '@/contexts/ThemeContext';
import { useThemeColor } from '@/hooks/useThemeColor';
import { MonthlyStats, prayerTracker, WeeklyStats } from '@/utils/prayer-tracking';
import { IconSymbol } from './ui/IconSymbol.ios';

const { width } = Dimensions.get('window');

interface PrayerAnalyticsScreenProps {
  onBack: () => void;
}

export default function PrayerAnalyticsScreen({ onBack }: PrayerAnalyticsScreenProps) {
  const { resolvedTheme } = useTheme();
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
  const cardBackground = useThemeColor({}, 'cardBackground');
  const cardBorder = useThemeColor({}, 'cardBorder');
  const borderColor = useThemeColor({}, 'border');

  const chartValue = useSharedValue(0);

  // Gradient overlay - adjust opacity based on theme
  const gradientColors = isDark
    ? (['rgba(0,0,0,0.3)', 'rgba(0,0,0,0.1)', 'rgba(0,0,0,0.4)'] as const)
    : (['rgba(255,255,255,0.1)', 'rgba(255,255,255,0.05)', 'rgba(255,255,255,0.15)'] as const);

  // Blur tint based on theme
  const blurTint = isDark ? 'dark' : 'light';

  // Active button background color
  const activeButtonBg = isDark ? 'rgba(212,175,55,0.2)' : 'rgba(212,175,55,0.15)';

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

  const formatDisplayDate = (dateStr: string): string => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
  };

  const getDayName = (dateStr: string): string => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { weekday: 'short' });
  };

  const animatedChartStyle = useAnimatedStyle(() => ({
    width: `${chartValue.value * 100}%`,
  }));

  if (isLoading) {
    return (
      <View className="flex-1" style={{ backgroundColor }}>
        <BlurView
          intensity={20}
          tint={blurTint}
          className="flex-1 justify-center items-center m-5 p-10 overflow-hidden rounded-[36px]"
          style={{ borderWidth: 0.5, borderCurve: 'continuous', borderColor: cardBorder }}
        >
          <Text className="text-lg font-sans" style={{ color: textColor }}>Loading analytics...</Text>
        </BlurView>
      </View>
    );
  }

  return (
    <View className="flex-1" style={{ backgroundColor }}>
      <LinearGradient
        colors={gradientColors}
        className="absolute inset-0"
      />

      <ScrollView contentContainerClassName="pt-[60px] pb-[120px] px-5" showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View className="flex-row items-center mb-8">
          <TouchableOpacity
            onPress={onBack}
            className="p-2 rounded-[36px]"
            style={{
              borderCurve: 'continuous',
              backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(4,99,7,0.1)',
            }}
          >
            <IconSymbol name="chevron.left" size={24} color={textColor} />
          </TouchableOpacity>
          <Text className="flex-1 text-[28px] text-center mx-4 font-tajawal-bold" style={{ color: textColor }}>
            Analytics
          </Text>
          <View className="w-10" />
        </View>

        {/* Period Selector */}
        <View
          className="mb-6 flex-row overflow-hidden rounded-[36px]"
          style={{ borderWidth: 0.5, borderCurve: 'continuous', borderColor: cardBorder }}
        >
          <BlurView intensity={25} tint={blurTint} className="flex-1 flex-row">
            <Pressable
              onPress={() => {
                if (selectedIndex !== 0) {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  setSelectedIndex(0);
                }
              }}
              className="flex-1 items-center justify-center py-3 rounded-l-[36px]"
              style={{
                borderCurve: 'continuous',
                backgroundColor: selectedIndex === 0 ? activeButtonBg : 'transparent',
              }}
            >
              <Text
                className="text-base"
                style={{ color: selectedIndex === 0 ? accentColor : textMuted }}
              >
                This Week
              </Text>
            </Pressable>
            <Pressable
              onPress={() => {
                if (selectedIndex !== 1) {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  setSelectedIndex(1);
                }
              }}
              className="flex-1 items-center justify-center py-3 rounded-r-[36px]"
              style={{
                borderCurve: 'continuous',
                backgroundColor: selectedIndex === 1 ? activeButtonBg : 'transparent',
              }}
            >
              <Text
                className="text-base"
                style={{ color: selectedIndex === 1 ? accentColor : textMuted }}
              >
                This Month
              </Text>
            </Pressable>
          </BlurView>
        </View>

        {/* Overall Stats */}
        <View
          className="mb-6 overflow-hidden rounded-[36px]"
          style={{ borderWidth: 0.5, borderCurve: 'continuous', borderColor: cardBorder }}
        >
          <BlurView intensity={25} tint={blurTint} className="p-6">
            <Text className="text-xl font-tajawal-bold text-center mb-5" style={{ color: textColor }}>
              {selectedPeriod === 'week' ? 'Weekly' : 'Monthly'} Overview
            </Text>

            {selectedPeriod === 'week' && weeklyStats && (
              <View className="flex-row justify-around">
                <View className="items-center">
                  <Text className="text-[28px] font-tajawal-bold mb-1" style={{ color: accentColor }}>
                    {weeklyStats.completedPrayers}
                  </Text>
                  <Text className="text-xs font-tajawal-medium uppercase tracking-[0.5px]" style={{ color: textMuted }}>
                    Completed
                  </Text>
                </View>
                <View className="items-center">
                  <Text className="text-[28px] font-tajawal-bold mb-1" style={{ color: accentColor }}>
                    {weeklyStats.totalPrayers}
                  </Text>
                  <Text className="text-xs font-tajawal-medium uppercase tracking-[0.5px]" style={{ color: textMuted }}>
                    Total
                  </Text>
                </View>
                <View className="items-center">
                  <Text className="text-[28px] font-tajawal-bold mb-1" style={{ color: accentColor }}>
                    {Math.round(weeklyStats.completionRate)}%
                  </Text>
                  <Text className="text-xs font-tajawal-medium uppercase tracking-[0.5px]" style={{ color: textMuted }}>
                    Rate
                  </Text>
                </View>
              </View>
            )}

            {selectedPeriod === 'month' && monthlyStats && (
              <View className="flex-row justify-around">
                <View className="items-center">
                  <Text className="text-[28px] font-tajawal-bold mb-1" style={{ color: accentColor }}>
                    {monthlyStats.completedPrayers}
                  </Text>
                  <Text className="text-xs font-tajawal-medium uppercase tracking-[0.5px]" style={{ color: textMuted }}>
                    Completed
                  </Text>
                </View>
                <View className="items-center">
                  <Text className="text-[28px] font-tajawal-bold mb-1" style={{ color: accentColor }}>
                    {Math.round(monthlyStats.averageDailyCompletion)}
                  </Text>
                  <Text className="text-xs font-tajawal-medium uppercase tracking-[0.5px]" style={{ color: textMuted }}>
                    Avg/Day
                  </Text>
                </View>
                <View className="items-center">
                  <Text className="text-[28px] font-tajawal-bold mb-1" style={{ color: accentColor }}>
                    {Math.round(monthlyStats.completionRate)}%
                  </Text>
                  <Text className="text-xs font-tajawal-medium uppercase tracking-[0.5px]" style={{ color: textMuted }}>
                    Rate
                  </Text>
                </View>
              </View>
            )}
          </BlurView>
        </View>

        {/* Progress Chart */}
        <View
          className="mb-6 overflow-hidden rounded-[36px]"
          style={{ borderWidth: 0.5, borderCurve: 'continuous', borderColor: cardBorder }}
        >
          <BlurView intensity={25} tint={blurTint} className="p-6">
            <Text className="text-lg font-tajawal-bold mb-4" style={{ color: textColor }}>
              Completion Progress
            </Text>

            <View className="mb-4">
              <View
                className="h-3 overflow-hidden rounded-md mb-2"
                style={{
                  borderCurve: 'continuous',
                  backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(4,99,7,0.1)',
                }}
              >
                <Animated.View
                  className="h-full rounded-md"
                  style={[{ backgroundColor: accentColor, borderCurve: 'continuous' }, animatedChartStyle]}
                />
              </View>
              <Text className="text-sm font-tajawal-medium text-center mt-2" style={{ color: textMuted }}>
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
            className="mb-6 overflow-hidden rounded-[36px]"
            style={{ borderWidth: 0.5, borderCurve: 'continuous', borderColor: cardBorder }}
          >
            <BlurView intensity={25} tint={blurTint} className="p-6">
              <Text className="text-lg font-tajawal-bold mb-4" style={{ color: textColor }}>
                Daily Breakdown
              </Text>

              <View className="gap-3">
                {weeklyStats.dailyStats.map((day, index) => (
                  <View key={day.date} style={[
                    {
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      paddingVertical: 12,
                      paddingHorizontal: 16,
                      borderRadius: 12,
                      borderCurve: 'continuous',
                      borderWidth: 0.5,
                      backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(4,99,7,0.05)',
                      borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(4,99,7,0.1)'
                    }
                  ]}>
                    <View className="flex-1">
                      <Text className="text-base font-tajawal-bold" style={{ color: textColor }}>
                        {getDayName(day.date)}
                      </Text>
                      <Text className="text-xs font-sans" style={{ color: textMuted }}>
                        {formatDisplayDate(day.date)}
                      </Text>
                    </View>

                    <View className="items-end gap-1">
                      <View
                        className="w-20 h-1.5 overflow-hidden rounded"
                        style={{
                          borderCurve: 'continuous',
                          backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(4,99,7,0.1)',
                        }}
                      >
                        <View
                          className="h-full rounded"
                          style={{ width: `${day.completionRate}%`, backgroundColor: accentColor, borderCurve: 'continuous' }}
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
            className="overflow-hidden rounded-[36px]"
            style={{ borderWidth: 0.5, borderCurve: 'continuous', borderColor: cardBorder }}
          >
            <BlurView intensity={25} tint={blurTint} className="p-6">
              <Text className="text-lg font-tajawal-bold mb-4" style={{ color: textColor }}>
                Monthly Insights
              </Text>

              <View className="gap-3">
                <View style={[
                  {
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 12,
                    paddingVertical: 12,
                    paddingHorizontal: 16,
                    borderRadius: 12,
                    borderCurve: 'continuous',
                    borderWidth: 0.5,
                    backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(4,99,7,0.05)',
                    borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(4,99,7,0.1)'
                  }
                ]}>
                  <IconSymbol name="arrow.up.right" size={20} color={accentColor} />
                  <Text className="text-sm font-tajawal-medium flex-1" style={{ color: textColor }}>
                    Best day: {formatDisplayDate(monthlyStats.bestDay)}
                  </Text>
                </View>

                <View style={[
                  {
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 12,
                    paddingVertical: 12,
                    paddingHorizontal: 16,
                    borderRadius: 12,
                    borderCurve: 'continuous',
                    borderWidth: 0.5,
                    backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(4,99,7,0.05)',
                    borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(4,99,7,0.1)'
                  }
                ]}>
                  <IconSymbol name="arrow.down.right" size={20} color={isDark ? '#ff6b6b' : '#d32f2f'} />
                  <Text className="text-sm font-tajawal-medium flex-1" style={{ color: textColor }}>
                    Needs improvement: {formatDisplayDate(monthlyStats.worstDay)}
                  </Text>
                </View>

                <View style={[
                  {
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 12,
                    paddingVertical: 12,
                    paddingHorizontal: 16,
                    borderRadius: 12,
                    borderCurve: 'continuous',
                    borderWidth: 0.5,
                    backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(4,99,7,0.05)',
                    borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(4,99,7,0.1)'
                  }
                ]}>
                  <IconSymbol name="chart.bar.fill" size={20} color={isDark ? '#4fc3f7' : '#0277bd'} />
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
  );
}
