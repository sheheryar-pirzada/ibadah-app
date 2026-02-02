import { Hadith, HadithBook } from '@/utils/hadith-settings';
import { HADITH_API_KEY as API_KEY, Chapter, ChapterApiResponse, HadithApiResponse } from '@/utils/hadith-types';
import * as Haptics from 'expo-haptics';
import { useCallback, useState } from 'react';
import { Keyboard } from 'react-native';

const PAGE_SIZE = 20;

export function useHadithSearch(bookInfo: HadithBook | null) {
    const [searchQuery, setSearchQuery] = useState('');
    const [results, setResults] = useState<Hadith[]>([]);
    const [chapterResults, setChapterResults] = useState<Chapter[]>([]);
    const [allChapters, setAllChapters] = useState<Chapter[]>([]);
    const [hasSearched, setHasSearched] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const [chaptersLoading, setChaptersLoading] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [lastPage, setLastPage] = useState(1);
    const [totalResults, setTotalResults] = useState(0);
    const [error, setError] = useState<string | null>(null);
    const [searchMode, setSearchMode] = useState<'content' | 'chapter'>('content');

    const fetchChapters = useCallback(async (shouldDisplay = false) => {
        if (!bookInfo?.bookSlug) return;

        setChaptersLoading(true);
        try {
            const response = await fetch(`https://hadithapi.com/api/${bookInfo.bookSlug}/chapters?apiKey=${API_KEY}`);
            const data: ChapterApiResponse = await response.json();

            if (response.ok && data.status === 200 && data.chapters) {
                setAllChapters(data.chapters);
                if (shouldDisplay) {
                    setChapterResults(data.chapters);
                    setTotalResults(data.chapters.length);
                    setHasSearched(true);
                }
            } else {
                setError('Failed to load chapters');
            }
        } catch {
            setError('Failed to load chapters');
        } finally {
            setChaptersLoading(false);
        }
    }, [bookInfo?.bookSlug]);

    const searchHadiths = useCallback(async (query: string, page: number = 1, append: boolean = false) => {
        if (!query.trim()) return;

        if (page === 1) {
            setIsLoading(true);
        } else {
            setIsLoadingMore(true);
        }
        setError(null);

        try {
            const params = new URLSearchParams({
                apiKey: API_KEY,
                paginate: PAGE_SIZE.toString(),
                page: page.toString(),
            });

            params.append('hadithEnglish', query.trim());

            if (bookInfo?.bookSlug) {
                params.append('book', bookInfo.bookSlug);
            }

            const response = await fetch(`https://hadithapi.com/api/hadiths/?${params.toString()}`);
            const data: HadithApiResponse = await response.json();

            if (response.ok && data.status === 200 && data.hadiths) {
                const newResults = data.hadiths.data || [];
                setResults(prev => append ? [...prev, ...newResults] : newResults);
                setCurrentPage(data.hadiths.current_page);
                setLastPage(data.hadiths.last_page);
                setTotalResults(data.hadiths.total);
                setHasSearched(true);
            } else {
                setError(data.message || 'No results found');
                if (!append) {
                    setResults([]);
                }
                setHasSearched(true);
            }
        } catch {
            setError('Failed to search hadiths. Please try again.');
            if (!append) {
                setResults([]);
            }
        } finally {
            setIsLoading(false);
            setIsLoadingMore(false);
        }
    }, [bookInfo?.bookSlug]);

    const filterChapters = useCallback((query: string) => {
        if (!query.trim()) {
            setChapterResults(allChapters);
            setTotalResults(allChapters.length);
            setHasSearched(true);
            return;
        }

        const filtered = allChapters.filter(chapter =>
            chapter.chapterEnglish.toLowerCase().includes(query.toLowerCase()) ||
            chapter.chapterNumber.toString().includes(query) ||
            (chapter.chapterArabic && chapter.chapterArabic.includes(query))
        );

        setChapterResults(filtered);
        setTotalResults(filtered.length);
        setHasSearched(true);
    }, [allChapters]);

    const toggleSearchMode = useCallback(() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        const newMode = searchMode === 'content' ? 'chapter' : 'content';
        setSearchMode(newMode);

        setSearchQuery('');
        setError(null);
        Keyboard.dismiss();

        if (newMode === 'chapter') {
            if (allChapters.length > 0) {
                setChapterResults(allChapters);
                setTotalResults(allChapters.length);
                setHasSearched(true);
            } else {
                fetchChapters(true);
            }
        } else {
            setResults([]);
            setHasSearched(false);
            setTotalResults(0);
            setCurrentPage(1);
            setLastPage(1);
        }
    }, [searchMode, allChapters, fetchChapters]);

    const handleSearch = useCallback(() => {
        Keyboard.dismiss();
        if (searchQuery.trim()) {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            if (searchMode === 'chapter') {
                filterChapters(searchQuery);
            } else {
                searchHadiths(searchQuery, 1, false);
            }
        }
    }, [searchQuery, searchMode, filterChapters, searchHadiths]);

    const handleTextChange = useCallback((text: string) => {
        setSearchQuery(text);
        if (searchMode === 'chapter') {
            filterChapters(text);
        }
    }, [searchMode, filterChapters]);

    const handleLoadMore = useCallback(() => {
        if (searchMode === 'chapter') return;
        if (!isLoadingMore && currentPage < lastPage) {
            searchHadiths(searchQuery, currentPage + 1, true);
        }
    }, [searchMode, isLoadingMore, currentPage, lastPage, searchQuery, searchHadiths]);

    const handleClearSearch = useCallback(() => {
        setSearchQuery('');
        setError(null);
        Keyboard.dismiss();

        if (searchMode === 'chapter') {
            setChapterResults(allChapters);
            setTotalResults(allChapters.length);
            setHasSearched(true);
        } else {
            setResults([]);
            setHasSearched(false);
            setTotalResults(0);
            setCurrentPage(1);
            setLastPage(1);
        }
    }, [searchMode, allChapters]);

    return {
        searchQuery,
        setSearchQuery,
        results,
        chapterResults,
        allChapters,
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
    };
}
