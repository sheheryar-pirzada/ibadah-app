import { IconSymbol } from '@/components/ui/IconSymbol';
import { ThemedBlurView } from '@/components/ThemedBlurView';
import { useTheme } from '@/contexts/ThemeContext';
import { useThemeColor } from '@/hooks/useThemeColor';
import { arabicAlphabet, ArabicLetter } from '@/utils/arabic-alphabet-data';
import { useArabicAudio } from '@/utils/arabic-audio';
import { arabicProgress } from '@/utils/arabic-progress';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect } from 'expo-router';
import React, { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import Animated, { FadeIn, FadeInUp, FadeOut } from 'react-native-reanimated';

export default function AlphabetScreen() {
  const { resolvedTheme } = useTheme();
  const [selectedLetter, setSelectedLetter] = useState<ArabicLetter | null>(null);
  const [learnedLetters, setLearnedLetters] = useState<Set<string>>(new Set());
  const { playArabic, isPlaying, isBuffering } = useArabicAudio();

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

  const handleLetterPress = (letter: ArabicLetter) => {
    Haptics.selectionAsync();
    setSelectedLetter(letter);
  };

  const handleMarkLearned = async () => {
    if (!selectedLetter) return;

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    const isLearned = learnedLetters.has(selectedLetter.id);
    if (isLearned) {
      await arabicProgress.markLetterUnlearned(selectedLetter.id);
      setLearnedLetters((prev) => {
        const next = new Set(prev);
        next.delete(selectedLetter.id);
        return next;
      });
    } else {
      await arabicProgress.markLetterLearned(selectedLetter.id);
      setLearnedLetters((prev) => new Set(prev).add(selectedLetter.id));
    }
  };

  const closeModal = () => {
    setSelectedLetter(null);
  };

  const handlePlayLetter = (letter: ArabicLetter) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    playArabic(letter.letter);
  };

  return (
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
        {/* Progress Header */}
        <Animated.View entering={FadeInUp.duration(500)} style={styles.header}>
          <Text style={[styles.headerTitle, { color: textColor }]}>
            {learnedLetters.size} of {arabicAlphabet.length} letters learned
          </Text>
          <View style={styles.progressBar}>
            <View
              style={[
                styles.progressFill,
                {
                  width: `${(learnedLetters.size / arabicAlphabet.length) * 100}%`,
                  backgroundColor: accentColor,
                },
              ]}
            />
          </View>
        </Animated.View>

        {/* Alphabet Grid */}
        <View style={styles.grid}>
          {arabicAlphabet.map((letter, index) => {
            const isLearned = learnedLetters.has(letter.id);
            return (
              <Animated.View
                key={letter.id}
                entering={FadeInUp.delay(index * 30).duration(400)}
              >
                <Pressable
                  onPress={() => handleLetterPress(letter)}
                  style={({ pressed }) => pressed && styles.letterPressed}
                >
                  <ThemedBlurView
                    intensity={20}
                    style={[
                      styles.letterCard,
                      { borderColor: isLearned ? '#22c55e' : cardBorder },
                      isLearned && styles.learnedCard,
                    ]}
                  >
                    <Text style={[styles.letterArabic, { color: textColor }]}>
                      {letter.letter}
                    </Text>
                    <Text style={[styles.letterName, { color: textMuted }]}>
                      {letter.name}
                    </Text>
                    {isLearned && (
                      <View style={styles.learnedBadge}>
                        <Text style={styles.learnedCheck}>✓</Text>
                      </View>
                    )}
                  </ThemedBlurView>
                </Pressable>
              </Animated.View>
            );
          })}
        </View>

        <View style={styles.bottomPadding} />
      </ScrollView>

      {/* Letter Detail Modal */}
      <Modal
        visible={!!selectedLetter}
        transparent
        animationType="fade"
        onRequestClose={closeModal}
      >
        <Pressable style={styles.modalOverlay} onPress={closeModal}>
          <Pressable onPress={(e) => e.stopPropagation()}>
            {selectedLetter && (
              <Animated.View entering={FadeIn.duration(200)} exiting={FadeOut.duration(150)}>
                <ThemedBlurView
                  intensity={resolvedTheme === 'dark' ? 40 : 60}
                  style={[
                    styles.modalContent,
                    {
                      borderColor: cardBorder,
                      backgroundColor: resolvedTheme === 'dark' ? 'rgba(0,0,0,0.5)' : 'rgba(255,255,255,0.7)',
                    },
                  ]}
                >
                  {/* Header */}
                  <View style={styles.modalHeader}>
                    <View style={styles.letterWithAudio}>
                      <Text style={[styles.modalLetter, { color: textColor }]}>
                        {selectedLetter.letter}
                      </Text>
                      <Pressable
                        onPress={() => handlePlayLetter(selectedLetter)}
                        style={[styles.audioButton, { backgroundColor: accentColor }]}
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
                    <View>
                      <Text style={[styles.modalName, { color: textColor }]}>
                        {selectedLetter.name}
                      </Text>
                      <Text style={[styles.modalNameArabic, { color: textSecondary }]}>
                        {selectedLetter.nameArabic}
                      </Text>
                    </View>
                  </View>

                  {/* Transliteration */}
                  <View style={[styles.modalSection, { borderTopColor: dividerColor }]}>
                    <Text style={[styles.sectionLabel, { color: textMuted }]}>
                      Transliteration
                    </Text>
                    <Text style={[styles.sectionValue, { color: textColor }]}>
                      {selectedLetter.transliteration}
                    </Text>
                  </View>

                  {/* Pronunciation */}
                  <View style={[styles.modalSection, { borderTopColor: dividerColor }]}>
                    <Text style={[styles.sectionLabel, { color: textMuted }]}>
                      Pronunciation
                    </Text>
                    <Text style={[styles.sectionValue, { color: textColor }]}>
                      {selectedLetter.pronunciation}
                    </Text>
                  </View>

                  {/* Letter Forms */}
                  <View style={[styles.modalSection, { borderTopColor: dividerColor }]}>
                    <Text style={[styles.sectionLabel, { color: textMuted }]}>
                      Letter Forms
                    </Text>
                    <View style={styles.formsRow}>
                      <View style={styles.formItem}>
                        <Text style={[styles.formLetter, { color: textColor }]}>
                          {selectedLetter.isolated}
                        </Text>
                        <Text style={[styles.formLabel, { color: textMuted }]}>
                          Isolated
                        </Text>
                      </View>
                      <View style={styles.formItem}>
                        <Text style={[styles.formLetter, { color: textColor }]}>
                          {selectedLetter.initial}
                        </Text>
                        <Text style={[styles.formLabel, { color: textMuted }]}>
                          Initial
                        </Text>
                      </View>
                      <View style={styles.formItem}>
                        <Text style={[styles.formLetter, { color: textColor }]}>
                          {selectedLetter.medial}
                        </Text>
                        <Text style={[styles.formLabel, { color: textMuted }]}>
                          Medial
                        </Text>
                      </View>
                      <View style={styles.formItem}>
                        <Text style={[styles.formLetter, { color: textColor }]}>
                          {selectedLetter.final}
                        </Text>
                        <Text style={[styles.formLabel, { color: textMuted }]}>
                          Final
                        </Text>
                      </View>
                    </View>
                  </View>

                  {/* Examples */}
                  <View style={[styles.modalSection, { borderTopColor: dividerColor }]}>
                    <Text style={[styles.sectionLabel, { color: textMuted }]}>
                      Examples
                    </Text>
                    {selectedLetter.examples.map((example, i) => (
                      <View key={i} style={styles.exampleRow}>
                        <Text style={[styles.exampleArabic, { color: textColor }]}>
                          {example.arabic}
                        </Text>
                        <Text style={[styles.exampleTranslit, { color: textSecondary }]}>
                          {example.transliteration}
                        </Text>
                        <Text style={[styles.exampleMeaning, { color: textMuted }]}>
                          {example.meaning}
                        </Text>
                      </View>
                    ))}
                  </View>

                  {/* Actions */}
                  <View style={styles.modalActions}>
                    <Pressable
                      onPress={handleMarkLearned}
                      style={[
                        styles.learnButton,
                        {
                          backgroundColor: learnedLetters.has(selectedLetter.id)
                            ? 'rgba(128, 128, 128, 0.2)'
                            : accentColor,
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.learnButtonText,
                          {
                            color: learnedLetters.has(selectedLetter.id)
                              ? textColor
                              : '#fff',
                          },
                        ]}
                      >
                        {learnedLetters.has(selectedLetter.id)
                          ? 'Mark as Not Learned'
                          : 'Mark as Learned'}
                      </Text>
                    </Pressable>

                    <Pressable onPress={closeModal} style={styles.closeButton}>
                      <Text style={[styles.closeButtonText, { color: accentColor }]}>
                        Close
                      </Text>
                    </Pressable>
                  </View>
                </ThemedBlurView>
              </Animated.View>
            )}
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 16,
    paddingHorizontal: 16,
  },
  header: {
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 16,
    fontFamily: 'Tajawal-Medium',
    marginBottom: 8,
    textAlign: 'center',
  },
  progressBar: {
    height: 6,
    backgroundColor: 'rgba(128, 128, 128, 0.2)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  grid: {
    flexDirection: 'row-reverse',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 10,
  },
  letterCard: {
    width: 72,
    height: 90,
    borderRadius: 16,
    borderWidth: 0.5,
    borderCurve: 'continuous',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  learnedCard: {
    borderWidth: 1.5,
  },
  letterPressed: {
    opacity: 0.7,
    transform: [{ scale: 0.95 }],
  },
  letterArabic: {
    fontSize: 32,
    fontFamily: 'Amiri-Bold',
  },
  letterName: {
    fontSize: 11,
    fontFamily: 'Tajawal-Regular',
    marginTop: 4,
  },
  learnedBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#22c55e',
    alignItems: 'center',
    justifyContent: 'center',
  },
  learnedCheck: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  bottomPadding: {
    height: 100,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    width: 340,
    maxHeight: '90%',
    borderRadius: 24,
    borderWidth: 0.5,
    borderCurve: 'continuous',
    overflow: 'hidden',
    padding: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 16,
  },
  letterWithAudio: {
    alignItems: 'center',
    gap: 8,
  },
  audioButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalLetter: {
    fontSize: 56,
    fontFamily: 'Amiri-Bold',
  },
  modalName: {
    fontSize: 24,
    fontFamily: 'Tajawal-Bold',
  },
  modalNameArabic: {
    fontSize: 18,
    fontFamily: 'Amiri-Regular',
  },
  modalSection: {
    paddingTop: 16,
    paddingBottom: 12,
    borderTopWidth: 0.5,
  },
  sectionLabel: {
    fontSize: 12,
    fontFamily: 'Tajawal-Medium',
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  sectionValue: {
    fontSize: 16,
    fontFamily: 'Tajawal-Regular',
  },
  formsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 8,
  },
  formItem: {
    alignItems: 'center',
  },
  formLetter: {
    fontSize: 28,
    fontFamily: 'Amiri-Bold',
  },
  formLabel: {
    fontSize: 10,
    fontFamily: 'Tajawal-Regular',
    marginTop: 4,
  },
  exampleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    gap: 12,
  },
  exampleArabic: {
    fontSize: 18,
    fontFamily: 'Amiri-Regular',
    minWidth: 50,
  },
  exampleTranslit: {
    fontSize: 14,
    fontFamily: 'Tajawal-Regular',
    minWidth: 80,
  },
  exampleMeaning: {
    fontSize: 13,
    fontFamily: 'Tajawal-Regular',
    flex: 1,
  },
  modalActions: {
    marginTop: 20,
    gap: 12,
  },
  learnButton: {
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  learnButtonText: {
    fontSize: 16,
    fontFamily: 'Tajawal-Bold',
  },
  closeButton: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 16,
    fontFamily: 'Tajawal-Medium',
  },
});
