import {
  Circle,
  Group,
  RadialGradient,
  Shadow,
  vec,
} from '@shopify/react-native-skia';
import { useDerivedValue, type SharedValue } from 'react-native-reanimated';
import { BEAD_CONFIG, TASBEEH_COLORS } from '@/constants/tasbeeh';
import { getPointOnCurve } from '@/utils/tasbeeh-path';

interface TasbeehBeadProps {
  /** Position on curve (0-1) - can be static number or animated SharedValue */
  t: number | SharedValue<number>;
  /** Whether this is the active draggable bead */
  isActive?: boolean;
  /** Optional scale multiplier for visual hierarchy */
  scale?: number;
  /** Optional opacity for fade effects */
  opacity?: number | SharedValue<number>;
}

export function TasbeehBead({
  t,
  isActive = false,
  scale = 1,
  opacity,
}: TasbeehBeadProps) {
  const beadSize = BEAD_CONFIG.size * scale;
  const radius = beadSize / 2;

  // Derive position from t value (works for both static and animated)
  const position = useDerivedValue(() => {
    const tValue = typeof t === 'number' ? t : t.value;
    return getPointOnCurve(tValue);
  });

  // Transform to center bead on the curve point
  const transform = useDerivedValue(() => {
    return [
      { translateX: position.value.x },
      { translateY: position.value.y },
    ];
  });

  const derivedOpacity = useDerivedValue(() => {
    if (opacity == null) return 1;
    return typeof opacity === 'number' ? opacity : opacity.value;
  });

  // Pearl colors for gradient effect
  const pearlWhite = '#FAF9F6';
  const pearlPink = '#F5E6E0';
  const pearlShadow = '#D4C4B0';

  return (
    <Group transform={transform} opacity={derivedOpacity}>
      {/* Drop shadow */}
      <Circle cx={0} cy={3} r={radius * 0.9} color="rgba(0,0,0,0.25)">
        <Shadow dx={0} dy={2} blur={6} color="rgba(0,0,0,0.3)" />
      </Circle>

      {/* Main bead body with pearl gradient */}
      <Circle cx={0} cy={0} r={radius}>
        <RadialGradient
          c={vec(-radius * 0.3, -radius * 0.3)}
          r={radius * 1.8}
          colors={[pearlWhite, pearlPink, pearlShadow]}
          positions={[0, 0.5, 1]}
        />
      </Circle>

      {/* Highlight reflection */}
      <Circle
        cx={-radius * 0.25}
        cy={-radius * 0.25}
        r={radius * 0.35}
        color="rgba(255,255,255,0.7)"
      />

      {/* Small secondary highlight */}
      <Circle
        cx={radius * 0.2}
        cy={radius * 0.15}
        r={radius * 0.12}
        color="rgba(255,255,255,0.4)"
      />

      {/* Subtle inner shadow for depth */}
      <Circle
        cx={0}
        cy={radius * 0.1}
        r={radius * 0.85}
        color="transparent"
        style="stroke"
        strokeWidth={radius * 0.15}
      >
        <RadialGradient
          c={vec(0, -radius)}
          r={radius * 2}
          colors={['transparent', 'rgba(180,160,140,0.15)']}
          positions={[0.5, 1]}
        />
      </Circle>

      {/* Active bead indicator - subtle glow */}
      {isActive && (
        <Circle cx={0} cy={0} r={radius + 4} color="rgba(212,175,55,0.3)" />
      )}
    </Group>
  );
}
