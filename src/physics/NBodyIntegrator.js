import { PHYSICS_CONSTANTS } from '../utils/Constants.js';
import { MathUtils } from '../utils/MathUtils.js';

/**
 * N-body gravitational physics integrator using Runge-Kutta 4th order method
 */
export class NBodyIntegrator {
    /**
     * Create a new N-body integrator
     * @param {Object} config - Configuration options
     */
    constructor(config = {}) {
        this.G = config.G || PHYSICS_CONSTANTS.G;
        this.useRelativistic = config.useRelativistic || false;
        this.c = config.c || PHYSICS_CONSTANTS.c;
        this.softening = config.softening || 1e6; // Softening parameter to avoid singularities
        this.timeStep = config.timeStep || 3600; // Default 1 hour
        this.bodies = [];
        this.forces = [];
    }

    /**
     * Add a celestial body to the simulation
     * @param {Object} body - Celestial body with mass, position, and velocity
     */
    addBody(body) {
        this.bodies.push({
            id: body.id,
            name: body.name,
            mass: body.mass,
            radius: body.radius,
            position: { ...body.position },
            velocity: { ...body.velocity },
            acceleration: { x: 0, y: 0, z: 0 },
            force: { x: 0, y: 0, z: 0 }
        });
    }

    /**
     * Remove a body from the simulation
     * @param {string|number} id - Body ID to remove
     */
    removeBody(id) {
        this.bodies = this.bodies.filter(body => body.id !== id);
    }

    /**
     * Clear all bodies from the simulation
     */
    clearBodies() {
        this.bodies = [];
    }

    /**
     * Calculate gravitational forces between all bodies
     */
    calculateForces() {
        const n = this.bodies.length;
        
        // Reset forces
        for (let i = 0; i < n; i++) {
            this.bodies[i].force = { x: 0, y: 0, z: 0 };
        }

        // Calculate pairwise forces
        for (let i = 0; i < n; i++) {
            for (let j = i + 1; j < n; j++) {
                const body1 = this.bodies[i];
                const body2 = this.bodies[j];
                
                const force = this.calculateGravitationalForce(body1, body2);
                
                // Apply Newton's third law
                body1.force.x += force.x;
                body1.force.y += force.y;
                body1.force.z += force.z;
                
                body2.force.x -= force.x;
                body2.force.y -= force.y;
                body2.force.z -= force.z;
            }
        }
    }

    /**
     * Calculate gravitational force between two bodies
     * @param {Object} body1 - First body
     * @param {Object} body2 - Second body
     * @returns {Object} Force vector
     */
    calculateGravitationalForce(body1, body2) {
        const dx = body2.position.x - body1.position.x;
        const dy = body2.position.y - body1.position.y;
        const dz = body2.position.z - body1.position.z;
        
        // Distance with softening to avoid singularities
        const r2 = dx * dx + dy * dy + dz * dz + this.softening * this.softening;
        const r = Math.sqrt(r2);
        
        // Gravitational force magnitude
        let forceMag = this.G * body1.mass * body2.mass / r2;
        
        // Apply relativistic correction if enabled
        if (this.useRelativistic) {
            const v1 = MathUtils.vectorMagnitude(body1.velocity);
            const v2 = MathUtils.vectorMagnitude(body2.velocity);
            const gamma1 = 1 / Math.sqrt(1 - (v1 * v1) / (this.c * this.c));
            const gamma2 = 1 / Math.sqrt(1 - (v2 * v2) / (this.c * this.c));
            forceMag *= (gamma1 * gamma2);
        }
        
        // Force direction (unit vector)
        const fx = forceMag * dx / r;
        const fy = forceMag * dy / r;
        const fz = forceMag * dz / r;
        
        return { x: fx, y: fy, z: fz };
    }

    /**
     * Perform one integration step using Runge-Kutta 4th order method
     * @param {number} dt - Time step
     */
    integrateStep(dt) {
        this.calculateForces();
        
        // Store initial state
        const initialState = this.bodies.map(body => ({
            position: { ...body.position },
            velocity: { ...body.velocity },
            acceleration: {
                x: body.force.x / body.mass,
                y: body.force.y / body.mass,
                z: body.force.z / body.mass
            }
        }));
        
        // RK4 integration
        const k1 = this.calculateDerivatives(initialState);
        const k2 = this.calculateDerivatives(this.evaluateRK4(initialState, k1, dt * 0.5));
        const k3 = this.calculateDerivatives(this.evaluateRK4(initialState, k2, dt * 0.5));
        const k4 = this.calculateDerivatives(this.evaluateRK4(initialState, k3, dt));
        
        // Update positions and velocities
        for (let i = 0; i < this.bodies.length; i++) {
            const body = this.bodies[i];
            const initial = initialState[i];
            
            // Update position
            body.position.x = initial.position.x + (dt / 6) * (k1[i].dx + 2 * k2[i].dx + 2 * k3[i].dx + k4[i].dx);
            body.position.y = initial.position.y + (dt / 6) * (k1[i].dy + 2 * k2[i].dy + 2 * k3[i].dy + k4[i].dy);
            body.position.z = initial.position.z + (dt / 6) * (k1[i].dz + 2 * k2[i].dz + 2 * k3[i].dz + k4[i].dz);
            
            // Update velocity
            body.velocity.x = initial.velocity.x + (dt / 6) * (k1[i].dvx + 2 * k2[i].dvx + 2 * k3[i].dvx + k4[i].dvx);
            body.velocity.y = initial.velocity.y + (dt / 6) * (k1[i].dvy + 2 * k2[i].dvy + 2 * k3[i].dvy + k4[i].dvy);
            body.velocity.z = initial.velocity.z + (dt / 6) * (k1[i].dvz + 2 * k2[i].dvz + 2 * k3[i].dvz + k4[i].dvz);
            
            // Update acceleration
            body.acceleration = {
                x: body.force.x / body.mass,
                y: body.force.y / body.mass,
                z: body.force.z / body.mass
            };
        }
    }

    /**
     * Calculate derivatives (velocities and accelerations) for RK4
     * @param {Array} state - Current state of all bodies
     * @returns {Array} Derivatives
     */
    calculateDerivatives(state) {
        const derivatives = [];
        
        // Calculate forces for current state
        const forces = this.calculateForcesForState(state);
        
        for (let i = 0; i < state.length; i++) {
            derivatives.push({
                dx: state[i].velocity.x,
                dy: state[i].velocity.y,
                dz: state[i].velocity.z,
                dvx: forces[i].x / this.bodies[i].mass,
                dvy: forces[i].y / this.bodies[i].mass,
                dvz: forces[i].z / this.bodies[i].mass
            });
        }
        
        return derivatives;
    }

    /**
     * Calculate forces for a given state (used in RK4)
     * @param {Array} state - State to calculate forces for
     * @returns {Array} Forces for each body
     */
    calculateForcesForState(state) {
        const n = state.length;
        const forces = Array(n).fill().map(() => ({ x: 0, y: 0, z: 0 }));
        
        for (let i = 0; i < n; i++) {
            for (let j = i + 1; j < n; j++) {
                const dx = state[j].position.x - state[i].position.x;
                const dy = state[j].position.y - state[i].position.y;
                const dz = state[j].position.z - state[i].position.z;
                
                const r2 = dx * dx + dy * dy + dz * dz + this.softening * this.softening;
                const r = Math.sqrt(r2);
                
                const forceMag = this.G * this.bodies[i].mass * this.bodies[j].mass / r2;
                
                const fx = forceMag * dx / r;
                const fy = forceMag * dy / r;
                const fz = forceMag * dz / r;
                
                forces[i].x += fx;
                forces[i].y += fy;
                forces[i].z += fz;
                
                forces[j].x -= fx;
                forces[j].y -= fy;
                forces[j].z -= fz;
            }
        }
        
        return forces;
    }

    /**
     * Evaluate state at intermediate step for RK4
     * @param {Array} initialState - Initial state
     * @param {Array} derivatives - Derivatives
     * @param {number} dt - Time step fraction
     * @returns {Array} Evaluated state
     */
    evaluateRK4(initialState, derivatives, dt) {
        return initialState.map((body, i) => ({
            position: {
                x: body.position.x + derivatives[i].dx * dt,
                y: body.position.y + derivatives[i].dy * dt,
                z: body.position.z + derivatives[i].dz * dt
            },
            velocity: {
                x: body.velocity.x + derivatives[i].dvx * dt,
                y: body.velocity.y + derivatives[i].dvy * dt,
                z: body.velocity.z + derivatives[i].dvz * dt
            }
        }));
    }

    /**
     * Get the current state of all bodies
     * @returns {Array} Current state
     */
    getState() {
        return this.bodies.map(body => ({
            id: body.id,
            name: body.name,
            mass: body.mass,
            position: { ...body.position },
            velocity: { ...body.velocity },
            acceleration: { ...body.acceleration }
        }));
    }

    /**
     * Set the state of all bodies
     * @param {Array} state - New state
     */
    setState(state) {
        this.bodies = state.map(bodyData => ({
            id: bodyData.id,
            name: bodyData.name,
            mass: bodyData.mass,
            radius: bodyData.radius || 0,
            position: { ...bodyData.position },
            velocity: { ...bodyData.velocity },
            acceleration: { ...bodyData.acceleration },
            force: { x: 0, y: 0, z: 0 }
        }));
    }

    /**
     * Calculate total energy of the system
     * @returns {Object} Energy components
     */
    calculateTotalEnergy() {
        let kineticEnergy = 0;
        let potentialEnergy = 0;
        
        // Kinetic energy
        for (const body of this.bodies) {
            const v2 = body.velocity.x * body.velocity.x + 
                      body.velocity.y * body.velocity.y + 
                      body.velocity.z * body.velocity.z;
            kineticEnergy += 0.5 * body.mass * v2;
        }
        
        // Potential energy
        for (let i = 0; i < this.bodies.length; i++) {
            for (let j = i + 1; j < this.bodies.length; j++) {
                const r = MathUtils.distance(this.bodies[i].position, this.bodies[j].position);
                potentialEnergy -= this.G * this.bodies[i].mass * this.bodies[j].mass / r;
            }
        }
        
        return {
            kinetic: kineticEnergy,
            potential: potentialEnergy,
            total: kineticEnergy + potentialEnergy
        };
    }

    /**
     * Calculate center of mass of the system
     * @returns {Object} Center of mass position and velocity
     */
    calculateCenterOfMass() {
        let totalMass = 0;
        let comPosition = { x: 0, y: 0, z: 0 };
        let comVelocity = { x: 0, y: 0, z: 0 };
        
        for (const body of this.bodies) {
            totalMass += body.mass;
            comPosition.x += body.mass * body.position.x;
            comPosition.y += body.mass * body.position.y;
            comPosition.z += body.mass * body.position.z;
            comVelocity.x += body.mass * body.velocity.x;
            comVelocity.y += body.mass * body.velocity.y;
            comVelocity.z += body.mass * body.velocity.z;
        }
        
        comPosition.x /= totalMass;
        comPosition.y /= totalMass;
        comPosition.z /= totalMass;
        comVelocity.x /= totalMass;
        comVelocity.y /= totalMass;
        comVelocity.z /= totalMass;
        
        return {
            position: comPosition,
            velocity: comVelocity
        };
    }

    /**
     * Get the number of bodies in the simulation
     * @returns {number} Number of bodies
     */
    getBodyCount() {
        return this.bodies.length;
    }

    /**
     * Update configuration
     * @param {Object} config - New configuration
     */
    updateConfig(config) {
        if (config.G !== undefined) this.G = config.G;
        if (config.useRelativistic !== undefined) this.useRelativistic = config.useRelativistic;
        if (config.c !== undefined) this.c = config.c;
        if (config.softening !== undefined) this.softening = config.softening;
        if (config.timeStep !== undefined) this.timeStep = config.timeStep;
    }
}