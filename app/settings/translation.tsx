import { IconSymbol } from '@/components/ui/IconSymbol.ios';
import { useTheme } from '@/contexts/ThemeContext';
import { useTranslation } from '@/contexts/TranslationContext';
import { useThemeColor } from '@/hooks/useThemeColor';
import { quranAPI, type TranslationResource } from '@/utils/quran-api';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Pressable,
    ScrollView,
    Text,
    View,
} from 'react-native';

export default function TranslationScreen() {
  const router = useRouter();
  const { resolvedTheme } = useTheme();
  const { translationId, setTranslation } = useTranslation();
  const isDark = resolvedTheme === 'dark';

  const textColor = useThemeColor({}, 'text');
  const textMuted = useThemeColor({}, 'textMuted');
  const accentColor = useThemeColor({}, 'accent');
  const backgroundColor = useThemeColor({}, 'background');

  const [translations, setTranslations] = useState<TranslationResource[]>([]);
  const [selectedTranslationId, setSelectedTranslationId] = useState<number>(translationId);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const list = await quranAPI.getTranslationResources();
      setSelectedTranslationId(translationId);
      // Prefer English translations at top, but keep all
      const sorted = [...list].sort((a, b) => {
        const aEn = (a.language_name ?? '').toLowerCase() === 'english';
        const bEn = (b.language_name ?? '').toLowerCase() === 'english';
        if (aEn !== bEn) return aEn ? -1 : 1;
        return String(a.name ?? '').localeCompare(String(b.name ?? ''));
      });
      setTranslations(sorted);
    } catch (err) {
      console.error('Error loading translations:', err);
      setError('Failed to load translations. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleTranslationChange = async (t: TranslationResource) => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft);
      await setTranslation(t);
      setSelectedTranslationId(t.id);
      router.back();
    } catch (err) {
      console.error('Error updating translation:', err);
    }
  };

  if (isLoading) {
    return (
      <ScrollView
        style={{ flex: 1, backgroundColor }}
        contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', alignItems: 'center', paddingTop: 60 }}
      >
        <ActivityIndicator size="large" color={accentColor} />
        <Text className="text-base font-sans mt-4" style={{ color: textColor }}>
          Loading translations...
        </Text>
      </ScrollView>
    );
  }

  if (error) {
    return (
      <ScrollView
        style={{ flex: 1, backgroundColor }}
        contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', alignItems: 'center', padding: 24 }}
      >
        <Text className="text-base font-sans text-center mb-4" style={{ color: textColor }}>
          {error}
        </Text>
        <Pressable onPress={loadData} className="px-6 py-3 rounded-lg" style={{ backgroundColor: accentColor }}>
          <Text className="text-base font-tajawal-medium text-white">Retry</Text>
        </Pressable>
      </ScrollView>
    );
  }

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor }}
      contentContainerStyle={{ paddingBottom: 40, paddingTop: 24, paddingHorizontal: 24 }}
      showsVerticalScrollIndicator={false}
    >
      <Text className="text-xl text-center mb-2 font-tajawal-bold" style={{ color: textColor }}>
        Quran Translation
      </Text>
      <Text className="text-sm text-center mb-6 font-sans" style={{ color: textMuted }}>
        Choose your preferred translation for all Quran text
      </Text>

      <View className="mt-2">
        {translations.map((t) => {
          const active = t.id === selectedTranslationId;
          return (
            <Pressable
              key={String(t.id)}
              onPress={() => handleTranslationChange(t)}
              className="flex-row justify-between items-center px-5 py-4 rounded-[20px] mb-2"
              style={{
                borderCurve: 'continuous',
                opacity: active ? 1 : 0.8,
                backgroundColor: active
                  ? isDark
                    ? 'rgba(212,175,55,0.15)'
                    : 'rgba(212,175,55,0.1)'
                  : 'transparent',
              }}
            >
              <View className="flex-1">
                <Text className="text-[17px] font-tajawal-medium" style={{ color: textColor }}>
                  {t.name}
                </Text>
                {t.language_name && (
                  <Text className="text-[13px] font-sans mt-0.5" style={{ color: textMuted }}>
                    {t.language_name}
                  </Text>
                )}
              </View>
              {active && (
                <IconSymbol name="checkmark.circle.fill" size={24} color={accentColor} />
              )}
            </Pressable>
          );
        })}
      </View>
    </ScrollView>
  );
}

