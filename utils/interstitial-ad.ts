import { useCallback, useEffect, useRef, useState } from 'react';
import { Platform } from 'react-native';
import {
  InterstitialAd,
  AdEventType,
  TestIds,
} from 'react-native-google-mobile-ads';

const AD_UNIT_ID = __DEV__
  ? TestIds.INTERSTITIAL
  : 'ca-app-pub-6647730613417269/5043214084';

// Show ad every N interactions (e.g., every 3 "next" presses)
const AD_FREQUENCY = 3;

export function useInterstitialAd() {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isShowing, setIsShowing] = useState(false);
  const interactionCount = useRef(0);
  const adRef = useRef<InterstitialAd | null>(null);

  const loadAd = useCallback(() => {
    if (Platform.OS === 'web') return;

    const interstitial = InterstitialAd.createForAdRequest(AD_UNIT_ID, {
      requestNonPersonalizedAdsOnly: true,
    });

    const unsubscribeLoaded = interstitial.addAdEventListener(
      AdEventType.LOADED,
      () => {
        setIsLoaded(true);
      }
    );

    const unsubscribeClosed = interstitial.addAdEventListener(
      AdEventType.CLOSED,
      () => {
        setIsShowing(false);
        setIsLoaded(false);
        // Preload next ad
        loadAd();
      }
    );

    const unsubscribeError = interstitial.addAdEventListener(
      AdEventType.ERROR,
      () => {
        setIsLoaded(false);
        setIsShowing(false);
      }
    );

    interstitial.load();
    adRef.current = interstitial;

    return () => {
      unsubscribeLoaded();
      unsubscribeClosed();
      unsubscribeError();
    };
  }, []);

  useEffect(() => {
    const cleanup = loadAd();
    return cleanup;
  }, [loadAd]);

  const showAdIfReady = useCallback(async (): Promise<boolean> => {
    if (Platform.OS === 'web') return false;

    interactionCount.current += 1;

    // Only show ad every AD_FREQUENCY interactions
    if (interactionCount.current % AD_FREQUENCY !== 0) {
      return false;
    }

    if (!isLoaded || isShowing || !adRef.current) {
      return false;
    }

    try {
      setIsShowing(true);
      await adRef.current.show();
      return true;
    } catch (error) {
      setIsShowing(false);
      console.error('Error showing interstitial ad:', error);
      return false;
    }
  }, [isLoaded, isShowing]);

  return {
    isLoaded,
    isShowing,
    showAdIfReady,
  };
}
