import { ThemedStatusBar } from '@/components/ThemedStatusBar';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { useTheme } from '@/contexts/ThemeContext';
import { useQuranChapters } from '@/hooks/useQuranChapters';
import { useThemeColor } from '@/hooks/useThemeColor';
import { useQuranAudio, type PlaybackRate } from '@/utils/audio-service';
import { quranAPI, Verse } from '@/utils/quran-api';
import { getReciterSettings } from '@/utils/reciter-settings';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import Animated, { Easing, FadeIn, LinearTransition } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const TRANSLATION_IDS = [85]; // M.A.S. Abdel Haleem (api.quran.com returns this; 131 returns empty)
const MIN_PAGE = 1;
const MAX_PAGE = 604;

export default function SurahPageScreen() {
  const { id, name, nameArabic, firstPage } = useLocalSearchParams<{
    id: string;
    name?: string;
    nameArabic?: string;
    firstPage?: string;
  }>();
  const router = useRouter();
  const { resolvedTheme } = useTheme();
  const { chapters } = useQuranChapters();
  const insets = useSafeAreaInsets();
  const [isReading, setIsReading] = useState(false);
  const [currentPageNumber, setCurrentPageNumber] = useState(() => {
    const n = firstPage ? parseInt(firstPage, 10) : 1;
    return Number.isFinite(n) ? Math.max(MIN_PAGE, Math.min(MAX_PAGE, n)) : 1;
  });
  const [verses, setVerses] = useState<Verse[]>([]);
  const [isLoadingVerses, setIsLoadingVerses] = useState(false);
  const [currentVerseIndex, setCurrentVerseIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [autoPlay, setAutoPlay] = useState(false);
  const [isVerseLoading, setIsVerseLoading] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);
  const hasScrolledToSurahRef = useRef(false);
  const verseLayoutsRef = useRef<{ y: number; height: number }[]>([]);
  const [visibleChapterId, setVisibleChapterId] = useState<number | null>(null);
  const didPlayRef = useRef(false);
  const isProcessingRepeatRef = useRef(false);

  const currentAudioUrl = verses[currentVerseIndex]?.audio?.url ?? null;
  const { play, pause, stop, seekTo, setPlaybackRate, status } = useQuranAudio(currentAudioUrl);

  const selectedChapterId = id ? parseInt(String(id), 10) : null;
  const isValidChapterId = selectedChapterId != null && Number.isFinite(selectedChapterId);

  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const textMuted = useThemeColor({}, 'textMuted');
  const accentColor = useThemeColor({}, 'accent');
  const borderColor = useThemeColor({}, 'border');

  const gradientColors = resolvedTheme === 'dark'
    ? (['rgba(0,0,0,0.3)', 'rgba(0,0,0,0.1)', 'rgba(0,0,0,0.4)'] as const)
    : (['rgba(255,255,255,0.1)', 'rgba(255,255,255,0.05)', 'rgba(255,255,255,0.15)'] as const);

  const chapterIdFromPage = verses.length > 0 ? parseInt(verses[0].verse_key.split(':')[0], 10) : null;
  const pageContainsSelectedSurah =
    isValidChapterId && verses.some((v) => parseInt(v.verse_key.split(':')[0], 10) === selectedChapterId);
  const headerChapterId =
    isReading && visibleChapterId != null
      ? visibleChapterId
      : isReading && pageContainsSelectedSurah
        ? selectedChapterId
        : chapterIdFromPage;
  const headerChapter = headerChapterId != null ? chapters.find((c) => c.id === headerChapterId) : null;
  const displayName = (isReading && headerChapter ? headerChapter.name_simple : name) ?? `Surah ${id}`;
  const displayNameArabic = (isReading && headerChapter ? headerChapter.name_arabic : nameArabic) ?? '—';

  const firstVerseIndexOfSelectedSurah =
    isValidChapterId && verses.length > 0
      ? verses.findIndex((v) => parseInt(v.verse_key.split(':')[0], 10) === selectedChapterId)
      : -1;

  const fetchPage = useCallback(async (pageNum: number) => {
    if (pageNum < MIN_PAGE || pageNum > MAX_PAGE) return;
    setIsLoadingVerses(true);
    try {
      const settings = await getReciterSettings();
      const { verses: nextVerses } = await quranAPI.getVersesByPage(pageNum, {
        translations: TRANSLATION_IDS,
        perPage: 50,
        audio: settings.reciterId,
        words: true,
      });
      const translationId = TRANSLATION_IDS[0];
      const withTranslations = await Promise.all(
        nextVerses.map(async (v) => {
          const text = await quranAPI.getVerseTranslation(translationId, v.verse_key);
          return {
            ...v,
            translations:
              text != null
                ? [{ resource_id: translationId, text }]
                : v.translations,
          } as Verse;
        })
      );
      setVerses(withTranslations);
    } catch (err) {
      console.error('Error fetching verses by page:', err);
      setVerses([]);
    } finally {
      setIsLoadingVerses(false);
    }
  }, []);

  useEffect(() => {
    fetchPage(currentPageNumber);
  }, [currentPageNumber, fetchPage]);

  const canGoNext = currentPageNumber < MAX_PAGE;
  const canGoPrev = currentPageNumber > MIN_PAGE;

  const goNextPage = useCallback(() => {
    if (!canGoNext) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setCurrentPageNumber((p) => p + 1);
    setCurrentVerseIndex(0);
  }, [canGoNext]);

  const goPrevPage = useCallback(() => {
    if (!canGoPrev) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setCurrentPageNumber((p) => p - 1);
    setCurrentVerseIndex(0);
  }, [canGoPrev]);

  const handleScroll = useCallback(
    (e: { nativeEvent: { contentOffset: { y: number }; contentSize: { height: number }; layoutMeasurement: { height: number } } }) => {
      const { y } = e.nativeEvent.contentOffset;
      const layouts = verseLayoutsRef.current;
      if (!layouts.length) return;
      let idx = 0;
      for (let i = 0; i < layouts.length; i++) {
        const layout = layouts[i];
        if (layout && y >= layout.y - 24) idx = i;
      }
      const verseKey = verses[idx]?.verse_key;
      if (verseKey) {
        const [surahPart] = verseKey.split(':');
        const surahId = parseInt(surahPart, 10);
        if (Number.isFinite(surahId)) setVisibleChapterId(surahId);
      }
    },
    [verses]
  );

  useEffect(() => {
    if (!verses.length) return;
    const url = verses[currentVerseIndex]?.audio?.url;
    if (!url) return;
    if (status.isPlaying) {
      didPlayRef.current = true;
      return;
    }
    if (autoPlay && !status.isPlaying && !isVerseLoading) {
      setIsVerseLoading(true);
      play();
      setIsPlaying(true);
      setIsVerseLoading(false);
    }
  }, [verses, currentVerseIndex, autoPlay, status.isPlaying, isVerseLoading, play]);

  useEffect(() => {
    const durationMs = status.duration ?? 0;
    const positionMs = status.position ?? 0;
    if (durationMs > 0 && positionMs >= durationMs - 200 && didPlayRef.current && !isProcessingRepeatRef.current) {
      isProcessingRepeatRef.current = true;
      if (currentVerseIndex < verses.length - 1) {
        setCurrentVerseIndex((i) => i + 1);
      } else {
        stop();
        setIsPlaying(false);
      }
      setTimeout(() => {
        didPlayRef.current = false;
        isProcessingRepeatRef.current = false;
      }, 300);
    }
  }, [status.duration, status.position, currentVerseIndex, verses.length, stop]);

  const togglePlay = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (status.isPlaying) {
      pause();
      setIsPlaying(false);
      setAutoPlay(false);
    } else {
      // Enable auto-advance once user starts playback
      setAutoPlay(true);
      const durationMs = status.duration ?? 0;
      const positionMs = status.position ?? 0;
      if (durationMs > 0 && positionMs >= durationMs - 100) seekTo(0);
      play();
      setIsPlaying(true);
    }
  }, [status.isPlaying, status.duration, status.position, play, pause, seekTo]);

  const handlePrevVerse = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (currentVerseIndex <= 0) return;
    setCurrentVerseIndex((i) => i - 1);
  }, [currentVerseIndex]);

  const handleNextVerse = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (currentVerseIndex >= verses.length - 1) return;
    setCurrentVerseIndex((i) => i + 1);
  }, [currentVerseIndex, verses.length]);

// Strip verse-end symbol (۝) and trailing Arabic numerals (٠-٩) from displayed ayah text
  const stripAyahNumber = (text: string | undefined): string => {
    if (!text) return '';
    return text.replace(/\u06DD/g, '').replace(/[\u0660-\u0669\u06F0-\u06F9\s]+$/g, '').trim();
  };

  const handleSpeedSelect = useCallback(
    (rate: PlaybackRate) => {
      setPlaybackRate(rate);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    },
    [setPlaybackRate]
  );

  return (
    <View style={{ flex: 1, backgroundColor }}>
      <ThemedStatusBar />
      <LinearGradient
        colors={gradientColors}
        style={StyleSheet.absoluteFillObject}
      />

      <Pressable
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          router.back();
        }}
        style={{
          position: 'absolute',
          top: insets.top + 24,
          left: insets.left + 16,
          zIndex: 10,
        }}
        hitSlop={12}
      >
        <IconSymbol name="chevron.left" size={28} color={textColor} />
      </Pressable>

      {isReading && (
        <Stack.Toolbar placement="bottom">
          <Stack.Toolbar.Button
            onPress={goNextPage}
            icon="arrow.left"
            disabled={!canGoNext}
          />
          <Stack.Toolbar.Spacer />
          <Stack.Toolbar.Button
            onPress={handlePrevVerse}
            icon="backward.fill"
            disabled={currentVerseIndex <= 0}
          />
          <Stack.Toolbar.Button
            onPress={togglePlay}
            icon={status.isPlaying ? 'pause.fill' : 'play.fill'}
          />
          <Stack.Toolbar.Button
            onPress={handleNextVerse}
            icon="forward.fill"
            disabled={currentVerseIndex >= verses.length - 1}
          />
          <Stack.Toolbar.Menu title="Playback Speed" icon="speedometer">
            <Stack.Toolbar.MenuAction
              icon="tortoise.fill"
              isOn={status.playbackRate === 0.5}
              onPress={() => handleSpeedSelect(0.5)}
            >
              0.5×
            </Stack.Toolbar.MenuAction>
            <Stack.Toolbar.MenuAction
              icon="tortoise.fill"
              isOn={status.playbackRate === 0.75}
              onPress={() => handleSpeedSelect(0.75)}
            >
              0.75×
            </Stack.Toolbar.MenuAction>
            <Stack.Toolbar.MenuAction
              isOn={status.playbackRate === 1}
              onPress={() => handleSpeedSelect(1)}
            >
              1×
            </Stack.Toolbar.MenuAction>
            <Stack.Toolbar.MenuAction
              icon="hare.fill"
              isOn={status.playbackRate === 1.25}
              onPress={() => handleSpeedSelect(1.25)}
            >
              1.25×
            </Stack.Toolbar.MenuAction>
            <Stack.Toolbar.MenuAction
              icon="hare.fill"
              isOn={status.playbackRate === 1.5}
              onPress={() => handleSpeedSelect(1.5)}
            >
              1.5×
            </Stack.Toolbar.MenuAction>
          </Stack.Toolbar.Menu>
          <Stack.Toolbar.Spacer />
          <Stack.Toolbar.Button
            onPress={goPrevPage}
            icon="arrow.right"
            disabled={!canGoPrev}
          />
        </Stack.Toolbar>
      )}

      <View style={[
        { flex: 1, alignItems: 'center', paddingHorizontal: 20 },
        isReading ? { justifyContent: 'flex-start', paddingTop: 28 } : { justifyContent: 'center' },
      ]}>
        <Animated.View layout={LinearTransition.duration(600).damping(16).easing(Easing.ease)}>
          <Text
            className="text-6xl font-amiri mb-0 text-center"
            style={{ color: accentColor, lineHeight: 100, paddingTop: 20 }}
          >
            {displayNameArabic}
          </Text>
        </Animated.View>

        {!isReading && (
          <Animated.View entering={FadeIn.duration(400)} className="items-center w-full">
            <Text className="text-3xl font-tajawal-bold text-center" style={{ color: textColor }}>
              {displayName}
            </Text>
            <Pressable
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                setIsReading(true);
              }}
              className="mt-8 px-10 py-3 rounded-full flex justify-center items-center"
              style={{ backgroundColor: accentColor, borderCurve: 'continuous' }}
            >
              <Text className="text-white bold text-2xl">Start</Text>
            </Pressable>
          </Animated.View>
        )}

        {isReading && (
          <Animated.View
            entering={FadeIn.duration(600).delay(200)}
            layout={LinearTransition}
            className="flex-1 w-full mt-6"
            style={{ alignSelf: 'stretch' }}
          >
            {isLoadingVerses ? (
              <View className="flex-1 items-center justify-center py-12">
                <ActivityIndicator size="large" color={accentColor} />
              </View>
            ) : verses.length === 0 ? (
              <View className="flex-1 items-center justify-center py-12">
                <Text className="font-tajawal text-center" style={{ color: textColor, opacity: 0.7 }}>
                  No verses on this page
                </Text>
              </View>
            ) : (
              <ScrollView
                ref={scrollViewRef}
                className="flex-1"
                contentContainerStyle={{ paddingBottom: 80 }}
                showsVerticalScrollIndicator={false}
                onScroll={handleScroll}
                scrollEventThrottle={32}
              >
                {verses.map((verse, index) => {
                  const isFirstVerseOfSelectedSurah =
                    firstVerseIndexOfSelectedSurah >= 0 && index === firstVerseIndexOfSelectedSurah;
                  return (
                    <View
                      key={verse.verse_key}
                      className="mb-6 border-b pb-4"
                      style={{ borderBottomColor: borderColor, borderBottomWidth: StyleSheet.hairlineWidth }}
                      onLayout={(e) => {
                        const { y, height } = e.nativeEvent.layout;
                        if (!verseLayoutsRef.current.length) verseLayoutsRef.current = new Array(verses.length);
                        verseLayoutsRef.current[index] = { y, height };
                        if (isFirstVerseOfSelectedSurah && !hasScrolledToSurahRef.current) {
                          hasScrolledToSurahRef.current = true;
                          if (selectedChapterId != null) setVisibleChapterId(selectedChapterId);
                          scrollViewRef.current?.scrollTo({
                            y: Math.max(0, y - 24),
                            animated: true,
                          });
                        }
                      }}
                    >
                      <Text
                        className="font-amiri text-right"
                        style={{ color: textColor, fontSize: 32, lineHeight: 66 }}
                      >
                        {stripAyahNumber(verse.text_uthmani)}
                      </Text>
                      {verse.translations?.[0]?.text != null && (
                        <View className="mt-3">
                          <Text
                            className="font-tajawal"
                            style={{ color: textColor, opacity: 0.85, fontSize: 19, lineHeight: 30 }}
                          >
                            {String(verse.translations[0].text).replace(/<[^>]*>/g, '')}
                          </Text>
                          <View className="flex-row gap-4 items-center mt-1.5" style={{ alignSelf: 'flex-start' }}>
                            <Pressable
                              onPress={() => {
                                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                                router.push({
                                  pathname: '/surah/[id]/tafsir',
                                  params: { id: String(id), ayah_key: verse.verse_key },
                                });
                              }}
                              className="flex-row gap-1 items-center"
                            >
                              <IconSymbol name="book.fill" size={18} color={textMuted} />
                              <Text className="text-md" style={{ color: textMuted }}>Tafsir</Text>
                            </Pressable>
                            <Pressable
                              onPress={() => {
                                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                                router.push({
                                  pathname: '/surah/[id]/note',
                                  params: { id: String(id), ayah_key: verse.verse_key },
                                });
                              }}
                              className="flex-row gap-1 items-center"
                            >
                              <IconSymbol name="plus.app.fill" size={18} color={textMuted} />
                              <Text className="text-md" style={{ color: textMuted }}>Note</Text>
                            </Pressable>
                          </View>
                        </View>
                      )}
                    </View>
                  );
                })}
              </ScrollView>
            )}
          </Animated.View>
        )}
      </View>
    </View>
  );
}
