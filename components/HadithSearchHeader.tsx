import { SettingsHeaderButton } from '@/components/SettingsHeaderButton';
import { ThemedBlurView } from '@/components/ThemedBlurView';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { useThemeColor } from '@/hooks/useThemeColor';
import { HadithBook } from '@/utils/hadith-settings';
import { Image } from 'expo-image';
import React, { memo } from 'react';
import { ActivityIndicator, Pressable, Text, TextInput, View } from 'react-native';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';

interface HadithSearchHeaderProps {
    bookInfo: HadithBook | null;
    headerTitle: string;
    searchPlaceholder: string;
    searchQuery: string;
    onSearchQueryChange: (text: string) => void;
    onSearch: () => void;
    onClearSearch: () => void;
    onBack: () => void;
    isLoading: boolean;
    chaptersLoading: boolean;
    searchMode: 'content' | 'chapter';
    toggleSearchMode: () => void;
    hasSearched: boolean;
    error: string | null;
    totalResults: number;
    resultsCount: number;
}

const HadithSearchHeader = ({
    bookInfo,
    headerTitle,
    searchPlaceholder,
    searchQuery,
    onSearchQueryChange,
    onSearch,
    onClearSearch,
    onBack,
    isLoading,
    chaptersLoading,
    searchMode,
    toggleSearchMode,
    hasSearched,
    error,
    totalResults,
    resultsCount,
}: HadithSearchHeaderProps) => {
    const textColor = useThemeColor({}, 'text');
    const textMuted = useThemeColor({}, 'textMuted');
    const accentColor = useThemeColor({}, 'accent');
    const borderColor = useThemeColor({}, 'border');

    return (
        <>
            <Animated.View entering={FadeInDown.duration(600)} className="items-center mb-6">
                <View className="flex-row items-center justify-between w-full">
                    <Pressable onPress={onBack} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                        <IconSymbol name="chevron.left" size={24} color={accentColor} />
                    </Pressable>
                    <View className="items-center flex-1">
                        <Text
                            className="text-2xl font-tajawal-bold text-center"
                            style={{ color: textColor }}
                        >
                            {headerTitle}
                        </Text>
                        {bookInfo && (
                            <Text
                                className="text-sm font-tajawal text-center mt-1"
                                style={{ color: textMuted }}
                            >
                                {bookInfo.writerName}
                            </Text>
                        )}
                    </View>
                    <SettingsHeaderButton />
                </View>
            </Animated.View>

            <Animated.View
                entering={FadeInUp.delay(100).duration(600)}
                className="mb-5 flex-row gap-3"
            >
                <View
                    className="flex-1 rounded-[20px] overflow-hidden border"
                    style={{ borderColor, borderCurve: 'continuous' }}
                >
                    <ThemedBlurView intensity={25} className="flex-row items-center px-4 gap-3">
                        <IconSymbol name="magnifyingglass" size={20} color={textMuted} />
                        <TextInput
                            className="flex-1 text-base h-12 pb-2"
                            style={{ color: textColor }}
                            placeholder={searchPlaceholder}
                            placeholderTextColor={textMuted}
                            value={searchQuery}
                            onChangeText={onSearchQueryChange}
                            returnKeyType="search"
                            onSubmitEditing={onSearch}
                            editable={!isLoading && !chaptersLoading}
                        />
                        {searchQuery.length > 0 && (
                            <Pressable onPress={onClearSearch}>
                                <IconSymbol name="xmark.circle.fill" size={20} color={textMuted} />
                            </Pressable>
                        )}
                    </ThemedBlurView>
                </View>

                {bookInfo && (
                    <Pressable
                        onPress={toggleSearchMode}
                        className="aspect-square rounded-[30px] overflow-hidden border items-center justify-center bg-gray-100/10"
                        style={{ borderColor, borderCurve: 'continuous' }}
                    >
                        <ThemedBlurView intensity={25} className="w-full h-full items-center justify-center">
                            {chaptersLoading ? (
                                <ActivityIndicator size="small" color={textColor} />
                            ) : (
                                <Image
                                    transition={{ effect: "sf:replace" }}
                                    style={{ width: 22, height: 22 }}
                                    tintColor={textColor}
                                    source={searchMode === 'content' ? "sf:text.justify.right" : "sf:magnifyingglass"}
                                />
                            )}
                        </ThemedBlurView>
                    </Pressable>
                )}
            </Animated.View>

            {(isLoading || chaptersLoading) && (
                <View className="items-center py-16 gap-4">
                    <ActivityIndicator size="large" color={accentColor} />
                    <Text
                        className="text-base font-tajawal-medium text-center"
                        style={{ color: textMuted }}
                    >
                        {chaptersLoading ? 'Loading chapters...' : 'Searching hadiths...'}
                    </Text>
                </View>
            )}

            {!isLoading && !chaptersLoading && error && (
                <View className="items-center py-16 gap-4">
                    <IconSymbol name="exclamationmark.triangle.fill" size={48} color={textMuted} />
                    <Text
                        className="text-base font-tajawal-medium text-center"
                        style={{ color: textMuted }}
                    >
                        {error}
                    </Text>
                </View>
            )}

            {!isLoading && !chaptersLoading && !error && !hasSearched && (
                <View className="items-center py-16 gap-4">
                    <IconSymbol name="text.book.closed.fill" size={48} color={textMuted} />
                    <Text
                        className="text-base font-tajawal-medium text-center"
                        style={{ color: textMuted }}
                    >
                        {searchMode === 'chapter' ? 'Search for chapters' : `Search for hadith in ${bookInfo?.bookName || 'this collection'}`}
                    </Text>
                    <Text
                        className="text-sm font-tajawal text-center opacity-70"
                        style={{ color: textMuted }}
                    >
                        {searchMode === 'chapter'
                            ? 'Try searching for a chapter title'
                            : 'Try searching for topics like "prayer", "charity", or "patience"'}
                    </Text>
                </View>
            )}

            {!isLoading && !chaptersLoading && hasSearched && resultsCount > 0 && (
                <View className="mb-3 items-center">
                    <Text
                        className="text-sm font-tajawal text-center"
                        style={{ color: textMuted }}
                    >
                        Found {totalResults} {searchMode === 'chapter' ? 'chapter' : 'hadith'}{totalResults !== 1 ? 's' : ''}
                    </Text>
                </View>
            )}

            {!isLoading && !chaptersLoading && hasSearched && resultsCount === 0 && !error && (
                <View className="items-center py-16 gap-4">
                    <IconSymbol name="magnifyingglass" size={48} color={textMuted} />
                    <Text
                        className="text-base font-tajawal-medium text-center"
                        style={{ color: textMuted }}
                    >
                        No matches found for &quot;{searchQuery}&quot;
                    </Text>
                    <Text
                        className="text-sm font-tajawal text-center opacity-70"
                        style={{ color: textMuted }}
                    >
                        Try a different search term
                    </Text>
                </View>
            )}
        </>
    );
};

export default memo(HadithSearchHeader);
