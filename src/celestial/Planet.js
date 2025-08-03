/**
 * Planet class
 * Represents a planet in the simulation
 */

import { CelestialBody } from './CelestialBody.js';
import { MathUtils } from '../utils/index.js';
import { PhysicsConstants } from '../physics/index.js';

/**
 * Planet class
 */
export class Planet extends CelestialBody {
    /**
     * Create a new planet
     * @param {Object} options - Options for the planet
     */
    constructor(options = {}) {
        super({
            ...options,
            type: 'planet'
        });
        
        // Planetary properties
        this.albedo = options.albedo || 0.3; // Bond albedo
        this.greenhouseEffect = options.greenhouseEffect || 0; // K
        this.surfaceTemperature = options.surfaceTemperature || 0; // K
        this.atmosphericPressure = options.atmosphericPressure || 0; // Pa
        this.atmosphericComposition = options.atmosphericComposition || {};
        this.hydrosphere = options.hydrosphere || 0; // Fraction of surface covered by water
        this.biosphere = options.biosphere || 0; // Biosphere rating (0-1)
        this.magneticField = options.magneticField || 0; // Tesla
        this.geologicalActivity = options.geologicalActivity || 0; // Activity rating (0-1)
        this.tectonicPlates = options.tectonicPlates || 0; // Number of tectonic plates
        
        // Orbital properties
        this.resonance = options.resonance || null; // Orbital resonance
        this.tidallyLocked = options.tidallyLocked || false;
        this.rotationSynchronized = options.rotationSynchronized || false;
        
        // Ring properties
        this.hasRings = options.hasRings || false;
        this.ringInnerRadius = options.ringInnerRadius || 0; // m
        this.ringOuterRadius = options.ringOuterRadius || 0; // m
        this.ringOpacity = options.ringOpacity || 0.5;
        this.ringColor = options.ringColor || 0xcccccc;
        
        // Moon system properties
        this.moons = options.moons || [];
        
        // Calculate derived properties
        this.calculatePlanetaryProperties();
    }
    
    /**
     * Calculate planetary properties
     */
    calculatePlanetaryProperties() {
        // Calculate surface temperature from parent star
        if (this.surfaceTemperature === 0 && this.parent && this.parent.type === 'star') {
            this.calculateSurfaceTemperature();
        }
        
        // Calculate greenhouse effect from atmospheric composition
        if (this.greenhouseEffect === 0 && Object.keys(this.atmosphericComposition).length > 0) {
            this.calculateGreenhouseEffect();
        }
        
        // Calculate magnetic field from rotation and core properties
        if (this.magneticField === 0 && this.rotationPeriod > 0) {
            this.calculateMagneticField();
        }
        
        // Calculate geological activity from mass and age
        if (this.geologicalActivity === 0) {
            this.calculateGeologicalActivity();
        }
        
        // Check if planet is tidally locked
        if (this.parent && this.parent.type === 'star') {
            this.checkTidalLocking();
        }
    }
    
    /**
     * Calculate surface temperature from parent star
     */
    calculateSurfaceTemperature() {
        if (!this.parent || this.parent.type !== 'star') {
            return;
        }
        
        // Distance from parent star
        const dx = this.position.x - this.parent.position.x;
        const dy = this.position.y - this.parent.position.y;
        const dz = this.position.z - this.parent.position.z;
        const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);
        
        // Solar constant at planet's distance
        const solarConstant = this.parent.luminosity / (4 * Math.PI * distance * distance);
        
        // Effective temperature (Stefan-Boltzmann law)
        const stefanBoltzmannConstant = 5.670374419e-8; // W/(m²·K⁴)
        const effectiveTemperature = Math.pow(
            (solarConstant * (1 - this.albedo)) / (4 * stefanBoltzmannConstant),
            0.25
        );
        
        // Surface temperature with greenhouse effect
        this.surfaceTemperature = effectiveTemperature + this.greenhouseEffect;
    }
    
    /**
     * Calculate greenhouse effect from atmospheric composition
     */
    calculateGreenhouseEffect() {
        // Simplified greenhouse effect calculation
        let greenhouseEffect = 0;
        
        // CO2 contribution
        if (this.atmosphericComposition.CO2) {
            greenhouseEffect += this.atmosphericComposition.CO2 * 20; // K
        }
        
        // H2O contribution
        if (this.atmosphericComposition.H2O) {
            greenhouseEffect += this.atmosphericComposition.H2O * 30; // K
        }
        
        // CH4 contribution
        if (this.atmosphericComposition.CH4) {
            greenhouseEffect += this.atmosphericComposition.CH4 * 50; // K
        }
        
        // N2O contribution
        if (this.atmosphericComposition.N2O) {
            greenhouseEffect += this.atmosphericComposition.N2O * 100; // K
        }
        
        this.greenhouseEffect = greenhouseEffect;
    }
    
    /**
     * Calculate magnetic field from rotation and core properties
     */
    calculateMagneticField() {
        // Simplified magnetic field calculation
        // Assumes a molten core and rotation
        const earthMagneticField = 3.12e-5; // Tesla
        const earthMass = 5.972e24; // kg
        const earthRotationPeriod = 24 * 3600; // s
        
        const massRatio = this.mass / earthMass;
        const rotationRatio = earthRotationPeriod / this.rotationPeriod;
        
        // Magnetic field strength proportional to mass and rotation rate
        this.magneticField = earthMagneticField * massRatio * rotationRatio;
    }
    
    /**
     * Calculate geological activity from mass and age
     */
    calculateGeologicalActivity() {
        // Simplified geological activity calculation
        // Based on mass and cooling rate
        const earthMass = 5.972e24; // kg
        const earthAge = 4.5e9; // years
        
        const massRatio = this.mass / earthMass;
        const ageRatio = earthAge / (this.age || earthAge);
        
        // Geological activity decreases with age but increases with mass
        this.geologicalActivity = Math.min(1, massRatio * ageRatio * 0.5);
        
        // Estimate number of tectonic plates
        this.tectonicPlates = Math.floor(5 + Math.random() * 10 * this.geologicalActivity);
    }
    
    /**
     * Check if planet is tidally locked
     */
    checkTidalLocking() {
        if (!this.parent || this.parent.type !== 'star') {
            return;
        }
        
        // Distance from parent star
        const dx = this.position.x - this.parent.position.x;
        const dy = this.position.y - this.parent.position.y;
        const dz = this.position.z - this.parent.position.z;
        const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);
        
        // Tidal locking distance
        const tidalLockingDistance = this.parent.getTidalLockingDistance(this.age || 4.5e9);
        
        // Check if planet is tidally locked
        this.tidallyLocked = distance < tidalLockingDistance;
        
        // Check if rotation is synchronized (like Mercury)
        if (!this.tidallyLocked && this.orbitalPeriod > 0) {
            const resonanceRatio = this.rotationPeriod / this.orbitalPeriod;
            
            // Check for 3:2 resonance (like Mercury)
            if (Math.abs(resonanceRatio - 2/3) < 0.01) {
                this.resonance = '3:2';
                this.rotationSynchronized = true;
            }
            // Check for 1:1 resonance (tidally locked)
            else if (Math.abs(resonanceRatio - 1) < 0.01) {
                this.resonance = '1:1';
                this.tidallyLocked = true;
                this.rotationSynchronized = true;
            }
        }
    }
    
    /**
     * Add a moon to the planet
     * @param {CelestialBody} moon - Moon to add
     */
    addMoon(moon) {
        moon.parent = this;
        this.moons.push(moon);
    }
    
    /**
     * Remove a moon from the planet
     * @param {string} moonId - ID of the moon to remove
     * @returns {CelestialBody|null} Removed moon or null if not found
     */
    removeMoon(moonId) {
        const index = this.moons.findIndex(moon => moon.id === moonId);
        
        if (index !== -1) {
            const moon = this.moons[index];
            moon.parent = null;
            this.moons.splice(index, 1);
            return moon;
        }
        
        return null;
    }
    
    /**
     * Get a moon by ID
     * @param {string} moonId - ID of the moon
     * @returns {CelestialBody|null} Moon or null if not found
     */
    getMoon(moonId) {
        return this.moons.find(moon => moon.id === moonId) || null;
    }
    
    /**
     * Get all moons
     * @returns {Array} Array of moons
     */
    getMoons() {
        return [...this.moons];
    }
    
    /**
     * Update the planet
     * @param {number} deltaTime - Time step in seconds
     * @param {boolean} useNBody - Whether to use N-body simulation
     */
    update(deltaTime, useNBody = false) {
        super.update(deltaTime, useNBody);
        
        // Update planetary properties
        this.updatePlanetaryEvolution(deltaTime);
        
        // Update moons
        for (const moon of this.moons) {
            moon.update(deltaTime, useNBody);
        }
    }
    
    /**
     * Update planetary evolution
     * @param {number} deltaTime - Time step in seconds
     */
    updatePlanetaryEvolution(deltaTime) {
        // Convert deltaTime to years
        const deltaYears = deltaTime / (365.25 * 24 * 3600);
        
        // Update age
        this.age += deltaYears;
        
        // Update geological activity (decreases with age)
        this.geologicalActivity *= Math.exp(-deltaYears / 1e9);
        
        // Update magnetic field (decreases with cooling)
        this.magneticField *= Math.exp(-deltaYears / 2e9);
        
        // Update surface temperature
        this.calculateSurfaceTemperature();
        
        // Check tidal locking status
        this.checkTidalLocking();
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
     * Calculate Roche limit for a moon
     * @param {number} moonDensity - Density of the moon in kg/m³
     * @returns {number} Roche limit in meters
     */
    getRocheLimit(moonDensity = 3000) {
        // Roche limit calculation
        const densityRatio = this.density / moonDensity;
        const rocheLimit = 2.44 * this.radius * Math.pow(densityRatio, 1/3);
        
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
     * Calculate synodic period with another planet
     * @param {Planet} otherPlanet - Other planet
     * @returns {number} Synodic period in seconds
     */
    calculateSynodicPeriod(otherPlanet) {
        if (this.orbitalPeriod === 0 || otherPlanet.orbitalPeriod === 0) {
            return 0;
        }
        
        const synodicPeriod = Math.abs(1 / (1 / this.orbitalPeriod - 1 / otherPlanet.orbitalPeriod));
        
        return synodicPeriod;
    }
    
    /**
     * Calculate orbital phase angle with another planet
     * @param {Planet} otherPlanet - Other planet
     * @returns {number} Phase angle in radians
     */
    calculatePhaseAngle(otherPlanet) {
        // Calculate positions relative to parent
        const r1 = {
            x: this.position.x - this.parent.position.x,
            y: this.position.y - this.parent.position.y,
            z: this.position.z - this.parent.position.z
        };
        
        const r2 = {
            x: otherPlanet.position.x - this.parent.position.x,
            y: otherPlanet.position.y - this.parent.position.y,
            z: otherPlanet.position.z - this.parent.position.z
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
     * Check if planet is in habitable zone
     * @returns {boolean} True if planet is in habitable zone
     */
    isInHabitableZone() {
        if (!this.parent || this.parent.type !== 'star') {
            return false;
        }
        
        const habitableZone = this.parent.getHabitableZone();
        
        // Distance from parent star
        const dx = this.position.x - this.parent.position.x;
        const dy = this.position.y - this.parent.position.y;
        const dz = this.position.z - this.parent.position.z;
        const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);
        
        return distance >= habitableZone.inner && distance <= habitableZone.outer;
    }
    
    /**
     * Calculate habitability rating
     * @returns {number} Habitability rating (0-1)
     */
    calculateHabitabilityRating() {
        let rating = 0;
        
        // Check if in habitable zone
        if (this.isInHabitableZone()) {
            rating += 0.3;
        }
        
        // Check surface temperature
        if (this.surfaceTemperature >= 273 && this.surfaceTemperature <= 373) {
            rating += 0.2;
        }
        
        // Check for liquid water
        if (this.hydrosphere > 0) {
            rating += 0.2 * Math.min(1, this.hydrosphere);
        }
        
        // Check atmosphere
        if (this.atmosphericPressure > 10000 && this.atmosphericPressure < 1000000) {
            rating += 0.1;
        }
        
        // Check magnetic field
        if (this.magneticField > 1e-7) {
            rating += 0.1;
        }
        
        // Check geological activity
        if (this.geologicalActivity > 0.1) {
            rating += 0.1;
        }
        
        return Math.min(1, rating);
    }
    
    /**
     * Clone the planet
     * @returns {Planet} Cloned planet
     */
    clone() {
        const planet = new Planet({
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
            greenhouseEffect: this.greenhouseEffect,
            surfaceTemperature: this.surfaceTemperature,
            atmosphericPressure: this.atmosphericPressure,
            atmosphericComposition: { ...this.atmosphericComposition },
            hydrosphere: this.hydrosphere,
            biosphere: this.biosphere,
            magneticField: this.magneticField,
            geologicalActivity: this.geologicalActivity,
            tectonicPlates: this.tectonicPlates,
            resonance: this.resonance,
            tidallyLocked: this.tidallyLocked,
            rotationSynchronized: this.rotationSynchronized,
            hasRings: this.hasRings,
            ringInnerRadius: this.ringInnerRadius,
            ringOuterRadius: this.ringOuterRadius,
            ringOpacity: this.ringOpacity,
            ringColor: this.ringColor
        });
        
        // Clone moons
        for (const moon of this.moons) {
            planet.addMoon(moon.clone());
        }
        
        return planet;
    }
    
    /**
     * Serialize the planet
     * @returns {Object} Serialized planet
     */
    serialize() {
        return {
            ...super.serialize(),
            albedo: this.albedo,
            greenhouseEffect: this.greenhouseEffect,
            surfaceTemperature: this.surfaceTemperature,
            atmosphericPressure: this.atmosphericPressure,
            atmosphericComposition: { ...this.atmosphericComposition },
            hydrosphere: this.hydrosphere,
            biosphere: this.biosphere,
            magneticField: this.magneticField,
            geologicalActivity: this.geologicalActivity,
            tectonicPlates: this.tectonicPlates,
            resonance: this.resonance,
            tidallyLocked: this.tidallyLocked,
            rotationSynchronized: this.rotationSynchronized,
            hasRings: this.hasRings,
            ringInnerRadius: this.ringInnerRadius,
            ringOuterRadius: this.ringOuterRadius,
            ringOpacity: this.ringOpacity,
            ringColor: this.ringColor,
            moonIds: this.moons.map(moon => moon.id)
        };
    }
    
    /**
     * Deserialize a planet
     * @param {Object} data - Serialized planet
     * @param {Object} bodies - Map of bodies by ID
     * @returns {Planet} Deserialized planet
     */
    static deserialize(data, bodies = {}) {
        const planet = new Planet({
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
            greenhouseEffect: data.greenhouseEffect,
            surfaceTemperature: data.surfaceTemperature,
            atmosphericPressure: data.atmosphericPressure,
            atmosphericComposition: data.atmosphericComposition,
            hydrosphere: data.hydrosphere,
            biosphere: data.biosphere,
            magneticField: data.magneticField,
            geologicalActivity: data.geologicalActivity,
            tectonicPlates: data.tectonicPlates,
            resonance: data.resonance,
            tidallyLocked: data.tidallyLocked,
            rotationSynchronized: data.rotationSynchronized,
            hasRings: data.hasRings,
            ringInnerRadius: data.ringInnerRadius,
            ringOuterRadius: data.ringOuterRadius,
            ringOpacity: data.ringOpacity,
            ringColor: data.ringColor
        });
        
        // Add moons
        if (data.moonIds) {
            for (const moonId of data.moonIds) {
                if (bodies[moonId]) {
                    planet.addMoon(bodies[moonId]);
                }
            }
        }
        
        return planet;
    }
}