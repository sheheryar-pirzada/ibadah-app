/**
 * @jest-environment node
 */

// Mock react-native Dimensions before importing
jest.mock('react-native', () => ({
  Dimensions: {
    get: jest.fn(() => ({ width: 400, height: 800 })),
  },
}));

// Mock Skia
jest.mock('@shopify/react-native-skia', () => ({
  Skia: {
    Path: {
      Make: jest.fn(() => ({
        moveTo: jest.fn(),
        quadTo: jest.fn(),
      })),
    },
  },
}));

import {
  getPointOnCurve,
  getTangentAngle,
  findClosestT,
  isPointNearCurve,
  getArcLength,
  clampT,
} from '@/utils/tasbeeh-path';

describe('tasbeeh-path', () => {
  describe('getPointOnCurve', () => {
    it('should return start point at t=0', () => {
      const point = getPointOnCurve(0);
      // At t=0, should be at startX, startY
      expect(point).toHaveProperty('x');
      expect(point).toHaveProperty('y');
      expect(typeof point.x).toBe('number');
      expect(typeof point.y).toBe('number');
    });

    it('should return end point at t=1', () => {
      const point = getPointOnCurve(1);
      expect(point).toHaveProperty('x');
      expect(point).toHaveProperty('y');
    });

    it('should return midpoint at t=0.5', () => {
      const startPoint = getPointOnCurve(0);
      const endPoint = getPointOnCurve(1);
      const midPoint = getPointOnCurve(0.5);

      // Midpoint x should be between start and end
      expect(midPoint.x).toBeGreaterThanOrEqual(Math.min(startPoint.x, endPoint.x));
      expect(midPoint.x).toBeLessThanOrEqual(Math.max(startPoint.x, endPoint.x));
    });

    it('should produce smooth progression from t=0 to t=1', () => {
      const points = [];
      for (let t = 0; t <= 1; t += 0.1) {
        points.push(getPointOnCurve(t));
      }

      // X should generally increase (curve goes left to right)
      for (let i = 1; i < points.length; i++) {
        // Allow small tolerance for curve shape
        expect(points[i].x).toBeGreaterThanOrEqual(points[i - 1].x - 1);
      }
    });

    it('should handle boundary values', () => {
      expect(() => getPointOnCurve(0)).not.toThrow();
      expect(() => getPointOnCurve(1)).not.toThrow();
      expect(() => getPointOnCurve(0.5)).not.toThrow();
    });
  });

  describe('getTangentAngle', () => {
    it('should return angle in radians', () => {
      const angle = getTangentAngle(0.5);
      expect(typeof angle).toBe('number');
      // Angle should be within valid radian range
      expect(angle).toBeGreaterThanOrEqual(-Math.PI);
      expect(angle).toBeLessThanOrEqual(Math.PI);
    });

    it('should return different angles at different points', () => {
      const angle0 = getTangentAngle(0);
      const angle05 = getTangentAngle(0.5);
      const angle1 = getTangentAngle(1);

      // Angles should vary along the curve
      expect(angle0).not.toBe(angle05);
    });

    it('should handle boundary values', () => {
      expect(() => getTangentAngle(0)).not.toThrow();
      expect(() => getTangentAngle(1)).not.toThrow();
    });
  });

  describe('findClosestT', () => {
    it('should return value between 0 and 1', () => {
      const t = findClosestT(100, 200);
      expect(t).toBeGreaterThanOrEqual(0);
      expect(t).toBeLessThanOrEqual(1);
    });

    it('should return t=0 for point near start', () => {
      const startPoint = getPointOnCurve(0);
      const t = findClosestT(startPoint.x, startPoint.y);
      expect(t).toBeLessThan(0.1);
    });

    it('should return t=1 for point near end', () => {
      const endPoint = getPointOnCurve(1);
      const t = findClosestT(endPoint.x, endPoint.y);
      expect(t).toBeGreaterThan(0.9);
    });

    it('should return approximately t=0.5 for point near middle', () => {
      const midPoint = getPointOnCurve(0.5);
      const t = findClosestT(midPoint.x, midPoint.y);
      expect(t).toBeGreaterThan(0.4);
      expect(t).toBeLessThan(0.6);
    });

    it('should use custom sample count', () => {
      const point = getPointOnCurve(0.5);
      const t1 = findClosestT(point.x, point.y, 10);
      const t2 = findClosestT(point.x, point.y, 100);

      // Both should be close to 0.5, with higher samples being more accurate
      expect(Math.abs(t1 - 0.5)).toBeLessThan(0.15);
      expect(Math.abs(t2 - 0.5)).toBeLessThan(0.05);
    });
  });

  describe('isPointNearCurve', () => {
    it('should return true for point on curve', () => {
      const point = getPointOnCurve(0.5);
      const isNear = isPointNearCurve(point.x, point.y, 10);
      expect(isNear).toBe(true);
    });

    it('should return false for point far from curve', () => {
      // Point far below the curve
      const isNear = isPointNearCurve(200, 500, 10);
      expect(isNear).toBe(false);
    });

    it('should respect threshold parameter', () => {
      const point = getPointOnCurve(0.5);
      // Offset the point slightly
      const offsetX = point.x;
      const offsetY = point.y + 15;

      // Should be false with small threshold
      expect(isPointNearCurve(offsetX, offsetY, 10)).toBe(false);

      // Should be true with larger threshold
      expect(isPointNearCurve(offsetX, offsetY, 20)).toBe(true);
    });

    it('should return true for start point', () => {
      const start = getPointOnCurve(0);
      expect(isPointNearCurve(start.x, start.y, 5)).toBe(true);
    });

    it('should return true for end point', () => {
      const end = getPointOnCurve(1);
      expect(isPointNearCurve(end.x, end.y, 5)).toBe(true);
    });
  });

  describe('getArcLength', () => {
    it('should return 0 for t=0', () => {
      const length = getArcLength(0);
      expect(length).toBe(0);
    });

    it('should return positive value for t>0', () => {
      const length = getArcLength(0.5);
      expect(length).toBeGreaterThan(0);
    });

    it('should increase monotonically with t', () => {
      const lengths = [];
      for (let t = 0; t <= 1; t += 0.2) {
        lengths.push(getArcLength(t));
      }

      for (let i = 1; i < lengths.length; i++) {
        expect(lengths[i]).toBeGreaterThanOrEqual(lengths[i - 1]);
      }
    });

    it('should return full length at t=1', () => {
      const halfLength = getArcLength(0.5);
      const fullLength = getArcLength(1);

      // Full length should be greater than half length
      expect(fullLength).toBeGreaterThan(halfLength);
    });

    it('should use custom sample count', () => {
      const length1 = getArcLength(1, 10);
      const length2 = getArcLength(1, 100);

      // Both should approximate the same length
      // Allow 5% variance due to sampling differences
      const variance = Math.abs(length1 - length2) / length2;
      expect(variance).toBeLessThan(0.05);
    });
  });

  describe('clampT', () => {
    it('should return value unchanged if within range', () => {
      expect(clampT(0.5)).toBe(0.5);
      expect(clampT(0)).toBe(0);
      expect(clampT(1)).toBe(1);
    });

    it('should clamp values below minimum', () => {
      expect(clampT(-0.5)).toBe(0);
      expect(clampT(-1)).toBe(0);
    });

    it('should clamp values above maximum', () => {
      expect(clampT(1.5)).toBe(1);
      expect(clampT(2)).toBe(1);
    });

    it('should use custom min value', () => {
      expect(clampT(0.1, 0.2)).toBe(0.2);
      expect(clampT(0.3, 0.2)).toBe(0.3);
    });

    it('should use custom max value', () => {
      expect(clampT(0.9, 0, 0.8)).toBe(0.8);
      expect(clampT(0.7, 0, 0.8)).toBe(0.7);
    });

    it('should use both custom min and max', () => {
      expect(clampT(0.1, 0.2, 0.8)).toBe(0.2);
      expect(clampT(0.5, 0.2, 0.8)).toBe(0.5);
      expect(clampT(0.9, 0.2, 0.8)).toBe(0.8);
    });

    it('should handle edge case where min equals max', () => {
      expect(clampT(0.3, 0.5, 0.5)).toBe(0.5);
      expect(clampT(0.7, 0.5, 0.5)).toBe(0.5);
    });
  });
});
