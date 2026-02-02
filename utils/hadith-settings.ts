import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

const HADITH_API_KEY = '$2y$10$Mya0JReiVpQA0PbWJXJ4hoRCoYM3854wghdyNwwgAlLPQaurclO6';

// Cache duration: 1 week in milliseconds
const BOOKS_CACHE_DURATION = 7 * 24 * 60 * 60 * 1000;

export interface HadithBook {
  id: number;
  bookName: string;
  writerName: string;
  aboutWriter: string | null;
  writerDeath: string;
  bookSlug: string;
  hadiths_count: string;
  chapters_count: string;
}

interface HadithSettingsState {
  selectedBook: HadithBook | null;
  books: HadithBook[];
  booksCachedAt: number | null;
  isLoadingBooks: boolean;
  booksError: string | null;
  bookmarkedHadiths: Hadith[];
  setSelectedBook: (book: HadithBook) => void;
  setBooks: (books: HadithBook[]) => void;
  setIsLoadingBooks: (loading: boolean) => void;
  setBooksError: (error: string | null) => void;
  loadBooks: (forceRefresh?: boolean) => Promise<void>;
  addBookmark: (hadith: Hadith) => void;
  removeBookmark: (hadithId: number) => void;
  isBookmarked: (hadithId: number) => boolean;
}

export const useHadithSettings = create<HadithSettingsState>()(
  persist(
    (set, get) => ({
      selectedBook: null,
      books: [],
      booksCachedAt: null,
      isLoadingBooks: false,
      booksError: null,
      bookmarkedHadiths: [],
      setSelectedBook: (book) => set({ selectedBook: book }),
      setBooks: (books) => set({ books, booksCachedAt: Date.now() }),
      setIsLoadingBooks: (loading) => set({ isLoadingBooks: loading }),
      setBooksError: (error) => set({ booksError: error }),
      loadBooks: async (forceRefresh = false) => {
        const { books, booksCachedAt } = get();
        const now = Date.now();

        // Check if cache is still valid (books exist and not expired)
        const cacheValid = books.length > 0 &&
          booksCachedAt !== null &&
          (now - booksCachedAt) < BOOKS_CACHE_DURATION;

        if (cacheValid && !forceRefresh) return;

        set({ isLoadingBooks: true, booksError: null });
        try {
          const fetchedBooks = await fetchHadithBooks();
          set({ books: fetchedBooks, booksCachedAt: now, isLoadingBooks: false });
        } catch (error) {
          set({
            booksError: 'Failed to load hadith books',
            isLoadingBooks: false
          });
        }
      },
      addBookmark: (hadith) => {
        const current = get().bookmarkedHadiths;
        if (!current.some((h) => h.id === hadith.id)) {
          set({ bookmarkedHadiths: [hadith, ...current] });
        }
      },
      removeBookmark: (hadithId) => {
        set({
          bookmarkedHadiths: get().bookmarkedHadiths.filter((h) => h.id !== hadithId),
        });
      },
      isBookmarked: (hadithId) => {
        return get().bookmarkedHadiths.some((h) => h.id === hadithId);
      },
    }),
    {
      name: 'hadith-settings',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        selectedBook: state.selectedBook,
        books: state.books,
        booksCachedAt: state.booksCachedAt,
        bookmarkedHadiths: state.bookmarkedHadiths,
      }),
    }
  )
);


export async function fetchHadithBooks(): Promise<HadithBook[]> {
  try {
    const response = await fetch(
      `https://hadithapi.com/api/books?apiKey=${HADITH_API_KEY}`
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    if (data.status === 200 && data.books) {
      return data.books as HadithBook[];
    }

    throw new Error(data.message || 'Failed to fetch hadith books');
  } catch (error) {
    console.error('Error fetching hadith books:', error);
    throw error;
  }
}

export function getSelectedBookDisplayName(): string {
  const selectedBook = useHadithSettings.getState().selectedBook;
  return selectedBook?.bookName ?? 'Not selected';
}

export function cleanHadithText(text: string): string {
  return text
    .replace(/<[^>]*>/g, '')
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/رضی اللہ عنہا|رضي الله عنها/g, '(RA)')
    .replace(/رضی اللہ عنہ|رضي الله عنه/g, '(RA)')
    .replace(/رضی اللہ عنہم|رضي الله عنهم/g, '(RA)')
    .replace(/صلی اللہ علیہ وسلم|صلى الله عليه وسلم|ﷺ/g, 'SAW')
    .trim();
}

export interface Hadith {
  id: number;
  hadithNumber: string;
  englishNarrator: string;
  hadithEnglish: string;
  hadithUrdu: string;
  hadithArabic: string;
  headingArabic: string;
  headingUrdu: string;
  headingEnglish: string;
  chapterArabic: string;
  chapterUrdu: string;
  chapterEnglish: string;
  bookSlug: string;
  volume: string;
  status: string;
  book: {
    id: number;
    bookName: string;
    writerName: string;
    bookSlug: string;
  };
  chapter: {
    id: number;
    chapterNumber: string;
    chapterEnglish: string;
    chapterUrdu: string;
    chapterArabic: string;
  };
}

const DEFAULT_BOOK_SLUG = 'sahih-bukhari';
const DEFAULT_HADITH_COUNT = 7276;

function getDailyRandomNumber(max: number): number {
  const today = new Date();
  const seed = today.getFullYear() * 10000 + (today.getMonth() + 1) * 100 + today.getDate();
  const random = Math.sin(seed) * 10000;
  return Math.floor((random - Math.floor(random)) * max) + 1;
}

export async function fetchDailyHadith(): Promise<Hadith | null> {
  try {
    const selectedBook = useHadithSettings.getState().selectedBook;
    const bookSlug = selectedBook?.bookSlug ?? DEFAULT_BOOK_SLUG;
    const maxHadiths = selectedBook ? parseInt(selectedBook.hadiths_count, 10) : DEFAULT_HADITH_COUNT;

    const hadithNumber = getDailyRandomNumber(maxHadiths);

    const response = await fetch(
      `https://hadithapi.com/api/hadiths?apiKey=${HADITH_API_KEY}&book=${bookSlug}&hadithNumber=${hadithNumber}`
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    if (data.status === 200 && data.hadiths?.data?.length > 0) {
      return data.hadiths.data[0] as Hadith;
    }

    return null;
  } catch (error) {
    console.error('Error fetching daily hadith:', error);
    throw error;
  }
}
