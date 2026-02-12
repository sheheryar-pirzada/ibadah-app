import { StatusBar } from 'expo-status-bar';
import { Text, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BackgroundImage } from '@/components/BackgroundImage';
import { TasbeehCanvas, TasbeehControls, TasbeehCounter } from '@/components/tasbeeh';
import { useTheme } from '@/contexts/ThemeContext';
import { useThemeColor } from '@/hooks/useThemeColor';

export default function TasbeehScreen() {
  const insets = useSafeAreaInsets();
  const { resolvedTheme } = useTheme();

  const backgroundColor = useThemeColor({}, 'background');
  const textMuted = useThemeColor({}, 'textMuted');

  // Gradient colors based on theme
  const gradientColors =
    resolvedTheme === 'dark'
      ? (['#0a1f15', '#0f3d2c', '#0a1f15'] as const)
      : (['#E8E4D9', '#F5F2E8', '#E8E4D9'] as const);

  return (
    <BackgroundImage>
    <GestureHandlerRootView className="flex-1" style={{ backgroundColor: 'transparent' }}>
      <StatusBar style={resolvedTheme === 'dark' ? 'light' : 'dark'} />

      {/* Main content */}
      <View className="flex-1" style={{ paddingTop: insets.top + 60 }}>
        {/* Counter at top */}
        <TasbeehCounter />

        {/* Canvas with beads in middle (takes remaining space) */}
        <View className="flex-1">
          <TasbeehCanvas />
        </View>

        {/* Instructions */}
        <Text
          className="text-center text-sm font-tajawal mb-2 px-8"
          style={{ color: textMuted }}
        >
          Drag the bead along the string to count
        </Text>

        {/* Controls at bottom */}
        <View style={{ paddingBottom: insets.bottom + 16 }}>
          <TasbeehControls />
        </View>
      </View>
    </GestureHandlerRootView>
    </BackgroundImage>
  );
}
