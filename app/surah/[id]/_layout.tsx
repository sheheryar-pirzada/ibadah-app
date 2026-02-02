import { Stack } from 'expo-router';
import { Platform } from 'react-native';

export default function SurahIdLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
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
