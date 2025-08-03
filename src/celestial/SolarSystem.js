import { CelestialBody } from './CelestialBody.js';
import { Star } from './Star.js';
import { Planet } from './Planet.js';
import { Moon } from './Moon.js';
import { NBodyIntegrator } from '../physics/NBodyIntegrator.js';
import { Perturbations } from '../physics/Perturbations.js';
import { CoordinateTransform } from '../physics/CoordinateTransform.js';
import { MathUtils } from '../utils/MathUtils.js';
import { EventSystem } from '../utils/EventSystem.js';

/**
 * Solar system class for managing a collection of celestial bodies
 */
export class SolarSystem {
    /**
     * Create a new solar system
     * @param {Object} config - Configuration object
     */
    constructor(config = {}) {
        this.id = config.id || MathUtils.generateUUID();
        this.name = config.name || 'Unnamed Solar System';
        this.description = config.description || '';
        this.age = config.age || 0;
        
        // Bodies in the system
        this.bodies = [];
        this.stars = [];
        this.planets = [];
        this.moons = [];
        this.asteroids = [];
        this.comets = [];
        this.spacecraft = [];
        
        // Physics simulation
        this.integrator = config.integrator || new NBodyIntegrator(config.physicsConfig);
        this.perturbations = config.perturbations || new Perturbations(config.perturbationsConfig);
        this.coordinateTransform = config.coordinateTransform || new CoordinateTransform(config.coordinateConfig);
        
        // Simulation parameters
        this.time = config.time || new Date();
        this.timeScale = config.timeScale || 1;
        this.useNBody = config.useNBody !== undefined ? config.useNBody : false;
        this.usePerturbations = config.usePerturbations !== undefined ? config.usePerturbations : true;
        this.paused = config.paused !== undefined ? config.paused : false;
        
        // Reference frame
        this.referenceBody = config.referenceBody || null;
        this.referenceFrame = config.referenceFrame || 'inertial';
        
        // Display options
        this.showOrbits = config.showOrbits !== undefined ? config.showOrbits : true;
        this.showLabels = config.showLabels !== undefined ? config.showLabels : true;
        this.showGrid = config.showGrid !== undefined ? config.showGrid : false;
        this.showConstellations = config.showConstellations !== undefined ? config.showConstellations : false;
        
        // Event system
        this.eventSystem = new EventSystem();
        
        // Initialize with provided bodies
        if (config.bodies) {
            this.addBodies(config.bodies);
        }
        
        // Set up event listeners
        this.setupEventListeners();
    }

    /**
     * Set up event listeners
     */
    setupEventListeners() {
        this.eventSystem.on('bodyAdded', (body) => {
            this.categorizeBody(body);
        });
        
        this.eventSystem.on('bodyRemoved', (body) => {
            this.uncategorizeBody(body);
        });
        
        this.eventSystem.on('timeChanged', (time) => {
            this.time = time;
        });
        
        this.eventSystem.on('timeScaleChanged', (scale) => {
            this.timeScale = scale;
        });
        
        this.eventSystem.on('simulationPaused', (paused) => {
            this.paused = paused;
        });
    }

    /**
     * Add a body to the solar system
     * @param {CelestialBody} body - Body to add
     */
    addBody(body) {
        if (!this.bodies.includes(body)) {
            this.bodies.push(body);
            this.eventSystem.emit('bodyAdded', body);
        }
    }

    /**
     * Add multiple bodies to the solar system
     * @param {Array} bodies - Array of bodies to add
     */
    addBodies(bodies) {
        for (const body of bodies) {
            this.addBody(body);
        }
    }

    /**
     * Remove a body from the solar system
     * @param {CelestialBody} body - Body to remove
     */
    removeBody(body) {
        const index = this.bodies.indexOf(body);
        if (index !== -1) {
            this.bodies.splice(index, 1);
            this.eventSystem.emit('bodyRemoved', body);
        }
    }

    /**
     * Categorize a body by its type
     * @param {CelestialBody} body - Body to categorize
     */
    categorizeBody(body) {
        if (body instanceof Star) {
            if (!this.stars.includes(body)) {
                this.stars.push(body);
                
                // Add as perturbing body
                this.perturbations.addPerturbingBody({
                    id: body.id,
                    name: body.name,
                    mass: body.mass,
                    position: body.position,
                    J2: body.oblateness || 0,
                    radius: body.radius
                });
            }
        } else if (body instanceof Planet) {
            if (!this.planets.includes(body)) {
                this.planets.push(body);
                
                // Add as perturbing body
                this.perturbations.addPerturbingBody({
                    id: body.id,
                    name: body.name,
                    mass: body.mass,
                    position: body.position,
                    J2: body.oblateness || 0,
                    radius: body.radius
                });
            }
        } else if (body instanceof Moon) {
            if (!this.moons.includes(body)) {
                this.moons.push(body);
            }
        } else {
            // Generic celestial body
            const category = body.category;
            
            if (category === 'asteroid' && !this.asteroids.includes(body)) {
                this.asteroids.push(body);
            } else if (category === 'comet' && !this.comets.includes(body)) {
                this.comets.push(body);
            } else if (category === 'spacecraft' && !this.spacecraft.includes(body)) {
                this.spacecraft.push(body);
            }
        }
        
        // Add to N-body integrator
        this.integrator.addBody({
            id: body.id,
            name: body.name,
            mass: body.mass,
            radius: body.radius,
            position: body.position,
            velocity: body.velocity
        });
    }

    /**
     * Uncategorize a body
     * @param {CelestialBody} body - Body to uncategorize
     */
    uncategorizeBody(body) {
        if (body instanceof Star) {
            const index = this.stars.indexOf(body);
            if (index !== -1) {
                this.stars.splice(index, 1);
            }
        } else if (body instanceof Planet) {
            const index = this.planets.indexOf(body);
            if (index !== -1) {
                this.planets.splice(index, 1);
            }
        } else if (body instanceof Moon) {
            const index = this.moons.indexOf(body);
            if (index !== -1) {
                this.moons.splice(index, 1);
            }
        } else {
            const category = body.category;
            
            if (category === 'asteroid') {
                const index = this.asteroids.indexOf(body);
                if (index !== -1) {
                    this.asteroids.splice(index, 1);
                }
            } else if (category === 'comet') {
                const index = this.comets.indexOf(body);
                if (index !== -1) {
                    this.comets.splice(index, 1);
                }
            } else if (category === 'spacecraft') {
                const index = this.spacecraft.indexOf(body);
                if (index !== -1) {
                    this.spacecraft.splice(index, 1);
                }
            }
        }
        
        // Remove from N-body integrator
        this.integrator.removeBody(body.id);
        
        // Remove from perturbations
        this.perturbations.removePerturbingBody(body.id);
    }

    /**
     * Get a body by ID
     * @param {string|number} id - Body ID
     * @returns {CelestialBody|null} Body or null if not found
     */
    getBodyById(id) {
        return this.bodies.find(body => body.id === id) || null;
    }

    /**
     * Get a body by name
     * @param {string} name - Body name
     * @returns {CelestialBody|null} Body or null if not found
     */
    getBodyByName(name) {
        return this.bodies.find(body => body.name === name) || null;
    }

    /**
     * Get all bodies
     * @returns {Array} Array of all bodies
     */
    getBodies() {
        return [...this.bodies];
    }

    /**
     * Get all stars
     * @returns {Array} Array of all stars
     */
    getStars() {
        return [...this.stars];
    }

    /**
     * Get all planets
     * @returns {Array} Array of all planets
     */
    getPlanets() {
        return [...this.planets];
    }

    /**
     * Get all moons
     * @returns {Array} Array of all moons
     */
    getMoons() {
        return [...this.moons];
    }

    /**
     * Get all asteroids
     * @returns {Array} Array of all asteroids
     */
    getAsteroids() {
        return [...this.asteroids];
    }

    /**
     * Get all comets
     * @returns {Array} Array of all comets
     */
    getComets() {
        return [...this.comets];
    }

    /**
     * Get all spacecraft
     * @returns {Array} Array of all spacecraft
     */
    getSpacecraft() {
        return [...this.spacecraft];
    }

    /**
     * Get bodies in a specific category
     * @param {string} category - Category name
     * @returns {Array} Array of bodies in the category
     */
    getBodiesByCategory(category) {
        return this.bodies.filter(body => body.category === category);
    }

    /**
     * Get bodies orbiting a specific parent
     * @param {CelestialBody} parent - Parent body
     * @returns {Array} Array of bodies orbiting the parent
     */
    getBodiesByParent(parent) {
        return this.bodies.filter(body => body.parent === parent);
    }

    /**
     * Calculate center of mass of the system
     * @returns {Object} Center of mass position and velocity
     */
    calculateCenterOfMass() {
        return this.integrator.calculateCenterOfMass();
    }

    /**
     * Calculate total mass of the system
     * @returns {number} Total mass in kg
     */
    calculateTotalMass() {
        return this.bodies.reduce((total, body) => total + body.mass, 0);
    }

    /**
     * Calculate total angular momentum of the system
     * @returns {Object} Angular momentum vector
     */
    calculateTotalAngularMomentum() {
        let totalL = { x: 0, y: 0, z: 0 };
        
        for (const body of this.bodies) {
            const r = body.position;
            const v = body.velocity;
            const L = MathUtils.crossProduct(r, v);
            totalL = MathUtils.addVectors(totalL, MathUtils.multiplyVector(L, body.mass));
        }
        
        return totalL;
    }

    /**
     * Calculate total energy of the system
     * @returns {Object} Kinetic, potential, and total energy
     */
    calculateTotalEnergy() {
        let kineticEnergy = 0;
        let potentialEnergy = 0;
        const G = 6.67430e-11; // Gravitational constant
        
        // Calculate kinetic energy
        for (const body of this.bodies) {
            const v2 = MathUtils.vectorMagnitudeSquared(body.velocity);
            kineticEnergy += 0.5 * body.mass * v2;
        }
        
        // Calculate potential energy
        for (let i = 0; i < this.bodies.length; i++) {
            for (let j = i + 1; j < this.bodies.length; j++) {
                const body1 = this.bodies[i];
                const body2 = this.bodies[j];
                const r = MathUtils.vectorMagnitude(
                    MathUtils.subtractVectors(body1.position, body2.position)
                );
                potentialEnergy -= G * body1.mass * body2.mass / r;
            }
        }
        
        return {
            kinetic: kineticEnergy,
            potential: potentialEnergy,
            total: kineticEnergy + potentialEnergy
        };
    }

    /**
     * Set reference body for coordinate system
     * @param {CelestialBody} body - Reference body
     */
    setReferenceBody(body) {
        this.referenceBody = body;
        this.eventSystem.emit('referenceBodyChanged', body);
    }

    /**
     * Set reference frame type
     * @param {string} frameType - Reference frame type
     */
    setReferenceFrame(frameType) {
        this.referenceFrame = frameType;
        this.eventSystem.emit('referenceFrameChanged', frameType);
    }

    /**
     * Transform coordinates to reference frame
     * @param {Object} position - Position in inertial frame
     * @returns {Object} Position in reference frame
     */
    transformToReferenceFrame(position) {
        if (!this.referenceBody || this.referenceFrame === 'inertial') {
            return position;
        }
        
        if (this.referenceFrame === 'body-centered') {
            return MathUtils.subtractVectors(position, this.referenceBody.position);
        }
        
        return position;
    }

    /**
     * Transform coordinates from reference frame
     * @param {Object} position - Position in reference frame
     * @returns {Object} Position in inertial frame
     */
    transformFromReferenceFrame(position) {
        if (!this.referenceBody || this.referenceFrame === 'inertial') {
            return position;
        }
        
        if (this.referenceFrame === 'body-centered') {
            return MathUtils.addVectors(position, this.referenceBody.position);
        }
        
        return position;
    }

    /**
     * Update the solar system
     * @param {number} deltaTime - Time elapsed in seconds
     */
    update(deltaTime) {
        if (this.paused) return;
        
        // Scale time
        const scaledDeltaTime = deltaTime * this.timeScale;
        
        // Update time
        const newTime = new Date(this.time.getTime() + scaledDeltaTime * 1000);
        this.eventSystem.emit('timeChanged', newTime);
        
        // Update bodies using N-body integration or Keplerian orbits
        if (this.useNBody) {
            this.updateNBody(scaledDeltaTime);
        } else {
            this.updateKeplerian(newTime);
        }
        
        // Apply perturbations if enabled
        if (this.usePerturbations) {
            this.applyPerturbations(scaledDeltaTime);
        }
        
        // Update all bodies
        for (const body of this.bodies) {
            body.update(newTime, scaledDeltaTime);
        }
        
        // Update parent-child relationships
        this.updateHierarchy();
    }

    /**
     * Update using N-body integration
     * @param {number} deltaTime - Time elapsed in seconds
     */
    updateNBody(deltaTime) {
        // Update integrator time step
        this.integrator.timeStep = deltaTime;
        
        // Integrate
        this.integrator.step();
        
        // Update body positions and velocities
        for (const body of this.bodies) {
            const integratorBody = this.integrator.getBody(body.id);
            if (integratorBody) {
                body.position = { ...integratorBody.position };
                body.velocity = { ...integratorBody.velocity };
                body.acceleration = { ...integratorBody.acceleration };
            }
        }
    }

    /**
     * Update using Keplerian orbits
     * @param {Date} time - Current time
     */
    updateKeplerian(time) {
        for (const body of this.bodies) {
            if (body.orbit && !body.parent) {
                body.updateFromOrbit(time);
            }
        }
    }

    /**
     * Apply perturbations to bodies
     * @param {number} deltaTime - Time elapsed in seconds
     */
    applyPerturbations(deltaTime) {
        for (const body of this.bodies) {
            if (body.parent) {
                // Apply perturbations to bodies with parents
                const centralBody = body.parent;
                const perturbation = this.perturbations.calculateTotalPerturbation(
                    body.position,
                    body.velocity,
                    {
                        id: centralBody.id,
                        name: centralBody.name,
                        mass: centralBody.mass,
                        position: centralBody.position,
                        J2: centralBody.oblateness || 0,
                        radius: centralBody.radius
                    }
                );
                
                // Update velocity and position
                const deltaV = MathUtils.multiplyVector(perturbation, deltaTime);
                body.velocity = MathUtils.addVectors(body.velocity, deltaV);
            }
        }
    }

    /**
     * Update parent-child relationships
     */
    updateHierarchy() {
        // Clear existing relationships
        for (const body of this.bodies) {
            body.children = [];
        }
        
        // Rebuild relationships
        for (const body of this.bodies) {
            if (body.parentId) {
                const parent = this.getBodyById(body.parentId);
                if (parent) {
                    parent.addChild(body);
                }
            }
        }
    }

    /**
     * Pause the simulation
     */
    pause() {
        this.paused = true;
        this.eventSystem.emit('simulationPaused', true);
    }

    /**
     * Resume the simulation
     */
    resume() {
        this.paused = false;
        this.eventSystem.emit('simulationPaused', false);
    }

    /**
     * Toggle pause state
     */
    togglePause() {
        this.paused = !this.paused;
        this.eventSystem.emit('simulationPaused', this.paused);
    }

    /**
     * Set time scale
     * @param {number} scale - Time scale factor
     */
    setTimeScale(scale) {
        this.timeScale = scale;
        this.eventSystem.emit('timeScaleChanged', scale);
    }

    /**
     * Get current time
     * @returns {Date} Current simulation time
     */
    getTime() {
        return this.time;
    }

    /**
     * Set current time
     * @param {Date} time - New simulation time
     */
    setTime(time) {
        this.time = time;
        this.eventSystem.emit('timeChanged', time);
    }

    /**
     * Toggle N-body simulation
     */
    toggleNBody() {
        this.useNBody = !this.useNBody;
        this.eventSystem.emit('nBodyToggled', this.useNBody);
    }

    /**
     * Toggle perturbations
     */
    togglePerturbations() {
        this.usePerturbations = !this.usePerturbations;
        this.eventSystem.emit('perturbationsToggled', this.usePerturbations);
    }

    /**
     * Toggle orbit display
     */
    toggleOrbits() {
        this.showOrbits = !this.showOrbits;
        this.eventSystem.emit('orbitsToggled', this.showOrbits);
    }

    /**
     * Toggle label display
     */
    toggleLabels() {
        this.showLabels = !this.showLabels;
        this.eventSystem.emit('labelsToggled', this.showLabels);
    }

    /**
     * Get solar system data for serialization
     * @returns {Object} Serialized solar system data
     */
    toJSON() {
        return {
            id: this.id,
            name: this.name,
            description: this.description,
            age: this.age,
            bodies: this.bodies.map(body => body.toJSON()),
            time: this.time.toISOString(),
            timeScale: this.timeScale,
            useNBody: this.useNBody,
            usePerturbations: this.usePerturbations,
            paused: this.paused,
            referenceBodyId: this.referenceBody ? this.referenceBody.id : null,
            referenceFrame: this.referenceFrame,
            showOrbits: this.showOrbits,
            showLabels: this.showLabels,
            showGrid: this.showGrid,
            showConstellations: this.showConstellations,
            physicsConfig: {
                G: this.integrator.G,
                useRelativistic: this.integrator.useRelativistic,
                c: this.integrator.c,
                softening: this.integrator.softening,
                timeStep: this.integrator.timeStep
            },
            perturbationsConfig: {
                useRelativistic: this.perturbations.useRelativistic,
                useNonSpherical: this.perturbations.useNonSpherical,
                useAtmosphericDrag: this.perturbations.useAtmosphericDrag,
                useSolarRadiation: this.perturbations.useSolarRadiation
            },
            coordinateConfig: {
                epoch: this.coordinateTransform.epoch,
                obliquity: this.coordinateTransform.obliquity,
                AU: this.coordinateTransform.AU
            }
        };
    }

    /**
     * Create solar system from JSON data
     * @param {Object} data - Serialized solar system data
     * @returns {SolarSystem} New solar system
     */
    static fromJSON(data) {
        const solarSystem = new SolarSystem({
            id: data.id,
            name: data.name,
            description: data.description,
            age: data.age,
            time: new Date(data.time),
            timeScale: data.timeScale,
            useNBody: data.useNBody,
            usePerturbations: data.usePerturbations,
            paused: data.paused,
            referenceFrame: data.referenceFrame,
            showOrbits: data.showOrbits,
            showLabels: data.showLabels,
            showGrid: data.showGrid,
            showConstellations: data.showConstellations,
            physicsConfig: data.physicsConfig,
            perturbationsConfig: data.perturbationsConfig,
            coordinateConfig: data.coordinateConfig
        });
        
        // Add bodies
        if (data.bodies) {
            const bodies = data.bodies.map(bodyData => {
                if (bodyData.category === 'star') {
                    return Star.fromJSON(bodyData);
                } else if (bodyData.category === 'planet') {
                    return Planet.fromJSON(bodyData);
                } else if (bodyData.category === 'moon') {
                    return Moon.fromJSON(bodyData);
                } else {
                    return CelestialBody.fromJSON(bodyData);
                }
            });
            
            solarSystem.addBodies(bodies);
        }
        
        // Set reference body
        if (data.referenceBodyId) {
            const referenceBody = solarSystem.getBodyById(data.referenceBodyId);
            if (referenceBody) {
                solarSystem.setReferenceBody(referenceBody);
            }
        }
        
        return solarSystem;
    }
}