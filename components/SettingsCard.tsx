import { BlurView } from 'expo-blur';
import React from 'react';
import { StyleSheet, View, type ViewProps } from 'react-native';

import { useBackground } from '@/contexts/BackgroundContext';
import { useThemeColor } from '@/hooks/useThemeColor';

const BLUR_INTENSITY = 20;

export type SettingsCardProps = ViewProps & {
  children: React.ReactNode;
};

/**
 * Card container for settings rows. Styles according to the user's background preference:
 * - Solid background: opaque card with theme cardBackground and border.
 * - Grain background: BlurView (frosted glass) with border so the grain image shows through.
 */
export function SettingsCard({ children, className, style, ...viewProps }: SettingsCardProps) {
  const { backgroundKey } = useBackground();
  const cardBackground = useThemeColor({}, 'cardBackground');
  const cardBorder = useThemeColor({}, 'cardBorder');
  const blurTint = useThemeColor({}, 'blurTint');

  const isSolidBackground = backgroundKey === 'solid';

  const containerStyle = {
    borderRadius: 24,
    marginBottom: 16,
    overflow: 'hidden' as const,
    borderCurve: 'continuous' as const,
    borderWidth: 0.2,
    borderColor: cardBorder,
    ...(isSolidBackground && { backgroundColor: cardBackground }),
  };

  return (
    <View
      className={className}
      style={[containerStyle, style]}
      {...viewProps}
    >
      {isSolidBackground ? (
        children
      ) : (
        <>
          <BlurView
            intensity={BLUR_INTENSITY}
            tint={blurTint}
            style={StyleSheet.absoluteFill}
          />
          <View style={styles.content}>{children}</View>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
    paddingVertical: 6,
    paddingHorizontal: 4,
  },
});
