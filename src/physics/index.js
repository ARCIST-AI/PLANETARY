/**
 * Physics module
 * Exports all physics classes and constants
 */

// Export physics classes
export { NBodyIntegrator } from './NBodyIntegrator.js';
export { KeplerianOrbit } from './KeplerianOrbit.js';
export { Perturbations } from './Perturbations.js';
export { CoordinateTransform } from './CoordinateTransform.js';

// Export physics constants
export { PhysicsConstants } from './PhysicsConstants.js';

// Factory functions for creating physics objects

/**
 * Create an N-body integrator
 * @param {Object} options - Options for the integrator
 * @returns {NBodyIntegrator} Created integrator
 */
export function createNBodyIntegrator(options = {}) {
    return new NBodyIntegrator(options);
}

/**
 * Create a Keplerian orbit
 * @param {Object} options - Options for the orbit
 * @returns {KeplerianOrbit} Created orbit
 */
export function createKeplerianOrbit(options = {}) {
    return new KeplerianOrbit(options);
}

/**
 * Create a perturbations calculator
 * @param {Object} options - Options for the perturbations calculator
 * @returns {Perturbations} Created perturbations calculator
 */
export function createPerturbations(options = {}) {
    return new Perturbations(options);
}

/**
 * Create a coordinate transform
 * @param {Object} options - Options for the coordinate transform
 * @returns {CoordinateTransform} Created coordinate transform
 */
export function createCoordinateTransform(options = {}) {
    return new CoordinateTransform(options);
}

// Utility functions

/**
 * Calculate gravitational force between two bodies
 * @param {Object} body1 - First body
 * @param {Object} body2 - Second body
 * @returns {Object} Force vector
 */
export function calculateGravitationalForce(body1, body2) {
    const G = PhysicsConstants.G;
    
    // Calculate distance vector
    const dx = body2.position.x - body1.position.x;
    const dy = body2.position.y - body1.position.y;
    const dz = body2.position.z - body1.position.z;
    
    // Calculate distance
    const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);
    
    // Avoid division by zero
    if (distance === 0) {
        return { x: 0, y: 0, z: 0 };
    }
    
    // Calculate force magnitude
    const forceMagnitude = G * body1.mass * body2.mass / (distance * distance);
    
    // Calculate force vector
    const force = {
        x: forceMagnitude * dx / distance,
        y: forceMagnitude * dy / distance,
        z: forceMagnitude * dz / distance
    };
    
    return force;
}

/**
 * Calculate gravitational acceleration of a body due to another body
 * @param {Object} body - Body to calculate acceleration for
 * @param {Object} sourceBody - Source body causing the acceleration
 * @returns {Object} Acceleration vector
 */
export function calculateGravitationalAcceleration(body, sourceBody) {
    const G = PhysicsConstants.G;
    
    // Calculate distance vector
    const dx = sourceBody.position.x - body.position.x;
    const dy = sourceBody.position.y - body.position.y;
    const dz = sourceBody.position.z - body.position.z;
    
    // Calculate distance
    const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);
    
    // Avoid division by zero
    if (distance === 0) {
        return { x: 0, y: 0, z: 0 };
    }
    
    // Calculate acceleration magnitude
    const accelerationMagnitude = G * sourceBody.mass / (distance * distance);
    
    // Calculate acceleration vector
    const acceleration = {
        x: accelerationMagnitude * dx / distance,
        y: accelerationMagnitude * dy / distance,
        z: accelerationMagnitude * dz / distance
    };
    
    return acceleration;
}

/**
 * Calculate orbital period using Kepler's third law
 * @param {number} semiMajorAxis - Semi-major axis in meters
 * @param {number} centralMass - Mass of central body in kg
 * @returns {number} Orbital period in seconds
 */
export function calculateOrbitalPeriod(semiMajorAxis, centralMass) {
    const G = PhysicsConstants.G;
    return 2 * Math.PI * Math.sqrt(Math.pow(semiMajorAxis, 3) / (G * centralMass));
}

/**
 * Calculate semi-major axis using Kepler's third law
 * @param {number} orbitalPeriod - Orbital period in seconds
 * @param {number} centralMass - Mass of central body in kg
 * @returns {number} Semi-major axis in meters
 */
export function calculateSemiMajorAxis(orbitalPeriod, centralMass) {
    const G = PhysicsConstants.G;
    return Math.pow(G * centralMass * Math.pow(orbitalPeriod, 2) / (4 * Math.PI * Math.PI), 1/3);
}

/**
 * Calculate escape velocity
 * @param {number} mass - Mass of body in kg
 * @param {number} radius - Radius of body in meters
 * @returns {number} Escape velocity in m/s
 */
export function calculateEscapeVelocity(mass, radius) {
    const G = PhysicsConstants.G;
    return Math.sqrt(2 * G * mass / radius);
}

/**
 * Calculate circular orbital velocity
 * @param {number} mass - Mass of central body in kg
 * @param {number} radius - Orbital radius in meters
 * @returns {number} Circular orbital velocity in m/s
 */
export function calculateCircularOrbitalVelocity(mass, radius) {
    const G = PhysicsConstants.G;
    return Math.sqrt(G * mass / radius);
}

/**
 * Calculate Hill sphere radius
 * @param {number} mass - Mass of orbiting body in kg
 * @param {number} centralMass - Mass of central body in kg
 * @param {number} semiMajorAxis - Semi-major axis in meters
 * @returns {number} Hill sphere radius in meters
 */
export function calculateHillSphereRadius(mass, centralMass, semiMajorAxis) {
    const massRatio = mass / centralMass;
    return semiMajorAxis * Math.pow(massRatio / 3, 1/3);
}

/**
 * Calculate Roche limit
 * @param {number} primaryRadius - Radius of primary body in meters
 * @param {number} primaryDensity - Density of primary body in kg/m³
 * @param {number} secondaryDensity - Density of secondary body in kg/m³
 * @returns {number} Roche limit in meters
 */
export function calculateRocheLimit(primaryRadius, primaryDensity, secondaryDensity) {
    const densityRatio = primaryDensity / secondaryDensity;
    return 2.44 * primaryRadius * Math.pow(densityRatio, 1/3);
}

/**
 * Calculate sphere of influence radius
 * @param {number} mass - Mass of orbiting body in kg
 * @param {number} centralMass - Mass of central body in kg
 * @param {number} semiMajorAxis - Semi-major axis in meters
 * @returns {number} Sphere of influence radius in meters
 */
export function calculateSphereOfInfluenceRadius(mass, centralMass, semiMajorAxis) {
    const massRatio = mass / centralMass;
    return semiMajorAxis * Math.pow(massRatio, 2/5);
}

/**
 * Calculate synodic period
 * @param {number} orbitalPeriod1 - Orbital period of first body in seconds
 * @param {number} orbitalPeriod2 - Orbital period of second body in seconds
 * @returns {number} Synodic period in seconds
 */
export function calculateSynodicPeriod(orbitalPeriod1, orbitalPeriod2) {
    return Math.abs(1 / (1 / orbitalPeriod1 - 1 / orbitalPeriod2));
}

/**
 * Calculate mean motion
 * @param {number} orbitalPeriod - Orbital period in seconds
 * @returns {number} Mean motion in rad/s
 */
export function calculateMeanMotion(orbitalPeriod) {
    return 2 * Math.PI / orbitalPeriod;
}

/**
 * Calculate mean anomaly
 * @param {number} meanMotion - Mean motion in rad/s
 * @param {number} time - Time since epoch in seconds
 * @param {number} meanAnomalyAtEpoch - Mean anomaly at epoch in radians
 * @returns {number} Mean anomaly in radians
 */
export function calculateMeanAnomaly(meanMotion, time, meanAnomalyAtEpoch = 0) {
    return meanAnomalyAtEpoch + meanMotion * time;
}

/**
 * Calculate eccentric anomaly (simplified Newton's method)
 * @param {number} meanAnomaly - Mean anomaly in radians
 * @param {number} eccentricity - Eccentricity
 * @param {number} tolerance - Convergence tolerance
 * @param {number} maxIterations - Maximum number of iterations
 * @returns {number} Eccentric anomaly in radians
 */
export function calculateEccentricAnomaly(meanAnomaly, eccentricity, tolerance = 1e-8, maxIterations = 100) {
    // Initial guess
    let E = meanAnomaly;
    
    // Newton's method
    for (let i = 0; i < maxIterations; i++) {
        const deltaE = (E - eccentricity * Math.sin(E) - meanAnomaly) / (1 - eccentricity * Math.cos(E));
        E -= deltaE;
        
        if (Math.abs(deltaE) < tolerance) {
            return E;
        }
    }
    
    return E;
}

/**
 * Calculate true anomaly
 * @param {number} eccentricAnomaly - Eccentric anomaly in radians
 * @param {number} eccentricity - Eccentricity
 * @returns {number} True anomaly in radians
 */
export function calculateTrueAnomaly(eccentricAnomaly, eccentricity) {
    const trueAnomaly = 2 * Math.atan2(
        Math.sqrt(1 + eccentricity) * Math.sin(eccentricAnomaly / 2),
        Math.sqrt(1 - eccentricity) * Math.cos(eccentricAnomaly / 2)
    );
    
    return trueAnomaly;
}

/**
 * Calculate orbital position from orbital elements
 * @param {Object} orbitalElements - Orbital elements
 * @param {number} time - Time since epoch in seconds
 * @returns {Object} Position vector
 */
export function calculateOrbitalPosition(orbitalElements, time) {
    const {
        semiMajorAxis,
        eccentricity,
        inclination,
        longitudeOfAscendingNode,
        argumentOfPeriapsis,
        meanAnomalyAtEpoch,
        orbitalPeriod
    } = orbitalElements;
    
    // Calculate mean motion
    const meanMotion = calculateMeanMotion(orbitalPeriod);
    
    // Calculate mean anomaly
    const meanAnomaly = calculateMeanAnomaly(meanMotion, time, meanAnomalyAtEpoch);
    
    // Calculate eccentric anomaly
    const eccentricAnomaly = calculateEccentricAnomaly(meanAnomaly, eccentricity);
    
    // Calculate true anomaly
    const trueAnomaly = calculateTrueAnomaly(eccentricAnomaly, eccentricity);
    
    // Calculate distance from focus
    const distance = semiMajorAxis * (1 - eccentricity * Math.cos(eccentricAnomaly));
    
    // Calculate position in orbital plane
    const x = distance * Math.cos(trueAnomaly);
    const y = distance * Math.sin(trueAnomaly);
    
    // Rotate to 3D space
    const cosOmega = Math.cos(longitudeOfAscendingNode);
    const sinOmega = Math.sin(longitudeOfAscendingNode);
    const cosI = Math.cos(inclination);
    const sinI = Math.sin(inclination);
    const cosW = Math.cos(argumentOfPeriapsis);
    const sinW = Math.sin(argumentOfPeriapsis);
    
    // Position in 3D space
    const position = {
        x: (cosOmega * cosW - sinOmega * sinW * cosI) * x + (-cosOmega * sinW - sinOmega * cosW * cosI) * y,
        y: (sinOmega * cosW + cosOmega * sinW * cosI) * x + (-sinOmega * sinW + cosOmega * cosW * cosI) * y,
        z: (sinW * sinI) * x + (cosW * sinI) * y
    };
    
    return position;
}

/**
 * Calculate orbital velocity from orbital elements
 * @param {Object} orbitalElements - Orbital elements
 * @param {number} time - Time since epoch in seconds
 * @param {number} centralMass - Mass of central body in kg
 * @returns {Object} Velocity vector
 */
export function calculateOrbitalVelocity(orbitalElements, time, centralMass) {
    const {
        semiMajorAxis,
        eccentricity,
        inclination,
        longitudeOfAscendingNode,
        argumentOfPeriapsis,
        meanAnomalyAtEpoch,
        orbitalPeriod
    } = orbitalElements;
    
    const G = PhysicsConstants.G;
    
    // Calculate mean motion
    const meanMotion = calculateMeanMotion(orbitalPeriod);
    
    // Calculate mean anomaly
    const meanAnomaly = calculateMeanAnomaly(meanMotion, time, meanAnomalyAtEpoch);
    
    // Calculate eccentric anomaly
    const eccentricAnomaly = calculateEccentricAnomaly(meanAnomaly, eccentricity);
    
    // Calculate distance from focus
    const distance = semiMajorAxis * (1 - eccentricity * Math.cos(eccentricAnomaly));
    
    // Calculate velocity components in orbital plane
    const n = Math.sqrt(G * centralMass / (semiMajorAxis * semiMajorAxis * semiMajorAxis));
    const vx = -semiMajorAxis * n * Math.sin(eccentricAnomaly) / distance;
    const vy = semiMajorAxis * n * Math.sqrt(1 - eccentricity * eccentricity) * Math.cos(eccentricAnomaly) / distance;
    
    // Rotate to 3D space
    const cosOmega = Math.cos(longitudeOfAscendingNode);
    const sinOmega = Math.sin(longitudeOfAscendingNode);
    const cosI = Math.cos(inclination);
    const sinI = Math.sin(inclination);
    const cosW = Math.cos(argumentOfPeriapsis);
    const sinW = Math.sin(argumentOfPeriapsis);
    
    // Velocity in 3D space
    const velocity = {
        x: (cosOmega * cosW - sinOmega * sinW * cosI) * vx + (-cosOmega * sinW - sinOmega * cosW * cosI) * vy,
        y: (sinOmega * cosW + cosOmega * sinW * cosI) * vx + (-sinOmega * sinW + cosOmega * cosW * cosI) * vy,
        z: (sinW * sinI) * vx + (cosW * sinI) * vy
    };
    
    return velocity;
}