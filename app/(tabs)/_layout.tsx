import { NativeTabs } from 'expo-router/unstable-native-tabs';
import { useContext } from 'react';

import { Colors } from '@/constants/Colors';
import { ResolvedTheme, ThemeContext } from '@/contexts/ThemeContext';

export default function TabsLayout() {
  const context = useContext(ThemeContext);
  const resolvedTheme: ResolvedTheme = context?.resolvedTheme ?? 'light';

  const tabBarColors = Colors[resolvedTheme];

  return (
    <NativeTabs
      minimizeBehavior="onScrollDown"
      iconColor={tabBarColors.tabIconDefault}
      tintColor={tabBarColors.tabIconSelected}
    >
      <NativeTabs.Trigger name="index">
        <NativeTabs.Trigger.Icon sf="house.fill" />
        <NativeTabs.Trigger.Label>Home</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="track">
        <NativeTabs.Trigger.Icon sf="checkmark.circle" />
        <NativeTabs.Trigger.Label>Track</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="duas">
        <NativeTabs.Trigger.Icon sf="waveform.mid" />
        <NativeTabs.Trigger.Label>Duas</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="quran-search">
        <NativeTabs.Trigger.Icon sf="book.fill" />
        <NativeTabs.Trigger.Label>Quran</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="learn">
        <NativeTabs.Trigger.Icon sf="character.book.closed.ar" />
        <NativeTabs.Trigger.Label>Learn</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
