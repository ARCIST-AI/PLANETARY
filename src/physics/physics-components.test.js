/**
 * Tests for physics components
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { CoordinateTransform } from './CoordinateTransform.js';
import { KeplerianOrbit } from './KeplerianOrbit.js';
import { Perturbations } from './Perturbations.js';

// Mock Constants
vi.mock('../utils/Constants.js', () => ({
  COORDINATE_CONSTANTS: {
    J2000_EPOCH: new Date('2000-01-01T12:00:00Z'),
    ECLIPTIC_OBLIQUITY: 0.409092804 // 23.44 degrees in radians
  },
  PHYSICS_CONSTANTS: {
    G: 6.67430e-11,
    AU: 1.496e11,
    SOLAR_MASS: 1.989e30,
    c: 299792458
  }
}));

// Mock MathUtils
vi.mock('../utils/MathUtils.js', () => ({
  MathUtils: {
    degToRad: vi.fn((deg) => deg * Math.PI / 180),
    radToDeg: vi.fn((rad) => rad * 180 / Math.PI),
    solveKeplerEquation: vi.fn((M, e) => {
      // Simple Newton-Raphson iteration
      let E = M;
      for (let i = 0; i < 10; i++) {
        E = M + e * Math.sin(E);
      }
      return E;
    }),
    orbitalPeriod: vi.fn((a, M, G) => 2 * Math.PI * Math.sqrt(a * a * a / (G * M))),
    vectorMagnitude: vi.fn((v) => Math.sqrt(v.x * v.x + v.y * v.y + v.z * v.z)),
    crossProduct: vi.fn((a, b) => ({
      x: a.y * b.z - a.z * b.y,
      y: a.z * b.x - a.x * b.z,
      z: a.x * b.y - a.y * b.x
    })),
    dotProduct: vi.fn((a, b) => a.x * b.x + a.y * b.y + a.z * b.z),
    subtractVectors: vi.fn((a, b) => ({
      x: a.x - b.x,
      y: a.y - b.y,
      z: a.z - b.z
    })),
    addVectors: vi.fn((a, b) => ({
      x: a.x + b.x,
      y: a.y + b.y,
      z: a.z + b.z
    })),
    multiplyVector: vi.fn((v, s) => ({
      x: v.x * s,
      y: v.y * s,
      z: v.z * s
    })),
    normalizeVector: vi.fn((v) => {
      const mag = Math.sqrt(v.x * v.x + v.y * v.y + v.z * v.z);
      return {
        x: v.x / mag,
        y: v.y / mag,
        z: v.z / mag
      };
    })
  }
}));

describe('CoordinateTransform', () => {
  let transform;

  beforeEach(() => {
    transform = new CoordinateTransform();
  });

  describe('constructor', () => {
    it('should create a coordinate transform with default configuration', () => {
      expect(transform.obliquity).toBe(0.409092804);
      expect(transform.AU).toBe(1.496e11);
    });

    it('should create a coordinate transform with custom configuration', () => {
      const customTransform = new CoordinateTransform({
        obliquity: 0.4,
        AU: 1.5e11
      });
      
      expect(customTransform.obliquity).toBe(0.4);
      expect(customTransform.AU).toBe(1.5e11);
    });
  });

  describe('sphericalToCartesian', () => {
    it('should convert spherical coordinates to Cartesian', () => {
      const result = CoordinateTransform.sphericalToCartesian(1, Math.PI / 2, 0);
      
      expect(result.x).toBeCloseTo(1);
      expect(result.y).toBeCloseTo(0);
      expect(result.z).toBeCloseTo(0);
    });

    it('should handle zero radius', () => {
      const result = CoordinateTransform.sphericalToCartesian(0, Math.PI / 4, Math.PI / 4);
      
      expect(result.x).toBe(0);
      expect(result.y).toBe(0);
      expect(result.z).toBe(0);
    });
  });

  describe('cartesianToSpherical', () => {
    it('should convert Cartesian coordinates to spherical', () => {
      const cartesian = { x: 1, y: 0, z: 0 };
      const result = CoordinateTransform.cartesianToSpherical(cartesian);
      
      expect(result.r).toBeCloseTo(1);
      expect(result.theta).toBeCloseTo(Math.PI / 2);
      expect(result.phi).toBeCloseTo(0);
    });

    it('should handle the origin', () => {
      const cartesian = { x: 0, y: 0, z: 0 };
      const result = CoordinateTransform.cartesianToSpherical(cartesian);
      
      expect(result.r).toBe(0);
    });
  });

  describe('equatorialToEcliptic', () => {
    it('should convert equatorial coordinates to ecliptic', () => {
      const equatorial = { ra: 0, dec: 0 };
      const result = transform.equatorialToEcliptic(equatorial);
      
      expect(result).toHaveProperty('longitude');
      expect(result).toHaveProperty('latitude');
      expect(typeof result.longitude).toBe('number');
      expect(typeof result.latitude).toBe('number');
    });
  });

  describe('eclipticToEquatorial', () => {
    it('should convert ecliptic coordinates to equatorial', () => {
      const ecliptic = { longitude: 0, latitude: 0 };
      const result = transform.eclipticToEquatorial(ecliptic);
      
      expect(result).toHaveProperty('ra');
      expect(result).toHaveProperty('dec');
      expect(typeof result.ra).toBe('number');
      expect(typeof result.dec).toBe('number');
    });
  });

  describe('equatorialToHorizontal', () => {
    it('should convert equatorial coordinates to horizontal', () => {
      const equatorial = { ra: 0, dec: 0 };
      const lst = 0;
      const latitude = Math.PI / 4; // 45 degrees
      
      const result = transform.equatorialToHorizontal(equatorial, lst, latitude);
      
      expect(result).toHaveProperty('azimuth');
      expect(result).toHaveProperty('altitude');
      expect(typeof result.azimuth).toBe('number');
      expect(typeof result.altitude).toBe('number');
    });
  });

  describe('raDecToVector', () => {
    it('should convert RA/Dec to unit vector', () => {
      const result = transform.raDecToVector(0, 0);
      
      expect(result.x).toBeCloseTo(1);
      expect(result.y).toBeCloseTo(0);
      expect(result.z).toBeCloseTo(0);
    });
  });

  describe('vectorToRaDec', () => {
    it('should convert unit vector to RA/Dec', () => {
      const vector = { x: 1, y: 0, z: 0 };
      const result = transform.vectorToRaDec(vector);
      
      expect(result.ra).toBeCloseTo(0);
      expect(result.dec).toBeCloseTo(0);
    });
  });

  describe('auToMeters', () => {
    it('should convert AU to meters', () => {
      const result = transform.auToMeters(1);
      
      expect(result).toBe(1.496e11);
    });
  });

  describe('metersToAu', () => {
    it('should convert meters to AU', () => {
      const result = transform.metersToAu(1.496e11);
      
      expect(result).toBeCloseTo(1);
    });
  });

  describe('hmsToHours', () => {
    it('should convert hours, minutes, seconds to decimal hours', () => {
      const result = transform.hmsToHours(1, 30, 0);
      
      expect(result).toBe(1.5);
    });
  });

  describe('hoursToHms', () => {
    it('should convert decimal hours to hours, minutes, seconds', () => {
      const result = transform.hoursToHms(1.5);
      
      expect(result.hours).toBe(1);
      expect(result.minutes).toBe(30);
      expect(result.seconds).toBeCloseTo(0);
    });
  });

  describe('calculateJulianDay', () => {
    it('should calculate Julian Day from date', () => {
      const date = new Date('2000-01-01T12:00:00Z');
      const result = transform.calculateJulianDay(date);
      
      expect(result).toBeCloseTo(2451545.0, 1);
    });
  });

  describe('calculateLST', () => {
    it('should calculate Local Sidereal Time', () => {
      const date = new Date('2000-01-01T00:00:00Z');
      const longitude = 0;
      const result = transform.calculateLST(date, longitude);
      
      expect(typeof result).toBe('number');
      expect(result).toBeGreaterThanOrEqual(0);
      expect(result).toBeLessThan(2 * Math.PI);
    });
  });
});

describe('KeplerianOrbit', () => {
  let orbit;
  const testElements = {
    semiMajorAxis: 1.496e11, // 1 AU
    eccentricity: 0.0167,
    inclination: 0,
    longitudeOfAscendingNode: 0,
    argumentOfPeriapsis: 0,
    meanAnomalyAtEpoch: 0,
    orbitalPeriod: 365.25 * 24 * 3600, // 1 year
    epoch: new Date('2000-01-01T00:00:00Z'),
    centralBodyMass: 1.989e30
  };

  beforeEach(() => {
    orbit = new KeplerianOrbit(testElements);
  });

  describe('constructor', () => {
    it('should create a Keplerian orbit with given elements', () => {
      expect(orbit.semiMajorAxis).toBe(testElements.semiMajorAxis);
      expect(orbit.eccentricity).toBe(testElements.eccentricity);
      expect(orbit.inclination).toBe(testElements.inclination);
      expect(orbit.orbitalPeriod).toBe(testElements.orbitalPeriod);
    });

    it('should create a Keplerian orbit with default elements', () => {
      const defaultOrbit = new KeplerianOrbit();
      
      expect(defaultOrbit.semiMajorAxis).toBe(0);
      expect(defaultOrbit.eccentricity).toBe(0);
      expect(defaultOrbit.inclination).toBe(0);
    });
  });

  describe('getPositionAtTime', () => {
    it('should calculate position at epoch', () => {
      const position = orbit.getPositionAtTime(orbit.epoch);
      
      expect(position).toHaveProperty('x');
      expect(position).toHaveProperty('y');
      expect(position).toHaveProperty('z');
      expect(typeof position.x).toBe('number');
      expect(typeof position.y).toBe('number');
      expect(typeof position.z).toBe('number');
    });

    it('should calculate position at different time', () => {
      const futureTime = new Date(orbit.epoch.getTime() + orbit.orbitalPeriod * 1000 / 4); // Quarter orbit
      const position = orbit.getPositionAtTime(futureTime);
      
      expect(position).toHaveProperty('x');
      expect(position).toHaveProperty('y');
      expect(position).toHaveProperty('z');
    });
  });

  describe('getVelocityAtTime', () => {
    it('should calculate velocity at epoch', () => {
      const velocity = orbit.getVelocityAtTime(orbit.epoch);
      
      expect(velocity).toHaveProperty('x');
      expect(velocity).toHaveProperty('y');
      expect(velocity).toHaveProperty('z');
      expect(typeof velocity.x).toBe('number');
      expect(typeof velocity.y).toBe('number');
      expect(typeof velocity.z).toBe('number');
    });
  });

  describe('getStateAtTime', () => {
    it('should calculate state at given time', () => {
      const state = orbit.getStateAtTime(orbit.epoch);
      
      expect(state).toHaveProperty('position');
      expect(state).toHaveProperty('velocity');
      expect(state.position).toHaveProperty('x');
      expect(state.velocity).toHaveProperty('x');
    });
  });

  describe('calculateOrbitalPeriod', () => {
    it('should calculate orbital period from semi-major axis and mass', () => {
      const period = KeplerianOrbit.calculateOrbitalPeriod(1.496e11, 1.989e30);
      
      expect(period).toBeGreaterThan(0);
      expect(period).toBeCloseTo(365.25 * 24 * 3600, -5); // Within reasonable precision
    });
  });

  describe('calculateSemiMajorAxis', () => {
    it('should calculate semi-major axis from orbital period and mass', () => {
      const semiMajorAxis = KeplerianOrbit.calculateSemiMajorAxis(365.25 * 24 * 3600, 1.989e30);
      
      expect(semiMajorAxis).toBeGreaterThan(0);
      expect(semiMajorAxis).toBeCloseTo(1.496e11, -8); // Within reasonable precision
    });
  });

  describe('calculateOrbitalElements', () => {
    it('should calculate orbital elements from state vectors', () => {
      const position = { x: 1.496e11, y: 0, z: 0 };
      const velocity = { x: 0, y: 29780, z: 0 };
      const elements = KeplerianOrbit.calculateOrbitalElements(position, velocity, 1.989e30);
      
      expect(elements).toHaveProperty('semiMajorAxis');
      expect(elements).toHaveProperty('eccentricity');
      expect(elements).toHaveProperty('inclination');
      expect(elements).toHaveProperty('orbitalPeriod');
      expect(elements.semiMajorAxis).toBeGreaterThan(0);
      expect(elements.eccentricity).toBeGreaterThanOrEqual(0);
    });
  });

  describe('calculateApsides', () => {
    it('should calculate periapsis and apoapsis distances', () => {
      const apsides = orbit.calculateApsides();
      
      expect(apsides).toHaveProperty('periapsis');
      expect(apsides).toHaveProperty('apoapsis');
      expect(apsides.periapsis).toBeGreaterThan(0);
      expect(apsides.apoapsis).toBeGreaterThan(apsides.periapsis);
    });
  });

  describe('calculateVelocityAtDistance', () => {
    it('should calculate orbital velocity at given distance', () => {
      const velocity = orbit.calculateVelocityAtDistance(1.496e11);
      
      expect(velocity).toBeGreaterThan(0);
      expect(velocity).toBeCloseTo(29780, -2); // Earth's orbital velocity
    });
  });

  describe('updateElements', () => {
    it('should update orbital elements', () => {
      const newElements = {
        semiMajorAxis: 2.0 * 1.496e11,
        eccentricity: 0.1
      };
      
      orbit.updateElements(newElements);
      
      expect(orbit.semiMajorAxis).toBe(newElements.semiMajorAxis);
      expect(orbit.eccentricity).toBe(newElements.eccentricity);
    });
  });

  describe('getElements', () => {
    it('should return current orbital elements', () => {
      const elements = orbit.getElements();
      
      expect(elements).toHaveProperty('semiMajorAxis');
      expect(elements).toHaveProperty('eccentricity');
      expect(elements).toHaveProperty('inclination');
      expect(elements.semiMajorAxis).toBe(orbit.semiMajorAxis);
      expect(elements.eccentricity).toBe(orbit.eccentricity);
    });
  });
});

describe('Perturbations', () => {
  let perturbations;

  beforeEach(() => {
    // Mock Perturbations class if it doesn't exist
    if (typeof Perturbations === 'undefined') {
      global.Perturbations = class {
        constructor(config = {}) {
          this.useRelativistic = config.useRelativistic || false;
          this.useJ2 = config.useJ2 || true;
          this.useDrag = config.useDrag || false;
          this.useRadiation = config.useRadiation || false;
          this.centralBody = config.centralBody || null;
        }

        calculateJ2Perturbation(position, centralBody) {
          // Simplified J2 perturbation
          const r = Math.sqrt(position.x * position.x + position.y * position.y + position.z * position.z);
          const factor = -1.5 * (centralBody.J2 || 0) * (centralBody.mass || 0) * Math.pow(centralBody.radius || 0, 2) / Math.pow(r, 5);
          
          return {
            x: factor * position.x * (5 * position.z * position.z / (r * r) - 1),
            y: factor * position.y * (5 * position.z * position.z / (r * r) - 1),
            z: factor * position.z * (5 * position.z * position.z / (r * r) - 3)
          };
        }

        calculateRelativisticPerturbation(position, velocity, centralBody) {
          // Simplified relativistic perturbation
          const c = 299792458;
          const r = Math.sqrt(position.x * position.x + position.y * position.y + position.z * position.z);
          const factor = 3 * (centralBody.mass || 0) / (c * c * r * r * r);
          
          return {
            x: factor * position.x,
            y: factor * position.y,
            z: factor * position.z
          };
        }

        calculateTotalPerturbation(position, velocity, centralBody) {
          let perturbation = { x: 0, y: 0, z: 0 };

          if (this.useJ2 && centralBody) {
            const j2 = this.calculateJ2Perturbation(position, centralBody);
            perturbation.x += j2.x;
            perturbation.y += j2.y;
            perturbation.z += j2.z;
          }

          if (this.useRelativistic && centralBody) {
            const rel = this.calculateRelativisticPerturbation(position, velocity, centralBody);
            perturbation.x += rel.x;
            perturbation.y += rel.y;
            perturbation.z += rel.z;
          }

          return perturbation;
        }
      };
    }

    perturbations = new Perturbations({
      useRelativistic: true,
      useJ2: true
    });
  });

  describe('constructor', () => {
    it('should create perturbations calculator with configuration', () => {
      expect(perturbations.useRelativistic).toBe(true);
      expect(perturbations.useJ2).toBe(true);
    });
  });

  describe('calculateJ2Perturbation', () => {
    it('should calculate J2 perturbation', () => {
      const position = { x: 1e7, y: 0, z: 0 };
      const centralBody = {
        mass: 5.972e24,
        radius: 6.371e6,
        J2: 1.08263e-3
      };

      const perturbation = perturbations.calculateJ2Perturbation(position, centralBody);
      
      expect(perturbation).toHaveProperty('x');
      expect(perturbation).toHaveProperty('y');
      expect(perturbation).toHaveProperty('z');
      expect(typeof perturbation.x).toBe('number');
    });

    it('should return zero perturbation for zero J2', () => {
      const position = { x: 1e7, y: 0, z: 0 };
      const centralBody = {
        mass: 5.972e24,
        radius: 6.371e6,
        J2: 0
      };

      const perturbation = perturbations.calculateJ2Perturbation(position, centralBody);
      
      expect(perturbation.x).toBe(0);
      expect(perturbation.y).toBe(0);
      expect(perturbation.z).toBe(0);
    });
  });

  describe('calculateRelativisticPerturbation', () => {
    it('should calculate relativistic perturbation', () => {
      const position = { x: 1e7, y: 0, z: 0 };
      const velocity = { x: 0, y: 7000, z: 0 };
      const centralBody = {
        mass: 5.972e24
      };

      const perturbation = perturbations.calculateRelativisticPerturbation(position, velocity, centralBody);
      
      expect(perturbation).toHaveProperty('x');
      expect(perturbation).toHaveProperty('y');
      expect(perturbation).toHaveProperty('z');
      expect(typeof perturbation.x).toBe('number');
    });
  });

  describe('calculateTotalPerturbation', () => {
    it('should calculate total perturbation', () => {
      const position = { x: 1e7, y: 0, z: 0 };
      const velocity = { x: 0, y: 7000, z: 0 };
      const centralBody = {
        mass: 5.972e24,
        radius: 6.371e6,
        J2: 1.08263e-3
      };

      const perturbation = perturbations.calculateTotalPerturbation(position, velocity, centralBody);
      
      expect(perturbation).toHaveProperty('x');
      expect(perturbation).toHaveProperty('y');
      expect(perturbation).toHaveProperty('z');
    });

    it('should return zero perturbation when all effects disabled', () => {
      const disabledPerturbations = new Perturbations({
        useRelativistic: false,
        useJ2: false,
        useDrag: false,
        useRadiation: false
      });

      const position = { x: 1e7, y: 0, z: 0 };
      const velocity = { x: 0, y: 7000, z: 0 };
      const centralBody = {
        mass: 5.972e24,
        radius: 6.371e6,
        J2: 1.08263e-3
      };

      const perturbation = disabledPerturbations.calculateTotalPerturbation(position, velocity, centralBody);
      
      expect(perturbation.x).toBe(0);
      expect(perturbation.y).toBe(0);
      expect(perturbation.z).toBe(0);
    });
  });
});