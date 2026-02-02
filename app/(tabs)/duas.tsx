import type { ChinAudioMetadata } from '@/components/chin';
import { ChinAudioPlayer, useChin } from '@/components/chin';
import DuaCard from '@/components/DuaCard';
import { SettingsHeaderButton } from '@/components/SettingsHeaderButton';
import { ThemedBlurView } from '@/components/ThemedBlurView';
import { ThemedStatusBar } from '@/components/ThemedStatusBar';
import { useTheme } from '@/contexts/ThemeContext';
import { useLocation } from '@/hooks/useLocation';
import { useThemeColor } from '@/hooks/useThemeColor';
import { duaManager } from '@/utils/duas';
import { Dua, DuaCategory } from '@/utils/duas-data';
import { getPrayerTimesAdhan } from '@/utils/prayer-times';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams } from 'expo-router';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import Animated, {
  FadeInDown,
  FadeInUp,
} from 'react-native-reanimated';

type CategoryFilter = DuaCategory | 'all' | 'favorites';

export default function DuasScreen() {
  const { category } = useLocalSearchParams<{ category?: string }>();
  const { resolvedTheme } = useTheme();
  const { loc: location } = useLocation();
  const chin = useChin();
  const [selectedCategory, setSelectedCategory] = useState<CategoryFilter>('all');

  // Handle deep link category param
  useEffect(() => {
    if (category && ['morning', 'evening', 'after-prayer', 'before-sleep', 'protection', 'forgiveness', 'guidance', 'favorites', 'all'].includes(category)) {
      setSelectedCategory(category as CategoryFilter);
    }
  }, [category]);

  // Auto-scroll to selected category
  useEffect(() => {
    const timer = setTimeout(() => {
      const layout = categoryLayoutsRef.current[selectedCategory];
      if (layout && categoryScrollRef.current) {
        const scrollX = Math.max(0, layout.x - 16);
        categoryScrollRef.current.scrollTo({ x: scrollX, animated: true });
      }
    }, 100); // Small delay to ensure layouts are measured
    return () => clearTimeout(timer);
  }, [selectedCategory]);
  const [duas, setDuas] = useState<Dua[]>([]);
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [timeCategory, setTimeCategory] = useState<'morning' | 'evening' | null>(null);

  const categoryScrollRef = useRef<ScrollView>(null);
  const categoryLayoutsRef = useRef<Record<string, { x: number; width: number }>>({});

  // Theme colors
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const textMuted = useThemeColor({}, 'textMuted');
  const accentColor = useThemeColor({}, 'accent');
  const borderColor = useThemeColor({}, 'border');
  const cardBorder = useThemeColor({}, 'cardBorder');

  // Gradient overlay - adjust opacity based on theme
  const gradientColors = resolvedTheme === 'dark'
    ? (['rgba(0,0,0,0.3)', 'rgba(0,0,0,0.1)', 'rgba(0,0,0,0.4)'] as const)
    : (['rgba(255,255,255,0.1)', 'rgba(255,255,255,0.05)', 'rgba(255,255,255,0.15)'] as const);

  useEffect(() => {
    initializeDuas();
  }, []);

  useEffect(() => {
    loadDuas();
    determineTimeCategory();
  }, [selectedCategory, searchQuery, location]);

  const initializeDuas = async () => {
    try {
      await duaManager.initialize();
      const favorites = duaManager.getFavoriteDuas();
      setFavoriteIds(new Set(favorites.map(d => d.id)));
      loadDuas();
      determineTimeCategory();
    } catch (error) {
      console.error('Error initializing duas:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const determineTimeCategory = async () => {
    if (!location) return;

    try {
      const { latitude: lat, longitude: lng } = location.coords;
      const today = new Date();
      const timesStr = await getPrayerTimesAdhan(lat, lng, undefined, undefined, today);

      const now = new Date();
      const [fajrH, fajrM] = timesStr.fajr.split(':').map(Number);
      const [dhuhrH, dhuhrM] = timesStr.dhuhr.split(':').map(Number);
      const [asrH, asrM] = timesStr.asr.split(':').map(Number);
      const [maghribH, maghribM] = timesStr.maghrib.split(':').map(Number);

      const fajrTime = new Date(today.getFullYear(), today.getMonth(), today.getDate(), fajrH, fajrM);
      const dhuhrTime = new Date(today.getFullYear(), today.getMonth(), today.getDate(), dhuhrH, dhuhrM);
      const asrTime = new Date(today.getFullYear(), today.getMonth(), today.getDate(), asrH, asrM);
      const maghribTime = new Date(today.getFullYear(), today.getMonth(), today.getDate(), maghribH, maghribM);

      if (now >= fajrTime && now < dhuhrTime) {
        setTimeCategory('morning');
      } else if (now >= asrTime && now < maghribTime) {
        setTimeCategory('evening');
      } else {
        setTimeCategory(null);
      }
    } catch (error) {
      console.error('Error determining time category:', error);
    }
  };

  const loadDuas = () => {
    let filteredDuas: Dua[] = [];

    if (searchQuery.trim()) {
      filteredDuas = duaManager.searchDuas(searchQuery);
    } else if (selectedCategory === 'favorites') {
      filteredDuas = duaManager.getFavoriteDuas();
    } else if (selectedCategory === 'all') {
      filteredDuas = duaManager.getAllDuas();
    } else {
      filteredDuas = duaManager.getDuasByCategory(selectedCategory);
    }

    setDuas(filteredDuas);
  };

  const handleToggleFavorite = async (duaId: string) => {
    const isFavorite = await duaManager.toggleFavorite(duaId);
    setFavoriteIds(prevFavorites => {
      const newFavorites = new Set(prevFavorites);
      if (isFavorite) {
        newFavorites.add(duaId);
      } else {
        newFavorites.delete(duaId);
      }
      return newFavorites;
    });

    // Reload if we're viewing favorites
    if (selectedCategory === 'favorites') {
      loadDuas();
    }
  };

  const handleAudioToggle = useCallback((isPlaying: boolean, audioUrl: string | null, metadata?: ChinAudioMetadata) => {
    if (isPlaying && audioUrl) {
      chin.show(<ChinAudioPlayer audioUrl={audioUrl} metadata={metadata} onClose={chin.hide} />);
    } else {
      chin.hide();
    }
  }, [chin]);

  const handleCategorySelect = (categoryValue: CategoryFilter) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedCategory(categoryValue);
    setSearchQuery('');

    // Scroll to keep the selected category visible
    const layout = categoryLayoutsRef.current[categoryValue];
    if (layout && categoryScrollRef.current) {
      // Scroll so the button is roughly centered, with some padding
      const scrollX = Math.max(0, layout.x - 16);
      categoryScrollRef.current.scrollTo({ x: scrollX, animated: true });
    }
  };

  const categories: { label: string; value: CategoryFilter }[] = [
    { label: 'All', value: 'all' },
    { label: 'Morning', value: 'morning' },
    { label: 'Evening', value: 'evening' },
    { label: 'After Prayer', value: 'after-prayer' },
    { label: 'Before Sleep', value: 'before-sleep' },
    { label: 'Protection', value: 'protection' },
    { label: 'Forgiveness', value: 'forgiveness' },
    { label: 'Guidance', value: 'guidance' },
    { label: 'Favorites', value: 'favorites' },
  ];

  if (isLoading) {
    return (
      <View className="flex-1" style={{ backgroundColor }}>
        <ThemedStatusBar />
        <ThemedBlurView
          intensity={20}
          className="flex-1 justify-center items-center m-5 p-10 rounded-3xl border"
          style={{ borderColor: cardBorder, borderCurve: 'continuous' }}
        >
          <Text
            className="text-lg font-tajawal-medium"
            style={{ color: textColor }}
          >
            Loading duas...
          </Text>
        </ThemedBlurView>
      </View>
    );
  }

  return (
    <View className="flex-1" style={{ backgroundColor }}>
      <ThemedStatusBar />
      <LinearGradient
        colors={gradientColors}
        style={StyleSheet.absoluteFillObject}
      />

      <ScrollView contentContainerStyle={{ paddingTop: 60, paddingBottom: 120, paddingHorizontal: 16 }}>
        {/* Header */}
        <Animated.View entering={FadeInDown.duration(600)} className="items-center mb-6">
          <View className="flex-row items-center justify-between w-full">
            <View className="w-6" />
            <Text
              className="text-[28px] font-tajawal-bold text-center"
              style={{ color: textColor }}
            >
              Duas & Remembrance
            </Text>
            <SettingsHeaderButton />
          </View>
          {timeCategory && (
            <Text
              className="text-sm font-tajawal-medium mt-1"
              style={{ color: accentColor }}
            >
              {timeCategory === 'morning' ? 'Morning' : 'Evening'} Time
            </Text>
          )}
        </Animated.View>

        {/* Search Bar */}
        <Animated.View
          entering={FadeInUp.delay(100).duration(600)}
          className="mb-5 rounded-[20px] overflow-hidden border"
          style={{ borderColor, borderCurve: 'continuous' }}
        >
          <ThemedBlurView intensity={25} className="px-4 py-3">
            <TextInput
              className="text-xl p-0 pt-1"
              style={{ color: textColor, fontFamily: 'Tajawal-Regular', textAlignVertical: 'center', includeFontPadding: false }}
              placeholder="Search duas..."
              placeholderTextColor={textMuted}
              value={searchQuery}
              onChangeText={setSearchQuery}
              returnKeyType="search"
            />
          </ThemedBlurView>
        </Animated.View>

        {/* Category Filter */}
        <Animated.View entering={FadeInUp.delay(200).duration(600)} className="mb-6">
          <ScrollView
            ref={categoryScrollRef}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ gap: 12, paddingRight: 20 }}
          >
            {categories.map((cat) => {
              const isActive = selectedCategory === cat.value;
              return (
                <TouchableOpacity
                  key={cat.value}
                  activeOpacity={0.7}
                  onLayout={(e) => {
                    categoryLayoutsRef.current[cat.value] = {
                      x: e.nativeEvent.layout.x,
                      width: e.nativeEvent.layout.width,
                    };
                  }}
                  className="px-3 py-3 rounded-[20px] border justify-center items-center"
                  style={{
                    borderColor: isActive ? accentColor : borderColor,
                    backgroundColor: isActive
                      ? (resolvedTheme === 'dark' ? 'rgba(212,175,55,0.5)' : 'rgba(212,175,55,0.4)')
                      : (resolvedTheme === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(4,99,7,0.1)'),
                    borderCurve: 'continuous',
                  }}
                  onPress={() => handleCategorySelect(cat.value)}
                >
                  <Text
                    className="text-base mt-1"
                    style={{
                      color: isActive ? (resolvedTheme === 'dark' ? '#fff' : textColor) : textMuted,
                      fontFamily: isActive ? 'Tajawal-Bold' : 'Tajawal-Medium',
                      textAlignVertical: 'center',
                      includeFontPadding: false,
                    }}
                  >
                    {cat.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </Animated.View>

        {/* Duas List */}
        <View className="gap-4">
          {duas.length === 0 ? (
            <View className="mt-10">
              <ThemedBlurView
                intensity={25}
                className="p-8 rounded-[36px] border items-center overflow-hidden"
                style={{ borderColor: cardBorder, borderCurve: 'continuous' }}
              >
                <Text
                  className="text-base font-tajawal text-center"
                  style={{ color: textMuted }}
                >
                  {searchQuery ? 'No duas found matching your search.' : 'No duas in this category.'}
                </Text>
              </ThemedBlurView>
            </View>
          ) : (
            duas.map((dua, index) => (
              <DuaCard
                key={dua.id}
                dua={dua}
                isFavorite={favoriteIds.has(dua.id)}
                onToggleFavorite={handleToggleFavorite}
                onAudioToggle={handleAudioToggle}
                index={index}
              />
            ))
          )}
        </View>
      </ScrollView>
    </View>
  );
}
