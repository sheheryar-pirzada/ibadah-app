import { Icon, Label, NativeTabs } from 'expo-router/unstable-native-tabs';

import { Colors } from '@/constants/Colors';
import { useTheme } from '@/contexts/ThemeContext';

export default function TabsLayout() {
  const { resolvedTheme } = useTheme();

  const tabBarColors = Colors[resolvedTheme];

  return (
    <NativeTabs
      minimizeBehavior="onScrollDown"
      iconColor={tabBarColors.tabIconDefault}
      tintColor={tabBarColors.tabIconSelected}
      
    >
      <NativeTabs.Trigger name="index">
        <Icon sf="clock" />
        <Label>Prayer Times</Label>
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="track">
        <Icon sf="checkmark.circle" />
        <Label>Track</Label>
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="duas">
        <Icon sf="waveform.mid" />
        <Label>Duas</Label>
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="quran-search">
        <Icon sf="book.fill" />
        <Label>Quran</Label>
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="learn">
        <Icon sf="character.book.closed.ar" />
        <Label>Learn</Label>
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
