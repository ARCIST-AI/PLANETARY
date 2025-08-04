/**
 * CelestialBodySerializer class
 * Serialization and deserialization utilities for celestial bodies
 */

import { CelestialBody } from './CelestialBody.js';
import { Asteroid } from './Asteroid.js';
import { Comet } from './Comet.js';
import { Planet } from './Planet.js';
import { Spacecraft } from './Spacecraft.js';
import { Star } from './Star.js';

/**
 * CelestialBodySerializer class
 */
export class CelestialBodySerializer {
    /**
     * Serialize a celestial body
     * @param {CelestialBody} body - Celestial body to serialize
     * @returns {Object} Serialized celestial body
     */
    static serialize(body) {
        if (!body) {
            throw new Error('Cannot serialize null or undefined body');
        }

        // Use the body's own serialize method if available
        if (typeof body.serialize === 'function') {
            return body.serialize();
        }

        // Default serialization
        return this._serializeGeneric(body);
    }

    /**
     * Serialize multiple celestial bodies
     * @param {Array<CelestialBody>} bodies - Array of celestial bodies to serialize
     * @returns {Array<Object>} Array of serialized celestial bodies
     */
    static serializeMany(bodies) {
        if (!Array.isArray(bodies)) {
            throw new Error('Bodies must be an array');
        }

        return bodies.map(body => this.serialize(body));
    }

    /**
     * Serialize a celestial system
     * @param {Object} system - System object with bodies, systems, and groups
     * @returns {Object} Serialized system
     */
    static serializeSystem(system) {
        if (!system || typeof system !== 'object') {
            throw new Error('System must be an object');
        }

        const serialized = {
            bodies: {},
            systems: {},
            groups: {}
        };

        // Serialize bodies
        if (system.bodies) {
            if (system.bodies instanceof Map) {
                for (const [id, body] of system.bodies) {
                    serialized.bodies[id] = this.serialize(body);
                }
            } else if (typeof system.bodies === 'object') {
                for (const [id, body] of Object.entries(system.bodies)) {
                    serialized.bodies[id] = this.serialize(body);
                }
            }
        }

        // Serialize systems
        if (system.systems) {
            if (system.systems instanceof Map) {
                for (const [systemId, bodyIds] of system.systems) {
                    serialized.systems[systemId] = Array.from(bodyIds);
                }
            } else if (typeof system.systems === 'object') {
                for (const [systemId, bodyIds] of Object.entries(system.systems)) {
                    serialized.systems[systemId] = Array.isArray(bodyIds) ? bodyIds : Array.from(bodyIds);
                }
            }
        }

        // Serialize groups
        if (system.groups) {
            if (system.groups instanceof Map) {
                for (const [groupId, bodyIds] of system.groups) {
                    serialized.groups[groupId] = Array.from(bodyIds);
                }
            } else if (typeof system.groups === 'object') {
                for (const [groupId, bodyIds] of Object.entries(system.groups)) {
                    serialized.groups[groupId] = Array.isArray(bodyIds) ? bodyIds : Array.from(bodyIds);
                }
            }
        }

        return serialized;
    }

    /**
     * Deserialize a celestial body
     * @param {Object} data - Serialized celestial body
     * @param {Object} bodies - Map of bodies by ID (for resolving references)
     * @returns {CelestialBody} Deserialized celestial body
     */
    static deserialize(data, bodies = {}) {
        if (!data || typeof data !== 'object') {
            throw new Error('Data must be an object');
        }

        // Determine the class based on type
        const BodyClass = this._getClassForType(data.type);

        // Use the class's deserialize method if available
        if (typeof BodyClass.deserialize === 'function') {
            return BodyClass.deserialize(data, bodies);
        }

        // Default deserialization
        return this._deserializeGeneric(data, bodies);
    }

    /**
     * Deserialize multiple celestial bodies
     * @param {Array<Object>} dataArray - Array of serialized celestial bodies
     * @returns {Array<CelestialBody>} Array of deserialized celestial bodies
     */
    static deserializeMany(dataArray) {
        if (!Array.isArray(dataArray)) {
            throw new Error('Data array must be an array');
        }

        // First pass: create all bodies without resolving parent references
        const bodies = {};
        const bodyDataMap = {};

        for (const data of dataArray) {
            if (!data.id) {
                throw new Error('Body data must have an ID');
            }

            bodyDataMap[data.id] = data;
            const BodyClass = this._getClassForType(data.type);
            const body = new BodyClass(data);
            bodies[data.id] = body;
        }

        // Second pass: resolve parent references
        for (const [id, body] of Object.entries(bodies)) {
            const data = bodyDataMap[id];
            if (data.parentId && bodies[data.parentId]) {
                body.parent = bodies[data.parentId];
            }
        }

        return Object.values(bodies);
    }

    /**
     * Deserialize a celestial system
     * @param {Object} data - Serialized system
     * @returns {Object} Deserialized system
     */
    static deserializeSystem(data) {
        if (!data || typeof data !== 'object') {
            throw new Error('Data must be an object');
        }

        const system = {
            bodies: new Map(),
            systems: new Map(),
            groups: new Map()
        };

        // Deserialize bodies
        const bodies = {};
        if (data.bodies) {
            for (const [id, bodyData] of Object.entries(data.bodies)) {
                const body = this.deserialize(bodyData, bodies);
                bodies[id] = body;
                system.bodies.set(id, body);
            }
        }

        // Deserialize systems
        if (data.systems) {
            for (const [systemId, bodyIds] of Object.entries(data.systems)) {
                system.systems.set(systemId, new Set(bodyIds));
            }
        }

        // Deserialize groups
        if (data.groups) {
            for (const [groupId, bodyIds] of Object.entries(data.groups)) {
                system.groups.set(groupId, new Set(bodyIds));
            }
        }

        return system;
    }

    /**
     * Export to JSON
     * @param {CelestialBody|Array<CelestialBody>|Object} data - Data to export
     * @param {number} [indent=2] - JSON indentation
     * @returns {string} JSON string
     */
    static exportToJSON(data, indent = 2) {
        let serialized;

        if (Array.isArray(data)) {
            serialized = this.serializeMany(data);
        } else if (data && typeof data === 'object') {
            // Check if it's a system object
            if (data.bodies || data.systems || data.groups) {
                serialized = this.serializeSystem(data);
            } else {
                // Assume it's a single celestial body
                serialized = this.serialize(data);
            }
        } else {
            throw new Error('Invalid data type for export');
        }

        return JSON.stringify(serialized, null, indent);
    }

    /**
     * Import from JSON
     * @param {string} jsonString - JSON string to import
     * @returns {CelestialBody|Array<CelestialBody>|Object} Imported data
     */
    static importFromJSON(jsonString) {
        let data;
        try {
            data = JSON.parse(jsonString);
        } catch (error) {
            throw new Error(`Invalid JSON: ${error.message}`);
        }

        if (Array.isArray(data)) {
            return this.deserializeMany(data);
        } else if (data && typeof data === 'object') {
            // Check if it's a system object
            if (data.bodies || data.systems || data.groups) {
                return this.deserializeSystem(data);
            } else {
                // Assume it's a single celestial body
                return this.deserialize(data);
            }
        } else {
            throw new Error('Invalid data structure in JSON');
        }
    }

    /**
     * Export to binary format
     * @param {CelestialBody|Array<CelestialBody>|Object} data - Data to export
     * @returns {ArrayBuffer} Binary data
     */
    static exportToBinary(data) {
        const jsonString = this.exportToJSON(data);
        const encoder = new TextEncoder();
        return encoder.encode(jsonString).buffer;
    }

    /**
     * Import from binary format
     * @param {ArrayBuffer} buffer - Binary data to import
     * @returns {CelestialBody|Array<CelestialBody>|Object} Imported data
     */
    static importFromBinary(buffer) {
        const decoder = new TextDecoder();
        const jsonString = decoder.decode(buffer);
        return this.importFromJSON(jsonString);
    }

    /**
     * Get the class for a given type
     * @param {string} type - Celestial body type
     * @returns {Class} Class constructor
     * @private
     */
    static _getClassForType(type) {
        switch (type) {
            case 'asteroid':
                return Asteroid;
            case 'comet':
                return Comet;
            case 'planet':
                return Planet;
            case 'spacecraft':
                return Spacecraft;
            case 'star':
                return Star;
            default:
                return CelestialBody;
        }
    }

    /**
     * Serialize a generic celestial body
     * @param {CelestialBody} body - Celestial body to serialize
     * @returns {Object} Serialized celestial body
     * @private
     */
    static _serializeGeneric(body) {
        const serialized = {
            id: body.id,
            name: body.name,
            type: body.type || 'body',
            parentId: body.parent ? body.parent.id : null,
            mass: body.mass,
            radius: body.radius,
            density: body.density,
            gravity: body.gravity,
            escapeVelocity: body.escapeVelocity,
            semiMajorAxis: body.semiMajorAxis,
            eccentricity: body.eccentricity,
            inclination: body.inclination,
            longitudeOfAscendingNode: body.longitudeOfAscendingNode,
            argumentOfPeriapsis: body.argumentOfPeriapsis,
            meanAnomalyAtEpoch: body.meanAnomalyAtEpoch,
            epoch: body.epoch instanceof Date ? body.epoch.toISOString() : null,
            orbitalPeriod: body.orbitalPeriod,
            meanMotion: body.meanMotion,
            rotationPeriod: body.rotationPeriod,
            axialTilt: body.axialTilt,
            rotationAngle: body.rotationAngle,
            position: { ...body.position },
            velocity: { ...body.velocity },
            acceleration: { ...body.acceleration },
            color: body.color,
            texture: body.texture,
            emissive: body.emissive,
            emissiveIntensity: body.emissiveIntensity,
            shininess: body.shininess,
            opacity: body.opacity,
            transparent: body.transparent,
            customProperties: { ...body.customProperties }
        };

        // Add type-specific properties
        if (body.type === 'star') {
            serialized.luminosity = body.luminosity;
            serialized.temperature = body.temperature;
            serialized.spectralClass = body.spectralClass;
            serialized.spectralType = body.spectralType;
            serialized.stellarClass = body.stellarClass;
            serialized.age = body.age;
            serialized.metallicity = body.metallicity;
            serialized.rotationVelocity = body.rotationVelocity;
            serialized.coronaColor = body.coronaColor;
            serialized.coronaSize = body.coronaSize;
            serialized.coronaOpacity = body.coronaOpacity;
            serialized.flareIntensity = body.flareIntensity;
            serialized.flareFrequency = body.flareFrequency;
            serialized.lastFlareTime = body.lastFlareTime;
        } else if (body.type === 'planet') {
            serialized.albedo = body.albedo;
            serialized.greenhouseEffect = body.greenhouseEffect;
            serialized.surfaceTemperature = body.surfaceTemperature;
            serialized.atmosphericPressure = body.atmosphericPressure;
            serialized.atmosphericComposition = { ...body.atmosphericComposition };
            serialized.hydrosphere = body.hydrosphere;
            serialized.hasRings = body.hasRings;
            serialized.ringSystem = body.ringSystem ? { ...body.ringSystem } : null;
            serialized.hasMagneticField = body.hasMagneticField;
            serialized.magneticFieldStrength = body.magneticFieldStrength;
            serialized.hasAtmosphere = body.hasAtmosphere;
            serialized.atmosphereHeight = body.atmosphereHeight;
        } else if (body.type === 'asteroid') {
            serialized.albedo = body.albedo;
            serialized.surfaceTemperature = body.surfaceTemperature;
            serialized.porosity = body.porosity;
            serialized.composition = { ...body.composition };
            serialized.irregularShape = body.irregularShape;
            serialized.dimensions = body.dimensions ? { ...body.dimensions } : null;
            serialized.rotationAxis = body.rotationAxis ? { ...body.rotationAxis } : null;
        } else if (body.type === 'comet') {
            serialized.albedo = body.albedo;
            serialized.surfaceTemperature = body.surfaceTemperature;
            serialized.porosity = body.porosity;
            serialized.composition = { ...body.composition };
            serialized.active = body.active;
            serialized.activityLevel = body.activityLevel;
            serialized.hasTail = body.hasTail;
            serialized.tailLength = body.tailLength;
            serialized.tailComposition = body.tailComposition ? { ...body.tailComposition } : null;
            serialized.comaSize = body.comaSize;
            serialized.nucleusRadius = body.nucleusRadius;
        } else if (body.type === 'spacecraft') {
            serialized.spacecraftType = body.spacecraftType;
            serialized.status = body.status;
            serialized.dryMass = body.dryMass;
            serialized.fuelMass = body.fuelMass;
            serialized.totalMass = body.totalMass;
            serialized.thrust = body.thrust;
            serialized.specificImpulse = body.specificImpulse;
            serialized.fuelConsumption = body.fuelConsumption;
            serialized.hasPropulsion = body.hasPropulsion;
            serialized.hasAttitudeControl = body.hasAttitudeControl;
            serialized.hasCommunication = body.hasCommunication;
            serialized.hasNavigation = body.hasNavigation;
            serialized.hasInstruments = body.hasInstruments;
            serialized.hasThermalControl = body.hasThermalControl;
            serialized.isThrusting = body.isThrusting;
            serialized.isCommunicating = body.isCommunicating;
            serialized.isRecording = body.isRecording;
            serialized.missionPhase = body.missionPhase;
            serialized.missionTime = body.missionTime;
        }

        return serialized;
    }

    /**
     * Deserialize a generic celestial body
     * @param {Object} data - Serialized celestial body
     * @param {Object} bodies - Map of bodies by ID
     * @returns {CelestialBody} Deserialized celestial body
     * @private
     */
    static _deserializeGeneric(data, bodies = {}) {
        const options = {
            id: data.id,
            name: data.name,
            type: data.type || 'body',
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
            epoch: data.epoch ? new Date(data.epoch) : new Date(),
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
        };

        // Add type-specific properties
        if (data.type === 'star') {
            options.luminosity = data.luminosity;
            options.temperature = data.temperature;
            options.spectralClass = data.spectralClass;
            options.spectralType = data.spectralType;
            options.stellarClass = data.stellarClass;
            options.age = data.age;
            options.metallicity = data.metallicity;
            options.rotationVelocity = data.rotationVelocity;
            options.coronaColor = data.coronaColor;
            options.coronaSize = data.coronaSize;
            options.coronaOpacity = data.coronaOpacity;
            options.flareIntensity = data.flareIntensity;
            options.flareFrequency = data.flareFrequency;
            options.lastFlareTime = data.lastFlareTime;
        } else if (data.type === 'planet') {
            options.albedo = data.albedo;
            options.greenhouseEffect = data.greenhouseEffect;
            options.surfaceTemperature = data.surfaceTemperature;
            options.atmosphericPressure = data.atmosphericPressure;
            options.atmosphericComposition = data.atmosphericComposition;
            options.hydrosphere = data.hydrosphere;
            options.hasRings = data.hasRings;
            options.ringSystem = data.ringSystem;
            options.hasMagneticField = data.hasMagneticField;
            options.magneticFieldStrength = data.magneticFieldStrength;
            options.hasAtmosphere = data.hasAtmosphere;
            options.atmosphereHeight = data.atmosphereHeight;
        } else if (data.type === 'asteroid') {
            options.albedo = data.albedo;
            options.surfaceTemperature = data.surfaceTemperature;
            options.porosity = data.porosity;
            options.composition = data.composition;
            options.irregularShape = data.irregularShape;
            options.dimensions = data.dimensions;
            options.rotationAxis = data.rotationAxis;
        } else if (data.type === 'comet') {
            options.albedo = data.albedo;
            options.surfaceTemperature = data.surfaceTemperature;
            options.porosity = data.porosity;
            options.composition = data.composition;
            options.active = data.active;
            options.activityLevel = data.activityLevel;
            options.hasTail = data.hasTail;
            options.tailLength = data.tailLength;
            options.tailComposition = data.tailComposition;
            options.comaSize = data.comaSize;
            options.nucleusRadius = data.nucleusRadius;
        } else if (data.type === 'spacecraft') {
            options.spacecraftType = data.spacecraftType;
            options.status = data.status;
            options.dryMass = data.dryMass;
            options.fuelMass = data.fuelMass;
            options.totalMass = data.totalMass;
            options.thrust = data.thrust;
            options.specificImpulse = data.specificImpulse;
            options.fuelConsumption = data.fuelConsumption;
            options.hasPropulsion = data.hasPropulsion;
            options.hasAttitudeControl = data.hasAttitudeControl;
            options.hasCommunication = data.hasCommunication;
            options.hasNavigation = data.hasNavigation;
            options.hasInstruments = data.hasInstruments;
            options.hasThermalControl = data.hasThermalControl;
            options.isThrusting = data.isThrusting;
            options.isCommunicating = data.isCommunicating;
            options.isRecording = data.isRecording;
            options.missionPhase = data.missionPhase;
            options.missionTime = data.missionTime;
        }

        const BodyClass = this._getClassForType(data.type);
        return new BodyClass(options);
    }
}