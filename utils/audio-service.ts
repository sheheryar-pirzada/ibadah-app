// utils/audio-service.ts
import { useAudioPlayer, useAudioPlayerStatus, AudioPlayer } from 'expo-audio';
import { useState } from 'react';

export interface AudioStatus {
  isLoaded: boolean;
  isPlaying: boolean;
  isBuffering: boolean;
  duration: number; // in milliseconds
  position: number; // in milliseconds
  playbackRate: number;
  error?: string;
}

export type PlaybackRate = 0.5 | 0.75 | 1 | 1.25 | 1.5;

export const PLAYBACK_RATES: PlaybackRate[] = [0.5, 0.75, 1, 1.25, 1.5];

/**
 * Format milliseconds to MM:SS or HH:MM:SS
 */
export function formatDuration(ms: number): string {
  if (!ms || ms <= 0) return '0:00';

  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

/**
 * Custom hook for audio playback using expo-audio
 */
export function useQuranAudio(audioUrl: string | null) {
  const player = useAudioPlayer(audioUrl || '');
  const status = useAudioPlayerStatus(player);
  const [currentRate, setCurrentRate] = useState<PlaybackRate>(1);

  const play = () => {
    if (audioUrl) {
      player.play();
    }
  };

  const pause = () => {
    player.pause();
  };

  const stop = () => {
    player.pause();
    player.seekTo(0);
  };

  const seekTo = (positionMs: number) => {
    player.seekTo(positionMs / 1000); // expo-audio uses seconds
  };

  const setPlaybackRate = (rate: PlaybackRate) => {
    setCurrentRate(rate);
    player.setPlaybackRate(rate);
  };

  const togglePlayPause = () => {
    if (status.playing) {
      pause();
    } else {
      // If audio has finished (position at or near end), seek to beginning first
      if (status.duration > 0 && status.currentTime >= status.duration - 0.1) {
        player.seekTo(0);
      }
      play();
    }
  };

  const statusAny = status as any;
  const audioStatus: AudioStatus = {
    isLoaded: !!audioUrl,
    isPlaying: status.playing,
    isBuffering: status.isBuffering,
    duration: (status.duration || 0) * 1000, // Convert to ms
    position: (status.currentTime || 0) * 1000, // Convert to ms
    playbackRate: currentRate,
    error: statusAny.error?.message,
  };

  return {
    player,
    status: audioStatus,
    play,
    pause,
    stop,
    seekTo,
    setPlaybackRate,
    togglePlayPause,
  };
}

/**
 * Global audio manager for controlling playback across the app
 * Ensures only one audio plays at a time
 */
class AudioManager {
  private static instance: AudioManager;
  private currentPlayer: AudioPlayer | null = null;
  private currentUrl: string | null = null;

  static getInstance(): AudioManager {
    if (!AudioManager.instance) {
      AudioManager.instance = new AudioManager();
    }
    return AudioManager.instance;
  }

  /**
   * Register a player as the current active player
   * Will pause any other playing audio
   */
  setActivePlayer(player: AudioPlayer, url: string): void {
    if (this.currentPlayer && this.currentPlayer !== player && this.currentUrl !== url) {
      // Pause the previous player - wrapped in try-catch because the native
      // object may have been garbage collected if the component unmounted
      try {
        this.currentPlayer.pause();
      } catch (e) {
        // Player was already disposed, ignore
      }
    }
    this.currentPlayer = player;
    this.currentUrl = url;
  }

  /**
   * Stop all audio playback
   */
  stopAll(): void {
    if (this.currentPlayer) {
      try {
        this.currentPlayer.pause();
      } catch (e) {
        // Player was already disposed, ignore
      }
      this.currentPlayer = null;
      this.currentUrl = null;
    }
  }

  /**
   * Get the currently playing URL
   */
  getCurrentUrl(): string | null {
    return this.currentUrl;
  }
}

export const audioManager = AudioManager.getInstance();
