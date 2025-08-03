/**
 * SimulationWorker class
 * Handles simulation calculations in a web worker
 */

// Import statements are not available in web workers
// We'll need to use importScripts if needed

/**
 * SimulationWorker class
 */
class SimulationWorker {
    /**
     * Initialize the worker
     */
    constructor() {
        this.initialized = false;
        this.id = null;
        
        // Set up message handler
        self.onmessage = this.handleMessage.bind(this);
    }
    
    /**
     * Handle incoming messages
     * @param {MessageEvent} event - Message event
     */
    handleMessage(event) {
        const { type, id, taskId, data } = event.data;
        
        switch (type) {
            case 'init':
                this.init(id, data);
                break;
            case 'task':
                this.executeTask(taskId, data);
                break;
            default:
                console.warn(`Unknown message type: ${type}`);
        }
    }
    
    /**
     * Initialize the worker
     * @param {number} id - Worker ID
     * @param {Object} data - Initialization data
     */
    init(id, data) {
        this.id = id;
        this.initialized = true;
        
        // Send ready message
        self.postMessage({
            type: 'ready',
            id
        });
    }
    
    /**
     * Execute a task
     * @param {string} taskId - Task ID
     * @param {Object} data - Task data
     */
    executeTask(taskId, data) {
        try {
            const { taskType, taskData } = data;
            
            let result;
            
            switch (taskType) {
                case 'nbody':
                    result = this.executeNBodyTask(taskData);
                    break;
                case 'orbit':
                    result = this.executeOrbitTask(taskData);
                    break;
                case 'collision':
                    result = this.executeCollisionTask(taskData);
                    break;
                case 'gravity':
                    result = this.executeGravityTask(taskData);
                    break;
                case 'integration':
                    result = this.executeIntegrationTask(taskData);
                    break;
                default:
                    throw new Error(`Unknown task type: ${taskType}`);
            }
            
            // Send result
            self.postMessage({
                type: 'result',
                taskId,
                result
            });
        } catch (error) {
            // Send error
            self.postMessage({
                type: 'error',
                taskId,
                error: error.message
            });
        }
    }
    
    /**
     * Execute N-body simulation task
     * @param {Object} data - Task data
     * @returns {Object} Task result
     */
    executeNBodyTask(data) {
        const { bodies, deltaTime, steps } = data;
        
        // Clone bodies to avoid modifying original
        const clonedBodies = bodies.map(body => ({ ...body }));
        
        // Perform N-body simulation
        for (let step = 0; step < steps; step++) {
            this.updateNBody(clonedBodies, deltaTime);
        }
        
        return {
            bodies: clonedBodies,
            steps
        };
    }
    
    /**
     * Update N-body simulation
     * @param {Array} bodies - Array of bodies
     * @param {number} deltaTime - Time step
     */
    updateNBody(bodies, deltaTime) {
        const G = 6.67430e-11; // Gravitational constant
        
        // Calculate accelerations
        for (let i = 0; i < bodies.length; i++) {
            const body1 = bodies[i];
            body1.acceleration = { x: 0, y: 0, z: 0 };
            
            for (let j = 0; j < bodies.length; j++) {
                if (i === j) continue;
                
                const body2 = bodies[j];
                
                // Calculate distance
                const dx = body2.position.x - body1.position.x;
                const dy = body2.position.y - body1.position.y;
                const dz = body2.position.z - body1.position.z;
                
                const distanceSquared = dx * dx + dy * dy + dz * dz;
                const distance = Math.sqrt(distanceSquared);
                
                // Avoid division by zero
                if (distance === 0) continue;
                
                // Calculate gravitational force
                const force = G * body1.mass * body2.mass / distanceSquared;
                
                // Calculate acceleration
                const acceleration = force / body1.mass;
                
                // Add to total acceleration
                body1.acceleration.x += acceleration * dx / distance;
                body1.acceleration.y += acceleration * dy / distance;
                body1.acceleration.z += acceleration * dz / distance;
            }
        }
        
        // Update velocities and positions
        for (const body of bodies) {
            // Update velocity
            body.velocity.x += body.acceleration.x * deltaTime;
            body.velocity.y += body.acceleration.y * deltaTime;
            body.velocity.z += body.acceleration.z * deltaTime;
            
            // Update position
            body.position.x += body.velocity.x * deltaTime;
            body.position.y += body.velocity.y * deltaTime;
            body.position.z += body.velocity.z * deltaTime;
        }
    }
    
    /**
     * Execute orbit calculation task
     * @param {Object} data - Task data
     * @returns {Object} Task result
     */
    executeOrbitTask(data) {
        const { orbitalElements, timeSteps } = data;
        
        const positions = [];
        
        for (const time of timeSteps) {
            const position = this.calculateOrbitalPosition(orbitalElements, time);
            positions.push({ time, position });
        }
        
        return {
            positions
        };
    }
    
    /**
     * Calculate orbital position
     * @param {Object} orbitalElements - Orbital elements
     * @param {number} time - Time since epoch
     * @returns {Object} Position
     */
    calculateOrbitalPosition(orbitalElements, time) {
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
        const meanMotion = 2 * Math.PI / orbitalPeriod;
        
        // Calculate mean anomaly
        const meanAnomaly = meanAnomalyAtEpoch + meanMotion * time;
        
        // Calculate eccentric anomaly (simplified)
        let eccentricAnomaly = meanAnomaly;
        for (let i = 0; i < 10; i++) {
            eccentricAnomaly = meanAnomaly + eccentricity * Math.sin(eccentricAnomaly);
        }
        
        // Calculate true anomaly
        const trueAnomaly = 2 * Math.atan2(
            Math.sqrt(1 + eccentricity) * Math.sin(eccentricAnomaly / 2),
            Math.sqrt(1 - eccentricity) * Math.cos(eccentricAnomaly / 2)
        );
        
        // Calculate distance
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
     * Execute collision detection task
     * @param {Object} data - Task data
     * @returns {Object} Task result
     */
    executeCollisionTask(data) {
        const { bodies, deltaTime } = data;
        
        const collisions = [];
        
        // Check for collisions between all pairs of bodies
        for (let i = 0; i < bodies.length; i++) {
            for (let j = i + 1; j < bodies.length; j++) {
                const body1 = bodies[i];
                const body2 = bodies[j];
                
                // Calculate distance
                const dx = body2.position.x - body1.position.x;
                const dy = body2.position.y - body1.position.y;
                const dz = body2.position.z - body1.position.z;
                
                const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);
                
                // Check for collision
                if (distance < body1.radius + body2.radius) {
                    // Calculate collision time (simplified)
                    const relativeVelocity = {
                        x: body2.velocity.x - body1.velocity.x,
                        y: body2.velocity.y - body1.velocity.y,
                        z: body2.velocity.z - body1.velocity.z
                    };
                    
                    const relativeSpeed = Math.sqrt(
                        relativeVelocity.x * relativeVelocity.x +
                        relativeVelocity.y * relativeVelocity.y +
                        relativeVelocity.z * relativeVelocity.z
                    );
                    
                    const collisionTime = deltaTime * (body1.radius + body2.radius - distance) / 
                        (relativeSpeed * deltaTime + (body1.radius + body2.radius - distance));
                    
                    collisions.push({
                        body1: i,
                        body2: j,
                        time: collisionTime,
                        distance
                    });
                }
            }
        }
        
        return {
            collisions
        };
    }
    
    /**
     * Execute gravity calculation task
     * @param {Object} data - Task data
     * @returns {Object} Task result
     */
    executeGravityTask(data) {
        const { bodies } = data;
        
        const G = 6.67430e-11; // Gravitational constant
        const forces = [];
        
        // Calculate gravitational forces between all pairs of bodies
        for (let i = 0; i < bodies.length; i++) {
            const body1 = bodies[i];
            const force = { x: 0, y: 0, z: 0 };
            
            for (let j = 0; j < bodies.length; j++) {
                if (i === j) continue;
                
                const body2 = bodies[j];
                
                // Calculate distance
                const dx = body2.position.x - body1.position.x;
                const dy = body2.position.y - body1.position.y;
                const dz = body2.position.z - body1.position.z;
                
                const distanceSquared = dx * dx + dy * dy + dz * dz;
                const distance = Math.sqrt(distanceSquared);
                
                // Avoid division by zero
                if (distance === 0) continue;
                
                // Calculate gravitational force
                const forceMagnitude = G * body1.mass * body2.mass / distanceSquared;
                
                // Add to total force
                force.x += forceMagnitude * dx / distance;
                force.y += forceMagnitude * dy / distance;
                force.z += forceMagnitude * dz / distance;
            }
            
            forces.push(force);
        }
        
        return {
            forces
        };
    }
    
    /**
     * Execute integration task
     * @param {Object} data - Task data
     * @returns {Object} Task result
     */
    executeIntegrationTask(data) {
        const { bodies, deltaTime, method = 'euler' } = data;
        
        // Clone bodies to avoid modifying original
        const clonedBodies = bodies.map(body => ({ ...body }));
        
        // Perform integration
        switch (method) {
            case 'euler':
                this.eulerIntegration(clonedBodies, deltaTime);
                break;
            case 'verlet':
                this.verletIntegration(clonedBodies, deltaTime);
                break;
            case 'rk4':
                this.rk4Integration(clonedBodies, deltaTime);
                break;
            default:
                throw new Error(`Unknown integration method: ${method}`);
        }
        
        return {
            bodies: clonedBodies,
            method
        };
    }
    
    /**
     * Euler integration
     * @param {Array} bodies - Array of bodies
     * @param {number} deltaTime - Time step
     */
    eulerIntegration(bodies, deltaTime) {
        const G = 6.67430e-11; // Gravitational constant
        
        // Calculate accelerations
        for (let i = 0; i < bodies.length; i++) {
            const body1 = bodies[i];
            body1.acceleration = { x: 0, y: 0, z: 0 };
            
            for (let j = 0; j < bodies.length; j++) {
                if (i === j) continue;
                
                const body2 = bodies[j];
                
                // Calculate distance
                const dx = body2.position.x - body1.position.x;
                const dy = body2.position.y - body1.position.y;
                const dz = body2.position.z - body1.position.z;
                
                const distanceSquared = dx * dx + dy * dy + dz * dz;
                const distance = Math.sqrt(distanceSquared);
                
                // Avoid division by zero
                if (distance === 0) continue;
                
                // Calculate gravitational force
                const force = G * body1.mass * body2.mass / distanceSquared;
                
                // Calculate acceleration
                const acceleration = force / body1.mass;
                
                // Add to total acceleration
                body1.acceleration.x += acceleration * dx / distance;
                body1.acceleration.y += acceleration * dy / distance;
                body1.acceleration.z += acceleration * dz / distance;
            }
        }
        
        // Update velocities and positions
        for (const body of bodies) {
            // Update velocity
            body.velocity.x += body.acceleration.x * deltaTime;
            body.velocity.y += body.acceleration.y * deltaTime;
            body.velocity.z += body.acceleration.z * deltaTime;
            
            // Update position
            body.position.x += body.velocity.x * deltaTime;
            body.position.y += body.velocity.y * deltaTime;
            body.position.z += body.velocity.z * deltaTime;
        }
    }
    
    /**
     * Verlet integration
     * @param {Array} bodies - Array of bodies
     * @param {number} deltaTime - Time step
     */
    verletIntegration(bodies, deltaTime) {
        const G = 6.67430e-11; // Gravitational constant
        
        // Store previous positions
        const previousPositions = bodies.map(body => ({ ...body.position }));
        
        // Calculate accelerations
        for (let i = 0; i < bodies.length; i++) {
            const body1 = bodies[i];
            body1.acceleration = { x: 0, y: 0, z: 0 };
            
            for (let j = 0; j < bodies.length; j++) {
                if (i === j) continue;
                
                const body2 = bodies[j];
                
                // Calculate distance
                const dx = body2.position.x - body1.position.x;
                const dy = body2.position.y - body1.position.y;
                const dz = body2.position.z - body1.position.z;
                
                const distanceSquared = dx * dx + dy * dy + dz * dz;
                const distance = Math.sqrt(distanceSquared);
                
                // Avoid division by zero
                if (distance === 0) continue;
                
                // Calculate gravitational force
                const force = G * body1.mass * body2.mass / distanceSquared;
                
                // Calculate acceleration
                const acceleration = force / body1.mass;
                
                // Add to total acceleration
                body1.acceleration.x += acceleration * dx / distance;
                body1.acceleration.y += acceleration * dy / distance;
                body1.acceleration.z += acceleration * dz / distance;
            }
        }
        
        // Update positions
        for (let i = 0; i < bodies.length; i++) {
            const body = bodies[i];
            const prevPos = previousPositions[i];
            
            // Calculate new position
            const newPosition = {
                x: 2 * body.position.x - prevPos.x + body.acceleration.x * deltaTime * deltaTime,
                y: 2 * body.position.y - prevPos.y + body.acceleration.y * deltaTime * deltaTime,
                z: 2 * body.position.z - prevPos.z + body.acceleration.z * deltaTime * deltaTime
            };
            
            // Update velocity
            body.velocity.x = (newPosition.x - prevPos.x) / (2 * deltaTime);
            body.velocity.y = (newPosition.y - prevPos.y) / (2 * deltaTime);
            body.velocity.z = (newPosition.z - prevPos.z) / (2 * deltaTime);
            
            // Update position
            body.position = newPosition;
        }
    }
    
    /**
     * Runge-Kutta 4th order integration
     * @param {Array} bodies - Array of bodies
     * @param {number} deltaTime - Time step
     */
    rk4Integration(bodies, deltaTime) {
        // Store initial state
        const initialState = bodies.map(body => ({
            position: { ...body.position },
            velocity: { ...body.velocity }
        }));
        
        // Calculate k1
        const k1 = this.calculateDerivatives(bodies);
        
        // Calculate k2
        const k2Bodies = this.applyDerivatives(bodies, k1, deltaTime / 2);
        const k2 = this.calculateDerivatives(k2Bodies);
        
        // Calculate k3
        const k3Bodies = this.applyDerivatives(bodies, k2, deltaTime / 2);
        const k3 = this.calculateDerivatives(k3Bodies);
        
        // Calculate k4
        const k4Bodies = this.applyDerivatives(bodies, k3, deltaTime);
        const k4 = this.calculateDerivatives(k4Bodies);
        
        // Update positions and velocities
        for (let i = 0; i < bodies.length; i++) {
            const body = bodies[i];
            const initial = initialState[i];
            
            // Update position
            body.position.x = initial.position.x + 
                deltaTime / 6 * (k1[i].velocity.x + 2 * k2[i].velocity.x + 2 * k3[i].velocity.x + k4[i].velocity.x);
            body.position.y = initial.position.y + 
                deltaTime / 6 * (k1[i].velocity.y + 2 * k2[i].velocity.y + 2 * k3[i].velocity.y + k4[i].velocity.y);
            body.position.z = initial.position.z + 
                deltaTime / 6 * (k1[i].velocity.z + 2 * k2[i].velocity.z + 2 * k3[i].velocity.z + k4[i].velocity.z);
            
            // Update velocity
            body.velocity.x = initial.velocity.x + 
                deltaTime / 6 * (k1[i].acceleration.x + 2 * k2[i].acceleration.x + 2 * k3[i].acceleration.x + k4[i].acceleration.x);
            body.velocity.y = initial.velocity.y + 
                deltaTime / 6 * (k1[i].acceleration.y + 2 * k2[i].acceleration.y + 2 * k3[i].acceleration.y + k4[i].acceleration.y);
            body.velocity.z = initial.velocity.z + 
                deltaTime / 6 * (k1[i].acceleration.z + 2 * k2[i].acceleration.z + 2 * k3[i].acceleration.z + k4[i].acceleration.z);
        }
    }
    
    /**
     * Calculate derivatives (velocities and accelerations)
     * @param {Array} bodies - Array of bodies
     * @returns {Array} Derivatives
     */
    calculateDerivatives(bodies) {
        const G = 6.67430e-11; // Gravitational constant
        const derivatives = [];
        
        for (let i = 0; i < bodies.length; i++) {
            const body1 = bodies[i];
            const acceleration = { x: 0, y: 0, z: 0 };
            
            for (let j = 0; j < bodies.length; j++) {
                if (i === j) continue;
                
                const body2 = bodies[j];
                
                // Calculate distance
                const dx = body2.position.x - body1.position.x;
                const dy = body2.position.y - body1.position.y;
                const dz = body2.position.z - body1.position.z;
                
                const distanceSquared = dx * dx + dy * dy + dz * dz;
                const distance = Math.sqrt(distanceSquared);
                
                // Avoid division by zero
                if (distance === 0) continue;
                
                // Calculate gravitational force
                const force = G * body1.mass * body2.mass / distanceSquared;
                
                // Calculate acceleration
                const accel = force / body1.mass;
                
                // Add to total acceleration
                acceleration.x += accel * dx / distance;
                acceleration.y += accel * dy / distance;
                acceleration.z += accel * dz / distance;
            }
            
            derivatives.push({
                velocity: { ...body1.velocity },
                acceleration
            });
        }
        
        return derivatives;
    }
    
    /**
     * Apply derivatives to bodies
     * @param {Array} bodies - Array of bodies
     * @param {Array} derivatives - Derivatives
     * @param {number} deltaTime - Time step
     * @returns {Array} Updated bodies
     */
    applyDerivatives(bodies, derivatives, deltaTime) {
        const updatedBodies = [];
        
        for (let i = 0; i < bodies.length; i++) {
            const body = bodies[i];
            const derivative = derivatives[i];
            
            updatedBodies.push({
                ...body,
                position: {
                    x: body.position.x + derivative.velocity.x * deltaTime,
                    y: body.position.y + derivative.velocity.y * deltaTime,
                    z: body.position.z + derivative.velocity.z * deltaTime
                },
                velocity: {
                    x: body.velocity.x + derivative.acceleration.x * deltaTime,
                    y: body.velocity.y + derivative.acceleration.y * deltaTime,
                    z: body.velocity.z + derivative.acceleration.z * deltaTime
                }
            });
        }
        
        return updatedBodies;
    }
}

// Create worker instance
const worker = new SimulationWorker();