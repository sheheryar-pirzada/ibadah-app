import React from 'react';
import { TouchableOpacity, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { IconSymbol } from '@/components/ui/IconSymbol';
import { useThemeColor } from '@/hooks/useThemeColor';
import { useChin, useChinStore } from './store';

export const CHIN_HEIGHT = 65;

export function Chin() {
  const insets = useSafeAreaInsets();
  const { displayChin, content } = useChinStore();
  const { hide } = useChin();

  const borderColor = useThemeColor({}, 'cardBorder');

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        {
          translateY: withTiming(displayChin.value ? 0 : CHIN_HEIGHT + insets.bottom, {
            duration: 300,
            easing: Easing.bezier(0.25, 0.1, 0.25, 1),
          }),
        },
      ],
    };
  });

  return (
    <Animated.View
      style={[
        {
          backgroundColor: "#000",
          borderColor,
          paddingBottom: insets.bottom,
          height: CHIN_HEIGHT + insets.bottom,
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
        },
        animatedStyle,
      ]}
    >
      <View className="flex-1 flex-row items-center px-5 pt-4">
        <View className="flex-1">{content}</View>
        <TouchableOpacity onPress={hide} className="pt-1 pr-1">
          <IconSymbol name="xmark.circle.fill" size={28} color="#fff" />
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
}
