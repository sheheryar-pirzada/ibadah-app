import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View
} from 'react-native';

import { useTheme } from '@/contexts/ThemeContext';
import { useLocation } from '@/hooks/useLocation';
import { useThemeColor } from '@/hooks/useThemeColor';
import { notificationService } from '@/utils/notification-service';
import {
  getNotificationSettings,
  updatePrayerToggle,
  type PrayerKey,
} from '@/utils/notification-settings';

const PRAYER_OPTIONS: Array<{ key: PrayerKey; name: string; description: string }> = [
  { key: 'fajr', name: 'Fajr', description: 'Dawn prayer' },
  { key: 'dhuhr', name: 'Dhuhr', description: 'Midday prayer' },
  { key: 'asr', name: 'Asr', description: 'Afternoon prayer' },
  { key: 'maghrib', name: 'Maghrib', description: 'Sunset prayer' },
  { key: 'isha', name: 'Isha', description: 'Night prayer' },
];

export default function PrayerNotificationsScreen() {
  const router = useRouter();
  const { resolvedTheme } = useTheme();
  const { loc } = useLocation();
  const isDark = resolvedTheme === 'dark';

  // Theme colors
  const textColor = useThemeColor({}, 'text');
  const textMuted = useThemeColor({}, 'textMuted');
  const backgroundColor = useThemeColor({}, 'background');

  const [prayerSettings, setPrayerSettings] = useState({
    fajr: true,
    dhuhr: true,
    asr: true,
    maghrib: true,
    isha: true,
  });

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const settings = await getNotificationSettings();
      setPrayerSettings(settings.prayers);
    } catch (error) {
      console.error('Error loading notification settings:', error);
    }
  };

  const handlePrayerToggle = async (prayer: PrayerKey, value: boolean) => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft);
      await updatePrayerToggle(prayer, value);
      setPrayerSettings((prev) => ({ ...prev, [prayer]: value }));

      // Reschedule notifications if master toggle is on and location available
      const settings = await getNotificationSettings();
      if (settings.enabled && loc) {
        const { latitude, longitude } = loc.coords;
        await notificationService.rescheduleAll(latitude, longitude);
      }
    } catch (error) {
      console.error('Error updating prayer toggle:', error);
    }
  };

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor }}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      <Text style={[styles.title, { color: textColor }]}>
        Select Prayers
      </Text>

      <Text style={[styles.subtitle, { color: textMuted }]}>
        Choose which prayers you want to be notified about
      </Text>

      <View style={styles.optionsList}>
        {PRAYER_OPTIONS.map((prayer) => {
          const isEnabled = prayerSettings[prayer.key];
          return (
            <View
              key={prayer.key}
              style={[
                styles.optionItem,
                {
                  backgroundColor: isEnabled
                    ? isDark
                      ? 'rgba(212,175,55,0.15)'
                      : 'rgba(212,175,55,0.1)'
                    : 'transparent',
                },
              ]}
            >
              <View style={styles.optionContent}>
                <Text style={[styles.optionText, { color: textColor }]}>
                  {prayer.name}
                </Text>
                <Text style={[styles.optionStyle, { color: textMuted }]}>
                  {prayer.description}
                </Text>
              </View>
              <Switch
                value={isEnabled}
                onValueChange={(value) => handlePrayerToggle(prayer.key, value)}
                trackColor={{
                  false: isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)',
                  true: '#d4af37',
                }}
                thumbColor={isEnabled ? '#ffffff' : isDark ? 'rgba(255,255,255,0.9)' : '#f4f3f4'}
              />
            </View>
          );
        })}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    paddingBottom: 40,
    paddingTop: 24,
    paddingHorizontal: 24,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 8,
    fontFamily: 'Tajawal-Bold',
  },
  subtitle: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 24,
    fontFamily: 'Tajawal-Regular',
  },
  optionsList: {
    marginTop: 8,
  },
  optionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderRadius: 20,
    marginBottom: 8,
    borderCurve: 'continuous',
  },
  optionContent: {
    flex: 1,
  },
  optionText: {
    fontSize: 17,
    fontFamily: 'Tajawal-Medium',
  },
  optionStyle: {
    fontSize: 13,
    fontFamily: 'Tajawal-Regular',
    marginTop: 2,
  },
});
