import * as Haptics from 'expo-haptics';
import { Link } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';

const AppleZoom = Link.AppleZoom;

import { ThemedBlurView } from '@/components/ThemedBlurView';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { useTheme } from '@/contexts/ThemeContext';
import { useLocation } from '@/hooks/useLocation';
import { useThemeColor } from '@/hooks/useThemeColor';
import {
  fetchRamadanCalendar,
  getRamadanStatus,
  getTodayRamadanEntry,
  type RamadanCalendarData,
} from '@/utils/ramadan-api';

export function RamadanCalendarCard() {
  const { resolvedTheme } = useTheme();
  const { loc } = useLocation();
  const [calendarData, setCalendarData] = useState<RamadanCalendarData | null>(null);
  const [error, setError] = useState(false);

  const textColor = useThemeColor({}, 'text');
  const textMuted = useThemeColor({}, 'textMuted');
  const textSecondary = useThemeColor({}, 'textSecondary');
  const accentColor = useThemeColor({}, 'accent');
  const cardBorder = useThemeColor({}, 'cardBorder');
  const dividerColor = useThemeColor({}, 'divider');

  useEffect(() => {
    if (!loc) return;
    const { latitude, longitude } = loc.coords;

    fetchRamadanCalendar(latitude, longitude)
      .then(setCalendarData)
      .catch(() => setError(true));
  }, [loc]);

  if (error || !calendarData) return null;

  const status = getRamadanStatus(calendarData);
  const todayEntry = getTodayRamadanEntry(calendarData);

  if (status.status === 'passed') return null;

  const moonColor = resolvedTheme === 'dark' ? '#FFD700' : '#d4af37';

  return (
    <View className="mt-2">
      <Animated.Text entering={FadeInUp.delay(400).duration(600)} className="text-[22px] font-tajawal-bold mb-5 tracking-[-0.3px]" style={{ color: textColor }}>
        Ramadan {calendarData.hijriYear} AH
      </Animated.Text>
      <Link href="/ramadan-calendar" asChild onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)}>
        <Pressable>
          <AppleZoom>
            <View
              style={{
                marginBottom: 16,
                borderRadius: 40,
                overflow: 'hidden',
                borderColor: cardBorder,
                borderWidth: 0.5,
                borderCurve: 'continuous',
              }}
            >
              <Animated.View entering={FadeInUp.delay(350).duration(800)}>
                <ThemedBlurView intensity={25} className="p-5">
                  <View className="w-full flex-col">
                    {status.status === 'upcoming' && (
                      <>
                        <View>
                          <View className="flex-row items-center justify-between">
                          <Text className="text-xl font-tajawal-bold mb-1" style={{ color: textColor }}>
                            Ramadan is Coming
                          </Text>
                          <View
                        className="w-12 h-12 rounded-full items-center justify-center"
                        style={{ backgroundColor: `${accentColor}15` }}
                      >
                        <IconSymbol name="moon.stars.fill" size={32} color={textColor} />
                      </View>
                          </View>
                          <Text className="text-sm font-tajawal-regular" style={{ color: textMuted }}>
                            {status.daysUntil === 1 ? 'Starts tomorrow' : `Starts in ${status.daysUntil} days`}
                          </Text>
                          <Text className="text-sm font-[Tajawal-Light] mt-1" style={{ color: textMuted }}>
                            {calendarData.days[0].gregorianDate} — {calendarData.days[calendarData.days.length - 1].gregorianDate}
                          </Text>
                        </View>
                        <View
                          className="mt-4 flex-row items-center justify-center py-3 rounded-2xl"
                          style={{ backgroundColor: `${accentColor}15` }}
                        >
                          <IconSymbol name="calendar" size={28} color={accentColor} />
                          <Text className="ml-2 text-md" style={{ color: accentColor }}>
                            View Calendar
                          </Text>
                        </View>
                      </>
                    )}

                    {status.status === 'ongoing' && todayEntry && (
                      <>
                        <View className="flex-row items-center justify-between">
                        <View>
                          <Text className="text-2xl font-tajawal-bold mb-1" style={{ color: textColor }}>
                            Day {status.currentDay} of {status.totalDays}
                          </Text>
                          <Text className="text-sm font-tajawal-regular" style={{ color: textMuted }}>
                            {status.daysRemaining !== undefined && status.daysRemaining > 0
                              ? `${status.daysRemaining} ${status.daysRemaining === 1 ? 'day' : 'days'} remaining`
                              : 'Last days of Ramadan'}
                          </Text>
                        </View>
                        <View
                        className="w-12 h-12 rounded-full items-center justify-center"
                        style={{ backgroundColor: `${accentColor}15` }}
                      >
                        <IconSymbol name="moon.stars.fill" size={32} color={textColor} />
                      </View>

                        </View>

                        <View style={{ borderTopWidth: 0.5, borderTopColor: dividerColor, paddingTop: 12, marginTop: 12 }}>
                          <View className="flex-row justify-between">
                            <View className="items-center flex-1">
                              <Text className="text-xs font-tajawal-bold uppercase tracking-[0.5px] mb-1" style={{ color: textMuted }}>
                                Sehri Ends
                              </Text>
                              <Text className="text-xl font-tajawal-bold" style={{ color: textColor }}>
                                {todayEntry?.sehriEnd || 'sss'}
                              </Text>
                            </View>
                            <View style={{ width: 1, backgroundColor: dividerColor, marginHorizontal: 16 }} />
                            <View className="items-center flex-1">
                              <Text className="text-xs font-tajawal-bold uppercase tracking-[0.5px] mb-1" style={{ color: textMuted }}>
                                Iftar
                              </Text>
                              <Text className="text-xl font-tajawal-bold" style={{ color: textColor }}>
                                {todayEntry?.iftarTime || 'sss'}
                              </Text>
                            </View>
                          </View>
                        </View>

                        <View
                          className="mt-4 flex-row items-center justify-center py-3 rounded-2xl"
                          style={{ backgroundColor: `${accentColor}15` }}
                        >
                          <IconSymbol name="calendar" size={28} color={accentColor} />
                          <Text className="ml-2 text-md" style={{ color: accentColor }}>
                            View Calendar
                          </Text>
                        </View>
                      </>
                    )}
                  </View>
                </ThemedBlurView>
              </Animated.View>
            </View>
          </AppleZoom>
        </Pressable>
      </Link>
    </View>
  );
}
