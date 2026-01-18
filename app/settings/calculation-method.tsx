import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ThemedStatusBar } from '@/components/ThemedStatusBar';
import { useTheme } from '@/contexts/ThemeContext';
import { useLocation } from '@/hooks/useLocation';
import { notificationService } from '@/utils/notification-service';
import { getNotificationSettings } from '@/utils/notification-settings';
import {
  getCalculationMethodOptions,
  getPrayerSettings,
  updateCalculationMethod,
  type CalculationMethodKey,
} from '@/utils/prayer-settings';
import { useThemeColor } from '@/hooks/useThemeColor';
import { IconSymbol } from '@/components/ui/IconSymbol.ios';

export default function CalculationMethodScreen() {
  const router = useRouter();
  const { resolvedTheme } = useTheme();
  const { loc } = useLocation();
  const isDark = resolvedTheme === 'dark';
  const [calculationMethod, setCalculationMethod] = useState<CalculationMethodKey>('MuslimWorldLeague');
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
      setCalculationMethod(settings.calculationMethod);
    } catch (error) {
      console.error('Error loading prayer settings:', error);
    }
  };

  const handleMethodChange = async (method: CalculationMethodKey) => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft);
      await updateCalculationMethod(method);
      setCalculationMethod(method);

      // Reschedule notifications if they're enabled and location is available
      const notificationSettings = await getNotificationSettings();
      if (notificationSettings.enabled && loc) {
        const { latitude, longitude } = loc.coords;
        await notificationService.rescheduleAll(latitude, longitude);
      }

      router.back();
    } catch (error) {
      console.error('Error updating calculation method:', error);
    }
  };

  return (
        <ScrollView
          style={{ flex: 1, backgroundColor }}
          contentContainerStyle={[
            styles.scrollContent,
            { paddingTop: top / 2 + 24 }
          ]}
          showsVerticalScrollIndicator={false}
        >
          <Text style={[styles.title, { color: textColor }]}>
            Calculation Method
          </Text>

          <View style={styles.optionsList}>
            {getCalculationMethodOptions().map((item) => {
              const active = item.key === calculationMethod;
              return (
                <Pressable
                  key={item.key}
                  onPress={() => handleMethodChange(item.key)}
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
                    <IconSymbol name="checkmark.circle.fill" size={24} color={accentColor} />
                  )}
                </Pressable>
              );
            })}
          </View>
        </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    padding: 24,
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
    marginBottom: 8,
    borderCurve: 'continuous',
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

