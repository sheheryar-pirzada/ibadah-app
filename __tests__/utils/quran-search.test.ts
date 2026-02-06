/**
 * @jest-environment node
 */

import {
  sortSearchResultsBySurah,
  mergeSearchResults,
  cleanHighlightedText,
  parseHighlightSegments,
  QURAN_SEARCH_PAGE_SIZE,
} from '@/utils/quran-search';

// Mock SearchResult type for testing
interface SearchResult {
  verse_key: string;
  text?: string;
  highlighted?: string;
}

describe('quran-search', () => {
  describe('QURAN_SEARCH_PAGE_SIZE', () => {
    it('should be 20', () => {
      expect(QURAN_SEARCH_PAGE_SIZE).toBe(20);
    });
  });

  describe('sortSearchResultsBySurah', () => {
    it('should sort results by surah number', () => {
      const results: SearchResult[] = [
        { verse_key: '3:5' },
        { verse_key: '1:1' },
        { verse_key: '2:255' },
      ];

      const sorted = sortSearchResultsBySurah(results);

      expect(sorted[0].verse_key).toBe('1:1');
      expect(sorted[1].verse_key).toBe('2:255');
      expect(sorted[2].verse_key).toBe('3:5');
    });

    it('should sort by verse number within same surah', () => {
      const results: SearchResult[] = [
        { verse_key: '2:255' },
        { verse_key: '2:1' },
        { verse_key: '2:100' },
      ];

      const sorted = sortSearchResultsBySurah(results);

      expect(sorted[0].verse_key).toBe('2:1');
      expect(sorted[1].verse_key).toBe('2:100');
      expect(sorted[2].verse_key).toBe('2:255');
    });

    it('should handle mixed surah and verse ordering', () => {
      const results: SearchResult[] = [
        { verse_key: '114:1' },
        { verse_key: '1:7' },
        { verse_key: '1:1' },
        { verse_key: '2:286' },
        { verse_key: '2:1' },
      ];

      const sorted = sortSearchResultsBySurah(results);

      expect(sorted.map(r => r.verse_key)).toEqual([
        '1:1',
        '1:7',
        '2:1',
        '2:286',
        '114:1',
      ]);
    });

    it('should not mutate the original array', () => {
      const results: SearchResult[] = [
        { verse_key: '3:1' },
        { verse_key: '1:1' },
      ];
      const originalFirst = results[0].verse_key;

      sortSearchResultsBySurah(results);

      expect(results[0].verse_key).toBe(originalFirst);
    });

    it('should handle empty array', () => {
      const results: SearchResult[] = [];
      const sorted = sortSearchResultsBySurah(results);
      expect(sorted).toEqual([]);
    });

    it('should handle single item', () => {
      const results: SearchResult[] = [{ verse_key: '2:255' }];
      const sorted = sortSearchResultsBySurah(results);
      expect(sorted).toEqual([{ verse_key: '2:255' }]);
    });
  });

  describe('mergeSearchResults', () => {
    it('should merge results and remove duplicates', () => {
      const existing: SearchResult[] = [
        { verse_key: '1:1' },
        { verse_key: '2:255' },
      ];
      const newResults: SearchResult[] = [
        { verse_key: '2:255' }, // duplicate
        { verse_key: '3:5' },
      ];

      const merged = mergeSearchResults(existing, newResults);

      expect(merged.length).toBe(3);
      expect(merged.map(r => r.verse_key)).toContain('1:1');
      expect(merged.map(r => r.verse_key)).toContain('2:255');
      expect(merged.map(r => r.verse_key)).toContain('3:5');
    });

    it('should return sorted results', () => {
      const existing: SearchResult[] = [{ verse_key: '3:1' }];
      const newResults: SearchResult[] = [{ verse_key: '1:1' }];

      const merged = mergeSearchResults(existing, newResults);

      expect(merged[0].verse_key).toBe('1:1');
      expect(merged[1].verse_key).toBe('3:1');
    });

    it('should keep first occurrence when duplicates exist', () => {
      const existing: SearchResult[] = [
        { verse_key: '1:1', text: 'existing text' },
      ];
      const newResults: SearchResult[] = [
        { verse_key: '1:1', text: 'new text' },
      ];

      const merged = mergeSearchResults(existing, newResults);

      expect(merged.length).toBe(1);
      expect(merged[0].text).toBe('existing text');
    });

    it('should handle empty existing array', () => {
      const existing: SearchResult[] = [];
      const newResults: SearchResult[] = [
        { verse_key: '1:1' },
        { verse_key: '2:1' },
      ];

      const merged = mergeSearchResults(existing, newResults);

      expect(merged.length).toBe(2);
    });

    it('should handle empty new results array', () => {
      const existing: SearchResult[] = [{ verse_key: '1:1' }];
      const newResults: SearchResult[] = [];

      const merged = mergeSearchResults(existing, newResults);

      expect(merged.length).toBe(1);
    });

    it('should handle all duplicates', () => {
      const existing: SearchResult[] = [
        { verse_key: '1:1' },
        { verse_key: '2:1' },
      ];
      const newResults: SearchResult[] = [
        { verse_key: '1:1' },
        { verse_key: '2:1' },
      ];

      const merged = mergeSearchResults(existing, newResults);

      expect(merged.length).toBe(2);
    });
  });

  describe('cleanHighlightedText', () => {
    it('should remove superscript/footnote tags', () => {
      const text = 'Some text<sup>1</sup> more text';
      const cleaned = cleanHighlightedText(text);
      expect(cleaned).toBe('Some text more text');
    });

    it('should remove anchor tags with sup class', () => {
      const text = 'Text <a class="sup" href="#">note</a> more';
      const cleaned = cleanHighlightedText(text);
      expect(cleaned).toBe('Text more');
    });

    it('should remove span tags but keep content', () => {
      const text = '<span class="highlight">important</span> text';
      const cleaned = cleanHighlightedText(text);
      expect(cleaned).toBe('important text');
    });

    it('should preserve em tags', () => {
      const text = 'Some <em>highlighted</em> text';
      const cleaned = cleanHighlightedText(text);
      expect(cleaned).toBe('Some <em>highlighted</em> text');
    });

    it('should clean up excessive whitespace', () => {
      const text = 'Some    text   with    spaces';
      const cleaned = cleanHighlightedText(text);
      expect(cleaned).toBe('Some text with spaces');
    });

    it('should trim whitespace', () => {
      const text = '   text with padding   ';
      const cleaned = cleanHighlightedText(text);
      expect(cleaned).toBe('text with padding');
    });

    it('should handle empty string', () => {
      expect(cleanHighlightedText('')).toBe('');
    });

    it('should handle null/undefined safely', () => {
      expect(cleanHighlightedText(null as unknown as string)).toBe('');
      expect(cleanHighlightedText(undefined as unknown as string)).toBe('');
    });

    it('should remove bold and italic tags but keep content', () => {
      const text = '<b>bold</b> and <i>italic</i> text';
      const cleaned = cleanHighlightedText(text);
      expect(cleaned).toBe('bold and italic text');
    });

    it('should handle complex nested tags', () => {
      const text = '<span><b>nested <i>tags</i></b></span><sup>1</sup>';
      const cleaned = cleanHighlightedText(text);
      expect(cleaned).toBe('nested tags');
    });
  });

  describe('parseHighlightSegments', () => {
    it('should parse text with single highlight', () => {
      const text = 'Before <em>highlighted</em> after';
      const segments = parseHighlightSegments(text);

      expect(segments).toEqual([
        { text: 'Before ', isHighlighted: false },
        { text: 'highlighted', isHighlighted: true },
        { text: ' after', isHighlighted: false },
      ]);
    });

    it('should parse text with multiple highlights', () => {
      const text = 'Start <em>first</em> middle <em>second</em> end';
      const segments = parseHighlightSegments(text);

      expect(segments).toEqual([
        { text: 'Start ', isHighlighted: false },
        { text: 'first', isHighlighted: true },
        { text: ' middle ', isHighlighted: false },
        { text: 'second', isHighlighted: true },
        { text: ' end', isHighlighted: false },
      ]);
    });

    it('should handle text with no highlights', () => {
      const text = 'Plain text without any highlights';
      const segments = parseHighlightSegments(text);

      expect(segments).toEqual([
        { text: 'Plain text without any highlights', isHighlighted: false },
      ]);
    });

    it('should handle text starting with highlight', () => {
      const text = '<em>Starting</em> with highlight';
      const segments = parseHighlightSegments(text);

      expect(segments).toEqual([
        { text: 'Starting', isHighlighted: true },
        { text: ' with highlight', isHighlighted: false },
      ]);
    });

    it('should handle text ending with highlight', () => {
      const text = 'Ending with <em>highlight</em>';
      const segments = parseHighlightSegments(text);

      expect(segments).toEqual([
        { text: 'Ending with ', isHighlighted: false },
        { text: 'highlight', isHighlighted: true },
      ]);
    });

    it('should handle only highlighted text', () => {
      const text = '<em>All highlighted</em>';
      const segments = parseHighlightSegments(text);

      expect(segments).toEqual([
        { text: 'All highlighted', isHighlighted: true },
      ]);
    });

    it('should handle empty string', () => {
      const segments = parseHighlightSegments('');
      expect(segments).toEqual([]);
    });

    it('should clean HTML before parsing', () => {
      const text = '<span>Text</span><sup>1</sup> <em>highlight</em>';
      const segments = parseHighlightSegments(text);

      expect(segments).toEqual([
        { text: 'Text ', isHighlighted: false },
        { text: 'highlight', isHighlighted: true },
      ]);
    });

    it('should handle adjacent highlights', () => {
      const text = '<em>first</em><em>second</em>';
      const segments = parseHighlightSegments(text);

      expect(segments).toEqual([
        { text: 'first', isHighlighted: true },
        { text: 'second', isHighlighted: true },
      ]);
    });
  });
});
