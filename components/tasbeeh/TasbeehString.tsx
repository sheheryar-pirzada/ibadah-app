import { Group, Path, type SkPath } from '@shopify/react-native-skia';
import { useColorScheme } from 'react-native';
import { STRING_CONFIG, TASBEEH_COLORS } from '@/constants/tasbeeh';

interface TasbeehStringProps {
  path: SkPath;
}

export function TasbeehString({ path }: TasbeehStringProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const stringColor = isDark ? TASBEEH_COLORS.string.dark : TASBEEH_COLORS.string.light;

  return (
    <Group>
      {/* Shadow layer - offset and blurred */}
      <Path
        path={path}
        style="stroke"
        strokeWidth={STRING_CONFIG.strokeWidth + 2}
        color={TASBEEH_COLORS.string.shadow}
        strokeCap="round"
        transform={[{ translateX: 2 }, { translateY: STRING_CONFIG.shadowOffset }]}
      />

      {/* Main string rope */}
      <Path
        path={path}
        style="stroke"
        strokeWidth={STRING_CONFIG.strokeWidth}
        color={stringColor}
        strokeCap="round"
      />

      {/* Subtle highlight on top edge */}
      <Path
        path={path}
        style="stroke"
        strokeWidth={1.5}
        color={TASBEEH_COLORS.string.highlight}
        strokeCap="round"
        transform={[{ translateY: -1 }]}
      />
    </Group>
  );
}
