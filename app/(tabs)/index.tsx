import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ImageBackground,
  StatusBar,
  Pressable,
} from 'react-native';
import { useLocation } from '@/hooks/useLocation';
import { getPrayerTimesAdhan } from '@/utils/prayer-times';
import { BlurView } from 'expo-blur';
import Animated, {
  FadeInUp,
  FadeInDown,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { Image } from 'expo-image';
import { ImmersiveOverlay } from "@/components/immersive-overlay";
import { useImmersiveOverlay } from "@/components/immersive-overlay/store";

import * as Haptics from 'expo-haptics';

type PrayerKey = 'fajr' | 'sunrise' | 'dhuhr' | 'asr' | 'maghrib' | 'isha';

const AnimatedBlurView = Animated.createAnimatedComponent(BlurView);

const getImmersiveColors = (prayerKey: PrayerKey) => {
  switch (prayerKey) {
    case 'fajr':
      return {
        primary: '#B3E5FC', // Light blue
        secondary: '#0288D1', // Deep sky
        expanding: {
          light: ['#B3E5FC', '#4FC3F7', '#0288D1'],
          dark: ['#0288D1', '#01579B', '#001F3F'],
        },
      };
    case 'sunrise':
      return {
        primary: '#FFE082', // Pale yellow
        secondary: '#FF8F00', // Amber orange
        expanding: {
          light: ['#FFF8E1', '#FFD54F', '#FF8F00'],
          dark: ['#FF8F00', '#EF6C00', '#BF360C'],
        },
      };
    case 'dhuhr':
      return {
        primary: '#FFF176', // Midday sun yellow
        secondary: '#FBC02D', // Rich yellow
        expanding: {
          light: ['#FFF176', '#FFD54F', '#FBC02D'],
          dark: ['#FBC02D', '#F57F17', '#9E7400'],
        },
      };
    case 'asr':
      return {
        primary: '#FFB74D', // Afternoon orange
        secondary: '#F57C00',
        expanding: {
          light: ['#FFE0B2', '#FFB74D', '#F57C00'],
          dark: ['#F57C00', '#E65100', '#8B4513'],
        },
      };
    case 'maghrib':
      return {
        primary: '#E57373', // Sunset red
        secondary: '#C62828',
        expanding: {
          light: ['#FFCDD2', '#E57373', '#C62828'],
          dark: ['#C62828', '#B71C1C', '#7B1FA2'],
        },
      };
    case 'isha':
      return {
        primary: '#7E57C2', // Night purple
        secondary: '#4527A0',
        expanding: {
          light: ['#D1C4E9', '#7E57C2', '#4527A0'],
          dark: ['#4527A0', '#311B92', '#1A237E'],
        },
      };
    default:
      return {
        primary: '#90A4AE',
        secondary: '#455A64',
        expanding: {
          light: ['#CFD8DC', '#90A4AE', '#455A64'],
          dark: ['#455A64', '#263238', '#000'],
        },
      };
  }
};


export default function PrayerTimesScreen() {
  const { loc: location } = useLocation();
  const [prayerTimes, setPrayerTimes] = useState<Record<PrayerKey, Date> | null>(null);
  const [nextPrayer, setNextPrayer] = useState<PrayerKey>('fajr');
  const [timeUntilNext, setTimeUntilNext] = useState<string>('');

  const { dismiss } = useImmersiveOverlay();


  useEffect(() => {
    if (location) calculatePrayerTimes();
  }, [location]);

  useEffect(() => {
    const interval = setInterval(() => {
      prayerTimes && updateNextPrayer();
    }, 1000);
    return () => clearInterval(interval);
  }, [prayerTimes]);

  const calculatePrayerTimes = () => {
    const { latitude: lat, longitude: lng } = location!.coords;
    const today = new Date();
    const timesStr = getPrayerTimesAdhan(lat, lng, 'MuslimWorldLeague', 'Shafi', today);
    const parsed = {} as Record<PrayerKey, Date>;

    (Object.keys(timesStr) as PrayerKey[]).forEach((key) => {
      const [h, m] = timesStr[key].split(':').map(Number);
      parsed[key] = new Date(today.getFullYear(), today.getMonth(), today.getDate(), h, m);
    });

    setPrayerTimes(parsed);
  };

  const updateNextPrayer = () => {
    const now = Date.now();
    const order: PrayerKey[] = ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'];

    for (let p of order) {
      const t = prayerTimes![p].getTime();
      if (t > now) {
        setNextPrayer(p);
        setTimeUntilNext(formatDiff(t - now));
        return;
      }
    }

    const tomorrowFajr = new Date(prayerTimes!.fajr);
    tomorrowFajr.setDate(tomorrowFajr.getDate() + 1);
    setNextPrayer('fajr');
    setTimeUntilNext(formatDiff(tomorrowFajr.getTime() - now));
  };

  const formatDiff = (ms: number) => {
    const h = Math.floor(ms / 3600000);
    const m = Math.floor((ms % 3600000) / 60000);
    const s = Math.floor((ms % 60000) / 1000);
    return `${h.toString().padStart(2, '0')}:${m
      .toString()
      .padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const formatTime = (d: Date) =>
    d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  const getPrayerName = (k: PrayerKey) =>
    ({ fajr: 'Fajr', sunrise: 'Sunrise', dhuhr: 'Dhuhr', asr: 'Asr', maghrib: 'Maghrib', isha: 'Isha' }[k]);

  const getRakats = (k: PrayerKey) => {
    switch (k) {
      case 'fajr': return { fard: 2, sunnah: 2, nafl: 0 };
      case 'dhuhr': return { fard: 4, sunnah: 4, nafl: 2 };
      case 'asr': return { fard: 4, sunnah: 0, nafl: 2 };
      case 'maghrib': return { fard: 3, sunnah: 0, nafl: 2 };
      case 'isha': return { fard: 4, sunnah: 2, nafl: 2 };
      case 'sunrise': return { fard: 0, sunnah: 0, nafl: 0 };
      default: return { fard: 0, sunnah: 0, nafl: 0 };
    }
  };

  const getPrayerDescription = (k: PrayerKey) => {
    const desc: Record<PrayerKey, string> = {
      fajr:
        "Fajr is performed at dawn before sunrise. It includes 2 obligatory rakats and 2 Sunnah mu'akkadah rakats that set a spiritual tone for the day.",
      sunrise: "Sunrise marks the end of Fajr; no prayer is performed at this time.",
      dhuhr:
        "Dhuhr is the midday prayer after the sun passes its zenith. It consists of 4 obligatory rakats, 4 Sunnah before, 2 Sunnah after, and additional voluntary nawafil prayers.",
      asr:
        "Asr is the late afternoon prayer. It has 4 obligatory rakats and follows with voluntary nawafil prayers for extra blessings.",
      maghrib:
        "Maghrib is the sunset prayer performed just after sunset. It includes 3 obligatory rakats and voluntary nawafil prayers.",
      isha:
        "Isha is the night prayer after twilight disappears. It consists of 4 obligatory rakats, 2 Sunnah mu'akkadah rakats, and voluntary nawafil prayers.",
    };
    return desc[k];
  };

  const getCurrentDate = () =>
    new Date().toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

  if (!location || !prayerTimes) {
    return (
      <ImageBackground
        source={require('../../assets/images/bg.png')}
        style={styles.container}
      >
        <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
        <View style={styles.loadingContainer}>
          <BlurView
            intensity={20}
            tint="systemMaterialDark"
            style={styles.loadingCard}
          >
            <Text style={styles.loadingText}>Loading prayer times...</Text>
          </BlurView>
        </View>
      </ImageBackground>
    );
  }

  const prayerKeys = Object.keys(prayerTimes) as PrayerKey[];

  return (
    <ImmersiveOverlay allowDismiss onDismiss={dismiss}>
      <View
        className="font-sans"
        // source={require('../../assets/images/bg.png')}
        style={styles.container}
      >
        <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
        <LinearGradient
          colors={['rgba(0,0,0,0.3)', 'rgba(0,0,0,0.1)', 'rgba(0,0,0,0.4)']}
          style={StyleSheet.absoluteFillObject}
        />
        <ScrollView
          contentInsetAdjustmentBehavior="automatic"
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <Animated.View entering={FadeInDown.duration(600)} style={styles.header}>
            <Text style={styles.headerTitle}>Prayer Times</Text>
            <Text style={styles.headerDate}>{getCurrentDate()}</Text>
          </Animated.View>

          <Animated.View className="shadow-sm" entering={FadeInUp.delay(200).duration(800)} style={styles.heroCard}>
            <BlurView intensity={25} tint="systemUltraThinMaterialDark" style={styles.heroBlur}>
              <View style={styles.heroContent}>
                <Text style={styles.heroLabel}>Next Prayer</Text>
                <View style={styles.heroMain}>
                  <Image
                    source={require(`../../assets/images/prayers/isha.png`)}
                    style={{ height: 150, width: 150 }}
                  />
                  <Text style={styles.heroPrayerName}>{getPrayerName(nextPrayer)}</Text>
                </View>
                <Text style={styles.heroPrayerTime}>{formatTime(prayerTimes[nextPrayer])}</Text>
                <View style={styles.countdownContainer}>
                  <Text style={styles.countdownLabel}>Time remaining</Text>
                  <Text style={styles.countdown}>{timeUntilNext}</Text>
                </View>
              </View>
            </BlurView>
          </Animated.View>

          <View style={styles.gridContainer}>
            <Animated.Text entering={FadeInUp.delay(400).duration(600)} style={styles.gridTitle}>
              Today's Schedule
            </Animated.Text>

            <View style={styles.prayerGrid}>
              {prayerKeys.map((key, idx) => (
                <PrayerCard
                  key={key}
                  prayerKey={key}
                  getRakats={getRakats}
                  nextPrayer={nextPrayer}
                  formatTime={formatTime}
                  prayerTime={prayerTimes[key]}
                  getPrayerName={getPrayerName}
                  animationDelay={500 + idx * 100}
                  getPrayerDescription={getPrayerDescription}
                />
              ))}
            </View>
          </View>
        </ScrollView>
      </View>
    </ImmersiveOverlay>
  );
}

interface PrayerCardProps {
  prayerKey: PrayerKey;
  prayerTime: Date;
  nextPrayer: PrayerKey;
  getPrayerName: (k: PrayerKey) => string;
  getRakats: (k: PrayerKey) => { fard: number; sunnah: number; nafl: number };
  getPrayerDescription: (k: PrayerKey) => string;
  formatTime: (d: Date) => string;
  animationDelay: number;
}

const PrayerCard: React.FC<PrayerCardProps> = ({
                                                 prayerKey,
                                                 prayerTime,
                                                 nextPrayer,
                                                 getPrayerName,
                                                 getRakats,
                                                 getPrayerDescription,
                                                 formatTime,
                                                 animationDelay,
                                               }) => {
  const { fard, sunnah, nafl } = getRakats(prayerKey);
  const { immerse, dismiss } = useImmersiveOverlay();

  const showDetails = () => {
    Haptics.selectionAsync();
    immerse({
      component: (
        <View style={styles.overlayContainer}>
          <BlurView intensity={40} tint="default" style={styles.overlayCard}>
            <View style={styles.overlayHeader}>
              <Text className="font-[Tajawal-Bold]" style={styles.overlayTitle}>{getPrayerName(prayerKey)}</Text>
              <Text style={styles.overlayTime}>{formatTime(prayerTime)}</Text>
            </View>

            {prayerKey !== 'sunrise' && (
              <View style={styles.overlayRakatsContainer}>
                <Text style={styles.overlayRakatsTitle}>Prayer Structure</Text>
                <View style={styles.overlayRakats}>
                  {fard > 0 && (
                    <View style={styles.rakatItem}>
                      <Text className="font-mono" style={styles.rakatNumber}>{fard}</Text>
                      <Text className="font-mono" style={styles.rakatLabel}>Fard</Text>
                    </View>
                  )}
                  {sunnah > 0 && (
                    <View style={styles.rakatItem}>
                      <Text className="font-mono" style={styles.rakatNumber}>{sunnah}</Text>
                      <Text className="font-mono" style={styles.rakatLabel}>Sunnah</Text>
                    </View>
                  )}
                  {nafl > 0 && (
                    <View style={styles.rakatItem}>
                      <Text className="font-mono" style={styles.rakatNumber}>{nafl}</Text>
                      <Text className="font-mono" style={styles.rakatLabel}>Nafl</Text>
                    </View>
                  )}
                </View>
              </View>
            )}

            <View style={styles.overlayDescContainer}>
              {/*<Text style={styles.overlayDescTitle}>About</Text>*/}
              <Text className="font-sans" style={styles.overlayDesc}>{getPrayerDescription(prayerKey)}</Text>
            </View>

            <Pressable onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              dismiss();
            }} style={styles.overlayClose}>
              <BlurView intensity={20} tint="systemMaterialLight" style={styles.overlayCloseBlur}>
                <Text style={styles.overlayCloseText}>Done</Text>
              </BlurView>
            </Pressable>
          </BlurView>
        </View>
      ),
      colors: getImmersiveColors(prayerKey),
    });
  };

  return (
    <Pressable onPress={showDetails}>
      <Animated.View entering={FadeInUp.delay(animationDelay).duration(600)}>
        <AnimatedBlurView
          intensity={20}
          tint="systemUltraThinMaterialDark"
          style={[
            styles.prayerCard,
            prayerKey === nextPrayer && styles.activePrayerCard,
          ]}
        >
          <View style={styles.prayerCardContent}>
            <Text
              style={[
                styles.prayerName,
                prayerKey === nextPrayer && styles.activePrayerText,
              ]}
            >
              {getPrayerName(prayerKey)}
            </Text>
            <Text
              style={[
                styles.prayerTime,
                prayerKey === nextPrayer && styles.activePrayerTime,
              ]}
            >
              {formatTime(prayerTime)}
            </Text>
          </View>
        </AnimatedBlurView>
      </Animated.View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f3d2c' },
  scrollContent: {
    paddingTop: 60,
    paddingBottom: 40,
    paddingHorizontal: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  loadingCard: {
    padding: 40,
    borderRadius: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  loadingText: {
    fontFamily: 'Tajawal-Regular',
    color: 'rgba(255,255,255,0.9)',
    fontSize: 18,
    fontWeight: '500',
  },
  header: { alignItems: 'center', marginBottom: 32 },
  headerTitle: {
    fontSize: 32,
    fontFamily: 'Tajawal-Regular',
    color: 'rgba(255,255,255,0.95)',
    marginBottom: 4,
    letterSpacing: -0.5,
  },
  headerDate: {
    fontSize: 16,
    fontFamily: 'Tajawal-Light',
    color: 'rgba(255,255,255,0.7)',
  },
  heroCard: {
    marginBottom: 40,
    borderRadius: 28,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  heroBlur: { padding: 32 },
  heroContent: { alignItems: 'center' },
  heroLabel: {
    fontSize: 14,
    fontFamily: 'Tajawal-Bold',
    color: 'rgba(255,255,255,0.7)',
    marginBottom: 16,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  heroMain: { alignItems: 'center', marginBottom: 12 },
  heroPrayerName: {
    fontSize: 36,
    fontFamily: 'Tajawal-Bold',
    color: 'rgba(255,255,255,0.95)',
    marginBottom: 8,
    letterSpacing: -1,
  },
  heroPrayerTime: {
    fontSize: 28,
    fontFamily: 'Tajawal-Bold',
    color: 'rgba(255,255,255,0.9)',
    marginBottom: 20,
    fontVariant: ['tabular-nums'],
  },
  countdownContainer: {
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 16,
    // borderWidth: 1,
    // borderColor: 'rgba(255,255,255,0.2)',
  },
  countdownLabel: {
    fontSize: 12,
    fontFamily: 'Tajawal-Bold',
    color: 'rgba(255,255,255,0.7)',
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  countdown: {
    fontSize: 20,
    fontFamily: 'Tajawal-Bold',
    color: 'rgba(255,255,255,0.95)',
    fontVariant: ['tabular-nums'],
  },
  gridContainer: { gap: 16 },
  gridTitle: {
    fontSize: 22,
    fontFamily: 'Tajawal-Bold',
    color: 'rgba(255,255,255,0.9)',
    marginBottom: 20,
    letterSpacing: -0.3,
  },
  prayerGrid: { gap: 16 },
  prayerCard: {
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 5,
  },
  activePrayerCard: {
    borderColor: 'rgba(255,255,255,0.3)',
    shadowOpacity: 0.3,
    shadowRadius: 15,
  },
  prayerCardContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
  },
  prayerName: {
    fontSize: 18,
    fontFamily: 'Tajawal-Medium',
    color: 'rgba(255,255,255,0.85)',
  },
  activePrayerText: {
    fontFamily: 'Tajawal-Bold',
    color: 'rgba(255,255,255,0.95)',
  },
  prayerTime: {
    fontSize: 18,
    fontFamily: 'Tajawal-Light',
    color: 'rgba(255,255,255,0.8)',
    fontVariant: ['tabular-nums'],
  },
  activePrayerTime: {
    fontFamily: 'Tajawal-Bold',
    color: 'rgba(255,255,255,0.95)',
  },
  overlayContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  overlayCard: {
    width: '100%',
    maxWidth: 400,
    borderRadius: 32,
    overflow: 'hidden',
  },
  overlayHeader: {
    alignItems: 'center',
    paddingTop: 40,
    paddingHorizontal: 32,
    paddingBottom: 24,
    borderBottomWidth: 4,
    borderBottomColor: 'rgba(255,255,255,0.08)',
  },
  overlayTitle: {
    fontSize: 40,
    fontFamily: 'Tajawal-Bold',
    color: '#ffffff',
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  overlayTime: {
    fontSize: 18,
    fontFamily: 'Tajawal-Medium',
    color: 'rgba(255,255,255,0.8)',
    fontVariant: ['tabular-nums'],
  },
  overlayRakatsContainer: {
    paddingHorizontal: 32,
    paddingVertical: 24,
  },
  overlayRakatsTitle: {
    fontSize: 14,
    fontFamily: 'Tajawal-Bold',
    marginBottom: 16,
    letterSpacing: 1,
    textAlign: 'center',
    textTransform: 'uppercase',
    color: 'rgba(255,255,255,0.7)',
  },
  overlayRakats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  rakatItem: {
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.08)',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 16,
    minWidth: 80,
  },
  rakatNumber: {
    fontSize: 24,
    fontFamily: 'Tajawal-Bold',
    color: '#ffffff',
    marginBottom: 4,
  },
  rakatLabel: {
    fontSize: 12,
    fontFamily: 'Tajawal-Bold',
    color: 'rgba(255,255,255,0.7)',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  overlayDescContainer: {
    paddingHorizontal: 32,
    paddingVertical: 24,
    borderTopWidth: 4,
    borderTopColor: 'rgba(255,255,255,0.08)',
  },
  overlayDescTitle: {
    fontSize: 14,
    fontFamily: 'Tajawal-Bold',
    color: 'rgba(255,255,255,0.7)',
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  overlayDesc: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 18,
    lineHeight: 22,
    fontFamily: 'Tajawal-Regular',
    textAlign: 'justify',
  },
  overlayClose: {
    margin: 32,
    marginTop: 24,
    borderRadius: 20,
    overflow: 'hidden',
  },
  overlayCloseBlur: {
    paddingVertical: 16,
    paddingHorizontal: 32,
    alignItems: 'center',
  },
  overlayCloseText: {
    fontSize: 16,
    fontFamily: 'Tajawal-Bold',
    color: '#fff',
  },
});

