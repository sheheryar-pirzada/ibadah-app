import AudioPlayer from '@/components/AudioPlayer';
import { SettingsHeaderButton } from '@/components/SettingsHeaderButton';
import ShareModal, { ShareContent } from '@/components/ShareModal';
import { ThemedBlurView } from '@/components/ThemedBlurView';
import { ThemedStatusBar } from '@/components/ThemedStatusBar';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { useTheme } from '@/contexts/ThemeContext';
import { useThemeColor } from '@/hooks/useThemeColor';
import { quranSearchStyles as styles } from '@/styles/quran-search';
import { quranAPI, SearchResult } from '@/utils/quran-api';
import {
  mergeSearchResults,
  parseHighlightSegments,
  QURAN_SEARCH_PAGE_SIZE,
  sortSearchResultsBySurah,
} from '@/utils/quran-search';
import { getReciterSettings } from '@/utils/reciter-settings';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Keyboard,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';

export default function QuranSearchScreen() {
  const router = useRouter();
  const { resolvedTheme } = useTheme();

  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [totalResults, setTotalResults] = useState(0);
  const [expandedVerse, setExpandedVerse] = useState<string | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isLoadingAudio, setIsLoadingAudio] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [shareContent, setShareContent] = useState<ShareContent | null>(null);
  const currentQueryRef = useRef('');

  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const textMuted = useThemeColor({}, 'textMuted');
  const textSecondary = useThemeColor({}, 'textSecondary');
  const accentColor = useThemeColor({}, 'accent');
  const borderColor = useThemeColor({}, 'border');
  const cardBorder = useThemeColor({}, 'cardBorder');
  const dividerColor = useThemeColor({}, 'divider');

  const gradientColors = resolvedTheme === 'dark'
    ? (['rgba(0,0,0,0.3)', 'rgba(0,0,0,0.1)', 'rgba(0,0,0,0.4)'] as const)
    : (['rgba(255,255,255,0.1)', 'rgba(255,255,255,0.05)', 'rgba(255,255,255,0.15)'] as const);

  useEffect(() => {
    if (!searchQuery.trim()) {
      setResults([]);
      setHasSearched(false);
      setCurrentPage(1);
      setTotalPages(0);
      currentQueryRef.current = '';
      return;
    }

    const timeoutId = setTimeout(() => {
      performSearch(searchQuery.trim(), 1);
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  const performSearch = async (query: string, page: number) => {
    if (!query) return;

    if (page === 1) {
      setIsSearching(true);
      setResults([]);
      currentQueryRef.current = query;
    } else {
      setIsLoadingMore(true);
    }
    setHasSearched(true);

    try {
      const searchResults = await quranAPI.searchQuran(query, {
        size: QURAN_SEARCH_PAGE_SIZE,
        page
      });

      const sortedResults = sortSearchResultsBySurah(searchResults.results);

      if (page === 1) {
        setResults(sortedResults);
      } else {
        setResults(prev => mergeSearchResults(prev, searchResults.results));
      }

      setTotalResults(searchResults.totalResults);
      setTotalPages(searchResults.totalPages);
      setCurrentPage(page);
    } catch (error) {
      console.error('Search error:', error);
      if (page === 1) {
        setResults([]);
      }
    } finally {
      setIsSearching(false);
      setIsLoadingMore(false);
    }
  };

  const loadMore = useCallback(() => {
    if (isLoadingMore || isSearching || currentPage >= totalPages) return;
    performSearch(currentQueryRef.current, currentPage + 1);
  }, [isLoadingMore, isSearching, currentPage, totalPages]);

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

  const handleClearSearch = () => {
    setSearchQuery('');
    setResults([]);
    setHasSearched(false);
    Keyboard.dismiss();
  };

  const handleShare = useCallback((result: SearchResult) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    // Strip HTML tags from translation text
    const rawTranslation = result.translations?.[0]?.text || '';
    const cleanTranslation = rawTranslation.replace(/<[^>]*>/g, '');
    setShareContent({
      title: result.verse_key,
      arabic: result.text,
      translation: cleanTranslation,
    });
    setShowShareModal(true);
  }, []);

  const renderHighlightedText = useCallback((text: string) => {
    if (!text) return null;

    const segments = parseHighlightSegments(text);
    return segments.map((segment, index) => (
      <Text
        key={index}
        style={[
          { color: textSecondary },
          segment.isHighlighted && { color: accentColor, fontWeight: '600' },
        ]}
      >
        {segment.text}
      </Text>
    ));
  }, [textSecondary, accentColor]);

  const renderItem = useCallback(({ item: result }: { item: SearchResult }) => {
    const isExpanded = expandedVerse === result.verse_key;

    const cardContent = (
      <>
        <View style={styles.resultHeader}>
          <Text style={[styles.verseKey, { color: accentColor }]}>
            {result.verse_key}
          </Text>
          <View style={styles.resultHeaderActions}>
            <Pressable
              onPress={(e) => {
                e.stopPropagation?.();
                handleShare(result);
              }}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              style={styles.resultIconButton}
            >
              <IconSymbol
                name="square.and.arrow.up"
                size={16}
                color={textMuted}
              />
            </Pressable>
            <IconSymbol
              name={isExpanded ? 'chevron.up' : 'chevron.down'}
              size={16}
              color={textMuted}
            />
          </View>
        </View>

        <Text
          style={[styles.arabicText, { color: textColor }]}
          numberOfLines={isExpanded ? undefined : 2}
        >
          {result.text}
        </Text>

        {result.translations?.[0] && (
          <Text
            style={styles.translationText}
            numberOfLines={isExpanded ? undefined : 2}
          >
            {result.highlighted
              ? renderHighlightedText(result.highlighted)
              : <Text style={{ color: textSecondary }}>{renderHighlightedText(result.translations[0].text)}</Text>
            }
          </Text>
        )}

        {isExpanded && (
          <View style={[styles.audioContainer, { borderTopColor: dividerColor }]}>
            <AudioPlayer
              audioUrl={audioUrl}
              isLoading={isLoadingAudio}
            />
          </View>
        )}
      </>
    );

    return (
      <Pressable onPress={() => handleVersePress(result.verse_key)}>
        <ThemedBlurView
          intensity={25}
          style={[styles.resultCard, { borderColor: cardBorder }]}
        >
          {cardContent}
        </ThemedBlurView>
      </Pressable>
    );
  }, [expandedVerse, audioUrl, isLoadingAudio, cardBorder, accentColor, textMuted, textColor, textSecondary, dividerColor, handleVersePress, handleShare, renderHighlightedText]);

  const ListHeader = (
    <>
      <Animated.View entering={FadeInDown.duration(600)} style={styles.header}>
        <View style={styles.headerRow}>
          <View style={{ width: 24 }} />
          <Text style={[styles.headerTitle, { color: textColor, marginBottom: 0 }]}>Search Quran</Text>
          <SettingsHeaderButton />
        </View>
      </Animated.View>

      <Animated.View
        entering={FadeInUp.delay(100).duration(600)}
        style={[styles.searchContainer, { borderColor }]}
      >
        <ThemedBlurView intensity={25} style={styles.searchBlur}>
          <IconSymbol name="magnifyingglass" size={20} color={textMuted} />
          <TextInput
            style={[styles.searchInput, { color: textColor }]}
            placeholder="Search verses..."
            placeholderTextColor={textMuted}
            value={searchQuery}
            onChangeText={setSearchQuery}
            returnKeyType="search"
            autoFocus
          />
          {searchQuery.length > 0 && (
            <Pressable onPress={handleClearSearch}>
              <IconSymbol name="xmark.circle.fill" size={20} color={textMuted} />
            </Pressable>
          )}
        </ThemedBlurView>
      </Animated.View>

      {hasSearched && !isSearching && (
        <Animated.View entering={FadeInUp.delay(200).duration(400)}>
          <Text style={[styles.resultsCount, { color: textMuted }]}>
            {totalResults > 0
              ? `Found ${totalResults} result${totalResults !== 1 ? 's' : ''} (showing ${results.length})`
              : 'No results found'}
          </Text>
        </Animated.View>
      )}

      {isSearching && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={accentColor} />
          <Text style={[styles.loadingText, { color: textMuted }]}>
            Searching...
          </Text>
        </View>
      )}

      {!hasSearched && !isSearching && (
        <View style={styles.emptyState}>
          <IconSymbol name="book.fill" size={48} color={textMuted} />
          <Text style={[styles.emptyStateText, { color: textMuted }]}>
            Search for words or phrases in the Quran
          </Text>
          <Text style={[styles.emptyStateHint, { color: textMuted }]}>
            Try searching for "Allah", "mercy", or "prayer"
          </Text>
        </View>
      )}
    </>
  );

  const hasMoreResults = currentPage < totalPages;

  const ListFooter = () => {
    if (isLoadingMore) {
      return (
        <View style={styles.loadingMore}>
          <ActivityIndicator size="small" color={accentColor} />
          <Text style={[styles.loadingMoreText, { color: textMuted }]}>
            Loading more...
          </Text>
        </View>
      );
    }

    if (hasMoreResults && results.length > 0) {
      return (
        <Pressable onPress={loadMore} style={styles.loadMoreButton}>
          <Text style={[styles.loadMoreButtonText, { color: accentColor }]}>
            Load more results
          </Text>
        </Pressable>
      );
    }

    return null;
  };

  return (
    <>
      <View style={[styles.container, { backgroundColor }]}>
        <ThemedStatusBar />
        <LinearGradient
          colors={gradientColors}
          style={StyleSheet.absoluteFillObject}
        />

        <FlatList
          data={results}
          renderItem={renderItem}
          keyExtractor={(item) => item.verse_key}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          ListHeaderComponent={ListHeader}
          ListFooterComponent={ListFooter}
          onEndReached={loadMore}
          onEndReachedThreshold={0.5}
          ItemSeparatorComponent={() => <View style={styles.itemSeparator} />}
        />
      </View>

      {shareContent && (
        <ShareModal
          visible={showShareModal}
          onClose={() => setShowShareModal(false)}
          content={shareContent}
        />
      )}
    </>
  );
}
