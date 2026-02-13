import { SettingsHeaderButton } from '@/components/SettingsHeaderButton';
import { Colors } from '@/constants/Colors';
import { useBackground } from '@/contexts/BackgroundContext';
import { useTheme } from '@/contexts/ThemeContext';
import { BlurView } from 'expo-blur';
import { Stack } from 'expo-router';
import { Platform } from 'react-native';

export { ErrorBoundary } from 'expo-router';

export default function TrackLayout() {
  const { resolvedTheme } = useTheme();
  const colorScheme = resolvedTheme || 'light';
  const { backgroundKey } = useBackground();

  return (
    <Stack
      screenOptions={{
        headerShown: true,
        headerTransparent: Platform.select({
          ios: true,
          default: false,
        }),
        headerBackVisible: true,
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
          title: 'Track',
        }}
      />
      <Stack.Screen
        name="analytics"
        options={{
          headerTitle: 'Analytics',
          animation: 'slide_from_right',
        }}
      />
      <Stack.Screen
        name="tasbeeh"
        options={{
          headerTitle: 'Tasbeeh',
          animation: 'slide_from_right',
        }}
      />
    </Stack>
  );
}
