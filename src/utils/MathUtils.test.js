/**
 * Tests for MathUtils
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { MathUtils } from './MathUtils.js';

describe('MathUtils', () => {
  let mathUtils;

  beforeEach(() => {
    mathUtils = new MathUtils();
  });

  describe('degToRad', () => {
    it('should convert degrees to radians correctly', () => {
      expect(mathUtils.degToRad(0)).toBeCloseTo(0);
      expect(mathUtils.degToRad(90)).toBeCloseTo(Math.PI / 2);
      expect(mathUtils.degToRad(180)).toBeCloseTo(Math.PI);
      expect(mathUtils.degToRad(360)).toBeCloseTo(2 * Math.PI);
    });

    it('should handle negative values', () => {
      expect(mathUtils.degToRad(-90)).toBeCloseTo(-Math.PI / 2);
      expect(mathUtils.degToRad(-180)).toBeCloseTo(-Math.PI);
    });
  });

  describe('radToDeg', () => {
    it('should convert radians to degrees correctly', () => {
      expect(mathUtils.radToDeg(0)).toBeCloseTo(0);
      expect(mathUtils.radToDeg(Math.PI / 2)).toBeCloseTo(90);
      expect(mathUtils.radToDeg(Math.PI)).toBeCloseTo(180);
      expect(mathUtils.radToDeg(2 * Math.PI)).toBeCloseTo(360);
    });

    it('should handle negative values', () => {
      expect(mathUtils.radToDeg(-Math.PI / 2)).toBeCloseTo(-90);
      expect(mathUtils.radToDeg(-Math.PI)).toBeCloseTo(-180);
    });
  });

  describe('normalizeAngle', () => {
    it('should normalize angles to [0, 2π) range', () => {
      expect(mathUtils.normalizeAngle(0)).toBeCloseTo(0);
      expect(mathUtils.normalizeAngle(Math.PI)).toBeCloseTo(Math.PI);
      expect(mathUtils.normalizeAngle(2 * Math.PI)).toBeCloseTo(0);
      expect(mathUtils.normalizeAngle(3 * Math.PI)).toBeCloseTo(Math.PI);
      expect(mathUtils.normalizeAngle(-Math.PI / 2)).toBeCloseTo(3 * Math.PI / 2);
    });
  });

  describe('normalizeAngleDeg', () => {
    it('should normalize angles to [0, 360) range', () => {
      expect(mathUtils.normalizeAngleDeg(0)).toBeCloseTo(0);
      expect(mathUtils.normalizeAngleDeg(180)).toBeCloseTo(180);
      expect(mathUtils.normalizeAngleDeg(360)).toBeCloseTo(0);
      expect(mathUtils.normalizeAngleDeg(540)).toBeCloseTo(180);
      expect(mathUtils.normalizeAngleDeg(-90)).toBeCloseTo(270);
    });
  });

  describe('clamp', () => {
    it('should clamp values within range', () => {
      expect(mathUtils.clamp(5, 0, 10)).toBe(5);
      expect(mathUtils.clamp(-1, 0, 10)).toBe(0);
      expect(mathUtils.clamp(15, 0, 10)).toBe(10);
    });

    it('should handle edge cases', () => {
      expect(mathUtils.clamp(0, 0, 10)).toBe(0);
      expect(mathUtils.clamp(10, 0, 10)).toBe(10);
    });
  });

  describe('lerp', () => {
    it('should linearly interpolate between values', () => {
      expect(mathUtils.lerp(0, 10, 0)).toBeCloseTo(0);
      expect(mathUtils.lerp(0, 10, 0.5)).toBeCloseTo(5);
      expect(mathUtils.lerp(0, 10, 1)).toBeCloseTo(10);
    });

    it('should handle values outside [0, 1] range', () => {
      expect(mathUtils.lerp(0, 10, -0.5)).toBeCloseTo(-5);
      expect(mathUtils.lerp(0, 10, 1.5)).toBeCloseTo(15);
    });
  });

  describe('map', () => {
    it('should map values from one range to another', () => {
      expect(mathUtils.map(5, 0, 10, 0, 100)).toBeCloseTo(50);
      expect(mathUtils.map(0, 0, 10, 0, 100)).toBeCloseTo(0);
      expect(mathUtils.map(10, 0, 10, 0, 100)).toBeCloseTo(100);
    });

    it('should handle values outside input range', () => {
      expect(mathUtils.map(-5, 0, 10, 0, 100)).toBeCloseTo(-50);
      expect(mathUtils.map(15, 0, 10, 0, 100)).toBeCloseTo(150);
    });
  });

  describe('distance', () => {
    it('should calculate Euclidean distance between points', () => {
      expect(mathUtils.distance(0, 0, 3, 4)).toBeCloseTo(5);
      expect(mathUtils.distance(1, 2, 4, 6)).toBeCloseTo(5);
    });

    it('should handle zero distance', () => {
      expect(mathUtils.distance(0, 0, 0, 0)).toBeCloseTo(0);
      expect(mathUtils.distance(5, 5, 5, 5)).toBeCloseTo(0);
    });
  });

  describe('distance3D', () => {
    it('should calculate 3D Euclidean distance between points', () => {
      expect(mathUtils.distance3D(0, 0, 0, 1, 2, 2)).toBeCloseTo(3);
      expect(mathUtils.distance3D(1, 2, 3, 4, 6, 9)).toBeCloseTo(7);
    });

    it('should handle zero distance', () => {
      expect(mathUtils.distance3D(0, 0, 0, 0, 0, 0)).toBeCloseTo(0);
      expect(mathUtils.distance3D(5, 5, 5, 5, 5, 5)).toBeCloseTo(0);
    });
  });

  describe('random', () => {
    it('should generate random numbers within range', () => {
      const min = 5;
      const max = 10;
      
      for (let i = 0; i < 100; i++) {
        const value = mathUtils.random(min, max);
        expect(value).toBeGreaterThanOrEqual(min);
        expect(value).toBeLessThanOrEqual(max);
      }
    });

    it('should handle single argument as max value', () => {
      const max = 10;
      
      for (let i = 0; i < 100; i++) {
        const value = mathUtils.random(max);
        expect(value).toBeGreaterThanOrEqual(0);
        expect(value).toBeLessThanOrEqual(max);
      }
    });
  });

  describe('randomInt', () => {
    it('should generate random integers within range', () => {
      const min = 5;
      const max = 10;
      
      for (let i = 0; i < 100; i++) {
        const value = mathUtils.randomInt(min, max);
        expect(Number.isInteger(value)).toBe(true);
        expect(value).toBeGreaterThanOrEqual(min);
        expect(value).toBeLessThan(max);
      }
    });
  });

  describe('randomBool', () => {
    it('should generate random boolean values', () => {
      let trueCount = 0;
      let falseCount = 0;
      
      for (let i = 0; i < 1000; i++) {
        const value = mathUtils.randomBool();
        if (value) {
          trueCount++;
        } else {
          falseCount++;
        }
      }
      
      // Should be roughly 50/50 distribution
      expect(trueCount).toBeGreaterThan(400);
      expect(falseCount).toBeGreaterThan(400);
    });
  });

  describe('gaussianRandom', () => {
    it('should generate random numbers with Gaussian distribution', () => {
      const values = [];
      
      for (let i = 0; i < 1000; i++) {
        values.push(mathUtils.gaussianRandom());
      }
      
      // Calculate mean and standard deviation
      const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
      const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
      const stdDev = Math.sqrt(variance);
      
      // Mean should be close to 0
      expect(Math.abs(mean)).toBeLessThan(0.1);
      
      // Standard deviation should be close to 1
      expect(Math.abs(stdDev - 1)).toBeLessThan(0.2);
    });
  });

  describe('smoothstep', () => {
    it('should interpolate smoothly between 0 and 1', () => {
      expect(mathUtils.smoothstep(0)).toBeCloseTo(0);
      expect(mathUtils.smoothstep(0.5)).toBeCloseTo(0.5);
      expect(mathUtils.smoothstep(1)).toBeCloseTo(1);
    });

    it('should clamp values outside [0, 1] range', () => {
      expect(mathUtils.smoothstep(-0.5)).toBeCloseTo(0);
      expect(mathUtils.smoothstep(1.5)).toBeCloseTo(1);
    });
  });

  describe('smootherstep', () => {
    it('should interpolate with smoother curve between 0 and 1', () => {
      expect(mathUtils.smootherstep(0)).toBeCloseTo(0);
      expect(mathUtils.smootherstep(0.5)).toBeCloseTo(0.5);
      expect(mathUtils.smootherstep(1)).toBeCloseTo(1);
    });

    it('should clamp values outside [0, 1] range', () => {
      expect(mathUtils.smootherstep(-0.5)).toBeCloseTo(0);
      expect(mathUtils.smootherstep(1.5)).toBeCloseTo(1);
    });
  });

  describe('almostEqual', () => {
    it('should determine if numbers are almost equal', () => {
      expect(mathUtils.almostEqual(1.0, 1.0)).toBe(true);
      expect(mathUtils.almostEqual(1.0, 1.0000001)).toBe(true);
      expect(mathUtils.almostEqual(1.0, 1.1)).toBe(false);
    });

    it('should use custom epsilon', () => {
      expect(mathUtils.almostEqual(1.0, 1.05, 0.1)).toBe(true);
      expect(mathUtils.almostEqual(1.0, 1.05, 0.01)).toBe(false);
    });
  });
});