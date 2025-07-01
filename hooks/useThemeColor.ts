/**
 * Learn more about light and dark modes:
 * https://docs.expo.dev/guides/color-schemes/
 */

import { Colors } from '../constants/Colors.js';
import { useColorScheme } from './useColorScheme.js';

export function getThemeColor(
  theme: 'light' | 'dark',
  props: { light?: string; dark?: string },
  colorName: keyof typeof Colors.light & keyof typeof Colors.dark
) {
  const colorFromProps = props[theme];
  return colorFromProps ?? Colors[theme][colorName];
}

export function useThemeColor(
  props: { light?: string; dark?: string },
  colorName: keyof typeof Colors.light & keyof typeof Colors.dark
) {
  const theme = useColorScheme() ?? 'light';
  return getThemeColor(theme, props, colorName);
}
