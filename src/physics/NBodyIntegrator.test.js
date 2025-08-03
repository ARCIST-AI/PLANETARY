/**
 * Tests for NBodyIntegrator
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { NBodyIntegrator } from './NBodyIntegrator.js';

describe('NBodyIntegrator', () => {
  let integrator;

  beforeEach(() => {
    integrator = new NBodyIntegrator();
  });

  describe('constructor', () => {
    it('should create an instance with default configuration', () => {
      expect(integrator).toBeInstanceOf(NBodyIntegrator);
      expect(integrator.G).toBe(6.67430e-11);
      expect(integrator.softening).toBe(0);
      expect(integrator.method).toBe('rk4');
    });

    it('should create an instance with custom configuration', () => {
      const config = {
        G: 1.0,
        softening: 0.1,
        method: 'euler'
      };
      
      const customIntegrator = new NBodyIntegrator(config);
      expect(customIntegrator.G).toBe(1.0);
      expect(customIntegrator.softening).toBe(0.1);
      expect(customIntegrator.method).toBe('euler');
    });
  });

  describe('calculateAcceleration', () => {
    it('should calculate gravitational acceleration between two bodies', () => {
      const bodies = [
        {
          mass: 1e10,
          position: { x: 0, y: 0, z: 0 },
          velocity: { x: 0, y: 0, z: 0 }
        },
        {
          mass: 1e5,
          position: { x: 10, y: 0, z: 0 },
          velocity: { x: 0, y: 0, z: 0 }
        }
      ];
      
      const accelerations = integrator.calculateAcceleration(bodies);
      
      // First body should accelerate toward second body
      expect(accelerations[0].x).toBeGreaterThan(0);
      expect(accelerations[0].y).toBeCloseTo(0);
      expect(accelerations[0].z).toBeCloseTo(0);
      
      // Second body should accelerate toward first body
      expect(accelerations[1].x).toBeLessThan(0);
      expect(accelerations[1].y).toBeCloseTo(0);
      expect(accelerations[1].z).toBeCloseTo(0);
      
      // Acceleration should follow Newton's law of gravitation
      const expectedAccel = integrator.G * bodies[1].mass / 100; // F = G * m1 * m2 / r^2, a = F / m1
      expect(accelerations[0].x).toBeCloseTo(expectedAccel);
    });

    it('should handle softening to prevent singularities', () => {
      const bodies = [
        {
          mass: 1e10,
          position: { x: 0, y: 0, z: 0 },
          velocity: { x: 0, y: 0, z: 0 }
        },
        {
          mass: 1e5,
          position: { x: 0.01, y: 0, z: 0 },
          velocity: { x: 0, y: 0, z: 0 }
        }
      ];
      
      // Without softening
      const accelerations1 = integrator.calculateAcceleration(bodies);
      
      // With softening
      integrator.softening = 0.1;
      const accelerations2 = integrator.calculateAcceleration(bodies);
      
      // Softening should reduce acceleration magnitude
      expect(Math.abs(accelerations2[0].x)).toBeLessThan(Math.abs(accelerations1[0].x));
    });

    it('should handle multiple bodies', () => {
      const bodies = [
        {
          mass: 1e10,
          position: { x: 0, y: 0, z: 0 },
          velocity: { x: 0, y: 0, z: 0 }
        },
        {
          mass: 1e5,
          position: { x: 10, y: 0, z: 0 },
          velocity: { x: 0, y: 0, z: 0 }
        },
        {
          mass: 1e5,
          position: { x: -10, y: 0, z: 0 },
          velocity: { x: 0, y: 0, z: 0 }
        }
      ];
      
      const accelerations = integrator.calculateAcceleration(bodies);
      
      // First body should have balanced forces from two equal masses
      expect(accelerations[0].x).toBeCloseTo(0);
      expect(accelerations[0].y).toBeCloseTo(0);
      expect(accelerations[0].z).toBeCloseTo(0);
    });
  });

  describe('eulerStep', () => {
    it('should perform Euler integration step', () => {
      const bodies = [
        {
          mass: 1e10,
          position: { x: 0, y: 0, z: 0 },
          velocity: { x: 0, y: 0, z: 0 }
        },
        {
          mass: 1e5,
          position: { x: 10, y: 0, z: 0 },
          velocity: { x: 0, y: 1, z: 0 }
        }
      ];
      
      const dt = 0.1;
      const updatedBodies = integrator.eulerStep(bodies, dt);
      
      // Positions should change based on velocities
      expect(updatedBodies[0].position.x).not.toBe(0);
      expect(updatedBodies[1].position.y).toBeGreaterThan(0);
      
      // Velocities should change based on accelerations
      expect(updatedBodies[0].velocity.x).not.toBe(0);
      expect(updatedBodies[1].velocity.x).not.toBe(0);
    });
  });

  describe('rk4Step', () => {
    it('should perform RK4 integration step', () => {
      const bodies = [
        {
          mass: 1e10,
          position: { x: 0, y: 0, z: 0 },
          velocity: { x: 0, y: 0, z: 0 }
        },
        {
          mass: 1e5,
          position: { x: 10, y: 0, z: 0 },
          velocity: { x: 0, y: 1, z: 0 }
        }
      ];
      
      const dt = 0.1;
      const updatedBodies = integrator.rk4Step(bodies, dt);
      
      // Positions should change based on velocities
      expect(updatedBodies[0].position.x).not.toBe(0);
      expect(updatedBodies[1].position.y).toBeGreaterThan(0);
      
      // Velocities should change based on accelerations
      expect(updatedBodies[0].velocity.x).not.toBe(0);
      expect(updatedBodies[1].velocity.x).not.toBe(0);
    });
  });

  describe('integrate', () => {
    it('should use the configured integration method', () => {
      const bodies = [
        {
          mass: 1e10,
          position: { x: 0, y: 0, z: 0 },
          velocity: { x: 0, y: 0, z: 0 }
        },
        {
          mass: 1e5,
          position: { x: 10, y: 0, z: 0 },
          velocity: { x: 0, y: 1, z: 0 }
        }
      ];
      
      const dt = 0.1;
      
      // Test Euler method
      integrator.method = 'euler';
      const eulerResult = integrator.integrate(bodies, dt);
      
      // Test RK4 method
      integrator.method = 'rk4';
      const rk4Result = integrator.integrate(bodies, dt);
      
      // Results should be different due to different integration methods
      expect(eulerResult[0].position.x).not.toBe(rk4Result[0].position.x);
    });

    it('should handle unknown integration method', () => {
      const bodies = [
        {
          mass: 1e10,
          position: { x: 0, y: 0, z: 0 },
          velocity: { x: 0, y: 0, z: 0 }
        },
        {
          mass: 1e5,
          position: { x: 10, y: 0, z: 0 },
          velocity: { x: 0, y: 1, z: 0 }
        }
      ];
      
      const dt = 0.1;
      
      // Test unknown method
      integrator.method = 'unknown';
      
      expect(() => {
        integrator.integrate(bodies, dt);
      }).toThrow();
    });
  });

  describe('calculateTotalEnergy', () => {
    it('should calculate total energy of the system', () => {
      const bodies = [
        {
          mass: 1e10,
          position: { x: 0, y: 0, z: 0 },
          velocity: { x: 0, y: 0, z: 0 }
        },
        {
          mass: 1e5,
          position: { x: 10, y: 0, z: 0 },
          velocity: { x: 0, y: 1, z: 0 }
        }
      ];
      
      const energy = integrator.calculateTotalEnergy(bodies);
      
      // Energy should be a number
      expect(typeof energy).toBe('number');
      
      // For this system, energy should be negative (bound system)
      expect(energy).toBeLessThan(0);
    });
  });

  describe('calculateCenterOfMass', () => {
    it('should calculate center of mass of the system', () => {
      const bodies = [
        {
          mass: 1e10,
          position: { x: 0, y: 0, z: 0 },
          velocity: { x: 0, y: 0, z: 0 }
        },
        {
          mass: 1e5,
          position: { x: 10, y: 0, z: 0 },
          velocity: { x: 0, y: 1, z: 0 }
        }
      ];
      
      const com = integrator.calculateCenterOfMass(bodies);
      
      // Center of mass should be closer to the more massive body
      expect(com.x).toBeGreaterThan(0);
      expect(com.x).toBeLessThan(10);
      expect(com.y).toBeCloseTo(0);
      expect(com.z).toBeCloseTo(0);
    });
  });
});