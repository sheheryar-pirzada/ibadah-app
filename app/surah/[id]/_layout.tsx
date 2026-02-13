import { useBackground } from '@/contexts/BackgroundContext';
import { useTheme } from '@/contexts/ThemeContext';
import { Stack } from 'expo-router';
import { Platform } from 'react-native';

export default function SurahIdLayout() {
  const {backgroundKey} = useBackground();
  const {resolvedTheme} = useTheme();
  const colorScheme = resolvedTheme || 'light';
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        // headerBackVisible: true,
        // headerShadowVisible: false,
        // headerBackground: Platform.select({
        //   ios: () => (
        //     <BlurView
        //       className="flex-1"
        //       intensity={backgroundKey === 'solid' ? 30 : 0}
        //       tint={Colors[colorScheme].blurTint}
        //     />
        //   ),
        //   default: undefined,
        // }),
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="page" />
      <Stack.Screen
        name="tafsir"
        options={{
          presentation: 'formSheet',
          animation: 'slide_from_bottom',
          sheetAllowedDetents: [0.5, 0.9],
          sheetGrabberVisible: true,
          ...(Platform.OS === 'ios' && {
            contentStyle: { backgroundColor: 'transparent' },
          }),
        }}
      />
      <Stack.Screen
        name="note"
        options={{
          presentation: 'formSheet',
          animation: 'slide_from_bottom',
          sheetAllowedDetents: [0.25, 0.5, 0.9],
          sheetGrabberVisible: true,
          ...(Platform.OS === 'ios' && {
            contentStyle: { backgroundColor: 'transparent' },
          }),
        }}
      />
    </Stack>
  );
}
