import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import { TouchableOpacity } from 'react-native';

import { IconSymbol } from '@/components/ui/IconSymbol';
import { useThemeColor } from '@/hooks/useThemeColor';

export function SettingsHeaderButton() {
  const router = useRouter();
  const tintColor = useThemeColor({}, 'tint');

  return (
    <TouchableOpacity
      onPress={() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        router.push('/settings');
      }}
      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
    >
      <IconSymbol name="gearshape.fill" size={24} color={tintColor} />
    </TouchableOpacity>
  );
}
