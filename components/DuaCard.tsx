import type { ChinAudioMetadata } from "@/components/chin";
import { useChinStore } from "@/components/chin";
import { ThemedBlurView } from "@/components/ThemedBlurView";
import { IconSymbol } from "@/components/ui/IconSymbol";
import { useThemeColor } from "@/hooks/useThemeColor";
import { Dua } from "@/utils/duas-data";
import { quranAPI } from "@/utils/quran-api";
import { getReciterSettings } from "@/utils/reciter-settings";
import * as Haptics from "expo-haptics";
import { Image } from 'expo-image';
import { Link } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import { Pressable, Text, View } from "react-native";
import Animated, { FadeInUp } from "react-native-reanimated";

// @ts-expect-error - AppleZoom types not fully exported in SDK 55 preview
const AppleZoom = Link.AppleZoom;

interface DuaCardProps {
  dua: Dua;
  isFavorite: boolean;
  onToggleFavorite: (duaId: string) => void;
  onAudioToggle?: (isPlaying: boolean, audioUrl: string | null, metadata?: ChinAudioMetadata) => void;
  index?: number;
}

export default function DuaCard({ dua, isFavorite, onToggleFavorite, onAudioToggle, index = 0 }: DuaCardProps) {
  const [audioUrls, setAudioUrls] = useState<string[]>([]);
  const [showAudioPlayer, setShowAudioPlayer] = useState(false);

  const chinIsVisible = useChinStore((state) => state.isVisible);

  // Sync audio icon state with chin visibility
  useEffect(() => {
    if (!chinIsVisible && showAudioPlayer) {
      setShowAudioPlayer(false);
    }
  }, [chinIsVisible, showAudioPlayer]);

  const textColor = useThemeColor({}, "text");
  const textSecondary = useThemeColor({}, "textSecondary");
  const textMuted = useThemeColor({}, "textMuted");
  const accentColor = useThemeColor({}, "accent");
  const cardBorder = useThemeColor({}, "cardBorder");
  const dividerColor = useThemeColor({}, "divider");

  const hasAudio = !!dua.verseKey || !!dua.verseRange;
  const currentAudioUrl = useMemo(() => audioUrls[0], [audioUrls]);

  const handleToggleFavorite = (e?: any) => {
    e?.stopPropagation?.();
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onToggleFavorite(dua.id);
  };


  const handlePlayAudio = async (e?: any) => {
    e?.stopPropagation?.();
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    if (showAudioPlayer) {
      setShowAudioPlayer(false);
      onAudioToggle?.(false, currentAudioUrl);
      return;
    }

    if (!dua.verseKey && !dua.verseRange) return;

    const metadata: ChinAudioMetadata = {
      title: dua.title,
      subtitle: dua.reference,
    };

    setShowAudioPlayer(true);

    if (audioUrls.length === 0) {
      try {
        const settings = await getReciterSettings();

        if (dua.verseKey) {
          const audio = await quranAPI.getVerseAudio(dua.verseKey, settings.reciterId);
          if (audio?.url) {
            setAudioUrls([audio.url]);
            onAudioToggle?.(true, audio.url, metadata);
          }
        } else if (dua.verseRange) {
          // For complete surahs (starting from verse 1), use chapter audio for seamless playback
          if (dua.verseRange.startVerse === 1) {
            const chapterAudioUrl = await quranAPI.getChapterAudio(
              dua.verseRange.surah,
              settings.reciterId
            );
            if (chapterAudioUrl) {
              setAudioUrls([chapterAudioUrl]);
              onAudioToggle?.(true, chapterAudioUrl, metadata);
              return;
            }
          }
          // Fallback to individual verse audio for partial ranges
          const audios = await quranAPI.getVerseRangeAudio(
            dua.verseRange.surah,
            dua.verseRange.startVerse,
            dua.verseRange.endVerse,
            settings.reciterId
          );
          if (audios?.length) {
            const urls = audios.map((a) => a.url).filter(Boolean);
            setAudioUrls(urls);
            onAudioToggle?.(true, urls[0], metadata);
          }
        }
      } catch (error) {
        console.error("Error fetching audio:", error);
      }
    } else {
      onAudioToggle?.(true, currentAudioUrl, metadata);
    }
  };

  useEffect(() => {
    setAudioUrls([]);
    setShowAudioPlayer(false);
  }, [dua.verseKey, dua.verseRange?.surah, dua.verseRange?.startVerse, dua.verseRange?.endVerse]);

  return (
    <Link
      href={{
        pathname: "/share",
        params: {
          arabic: dua.arabic,
          translation: dua.translation,
          reference: dua.reference || dua.title,
        },
      }}
      asChild
      onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)}
    >
      <Pressable>
        <AppleZoom>
          <Animated.View
            entering={FadeInUp.delay(index * 100).duration(600)}
            style={{
              borderRadius: 40,
              borderCurve: "continuous",
              overflow: "hidden",
              borderWidth: 0.5,
              borderColor: cardBorder,
            }}
          >
            <ThemedBlurView intensity={25} className="p-5">
              <View className="flex-row justify-between items-center mb-3">
                <Text className="text-lg flex-1 font-tajawal-bold" style={{ color: textColor }}>
                  {dua.title}
                </Text>

                <View className="flex-row items-center gap-1">
                  <View className="p-1.5 rounded-lg justify-center items-center">
                    <IconSymbol name="square.and.arrow.up" size={20} color={String(textMuted)} />
                  </View>
                  {hasAudio && (
                    <Pressable
                      onPress={handlePlayAudio}
                      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                      className="p-1.5 rounded-lg justify-center items-center"
                      style={showAudioPlayer ? { backgroundColor: `${accentColor}20` } : undefined}
                    >
                      <IconSymbol
                        name={showAudioPlayer ? "speaker.wave.2.fill" : "speaker.wave.2"}
                        size={20}
                        color={showAudioPlayer ? accentColor : String(textMuted)}
                      />
                    </Pressable>
                  )}

                  <Pressable
                    onPress={handleToggleFavorite}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    className="p-1.5 rounded-lg justify-center items-center"
                  >
                    {/* <IconSymbol
                      name={isFavorite ? "heart.fill" : "heart"}
                      size={20}
                      color={isFavorite ? "#DC143C" : String(textMuted)}
                    /> */}
                    <Image
                      tintColor={isFavorite ? "#DC143C" : String(textMuted)}
                      source={isFavorite ? "sf:heart.fill" : "sf:heart"}
                      style={{ width: 20, aspectRatio: 1 }}
                      sfEffect={{
                        effect: 'draw/on'
                      }}
                      transition={{
                        duration: 1,
                        effect: isFavorite ? 'sf:down-up' : 'sf:replace'
                      }}
                    />
                  </Pressable>
                </View>
              </View>

              <View className="mb-3 py-2">
                <Text
                  className="text-2xl text-right leading-[42px] font-amiri"
                  style={{ color: textColor }}
                >
                  {dua.arabic}
                </Text>
              </View>

              <View className="mb-3 py-2 border-t" style={{ borderTopColor: dividerColor }}>
                <Text
                  className="text-sm italic leading-5 font-sans"
                  style={{ color: textSecondary }}
                >
                  {dua.transliteration}
                </Text>
              </View>

              <View className="mb-2">
                <Text
                  className="text-[15px] leading-[22px] font-sans"
                  style={{ color: textSecondary }}
                  numberOfLines={3}
                >
                  {dua.translation}
                </Text>
              </View>

              {dua.reference && (
                <Text
                  className="text-xs mt-1 text-right font-tajawal-medium"
                  style={{ color: accentColor }}
                >
                  {dua.reference}
                </Text>
              )}
            </ThemedBlurView>
          </Animated.View>
        </AppleZoom>
      </Pressable>
    </Link>
  );
}
