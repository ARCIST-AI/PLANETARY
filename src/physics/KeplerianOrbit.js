import { PHYSICS_CONSTANTS } from '../utils/Constants.js';
import { MathUtils } from '../utils/MathUtils.js';

/**
 * Keplerian orbital mechanics implementation
 */
export class KeplerianOrbit {
    /**
     * Create a new Keplerian orbit
     * @param {Object} elements - Orbital elements
     */
    constructor(elements = {}) {
        this.semiMajorAxis = elements.semiMajorAxis || 0;
        this.eccentricity = elements.eccentricity || 0;
        this.inclination = elements.inclination || 0;
        this.longitudeOfAscendingNode = elements.longitudeOfAscendingNode || 0;
        this.argumentOfPeriapsis = elements.argumentOfPeriapsis || 0;
        this.meanAnomalyAtEpoch = elements.meanAnomalyAtEpoch || 0;
        this.orbitalPeriod = elements.orbitalPeriod || 0;
        this.epoch = elements.epoch || new Date();
        this.centralBodyMass = elements.centralBodyMass || PHYSICS_CONSTANTS.SOLAR_MASS;
        this.G = elements.G || PHYSICS_CONSTANTS.G;
    }

    /**
     * Calculate position at a given time
     * @param {Date} time - Time for position calculation
     * @returns {Object} Position vector
     */
    getPositionAtTime(time) {
        const timeSinceEpoch = (time.getTime() - this.epoch.getTime()) / 1000; // Convert to seconds
        
        // Mean anomaly at time t
        const meanAnomaly = this.meanAnomalyAtEpoch + (2 * Math.PI * timeSinceEpoch) / this.orbitalPeriod;
        
        // Eccentric anomaly (solve Kepler's equation)
        const eccentricAnomaly = MathUtils.solveKeplerEquation(meanAnomaly, this.eccentricity);
        
        // True anomaly
        const trueAnomaly = 2 * Math.atan2(
            Math.sqrt(1 + this.eccentricity) * Math.sin(eccentricAnomaly / 2),
            Math.sqrt(1 - this.eccentricity) * Math.cos(eccentricAnomaly / 2)
        );
        
        // Distance from focus
        const r = this.semiMajorAxis * (1 - this.eccentricity * Math.cos(eccentricAnomaly));
        
        // Position in orbital plane
        const xOrbital = r * Math.cos(trueAnomaly);
        const yOrbital = r * Math.sin(trueAnomaly);
        const zOrbital = 0;
        
        // Rotation matrices for orbital orientation
        const cosOmega = Math.cos(this.longitudeOfAscendingNode);
        const sinOmega = Math.sin(this.longitudeOfAscendingNode);
        const cosI = Math.cos(this.inclination);
        const sinI = Math.sin(this.inclination);
        const cosW = Math.cos(this.argumentOfPeriapsis);
        const sinW = Math.sin(this.argumentOfPeriapsis);
        
        // Transform to 3D space
        const x = (cosOmega * cosW - sinOmega * sinW * cosI) * xOrbital + 
                  (-cosOmega * sinW - sinOmega * cosW * cosI) * yOrbital;
        const y = (sinOmega * cosW + cosOmega * sinW * cosI) * xOrbital + 
                  (-sinOmega * sinW + cosOmega * cosW * cosI) * yOrbital;
        const z = (sinW * sinI) * xOrbital + (cosW * sinI) * yOrbital;
        
        return { x, y, z };
    }

    /**
     * Calculate velocity at a given time
     * @param {Date} time - Time for velocity calculation
     * @returns {Object} Velocity vector
     */
    getVelocityAtTime(time) {
        const timeSinceEpoch = (time.getTime() - this.epoch.getTime()) / 1000; // Convert to seconds
        
        // Mean anomaly at time t
        const meanAnomaly = this.meanAnomalyAtEpoch + (2 * Math.PI * timeSinceEpoch) / this.orbitalPeriod;
        
        // Eccentric anomaly (solve Kepler's equation)
        const eccentricAnomaly = MathUtils.solveKeplerEquation(meanAnomaly, this.eccentricity);
        
        // Mean motion
        const n = 2 * Math.PI / this.orbitalPeriod;
        
        // Velocity in orbital plane
        const factor = n * this.semiMajorAxis / (1 - this.eccentricity * Math.cos(eccentricAnomaly));
        const vxOrbital = -factor * Math.sin(eccentricAnomaly);
        const vyOrbital = factor * Math.sqrt(1 - this.eccentricity * this.eccentricity) * Math.cos(eccentricAnomaly);
        const vzOrbital = 0;
        
        // Rotation matrices for orbital orientation
        const cosOmega = Math.cos(this.longitudeOfAscendingNode);
        const sinOmega = Math.sin(this.longitudeOfAscendingNode);
        const cosI = Math.cos(this.inclination);
        const sinI = Math.sin(this.inclination);
        const cosW = Math.cos(this.argumentOfPeriapsis);
        const sinW = Math.sin(this.argumentOfPeriapsis);
        
        // Transform to 3D space
        const vx = (cosOmega * cosW - sinOmega * sinW * cosI) * vxOrbital + 
                   (-cosOmega * sinW - sinOmega * cosW * cosI) * vyOrbital;
        const vy = (sinOmega * cosW + cosOmega * sinW * cosI) * vxOrbital + 
                   (-sinOmega * sinW + cosOmega * cosW * cosI) * vyOrbital;
        const vz = (sinW * sinI) * vxOrbital + (cosW * sinI) * vyOrbital;
        
        return { x: vx, y: vy, z: vz };
    }

    /**
     * Calculate state (position and velocity) at a given time
     * @param {Date} time - Time for state calculation
     * @returns {Object} State vector with position and velocity
     */
    getStateAtTime(time) {
        return {
            position: this.getPositionAtTime(time),
            velocity: this.getVelocityAtTime(time)
        };
    }

    /**
     * Calculate orbital period from semi-major axis and central body mass
     * @param {number} semiMajorAxis - Semi-major axis
     * @param {number} centralBodyMass - Mass of central body
     * @returns {number} Orbital period in seconds
     */
    static calculateOrbitalPeriod(semiMajorAxis, centralBodyMass) {
        return MathUtils.orbitalPeriod(semiMajorAxis, centralBodyMass, PHYSICS_CONSTANTS.G);
    }

    /**
     * Calculate semi-major axis from orbital period and central body mass
     * @param {number} orbitalPeriod - Orbital period in seconds
     * @param {number} centralBodyMass - Mass of central body
     * @returns {number} Semi-major axis
     */
    static calculateSemiMajorAxis(orbitalPeriod, centralBodyMass) {
        const G = PHYSICS_CONSTANTS.G;
        return Math.pow(G * centralBodyMass * orbitalPeriod * orbitalPeriod / (4 * Math.PI * Math.PI), 1/3);
    }

    /**
     * Calculate eccentricity vector from position and velocity
     * @param {Object} position - Position vector
     * @param {Object} velocity - Velocity vector
     * @param {number} centralBodyMass - Mass of central body
     * @returns {Object} Eccentricity vector
     */
    static calculateEccentricityVector(position, velocity, centralBodyMass) {
        const G = PHYSICS_CONSTANTS.G;
        const r = MathUtils.vectorMagnitude(position);
        const v = MathUtils.vectorMagnitude(velocity);
        
        // Specific orbital energy
        const energy = v * v / 2 - G * centralBodyMass / r;
        
        // Angular momentum vector
        const h = MathUtils.crossProduct(position, velocity);
        const hMag = MathUtils.vectorMagnitude(h);
        
        // Eccentricity vector
        const factor = 1 / (G * centralBodyMass);
        const eVector = MathUtils.subtractVectors(
            MathUtils.multiplyVector(MathUtils.crossProduct(velocity, h), factor),
            MathUtils.normalizeVector(position)
        );
        
        return eVector;
    }

    /**
     * Calculate orbital elements from state vectors
     * @param {Object} position - Position vector
     * @param {Object} velocity - Velocity vector
     * @param {number} centralBodyMass - Mass of central body
     * @param {Date} epoch - Epoch time
     * @returns {Object} Orbital elements
     */
    static calculateOrbitalElements(position, velocity, centralBodyMass, epoch = new Date()) {
        const G = PHYSICS_CONSTANTS.G;
        const r = MathUtils.vectorMagnitude(position);
        const v = MathUtils.vectorMagnitude(velocity);
        
        // Specific orbital energy
        const energy = v * v / 2 - G * centralBodyMass / r;
        
        // Semi-major axis
        const semiMajorAxis = -G * centralBodyMass / (2 * energy);
        
        // Angular momentum vector
        const h = MathUtils.crossProduct(position, velocity);
        const hMag = MathUtils.vectorMagnitude(h);
        
        // Eccentricity vector
        const eVector = this.calculateEccentricityVector(position, velocity, centralBodyMass);
        const eccentricity = MathUtils.vectorMagnitude(eVector);
        
        // Inclination
        const inclination = Math.acos(h.z / hMag);
        
        // Node vector
        const nodeVector = MathUtils.crossProduct({ x: 0, y: 0, z: 1 }, h);
        const nodeMag = MathUtils.vectorMagnitude(nodeVector);
        
        // Longitude of ascending node
        let longitudeOfAscendingNode = 0;
        if (nodeMag > 0) {
            longitudeOfAscendingNode = Math.acos(nodeVector.x / nodeMag);
            if (nodeVector.y < 0) {
                longitudeOfAscendingNode = 2 * Math.PI - longitudeOfAscendingNode;
            }
        }
        
        // Argument of periapsis
        let argumentOfPeriapsis = 0;
        if (nodeMag > 0 && eccentricity > 0) {
            argumentOfPeriapsis = Math.acos(
                MathUtils.dotProduct(nodeVector, eVector) / (nodeMag * eccentricity)
            );
            if (eVector.z < 0) {
                argumentOfPeriapsis = 2 * Math.PI - argumentOfPeriapsis;
            }
        }
        
        // True anomaly
        let trueAnomaly = 0;
        if (eccentricity > 0) {
            trueAnomaly = Math.acos(
                MathUtils.dotProduct(eVector, position) / (eccentricity * r)
            );
            if (MathUtils.dotProduct(position, velocity) < 0) {
                trueAnomaly = 2 * Math.PI - trueAnomaly;
            }
        }
        
        // Eccentric anomaly
        const eccentricAnomaly = 2 * Math.atan2(
            Math.sqrt(1 - eccentricity) * Math.sin(trueAnomaly / 2),
            Math.sqrt(1 + eccentricity) * Math.cos(trueAnomaly / 2)
        );
        
        // Mean anomaly
        const meanAnomaly = eccentricAnomaly - eccentricity * Math.sin(eccentricAnomaly);
        
        // Orbital period
        const orbitalPeriod = this.calculateOrbitalPeriod(semiMajorAxis, centralBodyMass);
        
        return {
            semiMajorAxis,
            eccentricity,
            inclination,
            longitudeOfAscendingNode,
            argumentOfPeriapsis,
            meanAnomalyAtEpoch: meanAnomaly,
            orbitalPeriod,
            epoch
        };
    }

    /**
     * Calculate periapsis and apoapsis distances
     * @returns {Object} Periapsis and apoapsis distances
     */
    calculateApsides() {
        const periapsis = this.semiMajorAxis * (1 - this.eccentricity);
        const apoapsis = this.semiMajorAxis * (1 + this.eccentricity);
        
        return {
            periapsis,
            apoapsis
        };
    }

    /**
     * Calculate orbital velocity at a given distance
     * @param {number} distance - Distance from central body
     * @returns {number} Orbital velocity
     */
    calculateVelocityAtDistance(distance) {
        const G = PHYSICS_CONSTANTS.G;
        return Math.sqrt(G * this.centralBodyMass * (2 / distance - 1 / this.semiMajorAxis));
    }

    /**
     * Calculate time of flight between two true anomalies
     * @param {number} trueAnomaly1 - Starting true anomaly
     * @param {number} trueAnomaly2 - Ending true anomaly
     * @returns {number} Time of flight in seconds
     */
    calculateTimeOfFlight(trueAnomaly1, trueAnomaly2) {
        // Convert true anomalies to eccentric anomalies
        const E1 = 2 * Math.atan2(
            Math.sqrt(1 - this.eccentricity) * Math.sin(trueAnomaly1 / 2),
            Math.sqrt(1 + this.eccentricity) * Math.cos(trueAnomaly1 / 2)
        );
        
        const E2 = 2 * Math.atan2(
            Math.sqrt(1 - this.eccentricity) * Math.sin(trueAnomaly2 / 2),
            Math.sqrt(1 + this.eccentricity) * Math.cos(trueAnomaly2 / 2)
        );
        
        // Mean anomalies
        const M1 = E1 - this.eccentricity * Math.sin(E1);
        const M2 = E2 - this.eccentricity * Math.sin(E2);
        
        // Time of flight
        const deltaM = M2 - M1;
        return deltaM * this.orbitalPeriod / (2 * Math.PI);
    }

    /**
     * Update orbital elements
     * @param {Object} elements - New orbital elements
     */
    updateElements(elements) {
        if (elements.semiMajorAxis !== undefined) this.semiMajorAxis = elements.semiMajorAxis;
        if (elements.eccentricity !== undefined) this.eccentricity = elements.eccentricity;
        if (elements.inclination !== undefined) this.inclination = elements.inclination;
        if (elements.longitudeOfAscendingNode !== undefined) this.longitudeOfAscendingNode = elements.longitudeOfAscendingNode;
        if (elements.argumentOfPeriapsis !== undefined) this.argumentOfPeriapsis = elements.argumentOfPeriapsis;
        if (elements.meanAnomalyAtEpoch !== undefined) this.meanAnomalyAtEpoch = elements.meanAnomalyAtEpoch;
        if (elements.orbitalPeriod !== undefined) this.orbitalPeriod = elements.orbitalPeriod;
        if (elements.epoch !== undefined) this.epoch = elements.epoch;
        if (elements.centralBodyMass !== undefined) this.centralBodyMass = elements.centralBodyMass;
        if (elements.G !== undefined) this.G = elements.G;
    }

    /**
     * Get current orbital elements
     * @returns {Object} Current orbital elements
     */
    getElements() {
        return {
            semiMajorAxis: this.semiMajorAxis,
            eccentricity: this.eccentricity,
            inclination: this.inclination,
            longitudeOfAscendingNode: this.longitudeOfAscendingNode,
            argumentOfPeriapsis: this.argumentOfPeriapsis,
            meanAnomalyAtEpoch: this.meanAnomalyAtEpoch,
            orbitalPeriod: this.orbitalPeriod,
            epoch: this.epoch,
            centralBodyMass: this.centralBodyMass
        };
    }
}