import { ThemedBlurView } from '@/components/ThemedBlurView';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { useTheme } from '@/contexts/ThemeContext';
import { useThemeColor } from '@/hooks/useThemeColor';
import { useArabicAudio } from '@/utils/arabic-audio';
import { getLessonById } from '@/utils/arabic-lessons-data';
import { arabicProgress } from '@/utils/arabic-progress';
import { useInterstitialAd } from '@/utils/interstitial-ad';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  Text,
  View,
} from 'react-native';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function LessonDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { resolvedTheme } = useTheme();
  const insets = useSafeAreaInsets();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showWordBreakdown, setShowWordBreakdown] = useState(false);
  const { playArabic, isPlaying, isBuffering } = useArabicAudio();
  const { showAdIfReady } = useInterstitialAd();

  const lesson = getLessonById(id);

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
    if (lesson) {
      arabicProgress.startLesson(lesson.id);
    }
  }, [lesson]);

  useEffect(() => {
    if (lesson) {
      const progress = ((currentIndex + 1) / lesson.content.length) * 100;
      arabicProgress.updateLessonProgress(lesson.id, progress);
    }
  }, [currentIndex, lesson]);

  if (!lesson) {
    return (
      <View className="flex-1" style={{ backgroundColor }}>
        <Text className="text-lg font-tajawal-medium text-center mt-10" style={{ color: textColor }}>
          Lesson not found
        </Text>
      </View>
    );
  }

  const currentContent = lesson.content[currentIndex];
  const isLastItem = currentIndex === lesson.content.length - 1;
  const isFirstItem = currentIndex === 0;

  const handleNext = async () => {
    Haptics.selectionAsync();
    if (isLastItem) {
      handleComplete();
    } else {
      await showAdIfReady();
      setCurrentIndex((prev) => prev + 1);
      setShowWordBreakdown(false);
    }
  };

  const handlePrevious = () => {
    Haptics.selectionAsync();
    if (!isFirstItem) {
      setCurrentIndex((prev) => prev - 1);
      setShowWordBreakdown(false);
    }
  };

  const handleComplete = async () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    await arabicProgress.completeLesson(lesson.id);
    router.back();
  };

  const toggleWordBreakdown = () => {
    Haptics.selectionAsync();
    setShowWordBreakdown((prev) => !prev);
  };

  const handlePlayAudio = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    playArabic(currentContent.arabic);
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: lesson.title,
        }}
      />

      <View className="flex-1" style={{ backgroundColor }}>
        <LinearGradient
          colors={gradientColors}
          className="absolute inset-0"
        />

        <ScrollView
          contentInsetAdjustmentBehavior="automatic"
          contentContainerClassName="pt-4 px-4 pb-[180px]"
          showsVerticalScrollIndicator={false}
        >
          {/* Progress Indicator */}
          <Animated.View entering={FadeInDown.duration(500)} className="mb-6">
            <View className="flex-row justify-between items-center mb-2">
              <Text className="text-sm font-tajawal-medium" style={{ color: textMuted }}>
                {currentIndex + 1} of {lesson.content.length}
              </Text>
              <View className="px-2.5 pt-1.5 pb-1 rounded-xl" style={{
                backgroundColor: lesson.level === 'beginner' ? 'rgba(34, 197, 94, 0.2)'
                  : lesson.level === 'intermediate' ? 'rgba(234, 179, 8, 0.2)'
                  : 'rgba(239, 68, 68, 0.2)',
              }}>
                <Text className="text-sm font-tajawal-medium capitalize" style={{
                  color: lesson.level === 'beginner' ? '#22c55e'
                    : lesson.level === 'intermediate' ? '#eab308'
                    : '#ef4444',
                }}>
                  {lesson.level}
                </Text>
              </View>
            </View>
            <View className="h-1 overflow-hidden rounded" style={{ backgroundColor: 'rgba(128, 128, 128, 0.2)' }}>
              <View
                style={[
                  {
                    width: `${((currentIndex + 1) / lesson.content.length) * 100}%`,
                    backgroundColor: accentColor,
                    height: '100%',
                    borderRadius: 2,
                  },
                ]}
              />
            </View>
          </Animated.View>

          {/* Content Card */}
          <Animated.View
            key={currentIndex}
            entering={FadeInUp.duration(400)}
          >
            <ThemedBlurView
              intensity={25}
              className="overflow-hidden rounded-3xl"
              style={{ borderCurve: 'continuous', borderWidth: 0.5, borderColor: cardBorder }}
            >
              {/* Arabic Text */}
              <View className="p-8 items-center gap-4">
                <Text className="text-4xl leading-[56px] font-[Amiri-Bold] text-center" style={{ color: textColor }}>
                  {currentContent.arabic}
                </Text>
                <Pressable
                  onPress={handlePlayAudio}
                  className="w-11 h-11 rounded-full justify-center items-center"
                  style={{ backgroundColor: accentColor }}
                >
                  {isBuffering ? (
                    <ActivityIndicator size="small" color="#fff" />
                  ) : (
                    <IconSymbol
                      name={isPlaying ? 'stop.fill' : 'play.fill'}
                      size={18}
                      color="#fff"
                    />
                  )}
                </Pressable>
              </View>

              {/* Transliteration */}
              <View className="p-5 border-t" style={{ borderTopColor: dividerColor, borderTopWidth: 0.5 }}>
                <Text className="text-[11px] font-tajawal-bold uppercase tracking-[1px] mb-2" style={{ color: textMuted }}>
                  Transliteration
                </Text>
                <Text className="text-base leading-6 font-sans italic" style={{ color: textSecondary }}>
                  {currentContent.transliteration}
                </Text>
              </View>

              {/* Translation */}
              <View className="p-5 border-t" style={{ borderTopColor: dividerColor, borderTopWidth: 0.5 }}>
                <Text className="text-[11px] font-tajawal-bold uppercase tracking-[1px] mb-2" style={{ color: textMuted }}>
                  Translation
                </Text>
                <Text className="text-base leading-6 font-sans" style={{ color: textColor }}>
                  {currentContent.translation}
                </Text>
              </View>

              {/* Word Breakdown (if available) */}
              {currentContent.wordBreakdown && currentContent.wordBreakdown.length > 0 && (
                <View className="p-5 border-t" style={{ borderTopColor: dividerColor, borderTopWidth: 0.5 }}>
                  <Pressable onPress={toggleWordBreakdown} className="flex-row justify-between items-center">
                    <Text className="text-[11px] font-tajawal-bold uppercase tracking-[1px]" style={{ color: textMuted }}>
                      Word Breakdown
                    </Text>
                    <Text className="text-sm font-tajawal-bold" style={{ color: accentColor }}>
                      {showWordBreakdown ? '▲' : '▼'}
                    </Text>
                  </Pressable>

                  {showWordBreakdown && (
                    <Animated.View entering={FadeInDown.duration(300)}>
                      {currentContent.wordBreakdown.map((word, i) => (
                        <View
                          key={i}
                          className="flex-row items-center py-3"
                          style={i > 0 ? { borderTopColor: dividerColor, borderTopWidth: 0.5 } : undefined}
                        >
                          <Text className="text-xl font-amiri w-24 text-right" style={{ color: textColor }}>
                            {word.arabic}
                          </Text>
                          <View className="flex-1 pl-4">
                            <Text className="text-sm font-sans" style={{ color: textSecondary }}>
                              {word.transliteration}
                            </Text>
                            <Text className="text-xs font-sans mt-0.5" style={{ color: textMuted }}>
                              {word.meaning}
                            </Text>
                          </View>
                        </View>
                      ))}
                    </Animated.View>
                  )}
                </View>
              )}
            </ThemedBlurView>
          </Animated.View>

          {/* Navigation Dots */}
          <View className="flex-row justify-center items-center gap-2 mt-6">
            {lesson.content.map((_, i) => (
              <Pressable
                key={i}
                onPress={() => {
                  Haptics.selectionAsync();
                  setCurrentIndex(i);
                  setShowWordBreakdown(false);
                }}
              >
                <View
                  className="h-2 rounded-full"
                  style={{
                    backgroundColor: i === currentIndex ? accentColor : dividerColor,
                    width: i === currentIndex ? 24 : 8,
                  }}
                />
              </Pressable>
            ))}
          </View>
        </ScrollView>

        {/* Navigation Buttons */}
        <View
          className="absolute left-0 right-0 flex-row justify-between px-4"
          style={{ bottom: insets.bottom + 70 }}
        >
          <Pressable
            onPress={handlePrevious}
            disabled={isFirstItem}
            className={isFirstItem ? 'opacity-40' : undefined}
          >
            <ThemedBlurView
              intensity={20}
              className="flex-row items-center gap-2 px-4 py-3 overflow-hidden rounded-2xl"
              style={{ borderCurve: 'continuous', borderWidth: 0.5, borderColor: cardBorder }}
            >
              <IconSymbol
                name="chevron.left"
                size={16}
                color={isFirstItem ? textMuted : textColor}
              />
              <Text className="text-sm font-tajawal-medium" style={{ color: isFirstItem ? textMuted : textColor }}>
                Previous
              </Text>
            </ThemedBlurView>
          </Pressable>

          <Pressable onPress={handleNext}>
            <View className="flex-row items-center gap-2 px-5 py-3 rounded-2xl" style={{ backgroundColor: accentColor }}>
              <Text className="text-sm font-tajawal-bold text-white">
                {isLastItem ? 'Complete' : 'Next'}
              </Text>
              <IconSymbol
                name={isLastItem ? 'checkmark' : 'chevron.right'}
                size={16}
                color="#fff"
              />
            </View>
          </Pressable>
        </View>
      </View>
    </>
  );
}
