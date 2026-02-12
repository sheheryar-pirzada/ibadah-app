import { NativeTabs } from 'expo-router/unstable-native-tabs';
import { useContext } from 'react';

import { Colors, type ColorSchemeKey } from '@/constants/Colors';
import { BackgroundContext } from '@/contexts/BackgroundContext';
import { ResolvedTheme, ThemeContext } from '@/contexts/ThemeContext';

export default function TabsLayout() {
  const context = useContext(ThemeContext);
  const resolvedTheme: ResolvedTheme = context?.resolvedTheme ?? 'light';

  const bgContext = useContext(BackgroundContext);
  const backgroundKey = bgContext?.backgroundKey ?? 'solid';
  const effectiveScheme: ColorSchemeKey = backgroundKey === 'solid' ? resolvedTheme : backgroundKey;

  const tabBarColors = Colors[effectiveScheme];

  return (
    <NativeTabs
      minimizeBehavior="onScrollDown"
      iconColor={tabBarColors.tabIconDefault}
      tintColor={backgroundKey === 'solid' ? tabBarColors.tabIconSelected : 'white'}
    >
      <NativeTabs.Trigger name="index">
        <NativeTabs.Trigger.Icon sf="house.fill" />
        <NativeTabs.Trigger.Label hidden>Home</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="track">
        <NativeTabs.Trigger.Icon sf="checkmark.circle" />
        <NativeTabs.Trigger.Label hidden>Track</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="duas">
        <NativeTabs.Trigger.Icon sf="waveform.mid" />
        <NativeTabs.Trigger.Label hidden>Duas</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="quran-search">
        <NativeTabs.Trigger.Icon sf="book.fill" />
        <NativeTabs.Trigger.Label hidden>Quran</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="learn">
        <NativeTabs.Trigger.Icon sf="character.book.closed.ar" />
        <NativeTabs.Trigger.Label hidden>Learn</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
