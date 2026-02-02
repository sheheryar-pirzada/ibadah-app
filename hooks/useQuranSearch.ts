import {
    quranAPI,
    SearchResult
} from '@/utils/quran-api';
import {
    mergeSearchResults,
    QURAN_SEARCH_PAGE_SIZE,
    sortSearchResultsBySurah
} from '@/utils/quran-search';
import { useCallback, useEffect, useRef, useState } from 'react';

export function useQuranSearch() {
    const [searchQuery, setSearchQuery] = useState('');
    const [results, setResults] = useState<SearchResult[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [hasSearched, setHasSearched] = useState(false);
    const [totalResults, setTotalResults] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(0);
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const currentQueryRef = useRef('');

    const performSearch = useCallback(async (query: string, page: number) => {
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
    }, []);

    const loadMore = useCallback(() => {
        if (isLoadingMore || isSearching || currentPage >= totalPages) return;
        performSearch(currentQueryRef.current, currentPage + 1);
    }, [isLoadingMore, isSearching, currentPage, totalPages, performSearch]);

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
    }, [searchQuery, performSearch]);

    const clearSearch = useCallback(() => {
        setSearchQuery('');
        setResults([]);
        setHasSearched(false);
        setCurrentPage(1);
        setTotalPages(0);
    }, []);

    return {
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
    };
}
