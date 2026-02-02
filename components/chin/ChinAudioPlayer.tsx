import AudioWaveform from '@/components/AudioWaveform';
import { useThemeColor } from '@/hooks/useThemeColor';
import {
  audioManager,
  PLAYBACK_RATES,
  PlaybackRate,
  useQuranAudio
} from '@/utils/audio-service';
import * as Haptics from 'expo-haptics';
import { Image } from 'expo-image';
import React, { useEffect, useState } from 'react';
import { LayoutChangeEvent, Pressable, Text, View } from 'react-native';
import Animated, {
  FadeIn,
  FadeOut,
  FlipInXUp,
  FlipOutXUp,
  LinearTransition
} from 'react-native-reanimated';

export interface ChinAudioMetadata {
  title: string;
  subtitle?: string;
}

interface ChinAudioPlayerProps {
  audioUrl: string | null;
  metadata?: ChinAudioMetadata;
  onClose?: () => void;
}

const WAVEFORM_HEIGHT = 24;

export default function ChinAudioPlayer({
  audioUrl,
  metadata,
  onClose,
}: ChinAudioPlayerProps) {
  const [showSpeedOptions, setShowSpeedOptions] = useState(false);
  const [waveformWidth, setWaveformWidth] = useState(0);

  const accentColor = useThemeColor({}, 'accent');

  const {
    player,
    status,
    seekTo,
    setPlaybackRate,
    togglePlayPause,
  } = useQuranAudio(audioUrl);

  const progress = status.duration > 0 ? status.position / status.duration : 0;

  useEffect(() => {
    if (status.isPlaying && audioUrl) {
      audioManager.setActivePlayer(player, audioUrl);
    }
  }, [status.isPlaying, audioUrl, player]);

  const handlePlayPause = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    togglePlayPause();
  };

  const handleSeek = (event: any) => {
    if (waveformWidth > 0 && status.duration > 0) {
      const { locationX } = event.nativeEvent;
      const seekPosition = (locationX / waveformWidth) * status.duration;
      seekTo(Math.max(0, Math.min(seekPosition, status.duration)));
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  const handleWaveformLayout = (event: LayoutChangeEvent) => {
    setWaveformWidth(event.nativeEvent.layout.width);
  };

  const handleSpeedChange = (rate: PlaybackRate) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setPlaybackRate(rate);
    setShowSpeedOptions(false);
  };

  const toggleSpeedOptions = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setShowSpeedOptions(!showSpeedOptions);
  };

  if (!audioUrl) {
    return null;
  }

  return (
    <View className="flex-1 justify-center mt-4">
      <Animated.View
        layout={LinearTransition.springify().damping(20).stiffness(200)}
        className="flex-1"
      >
        {showSpeedOptions ? (
          <Animated.View
            entering={FlipInXUp.duration(150)}
            exiting={FlipOutXUp.duration(100)}
            className="flex-1 flex-row items-center justify-center gap-3"
          >
            {/* Speed options replacing waveform */}
            <View className="flex-row gap-1 mt-2">
              {PLAYBACK_RATES.map((rate) => (
                <Pressable
                  key={rate}
                  onPress={() => handleSpeedChange(rate)}
                  className="px-2.5 pt-1.5 pb-1 rounded-xl"
                  style={
                    status.playbackRate === rate
                      ? { backgroundColor: `${accentColor}30` }
                      : undefined
                  }
                >
                  <Text
                    className="text-base font-tajawal-medium"
                    style={{
                      color: status.playbackRate === rate ? accentColor : '#e4e4e4',
                    }}
                  >
                    {rate}x
                  </Text>
                </Pressable>
              ))}
            </View>
          </Animated.View>
        ) : (
          <Animated.View
            entering={FadeIn.duration(150)}
            exiting={FadeOut.duration(100)}
            className="flex-1 justify-center gap-1"
          >
            {/* Controls Row */}
            <View className="flex-row items-center gap-2 w-[95%]">
              {/* Play Button */}
              <Pressable
                onPress={handlePlayPause}
                className="w-10 h-10 rounded-full justify-center items-center"
                style={{ backgroundColor: accentColor }}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                {/* <IconSymbol
                  name={status.isPlaying ? 'pause.fill' : 'play.fill'}
                  size={14}
                  color="#fff"
                /> */}
                <Image
                  source={status.isPlaying ? 'sf:pause.fill' : 'sf:play.fill'}
                  style={{ width: 14, aspectRatio: 1 }}
                  tintColor="#fff"
                  transition={{
                    effect: 'sf:replace'
                  }}
                />
              </Pressable>

              {/* Waveform Section */}
              <Pressable
                onPress={handleSeek}
                onLayout={handleWaveformLayout}
                className="flex-1"
                style={{ height: WAVEFORM_HEIGHT }}
              >
                {waveformWidth > 0 && (
                  <AudioWaveform
                    isPlaying={status.isPlaying}
                    progress={progress}
                    width={waveformWidth}
                    height={WAVEFORM_HEIGHT}
                    activeColor={accentColor}
                    inactiveColor="rgba(255, 255, 255, 0.2)"
                  />
                )}
              </Pressable>
            </View>

            {/* Bottom Row: Metadata + Speed */}
            <View className="px-1.5 flex-row justify-center">
              {/* {metadata ? (
                <Text
                  className="flex-1 text-sm font-tajawal-medium text-[#e4e4e4]"
                  numberOfLines={1}
                >
                  {metadata.subtitle || metadata.title}
                </Text>
              ) : (
                <View className="flex-1" />
              )} */}
              <Pressable
                onPress={toggleSpeedOptions}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Text className="text-base font-tajawal-medium text-[#e4e4e4]">
                  {status.playbackRate}x
                </Text>
              </Pressable>
            </View>
          </Animated.View>
        )}
      </Animated.View>
    </View>
  );
}
