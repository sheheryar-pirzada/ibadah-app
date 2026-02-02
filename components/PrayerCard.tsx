import { useImmersiveOverlay } from "@/components/immersive-overlay/store";
import { ThemedBlurView } from '@/components/ThemedBlurView';
import { useTheme } from '@/contexts/ThemeContext';
import { useThemeColor } from '@/hooks/useThemeColor';
import {
    formatPrayerTime,
    getImmersiveColors,
    getPrayerDescription,
    getPrayerName,
    getRakatItems,
    PrayerKey,
} from '@/utils/prayer-ui';
import * as Haptics from 'expo-haptics';
import { Image } from 'expo-image';
import React from 'react';
import { Pressable, Text, View } from 'react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';

const AnimatedBlurView = Animated.createAnimatedComponent(ThemedBlurView);

interface PrayerCardProps {
    prayerKey: PrayerKey;
    prayerTime: Date;
    nextPrayer: PrayerKey;
    animationDelay: number;
    hasNotification?: boolean;
    onToggle: () => void;
}

export const PrayerCard: React.FC<PrayerCardProps> = ({
    prayerKey,
    prayerTime,
    nextPrayer,
    animationDelay,
    hasNotification,
    onToggle,
}) => {
    const { resolvedTheme } = useTheme();
    const rakatItems = getRakatItems(prayerKey);
    const { immerse, dismiss } = useImmersiveOverlay();

    const textColor = useThemeColor({}, 'text');
    const textSecondary = useThemeColor({}, 'textSecondary');
    const textMuted = useThemeColor({}, 'textMuted');
    const accentColor = useThemeColor({}, 'accent');
    const borderColor = useThemeColor({}, 'border');
    const dividerColor = useThemeColor({}, 'divider');

    const showDetails = () => {
        Haptics.selectionAsync();
        const immersiveColors = getImmersiveColors(prayerKey);
        const cardBackground = resolvedTheme === 'light' ? 'rgba(255,255,255,0.45)' : undefined;
        const cardBorderColor = resolvedTheme === 'light' ? 'rgba(4,99,7,0.25)' : 'rgba(255,255,255,0.15)';
        immerse({
            component: (
                <View className="flex-1 justify-center items-center px-6">
                    <ThemedBlurView
                        intensity={resolvedTheme === 'light' ? 60 : 40}
                        className="w-full max-w-[400px] overflow-hidden rounded-[40px]"
                        style={{
                          borderCurve: 'continuous',
                          backgroundColor: cardBackground,
                          borderWidth: 0.5,
                          borderColor: cardBorderColor,
                        }}
                    >
                        <View
                          className="items-center pt-10 px-8 pb-6 border-b-4"
                          style={{ borderBottomColor: dividerColor }}
                        >
                            <Text className="text-[40px] font-tajawal-bold tracking-[-0.5px] mb-2" style={{ color: textColor }}>
                              {getPrayerName(prayerKey)}
                            </Text>
                            <Text className="text-lg font-tajawal-medium" style={{ color: textSecondary }}>
                              {formatPrayerTime(prayerTime)}
                            </Text>
                        </View>

                        {prayerKey !== 'sunrise' && rakatItems.length > 0 && (
                            <View className="px-8 py-6">
                                <Text className="text-sm font-tajawal-bold uppercase tracking-[1px] text-center mb-4" style={{ color: textMuted }}>
                                  Prayer Structure
                                </Text>
                                <View className="flex-row flex-wrap justify-center gap-3">
                                    {rakatItems.map((item, i) => {
                                        const bgByType =
                                            item.type === 'fard'
                                                ? resolvedTheme === 'dark' ? 'rgba(239,68,68,0.2)' : 'rgba(239,68,68,0.15)'
                                                : item.type === 'witr'
                                                    ? resolvedTheme === 'dark' ? 'rgba(79,195,247,0.2)' : 'rgba(79,195,247,0.15)'
                                                    : resolvedTheme === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(4,99,7,0.08)';
                                        return (
                                            <View
                                                key={`${item.label}-${i}`}
                                                className="items-center py-4 px-5 rounded-2xl min-w-[72px]"
                                                style={{
                                                    borderCurve: 'continuous',
                                                    backgroundColor: bgByType,
                                                }}
                                            >
                                                <Text className="text-2xl font-tajawal-bold mb-1 font-mono" style={{ color: textColor }}>{item.count}</Text>
                                                <Text className="text-xs font-tajawal-bold uppercase tracking-[0.5px] font-mono" style={{ color: textMuted }}>{item.label}</Text>
                                            </View>
                                        );
                                    })}
                                </View>
                            </View>
                        )}

                        <View className="px-8 py-6 border-t-4" style={{ borderTopColor: dividerColor }}>
                            <Text className="text-lg leading-[22px] font-sans text-justify" style={{ color: textSecondary }}>
                              {getPrayerDescription(prayerKey)}
                            </Text>
                        </View>

                        <Pressable onPress={() => {
                            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                            dismiss();
                        }} className="m-8 mt-6 overflow-hidden rounded-[28px]" style={{ borderCurve: 'continuous' }}>
                            <ThemedBlurView
                                intensity={resolvedTheme === 'light' ? 40 : 20}
                                className="py-4 px-8 items-center"
                                style={resolvedTheme === 'light' ? { backgroundColor: 'rgba(4,99,7,0.12)' } : undefined}
                            >
                                <Text className="text-base font-tajawal-bold" style={{ color: resolvedTheme === 'light' ? "black" : "white" }}>
                                  Done
                                </Text>
                            </ThemedBlurView>
                        </Pressable>
                    </ThemedBlurView>
                </View>
            ),
            colors: immersiveColors,
        });
    };

    const isActive = prayerKey === nextPrayer;

    return (
        <Pressable onPress={showDetails} style={{ width: '48%' }}>
            <Animated.View entering={FadeInUp.delay(animationDelay).duration(600)}>
                <AnimatedBlurView
                    intensity={20}
                    className="overflow-hidden rounded-3xl"
                    style={{
                      borderCurve: 'continuous',
                      borderWidth: 0.5,
                      borderColor: isActive ? accentColor : borderColor,
                    }}
                >
                    <View className="flex-row justify-between items-center p-4">
                        <View>
                            <Text
                                className={isActive ? 'text-base font-tajawal-bold' : 'text-base font-tajawal-medium'}
                                style={{ color: textColor }}
                            >
                                {getPrayerName(prayerKey)}
                            </Text>
                            <Text
                                className={isActive ? 'text-sm font-tajawal-bold mt-0.5' : 'text-sm font-sans mt-0.5'}
                                style={{ color: isActive ? textColor : textSecondary }}
                            >
                                {formatPrayerTime(prayerTime)}
                            </Text>
                        </View>
                        {prayerKey !== 'sunrise' && (
                            <Pressable
                                onPress={(e) => {
                                    e.stopPropagation();
                                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                                    onToggle();
                                }}
                                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                            >
                                <Image
                                    transition={{ effect: "sf:replace" }}
                                    style={{ width: 24, height: 24 }}
                                    tintColor={isActive ? accentColor : textMuted}
                                    source={hasNotification ? "sf:bell.fill" : "sf:bell.slash.fill"}
                                />
                            </Pressable>
                        )}
                    </View>
                </AnimatedBlurView>
            </Animated.View>
        </Pressable>
    );
};
