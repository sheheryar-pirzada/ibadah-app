import { DarkTheme, DefaultTheme, ThemeProvider as NavigationThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import * as Notifications from 'expo-notifications';
import { router, Stack } from 'expo-router';
import { useColorScheme as useNativeWindColorScheme } from 'nativewind';
import { useEffect } from 'react';
import { AppState, LogBox } from 'react-native';
import 'react-native-reanimated';

import { ChinProvider } from '@/components/chin';
import { ThemedStatusBar } from '@/components/ThemedStatusBar';
import { ThemeProvider, useTheme } from '@/contexts/ThemeContext';
import { TranslationProvider } from '@/contexts/TranslationContext';
import { LocationProvider, useLocation } from '@/hooks/useLocation';
import { useAppOpenAd } from '@/utils/app-open-ad';
import { configureAudioMode } from '@/utils/audio-service';
import { notificationService } from '@/utils/notification-service';
import { getNotificationSettings } from '@/utils/notification-settings';
import '../global.css';

function NotificationManager() {
  const { loc } = useLocation();

  useEffect(() => {
    LogBox.ignoreLogs([
      "SafeAreaView has been deprecated and will be removed in a future release.",
    ]);
    // Initialize notification handler
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
      }),
    });

    // Setup Android channel
    notificationService.setupAndroidChannel();

    // Initial reschedule check
    const initializeNotifications = async () => {
      try {
        const hasPermission = await notificationService.hasPermissions();
        if (!hasPermission) return;

        const settings = await getNotificationSettings();
        if (!settings.enabled) return;

        if (!loc) return;

        // Check if rescheduling is needed
        if (notificationService.needsRescheduling()) {
          const { latitude, longitude } = loc.coords;
          await notificationService.rescheduleAll(latitude, longitude);
        }
      } catch (error) {
        console.error('Error initializing notifications:', error);
      }
    };

    initializeNotifications();

    // Listen for notification taps and navigate to href if provided
    const responseSubscription = Notifications.addNotificationResponseReceivedListener((response) => {
      const data = response.notification.request.content.data;
      if (data?.href && typeof data.href === 'string') {
        router.push(data.href as any);
      }
    });

    // Listen for app state changes to reschedule on foreground
    const subscription = AppState.addEventListener('change', (nextAppState) => {
      if (nextAppState === 'active') {
        const checkAndReschedule = async () => {
          try {
            const hasPermission = await notificationService.hasPermissions();
            if (!hasPermission) return;

            const settings = await getNotificationSettings();
            if (!settings.enabled) return;

            if (!loc) return;

            if (notificationService.needsRescheduling()) {
              const { latitude, longitude } = loc.coords;
              await notificationService.rescheduleAll(latitude, longitude);
            }
          } catch (error) {
            console.error('Error rescheduling notifications on foreground:', error);
          }
        };

        checkAndReschedule();
      }
    });

    return () => {
      subscription.remove();
      responseSubscription.remove();
    };
  }, [loc]);

  return null;
}

function RootLayoutContent() {
  const { resolvedTheme } = useTheme();
  const navigationTheme = resolvedTheme === 'dark' ? DarkTheme : DefaultTheme;

  // Keep Tailwind `dark:` styles in sync with in-app theme setting.
  const { setColorScheme } = useNativeWindColorScheme();
  useEffect(() => {
    setColorScheme(resolvedTheme);
  }, [resolvedTheme, setColorScheme]);

  // Initialize App Open Ads
  useAppOpenAd();

  return (
    <NavigationThemeProvider value={navigationTheme}>
      <LocationProvider>
        <NotificationManager />
        <ChinProvider>
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="(tabs)" />
            <Stack.Screen name="settings" />
            <Stack.Screen
              name="share"
              options={{
                presentation: 'transparentModal',
                animation: 'fade',
              }}
            />
            <Stack.Screen name="ramadan-calendar" />
            <Stack.Screen
              name="letter-detail"
              options={{
                presentation: 'transparentModal',
                animation: 'fade',
              }}
            />
            <Stack.Screen
              name="qibla-ar"
              options={{
                presentation: 'fullScreenModal',
                animation: 'slide_from_bottom',
              }}
            />
          </Stack>
        </ChinProvider>
      </LocationProvider>
      <ThemedStatusBar />
    </NavigationThemeProvider>
  );
}

export default function RootLayout() {
  const [loaded] = useFonts({
    'Tajawal-Bold': require('../assets/fonts/Tajawal/Tajawal-Bold.ttf'),
    'Tajawal-Light': require('../assets/fonts/Tajawal/Tajawal-Light.ttf'),
    'Tajawal-Medium': require('../assets/fonts/Tajawal/Tajawal-Medium.ttf'),
    'Tajawal-Regular': require('../assets/fonts/Tajawal/Tajawal-Regular.ttf'),
    'Amiri-Regular': require('../assets/fonts/Amiri/Amiri-Regular.ttf'),
    'Amiri-Bold': require('../assets/fonts/Amiri/Amiri-Bold.ttf'),
  });

  // Configure audio mode for background playback
  useEffect(() => {
    configureAudioMode();
  }, []);

  if (!loaded) {
    // Async font loading only occurs in development.
    return null;
  }

  return (
    <ThemeProvider>
      <TranslationProvider>
        <RootLayoutContent />
      </TranslationProvider>
    </ThemeProvider>
  );
}
