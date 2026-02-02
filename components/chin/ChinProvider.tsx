import React from 'react';
import { View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Chin, CHIN_HEIGHT } from './Chin';
import { useChinStore } from './store';

const CONTENT_BORDER_RADIUS = 48;

interface ChinProviderProps {
  children: React.ReactNode;
}

export function ChinProvider({ children }: ChinProviderProps) {
  const { displayChin } = useChinStore();
  const insets = useSafeAreaInsets();

  const animatedContentStyle = useAnimatedStyle(() => {
    const isVisible = displayChin.value;
    return {
      marginBottom: withTiming(isVisible ? CHIN_HEIGHT + insets.bottom : 0, {
        duration: 300,
        easing: Easing.bezier(0.25, 0.1, 0.25, 1),
      }),
      // borderBottomLeftRadius: withTiming(isVisible ? CONTENT_BORDER_RADIUS : 0, {
      //   duration: isVisible ? 0 : 1000,
      //   easing: Easing.linear,
      // }),
      // borderBottomRightRadius: withTiming(isVisible ? CONTENT_BORDER_RADIUS : 0, {
      //   duration: isVisible ? 0 : 1000,
      //   easing: Easing.linear,
      // }),
    };
  });

  return (
    <View className="flex-1 bg-black">
      <Animated.View
        className="flex-1 overflow-hidden"
        style={[
          animatedContentStyle,
          {
            borderBottomLeftRadius: CONTENT_BORDER_RADIUS,
            borderBottomRightRadius: CONTENT_BORDER_RADIUS,
            borderCurve: 'continuous',
          },
        ]}
      >
        {children}
      </Animated.View>
      <Chin />
    </View>
  );
}
