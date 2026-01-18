import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  View
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useTheme } from '@/contexts/ThemeContext';
import { useLocation } from '@/hooks/useLocation';
import { useThemeColor } from '@/hooks/useThemeColor';
import { notificationService } from '@/utils/notification-service';
import { getNotificationSettings } from '@/utils/notification-settings';
import {
  getMadhabOptions,
  getPrayerSettings,
  updateMadhab,
  type MadhabKey,
} from '@/utils/prayer-settings';

export default function MadhabScreen() {
  const router = useRouter();
  const { resolvedTheme } = useTheme();
  const { loc } = useLocation();
  const isDark = resolvedTheme === 'dark';
  const [madhab, setMadhab] = useState<MadhabKey>('Shafi');
  const { top } = useSafeAreaInsets();
  const backgroundColor = useThemeColor({}, 'background');
  const accentColor = useThemeColor({}, 'accent');
  const textColor = useThemeColor({}, 'text');
  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const settings = await getPrayerSettings();
      setMadhab(settings.madhab);
    } catch (error) {
      console.error('Error loading prayer settings:', error);
    }
  };

  const handleMadhabChange = async (newMadhab: MadhabKey) => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft);
      await updateMadhab(newMadhab);
      setMadhab(newMadhab);

      // Reschedule notifications if they're enabled and location is available
      const notificationSettings = await getNotificationSettings();
      if (notificationSettings.enabled && loc) {
        const { latitude, longitude } = loc.coords;
        await notificationService.rescheduleAll(latitude, longitude);
      }

      router.back();
    } catch (error) {
      console.error('Error updating madhab:', error);
    }
  };

  return (

        <View style={[styles.container, { backgroundColor }]}>
          <Text style={[styles.title, { color: textColor }]}>
            Madhab
          </Text>

          <View style={styles.optionsList}>
            {getMadhabOptions().map((item) => {
              const active = item.key === madhab;
              return (
                <Pressable
                  key={item.key}
                  onPress={() => handleMadhabChange(item.key)}
                  style={[
                    styles.optionItem,
                    {
                      opacity: active ? 1 : 0.65,
                      backgroundColor: active
                        ? isDark
                          ? 'rgba(212,175,55,0.15)'
                          : 'rgba(212,175,55,0.1)'
                        : 'transparent',
                    },
                  ]}
                >
                  <Text style={[styles.optionText, { color: textColor }]}>
                    {item.name}
                  </Text>
                  {active && (
                    <Text style={[styles.checkmark, { color: accentColor }]}>
                      ✓
                    </Text>
                  )}
                </Pressable>
              );
            })}
          </View>
        </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 40,
    paddingBottom: 40,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 16,
    fontFamily: 'Tajawal-Bold',
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
    borderCurve: 'continuous',
    marginBottom: 8,
  },
  optionText: {
    fontSize: 17,
    fontFamily: 'Tajawal-Medium',
    flex: 1,
  },
  checkmark: {
    fontSize: 18,
    fontFamily: 'Tajawal-Bold',
    marginLeft: 12,
  },
});

