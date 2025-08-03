import { PHYSICS_CONSTANTS } from '../utils/Constants.js';
import { MathUtils } from '../utils/MathUtils.js';

/**
 * Orbital perturbations calculation module
 */
export class Perturbations {
    /**
     * Create a new perturbations calculator
     * @param {Object} config - Configuration options
     */
    constructor(config = {}) {
        this.G = config.G || PHYSICS_CONSTANTS.G;
        this.c = config.c || PHYSICS_CONSTANTS.c;
        this.useRelativistic = config.useRelativistic || false;
        this.useNonSpherical = config.useNonSpherical || true;
        this.useAtmosphericDrag = config.useAtmosphericDrag || false;
        this.useSolarRadiation = config.useSolarRadiation || false;
        this.perturbingBodies = [];
    }

    /**
     * Add a perturbing body
     * @param {Object} body - Perturbing body data
     */
    addPerturbingBody(body) {
        this.perturbingBodies.push({
            id: body.id,
            name: body.name,
            mass: body.mass,
            position: { ...body.position },
            J2: body.J2 || 0, // Oblateness parameter
            radius: body.radius || 0
        });
    }

    /**
     * Remove a perturbing body
     * @param {string|number} id - Body ID to remove
     */
    removePerturbingBody(id) {
        this.perturbingBodies = this.perturbingBodies.filter(body => body.id !== id);
    }

    /**
     * Clear all perturbing bodies
     */
    clearPerturbingBodies() {
        this.perturbingBodies = [];
    }

    /**
     * Calculate third-body perturbation acceleration
     * @param {Object} position - Position of the body being perturbed
     * @param {Object} centralBodyPosition - Position of the central body
     * @param {Object} perturbingBody - Perturbing body
     * @returns {Object} Perturbation acceleration
     */
    calculateThirdBodyPerturbation(position, centralBodyPosition, perturbingBody) {
        // Vector from central body to perturbed body
        const r = MathUtils.subtractVectors(position, centralBodyPosition);
        const rMag = MathUtils.vectorMagnitude(r);
        
        // Vector from perturbing body to perturbed body
        const rPrime = MathUtils.subtractVectors(position, perturbingBody.position);
        const rPrimeMag = MathUtils.vectorMagnitude(rPrime);
        
        // Vector from central body to perturbing body
        const rPerturber = MathUtils.subtractVectors(perturbingBody.position, centralBodyPosition);
        const rPerturberMag = MathUtils.vectorMagnitude(rPerturber);
        
        // Avoid singularities
        if (rMag < 1e-6 || rPrimeMag < 1e-6 || rPerturberMag < 1e-6) {
            return { x: 0, y: 0, z: 0 };
        }
        
        // Third-body perturbation acceleration
        const factor = this.G * perturbingBody.mass;
        const accel = MathUtils.subtractVectors(
            MathUtils.multiplyVector(MathUtils.normalizeVector(rPrime), -factor / (rPrimeMag * rPrimeMag)),
            MathUtils.multiplyVector(MathUtils.normalizeVector(rPerturber), -factor / (rPerturberMag * rPerturberMag))
        );
        
        return accel;
    }

    /**
     * Calculate J2 oblateness perturbation
     * @param {Object} position - Position of the body being perturbed
     * @param {Object} centralBody - Central body with J2 parameter
     * @returns {Object} Perturbation acceleration
     */
    calculateJ2Perturbation(position, centralBody) {
        if (!this.useNonSpherical || centralBody.J2 === 0) {
            return { x: 0, y: 0, z: 0 };
        }
        
        const r = MathUtils.vectorMagnitude(position);
        if (r < 1e-6) {
            return { x: 0, y: 0, z: 0 };
        }
        
        const R = centralBody.radius;
        const J2 = centralBody.J2;
        const mu = this.G * centralBody.mass;
        
        const factor = -1.5 * J2 * mu * R * R / Math.pow(r, 5);
        
        const x = position.x;
        const y = position.y;
        const z = position.z;
        
        const ax = factor * x * (5 * z * z / (r * r) - 1);
        const ay = factor * y * (5 * z * z / (r * r) - 1);
        const az = factor * z * (5 * z * z / (r * r) - 3);
        
        return { x: ax, y: ay, z: az };
    }

    /**
     * Calculate relativistic perturbation (Schwarzschild precession)
     * @param {Object} position - Position of the body
     * @param {Object} velocity - Velocity of the body
     * @param {number} centralBodyMass - Mass of the central body
     * @returns {Object} Perturbation acceleration
     */
    calculateRelativisticPerturbation(position, velocity, centralBodyMass) {
        if (!this.useRelativistic) {
            return { x: 0, y: 0, z: 0 };
        }
        
        const r = MathUtils.vectorMagnitude(position);
        const v = MathUtils.vectorMagnitude(velocity);
        
        if (r < 1e-6) {
            return { x: 0, y: 0, z: 0 };
        }
        
        const mu = this.G * centralBodyMass;
        const c2 = this.c * this.c;
        
        // Schwarzschild radius
        const rs = 2 * mu / c2;
        
        // Relativistic factor
        const factor = mu * rs / (2 * r * r * r * r);
        
        // Position and velocity unit vectors
        const rUnit = MathUtils.normalizeVector(position);
        const vUnit = MathUtils.normalizeVector(velocity);
        
        // Radial velocity
        const vRadial = MathUtils.dotProduct(velocity, rUnit);
        
        // Relativistic acceleration components
        const a1 = MathUtils.multiplyVector(rUnit, (4 * mu / r - v * v));
        const a2 = MathUtils.multiplyVector(velocity, 4 * vRadial);
        
        const accel = MathUtils.multiplyVector(
            MathUtils.addVectors(a1, a2),
            factor / c2
        );
        
        return accel;
    }

    /**
     * Calculate atmospheric drag perturbation
     * @param {Object} position - Position of the body
     * @param {Object} velocity - Velocity of the body
     * @param {Object} atmosphere - Atmosphere properties
     * @returns {Object} Perturbation acceleration
     */
    calculateAtmosphericDrag(position, velocity, atmosphere) {
        if (!this.useAtmosphericDrag) {
            return { x: 0, y: 0, z: 0 };
        }
        
        const r = MathUtils.vectorMagnitude(position);
        const v = MathUtils.vectorMagnitude(velocity);
        
        if (r < atmosphere.radius || v < 1e-6) {
            return { x: 0, y: 0, z: 0 };
        }
        
        // Atmospheric density (exponential model)
        const altitude = r - atmosphere.radius;
        const density = atmosphere.density0 * Math.exp(-altitude / atmosphere.scaleHeight);
        
        // Drag acceleration
        const dragCoeff = atmosphere.dragCoefficient || 2.2;
        const area = atmosphere.crossSection || 1;
        const mass = atmosphere.mass || 1;
        
        const dragFactor = -0.5 * dragCoeff * area * density / mass;
        
        return MathUtils.multiplyVector(velocity, dragFactor * v);
    }

    /**
     * Calculate solar radiation pressure perturbation
     * @param {Object} position - Position of the body
     * @param {Object} sunPosition - Position of the Sun
     * @param {Object} bodyProperties - Properties of the body (area, mass, reflectivity)
     * @returns {Object} Perturbation acceleration
     */
    calculateSolarRadiationPressure(position, sunPosition, bodyProperties) {
        if (!this.useSolarRadiation) {
            return { x: 0, y: 0, z: 0 };
        }
        
        // Vector from Sun to body
        const rSun = MathUtils.subtractVectors(position, sunPosition);
        const rSunMag = MathUtils.vectorMagnitude(rSun);
        
        if (rSunMag < 1e-6) {
            return { x: 0, y: 0, z: 0 };
        }
        
        // Solar radiation pressure at 1 AU
        const P0 = 4.56e-6; // N/m^2
        
        // Radiation pressure at body's distance
        const AU = PHYSICS_CONSTANTS.AU;
        const pressure = P0 * Math.pow(AU / rSunMag, 2);
        
        // Radiation force
        const area = bodyProperties.area || 1;
        const reflectivity = bodyProperties.reflectivity || 0.3;
        const mass = bodyProperties.mass || 1;
        
        const forceFactor = pressure * area * (1 + reflectivity) / mass;
        
        return MathUtils.multiplyVector(MathUtils.normalizeVector(rSun), forceFactor);
    }

    /**
     * Calculate total perturbation acceleration
     * @param {Object} position - Position of the body being perturbed
     * @param {Object} velocity - Velocity of the body being perturbed
     * @param {Object} centralBody - Central body
     * @param {Object} options - Additional options
     * @returns {Object} Total perturbation acceleration
     */
    calculateTotalPerturbation(position, velocity, centralBody, options = {}) {
        let totalAccel = { x: 0, y: 0, z: 0 };
        
        // Third-body perturbations
        for (const perturbingBody of this.perturbingBodies) {
            if (perturbingBody.id !== centralBody.id) {
                const thirdBodyAccel = this.calculateThirdBodyPerturbation(
                    position, centralBody.position, perturbingBody
                );
                totalAccel = MathUtils.addVectors(totalAccel, thirdBodyAccel);
            }
        }
        
        // J2 oblateness perturbation
        const j2Accel = this.calculateJ2Perturbation(position, centralBody);
        totalAccel = MathUtils.addVectors(totalAccel, j2Accel);
        
        // Relativistic perturbation
        const relativisticAccel = this.calculateRelativisticPerturbation(
            position, velocity, centralBody.mass
        );
        totalAccel = MathUtils.addVectors(totalAccel, relativisticAccel);
        
        // Atmospheric drag (if applicable)
        if (options.atmosphere) {
            const dragAccel = this.calculateAtmosphericDrag(
                position, velocity, options.atmosphere
            );
            totalAccel = MathUtils.addVectors(totalAccel, dragAccel);
        }
        
        // Solar radiation pressure (if applicable)
        if (options.sunPosition && options.bodyProperties) {
            const srpAccel = this.calculateSolarRadiationPressure(
                position, options.sunPosition, options.bodyProperties
            );
            totalAccel = MathUtils.addVectors(totalAccel, srpAccel);
        }
        
        return totalAccel;
    }

    /**
     * Calculate secular perturbation rates (long-term effects)
     * @param {Object} orbitalElements - Orbital elements
     * @param {Object} centralBody - Central body
     * @param {Array} perturbingBodies - List of perturbing bodies
     * @returns {Object} Secular rates
     */
    calculateSecularRates(orbitalElements, centralBody, perturbingBodies) {
        const a = orbitalElements.semiMajorAxis;
        const e = orbitalElements.eccentricity;
        const i = orbitalElements.inclination;
        const n = 2 * Math.PI / orbitalElements.orbitalPeriod; // Mean motion
        
        const rates = {
            da_dt: 0,
            de_dt: 0,
            di_dt: 0,
            dOmega_dt: 0, // Longitude of ascending node
            domega_dt: 0, // Argument of periapsis
            dM_dt: 0      // Mean anomaly
        };
        
        // J2 secular perturbations
        if (this.useNonSpherical && centralBody.J2 !== 0) {
            const J2 = centralBody.J2;
            const R = centralBody.radius;
            const mu = this.G * centralBody.mass;
            
            const p = a * (1 - e * e); // Semi-latus rectum
            
            const factor = -3 * n * J2 * R * R / (8 * p * p);
            
            rates.dOmega_dt = factor * Math.cos(i);
            rates.domega_dt = factor * (5 * Math.cos(i) * Math.cos(i) - 1);
        }
        
        // Third-body secular perturbations (simplified)
        for (const perturbingBody of perturbingBodies) {
            if (perturbingBody.id !== centralBody.id) {
                const aPerturber = MathUtils.vectorMagnitude(perturbingBody.position);
                const nPerturber = Math.sqrt(this.G * perturbingBody.mass / Math.pow(aPerturber, 3));
                
                // Simplified secular rates (circular orbits, coplanar)
                const alpha = a / aPerturber;
                
                if (alpha < 1) {
                    const factor = 0.75 * nPerturber * alpha * alpha;
                    
                    rates.dOmega_dt += factor * Math.cos(i);
                    rates.domega_dt += factor * (2 - 2.5 * Math.sin(i) * Math.sin(i));
                }
            }
        }
        
        return rates;
    }

    /**
     * Update configuration
     * @param {Object} config - New configuration
     */
    updateConfig(config) {
        if (config.G !== undefined) this.G = config.G;
        if (config.c !== undefined) this.c = config.c;
        if (config.useRelativistic !== undefined) this.useRelativistic = config.useRelativistic;
        if (config.useNonSpherical !== undefined) this.useNonSpherical = config.useNonSpherical;
        if (config.useAtmosphericDrag !== undefined) this.useAtmosphericDrag = config.useAtmosphericDrag;
        if (config.useSolarRadiation !== undefined) this.useSolarRadiation = config.useSolarRadiation;
    }
}