// Fallback for using MaterialIcons on Android and web.

import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { SymbolViewProps } from 'expo-symbols';
import { ComponentProps } from 'react';
import { OpaqueColorValue, type StyleProp, type TextStyle } from 'react-native';

type IconMapping = Record<string, ComponentProps<typeof MaterialIcons>['name']>;

export type IconSymbolName = SymbolViewProps['name'];

/**
 * Add your SF Symbols to Material Icons mappings here.
 * - see Material Icons in the [Icons Directory](https://icons.expo.fyi).
 * - see SF Symbols in the [SF Symbols](https://developer.apple.com/sf-symbols/) app.
 */
const MAPPING: IconMapping = {
  // Navigation
  'house.fill': 'home',
  'chevron.left': 'chevron-left',
  'chevron.right': 'chevron-right',
  'chevron.up': 'expand-less',
  'chevron.down': 'expand-more',
  'chevron.left.forwardslash.chevron.right': 'code',
  'arrow.left': 'arrow-back',

  // Actions
  'paperplane.fill': 'send',
  'checkmark': 'check',
  'checkmark.circle.fill': 'check-circle',
  'arrow.clockwise': 'refresh',

  // Favorites
  'heart.fill': 'favorite',
  'heart': 'favorite-border',

  // Analytics
  'chart.bar.fill': 'bar-chart',
  'arrow.up.right': 'trending-up',
  'arrow.down.right': 'trending-down',

  // Weather/Time of day (for prayer times)
  'sun.max.fill': 'wb-sunny',
  'cloud.sun.fill': 'wb-cloudy',
  'moon.fill': 'nights-stay',

  // Audio
  'play.fill': 'play-arrow',
  'pause.fill': 'pause',
  'speaker.wave.2': 'volume-up',
  'speaker.wave.2.fill': 'volume-up',

  // Search
  'magnifyingglass': 'search',
  'xmark.circle.fill': 'cancel',
  'book.fill': 'menu-book',

  // Share
  'square.and.arrow.up': 'share',
};

/**
 * An icon component that uses native SF Symbols on iOS, and Material Icons on Android and web.
 * This ensures a consistent look across platforms, and optimal resource usage.
 * Icon `name`s are based on SF Symbols and require manual mapping to Material Icons.
 */
export function IconSymbol({
  name,
  size = 24,
  color,
  style,
}: {
  name: IconSymbolName;
  size?: number;
  color: string | OpaqueColorValue;
  style?: StyleProp<TextStyle>;
  weight?: string;
}) {
  const mappedName = MAPPING[name as string] || 'help-outline';
  return <MaterialIcons color={color} size={size} name={mappedName} style={style} />;
}
