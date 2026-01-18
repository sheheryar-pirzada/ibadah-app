import { SearchResult } from './quran-api';

export const QURAN_SEARCH_PAGE_SIZE = 20;

/**
 * Sort search results by surah number, then by verse number
 */
export function sortSearchResultsBySurah(items: SearchResult[]): SearchResult[] {
  return [...items].sort((a, b) => {
    const [surahA, verseA] = a.verse_key.split(':').map(Number);
    const [surahB, verseB] = b.verse_key.split(':').map(Number);
    if (surahA !== surahB) return surahA - surahB;
    return verseA - verseB;
  });
}

/**
 * Merge and deduplicate search results, keeping unique verse keys
 */
export function mergeSearchResults(existing: SearchResult[], newResults: SearchResult[]): SearchResult[] {
  const seen = new Set(existing.map(r => r.verse_key));
  const unique = [...existing];

  for (const result of newResults) {
    if (!seen.has(result.verse_key)) {
      seen.add(result.verse_key);
      unique.push(result);
    }
  }

  return sortSearchResultsBySurah(unique);
}

/**
 * Clean HTML text from API response, preserving only <em> tags for highlighting
 * Removes footnotes, superscripts, and other HTML tags while keeping text content
 */
export function cleanHighlightedText(text: string): string {
  if (!text) return '';

  return text
    // Remove footnotes/superscript entirely
    .replace(/<sup[^>]*>.*?<\/sup>/gi, '')
    .replace(/<a[^>]*class="sup"[^>]*>.*?<\/a>/gi, '')
    // Remove other tags but keep their text content
    .replace(/<\/?(?:i|span|a|b|strong)[^>]*>/gi, '')
    // Clean up whitespace
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Parse cleaned text into segments for highlighting
 * Returns array of { text, isHighlighted } objects
 */
export function parseHighlightSegments(text: string): Array<{ text: string; isHighlighted: boolean }> {
  const cleanedText = cleanHighlightedText(text);
  const parts = cleanedText.split(/(<em>|<\/em>)/g).filter(Boolean);
  const segments: Array<{ text: string; isHighlighted: boolean }> = [];
  let isHighlighted = false;

  for (const part of parts) {
    if (part === '<em>') {
      isHighlighted = true;
    } else if (part === '</em>') {
      isHighlighted = false;
    } else {
      segments.push({ text: part, isHighlighted });
    }
  }

  return segments;
}
