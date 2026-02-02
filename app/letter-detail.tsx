import { ThemedBlurView } from '@/components/ThemedBlurView';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { useTheme } from '@/contexts/ThemeContext';
import { useThemeColor } from '@/hooks/useThemeColor';
import { arabicProgress } from '@/utils/arabic-progress';
import { getLetterById } from '@/utils/arabic-alphabet-data';
import { useArabicAudio } from '@/utils/arabic-audio';
import * as Haptics from 'expo-haptics';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function LetterDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const letter = id ? getLetterById(id) : null;

  const { resolvedTheme } = useTheme();
  const [isLearned, setIsLearned] = useState(false);
  const { playArabic, isPlaying, isBuffering } = useArabicAudio();
  const insets = useSafeAreaInsets();

  const textColor = useThemeColor({}, 'text');
  const textMuted = useThemeColor({}, 'textMuted');
  const textSecondary = useThemeColor({}, 'textSecondary');
  const accentColor = useThemeColor({}, 'accent');
  const cardBorder = useThemeColor({}, 'cardBorder');
  const dividerColor = useThemeColor({}, 'divider');
  const backgroundColor = useThemeColor({}, 'background');

  useEffect(() => {
    const loadProgress = async () => {
      if (!letter) return;
      await arabicProgress.initialize();
      const progress = arabicProgress.getLetterProgress(letter.id);
      setIsLearned(progress?.learned ?? false);
    };
    loadProgress();
  }, [letter]);

  const handleMarkLearned = useCallback(async () => {
    if (!letter) return;

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    if (isLearned) {
      await arabicProgress.markLetterUnlearned(letter.id);
      setIsLearned(false);
    } else {
      await arabicProgress.markLetterLearned(letter.id);
      setIsLearned(true);
    }
  }, [letter, isLearned]);

  const handlePlayLetter = useCallback(() => {
    if (!letter) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    playArabic(letter.letter);
  }, [letter, playArabic]);

  const handleClose = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.back();
  };

  if (!letter) {
    return (
      <View className="flex-1 justify-center items-center" style={{ backgroundColor }}>
        <ThemedBlurView intensity={80} style={StyleSheet.absoluteFill} />
        <Text className="text-base font-tajawal-medium" style={{ color: textColor }}>
          Letter not found
        </Text>
      </View>
    );
  }

  return (
    <View className="flex-1 justify-center items-center" style={{ backgroundColor }}>
      <ThemedBlurView intensity={80} style={StyleSheet.absoluteFill} />

      {/* Close button */}
      <Pressable
        onPress={handleClose}
        className="absolute right-4 z-10"
        style={{ top: insets.top }}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      >
        <IconSymbol name="xmark.circle.fill" size={32} color={String(textMuted)} />
      </Pressable>

      {/* Content card */}
      <View
        className="mt-12"
        style={{ width: SCREEN_WIDTH - 48, maxWidth: 400, maxHeight: '80%' }}
      >
        <View
          className="rounded-[32px] overflow-hidden"
          style={{ borderColor: cardBorder, borderWidth: 0.5, borderCurve: 'continuous' }}
        >
          <ThemedBlurView intensity={resolvedTheme === 'dark' ? 40 : 60} className="overflow-hidden">
            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ padding: 24, paddingBottom: 16 }}
            >
              {/* Header - RTL layout */}
              <View className="flex-row-reverse items-center mb-4 gap-4">
                <View className="items-center gap-2">
                  <Text className="text-[56px] font-amiri-bold" style={{ color: textColor }}>
                    {letter.letter}
                  </Text>
                  <Pressable
                    onPress={handlePlayLetter}
                    className="w-9 h-9 rounded-full justify-center items-center"
                    style={{ backgroundColor: accentColor }}
                  >
                    {isBuffering ? (
                      <ActivityIndicator size="small" color="#fff" />
                    ) : (
                      <IconSymbol
                        name={isPlaying ? 'stop.fill' : 'play.fill'}
                        size={16}
                        color="#fff"
                      />
                    )}
                  </Pressable>
                </View>
                <View className="flex-1 items-end">
                  <Text className="text-2xl font-tajawal-bold" style={{ color: textColor }}>
                    {letter.name}
                  </Text>
                  <Text className="text-lg font-amiri" style={{ color: textSecondary }}>
                    {letter.nameArabic}
                  </Text>
                </View>
              </View>

              {/* Transliteration */}
              <View
                className="pt-4 pb-3 border-t-[0.5px]"
                style={{ borderTopColor: dividerColor }}
              >
                <Text
                  className="text-xs font-tajawal-medium mb-1.5 uppercase tracking-wide"
                  style={{ color: textMuted }}
                >
                  Transliteration
                </Text>
                <Text className="text-base font-tajawal" style={{ color: textColor }}>
                  {letter.transliteration}
                </Text>
              </View>

              {/* Pronunciation */}
              <View
                className="pt-4 pb-3 border-t-[0.5px]"
                style={{ borderTopColor: dividerColor }}
              >
                <Text
                  className="text-xs font-tajawal-medium mb-1.5 uppercase tracking-wide"
                  style={{ color: textMuted }}
                >
                  Pronunciation
                </Text>
                <Text className="text-base font-tajawal" style={{ color: textColor }}>
                  {letter.pronunciation}
                </Text>
              </View>

              {/* Letter Forms - RTL order */}
              <View
                className="pt-4 pb-3 border-t-[0.5px]"
                style={{ borderTopColor: dividerColor }}
              >
                <Text
                  className="text-xs font-tajawal-medium mb-1.5 uppercase tracking-wide"
                  style={{ color: textMuted }}
                >
                  Letter Forms
                </Text>
                <View className="flex-row-reverse justify-around mt-2">
                  <View className="items-center">
                    <Text className="text-[28px] font-amiri-bold" style={{ color: textColor }}>
                      {letter.final}
                    </Text>
                    <Text className="text-[10px] font-tajawal mt-1" style={{ color: textMuted }}>
                      Final
                    </Text>
                  </View>
                  <View className="items-center">
                    <Text className="text-[28px] font-amiri-bold" style={{ color: textColor }}>
                      {letter.medial}
                    </Text>
                    <Text className="text-[10px] font-tajawal mt-1" style={{ color: textMuted }}>
                      Medial
                    </Text>
                  </View>
                  <View className="items-center">
                    <Text className="text-[28px] font-amiri-bold" style={{ color: textColor }}>
                      {letter.initial}
                    </Text>
                    <Text className="text-[10px] font-tajawal mt-1" style={{ color: textMuted }}>
                      Initial
                    </Text>
                  </View>
                  <View className="items-center">
                    <Text className="text-[28px] font-amiri-bold" style={{ color: textColor }}>
                      {letter.isolated}
                    </Text>
                    <Text className="text-[10px] font-tajawal mt-1" style={{ color: textMuted }}>
                      Isolated
                    </Text>
                  </View>
                </View>
              </View>

              {/* Examples - RTL grid, 2 per row */}
              <View
                className="pt-4 pb-3 border-t-[0.5px]"
                style={{ borderTopColor: dividerColor }}
              >
                <Text
                  className="text-xs font-tajawal-medium mb-2 uppercase tracking-wide"
                  style={{ color: textMuted }}
                >
                  Examples
                </Text>
                <View className="flex-row-reverse flex-wrap">
                  {letter.examples.map((example, i) => (
                    <View key={i} className="w-1/2 items-center py-2 gap-0.5">
                      <Text
                        className="text-xl font-amiri text-center"
                        style={{ color: textColor, writingDirection: 'rtl' }}
                      >
                        {example.arabic}
                      </Text>
                      <Text className="text-xs font-tajawal italic" style={{ color: textSecondary }}>
                        {example.transliteration}
                      </Text>
                      <Text className="text-[11px] font-tajawal" style={{ color: textMuted }}>
                        {example.meaning}
                      </Text>
                    </View>
                  ))}
                </View>
              </View>
            </ScrollView>

            {/* Actions - Fixed at bottom */}
            <View className="px-6 pb-6 pt-2">
              <Pressable
                onPress={handleMarkLearned}
                className="py-3.5 rounded-xl items-center"
                style={{
                  backgroundColor: isLearned ? 'rgba(128, 128, 128, 0.2)' : accentColor,
                }}
              >
                <Text
                  className="text-base font-tajawal-bold"
                  style={{ color: isLearned ? textColor : '#fff' }}
                >
                  {isLearned ? 'Mark as Not Learned' : 'Mark as Learned'}
                </Text>
              </Pressable>
            </View>
          </ThemedBlurView>
        </View>
      </View>
    </View>
  );
}
