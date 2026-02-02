import { useThemeColor } from '@/hooks/useThemeColor';
import { quranAPI, TafsirResult } from '@/utils/quran-api';
import * as Haptics from 'expo-haptics';
import { router, useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  View
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const DEFAULT_TAFSIR_RESOURCE_ID = 169; // Ibn Kathir (Abridged) English

function stripHtml(html: string): string {
  return html
    .replace(/<[^>]*>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .trim();
}

// Arabic run: contiguous Arabic chars + whitespace (used with capturing group so split keeps position)
const ARABIC_RUN_REGEX = /([\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF\s]+)/g;
// Only treat as Arabic segment if run contains at least one Arabic letter (excludes punctuation-only runs like ، ؛)
const HAS_ARABIC_LETTER = /[\u0621-\u064A\u066E\u066F\u0671-\u06D3\u06FA-\u06FF]/;

type TafsirSegment = { type: 'english' | 'arabic'; text: string };

/**
 * Parse cleaned tafsir into ordered segments. Extracts Arabic runs (that contain letters) but keeps
 * reference to where they appear. Runs that are only Arabic punctuation/whitespace are merged into
 * English. Consecutive English segments are merged so English text flows in one block per run
 * (avoids one word per line when the regex splits on spaces).
 */
function parseTafsirToSegments(cleaned: string): TafsirSegment[] {
  const parts = cleaned.split(ARABIC_RUN_REGEX);
  const segments: TafsirSegment[] = [];
  for (let i = 0; i < parts.length; i++) {
    const p = parts[i];
    if (p === undefined || p.length === 0) continue;
    if (i % 2 === 0) {
      if (p.trim()) segments.push({ type: 'english', text: p });
    } else {
      if (HAS_ARABIC_LETTER.test(p)) {
        segments.push({ type: 'arabic', text: p.trim() });
      } else {
        // Run has no Arabic letter (whitespace, punctuation, etc.) – merge into previous English so spaces aren't lost
        const last = segments[segments.length - 1];
        if (last?.type === 'english') {
          last.text += p;
        } else {
          segments.push({ type: 'english', text: p });
        }
      }
    }
  }
  // Merge consecutive English segments so we don't get one word per line (split creates boundaries at spaces)
  const merged: TafsirSegment[] = [];
  for (const seg of segments) {
    const last = merged[merged.length - 1];
    if (seg.type === 'english' && last?.type === 'english') {
      last.text += seg.text;
    } else {
      merged.push({ ...seg });
    }
  }
  // Normalize multiple spaces inside merged English segments
  for (const seg of merged) {
    if (seg.type === 'english') {
      seg.text = seg.text.replace(/\s+/g, ' ').trim();
    }
  }
  return merged;
}

// Arabic ligature for Sallallahu Alayhi Wasallam (U+FDFA)
const ARABIC_SAW = '\uFDFA';

// Remove double angle quotes that appear after "said," or before "(No, servant" etc.
function removeAngleQuotes(s: string): string {
  return s.replace(/«/g, '').replace(/»/g, '');
}

// Remove lines that are only punctuation (e.g. ":", ".", " : ", etc.)
function removePunctuationOnlyLines(s: string): string {
  return s
    .split(/\n/)
    .filter((line) => line.trim() && !/^[\s.:,;\-–—]*$/.test(line.trim()))
    .join('\n');
}

function formatTafsirText(html: string): string {
  let s = stripHtml(html);
  // Replace Arabic SAW symbol with (SAW)
  s = s.replaceAll(ARABIC_SAW, '(SAW)');
  // Remove « and » (e.g. "said,«" and "»(No, servant")
  s = removeAngleQuotes(s);
  // Collapse 3+ newlines to double newline
  s = s.replace(/\n{3,}/g, '\n\n').trim();
  // Drop lines that are only punctuation (colons, periods, etc.)
  s = removePunctuationOnlyLines(s);
  return s.replace(/\n{3,}/g, '\n\n').trim();
}

export default function TafsirScreen() {
  const { id, ayah_key, resource_id: resourceIdParam } = useLocalSearchParams<{
    id: string;
    ayah_key: string;
    resource_id?: string;
  }>();
  const insets = useSafeAreaInsets();
  const [tafsir, setTafsir] = useState<TafsirResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const textColor = useThemeColor({}, 'text');
  const textMuted = useThemeColor({}, 'textMuted');
  const accentColor = useThemeColor({}, 'accent');
  const cardBorder = useThemeColor({}, 'cardBorder');

  const resourceId = resourceIdParam
    ? parseInt(resourceIdParam, 10)
    : DEFAULT_TAFSIR_RESOURCE_ID;
  const ayahKey = ayah_key ?? '';

  const fetchTafsir = useCallback(async () => {
    if (!ayahKey || !Number.isFinite(resourceId)) {
      setError('Missing verse');
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const result = await quranAPI.getTafsirByAyah(resourceId, ayahKey);
      setTafsir(result ?? null);
      if (!result) setError('Tafsir not available for this verse');
    } catch (e) {
      setError('Failed to load tafsir');
      setTafsir(null);
    } finally {
      setLoading(false);
    }
  }, [ayahKey, resourceId]);

  useEffect(() => {
    fetchTafsir();
  }, [fetchTafsir]);

  const handleClose = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.back();
  }, []);

  return (
    <View style={[styles.container, { paddingBottom: insets.bottom + 16 }]}>
      {/* <ThemedBlurView
        intensity={80}
        className="flex-1 rounded-3xl overflow-hidden mx-4"
        style={{
          borderWidth: 0.5,
          borderColor: cardBorder,
          borderCurve: 'continuous',
        }}
      > */}
        {/* Header */}
        

        

        {/* Content */}
        <ScrollView
          className="flex-1"
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <>
          <View
          className="flex-row items-center justify-between pb-4 py-3 border-b"
          style={{ borderBottomColor: cardBorder, borderBottomWidth: StyleSheet.hairlineWidth }}
        >
          <View className="flex-1 items-center">
            <Text className="text-2xl font-tajawal-bold" style={{ color: textColor }}>
              Tafsir — {ayahKey}
            </Text>
            {tafsir && (
              <Text className="text-sm font-tajawal mt-0.5" style={{ color: textMuted }}>
                {tafsir.resourceName}
              </Text>
            )}
          </View>
        </View>
          
          {loading && (
            <View className="items-center justify-center py-16">
              <ActivityIndicator size="large" color={accentColor} />
              <Text className="text-sm font-tajawal mt-3" style={{ color: textMuted }}>
                Loading tafsir...
              </Text>
            </View>
          )}
          {!loading && error && (
            <View className="items-center justify-center py-16 px-6">
              <Text className="text-base font-tajawal text-center" style={{ color: textMuted }}>
                {error}
              </Text>
            </View>
          )}
          {!loading && tafsir && (() => {
            const cleaned = formatTafsirText(tafsir.text);
            const segments = parseTafsirToSegments(cleaned);
            return (
              <View>
                {segments.map((seg, i) =>
                  seg.type === 'arabic' ? (
                    <Text
                      key={i}
                      className="font-amiri text-4xl leading-relaxed"
                      style={{ color: textColor, textAlign: 'center', marginBottom: 8 }}
                      selectable
                    >
                      {seg.text}
                    </Text>
                  ) : (
                    <Text
                      key={i}
                      className="font-tajawal text-lg leading-7"
                      style={{ color: textColor, textAlign: 'left', marginBottom: 8 }}
                      selectable
                    >
                      {seg.text}
                    </Text>
                  )
                )}
              </View>
            );
          })()}
          </>
        </ScrollView>
      
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    paddingBottom: 32,
  },
});
