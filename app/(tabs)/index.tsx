import { BookmarkedHadiths } from '@/components/BookmarkedHadiths';
import type { ChinAudioMetadata } from '@/components/chin';
import { ChinAudioPlayer, useChin } from '@/components/chin';
import DailyHadithCard from '@/components/DailyHadithCard';
import DailyVerseCard from '@/components/DailyVerseCard';
import { HadithBooksGrid } from '@/components/HadithBooksGrid';
import { ImmersiveOverlay } from "@/components/immersive-overlay";
import { useImmersiveOverlay } from "@/components/immersive-overlay/store";
import { PrayerCard } from '@/components/PrayerCard';
import { RamadanCalendarCard } from '@/components/RamadanCalendarCard';
import { SettingsHeaderButton } from '@/components/SettingsHeaderButton';
import { ThemedBlurView } from '@/components/ThemedBlurView';
import { ThemedStatusBar } from '@/components/ThemedStatusBar';
import { useTheme } from '@/contexts/ThemeContext';
import { useDailyContent } from '@/hooks/useDailyContent';
import { useLocation } from '@/hooks/useLocation';
import { usePrayerTimes } from '@/hooks/usePrayerTimes';
import { useThemeColor } from '@/hooks/useThemeColor';
import { useHadithSettings } from '@/utils/hadith-settings';
import { notificationService } from '@/utils/notification-service';
import { getNotificationSettings, PrayerKey as NotificationPrayerKey, NotificationSettings, updateNotificationEnabled, updatePrayerToggle } from '@/utils/notification-settings';
import {
  formatPrayerTime,
  getCurrentDateString,
  getIslamicDateString,
  getPrayerName,
  PrayerKey
} from '@/utils/prayer-ui';
import { GlassView, isLiquidGlassAvailable } from 'expo-glass-effect';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  Text,
  View
} from 'react-native';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';

export default function PrayerTimesScreen() {
  const { resolvedTheme } = useTheme();
  const { loc: location } = useLocation();
  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings | null>(null);

  const { dismiss } = useImmersiveOverlay();
  const chin = useChin();

  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const textMuted = useThemeColor({}, 'textMuted');
  const accentColor = useThemeColor({}, 'accent');
  const cardBorder = useThemeColor({}, 'cardBorder');

  const { books, bookmarkedHadiths, removeBookmark } = useHadithSettings();

  const {
    prayerTimes,
    nextPrayer,
    timeUntilNext,
  } = usePrayerTimes(location);

  const {
    dailyVerse,
    isLoadingVerse,
    dailyHadith,
    isLoadingHadith,
  } = useDailyContent();

  const gradientColors = resolvedTheme === 'dark'
    ? (['rgba(0,0,0,0.3)', 'rgba(0,0,0,0.1)', 'rgba(0,0,0,0.4)'] as const)
    : (['rgba(255,255,255,0.1)', 'rgba(255,255,255,0.05)', 'rgba(255,255,255,0.15)'] as const);

  const loadNotificationSettings = useCallback(async () => {
    try {
      const settings = await getNotificationSettings();
      setNotificationSettings(settings);
    } catch (error) {
      console.error('Error loading notification settings:', error);
    }
  }, []);

  useEffect(() => {
    loadNotificationSettings();
  }, [loadNotificationSettings]);

  useFocusEffect(
    useCallback(() => {
      loadNotificationSettings();
    }, [loadNotificationSettings])
  );

  const handleNotificationToggle = async (prayer: PrayerKey) => {
    if (prayer === 'sunrise') return;
    if (!notificationSettings || !location) return;

    if (!notificationSettings.enabled) {
      Alert.alert(
        'Notifications Off',
        'Prayer notifications are disabled. Turn them on to get reminders for prayer times.',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Turn On',
            onPress: async () => {
              await updateNotificationEnabled(true);
              await loadNotificationSettings();
              if (location) {
                await notificationService.rescheduleAll(location.coords.latitude, location.coords.longitude);
              }
            },
          },
        ]
      );
      return;
    }

    const currentlyEnabled = notificationSettings.prayers[prayer as NotificationPrayerKey];
    await updatePrayerToggle(prayer as NotificationPrayerKey, !currentlyEnabled);
    await loadNotificationSettings();
    await notificationService.rescheduleAll(location.coords.latitude, location.coords.longitude);
  };

  const handleAudioToggle = useCallback((isPlaying: boolean, audioUrl: string | null, metadata?: ChinAudioMetadata) => {
    if (isPlaying && audioUrl) {
      chin.show(<ChinAudioPlayer audioUrl={audioUrl} metadata={metadata} onClose={chin.hide} />);
    } else {
      chin.hide();
    }
  }, [chin]);

  if (!location || !prayerTimes) {
    return (
      <View className="flex-1" style={{ backgroundColor }}>
        <ThemedStatusBar />
        <LinearGradient
          colors={gradientColors}
          className="absolute inset-0"
        />
        <View className="flex-1 justify-center items-center px-5">
          <ThemedBlurView
            intensity={25}
            className="p-10 rounded-[40px] items-center overflow-hidden min-w-[200px]"
            style={{ borderCurve: 'continuous', borderWidth: 0.5, borderColor: cardBorder }}
          >
            <ActivityIndicator size="large" color={accentColor} style={{ marginBottom: 16 }} />
            <Text className="text-base text-center font-tajawal-medium" style={{ color: textColor }}>
              Loading prayer times...
            </Text>
          </ThemedBlurView>
        </View>
      </View>
    );
  }

  const prayerKeys = Object.keys(prayerTimes) as PrayerKey[];

  return (
    <ImmersiveOverlay allowDismiss onDismiss={dismiss}>
      <LinearGradient
        colors={gradientColors}
        className="absolute inset-0"
      />
      <ScrollView
        className="font-sans"
        style={{ backgroundColor }}
        contentInsetAdjustmentBehavior="automatic"
        contentContainerClassName="pb-10 px-4"
        showsVerticalScrollIndicator={false}
      >
        <Animated.View entering={FadeInDown.duration(600)} className="items-center mb-8">
          <View className="flex-row items-center justify-between w-full">
            <View style={{ width: 24 }} />
            <Text className="text-[28px] font-tajawal-bold" style={{ color: textColor }}>
              Prayer Times
            </Text>
            <SettingsHeaderButton />
          </View>
          <Text className="text-base font-[Tajawal-Light]" style={{ color: textMuted }}>{getCurrentDateString()}</Text>
          <Text className="text-sm font-[Tajawal-Light] mt-0.5" style={{ color: textMuted }}>{getIslamicDateString()}</Text>
        </Animated.View>

        <Animated.View
          entering={FadeInUp.delay(200).duration(800)}
          className="mb-4 overflow-hidden rounded-[28px]"
          style={{ borderCurve: 'continuous', borderWidth: 0.5, borderColor: cardBorder }}
        >
          <ThemedBlurView intensity={25} className="p-8">
            <View className="items-center">
              <View className="items-center mb-3">
                <Image
                  source={
                    nextPrayer === 'fajr' ? require('../../assets/images/prayers/fajr.png') :
                      nextPrayer === 'sunrise' ? require('../../assets/images/prayers/fajr.png') :
                        nextPrayer === 'dhuhr' ? require('../../assets/images/prayers/dhuhr.png') :
                          nextPrayer === 'asr' ? require('../../assets/images/prayers/asr.png') :
                            nextPrayer === 'maghrib' ? require('../../assets/images/prayers/maghrib.png') :
                              require('../../assets/images/prayers/isha.png')
                  }
                  style={{ height: 250, width: 250 }}
                />
                <Text className="text-4xl font-tajawal-bold mb-2 tracking-[-1px]" style={{ color: textColor }}>
                  {getPrayerName(nextPrayer)}
                </Text>
              </View>
              <Text className="text-[28px] font-tajawal-bold mb-5" style={{ color: textColor }}>
                {formatPrayerTime(prayerTimes[nextPrayer])}
              </Text>
              {isLiquidGlassAvailable() ? (
                <GlassView
                  glassEffectStyle={resolvedTheme === 'dark' ? 'clear' : 'regular'}
                  isInteractive={true}
                  style={{ borderCurve: 'continuous', alignItems: 'center', paddingVertical: 12, paddingHorizontal: 24, borderRadius: 36 }}
                >
                  <Text className="text-xs font-tajawal-bold uppercase tracking-[0.5px] mb-1" style={{ color: textMuted }}>
                    Time remaining
                  </Text>
                  <Text className="text-xl font-tajawal-bold" style={{ color: textColor }}>
                    {timeUntilNext}
                  </Text>
                </GlassView>
              ) : (
                <View
                  style={{
                    borderCurve: 'continuous',
                    alignItems: 'center',
                    paddingVertical: 12,
                    paddingHorizontal: 24,
                    borderRadius: 36,
                    backgroundColor: resolvedTheme === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(4,99,7,0.1)',
                  }}
                >
                  <Text className="text-xs font-tajawal-bold uppercase tracking-[0.5px] mb-1" style={{ color: textMuted }}>
                    Time remaining
                  </Text>
                  <Text className="text-xl font-tajawal-bold" style={{ color: textColor }}>
                    {timeUntilNext}
                  </Text>
                </View>
              )}
            </View>
          </ThemedBlurView>
        </Animated.View>

        <View className="my-4">
          <Animated.Text entering={FadeInUp.delay(400).duration(600)} className="text-[22px] font-tajawal-bold mb-5 tracking-[-0.3px]" style={{ color: textColor }}>
            {"Today's Schedule"}
          </Animated.Text>

          <View className="flex-row flex-wrap gap-3">
            {prayerKeys.map((key, idx) => (
              <PrayerCard
                key={key}
                prayerKey={key}
                nextPrayer={nextPrayer}
                prayerTime={prayerTimes[key]}
                animationDelay={500 + idx * 100}
                hasNotification={
                  notificationSettings?.enabled &&
                  key !== 'sunrise' &&
                  notificationSettings?.prayers[key as keyof typeof notificationSettings.prayers]
                }
                onToggle={() => handleNotificationToggle(key)}
              />
            ))}
          </View>
        </View>

        <RamadanCalendarCard />

        <DailyVerseCard
          verse={dailyVerse}
          isLoading={isLoadingVerse}
          onAudioToggle={handleAudioToggle}
        />

        <DailyHadithCard
          hadith={dailyHadith}
          isLoading={isLoadingHadith}
        />

        <HadithBooksGrid books={books} />

        <BookmarkedHadiths
          bookmarkedHadiths={bookmarkedHadiths}
          onRemove={removeBookmark}
        />
      </ScrollView>
    </ImmersiveOverlay>
  );
}



