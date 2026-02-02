import { ThemedStatusBar } from '@/components/ThemedStatusBar';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { useTheme } from '@/contexts/ThemeContext';
import { useQuranChapters } from '@/hooks/useQuranChapters';
import { useThemeColor } from '@/hooks/useThemeColor';
import { useQuranAudio } from '@/utils/audio-service';
import { quranAPI, Verse } from '@/utils/quran-api';
import { getReciterSettings } from '@/utils/reciter-settings';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { Easing, FadeIn, FadeOut, FadeOutLeft, LinearTransition } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function SurahDetailScreenComponent() {
    const { id } = useLocalSearchParams();
    const router = useRouter();
    const { resolvedTheme } = useTheme();
    const { chapters, isLoading } = useQuranChapters();
    const insets = useSafeAreaInsets();
    const [isReading, setIsReading] = useState(false);

    // Playback State
    const [isPlaying, setIsPlaying] = useState(false);
    const [autoPlay, setAutoPlay] = useState(true);
    const [repeatMode, setRepeatMode] = useState<'off' | 'verse' | 'surah'>('off');
    const [currentVerseIndex, setCurrentVerseIndex] = useState(0);

    // Data State
    const [verses, setVerses] = useState<Verse[]>([]);
    const [isLoadingVerses, setIsLoadingVerses] = useState(false);
    const [isVerseLoading, setIsVerseLoading] = useState(false);

    // Audio Player
    const currentAudioUrl = verses[currentVerseIndex]?.audio?.url || null;
    const { play, pause, stop, seekTo, status } = useQuranAudio(currentAudioUrl);

    // Track if current verse has actually started playing (to prevent premature skipping)
    const didPlayRef = useRef(false);
    // Debounce flag to prevent rapid re-triggering of verse-end logic
    const isProcessingRepeatRef = useRef(false);

    // Reset didPlay flag when verse changes
    useEffect(() => {
        didPlayRef.current = false;
        isProcessingRepeatRef.current = false;
    }, [currentVerseIndex]);

    // Track when audio actually starts playing
    useEffect(() => {
        if (status.isPlaying && status.position > 0 && status.position < status.duration - 500) {
            didPlayRef.current = true;
            isProcessingRepeatRef.current = false;
        }
    }, [status.isPlaying, status.position, status.duration]);

    // Sync isPlaying state with player
    useEffect(() => {
        if (isPlaying && !status.isPlaying && currentAudioUrl && !status.isBuffering && !isProcessingRepeatRef.current) {
            console.log('Sync Effect: Requesting playback for', currentVerseIndex);
            play();
        } else if (!isPlaying && status.isPlaying) {
            console.log('Sync Effect: Pausing playback');
            pause();
        }
    }, [isPlaying, currentAudioUrl, status.isPlaying, status.isBuffering]);

    // Handle Autoplay / End of Verse
    useEffect(() => {
        // Only trigger if:
        // 1. We want to be playing (isPlaying state is true)
        // 2. The audio has valid duration
        // 3. Position is near the end (within 500ms)
        // 4. The player has stopped (not currently playing)
        // 5. Not currently buffering
        // 6. This verse has actually been played (didPlayRef is true) - prevents premature skipping on URL change
        // 7. Not already processing a repeat (isProcessingRepeatRef is false)
        if (isPlaying && status.duration > 0 && status.position >= status.duration - 500 && !status.isPlaying && !status.isBuffering && didPlayRef.current && !isProcessingRepeatRef.current) {
            console.log('Verse finished naturally, moving to next... (position:', status.position, 'duration:', status.duration, ')');

            if (repeatMode === 'verse') {
                // Repeat single verse - seek to beginning and replay
                isProcessingRepeatRef.current = true;
                didPlayRef.current = false;
                seekTo(0);
                // Small delay to let seek complete before playing
                setTimeout(() => {
                    play();
                }, 100);
            } else if (currentVerseIndex < verses.length - 1) {
                // More verses remaining - advance to next
                if (autoPlay) {
                    setCurrentVerseIndex(prev => prev + 1);
                } else {
                    setIsPlaying(false);
                }
            } else {
                // Reached end of surah
                if (repeatMode === 'surah') {
                    // Repeat surah - go back to first verse
                    setCurrentVerseIndex(0);
                } else {
                    // No repeat - stop playback
                    setIsPlaying(false);
                }
            }
        }
    }, [status.isPlaying, status.position, status.duration, isPlaying, repeatMode, currentVerseIndex, autoPlay]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            stop();
        };
    }, []);

    useEffect(() => {
        if (!id) return;

        const fetchData = async () => {
            setIsLoadingVerses(true);
            try {
                const chapterId = parseInt(id.toString());
                const settings = await getReciterSettings();

                // Fetch verses with Clear Quran translation (131)
                // Fetching up to 286 verses (longest surah) to be safe for now,
                // in real app handle pagination or larger limits
                const versesData = await quranAPI.getVersesByChapter(chapterId, {
                    perPage: 300,
                    translations: [85], // M.A.S. Abdel Haleem (Verified on stable API)
                    textType: 'uthmani',
                    audio: settings.reciterId,
                    words: true,
                });
                console.log('Verses loaded:', versesData.verses.length);
                setVerses(versesData.verses);

                // Fetch Start to End audio and merge into verses
                if (versesData.verses.length > 0) {
                    quranAPI.getVerseRangeAudio(
                        chapterId,
                        1,
                        versesData.verses.length,
                        settings.reciterId
                    ).then(audioList => {
                        if (audioList) {
                            setVerses(prev => prev.map(v => {
                                const audio = audioList.find(a => a.verse_key === v.verse_key);
                                return audio ? { ...v, audio: { ...audio, url: audio.url } } : v;
                            }));
                        }
                    });
                }
            } catch (error) {
                console.error('Error fetching surah details:', error);
            } finally {
                setIsLoadingVerses(false);
            }
        };

        fetchData();
    }, [id]);

    // Fetch details for current verse when index changes
    useEffect(() => {
        const fetchVerseDetails = async () => {
            if (verses.length === 0 || !verses[currentVerseIndex]) return;

            // If we already have the text, don't refetch
            if (verses[currentVerseIndex].text_uthmani && verses[currentVerseIndex].translations?.[0]) return;

            setIsVerseLoading(true);
            try {
                const settings = await getReciterSettings();
                const verseKey = verses[currentVerseIndex].verse_key;

                const [detailedVerse, translationText, verseAudio] = await Promise.all([
                    quranAPI.getVerse(verseKey, {
                        textType: 'uthmani',
                        translations: [85]
                    }),
                    quranAPI.getVerseTranslation(85, verseKey), // 85 = M.A.S. Abdel Haleem
                    quranAPI.getVerseAudio(verseKey, settings.reciterId)
                ]);

                if (detailedVerse) {
                    detailedVerse.audio = verseAudio || undefined;
                    if (translationText) {
                        detailedVerse.translations = [{ resource_id: 85, text: translationText }];
                    }

                    setVerses(prev => {
                        const newVerses = [...prev];
                        newVerses[currentVerseIndex] = detailedVerse;
                        return newVerses;
                    });
                }
            } catch (error) {
                console.error('Error fetching verse details:', error);
            } finally {
                setIsVerseLoading(false);
            }
        };

        fetchVerseDetails();
    }, [currentVerseIndex, verses.length]);

    // Helpers
    const togglePlay = async () => {
        let url = currentAudioUrl;
        console.log('Toggle Play. currentAudioUrl:', url);

        if (!url && verses[currentVerseIndex]) {
            console.log('Fetching audio on the fly...');
            setIsVerseLoading(true);
            try {
                const settings = await getReciterSettings();
                const audio = await quranAPI.getVerseAudio(verses[currentVerseIndex].verse_key, settings.reciterId);
                if (audio?.url) {
                    url = audio.url;
                    // Update the verse data so it's cached in state
                    setVerses(prev => {
                        const newVerses = [...prev];
                        newVerses[currentVerseIndex] = { ...newVerses[currentVerseIndex], audio };
                        return newVerses;
                    });
                }
            } catch (err) {
                console.error('Failed to fetch audio on toggle:', err);
            } finally {
                setIsVerseLoading(false);
            }
        }

        if (!url) {
            console.warn('No audio URL available for this verse');
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
            return;
        }

        if (isPlaying) {
            pause();
            setIsPlaying(false);
        } else {
            play();
            setIsPlaying(true);
        }

        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    };

    const handleNextVerse = () => {
        if (currentVerseIndex < verses.length - 1) {
            setCurrentVerseIndex(prev => prev + 1);
            // We don't call play() here; the sync effect will catch the index/URL change
            // and trigger playback because isPlaying remains true.
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }
    };

    const handlePreviousVerse = () => {
        if (currentVerseIndex > 0) {
            setCurrentVerseIndex(prev => prev - 1);
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }
    };

    const toggleAutoPlay = (enabled: boolean) => {
        setAutoPlay(enabled);
        Haptics.selectionAsync();
    };

    const toggleRepeat = () => {
        setRepeatMode(prev => {
            if (prev === 'off') return 'verse';      // off → repeat verse
            if (prev === 'verse') return 'surah';   // repeat verse → repeat surah
            return 'off';                            // repeat surah → off
        });
        Haptics.selectionAsync();
    };

    const getRepeatIcon = () => {
        switch (repeatMode) {
            case 'verse': return 'repeat.1';        // Single verse repeat
            case 'surah': return 'repeat';          // Surah repeat (with accent color)
            default: return 'repeat';               // Off (dimmed)
        }
    };

    // Calculate dynamic font size based on Arabic text length
    const getArabicFontSize = (text: string | undefined) => {
        if (!text) return { fontSize: 36, lineHeight: 56 };

        const length = text.length;

        // Scale: short verses (< 50 chars) = 42px, long verses (> 300 chars) = 24px
        if (length < 50) return { fontSize: 40, lineHeight: 66 };
        if (length < 100) return { fontSize: 38, lineHeight: 60 };
        if (length < 150) return { fontSize: 34, lineHeight: 54 };
        if (length < 200) return { fontSize: 30, lineHeight: 48 };
        if (length < 300) return { fontSize: 28, lineHeight: 44 };
        return { fontSize: 24, lineHeight: 40 };
    };

    const arabicFontStyle = getArabicFontSize(verses[currentVerseIndex]?.text_uthmani);


    const backgroundColor = useThemeColor({}, 'background');
    const textColor = useThemeColor({}, 'text');
    const accentColor = useThemeColor({}, 'accent');

    const gradientColors = resolvedTheme === 'dark'
        ? (['rgba(0,0,0,0.3)', 'rgba(0,0,0,0.1)', 'rgba(0,0,0,0.4)'] as const)
        : (['rgba(255,255,255,0.1)', 'rgba(255,255,255,0.05)', 'rgba(255,255,255,0.15)'] as const);

    const chapter = chapters.find(c => c.id.toString() === id);

    return (
        <View style={{ flex: 1, backgroundColor }}>
            <ThemedStatusBar />
            <LinearGradient
                colors={gradientColors}
                style={StyleSheet.absoluteFillObject}
            />

            {/* Back button */}
            <Pressable
                onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    router.back();
                }}
                style={{
                    position: 'absolute',
                    top: insets.top + 24,
                    left: insets.left + 16,
                    zIndex: 10,
                }}
                hitSlop={12}
            >
                <IconSymbol name="chevron.left" size={28} color={textColor} />
            </Pressable>

            {/* Verse Number Indicator */}
            {isReading && verses.length > 0 && (
                <View
                    key={`verse-num-${currentVerseIndex}`}
                    style={{
                        position: 'absolute',
                        top: insets.top + 24,
                        right: insets.right + 32,
                        // backgroundColor: resolvedTheme === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
                        // paddingHorizontal: 14,
                        // paddingVertical: 8,
                        // borderRadius: 20,
                    }}
                >
                    <Animated.Text entering={FadeIn.duration(400)} exiting={FadeOut.duration(300)} style={{ color: textColor, fontFamily: 'Tajawal-Light', fontSize: 24, opacity: 0.8 }}>
                        {currentVerseIndex + 1}
                    </Animated.Text>
                </View>
            )}

            <Stack.Toolbar placement="bottom">
                <Stack.Toolbar.Menu title="Playback Settings" icon="gearshape.fill">
                    <Stack.Toolbar.MenuAction isOn={autoPlay} onPress={() => toggleAutoPlay(true)}>
                        <Stack.Toolbar.Icon sf="forward.end.circle.fill" />
                        <Stack.Toolbar.Label>Auto-play next verse</Stack.Toolbar.Label>
                    </Stack.Toolbar.MenuAction>
                    <Stack.Toolbar.MenuAction isOn={!autoPlay} onPress={() => toggleAutoPlay(false)}>
                        <Stack.Toolbar.Icon sf="stop.circle.fill" />
                        <Stack.Toolbar.Label>Stop after each verse</Stack.Toolbar.Label>
                    </Stack.Toolbar.MenuAction>
                </Stack.Toolbar.Menu>
                <Stack.Toolbar.Spacer />
                <Stack.Toolbar.Button hidden={!isReading}
                    onPress={handlePreviousVerse}
                    icon="backward.fill"
                />
                <Stack.Toolbar.Button hidden={!isReading}
                    onPress={togglePlay}
                    icon={isPlaying ? "pause.fill" : "play.fill"}
                />
                <Stack.Toolbar.Button hidden={!isReading}
                    onPress={handleNextVerse}
                    icon="forward.fill"
                />
                <Stack.Toolbar.Spacer />
                <Stack.Toolbar.Button
                    onPress={toggleRepeat}
                    icon={getRepeatIcon()}
                    tintColor={repeatMode !== 'off' ? accentColor : textColor}
                />
            </Stack.Toolbar>

            <View style={[
                { flex: 1, alignItems: 'center', paddingHorizontal: 20 },
                isReading ? { justifyContent: 'flex-start', paddingTop: 28 } : { justifyContent: 'center' }
            ]}>
                {isLoading && !chapter ? (
                    <ActivityIndicator size="large" color={accentColor} />
                ) : chapter ? (
                    <>
                        <Animated.View layout={LinearTransition.duration(600).damping(16).easing(Easing.ease)}>
                            <Text className="text-6xl font-amiri mb-0 text-center" style={{ color: accentColor, lineHeight: 100, paddingTop: 20 }}>
                                {chapter.name_arabic}
                            </Text>
                        </Animated.View>

                        {!isReading && (
                            <Animated.View exiting={FadeOut.duration(300)} className="items-center w-full">
                                <Text className="text-3xl font-tajawal-bold text-center" style={{ color: textColor }}>
                                    {chapter.name_complex}
                                </Text>
                                <Text className="text-xl font-tajawal mt-0 text-center" style={{ color: textColor, opacity: 0.7 }}>
                                    ({chapter.translated_name.name})
                                </Text>

                                <Pressable
                                    onPress={() => {
                                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                                        setIsReading(true);
                                    }}
                                    className="mt-8 px-10 py-3 rounded-full flex justify-center items-center"
                                    style={{ backgroundColor: accentColor, borderCurve: 'continuous' }}
                                >
                                    {isLoadingVerses ? (
                                        <ActivityIndicator color="white" />
                                    ) : (
                                        <Text className="text-white text-2xl">Start</Text>
                                    )}
                                </Pressable>
                            </Animated.View>
                        )}

                        {isReading && verses.length > 0 && verses[currentVerseIndex] && (
                            <Animated.View
                                entering={FadeIn.duration(1000).delay(600)} // Reset entering for safety
                                layout={LinearTransition}
                                className="flex-1 justify-start items-center w-full px-4 mt-8"
                            >
                                <Animated.View
                                    key={`verse-${currentVerseIndex}`}
                                    entering={FadeIn.duration(600)}
                                    exiting={FadeOutLeft.duration(100)}
                                    className="items-center"
                                >
                                    <View
                                        className="mb-8 p-6 w-full items-center justify-center min-h-[150px]"
                                    // style={{ backgroundColor: resolvedTheme === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)' }}
                                    >
                                        {isVerseLoading ? (
                                            <ActivityIndicator color={textColor} />
                                        ) : (
                                            <Text
                                                className="font-amiri text-center"
                                                style={{
                                                    color: textColor,
                                                    fontSize: arabicFontStyle.fontSize,
                                                    lineHeight: arabicFontStyle.lineHeight,
                                                }}
                                            >
                                                {verses[currentVerseIndex].text_uthmani}
                                            </Text>
                                        )}
                                    </View>

                                    {!isVerseLoading && (
                                        <View className="w-full px-2">
                                            <Text className="text-xl font-tajawal-medium text-center leading-8" style={{ color: textColor, opacity: 0.9 }}>
                                                {verses[currentVerseIndex].translations?.[0]?.text?.replace(/<[^>]*>/g, '')}
                                            </Text>
                                        </View>
                                    )}
                                </Animated.View>
                            </Animated.View>
                        )}
                    </>
                ) : (
                    <Text style={{ color: textColor, fontFamily: 'Tajawal-Regular' }}>
                        Surah not found
                    </Text>
                )}
            </View>
        </View >
    );
}
