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
import React, { useEffect, useRef, useState } from 'react';
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
  const [selectedCategory, setSelectedCategory] = useState<CategoryFilter>('all');

  // Handle deep link category param
  useEffect(() => {
    if (category && ['morning', 'evening', 'after-prayer', 'before-sleep', 'protection', 'forgiveness', 'guidance', 'favorites', 'all'].includes(category)) {
      setSelectedCategory(category as CategoryFilter);
    }
  }, [category]);
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
      <View style={[styles.container, { backgroundColor }]}>
        <ThemedStatusBar />
        <ThemedBlurView intensity={20} style={[styles.loadingCard, { borderColor: cardBorder }]}>
          <Text style={[styles.loadingText, { color: textColor }]}>Loading duas...</Text>
        </ThemedBlurView>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor }]}>
      <ThemedStatusBar />
      <LinearGradient
        colors={gradientColors}
        style={StyleSheet.absoluteFillObject}
      />
      
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <Animated.View entering={FadeInDown.duration(600)} style={styles.header}>
          <View style={styles.headerRow}>
            <View style={{ width: 24 }} />
            <Text style={[styles.headerTitle, { color: textColor, marginBottom: 0 }]}>Duas & Remembrance</Text>
            <SettingsHeaderButton />
          </View>
          {timeCategory && (
            <Text style={[styles.timeIndicator, { color: accentColor }]}>
              {timeCategory === 'morning' ? 'Morning' : 'Evening'} Time
            </Text>
          )}
        </Animated.View>

        {/* Search Bar */}
        <Animated.View entering={FadeInUp.delay(100).duration(600)} style={[styles.searchContainer, { borderColor }]}>
          <ThemedBlurView intensity={25} style={styles.searchBlur}>
            <TextInput
              style={[styles.searchInput, { color: textColor }]}
              placeholder="Search duas..."
              placeholderTextColor={textMuted}
              value={searchQuery}
              onChangeText={setSearchQuery}
              returnKeyType="search"
            />
          </ThemedBlurView>
        </Animated.View>

        {/* Category Filter */}
        <Animated.View entering={FadeInUp.delay(200).duration(600)} style={styles.categoriesContainer}>
          <ScrollView
            ref={categoryScrollRef}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoriesScroll}
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
                  style={[
                    styles.categoryButton,
                    {
                      borderColor: isActive ? accentColor : borderColor,
                      backgroundColor: isActive
                        ? (resolvedTheme === 'dark' ? 'rgba(212,175,55,0.5)' : 'rgba(212,175,55,0.4)')
                        : (resolvedTheme === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(4,99,7,0.1)')
                    },
                  ]}
                  onPress={() => handleCategorySelect(cat.value)}
                >
                  <Text
                    style={[
                      styles.categoryButtonText,
                      {
                        color: isActive ? (resolvedTheme === 'dark' ? '#fff' : textColor) : textMuted,
                        fontFamily: isActive ? 'Tajawal-Bold' : 'Tajawal-Medium',
                      },
                    ]}
                  >
                    {cat.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </Animated.View>

        {/* Duas List */}
        <View style={styles.duasList}>
          {duas.length === 0 ? (
            <View style={styles.emptyContainer}>
              <ThemedBlurView intensity={25} style={[styles.emptyCard, { borderColor: cardBorder }]}>
                <Text style={[styles.emptyText, { color: textMuted }]}>
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
                index={index}
              />
            ))
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 60,
    paddingBottom: 120,
    paddingHorizontal: 16,
  },
  loadingCard: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    margin: 20,
    padding: 40,
    borderRadius: 24,
    borderCurve: 'continuous',
    borderWidth: 1,
  },
  loadingText: {
    fontFamily: 'Tajawal-Regular',
    fontSize: 18,
    fontWeight: '500',
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
  },
  searchQuranButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
  },
  searchQuranText: {
    fontSize: 14,
    fontFamily: 'Tajawal-Medium',
  },
  headerTitle: {
    fontSize: 28,
    fontFamily: 'Tajawal-Bold',
    textAlign: 'center',
    marginBottom: 4,
  },
  timeIndicator: {
    fontSize: 14,
    fontFamily: 'Tajawal-Medium',
    marginTop: 4,
  },
  searchContainer: {
    marginBottom: 20,
    borderRadius: 20,
    borderCurve: 'continuous',
    overflow: 'hidden',
    borderWidth: 1,
  },
  searchBlur: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  searchInput: {
    fontSize: 20,
    fontFamily: 'Tajawal-Regular',
    padding: 0,
    paddingTop: 4,
    textAlignVertical: 'center',
    includeFontPadding: false,
  },
  categoriesContainer: {
    marginBottom: 24,
  },
  categoriesScroll: {
    gap: 12,
    paddingRight: 20,
  },
  categoryButton: {
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderRadius: 20,
    borderCurve: 'continuous',
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  categoryButtonText: {
    fontSize: 16,
    fontFamily: 'Tajawal-Medium',
    textAlignVertical: 'center',
    includeFontPadding: false,
    marginTop: 4,
  },
  duasList: {
    gap: 16,
  },
  emptyContainer: {
    marginTop: 40,
  },
  emptyCard: {
    padding: 32,
    borderRadius: 36,
    borderCurve: 'continuous',
    borderWidth: 1,
    alignItems: 'center',
    overflow: 'hidden',
  },
  emptyText: {
    fontSize: 16,
    fontFamily: 'Tajawal-Regular',
    textAlign: 'center',
  },
});
