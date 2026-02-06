import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ThemedBlurView } from '@/components/ThemedBlurView';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { useLocation } from '@/hooks/useLocation';
import { ARQiblaView, isSupported, TrackingState } from '@/modules/ar-qibla';

function getTrackingMessage(state: TrackingState): string {
  switch (state) {
    case 'initializing':
      return 'Initializing AR...';
    case 'normal':
      return 'AR tracking active';
    case 'excessiveMotion':
      return 'Move device slower';
    case 'insufficientFeatures':
      return 'Point at a textured surface';
    case 'relocalizing':
      return 'Relocalizing...';
    case 'notAvailable':
      return 'AR not available';
    default:
      return 'Tracking...';
  }
}

export default function QiblaARScreen() {
  const insets = useSafeAreaInsets();
  const { loc, qibla } = useLocation();
  const [trackingState, setTrackingState] =
    useState<TrackingState>('initializing');

  const arSupported = Platform.OS === 'ios' && isSupported();
  // Only use qibla from useLocation once we have a position (avoids initial 0)
  const qiblaBearing = loc != null ? qibla : null;

  const handleClose = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.back();
  };

  if (!arSupported) {
    return (
      <View
        style={[
          styles.container,
          {
            paddingTop: insets.top,
            paddingBottom: insets.bottom,
            paddingLeft: insets.left,
            paddingRight: insets.right,
          },
        ]}
      >
        <View style={styles.unsupportedContainer}>
          <IconSymbol name="exclamationmark.triangle" size={48} color="#fff" />
          <Text style={styles.unsupportedTitle}>AR Not Supported</Text>
          <Text style={styles.unsupportedText}>
            Your device does not support ARKit. Please use a compatible iOS
            device.
          </Text>
          <Pressable style={styles.backButton} onPress={handleClose}>
            <Text style={styles.backButtonText}>Go Back</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ARQiblaView
        style={StyleSheet.absoluteFill}
        qiblaBearing={qiblaBearing ?? 0}
        isActive={qiblaBearing != null}
        onTrackingStateChange={setTrackingState}
      />

      {/* Top overlay */}
      <View
        style={[
          styles.topOverlay,
          {
            paddingTop: insets.top,
            paddingLeft: insets.left,
            paddingRight: insets.right,
          },
        ]}
      >
        <View style={styles.topRow}>
          <ThemedBlurView intensity={80} style={styles.bearingCircle}>
            <Text style={styles.bearingValueSmall}>
              {qibla.toFixed(1)}°
            </Text>
          </ThemedBlurView>
          <Pressable onPress={handleClose} hitSlop={10} style={styles.closeButton}>
            <IconSymbol name="xmark.circle.fill" size={32} color="#fff" />
          </Pressable>
        </View>
      </View>

      {/* Bottom overlay */}
      <View
        style={[
          styles.bottomOverlay,
          {
            paddingBottom: insets.bottom,
            paddingLeft: insets.left,
            paddingRight: insets.right,
          },
        ]}
      >
        <ThemedBlurView intensity={80} style={styles.bottomBar}>
          <View style={styles.titleContainer}>
            <Text style={styles.title}>Qibla Direction</Text>
            <Text style={styles.subtitle}>
              {getTrackingMessage(trackingState)}
            </Text>
          </View>
        </ThemedBlurView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  unsupportedContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  unsupportedTitle: {
    color: '#fff',
    fontSize: 24,
    fontFamily: 'Tajawal-Bold',
    marginTop: 20,
    marginBottom: 12,
  },
  unsupportedText: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
  },
  backButton: {
    marginTop: 32,
    paddingHorizontal: 32,
    paddingVertical: 14,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 24,
  },
  backButtonText: {
    color: '#fff',
    fontSize: 16,
  },
  topOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginHorizontal: 16,
    marginVertical: 0,
  },
  bearingCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  bearingValueSmall: {
    color: '#fff',
    fontSize: 20,
  },
  closeButton: {
    alignSelf: 'center',
  },
  titleContainer: {
    alignItems: 'center',
  },
  title: {
    color: '#fff',
    fontSize: 18,
    fontFamily: 'Tajawal-Bold',
  },
  subtitle: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 12,
    fontFamily: 'Tajawal-Regular',
    marginTop: 2,
  },
  bottomOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  bottomBar: {
    margin: 16,
    borderRadius: 24,
    overflow: 'hidden',
    paddingHorizontal: 20,
    paddingVertical: 12,
    alignItems: 'center',
  },
});
