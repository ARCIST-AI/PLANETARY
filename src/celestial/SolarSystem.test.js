/**
 * Tests for SolarSystem
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { SolarSystem } from './SolarSystem.js';

// Mock the physics modules
vi.mock('../physics/NBodyIntegrator.js', () => ({
  NBodyIntegrator: vi.fn().mockImplementation(() => ({
    calculateAcceleration: vi.fn().mockReturnValue([]),
    integrate: vi.fn().mockImplementation((bodies, dt) => bodies),
    calculateTotalEnergy: vi.fn().mockReturnValue(0),
    calculateCenterOfMass: vi.fn().mockReturnValue({ x: 0, y: 0, z: 0 })
  }))
}));

vi.mock('../physics/KeplerianOrbit.js', () => ({
  KeplerianOrbit: vi.fn().mockImplementation(() => ({
    calculatePosition: vi.fn().mockReturnValue({ x: 0, y: 0, z: 0 }),
    calculateVelocity: vi.fn().mockReturnValue({ x: 0, y: 0, z: 0 }),
    calculateOrbitalElements: vi.fn().mockReturnValue({}),
    updateFromState: vi.fn()
  }))
}));

vi.mock('../physics/Perturbations.js', () => ({
  Perturbations: vi.fn().mockImplementation(() => ({
    calculatePerturbations: vi.fn().mockReturnValue({ x: 0, y: 0, z: 0 }),
    applyRelativisticCorrection: vi.fn().mockReturnValue({ x: 0, y: 0, z: 0 })
  }))
}));

vi.mock('../physics/CoordinateTransform.js', () => ({
  CoordinateTransform: vi.fn().mockImplementation(() => ({
    equatorialToEcliptic: vi.fn().mockReturnValue({ x: 0, y: 0, z: 0 }),
    eclipticToEquatorial: vi.fn().mockReturnValue({ x: 0, y: 0, z: 0 }),
    equatorialToGalactic: vi.fn().mockReturnValue({ x: 0, y: 0, z: 0 }),
    galacticToEquatorial: vi.fn().mockReturnValue({ x: 0, y: 0, z: 0 }),
    heliocentricToGeocentric: vi.fn().mockReturnValue({ x: 0, y: 0, z: 0 }),
    geocentricToHeliocentric: vi.fn().mockReturnValue({ x: 0, y: 0, z: 0 })
  }))
}));

describe('SolarSystem', () => {
  let solarSystem;

  beforeEach(() => {
    solarSystem = new SolarSystem();
  });

  describe('constructor', () => {
    it('should create an instance with default configuration', () => {
      expect(solarSystem).toBeInstanceOf(SolarSystem);
      expect(solarSystem.bodies).toEqual([]);
      expect(solarSystem.time).toBeInstanceOf(Date);
      expect(solarSystem.timeScale).toBe(1);
      expect(solarSystem.isPaused).toBe(false);
    });

    it('should create an instance with custom configuration', () => {
      const config = {
        timeScale: 10,
        isPaused: true,
        integratorMethod: 'euler'
      };
      
      const customSolarSystem = new SolarSystem(config);
      expect(customSolarSystem.timeScale).toBe(10);
      expect(customSolarSystem.isPaused).toBe(true);
    });
  });

  describe('initialize', () => {
    it('should initialize the solar system with default bodies', async () => {
      await solarSystem.initialize();
      
      expect(solarSystem.bodies.length).toBeGreaterThan(0);
      expect(solarSystem.isInitialized).toBe(true);
    });

    it('should initialize the solar system with custom bodies', async () => {
      const customBodies = [
        {
          name: 'Custom Star',
          mass: 1e30,
          radius: 1e9,
          position: { x: 0, y: 0, z: 0 },
          velocity: { x: 0, y: 0, z: 0 },
          color: '#ffff00',
          type: 'star'
        },
        {
          name: 'Custom Planet',
          mass: 1e24,
          radius: 1e7,
          position: { x: 1e11, y: 0, z: 0 },
          velocity: { x: 0, y: 3e4, z: 0 },
          color: '#0000ff',
          type: 'planet'
        }
      ];
      
      await solarSystem.initialize(customBodies);
      
      expect(solarSystem.bodies.length).toBe(2);
      expect(solarSystem.bodies[0].name).toBe('Custom Star');
      expect(solarSystem.bodies[1].name).toBe('Custom Planet');
      expect(solarSystem.isInitialized).toBe(true);
    });
  });

  describe('addBody', () => {
    it('should add a body to the solar system', async () => {
      await solarSystem.initialize();
      
      const body = {
        name: 'New Planet',
        mass: 1e24,
        radius: 1e7,
        position: { x: 2e11, y: 0, z: 0 },
        velocity: { x: 0, y: 2e4, z: 0 },
        color: '#ff0000',
        type: 'planet'
      };
      
      solarSystem.addBody(body);
      
      expect(solarSystem.bodies.length).toBeGreaterThan(0);
      expect(solarSystem.bodies[solarSystem.bodies.length - 1].name).toBe('New Planet');
    });

    it('should throw an error if body is missing required properties', async () => {
      await solarSystem.initialize();
      
      const invalidBody = {
        name: 'Invalid Body'
        // Missing required properties
      };
      
      expect(() => {
        solarSystem.addBody(invalidBody);
      }).toThrow();
    });
  });

  describe('removeBody', () => {
    it('should remove a body from the solar system', async () => {
      await solarSystem.initialize();
      
      const initialCount = solarSystem.bodies.length;
      const bodyToRemove = solarSystem.bodies[0];
      
      solarSystem.removeBody(bodyToRemove.id);
      
      expect(solarSystem.bodies.length).toBe(initialCount - 1);
      expect(solarSystem.bodies.find(b => b.id === bodyToRemove.id)).toBeUndefined();
    });

    it('should throw an error if body does not exist', async () => {
      await solarSystem.initialize();
      
      expect(() => {
        solarSystem.removeBody('non-existent-id');
      }).toThrow();
    });
  });

  describe('getBody', () => {
    it('should return a body by ID', async () => {
      await solarSystem.initialize();
      
      const body = solarSystem.bodies[0];
      const retrievedBody = solarSystem.getBody(body.id);
      
      expect(retrievedBody).toBe(body);
    });

    it('should return undefined for non-existent body', async () => {
      await solarSystem.initialize();
      
      const retrievedBody = solarSystem.getBody('non-existent-id');
      
      expect(retrievedBody).toBeUndefined();
    });
  });

  describe('getBodyByName', () => {
    it('should return a body by name', async () => {
      await solarSystem.initialize();
      
      const body = solarSystem.bodies[0];
      const retrievedBody = solarSystem.getBodyByName(body.name);
      
      expect(retrievedBody).toBe(body);
    });

    it('should return undefined for non-existent body', async () => {
      await solarSystem.initialize();
      
      const retrievedBody = solarSystem.getBodyByName('Non-existent Body');
      
      expect(retrievedBody).toBeUndefined();
    });
  });

  describe('update', () => {
    it('should update the solar system state', async () => {
      await solarSystem.initialize();
      
      const initialTime = new Date(solarSystem.time);
      const initialPositions = solarSystem.bodies.map(body => ({ ...body.position }));
      
      solarSystem.update(0.1);
      
      // Time should have advanced
      expect(solarSystem.time.getTime()).toBeGreaterThan(initialTime.getTime());
      
      // Positions should have changed
      for (let i = 0; i < solarSystem.bodies.length; i++) {
        expect(solarSystem.bodies[i].position).not.toEqual(initialPositions[i]);
      }
    });

    it('should not update when paused', async () => {
      await solarSystem.initialize();
      
      solarSystem.isPaused = true;
      const initialTime = new Date(solarSystem.time);
      const initialPositions = solarSystem.bodies.map(body => ({ ...body.position }));
      
      solarSystem.update(0.1);
      
      // Time should not have advanced
      expect(solarSystem.time.getTime()).toBe(initialTime.getTime());
      
      // Positions should not have changed
      for (let i = 0; i < solarSystem.bodies.length; i++) {
        expect(solarSystem.bodies[i].position).toEqual(initialPositions[i]);
      }
    });
  });

  describe('reset', () => {
    it('should reset the solar system to initial state', async () => {
      await solarSystem.initialize();
      
      // Make some changes
      solarSystem.timeScale = 10;
      solarSystem.isPaused = true;
      solarSystem.time = new Date('2023-01-01');
      
      solarSystem.reset();
      
      // Should be back to default values
      expect(solarSystem.timeScale).toBe(1);
      expect(solarSystem.isPaused).toBe(false);
      expect(solarSystem.time.getTime()).toBeCloseTo(new Date().getTime(), -3); // Within 3 seconds
    });
  });

  describe('setTimeScale', () => {
    it('should set the time scale', async () => {
      await solarSystem.initialize();
      
      solarSystem.setTimeScale(10);
      
      expect(solarSystem.timeScale).toBe(10);
    });

    it('should throw an error for negative time scale', async () => {
      await solarSystem.initialize();
      
      expect(() => {
        solarSystem.setTimeScale(-1);
      }).toThrow();
    });
  });

  describe('pause', () => {
    it('should pause the simulation', async () => {
      await solarSystem.initialize();
      
      solarSystem.pause();
      
      expect(solarSystem.isPaused).toBe(true);
    });
  });

  describe('resume', () => {
    it('should resume the simulation', async () => {
      await solarSystem.initialize();
      
      solarSystem.pause();
      solarSystem.resume();
      
      expect(solarSystem.isPaused).toBe(false);
    });
  });

  describe('togglePause', () => {
    it('should toggle pause state', async () => {
      await solarSystem.initialize();
      
      // Initially not paused
      expect(solarSystem.isPaused).toBe(false);
      
      // Toggle to paused
      solarSystem.togglePause();
      expect(solarSystem.isPaused).toBe(true);
      
      // Toggle to not paused
      solarSystem.togglePause();
      expect(solarSystem.isPaused).toBe(false);
    });
  });

  describe('setTime', () => {
    it('should set the simulation time', async () => {
      await solarSystem.initialize();
      
      const newTime = new Date('2023-01-01');
      solarSystem.setTime(newTime);
      
      expect(solarSystem.time.getTime()).toBe(newTime.getTime());
    });
  });

  describe('getTotalMass', () => {
    it('should calculate total mass of the system', async () => {
      await solarSystem.initialize();
      
      const totalMass = solarSystem.getTotalMass();
      
      expect(totalMass).toBeGreaterThan(0);
      
      // Verify calculation
      const expectedMass = solarSystem.bodies.reduce((sum, body) => sum + body.mass, 0);
      expect(totalMass).toBeCloseTo(expectedMass);
    });
  });

  describe('getCenterOfMass', () => {
    it('should calculate center of mass of the system', async () => {
      await solarSystem.initialize();
      
      const com = solarSystem.getCenterOfMass();
      
      expect(com).toHaveProperty('x');
      expect(com).toHaveProperty('y');
      expect(com).toHaveProperty('z');
    });
  });

  describe('getTotalEnergy', () => {
    it('should calculate total energy of the system', async () => {
      await solarSystem.initialize();
      
      const energy = solarSystem.getTotalEnergy();
      
      expect(typeof energy).toBe('number');
    });
  });

  describe('getBodiesByType', () => {
    it('should return bodies filtered by type', async () => {
      await solarSystem.initialize();
      
      const stars = solarSystem.getBodiesByType('star');
      const planets = solarSystem.getBodiesByType('planet');
      
      expect(Array.isArray(stars)).toBe(true);
      expect(Array.isArray(planets)).toBe(true);
      
      // All returned bodies should be of the correct type
      stars.forEach(body => {
        expect(body.type).toBe('star');
      });
      
      planets.forEach(body => {
        expect(body.type).toBe('planet');
      });
    });
  });

  describe('getBodiesWithinDistance', () => {
    it('should return bodies within a specified distance', async () => {
      await solarSystem.initialize();
      
      const center = { x: 0, y: 0, z: 0 };
      const distance = 1e11;
      const nearbyBodies = solarSystem.getBodiesWithinDistance(center, distance);
      
      expect(Array.isArray(nearbyBodies)).toBe(true);
      
      // All returned bodies should be within the specified distance
      nearbyBodies.forEach(body => {
        const dx = body.position.x - center.x;
        const dy = body.position.y - center.y;
        const dz = body.position.z - center.z;
        const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);
        expect(dist).toBeLessThanOrEqual(distance);
      });
    });
  });
});