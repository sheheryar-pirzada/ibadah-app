import * as Haptics from 'expo-haptics';
import { Link } from 'expo-router';
import React from 'react';
import { Pressable, Text, View } from 'react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';

const AppleZoom = Link.AppleZoom;

import { ThemedBlurView } from '@/components/ThemedBlurView';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { useLocation } from '@/hooks/useLocation';
import { useThemeColor } from '@/hooks/useThemeColor';

export default function QiblaFinderCard() {
  const { qibla } = useLocation();

  const textColor = useThemeColor({}, 'text');
  const textMuted = useThemeColor({}, 'textMuted');
  const accentColor = useThemeColor({}, 'accent');
  const cardBorder = useThemeColor({}, 'cardBorder');

  return (
    <Link
      href="/qibla-ar"
      asChild
      onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)}
    >
      <Pressable>
        <AppleZoom>
          <View
            style={{
              marginBottom: 24,
              borderRadius: 40,
              overflow: 'hidden',
              borderColor: cardBorder,
              borderWidth: 0.5,
              borderCurve: 'continuous',
            }}
          >
            <Animated.View entering={FadeInUp.delay(350).duration(800)}>
              <ThemedBlurView intensity={25} className="p-5">
              <View className="w-full">
                <View className="flex-row justify-between items-center mb-4">
                  <Text
                    className="text-xs font-tajawal-bold uppercase tracking-[1px]"
                    style={{ color: textMuted }}
                  >
                    Qibla Finder
                  </Text>
                  {/* <View className="p-1.5 rounded-lg justify-center items-center">
                    <IconSymbol
                      name="arkit"
                      size={20}
                      color={String(accentColor)}
                    />
                  </View> */}
                </View>

                <View className="flex-row items-center justify-between">
                  <View className="flex-1">
                    <Text
                      className="text-2xl font-tajawal-bold mb-1"
                      style={{ color: textColor }}
                    >
                      Find Qibla Direction
                    </Text>
                    <Text
                      className="text-sm font-tajawal-regular"
                      style={{ color: textMuted }}
                    >
                      Use AR to find the direction of the Kaaba
                    </Text>
                  </View>

                  <View
                    className="w-16 h-16 rounded-full items-center justify-center"
                    style={{ backgroundColor: `${accentColor}15` }}
                  >
                    <IconSymbol
                    name="mecca"
                    size={32}
                    color={String(textMuted)}
                  />
                  </View>
                </View>

                <View
                  className="mt-4 flex-row items-center justify-center py-3 rounded-2xl"
                  style={{ backgroundColor: `${accentColor}15` }}
                >
                  <IconSymbol
                    name="camera.viewfinder"
                    size={28}
                    color={String(accentColor)}
                  />
                  <Text
                    className="ml-2 text-md"
                    style={{ color: accentColor }}
                  >
                    Open AR View
                  </Text>
                </View>
              </View>
            </ThemedBlurView>
            </Animated.View>
          </View>
        </AppleZoom>
      </Pressable>
    </Link>
  );
}
