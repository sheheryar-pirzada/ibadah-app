import { Platform, requireNativeViewManager } from 'expo-modules-core';
import React, { useCallback } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { ARQiblaViewProps, TrackingState } from './ARQiblaView.types';

// Get native view only on iOS, and avoid hard crash if missing
type NativeARQiblaViewProps = Omit<ARQiblaViewProps, 'onTrackingStateChange'> & {
  onTrackingStateChange?: (event: { nativeEvent: { state: TrackingState } }) => void;
};

let NativeARQiblaView: React.ComponentType<NativeARQiblaViewProps> | null = null;

if (Platform.OS === 'ios') {
  try {
    NativeARQiblaView =
      requireNativeViewManager<NativeARQiblaViewProps>('ARQiblaModule');
  } catch {
    NativeARQiblaView = null;
  }
}

export function ARQiblaView({
  qiblaBearing,
  isActive = true,
  onTrackingStateChange,
  style,
  ...props
}: ARQiblaViewProps) {
  // Platform guard
  if (Platform.OS !== 'ios' || !NativeARQiblaView) {
    return (
      <View style={[styles.unsupported, style]} {...props}>
        <Text style={styles.unsupportedText}>
          AR Qibla is only available on iOS devices with ARKit support
        </Text>
      </View>
    );
  }

  const handleTrackingStateChange = useCallback(
    (event: { nativeEvent: { state: TrackingState } }) => {
      onTrackingStateChange?.(event.nativeEvent.state);
    },
    [onTrackingStateChange]
  );

  return (
    <NativeARQiblaView
      style={style}
      qiblaBearing={qiblaBearing}
      isActive={isActive}
      onTrackingStateChange={handleTrackingStateChange}
      {...props}
    />
  );
}

const styles = StyleSheet.create({
  unsupported: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
  },
  unsupportedText: {
    color: '#fff',
    textAlign: 'center',
    padding: 20,
    fontSize: 16,
  },
});
