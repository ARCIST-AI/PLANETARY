/**
 * CelestialBodyEventSystem class
 * Event system for celestial body interactions
 */

import { MathUtils } from '../utils/index.js';

/**
 * CelestialBodyEvent class
 */
class CelestialBodyEvent {
    /**
     * Create a new event
     * @param {string} type - Event type
     * @param {Object} data - Event data
     * @param {number} timestamp - Event timestamp
     */
    constructor(type, data = {}, timestamp = Date.now()) {
        this.type = type;
        this.data = data;
        this.timestamp = timestamp;
        this.id = MathUtils.generateUUID();
        this.propagationStopped = false;
    }

    /**
     * Stop event propagation
     */
    stopPropagation() {
        this.propagationStopped = true;
    }

    /**
     * Check if propagation is stopped
     * @returns {boolean} True if propagation is stopped
     */
    isPropagationStopped() {
        return this.propagationStopped;
    }
}

/**
 * CelestialBodyEventSystem class
 */
export class CelestialBodyEventSystem {
    /**
     * Create a new event system
     */
    constructor() {
        this.listeners = new Map();
        this.onceListeners = new Map();
        this.eventHistory = [];
        this.maxHistorySize = 1000;
        this.enabled = true;
        this.eventFilters = new Map();
    }

    /**
     * Enable or disable the event system
     * @param {boolean} enabled - Whether the event system should be enabled
     */
    setEnabled(enabled) {
        this.enabled = enabled;
    }

    /**
     * Check if the event system is enabled
     * @returns {boolean} True if enabled
     */
    isEnabled() {
        return this.enabled;
    }

    /**
     * Add an event listener
     * @param {string} eventType - Event type
     * @param {Function} callback - Callback function
     * @param {Object} [options] - Listener options
     * @param {number} [options.priority=0] - Listener priority (higher numbers are called first)
     * @param {Function} [options.filter] - Filter function
     * @returns {string} Listener ID
     */
    on(eventType, callback, options = {}) {
        if (typeof callback !== 'function') {
            throw new Error('Callback must be a function');
        }

        const listenerId = MathUtils.generateUUID();
        const listener = {
            id: listenerId,
            callback,
            priority: options.priority || 0,
            filter: options.filter || null
        };

        if (!this.listeners.has(eventType)) {
            this.listeners.set(eventType, []);
        }

        this.listeners.get(eventType).push(listener);

        // Sort listeners by priority (descending)
        this.listeners.get(eventType).sort((a, b) => b.priority - a.priority);

        return listenerId;
    }

    /**
     * Add a one-time event listener
     * @param {string} eventType - Event type
     * @param {Function} callback - Callback function
     * @param {Object} [options] - Listener options
     * @param {number} [options.priority=0] - Listener priority
     * @param {Function} [options.filter] - Filter function
     * @returns {string} Listener ID
     */
    once(eventType, callback, options = {}) {
        if (typeof callback !== 'function') {
            throw new Error('Callback must be a function');
        }

        const listenerId = MathUtils.generateUUID();
        const listener = {
            id: listenerId,
            callback,
            priority: options.priority || 0,
            filter: options.filter || null
        };

        if (!this.onceListeners.has(eventType)) {
            this.onceListeners.set(eventType, []);
        }

        this.onceListeners.get(eventType).push(listener);

        // Sort listeners by priority (descending)
        this.onceListeners.get(eventType).sort((a, b) => b.priority - a.priority);

        return listenerId;
    }

    /**
     * Remove an event listener
     * @param {string} eventType - Event type
     * @param {string} listenerId - Listener ID
     * @returns {boolean} True if listener was removed
     */
    off(eventType, listenerId) {
        let removed = false;

        // Remove from regular listeners
        if (this.listeners.has(eventType)) {
            const listeners = this.listeners.get(eventType);
            const index = listeners.findIndex(l => l.id === listenerId);
            if (index !== -1) {
                listeners.splice(index, 1);
                removed = true;
            }
        }

        // Remove from once listeners
        if (this.onceListeners.has(eventType)) {
            const listeners = this.onceListeners.get(eventType);
            const index = listeners.findIndex(l => l.id === listenerId);
            if (index !== -1) {
                listeners.splice(index, 1);
                removed = true;
            }
        }

        return removed;
    }

    /**
     * Remove all listeners for an event type
     * @param {string} eventType - Event type
     * @returns {number} Number of listeners removed
     */
    offAll(eventType) {
        let count = 0;

        if (this.listeners.has(eventType)) {
            count += this.listeners.get(eventType).length;
            this.listeners.delete(eventType);
        }

        if (this.onceListeners.has(eventType)) {
            count += this.onceListeners.get(eventType).length;
            this.onceListeners.delete(eventType);
        }

        return count;
    }

    /**
     * Emit an event
     * @param {string} eventType - Event type
     * @param {Object} data - Event data
     * @returns {boolean} True if event was not cancelled
     */
    emit(eventType, data = {}) {
        if (!this.enabled) {
            return true;
        }

        const event = new CelestialBodyEvent(eventType, data);

        // Add to history
        this.eventHistory.push(event);
        if (this.eventHistory.length > this.maxHistorySize) {
            this.eventHistory.shift();
        }

        // Apply event filters
        if (this.eventFilters.has(eventType)) {
            const filter = this.eventFilters.get(eventType);
            if (!filter(event)) {
                return true;
            }
        }

        // Call regular listeners
        if (this.listeners.has(eventType)) {
            const listeners = this.listeners.get(eventType);
            for (const listener of listeners) {
                if (event.isPropagationStopped()) {
                    break;
                }

                try {
                    if (!listener.filter || listener.filter(event)) {
                        listener.callback(event);
                    }
                } catch (error) {
                    console.error(`Error in event listener for ${eventType}:`, error);
                }
            }
        }

        // Call once listeners
        if (this.onceListeners.has(eventType)) {
            const listeners = this.onceListeners.get(eventType);
            for (const listener of listeners) {
                if (event.isPropagationStopped()) {
                    break;
                }

                try {
                    if (!listener.filter || listener.filter(event)) {
                        listener.callback(event);
                    }
                } catch (error) {
                    console.error(`Error in once event listener for ${eventType}:`, error);
                }
            }

            // Remove once listeners after they've been called
            this.onceListeners.delete(eventType);
        }

        return !event.isPropagationStopped();
    }

    /**
     * Add an event filter
     * @param {string} eventType - Event type
     * @param {Function} filter - Filter function
     */
    addFilter(eventType, filter) {
        if (typeof filter !== 'function') {
            throw new Error('Filter must be a function');
        }

        this.eventFilters.set(eventType, filter);
    }

    /**
     * Remove an event filter
     * @param {string} eventType - Event type
     * @returns {boolean} True if filter was removed
     */
    removeFilter(eventType) {
        return this.eventFilters.delete(eventType);
    }

    /**
     * Get event history
     * @param {string} [eventType] - Filter by event type (optional)
     * @param {number} [limit] - Maximum number of events to return
     * @returns {Array<CelestialBodyEvent>} Event history
     */
    getHistory(eventType = null, limit = null) {
        let history = [...this.eventHistory];

        if (eventType) {
            history = history.filter(event => event.type === eventType);
        }

        if (limit !== null && limit > 0) {
            history = history.slice(-limit);
        }

        return history;
    }

    /**
     * Clear event history
     */
    clearHistory() {
        this.eventHistory = [];
    }

    /**
     * Set maximum history size
     * @param {number} size - Maximum history size
     */
    setMaxHistorySize(size) {
        this.maxHistorySize = Math.max(0, size);
        
        // Trim history if necessary
        if (this.eventHistory.length > this.maxHistorySize) {
            this.eventHistory = this.eventHistory.slice(-this.maxHistorySize);
        }
    }

    /**
     * Get all event types with listeners
     * @returns {Array<string>} Array of event types
     */
    getEventTypes() {
        const types = new Set();

        for (const eventType of this.listeners.keys()) {
            types.add(eventType);
        }

        for (const eventType of this.onceListeners.keys()) {
            types.add(eventType);
        }

        return Array.from(types);
    }

    /**
     * Get listener count for an event type
     * @param {string} eventType - Event type
     * @returns {number} Number of listeners
     */
    getListenerCount(eventType) {
        let count = 0;

        if (this.listeners.has(eventType)) {
            count += this.listeners.get(eventType).length;
        }

        if (this.onceListeners.has(eventType)) {
            count += this.onceListeners.get(eventType).length;
        }

        return count;
    }

    /**
     * Get statistics
     * @returns {Object} Event system statistics
     */
    getStats() {
        const eventTypes = this.getEventTypes();
        const listenerCounts = {};
        
        for (const eventType of eventTypes) {
            listenerCounts[eventType] = this.getListenerCount(eventType);
        }

        const eventTypeCounts = {};
        for (const event of this.eventHistory) {
            eventTypeCounts[event.type] = (eventTypeCounts[event.type] || 0) + 1;
        }

        return {
            enabled: this.enabled,
            eventTypes,
            listenerCounts,
            eventTypeCounts,
            totalEvents: this.eventHistory.length,
            maxHistorySize: this.maxHistorySize,
            totalListeners: Object.values(listenerCounts).reduce((sum, count) => sum + count, 0)
        };
    }

    /**
     * Clear all listeners and history
     */
    clear() {
        this.listeners.clear();
        this.onceListeners.clear();
        this.eventHistory = [];
        this.eventFilters.clear();
    }

    /**
     * Create a collision event
     * @param {CelestialBody} body1 - First body
     * @param {CelestialBody} body2 - Second body
     * @param {Object} collisionData - Collision data
     * @returns {boolean} True if event was not cancelled
     */
    emitCollision(body1, body2, collisionData = {}) {
        return this.emit('collision', {
            body1,
            body2,
            ...collisionData
        });
    }

    /**
     * Create a gravitational interaction event
     * @param {CelestialBody} body1 - First body
     * @param {CelestialBody} body2 - Second body
     * @param {Object} forceData - Force data
     * @returns {boolean} True if event was not cancelled
     */
    emitGravitationalInteraction(body1, body2, forceData = {}) {
        return this.emit('gravitationalInteraction', {
            body1,
            body2,
            ...forceData
        });
    }

    /**
     * Create an orbital change event
     * @param {CelestialBody} body - The body whose orbit changed
     * @param {Object} oldOrbit - Old orbital elements
     * @param {Object} newOrbit - New orbital elements
     * @returns {boolean} True if event was not cancelled
     */
    emitOrbitalChange(body, oldOrbit, newOrbit) {
        return this.emit('orbitalChange', {
            body,
            oldOrbit,
            newOrbit
        });
    }

    /**
     * Create a body creation event
     * @param {CelestialBody} body - The created body
     * @returns {boolean} True if event was not cancelled
     */
    emitBodyCreated(body) {
        return this.emit('bodyCreated', { body });
    }

    /**
     * Create a body destruction event
     * @param {CelestialBody} body - The destroyed body
     * @param {Object} destructionData - Destruction data
     * @returns {boolean} True if event was not cancelled
     */
    emitBodyDestroyed(body, destructionData = {}) {
        return this.emit('bodyDestroyed', {
            body,
            ...destructionData
        });
    }

    /**
     * Create a body update event
     * @param {CelestialBody} body - The updated body
     * @param {Object} updateData - Update data
     * @returns {boolean} True if event was not cancelled
     */
    emitBodyUpdated(body, updateData = {}) {
        return this.emit('bodyUpdated', {
            body,
            ...updateData
        });
    }

    /**
     * Create a system event
     * @param {string} systemEventType - System event type
     * @param {Object} systemEventData - System event data
     * @returns {boolean} True if event was not cancelled
     */
    emitSystemEvent(systemEventType, systemEventData = {}) {
        return this.emit('systemEvent', {
            systemEventType,
            ...systemEventData
        });
    }

    /**
     * Create a custom event
     * @param {string} eventType - Event type
     * @param {Object} eventData - Event data
     * @returns {boolean} True if event was not cancelled
     */
    emitCustom(eventType, eventData = {}) {
        return this.emit(eventType, eventData);
    }
}