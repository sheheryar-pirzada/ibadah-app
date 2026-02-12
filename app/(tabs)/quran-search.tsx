import { ChipGroup } from '@/components/animated-chip/Chip';
import { BackgroundImage } from '@/components/BackgroundImage';
import { ChinAudioPlayer, useChin } from '@/components/chin';
import QuranSearchHeader from '@/components/QuranSearchHeader';
import QuranSearchResultItem from '@/components/QuranSearchResultItem';
import ShareModal, { ShareContent } from '@/components/ShareModal';
import { ThemedBlurView } from '@/components/ThemedBlurView';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { useBackground } from '@/contexts/BackgroundContext';
import { useTheme } from '@/contexts/ThemeContext';
import { useQuranChapters } from '@/hooks/useQuranChapters';
import { useQuranSearch } from '@/hooks/useQuranSearch';
import { useThemeColor } from '@/hooks/useThemeColor';
import { quranAPI, SearchResult } from '@/utils/quran-api';
import {
  getQuranSearchPreferences,
  saveQuranSearchMode,
  saveQuranSearchReadByVerse,
  type QuranSearchMode,
} from '@/utils/quran-search-settings';
import { getReciterSettings } from '@/utils/reciter-settings';
import * as Haptics from 'expo-haptics';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Keyboard,
  Pressable,
  Text,
  TextInput,
  View
} from 'react-native';

export default function QuranSearchScreen() {
  const { resolvedTheme } = useTheme();
  const { backgroundKey } = useBackground();

  const {
    searchQuery,
    setSearchQuery,
    results,
    isSearching,
    hasSearched,
    totalResults,
    currentPage,
    totalPages,
    isLoadingMore,
    loadMore,
    clearSearch,
  } = useQuranSearch();

  const {
    chapters,
    isLoading: isLoadingChapters,
    error: chaptersError
  } = useQuranChapters();

  const [expandedVerse, setExpandedVerse] = useState<string | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isLoadingAudio, setIsLoadingAudio] = useState(false);
  const [loadingAudioVerseKey, setLoadingAudioVerseKey] = useState<string | null>(null);
  const [showShareModal, setShowShareModal] = useState(false);
  const [shareContent, setShareContent] = useState<ShareContent | null>(null);
  const [mode, setMode] = useState<QuranSearchMode>('Search');
  const [surahSearchQuery, setSurahSearchQuery] = useState('');
  const [isAscending, setIsAscending] = useState(true);
  const [readByVerse, setReadByVerse] = useState(true); // true = by verse, false = by page

  const chin = useChin();

  // Load persisted preferences on mount
  useEffect(() => {
    getQuranSearchPreferences().then((prefs) => {
      setMode(prefs.mode);
      setReadByVerse(prefs.readByVerse);
    });
  }, []);

  const handleModeChange = useCallback((newMode: QuranSearchMode) => {
    setMode(newMode);
    saveQuranSearchMode(newMode);
  }, []);

  const handleReadByVerseChange = useCallback((byVerse: boolean) => {
    setReadByVerse(byVerse);
    saveQuranSearchReadByVerse(byVerse);
  }, []);

  const textColor = useThemeColor({}, 'text');
  const textMuted = useThemeColor({}, 'textMuted');
  const accentColor = useThemeColor({}, 'accent');
  const borderColor = useThemeColor({}, 'border');
  const textInverse = useThemeColor({}, 'textInverse');

  // Solid + light → dark inactive bg, solid + dark → light inactive bg, grain → translucent white
  const chipInactiveBg = backgroundKey === 'solid'
    ? resolvedTheme === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)'
    : 'rgba(255,255,255,0.2)';

  const chips = useMemo(() => [
    {
      label: "By Verse",
      activeColor: accentColor,
      inActiveBackgroundColor: chipInactiveBg,
      labelColor: textInverse,
      icon: () => (
        <SymbolView
          resizeMode="scaleAspectFit"
          name="text.line.first.and.arrowtriangle.forward"
          size={20}
          tintColor={readByVerse ? textInverse : accentColor}
        />
      ),
    },
    {
      label: "By Page",
      activeColor: accentColor,
      inActiveBackgroundColor: chipInactiveBg,
      labelColor: textInverse,
      icon: () => (
        <SymbolView
          resizeMode="scaleAspectFit"
          name="text.page.fill"
          size={20}
          tintColor={!readByVerse ? textInverse : accentColor}
        />
      ),
    },
  ], [readByVerse, textInverse, accentColor, chipInactiveBg]);

  const filteredChapters = useMemo(() => {
    let result = [...chapters];

    if (surahSearchQuery) {
      const query = surahSearchQuery.toLowerCase();
      result = result.filter(chapter =>
        chapter.name_simple.toLowerCase().includes(query) ||
        chapter.name_arabic.includes(query) ||
        chapter.id.toString().includes(query) ||
        chapter.translated_name.name.toLowerCase().includes(query)
      );
    }

    return result.sort((a, b) => {
      return isAscending ? a.id - b.id : b.id - a.id;
    });
  }, [chapters, surahSearchQuery, isAscending]);

  const handlePlayAudio = useCallback(async (result: SearchResult) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    let url = (expandedVerse === result.verse_key) ? audioUrl : null;

    // If audio isn't loaded for this verse yet
    if (!url) {
      setLoadingAudioVerseKey(result.verse_key);
      try {
        const settings = await getReciterSettings();
        const audio = await quranAPI.getVerseAudio(result.verse_key, settings.reciterId);
        url = audio?.url || null;
        if (expandedVerse === result.verse_key) {
          setAudioUrl(url);
        }
      } catch (error) {
        console.error('Error fetching audio for playback:', error);
      } finally {
        setLoadingAudioVerseKey(null);
      }
    }

    if (url) {
      chin.show(
        <ChinAudioPlayer
          audioUrl={url}
          metadata={{
            title: result.verse_key,
            subtitle: `${result.text.substring(0, 30)}...`
          }}
          onClose={chin.hide}
        />
      );
    }
  }, [audioUrl, expandedVerse, chin]);


  const handleVersePress = useCallback(async (verseKey: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    if (expandedVerse === verseKey) {
      setExpandedVerse(null);
      setAudioUrl(null);
      return;
    }

    setExpandedVerse(verseKey);
    setAudioUrl(null);
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
  }, [expandedVerse]);

  const handleClearSearch = useCallback(() => {
    clearSearch();
    Keyboard.dismiss();
  }, [clearSearch]);

  const handleShare = useCallback((result: SearchResult) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const rawTranslation = result.translations?.[0]?.text || '';
    const cleanTranslation = rawTranslation.replace(/<[^>]*>/g, '');
    setShareContent({
      title: result.verse_key,
      arabic: result.text,
      translation: cleanTranslation,
    });
    setShowShareModal(true);
  }, []);

  const ListHeader = useMemo(() => (
    <QuranSearchHeader
      searchQuery={searchQuery}
      onSearchQueryChange={setSearchQuery}
      onClearSearch={handleClearSearch}
      isSearching={isSearching}
      hasSearched={hasSearched}
      totalResults={totalResults}
      resultsCount={results.length}
      mode={mode}
      onModeChange={handleModeChange}
    />
  ), [searchQuery, setSearchQuery, handleClearSearch, isSearching, hasSearched, totalResults, results.length, mode, handleModeChange]);

  const ListFooter = useMemo(() => {
    if (mode !== 'Search') return null;

    if (isLoadingMore) {
      return (
        <View className="flex-row items-center justify-center py-5 gap-2">
          <ActivityIndicator size="small" color={accentColor} />
          <Text
            className="text-sm font-tajawal"
            style={{ color: textMuted }}
          >
            Loading more...
          </Text>
        </View>
      );
    }

    if (currentPage < totalPages && results.length > 0) {
      return (
        <Pressable onPress={loadMore} className="items-center justify-center py-4 mt-2">
          <Text
            className="text-base font-tajawal-medium"
            style={{ color: accentColor }}
          >
            Load more results
          </Text>
        </Pressable>
      );
    }

    return null;
  }, [isLoadingMore, accentColor, textMuted, currentPage, totalPages, results.length, loadMore, mode]);

  return (
    <BackgroundImage>
      <View className="flex-1" style={{ backgroundColor: 'transparent' }}>
        {mode === 'Search' ? (
          <FlatList
            data={results}
            renderItem={({ item: result }) => (
              <QuranSearchResultItem
                result={result}
                isExpanded={expandedVerse === result.verse_key}
                onPress={() => handleVersePress(result.verse_key)}
                onShare={() => handleShare(result)}
                onAudioToggle={() => handlePlayAudio(result)}
                audioUrl={expandedVerse === result.verse_key ? audioUrl : null}
                isLoadingAudio={isLoadingAudio && (expandedVerse === result.verse_key)}
                isAudioLoadingThis={loadingAudioVerseKey === result.verse_key || (isLoadingAudio && expandedVerse === result.verse_key)}
              />
            )}
            keyExtractor={(item) => item.verse_key}
            contentContainerStyle={{ paddingTop: 60, paddingBottom: 120, paddingHorizontal: 16 }}
            keyboardShouldPersistTaps="handled"
            ListHeaderComponent={ListHeader}
            ListFooterComponent={ListFooter}
            onEndReached={loadMore}
            onEndReachedThreshold={0.5}
            ItemSeparatorComponent={() => <View className="h-3" />}
          />
        ) : (
          <View className="flex-1">
            <View style={{ paddingTop: 60, paddingHorizontal: 16 }}>
              {ListHeader}
            </View>

            {isLoadingChapters ? (
              <View className="flex-1 items-center justify-center">
                <ActivityIndicator size="large" color={accentColor} />
              </View>
            ) : chaptersError ? (
              <View className="flex-1 items-center justify-center p-4">
                <Text className="text-red-500 font-tajawal-medium text-center">{chaptersError}</Text>
              </View>
            ) : (
              <>
                <View className="px-4 pb-4 flex-row gap-2">
                  <View
                    className="flex-1 rounded-[20px] overflow-hidden border-[0.5px]"
                    style={{ borderColor, borderCurve: 'continuous' }}
                  >
                    <ThemedBlurView intensity={25} className="flex-row items-center px-4 py-3 gap-3">
                      <IconSymbol name="magnifyingglass" size={20} color={textMuted} />
                      <TextInput
                        className="flex-1 font-tajawal text-base"
                        style={{ color: textColor, includeFontPadding: true, textAlignVertical: 'center' }}
                        placeholder="Search Surah..."
                        placeholderTextColor={textMuted}
                        value={surahSearchQuery}
                        onChangeText={setSurahSearchQuery}
                      />
                      {surahSearchQuery.length > 0 && (
                        <Pressable onPress={() => setSurahSearchQuery('')}>
                          <IconSymbol name="xmark.circle.fill" size={20} color={textMuted} />
                        </Pressable>
                      )}
                    </ThemedBlurView>
                  </View>

                  <Pressable
                    onPress={() => {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      setIsAscending(!isAscending);
                    }}
                    className="aspect-square items-center justify-center overflow-hidden"
                    style={{ borderColor: 'rgba(150,150,150,0.2)' }}
                  >
                    {/* <ThemedBlurView intensity={25} className="flex-1 w-full items-center justify-center"> */}
                    <Image
                      source="sf:arrow.up.arrow.down.circle"
                      style={{ width: 28, height: 28 }}
                      tintColor={textMuted}
                      sfEffect={{
                        effect: 'draw/on'
                      }}
                      transition={{
                        effect: 'sf:down-up'
                      }}
                    />
                    {/* </ThemedBlurView> */}
                  </Pressable>
                </View>

                {/* Read mode toggle: verse vs page */}
                <View className="px-4 pb-2 flex-row justify-end">
                <ChipGroup
                    chips={chips}
                    selectedIndex={readByVerse ? 0 : 1}
                    onChange={(index) => {
                      Haptics.selectionAsync();
                      handleReadByVerseChange(index === 0);
                    }}
                  />
                </View>

                <FlatList
                  data={filteredChapters}
                  keyExtractor={(item) => item.id.toString()}
                  contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 120 }}
                  renderItem={({ item }) => (
                    <Pressable
                      className="flex-row items-center justify-between py-4 border-b"
                      style={{ borderColor: 'rgba(150,150,150,0.1)' }}
                      onPress={() => {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                        if (readByVerse) {
                          router.push(`/surah/${item.id}`);
                        } else {
                          const firstPage = item.pages?.[0] ?? 1;
                          const params = new URLSearchParams({
                            name: item.name_simple,
                            nameArabic: item.name_arabic,
                            firstPage: String(firstPage),
                          });
                          router.push(`/surah/${item.id}/page?${params.toString()}` as const);
                        }
                      }}
                    >
                      <View className="flex-row items-center gap-4">
                        <View className="w-8 h-8 items-center justify-center">
                          <Text className="font-tajawal-medium text-md" style={{ color: textMuted }}>{item.id}</Text>
                        </View>
                        <View>
                          <Text className="text-2xl font-tajawal-bold" style={{ color: textColor }}>{item.name_simple}</Text>
                          <Text className="text-md font-tajawal" style={{ color: textMuted }}>{item.translated_name.name}</Text>
                          <Text className="text-sm font-tajawal mt-0.5" style={{ color: textMuted }}>
                            {item.verses_count} verses • {item.revelation_place.charAt(0).toUpperCase() + item.revelation_place.slice(1)}
                          </Text>
                        </View>
                      </View>
                      <Text className="text-2xl font-amiri" style={{ color: accentColor }}>{item.name_arabic}</Text>
                    </Pressable>
                  )}
                />
              </>
            )}
          </View>
        )}
      </View>

      {shareContent && (
        <ShareModal
          visible={showShareModal}
          onClose={() => setShowShareModal(false)}
          content={shareContent}
        />
      )}
    </BackgroundImage>
  );
}
