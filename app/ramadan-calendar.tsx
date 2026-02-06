import { ThemedBlurView } from '@/components/ThemedBlurView';
import { ThemedStatusBar } from '@/components/ThemedStatusBar';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { useTheme } from '@/contexts/ThemeContext';
import { useLocation } from '@/hooks/useLocation';
import { useThemeColor } from '@/hooks/useThemeColor';
import {
  fetchRamadanCalendar,
  getRamadanStatus,
  type RamadanCalendarData,
  type RamadanDay,
} from '@/utils/ramadan-api';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  Text,
  View,
} from 'react-native';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';

function DayRow({
  day,
  isToday,
  index,
}: {
  day: RamadanDay;
  isToday: boolean;
  index: number;
}) {
  const { resolvedTheme } = useTheme();
  const textColor = useThemeColor({}, 'text');
  const textMuted = useThemeColor({}, 'textMuted');
  const textSecondary = useThemeColor({}, 'textSecondary');
  const accentColor = useThemeColor({}, 'accent');
  const cardBorder = useThemeColor({}, 'cardBorder');
  const dividerColor = useThemeColor({}, 'divider');

  const todayBg = resolvedTheme === 'dark' ? 'rgba(212, 175, 55, 0.15)' : 'rgba(212, 175, 55, 0.1)';

  return (
    <Animated.View
      entering={FadeInUp.delay(100 + index * 30).duration(500)}
      className="mb-2 overflow-hidden rounded-[24px]"
      style={{
        borderCurve: 'continuous',
        borderWidth: isToday ? 1 : 0.5,
        borderColor: isToday ? accentColor : cardBorder,
      }}
    >
      <ThemedBlurView intensity={isToday ? 30 : 20} className="px-4 py-3.5">
        <View style={isToday ? { backgroundColor: todayBg, margin: -16, padding: 16, borderRadius: 24 } : undefined}>
          <View className="flex-row items-center">
            {/* Day number badge */}
            <View
              style={{
                width: 40,
                height: 40,
                borderRadius: 20,
                backgroundColor: isToday ? accentColor : (resolvedTheme === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(4,99,7,0.06)'),
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: 12,
              }}
            >
              <Text
                className="text-base"
                style={{ color: isToday ? '#fff' : textColor }}
              >
                {day.hijriDay}
              </Text>
            </View>

            {/* Date info */}
            <View className="flex-1">
              <Text className="text-[15px] font-tajawal-bold" style={{ color: isToday ? accentColor : textColor }}>
                {day.weekday}, {day.gregorianDate}
              </Text>
              {isToday && (
                <Text className="text-xs font-tajawal-medium mt-0.5" style={{ color: accentColor }}>
                  Today
                </Text>
              )}
            </View>

            {/* Times */}
            <View className="flex-row items-center gap-4">
              <View className="items-center">
                <Text className="text-[10px] font-tajawal-bold uppercase tracking-[0.5px]" style={{ color: textMuted }}>
                  Sehri
                </Text>
                <Text className="text-[15px] font-tajawal-bold" style={{ color: isToday ? accentColor : textSecondary }}>
                  {day.sehriEnd}
                </Text>
              </View>
              <View
                style={{
                  width: 0.5,
                  height: 28,
                  backgroundColor: dividerColor,
                }}
              />
              <View className="items-center">
                <Text className="text-[10px] font-tajawal-bold uppercase tracking-[0.5px]" style={{ color: textMuted }}>
                  Iftar
                </Text>
                <Text className="text-[15px] font-tajawal-bold" style={{ color: isToday ? accentColor : textSecondary }}>
                  {day.iftarTime}
                </Text>
              </View>
            </View>
          </View>
        </View>
      </ThemedBlurView>
    </Animated.View>
  );
}

export default function RamadanCalendarScreen() {
  const { resolvedTheme } = useTheme();
  const { loc } = useLocation();
  const [calendarData, setCalendarData] = useState<RamadanCalendarData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const flatListRef = useRef<FlatList<RamadanDay>>(null);

  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const textMuted = useThemeColor({}, 'textMuted');
  const textSecondary = useThemeColor({}, 'textSecondary');
  const accentColor = useThemeColor({}, 'accent');
  const cardBorder = useThemeColor({}, 'cardBorder');
  const dividerColor = useThemeColor({}, 'divider');

  const gradientColors = resolvedTheme === 'dark'
    ? (['rgba(0,0,0,0.3)', 'rgba(0,0,0,0.1)', 'rgba(0,0,0,0.4)'] as const)
    : (['rgba(255,255,255,0.1)', 'rgba(255,255,255,0.05)', 'rgba(255,255,255,0.15)'] as const);

  useEffect(() => {
    if (!loc) return;
    const { latitude, longitude } = loc.coords;

    setLoading(true);
    fetchRamadanCalendar(latitude, longitude)
      .then((data) => {
        setCalendarData(data);
        setError(null);
      })
      .catch(() => setError('Unable to load Ramadan calendar. Please check your connection.'))
      .finally(() => setLoading(false));
  }, [loc]);

  // Scroll to today's entry once data loads
  useEffect(() => {
    if (!calendarData) return;
    const status = getRamadanStatus(calendarData);
    if (status.status === 'ongoing' && status.currentDay) {
      const index = status.currentDay - 1;
      setTimeout(() => {
        flatListRef.current?.scrollToIndex({ index, animated: true, viewPosition: 0.3 });
      }, 600);
    }
  }, [calendarData]);

  const status = calendarData ? getRamadanStatus(calendarData) : null;

  const todayIndex = (() => {
    if (!calendarData) return -1;
    const today = new Date();
    const d = today.getDate();
    const m = today.getMonth() + 1;
    const y = today.getFullYear();
    return calendarData.days.findIndex(
      (day) => day.gregorianDay === d && day.gregorianMonth === m && day.gregorianYear === y,
    );
  })();

  const renderHeader = () => (
    <View className="mb-4">
      {/* Title Section */}
      <Animated.View entering={FadeInDown.duration(600)} className="items-center mb-6">
        <View className="flex-row items-center justify-between w-full mb-2">
          <Pressable
            onPress={() => router.back()}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            className="p-1"
          >
            <IconSymbol name="chevron.left" size={24} color={textColor} />
          </Pressable>
          <Text className="text-[28px] font-tajawal-bold" style={{ color: textColor }}>
            Ramadan Calendar
          </Text>
          <View style={{ width: 24 }} />
        </View>
        {calendarData && (
          <Text className="text-sm font-[Tajawal-Light]" style={{ color: textMuted }}>
            {calendarData.hijriYear} AH
          </Text>
        )}
      </Animated.View>

      {/* Summary Card */}
      {calendarData && status && (
        <Animated.View
          entering={FadeInUp.delay(200).duration(800)}
          className="mb-5 overflow-hidden rounded-[28px]"
          style={{ borderCurve: 'continuous', borderWidth: 0.5, borderColor: cardBorder }}
        >
          <ThemedBlurView intensity={25} className="p-5">
            <View className="items-center">
              <IconSymbol name="moon.stars.fill" size={36} color={accentColor} />
              <Text className="text-xl font-tajawal-bold mt-2 mb-1" style={{ color: textColor }}>
                {status.status === 'upcoming'
                  ? `Ramadan begins in ${status.daysUntil} ${status.daysUntil === 1 ? 'day' : 'days'}`
                  : status.status === 'ongoing'
                    ? `Day ${status.currentDay} of ${status.totalDays}`
                    : 'Ramadan has ended'}
              </Text>
              <Text className="text-sm font-[Tajawal-Light] text-center" style={{ color: textMuted }}>
                {calendarData.days[0].gregorianDate} — {calendarData.days[calendarData.days.length - 1].gregorianDate}
              </Text>
              <Text className="text-xs font-[Tajawal-Light] mt-1" style={{ color: textMuted }}>
                {calendarData.days.length} days
              </Text>
            </View>
          </ThemedBlurView>
        </Animated.View>
      )}

      {/* Column Headers */}
      {/* <Animated.View
        entering={FadeInUp.delay(300).duration(600)}
        className="flex-row items-center px-4 mb-2"
      >
        <View style={{ width: 52 }} />
        <View className="flex-1">
          <Text className="text-xs font-tajawal-bold uppercase tracking-[1px]" style={{ color: textMuted }}>
            Date
          </Text>
        </View>
        <View className="flex-row items-center gap-4">
          <View className="items-center" style={{ width: 46 }}>
            <Text className="text-xs font-tajawal-bold uppercase tracking-[0.5px]" style={{ color: textMuted }}>
              Sehri
            </Text>
          </View>
          <View style={{ width: 0.5 }} />
          <View className="items-center" style={{ width: 46 }}>
            <Text className="text-xs font-tajawal-bold uppercase tracking-[0.5px]" style={{ color: textMuted }}>
              Iftar
            </Text>
          </View>
        </View>
      </Animated.View>

      <View style={{ height: 0.5, backgroundColor: dividerColor, marginBottom: 8 }} /> */}
    </View>
  );

  if (loading || !loc) {
    return (
      <View className="flex-1" style={{ backgroundColor }}>
        <ThemedStatusBar />
        <LinearGradient colors={gradientColors} className="absolute inset-0" />
        <View className="flex-1 justify-center items-center px-5">
          <ThemedBlurView
            intensity={25}
            className="p-10 rounded-[40px] items-center overflow-hidden min-w-[200px]"
            style={{ borderCurve: 'continuous', borderWidth: 0.5, borderColor: cardBorder }}
          >
            <ActivityIndicator size="large" color={accentColor} style={{ marginBottom: 16 }} />
            <Text className="text-base text-center font-tajawal-medium" style={{ color: textColor }}>
              Loading Ramadan calendar...
            </Text>
          </ThemedBlurView>
        </View>
      </View>
    );
  }

  if (error) {
    return (
      <View className="flex-1" style={{ backgroundColor }}>
        <ThemedStatusBar />
        <LinearGradient colors={gradientColors} className="absolute inset-0" />
        <View className="flex-1 justify-center items-center px-5">
          <ThemedBlurView
            intensity={25}
            className="p-8 rounded-[40px] items-center overflow-hidden"
            style={{ borderCurve: 'continuous', borderWidth: 0.5, borderColor: cardBorder }}
          >
            <IconSymbol name="xmark.circle.fill" size={40} color={textMuted} />
            <Text className="text-base text-center font-tajawal-medium mt-3" style={{ color: textColor }}>
              {error}
            </Text>
            <Pressable
              onPress={() => router.back()}
              className="mt-4 px-6 py-2 rounded-full"
              style={{ backgroundColor: accentColor }}
            >
              <Text className="text-sm font-tajawal-bold" style={{ color: '#fff' }}>
                Go Back
              </Text>
            </Pressable>
          </ThemedBlurView>
        </View>
      </View>
    );
  }

  return (
    <View className="flex-1" style={{ backgroundColor }}>
      <ThemedStatusBar />
      <LinearGradient colors={gradientColors} className="absolute inset-0" />
      <FlatList
        ref={flatListRef}
        data={calendarData?.days ?? []}
        keyExtractor={(item) => `ramadan-${item.hijriDay}`}
        contentInsetAdjustmentBehavior="automatic"
        contentContainerClassName="pb-10 px-4"
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={renderHeader}
        onScrollToIndexFailed={(info) => {
          // Fallback: scroll to approximate offset
          flatListRef.current?.scrollToOffset({ offset: info.averageItemLength * info.index, animated: true });
        }}
        renderItem={({ item, index }) => (
          <DayRow
            day={item}
            isToday={index === todayIndex}
            index={index}
          />
        )}
      />
    </View>
  );
}
