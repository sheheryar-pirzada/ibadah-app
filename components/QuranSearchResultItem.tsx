import { ThemedBlurView } from '@/components/ThemedBlurView';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { useThemeColor } from '@/hooks/useThemeColor';
import { SearchResult } from '@/utils/quran-api';
import { parseHighlightSegments } from '@/utils/quran-search';
import { Image } from 'expo-image';
import React, { memo } from 'react';
import { ActivityIndicator, Pressable, Text, View } from 'react-native';

interface QuranSearchResultItemProps {
    result: SearchResult;
    isExpanded: boolean;
    onPress: () => void;
    onShare: () => void;
    onAudioToggle: () => void;
    audioUrl: string | null;
    isLoadingAudio: boolean;
    isAudioLoadingThis: boolean;
}

const QuranSearchResultItem = ({
    result,
    isExpanded,
    onPress,
    onShare,
    onAudioToggle,
    audioUrl,
    isLoadingAudio,
    isAudioLoadingThis
}: QuranSearchResultItemProps) => {
    const textColor = useThemeColor({}, 'text');
    const textMuted = useThemeColor({}, 'textMuted');
    const textSecondary = useThemeColor({}, 'textSecondary');
    const accentColor = useThemeColor({}, 'accent');
    const cardBorder = useThemeColor({}, 'cardBorder');
    const dividerColor = useThemeColor({}, 'divider');

    const renderHighlightedText = (text: string) => {
        if (!text) return null;
        const segments = parseHighlightSegments(text);
        return segments.map((segment, index) => (
            <Text
                key={index}
                style={[
                    { color: textSecondary },
                    segment.isHighlighted && { color: accentColor, fontWeight: '600' },
                ]}
            >
                {segment.text}
            </Text>
        ));
    };

    return (
        <Pressable onPress={onPress}>
            <ThemedBlurView
                intensity={25}
                className="rounded-3xl overflow-hidden p-4"
                style={{ borderColor: cardBorder, borderWidth: 0.5, borderCurve: 'continuous' }}
            >
                <View className="flex-row justify-between items-center mb-4">
                    <Text
                        className="text-md font-tajawal-bold"
                        style={{ color: accentColor }}
                    >
                        {result.verse_key}
                    </Text>
                    <View className="flex-row items-center gap-2">
                        {isAudioLoadingThis ? (
                            <ActivityIndicator size="small" color={accentColor} />
                        ) : (
                            <Pressable
                                onPress={(e) => {
                                    e.stopPropagation?.();
                                    onAudioToggle();
                                }}
                                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                                className="p-1 justify-center items-center"
                            >
                                <IconSymbol
                                    name="speaker.wave.2.fill"
                                    size={20}
                                    color={textMuted}
                                />
                            </Pressable>
                        )}
                        <Pressable
                            onPress={(e) => {
                                e.stopPropagation?.();
                                onShare();
                            }}
                            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                            className="p-1 justify-center items-center"
                        >
                            <IconSymbol
                                name="square.and.arrow.up"
                                size={20}
                                color={textMuted}
                            />
                        </Pressable>
                        <Image
                            source={isExpanded ? 'sf:chevron.up' : 'sf:chevron.down'}
                            style={{ width: 20, aspectRatio: 1 }}
                            tintColor={textMuted}
                            transition={{ effect: 'sf:down-up' }}
                        />
                    </View>
                </View>

                <Text
                    className="text-[22px] font-amiri text-right leading-[38px] mb-2"
                    style={{ color: textColor }}
                    numberOfLines={isExpanded ? undefined : 2}
                >
                    {result.text}
                </Text>

                {result.translations?.[0] && (
                    <Text className="text-sm font-tajawal leading-5">
                        {result.highlighted
                            ? renderHighlightedText(result.highlighted)
                            : <Text style={{ color: textSecondary }}>{renderHighlightedText(result.translations[0].text)}</Text>
                        }
                    </Text>
                )}
            </ThemedBlurView>
        </Pressable>
    );
};

export default memo(QuranSearchResultItem);
