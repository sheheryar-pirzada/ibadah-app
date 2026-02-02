import { useCallback, useEffect, useRef } from 'react';
import { Dimensions, FlatList, Pressable, Text, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
} from 'react-native-reanimated';

import { ThemedBlurView } from '@/components/ThemedBlurView';
import { IconSymbol } from '@/components/ui/IconSymbol';
import {
  DHIKR_OPTIONS,
  TASBEEH_COLORS,
  type DhikrOption,
} from '@/constants/tasbeeh';
import { useThemeColor } from '@/hooks/useThemeColor';
import { useTasbeehStore } from './store';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
// Card: mx-4 (32) + p-6 (48) so visible carousel width = screen - 80
const DHIKR_CAROUSEL_ITEM_WIDTH = SCREEN_WIDTH - 32 - 48;

interface TasbeehCounterProps {
  onTargetPress?: () => void;
}

function DhikrCarouselItem({
  item,
  textColor,
  textMuted,
}: {
  item: DhikrOption;
  textColor: string;
  textMuted: string;
}) {
  return (
    <View
      style={{ width: DHIKR_CAROUSEL_ITEM_WIDTH }}
      className="items-center justify-center px-6"
    >
      <Text
        className="text-3xl font-amiri leading-[48px]"
        style={{ color: textColor, textAlign: 'center' }}
      >
        {item.arabic}
      </Text>
      <Text
        className="text-base font-tajawal-medium mt-1"
        style={{ color: textMuted, textAlign: 'center' }}
      >
        {item.transliteration}
      </Text>
      <Text
        className="text-sm font-tajawal mt-0.5"
        style={{ color: textMuted, opacity: 0.9, textAlign: 'center' }}
        numberOfLines={2}
      >
        {item.meaning}
      </Text>
    </View>
  );
}

export function TasbeehCounter({ onTargetPress }: TasbeehCounterProps) {
  const { currentCount, currentTarget, currentDhikr, setDhikr } =
    useTasbeehStore();

  // Theme colors
  const textColor = useThemeColor({}, 'text');
  const textMuted = useThemeColor({}, 'textMuted');
  const cardBorder = useThemeColor({}, 'cardBorder');
  const accentColor = useThemeColor({}, 'accent');

  // Animation for count changes
  const scale = useSharedValue(1);

  useEffect(() => {
    if (currentCount > 0) {
      scale.value = withSequence(
        withSpring(1.15, { damping: 8, stiffness: 400 }),
        withSpring(1, { damping: 12, stiffness: 200 })
      );
    }
  }, [currentCount]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  // Calculate progress
  const progress = Math.min(currentCount / currentTarget, 1);

  // Find current dhikr (by id or legacy transliteration)
  const currentIndex = DHIKR_OPTIONS.findIndex(
    (d) => d.id === currentDhikr || d.transliteration === currentDhikr
  );
  const safeIndex = currentIndex >= 0 ? currentIndex : 0;
  const flatListRef = useRef<FlatList<DhikrOption>>(null);

  const goToIndex = useCallback(
    (index: number) => {
      const clamped = Math.min(
        Math.max(0, index),
        DHIKR_OPTIONS.length - 1
      );
      setDhikr(DHIKR_OPTIONS[clamped].id);
      flatListRef.current?.scrollToIndex({
        index: clamped,
        animated: true,
      });
    },
    [setDhikr]
  );

  const handleMomentumScrollEnd = useCallback(
    (e: { nativeEvent: { contentOffset: { x: number } } }) => {
      const offset = e.nativeEvent.contentOffset.x;
      const index = Math.round(offset / DHIKR_CAROUSEL_ITEM_WIDTH);
      const clamped = Math.min(
        Math.max(0, index),
        DHIKR_OPTIONS.length - 1
      );
      setDhikr(DHIKR_OPTIONS[clamped].id);
    },
    [setDhikr]
  );

  const renderDhikrItem = useCallback(
    ({ item }: { item: DhikrOption }) => (
      <DhikrCarouselItem
        item={item}
        textColor={textColor}
        textMuted={textMuted}
      />
    ),
    [textColor, textMuted]
  );

  return (
    <ThemedBlurView
      intensity={30}
      className="rounded-[28px] overflow-hidden mx-4"
      style={{
        borderWidth: 0.5,
        borderColor: cardBorder,
        borderCurve: 'continuous',
      }}
    >
      <View className="p-6">
        {/* Swipeable dhikr carousel with arrows */}
        <View style={{ position: 'relative' }}>
          <FlatList
            ref={flatListRef}
            data={DHIKR_OPTIONS}
            keyExtractor={(item) => item.id}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            snapToInterval={DHIKR_CAROUSEL_ITEM_WIDTH}
            snapToAlignment="start"
            decelerationRate="fast"
            onMomentumScrollEnd={handleMomentumScrollEnd}
            initialScrollIndex={safeIndex}
            getItemLayout={(_, index) => ({
              length: DHIKR_CAROUSEL_ITEM_WIDTH,
              offset: DHIKR_CAROUSEL_ITEM_WIDTH * index,
              index,
            })}
            renderItem={renderDhikrItem}
          />
          <Pressable
            onPress={() => goToIndex(safeIndex - 1)}
            disabled={safeIndex === 0}
            style={{
              position: 'absolute',
              left: 0,
              top: 0,
              bottom: 0,
              justifyContent: 'center',
              paddingHorizontal: 4,
            }}
            hitSlop={12}
          >
            <IconSymbol
              name="chevron.left"
              size={28}
              color={safeIndex === 0 ? textMuted : textColor}
              style={{ opacity: safeIndex === 0 ? 0.4 : 1 }}
            />
          </Pressable>
          <Pressable
            onPress={() => goToIndex(safeIndex + 1)}
            disabled={safeIndex === DHIKR_OPTIONS.length - 1}
            style={{
              position: 'absolute',
              right: 0,
              top: 0,
              bottom: 0,
              justifyContent: 'center',
              paddingHorizontal: 4,
            }}
            hitSlop={12}
          >
            <IconSymbol
              name="chevron.right"
              size={28}
              color={
                safeIndex === DHIKR_OPTIONS.length - 1 ? textMuted : textColor
              }
              style={{
                opacity: safeIndex === DHIKR_OPTIONS.length - 1 ? 0.4 : 1,
              }}
            />
          </Pressable>
        </View>

        {/* Main counter - count and target on same line */}
        <Pressable onPress={onTargetPress} className="items-center mb-4">
          <View className="flex-row items-baseline">
            <Animated.Text
              style={[
                {
                  fontSize: 40,
                  fontFamily: 'Tajawal-Bold',
                  color: accentColor,
                  // lineHeight: 80,
                },
                animatedStyle,
              ]}
            >
              {currentCount}
            </Animated.Text>
            <Text
              style={{
                fontSize: 40,
                fontFamily: 'Tajawal-Bold',
                color: textMuted,
                // lineHeight: 80,
              }}
            >
              &nbsp;/ {currentTarget}
            </Text>
          </View>
        </Pressable>

        {/* Progress bar */}
        <View
          className="h-2 rounded-full overflow-hidden"
          style={{ backgroundColor: TASBEEH_COLORS.counter.progressBg }}
        >
          <Animated.View
            className="h-full rounded-full"
            style={{
              backgroundColor: TASBEEH_COLORS.counter.progress,
              width: `${progress * 100}%`,
            }}
          />
        </View>
      </View>
    </ThemedBlurView>
  );
}
