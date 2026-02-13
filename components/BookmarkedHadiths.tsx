import { ThemedBlurView } from '@/components/ThemedBlurView';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { useThemeColor } from '@/hooks/useThemeColor';
import { cleanHadithText, Hadith } from '@/utils/hadith-settings';
import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import React from 'react';
import { Pressable, Text, View } from 'react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';

interface BookmarkedHadithsProps {
    bookmarkedHadiths: Hadith[];
    onRemove: (id: number) => void;
}

export const BookmarkedHadiths: React.FC<BookmarkedHadithsProps> = ({ bookmarkedHadiths, onRemove }) => {
    const textColor = useThemeColor({}, 'text');
    const accentColor = useThemeColor({}, 'accent');
    const cardBorder = useThemeColor({}, 'cardBorder');
    const textMuted = useThemeColor({}, 'textMuted');

    if (bookmarkedHadiths.length === 0) return null;

    return (
        <Animated.View entering={FadeInUp.delay(700).duration(600)} className="mb-6 mt-2">
            <View className="flex-row items-center justify-between mb-5">
                <Text
                    className="text-[22px] font-tajawal-bold tracking-[-0.3px]"
                    style={{ color: textColor }}
                >
                    Bookmarked Hadiths
                </Text>
                <Pressable
                    onPress={() => {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                        router.push('/bookmarked-hadiths');
                    }}
                    className="mr-4"
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                    <Text
                        className="text-base"
                        style={{ color: accentColor }}
                    >
                        View all
                    </Text>
                </Pressable>
            </View>
            <View className="gap-3">
                {bookmarkedHadiths.slice(0, 3).map((hadith) => (
                    <Pressable
                        key={hadith.id}
                        onPress={() => {
                            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                            router.push({
                                pathname: '/share',
                                params: {
                                    arabic: hadith.hadithArabic,
                                    translation: cleanHadithText(hadith.hadithEnglish),
                                    reference: `${hadith.book.bookName} ${hadith.hadithNumber}`,
                                },
                            });
                        }}
                    >
                        <ThemedBlurView
                            intensity={20}
                            className="py-5 px-6 overflow-hidden"
                            style={{ borderColor: cardBorder, borderWidth: 0.5, borderCurve: 'continuous', borderRadius: 40 }}
                        >
                            <View className="flex-row items-start justify-between mb-2">
                                <View className="flex-row items-center gap-2 flex-1">
                                    <View
                                        className="px-2 pt-1 rounded-full"
                                        style={{ backgroundColor: `${accentColor}20` }}
                                    >
                                        <Text
                                            className="text-sm font-tajawal-bold"
                                            style={{ color: accentColor }}
                                        >
                                            #{hadith.hadithNumber}
                                        </Text>
                                    </View>
                                    <Text
                                        className="text-md font-tajawal flex-shrink"
                                        style={{ color: textMuted }}
                                        numberOfLines={1}
                                    >
                                        {hadith.book.bookName}
                                    </Text>
                                </View>
                                <Pressable
                                    onPress={(e) => {
                                        e.stopPropagation();
                                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                                        onRemove(hadith.id);
                                    }}
                                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                                    className="p-1"
                                >
                                    <IconSymbol name="bookmark.fill" size={18} color={accentColor} />
                                </Pressable>
                            </View>
                            <Text
                                className="text-md font-tajawal leading-[22px]"
                                style={{ color: textColor }}
                                numberOfLines={5}
                            >
                                {cleanHadithText(hadith.hadithEnglish)}
                            </Text>
                        </ThemedBlurView>
                    </Pressable>
                ))}
            </View>
        </Animated.View>
    );
};
