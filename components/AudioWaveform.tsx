import React, { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  cancelAnimation,
  useAnimatedProps,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Path } from 'react-native-svg';

const AnimatedPath = Animated.createAnimatedComponent(Path);

const SAMPLES = 200;
const WAVE_CYCLES = 6;
const AMP_SCALE = 0.28;
const SPEED_MS = 1000;

type Props = {
  progress: number; // 0..1
  width: number;
  height: number;
  activeColor: string;
  inactiveColor: string;
  isPlaying: boolean;
};

export default function SmoothGeneratedWave({
  progress,
  width,
  height,
  activeColor,
  inactiveColor,
  isPlaying,
}: Props) {
  const phase = useSharedValue(0);

  useEffect(() => {
    if (isPlaying) {
      // Start or restart when playback begins
      phase.value = 0;
      phase.value = withRepeat(
        withTiming(1, { duration: SPEED_MS, easing: Easing.linear }),
        -1,
        false
      );
    } else {
      // Freeze on pause
      cancelAnimation(phase);
    }
  }, [isPlaying, phase]);

  const inactiveProps = useAnimatedProps(() => {
    'worklet';

    const w = width;
    const h = height;
    if (w <= 0 || h <= 0) return { d: '' };

    const centerY = h / 2;
    const maxAmp = h * AMP_SCALE;

    const twoPi = 2 * Math.PI;
    const phaseOffset = phase.value * twoPi;

    const n = SAMPLES;
    const dx = w / (n - 1);

    let xPrev = 0;
    let yPrev =
      centerY +
      Math.sin(twoPi * (WAVE_CYCLES * 0) + phaseOffset) * maxAmp;

    let d = `M ${xPrev} ${yPrev}`;

    for (let i = 1; i < n; i++) {
      const x = i * dx;
      const u = x / w;
      const y =
        centerY +
        Math.sin(twoPi * (WAVE_CYCLES * u) + phaseOffset) * maxAmp;

      const xMid = (xPrev + x) / 2;
      const yMid = (yPrev + y) / 2;

      d += ` Q ${xPrev} ${yPrev} ${xMid} ${yMid}`;

      xPrev = x;
      yPrev = y;
    }

    d += ` T ${xPrev} ${yPrev}`;
    return { d };
  });

  const activeProps = useAnimatedProps(() => {
    'worklet';

    const w = width;
    const h = height;
    if (w <= 0 || h <= 0) return { d: '' };

    const p = progress < 0 ? 0 : progress > 1 ? 1 : progress;
    const clipX = w * p;

    const centerY = h / 2;
    const maxAmp = h * AMP_SCALE;

    const twoPi = 2 * Math.PI;
    const phaseOffset = phase.value * twoPi;

    const n = SAMPLES;
    const dx = w / (n - 1);

    let xPrev = 0;
    let yPrev =
      centerY +
      Math.sin(twoPi * (WAVE_CYCLES * 0) + phaseOffset) * maxAmp;

    let d = `M ${xPrev} ${yPrev}`;

    for (let i = 1; i < n; i++) {
      const x = i * dx;
      if (x > clipX) break;

      const u = x / w;
      const y =
        centerY +
        Math.sin(twoPi * (WAVE_CYCLES * u) + phaseOffset) * maxAmp;

      const xMid = (xPrev + x) / 2;
      const yMid = (yPrev + y) / 2;

      d += ` Q ${xPrev} ${yPrev} ${xMid} ${yMid}`;

      xPrev = x;
      yPrev = y;
    }

    d += ` T ${xPrev} ${yPrev}`;
    return { d };
  });

  return (
    <View style={[styles.container, { width, height }]}>
      <Svg width={width} height={height} style={StyleSheet.absoluteFill}>
        <AnimatedPath
          animatedProps={inactiveProps}
          stroke={inactiveColor}
          strokeWidth={2.25}
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity={0.45}
        />
        <AnimatedPath
          animatedProps={activeProps}
          stroke={activeColor}
          strokeWidth={2.75}
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { overflow: 'hidden' },
});
