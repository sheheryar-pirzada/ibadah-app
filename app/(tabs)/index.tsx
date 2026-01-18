import DailyVerseCard from '@/components/DailyVerseCard';
import { ImmersiveOverlay } from "@/components/immersive-overlay";
import { useImmersiveOverlay } from "@/components/immersive-overlay/store";
import { SettingsHeaderButton } from '@/components/SettingsHeaderButton';
import { ThemedBlurView } from '@/components/ThemedBlurView';
import { ThemedStatusBar } from '@/components/ThemedStatusBar';
import { useTheme } from '@/contexts/ThemeContext';
import { useLocation } from '@/hooks/useLocation';
import { useThemeColor } from '@/hooks/useThemeColor';
import { homeStyles as styles } from '@/styles/home';
import {
  createPrayerTimes,
  getNextPrayer,
  getTimeForPrayer,
  prayerToKey
} from '@/utils/prayer-times';
import { prayerTracker } from '@/utils/prayer-tracking';
import {
  formatPrayerTime,
  formatTimeDiff,
  getCurrentDateString,
  getImmersiveColors,
  getIslamicDateString,
  getPrayerDescription,
  getPrayerName,
  getRakats,
  PrayerKey,
} from '@/utils/prayer-ui';
import { QuranVerse, quranVerseManager } from '@/utils/quran-verse';
import { PrayerTimes } from 'adhan';
import { GlassView, isLiquidGlassAvailable } from 'expo-glass-effect';
import * as Haptics from 'expo-haptics';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View
} from 'react-native';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';

const AnimatedBlurView = Animated.createAnimatedComponent(ThemedBlurView);

export default function PrayerTimesScreen() {
  const { resolvedTheme } = useTheme();
  const { loc: location } = useLocation();
  const [prayerTimes, setPrayerTimes] = useState<Record<PrayerKey, Date> | null>(null);
  const [prayerTimesObj, setPrayerTimesObj] = useState<PrayerTimes | null>(null);
  const [nextPrayer, setNextPrayer] = useState<PrayerKey>('fajr');
  const [timeUntilNext, setTimeUntilNext] = useState<string>('');
  const [dailyVerse, setDailyVerse] = useState<QuranVerse | null>(null);
  const [isLoadingVerse, setIsLoadingVerse] = useState(true);

  const { dismiss } = useImmersiveOverlay();

  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const textMuted = useThemeColor({}, 'textMuted');
  const accentColor = useThemeColor({}, 'accent');
  const cardBorder = useThemeColor({}, 'cardBorder');

  const gradientColors = resolvedTheme === 'dark'
    ? (['rgba(0,0,0,0.3)', 'rgba(0,0,0,0.1)', 'rgba(0,0,0,0.4)'] as const)
    : (['rgba(255,255,255,0.1)', 'rgba(255,255,255,0.05)', 'rgba(255,255,255,0.15)'] as const);

  const calculatePrayerTimes = useCallback(async () => {
    const { latitude: lat, longitude: lng } = location!.coords;
    const today = new Date();

    try {
      const timesObj = await createPrayerTimes(lat, lng, undefined, undefined, today);
      setPrayerTimesObj(timesObj);

      // Use Date objects directly from adhan to avoid timezone issues
      const parsed: Record<PrayerKey, Date> = {
        fajr: timesObj.fajr,
        sunrise: timesObj.sunrise,
        dhuhr: timesObj.dhuhr,
        asr: timesObj.asr,
        maghrib: timesObj.maghrib,
        isha: timesObj.isha,
      };

      setPrayerTimes(parsed);

      await prayerTracker.initialize();
      await prayerTracker.createPrayerRecords(today, parsed);
    } catch (error) {
      console.error('Error calculating prayer times:', error);
    }
  }, [location]);

  useEffect(() => {
    if (location) calculatePrayerTimes();
    loadDailyVerse();
  }, [location, calculatePrayerTimes]);

  useFocusEffect(
    useCallback(() => {
      if (location) {
        calculatePrayerTimes();
      }
    }, [location, calculatePrayerTimes])
  );

  const loadDailyVerse = async () => {
    try {
      setIsLoadingVerse(true);
      await quranVerseManager.initialize();
      const verse = await quranVerseManager.getDailyVerse();
      setDailyVerse(verse);
    } catch (error) {
      console.error('Error loading daily verse:', error);
    } finally {
      setIsLoadingVerse(false);
    }
  };

  useEffect(() => {
    const interval = setInterval(() => {
      if (prayerTimesObj) {
        updateNextPrayer().catch(console.error);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [prayerTimesObj, location]);

  const updateNextPrayer = async () => {
    if (!prayerTimesObj || !location) return;

    const now = new Date();
    const nextPrayerEnum = getNextPrayer(prayerTimesObj, now);
    const nextPrayerKey = prayerToKey(nextPrayerEnum);

    if (nextPrayerKey) {
      const nextPrayerTime = getTimeForPrayer(prayerTimesObj, nextPrayerEnum);
      if (nextPrayerTime) {
        setNextPrayer(nextPrayerKey);
        const diff = nextPrayerTime.getTime() - now.getTime();
        setTimeUntilNext(formatTimeDiff(diff > 0 ? diff : 0));
      }
    } else {
      const tomorrow = new Date(now);
      tomorrow.setDate(tomorrow.getDate() + 1);
      try {
        const tomorrowTimes = await createPrayerTimes(
          location.coords.latitude,
          location.coords.longitude,
          undefined,
          undefined,
          tomorrow
        );
        const tomorrowFajr = tomorrowTimes.fajr;
        setNextPrayer('fajr');
        const diff = tomorrowFajr.getTime() - now.getTime();
        setTimeUntilNext(formatTimeDiff(diff > 0 ? diff : 0));
      } catch (error) {
        console.error('Error calculating tomorrow prayer times:', error);
      }
    }
  };

  if (!location || !prayerTimes) {
    return (
      <View style={[styles.container, { backgroundColor }]}>
        <ThemedStatusBar />
        <LinearGradient
          colors={gradientColors}
          style={StyleSheet.absoluteFillObject}
        />
        <View style={styles.loadingContainer}>
          <ThemedBlurView
            intensity={25}
            style={[styles.loadingCard, { borderColor: cardBorder }]}
          >
            <ActivityIndicator size="large" color={accentColor} style={styles.loadingSpinner} />
            <Text style={[styles.loadingText, { color: textColor }]}>Loading prayer times...</Text>
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
        style={StyleSheet.absoluteFillObject}
      />
      <ScrollView
        className="font-sans"
        style={[styles.container, { backgroundColor }]}
        contentInsetAdjustmentBehavior="automatic"
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View entering={FadeInDown.duration(600)} style={styles.header}>
          <View style={styles.headerRow}>
            <View style={{ width: 24 }} />
            <Text style={[styles.headerTitle, { color: textColor, marginBottom: 0 }]}>Prayer Times</Text>
            <SettingsHeaderButton />
          </View>
          <Text style={[styles.headerDate, { color: textMuted }]}>{getCurrentDateString()}</Text>
          <Text style={[styles.headerDate, { color: textMuted, fontSize: 14, marginTop: 2 }]}>{getIslamicDateString()}</Text>
        </Animated.View>

        <Animated.View className="shadow-sm" entering={FadeInUp.delay(200).duration(800)} style={[styles.heroCard, { borderColor: cardBorder }]}>
          <ThemedBlurView intensity={25} style={styles.heroBlur}>
            <View style={styles.heroContent}>
              <Text style={[styles.heroLabel, { color: textMuted }]}>Next Prayer</Text>
              <View style={styles.heroMain}>
                <Image
                  source={require(`../../assets/images/prayers/isha.png`)}
                  style={{ height: 150, width: 150 }}
                />
                <Text style={[styles.heroPrayerName, { color: textColor }]}>{getPrayerName(nextPrayer)}</Text>
              </View>
              <Text style={[styles.heroPrayerTime, { color: textColor }]}>{formatPrayerTime(prayerTimes[nextPrayer])}</Text>
              {isLiquidGlassAvailable() ? (
                <GlassView glassEffectStyle={resolvedTheme === 'dark' ? 'clear' : 'regular'} isInteractive={true} style={styles.countdownContainer}>
                  <Text style={[styles.countdownLabel, { color: textMuted }]}>Time remaining</Text>
                  <Text style={[styles.countdown, { color: textColor }]}>{timeUntilNext}</Text>
                </GlassView>
              ) : (
                <View style={[styles.countdownContainer, { backgroundColor: resolvedTheme === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(4,99,7,0.1)' }]}>
                  <Text style={[styles.countdownLabel, { color: textMuted }]}>Time remaining</Text>
                  <Text style={[styles.countdown, { color: textColor }]}>{timeUntilNext}</Text>
                </View>
              )}
            </View>
          </ThemedBlurView>
        </Animated.View>

        <DailyVerseCard
          verse={dailyVerse}
          isLoading={isLoadingVerse}
        />

        <View style={styles.gridContainer}>
          <Animated.Text entering={FadeInUp.delay(400).duration(600)} style={[styles.gridTitle, { color: textColor }]}>
            Today's Schedule
          </Animated.Text>

          <View style={styles.prayerGrid}>
            {prayerKeys.map((key, idx) => (
              <PrayerCard
                key={key}
                prayerKey={key}
                nextPrayer={nextPrayer}
                prayerTime={prayerTimes[key]}
                animationDelay={500 + idx * 100}
              />
            ))}
          </View>
        </View>
      </ScrollView>
    </ImmersiveOverlay>
  );
}

interface PrayerCardProps {
  prayerKey: PrayerKey;
  prayerTime: Date;
  nextPrayer: PrayerKey;
  animationDelay: number;
}

const PrayerCard: React.FC<PrayerCardProps> = ({
  prayerKey,
  prayerTime,
  nextPrayer,
  animationDelay,
}) => {
  const { resolvedTheme } = useTheme();
  const { fard, sunnah, nafl } = getRakats(prayerKey);
  const { immerse, dismiss } = useImmersiveOverlay();

  const textColor = useThemeColor({}, 'text');
  const textSecondary = useThemeColor({}, 'textSecondary');
  const textMuted = useThemeColor({}, 'textMuted');
  const accentColor = useThemeColor({}, 'accent');
  const borderColor = useThemeColor({}, 'border');
  const dividerColor = useThemeColor({}, 'divider');

  const showDetails = () => {
    Haptics.selectionAsync();
    const immersiveColors = getImmersiveColors(prayerKey);
    const cardBackground = resolvedTheme === 'light' ? 'rgba(255,255,255,0.45)' : undefined;
    const cardBorderColor = resolvedTheme === 'light' ? 'rgba(4,99,7,0.25)' : 'rgba(255,255,255,0.15)';
    immerse({
      component: (
        <View style={styles.overlayContainer}>
          <ThemedBlurView
            intensity={resolvedTheme === 'light' ? 60 : 40}
            style={[
              styles.overlayCard,
              {
                backgroundColor: cardBackground,
                borderWidth: 1,
                borderColor: cardBorderColor,
              }
            ]}
          >
            <View style={[styles.overlayHeader, { borderBottomColor: dividerColor }]}>
              <Text className="font-[Tajawal-Bold]" style={[styles.overlayTitle, { color: textColor }]}>{getPrayerName(prayerKey)}</Text>
              <Text style={[styles.overlayTime, { color: textSecondary }]}>{formatPrayerTime(prayerTime)}</Text>
            </View>

            {prayerKey !== 'sunrise' && (
              <View style={styles.overlayRakatsContainer}>
                <Text style={[styles.overlayRakatsTitle, { color: textMuted }]}>Prayer Structure</Text>
                <View style={styles.overlayRakats}>
                  {fard > 0 && (
                    <View style={[styles.rakatItem, { backgroundColor: resolvedTheme === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(4,99,7,0.08)' }]}>
                      <Text className="font-mono" style={[styles.rakatNumber, { color: textColor }]}>{fard}</Text>
                      <Text className="font-mono" style={[styles.rakatLabel, { color: textMuted }]}>Fard</Text>
                    </View>
                  )}
                  {sunnah > 0 && (
                    <View style={[styles.rakatItem, { backgroundColor: resolvedTheme === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(4,99,7,0.08)' }]}>
                      <Text className="font-mono" style={[styles.rakatNumber, { color: textColor }]}>{sunnah}</Text>
                      <Text className="font-mono" style={[styles.rakatLabel, { color: textMuted }]}>Sunnah</Text>
                    </View>
                  )}
                  {nafl > 0 && (
                    <View style={[styles.rakatItem, { backgroundColor: resolvedTheme === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(4,99,7,0.08)' }]}>
                      <Text className="font-mono" style={[styles.rakatNumber, { color: textColor }]}>{nafl}</Text>
                      <Text className="font-mono" style={[styles.rakatLabel, { color: textMuted }]}>Nafl</Text>
                    </View>
                  )}
                </View>
              </View>
            )}

            <View style={[styles.overlayDescContainer, { borderTopColor: dividerColor }]}>
              <Text className="font-sans" style={[styles.overlayDesc, { color: textSecondary }]}>{getPrayerDescription(prayerKey)}</Text>
            </View>

            <Pressable onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              dismiss();
            }} style={styles.overlayClose}>
              <ThemedBlurView
                intensity={resolvedTheme === 'light' ? 40 : 20}
                style={[
                  styles.overlayCloseBlur,
                  resolvedTheme === 'light' && {
                    backgroundColor: 'rgba(4,99,7,0.12)',
                  }
                ]}
              >
                <Text style={[styles.overlayCloseText, { color: accentColor }]}>Done</Text>
              </ThemedBlurView>
            </Pressable>
          </ThemedBlurView>
        </View>
      ),
      colors: immersiveColors,
    });
  };

  const isActive = prayerKey === nextPrayer;

  return (
    <Pressable onPress={showDetails}>
      <Animated.View entering={FadeInUp.delay(animationDelay).duration(600)}>
        <AnimatedBlurView
          intensity={20}
          style={[
            styles.prayerCard,
            { borderColor: isActive ? accentColor : borderColor },
          ]}
        >
          <View style={styles.prayerCardContent}>
            <Text
              style={[
                styles.prayerName,
                { color: textColor },
                isActive && { fontFamily: 'Tajawal-Bold', color: textColor },
              ]}
            >
              {getPrayerName(prayerKey)}
            </Text>
            <Text
              style={[
                styles.prayerTime,
                { color: textSecondary },
                isActive && { fontFamily: 'Tajawal-Bold', color: textColor },
              ]}
            >
              {formatPrayerTime(prayerTime)}
            </Text>
          </View>
        </AnimatedBlurView>
      </Animated.View>
    </Pressable>
  );
};
