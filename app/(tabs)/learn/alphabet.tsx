import { BackgroundImage } from '@/components/BackgroundImage';
import { ThemedBlurView } from '@/components/ThemedBlurView';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { useTheme } from '@/contexts/ThemeContext';
import { useThemeColor } from '@/hooks/useThemeColor';
import { arabicAlphabet } from '@/utils/arabic-alphabet-data';
import { arabicProgress } from '@/utils/arabic-progress';
import * as Haptics from 'expo-haptics';
import { Link, useFocusEffect } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';

export default function AlphabetScreen() {
  const { resolvedTheme } = useTheme();
  const [learnedLetters, setLearnedLetters] = useState<Set<string>>(new Set());

  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const textMuted = useThemeColor({}, 'textMuted');
  const accentColor = useThemeColor({}, 'accent');
  const cardBorder = useThemeColor({}, 'cardBorder');

  const loadProgress = useCallback(async () => {
    await arabicProgress.initialize();
    const progress = arabicProgress.getAllLetterProgress();
    const learned = new Set(
      progress.filter((p) => p.learned).map((p) => p.letterId)
    );
    setLearnedLetters(learned);
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadProgress();
    }, [loadProgress])
  );

  return (
    <BackgroundImage>
    <View className="flex-1" style={{ backgroundColor: 'transparent' }}>

      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        contentContainerStyle={{ paddingTop: 16, paddingHorizontal: 16 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Progress Header */}
        <Animated.View entering={FadeInUp.duration(500)} className="mb-5">
          <Text
            className="text-base font-tajawal-medium mb-2 text-center"
            style={{ color: textColor }}
          >
            {learnedLetters.size} of {arabicAlphabet.length} letters learned
          </Text>
          <View className="h-1.5 bg-gray-500/20 rounded-full overflow-hidden">
            <View
              className="h-full rounded-full"
              style={{
                width: `${(learnedLetters.size / arabicAlphabet.length) * 100}%`,
                backgroundColor: accentColor,
              }}
            />
          </View>
        </Animated.View>

        {/* Alphabet Grid */}
        <View className="flex-row-reverse flex-wrap justify-between gap-x-2.5 gap-y-4">
          {arabicAlphabet.map((letter, index) => {
            const isLearned = learnedLetters.has(letter.id);
            return (
              <Animated.View
                key={letter.id}
                entering={FadeInUp.delay(index * 30).duration(400)}
              >
                <Link
                  href={{ pathname: '/letter-detail', params: { id: letter.id } }}
                  asChild
                  onPress={() => Haptics.selectionAsync()}
                >
                  <Pressable className="active:opacity-70 active:scale-95">
                    <ThemedBlurView
                      intensity={20}
                      className="w-[72px] h-[90px] rounded-2xl items-center justify-center overflow-hidden"
                      style={{
                        borderColor: isLearned ? '#22c55e' : cardBorder,
                        borderWidth: isLearned ? 1.5 : 0.5,
                        borderCurve: 'continuous',
                      }}
                    >
                      <Text className="text-[32px] font-amiri-bold" style={{ color: textColor }}>
                        {letter.letter}
                      </Text>
                      <Text
                        className="text-[11px] font-tajawal mt-1"
                        style={{ color: textMuted }}
                      >
                        {letter.name.split(' ')[0]}
                      </Text>
                      {isLearned && (
                        <View className="absolute top-1 right-1 w-[18px] h-[18px] rounded-full bg-green-500 items-center justify-center">
                          <IconSymbol name="checkmark" size={12} color="#fff" weight="bold" />
                        </View>
                      )}
                    </ThemedBlurView>
                  </Pressable>
                </Link>
              </Animated.View>
            );
          })}
        </View>

        <View className="h-[100px]" />
      </ScrollView>
    </View>
    </BackgroundImage>
  );
}
