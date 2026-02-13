import { ThemedBlurView } from '@/components/ThemedBlurView';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { useThemeColor } from '@/hooks/useThemeColor';
import { HadithBook } from '@/utils/hadith-settings';
import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import React from 'react';
import { Pressable, Text, View } from 'react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';

interface HadithBooksGridProps {
    books: HadithBook[];
}

export const HadithBooksGrid: React.FC<HadithBooksGridProps> = ({ books }) => {
    const textColor = useThemeColor({}, 'text');
    const accentColor = useThemeColor({}, 'accent');
    const cardBorder = useThemeColor({}, 'cardBorder');

    return (
        <Animated.View entering={FadeInUp.delay(600).duration(600)} className="mb-6 mt-2">
            <Text
                className="text-[22px] font-tajawal-bold mb-5 tracking-[-0.3px]"
                style={{ color: textColor }}
            >
                Hadith Collections
            </Text>
            <View className="flex-row flex-wrap gap-3">
                {books.map((book) => (
                    <Pressable
                        key={book.id}
                        onPress={() => {
                            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                            router.push({ pathname: '/hadith-search', params: { bookId: book.id } });
                        }}
                        className="active:opacity-70 active:scale-95"
                        style={{ width: '31%' }}
                    >
                        <ThemedBlurView
                            intensity={20}
                            className="py-4 px-2 gap-2 items-center justify-center overflow-hidden h-32"
                            style={{ borderColor: cardBorder, borderWidth: 0.5, borderCurve: 'continuous', borderRadius: 40 }}
                        >
                            <IconSymbol name="book.pages.fill" size={32} color={accentColor} />
                            <Text
                                className="text-md font-tajawal-medium text-center mt-2 text-pretty"
                                style={{ color: textColor, maxWidth: '80%' }}
                                numberOfLines={2}
                            >
                                {book.bookName}
                            </Text>
                        </ThemedBlurView>
                    </Pressable>
                ))}
            </View>
        </Animated.View>
    );
};
