/**
 * Asteroid class
 * Represents an asteroid in the simulation
 */

import { CelestialBody } from './CelestialBody.js';
import { MathUtils } from '../utils/index.js';
import { PhysicsConstants } from '../physics/index.js';

/**
 * Asteroid class
 */
export class Asteroid extends CelestialBody {
    /**
     * Create a new asteroid
     * @param {Object} options - Options for the asteroid
     */
    constructor(options = {}) {
        super({
            ...options,
            type: 'asteroid'
        });
        
        // Asteroid properties
        this.albedo = options.albedo || 0.1; // Bond albedo
        this.surfaceTemperature = options.surfaceTemperature || 0; // K
        this.rotationPeriod = options.rotationPeriod || MathUtils.random(2, 24) * 3600; // s (2-24 hours)
        this.axialTilt = options.axialTilt || Math.random() * Math.PI; // rad (random orientation)
        
        // Physical properties
        this.density = options.density || 2000; // kg/m³ (typical for asteroids)
        this.porosity = options.porosity || 0.2; // Fraction of volume that is porous
        this.composition = options.composition || {
            silicate: 0.6,
            metal: 0.3,
            carbon: 0.1
        };
        
        // Shape properties
        this.irregularShape = options.irregularShape !== false; // Most asteroids are irregular
        this.dimensions = options.dimensions || {
            length: this.radius * 2,
            width: this.radius * 1.8,
            height: this.radius * 1.5
        };
        
        // Orbital properties
        this.orbitalClass = options.orbitalClass || this.determineOrbitalClass();
        this.family = options.family || null; // Asteroid family
        this.resonance = options.resonance || null; // Orbital resonance
        
        // Surface properties
        this.craterDensity = options.craterDensity || 0.7; // Crater density (0-1)
        this.surfaceAge = options.surfaceAge || 4.5e9; // Surface age in years
        this.regolithDepth = options.regolithDepth || 1; // Regolith depth in meters
        
        // Calculate derived properties
        this.calculateAsteroidProperties();
    }
    
    /**
     * Calculate asteroid properties
     */
    calculateAsteroidProperties() {
        // Calculate mass from radius and density
        if (this.mass === 0 && this.radius > 0) {
            // Adjust for irregular shape and porosity
            const volumeFactor = this.irregularShape ? 0.7 : 1.0;
            const volume = (4 / 3) * Math.PI * Math.pow(this.radius, 3) * volumeFactor * (1 - this.porosity);
            this.mass = this.density * volume;
        }
        
        // Calculate radius from mass and density
        if (this.radius === 0 && this.mass > 0) {
            // Adjust for irregular shape and porosity
            const volumeFactor = this.irregularShape ? 0.7 : 1.0;
            const volume = this.mass / this.density / (1 - this.porosity) / volumeFactor;
            this.radius = Math.pow(3 * volume / (4 * Math.PI), 1/3);
        }
        
        // Calculate surface temperature
        if (this.surfaceTemperature === 0) {
            this.calculateSurfaceTemperature();
        }
        
        // Determine orbital class
        if (this.orbitalClass === '') {
            this.orbitalClass = this.determineOrbitalClass();
        }
    }
    
    /**
     * Calculate surface temperature
     */
    calculateSurfaceTemperature() {
        // Start with temperature from parent star
        let surfaceTemperature = 0;
        
        if (this.parent && this.parent.type === 'star') {
            // Distance from parent star
            const dx = this.position.x - this.parent.position.x;
            const dy = this.position.y - this.parent.position.y;
            const dz = this.position.z - this.parent.position.z;
            const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);
            
            // Solar constant at asteroid's distance
            const solarConstant = this.parent.luminosity / (4 * Math.PI * distance * distance);
            
            // Effective temperature (Stefan-Boltzmann law)
            const stefanBoltzmannConstant = 5.670374419e-8; // W/(m²·K⁴)
            const effectiveTemperature = Math.pow(
                (solarConstant * (1 - this.albedo)) / (4 * stefanBoltzmannConstant),
                0.25
            );
            
            surfaceTemperature = effectiveTemperature;
        }
        
        // Adjust for rotation (fast-rotating asteroids have more uniform temperature)
        if (this.rotationPeriod > 0) {
            const rotationFactor = Math.min(1, 10 * 3600 / this.rotationPeriod); // Normalize to 10-hour rotation
            surfaceTemperature *= (0.8 + 0.2 * rotationFactor);
        }
        
        this.surfaceTemperature = surfaceTemperature;
    }
    
    /**
     * Determine orbital class based on orbital elements
     * @returns {string} Orbital class
     */
    determineOrbitalClass() {
        if (!this.parent || this.parent.type !== 'star') {
            return 'interstellar';
        }
        
        const AU = 1.496e11; // Astronomical Unit in meters
        
        // Semi-major axis in AU
        const semiMajorAxisAU = this.semiMajorAxis / AU;
        
        // Eccentricity
        const e = this.eccentricity;
        
        // Inclination in degrees
        const inclinationDeg = this.inclination * 180 / Math.PI;
        
        // Determine orbital class
        if (semiMajorAxisAU < 2.0) {
            if (e < 0.2 && inclinationDeg < 10) {
                return 'near-Earth'; // NEA
            } else {
                return 'near-Earth'; // NEA (including Aten, Apollo, Amor)
            }
        } else if (semiMajorAxisAU < 3.3) {
            if (e < 0.2 && inclinationDeg < 15) {
                return 'main-belt'; // MBA
            } else {
                return 'main-belt'; // MBA (including Hungaria, Phocaea)
            }
        } else if (semiMajorAxisAU < 5.5) {
            return 'main-belt'; // Outer main belt
        } else if (semiMajorAxisAU < 30) {
            if (e > 0.3) {
                return 'centaur'; // Centaur
            } else {
                return 'trans-Neptunian'; // TNO
            }
        } else {
            return 'trans-Neptunian'; // TNO
        }
    }
    
    /**
     * Update the asteroid
     * @param {number} deltaTime - Time step in seconds
     * @param {boolean} useNBody - Whether to use N-body simulation
     */
    update(deltaTime, useNBody = false) {
        super.update(deltaTime, useNBody);
        
        // Update asteroid properties
        this.updateAsteroidEvolution(deltaTime);
    }
    
    /**
     * Update asteroid evolution
     * @param {number} deltaTime - Time step in seconds
     */
    updateAsteroidEvolution(deltaTime) {
        // Convert deltaTime to years
        const deltaYears = deltaTime / (365.25 * 24 * 3600);
        
        // Update age
        this.age += deltaYears;
        
        // Update surface temperature
        this.calculateSurfaceTemperature();
        
        // Update crater density (increases with time)
        if (this.surfaceAge > 0) {
            this.craterDensity = Math.min(1, this.surfaceAge / 4.5e9);
        }
        
        // Check for orbital resonances
        this.checkOrbitalResonances();
    }
    
    /**
     * Check for orbital resonances
     */
    checkOrbitalResonances() {
        if (!this.parent || this.parent.type !== 'star' || this.orbitalPeriod === 0) {
            return;
        }
        
        // Check for resonances with Jupiter (if it exists)
        // This is a simplified check - in a real simulation, you'd check against all bodies
        const jupiterSemiMajorAxis = 7.786e11; // m
        const jupiterOrbitalPeriod = 2 * Math.PI * Math.sqrt(Math.pow(jupiterSemiMajorAxis, 3) / (PhysicsConstants.G * 1.898e27));
        
        if (jupiterOrbitalPeriod > 0) {
            const periodRatio = jupiterOrbitalPeriod / this.orbitalPeriod;
            
            // Check for common resonances
            if (Math.abs(periodRatio - 2) < 0.05) {
                this.resonance = '1:2';
            } else if (Math.abs(periodRatio - 3/2) < 0.05) {
                this.resonance = '2:3';
            } else if (Math.abs(periodRatio - 5/2) < 0.05) {
                this.resonance = '2:5';
            } else if (Math.abs(periodRatio - 3) < 0.05) {
                this.resonance = '1:3';
            } else if (Math.abs(periodRatio - 7/2) < 0.05) {
                this.resonance = '2:7';
            } else {
                this.resonance = null;
            }
        }
    }
    
    /**
     * Calculate Hill sphere radius
     * @returns {number} Hill sphere radius in meters
     */
    getHillSphereRadius() {
        if (!this.parent) {
            return 0;
        }
        
        const massRatio = this.mass / this.parent.mass;
        const hillSphereRadius = this.semiMajorAxis * Math.pow(massRatio / 3, 1/3);
        
        return hillSphereRadius;
    }
    
    /**
     * Calculate Roche limit
     * @returns {number} Roche limit in meters
     */
    getRocheLimit() {
        if (!this.parent) {
            return 0;
        }
        
        // Roche limit calculation
        const densityRatio = this.parent.density / this.density;
        const rocheLimit = 2.44 * this.parent.radius * Math.pow(densityRatio, 1/3);
        
        return rocheLimit;
    }
    
    /**
     * Calculate sphere of influence radius
     * @returns {number} Sphere of influence radius in meters
     */
    getSphereOfInfluenceRadius() {
        if (!this.parent) {
            return 0;
        }
        
        const massRatio = this.mass / this.parent.mass;
        const sphereOfInfluenceRadius = this.semiMajorAxis * Math.pow(massRatio, 2/5);
        
        return sphereOfInfluenceRadius;
    }
    
    /**
     * Calculate synodic period with another asteroid
     * @param {Asteroid} otherAsteroid - Other asteroid
     * @returns {number} Synodic period in seconds
     */
    calculateSynodicPeriod(otherAsteroid) {
        if (this.orbitalPeriod === 0 || otherAsteroid.orbitalPeriod === 0) {
            return 0;
        }
        
        const synodicPeriod = Math.abs(1 / (1 / this.orbitalPeriod - 1 / otherAsteroid.orbitalPeriod));
        
        return synodicPeriod;
    }
    
    /**
     * Calculate orbital phase angle with another asteroid
     * @param {Asteroid} otherAsteroid - Other asteroid
     * @returns {number} Phase angle in radians
     */
    calculatePhaseAngle(otherAsteroid) {
        // Calculate positions relative to parent
        const r1 = {
            x: this.position.x - this.parent.position.x,
            y: this.position.y - this.parent.position.y,
            z: this.position.z - this.parent.position.z
        };
        
        const r2 = {
            x: otherAsteroid.position.x - this.parent.position.x,
            y: otherAsteroid.position.y - this.parent.position.y,
            z: otherAsteroid.position.z - this.parent.position.z
        };
        
        // Calculate angle between position vectors
        const dotProduct = r1.x * r2.x + r1.y * r2.y + r1.z * r2.z;
        const r1Magnitude = Math.sqrt(r1.x * r1.x + r1.y * r1.y + r1.z * r1.z);
        const r2Magnitude = Math.sqrt(r2.x * r2.x + r2.y * r2.y + r2.z * r2.z);
        
        const cosAngle = dotProduct / (r1Magnitude * r2Magnitude);
        const angle = Math.acos(Math.max(-1, Math.min(1, cosAngle)));
        
        return angle;
    }
    
    /**
     * Calculate minimum orbital intersection distance (MOID) with another asteroid
     * @param {Asteroid} otherAsteroid - Other asteroid
     * @returns {number} MOID in meters
     */
    calculateMOID(otherAsteroid) {
        // Simplified MOID calculation
        // In reality, this would involve more complex orbital mechanics
        
        // Distance between orbital planes
        const relativeInclination = Math.abs(this.inclination - otherAsteroid.inclination);
        
        // Distance between semi-major axes
        const semiMajorAxisDistance = Math.abs(this.semiMajorAxis - otherAsteroid.semiMajorAxis);
        
        // Simplified MOID
        const moid = Math.sqrt(
            Math.pow(semiMajorAxisDistance, 2) + 
            Math.pow(this.semiMajorAxis * Math.sin(relativeInclination), 2)
        );
        
        return moid;
    }
    
    /**
     * Check if asteroid is potentially hazardous
     * @returns {boolean} True if asteroid is potentially hazardous
     */
    isPotentiallyHazardous() {
        if (!this.parent || this.parent.type !== 'star') {
            return false;
        }
        
        const AU = 1.496e11; // Astronomical Unit in meters
        
        // Potentially hazardous asteroids (PHAs) have:
        // 1. Minimum orbit intersection distance (MOID) with Earth ≤ 0.05 AU
        // 2. Absolute magnitude ≤ 22.0 (roughly corresponds to diameter > 140 m)
        
        // Simplified check based on semi-major axis and eccentricity
        const semiMajorAxisAU = this.semiMajorAxis / AU;
        const perihelionAU = semiMajorAxisAU * (1 - this.eccentricity);
        
        // Check if orbit crosses Earth's orbit
        if (perihelionAU < 1.0 && semiMajorAxisAU > 0.8) {
            // Check size (simplified)
            const diameter = this.radius * 2;
            if (diameter > 140) {
                return true;
            }
        }
        
        return false;
    }
    
    /**
     * Calculate Yarkovsky effect
     * @returns {Object} Yarkovsky acceleration vector
     */
    calculateYarkovskyEffect() {
        // Simplified Yarkovsky effect calculation
        // The Yarkovsky effect is a force acting on a rotating body in space caused by the anisotropic emission of thermal photons
        
        if (this.rotationPeriod === 0 || !this.parent || this.parent.type !== 'star') {
            return { x: 0, y: 0, z: 0 };
        }
        
        // Distance from parent star
        const dx = this.position.x - this.parent.position.x;
        const dy = this.position.y - this.parent.position.y;
        const dz = this.position.z - this.parent.position.z;
        const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);
        
        // Solar constant at asteroid's distance
        const solarConstant = this.parent.luminosity / (4 * Math.PI * distance * distance);
        
        // Cross-sectional area
        const crossSection = Math.PI * this.radius * this.radius;
        
        // Absorbed power
        const absorbedPower = solarConstant * crossSection * (1 - this.albedo);
        
        // Emitted power (assuming blackbody)
        const stefanBoltzmannConstant = 5.670374419e-8; // W/(m²·K⁴)
        const surfaceArea = 4 * Math.PI * this.radius * this.radius;
        const emittedPower = stefanBoltzmannConstant * surfaceArea * Math.pow(this.surfaceTemperature, 4);
        
        // Net force (simplified)
        const netForce = (absorbedPower - emittedPower) / (3e8); // c = speed of light
        
        // Direction (tangential to orbit)
        const velocityMagnitude = Math.sqrt(this.velocity.x * this.velocity.x + this.velocity.y * this.velocity.y + this.velocity.z * this.velocity.z);
        
        if (velocityMagnitude > 0) {
            const direction = {
                x: this.velocity.x / velocityMagnitude,
                y: this.velocity.y / velocityMagnitude,
                z: this.velocity.z / velocityMagnitude
            };
            
            // Yarkovsky effect is proportional to 1/radius and depends on rotation
            const yarkovskyFactor = 1e-15 / this.radius * (24 * 3600 / this.rotationPeriod);
            
            return {
                x: netForce * direction.x * yarkovskyFactor,
                y: netForce * direction.y * yarkovskyFactor,
                z: netForce * direction.z * yarkovskyFactor
            };
        }
        
        return { x: 0, y: 0, z: 0 };
    }
    
    /**
     * Clone the asteroid
     * @returns {Asteroid} Cloned asteroid
     */
    clone() {
        return new Asteroid({
            id: this.id,
            name: this.name,
            parent: this.parent,
            mass: this.mass,
            radius: this.radius,
            density: this.density,
            gravity: this.gravity,
            escapeVelocity: this.escapeVelocity,
            semiMajorAxis: this.semiMajorAxis,
            eccentricity: this.eccentricity,
            inclination: this.inclination,
            longitudeOfAscendingNode: this.longitudeOfAscendingNode,
            argumentOfPeriapsis: this.argumentOfPeriapsis,
            meanAnomalyAtEpoch: this.meanAnomalyAtEpoch,
            epoch: new Date(this.epoch.getTime()),
            orbitalPeriod: this.orbitalPeriod,
            meanMotion: this.meanMotion,
            rotationPeriod: this.rotationPeriod,
            axialTilt: this.axialTilt,
            rotationAngle: this.rotationAngle,
            position: { ...this.position },
            velocity: { ...this.velocity },
            acceleration: { ...this.acceleration },
            color: this.color,
            texture: this.texture,
            emissive: this.emissive,
            emissiveIntensity: this.emissiveIntensity,
            shininess: this.shininess,
            opacity: this.opacity,
            transparent: this.transparent,
            customProperties: { ...this.customProperties },
            albedo: this.albedo,
            surfaceTemperature: this.surfaceTemperature,
            porosity: this.porosity,
            composition: { ...this.composition },
            irregularShape: this.irregularShape,
            dimensions: { ...this.dimensions },
            orbitalClass: this.orbitalClass,
            family: this.family,
            resonance: this.resonance,
            craterDensity: this.craterDensity,
            surfaceAge: this.surfaceAge,
            regolithDepth: this.regolithDepth
        });
    }
    
    /**
     * Serialize the asteroid
     * @returns {Object} Serialized asteroid
     */
    serialize() {
        return {
            ...super.serialize(),
            albedo: this.albedo,
            surfaceTemperature: this.surfaceTemperature,
            porosity: this.porosity,
            composition: { ...this.composition },
            irregularShape: this.irregularShape,
            dimensions: { ...this.dimensions },
            orbitalClass: this.orbitalClass,
            family: this.family,
            resonance: this.resonance,
            craterDensity: this.craterDensity,
            surfaceAge: this.surfaceAge,
            regolithDepth: this.regolithDepth
        };
    }
    
    /**
     * Deserialize an asteroid
     * @param {Object} data - Serialized asteroid
     * @param {Object} bodies - Map of bodies by ID
     * @returns {Asteroid} Deserialized asteroid
     */
    static deserialize(data, bodies = {}) {
        const asteroid = new Asteroid({
            id: data.id,
            name: data.name,
            parent: data.parentId ? bodies[data.parentId] : null,
            mass: data.mass,
            radius: data.radius,
            density: data.density,
            gravity: data.gravity,
            escapeVelocity: data.escapeVelocity,
            semiMajorAxis: data.semiMajorAxis,
            eccentricity: data.eccentricity,
            inclination: data.inclination,
            longitudeOfAscendingNode: data.longitudeOfAscendingNode,
            argumentOfPeriapsis: data.argumentOfPeriapsis,
            meanAnomalyAtEpoch: data.meanAnomalyAtEpoch,
            epoch: new Date(data.epoch),
            orbitalPeriod: data.orbitalPeriod,
            meanMotion: data.meanMotion,
            rotationPeriod: data.rotationPeriod,
            axialTilt: data.axialTilt,
            rotationAngle: data.rotationAngle,
            position: data.position,
            velocity: data.velocity,
            acceleration: data.acceleration,
            color: data.color,
            texture: data.texture,
            emissive: data.emissive,
            emissiveIntensity: data.emissiveIntensity,
            shininess: data.shininess,
            opacity: data.opacity,
            transparent: data.transparent,
            customProperties: data.customProperties,
            albedo: data.albedo,
            surfaceTemperature: data.surfaceTemperature,
            porosity: data.porosity,
            composition: data.composition,
            irregularShape: data.irregularShape,
            dimensions: data.dimensions,
            orbitalClass: data.orbitalClass,
            family: data.family,
            resonance: data.resonance,
            craterDensity: data.craterDensity,
            surfaceAge: data.surfaceAge,
            regolithDepth: data.regolithDepth
        });
        
        return asteroid;
    }
}