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
import * as Haptics from 'expo-haptics';
import { Link } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';

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

  // Don't show card if Ramadan has already passed
  if (status.status === 'passed') return null;

  const moonColor = resolvedTheme === 'dark' ? '#FFD700' : '#d4af37';
  const subtleBg = resolvedTheme === 'dark' ? 'rgba(212, 175, 55, 0.12)' : 'rgba(212, 175, 55, 0.08)';

  return (
    <Link href="/ramadan-calendar" asChild onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)}>
      <Pressable>
        <Animated.View
          entering={FadeInUp.delay(350).duration(800)}
          className="mb-6 overflow-hidden rounded-[40px]"
          style={{ borderColor: cardBorder, borderWidth: 0.5, borderCurve: 'continuous' }}
        >
          <ThemedBlurView intensity={25} className="p-5">
            {/* Header */}
            <View className="flex-row justify-between items-center mb-4">
              <View className="flex-row items-center gap-2">
                <View
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 16,
                    backgroundColor: subtleBg,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <IconSymbol name="moon.stars.fill" size={18} color={moonColor} />
                </View>
                <Text className="text-xs font-tajawal-bold uppercase tracking-[1px]" style={{ color: textMuted }}>
                  Ramadan {calendarData.hijriYear} AH
                </Text>
              </View>
              <View className="flex-row items-center gap-1">
                <Text className="text-xs font-tajawal-medium" style={{ color: accentColor }}>
                  View Calendar
                </Text>
                <IconSymbol name="chevron.right" size={12} color={accentColor} />
              </View>
            </View>

            {/* Status */}
            {status.status === 'upcoming' && (
              <View>
                <Text className="text-2xl font-tajawal-bold mb-1" style={{ color: textColor }}>
                  Ramadan is Coming
                </Text>
                <Text className="text-base font-tajawal-medium" style={{ color: textSecondary }}>
                  {status.daysUntil === 1 ? 'Starts tomorrow' : `Starts in ${status.daysUntil} days`}
                </Text>
                <Text className="text-sm font-[Tajawal-Light] mt-1" style={{ color: textMuted }}>
                  {calendarData.days[0].gregorianDate} — {calendarData.days[calendarData.days.length - 1].gregorianDate}
                </Text>
              </View>
            )}

            {status.status === 'ongoing' && todayEntry && (
              <View>
                <Text className="text-2xl font-tajawal-bold mb-2" style={{ color: textColor }}>
                  Day {status.currentDay} of {status.totalDays}
                </Text>

                <View style={{ borderTopWidth: 0.5, borderTopColor: dividerColor, paddingTop: 12 }}>
                  <View className="flex-row justify-between">
                    <View className="items-center flex-1">
                      <Text className="text-xs font-tajawal-bold uppercase tracking-[0.5px] mb-1" style={{ color: textMuted }}>
                        Sehri Ends
                      </Text>
                      <Text className="text-xl font-tajawal-bold" style={{ color: textColor }}>
                        {todayEntry.sehriEnd}
                      </Text>
                    </View>
                    <View
                      style={{
                        width: 1,
                        backgroundColor: dividerColor,
                        marginHorizontal: 16,
                      }}
                    />
                    <View className="items-center flex-1">
                      <Text className="text-xs font-tajawal-bold uppercase tracking-[0.5px] mb-1" style={{ color: textMuted }}>
                        Iftar
                      </Text>
                      <Text className="text-xl font-tajawal-bold" style={{ color: textColor }}>
                        {todayEntry.iftarTime}
                      </Text>
                    </View>
                  </View>
                </View>

                {status.daysRemaining !== undefined && status.daysRemaining > 0 && (
                  <Text className="text-sm font-[Tajawal-Light] mt-3 text-center" style={{ color: textMuted }}>
                    {status.daysRemaining} {status.daysRemaining === 1 ? 'day' : 'days'} remaining
                  </Text>
                )}
              </View>
            )}
          </ThemedBlurView>
        </Animated.View>
      </Pressable>
    </Link>
  );
}
