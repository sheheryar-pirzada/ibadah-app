
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Animated, {
  FadeInUp,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming
} from 'react-native-reanimated';

import { ThemedBlurView } from '@/components/ThemedBlurView';
import { ThemedStatusBar } from '@/components/ThemedStatusBar';
import { IconSymbol } from '@/components/ui/IconSymbol.ios';
import { useTheme } from '@/contexts/ThemeContext';
import { useThemeColor } from '@/hooks/useThemeColor';
import { DailyStats, PrayerKey, PrayerStats, prayerTracker } from '@/utils/prayer-tracking';

export default function TrackScreen() {
  const router = useRouter();
  const { resolvedTheme } = useTheme();
  const [todayStats, setTodayStats] = useState<DailyStats | null>(null);
  const [overallStats, setOverallStats] = useState<PrayerStats | null>(null);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [isLoading, setIsLoading] = useState(true);

  const progressValue = useSharedValue(0);
  const streakValue = useSharedValue(0);

  // Theme colors
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const textMuted = useThemeColor({}, 'textMuted');
  const accentColor = useThemeColor({}, 'accent');
  const borderColor = useThemeColor({}, 'border');
  const cardBorder = useThemeColor({}, 'cardBorder');

  // Gradient overlay - adjust opacity based on theme
  const gradientColors = resolvedTheme === 'dark'
    ? (['rgba(0,0,0,0.3)', 'rgba(0,0,0,0.1)', 'rgba(0,0,0,0.4)'] as const)
    : (['rgba(255,255,255,0.1)', 'rgba(255,255,255,0.05)', 'rgba(255,255,255,0.15)'] as const);

  useEffect(() => {
    initializeTracking();
  }, []);

  useEffect(() => {
    loadTodayStats();
  }, [selectedDate]);

  const initializeTracking = async () => {
    try {
      await prayerTracker.initialize();
      await loadTodayStats();
      await loadOverallStats();
    } catch (error) {
      console.error('Error initializing prayer tracking:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadTodayStats = async () => {
    const dateStr = formatDate(selectedDate);
    const stats = prayerTracker.getDailyStats(dateStr);
    setTodayStats(stats);

    // Animate progress (no spring)
    progressValue.value = withTiming(stats.completionRate / 100, {
      duration: 300,
    });
  };

  const loadOverallStats = async () => {
    const stats = prayerTracker.getStats();
    setOverallStats(stats);

    if (stats) {
      streakValue.value = withSpring(stats.currentStreak, {
        damping: 15,
        stiffness: 100,
      });
    }
  };

  const togglePrayer = async (prayer: PrayerKey) => {
    if (!todayStats) return;

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    const dateStr = formatDate(selectedDate);
    const isCompleted = todayStats.prayers[prayer];

    if (isCompleted) {
      await prayerTracker.markPrayerIncomplete(prayer, dateStr);
    } else {
      await prayerTracker.markPrayerCompleted(prayer, dateStr);
    }

    await loadTodayStats();
    await loadOverallStats();
  };

  const formatDate = (date: Date): string => {
    return date.toISOString().split('T')[0];
  };

  const formatDisplayDate = (date: Date): string => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
    });
  };

  const getPrayerName = (prayer: PrayerKey): string => {
    const names = {
      fajr: 'Fajr',
      dhuhr: 'Dhuhr',
      asr: 'Asr',
      maghrib: 'Maghrib',
      isha: 'Isha',
    };
    return names[prayer];
  };

  const getPrayerIcon = (prayer: PrayerKey): string => {
    const icons = {
      fajr: 'sun.horizon.fill',
      dhuhr: 'sun.max.fill',
      asr: 'sun.min.fill',
      maghrib: 'moon.fill',
      isha: 'moon.fill',
    };
    return icons[prayer];
  };

  const animatedProgressStyle = useAnimatedStyle(() => ({
    width: `${progressValue.value * 100}%`,
  }));

  const animatedStreakStyle = useAnimatedStyle(() => ({
    transform: [{ scale: withSpring(streakValue.value > 0 ? 1.1 : 1) }],
  }));

  if (isLoading) {
    return (
      <View style={[styles.container, { backgroundColor }]}>
        <ThemedStatusBar />
        <ThemedBlurView intensity={20} style={[styles.loadingCard, { borderColor: cardBorder }]}>
          <Text style={[styles.loadingText, { color: textColor }]}>Loading prayer tracking...</Text>
        </ThemedBlurView>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor }]}>
      <ThemedStatusBar />
      <LinearGradient
        colors={gradientColors}
        style={StyleSheet.absoluteFillObject}
      />

      <ScrollView contentInsetAdjustmentBehavior='automatic' contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        {/* <Animated.View entering={FadeInDown.duration(600)} style={styles.header}>
          <Text style={[styles.headerTitle, { color: textColor }]}>Prayer Tracking</Text>
        </Animated.View> */}

        {/* Overall Stats Card */}
        <Animated.View entering={FadeInUp.delay(200).duration(800)} style={[styles.statsCard, { borderColor: cardBorder }]}>
          <ThemedBlurView intensity={25} style={styles.statsBlur}>
            <View style={styles.statsHeader}>
              <Text style={[styles.statsTitle, { color: textColor }]}>Your Progress</Text>
              <TouchableOpacity
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  router.push('/track/analytics');
                }}
                style={[styles.analyticsButton, { backgroundColor: resolvedTheme === 'dark' ? 'rgba(212,175,55,0.1)' : 'rgba(212,175,55,0.15)' }]}
              >
                <IconSymbol name="chart.bar.fill" size={20} color="#d4af37" />
              </TouchableOpacity>
            </View>

            {overallStats && (
              <View style={styles.statsGrid}>
                <View style={styles.statItem}>
                  <Animated.Text style={[styles.statNumber, { color: accentColor }, animatedStreakStyle]}>
                    {overallStats.currentStreak}
                  </Animated.Text>
                  <Text style={[styles.statLabel, { color: textMuted }]}>Day Streak</Text>
                </View>

                <View style={styles.statItem}>
                  <Text style={[styles.statNumber, { color: accentColor }]}>{overallStats.longestStreak}</Text>
                  <Text style={[styles.statLabel, { color: textMuted }]}>Best Streak</Text>
                </View>

                <View style={styles.statItem}>
                  <Text style={[styles.statNumber, { color: accentColor }]}>{Math.round(overallStats.completionRate)}%</Text>
                  <Text style={[styles.statLabel, { color: textMuted }]}>Completion</Text>
                </View>
              </View>
            )}
          </ThemedBlurView>
        </Animated.View>

        {/* Today's Prayers */}
        <Animated.View entering={FadeInUp.delay(400).duration(800)} style={[styles.todayCard, { borderColor: cardBorder }]}>
          <ThemedBlurView intensity={25} style={styles.todayBlur}>
            <Text style={[styles.todayTitle, { color: textColor }]}>Today's Prayers</Text>
            <Text style={[styles.todayDate, { color: textMuted }]}>{formatDisplayDate(selectedDate)}</Text>

            {/* Progress Bar */}
            <View style={styles.progressContainer}>
              <View style={[styles.progressBar, { backgroundColor: resolvedTheme === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(4,99,7,0.1)' }]}>
                <Animated.View style={[styles.progressFill, { backgroundColor: accentColor }, animatedProgressStyle]} />
              </View>
              <Text style={[styles.progressText, { color: textMuted }]}>
                {todayStats?.completedCount || 0} of 5 prayers completed
              </Text>
            </View>

            {/* Prayer Checkboxes */}
            <View style={styles.prayerList}>
              {(['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'] as PrayerKey[]).map((prayer, index) => {
                const isCompleted = todayStats?.prayers[prayer];
                return (
                  <Animated.View
                    key={prayer}
                    entering={FadeInUp.delay(600 + index * 100).duration(600)}
                  >
                    <TouchableOpacity
                      style={[styles.prayerItem, {
                        backgroundColor: resolvedTheme === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(4,99,7,0.05)',
                        borderColor
                      }]}
                      onPress={() => togglePrayer(prayer)}
                      activeOpacity={0.7}
                    >
                      <View style={styles.prayerInfo}>
                        <IconSymbol
                          name={getPrayerIcon(prayer) as any}
                          size={20}
                          color={isCompleted ? accentColor : textMuted}
                        />
                        <Text style={[
                          styles.prayerName,
                          { color: textColor },
                          isCompleted && { color: accentColor, fontFamily: 'Tajawal-Bold' }
                        ]}>
                          {getPrayerName(prayer)}
                        </Text>
                      </View>

                      <View style={[
                        styles.checkbox,
                        { borderColor },
                        isCompleted && { backgroundColor: accentColor, borderColor: accentColor }
                      ]}>
                        {isCompleted && (
                          <IconSymbol name="checkmark" size={16} color="#fff" />
                        )}
                      </View>
                    </TouchableOpacity>
                  </Animated.View>
                );
              })}
            </View>
          </ThemedBlurView>
        </Animated.View>

        {/* Quick Actions */}
        <Animated.View entering={FadeInUp.delay(800).duration(800)} style={[styles.actionsCard, { borderColor: cardBorder }]}>
          <ThemedBlurView intensity={25} style={styles.actionsBlur}>
            <Text style={[styles.actionsTitle, { color: textColor }]}>Quick Actions</Text>

            <View style={styles.actionButtons}>
              <TouchableOpacity
                style={[styles.actionButton, {
                  backgroundColor: resolvedTheme === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(4,99,7,0.05)',
                  borderColor
                }]}
                onPress={() => {
                  // Mark all prayers as completed
                  (['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'] as PrayerKey[]).forEach(prayer => {
                    if (!todayStats?.prayers[prayer]) {
                      togglePrayer(prayer);
                    }
                  });
                }}
              >
                <IconSymbol name="checkmark.circle.fill" size={24} color="#d4af37" />
                <Text style={[styles.actionButtonText, { color: textColor }]}>Mark All Complete</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.actionButton, {
                  backgroundColor: resolvedTheme === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(4,99,7,0.05)',
                  borderColor
                }]}
                onPress={() => {
                  Alert.alert(
                    'Reset Today',
                    'Are you sure you want to reset all prayers for today?',
                    [
                      { text: 'Cancel', style: 'cancel' },
                      {
                        text: 'Reset',
                        style: 'destructive',
                        onPress: () => {
                          (['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'] as PrayerKey[]).forEach(prayer => {
                            if (todayStats?.prayers[prayer]) {
                              togglePrayer(prayer);
                            }
                          });
                        }
                      }
                    ]
                  );
                }}
              >
                <IconSymbol name="arrow.clockwise" size={24} color="#ff6b6b" />
                <Text style={[styles.actionButtonText, { color: textColor }]}>Reset Today</Text>
              </TouchableOpacity>
            </View>
          </ThemedBlurView>
        </Animated.View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    // paddingTop: 60,
    paddingBottom: 120,
    paddingHorizontal: 16,
  },
  loadingCard: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    margin: 20,
    padding: 40,
    borderRadius: 24,
    borderCurve: 'continuous',
    borderWidth: 1,
  },
  loadingText: {
    fontFamily: 'Tajawal-Regular',
    fontSize: 18,
    fontWeight: '500',
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  headerTitle: {
    fontSize: 28,
    fontFamily: 'Tajawal-Bold',
    textAlign: 'center',
  },
  statsCard: {
    marginBottom: 24,
    borderRadius: 36,
    borderCurve: 'continuous',
    overflow: 'hidden',
    borderWidth: 1,
  },
  statsBlur: {
    padding: 24,
  },
  statsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  statsTitle: {
    fontSize: 20,
    fontFamily: 'Tajawal-Bold',
  },
  analyticsButton: {
    padding: 8,
    borderRadius: 16,
    borderCurve: 'continuous',
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 32,
    fontFamily: 'Tajawal-Bold',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    fontFamily: 'Tajawal-Medium',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  todayCard: {
    marginBottom: 24,
    borderRadius: 36,
    borderCurve: 'continuous',
    overflow: 'hidden',
    borderWidth: 1,
  },
  todayBlur: {
    padding: 24,
  },
  todayTitle: {
    fontSize: 20,
    fontFamily: 'Tajawal-Bold',
    marginBottom: 8,
  },
  todayDate: {
    fontSize: 14,
    fontFamily: 'Tajawal-Regular',
    marginBottom: 20,
  },
  progressContainer: {
    marginBottom: 24,
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
    borderCurve: 'continuous',
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
    borderCurve: 'continuous',
  },
  progressText: {
    fontSize: 14,
    marginTop: 10,
    fontFamily: 'Tajawal-Medium',
    textAlign: 'center',
  },
  prayerList: {
    gap: 12,
  },
  prayerItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 18,
    borderCurve: 'continuous',
    borderWidth: 1,
  },
  prayerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  prayerName: {
    fontSize: 16,
    fontFamily: 'Tajawal-Medium',
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderCurve: 'continuous',
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionsCard: {
    borderRadius: 36,
    borderCurve: 'continuous',
    overflow: 'hidden',
    borderWidth: 1,
  },
  actionsBlur: {
    padding: 24,
  },
  actionsTitle: {
    fontSize: 18,
    fontFamily: 'Tajawal-Bold',
    marginBottom: 16,
  },
  actionButtons: {
    gap: 12,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 12,
    borderCurve: 'continuous',
    borderWidth: 1,
  },
  actionButtonText: {
    fontSize: 16,
    fontFamily: 'Tajawal-Medium',
  },
});
