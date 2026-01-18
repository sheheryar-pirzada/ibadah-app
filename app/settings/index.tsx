import * as Haptics from 'expo-haptics';
import { Link, useFocusEffect } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
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

export default function SettingsScreen() {
  const { themeMode, setThemeMode, resolvedTheme } = useTheme();
  const { loc } = useLocation();
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [duasEnabled, setDuasEnabled] = useState(true);
  const [hasPermission, setHasPermission] = useState(false);
  const [calculationMethod, setCalculationMethod] = useState<CalculationMethodKey>('MuslimWorldLeague');
  const [madhab, setMadhab] = useState<MadhabKey>('Shafi');
  const [reciterName, setReciterName] = useState<string>("Mishari Rashid al-`Afasy");
  const [reciterStyle, setReciterStyle] = useState<string | null>(null);

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
  const isDarkModeOn = themeMode === 'dark';
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
      {/* <ThemedStatusBar /> */}
      <ScrollView contentInsetAdjustmentBehavior='automatic' style={[styles.container, { backgroundColor }]} contentContainerStyle={[styles.scrollContent]}>
      <View style={[styles.card, { backgroundColor: cardBackground, borderColor: cardBorder }]}>
          <View style={styles.settingRow}>
            <View style={styles.settingLabelContainer}>
              <Text style={[styles.settingLabel, { color: textColor }]}>Dark Mode</Text>
              {isSystemMode && (
                <Text style={[styles.settingSubLabel, { color: textMuted }]}>Using system</Text>
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
        
        <View style={[styles.card, { backgroundColor: cardBackground, borderColor: cardBorder }]}>
          <View style={styles.settingRow}>
            <View style={styles.settingLabelContainer}>
              <Text style={[styles.settingLabel, { color: textColor }]}>Prayer Notifications</Text>
              {!hasPermission && notificationsEnabled && (
                <Text style={[styles.settingSubLabel, { color: textMuted }]}>Permission required</Text>
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
              <View style={[styles.separator, { backgroundColor: cardBorder }]} />
              <Link href="/settings/prayer-notifications" asChild>
                <TouchableOpacity 
                  style={styles.settingRow}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  }}
                >
                  <View style={styles.settingLabelContainer}>
                    <Text style={[styles.settingLabel, { color: textColor }]}>Select Prayers</Text>
                    <Text style={[styles.settingSubLabel, { color: accentColor }]}>Choose which prayers to notify</Text>
                  </View>
                </TouchableOpacity>
              </Link>
            </>
          )}
        </View>

        {notificationsEnabled && (
          <View style={[styles.card, { backgroundColor: cardBackground, borderColor: cardBorder }]}>
            <View style={styles.settingRow}>
              <View style={styles.settingLabelContainer}>
                <Text style={[styles.settingLabel, { color: textColor }]}>Dua Notifications</Text>
                <Text style={[styles.settingSubLabel, { color: textMuted }]}>Morning and evening reminders</Text>
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

        <View style={[styles.card, { backgroundColor: cardBackground, borderColor: cardBorder }]}>
          <Link href="/settings/calculation-method" asChild>
            <TouchableOpacity 
              style={styles.settingRow}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              }}
            >
              <View style={styles.settingLabelContainer}>
                <Text style={[styles.settingLabel, { color: textColor }]}>Calculation Method</Text>
                <Text style={[styles.settingSubLabel, { color: accentColor }]}>
                  {getCalculationMethodOptions().find(opt => opt.key === calculationMethod)?.name || calculationMethod}
                </Text>
              </View>
            </TouchableOpacity>
          </Link>

          <View style={[styles.separator, { backgroundColor: cardBorder }]} />

          <Link href="/settings/madhab" asChild>
            <TouchableOpacity
              style={styles.settingRow}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              }}
            >
              <View style={styles.settingLabelContainer}>
                <Text style={[styles.settingLabel, { color: textColor }]}>Madhab</Text>
                <Text style={[styles.settingSubLabel, { color: accentColor }]}>
                  {getMadhabOptions().find(opt => opt.key === madhab)?.name || madhab}
                </Text>
              </View>
            </TouchableOpacity>
          </Link>
        </View>

        <View style={[styles.card, { backgroundColor: cardBackground, borderColor: cardBorder }]}>
          <Link href="/settings/reciter" asChild>
            <TouchableOpacity
              style={styles.settingRow}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              }}
            >
              <View style={styles.settingLabelContainer}>
                <Text style={[styles.settingLabel, { color: textColor }]}>Quran Reciter</Text>
                <Text style={[styles.settingSubLabel, { color: accentColor }]}>
                  {getReciterDisplayName(reciterName, reciterStyle)}
                </Text>
              </View>
            </TouchableOpacity>
          </Link>
        </View>

        {/* Debug section */}
        {/* <View style={[styles.card, { backgroundColor: cardBackground, borderColor: cardBorder }]}>
          <View style={styles.settingRow}>
            <View style={styles.settingLabelContainer}>
              <Text style={[styles.settingLabel, { color: textColor }]}>Debug</Text>
              <Text style={[styles.settingSubLabel, { color: textMuted }]}>
                Tools for testing notifications
              </Text>
            </View>
          </View>
          <View style={[styles.separator, { backgroundColor: cardBorder }]} />
          <TouchableOpacity 
            style={styles.settingRow}
            onPress={handleDebugPrayerNotification}
          >
            <View style={styles.settingLabelContainer}>
              <Text style={[styles.settingLabel, { color: textColor }]}>
                Prayer notifications
              </Text>
              <Text style={[styles.settingSubLabel, { color: accentColor }]}>
                Scheduled (10 s)
              </Text>
            </View>
          </TouchableOpacity>
        </View> */}
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 30,
    paddingTop: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginVertical: 30,
  },
  card: {
    borderRadius: 24,
    borderCurve: 'continuous',
    marginBottom: 16,
    overflow: 'hidden',
    borderWidth: 1,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderCurve: 'continuous',
  },
  settingLabelContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  settingLabel: {
    fontSize: 18,
    fontFamily: 'Tajawal-Medium',
  },
  settingSubLabel: {
    fontSize: 12,
    fontFamily: 'Tajawal-Regular',
    marginTop: 2,
  },
  settingValue: {
    fontSize: 16,
    fontFamily: 'Tajawal-Medium',
  },
  separator: {
    height: 1,
    marginHorizontal: 20,
    opacity: 0.3,
  },
});
