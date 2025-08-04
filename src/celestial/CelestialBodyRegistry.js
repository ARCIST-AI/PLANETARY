/**
 * CelestialBodyRegistry class
 * Registry system for managing celestial bodies
 */

import { MathUtils } from '../utils/index.js';

/**
 * CelestialBodyRegistry class
 */
export class CelestialBodyRegistry {
    /**
     * Create a new registry
     */
    constructor() {
        this.bodies = new Map();
        this.systems = new Map();
        this.groups = new Map();
        this.listeners = new Map();
    }

    /**
     * Register a celestial body
     * @param {CelestialBody} body - Celestial body to register
     * @param {string} systemId - System ID (optional)
     * @param {string} groupId - Group ID (optional)
     * @returns {string} ID of the registered body
     */
    register(body, systemId = null, groupId = null) {
        if (!body.id) {
            body.id = MathUtils.generateUUID();
        }

        this.bodies.set(body.id, body);

        // Add to system if specified
        if (systemId) {
            if (!this.systems.has(systemId)) {
                this.systems.set(systemId, new Set());
            }
            this.systems.get(systemId).add(body.id);
        }

        // Add to group if specified
        if (groupId) {
            if (!this.groups.has(groupId)) {
                this.groups.set(groupId, new Set());
            }
            this.groups.get(groupId).add(body.id);
        }

        // Notify listeners
        this._notifyListeners('register', { body, systemId, groupId });

        return body.id;
    }

    /**
     * Unregister a celestial body
     * @param {string} bodyId - ID of the body to unregister
     * @returns {boolean} True if successful
     */
    unregister(bodyId) {
        if (!this.bodies.has(bodyId)) {
            return false;
        }

        const body = this.bodies.get(bodyId);

        // Remove from systems
        for (const [systemId, bodyIds] of this.systems) {
            if (bodyIds.has(bodyId)) {
                bodyIds.delete(bodyId);
                if (bodyIds.size === 0) {
                    this.systems.delete(systemId);
                }
            }
        }

        // Remove from groups
        for (const [groupId, bodyIds] of this.groups) {
            if (bodyIds.has(bodyId)) {
                bodyIds.delete(bodyId);
                if (bodyIds.size === 0) {
                    this.groups.delete(groupId);
                }
            }
        }

        // Remove from registry
        this.bodies.delete(bodyId);

        // Notify listeners
        this._notifyListeners('unregister', { bodyId, body });

        return true;
    }

    /**
     * Get a celestial body by ID
     * @param {string} bodyId - ID of the body
     * @returns {CelestialBody|null} The celestial body or null if not found
     */
    get(bodyId) {
        return this.bodies.get(bodyId) || null;
    }

    /**
     * Get all celestial bodies
     * @returns {Array<CelestialBody>} Array of all celestial bodies
     */
    getAll() {
        return Array.from(this.bodies.values());
    }

    /**
     * Get all bodies of a specific type
     * @param {string} type - Type of celestial body
     * @returns {Array<CelestialBody>} Array of celestial bodies of the specified type
     */
    getByType(type) {
        return Array.from(this.bodies.values()).filter(body => body.type === type);
    }

    /**
     * Get all bodies in a system
     * @param {string} systemId - System ID
     * @returns {Array<CelestialBody>} Array of celestial bodies in the system
     */
    getBySystem(systemId) {
        if (!this.systems.has(systemId)) {
            return [];
        }

        const bodyIds = this.systems.get(systemId);
        return Array.from(bodyIds).map(id => this.bodies.get(id)).filter(body => body);
    }

    /**
     * Get all bodies in a group
     * @param {string} groupId - Group ID
     * @returns {Array<CelestialBody>} Array of celestial bodies in the group
     */
    getByGroup(groupId) {
        if (!this.groups.has(groupId)) {
            return [];
        }

        const bodyIds = this.groups.get(groupId);
        return Array.from(bodyIds).map(id => this.bodies.get(id)).filter(body => body);
    }

    /**
     * Find bodies by name
     * @param {string} name - Name to search for
     * @returns {Array<CelestialBody>} Array of celestial bodies with matching names
     */
    findByName(name) {
        const searchTerm = name.toLowerCase();
        return Array.from(this.bodies.values()).filter(body => 
            body.name.toLowerCase().includes(searchTerm)
        );
    }

    /**
     * Find bodies by property
     * @param {string} property - Property name
     * @param {*} value - Property value
     * @returns {Array<CelestialBody>} Array of celestial bodies with matching property values
     */
    findByProperty(property, value) {
        return Array.from(this.bodies.values()).filter(body => 
            body[property] === value
        );
    }

    /**
     * Find bodies within a distance of a position
     * @param {Object} position - Position to search from {x, y, z}
     * @param {number} distance - Maximum distance
     * @returns {Array<CelestialBody>} Array of celestial bodies within the distance
     */
    findWithinDistance(position, distance) {
        return Array.from(this.bodies.values()).filter(body => {
            const dx = body.position.x - position.x;
            const dy = body.position.y - position.y;
            const dz = body.position.z - position.z;
            const actualDistance = Math.sqrt(dx * dx + dy * dy + dz * dz);
            return actualDistance <= distance;
        });
    }

    /**
     * Find bodies within a distance of another body
     * @param {string} bodyId - ID of the reference body
     * @param {number} distance - Maximum distance
     * @returns {Array<CelestialBody>} Array of celestial bodies within the distance
     */
    findWithinDistanceOfBody(bodyId, distance) {
        const body = this.get(bodyId);
        if (!body) {
            return [];
        }

        return this.findWithinDistance(body.position, distance).filter(b => b.id !== bodyId);
    }

    /**
     * Create a new system
     * @param {string} systemId - System ID
     * @param {Array<CelestialBody>} bodies - Bodies to add to the system
     * @returns {boolean} True if successful
     */
    createSystem(systemId, bodies = []) {
        if (this.systems.has(systemId)) {
            return false;
        }

        this.systems.set(systemId, new Set());

        for (const body of bodies) {
            this.register(body, systemId);
        }

        return true;
    }

    /**
     * Delete a system
     * @param {string} systemId - System ID
     * @returns {boolean} True if successful
     */
    deleteSystem(systemId) {
        if (!this.systems.has(systemId)) {
            return false;
        }

        // Get all bodies in the system
        const bodyIds = this.systems.get(systemId);
        
        // Remove bodies from groups but keep them in the registry
        for (const bodyId of bodyIds) {
            for (const [groupId, groupBodyIds] of this.groups) {
                if (groupBodyIds.has(bodyId)) {
                    groupBodyIds.delete(bodyId);
                    if (groupBodyIds.size === 0) {
                        this.groups.delete(groupId);
                    }
                }
            }
        }

        // Remove the system
        this.systems.delete(systemId);

        return true;
    }

    /**
     * Get all system IDs
     * @returns {Array<string>} Array of system IDs
     */
    getSystemIds() {
        return Array.from(this.systems.keys());
    }

    /**
     * Create a new group
     * @param {string} groupId - Group ID
     * @param {Array<CelestialBody>} bodies - Bodies to add to the group
     * @returns {boolean} True if successful
     */
    createGroup(groupId, bodies = []) {
        if (this.groups.has(groupId)) {
            return false;
        }

        this.groups.set(groupId, new Set());

        for (const body of bodies) {
            this.register(body, null, groupId);
        }

        return true;
    }

    /**
     * Delete a group
     * @param {string} groupId - Group ID
     * @returns {boolean} True if successful
     */
    deleteGroup(groupId) {
        if (!this.groups.has(groupId)) {
            return false;
        }

        // Remove bodies from the group but keep them in the registry
        const bodyIds = this.groups.get(groupId);
        this.groups.delete(groupId);

        return true;
    }

    /**
     * Get all group IDs
     * @returns {Array<string>} Array of group IDs
     */
    getGroupIds() {
        return Array.from(this.groups.keys());
    }

    /**
     * Add a body to a system
     * @param {string} bodyId - Body ID
     * @param {string} systemId - System ID
     * @returns {boolean} True if successful
     */
    addToSystem(bodyId, systemId) {
        if (!this.bodies.has(bodyId)) {
            return false;
        }

        if (!this.systems.has(systemId)) {
            this.systems.set(systemId, new Set());
        }

        this.systems.get(systemId).add(bodyId);

        // Notify listeners
        this._notifyListeners('addToSystem', { bodyId, systemId });

        return true;
    }

    /**
     * Remove a body from a system
     * @param {string} bodyId - Body ID
     * @param {string} systemId - System ID
     * @returns {boolean} True if successful
     */
    removeFromSystem(bodyId, systemId) {
        if (!this.systems.has(systemId)) {
            return false;
        }

        const bodyIds = this.systems.get(systemId);
        if (!bodyIds.has(bodyId)) {
            return false;
        }

        bodyIds.delete(bodyId);
        if (bodyIds.size === 0) {
            this.systems.delete(systemId);
        }

        // Notify listeners
        this._notifyListeners('removeFromSystem', { bodyId, systemId });

        return true;
    }

    /**
     * Add a body to a group
     * @param {string} bodyId - Body ID
     * @param {string} groupId - Group ID
     * @returns {boolean} True if successful
     */
    addToGroup(bodyId, groupId) {
        if (!this.bodies.has(bodyId)) {
            return false;
        }

        if (!this.groups.has(groupId)) {
            this.groups.set(groupId, new Set());
        }

        this.groups.get(groupId).add(bodyId);

        // Notify listeners
        this._notifyListeners('addToGroup', { bodyId, groupId });

        return true;
    }

    /**
     * Remove a body from a group
     * @param {string} bodyId - Body ID
     * @param {string} groupId - Group ID
     * @returns {boolean} True if successful
     */
    removeFromGroup(bodyId, groupId) {
        if (!this.groups.has(groupId)) {
            return false;
        }

        const bodyIds = this.groups.get(groupId);
        if (!bodyIds.has(bodyId)) {
            return false;
        }

        bodyIds.delete(bodyId);
        if (bodyIds.size === 0) {
            this.groups.delete(groupId);
        }

        // Notify listeners
        this._notifyListeners('removeFromGroup', { bodyId, groupId });

        return true;
    }

    /**
     * Add an event listener
     * @param {string} event - Event type
     * @param {Function} callback - Callback function
     * @returns {string} Listener ID
     */
    addListener(event, callback) {
        const listenerId = MathUtils.generateUUID();
        
        if (!this.listeners.has(event)) {
            this.listeners.set(event, new Map());
        }
        
        this.listeners.get(event).set(listenerId, callback);
        
        return listenerId;
    }

    /**
     * Remove an event listener
     * @param {string} event - Event type
     * @param {string} listenerId - Listener ID
     * @returns {boolean} True if successful
     */
    removeListener(event, listenerId) {
        if (!this.listeners.has(event)) {
            return false;
        }
        
        return this.listeners.get(event).delete(listenerId);
    }

    /**
     * Notify listeners of an event
     * @param {string} event - Event type
     * @param {Object} data - Event data
     * @private
     */
    _notifyListeners(event, data) {
        if (!this.listeners.has(event)) {
            return;
        }
        
        for (const callback of this.listeners.get(event).values()) {
            try {
                callback(data);
            } catch (error) {
                console.error(`Error in registry event listener for ${event}:`, error);
            }
        }
    }

    /**
     * Clear all bodies from the registry
     */
    clear() {
        this.bodies.clear();
        this.systems.clear();
        this.groups.clear();
        
        // Notify listeners
        this._notifyListeners('clear', {});
    }

    /**
     * Get registry statistics
     * @returns {Object} Registry statistics
     */
    getStats() {
        const typeCounts = {};
        
        for (const body of this.bodies.values()) {
            const type = body.type || 'unknown';
            typeCounts[type] = (typeCounts[type] || 0) + 1;
        }

        return {
            totalBodies: this.bodies.size,
            totalSystems: this.systems.size,
            totalGroups: this.groups.size,
            typeCounts,
            systemSizes: Array.from(this.systems.values()).map(set => set.size),
            groupSizes: Array.from(this.groups.values()).map(set => set.size)
        };
    }

    /**
     * Export registry data
     * @returns {Object} Exported registry data
     */
    export() {
        const data = {
            bodies: {},
            systems: {},
            groups: {}
        };

        // Export bodies
        for (const [id, body] of this.bodies) {
            data.bodies[id] = body.serialize ? body.serialize() : body;
        }

        // Export systems
        for (const [systemId, bodyIds] of this.systems) {
            data.systems[systemId] = Array.from(bodyIds);
        }

        // Export groups
        for (const [groupId, bodyIds] of this.groups) {
            data.groups[groupId] = Array.from(bodyIds);
        }

        return data;
    }

    /**
     * Import registry data
     * @param {Object} data - Registry data to import
     * @param {Object} bodyClasses - Map of body type to class constructor
     * @returns {boolean} True if successful
     */
    import(data, bodyClasses = {}) {
        try {
            this.clear();

            // Import bodies
            for (const [id, bodyData] of Object.entries(data.bodies || {})) {
                const BodyClass = bodyClasses[bodyData.type] || CelestialBody;
                const body = BodyClass.deserialize ? 
                    BodyClass.deserialize(bodyData, this.bodies) : 
                    new BodyClass(bodyData);
                
                this.bodies.set(id, body);
            }

            // Import systems
            for (const [systemId, bodyIds] of Object.entries(data.systems || {})) {
                this.systems.set(systemId, new Set(bodyIds));
            }

            // Import groups
            for (const [groupId, bodyIds] of Object.entries(data.groups || {})) {
                this.groups.set(groupId, new Set(bodyIds));
            }

            // Notify listeners
            this._notifyListeners('import', { data });

            return true;
        } catch (error) {
            console.error('Error importing registry data:', error);
            return false;
        }
    }
}