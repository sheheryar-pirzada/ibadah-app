import { StatusBar, StatusBarProps } from 'expo-status-bar';
import React from 'react';

import { Colors } from '@/constants/Colors';
import { useTheme } from '@/contexts/ThemeContext';

export type ThemedStatusBarProps = Omit<StatusBarProps, 'style'> & {
  lightStyle?: StatusBarProps['style'];
  darkStyle?: StatusBarProps['style'];
};

export function ThemedStatusBar({
  lightStyle,
  darkStyle,
  ...props
}: ThemedStatusBarProps) {
  const { resolvedTheme } = useTheme();
  const style = resolvedTheme === 'light'
    ? (lightStyle || Colors.light.statusBarStyle)
    : (darkStyle || Colors.dark.statusBarStyle);

  return <StatusBar {...props} style={style} />;
}

