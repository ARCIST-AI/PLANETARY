/**
 * Star class
 * Represents a star in the simulation
 */

import { CelestialBody } from './CelestialBody.js';
import { MathUtils } from '../utils/index.js';
import { PhysicsConstants } from '../physics/index.js';

/**
 * Star class
 */
export class Star extends CelestialBody {
    /**
     * Create a new star
     * @param {Object} options - Options for the star
     */
    constructor(options = {}) {
        super({
            ...options,
            type: 'star'
        });
        
        // Stellar properties
        this.luminosity = options.luminosity || 0; // W
        this.temperature = options.temperature || 0; // K
        this.spectralClass = options.spectralClass || '';
        this.spectralType = options.spectralType || '';
        this.stellarClass = options.stellarClass || '';
        this.age = options.age || 0; // years
        this.metallicity = options.metallicity || 0; // [Fe/H]
        this.rotationVelocity = options.rotationVelocity || 0; // m/s
        
        // Visual properties
        this.coronaColor = options.coronaColor || 0xffffff;
        this.coronaSize = options.coronaSize || 1.5;
        this.coronaOpacity = options.coronaOpacity || 0.3;
        this.flareIntensity = options.flareIntensity || 0;
        this.flareFrequency = options.flareFrequency || 0;
        this.lastFlareTime = options.lastFlareTime || 0;
        
        // Calculate derived properties
        this.calculateStellarProperties();
    }
    
    /**
     * Calculate stellar properties
     */
    calculateStellarProperties() {
        // Calculate luminosity from temperature and radius using Stefan-Boltzmann law
        if (this.luminosity === 0 && this.temperature > 0 && this.radius > 0) {
            const stefanBoltzmannConstant = 5.670374419e-8; // W/(m²·K⁴)
            const surfaceArea = 4 * Math.PI * this.radius * this.radius;
            this.luminosity = stefanBoltzmannConstant * surfaceArea * Math.pow(this.temperature, 4);
        }
        
        // Calculate temperature from luminosity and radius
        if (this.temperature === 0 && this.luminosity > 0 && this.radius > 0) {
            const stefanBoltzmannConstant = 5.670374419e-8; // W/(m²·K⁴)
            const surfaceArea = 4 * Math.PI * this.radius * this.radius;
            this.temperature = Math.pow(this.luminosity / (stefanBoltzmannConstant * surfaceArea), 0.25);
        }
        
        // Calculate radius from luminosity and temperature
        if (this.radius === 0 && this.luminosity > 0 && this.temperature > 0) {
            const stefanBoltzmannConstant = 5.670374419e-8; // W/(m²·K⁴)
            const surfaceArea = this.luminosity / (stefanBoltzmannConstant * Math.pow(this.temperature, 4));
            this.radius = Math.sqrt(surfaceArea / (4 * Math.PI));
        }
        
        // Calculate mass from luminosity using mass-luminosity relation
        if (this.mass === 0 && this.luminosity > 0) {
            const solarLuminosity = 3.828e26; // W
            const solarMass = 1.989e30; // kg
            
            // Mass-luminosity relation: L ∝ M^3.5 for main sequence stars
            const luminosityRatio = this.luminosity / solarLuminosity;
            const massRatio = Math.pow(luminosityRatio, 1 / 3.5);
            this.mass = solarMass * massRatio;
        }
        
        // Calculate luminosity from mass using mass-luminosity relation
        if (this.luminosity === 0 && this.mass > 0) {
            const solarLuminosity = 3.828e26; // W
            const solarMass = 1.989e30; // kg
            
            // Mass-luminosity relation: L ∝ M^3.5 for main sequence stars
            const massRatio = this.mass / solarMass;
            const luminosityRatio = Math.pow(massRatio, 3.5);
            this.luminosity = solarLuminosity * luminosityRatio;
        }
        
        // Determine spectral class from temperature
        if (this.spectralClass === '' && this.temperature > 0) {
            this.spectralClass = this.determineSpectralClass(this.temperature);
        }
        
        // Determine stellar class from mass
        if (this.stellarClass === '' && this.mass > 0) {
            this.stellarClass = this.determineStellarClass(this.mass);
        }
        
        // Calculate rotation velocity from rotation period
        if (this.rotationVelocity === 0 && this.rotationPeriod > 0) {
            this.rotationVelocity = (2 * Math.PI * this.radius) / this.rotationPeriod;
        }
        
        // Calculate rotation period from rotation velocity
        if (this.rotationPeriod === 0 && this.rotationVelocity > 0) {
            this.rotationPeriod = (2 * Math.PI * this.radius) / this.rotationVelocity;
        }
    }
    
    /**
     * Determine spectral class from temperature
     * @param {number} temperature - Temperature in Kelvin
     * @returns {string} Spectral class
     */
    determineSpectralClass(temperature) {
        if (temperature >= 30000) return 'O';
        if (temperature >= 10000) return 'B';
        if (temperature >= 7500) return 'A';
        if (temperature >= 6000) return 'F';
        if (temperature >= 5200) return 'G';
        if (temperature >= 3700) return 'K';
        return 'M';
    }
    
    /**
     * Determine stellar class from mass
     * @param {number} mass - Mass in kg
     * @returns {string} Stellar class
     */
    determineStellarClass(mass) {
        const solarMass = 1.989e30; // kg
        const massRatio = mass / solarMass;
        
        if (massRatio >= 16) return 'Hypergiant';
        if (massRatio >= 10) return 'Supergiant';
        if (massRatio >= 2.5) return 'Bright Giant';
        if (massRatio >= 1.5) return 'Giant';
        if (massRatio >= 0.8) return 'Main Sequence';
        if (massRatio >= 0.08) return 'Red Dwarf';
        return 'Brown Dwarf';
    }
    
    /**
     * Update the star
     * @param {number} deltaTime - Time step in seconds
     * @param {boolean} useNBody - Whether to use N-body simulation
     */
    update(deltaTime, useNBody = false) {
        super.update(deltaTime, useNBody);
        
        // Update stellar properties
        this.updateStellarEvolution(deltaTime);
        
        // Update flares
        this.updateFlares(deltaTime);
    }
    
    /**
     * Update stellar evolution
     * @param {number} deltaTime - Time step in seconds
     */
    updateStellarEvolution(deltaTime) {
        // Convert deltaTime to years
        const deltaYears = deltaTime / (365.25 * 24 * 3600);
        
        // Update age
        this.age += deltaYears;
        
        // Simple stellar evolution model
        const solarMass = 1.989e30; // kg
        const massRatio = this.mass / solarMass;
        
        // Main sequence lifetime (in years)
        const mainSequenceLifetime = 1e10 * Math.pow(massRatio, -2.5);
        
        if (this.age < mainSequenceLifetime) {
            // Main sequence evolution
            const evolutionFactor = this.age / mainSequenceLifetime;
            
            // Increase luminosity and temperature slightly over time
            this.luminosity *= (1 + 0.4 * evolutionFactor * deltaYears / mainSequenceLifetime);
            this.temperature *= (1 + 0.1 * evolutionFactor * deltaYears / mainSequenceLifetime);
            
            // Update spectral class
            this.spectralClass = this.determineSpectralClass(this.temperature);
        } else {
            // Post-main sequence evolution
            const postMainSequenceAge = this.age - mainSequenceLifetime;
            
            if (postMainSequenceAge < mainSequenceLifetime * 0.1) {
                // Red giant phase
                this.stellarClass = 'Giant';
                this.radius *= (1 + 0.01 * deltaYears / (mainSequenceLifetime * 0.1));
                this.temperature *= (1 - 0.005 * deltaYears / (mainSequenceLifetime * 0.1));
                this.luminosity *= (1 + 0.02 * deltaYears / (mainSequenceLifetime * 0.1));
            } else {
                // White dwarf phase
                this.stellarClass = 'White Dwarf';
                this.radius = 6e6; // Typical white dwarf radius
                this.temperature = 10000; // Typical white dwarf temperature
                this.luminosity = 0.001 * 3.828e26; // 0.001 solar luminosities
            }
            
            // Update spectral class
            this.spectralClass = this.determineSpectralClass(this.temperature);
        }
        
        // Update derived properties
        this.calculateDerivedProperties();
    }
    
    /**
     * Update flares
     * @param {number} deltaTime - Time step in seconds
     */
    updateFlares(deltaTime) {
        const currentTime = Date.now();
        
        // Check if it's time for a flare
        if (this.flareFrequency > 0 && currentTime - this.lastFlareTime > 1 / this.flareFrequency) {
            // Trigger a flare
            this.flareIntensity = Math.random() * 0.5 + 0.5; // Random intensity between 0.5 and 1.0
            this.lastFlareTime = currentTime;
        } else {
            // Decay flare intensity
            this.flareIntensity *= Math.exp(-deltaTime / 10); // Exponential decay with time constant of 10 seconds
        }
    }
    
    /**
     * Get habitable zone boundaries
     * @returns {Object} Habitable zone boundaries
     */
    getHabitableZone() {
        const solarLuminosity = 3.828e26; // W
        const luminosityRatio = this.luminosity / solarLuminosity;
        
        // Inner boundary (runaway greenhouse)
        const innerBoundary = Math.sqrt(luminosityRatio) * 0.95 * 1.496e11; // m
        
        // Outer boundary (maximum greenhouse)
        const outerBoundary = Math.sqrt(luminosityRatio) * 1.37 * 1.496e11; // m
        
        return {
            inner: innerBoundary,
            outer: outerBoundary
        };
    }
    
    /**
     * Get frost line distance
     * @returns {number} Frost line distance in meters
     */
    getFrostLine() {
        const solarLuminosity = 3.828e26; // W
        const luminosityRatio = this.luminosity / solarLuminosity;
        
        // Frost line is approximately where water ice can condense
        return Math.sqrt(luminosityRatio) * 2.7 * 1.496e11; // m
    }
    
    /**
     * Get tidal locking distance
     * @param {number} bodyAge - Age of the body in years
     * @returns {number} Tidal locking distance in meters
     */
    getTidalLockingDistance(bodyAge = 4.5e9) {
        // Simplified tidal locking distance calculation
        const G = PhysicsConstants.G;
        const bodyAgeInSeconds = bodyAge * 365.25 * 24 * 3600;
        
        // Tidal locking distance depends on mass, rotation period, and age
        const Q = 100; // Tidal dissipation factor (typical value)
        const k2 = 0.3; // Love number (typical value)
        
        const tidalLockingDistance = Math.pow(
            (G * this.mass * this.mass * this.rotationPeriod * this.rotationPeriod * Q) / 
            (2 * Math.PI * k2 * bodyAgeInSeconds),
            1/6
        );
        
        return tidalLockingDistance;
    }
    
    /**
     * Get Roche limit for a body
     * @param {number} bodyDensity - Density of the body in kg/m³
     * @returns {number} Roche limit in meters
     */
    getRocheLimit(bodyDensity = 3000) {
        // Roche limit calculation
        const densityRatio = this.density / bodyDensity;
        const rocheLimit = 2.44 * this.radius * Math.pow(densityRatio, 1/3);
        
        return rocheLimit;
    }
    
    /**
     * Get Hill sphere radius
     * @param {number} semiMajorAxis - Semi-major axis of the star's orbit around its parent
     * @param {number} parentMass - Mass of the parent body
     * @returns {number} Hill sphere radius in meters
     */
    getHillSphereRadius(semiMajorAxis = 0, parentMass = 0) {
        if (semiMajorAxis === 0 || parentMass === 0) {
            return 0;
        }
        
        const massRatio = this.mass / parentMass;
        const hillSphereRadius = semiMajorAxis * Math.pow(massRatio / 3, 1/3);
        
        return hillSphereRadius;
    }
    
    /**
     * Clone the star
     * @returns {Star} Cloned star
     */
    clone() {
        return new Star({
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
            luminosity: this.luminosity,
            temperature: this.temperature,
            spectralClass: this.spectralClass,
            spectralType: this.spectralType,
            stellarClass: this.stellarClass,
            age: this.age,
            metallicity: this.metallicity,
            rotationVelocity: this.rotationVelocity,
            coronaColor: this.coronaColor,
            coronaSize: this.coronaSize,
            coronaOpacity: this.coronaOpacity,
            flareIntensity: this.flareIntensity,
            flareFrequency: this.flareFrequency,
            lastFlareTime: this.lastFlareTime
        });
    }
    
    /**
     * Serialize the star
     * @returns {Object} Serialized star
     */
    serialize() {
        return {
            ...super.serialize(),
            luminosity: this.luminosity,
            temperature: this.temperature,
            spectralClass: this.spectralClass,
            spectralType: this.spectralType,
            stellarClass: this.stellarClass,
            age: this.age,
            metallicity: this.metallicity,
            rotationVelocity: this.rotationVelocity,
            coronaColor: this.coronaColor,
            coronaSize: this.coronaSize,
            coronaOpacity: this.coronaOpacity,
            flareIntensity: this.flareIntensity,
            flareFrequency: this.flareFrequency,
            lastFlareTime: this.lastFlareTime
        };
    }
    
    /**
     * Deserialize a star
     * @param {Object} data - Serialized star
     * @param {Object} bodies - Map of bodies by ID
     * @returns {Star} Deserialized star
     */
    static deserialize(data, bodies = {}) {
        const star = new Star({
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
            luminosity: data.luminosity,
            temperature: data.temperature,
            spectralClass: data.spectralClass,
            spectralType: data.spectralType,
            stellarClass: data.stellarClass,
            age: data.age,
            metallicity: data.metallicity,
            rotationVelocity: data.rotationVelocity,
            coronaColor: data.coronaColor,
            coronaSize: data.coronaSize,
            coronaOpacity: data.coronaOpacity,
            flareIntensity: data.flareIntensity,
            flareFrequency: data.flareFrequency,
            lastFlareTime: data.lastFlareTime
        });
        
        return star;
    }
}