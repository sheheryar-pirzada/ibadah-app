import * as Haptics from 'expo-haptics';
import { Link } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  GestureResponderEvent,
  Pressable,
  Text,
  View,
} from 'react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';

// @ts-expect-error - AppleZoom types not fully exported in SDK 55 preview
const AppleZoom = Link.AppleZoom;

import AudioPlayer from '@/components/AudioPlayer';
import type { ChinAudioMetadata } from '@/components/chin';
import { useChinStore } from '@/components/chin';
import { ThemedBlurView } from '@/components/ThemedBlurView';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { useThemeColor } from '@/hooks/useThemeColor';
import { quranAPI } from '@/utils/quran-api';
import { QuranVerse } from '@/utils/quran-verse';
import { getReciterSettings } from '@/utils/reciter-settings';

interface DailyVerseCardProps {
  verse: QuranVerse | null;
  isLoading?: boolean;
  onAudioToggle?: (isPlaying: boolean, audioUrl: string | null, metadata?: ChinAudioMetadata) => void;
}

export default function DailyVerseCard({ verse, isLoading, onAudioToggle }: DailyVerseCardProps) {
  const [showAudioPlayer, setShowAudioPlayer] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isLoadingAudio, setIsLoadingAudio] = useState(false);

  const chinIsVisible = useChinStore((state) => state.isVisible);

  // Sync audio icon state with chin visibility
  useEffect(() => {
    if (!chinIsVisible && showAudioPlayer) {
      setShowAudioPlayer(false);
    }
  }, [chinIsVisible, showAudioPlayer]);

  // Theme colors
  const textColor = useThemeColor({}, 'text');
  const textSecondary = useThemeColor({}, 'textSecondary');
  const textMuted = useThemeColor({}, 'textMuted');
  const accentColor = useThemeColor({}, 'accent');
  const cardBorder = useThemeColor({}, 'cardBorder');
  const dividerColor = useThemeColor({}, 'divider');

  const handlePlayAudio = useCallback(async (e: GestureResponderEvent) => {
    // Stop propagation so it doesn't trigger the Link navigation
    e.stopPropagation();

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    if (showAudioPlayer) {
      setShowAudioPlayer(false);
      onAudioToggle?.(false, audioUrl);
      return;
    }

    if (!verse) return;

    const verseKey = `${verse.surahNumber}:${verse.ayahNumber}`;
    const metadata: ChinAudioMetadata = {
      title: 'Daily Verse',
      subtitle: `${verse.surahNameEnglish} ${verse.surahNumber}:${verse.ayahNumber}`,
    };

    setShowAudioPlayer(true);

    if (!audioUrl) {
      setIsLoadingAudio(true);
      try {
        const settings = await getReciterSettings();
        const audio = await quranAPI.getVerseAudio(verseKey, settings.reciterId);
        if (audio?.url) {
          setAudioUrl(audio.url);
          onAudioToggle?.(true, audio.url, metadata);
        }
      } catch (error) {
        console.error('Error fetching audio:', error);
      } finally {
        setIsLoadingAudio(false);
      }
    } else {
      onAudioToggle?.(true, audioUrl, metadata);
    }
  }, [showAudioPlayer, verse, audioUrl, onAudioToggle]);

  if (isLoading || !verse) {
    return (
      <Animated.View
        entering={FadeInUp.delay(300).duration(800)}
        className="mb-4 overflow-hidden rounded-[40px]"
        style={{ borderColor: cardBorder, borderWidth: 0.5, borderCurve: 'continuous' }}
      >
        <ThemedBlurView intensity={25} className="p-5">
          <View className="flex-row items-center justify-center gap-3 py-5">
            <ActivityIndicator size="small" color={accentColor} />
            <Text className="text-sm font-sans" style={{ color: textMuted }}>
              {"Loading today's verse..."}
            </Text>
          </View>
        </ThemedBlurView>
      </Animated.View>
    );
  }

  return (
    <Link
      href={{
        pathname: '/share',
        params: {
          arabic: verse.arabic,
          translation: verse.english,
          reference: `${verse.surahNameEnglish} ${verse.surahNumber}:${verse.ayahNumber}`,
        },
      }}
      asChild
      onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)}
    >
      <Pressable>
        <AppleZoom>
          <Animated.View
            entering={FadeInUp.delay(300).duration(800)}
            className="mb-6 overflow-hidden rounded-[40px]"
            style={{ borderColor: cardBorder, borderWidth: 0.5, borderCurve: 'continuous' }}
          >
            <ThemedBlurView intensity={25} className="p-5">
              <View className="w-full">
                <View className="flex-row justify-between items-center mb-4">
                  <Text className="text-xs font-tajawal-bold uppercase tracking-[1px]" style={{ color: textMuted }}>
                    Daily Verse
                  </Text>
                  <View className="flex-row items-center">
                    <View className="p-1.5 rounded-lg justify-center items-center">
                      <IconSymbol
                        name="square.and.arrow.up"
                        size={20}
                        color={String(textMuted)}
                      />
                    </View>
                    <Pressable
                      onPress={handlePlayAudio}
                      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                      className="p-1.5 rounded-lg justify-center items-center"
                      style={showAudioPlayer ? { backgroundColor: `${accentColor}20` } : undefined}
                    >
                      <IconSymbol
                        name={showAudioPlayer ? 'speaker.wave.2.fill' : 'speaker.wave.2'}
                        size={20}
                        color={showAudioPlayer ? accentColor : String(textMuted)}
                      />
                    </Pressable>
                  </View>
                </View>

                <View className="gap-3">
                  <Text className="text-[26px] leading-[46px] font-amiri text-right" style={{ color: textColor }}>
                    {verse.arabic}
                  </Text>

                  <View className="pt-2 border-t" style={{ borderTopColor: dividerColor }}>
                    <Text className="text-[15px] leading-[22px] font-sans text-left" style={{ color: textSecondary }}>
                      {verse.english}
                    </Text>
                  </View>

                  <Text className="text-[13px] font-tajawal-medium mt-1 text-right" style={{ color: accentColor }}>
                    {verse.surahNameEnglish} {verse.surahNumber}:{verse.ayahNumber}
                  </Text>
                </View>
              </View>
            </ThemedBlurView>

            {/* Audio player hidden - using chin instead */}
            {false && showAudioPlayer && (
              <ThemedBlurView intensity={25} className="px-5 py-4 border-t" style={{ borderTopColor: dividerColor }}>
                <AudioPlayer
                  audioUrl={audioUrl}
                  isLoading={isLoadingAudio}
                  onLoadError={(error: string) => console.error('Audio error:', error)}
                />
              </ThemedBlurView>
            )}
          </Animated.View>
        </AppleZoom>
      </Pressable>
    </Link>
  );
}
