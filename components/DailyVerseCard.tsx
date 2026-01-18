import React, { useState, useCallback } from 'react';
import {
    ActivityIndicator,
    Pressable,
    StyleSheet,
    Text,
    View,
} from 'react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';

import AudioPlayer from '@/components/AudioPlayer';
import ShareModal from '@/components/ShareModal';
import { ThemedBlurView } from '@/components/ThemedBlurView';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { useThemeColor } from '@/hooks/useThemeColor';
import { quranAPI } from '@/utils/quran-api';
import { QuranVerse } from '@/utils/quran-verse';
import { getReciterSettings } from '@/utils/reciter-settings';

interface DailyVerseCardProps {
  verse: QuranVerse | null;
  isLoading?: boolean;
  onPress?: () => void;
}

export default function DailyVerseCard({ verse, isLoading, onPress }: DailyVerseCardProps) {
  const [showAudioPlayer, setShowAudioPlayer] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isLoadingAudio, setIsLoadingAudio] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);

  // Theme colors
  const textColor = useThemeColor({}, 'text');
  const textSecondary = useThemeColor({}, 'textSecondary');
  const textMuted = useThemeColor({}, 'textMuted');
  const accentColor = useThemeColor({}, 'accent');
  const cardBorder = useThemeColor({}, 'cardBorder');
  const dividerColor = useThemeColor({}, 'divider');

  const handlePlayAudio = useCallback(async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    if (showAudioPlayer) {
      setShowAudioPlayer(false);
      return;
    }

    if (!verse) return;

    const verseKey = `${verse.surahNumber}:${verse.ayahNumber}`;

    setShowAudioPlayer(true);

    if (!audioUrl) {
      setIsLoadingAudio(true);
      try {
        const settings = await getReciterSettings();
        const audio = await quranAPI.getVerseAudio(verseKey, settings.reciterId);
        if (audio?.url) {
          setAudioUrl(audio.url);
        }
      } catch (error) {
        console.error('Error fetching audio:', error);
      } finally {
        setIsLoadingAudio(false);
      }
    }
  }, [showAudioPlayer, verse, audioUrl]);

  const handleShare = useCallback(() => {
    if (!verse) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setShowShareModal(true);
  }, [verse]);

  if (isLoading || !verse) {
    return (
      <Animated.View entering={FadeInUp.delay(300).duration(800)} style={[styles.card, { borderColor: cardBorder }]}>
        <ThemedBlurView intensity={25} style={styles.blur}>
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="small" color={accentColor} />
            <Text style={[styles.loadingText, { color: textMuted }]}>Loading today's verse...</Text>
          </View>
        </ThemedBlurView>
      </Animated.View>
    );
  }

  const cardContent = (
    <View style={styles.contentWrapper}>
      <View style={styles.header}>
        <Text style={[styles.label, { color: textMuted }]}>Daily Verse</Text>
        <View style={styles.headerActions}>
          <Pressable
            onPress={handleShare}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            style={styles.iconButton}
          >
            <IconSymbol
              name="square.and.arrow.up"
              size={20}
              color={String(textMuted)}
            />
          </Pressable>
          <Pressable
            onPress={handlePlayAudio}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            style={[
              styles.iconButton,
              showAudioPlayer && { backgroundColor: `${accentColor}20` },
            ]}
          >
            <IconSymbol
              name={showAudioPlayer ? 'speaker.wave.2.fill' : 'speaker.wave.2'}
              size={20}
              color={showAudioPlayer ? accentColor : String(textMuted)}
            />
          </Pressable>
        </View>
      </View>

      <View style={styles.verseContainer}>
        <Text style={[styles.arabicText, { color: textColor }]}>{verse.arabic}</Text>

        <View style={[styles.translationContainer, { borderTopColor: dividerColor }]}>
          <Text style={[styles.translationText, { color: textSecondary }]}>
            {verse.english}
          </Text>
        </View>

        <Text style={[styles.reference, { color: accentColor }]}>
          {verse.surahNameEnglish} {verse.surahNumber}:{verse.ayahNumber}
        </Text>
      </View>
    </View>
  );

  return (
    <>
      <Animated.View entering={FadeInUp.delay(300).duration(800)} style={[styles.card, { borderColor: cardBorder }]}>
        <ThemedBlurView intensity={25} style={styles.blur}>
          <Pressable onPress={onPress} style={styles.pressable}>
            {cardContent}
          </Pressable>
        </ThemedBlurView>

        {showAudioPlayer && (
          <ThemedBlurView intensity={25} style={[styles.audioPlayerContainer, { borderTopColor: dividerColor }]}>
            <AudioPlayer
              audioUrl={audioUrl}
              isLoading={isLoadingAudio}
              onLoadError={(error) => console.error('Audio error:', error)}
            />
          </ThemedBlurView>
        )}
      </Animated.View>

      {verse && (
        <ShareModal
          visible={showShareModal}
          onClose={() => setShowShareModal(false)}
          content={{
            arabic: verse.arabic,
            translation: verse.english,
            reference: `${verse.surahNameEnglish} ${verse.surahNumber}:${verse.ayahNumber}`,
          }}
        />
      )}
    </>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: 24,
    borderRadius: 24,
    borderCurve: 'continuous',
    overflow: 'hidden',
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 5,
  },
  blur: {
    padding: 20,
  },
  pressable: {
    width: '100%',
  },
  contentWrapper: {
    width: '100%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  label: {
    fontSize: 12,
    fontFamily: 'Tajawal-Bold',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  iconButton: {
    padding: 6,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  audioPlayerContainer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
  },
  verseContainer: {
    gap: 12,
  },
  arabicText: {
    fontSize: 26,
    fontFamily: 'Amiri-Regular',
    textAlign: 'right',
    lineHeight: 46,
  },
  translationContainer: {
    paddingTop: 8,
    borderTopWidth: 1,
  },
  translationText: {
    fontSize: 15,
    fontFamily: 'Tajawal-Regular',
    lineHeight: 22,
    textAlign: 'left',
  },
  reference: {
    fontSize: 13,
    fontFamily: 'Tajawal-Medium',
    marginTop: 4,
    textAlign: 'right',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    paddingVertical: 20,
  },
  loadingText: {
    fontSize: 14,
    fontFamily: 'Tajawal-Regular',
  },
});
