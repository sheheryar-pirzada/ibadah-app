import * as Haptics from 'expo-haptics';
import { Link, useFocusEffect } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import {
  Platform,
  Pressable,
  ScrollView,
  Switch,
  Text,
  View,
} from 'react-native';

import { BackgroundImage } from '@/components/BackgroundImage';
import { SettingsCard } from '@/components/SettingsCard';
import { useTheme } from '@/contexts/ThemeContext';
import { useTranslation } from '@/contexts/TranslationContext';
import { useLocation } from '@/hooks/useLocation';
import { useThemeColor } from '@/hooks/useThemeColor';
import { getBackgroundSettings, type BackgroundKey } from '@/utils/background-settings';
import { useHadithSettings } from '@/utils/hadith-settings';
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

type SettingsItemProps = {
  title: string;
  subtitle?: string;
  subtitleMuted?: boolean;
} & (
  | { href: string; switchValue?: never; onSwitchChange?: never }
  | { href?: never; switchValue: boolean; onSwitchChange: (value: boolean) => void }
);

function SettingsItem({ title, subtitle, subtitleMuted, ...rest }: SettingsItemProps) {
  const textColor = useThemeColor({}, 'text');
  const textMuted = useThemeColor({}, 'textMuted');
  const accentColor = useThemeColor({}, 'accent');
  const { resolvedTheme } = useTheme();

  const subtitleColor = subtitleMuted ? textMuted : accentColor;

  const content = (
    <View className="flex-row justify-between items-center px-5 py-4">
      <View className="flex-1 justify-center">
        <Text style={{ color: textColor, fontFamily: 'Tajawal-Medium', fontSize: 18 }}>
          {title}
        </Text>
        {subtitle != null && (
          <Text className="mt-1" style={{ color: subtitleColor, fontFamily: 'Tajawal-Regular', fontSize: 14 }}>
            {subtitle}
          </Text>
        )}
      </View>
      {'switchValue' in rest && rest.switchValue !== undefined && (
        <Switch
          value={rest.switchValue}
          onValueChange={rest.onSwitchChange}
          trackColor={{
            false: resolvedTheme === 'dark' ? 'rgba(255,255,255,0.2)' : 'rgba(4,99,7,0.2)',
            true: accentColor,
          }}
          thumbColor={rest.switchValue ? '#ffffff' : resolvedTheme === 'dark' ? 'rgba(255,255,255,0.9)' : '#f4f3f4'}
        />
      )}
    </View>
  );

  if ('href' in rest && rest.href) {
    return (
      <Link href={rest.href as any} asChild>
        <Pressable onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}>
          {content}
        </Pressable>
      </Link>
    );
  }

  return content;
}

const BACKGROUND_LABELS: Record<BackgroundKey, string> = {
  solid: 'Solid',
  grain1: 'Dusk Rose',
  grain2: 'Warm Sand',
  grain3: 'Carbon Rose',
};

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
  const { translationName } = useTranslation();
  const { selectedBook: selectedHadithBook } = useHadithSettings();
  const [backgroundKey, setBackgroundKey] = useState<BackgroundKey>('solid');

  const cardBorder = useThemeColor({}, 'cardBorder');
  const divider = useThemeColor({}, 'divider');

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

      const backgroundSettings = await getBackgroundSettings();
      setBackgroundKey(backgroundSettings.key);
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
    <BackgroundImage>
      <ScrollView
        contentInsetAdjustmentBehavior='automatic'
        className="flex-1"
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 30, paddingTop: 24 }}
      >
        {backgroundKey === 'solid' && (
          <SettingsCard>
            <SettingsItem
              title="Dark Mode"
              subtitle={isSystemMode ? 'Using system' : undefined}
              subtitleMuted
              switchValue={isDarkMode}
              onSwitchChange={handleThemeModeChange}
            />
          </SettingsCard>
        )}

        <SettingsCard>
          <SettingsItem
            title="Prayer Notifications"
            subtitle={!hasPermission && notificationsEnabled ? 'Permission required' : undefined}
            subtitleMuted
            switchValue={notificationsEnabled}
            onSwitchChange={handleNotificationToggle}
          />

          {notificationsEnabled && (
            <>
              <View className="h-px mx-5 opacity-30" style={{ backgroundColor: cardBorder }} />
              <SettingsItem
                title="Select Prayers"
                subtitle="Choose which prayers to notify"
                href="/settings/prayer-notifications"
              />
              <View className="h-px mx-5 opacity-30" style={{ backgroundColor: cardBorder }} />
              <SettingsItem
                title="Prayer Time Reminders"
                subtitle="Alert 15 min before prayer time ends"
                subtitleMuted
                switchValue={remindersEnabled}
                onSwitchChange={handleRemindersToggle}
              />
            </>
          )}
        </SettingsCard>

        {notificationsEnabled && (
          <SettingsCard>
            <SettingsItem
              title="Dua Notifications"
              subtitle="Morning and evening reminders"
              subtitleMuted
              switchValue={duasEnabled}
              onSwitchChange={handleDuaToggle}
            />
          </SettingsCard>
        )}

        <SettingsCard>
          <SettingsItem
            title="Calculation Method"
            subtitle={getCalculationMethodOptions().find(opt => opt.key === calculationMethod)?.name || calculationMethod}
            href="/settings/calculation-method"
          />
          <View className="h-px mx-5 opacity-30" style={{ backgroundColor: cardBorder }} />
          <SettingsItem
            title="Madhab"
            subtitle={getMadhabOptions().find(opt => opt.key === madhab)?.name || madhab}
            href="/settings/madhab"
          />
        </SettingsCard>

        <SettingsCard>
          <SettingsItem
            title="Quran Reciter"
            subtitle={getReciterDisplayName(reciterName, reciterStyle)}
            href="/settings/reciter"
          />
          <View className="h-px mx-5 opacity-30" style={{ backgroundColor: cardBorder }} />
          <SettingsItem
            title="Quran Translation"
            subtitle={translationName}
            href="/settings/translation"
          />
          <View className="h-px mx-5 opacity-30" style={{ backgroundColor: cardBorder }} />
          <SettingsItem
            title="Default Hadith Book"
            subtitle={selectedHadithBook?.bookName ?? 'Not selected'}
            href="/settings/hadith-book"
          />
        </SettingsCard>

        <SettingsCard>
          <SettingsItem
            title="Background"
            subtitle={BACKGROUND_LABELS[backgroundKey]}
            href="/settings/background"
          />
        </SettingsCard>

        {Platform.OS === 'ios' && __DEV__ && (
          <SettingsCard>
            <SettingsItem
              title="Home Screen Widgets"
              subtitle="Preview and learn how to add widgets"
              href="/settings/widgets"
            />
          </SettingsCard>
        )}
      </ScrollView>
    </BackgroundImage>
  );
}
