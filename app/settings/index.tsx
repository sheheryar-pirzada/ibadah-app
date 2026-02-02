import * as Haptics from 'expo-haptics';
import { Link, useFocusEffect } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import {
  Pressable,
  ScrollView,
  Switch,
  Text,
  View,
} from 'react-native';

import { useTheme } from '@/contexts/ThemeContext';
import { useLocation } from '@/hooks/useLocation';
import { useThemeColor } from '@/hooks/useThemeColor';
import { notificationService } from '@/utils/notification-service';
import {
  getNotificationSettings,
  updateDuaToggle,
  updateNotificationEnabled,
  updateRemindersEnabled,
} from '@/utils/notification-settings';
import {
  getCalculationMethodOptions,
  getMadhabOptions,
  getPrayerSettings,
  type CalculationMethodKey,
  type MadhabKey,
} from '@/utils/prayer-settings';
import {
  getReciterDisplayName,
  getReciterSettings,
} from '@/utils/reciter-settings';
import { useHadithSettings } from '@/utils/hadith-settings';

export default function SettingsScreen() {
  const { themeMode, setThemeMode, resolvedTheme } = useTheme();
  const { loc } = useLocation();
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [duasEnabled, setDuasEnabled] = useState(true);
  const [remindersEnabled, setRemindersEnabled] = useState(false);
  const [hasPermission, setHasPermission] = useState(false);
  const [calculationMethod, setCalculationMethod] = useState<CalculationMethodKey>('MuslimWorldLeague');
  const [madhab, setMadhab] = useState<MadhabKey>('Shafi');
  const [reciterName, setReciterName] = useState<string>("Mishari Rashid al-`Afasy");
  const [reciterStyle, setReciterStyle] = useState<string | null>(null);
  const { selectedBook: selectedHadithBook } = useHadithSettings();

  const backgroundColor = useThemeColor({}, 'background');
  const cardBackground = useThemeColor({}, 'cardBackground');
  const cardBorder = useThemeColor({}, 'cardBorder');
  const textColor = useThemeColor({}, 'text');
  const textMuted = useThemeColor({}, 'textMuted');
  const accentColor = useThemeColor({}, 'accent');
  // Better track colors for visibility - use darker colors for false state in dark mode
  const trackColorFalse = resolvedTheme === 'dark' ? 'rgba(255,255,255,0.2)' : 'rgba(4,99,7,0.2)';
  const trackColorTrue = resolvedTheme === 'dark' ? accentColor : accentColor;

  const isDarkMode = resolvedTheme === 'dark';
  const isSystemMode = themeMode === 'system';

  useEffect(() => {
    loadSettings();
  }, []);

  // Reload settings when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      loadSettings();
    }, [])
  );

  const loadSettings = async () => {
    try {
      const prayerSettings = await getPrayerSettings();
      setCalculationMethod(prayerSettings.calculationMethod);
      setMadhab(prayerSettings.madhab);

      const notificationSettings = await getNotificationSettings();
      setNotificationsEnabled(notificationSettings.enabled);
      setDuasEnabled(notificationSettings.duas);
      setRemindersEnabled(notificationSettings.reminders?.enabled ?? false);

      const permissionStatus = await notificationService.hasPermissions();
      setHasPermission(permissionStatus);

      const reciterSettings = await getReciterSettings();
      setReciterName(reciterSettings.reciterName);
      setReciterStyle(reciterSettings.reciterStyle);
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  };

  const handleThemeModeChange = (value: boolean) => {
    // If turning on, use dark mode directly (not system)
    // If turning off, check if we're in system mode - if so, switch to light, otherwise use system
    if (value) {
      setThemeMode('dark');
    } else {
      // If currently dark and not system, switch to light
      // If currently system, switch to light
      setThemeMode('light');
    }
  };

  const handleNotificationToggle = async (value: boolean) => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

      if (value) {
        // Request permissions first
        const granted = await notificationService.requestPermissions();
        if (!granted) {
          // Permission denied, don't enable
          return;
        }
        setHasPermission(true);
      }

      await updateNotificationEnabled(value);
      setNotificationsEnabled(value);

      // Reschedule notifications if enabled and location available
      if (value && loc) {
        const { latitude, longitude } = loc.coords;
        await notificationService.rescheduleAll(latitude, longitude);
      } else if (!value) {
        // Cancel all notifications if disabled
        await notificationService.cancelAllNotifications();
      }
    } catch (error) {
      console.error('Error toggling notifications:', error);
    }
  };

  const handleDuaToggle = async (value: boolean) => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      await updateDuaToggle(value);
      setDuasEnabled(value);

      // Reschedule notifications if master toggle is on and location available
      if (notificationsEnabled && loc) {
        const { latitude, longitude } = loc.coords;
        await notificationService.rescheduleAll(latitude, longitude);
      }
    } catch (error) {
      console.error('Error toggling dua notifications:', error);
    }
  };

  const handleRemindersToggle = async (value: boolean) => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      await updateRemindersEnabled(value);
      setRemindersEnabled(value);

      // Reschedule notifications if master toggle is on and location available
      if (notificationsEnabled && loc) {
        const { latitude, longitude } = loc.coords;
        await notificationService.rescheduleAll(latitude, longitude);
      }
    } catch (error) {
      console.error('Error toggling reminder notifications:', error);
    }
  };

  const handleDebugPrayerNotification = async () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      await notificationService.scheduleTestPrayerNotification(10);
    } catch (error) {
      console.error('Error scheduling debug prayer notification:', error);
    }
  };

  return (
    <>
      <ScrollView
        contentInsetAdjustmentBehavior='automatic'
        className="flex-1"
        style={{ backgroundColor }}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 30, paddingTop: 24 }}
      >
        <View
          className="rounded-3xl mb-4 overflow-hidden"
          style={{ backgroundColor: cardBackground, borderColor: cardBorder, borderCurve: 'continuous', borderWidth: 0.5 }}
        >
          <View className="flex-row justify-between items-center px-5 py-4">
            <View className="flex-1 justify-center">
              <Text style={{ color: textColor, fontFamily: 'Tajawal-Medium', fontSize: 18 }}>
                Dark Mode
              </Text>
              {isSystemMode && (
                <Text className="mt-0.5" style={{ color: textMuted, fontFamily: 'Tajawal-Regular', fontSize: 12 }}>
                  Using system
                </Text>
              )}
            </View>
            <Switch
              value={isDarkMode}
              onValueChange={handleThemeModeChange}
              trackColor={{ false: trackColorFalse, true: trackColorTrue }}
              thumbColor={isDarkMode ? '#ffffff' : resolvedTheme === 'light' ? '#f4f3f4' : 'rgba(255,255,255,0.9)'}
            />
          </View>
        </View>

        <View
          className="rounded-3xl mb-4 overflow-hidden"
          style={{ backgroundColor: cardBackground, borderColor: cardBorder, borderCurve: 'continuous', borderWidth: 0.5 }}
        >
          <View className="flex-row justify-between items-center px-5 py-4">
            <View className="flex-1 justify-center">
              <Text style={{ color: textColor, fontFamily: 'Tajawal-Medium', fontSize: 18 }}>
                Prayer Notifications
              </Text>
              {!hasPermission && notificationsEnabled && (
                <Text className="mt-0.5" style={{ color: textMuted, fontFamily: 'Tajawal-Regular', fontSize: 12 }}>
                  Permission required
                </Text>
              )}
            </View>
            <Switch
              value={notificationsEnabled}
              onValueChange={handleNotificationToggle}
              trackColor={{ false: trackColorFalse, true: trackColorTrue }}
              thumbColor={notificationsEnabled ? '#ffffff' : resolvedTheme === 'dark' ? 'rgba(255,255,255,0.9)' : '#f4f3f4'}
            />
          </View>

          {notificationsEnabled && (
            <>
              <View className="h-px mx-5 opacity-30" style={{ backgroundColor: cardBorder }} />
              <Link href="/settings/prayer-notifications" asChild>
                <Pressable
                  className="flex-row justify-between items-center px-5 py-4"
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  }}
                >
                  <View className="flex-1 justify-center">
                    <Text style={{ color: textColor, fontFamily: 'Tajawal-Medium', fontSize: 18 }}>
                      Select Prayers
                    </Text>
                    <Text className="mt-0.5" style={{ color: accentColor, fontFamily: 'Tajawal-Regular', fontSize: 12 }}>
                      Choose which prayers to notify
                    </Text>
                  </View>
                </Pressable>
              </Link>
              <View className="h-px mx-5 opacity-30" style={{ backgroundColor: cardBorder }} />
              <View className="flex-row justify-between items-center px-5 py-4">
                <View className="flex-1 justify-center">
                  <Text style={{ color: textColor, fontFamily: 'Tajawal-Medium', fontSize: 18 }}>
                    Prayer Time Reminders
                  </Text>
                  <Text className="mt-0.5" style={{ color: textMuted, fontFamily: 'Tajawal-Regular', fontSize: 12 }}>
                    Alert 15 min before prayer time ends
                  </Text>
                </View>
                <Switch
                  value={remindersEnabled}
                  onValueChange={handleRemindersToggle}
                  trackColor={{ false: trackColorFalse, true: trackColorTrue }}
                  thumbColor={remindersEnabled ? '#ffffff' : resolvedTheme === 'dark' ? 'rgba(255,255,255,0.9)' : '#f4f3f4'}
                />
              </View>
            </>
          )}
        </View>

        {notificationsEnabled && (
          <View
            className="rounded-3xl mb-4 overflow-hidden"
            style={{ backgroundColor: cardBackground, borderColor: cardBorder, borderCurve: 'continuous', borderWidth: 0.5 }}
          >
            <View className="flex-row justify-between items-center px-5 py-4">
              <View className="flex-1 justify-center">
                <Text style={{ color: textColor, fontFamily: 'Tajawal-Medium', fontSize: 18 }}>
                  Dua Notifications
                </Text>
                <Text className="mt-0.5" style={{ color: textMuted, fontFamily: 'Tajawal-Regular', fontSize: 12 }}>
                  Morning and evening reminders
                </Text>
              </View>
              <Switch
                value={duasEnabled}
                onValueChange={handleDuaToggle}
                trackColor={{ false: trackColorFalse, true: trackColorTrue }}
                thumbColor={duasEnabled ? '#ffffff' : resolvedTheme === 'dark' ? 'rgba(255,255,255,0.9)' : '#f4f3f4'}
              />
            </View>
          </View>
        )}

        <View
          className="rounded-3xl mb-4 overflow-hidden"
          style={{ backgroundColor: cardBackground, borderColor: cardBorder, borderCurve: 'continuous', borderWidth: 0.5 }}
        >
          <Link href="/settings/calculation-method" asChild>
            <Pressable
              className="flex-row justify-between items-center px-5 py-4"
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              }}
            >
              <View className="flex-1 justify-center">
                <Text style={{ color: textColor, fontFamily: 'Tajawal-Medium', fontSize: 18 }}>
                  Calculation Method
                </Text>
                <Text className="mt-0.5" style={{ color: accentColor, fontFamily: 'Tajawal-Regular', fontSize: 12 }}>
                  {getCalculationMethodOptions().find(opt => opt.key === calculationMethod)?.name || calculationMethod}
                </Text>
              </View>
            </Pressable>
          </Link>

          <View className="h-px mx-5 opacity-30" style={{ backgroundColor: cardBorder }} />

          <Link href="/settings/madhab" asChild>
            <Pressable
              className="flex-row justify-between items-center px-5 py-4"
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              }}
            >
              <View className="flex-1 justify-center">
                <Text style={{ color: textColor, fontFamily: 'Tajawal-Medium', fontSize: 18 }}>
                  Madhab
                </Text>
                <Text className="mt-0.5" style={{ color: accentColor, fontFamily: 'Tajawal-Regular', fontSize: 12 }}>
                  {getMadhabOptions().find(opt => opt.key === madhab)?.name || madhab}
                </Text>
              </View>
            </Pressable>
          </Link>
        </View>

        <View
          className="rounded-3xl mb-4 overflow-hidden"
          style={{ backgroundColor: cardBackground, borderColor: cardBorder, borderCurve: 'continuous', borderWidth: 0.5 }}
        >
          <Link href="/settings/reciter" asChild>
            <Pressable
              className="flex-row justify-between items-center px-5 py-4"
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              }}
            >
              <View className="flex-1 justify-center">
                <Text style={{ color: textColor, fontFamily: 'Tajawal-Medium', fontSize: 18 }}>
                  Quran Reciter
                </Text>
                <Text className="mt-0.5" style={{ color: accentColor, fontFamily: 'Tajawal-Regular', fontSize: 12 }}>
                  {getReciterDisplayName(reciterName, reciterStyle)}
                </Text>
              </View>
            </Pressable>
          </Link>

          <View className="h-px mx-5 opacity-30" style={{ backgroundColor: cardBorder }} />

          <Link href="/settings/hadith-book" asChild>
            <Pressable
              className="flex-row justify-between items-center px-5 py-4"
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              }}
            >
              <View className="flex-1 justify-center">
                <Text style={{ color: textColor, fontFamily: 'Tajawal-Medium', fontSize: 18 }}>
                  Default Hadith Book
                </Text>
                <Text className="mt-0.5" style={{ color: accentColor, fontFamily: 'Tajawal-Regular', fontSize: 12 }}>
                  {selectedHadithBook?.bookName ?? 'Not selected'}
                </Text>
              </View>
            </Pressable>
          </Link>
        </View>
      </ScrollView>
    </>
  );
}
