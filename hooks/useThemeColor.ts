/**
 * Returns a theme color by name. Respects both app theme (light/dark) and background preference (solid vs grain1/2/3).
 * When background is solid, uses light or dark palette. When background is a grain image, uses that grain's palette.
 */

import { Colors, type ColorSchemeKey } from '@/constants/Colors';
import { useBackground } from '@/contexts/BackgroundContext';
import { useTheme } from '@/contexts/ThemeContext';

export type ThemeColorName = keyof typeof Colors.light;

export function useThemeColor(
  props: { light?: string; dark?: string } & Partial<Record<ColorSchemeKey, string>>,
  colorName: ThemeColorName
): string {
  const { resolvedTheme } = useTheme();
  const { backgroundKey } = useBackground();

  const effectiveScheme: ColorSchemeKey =
    backgroundKey === 'solid' ? resolvedTheme : backgroundKey;

  const colorFromProps = props[effectiveScheme] ?? props[resolvedTheme];
  if (colorFromProps) {
    return colorFromProps;
  }
  return Colors[effectiveScheme][colorName];
}
