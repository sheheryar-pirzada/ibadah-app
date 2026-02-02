import * as Haptics from 'expo-haptics';
import { Image } from 'expo-image';
import { Alert, Pressable, Text, View } from 'react-native';

import { ThemedBlurView } from '@/components/ThemedBlurView';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { TASBEEH_TARGETS } from '@/constants/tasbeeh';
import { useThemeColor } from '@/hooks/useThemeColor';
import { useTasbeehStore } from './store';

interface TasbeehControlsProps {
  onTargetSelect?: () => void;
}

export function TasbeehControls({ onTargetSelect }: TasbeehControlsProps) {
  const { reset, currentCount, setTarget, currentTarget, hapticEnabled, toggleHaptic } =
    useTasbeehStore();

  const textColor = useThemeColor({}, 'text');
  const textMuted = useThemeColor({}, 'textMuted');
  const accentColor = useThemeColor({}, 'accent');
  const cardBorder = useThemeColor({}, 'cardBorder');

  const handleReset = () => {
    if (currentCount > 0) {
      Alert.alert(
        'Reset Counter',
        `Are you sure you want to reset? You've counted ${currentCount} so far.`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Reset',
            style: 'destructive',
            onPress: () => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              reset();
            },
          },
        ]
      );
    } else {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  const handleTargetChange = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    // Cycle through targets
    const currentIndex = TASBEEH_TARGETS.indexOf(currentTarget);
    const nextIndex = (currentIndex + 1) % TASBEEH_TARGETS.length;
    const nextTarget = TASBEEH_TARGETS[nextIndex];

    if (currentCount > 0) {
      Alert.alert(
        'Change Target',
        `Changing target will reset your current count (${currentCount}). Continue?`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Change',
            onPress: () => setTarget(nextTarget),
          },
        ]
      );
    } else {
      setTarget(nextTarget);
    }
  };

  const handleHapticToggle = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    toggleHaptic();
  };

  return (
    <View className="flex-row justify-center gap-4 mx-4 pb-16">
      {/* Reset button */}
      <Pressable onPress={handleReset}>
        <ThemedBlurView
          intensity={25}
          className="rounded-full overflow-hidden"
          style={{
            borderWidth: 0.5,
            borderColor: cardBorder,
          }}
        >
          <View className="p-4">
            <Image
              tintColor={textColor}
              source="sf:arrow.counterclockwise"
              style={{ width: 24, aspectRatio: 1 }}
              sfEffect={{ effect: 'rotate' }}
              transition={{ duration: 1, }}
            />
          </View>
        </ThemedBlurView>
      </Pressable>

      {/* Target selector */}
      <Pressable onPress={handleTargetChange}>
        <ThemedBlurView
          intensity={25}
          className="rounded-full overflow-hidden"
          style={{
            borderWidth: 0.5,
            borderColor: cardBorder,
          }}
        >
          <View className="px-6 py-4 flex-row items-center gap-2">
            <IconSymbol name="target" size={20} color={accentColor} />
            <Text
              className="text-lg"
              style={{ color: accentColor }}
            >
              {currentTarget}
            </Text>
          </View>
        </ThemedBlurView>
      </Pressable>

      {/* Haptic toggle */}
      <Pressable onPress={handleHapticToggle}>
        <ThemedBlurView
          intensity={25}
          className="rounded-full overflow-hidden"
          style={{
            borderWidth: 0.5,
            borderColor: cardBorder,
          }}
        >
          <View className="p-4">
            <Image
              tintColor={hapticEnabled ? accentColor : String(textMuted)}
              source={
                hapticEnabled
                  ? 'sf:iphone.gen3.radiowaves.left.and.right'
                  : 'sf:iphone.gen3.slash'
              }
              style={{ width: 24, aspectRatio: 1 }}
              sfEffect={{ effect: 'draw/on' }}
              transition={{
                duration: 1,
                effect: hapticEnabled ? 'sf:down-up' : 'sf:replace',
              }}
            />
          </View>
        </ThemedBlurView>
      </Pressable>
    </View>
  );
}
