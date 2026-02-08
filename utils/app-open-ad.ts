import { useEffect, useRef, useState } from 'react';
import { AppState, AppStateStatus, Platform } from 'react-native';
import {
  AppOpenAd,
  AdEventType,
  TestIds,
} from 'react-native-google-mobile-ads';

const AD_UNIT_ID = __DEV__
  ? TestIds.APP_OPEN
  : 'ca-app-pub-6647730613417269/2791427594';

// Minimum time between ad shows (4 hours in milliseconds)
const MIN_AD_INTERVAL = 4 * 60 * 60 * 1000;

class AppOpenAdManager {
  private appOpenAd: AppOpenAd | null = null;
  private isShowingAd = false;
  private lastAdShownTime = 0;
  private isAdLoaded = false;

  constructor() {
    this.loadAd();
  }

  loadAd() {
    if (Platform.OS === 'web') return;

    this.appOpenAd = AppOpenAd.createForAdRequest(AD_UNIT_ID, {
      requestNonPersonalizedAdsOnly: true,
    });

    this.appOpenAd.addAdEventListener(AdEventType.LOADED, () => {
      this.isAdLoaded = true;
    });

    this.appOpenAd.addAdEventListener(AdEventType.CLOSED, () => {
      this.isShowingAd = false;
      this.isAdLoaded = false;
      // Preload next ad
      this.loadAd();
    });

    this.appOpenAd.addAdEventListener(AdEventType.ERROR, () => {
      this.isAdLoaded = false;
      this.isShowingAd = false;
    });

    this.appOpenAd.load();
  }

  canShowAd(): boolean {
    const now = Date.now();
    const timeSinceLastAd = now - this.lastAdShownTime;
    return (
      this.isAdLoaded &&
      !this.isShowingAd &&
      timeSinceLastAd >= MIN_AD_INTERVAL
    );
  }

  async showAdIfAvailable(): Promise<void> {
    if (!this.canShowAd() || !this.appOpenAd) {
      return;
    }

    try {
      this.isShowingAd = true;
      this.lastAdShownTime = Date.now();
      await this.appOpenAd.show();
    } catch (error) {
      this.isShowingAd = false;
      console.error('Error showing app open ad:', error);
    }
  }
}

export const appOpenAdManager = new AppOpenAdManager();

export function useAppOpenAd() {
  const appState = useRef(AppState.currentState);
  const hasBeenInBackground = useRef(false);

  useEffect(() => {
    if (Platform.OS === 'web') return;

    const subscription = AppState.addEventListener(
      'change',
      (nextAppState: AppStateStatus) => {
        if (nextAppState === 'background' || nextAppState === 'inactive') {
          hasBeenInBackground.current = true;
        }
        if (
          hasBeenInBackground.current &&
          appState.current.match(/inactive|background/) &&
          nextAppState === 'active'
        ) {
          appOpenAdManager.showAdIfAvailable();
        }
        appState.current = nextAppState;
      }
    );

    return () => subscription.remove();
  }, []);

  return {};
}
