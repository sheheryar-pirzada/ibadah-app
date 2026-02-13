import { IconSymbol } from '@/components/ui/IconSymbol.ios';
import { Colors } from '@/constants/Colors';
import { useBackground } from '@/contexts/BackgroundContext';
import { useTheme } from '@/contexts/ThemeContext';
import { BlurView } from 'expo-blur';
import { router, Stack } from 'expo-router';
import { Platform, TouchableOpacity } from 'react-native';

export { ErrorBoundary } from 'expo-router';

export default function SettingsLayout() {
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
        // header back button
        headerLeft: () => (
          <TouchableOpacity onPress={() => router.back()}>
            <IconSymbol name="chevron.left" size={24} color={Colors[k].text} />
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
      <Stack.Screen
        name="translation"
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
      <Stack.Screen
        name="hadith-book"
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
      <Stack.Screen
        name="background"
        options={{
          headerShown: true,
          headerTitle: 'Background',
          presentation: 'transparentModal',
          animation: 'fade',
          headerTransparent: true,
          headerShadowVisible: false,
        }}
      />
    </Stack>
  );
}

