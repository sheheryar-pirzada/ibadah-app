// utils/quran-api.ts
import AsyncStorage from '@react-native-async-storage/async-storage';

const QURAN_API_BASE = 'https://api.quran.com/api/v4';
// const QURAN_API_BASE = 'https://apis-prelive.quran.foundation/content/api/v4'


const STORAGE_KEYS = {
  RECITERS_CACHE: 'quran_reciters_cache',
  RECITERS_CACHE_TIME: 'quran_reciters_cache_time',
  TRANSLATIONS_CACHE: 'quran_translations_cache',
  TRANSLATIONS_CACHE_TIME: 'quran_translations_cache_time',
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

export interface TranslationResource {
  id: number;
  name: string;
  language_name?: string;
  translator_name?: string;
  // allow extra fields from API without breaking
  [key: string]: any;
}

export interface VerseAudio {
  url: string;
  verse_key?: string;
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
  audio?: {
    url: string;
    segments?: number[][];
  };
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

export interface TafsirResult {
  resourceId: number;
  resourceName: string;
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
   * Get list of available translations (api.quran.com, no auth).
   * This is used only for populating the settings picker.
   */
  async getTranslationResources(): Promise<TranslationResource[]> {
    // Cache first
    const cached = await this.getCachedTranslations();
    if (cached) return cached;

    try {
      const response = await fetch(`${QURAN_API_BASE}/resources/translations?language=en`);
      if (!response.ok) {
        throw new Error(`Failed to fetch translations: ${response.status}`);
      }
      const data = await response.json();
      const items: TranslationResource[] = data?.translations ?? [];

      await this.cacheTranslations(items);
      return items;
    } catch (error) {
      console.error('Error fetching translations:', error);
      const fallback = await this.getCachedTranslations(true);
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
        url: this.formatAudioUrl(audioFile.url),
        segments: audioFile.segments,
        verse_key: verseKey,
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
      const promises = [];
      for (let verse = startVerse; verse <= endVerse; verse++) {
        promises.push(this.getVerseAudio(`${surah}:${verse}`, recitationId));
      }
      const audioFiles = await Promise.all(promises);
      return audioFiles.filter((a): a is VerseAudio => a !== null);
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
      const url = data.audio_file?.audio_url || null;
      return url ? this.formatAudioUrl(url) : null;
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
      audio?: number;
    }
  ): Promise<Verse | null> {
    try {
      const params = new URLSearchParams({ language: 'en' });

      if (options?.translations?.length) {
        params.append('translations', options.translations.join(','));
      }
      if (options?.audio) {
        params.append('audio', String(options.audio));
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

      // Revert to stable API for robustness
      const url = `${QURAN_API_BASE}/verses/by_key/${verseKey}?${params.toString()}`;

      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`Failed to fetch verse: ${response.status}`);
      }

      const data = await response.json();
      const verse = data.verse || null;
      if (verse && verse.audio) {
        verse.audio.url = this.formatAudioUrl(verse.audio.url);
      }
      return verse;
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
      audio?: number;
      /** Include word-by-word translation and transliteration for each ayah */
      words?: boolean;
    }
  ): Promise<{ verses: Verse[]; pagination: { total_pages: number; current_page: number } }> {
    try {
      const params = new URLSearchParams({
        page: String(options?.page || 1),
        per_page: String(options?.perPage || 10),
        language: 'en'
      });

      if (options?.translations?.length) {
        params.append('translations', options.translations.join(','));
      }
      if (options?.audio) {
        params.append('audio', String(options.audio));
      }
      if (options?.words) {
        params.append('words', '1');
        params.append('word_fields', 'text_uthmani,text_imlaei,translation,transliteration');
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
      const verses = (data.verses || []).map((v: Verse) => {
        if (v.audio) {
          v.audio.url = this.formatAudioUrl(v.audio.url);
        }
        return v;
      });

      return {
        verses,
        pagination: data.pagination || { total_pages: 1, current_page: 1 },
      };
    } catch (error) {
      console.error('Error fetching verses by chapter:', error);
      return { verses: [], pagination: { total_pages: 1, current_page: 1 } };
    }
  }

  /**
   * Get verses by Madani Mushaf page number (1–604).
   * Uses the same API contract as Quran Foundation "By Page" (api.quran.com exposes it).
   */
  async getVersesByPage(
    pageNumber: number,
    options?: {
      translations?: number[];
      audio?: number;
      perPage?: number;
      /** Include word-by-word translation and transliteration for each ayah */
      words?: boolean;
    }
  ): Promise<{
    verses: Verse[];
    pagination: { current_page: number; next_page: number | null; total_pages: number; total_records: number };
  }> {
    if (pageNumber < 1 || pageNumber > 604) {
      return {
        verses: [],
        pagination: { current_page: pageNumber, next_page: null, total_pages: 1, total_records: 0 },
      };
    }
    try {
      const params = new URLSearchParams({
        per_page: String(options?.perPage ?? 50),
        language: 'en',
      });
      params.append('fields', 'text_uthmani');
      if (options?.translations?.length) {
        params.append('translations', options.translations.join(','));
      }
      if (options?.audio) {
        params.append('audio', String(options.audio));
      }
      if (options?.words) {
        params.append('words', '1');
        params.append('word_fields', 'text_uthmani,text_imlaei,translation,transliteration');
      }

      const response = await fetch(
        `${QURAN_API_BASE}/verses/by_page/${pageNumber}?${params.toString()}`
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch verses by page: ${response.status}`);
      }

      const data = await response.json();
      const verses: Verse[] = (data.verses || []).map((v: Verse) => {
        if (v.audio) {
          v.audio.url = this.formatAudioUrl(v.audio.url);
        }
        return v;
      });
      const pagination = data.pagination || {
        current_page: 1,
        next_page: null,
        total_pages: 1,
        total_records: verses.length,
      };

      return { verses, pagination };
    } catch (error) {
      console.error('Error fetching verses by page:', error);
      return {
        verses: [],
        pagination: {
          current_page: pageNumber,
          next_page: null,
          total_pages: 1,
          total_records: 0,
        },
      };
    }
  }

  /**
   * Get translation for a specific verse
   */
  async getVerseTranslation(resourceId: number, verseKey: string): Promise<string | null> {
    try {
      const response = await fetch(
        `${QURAN_API_BASE}/quran/translations/${resourceId}?verse_key=${verseKey}`
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch translation: ${response.status}`);
      }

      const data = await response.json();
      // api.quran.com returns { translations: [ { text: "..." } ] }
      return data.translations?.[0]?.text || null;
    } catch (error) {
      console.error('Error fetching verse translation:', error);
      return null;
    }
  }

  /**
   * Get tafsir for a specific ayah
   * URL: /tafsirs/:resource_id/by_ayah/:ayah_key
   */
  async getTafsirByAyah(resourceId: number, ayahKey: string): Promise<TafsirResult | null> {
    try {
      const response = await fetch(
        `${QURAN_API_BASE}/tafsirs/${resourceId}/by_ayah/${encodeURIComponent(ayahKey)}`
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch tafsir: ${response.status}`);
      }

      const data = await response.json();
      const t = data.tafsir;
      if (!t || t.text == null) return null;
      return {
        resourceId: t.resource_id,
        resourceName: t.resource_name ?? t.translated_name?.name ?? '',
        text: t.text,
      };
    } catch (error) {
      console.error('Error fetching tafsir:', error);
      return null;
    }
  }

  private formatAudioUrl(url: string): string {
    if (!url) return url;
    return url.startsWith('http') ? url : `https://verses.quran.com/${url}`;
  }

  // Cache helpers

  private async getCachedTranslations(allowExpired: boolean = false): Promise<TranslationResource[] | null> {
    try {
      const [raw, rawTime] = await Promise.all([
        AsyncStorage.getItem(STORAGE_KEYS.TRANSLATIONS_CACHE),
        AsyncStorage.getItem(STORAGE_KEYS.TRANSLATIONS_CACHE_TIME),
      ]);
      if (!raw || !rawTime) return null;

      const savedAt = Number(rawTime);
      if (!allowExpired && Date.now() - savedAt > CACHE_DURATION) {
        return null;
      }
      return JSON.parse(raw) as TranslationResource[];
    } catch {
      return null;
    }
  }

  private async cacheTranslations(items: TranslationResource[]): Promise<void> {
    try {
      await Promise.all([
        AsyncStorage.setItem(STORAGE_KEYS.TRANSLATIONS_CACHE, JSON.stringify(items)),
        AsyncStorage.setItem(STORAGE_KEYS.TRANSLATIONS_CACHE_TIME, String(Date.now())),
      ]);
    } catch {
      // ignore cache errors
    }
  }
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
