import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  Pressable,
  Text,
  View
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { IconSymbol } from '@/components/ui/IconSymbol';
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
  useSafeAreaInsets();
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

        <View className="flex-1 px-6 pt-10 pb-10" style={{ backgroundColor }}>
          <Text className="text-xl text-center mb-4 font-tajawal-bold" style={{ color: textColor }}>
            Madhab
          </Text>

          <View className="mt-2">
            {getMadhabOptions().map((item) => {
              const active = item.key === madhab;
              return (
                <Pressable
                  key={item.key}
                  onPress={() => handleMadhabChange(item.key)}
                  className="flex-row justify-between items-center px-5 py-4 rounded-[20px] mb-2"
                  style={[
                    {
                      borderCurve: 'continuous',
                      opacity: active ? 1 : 0.65,
                      backgroundColor: active
                        ? isDark
                          ? 'rgba(212,175,55,0.15)'
                          : 'rgba(212,175,55,0.1)'
                        : 'transparent',
                    },
                  ]}
                >
                  <Text className="text-[17px] font-tajawal-medium flex-1" style={{ color: textColor }}>
                    {item.name}
                  </Text>
                  {active && (
                    <IconSymbol name="checkmark.circle.fill" size={18} color={accentColor} />
                  )}
                </Pressable>
              );
            })}
          </View>
        </View>
  );
}