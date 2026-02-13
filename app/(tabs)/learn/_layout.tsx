import { SettingsHeaderButton } from '@/components/SettingsHeaderButton';
import { Colors } from '@/constants/Colors';
import { useBackground } from '@/contexts/BackgroundContext';
import { useTheme } from '@/contexts/ThemeContext';
import { BlurView } from 'expo-blur';
import { Stack } from 'expo-router';
import { Platform } from 'react-native';

export default function LearnLayout() {
  const { resolvedTheme } = useTheme();
  const colorScheme = resolvedTheme || 'light';

  const { backgroundKey } = useBackground();

  const k = backgroundKey === 'solid' ? resolvedTheme : backgroundKey;
  return (
    <Stack
      screenOptions={{
        headerShown: true,
        headerTransparent: Platform.select({
          ios: true,
          default: false,
        }),
        headerBackground: Platform.select({
          ios: () => (
            <BlurView
              className="flex-1"
              intensity={backgroundKey === 'solid' ? 30 : 0}
              tint={Colors[colorScheme].blurTint}
            />
          ),
          default: undefined,
        }),
        headerShadowVisible: false,
        headerRight: () => <SettingsHeaderButton />,
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          title: 'Learn Arabic',
        }}
      />
      <Stack.Screen
        name="alphabet"
        options={{
          title: 'Arabic Alphabet',
        }}
      />
      <Stack.Screen
        name="lesson/[id]"
        options={{
          title: 'Lesson',
        }}
      />
    </Stack>
  );
}
