import { fetchDailyHadith, fetchHadithBooks, Hadith, useHadithSettings } from '@/utils/hadith-settings';
import { QuranVerse, quranVerseManager } from '@/utils/quran-verse';
import { useEffect, useState } from 'react';

export function useDailyContent() {
    const [dailyVerse, setDailyVerse] = useState<QuranVerse | null>(null);
    const [isLoadingVerse, setIsLoadingVerse] = useState(true);
    const [dailyHadith, setDailyHadith] = useState<Hadith | null>(null);
    const [isLoadingHadith, setIsLoadingHadith] = useState(true);

    const { setBooks, setIsLoadingBooks, selectedBook } = useHadithSettings();

    const loadDailyVerse = async () => {
        try {
            setIsLoadingVerse(true);
            await quranVerseManager.initialize();
            const verse = await quranVerseManager.getDailyVerse();
            setDailyVerse(verse);
        } catch (error) {
            console.error('Error loading daily verse:', error);
        } finally {
            setIsLoadingVerse(false);
        }
    };

    const loadDailyHadith = async () => {
        try {
            setIsLoadingHadith(true);
            const hadith = await fetchDailyHadith();
            setDailyHadith(hadith);
        } catch (error) {
            console.error('Error loading daily hadith:', error);
        } finally {
            setIsLoadingHadith(false);
        }
    };

    const loadBooks = async () => {
        try {
            setIsLoadingBooks(true);
            const fetchedBooks = await fetchHadithBooks();
            setBooks(fetchedBooks);
        } catch (err) {
            console.error('Error loading hadith books:', err);
        } finally {
            setIsLoadingBooks(false);
        }
    };

    // Load verse and books on mount
    useEffect(() => {
        loadDailyVerse();
        loadBooks();
    }, []);

    // Load/reload daily hadith when selectedBook changes (or on mount)
    useEffect(() => {
        loadDailyHadith();
    }, [selectedBook?.bookSlug]);

    return {
        dailyVerse,
        isLoadingVerse,
        dailyHadith,
        isLoadingHadith,
        loadDailyVerse,
        loadDailyHadith,
        loadBooks
    };
}

