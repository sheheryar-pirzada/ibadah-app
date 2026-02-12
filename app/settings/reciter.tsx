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
        style={{ flex: 1, backgroundColor: 'transparent' }}
        contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', alignItems: 'center', paddingTop: 60 }}
      >
        <ActivityIndicator size="large" color={accentColor} />
        <Text className="text-base font-sans mt-4" style={{ color: textColor }}>Loading reciters...</Text>
      </ScrollView>
    );
  }

  if (error) {
    return (
      <ScrollView
        style={{ flex: 1, backgroundColor: 'transparent' }}
        contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', alignItems: 'center', padding: 24 }}
      >
        <Text className="text-base font-sans text-center mb-4" style={{ color: textColor }}>{error}</Text>
        <Pressable onPress={loadData} className="px-6 py-3 rounded-lg" style={{ backgroundColor: accentColor }}>
          <Text className="text-base font-tajawal-medium text-white">Retry</Text>
        </Pressable>
      </ScrollView>
    );
  }

  return (
    // <View style={{ flex: 1, backgroundColor }}>
      <ScrollView
        style={{ flex: 1, backgroundColor: 'transparent' }}
        contentContainerStyle={{ paddingBottom: 40, paddingTop: 24, paddingHorizontal: 24 }}
        showsVerticalScrollIndicator={false}
      >
          <Text className="text-xl text-center mb-2 font-tajawal-bold" style={{ color: textColor }}>Quran Reciter</Text>
          <Text className="text-sm text-center mb-6 font-sans" style={{ color: textMuted }}>
            Choose your preferred reciter for Quran audio
          </Text>

          <View className="mt-2">
            {reciters.map((reciter) => {
              const active = reciter.id === selectedReciterId;

              return (
                <Pressable
                  key={`${reciter.id}-${reciter.style || 'default'}`}
                  onPress={() => handleReciterChange(reciter)}
                  className="flex-row justify-between items-center px-5 py-4 rounded-[20px] mb-2"
                  style={[
                    {
                      borderCurve: 'continuous',
                      opacity: active ? 1 : 0.7,
                      backgroundColor: active
                        ? isDark
                          ? 'rgba(212,175,55,0.15)'
                          : 'rgba(212,175,55,0.1)'
                        : 'transparent',
                    },
                  ]}
                >
                  <View className="flex-1">
                    <Text className="text-[17px] font-tajawal-medium" style={{ color: textColor }}>
                      {reciter.reciter_name}
                    </Text>
                    {reciter.style && (
                      <Text className="text-[13px] font-sans mt-0.5" style={{ color: textMuted }}>
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
