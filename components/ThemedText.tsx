import { Text, type TextProps } from 'react-native';

import { useThemeColor } from '@/hooks/useThemeColor';

export type ThemedTextProps = TextProps & {
  lightColor?: string;
  darkColor?: string;
  type?: 'default' | 'title' | 'defaultSemiBold' | 'subtitle' | 'link';
  className?: string;
};

export function ThemedText({
  style,
  className,
  lightColor,
  darkColor,
  type = 'default',
  ...rest
}: ThemedTextProps) {
  const color = useThemeColor({ light: lightColor, dark: darkColor }, 'text');

  const typeClassName =
    type === 'title'
      ? 'text-[32px] leading-8 font-tajawal-bold'
      : type === 'subtitle'
        ? 'text-xl font-tajawal-bold'
        : type === 'defaultSemiBold'
          ? 'text-base leading-6 font-semibold'
          : type === 'link'
            ? 'text-base leading-[30px] text-[#0a7ea4]'
            : 'text-base leading-6';

  return (
    <Text
      style={[
        { color },
        style,
      ]}
      className={[typeClassName, className].filter(Boolean).join(' ')}
      {...rest}
    />
  );
}
