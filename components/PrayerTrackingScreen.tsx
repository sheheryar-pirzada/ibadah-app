import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  Dimensions,
  ScrollView,
  StyleSheet,
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
      <View style={styles.container}>
        <BlurView intensity={20} tint="systemMaterialDark" style={styles.loadingCard}>
          <Text style={styles.loadingText}>Loading prayer tracking...</Text>
        </BlurView>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['rgba(0,0,0,0.3)', 'rgba(0,0,0,0.1)', 'rgba(0,0,0,0.4)']}
        style={StyleSheet.absoluteFillObject}
      />
      
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <Animated.View entering={FadeInDown.duration(600)} style={styles.header}>
          <TouchableOpacity onPress={onBack} style={styles.backButton}>
            <IconSymbol name="chevron.left" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Prayer Tracking</Text>
          <View style={styles.headerSpacer} />
        </Animated.View>

        {/* Overall Stats Card */}
        <Animated.View entering={FadeInUp.delay(200).duration(800)} style={styles.statsCard}>
          <BlurView intensity={25} tint="systemUltraThinMaterialDark" style={styles.statsBlur}>
            <View style={styles.statsHeader}>
              <Text style={styles.statsTitle}>Your Progress</Text>
              <TouchableOpacity
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  setShowAnalytics(true);
                }}
                style={styles.analyticsButton}
              >
                <IconSymbol name="chart.bar.fill" size={20} color="#d4af37" />
              </TouchableOpacity>
            </View>
            
            {overallStats && (
              <View style={styles.statsGrid}>
                <View style={styles.statItem}>
                  <Animated.Text style={[styles.statNumber, animatedStreakStyle]}>
                    {overallStats.currentStreak}
                  </Animated.Text>
                  <Text style={styles.statLabel}>Day Streak</Text>
                </View>
                
                <View style={styles.statItem}>
                  <Text style={styles.statNumber}>{overallStats.longestStreak}</Text>
                  <Text style={styles.statLabel}>Best Streak</Text>
                </View>
                
                <View style={styles.statItem}>
                  <Text style={styles.statNumber}>{Math.round(overallStats.completionRate)}%</Text>
                  <Text style={styles.statLabel}>Completion</Text>
                </View>
              </View>
            )}
          </BlurView>
        </Animated.View>

        {/* Today's Prayers */}
        <Animated.View entering={FadeInUp.delay(400).duration(800)} style={styles.todayCard}>
          <BlurView intensity={25} tint="systemUltraThinMaterialDark" style={styles.todayBlur}>
            <Text style={styles.todayTitle}>Today's Prayers</Text>
            <Text style={styles.todayDate}>{formatDisplayDate(selectedDate)}</Text>
            
            {/* Progress Bar */}
            <View style={styles.progressContainer}>
              <View style={styles.progressBar}>
                <Animated.View style={[styles.progressFill, animatedProgressStyle]} />
              </View>
              <Text style={styles.progressText}>
                {todayStats?.completedCount || 0} of 5 prayers completed
              </Text>
            </View>

            {/* Prayer Checkboxes */}
            <View style={styles.prayerList}>
              {(['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'] as PrayerKey[]).map((prayer, index) => (
                <Animated.View
                  key={prayer}
                  entering={FadeInUp.delay(600 + index * 100).duration(600)}
                >
                  <TouchableOpacity
                    style={styles.prayerItem}
                    onPress={() => togglePrayer(prayer)}
                    activeOpacity={0.7}
                  >
                    <View style={styles.prayerInfo}>
                      <IconSymbol
                        name={getPrayerIcon(prayer) as any}
                        size={20}
                        color={todayStats?.prayers[prayer] ? '#d4af37' : '#fff'}
                      />
                      <Text style={[
                        styles.prayerName,
                        todayStats?.prayers[prayer] && styles.completedPrayerName
                      ]}>
                        {getPrayerName(prayer)}
                      </Text>
                    </View>
                    
                    <View style={[
                      styles.checkbox,
                      todayStats?.prayers[prayer] && styles.checkedCheckbox
                    ]}>
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
        <Animated.View entering={FadeInUp.delay(800).duration(800)} style={styles.actionsCard}>
          <BlurView intensity={25} tint="systemUltraThinMaterialDark" style={styles.actionsBlur}>
            <Text style={styles.actionsTitle}>Quick Actions</Text>
            
            <View style={styles.actionButtons}>
              <TouchableOpacity
                style={styles.actionButton}
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
                <Text style={styles.actionButtonText}>Mark All Complete</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.actionButton}
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
                <Text style={styles.actionButtonText}>Reset Today</Text>
              </TouchableOpacity>
            </View>
          </BlurView>
        </Animated.View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f3d2c',
  },
  scrollContent: {
    paddingTop: 60,
    paddingBottom: 40,
    paddingHorizontal: 20,
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
    borderColor: 'rgba(255,255,255,0.1)',
  },
  loadingText: {
    fontFamily: 'Tajawal-Regular',
    color: 'rgba(255,255,255,0.9)',
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
    borderRadius: 20,
    borderCurve: 'continuous',
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  headerTitle: {
    flex: 1,
    fontSize: 28,
    fontFamily: 'Tajawal-Bold',
    color: 'rgba(255,255,255,0.95)',
    textAlign: 'center',
    marginHorizontal: 16,
  },
  headerSpacer: {
    width: 40,
  },
  statsCard: {
    marginBottom: 24,
    borderRadius: 24,
    borderCurve: 'continuous',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
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
    color: 'rgba(255,255,255,0.9)',
  },
  analyticsButton: {
    padding: 8,
    borderRadius: 16,
    borderCurve: 'continuous',
    backgroundColor: 'rgba(212,175,55,0.1)',
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
    color: '#d4af37',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    fontFamily: 'Tajawal-Medium',
    color: 'rgba(255,255,255,0.7)',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  todayCard: {
    marginBottom: 24,
    borderRadius: 24,
    borderCurve: 'continuous',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
  },
  todayBlur: {
    padding: 24,
  },
  todayTitle: {
    fontSize: 20,
    fontFamily: 'Tajawal-Bold',
    color: 'rgba(255,255,255,0.9)',
    marginBottom: 8,
  },
  todayDate: {
    fontSize: 14,
    fontFamily: 'Tajawal-Regular',
    color: 'rgba(255,255,255,0.7)',
    marginBottom: 20,
  },
  progressContainer: {
    marginBottom: 24,
  },
  progressBar: {
    height: 8,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 4,
    borderCurve: 'continuous',
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#d4af37',
    borderRadius: 4,
    borderCurve: 'continuous',
  },
  progressText: {
    fontSize: 12,
    fontFamily: 'Tajawal-Medium',
    color: 'rgba(255,255,255,0.7)',
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
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 12,
    borderCurve: 'continuous',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  prayerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  prayerName: {
    fontSize: 16,
    fontFamily: 'Tajawal-Medium',
    color: 'rgba(255,255,255,0.9)',
  },
  completedPrayerName: {
    color: '#d4af37',
    fontFamily: 'Tajawal-Bold',
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderCurve: 'continuous',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkedCheckbox: {
    backgroundColor: '#d4af37',
    borderColor: '#d4af37',
  },
  actionsCard: {
    borderRadius: 24,
    borderCurve: 'continuous',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
  },
  actionsBlur: {
    padding: 24,
  },
  actionsTitle: {
    fontSize: 18,
    fontFamily: 'Tajawal-Bold',
    color: 'rgba(255,255,255,0.9)',
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
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 12,
    borderCurve: 'continuous',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  actionButtonText: {
    fontSize: 16,
    fontFamily: 'Tajawal-Medium',
    color: 'rgba(255,255,255,0.9)',
  },
}); 