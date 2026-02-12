import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  ScrollView,
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

import { BackgroundImage } from '@/components/BackgroundImage';
import { ThemedBlurView } from '@/components/ThemedBlurView';
import { ThemedStatusBar } from '@/components/ThemedStatusBar';
import { IconSymbol } from '@/components/ui/IconSymbol.ios';
import { useBackground } from '@/contexts/BackgroundContext';
import { useTheme } from '@/contexts/ThemeContext';
import { useLocation } from '@/hooks/useLocation';
import { usePrayerTimes } from '@/hooks/usePrayerTimes';
import { useThemeColor } from '@/hooks/useThemeColor';
import { DailyStats, PrayerKey, PrayerStats, prayerTracker } from '@/utils/prayer-tracking';
import { Image } from 'expo-image';

export default function TrackScreen() {
  const router = useRouter();
  const { resolvedTheme } = useTheme();
  const { backgroundKey } = useBackground();

  // Location and Prayer Times for initialization
  const { loc: location } = useLocation();
  const { prayerTimes } = usePrayerTimes(location);

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

  const getIconBadgeBg = (opacity: { solidLight: string; solidDark: string }) => {
    if (backgroundKey === 'solid') {
      return resolvedTheme === 'dark' ? opacity.solidDark : opacity.solidLight;
    }
    return `${accentColor}26`;
  };

  // Gradient overlay - adjust opacity based on theme
  const gradientColors = resolvedTheme === 'dark'
    ? (['rgba(0,0,0,0.3)', 'rgba(0,0,0,0.1)', 'rgba(0,0,0,0.4)'] as const)
    : (['rgba(255,255,255,0.1)', 'rgba(255,255,255,0.05)', 'rgba(255,255,255,0.15)'] as const);

  useEffect(() => {
    initializeTracking();
  }, []);

  useEffect(() => {
    loadTodayStats();
  }, [selectedDate, prayerTimes]); // Reload when prayer times update existing records

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
      <BackgroundImage>
      <View className="items-center justify-center" style={{ flex: 1, backgroundColor: 'transparent' }}>
        <ThemedStatusBar />
        <Text style={{ fontFamily: 'Tajawal-Bold', color: textColor }} className="text-lg font-medium">Loading prayer tracking...</Text>
      </View>
      </BackgroundImage>
    );
  }

  return (
    <BackgroundImage>
    <View className="flex-1" style={{ backgroundColor: 'transparent' }}>
      <ThemedStatusBar />
      <LinearGradient
        colors={gradientColors}
        style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
      />

      <ScrollView
        contentInsetAdjustmentBehavior='automatic'
        contentContainerClassName="pb-12 px-4"
        showsVerticalScrollIndicator={false}
      >
        {/* Overall Stats Card */}
        <Animated.View
          entering={FadeInUp.delay(200).duration(800)}
          className="mb-6 mt-6 rounded-[36px] overflow-hidden border-[0.5px]"
          style={{ borderColor: cardBorder }}
        >
          <ThemedBlurView intensity={25} className="p-6">
            <View className="flex-row justify-between items-center mb-5">
              <Text className="text-xl font-tajawal-bold" style={{ color: textColor }}>Your Progress</Text>
              <TouchableOpacity
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  router.push('/track/analytics');
                }}
                className="p-2 rounded-2xl"
                style={{ backgroundColor: getIconBadgeBg({ solidDark: 'rgba(212,175,55,0.1)', solidLight: 'rgba(212,175,55,0.15)' }) }}
              >
                <Image
                  source="sf:chart.bar.fill"
                  style={{ width: 20, aspectRatio: 1 }}
                  tintColor={accentColor}
                  sfEffect={{
                    effect: "variable-color/cumulative",
                    repeat: 1
                  }}
                />
              </TouchableOpacity>
            </View>

            {overallStats && (
              <View className="flex-row justify-around">
                <View className="items-center">
                  <Animated.Text className="text-4xl font-tajawal-bold mb-1" style={[{ color: accentColor }, animatedStreakStyle]}>
                    {overallStats.currentStreak}
                  </Animated.Text>
                  <Text className="text-xs font-tajawal-medium uppercase tracking-widest" style={{ color: textMuted }}>Day Streak</Text>
                </View>

                <View className="items-center">
                  <Text className="text-4xl font-tajawal-bold mb-1" style={{ color: accentColor }}>{overallStats.longestStreak}</Text>
                  <Text className="text-xs font-tajawal-medium uppercase tracking-widest" style={{ color: textMuted }}>Best Streak</Text>
                </View>

                <View className="items-center">
                  <Text className="text-4xl font-tajawal-bold mb-1" style={{ color: accentColor }}>{Math.round(overallStats.completionRate)}%</Text>
                  <Text className="text-xs font-tajawal-medium uppercase tracking-widest" style={{ color: textMuted }}>Completion</Text>
                </View>
              </View>
            )}
          </ThemedBlurView>
        </Animated.View>

	        {/* {"Today's Prayers"} */}
        <Animated.View
          entering={FadeInUp.delay(400).duration(800)}
          className="mb-6 rounded-[36px] overflow-hidden border-[0.5px]"
          style={{ borderColor: cardBorder }}
        >
          <ThemedBlurView intensity={25} className="p-6">
	            <Text className="text-xl font-tajawal-bold mb-2" style={{ color: textColor }}>
	              {"Today's Prayers"}
	            </Text>
            <Text className="text-sm font-tajawal mb-5" style={{ color: textMuted }}>{formatDisplayDate(selectedDate)}</Text>

            {/* Progress Bar */}
            <View className="mb-6">
              <View
                className="h-2 rounded-full overflow-hidden mb-2"
                style={{ backgroundColor: resolvedTheme === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(4,99,7,0.1)' }}
              >
                <Animated.View className="h-full rounded-full" style={[{ backgroundColor: accentColor }, animatedProgressStyle]} />
              </View>
              <Text className="text-sm font-tajawal-medium text-center mt-2.5" style={{ color: textMuted }}>
                {todayStats?.completedCount || 0} of 5 prayers completed
              </Text>
            </View>

            {/* Prayer Checkboxes */}
            <View className="gap-3">
              {(['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'] as PrayerKey[]).map((prayer, index) => {
                const isCompleted = todayStats?.prayers[prayer];
                return (
                  <Animated.View
                    key={prayer}
                    entering={FadeInUp.delay(600 + index * 100).duration(600)}
                  >
                    <TouchableOpacity
                      className="flex-row justify-between items-center py-3 px-4 rounded-[18px] border-[0.5px]"
                      style={{
                        backgroundColor: resolvedTheme === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(4,99,7,0.05)',
                        borderColor
                      }}
                      onPress={() => togglePrayer(prayer)}
                      activeOpacity={0.7}
                    >
                      <View className="flex-row items-center gap-3">
                        <IconSymbol
                          name={getPrayerIcon(prayer) as any}
                          size={20}
                          color={isCompleted ? accentColor : textMuted}
                        />
                        <Text
                          className={`text-base font-tajawal-medium ${isCompleted ? 'font-tajawal-bold' : ''}`}
                          style={{ color: isCompleted ? accentColor : textColor }}
                        >
                          {getPrayerName(prayer)}
                        </Text>
                      </View>

                      <View
                        className="w-6 h-6 rounded-xl border-2 justify-center items-center"
                        style={{
                          borderColor: isCompleted ? accentColor : borderColor,
                          backgroundColor: isCompleted ? accentColor : 'transparent'
                        }}
                      >
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

        {/* Tasbeeh Counter */}
        <Animated.View
          entering={FadeInUp.delay(600).duration(800)}
          className="mb-6 rounded-[36px] overflow-hidden border-[0.5px]"
          style={{ borderColor: cardBorder }}
        >
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              router.push('/track/tasbeeh');
            }}
          >
            <ThemedBlurView intensity={25} className="p-6">
              <View className="flex-row items-center justify-between">
                <View className="flex-row items-center gap-4">
                  <View
                    className="w-14 h-14 rounded-2xl items-center justify-center"
                    style={{ backgroundColor: getIconBadgeBg({ solidDark: 'rgba(212,175,55,0.15)', solidLight: 'rgba(212,175,55,0.2)' }) }}
                  >
                    <IconSymbol name="circle.grid.3x3" size={28} color={accentColor} />
                  </View>
                  <View>
                    <Text className="text-xl font-tajawal-bold" style={{ color: textColor }}>Tasbeeh Counter</Text>
                    <Text className="text-sm font-tajawal" style={{ color: textMuted }}>Dhikr beads counter</Text>
                  </View>
                </View>
                <IconSymbol name="chevron.right" size={20} color={textMuted} />
              </View>
            </ThemedBlurView>
          </TouchableOpacity>
        </Animated.View>

        {/* Quick Actions */}
        <Animated.View
          entering={FadeInUp.delay(800).duration(800)}
          className="rounded-[40px] overflow-hidden border-[0.5px]"
          style={{ borderColor: cardBorder, borderCurve: 'continuous' }}
        >
          <ThemedBlurView intensity={25} className="p-6">
            <Text className="text-lg font-tajawal-bold mb-4" style={{ color: textColor }}>Quick Actions</Text>

            <View className="gap-3">
              <TouchableOpacity
                className="flex-row items-center gap-3 py-4 px-5 rounded-[18px] border-[0.5px]"
                style={{
                  backgroundColor: resolvedTheme === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(4,99,7,0.05)',
                  borderColor
                }}
                onPress={() => {
                  // Mark all prayers as completed
                  (['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'] as PrayerKey[]).forEach(prayer => {
                    if (!todayStats?.prayers[prayer]) {
                      togglePrayer(prayer);
                    }
                  });
                }}
              >
                <IconSymbol name="checkmark.circle.fill" size={24} color={accentColor} />
                <Text className="text-base font-tajawal-medium" style={{ color: textColor }}>Mark All Complete</Text>
              </TouchableOpacity>

              <TouchableOpacity
                className="flex-row items-center gap-3 py-4 px-5 rounded-[18px] border-[0.5px]"
                style={{
                  backgroundColor: resolvedTheme === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(4,99,7,0.05)',
                  borderColor
                }}
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
                <Text className="text-base font-tajawal-medium" style={{ color: textColor }}>Reset Today</Text>
              </TouchableOpacity>

            </View>
          </ThemedBlurView>
        </Animated.View>
      </ScrollView>
    </View>
    </BackgroundImage>
  );
}
