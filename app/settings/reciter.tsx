import { IconSymbol } from '@/components/ui/IconSymbol.ios';
import { useTheme } from '@/contexts/ThemeContext';
import { useThemeColor } from '@/hooks/useThemeColor';
import { quranAPI, Reciter } from '@/utils/quran-api';
import { getReciterSettings, updateReciter } from '@/utils/reciter-settings';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

export default function ReciterScreen() {
  const router = useRouter();
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';

  // Theme colors
  const textColor = useThemeColor({}, 'text');
  const textMuted = useThemeColor({}, 'textMuted');
  const accentColor = useThemeColor({}, 'accent');
  const backgroundColor = useThemeColor({}, 'background');

  const [reciters, setReciters] = useState<Reciter[]>([]);
  const [selectedReciterId, setSelectedReciterId] = useState<number>(7);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Load current settings and reciters in parallel
      const [settings, recitersList] = await Promise.all([
        getReciterSettings(),
        quranAPI.getReciters(),
      ]);

      setSelectedReciterId(settings.reciterId);
      setReciters(recitersList);
    } catch (err) {
      console.error('Error loading reciter data:', err);
      setError('Failed to load reciters. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleReciterChange = async (reciter: Reciter) => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft);
      await updateReciter(reciter.id, reciter.reciter_name, reciter.style);
      setSelectedReciterId(reciter.id);
      router.back();
    } catch (err) {
      console.error('Error updating reciter:', err);
    }
  };

  if (isLoading) {
    return (
      <ScrollView
        style={{ flex: 1, backgroundColor }}
        contentContainerStyle={styles.loadingContainer}
      >
        <ActivityIndicator size="large" color={accentColor} />
        <Text style={[styles.loadingText, { color: textColor }]}>Loading reciters...</Text>
      </ScrollView>
    );
  }

  if (error) {
    return (
      <ScrollView
        style={{ flex: 1, backgroundColor }}
        contentContainerStyle={styles.errorContainer}
      >
        <Text style={[styles.errorText, { color: textColor }]}>{error}</Text>
        <Pressable onPress={loadData} style={[styles.retryButton, { backgroundColor: accentColor }]}>
          <Text style={styles.retryText}>Retry</Text>
        </Pressable>
      </ScrollView>
    );
  }

  return (
    // <View style={{ flex: 1, backgroundColor }}>
      <ScrollView
        style={{ flex: 1, backgroundColor }}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
          <Text style={[styles.title, { color: textColor }]}>Quran Reciter</Text>
          <Text style={[styles.subtitle, { color: textMuted }]}>
            Choose your preferred reciter for Quran audio
          </Text>

          <View style={styles.optionsList}>
            {reciters.map((reciter) => {
              const active = reciter.id === selectedReciterId;

              return (
                <Pressable
                  key={`${reciter.id}-${reciter.style || 'default'}`}
                  onPress={() => handleReciterChange(reciter)}
                  style={[
                    styles.optionItem,
                    {
                      opacity: active ? 1 : 0.7,
                      backgroundColor: active
                        ? isDark
                          ? 'rgba(212,175,55,0.15)'
                          : 'rgba(212,175,55,0.1)'
                        : 'transparent',
                    },
                  ]}
                >
                  <View style={styles.optionContent}>
                    <Text style={[styles.optionText, { color: textColor }]}>
                      {reciter.reciter_name}
                    </Text>
                    {reciter.style && (
                      <Text style={[styles.optionStyle, { color: textMuted }]}>
                        {reciter.style}
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
      // </View>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    // padding: 24,
    paddingBottom: 40,
    paddingTop: 24,
    paddingHorizontal: 24,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 8,
    fontFamily: 'Tajawal-Bold',
  },
  subtitle: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 24,
    fontFamily: 'Tajawal-Regular',
  },
  optionsList: {
    marginTop: 8,
  },
  optionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderRadius: 20,
    marginBottom: 8,
    borderCurve: 'continuous',
  },
  optionContent: {
    flex: 1,
  },
  optionText: {
    fontSize: 17,
    fontFamily: 'Tajawal-Medium',
  },
  optionStyle: {
    fontSize: 13,
    fontFamily: 'Tajawal-Regular',
    marginTop: 2,
  },
  checkmark: {
    fontSize: 18,
    fontFamily: 'Tajawal-Bold',
    marginLeft: 12,
  },
  loadingContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 60,
  },
  loadingText: {
    fontSize: 16,
    fontFamily: 'Tajawal-Regular',
    marginTop: 16,
  },
  errorContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  errorText: {
    fontSize: 16,
    fontFamily: 'Tajawal-Regular',
    textAlign: 'center',
    marginBottom: 16,
  },
  retryButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryText: {
    color: '#fff',
    fontSize: 16,
    fontFamily: 'Tajawal-Medium',
  },
});
