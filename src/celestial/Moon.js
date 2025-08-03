/**
 * Moon class
 * Represents a moon in the simulation
 */

import { CelestialBody } from './CelestialBody.js';
import { MathUtils } from '../utils/index.js';
import { PhysicsConstants } from '../physics/index.js';

/**
 * Moon class
 */
export class Moon extends CelestialBody {
    /**
     * Create a new moon
     * @param {Object} options - Options for the moon
     */
    constructor(options = {}) {
        super({
            ...options,
            type: 'moon'
        });
        
        // Lunar properties
        this.albedo = options.albedo || 0.12; // Bond albedo
        this.surfaceTemperature = options.surfaceTemperature || 0; // K
        this.atmosphericPressure = options.atmosphericPressure || 0; // Pa
        this.atmosphericComposition = options.atmosphericComposition || {};
        this.hydrosphere = options.hydrosphere || 0; // Fraction of surface covered by water
        this.magneticField = options.magneticField || 0; // Tesla
        this.geologicalActivity = options.geologicalActivity || 0; // Activity rating (0-1)
        
        // Orbital properties
        this.resonance = options.resonance || null; // Orbital resonance
        this.tidallyLocked = options.tidallyLocked || true; // Most moons are tidally locked
        this.rotationSynchronized = options.rotationSynchronized || true;
        
        // Surface properties
        this.craterDensity = options.craterDensity || 0.5; // Crater density (0-1)
        this.surfaceAge = options.surfaceAge || 0; // Surface age in years
        this.tidalHeating = options.tidalHeating || 0; // Tidal heating in W
        
        // Calculate derived properties
        this.calculateLunarProperties();
    }
    
    /**
     * Calculate lunar properties
     */
    calculateLunarProperties() {
        // Calculate surface temperature from parent planet and star
        if (this.surfaceTemperature === 0) {
            this.calculateSurfaceTemperature();
        }
        
        // Calculate tidal heating
        if (this.tidalHeating === 0 && this.parent) {
            this.calculateTidalHeating();
        }
        
        // Check if moon is tidally locked
        if (this.parent) {
            this.checkTidalLocking();
        }
    }
    
    /**
     * Calculate surface temperature from parent planet and star
     */
    calculateSurfaceTemperature() {
        // Start with temperature from parent star
        let surfaceTemperature = 0;
        
        if (this.parent && this.parent.parent && this.parent.parent.type === 'star') {
            // Distance from parent star
            const dx = this.position.x - this.parent.parent.position.x;
            const dy = this.position.y - this.parent.parent.position.y;
            const dz = this.position.z - this.parent.parent.position.z;
            const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);
            
            // Solar constant at moon's distance
            const solarConstant = this.parent.parent.luminosity / (4 * Math.PI * distance * distance);
            
            // Effective temperature (Stefan-Boltzmann law)
            const stefanBoltzmannConstant = 5.670374419e-8; // W/(m²·K⁴)
            const effectiveTemperature = Math.pow(
                (solarConstant * (1 - this.albedo)) / (4 * stefanBoltzmannConstant),
                0.25
            );
            
            surfaceTemperature = effectiveTemperature;
        }
        
        // Add contribution from parent planet's thermal radiation
        if (this.parent) {
            // Distance from parent planet
            const dx = this.position.x - this.parent.position.x;
            const dy = this.position.y - this.parent.position.y;
            const dz = this.position.z - this.parent.position.z;
            const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);
            
            // Planet's thermal radiation
            if (this.parent.surfaceTemperature > 0) {
                const stefanBoltzmannConstant = 5.670374419e-8; // W/(m²·K⁴)
                const planetRadiation = stefanBoltzmannConstant * Math.pow(this.parent.surfaceTemperature, 4) * 
                                     Math.PI * Math.pow(this.parent.radius, 2);
                
                // Radiation at moon's distance
                const radiationAtMoon = planetRadiation / (4 * Math.PI * distance * distance);
                
                // Temperature contribution from planet
                const planetTemperature = Math.pow(
                    (radiationAtMoon * (1 - this.albedo)) / (4 * stefanBoltzmannConstant),
                    0.25
                );
                
                surfaceTemperature = Math.pow(Math.pow(surfaceTemperature, 4) + Math.pow(planetTemperature, 4), 0.25);
            }
            
            // Add reflected light from parent planet
            if (this.parent.albedo > 0) {
                // Distance from parent star to planet
                const starDx = this.parent.position.x - this.parent.parent.position.x;
                const starDy = this.parent.position.y - this.parent.parent.position.y;
                const starDz = this.parent.position.z - this.parent.parent.position.z;
                const starDistance = Math.sqrt(starDx * starDx + starDy * starDy + starDz * starDz);
                
                // Solar constant at planet's distance
                const solarConstant = this.parent.parent.luminosity / (4 * Math.PI * starDistance * starDistance);
                
                // Cross-sectional area of planet
                const planetCrossSection = Math.PI * Math.pow(this.parent.radius, 2);
                
                // Reflected radiation
                const reflectedRadiation = solarConstant * this.parent.albedo * planetCrossSection;
                
                // Reflected radiation at moon's distance
                const reflectedAtMoon = reflectedRadiation / (4 * Math.PI * distance * distance);
                
                // Temperature contribution from reflected light
                const reflectedTemperature = Math.pow(
                    (reflectedAtMoon * (1 - this.albedo)) / (4 * stefanBoltzmannConstant),
                    0.25
                );
                
                surfaceTemperature = Math.pow(Math.pow(surfaceTemperature, 4) + Math.pow(reflectedTemperature, 4), 0.25);
            }
        }
        
        // Add tidal heating contribution
        if (this.tidalHeating > 0) {
            const stefanBoltzmannConstant = 5.670374419e-8; // W/(m²·K⁴)
            const surfaceArea = 4 * Math.PI * this.radius * this.radius;
            const tidalFlux = this.tidalHeating / surfaceArea;
            
            const tidalTemperature = Math.pow(tidalFlux / stefanBoltzmannConstant, 0.25);
            
            surfaceTemperature = Math.pow(Math.pow(surfaceTemperature, 4) + Math.pow(tidalTemperature, 4), 0.25);
        }
        
        this.surfaceTemperature = surfaceTemperature;
    }
    
    /**
     * Calculate tidal heating
     */
    calculateTidalHeating() {
        if (!this.parent) {
            return;
        }
        
        // Simplified tidal heating calculation
        const G = PhysicsConstants.G;
        const parentMass = this.parent.mass;
        const moonMass = this.mass;
        const moonRadius = this.radius;
        const distance = this.semiMajorAxis;
        const eccentricity = this.eccentricity;
        const orbitalPeriod = this.orbitalPeriod;
        
        // Tidal heating depends on mass, distance, eccentricity, and rigidity
        const rigidity = 5e10; // Pa (typical for rocky bodies)
        const loveNumber = 0.03; // Typical for moons
        
        // Tidal heating formula (simplified)
        const tidalHeating = (21 / 2) * loveNumber * 
                           (G * Math.pow(parentMass, 2) * Math.pow(moonRadius, 5) * eccentricity * eccentricity) / 
                           (rigidity * Math.pow(distance, 6) * orbitalPeriod);
        
        this.tidalHeating = tidalHeating;
    }
    
    /**
     * Check if moon is tidally locked
     */
    checkTidalLocking() {
        if (!this.parent) {
            return;
        }
        
        // Most moons are tidally locked to their parent planet
        // For simplicity, we'll assume all moons are tidally locked
        this.tidallyLocked = true;
        
        // Set rotation period to match orbital period
        this.rotationPeriod = this.orbitalPeriod;
        
        // Check for orbital resonances
        if (this.parent.parent && this.parent.parent.type === 'star') {
            // Check for Laplace resonance (1:2:4)
            const parentOrbitalPeriod = this.parent.orbitalPeriod;
            const ratio = parentOrbitalPeriod / this.orbitalPeriod;
            
            if (Math.abs(ratio - 2) < 0.01) {
                this.resonance = '1:2';
            } else if (Math.abs(ratio - 4) < 0.01) {
                this.resonance = '1:4';
            }
        }
    }
    
    /**
     * Update the moon
     * @param {number} deltaTime - Time step in seconds
     * @param {boolean} useNBody - Whether to use N-body simulation
     */
    update(deltaTime, useNBody = false) {
        super.update(deltaTime, useNBody);
        
        // Update lunar properties
        this.updateLunarEvolution(deltaTime);
    }
    
    /**
     * Update lunar evolution
     * @param {number} deltaTime - Time step in seconds
     */
    updateLunarEvolution(deltaTime) {
        // Convert deltaTime to years
        const deltaYears = deltaTime / (365.25 * 24 * 3600);
        
        // Update age
        this.age += deltaYears;
        
        // Update surface age (affected by geological activity and impacts)
        if (this.geologicalActivity > 0) {
            // Geological activity resets surface age
            this.surfaceAge *= Math.exp(-deltaYears / (1e9 / this.geologicalActivity));
        }
        
        // Update crater density (increases with time)
        if (this.surfaceAge > 0) {
            this.craterDensity = Math.min(1, this.surfaceAge / 4.5e9);
        }
        
        // Update geological activity (decreases with age)
        this.geologicalActivity *= Math.exp(-deltaYears / 1e9);
        
        // Update magnetic field (decreases with cooling)
        this.magneticField *= Math.exp(-deltaYears / 2e9);
        
        // Update surface temperature
        this.calculateSurfaceTemperature();
        
        // Update tidal heating
        this.calculateTidalHeating();
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
     * Calculate synodic period with another moon
     * @param {Moon} otherMoon - Other moon
     * @returns {number} Synodic period in seconds
     */
    calculateSynodicPeriod(otherMoon) {
        if (this.orbitalPeriod === 0 || otherMoon.orbitalPeriod === 0) {
            return 0;
        }
        
        const synodicPeriod = Math.abs(1 / (1 / this.orbitalPeriod - 1 / otherMoon.orbitalPeriod));
        
        return synodicPeriod;
    }
    
    /**
     * Calculate orbital phase angle with another moon
     * @param {Moon} otherMoon - Other moon
     * @returns {number} Phase angle in radians
     */
    calculatePhaseAngle(otherMoon) {
        // Calculate positions relative to parent
        const r1 = {
            x: this.position.x - this.parent.position.x,
            y: this.position.y - this.parent.position.y,
            z: this.position.z - this.parent.position.z
        };
        
        const r2 = {
            x: otherMoon.position.x - this.parent.position.x,
            y: otherMoon.position.y - this.parent.position.y,
            z: otherMoon.position.z - this.parent.position.z
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
     * Check if moon is within Roche limit
     * @returns {boolean} True if moon is within Roche limit
     */
    isWithinRocheLimit() {
        if (!this.parent) {
            return false;
        }
        
        // Distance from parent
        const dx = this.position.x - this.parent.position.x;
        const dy = this.position.y - this.parent.position.y;
        const dz = this.position.z - this.parent.position.z;
        const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);
        
        const rocheLimit = this.getRocheLimit();
        
        return distance < rocheLimit;
    }
    
    /**
     * Calculate tidal force from parent
     * @returns {Object} Tidal force vector
     */
    calculateTidalForce() {
        if (!this.parent) {
            return { x: 0, y: 0, z: 0 };
        }
        
        // Distance from parent
        const dx = this.position.x - this.parent.position.x;
        const dy = this.position.y - this.parent.position.y;
        const dz = this.position.z - this.parent.position.z;
        const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);
        
        // Tidal force is proportional to the gradient of the gravitational field
        const G = PhysicsConstants.G;
        const parentMass = this.parent.mass;
        const moonRadius = this.radius;
        
        // Tidal force magnitude (simplified)
        const tidalForceMagnitude = (2 * G * parentMass * moonRadius) / Math.pow(distance, 3);
        
        // Direction (away from parent)
        const direction = {
            x: dx / distance,
            y: dy / distance,
            z: dz / distance
        };
        
        return {
            x: tidalForceMagnitude * direction.x,
            y: tidalForceMagnitude * direction.y,
            z: tidalForceMagnitude * direction.z
        };
    }
    
    /**
     * Clone the moon
     * @returns {Moon} Cloned moon
     */
    clone() {
        return new Moon({
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
            atmosphericPressure: this.atmosphericPressure,
            atmosphericComposition: { ...this.atmosphericComposition },
            hydrosphere: this.hydrosphere,
            magneticField: this.magneticField,
            geologicalActivity: this.geologicalActivity,
            resonance: this.resonance,
            tidallyLocked: this.tidallyLocked,
            rotationSynchronized: this.rotationSynchronized,
            craterDensity: this.craterDensity,
            surfaceAge: this.surfaceAge,
            tidalHeating: this.tidalHeating
        });
    }
    
    /**
     * Serialize the moon
     * @returns {Object} Serialized moon
     */
    serialize() {
        return {
            ...super.serialize(),
            albedo: this.albedo,
            surfaceTemperature: this.surfaceTemperature,
            atmosphericPressure: this.atmosphericPressure,
            atmosphericComposition: { ...this.atmosphericComposition },
            hydrosphere: this.hydrosphere,
            magneticField: this.magneticField,
            geologicalActivity: this.geologicalActivity,
            resonance: this.resonance,
            tidallyLocked: this.tidallyLocked,
            rotationSynchronized: this.rotationSynchronized,
            craterDensity: this.craterDensity,
            surfaceAge: this.surfaceAge,
            tidalHeating: this.tidalHeating
        };
    }
    
    /**
     * Deserialize a moon
     * @param {Object} data - Serialized moon
     * @param {Object} bodies - Map of bodies by ID
     * @returns {Moon} Deserialized moon
     */
    static deserialize(data, bodies = {}) {
        const moon = new Moon({
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
            atmosphericPressure: data.atmosphericPressure,
            atmosphericComposition: data.atmosphericComposition,
            hydrosphere: data.hydrosphere,
            magneticField: data.magneticField,
            geologicalActivity: data.geologicalActivity,
            resonance: data.resonance,
            tidallyLocked: data.tidallyLocked,
            rotationSynchronized: data.rotationSynchronized,
            craterDensity: data.craterDensity,
            surfaceAge: data.surfaceAge,
            tidalHeating: data.tidalHeating
        });
        
        return moon;
    }
}