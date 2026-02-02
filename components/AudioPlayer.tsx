import AudioWaveform from '@/components/AudioWaveform';
import { useThemeColor } from '@/hooks/useThemeColor';
import {
  audioManager,
  formatDuration,
  PLAYBACK_RATES,
  PlaybackRate,
  useQuranAudio,
} from '@/utils/audio-service';
import * as Haptics from 'expo-haptics';
import { Image } from 'expo-image';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  LayoutChangeEvent,
  Pressable,
  Text,
  View,
} from 'react-native';

interface AudioPlayerProps {
  audioUrl: string | null;
  isLoading?: boolean;
  onLoadError?: (error: string) => void;
  compact?: boolean;
}

const WAVEFORM_HEIGHT = 32;

export default function AudioPlayer({
  audioUrl,
  isLoading = false,
  onLoadError,
  compact = false,
}: AudioPlayerProps) {
  const [showSpeedOptions, setShowSpeedOptions] = useState(false);
  const [waveformWidth, setWaveformWidth] = useState(0);

  const textColor = useThemeColor({}, 'text');
  const textMuted = useThemeColor({}, 'textMuted');
  const accentColor = useThemeColor({}, 'accent');
  const dividerColor = useThemeColor({}, 'divider');

  const {
    player,
    status,
    seekTo,
    setPlaybackRate,
    togglePlayPause,
  } = useQuranAudio(audioUrl);

  // Calculate progress
  const progress = status.duration > 0 ? status.position / status.duration : 0;

  // Register with audio manager when playing
  useEffect(() => {
    if (status.isPlaying && audioUrl) {
      audioManager.setActivePlayer(player, audioUrl);
    }
  }, [status.isPlaying, audioUrl, player]);

  // Report errors
  useEffect(() => {
    if (status.error && onLoadError) {
      onLoadError(status.error);
    }
  }, [status.error, onLoadError]);

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

  // Show loading state
  if (isLoading) {
    return (
      <View className={compact ? 'flex-row items-center gap-2' : 'py-2'}>
        <ActivityIndicator size="large" color={accentColor} />
      </View>
    );
  }

  // Show error or no audio state
  if (!audioUrl) {
    return null;
  }

  if (compact) {
    return (
      <View className="flex-row items-center gap-2">
        <Pressable
          onPress={handlePlayPause}
          className="w-[22px] h-[32px] rounded-2xl justify-center items-center"
          style={{ backgroundColor: accentColor }}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Image
            source={status.isPlaying ? 'sf:pause.fill' : 'sf:play.fill'}
            style={{ width: 12, aspectRatio: 1 }}
            tintColor="#fff"
            transition={{
              effect: 'sf:replace'
            }}
          />
        </Pressable>
        {status.isPlaying && (
          <Text className="text-[11px] font-sans" style={{ color: textMuted }}>
            {formatDuration(status.position)}
          </Text>
        )}
      </View>
    );
  }

  return (
    <View className="py-2">
      {/* Main Controls */}
      <View className="flex-row items-center gap-3">
        {/* Play/Pause Button */}
        <Pressable
          onPress={handlePlayPause}
          className="w-[30px] h-[40px] rounded-[28px] justify-center items-center"
          style={{ backgroundColor: accentColor, borderCurve: 'continuous' as const }}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
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
        <View className="flex-1 gap-1">
          {/* Time Display */}
          <View className="flex-row justify-between">
            <Text className="text-[11px] font-sans" style={{ color: textMuted }}>
              {formatDuration(status.position)}
            </Text>
            <Text className="text-[11px] font-sans" style={{ color: textMuted }}>
              {formatDuration(status.duration)}
            </Text>
          </View>

          {/* Waveform */}
          <Pressable
            onPress={handleSeek}
            onLayout={handleWaveformLayout}
            className="h-8"
          >
            {waveformWidth > 0 && (
              <AudioWaveform
                isPlaying={status.isPlaying}
                progress={progress}
                width={waveformWidth}
                height={WAVEFORM_HEIGHT}
                activeColor={accentColor}
                inactiveColor={dividerColor}
              />
            )}
          </Pressable>
        </View>

        {/* Speed Button */}
        <Pressable
          onPress={toggleSpeedOptions}
          className="px-2 py-1"
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Text className="text-xs font-tajawal-medium" style={{ color: textMuted }}>
            {status.playbackRate}x
          </Text>
        </Pressable>
      </View>

      {/* Speed Options */}
      {showSpeedOptions && (
        <View className="flex-row justify-center gap-2 mt-3 pt-3 border-t" style={{ borderTopColor: dividerColor }}>
          {PLAYBACK_RATES.map((rate) => (
            <Pressable
              key={rate}
              onPress={() => handleSpeedChange(rate)}
              className="px-3 py-1.5 rounded-xl"
              style={status.playbackRate === rate ? { backgroundColor: `${accentColor}20` } : undefined}
            >
              <Text
                className="text-[13px] font-tajawal-medium"
                style={{ color: status.playbackRate === rate ? accentColor : textColor }}
              >
                {rate}x
              </Text>
            </Pressable>
          ))}
        </View>
      )}
    </View>
  );
}
