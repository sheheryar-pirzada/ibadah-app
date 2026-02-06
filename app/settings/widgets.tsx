'use no memo';

import React, { useEffect, useState } from 'react';
import {
  Platform,
  ScrollView,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { VoltraWidgetPreview } from 'voltra/client';

import {
  SmallPrayerWidget,
  MediumPrayerWidget,
  LargePrayerWidget,
  MediumDuaWidget,
  LargeDuaWidget,
  getWidgetData,
  quranicDuas,
  widgetColors,
} from '@/components/widgets';
import type { WidgetData } from '@/components/widgets/widget-utils';
import { useTheme } from '@/contexts/ThemeContext';
import { useThemeColor } from '@/hooks/useThemeColor';

export default function WidgetsScreen() {
  const { resolvedTheme } = useTheme();
  const { top } = useSafeAreaInsets();
  const [widgetData, setWidgetData] = useState<WidgetData | null>(null);

  const backgroundColor = useThemeColor({}, 'background');
  const cardBackground = useThemeColor({}, 'cardBackground');
  const cardBorder = useThemeColor({}, 'cardBorder');
  const textColor = useThemeColor({}, 'text');
  const textMuted = useThemeColor({}, 'textMuted');

  const colorScheme = resolvedTheme === 'dark' ? 'dark' : 'light';
  const colors = widgetColors[colorScheme];

  useEffect(() => {
    loadWidgetData();
  }, []);

  const loadWidgetData = async () => {
    try {
      const data = await getWidgetData();
      setWidgetData(data);
    } catch (error) {
      console.error('Error loading widget data:', error);
    }
  };

  // Show placeholder data if no real data yet
  const displayData: WidgetData = widgetData || {
    hasLocation: false,
    currentDate: 'Thu, Feb 5',
    islamicDate: '5 Sha\'ban 1446 AH',
    nextPrayer: null,
    allPrayers: [],
    upcomingPrayers: [],
  };

  if (Platform.OS !== 'ios') {
    return (
      <View className="flex-1 justify-center items-center px-6" style={{ backgroundColor }}>
        <Text className="text-lg font-tajawal-medium text-center" style={{ color: textColor }}>
          Widgets are only available on iOS
        </Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor }}
      contentContainerStyle={{ paddingTop: top / 2 + 24, paddingHorizontal: 16, paddingBottom: 40 }}
      showsVerticalScrollIndicator={false}
    >
      <Text className="text-xl text-center mb-2 font-tajawal-bold" style={{ color: textColor }}>
        Widget Preview
      </Text>
      <Text className="text-sm text-center mb-8 font-tajawal" style={{ color: textMuted }}>
        See how your widgets will look on the home screen
      </Text>

      {/* Prayer Times Section */}
      <Text className="text-lg font-tajawal-bold mb-4" style={{ color: textColor }}>
        Prayer Times
      </Text>

      {/* Small Widget */}
      <View className="mb-6">
        <Text className="text-sm font-tajawal-medium mb-3 ml-1" style={{ color: textMuted }}>
          SMALL
        </Text>
        <View className="items-center">
          <VoltraWidgetPreview
            family="systemSmall"
            style={{
              borderRadius: 22,
              overflow: 'hidden',
              backgroundColor: colors.background,
            }}
          >
            <SmallPrayerWidget data={displayData} colorScheme={colorScheme} />
          </VoltraWidgetPreview>
        </View>
      </View>

      {/* Medium Widget */}
      <View className="mb-6">
        <Text className="text-sm font-tajawal-medium mb-3 ml-1" style={{ color: textMuted }}>
          MEDIUM
        </Text>
        <View className="items-center">
          <VoltraWidgetPreview
            family="systemMedium"
            style={{
              borderRadius: 22,
              overflow: 'hidden',
              backgroundColor: colors.background,
            }}
          >
            <MediumPrayerWidget data={displayData} colorScheme={colorScheme} />
          </VoltraWidgetPreview>
        </View>
      </View>

      {/* Large Widget */}
      <View className="mb-8">
        <Text className="text-sm font-tajawal-medium mb-3 ml-1" style={{ color: textMuted }}>
          LARGE
        </Text>
        <View className="items-center">
          <VoltraWidgetPreview
            family="systemLarge"
            style={{
              borderRadius: 22,
              overflow: 'hidden',
              backgroundColor: colors.background,
            }}
          >
            <LargePrayerWidget data={displayData} colorScheme={colorScheme} />
          </VoltraWidgetPreview>
        </View>
      </View>

      {/* Quranic Duas Section */}
      <Text className="text-lg font-tajawal-bold mb-2" style={{ color: textColor }}>
        Quranic Duas
      </Text>
      <Text className="text-sm font-tajawal mb-4" style={{ color: textMuted }}>
        Each dua is available as a separate widget
      </Text>

      {quranicDuas.map((dua) => {
        const isLargeOnly = ['dua_despair', 'dua_peace'].includes(dua.widgetId);
        return (
          <View key={dua.id} className="mb-6">
            <Text className="text-sm font-tajawal-medium mb-3 ml-1" style={{ color: textMuted }}>
              {dua.category.toUpperCase()}
            </Text>
            <View className="items-center">
              <VoltraWidgetPreview
                family={isLargeOnly ? 'systemLarge' : 'systemMedium'}
                style={{
                  borderRadius: 22,
                  overflow: 'hidden',
                  backgroundColor: colors.background,
                }}
              >
                {isLargeOnly ? (
                  <LargeDuaWidget dua={dua} colorScheme={colorScheme} />
                ) : (
                  <MediumDuaWidget dua={dua} colorScheme={colorScheme} />
                )}
              </VoltraWidgetPreview>
            </View>
          </View>
        );
      })}

      {/* Instructions */}
      <View
        className="rounded-2xl p-4 mt-2"
        style={{ backgroundColor: cardBackground, borderColor: cardBorder, borderWidth: 0.5, borderCurve: 'continuous' }}
      >
        <Text className="text-base font-tajawal-bold mb-2" style={{ color: textColor }}>
          How to add widgets
        </Text>
        <Text className="text-sm font-tajawal leading-5" style={{ color: textMuted }}>
          1. Long press on your home screen{'\n'}
          2. Tap the + button in the top left{'\n'}
          3. Search for "Ibadah"{'\n'}
          4. Choose your preferred widget size{'\n'}
          5. Tap "Add Widget"
        </Text>
      </View>
    </ScrollView>
  );
}
