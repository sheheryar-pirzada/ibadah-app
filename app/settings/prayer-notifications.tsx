import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ScrollView,
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
      className="px-6 pt-6 pb-10"
      showsVerticalScrollIndicator={false}
    >
      <Text className="text-xl text-center mb-2 font-tajawal-bold" style={{ color: textColor }}>
        Select Prayers
      </Text>

      <Text className="text-sm text-center mb-6 font-sans" style={{ color: textMuted }}>
        Choose which prayers you want to be notified about
      </Text>

      <View className="mt-2">
        {PRAYER_OPTIONS.map((prayer) => {
          const isEnabled = prayerSettings[prayer.key];
          return (
            <View
              key={prayer.key}
              className="flex-row justify-between items-center px-5 py-4 rounded-[20px] mb-2"
              style={[
                {
                  borderCurve: 'continuous',
                  backgroundColor: isEnabled
                    ? isDark
                      ? 'rgba(212,175,55,0.15)'
                      : 'rgba(212,175,55,0.1)'
                    : 'transparent',
                },
              ]}
            >
              <View className="flex-1">
                <Text className="text-[17px] font-tajawal-medium" style={{ color: textColor }}>
                  {prayer.name}
                </Text>
                <Text className="text-[13px] font-sans mt-0.5" style={{ color: textMuted }}>
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
