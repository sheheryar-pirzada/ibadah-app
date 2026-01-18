import AudioWaveform from '@/components/AudioWaveform';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { useThemeColor } from '@/hooks/useThemeColor';
import {
  audioManager,
  formatDuration,
  PLAYBACK_RATES,
  PlaybackRate,
  useQuranAudio,
} from '@/utils/audio-service';
import * as Haptics from 'expo-haptics';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  LayoutChangeEvent,
  Pressable,
  StyleSheet,
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
      <View style={[styles.container, compact && styles.containerCompact]}>
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
      <View style={styles.compactContainer}>
        <Pressable
          onPress={handlePlayPause}
          style={[styles.playButtonCompact, { backgroundColor: accentColor }]}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          {status.isBuffering ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <IconSymbol
              name={status.isPlaying ? 'pause.fill' : 'play.fill'}
              size={12}
              color="#fff"
            />
          )}
        </Pressable>
        {status.isPlaying && (
          <Text style={[styles.compactTime, { color: textMuted }]}>
            {formatDuration(status.position)}
          </Text>
        )}
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Main Controls */}
      <View style={styles.controls}>
        {/* Play/Pause Button */}
        <Pressable
          onPress={handlePlayPause}
          style={[styles.playButton, { backgroundColor: accentColor }]}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          {status.isBuffering ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <IconSymbol
              name={status.isPlaying ? 'pause.fill' : 'play.fill'}
              size={16}
              color="#fff"
            />
          )}
        </Pressable>

        {/* Waveform Section */}
        <View style={styles.waveformSection}>
          {/* Time Display */}
          <View style={styles.timeRow}>
            <Text style={[styles.timeText, { color: textMuted }]}>
              {formatDuration(status.position)}
            </Text>
            <Text style={[styles.timeText, { color: textMuted }]}>
              {formatDuration(status.duration)}
            </Text>
          </View>

          {/* Waveform */}
          <Pressable
            onPress={handleSeek}
            onLayout={handleWaveformLayout}
            style={styles.waveformContainer}
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
          style={styles.speedButton}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Text style={[styles.speedText, { color: textMuted }]}>
            {status.playbackRate}x
          </Text>
        </Pressable>
      </View>

      {/* Speed Options */}
      {showSpeedOptions && (
        <View style={[styles.speedOptions, { borderTopColor: dividerColor }]}>
          {PLAYBACK_RATES.map((rate) => (
            <Pressable
              key={rate}
              onPress={() => handleSpeedChange(rate)}
              style={[
                styles.speedOption,
                status.playbackRate === rate && {
                  backgroundColor: `${accentColor}20`,
                },
              ]}
            >
              <Text
                style={[
                  styles.speedOptionText,
                  { color: status.playbackRate === rate ? accentColor : textColor },
                ]}
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

const styles = StyleSheet.create({
  container: {
    paddingVertical: 8,
  },
  containerCompact: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  loadingText: {
    fontSize: 12,
    fontFamily: 'Tajawal-Regular',
    marginLeft: 8,
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  playButton: {
    width: 30,
    height: 40,
    borderRadius: 28,
    justifyContent: 'center',
    borderCurve: 'continuous',
    alignItems: 'center',
  },
  playButtonCompact: {
    width: 22,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  waveformSection: {
    flex: 1,
    gap: 4,
  },
  waveformContainer: {
    height: WAVEFORM_HEIGHT,
  },
  timeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  timeText: {
    fontSize: 11,
    fontFamily: 'Tajawal-Regular',
  },
  speedButton: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  speedText: {
    fontSize: 12,
    fontFamily: 'Tajawal-Medium',
  },
  speedOptions: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
  },
  speedOption: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  speedOptionText: {
    fontSize: 13,
    fontFamily: 'Tajawal-Medium',
  },
  compactContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  compactTime: {
    fontSize: 11,
    fontFamily: 'Tajawal-Regular',
  },
});
