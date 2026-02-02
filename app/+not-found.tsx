import { ThemedBlurView } from '@/components/ThemedBlurView';
import { ThemedStatusBar } from '@/components/ThemedStatusBar';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { useTheme } from '@/contexts/ThemeContext';
import { useThemeColor } from '@/hooks/useThemeColor';
import * as Haptics from 'expo-haptics';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { router, Stack } from 'expo-router';
import { Pressable, Text, View } from 'react-native';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';

export default function NotFoundScreen() {
  const { resolvedTheme } = useTheme();

  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const textMuted = useThemeColor({}, 'textMuted');
  const accentColor = useThemeColor({}, 'accent');
  const cardBorder = useThemeColor({}, 'cardBorder');

  const gradientColors = resolvedTheme === 'dark'
    ? (['rgba(0,0,0,0.3)', 'rgba(0,0,0,0.1)', 'rgba(0,0,0,0.4)'] as const)
    : (['rgba(255,255,255,0.1)', 'rgba(255,255,255,0.05)', 'rgba(255,255,255,0.15)'] as const);

  const handleGoHome = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.replace('/');
  };

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <View className="flex-1" style={{ backgroundColor }}>
        <ThemedStatusBar />
        <LinearGradient colors={gradientColors} className="absolute inset-0" />

        <View className="flex-1 items-center justify-center px-6">
          <Animated.View entering={FadeInDown.duration(600)} className="items-center mb-8">
            <Image
              source={require('@/assets/images/splash-icon.png')}
              style={{ width: 100, height: 100, marginBottom: 24 }}
              contentFit="contain"
            />
            <Text
              className="text-[72px] font-tajawal-bold mb-2"
              style={{ color: textMuted }}
            >
              404
            </Text>
          </Animated.View>

          <Animated.View entering={FadeInUp.delay(200).duration(600)} className="w-full max-w-sm">
            <ThemedBlurView
              intensity={25}
              className="rounded-[28px] p-6 items-center overflow-hidden"
              style={{ borderColor: cardBorder, borderWidth: 0.5, borderCurve: 'continuous' }}
            >
              <Text
                className="text-xl font-tajawal-bold text-center mb-2"
                style={{ color: textColor }}
              >
                Page Not Found
              </Text>
              <Text
                className="text-base font-tajawal text-center mb-6"
                style={{ color: textMuted }}
              >
                {"The page you're looking for doesn't exist or has been moved."}
              </Text>

              <Pressable
                onPress={handleGoHome}
                className="flex-row items-center justify-center py-3.5 px-6 rounded-xl w-full"
                style={{ backgroundColor: accentColor }}
              >
                <IconSymbol name="house.fill" size={18} color="#fff" />
                <Text className="text-base font-bold ml-2" style={{ color: '#fff' }}>
                  Go Home
                </Text>
              </Pressable>
            </ThemedBlurView>
          </Animated.View>
        </View>
      </View>
    </>
  );
}
