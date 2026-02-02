import { useThemeColor } from '@/hooks/useThemeColor';
import { Hadith, useHadithSettings } from '@/utils/hadith-settings';
import * as Haptics from 'expo-haptics';
import { Image } from 'expo-image';
import React from 'react';
import { Pressable } from 'react-native';

interface HadithBookmarkButtonProps {
    hadith: Hadith;
}

export const HadithBookmarkButton = ({ hadith }: HadithBookmarkButtonProps) => {
    const accentColor = useThemeColor({}, 'accent');
    const textMuted = useThemeColor({}, 'textMuted');
    const { addBookmark, removeBookmark, bookmarkedHadiths } = useHadithSettings();
    const isBookmarked = bookmarkedHadiths.some((h) => h.id === hadith.id);

    const handlePress = () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        if (isBookmarked) {
            removeBookmark(hadith.id);
        } else {
            addBookmark(hadith);
        }
    };

    return (
        <Pressable
            onPress={handlePress}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            className="p-1.5"
        >
            <Image
                transition={{ effect: "sf:replace" }}
                style={{ width: 20, aspectRatio: 1 }}
                tintColor={isBookmarked ? accentColor : textMuted}
                source={isBookmarked ? "sf:bookmark.fill" : "sf:bookmark"}
            />
        </Pressable>
    );
};
