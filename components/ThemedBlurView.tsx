import { BlurView, BlurViewProps } from 'expo-blur';
import React from 'react';

import { Colors } from '@/constants/Colors';
import { useTheme } from '@/contexts/ThemeContext';

export type ThemedBlurViewProps = Omit<BlurViewProps, 'tint'> & {
  lightTint?: BlurViewProps['tint'];
  darkTint?: BlurViewProps['tint'];
};

export function ThemedBlurView({
  lightTint,
  darkTint,
  ...props
}: ThemedBlurViewProps) {
  const { resolvedTheme } = useTheme();
  const tint = resolvedTheme === 'light' 
    ? (lightTint || Colors.light.blurTint)
    : (darkTint || Colors.dark.blurTint);

  return <BlurView {...props} tint={tint} />;
}

