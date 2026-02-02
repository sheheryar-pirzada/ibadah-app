import { SettingsHeaderButton } from '@/components/SettingsHeaderButton';
import { ThemedBlurView } from '@/components/ThemedBlurView';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { useTheme } from '@/contexts/ThemeContext';
import { useThemeColor } from '@/hooks/useThemeColor';
import * as Haptics from 'expo-haptics';
import React, { memo } from 'react';
import { ActivityIndicator, Pressable, Text, TextInput, TouchableOpacity, View } from 'react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';

type SearchMode = 'Search' | 'Read';
const MODES: SearchMode[] = ['Search', 'Read'];

interface QuranSearchHeaderProps {
    searchQuery: string;
    onSearchQueryChange: (text: string) => void;
    onClearSearch: () => void;
    isSearching: boolean;
    hasSearched: boolean;
    totalResults: number;
    resultsCount: number;
    mode: SearchMode;
    onModeChange: (mode: SearchMode) => void;
}

const QuranSearchHeader = ({
    searchQuery,
    onSearchQueryChange,
    onClearSearch,
    isSearching,
    hasSearched,
    totalResults,
    resultsCount,
    mode,
    onModeChange,
}: QuranSearchHeaderProps) => {
    const { resolvedTheme } = useTheme();
    const isDark = resolvedTheme === 'dark';

    const textColor = useThemeColor({}, 'text');
    const textMuted = useThemeColor({}, 'textMuted');
    const accentColor = useThemeColor({}, 'accent');
    const borderColor = useThemeColor({}, 'border');

    return (
        <>
            <View className="items-center mb-6">
                <View className="flex-row items-center justify-between w-full">
                    <View className="w-6" />
                    <Text
                        className="text-[28px] font-tajawal-bold text-center"
                        style={{ color: textColor }}
                    >
                        Quran
                    </Text>
                    <SettingsHeaderButton />
                </View>
            </View>

            {/* Mode Toggle */}
            <View
                className="mb-6 rounded-[20px] overflow-hidden border-[0.5px]"
                style={{ borderColor }}
            >
                <ThemedBlurView intensity={25} className="p-1">
                    <View className="flex-row gap-1">
                        {MODES.map((option) => {
                            const isSelected = mode === option;
                            return (
                                <TouchableOpacity
                                    key={option}
                                    className="flex-1 py-3 px-4 rounded-2xl border-[0.5px] items-center justify-center"
                                    style={{
                                        backgroundColor: isSelected
                                            ? (isDark ? 'rgba(212,175,55,0.25)' : 'rgba(212,175,55,0.2)')
                                            : 'transparent',
                                        borderColor: isSelected ? accentColor : 'transparent',
                                    }}
                                    onPress={() => {
                                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                                        onModeChange(option);
                                    }}
                                    activeOpacity={0.7}
                                >
                                    <Text
                                        className="text-[15px]"
                                        style={{
                                            color: isSelected ? accentColor : textMuted,
                                        }}
                                    >
                                        {option}
                                    </Text>
                                </TouchableOpacity>
                            );
                        })}
                    </View>
                </ThemedBlurView>
            </View>

            {mode === 'Search' && (
                <>
                    <Animated.View
                        entering={FadeInUp.delay(100).duration(600)}
                        className="mb-5 rounded-[20px] overflow-hidden border-[0.5px]"
                        style={{ borderColor, borderCurve: 'continuous' }}
                    >
                        <ThemedBlurView intensity={25} className="flex-row items-center px-4 py-3 gap-3">
                            <IconSymbol name="magnifyingglass" size={20} color={textMuted} />
                            <TextInput
                                className="flex-1 font-tajawal text-base"
                                style={{ color: textColor, includeFontPadding: true, textAlignVertical: 'center' }}
                                placeholder="Search verses..."
                                placeholderTextColor={textMuted}
                                value={searchQuery}
                                onChangeText={onSearchQueryChange}
                                returnKeyType="search"
                                autoFocus={false}
                            />
                            {searchQuery.length > 0 && (
                                <Pressable onPress={onClearSearch}>
                                    <IconSymbol name="xmark.circle.fill" size={20} color={textMuted} />
                                </Pressable>
                            )}
                        </ThemedBlurView>
                    </Animated.View>

                    {hasSearched && !isSearching && (
                        <Animated.View entering={FadeInUp.delay(200).duration(400)}>
                            <Text
                                className="text-sm font-tajawal mb-4 text-center"
                                style={{ color: textMuted }}
                            >
                                {totalResults > 0
                                    ? `Found ${totalResults} result${totalResults !== 1 ? 's' : ''} (showing ${resultsCount})`
                                    : 'No results found'}
                            </Text>
                        </Animated.View>
                    )}

                    {isSearching && (
                        <View className="items-center py-10 gap-3">
                            <ActivityIndicator size="large" color={accentColor} />
                            <Text
                                className="text-base font-tajawal"
                                style={{ color: textMuted }}
                            >
                                Searching...
                            </Text>
                        </View>
                    )}

                    {!hasSearched && !isSearching && (
                        <View className="items-center py-[60px] gap-4">
                            <IconSymbol name="book.fill" size={48} color={textMuted} />
                            <Text
                                className="text-base font-tajawal-medium text-center"
                                style={{ color: textMuted }}
                            >
                                Search for words or phrases in the Quran
                            </Text>
                            <Text
                                className="text-sm font-tajawal text-center opacity-70"
                                style={{ color: textMuted }}
                            >
                                {'Try searching for "Allah", "mercy", or "prayer"'}
                            </Text>
                        </View>
                    )}
                </>
            )}

            {/* {mode === 'Read' && (
                <View className="items-center py-[60px]">
                    <Text className="text-base font-tajawal-medium" style={{ color: textMuted }}>
                        Read Mode Coming Soon
                    </Text>
                </View>
            )} */}
        </>
    );
};

export default memo(QuranSearchHeader);

