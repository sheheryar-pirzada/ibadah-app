import { HadithBookmarkButton } from '@/components/HadithBookmarkButton';
import { ThemedBlurView } from '@/components/ThemedBlurView';
import { useThemeColor } from '@/hooks/useThemeColor';
import { cleanHadithText, Hadith } from '@/utils/hadith-settings';
import { Chapter } from '@/utils/hadith-types';
import React, { memo } from 'react';
import { Text, View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';

interface HadithSearchListItemProps {
    item: Hadith | Chapter;
    index: number;
}

const HadithSearchListItem = ({ item, index }: HadithSearchListItemProps) => {
    const textColor = useThemeColor({}, 'text');
    const textMuted = useThemeColor({}, 'textMuted');
    const textSecondary = useThemeColor({}, 'textSecondary');
    const accentColor = useThemeColor({}, 'accent');
    const cardBorder = useThemeColor({}, 'cardBorder');

    // Check if it's a chapter by checking for unique properties
    const isChapter = (item as Chapter).chapterNumber !== undefined && (item as Hadith).hadithNumber === undefined;

    if (isChapter) {
        const chapter = item as Chapter;
        return (
            <Animated.View
                entering={FadeIn.delay(index * 50).duration(300)}
                className="overflow-hidden"
                style={{ borderColor: cardBorder, borderCurve: 'continuous', borderRadius: 20, borderWidth: 0.5 }}
            >
                <ThemedBlurView intensity={20} className="p-5 flex-row items-center gap-4">
                    <View
                        className="w-10 h-10 rounded-full items-center justify-center"
                        style={{ backgroundColor: `${accentColor}15` }}
                    >
                        <Text className="font-tajawal-bold text-lg" style={{ color: accentColor }}>
                            {chapter.chapterNumber}
                        </Text>
                    </View>
                    <View className="flex-1">
                        <Text className="text-lg font-tajawal-bold" style={{ color: textColor }}>
                            {chapter.chapterEnglish}
                        </Text>
                    </View>
                </ThemedBlurView>
            </Animated.View>
        );
    }

    const hadith = item as Hadith;
    return (
        <Animated.View
            entering={FadeIn.delay(index * 50).duration(300)}
            className="overflow-hidden"
            style={{ borderColor: cardBorder, borderCurve: 'continuous', borderRadius: 40, borderWidth: 0.5 }}
        >
            <ThemedBlurView intensity={20} className="p-5">
                {/* Header with hadith number, status and bookmark */}
                <View className="flex-row items-center justify-between mb-3">
                    <View className="flex-row items-center gap-2">
                        <View
                            className="px-3 pt-2 pb-1 rounded-full"
                            style={{ backgroundColor: `${accentColor}20` }}
                        >
                            <Text
                                className="text-xs font-tajawal-bold"
                                style={{ color: accentColor }}
                            >
                                #{hadith.hadithNumber}
                            </Text>
                        </View>
                        {hadith.status && (
                            <View
                                className="px-3 pt-2 pb-1 rounded-full"
                                style={{
                                    backgroundColor: hadith.status.toLowerCase() === 'sahih'
                                        ? 'rgba(34, 197, 94, 0.2)'
                                        : hadith.status.toLowerCase() === 'hasan'
                                            ? 'rgba(234, 179, 8, 0.2)'
                                            : 'rgba(239, 68, 68, 0.2)',
                                }}
                            >
                                <Text
                                    className="text-xs font-tajawal-medium"
                                    style={{
                                        color: hadith.status.toLowerCase() === 'sahih'
                                            ? '#22c55e'
                                            : hadith.status.toLowerCase() === 'hasan'
                                                ? '#eab308'
                                                : '#ef4444',
                                    }}
                                >
                                    {hadith.status}
                                </Text>
                            </View>
                        )}
                    </View>
                    <View className="flex-row items-center justify-end gap-2">
                        {hadith.chapter?.chapterEnglish && (
                            <Text
                                className="text-md font-tajawal flex-shrink"
                                style={{ color: textMuted }}
                                numberOfLines={1}
                            >
                                {hadith.chapter.chapterEnglish}
                            </Text>
                        )}
                        <HadithBookmarkButton hadith={hadith} />
                    </View>
                </View>

                {/* Narrator */}
                {hadith.englishNarrator && (
                    <Text
                        className="text-lg font-tajawal-bold mb-2"
                        style={{ color: textSecondary }}
                    >
                        {cleanHadithText(hadith.englishNarrator)}
                    </Text>
                )}

                {/* English text */}
                <Text
                    className="text-lg font-tajawal leading-relaxed mb-3"
                    style={{ color: textColor }}
                >
                    {cleanHadithText(hadith.hadithEnglish)}
                </Text>

                {/* Arabic text */}
                {hadith.hadithArabic && (
                    <Text
                        className="text-xl font-amiri leading-loose text-right"
                        style={{ color: textSecondary }}
                    >
                        {hadith.hadithArabic}
                    </Text>
                )}
            </ThemedBlurView>
        </Animated.View>
    );
};

export default memo(HadithSearchListItem);
