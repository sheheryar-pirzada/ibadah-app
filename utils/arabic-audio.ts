// utils/arabic-audio.ts
import * as Speech from 'expo-speech';
import { useCallback, useEffect, useState } from 'react';

/**
 * Hook for playing Arabic audio using native text-to-speech
 * Uses the device's built-in Arabic voice for reliable pronunciation
 */
export function useArabicAudio() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentText, setCurrentText] = useState<string | null>(null);

  // Check if speech is still playing
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (isPlaying) {
      interval = setInterval(async () => {
        const speaking = await Speech.isSpeakingAsync();
        if (!speaking) {
          setIsPlaying(false);
          setCurrentText(null);
        }
      }, 100);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isPlaying]);

  const playArabic = useCallback(async (text: string) => {
    // Stop any currently playing speech
    await Speech.stop();

    setCurrentText(text);
    setIsPlaying(true);

    Speech.speak(text, {
      language: 'ar',
      rate: 0.8, // Slightly slower for learning
      onDone: () => {
        setIsPlaying(false);
        setCurrentText(null);
      },
      onError: () => {
        setIsPlaying(false);
        setCurrentText(null);
      },
    });
  }, []);

  const stop = useCallback(async () => {
    await Speech.stop();
    setIsPlaying(false);
    setCurrentText(null);
  }, []);

  return {
    playArabic,
    stop,
    isPlaying,
    isBuffering: false, // Native TTS doesn't buffer
    currentText,
  };
}
