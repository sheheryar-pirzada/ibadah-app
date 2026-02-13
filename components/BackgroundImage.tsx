import { ImageBackground, type ImageProps } from 'expo-image';
import React from 'react';
import { View, type ViewProps } from 'react-native';

import { useBackground } from '@/contexts/BackgroundContext';
import { useThemeColor } from '@/hooks/useThemeColor';
import {
  getBackgroundImageSource,
} from '@/utils/background-settings';

export type BackgroundImageProps = ViewProps & {
  /**
   * When provided, overrides the user's preference and uses this image as the background.
   * When omitted, uses the app preference: solid (theme color) or the selected grain image.
   */
  source?: ImageProps['source'];
  /** How the image is resized. Defaults to "cover". Only used when showing an image. */
  contentFit?: ImageProps['contentFit'];
  /** Optional blurhash for the image. */
  placeholder?: ImageProps['placeholder'];
};

/**
 * Full-screen background component. Uses the user's background preference from context:
 * - "solid" → theme background color (light/dark).
 * - "grain1" | "grain2" | "grain3" → the corresponding grain image.
 * Pass `source` to override and always show a specific image instead of the preference.
 *
 * Must be used within BackgroundProvider and ThemeProvider.
 */
export function BackgroundImage({
  source: sourceOverride,
  contentFit = 'cover',
  placeholder,
  children,
  className,
  style,
  ...viewProps
}: BackgroundImageProps) {
  const { backgroundKey } = useBackground();
  const themeBackground = useThemeColor({}, 'background');

  const imageSource = sourceOverride ?? getBackgroundImageSource(backgroundKey);
  const useSolid = backgroundKey === 'solid' && sourceOverride == null;

  return (
    <View className={className} style={[{ flex: 1 }, style]} {...viewProps}>
      {useSolid ? (
        <View
          style={[
            { flex: 1, position: 'absolute', left: 0, right: 0, top: 0, bottom: 0 },
            { backgroundColor: themeBackground },
          ]}
        />
      ) : imageSource != null ? (
        <ImageBackground
          source={imageSource}
          contentFit={contentFit}
          placeholder={placeholder}
          cachePolicy="memory-disk"
          transition={500}
          style={{ flex: 1, position: 'absolute', left: 0, right: 0, top: 0, bottom: 0 }}
        />
      ) : (
        <View
          style={[
            { flex: 1, position: 'absolute', left: 0, right: 0, top: 0, bottom: 0 },
            { backgroundColor: themeBackground },
          ]}
        />
      )}
      {children}
    </View>
  );
}
