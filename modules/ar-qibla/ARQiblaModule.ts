import { Platform, requireOptionalNativeModule } from 'expo-modules-core';

// Only require native module on iOS, and avoid hard crash if missing
const ARQiblaModule =
  Platform.OS === 'ios' ? requireOptionalNativeModule('ARQiblaModule') : null;

/**
 * Check if ARKit is supported on this device
 */
export function isSupported(): boolean {
  if (Platform.OS !== 'ios' || !ARQiblaModule) {
    return false;
  }
  return ARQiblaModule.isSupported();
}

export default ARQiblaModule;
