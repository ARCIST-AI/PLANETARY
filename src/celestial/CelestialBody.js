/**
 * CelestialBody class
 * Base class for all celestial bodies
 */

import { MathUtils } from '../utils/index.js';
import { PhysicsConstants } from '../physics/index.js';

/**
 * CelestialBody class
 */
export class CelestialBody {
    /**
     * Create a new celestial body
     * @param {Object} options - Options for the celestial body
     */
    constructor(options = {}) {
        // Basic properties
        this.id = options.id || MathUtils.generateUUID();
        this.name = options.name || 'Unnamed Body';
        this.type = options.type || 'body';
        this.parent = options.parent || null;
        
        // Physical properties
        this.mass = options.mass || 0; // kg
        this.radius = options.radius || 0; // m
        this.density = options.density || 0; // kg/m³
        this.gravity = options.gravity || 0; // m/s²
        this.escapeVelocity = options.escapeVelocity || 0; // m/s
        
        // Orbital properties
        this.semiMajorAxis = options.semiMajorAxis || 0; // m
        this.eccentricity = options.eccentricity || 0;
        this.inclination = options.inclination || 0; // rad
        this.longitudeOfAscendingNode = options.longitudeOfAscendingNode || 0; // rad
        this.argumentOfPeriapsis = options.argumentOfPeriapsis || 0; // rad
        this.meanAnomalyAtEpoch = options.meanAnomalyAtEpoch || 0; // rad
        this.epoch = options.epoch || new Date();
        this.orbitalPeriod = options.orbitalPeriod || 0; // s
        this.meanMotion = options.meanMotion || 0; // rad/s
        
        // Rotation properties
        this.rotationPeriod = options.rotationPeriod || 0; // s
        this.axialTilt = options.axialTilt || 0; // rad
        this.rotationAngle = options.rotationAngle || 0; // rad
        
        // Position and velocity
        this.position = options.position || { x: 0, y: 0, z: 0 };
        this.velocity = options.velocity || { x: 0, y: 0, z: 0 };
        this.acceleration = options.acceleration || { x: 0, y: 0, z: 0 };
        
        // Visual properties
        this.color = options.color || 0xffffff;
        this.texture = options.texture || null;
        this.emissive = options.emissive || 0x000000;
        this.emissiveIntensity = options.emissiveIntensity || 0;
        this.shininess = options.shininess || 30;
        this.opacity = options.opacity || 1;
        this.transparent = options.transparent || false;
        
        // Additional properties
        this.customProperties = options.customProperties || {};
        
        // Calculate derived properties
        this.calculateDerivedProperties();
    }
    
    /**
     * Calculate derived properties
     */
    calculateDerivedProperties() {
        // Calculate density if not provided
        if (this.density === 0 && this.mass > 0 && this.radius > 0) {
            const volume = (4 / 3) * Math.PI * Math.pow(this.radius, 3);
            this.density = this.mass / volume;
        }
        
        // Calculate gravity if not provided
        if (this.gravity === 0 && this.mass > 0 && this.radius > 0) {
            this.gravity = (PhysicsConstants.G * this.mass) / Math.pow(this.radius, 2);
        }
        
        // Calculate escape velocity if not provided
        if (this.escapeVelocity === 0 && this.mass > 0 && this.radius > 0) {
            this.escapeVelocity = Math.sqrt((2 * PhysicsConstants.G * this.mass) / this.radius);
        }
        
        // Calculate orbital period if not provided
        if (this.orbitalPeriod === 0 && this.semiMajorAxis > 0 && this.parent && this.parent.mass > 0) {
            this.orbitalPeriod = 2 * Math.PI * Math.sqrt(Math.pow(this.semiMajorAxis, 3) / (PhysicsConstants.G * this.parent.mass));
        }
        
        // Calculate mean motion if not provided
        if (this.meanMotion === 0 && this.orbitalPeriod > 0) {
            this.meanMotion = (2 * Math.PI) / this.orbitalPeriod;
        }
    }
    
    /**
     * Update position and velocity
     * @param {number} deltaTime - Time step in seconds
     * @param {boolean} useNBody - Whether to use N-body simulation
     */
    update(deltaTime, useNBody = false) {
        if (useNBody) {
            // Update velocity based on acceleration
            this.velocity.x += this.acceleration.x * deltaTime;
            this.velocity.y += this.acceleration.y * deltaTime;
            this.velocity.z += this.acceleration.z * deltaTime;
            
            // Update position based on velocity
            this.position.x += this.velocity.x * deltaTime;
            this.position.y += this.velocity.y * deltaTime;
            this.position.z += this.velocity.z * deltaTime;
        } else {
            // Update position using Keplerian orbital elements
            this.updateKeplerianOrbit(deltaTime);
        }
        
        // Update rotation
        if (this.rotationPeriod > 0) {
            this.rotationAngle += (2 * Math.PI * deltaTime) / this.rotationPeriod;
            this.rotationAngle %= (2 * Math.PI);
        }
    }
    
    /**
     * Update position using Keplerian orbital elements
     * @param {number} deltaTime - Time step in seconds
     */
    updateKeplerianOrbit(deltaTime) {
        if (!this.parent || this.semiMajorAxis === 0) {
            return;
        }
        
        // Calculate mean anomaly at current time
        const currentTime = Date.now();
        const timeSinceEpoch = (currentTime - this.epoch.getTime()) / 1000; // Convert to seconds
        const meanAnomaly = this.meanAnomalyAtEpoch + this.meanMotion * timeSinceEpoch;
        
        // Solve Kepler's equation for eccentric anomaly
        let eccentricAnomaly = meanAnomaly;
        for (let i = 0; i < 10; i++) {
            eccentricAnomaly = meanAnomaly + this.eccentricity * Math.sin(eccentricAnomaly);
        }
        
        // Calculate true anomaly
        const trueAnomaly = 2 * Math.atan2(
            Math.sqrt(1 + this.eccentricity) * Math.sin(eccentricAnomaly / 2),
            Math.sqrt(1 - this.eccentricity) * Math.cos(eccentricAnomaly / 2)
        );
        
        // Calculate distance from parent
        const distance = this.semiMajorAxis * (1 - this.eccentricity * Math.cos(eccentricAnomaly));
        
        // Calculate position in orbital plane
        const x = distance * Math.cos(trueAnomaly);
        const y = distance * Math.sin(trueAnomaly);
        
        // Convert to 3D position
        const cosOmega = Math.cos(this.longitudeOfAscendingNode);
        const sinOmega = Math.sin(this.longitudeOfAscendingNode);
        const cosI = Math.cos(this.inclination);
        const sinI = Math.sin(this.inclination);
        const cosW = Math.cos(this.argumentOfPeriapsis);
        const sinW = Math.sin(this.argumentOfPeriapsis);
        
        // Position in parent's coordinate system
        const xParent = (cosOmega * cosW - sinOmega * sinW * cosI) * x + (-cosOmega * sinW - sinOmega * cosW * cosI) * y;
        const yParent = (sinOmega * cosW + cosOmega * sinW * cosI) * x + (-sinOmega * sinW + cosOmega * cosW * cosI) * y;
        const zParent = (sinW * sinI) * x + (cosW * sinI) * y;
        
        // Add parent's position
        this.position.x = this.parent.position.x + xParent;
        this.position.y = this.parent.position.y + yParent;
        this.position.z = this.parent.position.z + zParent;
        
        // Calculate velocity (simplified)
        const mu = PhysicsConstants.G * this.parent.mass;
        const h = Math.sqrt(mu * this.semiMajorAxis * (1 - this.eccentricity * this.eccentricity));
        const r = distance;
        const vx = -mu / h * Math.sin(trueAnomaly);
        const vy = mu / h * (this.eccentricity + Math.cos(trueAnomaly));
        
        // Convert to 3D velocity
        this.velocity.x = this.parent.velocity.x + (cosOmega * cosW - sinOmega * sinW * cosI) * vx + (-cosOmega * sinW - sinOmega * cosW * cosI) * vy;
        this.velocity.y = this.parent.velocity.y + (sinOmega * cosW + cosOmega * sinW * cosI) * vx + (-sinOmega * sinW + cosOmega * cosW * cosI) * vy;
        this.velocity.z = this.parent.velocity.z + (sinW * sinI) * vx + (cosW * sinI) * vy;
    }
    
    /**
     * Calculate gravitational force from another body
     * @param {CelestialBody} other - Other celestial body
     * @returns {Object} Gravitational force vector
     */
    calculateGravitationalForce(other) {
        const dx = other.position.x - this.position.x;
        const dy = other.position.y - this.position.y;
        const dz = other.position.z - this.position.z;
        
        const distanceSquared = dx * dx + dy * dy + dz * dz;
        const distance = Math.sqrt(distanceSquared);
        
        // Avoid division by zero
        if (distance < this.radius + other.radius) {
            return { x: 0, y: 0, z: 0 };
        }
        
        const forceMagnitude = (PhysicsConstants.G * this.mass * other.mass) / distanceSquared;
        
        return {
            x: forceMagnitude * dx / distance,
            y: forceMagnitude * dy / distance,
            z: forceMagnitude * dz / distance
        };
    }
    
    /**
     * Calculate acceleration from forces
     * @param {Array} forces - Array of force vectors
     */
    calculateAcceleration(forces) {
        this.acceleration = { x: 0, y: 0, z: 0 };
        
        for (const force of forces) {
            this.acceleration.x += force.x / this.mass;
            this.acceleration.y += force.y / this.mass;
            this.acceleration.z += force.z / this.mass;
        }
    }
    
    /**
     * Get orbital elements from position and velocity
     * @returns {Object} Orbital elements
     */
    getOrbitalElements() {
        if (!this.parent) {
            return null;
        }
        
        const mu = PhysicsConstants.G * this.parent.mass;
        
        // Position and velocity relative to parent
        const r = {
            x: this.position.x - this.parent.position.x,
            y: this.position.y - this.parent.position.y,
            z: this.position.z - this.parent.position.z
        };
        
        const v = {
            x: this.velocity.x - this.parent.velocity.x,
            y: this.velocity.y - this.parent.velocity.y,
            z: this.velocity.z - this.parent.velocity.z
        };
        
        const rMagnitude = Math.sqrt(r.x * r.x + r.y * r.y + r.z * r.z);
        const vMagnitude = Math.sqrt(v.x * v.x + v.y * v.y + v.z * v.z);
        
        // Specific orbital energy
        const energy = (vMagnitude * vMagnitude) / 2 - mu / rMagnitude;
        
        // Semi-major axis
        const semiMajorAxis = -mu / (2 * energy);
        
        // Eccentricity vector
        const eVector = {
            x: ((vMagnitude * vMagnitude - mu / rMagnitude) * r.x - (r.x * v.x + r.y * v.y + r.z * v.z) * v.x) / mu,
            y: ((vMagnitude * vMagnitude - mu / rMagnitude) * r.y - (r.x * v.x + r.y * v.y + r.z * v.z) * v.y) / mu,
            z: ((vMagnitude * vMagnitude - mu / rMagnitude) * r.z - (r.x * v.x + r.y * v.y + r.z * v.z) * v.z) / mu
        };
        
        const eccentricity = Math.sqrt(eVector.x * eVector.x + eVector.y * eVector.y + eVector.z * eVector.z);
        
        // Inclination
        const hVector = {
            x: r.y * v.z - r.z * v.y,
            y: r.z * v.x - r.x * v.z,
            z: r.x * v.y - r.y * v.x
        };
        
        const hMagnitude = Math.sqrt(hVector.x * hVector.x + hVector.y * hVector.y + hVector.z * hVector.z);
        const inclination = Math.acos(hVector.z / hMagnitude);
        
        // Longitude of ascending node
        const nVector = {
            x: -hVector.y,
            y: hVector.x,
            z: 0
        };
        
        const nMagnitude = Math.sqrt(nVector.x * nVector.x + nVector.y * nVector.y);
        const longitudeOfAscendingNode = Math.acos(nVector.x / nMagnitude);
        
        if (nVector.y < 0) {
            longitudeOfAscendingNode = 2 * Math.PI - longitudeOfAscendingNode;
        }
        
        // Argument of periapsis
        const argumentOfPeriapsis = Math.acos((nVector.x * eVector.x + nVector.y * eVector.y) / (nMagnitude * eccentricity));
        
        if (eVector.z < 0) {
            argumentOfPeriapsis = 2 * Math.PI - argumentOfPeriapsis;
        }
        
        // True anomaly
        const trueAnomaly = Math.acos((eVector.x * r.x + eVector.y * r.y + eVector.z * r.z) / (eccentricity * rMagnitude));
        
        if (r.x * v.x + r.y * v.y + r.z * v.z < 0) {
            trueAnomaly = 2 * Math.PI - trueAnomaly;
        }
        
        return {
            semiMajorAxis,
            eccentricity,
            inclination,
            longitudeOfAscendingNode,
            argumentOfPeriapsis,
            trueAnomaly
        };
    }
    
    /**
     * Set orbital elements
     * @param {Object} elements - Orbital elements
     */
    setOrbitalElements(elements) {
        this.semiMajorAxis = elements.semiMajorAxis || this.semiMajorAxis;
        this.eccentricity = elements.eccentricity || this.eccentricity;
        this.inclination = elements.inclination || this.inclination;
        this.longitudeOfAscendingNode = elements.longitudeOfAscendingNode || this.longitudeOfAscendingNode;
        this.argumentOfPeriapsis = elements.argumentOfPeriapsis || this.argumentOfPeriapsis;
        this.meanAnomalyAtEpoch = elements.meanAnomalyAtEpoch || this.meanAnomalyAtEpoch;
        
        // Calculate derived properties
        this.calculateDerivedProperties();
    }
    
    /**
     * Clone the celestial body
     * @returns {CelestialBody} Cloned celestial body
     */
    clone() {
        return new CelestialBody({
            id: this.id,
            name: this.name,
            type: this.type,
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
            customProperties: { ...this.customProperties }
        });
    }
    
    /**
     * Serialize the celestial body
     * @returns {Object} Serialized celestial body
     */
    serialize() {
        return {
            id: this.id,
            name: this.name,
            type: this.type,
            parentId: this.parent ? this.parent.id : null,
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
            epoch: this.epoch.toISOString(),
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
            customProperties: { ...this.customProperties }
        };
    }
    
    /**
     * Deserialize a celestial body
     * @param {Object} data - Serialized celestial body
     * @param {Object} bodies - Map of bodies by ID
     * @returns {CelestialBody} Deserialized celestial body
     */
    static deserialize(data, bodies = {}) {
        const body = new CelestialBody({
            id: data.id,
            name: data.name,
            type: data.type,
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
            customProperties: data.customProperties
        });
        
        return body;
    }
}