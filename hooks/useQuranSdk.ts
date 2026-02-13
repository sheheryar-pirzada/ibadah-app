// hooks/useQuranSdk.ts
// React hooks that wrap the @quranjs/api SDK helpers in utils/quran-sdk.ts.
// These are not yet wired into the UI — they exist so that integration in a
// follow-up PR is straightforward.

import { useCallback, useEffect, useRef, useState } from 'react';
import {
  Language,
  SearchMode,
  getChapters,
  getChapterById,
  getChapterInfo,
  getVerseByKey,
  getVersesByChapter,
  getVersesByPage,
  getVersesByJuz,
  getRandomVerse,
  getAllJuzs,
  getChapterRecitations,
  getChapterRecitationById,
  getVerseRecitationsByChapter,
  getVerseRecitationsByKey,
  searchQuran,
  getRecitations,
  getTranslations,
  getTafsirs,
  getLanguages,
  getChapterReciters,
  type Chapter,
  type ChapterInfo as ChapterInfoType,
  type ChapterId,
  type Verse,
  type VerseKey,
  type PageNumber,
  type JuzNumber,
  type Juz,
  type ChapterRecitation,
  type VerseRecitation,
  type Pagination,
  type SearchResponse,
  type GetVerseOptions,
  type RecitationResource,
  type TranslationResource,
  type TafsirResource,
  type LanguageResource,
  type ChapterReciterResource,
} from '@/utils/quran-sdk';

// Re-export for convenience
export type {
  Chapter,
  ChapterInfoType,
  ChapterId,
  Verse,
  VerseKey,
  PageNumber,
  JuzNumber,
  Juz,
  ChapterRecitation,
  VerseRecitation,
  Pagination,
  SearchResponse,
  GetVerseOptions,
  RecitationResource,
  TranslationResource,
  TafsirResource,
  LanguageResource,
  ChapterReciterResource,
};

// ---------------------------------------------------------------------------
// Generic async-data hook (internal helper)
// ---------------------------------------------------------------------------

interface AsyncState<T> {
  data: T | null;
  isLoading: boolean;
  error: string | null;
}

function useAsyncData<T>(
  fetcher: () => Promise<T>,
  deps: unknown[] = []
): AsyncState<T> & { refetch: () => Promise<void> } {
  const [state, setState] = useState<AsyncState<T>>({
    data: null,
    isLoading: true,
    error: null,
  });

  const fetchData = useCallback(async () => {
    setState((s) => ({ ...s, isLoading: true, error: null }));
    try {
      const data = await fetcher();
      setState({ data, isLoading: false, error: null });
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'An unknown error occurred';
      setState((s) => ({ ...s, isLoading: false, error: message }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { ...state, refetch: fetchData };
}

// ---------------------------------------------------------------------------
// Chapters
// ---------------------------------------------------------------------------

export function useSdkChapters(language: Language = Language.ENGLISH) {
  return useAsyncData<Chapter[]>(() => getChapters(language), [language]);
}

export function useSdkChapter(
  id: ChapterId,
  language: Language = Language.ENGLISH
) {
  return useAsyncData<Chapter>(() => getChapterById(id, language), [
    id,
    language,
  ]);
}

export function useSdkChapterInfo(
  id: ChapterId,
  language: Language = Language.ENGLISH
) {
  return useAsyncData<ChapterInfoType>(() => getChapterInfo(id, language), [
    id,
    language,
  ]);
}

// ---------------------------------------------------------------------------
// Verses
// ---------------------------------------------------------------------------

export function useSdkVerseByKey(key: VerseKey, options?: GetVerseOptions) {
  return useAsyncData<Verse>(() => getVerseByKey(key, options), [
    key,
    JSON.stringify(options),
  ]);
}

export function useSdkVersesByChapter(
  chapterId: ChapterId,
  options?: GetVerseOptions
) {
  return useAsyncData<Verse[]>(
    () => getVersesByChapter(chapterId, options),
    [chapterId, JSON.stringify(options)]
  );
}

export function useSdkVersesByPage(
  page: PageNumber,
  options?: GetVerseOptions
) {
  return useAsyncData<Verse[]>(() => getVersesByPage(page, options), [
    page,
    JSON.stringify(options),
  ]);
}

export function useSdkVersesByJuz(juz: JuzNumber, options?: GetVerseOptions) {
  return useAsyncData<Verse[]>(() => getVersesByJuz(juz, options), [
    juz,
    JSON.stringify(options),
  ]);
}

export function useSdkRandomVerse(options?: GetVerseOptions) {
  return useAsyncData<Verse>(() => getRandomVerse(options), [
    JSON.stringify(options),
  ]);
}

// ---------------------------------------------------------------------------
// Juzs
// ---------------------------------------------------------------------------

export function useSdkJuzs() {
  return useAsyncData<Juz[]>(() => getAllJuzs(), []);
}

// ---------------------------------------------------------------------------
// Audio (reciterId is optional — falls back to user's saved preference)
// ---------------------------------------------------------------------------

export function useSdkChapterRecitations(reciterId?: string) {
  return useAsyncData<ChapterRecitation[]>(
    () => getChapterRecitations(reciterId),
    [reciterId]
  );
}

export function useSdkChapterRecitation(
  chapterId: ChapterId,
  reciterId?: string
) {
  return useAsyncData<ChapterRecitation>(
    () => getChapterRecitationById(chapterId, reciterId),
    [chapterId, reciterId]
  );
}

export function useSdkVerseRecitationsByChapter(
  chapterId: ChapterId,
  recitationId?: string
) {
  return useAsyncData<{ audioFiles: VerseRecitation[]; pagination: Pagination }>(
    () => getVerseRecitationsByChapter(chapterId, recitationId),
    [chapterId, recitationId]
  );
}

export function useSdkVerseRecitationsByKey(
  key: VerseKey,
  recitationId?: string
) {
  return useAsyncData<{ audioFiles: VerseRecitation[]; pagination: Pagination }>(
    () => getVerseRecitationsByKey(key, recitationId),
    [key, recitationId]
  );
}

// ---------------------------------------------------------------------------
// Search
// ---------------------------------------------------------------------------

export function useSdkSearch() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResponse | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const currentQueryRef = useRef('');

  const performSearch = useCallback(
    async (
      searchQuery: string,
      options?: { page?: number; size?: number; language?: Language }
    ) => {
      if (!searchQuery.trim()) return;

      currentQueryRef.current = searchQuery;
      setIsSearching(true);
      setHasSearched(true);
      setError(null);

      try {
        const response = await searchQuran(searchQuery, {
          mode: SearchMode.Quick,
          page: options?.page,
          size: options?.size,
          language: options?.language,
        });
        // Only apply if the query hasn't changed while we were fetching
        if (currentQueryRef.current === searchQuery) {
          setResults(response);
        }
      } catch (err) {
        const message =
          err instanceof Error ? err.message : 'Search failed';
        if (currentQueryRef.current === searchQuery) {
          setError(message);
        }
      } finally {
        if (currentQueryRef.current === searchQuery) {
          setIsSearching(false);
        }
      }
    },
    []
  );

  // Debounced auto-search when query changes
  useEffect(() => {
    if (!query.trim()) {
      setResults(null);
      setHasSearched(false);
      currentQueryRef.current = '';
      return;
    }

    const timeoutId = setTimeout(() => {
      performSearch(query.trim());
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [query, performSearch]);

  const clearSearch = useCallback(() => {
    setQuery('');
    setResults(null);
    setHasSearched(false);
    setError(null);
    currentQueryRef.current = '';
  }, []);

  return {
    query,
    setQuery,
    results,
    isSearching,
    hasSearched,
    error,
    performSearch,
    clearSearch,
  };
}

// ---------------------------------------------------------------------------
// Resources
// ---------------------------------------------------------------------------

export function useSdkRecitations(language: Language = Language.ENGLISH) {
  return useAsyncData<RecitationResource[]>(
    () => getRecitations(language),
    [language]
  );
}

export function useSdkTranslations(language: Language = Language.ENGLISH) {
  return useAsyncData<TranslationResource[]>(
    () => getTranslations(language),
    [language]
  );
}

export function useSdkTafsirs(language: Language = Language.ENGLISH) {
  return useAsyncData<TafsirResource[]>(
    () => getTafsirs(language),
    [language]
  );
}

export function useSdkLanguages(language: Language = Language.ENGLISH) {
  return useAsyncData<LanguageResource[]>(
    () => getLanguages(language),
    [language]
  );
}

export function useSdkChapterReciters(language: Language = Language.ENGLISH) {
  return useAsyncData<ChapterReciterResource[]>(
    () => getChapterReciters(language),
    [language]
  );
}
