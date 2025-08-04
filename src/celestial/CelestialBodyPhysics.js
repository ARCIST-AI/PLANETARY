/**
 * CelestialBodyPhysics class
 * Physics integration improvements for celestial bodies
 */

import { PhysicsConstants } from '../physics/index.js';
import { MathUtils } from '../utils/index.js';

/**
 * CelestialBodyPhysics class
 */
export class CelestialBodyPhysics {
    /**
     * Create a new physics integration system
     * @param {CelestialBodyRegistry} registry - Celestial body registry
     */
    constructor(registry) {
        this.registry = registry;
        this.timeStep = 1; // seconds
        this.gravitationalConstant = PhysicsConstants.G;
        this.collisionThreshold = 1.0; // multiplier for collision detection
        this.integrationMethod = 'verlet'; // 'euler', 'verlet', 'rk4'
        this.softeningParameter = 1e6; // meters, for softening gravitational forces
        this.maxAcceleration = 1e6; // m/s², maximum acceleration to prevent numerical instability
        this.maxVelocity = 1e8; // m/s, maximum velocity to prevent numerical instability
        this.useRelativisticEffects = false;
        this.useTidalForces = false;
        this.useAtmosphericDrag = false;
        this.useRadiationPressure = false;
        this.useMagneticForces = false;
        this.collisionHandler = null;
        this.forceCalculators = new Map();
    }

    /**
     * Set the time step for integration
     * @param {number} timeStep - Time step in seconds
     */
    setTimeStep(timeStep) {
        this.timeStep = Math.max(0, timeStep);
    }

    /**
     * Set the integration method
     * @param {string} method - Integration method ('euler', 'verlet', 'rk4')
     */
    setIntegrationMethod(method) {
        if (['euler', 'verlet', 'rk4'].includes(method)) {
            this.integrationMethod = method;
        } else {
            throw new Error(`Invalid integration method: ${method}`);
        }
    }

    /**
     * Set the collision threshold
     * @param {number} threshold - Collision threshold multiplier
     */
    setCollisionThreshold(threshold) {
        this.collisionThreshold = Math.max(0, threshold);
    }

    /**
     * Set the softening parameter
     * @param {number} softening - Softening parameter in meters
     */
    setSofteningParameter(softening) {
        this.softeningParameter = Math.max(0, softening);
    }

    /**
     * Set maximum acceleration
     * @param {number} maxAccel - Maximum acceleration in m/s²
     */
    setMaxAcceleration(maxAccel) {
        this.maxAcceleration = Math.max(0, maxAccel);
    }

    /**
     * Set maximum velocity
     * @param {number} maxVel - Maximum velocity in m/s
     */
    setMaxVelocity(maxVel) {
        this.maxVelocity = Math.max(0, maxVel);
    }

    /**
     * Enable or disable relativistic effects
     * @param {boolean} enabled - Whether to enable relativistic effects
     */
    setRelativisticEffects(enabled) {
        this.useRelativisticEffects = enabled;
    }

    /**
     * Enable or disable tidal forces
     * @param {boolean} enabled - Whether to enable tidal forces
     */
    setTidalForces(enabled) {
        this.useTidalForces = enabled;
    }

    /**
     * Enable or disable atmospheric drag
     * @param {boolean} enabled - Whether to enable atmospheric drag
     */
    setAtmosphericDrag(enabled) {
        this.useAtmosphericDrag = enabled;
    }

    /**
     * Enable or disable radiation pressure
     * @param {boolean} enabled - Whether to enable radiation pressure
     */
    setRadiationPressure(enabled) {
        this.useRadiationPressure = enabled;
    }

    /**
     * Enable or disable magnetic forces
     * @param {boolean} enabled - Whether to enable magnetic forces
     */
    setMagneticForces(enabled) {
        this.useMagneticForces = enabled;
    }

    /**
     * Set the collision handler
     * @param {Function} handler - Collision handler function
     */
    setCollisionHandler(handler) {
        if (typeof handler === 'function') {
            this.collisionHandler = handler;
        } else {
            this.collisionHandler = null;
        }
    }

    /**
     * Add a custom force calculator
     * @param {string} name - Force calculator name
     * @param {Function} calculator - Force calculator function
     */
    addForceCalculator(name, calculator) {
        if (typeof calculator === 'function') {
            this.forceCalculators.set(name, calculator);
        } else {
            throw new Error('Force calculator must be a function');
        }
    }

    /**
     * Remove a custom force calculator
     * @param {string} name - Force calculator name
     * @returns {boolean} True if calculator was removed
     */
    removeForceCalculator(name) {
        return this.forceCalculators.delete(name);
    }

    /**
     * Update all bodies in the registry
     * @param {number} [timeStep] - Optional time step override
     */
    update(timeStep = null) {
        const dt = timeStep !== null ? timeStep : this.timeStep;
        const bodies = this.registry.getAll();

        switch (this.integrationMethod) {
            case 'euler':
                this._updateEuler(bodies, dt);
                break;
            case 'verlet':
                this._updateVerlet(bodies, dt);
                break;
            case 'rk4':
                this._updateRK4(bodies, dt);
                break;
        }

        // Check for collisions
        this._checkCollisions(bodies);
    }

    /**
     * Update using Euler integration
     * @param {Array<CelestialBody>} bodies - Array of celestial bodies
     * @param {number} dt - Time step
     * @private
     */
    _updateEuler(bodies, dt) {
        // Calculate forces for all bodies
        const forces = new Map();
        for (const body of bodies) {
            forces.set(body.id, this._calculateTotalForce(body, bodies));
        }

        // Update positions and velocities
        for (const body of bodies) {
            const force = forces.get(body.id);
            const acceleration = {
                x: force.x / body.mass,
                y: force.y / body.mass,
                z: force.z / body.mass
            };

            // Limit acceleration
            const accelMag = Math.sqrt(acceleration.x ** 2 + acceleration.y ** 2 + acceleration.z ** 2);
            if (accelMag > this.maxAcceleration) {
                const scale = this.maxAcceleration / accelMag;
                acceleration.x *= scale;
                acceleration.y *= scale;
                acceleration.z *= scale;
            }

            // Update velocity
            body.velocity.x += acceleration.x * dt;
            body.velocity.y += acceleration.y * dt;
            body.velocity.z += acceleration.z * dt;

            // Limit velocity
            const velMag = Math.sqrt(body.velocity.x ** 2 + body.velocity.y ** 2 + body.velocity.z ** 2);
            if (velMag > this.maxVelocity) {
                const scale = this.maxVelocity / velMag;
                body.velocity.x *= scale;
                body.velocity.y *= scale;
                body.velocity.z *= scale;
            }

            // Update position
            body.position.x += body.velocity.x * dt;
            body.position.y += body.velocity.y * dt;
            body.position.z += body.velocity.z * dt;

            // Store acceleration
            body.acceleration = acceleration;
        }
    }

    /**
     * Update using Verlet integration
     * @param {Array<CelestialBody>} bodies - Array of celestial bodies
     * @param {number} dt - Time step
     * @private
     */
    _updateVerlet(bodies, dt) {
        // Calculate forces for all bodies
        const forces = new Map();
        for (const body of bodies) {
            forces.set(body.id, this._calculateTotalForce(body, bodies));
        }

        // Update positions and velocities
        for (const body of bodies) {
            const force = forces.get(body.id);
            const acceleration = {
                x: force.x / body.mass,
                y: force.y / body.mass,
                z: force.z / body.mass
            };

            // Limit acceleration
            const accelMag = Math.sqrt(acceleration.x ** 2 + acceleration.y ** 2 + acceleration.z ** 2);
            if (accelMag > this.maxAcceleration) {
                const scale = this.maxAcceleration / accelMag;
                acceleration.x *= scale;
                acceleration.y *= scale;
                acceleration.z *= scale;
            }

            // Store old position
            const oldPosition = { ...body.position };

            // Update position using Verlet integration
            body.position.x += body.velocity.x * dt + 0.5 * body.acceleration.x * dt * dt;
            body.position.y += body.velocity.y * dt + 0.5 * body.acceleration.y * dt * dt;
            body.position.z += body.velocity.z * dt + 0.5 * body.acceleration.z * dt * dt;

            // Update velocity
            body.velocity.x += 0.5 * (body.acceleration.x + acceleration.x) * dt;
            body.velocity.y += 0.5 * (body.acceleration.y + acceleration.y) * dt;
            body.velocity.z += 0.5 * (body.acceleration.z + acceleration.z) * dt;

            // Limit velocity
            const velMag = Math.sqrt(body.velocity.x ** 2 + body.velocity.y ** 2 + body.velocity.z ** 2);
            if (velMag > this.maxVelocity) {
                const scale = this.maxVelocity / velMag;
                body.velocity.x *= scale;
                body.velocity.y *= scale;
                body.velocity.z *= scale;
            }

            // Store acceleration
            body.acceleration = acceleration;
        }
    }

    /**
     * Update using 4th-order Runge-Kutta integration
     * @param {Array<CelestialBody>} bodies - Array of celestial bodies
     * @param {number} dt - Time step
     * @private
     */
    _updateRK4(bodies, dt) {
        // Store initial state
        const initialState = new Map();
        for (const body of bodies) {
            initialState.set(body.id, {
                position: { ...body.position },
                velocity: { ...body.velocity },
                acceleration: { ...body.acceleration }
            });
        }

        // Calculate k1
        const k1Forces = new Map();
        for (const body of bodies) {
            k1Forces.set(body.id, this._calculateTotalForce(body, bodies));
        }

        // Update to k2 state
        for (const body of bodies) {
            const state = initialState.get(body.id);
            const force = k1Forces.get(body.id);
            const k1Accel = {
                x: force.x / body.mass,
                y: force.y / body.mass,
                z: force.z / body.mass
            };

            body.position.x = state.position.x + 0.5 * dt * state.velocity.x;
            body.position.y = state.position.y + 0.5 * dt * state.velocity.y;
            body.position.z = state.position.z + 0.5 * dt * state.velocity.z;

            body.velocity.x = state.velocity.x + 0.5 * dt * k1Accel.x;
            body.velocity.y = state.velocity.y + 0.5 * dt * k1Accel.y;
            body.velocity.z = state.velocity.z + 0.5 * dt * k1Accel.z;
        }

        // Calculate k2
        const k2Forces = new Map();
        for (const body of bodies) {
            k2Forces.set(body.id, this._calculateTotalForce(body, bodies));
        }

        // Update to k3 state
        for (const body of bodies) {
            const state = initialState.get(body.id);
            const force = k2Forces.get(body.id);
            const k2Accel = {
                x: force.x / body.mass,
                y: force.y / body.mass,
                z: force.z / body.mass
            };

            body.position.x = state.position.x + 0.5 * dt * body.velocity.x;
            body.position.y = state.position.y + 0.5 * dt * body.velocity.y;
            body.position.z = state.position.z + 0.5 * dt * body.velocity.z;

            body.velocity.x = state.velocity.x + 0.5 * dt * k2Accel.x;
            body.velocity.y = state.velocity.y + 0.5 * dt * k2Accel.y;
            body.velocity.z = state.velocity.z + 0.5 * dt * k2Accel.z;
        }

        // Calculate k3
        const k3Forces = new Map();
        for (const body of bodies) {
            k3Forces.set(body.id, this._calculateTotalForce(body, bodies));
        }

        // Update to k4 state
        for (const body of bodies) {
            const state = initialState.get(body.id);
            const force = k3Forces.get(body.id);
            const k3Accel = {
                x: force.x / body.mass,
                y: force.y / body.mass,
                z: force.z / body.mass
            };

            body.position.x = state.position.x + dt * body.velocity.x;
            body.position.y = state.position.y + dt * body.velocity.y;
            body.position.z = state.position.z + dt * body.velocity.z;

            body.velocity.x = state.velocity.x + dt * k3Accel.x;
            body.velocity.y = state.velocity.y + dt * k3Accel.y;
            body.velocity.z = state.velocity.z + dt * k3Accel.z;
        }

        // Calculate k4
        const k4Forces = new Map();
        for (const body of bodies) {
            k4Forces.set(body.id, this._calculateTotalForce(body, bodies));
        }

        // Final update
        for (const body of bodies) {
            const state = initialState.get(body.id);
            const k1Force = k1Forces.get(body.id);
            const k2Force = k2Forces.get(body.id);
            const k3Force = k3Forces.get(body.id);
            const k4Force = k4Forces.get(body.id);

            const k1Accel = {
                x: k1Force.x / body.mass,
                y: k1Force.y / body.mass,
                z: k1Force.z / body.mass
            };

            const k2Accel = {
                x: k2Force.x / body.mass,
                y: k2Force.y / body.mass,
                z: k2Force.z / body.mass
            };

            const k3Accel = {
                x: k3Force.x / body.mass,
                y: k3Force.y / body.mass,
                z: k3Force.z / body.mass
            };

            const k4Accel = {
                x: k4Force.x / body.mass,
                y: k4Force.y / body.mass,
                z: k4Force.z / body.mass
            };

            // Update position
            body.position.x = state.position.x + dt * (state.velocity.x + 2 * body.velocity.x + 2 * body.velocity.x + body.velocity.x) / 6;
            body.position.y = state.position.y + dt * (state.velocity.y + 2 * body.velocity.y + 2 * body.velocity.y + body.velocity.y) / 6;
            body.position.z = state.position.z + dt * (state.velocity.z + 2 * body.velocity.z + 2 * body.velocity.z + body.velocity.z) / 6;

            // Update velocity
            body.velocity.x = state.velocity.x + dt * (k1Accel.x + 2 * k2Accel.x + 2 * k3Accel.x + k4Accel.x) / 6;
            body.velocity.y = state.velocity.y + dt * (k1Accel.y + 2 * k2Accel.y + 2 * k3Accel.y + k4Accel.y) / 6;
            body.velocity.z = state.velocity.z + dt * (k1Accel.z + 2 * k2Accel.z + 2 * k3Accel.z + k4Accel.z) / 6;

            // Limit velocity
            const velMag = Math.sqrt(body.velocity.x ** 2 + body.velocity.y ** 2 + body.velocity.z ** 2);
            if (velMag > this.maxVelocity) {
                const scale = this.maxVelocity / velMag;
                body.velocity.x *= scale;
                body.velocity.y *= scale;
                body.velocity.z *= scale;
            }

            // Calculate final acceleration
            const finalForce = this._calculateTotalForce(body, bodies);
            body.acceleration = {
                x: finalForce.x / body.mass,
                y: finalForce.y / body.mass,
                z: finalForce.z / body.mass
            };

            // Limit acceleration
            const accelMag = Math.sqrt(body.acceleration.x ** 2 + body.acceleration.y ** 2 + body.acceleration.z ** 2);
            if (accelMag > this.maxAcceleration) {
                const scale = this.maxAcceleration / accelMag;
                body.acceleration.x *= scale;
                body.acceleration.y *= scale;
                body.acceleration.z *= scale;
            }
        }
    }

    /**
     * Calculate the total force on a body
     * @param {CelestialBody} body - The body to calculate force for
     * @param {Array<CelestialBody>} bodies - Array of all bodies
     * @returns {Object} Total force {x, y, z}
     * @private
     */
    _calculateTotalForce(body, bodies) {
        let totalForce = { x: 0, y: 0, z: 0 };

        // Gravitational forces
        const gravForce = this._calculateGravitationalForce(body, bodies);
        totalForce.x += gravForce.x;
        totalForce.y += gravForce.y;
        totalForce.z += gravForce.z;

        // Tidal forces
        if (this.useTidalForces) {
            const tidalForce = this._calculateTidalForce(body, bodies);
            totalForce.x += tidalForce.x;
            totalForce.y += tidalForce.y;
            totalForce.z += tidalForce.z;
        }

        // Atmospheric drag
        if (this.useAtmosphericDrag) {
            const dragForce = this._calculateAtmosphericDrag(body, bodies);
            totalForce.x += dragForce.x;
            totalForce.y += dragForce.y;
            totalForce.z += dragForce.z;
        }

        // Radiation pressure
        if (this.useRadiationPressure) {
            const radForce = this._calculateRadiationPressure(body, bodies);
            totalForce.x += radForce.x;
            totalForce.y += radForce.y;
            totalForce.z += radForce.z;
        }

        // Magnetic forces
        if (this.useMagneticForces) {
            const magForce = this._calculateMagneticForce(body, bodies);
            totalForce.x += magForce.x;
            totalForce.y += magForce.y;
            totalForce.z += magForce.z;
        }

        // Custom forces
        for (const calculator of this.forceCalculators.values()) {
            try {
                const customForce = calculator(body, bodies);
                if (customForce && typeof customForce === 'object') {
                    totalForce.x += customForce.x || 0;
                    totalForce.y += customForce.y || 0;
                    totalForce.z += customForce.z || 0;
                }
            } catch (error) {
                console.error('Error in custom force calculator:', error);
            }
        }

        return totalForce;
    }

    /**
     * Calculate gravitational force on a body
     * @param {CelestialBody} body - The body to calculate force for
     * @param {Array<CelestialBody>} bodies - Array of all bodies
     * @returns {Object} Gravitational force {x, y, z}
     * @private
     */
    _calculateGravitationalForce(body, bodies) {
        let force = { x: 0, y: 0, z: 0 };

        for (const other of bodies) {
            if (other.id === body.id) continue;

            const dx = other.position.x - body.position.x;
            const dy = other.position.y - body.position.y;
            const dz = other.position.z - body.position.z;

            const distanceSquared = dx * dx + dy * dy + dz * dz;
            const distance = Math.sqrt(distanceSquared);

            // Apply softening parameter to prevent singularities
            const softDistanceSquared = distanceSquared + this.softeningParameter * this.softeningParameter;
            const softDistance = Math.sqrt(softDistanceSquared);

            // Calculate gravitational force magnitude
            let forceMagnitude = this.gravitationalConstant * body.mass * other.mass / softDistanceSquared;

            // Apply relativistic correction if enabled
            if (this.useRelativisticEffects) {
                const c = PhysicsConstants.c;
                const vSquared = body.velocity.x ** 2 + body.velocity.y ** 2 + body.velocity.z ** 2;
                const gamma = 1 / Math.sqrt(1 - vSquared / (c * c));
                forceMagnitude *= gamma;
            }

            // Calculate force components
            force.x += forceMagnitude * dx / softDistance;
            force.y += forceMagnitude * dy / softDistance;
            force.z += forceMagnitude * dz / softDistance;
        }

        return force;
    }

    /**
     * Calculate tidal force on a body
     * @param {CelestialBody} body - The body to calculate force for
     * @param {Array<CelestialBody>} bodies - Array of all bodies
     * @returns {Object} Tidal force {x, y, z}
     * @private
     */
    _calculateTidalForce(body, bodies) {
        let force = { x: 0, y: 0, z: 0 };

        for (const other of bodies) {
            if (other.id === body.id) continue;

            const dx = other.position.x - body.position.x;
            const dy = other.position.y - body.position.y;
            const dz = other.position.z - body.position.z;

            const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);

            if (distance > 0) {
                // Simplified tidal force calculation
                const tidalFactor = 2 * this.gravitationalConstant * other.mass * body.radius / (distance ** 4);
                
                force.x += tidalFactor * dx;
                force.y += tidalFactor * dy;
                force.z += tidalFactor * dz;
            }
        }

        return force;
    }

    /**
     * Calculate atmospheric drag on a body
     * @param {CelestialBody} body - The body to calculate force for
     * @param {Array<CelestialBody>} bodies - Array of all bodies
     * @returns {Object} Atmospheric drag force {x, y, z}
     * @private
     */
    _calculateAtmosphericDrag(body, bodies) {
        let force = { x: 0, y: 0, z: 0 };

        // Only apply drag to bodies with an atmosphere
        if (!body.hasAtmosphere || !body.atmosphericHeight) {
            return force;
        }

        for (const other of bodies) {
            if (other.id === body.id) continue;

            const dx = other.position.x - body.position.x;
            const dy = other.position.y - body.position.y;
            const dz = other.position.z - body.position.z;

            const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);

            // Check if the other body is within the atmosphere
            if (distance < body.radius + body.atmosphericHeight) {
                // Simplified atmospheric drag calculation
                const altitude = distance - body.radius;
                const density = body.atmosphericPressure * Math.exp(-altitude / 8000); // Scale height of 8km
                const dragCoefficient = 0.47; // Sphere drag coefficient
                const crossSection = Math.PI * other.radius * other.radius;
                const velocity = Math.sqrt(other.velocity.x ** 2 + other.velocity.y ** 2 + other.velocity.z ** 2);
                
                if (velocity > 0) {
                    const dragMagnitude = 0.5 * density * velocity * velocity * dragCoefficient * crossSection;
                    
                    force.x -= dragMagnitude * other.velocity.x / velocity;
                    force.y -= dragMagnitude * other.velocity.y / velocity;
                    force.z -= dragMagnitude * other.velocity.z / velocity;
                }
            }
        }

        return force;
    }

    /**
     * Calculate radiation pressure on a body
     * @param {CelestialBody} body - The body to calculate force for
     * @param {Array<CelestialBody>} bodies - Array of all bodies
     * @returns {Object} Radiation pressure force {x, y, z}
     * @private
     */
    _calculateRadiationPressure(body, bodies) {
        let force = { x: 0, y: 0, z: 0 };

        for (const other of bodies) {
            if (other.id === body.id || other.type !== 'star') continue;

            const dx = body.position.x - other.position.x;
            const dy = body.position.y - other.position.y;
            const dz = body.position.z - other.position.z;

            const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);

            if (distance > 0) {
                // Radiation pressure force
                const luminosity = other.luminosity || 3.828e26; // Default to solar luminosity
                const c = PhysicsConstants.c;
                const radiationFlux = luminosity / (4 * Math.PI * distance * distance);
                const crossSection = Math.PI * body.radius * body.radius;
                const reflectivity = body.albedo || 0.3;
                
                const forceMagnitude = (1 + reflectivity) * radiationFlux * crossSection / c;
                
                force.x += forceMagnitude * dx / distance;
                force.y += forceMagnitude * dy / distance;
                force.z += forceMagnitude * dz / distance;
            }
        }

        return force;
    }

    /**
     * Calculate magnetic force on a body
     * @param {CelestialBody} body - The body to calculate force for
     * @param {Array<CelestialBody>} bodies - Array of all bodies
     * @returns {Object} Magnetic force {x, y, z}
     * @private
     */
    _calculateMagneticForce(body, bodies) {
        let force = { x: 0, y: 0, z: 0 };

        // Only apply magnetic forces to bodies with magnetic fields
        if (!body.hasMagneticField || !body.magneticFieldStrength) {
            return force;
        }

        for (const other of bodies) {
            if (other.id === body.id || !other.hasMagneticField || !other.magneticFieldStrength) {
                continue;
            }

            const dx = other.position.x - body.position.x;
            const dy = other.position.y - body.position.y;
            const dz = other.position.z - body.position.z;

            const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);

            if (distance > 0) {
                // Simplified magnetic dipole-dipole interaction
                const mu0 = 4 * Math.PI * 1e-7; // Vacuum permeability
                const m1 = body.magneticFieldStrength;
                const m2 = other.magneticFieldStrength;
                
                const forceMagnitude = (3 * mu0 * m1 * m2) / (4 * Math.PI * distance ** 4);
                
                force.x += forceMagnitude * dx / distance;
                force.y += forceMagnitude * dy / distance;
                force.z += forceMagnitude * dz / distance;
            }
        }

        return force;
    }

    /**
     * Check for collisions between bodies
     * @param {Array<CelestialBody>} bodies - Array of celestial bodies
     * @private
     */
    _checkCollisions(bodies) {
        for (let i = 0; i < bodies.length; i++) {
            for (let j = i + 1; j < bodies.length; j++) {
                const body1 = bodies[i];
                const body2 = bodies[j];

                const dx = body2.position.x - body1.position.x;
                const dy = body2.position.y - body1.position.y;
                const dz = body2.position.z - body1.position.z;

                const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);
                const minDistance = (body1.radius + body2.radius) * this.collisionThreshold;

                if (distance < minDistance) {
                    // Collision detected
                    const collisionData = {
                        distance,
                        minDistance,
                        normal: {
                            x: dx / distance,
                            y: dy / distance,
                            z: dz / distance
                        },
                        relativeVelocity: {
                            x: body2.velocity.x - body1.velocity.x,
                            y: body2.velocity.y - body1.velocity.y,
                            z: body2.velocity.z - body1.velocity.z
                        }
                    };

                    if (this.collisionHandler) {
                        try {
                            this.collisionHandler(body1, body2, collisionData);
                        } catch (error) {
                            console.error('Error in collision handler:', error);
                        }
                    }
                }
            }
        }
    }

    /**
     * Calculate the orbital elements of a body
     * @param {CelestialBody} body - The body to calculate orbital elements for
     * @param {CelestialBody} centralBody - The central body
     * @returns {Object} Orbital elements
     */
    calculateOrbitalElements(body, centralBody) {
        if (!centralBody || centralBody.id === body.id) {
            throw new Error('Invalid central body');
        }

        const dx = body.position.x - centralBody.position.x;
        const dy = body.position.y - centralBody.position.y;
        const dz = body.position.z - centralBody.position.z;

        const dvx = body.velocity.x - centralBody.velocity.x;
        const dvy = body.velocity.y - centralBody.velocity.y;
        const dvz = body.velocity.z - centralBody.velocity.z;

        const r = Math.sqrt(dx * dx + dy * dy + dz * dz);
        const v = Math.sqrt(dvx * dvx + dvy * dvy + dvz * dvz);

        const mu = this.gravitationalConstant * (body.mass + centralBody.mass);

        // Specific orbital energy
        const energy = v * v / 2 - mu / r;

        // Semi-major axis
        const semiMajorAxis = -mu / (2 * energy);

        // Angular momentum vector
        const hx = dy * dvz - dz * dvy;
        const hy = dz * dvx - dx * dvz;
        const hz = dx * dvy - dy * dvx;
        const h = Math.sqrt(hx * hx + hy * hy + hz * hz);

        // Eccentricity vector
        const ex = (dvz * hy - dvy * hz) / mu - dx / r;
        const ey = (dvx * hz - dvz * hx) / mu - dy / r;
        const ez = (dvy * hx - dvx * hy) / mu - dz / r;
        const eccentricity = Math.sqrt(ex * ex + ey * ey + ez * ez);

        // Inclination
        const inclination = Math.acos(hz / h);

        // Longitude of ascending node
        const n = Math.sqrt(hx * hx + hy * hy);
        let longitudeOfAscendingNode = Math.acos(-hy / n);
        if (hx < 0) {
            longitudeOfAscendingNode = 2 * Math.PI - longitudeOfAscendingNode;
        }

        // Argument of periapsis
        let argumentOfPeriapsis = Math.acos((hx * ey - hy * ex) / (n * eccentricity));
        if (ez < 0) {
            argumentOfPeriapsis = 2 * Math.PI - argumentOfPeriapsis;
        }

        // True anomaly
        let trueAnomaly = Math.acos((ex * dx + ey * dy + ez * dz) / (eccentricity * r));
        if (dx * dvx + dy * dvy + dz * dvz < 0) {
            trueAnomaly = 2 * Math.PI - trueAnomaly;
        }

        // Mean anomaly
        const eccentricAnomaly = 2 * Math.atan(Math.sqrt((1 - eccentricity) / (1 + eccentricity)) * Math.tan(trueAnomaly / 2));
        const meanAnomaly = eccentricAnomaly - eccentricity * Math.sin(eccentricAnomaly);

        // Orbital period
        const orbitalPeriod = 2 * Math.PI * Math.sqrt(Math.pow(semiMajorAxis, 3) / mu);

        return {
            semiMajorAxis,
            eccentricity,
            inclination,
            longitudeOfAscendingNode,
            argumentOfPeriapsis,
            trueAnomaly,
            meanAnomaly,
            orbitalPeriod,
            energy,
            angularMomentum: h
        };
    }

    /**
     * Calculate the Hill sphere radius of a body
     * @param {CelestialBody} body - The body to calculate Hill sphere for
     * @param {CelestialBody} centralBody - The central body
     * @returns {number} Hill sphere radius
     */
    calculateHillSphereRadius(body, centralBody) {
        if (!centralBody || centralBody.id === body.id) {
            throw new Error('Invalid central body');
        }

        const dx = body.position.x - centralBody.position.x;
        const dy = body.position.y - centralBody.position.y;
        const dz = body.position.z - centralBody.position.z;

        const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);

        const massRatio = body.mass / (3 * centralBody.mass);
        return distance * Math.cbrt(massRatio);
    }

    /**
     * Calculate the Roche limit of a body
     * @param {CelestialBody} body - The body to calculate Roche limit for
     * @param {CelestialBody} centralBody - The central body
     * @param {number} [rigidity=2] - Rigidity parameter (2 for fluid bodies, higher for rigid bodies)
     * @returns {number} Roche limit
     */
    calculateRocheLimit(body, centralBody, rigidity = 2) {
        if (!centralBody || centralBody.id === body.id) {
            throw new Error('Invalid central body');
        }

        const densityRatio = centralBody.density / body.density;
        const radiusRatio = centralBody.radius / body.radius;

        return radiusRatio * body.radius * Math.cbrt(2 * rigidity * densityRatio);
    }
}