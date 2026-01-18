// utils/quran-api.ts
import AsyncStorage from '@react-native-async-storage/async-storage';

const QURAN_API_BASE = 'https://api.quran.com/api/v4';

const STORAGE_KEYS = {
  RECITERS_CACHE: 'quran_reciters_cache',
  RECITERS_CACHE_TIME: 'quran_reciters_cache_time',
};

// Cache duration: 7 days
const CACHE_DURATION = 7 * 24 * 60 * 60 * 1000;

export interface Reciter {
  id: number;
  reciter_name: string;
  style: string | null;
  translated_name: {
    name: string;
    language_name: string;
  };
}

export interface VerseAudio {
  url: string;
  segments?: number[][]; // [word_index, start_ms, end_ms]
}

export interface Verse {
  id: number;
  verse_key: string;
  verse_number: number;
  hizb_number: number;
  rub_el_hizb_number: number;
  ruku_number: number;
  manzil_number: number;
  sajdah_number: number | null;
  page_number: number;
  juz_number: number;
  text_uthmani?: string;
  text_imlaei?: string;
  words?: Word[];
  translations?: Translation[];
}

export interface Word {
  id: number;
  position: number;
  text_uthmani: string;
  text_imlaei?: string;
  translation?: {
    text: string;
    language_name: string;
  };
  transliteration?: {
    text: string;
    language_name: string;
  };
}

export interface Translation {
  resource_id: number;
  text: string;
}

export interface SearchResult {
  verse_key: string;
  verse_id: number;
  text: string;
  highlighted?: string;
  translations?: {
    resource_id: number;
    text: string;
  }[];
}

export interface Chapter {
  id: number;
  revelation_place: string;
  revelation_order: number;
  bismillah_pre: boolean;
  name_simple: string;
  name_complex: string;
  name_arabic: string;
  verses_count: number;
  pages: number[];
  translated_name: {
    language_name: string;
    name: string;
  };
}

class QuranAPIService {
  private static instance: QuranAPIService;

  static getInstance(): QuranAPIService {
    if (!QuranAPIService.instance) {
      QuranAPIService.instance = new QuranAPIService();
    }
    return QuranAPIService.instance;
  }

  /**
   * Get list of available reciters
   */
  async getReciters(language: string = 'en'): Promise<Reciter[]> {
    // Check cache first
    const cached = await this.getCachedReciters();
    if (cached) {
      return cached;
    }

    try {
      const response = await fetch(
        `${QURAN_API_BASE}/resources/recitations?language=${language}`
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch reciters: ${response.status}`);
      }

      const data = await response.json();
      const reciters: Reciter[] = data.recitations || [];

      // Cache the results
      await this.cacheReciters(reciters);

      return reciters;
    } catch (error) {
      console.error('Error fetching reciters:', error);
      // Return cached data even if expired, as fallback
      const fallback = await this.getCachedReciters(true);
      return fallback || [];
    }
  }

  /**
   * Get audio URL for a specific verse
   */
  async getVerseAudio(verseKey: string, recitationId: number): Promise<VerseAudio | null> {
    try {
      const response = await fetch(
        `${QURAN_API_BASE}/recitations/${recitationId}/by_ayah/${verseKey}`
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch verse audio: ${response.status}`);
      }

      const data = await response.json();
      const audioFile = data.audio_files?.[0];

      if (!audioFile) {
        return null;
      }

      return {
        url: audioFile.url.startsWith('http')
          ? audioFile.url
          : `https://verses.quran.com/${audioFile.url}`,
        segments: audioFile.segments,
      };
    } catch (error) {
      console.error('Error fetching verse audio:', error);
      return null;
    }
  }

  /**
   * Get audio URLs for a range of verses (for multi-verse duas)
   */
  async getVerseRangeAudio(
    surah: number,
    startVerse: number,
    endVerse: number,
    recitationId: number
  ): Promise<VerseAudio[] | null> {
    try {
      const audioUrls: VerseAudio[] = [];

      for (let verse = startVerse; verse <= endVerse; verse++) {
        const verseKey = `${surah}:${verse}`;
        const audio = await this.getVerseAudio(verseKey, recitationId);
        if (audio) {
          audioUrls.push(audio);
        }
      }

      return audioUrls.length > 0 ? audioUrls : null;
    } catch (error) {
      console.error('Error fetching verse range audio:', error);
      return null;
    }
  }

  /**
   * Get audio URL for a full chapter
   */
  async getChapterAudio(chapterId: number, recitationId: number): Promise<string | null> {
    try {
      const response = await fetch(
        `${QURAN_API_BASE}/chapter_recitations/${recitationId}/${chapterId}`
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch chapter audio: ${response.status}`);
      }

      const data = await response.json();
      return data.audio_file?.audio_url || null;
    } catch (error) {
      console.error('Error fetching chapter audio:', error);
      return null;
    }
  }

  /**
   * Get verse by key with optional translations
   */
  async getVerse(
    verseKey: string,
    options?: {
      translations?: number[];
      words?: boolean;
      textType?: 'uthmani' | 'imlaei';
    }
  ): Promise<Verse | null> {
    try {
      const params = new URLSearchParams();

      if (options?.translations?.length) {
        params.append('translations', options.translations.join(','));
      }
      if (options?.words) {
        params.append('words', 'true');
        params.append('word_fields', 'text_uthmani,text_imlaei,translation,transliteration');
      }
      if (options?.textType === 'uthmani') {
        params.append('fields', 'text_uthmani');
      } else if (options?.textType === 'imlaei') {
        params.append('fields', 'text_imlaei');
      }

      const url = `${QURAN_API_BASE}/verses/by_key/${verseKey}${params.toString() ? '?' + params.toString() : ''}`;
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`Failed to fetch verse: ${response.status}`);
      }

      const data = await response.json();
      return data.verse || null;
    } catch (error) {
      console.error('Error fetching verse:', error);
      return null;
    }
  }

  /**
   * Search the Quran
   */
  async searchQuran(
    query: string,
    options?: {
      language?: string;
      size?: number;
      page?: number;
    }
  ): Promise<{ results: SearchResult[]; totalResults: number; totalPages: number }> {
    try {
      const params = new URLSearchParams({
        q: query,
        size: String(options?.size || 20),
        page: String(options?.page || 1),
        language: options?.language || 'en',
      });

      const response = await fetch(`${QURAN_API_BASE}/search?${params.toString()}`);

      if (!response.ok) {
        throw new Error(`Search failed: ${response.status}`);
      }

      const data = await response.json();
      const search = data.search || {};

      return {
        results: search.results || [],
        totalResults: search.total_results || 0,
        totalPages: search.total_pages || 0,
      };
    } catch (error) {
      console.error('Error searching Quran:', error);
      return { results: [], totalResults: 0, totalPages: 0 };
    }
  }

  /**
   * Get all chapters (surahs)
   */
  async getChapters(language: string = 'en'): Promise<Chapter[]> {
    try {
      const response = await fetch(
        `${QURAN_API_BASE}/chapters?language=${language}`
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch chapters: ${response.status}`);
      }

      const data = await response.json();
      return data.chapters || [];
    } catch (error) {
      console.error('Error fetching chapters:', error);
      return [];
    }
  }

  /**
   * Get a specific chapter
   */
  async getChapter(chapterId: number, language: string = 'en'): Promise<Chapter | null> {
    try {
      const response = await fetch(
        `${QURAN_API_BASE}/chapters/${chapterId}?language=${language}`
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch chapter: ${response.status}`);
      }

      const data = await response.json();
      return data.chapter || null;
    } catch (error) {
      console.error('Error fetching chapter:', error);
      return null;
    }
  }

  /**
   * Get verses by chapter
   */
  async getVersesByChapter(
    chapterId: number,
    options?: {
      page?: number;
      perPage?: number;
      translations?: number[];
      textType?: 'uthmani' | 'imlaei';
    }
  ): Promise<{ verses: Verse[]; pagination: { total_pages: number; current_page: number } }> {
    try {
      const params = new URLSearchParams({
        page: String(options?.page || 1),
        per_page: String(options?.perPage || 10),
      });

      if (options?.translations?.length) {
        params.append('translations', options.translations.join(','));
      }
      if (options?.textType === 'uthmani') {
        params.append('fields', 'text_uthmani');
      }

      const response = await fetch(
        `${QURAN_API_BASE}/verses/by_chapter/${chapterId}?${params.toString()}`
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch verses: ${response.status}`);
      }

      const data = await response.json();
      return {
        verses: data.verses || [],
        pagination: data.pagination || { total_pages: 1, current_page: 1 },
      };
    } catch (error) {
      console.error('Error fetching verses by chapter:', error);
      return { verses: [], pagination: { total_pages: 1, current_page: 1 } };
    }
  }

  // Cache helpers
  private async getCachedReciters(ignoreExpiry: boolean = false): Promise<Reciter[] | null> {
    try {
      const [cachedData, cacheTime] = await Promise.all([
        AsyncStorage.getItem(STORAGE_KEYS.RECITERS_CACHE),
        AsyncStorage.getItem(STORAGE_KEYS.RECITERS_CACHE_TIME),
      ]);

      if (!cachedData) return null;

      // Check if cache is expired
      if (!ignoreExpiry && cacheTime) {
        const timestamp = parseInt(cacheTime, 10);
        if (Date.now() - timestamp > CACHE_DURATION) {
          return null;
        }
      }

      return JSON.parse(cachedData);
    } catch (error) {
      console.error('Error reading reciters cache:', error);
      return null;
    }
  }

  private async cacheReciters(reciters: Reciter[]): Promise<void> {
    try {
      await Promise.all([
        AsyncStorage.setItem(STORAGE_KEYS.RECITERS_CACHE, JSON.stringify(reciters)),
        AsyncStorage.setItem(STORAGE_KEYS.RECITERS_CACHE_TIME, String(Date.now())),
      ]);
    } catch (error) {
      console.error('Error caching reciters:', error);
    }
  }
}

// Export singleton instance
export const quranAPI = QuranAPIService.getInstance();
