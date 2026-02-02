import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  Dimensions,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Animated, {
  FadeInDown,
  FadeInUp,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

import PrayerAnalyticsScreen from '@/components/PrayerAnalyticsScreen';
import { DailyStats, PrayerKey, PrayerStats, prayerTracker } from '@/utils/prayer-tracking';
import { IconSymbol } from './ui/IconSymbol.ios';

const { width } = Dimensions.get('window');

interface PrayerTrackingScreenProps {
  onBack: () => void;
}

export default function PrayerTrackingScreen({ onBack }: PrayerTrackingScreenProps) {
  const [todayStats, setTodayStats] = useState<DailyStats | null>(null);
  const [overallStats, setOverallStats] = useState<PrayerStats | null>(null);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [isLoading, setIsLoading] = useState(true);
  const [showAnalytics, setShowAnalytics] = useState(false);

  const progressValue = useSharedValue(0);
  const streakValue = useSharedValue(0);

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

  if (showAnalytics) {
    return (
      <PrayerAnalyticsScreen onBack={() => setShowAnalytics(false)} />
    );
  }

  if (isLoading) {
    return (
      <View className="flex-1 bg-[#0f3d2c]">
        <BlurView
          intensity={20}
          tint="systemMaterialDark"
          className="flex-1 justify-center items-center m-5 p-10 overflow-hidden rounded-3xl"
          style={{ borderWidth: 0.5, borderCurve: 'continuous', borderColor: 'rgba(255,255,255,0.1)' }}
        >
          <Text className="text-lg font-sans" style={{ color: 'rgba(255,255,255,0.9)' }}>
            Loading prayer tracking...
          </Text>
        </BlurView>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-[#0f3d2c]">
      <LinearGradient
        colors={['rgba(0,0,0,0.3)', 'rgba(0,0,0,0.1)', 'rgba(0,0,0,0.4)']}
        className="absolute inset-0"
      />

      <ScrollView contentContainerClassName="pt-[60px] pb-10 px-5">
        {/* Header */}
        <Animated.View entering={FadeInDown.duration(600)} className="flex-row items-center mb-8">
          <TouchableOpacity
            onPress={onBack}
            className="p-2 rounded-2xl"
            style={{ borderCurve: 'continuous', backgroundColor: 'rgba(255,255,255,0.1)' }}
          >
            <IconSymbol name="chevron.left" size={24} color="#fff" />
          </TouchableOpacity>
          <Text className="flex-1 text-[28px] text-center mx-4 font-tajawal-bold" style={{ color: 'rgba(255,255,255,0.95)' }}>
            Prayer Tracking
          </Text>
          <View className="w-10" />
        </Animated.View>

        {/* Overall Stats Card */}
        <Animated.View
          entering={FadeInUp.delay(200).duration(800)}
          className="mb-6 overflow-hidden rounded-3xl"
          style={{ borderWidth: 0.5, borderCurve: 'continuous', borderColor: 'rgba(255,255,255,0.15)' }}
        >
          <BlurView intensity={25} tint="systemUltraThinMaterialDark" className="p-6">
            <View className="flex-row justify-between items-center mb-5">
              <Text className="text-xl font-tajawal-bold" style={{ color: 'rgba(255,255,255,0.9)' }}>
                Your Progress
              </Text>
              <TouchableOpacity
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  setShowAnalytics(true);
                }}
                className="p-2 rounded-2xl"
                style={{ borderCurve: 'continuous', backgroundColor: 'rgba(212,175,55,0.1)' }}
              >
                <IconSymbol name="chart.bar.fill" size={20} color="#d4af37" />
              </TouchableOpacity>
            </View>

            {overallStats && (
              <View className="flex-row justify-around">
                <View className="items-center">
                  <Animated.Text className="text-[32px] font-tajawal-bold mb-1 text-[#d4af37]" style={animatedStreakStyle}>
                    {overallStats.currentStreak}
                  </Animated.Text>
                  <Text className="text-xs font-tajawal-medium uppercase tracking-[0.5px]" style={{ color: 'rgba(255,255,255,0.7)' }}>
                    Day Streak
                  </Text>
                </View>

                <View className="items-center">
                  <Text className="text-[32px] font-tajawal-bold mb-1 text-[#d4af37]">
                    {overallStats.longestStreak}
                  </Text>
                  <Text className="text-xs font-tajawal-medium uppercase tracking-[0.5px]" style={{ color: 'rgba(255,255,255,0.7)' }}>
                    Best Streak
                  </Text>
                </View>

                <View className="items-center">
                  <Text className="text-[32px] font-tajawal-bold mb-1 text-[#d4af37]">
                    {Math.round(overallStats.completionRate)}%
                  </Text>
                  <Text className="text-xs font-tajawal-medium uppercase tracking-[0.5px]" style={{ color: 'rgba(255,255,255,0.7)' }}>
                    Completion
                  </Text>
                </View>
              </View>
            )}
          </BlurView>
        </Animated.View>

        {/* Today's Prayers */}
        <Animated.View
          entering={FadeInUp.delay(400).duration(800)}
          className="mb-6 overflow-hidden rounded-3xl"
          style={{ borderWidth: 0.5, borderCurve: 'continuous', borderColor: 'rgba(255,255,255,0.15)' }}
        >
          <BlurView intensity={25} tint="systemUltraThinMaterialDark" className="p-6">
            <Text className="text-xl font-tajawal-bold mb-2" style={{ color: 'rgba(255,255,255,0.9)' }}>
              {"Today's Prayers"}
            </Text>
            <Text className="text-sm font-sans mb-5" style={{ color: 'rgba(255,255,255,0.7)' }}>
              {formatDisplayDate(selectedDate)}
            </Text>

            {/* Progress Bar */}
            <View className="mb-6">
              <View
                className="h-2 overflow-hidden rounded"
                style={{ borderCurve: 'continuous', backgroundColor: 'rgba(255,255,255,0.1)' }}
              >
                <Animated.View
                  className="h-full rounded"
                  style={[{ backgroundColor: '#d4af37', borderCurve: 'continuous' }, animatedProgressStyle]}
                />
              </View>
              <Text className="text-xs font-tajawal-medium text-center mt-2" style={{ color: 'rgba(255,255,255,0.7)' }}>
                {todayStats?.completedCount || 0} of 5 prayers completed
              </Text>
            </View>

            {/* Prayer Checkboxes */}
            <View className="gap-3">
              {(['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'] as PrayerKey[]).map((prayer, index) => (
                <Animated.View
                  key={prayer}
                  entering={FadeInUp.delay(600 + index * 100).duration(600)}
                >
                  <TouchableOpacity
                    className="flex-row justify-between items-center px-4 py-3 rounded-xl"
                    style={{ borderCurve: 'continuous', borderWidth: 0.5, borderColor: 'rgba(255,255,255,0.1)', backgroundColor: 'rgba(255,255,255,0.05)' }}
                    onPress={() => togglePrayer(prayer)}
                    activeOpacity={0.7}
                  >
                    <View className="flex-row items-center gap-3">
                      <IconSymbol
                        name={getPrayerIcon(prayer) as any}
                        size={20}
                        color={todayStats?.prayers[prayer] ? '#d4af37' : '#fff'}
                      />
                      <Text
                        className={[
                          'text-base font-tajawal-medium',
                          todayStats?.prayers[prayer] ? 'text-[#d4af37] font-tajawal-bold' : 'text-white',
                        ].join(' ')}
                      >
                        {getPrayerName(prayer)}
                      </Text>
                    </View>

                    <View
                      className="w-6 h-6 rounded-full justify-center items-center"
                      style={{
                        borderCurve: 'continuous',
                        borderWidth: 2,
                        borderColor: todayStats?.prayers[prayer] ? '#d4af37' : 'rgba(255,255,255,0.3)',
                        backgroundColor: todayStats?.prayers[prayer] ? '#d4af37' : 'transparent',
                      }}
                    >
                      {todayStats?.prayers[prayer] && (
                        <IconSymbol name="checkmark" size={16} color="#fff" />
                      )}
                    </View>
                  </TouchableOpacity>
                </Animated.View>
              ))}
            </View>
          </BlurView>
        </Animated.View>

        {/* Quick Actions */}
        <Animated.View
          entering={FadeInUp.delay(800).duration(800)}
          className="overflow-hidden rounded-3xl"
          style={{ borderWidth: 0.5, borderCurve: 'continuous', borderColor: 'rgba(255,255,255,0.15)' }}
        >
          <BlurView intensity={25} tint="systemUltraThinMaterialDark" className="p-6">
            <Text className="text-lg font-tajawal-bold mb-4" style={{ color: 'rgba(255,255,255,0.9)' }}>
              Quick Actions
            </Text>

            <View className="gap-3">
              <TouchableOpacity
                className="flex-row items-center gap-3 px-5 py-4 rounded-xl"
                style={{ borderCurve: 'continuous', borderWidth: 0.5, borderColor: 'rgba(255,255,255,0.1)', backgroundColor: 'rgba(255,255,255,0.05)' }}
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
                <Text className="text-base font-tajawal-medium" style={{ color: 'rgba(255,255,255,0.9)' }}>
                  Mark All Complete
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                className="flex-row items-center gap-3 px-5 py-4 rounded-xl"
                style={{ borderCurve: 'continuous', borderWidth: 0.5, borderColor: 'rgba(255,255,255,0.1)', backgroundColor: 'rgba(255,255,255,0.05)' }}
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
                <Text className="text-base font-tajawal-medium" style={{ color: 'rgba(255,255,255,0.9)' }}>
                  Reset Today
                </Text>
              </TouchableOpacity>
            </View>
          </BlurView>
        </Animated.View>
      </ScrollView>
    </View>
  );
}
