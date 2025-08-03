import { MathUtils } from '../utils/MathUtils.js';
import { DateUtils } from '../utils/DateUtils.js';
import { PHYSICS_CONSTANTS, TIME_CONSTANTS } from '../utils/Constants.js';

/**
 * Physics simulation engine for celestial bodies
 */
export class SimulationEngine {
    constructor(config = {}) {
        this.config = {
            timeStep: TIME_CONSTANTS.DEFAULT_TIME_STEP,
            simulationSpeed: TIME_CONSTANTS.TIME_SPEEDS.REAL_TIME,
            maxBodies: 1000,
            useWebWorkers: true,
            gravitationalConstant: PHYSICS_CONSTANTS.GRAVITATIONAL_CONSTANT,
            ...config
        };
        
        // Simulation state
        this.isInitialized = false;
        this.isRunning = false;
        this.isPaused = false;
        this.currentTime = new Date();
        this.simulationTime = 0;
        this.lastUpdateTime = 0;
        
        // Celestial bodies
        this.celestialBodies = new Map();
        this.bodyGroups = new Map();
        
        // Physics calculation
        this.timeStep = this.config.timeStep;
        this.simulationSpeed = this.config.simulationSpeed;
        this.accumulator = 0;
        
        // Performance metrics
        this.metrics = {
            simulationTime: 0,
            bodyCount: 0,
            calculationTime: 0,
            updateTime: 0
        };
        
        // Event callbacks
        this.eventCallbacks = new Map();
        
        // Web Workers for parallel computation
        this.workers = [];
        this.workerCount = navigator.hardwareConcurrency || 4;
        
        // Integration method
        this.integrationMethod = 'rk4'; // Runge-Kutta 4th order
        
        // Reference frame
        this.referenceFrame = 'heliocentric';
    }
    
    /**
     * Initialize the simulation engine
     * @returns {Promise<void>}
     */
    async initialize() {
        try {
            console.log('Initializing Simulation Engine...');
            
            // Initialize Web Workers if enabled
            if (this.config.useWebWorkers) {
                await this.initializeWorkers();
            }
            
            // Set initial time
            this.currentTime = new Date();
            this.simulationTime = DateUtils.dateToJulianDate(this.currentTime);
            
            this.isInitialized = true;
            console.log('Simulation Engine initialized successfully');
            
        } catch (error) {
            console.error('Failed to initialize Simulation Engine:', error);
            throw error;
        }
    }
    
    /**
     * Initialize Web Workers for parallel computation
     * @returns {Promise<void>}
     */
    async initializeWorkers() {
        // Create worker code as a blob
        const workerCode = `
            self.onmessage = function(e) {
                const { bodies, startIndex, endIndex, gravitationalConstant } = e.data;
                const forces = [];
                
                for (let i = startIndex; i < endIndex; i++) {
                    const body = bodies[i];
                    let fx = 0, fy = 0, fz = 0;
                    
                    for (let j = 0; j < bodies.length; j++) {
                        if (i === j) continue;
                        
                        const other = bodies[j];
                        const dx = other.position.x - body.position.x;
                        const dy = other.position.y - body.position.y;
                        const dz = other.position.z - body.position.z;
                        
                        const distanceSquared = dx * dx + dy * dy + dz * dz;
                        const distance = Math.sqrt(distanceSquared);
                        
                        if (distance > 0) {
                            const force = gravitationalConstant * body.mass * other.mass / distanceSquared;
                            const factor = force / distance;
                            
                            fx += factor * dx;
                            fy += factor * dy;
                            fz += factor * dz;
                        }
                    }
                    
                    forces.push({ fx, fy, fz });
                }
                
                self.postMessage({ startIndex, forces });
            };
        `;
        
        const blob = new Blob([workerCode], { type: 'application/javascript' });
        const workerUrl = URL.createObjectURL(blob);
        
        // Create workers
        for (let i = 0; i < this.workerCount; i++) {
            this.workers.push(new Worker(workerUrl));
        }
    }
    
    /**
     * Start the simulation
     */
    start() {
        if (!this.isInitialized) {
            throw new Error('Simulation Engine must be initialized before starting');
        }
        
        if (this.isRunning) {
            console.warn('Simulation Engine is already running');
            return;
        }
        
        this.isRunning = true;
        this.isPaused = false;
        this.lastUpdateTime = performance.now();
        
        console.log('Simulation Engine started');
        this.emit('started');
    }
    
    /**
     * Stop the simulation
     */
    stop() {
        if (!this.isRunning) {
            console.warn('Simulation Engine is not running');
            return;
        }
        
        this.isRunning = false;
        this.isPaused = false;
        
        console.log('Simulation Engine stopped');
        this.emit('stopped');
    }
    
    /**
     * Pause the simulation
     */
    pause() {
        if (!this.isRunning || this.isPaused) {
            return;
        }
        
        this.isPaused = true;
        console.log('Simulation paused');
        this.emit('paused');
    }
    
    /**
     * Resume the simulation
     */
    play() {
        if (!this.isRunning || !this.isPaused) {
            return;
        }
        
        this.isPaused = false;
        this.lastUpdateTime = performance.now();
        console.log('Simulation resumed');
        this.emit('resumed');
    }
    
    /**
     * Reset the simulation
     */
    reset() {
        this.currentTime = new Date();
        this.simulationTime = DateUtils.dateToJulianDate(this.currentTime);
        this.accumulator = 0;
        
        // Reset body positions to initial state
        for (const [id, body] of this.celestialBodies) {
            if (body.initialState) {
                body.position = { ...body.initialState.position };
                body.velocity = { ...body.initialState.velocity };
            }
        }
        
        this.emit('reset');
        console.log('Simulation reset');
    }
    
    /**
     * Update the simulation
     * @param {number} deltaTime - Time since last update in milliseconds
     */
    update(deltaTime) {
        if (!this.isRunning || this.isPaused) return;
        
        const startTime = performance.now();
        
        // Convert to seconds and apply simulation speed
        const simulationDelta = (deltaTime / 1000) * this.simulationSpeed;
        
        // Update simulation time
        this.simulationTime += simulationDelta / (24 * 3600); // Convert to days
        this.currentTime = DateUtils.julianDateToDate(this.simulationTime);
        
        // Fixed timestep with accumulator
        this.accumulator += simulationDelta;
        
        let steps = 0;
        const maxSteps = 10; // Prevent spiral of death
        
        while (this.accumulator >= this.timeStep && steps < maxSteps) {
            this.step(this.timeStep);
            this.accumulator -= this.timeStep;
            steps++;
        }
        
        // Update metrics
        this.metrics.simulationTime = performance.now() - startTime;
        this.metrics.bodyCount = this.celestialBodies.size;
        this.metrics.updateTime = deltaTime;
        
        // Emit update event
        this.emit('updated', {
            time: this.currentTime,
            simulationTime: this.simulationTime,
            bodies: this.celestialBodies,
            metrics: this.metrics
        });
        
        // Emit time update event
        this.emit('timeUpdated', {
            currentTime: this.currentTime,
            simulationTime: this.simulationTime,
            simulationSpeed: this.simulationSpeed
        });
    }
    
    /**
     * Perform a single simulation step
     * @param {number} dt - Time step in seconds
     */
    step(dt) {
        const startTime = performance.now();
        
        // Choose integration method
        switch (this.integrationMethod) {
            case 'euler':
                this.eulerStep(dt);
                break;
            case 'rk2':
                this.rk2Step(dt);
                break;
            case 'rk4':
                this.rk4Step(dt);
                break;
            default:
                this.rk4Step(dt);
        }
        
        // Update metrics
        this.metrics.calculationTime = performance.now() - startTime;
    }
    
    /**
     * Euler integration step
     * @param {number} dt - Time step in seconds
     */
    eulerStep(dt) {
        const bodies = Array.from(this.celestialBodies.values());
        const forces = this.calculateForces(bodies);
        
        for (let i = 0; i < bodies.length; i++) {
            const body = bodies[i];
            const force = forces[i];
            
            // Update velocity
            body.velocity.x += (force.fx / body.mass) * dt;
            body.velocity.y += (force.fy / body.mass) * dt;
            body.velocity.z += (force.fz / body.mass) * dt;
            
            // Update position
            body.position.x += body.velocity.x * dt;
            body.position.y += body.velocity.y * dt;
            body.position.z += body.velocity.z * dt;
        }
    }
    
    /**
     * Runge-Kutta 2nd order integration step
     * @param {number} dt - Time step in seconds
     */
    rk2Step(dt) {
        const bodies = Array.from(this.celestialBodies.values());
        
        // Calculate k1
        const forces1 = this.calculateForces(bodies);
        const k1 = [];
        
        for (let i = 0; i < bodies.length; i++) {
            const body = bodies[i];
            const force = forces1[i];
            
            k1.push({
                vx: (force.fx / body.mass) * dt,
                vy: (force.fy / body.mass) * dt,
                vz: (force.fz / body.mass) * dt,
                px: body.velocity.x * dt,
                py: body.velocity.y * dt,
                pz: body.velocity.z * dt
            });
        }
        
        // Calculate k2
        const tempBodies = [];
        for (let i = 0; i < bodies.length; i++) {
            const body = bodies[i];
            tempBodies.push({
                ...body,
                position: {
                    x: body.position.x + k1[i].px / 2,
                    y: body.position.y + k1[i].py / 2,
                    z: body.position.z + k1[i].pz / 2
                },
                velocity: {
                    x: body.velocity.x + k1[i].vx / 2,
                    y: body.velocity.y + k1[i].vy / 2,
                    z: body.velocity.z + k1[i].vz / 2
                }
            });
        }
        
        const forces2 = this.calculateForces(tempBodies);
        
        // Update bodies
        for (let i = 0; i < bodies.length; i++) {
            const body = bodies[i];
            const force = forces2[i];
            
            body.velocity.x += (force.fx / body.mass) * dt;
            body.velocity.y += (force.fy / body.mass) * dt;
            body.velocity.z += (force.fz / body.mass) * dt;
            
            body.position.x += body.velocity.x * dt;
            body.position.y += body.velocity.y * dt;
            body.position.z += body.velocity.z * dt;
        }
    }
    
    /**
     * Runge-Kutta 4th order integration step
     * @param {number} dt - Time step in seconds
     */
    rk4Step(dt) {
        const bodies = Array.from(this.celestialBodies.values());
        
        // Calculate k1
        const forces1 = this.calculateForces(bodies);
        const k1 = [];
        
        for (let i = 0; i < bodies.length; i++) {
            const body = bodies[i];
            const force = forces1[i];
            
            k1.push({
                vx: (force.fx / body.mass) * dt,
                vy: (force.fy / body.mass) * dt,
                vz: (force.fz / body.mass) * dt,
                px: body.velocity.x * dt,
                py: body.velocity.y * dt,
                pz: body.velocity.z * dt
            });
        }
        
        // Calculate k2
        const tempBodies2 = [];
        for (let i = 0; i < bodies.length; i++) {
            const body = bodies[i];
            tempBodies2.push({
                ...body,
                position: {
                    x: body.position.x + k1[i].px / 2,
                    y: body.position.y + k1[i].py / 2,
                    z: body.position.z + k1[i].pz / 2
                },
                velocity: {
                    x: body.velocity.x + k1[i].vx / 2,
                    y: body.velocity.y + k1[i].vy / 2,
                    z: body.velocity.z + k1[i].vz / 2
                }
            });
        }
        
        const forces2 = this.calculateForces(tempBodies2);
        const k2 = [];
        
        for (let i = 0; i < bodies.length; i++) {
            const body = tempBodies2[i];
            const force = forces2[i];
            
            k2.push({
                vx: (force.fx / body.mass) * dt,
                vy: (force.fy / body.mass) * dt,
                vz: (force.fz / body.mass) * dt,
                px: body.velocity.x * dt,
                py: body.velocity.y * dt,
                pz: body.velocity.z * dt
            });
        }
        
        // Calculate k3
        const tempBodies3 = [];
        for (let i = 0; i < bodies.length; i++) {
            const body = bodies[i];
            tempBodies3.push({
                ...body,
                position: {
                    x: body.position.x + k2[i].px / 2,
                    y: body.position.y + k2[i].py / 2,
                    z: body.position.z + k2[i].pz / 2
                },
                velocity: {
                    x: body.velocity.x + k2[i].vx / 2,
                    y: body.velocity.y + k2[i].vy / 2,
                    z: body.velocity.z + k2[i].vz / 2
                }
            });
        }
        
        const forces3 = this.calculateForces(tempBodies3);
        const k3 = [];
        
        for (let i = 0; i < bodies.length; i++) {
            const body = tempBodies3[i];
            const force = forces3[i];
            
            k3.push({
                vx: (force.fx / body.mass) * dt,
                vy: (force.fy / body.mass) * dt,
                vz: (force.fz / body.mass) * dt,
                px: body.velocity.x * dt,
                py: body.velocity.y * dt,
                pz: body.velocity.z * dt
            });
        }
        
        // Calculate k4
        const tempBodies4 = [];
        for (let i = 0; i < bodies.length; i++) {
            const body = bodies[i];
            tempBodies4.push({
                ...body,
                position: {
                    x: body.position.x + k3[i].px,
                    y: body.position.y + k3[i].py,
                    z: body.position.z + k3[i].pz
                },
                velocity: {
                    x: body.velocity.x + k3[i].vx,
                    y: body.velocity.y + k3[i].vy,
                    z: body.velocity.z + k3[i].vz
                }
            });
        }
        
        const forces4 = this.calculateForces(tempBodies4);
        const k4 = [];
        
        for (let i = 0; i < bodies.length; i++) {
            const body = tempBodies4[i];
            const force = forces4[i];
            
            k4.push({
                vx: (force.fx / body.mass) * dt,
                vy: (force.fy / body.mass) * dt,
                vz: (force.fz / body.mass) * dt,
                px: body.velocity.x * dt,
                py: body.velocity.y * dt,
                pz: body.velocity.z * dt
            });
        }
        
        // Update bodies using weighted average
        for (let i = 0; i < bodies.length; i++) {
            const body = bodies[i];
            
            body.velocity.x += (k1[i].vx + 2 * k2[i].vx + 2 * k3[i].vx + k4[i].vx) / 6;
            body.velocity.y += (k1[i].vy + 2 * k2[i].vy + 2 * k3[i].vy + k4[i].vy) / 6;
            body.velocity.z += (k1[i].vz + 2 * k2[i].vz + 2 * k3[i].vz + k4[i].vz) / 6;
            
            body.position.x += (k1[i].px + 2 * k2[i].px + 2 * k3[i].px + k4[i].px) / 6;
            body.position.y += (k1[i].py + 2 * k2[i].py + 2 * k3[i].py + k4[i].py) / 6;
            body.position.z += (k1[i].pz + 2 * k2[i].pz + 2 * k3[i].pz + k4[i].pz) / 6;
        }
    }
    
    /**
     * Calculate gravitational forces between bodies
     * @param {Array} bodies - Array of celestial bodies
     * @returns {Array} Array of force objects
     */
    calculateForces(bodies) {
        const forces = new Array(bodies.length).fill(null).map(() => ({ fx: 0, fy: 0, fz: 0 }));
        
        // Use Web Workers for parallel computation if enabled
        if (this.config.useWebWorkers && this.workers.length > 0 && bodies.length > 10) {
            return this.calculateForcesParallel(bodies);
        }
        
        // Sequential computation
        for (let i = 0; i < bodies.length; i++) {
            const body = bodies[i];
            
            for (let j = 0; j < bodies.length; j++) {
                if (i === j) continue;
                
                const other = bodies[j];
                const dx = other.position.x - body.position.x;
                const dy = other.position.y - body.position.y;
                const dz = other.position.z - body.position.z;
                
                const distanceSquared = dx * dx + dy * dy + dz * dz;
                const distance = Math.sqrt(distanceSquared);
                
                if (distance > 0) {
                    const force = this.config.gravitationalConstant * body.mass * other.mass / distanceSquared;
                    const factor = force / distance;
                    
                    forces[i].fx += factor * dx;
                    forces[i].fy += factor * dy;
                    forces[i].fz += factor * dz;
                }
            }
        }
        
        return forces;
    }
    
    /**
     * Calculate forces using Web Workers
     * @param {Array} bodies - Array of celestial bodies
     * @returns {Promise<Array>} Array of force objects
     */
    async calculateForcesParallel(bodies) {
        return new Promise((resolve) => {
            const forces = new Array(bodies.length).fill(null).map(() => ({ fx: 0, fy: 0, fz: 0 }));
            const bodiesPerWorker = Math.ceil(bodies.length / this.workers.length);
            let completedWorkers = 0;
            
            for (let i = 0; i < this.workers.length; i++) {
                const startIndex = i * bodiesPerWorker;
                const endIndex = Math.min(startIndex + bodiesPerWorker, bodies.length);
                
                if (startIndex >= bodies.length) break;
                
                this.workers[i].onmessage = (e) => {
                    const { startIndex: workerStartIndex, forces: workerForces } = e.data;
                    
                    for (let j = 0; j < workerForces.length; j++) {
                        forces[workerStartIndex + j] = workerForces[j];
                    }
                    
                    completedWorkers++;
                    if (completedWorkers === Math.min(this.workers.length, Math.ceil(bodies.length / bodiesPerWorker))) {
                        resolve(forces);
                    }
                };
                
                this.workers[i].postMessage({
                    bodies,
                    startIndex,
                    endIndex,
                    gravitationalConstant: this.config.gravitationalConstant
                });
            }
        });
    }
    
    /**
     * Add a celestial body to the simulation
     * @param {string} id - Body ID
     * @param {Object} bodyData - Body data
     */
    addCelestialBody(id, bodyData) {
        const body = {
            id,
            name: bodyData.name || id,
            mass: bodyData.mass || 0,
            radius: bodyData.radius || 0,
            position: { ...bodyData.position },
            velocity: { ...bodyData.velocity },
            acceleration: { x: 0, y: 0, z: 0 },
            color: bodyData.color || 0xffffff,
            orbit: bodyData.orbit || null,
            group: bodyData.group || 'default'
        };
        
        // Store initial state for reset
        body.initialState = {
            position: { ...body.position },
            velocity: { ...body.velocity }
        };
        
        this.celestialBodies.set(id, body);
        
        // Add to group
        if (!this.bodyGroups.has(body.group)) {
            this.bodyGroups.set(body.group, new Set());
        }
        this.bodyGroups.get(body.group).add(id);
        
        this.emit('bodyAdded', { id, body });
    }
    
    /**
     * Remove a celestial body from the simulation
     * @param {string} id - Body ID
     */
    removeCelestialBody(id) {
        const body = this.celestialBodies.get(id);
        if (body) {
            // Remove from group
            const group = this.bodyGroups.get(body.group);
            if (group) {
                group.delete(id);
                if (group.size === 0) {
                    this.bodyGroups.delete(body.group);
                }
            }
            
            this.celestialBodies.delete(id);
            this.emit('bodyRemoved', { id });
        }
    }
    
    /**
     * Update celestial body data
     * @param {Object} data - Celestial body data
     */
    updateCelestialData(data) {
        for (const [id, bodyData] of Object.entries(data)) {
            if (this.celestialBodies.has(id)) {
                const body = this.celestialBodies.get(id);
                
                // Update properties
                if (bodyData.mass !== undefined) body.mass = bodyData.mass;
                if (bodyData.radius !== undefined) body.radius = bodyData.radius;
                if (bodyData.color !== undefined) body.color = bodyData.color;
                if (bodyData.orbit !== undefined) body.orbit = bodyData.orbit;
                
                // Update position and velocity if provided
                if (bodyData.position) {
                    body.position = { ...bodyData.position };
                    body.initialState.position = { ...bodyData.position };
                }
                
                if (bodyData.velocity) {
                    body.velocity = { ...bodyData.velocity };
                    body.initialState.velocity = { ...bodyData.velocity };
                }
            } else {
                // Add new body
                this.addCelestialBody(id, bodyData);
            }
        }
        
        this.emit('bodiesUpdated', this.celestialBodies);
    }
    
    /**
     * Set simulation time
     * @param {Date} date - New simulation date
     */
    setCurrentTime(date) {
        this.currentTime = new Date(date);
        this.simulationTime = DateUtils.dateToJulianDate(this.currentTime);
        this.emit('timeSet', { currentTime: this.currentTime, simulationTime: this.simulationTime });
    }
    
    /**
     * Set simulation speed
     * @param {number} speed - Simulation speed multiplier
     */
    setTimeSpeed(speed) {
        this.simulationSpeed = speed;
        this.emit('speedChanged', speed);
    }
    
    /**
     * Set integration method
     * @param {string} method - Integration method ('euler', 'rk2', 'rk4')
     */
    setIntegrationMethod(method) {
        if (['euler', 'rk2', 'rk4'].includes(method)) {
            this.integrationMethod = method;
            this.emit('integrationMethodChanged', method);
        }
    }
    
    /**
     * Set reference frame
     * @param {string} frame - Reference frame ('heliocentric', 'geocentric', etc.)
     */
    setReferenceFrame(frame) {
        this.referenceFrame = frame;
        this.emit('referenceFrameChanged', frame);
    }
    
    /**
     * Update engine configuration
     * @param {Object} config - New configuration
     */
    updateConfig(config) {
        this.config = { ...this.config, ...config };
        
        if (config.timeStep !== undefined) {
            this.timeStep = config.timeStep;
        }
        
        if (config.simulationSpeed !== undefined) {
            this.simulationSpeed = config.simulationSpeed;
        }
        
        if (config.gravitationalConstant !== undefined) {
            this.config.gravitationalConstant = config.gravitationalConstant;
        }
        
        this.emit('configUpdated', this.config);
    }
    
    /**
     * Get simulation engine status
     * @returns {Object} Status information
     */
    getStatus() {
        return {
            isInitialized: this.isInitialized,
            isRunning: this.isRunning,
            isPaused: this.isPaused,
            currentTime: this.currentTime,
            simulationTime: this.simulationTime,
            simulationSpeed: this.simulationSpeed,
            timeStep: this.timeStep,
            bodyCount: this.celestialBodies.size,
            integrationMethod: this.integrationMethod,
            referenceFrame: this.referenceFrame,
            metrics: this.metrics,
            config: this.config
        };
    }
    
    /**
     * Register event callback
     * @param {string} event - Event name
     * @param {Function} callback - Callback function
     */
    on(event, callback) {
        if (!this.eventCallbacks.has(event)) {
            this.eventCallbacks.set(event, []);
        }
        
        this.eventCallbacks.get(event).push(callback);
    }
    
    /**
     * Remove event callback
     * @param {string} event - Event name
     * @param {Function} callback - Callback function
     */
    off(event, callback) {
        if (this.eventCallbacks.has(event)) {
            const callbacks = this.eventCallbacks.get(event);
            const index = callbacks.indexOf(callback);
            
            if (index !== -1) {
                callbacks.splice(index, 1);
            }
            
            if (callbacks.length === 0) {
                this.eventCallbacks.delete(event);
            }
        }
    }
    
    /**
     * Emit event
     * @param {string} event - Event name
     * @param {...*} args - Event arguments
     */
    emit(event, ...args) {
        if (this.eventCallbacks.has(event)) {
            for (const callback of this.eventCallbacks.get(event)) {
                try {
                    callback(...args);
                } catch (error) {
                    console.error(`Error in simulation engine event callback for "${event}":`, error);
                }
            }
        }
    }
    
    /**
     * Destroy the simulation engine
     */
    destroy() {
        this.stop();
        
        // Terminate Web Workers
        for (const worker of this.workers) {
            worker.terminate();
        }
        this.workers = [];
        
        this.eventCallbacks.clear();
        console.log('Simulation Engine destroyed');
    }
}