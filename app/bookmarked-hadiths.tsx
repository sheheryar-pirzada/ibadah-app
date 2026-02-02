import { SettingsHeaderButton } from '@/components/SettingsHeaderButton';
import { ThemedBlurView } from '@/components/ThemedBlurView';
import { ThemedStatusBar } from '@/components/ThemedStatusBar';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { useTheme } from '@/contexts/ThemeContext';
import { useThemeColor } from '@/hooks/useThemeColor';
import { cleanHadithText, Hadith, useHadithSettings } from '@/utils/hadith-settings';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React from 'react';
import {
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';

export default function BookmarkedHadithsScreen() {
  const { resolvedTheme } = useTheme();
  const { bookmarkedHadiths, removeBookmark } = useHadithSettings();

  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const textMuted = useThemeColor({}, 'textMuted');
  const textSecondary = useThemeColor({}, 'textSecondary');
  const accentColor = useThemeColor({}, 'accent');
  const cardBorder = useThemeColor({}, 'cardBorder');

  const gradientColors = resolvedTheme === 'dark'
    ? (['rgba(0,0,0,0.3)', 'rgba(0,0,0,0.1)', 'rgba(0,0,0,0.4)'] as const)
    : (['rgba(255,255,255,0.1)', 'rgba(255,255,255,0.05)', 'rgba(255,255,255,0.15)'] as const);

  const handleBack = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.back();
  };

  const renderHadithItem = ({ item, index }: { item: Hadith; index: number }) => (
    <Pressable
      onPress={() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        router.push({
          pathname: '/share',
          params: {
            arabic: item.hadithArabic,
            translation: cleanHadithText(item.hadithEnglish),
            reference: `${item.book.bookName} ${item.hadithNumber}`,
          },
        });
      }}
    >
      <Animated.View
        entering={FadeIn.delay(index * 50).duration(300)}
        className="overflow-hidden"
        style={{ borderColor: cardBorder, borderCurve: 'continuous', borderRadius: 40, borderWidth: 0.5 }}
      >
        <ThemedBlurView intensity={20} className="p-5">
          {/* Header with hadith number, book name, and bookmark */}
          <View className="flex-row items-center justify-between mb-3">
            <View className="flex-row items-center gap-2 flex-1">
              <View
                className="px-3 pt-2 pb-1 rounded-full"
                style={{ backgroundColor: `${accentColor}20` }}
              >
                <Text
                  className="text-xs font-tajawal-bold"
                  style={{ color: accentColor }}
                >
                  #{item.hadithNumber}
                </Text>
              </View>
              {item.status && (
                <View
                  className="px-3 pt-2 pb-1 rounded-full"
                  style={{
                    backgroundColor: item.status.toLowerCase() === 'sahih'
                      ? 'rgba(34, 197, 94, 0.2)'
                      : item.status.toLowerCase() === 'hasan'
                      ? 'rgba(234, 179, 8, 0.2)'
                      : 'rgba(239, 68, 68, 0.2)',
                  }}
                >
                  <Text
                    className="text-xs font-tajawal-medium"
                    style={{
                      color: item.status.toLowerCase() === 'sahih'
                        ? '#22c55e'
                        : item.status.toLowerCase() === 'hasan'
                        ? '#eab308'
                        : '#ef4444',
                    }}
                  >
                    {item.status}
                  </Text>
                </View>
              )}
            </View>
            <Pressable
              onPress={(e) => {
                e.stopPropagation();
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                removeBookmark(item.id);
              }}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              className="p-1.5"
            >
              <IconSymbol name="bookmark.fill" size={20} color={accentColor} />
            </Pressable>
          </View>

          {/* Book name */}
          <Text
            className="text-xs font-tajawal mb-2"
            style={{ color: textMuted }}
          >
            {item.book.bookName}
          </Text>

          {/* Narrator */}
          {item.englishNarrator && (
            <Text
              className="text-sm font-tajawal-medium mb-2"
              style={{ color: textSecondary }}
            >
              {cleanHadithText(item.englishNarrator)}
            </Text>
          )}

          {/* English text */}
          <Text
            className="text-base font-tajawal leading-relaxed mb-3"
            style={{ color: textColor }}
          >
            {cleanHadithText(item.hadithEnglish)}
          </Text>

          {/* Arabic text */}
          {item.hadithArabic && (
            <Text
              className="text-base font-amiri leading-loose text-right"
              style={{ color: textSecondary }}
            >
              {item.hadithArabic}
            </Text>
          )}
        </ThemedBlurView>
      </Animated.View>
    </Pressable>
  );

  const ListHeader = (
    <Animated.View entering={FadeInDown.duration(600)} className="items-center mb-6">
      <View className="flex-row items-center justify-between w-full">
        <Pressable onPress={handleBack} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <IconSymbol name="chevron.left" size={24} color={accentColor} />
        </Pressable>
        <View className="items-center flex-1">
          <Text
            className="text-2xl font-tajawal-bold text-center"
            style={{ color: textColor }}
          >
            Bookmarked Hadiths
          </Text>
          <Text
            className="text-sm font-tajawal text-center mt-1"
            style={{ color: textMuted }}
          >
            {bookmarkedHadiths.length} saved hadith{bookmarkedHadiths.length !== 1 ? 's' : ''}
          </Text>
        </View>
        <SettingsHeaderButton />
      </View>
    </Animated.View>
  );

  const EmptyState = (
    <View className="items-center py-16 gap-4">
      <IconSymbol name="bookmark" size={48} color={textMuted} />
      <Text
        className="text-base font-tajawal-medium text-center"
        style={{ color: textMuted }}
      >
        No bookmarked hadiths yet
      </Text>
      <Text
        className="text-sm font-tajawal text-center opacity-70"
        style={{ color: textMuted }}
      >
        Bookmark hadiths from the daily hadith or search results
      </Text>
    </View>
  );

  return (
    <View className="flex-1" style={{ backgroundColor }}>
      <ThemedStatusBar />
      <LinearGradient
        colors={gradientColors}
        style={StyleSheet.absoluteFill}
      />

      <FlatList
        data={bookmarkedHadiths}
        renderItem={renderHadithItem}
        keyExtractor={(item) => `bookmark-${item.id}`}
        contentContainerStyle={{ paddingTop: 60, paddingBottom: 120, paddingHorizontal: 16 }}
        ListHeaderComponent={ListHeader}
        ListEmptyComponent={EmptyState}
        ItemSeparatorComponent={() => <View className="h-3" />}
      />
    </View>
  );
}
