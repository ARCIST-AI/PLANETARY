/**
 * Comet class
 * Represents a comet in the simulation
 */

import { CelestialBody } from './CelestialBody.js';
import { MathUtils } from '../utils/index.js';
import { PhysicsConstants } from '../physics/index.js';

/**
 * Comet class
 */
export class Comet extends CelestialBody {
    /**
     * Create a new comet
     * @param {Object} options - Options for the comet
     */
    constructor(options = {}) {
        super({
            ...options,
            type: 'comet'
        });
        
        // Comet properties
        this.albedo = options.albedo || 0.04; // Bond albedo (very low)
        this.surfaceTemperature = options.surfaceTemperature || 0; // K
        this.rotationPeriod = options.rotationPeriod || MathUtils.random(6, 60) * 3600; // s (6-60 hours)
        this.axialTilt = options.axialTilt || Math.random() * Math.PI; // rad (random orientation)
        
        // Physical properties
        this.density = options.density || 500; // kg/m³ (very low, porous)
        this.porosity = options.porosity || 0.7; // Highly porous
        this.composition = options.composition || {
            ice: 0.5,
            dust: 0.4,
            rock: 0.1
        };
        
        // Nucleus properties
        this.nucleusRadius = options.nucleusRadius || this.radius; // Same as radius by default
        this.active = options.active !== false; // Most comets are active
        this.activityLevel = options.activityLevel || 0.5; // Activity level (0-1)
        
        // Coma properties
        this.comaRadius = options.comaRadius || 0; // m
        this.comaDensity = options.comaDensity || 0; // kg/m³
        this.comaOpacity = options.comaOpacity || 0.5;
        this.comaColor = options.comaColor || 0xaaccff;
        
        // Tail properties
        this.hasTail = options.hasTail !== false; // Most comets have tails
        this.tailLength = options.tailLength || 0; // m
        this.tailWidth = options.tailWidth || 0; // m
        this.tailDirection = options.tailDirection || { x: 0, y: 0, z: 0 };
        this.tailOpacity = options.tailOpacity || 0.3;
        this.tailColor = options.tailColor || 0xaaccff;
        
        // Orbital properties
        this.orbitalClass = options.orbitalClass || this.determineOrbitalClass();
        this.resonance = options.resonance || null; // Orbital resonance
        
        // Outburst properties
        this.outburstProbability = options.outburstProbability || 0.001; // Probability per update
        this.outburstIntensity = options.outburstIntensity || 0; // Current outburst intensity
        this.outburstDecayRate = options.outburstDecayRate || 0.1; // Decay rate per second
        
        // Calculate derived properties
        this.calculateCometProperties();
    }
    
    /**
     * Calculate comet properties
     */
    calculateCometProperties() {
        // Calculate mass from radius and density
        if (this.mass === 0 && this.radius > 0) {
            // Adjust for porosity
            const volume = (4 / 3) * Math.PI * Math.pow(this.radius, 3) * (1 - this.porosity);
            this.mass = this.density * volume;
        }
        
        // Calculate radius from mass and density
        if (this.radius === 0 && this.mass > 0) {
            // Adjust for porosity
            const volume = this.mass / this.density / (1 - this.porosity);
            this.radius = Math.pow(3 * volume / (4 * Math.PI), 1/3);
            this.nucleusRadius = this.radius;
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
            
            // Solar constant at comet's distance
            const solarConstant = this.parent.luminosity / (4 * Math.PI * distance * distance);
            
            // Effective temperature (Stefan-Boltzmann law)
            const stefanBoltzmannConstant = 5.670374419e-8; // W/(m²·K⁴)
            const effectiveTemperature = Math.pow(
                (solarConstant * (1 - this.albedo)) / (4 * stefanBoltzmannConstant),
                0.25
            );
            
            surfaceTemperature = effectiveTemperature;
        }
        
        // Adjust for activity (active comets are warmer due to sublimation)
        if (this.active && this.activityLevel > 0) {
            surfaceTemperature += 50 * this.activityLevel;
        }
        
        // Adjust for outbursts
        if (this.outburstIntensity > 0) {
            surfaceTemperature += 100 * this.outburstIntensity;
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
        
        // Orbital period in years
        const orbitalPeriodYears = this.orbitalPeriod / (365.25 * 24 * 3600);
        
        // Determine orbital class
        if (e < 0.01) {
            return 'non-periodic'; // Nearly parabolic
        } else if (orbitalPeriodYears < 20) {
            return 'short-period'; // Short-period comet
        } else if (orbitalPeriodYears < 200) {
            return 'intermediate-period'; // Intermediate-period comet
        } else if (e < 0.9) {
            return 'long-period'; // Long-period comet
        } else {
            return 'near-parabolic'; // Near-parabolic comet
        }
    }
    
    /**
     * Update the comet
     * @param {number} deltaTime - Time step in seconds
     * @param {boolean} useNBody - Whether to use N-body simulation
     */
    update(deltaTime, useNBody = false) {
        super.update(deltaTime, useNBody);
        
        // Update comet properties
        this.updateCometEvolution(deltaTime);
    }
    
    /**
     * Update comet evolution
     * @param {number} deltaTime - Time step in seconds
     */
    updateCometEvolution(deltaTime) {
        // Convert deltaTime to years
        const deltaYears = deltaTime / (365.25 * 24 * 3600);
        
        // Update age
        this.age += deltaYears;
        
        // Update surface temperature
        this.calculateSurfaceTemperature();
        
        // Update activity based on distance from star
        this.updateActivity();
        
        // Update coma and tail
        this.updateComaAndTail();
        
        // Update outbursts
        this.updateOutbursts(deltaTime);
        
        // Check for orbital resonances
        this.checkOrbitalResonances();
    }
    
    /**
     * Update activity based on distance from star
     */
    updateActivity() {
        if (!this.parent || this.parent.type !== 'star') {
            return;
        }
        
        // Distance from parent star
        const dx = this.position.x - this.parent.position.x;
        const dy = this.position.y - this.parent.position.y;
        const dz = this.position.z - this.parent.position.z;
        const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);
        
        // Activity increases as comet gets closer to star
        const AU = 1.496e11; // Astronomical Unit in meters
        const distanceAU = distance / AU;
        
        // Activity model (simplified)
        if (distanceAU < 5) {
            // Active within 5 AU
            this.active = true;
            this.activityLevel = Math.min(1, Math.pow(5 / distanceAU, 2));
        } else {
            // Inactive beyond 5 AU
            this.active = false;
            this.activityLevel = 0;
        }
    }
    
    /**
     * Update coma and tail
     */
    updateComaAndTail() {
        if (!this.active || this.activityLevel === 0) {
            this.comaRadius = 0;
            this.tailLength = 0;
            return;
        }
        
        // Coma size depends on activity level and nucleus size
        this.comaRadius = this.nucleusRadius * (10 + 100 * this.activityLevel);
        
        // Tail size depends on activity level and distance from star
        if (this.parent && this.parent.type === 'star') {
            // Distance from parent star
            const dx = this.position.x - this.parent.position.x;
            const dy = this.position.y - this.parent.position.y;
            const dz = this.position.z - this.parent.position.z;
            const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);
            
            // Tail length increases with activity and decreases with distance
            const AU = 1.496e11; // Astronomical Unit in meters
            const distanceAU = distance / AU;
            
            this.tailLength = this.nucleusRadius * (1000 + 10000 * this.activityLevel) / distanceAU;
            this.tailWidth = this.tailLength * 0.1;
            
            // Tail direction (away from star)
            const direction = {
                x: dx / distance,
                y: dy / distance,
                z: dz / distance
            };
            
            this.tailDirection = direction;
        }
    }
    
    /**
     * Update outbursts
     * @param {number} deltaTime - Time step in seconds
     */
    updateOutbursts(deltaTime) {
        // Decay current outburst
        if (this.outburstIntensity > 0) {
            this.outburstIntensity *= Math.exp(-this.outburstDecayRate * deltaTime);
            if (this.outburstIntensity < 0.01) {
                this.outburstIntensity = 0;
            }
        }
        
        // Random outburst
        if (this.active && this.activityLevel > 0.5 && Math.random() < this.outburstProbability) {
            this.outburstIntensity = Math.random() * 0.5 + 0.5; // Random intensity between 0.5 and 1.0
        }
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
     * Calculate synodic period with another comet
     * @param {Comet} otherComet - Other comet
     * @returns {number} Synodic period in seconds
     */
    calculateSynodicPeriod(otherComet) {
        if (this.orbitalPeriod === 0 || otherComet.orbitalPeriod === 0) {
            return 0;
        }
        
        const synodicPeriod = Math.abs(1 / (1 / this.orbitalPeriod - 1 / otherComet.orbitalPeriod));
        
        return synodicPeriod;
    }
    
    /**
     * Calculate orbital phase angle with another comet
     * @param {Comet} otherComet - Other comet
     * @returns {number} Phase angle in radians
     */
    calculatePhaseAngle(otherComet) {
        // Calculate positions relative to parent
        const r1 = {
            x: this.position.x - this.parent.position.x,
            y: this.position.y - this.parent.position.y,
            z: this.position.z - this.parent.position.z
        };
        
        const r2 = {
            x: otherComet.position.x - this.parent.position.x,
            y: otherComet.position.y - this.parent.position.y,
            z: otherComet.position.z - this.parent.position.z
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
     * Calculate sublimation rate
     * @returns {number} Sublimation rate in kg/s
     */
    calculateSublimationRate() {
        if (!this.active || this.activityLevel === 0) {
            return 0;
        }
        
        // Simplified sublimation rate calculation
        const surfaceArea = 4 * Math.PI * this.nucleusRadius * this.nucleusRadius;
        const sublimationRate = surfaceArea * this.activityLevel * 1e-8; // kg/s
        
        return sublimationRate;
    }
    
    /**
     * Calculate mass loss rate
     * @returns {number} Mass loss rate in kg/s
     */
    calculateMassLossRate() {
        const sublimationRate = this.calculateSublimationRate();
        
        // Add dust component
        const dustRate = sublimationRate * 0.5; // Dust is about half the mass loss
        
        return sublimationRate + dustRate;
    }
    
    /**
     * Calculate lifetime
     * @returns {number} Lifetime in years
     */
    calculateLifetime() {
        const massLossRate = this.calculateMassLossRate();
        
        if (massLossRate === 0) {
            return Infinity;
        }
        
        const lifetimeSeconds = this.mass / massLossRate;
        const lifetimeYears = lifetimeSeconds / (365.25 * 24 * 3600);
        
        return lifetimeYears;
    }
    
    /**
     * Trigger an outburst
     * @param {number} intensity - Outburst intensity (0-1)
     */
    triggerOutburst(intensity = 1) {
        this.outburstIntensity = Math.max(this.outburstIntensity, intensity);
    }
    
    /**
     * Clone the comet
     * @returns {Comet} Cloned comet
     */
    clone() {
        return new Comet({
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
            nucleusRadius: this.nucleusRadius,
            active: this.active,
            activityLevel: this.activityLevel,
            comaRadius: this.comaRadius,
            comaDensity: this.comaDensity,
            comaOpacity: this.comaOpacity,
            comaColor: this.comaColor,
            hasTail: this.hasTail,
            tailLength: this.tailLength,
            tailWidth: this.tailWidth,
            tailDirection: { ...this.tailDirection },
            tailOpacity: this.tailOpacity,
            tailColor: this.tailColor,
            orbitalClass: this.orbitalClass,
            resonance: this.resonance,
            outburstProbability: this.outburstProbability,
            outburstIntensity: this.outburstIntensity,
            outburstDecayRate: this.outburstDecayRate
        });
    }
    
    /**
     * Serialize the comet
     * @returns {Object} Serialized comet
     */
    serialize() {
        return {
            ...super.serialize(),
            albedo: this.albedo,
            surfaceTemperature: this.surfaceTemperature,
            porosity: this.porosity,
            composition: { ...this.composition },
            nucleusRadius: this.nucleusRadius,
            active: this.active,
            activityLevel: this.activityLevel,
            comaRadius: this.comaRadius,
            comaDensity: this.comaDensity,
            comaOpacity: this.comaOpacity,
            comaColor: this.comaColor,
            hasTail: this.hasTail,
            tailLength: this.tailLength,
            tailWidth: this.tailWidth,
            tailDirection: { ...this.tailDirection },
            tailOpacity: this.tailOpacity,
            tailColor: this.tailColor,
            orbitalClass: this.orbitalClass,
            resonance: this.resonance,
            outburstProbability: this.outburstProbability,
            outburstIntensity: this.outburstIntensity,
            outburstDecayRate: this.outburstDecayRate
        };
    }
    
    /**
     * Deserialize a comet
     * @param {Object} data - Serialized comet
     * @param {Object} bodies - Map of bodies by ID
     * @returns {Comet} Deserialized comet
     */
    static deserialize(data, bodies = {}) {
        const comet = new Comet({
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
            nucleusRadius: data.nucleusRadius,
            active: data.active,
            activityLevel: data.activityLevel,
            comaRadius: data.comaRadius,
            comaDensity: data.comaDensity,
            comaOpacity: data.comaOpacity,
            comaColor: data.comaColor,
            hasTail: data.hasTail,
            tailLength: data.tailLength,
            tailWidth: data.tailWidth,
            tailDirection: data.tailDirection,
            tailOpacity: data.tailOpacity,
            tailColor: data.tailColor,
            orbitalClass: data.orbitalClass,
            resonance: data.resonance,
            outburstProbability: data.outburstProbability,
            outburstIntensity: data.outburstIntensity,
            outburstDecayRate: data.outburstDecayRate
        });
        
        return comet;
    }
}