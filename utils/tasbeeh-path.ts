import { Skia, SkPath } from '@shopify/react-native-skia';
import { STRING_CONFIG } from '@/constants/tasbeeh';

/**
 * Creates a Skia Path for the tasbeeh string
 * This is a quadratic bezier curve from left to right with a gentle downward arc
 */
export function createStringPath(): SkPath {
  const path = Skia.Path.Make();
  const { startX, startY, endX, endY, controlX, controlY } = STRING_CONFIG;

  path.moveTo(startX, startY);
  path.quadTo(controlX, controlY, endX, endY);

  return path;
}

/**
 * Get a point on the quadratic bezier curve at parameter t (0 to 1)
 * t=0 is start (bottom-left), t=1 is end (top-right)
 *
 * Quadratic bezier formula: B(t) = (1-t)^2 * P0 + 2(1-t)t * P1 + t^2 * P2
 */
export function getPointOnCurve(t: number): { x: number; y: number } {
  'worklet';
  const { startX, startY, endX, endY, controlX, controlY } = STRING_CONFIG;

  const oneMinusT = 1 - t;
  const oneMinusTSquared = oneMinusT * oneMinusT;
  const tSquared = t * t;

  const x = oneMinusTSquared * startX + 2 * oneMinusT * t * controlX + tSquared * endX;
  const y = oneMinusTSquared * startY + 2 * oneMinusT * t * controlY + tSquared * endY;

  return { x, y };
}

/**
 * Get the tangent angle at point t on the curve
 * Useful for rotating beads to follow the string direction
 */
export function getTangentAngle(t: number): number {
  'worklet';
  const { startX, startY, endX, endY, controlX, controlY } = STRING_CONFIG;

  // Derivative of quadratic bezier
  const dx = 2 * (1 - t) * (controlX - startX) + 2 * t * (endX - controlX);
  const dy = 2 * (1 - t) * (controlY - startY) + 2 * t * (endY - controlY);

  return Math.atan2(dy, dx);
}

/**
 * Find the closest t value on the curve to a given point (px, py)
 * Uses sampling to find the minimum distance
 */
export function findClosestT(px: number, py: number, samples: number = 80): number {
  'worklet';
  let closestT = 0;
  let minDistanceSquared = Infinity;

  for (let i = 0; i <= samples; i++) {
    const t = i / samples;
    const point = getPointOnCurve(t);
    // Use squared distance to avoid sqrt (faster)
    const distanceSquared = (point.x - px) * (point.x - px) + (point.y - py) * (point.y - py);

    if (distanceSquared < minDistanceSquared) {
      minDistanceSquared = distanceSquared;
      closestT = t;
    }
  }

  return closestT;
}

/**
 * Check if a point is within a certain distance of the curve
 * Useful for detecting if user touched near a bead
 */
export function isPointNearCurve(px: number, py: number, threshold: number): boolean {
  'worklet';
  const t = findClosestT(px, py, 50);
  const point = getPointOnCurve(t);
  const distance = Math.sqrt((point.x - px) * (point.x - px) + (point.y - py) * (point.y - py));
  return distance <= threshold;
}

/**
 * Get the approximate arc length from t=0 to t=targetT
 * Useful for even spacing of beads
 */
export function getArcLength(targetT: number, samples: number = 40): number {
  'worklet';
  let length = 0;
  let prevPoint = getPointOnCurve(0);

  for (let i = 1; i <= samples; i++) {
    const t = (i / samples) * targetT;
    const point = getPointOnCurve(t);
    length += Math.sqrt(
      (point.x - prevPoint.x) * (point.x - prevPoint.x) +
        (point.y - prevPoint.y) * (point.y - prevPoint.y)
    );
    prevPoint = point;
  }

  return length;
}

/**
 * Clamp a t value to valid range and optionally to a minimum
 * Prevents beads from going backwards past their resting position
 */
export function clampT(t: number, minT: number = 0, maxT: number = 1): number {
  'worklet';
  return Math.max(minT, Math.min(maxT, t));
}
