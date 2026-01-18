import { Host, Picker } from '@expo/ui/swift-ui';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useState } from 'react';
import {
  Dimensions,
  ScrollView,
  StyleSheet,
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
      <View style={[styles.container, { backgroundColor }]}>
        <BlurView intensity={20} tint={blurTint} style={[styles.loadingCard, { borderColor: cardBorder }]}>
          <Text style={[styles.loadingText, { color: textColor }]}>Loading analytics...</Text>
        </BlurView>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor }]}>
      <LinearGradient
        colors={gradientColors}
        style={StyleSheet.absoluteFillObject}
      />
      
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onBack} style={[styles.backButton, { backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(4,99,7,0.1)' }]}>
            <IconSymbol name="chevron.left" size={24} color={textColor} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: textColor }]}>Analytics</Text>
          <View style={styles.headerSpacer} />
        </View>

        {/* Period Selector */}
        <View style={[styles.periodSelector, { borderColor: cardBorder }]}>
          <Host matchContents>
            <Picker
              options={['This Week', 'This Month']}
              selectedIndex={selectedIndex}
              onOptionSelected={({ nativeEvent: { index } }) => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setSelectedIndex(index);
              }}
              variant="segmented"
            />
          </Host>
        </View>

        {/* Overall Stats */}
        <View style={[styles.overallCard, { borderColor: cardBorder }]}>
          <BlurView intensity={25} tint={blurTint} style={styles.overallBlur}>
            <Text style={[styles.overallTitle, { color: textColor }]}>
              {selectedPeriod === 'week' ? 'Weekly' : 'Monthly'} Overview
            </Text>
            
            {selectedPeriod === 'week' && weeklyStats && (
              <View style={styles.overallStats}>
                <View style={styles.statItem}>
                  <Text style={[styles.statNumber, { color: accentColor }]}>{weeklyStats.completedPrayers}</Text>
                  <Text style={[styles.statLabel, { color: textMuted }]}>Completed</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={[styles.statNumber, { color: accentColor }]}>{weeklyStats.totalPrayers}</Text>
                  <Text style={[styles.statLabel, { color: textMuted }]}>Total</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={[styles.statNumber, { color: accentColor }]}>{Math.round(weeklyStats.completionRate)}%</Text>
                  <Text style={[styles.statLabel, { color: textMuted }]}>Rate</Text>
                </View>
              </View>
            )}
            
            {selectedPeriod === 'month' && monthlyStats && (
              <View style={styles.overallStats}>
                <View style={styles.statItem}>
                  <Text style={[styles.statNumber, { color: accentColor }]}>{monthlyStats.completedPrayers}</Text>
                  <Text style={[styles.statLabel, { color: textMuted }]}>Completed</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={[styles.statNumber, { color: accentColor }]}>{Math.round(monthlyStats.averageDailyCompletion)}</Text>
                  <Text style={[styles.statLabel, { color: textMuted }]}>Avg/Day</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={[styles.statNumber, { color: accentColor }]}>{Math.round(monthlyStats.completionRate)}%</Text>
                  <Text style={[styles.statLabel, { color: textMuted }]}>Rate</Text>
                </View>
              </View>
            )}
          </BlurView>
        </View>

        {/* Progress Chart */}
        <View style={[styles.chartCard, { borderColor: cardBorder }]}>
          <BlurView intensity={25} tint={blurTint} style={styles.chartBlur}>
            <Text style={[styles.chartTitle, { color: textColor }]}>Completion Progress</Text>
            
            <View style={styles.progressContainer}>
              <View style={[styles.progressBar, { backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(4,99,7,0.1)' }]}>
                <Animated.View style={[styles.progressFill, { backgroundColor: accentColor }, animatedChartStyle]} />
              </View>
              <Text style={[styles.progressText, { color: textMuted }]}>
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
          <View style={[styles.breakdownCard, { borderColor: cardBorder }]}>
            <BlurView intensity={25} tint={blurTint} style={styles.breakdownBlur}>
              <Text style={[styles.breakdownTitle, { color: textColor }]}>Daily Breakdown</Text>
              
              <View style={styles.dailyList}>
                {weeklyStats.dailyStats.map((day, index) => (
                  <View key={day.date} style={[
                    styles.dailyItem,
                    { 
                      backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(4,99,7,0.05)',
                      borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(4,99,7,0.1)'
                    }
                  ]}>
                    <View style={styles.dailyInfo}>
                      <Text style={[styles.dailyName, { color: textColor }]}>{getDayName(day.date)}</Text>
                      <Text style={[styles.dailyDate, { color: textMuted }]}>{formatDisplayDate(day.date)}</Text>
                    </View>
                    
                    <View style={styles.dailyProgress}>
                      <View style={[styles.dailyProgressBar, { backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(4,99,7,0.1)' }]}>
                        <View 
                          style={[
                            styles.dailyProgressFill,
                            { 
                              width: `${day.completionRate}%`,
                              backgroundColor: accentColor
                            }
                          ]} 
                        />
                      </View>
                      <Text style={[styles.dailyProgressText, { color: textMuted }]}>
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
          <View style={[styles.insightsCard, { borderColor: cardBorder }]}>
            <BlurView intensity={25} tint={blurTint} style={styles.insightsBlur}>
              <Text style={[styles.insightsTitle, { color: textColor }]}>Monthly Insights</Text>
              
              <View style={styles.insightsList}>
                <View style={[
                  styles.insightItem,
                  { 
                    backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(4,99,7,0.05)',
                    borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(4,99,7,0.1)'
                  }
                ]}>
                  <IconSymbol name="arrow.up.right" size={20} color={accentColor} />
                  <Text style={[styles.insightText, { color: textColor }]}>
                    Best day: {formatDisplayDate(monthlyStats.bestDay)}
                  </Text>
                </View>
                
                <View style={[
                  styles.insightItem,
                  { 
                    backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(4,99,7,0.05)',
                    borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(4,99,7,0.1)'
                  }
                ]}>
                  <IconSymbol name="arrow.down.right" size={20} color={isDark ? '#ff6b6b' : '#d32f2f'} />
                  <Text style={[styles.insightText, { color: textColor }]}>
                    Needs improvement: {formatDisplayDate(monthlyStats.worstDay)}
                  </Text>
                </View>
                
                <View style={[
                  styles.insightItem,
                  { 
                    backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(4,99,7,0.05)',
                    borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(4,99,7,0.1)'
                  }
                ]}>
                  <IconSymbol name="chart.bar.fill" size={20} color={isDark ? '#4fc3f7' : '#0277bd'} />
                  <Text style={[styles.insightText, { color: textColor }]}>
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 60,
    paddingBottom: 120,
    paddingHorizontal: 20,
  },
  loadingCard: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    margin: 20,
    padding: 40,
    borderRadius: 36,
    borderCurve: 'continuous',
    borderWidth: 1,
  },
  loadingText: {
    fontFamily: 'Tajawal-Regular',
    fontSize: 18,
    fontWeight: '500',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 32,
  },
  backButton: {
    padding: 8,
    borderRadius: 36,
    borderCurve: 'continuous',
  },
  headerTitle: {
    flex: 1,
    fontSize: 28,
    fontFamily: 'Tajawal-Bold',
    textAlign: 'center',
    marginHorizontal: 16,
  },
  headerSpacer: {
    width: 40,
  },
  periodSelector: {
    marginBottom: 24,
    borderRadius: 36,
    borderCurve: 'continuous',
    overflow: 'hidden',
    borderWidth: 1,
  },
  periodBlur: {
    flexDirection: 'row',
    padding: 4,
  },
  periodButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 16,
    borderCurve: 'continuous',
    alignItems: 'center',
  },
  activePeriodButton: {
    // backgroundColor handled inline
  },
  periodButtonText: {
    fontSize: 14,
    fontFamily: 'Tajawal-Medium',
  },
  activePeriodText: {
    fontFamily: 'Tajawal-Bold',
  },
  overallCard: {
    marginBottom: 24,
    borderRadius: 36,
    borderCurve: 'continuous',
    overflow: 'hidden',
    borderWidth: 1,
  },
  overallBlur: {
    padding: 24,
  },
  overallTitle: {
    fontSize: 20,
    fontFamily: 'Tajawal-Bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  overallStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 28,
    fontFamily: 'Tajawal-Bold',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    fontFamily: 'Tajawal-Medium',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  chartCard: {
    marginBottom: 24,
    borderRadius: 36,
    borderCurve: 'continuous',
    overflow: 'hidden',
    borderWidth: 1,
  },
  chartBlur: {
    padding: 24,
  },
  chartTitle: {
    fontSize: 18,
    fontFamily: 'Tajawal-Bold',
    marginBottom: 16,
  },
  progressContainer: {
    marginBottom: 16,
  },
  progressBar: {
    height: 12,
    borderRadius: 6,
    borderCurve: 'continuous',
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    borderRadius: 6,
    borderCurve: 'continuous',
  },
  progressText: {
    fontSize: 14,
    fontFamily: 'Tajawal-Medium',
    textAlign: 'center',
    marginTop: 10,
  },
  breakdownCard: {
    marginBottom: 24,
    borderRadius: 36,
    borderCurve: 'continuous',
    overflow: 'hidden',
    borderWidth: 1,
  },
  breakdownBlur: {
    padding: 24,
  },
  breakdownTitle: {
    fontSize: 18,
    fontFamily: 'Tajawal-Bold',
    marginBottom: 16,
  },
  dailyList: {
    gap: 12,
  },
  dailyItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderCurve: 'continuous',
    borderWidth: 1,
  },
  dailyInfo: {
    flex: 1,
  },
  dailyName: {
    fontSize: 16,
    fontFamily: 'Tajawal-Bold',
  },
  dailyDate: {
    fontSize: 12,
    fontFamily: 'Tajawal-Regular',
  },
  dailyProgress: {
    alignItems: 'flex-end',
    gap: 4,
  },
  dailyProgressBar: {
    width: 80,
    height: 6,
    borderRadius: 3,
    borderCurve: 'continuous',
    overflow: 'hidden',
  },
  dailyProgressFill: {
    height: '100%',
    borderRadius: 3,
    borderCurve: 'continuous',
  },
  dailyProgressText: {
    fontSize: 12,
    fontFamily: 'Tajawal-Medium',
  },
  insightsCard: {
    borderRadius: 36,
    borderCurve: 'continuous',
    overflow: 'hidden',
    borderWidth: 1,
  },
  insightsBlur: {
    padding: 24,
  },
  insightsTitle: {
    fontSize: 18,
    fontFamily: 'Tajawal-Bold',
    marginBottom: 16,
  },
  insightsList: {
    gap: 12,
  },
  insightItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderCurve: 'continuous',
    borderWidth: 1,
  },
  insightText: {
    fontSize: 14,
    fontFamily: 'Tajawal-Medium',
    flex: 1,
  },
}); 