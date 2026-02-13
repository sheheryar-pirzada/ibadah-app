import { BackgroundImage } from '@/components/BackgroundImage';
import HadithSearchListItem from '@/components/HadithSearchListItem';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { useThemeColor } from '@/hooks/useThemeColor';
import { Hadith } from '@/utils/hadith-settings';
import { HADITH_API_KEY, HadithApiResponse } from '@/utils/hadith-types';
import * as Haptics from 'expo-haptics';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const PAGE_SIZE = 20;

export default function HadithChapterScreen() {
    const { bookSlug, chapterNumber, chapterEnglish, chapterArabic } = useLocalSearchParams<{
        bookSlug: string;
        chapterNumber: string;
        chapterEnglish: string;
        chapterArabic: string;
    }>();

    const insets = useSafeAreaInsets();
    const textColor = useThemeColor({}, 'text');
    const textMuted = useThemeColor({}, 'textMuted');
    const accentColor = useThemeColor({}, 'accent');

    const [hadiths, setHadiths] = useState<Hadith[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [lastPage, setLastPage] = useState(1);
    const [total, setTotal] = useState(0);
    const [error, setError] = useState<string | null>(null);

    const fetchHadiths = useCallback(async (page: number, append: boolean) => {
        if (!bookSlug || !chapterNumber) return;

        if (page === 1) {
            setIsLoading(true);
        } else {
            setIsLoadingMore(true);
        }
        setError(null);

        try {
            const params = new URLSearchParams({
                apiKey: HADITH_API_KEY,
                book: bookSlug,
                chapter: chapterNumber,
                paginate: PAGE_SIZE.toString(),
                page: page.toString(),
            });

            const response = await fetch(`https://hadithapi.com/api/hadiths/?${params.toString()}`);
            const data: HadithApiResponse = await response.json();

            if (response.ok && data.status === 200 && data.hadiths) {
                const newHadiths = data.hadiths.data || [];
                setHadiths(prev => append ? [...prev, ...newHadiths] : newHadiths);
                setCurrentPage(data.hadiths.current_page);
                setLastPage(data.hadiths.last_page);
                setTotal(data.hadiths.total);
            } else {
                setError(data.message || 'Failed to load hadiths');
            }
        } catch {
            setError('Failed to load hadiths. Please try again.');
        } finally {
            setIsLoading(false);
            setIsLoadingMore(false);
        }
    }, [bookSlug, chapterNumber]);

    useEffect(() => {
        fetchHadiths(1, false);
    }, [fetchHadiths]);

    const handleLoadMore = useCallback(() => {
        if (!isLoadingMore && currentPage < lastPage) {
            fetchHadiths(currentPage + 1, true);
        }
    }, [isLoadingMore, currentPage, lastPage, fetchHadiths]);

    const ListHeader = () => (
        <View className="pb-6 px-2">
            <Pressable
                onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    router.back();
                }}
                className="mb-6"
                hitSlop={12}
            >
                <IconSymbol weight="light" name="chevron.left" size={28} color={textColor} />
            </Pressable>
            <Text className="text-2xl font-tajawal-bold mb-1" style={{ color: textColor }}>
                {chapterEnglish}
            </Text>
            <Text className="text-base font-tajawal" style={{ color: textMuted }}>
                Chapter {chapterNumber} {total > 0 ? `\u00B7 ${total} hadiths` : ''}
            </Text>
        </View>
    );

    const ListFooter = () => {
        if (isLoadingMore) {
            return (
                <View className="py-6 items-center">
                    <ActivityIndicator size="small" color={accentColor} />
                </View>
            );
        }

        if (currentPage < lastPage) {
            return (
                <Pressable onPress={handleLoadMore} className="py-4 items-center mt-3">
                    <Text className="text-base font-tajawal-medium" style={{ color: accentColor }}>
                        Load more hadiths
                    </Text>
                </Pressable>
            );
        }

        if (hadiths.length > 0) {
            return (
                <View className="py-4 items-center mt-3">
                    <Text className="text-sm font-tajawal" style={{ color: textMuted }}>
                        End of chapter
                    </Text>
                </View>
            );
        }

        return null;
    };

    return (
        <BackgroundImage>
            <Stack.Screen options={{ headerTitle: chapterEnglish ?? '' }} />
            <View className="flex-1" style={{ backgroundColor: 'transparent' }}>
                {isLoading ? (
                    <View className="flex-1 items-center justify-center">
                        <ActivityIndicator size="large" color={accentColor} />
                    </View>
                ) : error && hadiths.length === 0 ? (
                    <View className="flex-1 items-center justify-center px-8">
                        {/* <ListHeader /> */}
                        <Text className="text-lg font-tajawal text-center" style={{ color: textMuted }}>
                            {error}
                        </Text>
                        <Pressable
                            onPress={() => fetchHadiths(1, false)}
                            className="mt-4 px-6 py-2 rounded-full"
                            style={{ backgroundColor: `${accentColor}20`, borderCurve: 'continuous' }}
                        >
                            <Text className="text-base font-tajawal-medium" style={{ color: accentColor }}>
                                Retry
                            </Text>
                        </Pressable>
                    </View>
                ) : (
                    <FlatList
                        data={hadiths}
                        renderItem={({ item, index }) => <HadithSearchListItem item={item} index={index} />}
                        keyExtractor={(item) => `${item.bookSlug}-${item.hadithNumber}-${item.id}`}
                        contentContainerStyle={{ paddingTop: 16, paddingBottom: 120, paddingHorizontal: 16 }}
                        // ListHeaderComponent={ListHeader}
                        ListFooterComponent={ListFooter}
                        ItemSeparatorComponent={() => <View className="h-3" />}
                        onEndReached={handleLoadMore}
                        onEndReachedThreshold={0.3}
                        showsVerticalScrollIndicator={false}
                        contentInsetAdjustmentBehavior='automatic'
                    />
                )}
            </View>
        </BackgroundImage>
    );
}
