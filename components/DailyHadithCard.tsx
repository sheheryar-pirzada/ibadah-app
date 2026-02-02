import * as Haptics from 'expo-haptics';
import { Link } from 'expo-router';
import React from 'react';
import { ActivityIndicator, Pressable, Text, View } from 'react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';

// @ts-expect-error - AppleZoom types not fully exported in SDK 55 preview
const AppleZoom = Link.AppleZoom;

import { ThemedBlurView } from '@/components/ThemedBlurView';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { useThemeColor } from '@/hooks/useThemeColor';
import { cleanHadithText, Hadith, useHadithSettings } from '@/utils/hadith-settings';

interface DailyHadithCardProps {
  hadith: Hadith | null;
  isLoading?: boolean;
}

export default function DailyHadithCard({ hadith, isLoading }: DailyHadithCardProps) {
  const textColor = useThemeColor({}, 'text');
  const textSecondary = useThemeColor({}, 'textSecondary');
  const textMuted = useThemeColor({}, 'textMuted');
  const accentColor = useThemeColor({}, 'accent');
  const cardBorder = useThemeColor({}, 'cardBorder');
  const dividerColor = useThemeColor({}, 'divider');

  const { addBookmark, removeBookmark, bookmarkedHadiths } = useHadithSettings();
  const isBookmarked = hadith ? bookmarkedHadiths.some((h) => h.id === hadith.id) : false;

  const handleBookmarkPress = (e: { stopPropagation: () => void }) => {
    e.stopPropagation();
    if (!hadith) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    if (isBookmarked) {
      removeBookmark(hadith.id);
    } else {
      addBookmark(hadith);
    }
  };

  if (isLoading || !hadith) {
    return (
      <Animated.View
        entering={FadeInUp.delay(400).duration(800)}
        className="mb-6 rounded-3xl overflow-hidden border"
        style={{ borderColor: cardBorder, borderCurve: 'continuous' }}
      >
        <ThemedBlurView intensity={25} className="p-5">
          <View className="flex-row items-center justify-center gap-3 py-5">
            <ActivityIndicator size="small" color={accentColor} />
            <Text
              className="text-sm"
              style={{ color: textMuted, fontFamily: 'Tajawal-Regular' }}
            >
              Loading hadith of the day...
            </Text>
          </View>
        </ThemedBlurView>
      </Animated.View>
    );
  }

  const reference = `${hadith.book.bookName} ${hadith.hadithNumber}`;

  return (
    <Link
      href={{
        pathname: '/share',
        params: {
          arabic: hadith.hadithArabic,
          translation: cleanHadithText(hadith.hadithEnglish),
          reference: reference,
        },
      }}
      asChild
      onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)}
    >
      <Pressable>
        <AppleZoom>
          <Animated.View
            entering={FadeInUp.delay(400).duration(800)}
            className="mb-6 overflow-hidden"
            style={{ borderColor: cardBorder, borderCurve: 'continuous', borderRadius: 40, borderWidth: 0.5 }}
          >
            <ThemedBlurView intensity={25} className="p-5">
              <View className="w-full">
                <View className="flex-row justify-between items-center mb-4">
                  <Text
                    className="text-xs uppercase tracking-wider"
                    style={{ color: textMuted, fontFamily: 'Tajawal-Bold' }}
                  >
                    Hadith of the Day
                  </Text>
                  <View className="flex-row items-center gap-1">
                    <View className="p-1.5 rounded-lg">
                      <IconSymbol
                        name="square.and.arrow.up"
                        size={20}
                        color={String(textMuted)}
                      />
                    </View>
                    <Pressable
                      onPress={handleBookmarkPress}
                      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                      className="p-1.5 rounded-lg"
                    >
                      <IconSymbol
                        name={isBookmarked ? 'bookmark.fill' : 'bookmark'}
                        size={20}
                        color={isBookmarked ? String(accentColor) : String(textMuted)}
                      />
                    </Pressable>
                  </View>
                </View>

                <View className="gap-3">
                  {hadith.hadithArabic && (
                    <Text
                      className="text-2xl text-right leading-[46px]"
                      style={{ color: textColor, fontFamily: 'Amiri-Regular' }}
                    >
                      {hadith.hadithArabic}
                    </Text>
                  )}

                  <View
                    className="pt-2 border-t"
                    style={{ borderTopColor: dividerColor }}
                  >
                    {hadith.englishNarrator && (
                      <Text
                        className="text-sm mb-2"
                        style={{ color: textMuted, fontFamily: 'Tajawal-Bold' }}
                      >
                        {cleanHadithText(hadith.englishNarrator)}
                      </Text>
                    )}
                    <Text
                      className="text-md leading-[22px]"
                      style={{ color: textSecondary, fontFamily: 'Tajawal-Regular' }}
                    >
                      {cleanHadithText(hadith.hadithEnglish)}
                    </Text>
                  </View>

                  <Text
                    className="text-[13px] mt-1 text-right"
                    style={{ color: accentColor, fontFamily: 'Tajawal-Medium' }}
                  >
                    {reference}
                  </Text>
                </View>
              </View>
            </ThemedBlurView>
          </Animated.View>
        </AppleZoom>
      </Pressable>
    </Link>
  );
}
