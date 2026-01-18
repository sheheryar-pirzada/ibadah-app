import { ThemedBlurView } from '@/components/ThemedBlurView';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { useTheme } from '@/contexts/ThemeContext';
import { useThemeColor } from '@/hooks/useThemeColor';
import { useArabicAudio } from '@/utils/arabic-audio';
import { getLessonById } from '@/utils/arabic-lessons-data';
import { arabicProgress } from '@/utils/arabic-progress';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
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
      <View style={[styles.container, { backgroundColor }]}>
        <Text style={[styles.errorText, { color: textColor }]}>
          Lesson not found
        </Text>
      </View>
    );
  }

  const currentContent = lesson.content[currentIndex];
  const isLastItem = currentIndex === lesson.content.length - 1;
  const isFirstItem = currentIndex === 0;

  const handleNext = () => {
    Haptics.selectionAsync();
    if (isLastItem) {
      handleComplete();
    } else {
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

      <View style={[styles.container, { backgroundColor }]}>
        <LinearGradient
          colors={gradientColors}
          style={StyleSheet.absoluteFillObject}
        />

        <ScrollView
          contentInsetAdjustmentBehavior="automatic"
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Progress Indicator */}
          <Animated.View entering={FadeInDown.duration(500)} style={styles.progressSection}>
            <View style={styles.progressHeader}>
              <Text style={[styles.progressText, { color: textMuted }]}>
                {currentIndex + 1} of {lesson.content.length}
              </Text>
              <View style={[styles.levelBadge, {
                backgroundColor: lesson.level === 'beginner' ? 'rgba(34, 197, 94, 0.2)'
                  : lesson.level === 'intermediate' ? 'rgba(234, 179, 8, 0.2)'
                  : 'rgba(239, 68, 68, 0.2)',
              }]}>
                <Text style={[styles.levelText, {
                  color: lesson.level === 'beginner' ? '#22c55e'
                    : lesson.level === 'intermediate' ? '#eab308'
                    : '#ef4444',
                }]}>
                  {lesson.level}
                </Text>
              </View>
            </View>
            <View style={styles.progressBar}>
              <View
                style={[
                  styles.progressFill,
                  {
                    width: `${((currentIndex + 1) / lesson.content.length) * 100}%`,
                    backgroundColor: accentColor,
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
              style={[styles.contentCard, { borderColor: cardBorder }]}
            >
              {/* Arabic Text */}
              <View style={styles.arabicSection}>
                <Text style={[styles.arabicText, { color: textColor }]}>
                  {currentContent.arabic}
                </Text>
                <Pressable
                  onPress={handlePlayAudio}
                  style={[styles.playButton, { backgroundColor: accentColor }]}
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
              <View style={[styles.section, { borderTopColor: dividerColor }]}>
                <Text style={[styles.sectionLabel, { color: textMuted }]}>
                  Transliteration
                </Text>
                <Text style={[styles.transliteration, { color: textSecondary }]}>
                  {currentContent.transliteration}
                </Text>
              </View>

              {/* Translation */}
              <View style={[styles.section, { borderTopColor: dividerColor }]}>
                <Text style={[styles.sectionLabel, { color: textMuted }]}>
                  Translation
                </Text>
                <Text style={[styles.translation, { color: textColor }]}>
                  {currentContent.translation}
                </Text>
              </View>

              {/* Word Breakdown (if available) */}
              {currentContent.wordBreakdown && currentContent.wordBreakdown.length > 0 && (
                <View style={[styles.section, { borderTopColor: dividerColor }]}>
                  <Pressable onPress={toggleWordBreakdown} style={styles.breakdownToggle}>
                    <Text style={[styles.sectionLabel, { color: textMuted }]}>
                      Word Breakdown
                    </Text>
                    <Text style={[styles.toggleIcon, { color: accentColor }]}>
                      {showWordBreakdown ? '▲' : '▼'}
                    </Text>
                  </Pressable>

                  {showWordBreakdown && (
                    <Animated.View entering={FadeInDown.duration(300)}>
                      {currentContent.wordBreakdown.map((word, i) => (
                        <View
                          key={i}
                          style={[
                            styles.wordRow,
                            i > 0 && { borderTopColor: dividerColor, borderTopWidth: 0.5 },
                          ]}
                        >
                          <Text style={[styles.wordArabic, { color: textColor }]}>
                            {word.arabic}
                          </Text>
                          <View style={styles.wordDetails}>
                            <Text style={[styles.wordTranslit, { color: textSecondary }]}>
                              {word.transliteration}
                            </Text>
                            <Text style={[styles.wordMeaning, { color: textMuted }]}>
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
          <View style={styles.dotsContainer}>
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
                  style={[
                    styles.dot,
                    {
                      backgroundColor: i === currentIndex ? accentColor : dividerColor,
                      width: i === currentIndex ? 24 : 8,
                    },
                  ]}
                />
              </Pressable>
            ))}
          </View>
        </ScrollView>

        {/* Navigation Buttons */}
        <View style={[styles.navigationBar, { bottom: insets.bottom + 70 }]}>
          <Pressable
            onPress={handlePrevious}
            disabled={isFirstItem}
            style={[
              styles.navButton,
              isFirstItem && styles.navButtonDisabled,
            ]}
          >
            <ThemedBlurView
              intensity={20}
              style={[styles.navButtonInner, { borderColor: cardBorder }]}
            >
              <IconSymbol
                name="chevron.left"
                size={16}
                color={isFirstItem ? textMuted : textColor}
              />
              <Text style={[styles.navButtonText, { color: isFirstItem ? textMuted : textColor }]}>
                Previous
              </Text>
            </ThemedBlurView>
          </Pressable>

          <Pressable onPress={handleNext} style={styles.navButton}>
            <View style={[styles.navButtonPrimary, { backgroundColor: accentColor }]}>
              <Text style={styles.navButtonPrimaryText}>
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 16,
    paddingHorizontal: 16,
    paddingBottom: 180,
  },
  errorText: {
    fontSize: 18,
    fontFamily: 'Tajawal-Medium',
    textAlign: 'center',
    marginTop: 40,
  },
  progressSection: {
    marginBottom: 24,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  progressText: {
    fontSize: 14,
    fontFamily: 'Tajawal-Medium',
  },
  levelBadge: {
    paddingHorizontal: 10,
    paddingTop: 6,
    paddingBottom: 3,
    borderRadius: 12,
  },
  levelText: {
    fontSize: 14,
    fontFamily: 'Tajawal-Medium',
    textTransform: 'capitalize',
  },
  progressBar: {
    height: 4,
    backgroundColor: 'rgba(128, 128, 128, 0.2)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },
  contentCard: {
    borderRadius: 24,
    borderWidth: 0.5,
    borderCurve: 'continuous',
    overflow: 'hidden',
  },
  arabicSection: {
    padding: 32,
    alignItems: 'center',
    gap: 16,
  },
  arabicText: {
    fontSize: 36,
    fontFamily: 'Amiri-Bold',
    textAlign: 'center',
    lineHeight: 56,
  },
  playButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  section: {
    padding: 20,
    borderTopWidth: 0.5,
  },
  sectionLabel: {
    fontSize: 11,
    fontFamily: 'Tajawal-Medium',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  transliteration: {
    fontSize: 18,
    fontFamily: 'Tajawal-Regular',
    fontStyle: 'italic',
  },
  translation: {
    fontSize: 16,
    fontFamily: 'Tajawal-Regular',
    lineHeight: 24,
  },
  breakdownToggle: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  toggleIcon: {
    fontSize: 12,
  },
  wordRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    gap: 16,
  },
  wordArabic: {
    fontSize: 22,
    fontFamily: 'Amiri-Bold',
    minWidth: 60,
  },
  wordDetails: {
    flex: 1,
  },
  wordTranslit: {
    fontSize: 14,
    fontFamily: 'Tajawal-Medium',
    fontStyle: 'italic',
  },
  wordMeaning: {
    fontSize: 13,
    fontFamily: 'Tajawal-Regular',
    marginTop: 2,
  },
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 24,
    gap: 6,
  },
  dot: {
    height: 8,
    borderRadius: 4,
  },
  navigationBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 12,
  },
  navButton: {
    flex: 1,
  },
  navButtonDisabled: {
    opacity: 0.5,
  },
  navButtonInner: {
    flexDirection: 'row',
    paddingVertical: 14,
    borderRadius: 16,
    borderWidth: 0.5,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    overflow: 'hidden',
  },
  navButtonText: {
    fontSize: 15,
    fontFamily: 'Tajawal-Medium',
    marginTop: 4,
  },
  navButtonPrimary: {
    flexDirection: 'row',
    paddingVertical: 14,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  navButtonPrimaryText: {
    fontSize: 16,
    fontFamily: 'Tajawal-Bold',
    color: '#fff',
    marginTop: 4,
  },
});
