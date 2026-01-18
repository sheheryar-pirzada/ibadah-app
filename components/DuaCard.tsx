import AudioPlayer from "@/components/AudioPlayer";
import ShareModal from "@/components/ShareModal";
import { ThemedBlurView } from "@/components/ThemedBlurView";
import { IconSymbol } from "@/components/ui/IconSymbol";
import { useThemeColor } from "@/hooks/useThemeColor";
import { Dua } from "@/utils/duas-data";
import { quranAPI } from "@/utils/quran-api";
import { getReciterSettings } from "@/utils/reciter-settings";
import * as Haptics from "expo-haptics";
import React, { useEffect, useMemo, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import Animated, { FadeInUp, LinearTransition } from "react-native-reanimated";

interface DuaCardProps {
  dua: Dua;
  isFavorite: boolean;
  onToggleFavorite: (duaId: string) => void;
  index?: number;
}

export default function DuaCard({ dua, isFavorite, onToggleFavorite, index = 0 }: DuaCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [audioUrls, setAudioUrls] = useState<string[]>([]);
  const [isLoadingAudio, setIsLoadingAudio] = useState(false);
  const [showAudioPlayer, setShowAudioPlayer] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);

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

  const handleShare = (e?: any) => {
    e?.stopPropagation?.();
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setShowShareModal(true);
  };

  const handleExpand = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setIsExpanded((v) => !v);
  };

  const handlePlayAudio = async (e?: any) => {
    e?.stopPropagation?.();
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    if (showAudioPlayer) {
      setShowAudioPlayer(false);
      return;
    }

    if (!dua.verseKey && !dua.verseRange) return;

    setShowAudioPlayer(true);

    if (audioUrls.length === 0) {
      setIsLoadingAudio(true);
      try {
        const settings = await getReciterSettings();

        if (dua.verseKey) {
          const audio = await quranAPI.getVerseAudio(dua.verseKey, settings.reciterId);
          if (audio?.url) setAudioUrls([audio.url]);
        } else if (dua.verseRange) {
          const audios = await quranAPI.getVerseRangeAudio(
            dua.verseRange.surah,
            dua.verseRange.startVerse,
            dua.verseRange.endVerse,
            settings.reciterId
          );
          if (audios?.length) setAudioUrls(audios.map((a) => a.url).filter(Boolean));
        }
      } catch (error) {
        console.error("Error fetching audio:", error);
      } finally {
        setIsLoadingAudio(false);
      }
    }
  };

  useEffect(() => {
    setAudioUrls([]);
    setShowAudioPlayer(false);
    setIsLoadingAudio(false);
  }, [dua.verseKey, dua.verseRange?.surah, dua.verseRange?.startVerse, dua.verseRange?.endVerse]);

  const cardContent = (
    <Pressable onPress={handleExpand} style={styles.pressable}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: textColor }]}>{dua.title}</Text>

        <View style={styles.headerActions}>
          {hasAudio && (
            <Pressable
              onPress={handlePlayAudio}
              onPressIn={(e) => e.stopPropagation?.()}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              style={[styles.iconButton, showAudioPlayer && { backgroundColor: `${accentColor}20` }]}
            >
              <IconSymbol
                name={showAudioPlayer ? "speaker.wave.2.fill" : "speaker.wave.2"}
                size={20}
                color={showAudioPlayer ? accentColor : String(textMuted)}
              />
            </Pressable>
          )}

          <Pressable
            onPress={handleShare}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            style={styles.iconButton}
          >
            <IconSymbol name="square.and.arrow.up" size={20} color={String(textMuted)} />
          </Pressable>

          <Pressable
            onPress={handleToggleFavorite}
            onPressIn={(e) => e.stopPropagation?.()}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            style={styles.iconButton}
          >
            <IconSymbol
              name={isFavorite ? "heart.fill" : "heart"}
              size={20}
              color={isFavorite ? "#DC143C" : String(textMuted)}
            />
          </Pressable>
        </View>
      </View>

      <View style={styles.arabicContainer}>
        <Text style={[styles.arabicText, { color: textColor }]}>{dua.arabic}</Text>
      </View>

      <View style={[styles.transliterationContainer, { borderTopColor: dividerColor }]}>
        <Text style={[styles.transliterationText, { color: textSecondary }]}>{dua.transliteration}</Text>
      </View>

      <View style={styles.translationContainer}>
        <Text
          style={[styles.translationText, { color: textSecondary }]}
          numberOfLines={isExpanded ? undefined : 3}
        >
          {dua.translation}
        </Text>
      </View>

      {isExpanded && (
        <View style={[styles.expandedContent, { borderTopColor: dividerColor }]}>
          {dua.meaning && (
            <View style={styles.meaningContainer}>
              <Text style={[styles.meaningLabel, { color: accentColor }]}>Meaning:</Text>
              <Text style={[styles.meaningText, { color: textMuted }]}>{dua.meaning}</Text>
            </View>
          )}
          {dua.reference && (
            <Text style={[styles.reference, { color: textMuted }]}>Reference: {dua.reference}</Text>
          )}
        </View>
      )}

      {showAudioPlayer && (
        <View style={[styles.audioPlayerContainer, { borderTopColor: dividerColor }]}>
          <AudioPlayer
            key={currentAudioUrl || "loading"}
            audioUrl={currentAudioUrl}
            isLoading={isLoadingAudio}
            onLoadError={(error) => console.error("Audio error:", error)}
          />
        </View>
      )}

      <View style={styles.expandIndicator}>
        <IconSymbol name={isExpanded ? "chevron.up" : "chevron.down"} size={20} color={String(textMuted)} />
      </View>
    </Pressable>
  );

  return (
    <>
      <Animated.View
        layout={LinearTransition.springify().duration(260)}
        entering={FadeInUp.delay(index * 100).duration(600)}
      >
        <ThemedBlurView intensity={25} style={[styles.card, { borderColor: cardBorder }]}>
          {cardContent}
        </ThemedBlurView>
      </Animated.View>

      <ShareModal
        visible={showShareModal}
        onClose={() => setShowShareModal(false)}
        content={{
          title: dua.title,
          arabic: dua.arabic,
          translation: dua.translation,
          reference: dua.reference,
        }}
      />
    </>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 40,
    borderCurve: "continuous",
    overflow: "hidden",
    borderWidth: 0.5,
  },
  pressable: {
    padding: 20,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  headerActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  title: {
    fontSize: 18,
    fontFamily: "Tajawal-Bold",
    flex: 1,
  },
  iconButton: {
    padding: 6,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  audioPlayerContainer: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
  },
  arabicContainer: {
    marginBottom: 12,
    paddingVertical: 8,
  },
  arabicText: {
    fontSize: 24,
    fontFamily: "Amiri-Regular",
    textAlign: "right",
    lineHeight: 42,
  },
  transliterationContainer: {
    marginBottom: 12,
    paddingVertical: 8,
    borderTopWidth: 1,
  },
  transliterationText: {
    fontSize: 14,
    fontFamily: "Tajawal-Regular",
    fontStyle: "italic",
    lineHeight: 20,
  },
  translationContainer: {
    marginBottom: 8,
  },
  translationText: {
    fontSize: 15,
    fontFamily: "Tajawal-Regular",
    lineHeight: 22,
  },
  expandedContent: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    gap: 8,
  },
  meaningContainer: {
    gap: 4,
  },
  meaningLabel: {
    fontSize: 12,
    fontFamily: "Tajawal-Bold",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  meaningText: {
    fontSize: 14,
    fontFamily: "Tajawal-Regular",
    lineHeight: 20,
  },
  reference: {
    fontSize: 12,
    fontFamily: "Tajawal-Medium",
    fontStyle: "italic",
  },
  expandIndicator: {
    alignItems: "center",
    marginTop: 8,
  },
});
