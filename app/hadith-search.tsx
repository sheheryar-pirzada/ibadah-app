import HadithSearchHeader from '@/components/HadithSearchHeader';
import HadithSearchListItem from '@/components/HadithSearchListItem';
import { ThemedStatusBar } from '@/components/ThemedStatusBar';
import { useTheme } from '@/contexts/ThemeContext';
import { useHadithSearch } from '@/hooks/useHadithSearch';
import { useThemeColor } from '@/hooks/useThemeColor';
import { useHadithSettings } from '@/utils/hadith-settings';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useCallback, useMemo } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View
} from 'react-native';

export default function HadithSearchScreen() {
  const { bookId } = useLocalSearchParams<{ bookId: string }>();
  const { resolvedTheme } = useTheme();
  const { books } = useHadithSettings();

  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const textMuted = useThemeColor({}, 'textMuted');
  const accentColor = useThemeColor({}, 'accent');
  const borderColor = useThemeColor({}, 'border');

  const gradientColors = resolvedTheme === 'dark'
    ? (['rgba(0,0,0,0.3)', 'rgba(0,0,0,0.1)', 'rgba(0,0,0,0.4)'] as const)
    : (['rgba(255,255,255,0.1)', 'rgba(255,255,255,0.05)', 'rgba(255,255,255,0.15)'] as const);

  const bookInfo = useMemo(() => {
    if (!bookId) return null;
    return books.find((b) => b.id === parseInt(bookId, 10)) ?? null;
  }, [bookId, books]);

  const {
    searchQuery,
    results,
    chapterResults,
    hasSearched,
    isLoading,
    isLoadingMore,
    chaptersLoading,
    totalResults,
    error,
    searchMode,
    toggleSearchMode,
    handleSearch,
    handleTextChange,
    handleLoadMore,
    handleClearSearch,
    currentPage,
    lastPage
  } = useHadithSearch(bookInfo);

  const headerTitle = useMemo(() => {
    if (bookInfo) {
      return searchMode === 'chapter' ? `${bookInfo.bookName} Chapters` : bookInfo.bookName;
    }
    return searchMode === 'chapter' ? 'Chapter Search' : 'Hadith Search';
  }, [bookInfo, searchMode]);

  const searchPlaceholder = searchMode === 'chapter' ? 'Search chapters...' : 'Search hadith...';

  const handleBack = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.back();
  }, []);

  const ListHeader = useMemo(() => (
    <HadithSearchHeader
      bookInfo={bookInfo}
      headerTitle={headerTitle}
      searchPlaceholder={searchPlaceholder}
      searchQuery={searchQuery}
      onSearchQueryChange={handleTextChange}
      onSearch={handleSearch}
      onClearSearch={handleClearSearch}
      onBack={handleBack}
      isLoading={isLoading}
      chaptersLoading={chaptersLoading}
      searchMode={searchMode}
      toggleSearchMode={toggleSearchMode}
      hasSearched={hasSearched}
      error={error}
      totalResults={totalResults}
      resultsCount={searchMode === 'chapter' ? chapterResults.length : results.length}
    />
  ), [
    bookInfo,
    headerTitle,
    searchPlaceholder,
    searchQuery,
    handleTextChange,
    handleSearch,
    handleClearSearch,
    handleBack,
    isLoading,
    chaptersLoading,
    searchMode,
    toggleSearchMode,
    hasSearched,
    error,
    totalResults,
    chapterResults.length,
    results.length
  ]);

  const ListFooter = useMemo(() => {
    if (!hasSearched || (results.length === 0 && chapterResults.length === 0)) return null;

    if (isLoadingMore) {
      return (
        <View className="py-6 items-center">
          <ActivityIndicator size="small" color={accentColor} />
        </View>
      );
    }

    if (searchMode === 'content' && currentPage < lastPage) {
      return (
        <Pressable
          onPress={handleLoadMore}
          className="py-4 items-center mt-3"
        >
          <Text
            className="text-base font-tajawal-medium"
            style={{ color: accentColor }}
          >
            Load more hadiths
          </Text>
        </Pressable>
      );
    }

    return (
      <View className="py-4 items-center mt-3">
        <Text
          className="text-sm font-tajawal"
          style={{ color: textMuted }}
        >
          End of results
        </Text>
      </View>
    );
  }, [hasSearched, results.length, chapterResults.length, isLoadingMore, accentColor, searchMode, currentPage, lastPage, handleLoadMore, textMuted]);

  return (
    <View className="flex-1" style={{ backgroundColor }}>
      <ThemedStatusBar />
      <LinearGradient
        colors={gradientColors}
        style={StyleSheet.absoluteFill}
      />

      <FlatList
        data={searchMode === 'chapter' ? chapterResults : results}
        renderItem={({ item, index }) => <HadithSearchListItem item={item} index={index} />}
        keyExtractor={(item: any) => searchMode === 'chapter' ? `chapter-${item.id}` : `${item.bookSlug}-${item.hadithNumber}-${item.id}`}
        contentContainerStyle={{ paddingTop: 60, paddingBottom: 120, paddingHorizontal: 16 }}
        keyboardShouldPersistTaps="handled"
        ListHeaderComponent={ListHeader}
        ListFooterComponent={ListFooter}
        ItemSeparatorComponent={() => <View className="h-3" />}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.3}
      />
    </View>
  );
}

