import { IconSymbol } from '@/components/ui/IconSymbol.ios';
import { Colors } from '@/constants/Colors';
import { useTheme } from '@/contexts/ThemeContext';
import { BlurView } from 'expo-blur';
import { router, Stack } from 'expo-router';
import { Platform, TouchableOpacity } from 'react-native';

export { ErrorBoundary } from 'expo-router';

export default function SettingsLayout() {
  const { resolvedTheme } = useTheme();
  const colorScheme = resolvedTheme || 'light';

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
              style={{ flex: 1 }}
              tint={Colors[colorScheme].blurTint}
            />
          ),
          default: undefined,
        }),
        headerShadowVisible: false,
        // header back button
        headerLeft: () => (
          <TouchableOpacity style={{ paddingLeft: 4 }} onPress={() => router.back()}>
            <IconSymbol name="chevron.left" size={24} color={Colors[colorScheme].text} />
          </TouchableOpacity>
        ),
      }}
    >
      <Stack.Screen 
        name="index" 
        options={{
          title: 'Settings',
        }}
      />
      <Stack.Screen
        name="calculation-method"
        options={{
          headerShown: false,
          animation: 'slide_from_bottom',
          presentation: 'formSheet',
          sheetAllowedDetents: [0.9],
          sheetGrabberVisible: true,
          contentStyle: {
            backgroundColor: 'transparent',
          },
        }}
      />
      <Stack.Screen
        name="madhab"
        options={{
          headerShown: false,
          animation: 'slide_from_bottom',
          presentation: 'formSheet',
          sheetAllowedDetents: [0.22],
          sheetGrabberVisible: true,
          contentStyle: {
            backgroundColor: 'transparent',
          },
        }}
      />
      <Stack.Screen
        name="prayer-notifications"
        options={{
          headerShown: false,
          animation: 'slide_from_bottom',
          presentation: 'formSheet',
          sheetAllowedDetents: [0.65],
          sheetGrabberVisible: true,
          contentStyle: {
            backgroundColor: 'transparent',
          },
        }}
      />
      <Stack.Screen
        name="reciter"
        options={{
          headerShown: false,
          animation: 'slide_from_bottom',
          presentation: 'formSheet',
          sheetAllowedDetents: [0.85],
          sheetGrabberVisible: true,
          contentStyle: {
            backgroundColor: 'transparent',
          },
        }}
      />
    </Stack>
  );
}

