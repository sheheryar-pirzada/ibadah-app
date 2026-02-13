// utils/quran-sdk.ts
// Wrapper around @quranjs/api SDK for the Quran Foundation API.
// This module initializes the QuranClient and exposes typed helper functions
// that the rest of the app can call. In a future PR these will replace the
// manual fetch calls in quran-api.ts.

import {
  QuranClient,
  Language,
  SearchMode,
  type Chapter,
  type ChapterInfo,
  type ChapterId,
  type Verse,
  type VerseKey,
  type PageNumber,
  type JuzNumber,
  type HizbNumber,
  type RubNumber,
  type Juz,
  type ChapterRecitation,
  type VerseRecitation,
  type Pagination,
  type SearchResponse,
  type SearchParams,
  type BaseApiParams,
  type PaginationParams,
  type RecitationResource,
  type TranslationResource,
  type TafsirResource,
  type LanguageResource,
  type ChapterReciterResource,
  type WordField,
  type TranslationField,
  type VerseField,
} from '@quranjs/api';

// Reconstruct types not directly exported by the SDK
export type GetVerseOptions = BaseApiParams &
  PaginationParams & {
    reciter?: string | number;
    words?: boolean;
    translations?: string[] | number[];
    tafsirs?: string[] | number[];
    wordFields?: Partial<Record<WordField, boolean>>;
    translationFields?: Partial<Record<TranslationField, boolean>>;
    fields?: Partial<Record<VerseField, boolean>>;
  };

export type SearchOptions = Omit<SearchParams, 'query'>;

// Re-export types that consumers will need
export type {
  Chapter,
  ChapterInfo,
  ChapterId,
  Verse,
  VerseKey,
  PageNumber,
  JuzNumber,
  HizbNumber,
  RubNumber,
  Juz,
  ChapterRecitation,
  VerseRecitation,
  Pagination,
  SearchResponse,
  RecitationResource,
  TranslationResource,
  TafsirResource,
  LanguageResource,
  ChapterReciterResource,
};

export { Language, SearchMode };

// ---------------------------------------------------------------------------
// User preferences
// ---------------------------------------------------------------------------

import { getReciterSettings } from '@/utils/reciter-settings';
import { getTranslationSettings } from '@/utils/translation-settings';

export interface UserQuranDefaults {
  reciterId: number;
  translationId: number;
}

/** Read the user's saved reciter + translation preferences from AsyncStorage. */
export async function getUserDefaults(): Promise<UserQuranDefaults> {
  const [reciter, translation] = await Promise.all([
    getReciterSettings(),
    getTranslationSettings(),
  ]);
  return {
    reciterId: reciter.reciterId,
    translationId: translation.translationId,
  };
}

/**
 * Build GetVerseOptions that include the user's preferred reciter &
 * translation, merged with any explicit overrides the caller provides.
 */
export async function buildVerseOptions(
  overrides?: GetVerseOptions
): Promise<GetVerseOptions> {
  const defaults = await getUserDefaults();
  return {
    translations: [defaults.translationId],
    reciter: defaults.reciterId,
    ...overrides,
  };
}

// ---------------------------------------------------------------------------
// Client singleton
// ---------------------------------------------------------------------------

let _client: QuranClient | null = null;

function getClient(): QuranClient {
  if (!_client) {
    const clientId = process.env.EXPO_PUBLIC_QURAN_CLIENT_ID;
    const clientSecret = process.env.EXPO_PUBLIC_QURAN_CLIENT_SECRET;
    const authBaseUrl = process.env.EXPO_PUBLIC_QURAN_ENDPOINT;

    if (!clientId || !clientSecret) {
      throw new Error(
        'Missing EXPO_PUBLIC_QURAN_CLIENT_ID or EXPO_PUBLIC_QURAN_CLIENT_SECRET in environment'
      );
    }

    _client = new QuranClient({
      clientId,
      clientSecret,
      ...(authBaseUrl ? { authBaseUrl } : {}),
    });
  }
  return _client;
}

/** Expose the raw client for advanced / one-off usage. */
export function getQuranClient(): QuranClient {
  return getClient();
}

// ---------------------------------------------------------------------------
// Chapters
// ---------------------------------------------------------------------------

export async function getChapters(
  language: Language = Language.ENGLISH
): Promise<Chapter[]> {
  return getClient().chapters.findAll({ language });
}

export async function getChapterById(
  id: ChapterId,
  language: Language = Language.ENGLISH
): Promise<Chapter> {
  return getClient().chapters.findById(id, { language });
}

export async function getChapterInfo(
  id: ChapterId,
  language: Language = Language.ENGLISH
): Promise<ChapterInfo> {
  return getClient().chapters.findInfoById(id, { language });
}

// ---------------------------------------------------------------------------
// Verses
// ---------------------------------------------------------------------------

export async function getVerseByKey(
  key: VerseKey,
  options?: GetVerseOptions
): Promise<Verse> {
  const opts = await buildVerseOptions(options);
  return getClient().verses.findByKey(key, opts);
}

export async function getVersesByChapter(
  chapterId: ChapterId,
  options?: GetVerseOptions
): Promise<Verse[]> {
  const opts = await buildVerseOptions(options);
  return getClient().verses.findByChapter(chapterId, opts);
}

export async function getVersesByPage(
  page: PageNumber,
  options?: GetVerseOptions
): Promise<Verse[]> {
  const opts = await buildVerseOptions(options);
  return getClient().verses.findByPage(page, opts);
}

export async function getVersesByJuz(
  juz: JuzNumber,
  options?: GetVerseOptions
): Promise<Verse[]> {
  const opts = await buildVerseOptions(options);
  return getClient().verses.findByJuz(juz, opts);
}

export async function getVersesByHizb(
  hizb: HizbNumber,
  options?: GetVerseOptions
): Promise<Verse[]> {
  const opts = await buildVerseOptions(options);
  return getClient().verses.findByHizb(hizb, opts);
}

export async function getVersesByRub(
  rub: RubNumber,
  options?: GetVerseOptions
): Promise<Verse[]> {
  const opts = await buildVerseOptions(options);
  return getClient().verses.findByRub(rub, opts);
}

export async function getRandomVerse(
  options?: GetVerseOptions
): Promise<Verse> {
  const opts = await buildVerseOptions(options);
  return getClient().verses.findRandom(opts);
}

// ---------------------------------------------------------------------------
// Juzs
// ---------------------------------------------------------------------------

export async function getAllJuzs(): Promise<Juz[]> {
  return getClient().juzs.findAll();
}

// ---------------------------------------------------------------------------
// Audio
// ---------------------------------------------------------------------------

/**
 * If no reciterId is provided, falls back to the user's saved preference.
 */
export async function getChapterRecitations(
  reciterId?: string
): Promise<ChapterRecitation[]> {
  const id = reciterId ?? String((await getUserDefaults()).reciterId);
  return getClient().audio.findAllChapterRecitations(id);
}

export async function getChapterRecitationById(
  chapterId: ChapterId,
  reciterId?: string
): Promise<ChapterRecitation> {
  const id = reciterId ?? String((await getUserDefaults()).reciterId);
  return getClient().audio.findChapterRecitationById(id, chapterId);
}

export async function getVerseRecitationsByChapter(
  chapterId: ChapterId,
  recitationId?: string
): Promise<{ audioFiles: VerseRecitation[]; pagination: Pagination }> {
  const id = recitationId ?? String((await getUserDefaults()).reciterId);
  return getClient().audio.findVerseRecitationsByChapter(chapterId, id);
}

export async function getVerseRecitationsByKey(
  key: VerseKey,
  recitationId?: string
): Promise<{ audioFiles: VerseRecitation[]; pagination: Pagination }> {
  const id = recitationId ?? String((await getUserDefaults()).reciterId);
  return getClient().audio.findVerseRecitationsByKey(key, id);
}

// ---------------------------------------------------------------------------
// Search
// ---------------------------------------------------------------------------

export async function searchQuran(
  query: string,
  options?: Omit<SearchOptions, 'mode'> & { mode?: SearchMode }
): Promise<SearchResponse> {
  return getClient().search.search(query, {
    mode: SearchMode.Quick,
    ...options,
  });
}

// ---------------------------------------------------------------------------
// Resources
// ---------------------------------------------------------------------------

export async function getRecitations(
  language: Language = Language.ENGLISH
): Promise<RecitationResource[]> {
  return getClient().resources.findAllRecitations({ language });
}

export async function getTranslations(
  language: Language = Language.ENGLISH
): Promise<TranslationResource[]> {
  return getClient().resources.findAllTranslations({ language });
}

export async function getTafsirs(
  language: Language = Language.ENGLISH
): Promise<TafsirResource[]> {
  return getClient().resources.findAllTafsirs({ language });
}

export async function getLanguages(
  language: Language = Language.ENGLISH
): Promise<LanguageResource[]> {
  return getClient().resources.findAllLanguages({ language });
}

export async function getChapterReciters(
  language: Language = Language.ENGLISH
): Promise<ChapterReciterResource[]> {
  return getClient().resources.findAllChapterReciters({ language });
}
