import { Image, type ImageProps } from 'expo-image';
import React from 'react';
import { View, type ViewProps } from 'react-native';

const DEFAULT_SOURCE = require('@/assets/backgrounds/grain1.jpg');

export type BackgroundImageProps = ViewProps & {
  /** Image source. Defaults to grain1.jpg. */
  source?: ImageProps['source'];
  /** How the image is resized. Defaults to "cover". */
  contentFit?: ImageProps['contentFit'];
  /** Optional blurhash for the image. */
  placeholder?: ImageProps['placeholder'];
};

/**
 * Full-screen background image component. Renders the image in an absolute layer
 * behind children. Use as a wrapper around screen content.
 *
 * @example
 * <BackgroundImage>
 *   <ScrollView>...</ScrollView>
 * </BackgroundImage>
 *
 * @example With custom image
 * <BackgroundImage source={require('@/assets/backgrounds/other.jpg')} />
 */
export function BackgroundImage({
  source = DEFAULT_SOURCE,
  contentFit = 'cover',
  placeholder,
  children,
  className,
  style,
  ...viewProps
}: BackgroundImageProps) {
  return (
    <View className={className} style={[{ flex: 1 }, style]} {...viewProps}>
      <Image
        source={source}
        contentFit={contentFit}
        placeholder={placeholder}
        style={{ flex: 1, position: 'absolute', inset: 0 }}
      />
      {children}
    </View>
  );
}
