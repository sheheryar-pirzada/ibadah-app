import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import {
  Dimensions,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { CinematicCarousel } from '@/components/cinematic-carousel/cinematic-carousel';
import { Colors } from '@/constants/Colors';
import { useBackground } from '@/contexts/BackgroundContext';
import { useTheme } from '@/contexts/ThemeContext';
import { useThemeColor } from '@/hooks/useThemeColor';
import {
  BACKGROUND_IMAGE_SOURCES,
  getBackgroundSettings,
  getThemeForBackground,
  setBackgroundKey,
  type BackgroundKey,
} from '@/utils/background-settings';

const SCREEN_WIDTH: number = Dimensions.get("window").width;

const TILE_WIDTH = SCREEN_WIDTH * 0.75;
const TILE_HEIGHT = TILE_WIDTH * 1.75;

interface BackgroundOption {
  key: BackgroundKey;
  label: string;
}

const OPTIONS: BackgroundOption[] = [
  { key: 'solid', label: 'Solid' },
  { key: 'grain1', label: 'Dusk Rose' },
  { key: 'grain2', label: 'Warm Sand' },
  { key: 'grain3', label: 'Carbon Rose' },
];

function getColorsForBackground(key: BackgroundKey, currentTheme: 'light' | 'dark') {
  if (key === 'solid') return Colors[currentTheme];
  return Colors[key];
}

function DuaCardPreview({ colors, showBorder }: { colors: (typeof Colors)[keyof typeof Colors]; showBorder?: boolean }) {
  return (
    <View style={[styles.previewCard, showBorder && { borderWidth: 0.5, borderColor: colors.cardBorder }]}>
      <BlurView
        intensity={20}
        tint={colors.blurTint as any}
        style={StyleSheet.absoluteFill}
      />
      <View style={styles.previewContent}>
        <View style={styles.previewHeader}>
          <Text
            style={[styles.previewTitle, { color: colors.text }]}
            numberOfLines={1}
          >
            Morning Remembrance
          </Text>
          <View style={styles.previewIcons}>
            <View style={[styles.previewIconDot, { backgroundColor: colors.textMuted }]} />
            <View style={[styles.previewIconDot, { backgroundColor: colors.textMuted }]} />
          </View>
        </View>

        <Text
          style={[styles.previewArabic, { color: colors.text }]}
          numberOfLines={2}
        >
          بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
        </Text>

        <Text
          style={[styles.previewTranslation, { color: colors.textSecondary }]}
          numberOfLines={2}
        >
          In the name of Allah, the Most Gracious, the Most Merciful
        </Text>

        <Text
          style={[styles.previewReference, { color: colors.accent }]}
          numberOfLines={1}
        >
          Quran 1:1
        </Text>
      </View>
    </View>
  );
}

export default function BackgroundScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { setThemeMode, themeMode } = useTheme();
  const { refreshBackgroundPreference } = useBackground();
  const [selectedKey, setSelectedKey] = useState<BackgroundKey>('solid');
  const [activeIndex, setActiveIndex] = useState(0);
  const [loaded, setLoaded] = useState(false);

  const textMuted = useThemeColor({}, 'textMuted');

  const activeOption = OPTIONS[activeIndex];
  const currentTheme = themeMode === 'system' ? 'light' : themeMode;

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = useCallback(async () => {
    try {
      const settings = await getBackgroundSettings();
      setSelectedKey(settings.key);
      const idx = OPTIONS.findIndex((o) => o.key === settings.key);
      if (idx >= 0) setActiveIndex(idx);
      setLoaded(true);
    } catch (error) {
      console.error('Error loading background settings:', error);
      setLoaded(true);
    }
  }, []);

  const handleSelect = async () => {
    const key = activeOption.key;
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      await setBackgroundKey(key);
      setSelectedKey(key);
      const themeForBackground = getThemeForBackground(key);
      if (themeForBackground !== null) {
        await setThemeMode(themeForBackground);
      }
      await refreshBackgroundPreference();
      router.back();
    } catch (error) {
      console.error('Error saving background:', error);
    }
  };

  const renderItem = ({ item }: { item: BackgroundOption; index: number }) => {
    const colors = getColorsForBackground(item.key, currentTheme);

    return (
      <View style={styles.tile}>
        {item.key === 'solid' ? (
          <View
            style={[
              StyleSheet.absoluteFill,
              { backgroundColor: colors.background, borderRadius: 32, borderCurve: 'continuous' },
            ]}
          />
        ) : (
          <Image
            source={BACKGROUND_IMAGE_SOURCES[item.key]}
            style={StyleSheet.absoluteFill}
            contentFit="cover"
          />
        )}
        <View style={styles.previewOverlay}>
          <DuaCardPreview colors={colors} showBorder={item.key === 'solid'} />
        </View>
      </View>
    );
  };

  const isAlreadySelected = activeOption.key === selectedKey;

  return (
    <BlurView intensity={50} tint="systemUltraThinMaterial" style={StyleSheet.absoluteFill}>
      <View style={styles.content}>
        <Text className="text-base mt-8 text-center" style={{ color: textMuted }}>
          Swipe to select a background
        </Text>
        {loaded && (
          <CinematicCarousel
            data={OPTIONS}
            renderItem={renderItem}
            itemWidth={TILE_WIDTH}
            spacing={40}
            onActiveIndexChange={setActiveIndex}
            initialIndex={activeIndex}
          />
        )}
        <View className="absolute bottom-0 left-0 right-0" style={[styles.buttonContainer, { paddingBottom: insets.bottom }]}>
          <Pressable
            onPress={handleSelect}
            disabled={isAlreadySelected}
            style={[
              styles.selectButton,
              isAlreadySelected && styles.selectButtonDisabled,
            ]}
          >
            <Text
              className="text-base text-center"
              style={{ color: isAlreadySelected ? 'rgba(255,255,255,0.4)' : 'white' }}
            >
              {isAlreadySelected ? `${activeOption.label} Background Selected` : `Select ${activeOption.label} Background`}
            </Text>
          </Pressable>
        </View>
      </View>
    </BlurView>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
    justifyContent: 'center',
  },
  tile: {
    width: TILE_WIDTH,
    height: TILE_HEIGHT,
    borderRadius: 32,
    borderCurve: 'continuous',
    overflow: 'hidden',
  },
  previewOverlay: {
    ...StyleSheet.absoluteFill,
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  previewCard: {
    borderRadius: 24,
    borderCurve: 'continuous',
    overflow: 'hidden',
  },
  previewContent: {
    padding: 16,
  },
  previewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  previewTitle: {
    fontSize: 15,
    fontFamily: 'Tajawal-Bold',
    flex: 1,
  },
  previewIcons: {
    flexDirection: 'row',
    gap: 6,
  },
  previewIconDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    opacity: 0.4,
  },
  previewArabic: {
    fontSize: 20,
    lineHeight: 36,
    fontFamily: 'Amiri-Regular',
    textAlign: 'right',
    marginBottom: 10,
  },
  previewTranslation: {
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 8,
  },
  previewReference: {
    fontSize: 11,
    textAlign: 'right',
    fontFamily: 'Tajawal-Medium',
  },
  buttonContainer: {
    paddingHorizontal: 24,
    paddingTop: 16,
  },
  selectButton: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 18,
    borderCurve: 'continuous',
    paddingVertical: 16,
    alignItems: 'center',
  },
  selectButtonDisabled: {
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
});
