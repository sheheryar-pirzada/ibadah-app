import { View, Text } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';

import { TasbeehCanvas, TasbeehCounter, TasbeehControls } from '@/components/tasbeeh';
import { useThemeColor } from '@/hooks/useThemeColor';
import { useTheme } from '@/contexts/ThemeContext';

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
    <GestureHandlerRootView className="flex-1" style={{ backgroundColor }}>
      <StatusBar style={resolvedTheme === 'dark' ? 'light' : 'dark'} />

      {/* Background gradient */}
      <LinearGradient
        colors={gradientColors}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        className="absolute inset-0"
      />

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
  );
}
