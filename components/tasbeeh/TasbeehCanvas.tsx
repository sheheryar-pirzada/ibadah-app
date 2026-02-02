import { Canvas } from '@shopify/react-native-skia';
import * as Haptics from 'expo-haptics';
import { useMemo, useCallback, useEffect } from 'react';
import { StyleSheet } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  runOnJS,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

import { ANIMATION_CONFIG, BEAD_CONFIG } from '@/constants/tasbeeh';
import { createStringPath, findClosestT, getPointOnCurve, clampT } from '@/utils/tasbeeh-path';
import { TasbeehString } from './TasbeehString';
import { TasbeehBead } from './TasbeehBead';
import { useTasbeehStore } from './store';

// Position where counted beads rest on the right side
const RIGHT_SIDE_T = 0.95;
// Maximum beads to show on right side before they "fall off"
const MAX_RIGHT_BEADS = 3;

interface TasbeehCanvasProps {
  onCount?: () => void;
  onTargetReached?: () => void;
}

export function TasbeehCanvas({ onCount, onTargetReached }: TasbeehCanvasProps) {
  // Store
  const { increment, hapticEnabled, currentCount } = useTasbeehStore();

  // Create the string path (memoized)
  const stringPath = useMemo(() => createStringPath(), []);

  // Animation shared values
  const activeBeadT = useSharedValue(BEAD_CONFIG.restingStartT);
  const activeBeadOpacity = useSharedValue(1);
  const isDragging = useSharedValue(false);
  const hasCountedThisDrag = useSharedValue(false);

  // Reset active bead position when count resets (target reached)
  useEffect(() => {
    if (currentCount === 0) {
      activeBeadT.value = BEAD_CONFIG.restingStartT;
      activeBeadOpacity.value = 1;
    }
  }, [currentCount]);

  // Haptic feedback
  const triggerHaptic = useCallback(() => {
    if (hapticEnabled) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
  }, [hapticEnabled]);

  // Reset active bead to starting position
  const resetActiveBead = useCallback(() => {
    activeBeadT.value = withSpring(BEAD_CONFIG.restingStartT, ANIMATION_CONFIG.spring);
  }, []);

  // Handle counting
  const handleCount = useCallback(() => {
    const targetReached = increment();
    onCount?.();
    if (targetReached) {
      // Extra haptic for completion
      if (hapticEnabled) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
      onTargetReached?.();
    }
    // NOTE: Don't reset the draggable bead here.
    // We want to show a natural "release" on the right, then snap it back to the left in the gesture end.
  }, [increment, hapticEnabled, onCount, onTargetReached]);

  // Pan gesture for dragging beads
  const panGesture = Gesture.Pan()
    .onBegin((event) => {
      'worklet';
      // Check if touch is near the active bead
      const currentPos = getPointOnCurve(activeBeadT.value);
      const distance = Math.sqrt(
        (currentPos.x - event.x) ** 2 + (currentPos.y - event.y) ** 2
      );

      // Only start drag if within touch distance of bead
      if (distance < BEAD_CONFIG.size * 1.5) {
        isDragging.value = true;
        hasCountedThisDrag.value = false;
        activeBeadOpacity.value = 1;
      }
    })
    .onUpdate((event) => {
      'worklet';
      if (!isDragging.value) return;

      // Find closest point on curve to touch position
      const newT = findClosestT(event.x, event.y);

      // Clamp to valid range (can only move forward, not backward past reset position)
      activeBeadT.value = clampT(newT, BEAD_CONFIG.resetPositionT, 1);

      // Check if crossed counting threshold
      if (
        activeBeadT.value >= BEAD_CONFIG.countingThresholdT &&
        !hasCountedThisDrag.value
      ) {
        hasCountedThisDrag.value = true;
        runOnJS(triggerHaptic)();
        runOnJS(handleCount)();

        // Commit this bead: stop tracking the drag.
        // so the user sees a "static" counted bead on the right (rendered from currentCount)
        // and then, on release, the draggable bead will snap back to the left.
        isDragging.value = false;
      }
    })
    .onEnd(() => {
      'worklet';
      isDragging.value = false;

      // If this drag counted, show a short "release/settle" on the right, then teleport back to the left.
      if (hasCountedThisDrag.value) {
        // Fade out in-place (no settling), then reset to the left and show again.
        activeBeadOpacity.value = withTiming(0, { duration: 160 }, (fadeFinished) => {
          if (fadeFinished) {
            activeBeadT.value = BEAD_CONFIG.restingStartT;
            activeBeadOpacity.value = 1;
          }
        });
        return;
      }

      // Otherwise, spring back smoothly.
      activeBeadOpacity.value = 1;
      activeBeadT.value = withSpring(
        BEAD_CONFIG.restingStartT,
        ANIMATION_CONFIG.spring
      );
    })
    .onFinalize(() => {
      'worklet';
      isDragging.value = false;
    });

  // Generate static bead positions on the LEFT (queue waiting to be dragged)
  const leftStaticBeadPositions = useMemo(() => {
    const positions: number[] = [];
    // Static beads are positioned before the draggable bead
    for (let i = 0; i < BEAD_CONFIG.count - 1; i++) {
      positions.push(BEAD_CONFIG.staticBeadsStartT + i * BEAD_CONFIG.spacing);
    }
    return positions;
  }, []);

  // Generate positions for counted beads on the RIGHT side
  const rightBeadPositions = useMemo(() => {
    const positions: number[] = [];
    // Show up to MAX_RIGHT_BEADS on the right side
    const beadsToShow = Math.min(currentCount, MAX_RIGHT_BEADS);
    for (let i = 0; i < beadsToShow; i++) {
      // Stack them slightly apart on the right
      positions.push(RIGHT_SIDE_T - i * 0.03);
    }
    return positions;
  }, [currentCount]);

  return (
    <GestureDetector gesture={panGesture}>
      <Animated.View style={styles.container}>
        <Canvas style={styles.canvas}>
          {/* Render the string rope */}
          <TasbeehString path={stringPath} />

          {/* Right side beads (counted, static) */}
          {rightBeadPositions.map((t, index) => (
            <TasbeehBead
              key={`right-${index}`}
              t={t}
              scale={0.85 - index * 0.03}
              isActive={false}
            />
          ))}

          {/* Left side static beads (queue, slightly smaller) */}
          {leftStaticBeadPositions.map((t, index) => (
            <TasbeehBead
              key={`left-${index}`}
              t={t}
              scale={0.85 - index * 0.05}
              isActive={false}
            />
          ))}

          {/* Active draggable bead (front, largest) */}
          <TasbeehBead t={activeBeadT} opacity={activeBeadOpacity} isActive scale={1} />
        </Canvas>
      </Animated.View>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  canvas: {
    flex: 1,
  },
});
