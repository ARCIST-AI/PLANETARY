/**
 * Tests for celestial body classes
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { CelestialBody } from './CelestialBody.js';
import { Star } from './Star.js';
import { Planet } from './Planet.js';
import { Moon } from './Moon.js';
import { Asteroid } from './Asteroid.js';
import { Comet } from './Comet.js';
import { Spacecraft } from './Spacecraft.js';

// Mock MathUtils
vi.mock('../utils/index.js', () => ({
  MathUtils: {
    generateUUID: vi.fn(() => 'test-uuid-' + Math.random().toString(36).substr(2, 9)),
    random: vi.fn((min, max) => min + Math.random() * (max - min))
  }
}));

// Mock PhysicsConstants
vi.mock('../physics/index.js', () => ({
  PhysicsConstants: {
    G: 6.67430e-11,
    c: 299792458,
    AU: 1.496e11
  }
}));

describe('CelestialBody', () => {
  let body;

  beforeEach(() => {
    body = new CelestialBody({
      name: 'Test Body',
      mass: 1e24,
      radius: 6e6,
      position: { x: 0, y: 0, z: 0 },
      velocity: { x: 1000, y: 0, z: 0 }
    });
  });

  describe('constructor', () => {
    it('should create a celestial body with default properties', () => {
      const defaultBody = new CelestialBody();
      
      expect(defaultBody.name).toBe('Unnamed Body');
      expect(defaultBody.type).toBe('body');
      expect(defaultBody.mass).toBe(0);
      expect(defaultBody.radius).toBe(0);
      expect(defaultBody.position).toEqual({ x: 0, y: 0, z: 0 });
      expect(defaultBody.velocity).toEqual({ x: 0, y: 0, z: 0 });
    });

    it('should create a celestial body with custom properties', () => {
      expect(body.name).toBe('Test Body');
      expect(body.mass).toBe(1e24);
      expect(body.radius).toBe(6e6);
      expect(body.position).toEqual({ x: 0, y: 0, z: 0 });
      expect(body.velocity).toEqual({ x: 1000, y: 0, z: 0 });
    });

    it('should calculate derived properties', () => {
      expect(body.density).toBeGreaterThan(0);
      expect(body.gravity).toBeGreaterThan(0);
      expect(body.escapeVelocity).toBeGreaterThan(0);
    });
  });

  describe('update', () => {
    it('should update rotation angle', () => {
      body.rotationPeriod = 3600; // 1 hour
      const initialRotation = body.rotationAngle;
      
      body.update(100, true); // 100 seconds, N-body mode
      
      expect(body.rotationAngle).toBeGreaterThan(initialRotation);
    });

    it('should update position and velocity in N-body mode', () => {
      body.acceleration = { x: 1, y: 0, z: 0 };
      const initialPosition = { ...body.position };
      const initialVelocity = { ...body.velocity };
      
      body.update(10, true);
      
      expect(body.velocity.x).toBeGreaterThan(initialVelocity.x);
      expect(body.position.x).toBeGreaterThan(initialPosition.x);
    });
  });

  describe('calculateGravitationalForce', () => {
    it('should calculate gravitational force between two bodies', () => {
      const otherBody = new CelestialBody({
        mass: 2e24,
        position: { x: 1e6, y: 0, z: 0 }
      });

      const force = body.calculateGravitationalForce(otherBody);
      
      expect(force.x).toBeGreaterThan(0);
      expect(force.y).toBe(0);
      expect(force.z).toBe(0);
    });

    it('should return zero force when bodies are too close', () => {
      const otherBody = new CelestialBody({
        mass: 2e24,
        radius: 6e6,
        position: { x: 1000, y: 0, z: 0 } // Within combined radii
      });

      const force = body.calculateGravitationalForce(otherBody);
      
      expect(force).toEqual({ x: 0, y: 0, z: 0 });
    });
  });

  describe('clone', () => {
    it('should create a deep copy of the celestial body', () => {
      const clone = body.clone();
      
      expect(clone).not.toBe(body);
      expect(clone.name).toBe(body.name);
      expect(clone.mass).toBe(body.mass);
      expect(clone.position).toEqual(body.position);
      expect(clone.position).not.toBe(body.position);
    });
  });

  describe('serialize', () => {
    it('should serialize celestial body data', () => {
      const serialized = body.serialize();
      
      expect(serialized).toHaveProperty('id');
      expect(serialized).toHaveProperty('name');
      expect(serialized).toHaveProperty('mass');
      expect(serialized).toHaveProperty('radius');
      expect(serialized).toHaveProperty('position');
      expect(serialized).toHaveProperty('velocity');
    });
  });

  describe('deserialize', () => {
    it('should deserialize celestial body data', () => {
      const serialized = body.serialize();
      const deserialized = CelestialBody.deserialize(serialized);
      
      expect(deserialized.name).toBe(body.name);
      expect(deserialized.mass).toBe(body.mass);
      expect(deserialized.radius).toBe(body.radius);
    });
  });
});

describe('Star', () => {
  let star;

  beforeEach(() => {
    star = new Star({
      name: 'Test Star',
      mass: 1.989e30,
      radius: 6.96e8,
      temperature: 5778,
      luminosity: 3.828e26
    });
  });

  describe('constructor', () => {
    it('should create a star with stellar properties', () => {
      expect(star.type).toBe('star');
      expect(star.temperature).toBe(5778);
      expect(star.luminosity).toBe(3.828e26);
      expect(star.spectralClass).toBe('G');
      expect(star.stellarClass).toBe('Main Sequence');
    });

    it('should calculate stellar properties from mass', () => {
      const massOnlyStar = new Star({ mass: 1.989e30 });
      
      expect(massOnlyStar.luminosity).toBeGreaterThan(0);
      expect(massOnlyStar.spectralClass).toBeTruthy();
      expect(massOnlyStar.stellarClass).toBeTruthy();
    });
  });

  describe('determineSpectralClass', () => {
    it('should determine correct spectral class', () => {
      expect(star.determineSpectralClass(35000)).toBe('O');
      expect(star.determineSpectralClass(15000)).toBe('B');
      expect(star.determineSpectralClass(8000)).toBe('A');
      expect(star.determineSpectralClass(6500)).toBe('F');
      expect(star.determineSpectralClass(5500)).toBe('G');
      expect(star.determineSpectralClass(4000)).toBe('K');
      expect(star.determineSpectralClass(3000)).toBe('M');
    });
  });

  describe('determineStellarClass', () => {
    it('should determine correct stellar class', () => {
      const solarMass = 1.989e30;
      
      expect(star.determineStellarClass(20 * solarMass)).toBe('Hypergiant');
      expect(star.determineStellarClass(12 * solarMass)).toBe('Supergiant');
      expect(star.determineStellarClass(3 * solarMass)).toBe('Bright Giant');
      expect(star.determineStellarClass(2 * solarMass)).toBe('Giant');
      expect(star.determineStellarClass(1 * solarMass)).toBe('Main Sequence');
      expect(star.determineStellarClass(0.5 * solarMass)).toBe('Red Dwarf');
      expect(star.determineStellarClass(0.05 * solarMass)).toBe('Brown Dwarf');
    });
  });

  describe('getHabitableZone', () => {
    it('should calculate habitable zone boundaries', () => {
      const hz = star.getHabitableZone();
      
      expect(hz).toHaveProperty('inner');
      expect(hz).toHaveProperty('outer');
      expect(hz.inner).toBeGreaterThan(0);
      expect(hz.outer).toBeGreaterThan(hz.inner);
    });
  });

  describe('update', () => {
    it('should update stellar evolution', () => {
      const initialAge = star.age;
      
      star.update(365.25 * 24 * 3600); // 1 year
      
      expect(star.age).toBeGreaterThan(initialAge);
    });
  });
});

describe('Planet', () => {
  let planet;
  let parentStar;

  beforeEach(() => {
    parentStar = new Star({
      name: 'Parent Star',
      mass: 1.989e30,
      luminosity: 3.828e26,
      position: { x: 0, y: 0, z: 0 }
    });

    planet = new Planet({
      name: 'Test Planet',
      mass: 5.972e24,
      radius: 6.371e6,
      parent: parentStar,
      semiMajorAxis: 1.496e11,
      position: { x: 1.496e11, y: 0, z: 0 },
      albedo: 0.3
    });
  });

  describe('constructor', () => {
    it('should create a planet with planetary properties', () => {
      expect(planet.type).toBe('planet');
      expect(planet.albedo).toBe(0.3);
      expect(planet.surfaceTemperature).toBeGreaterThan(0);
    });
  });

  describe('addMoon', () => {
    it('should add a moon to the planet', () => {
      const moon = new Moon({
        name: 'Test Moon',
        mass: 7.342e22,
        radius: 1.737e6
      });

      planet.addMoon(moon);
      
      expect(planet.moons).toHaveLength(1);
      expect(planet.moons[0]).toBe(moon);
      expect(moon.parent).toBe(planet);
    });
  });

  describe('removeMoon', () => {
    it('should remove a moon from the planet', () => {
      const moon = new Moon({
        name: 'Test Moon',
        mass: 7.342e22,
        radius: 1.737e6
      });

      planet.addMoon(moon);
      const removed = planet.removeMoon(moon.id);
      
      expect(planet.moons).toHaveLength(0);
      expect(removed).toBe(moon);
      expect(moon.parent).toBeNull();
    });
  });

  describe('getHillSphereRadius', () => {
    it('should calculate Hill sphere radius', () => {
      const radius = planet.getHillSphereRadius();
      
      expect(radius).toBeGreaterThan(0);
    });
  });

  describe('isInHabitableZone', () => {
    it('should determine if planet is in habitable zone', () => {
      // Mock the parent star's getHabitableZone method
      parentStar.getHabitableZone = vi.fn(() => ({
        inner: 1.4e11,
        outer: 1.6e11
      }));

      const inHZ = planet.isInHabitableZone();
      
      expect(typeof inHZ).toBe('boolean');
    });
  });
});

describe('Moon', () => {
  let moon;
  let parentPlanet;

  beforeEach(() => {
    parentPlanet = new Planet({
      name: 'Parent Planet',
      mass: 5.972e24,
      radius: 6.371e6,
      surfaceTemperature: 288,
      position: { x: 0, y: 0, z: 0 }
    });

    moon = new Moon({
      name: 'Test Moon',
      mass: 7.342e22,
      radius: 1.737e6,
      parent: parentPlanet,
      semiMajorAxis: 3.844e8,
      position: { x: 3.844e8, y: 0, z: 0 }
    });
  });

  describe('constructor', () => {
    it('should create a moon with lunar properties', () => {
      expect(moon.type).toBe('moon');
      expect(moon.tidallyLocked).toBe(true);
      expect(moon.craterDensity).toBeGreaterThan(0);
    });
  });

  describe('calculateTidalHeating', () => {
    it('should calculate tidal heating', () => {
      moon.eccentricity = 0.1;
      moon.orbitalPeriod = 2.36e6;
      
      moon.calculateTidalHeating();
      
      expect(moon.tidalHeating).toBeGreaterThanOrEqual(0);
    });
  });

  describe('isWithinRocheLimit', () => {
    it('should determine if moon is within Roche limit', () => {
      const withinRoche = moon.isWithinRocheLimit();
      
      expect(typeof withinRoche).toBe('boolean');
    });
  });
});

describe('Asteroid', () => {
  let asteroid;

  beforeEach(() => {
    asteroid = new Asteroid({
      name: 'Test Asteroid',
      radius: 500000, // 500 km
      semiMajorAxis: 2.5 * 1.496e11,
      eccentricity: 0.1,
      inclination: 0.1
    });
  });

  describe('constructor', () => {
    it('should create an asteroid with asteroid properties', () => {
      expect(asteroid.type).toBe('asteroid');
      expect(asteroid.density).toBe(2000);
      expect(asteroid.porosity).toBe(0.2);
      expect(asteroid.irregularShape).toBe(true);
      expect(asteroid.orbitalClass).toBeTruthy();
    });
  });

  describe('determineOrbitalClass', () => {
    it('should determine correct orbital class', () => {
      // Main belt asteroid
      asteroid.semiMajorAxis = 2.5 * 1.496e11;
      asteroid.eccentricity = 0.1;
      asteroid.inclination = 0.1;
      
      const orbitalClass = asteroid.determineOrbitalClass();
      expect(orbitalClass).toBe('main-belt');
    });

    it('should classify near-Earth asteroids', () => {
      asteroid.semiMajorAxis = 1.2 * 1.496e11;
      asteroid.eccentricity = 0.2;
      
      const orbitalClass = asteroid.determineOrbitalClass();
      expect(orbitalClass).toBe('near-Earth');
    });
  });

  describe('isPotentiallyHazardous', () => {
    it('should determine if asteroid is potentially hazardous', () => {
      asteroid.semiMajorAxis = 1.2 * 1.496e11;
      asteroid.eccentricity = 0.3;
      asteroid.radius = 100; // 200m diameter
      asteroid.parent = { type: 'star' };
      
      const isHazardous = asteroid.isPotentiallyHazardous();
      
      expect(typeof isHazardous).toBe('boolean');
    });
  });

  describe('calculateYarkovskyEffect', () => {
    it('should calculate Yarkovsky effect', () => {
      asteroid.rotationPeriod = 8 * 3600; // 8 hours
      asteroid.velocity = { x: 20000, y: 0, z: 0 };
      asteroid.parent = {
        type: 'star',
        luminosity: 3.828e26,
        position: { x: 0, y: 0, z: 0 }
      };
      
      const effect = asteroid.calculateYarkovskyEffect();
      
      expect(effect).toHaveProperty('x');
      expect(effect).toHaveProperty('y');
      expect(effect).toHaveProperty('z');
    });
  });
});

describe('Comet', () => {
  let comet;

  beforeEach(() => {
    // Mock Comet class if it doesn't exist
    if (typeof Comet === 'undefined') {
      global.Comet = class extends CelestialBody {
        constructor(options = {}) {
          super({ ...options, type: 'comet' });
          this.nucleus = options.nucleus || {};
          this.coma = options.coma || {};
          this.tail = options.tail || {};
        }
      };
    }

    comet = new Comet({
      name: 'Test Comet',
      radius: 5000, // 5 km nucleus
      semiMajorAxis: 10 * 1.496e11,
      eccentricity: 0.8
    });
  });

  describe('constructor', () => {
    it('should create a comet with comet properties', () => {
      expect(comet.type).toBe('comet');
    });
  });
});

describe('Spacecraft', () => {
  let spacecraft;

  beforeEach(() => {
    // Mock Spacecraft class if it doesn't exist
    if (typeof Spacecraft === 'undefined') {
      global.Spacecraft = class extends CelestialBody {
        constructor(options = {}) {
          super({ ...options, type: 'spacecraft' });
          this.fuel = options.fuel || 0;
          this.thrust = options.thrust || 0;
          this.mission = options.mission || '';
        }
      };
    }

    spacecraft = new Spacecraft({
      name: 'Test Spacecraft',
      mass: 1000,
      fuel: 500,
      thrust: 100,
      mission: 'Test Mission'
    });
  });

  describe('constructor', () => {
    it('should create a spacecraft with spacecraft properties', () => {
      expect(spacecraft.type).toBe('spacecraft');
      expect(spacecraft.fuel).toBe(500);
      expect(spacecraft.thrust).toBe(100);
      expect(spacecraft.mission).toBe('Test Mission');
    });
  });
});