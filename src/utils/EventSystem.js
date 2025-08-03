/**
 * Event system for managing application-wide events
 */
export class EventSystem {
    constructor() {
        this.events = new Map();
        this.onceEvents = new Map();
        this.maxListeners = 100;
        this.warnedEvents = new Set();
    }
    
    /**
     * Register an event listener
     * @param {string} event - Event name
     * @param {Function} listener - Event handler function
     * @param {Object} context - Context for the listener function
     * @returns {EventSystem} This instance for chaining
     */
    on(event, listener, context = null) {
        if (typeof listener !== 'function') {
            throw new TypeError('Listener must be a function');
        }
        
        if (!this.events.has(event)) {
            this.events.set(event, []);
        }
        
        const listeners = this.events.get(event);
        
        // Check for max listeners
        if (listeners.length >= this.maxListeners && !this.warnedEvents.has(event)) {
            console.warn(`Possible memory leak detected. ${listeners.length} listeners added for event "${event}". Use emitter.setMaxListeners() to increase limit.`);
            this.warnedEvents.add(event);
        }
        
        // Add listener with context
        listeners.push({
            listener: context ? listener.bind(context) : listener,
            original: listener
        });
        
        return this;
    }
    
    /**
     * Register a one-time event listener
     * @param {string} event - Event name
     * @param {Function} listener - Event handler function
     * @param {Object} context - Context for the listener function
     * @returns {EventSystem} This instance for chaining
     */
    once(event, listener, context = null) {
        if (typeof listener !== 'function') {
            throw new TypeError('Listener must be a function');
        }
        
        if (!this.onceEvents.has(event)) {
            this.onceEvents.set(event, []);
        }
        
        const listeners = this.onceEvents.get(event);
        
        // Wrap listener to remove itself after execution
        const onceWrapper = (...args) => {
            this.off(event, onceWrapper);
            listener.apply(context, args);
        };
        
        // Store reference to original listener for removal
        onceWrapper.original = listener;
        
        listeners.push(onceWrapper);
        return this;
    }
    
    /**
     * Remove an event listener
     * @param {string} event - Event name
     * @param {Function} listener - Event handler function to remove
     * @returns {EventSystem} This instance for chaining
     */
    off(event, listener) {
        if (typeof listener !== 'function') {
            throw new TypeError('Listener must be a function');
        }
        
        // Remove from regular events
        if (this.events.has(event)) {
            const listeners = this.events.get(event);
            for (let i = listeners.length - 1; i >= 0; i--) {
                if (listeners[i].original === listener || listeners[i].listener === listener) {
                    listeners.splice(i, 1);
                }
            }
            
            if (listeners.length === 0) {
                this.events.delete(event);
                this.warnedEvents.delete(event);
            }
        }
        
        // Remove from once events
        if (this.onceEvents.has(event)) {
            const listeners = this.onceEvents.get(event);
            for (let i = listeners.length - 1; i >= 0; i--) {
                if (listeners[i].original === listener || listeners[i] === listener) {
                    listeners.splice(i, 1);
                }
            }
            
            if (listeners.length === 0) {
                this.onceEvents.delete(event);
            }
        }
        
        return this;
    }
    
    /**
     * Remove all listeners for an event or all events
     * @param {string} event - Event name (optional)
     * @returns {EventSystem} This instance for chaining
     */
    removeAllListeners(event) {
        if (event) {
            this.events.delete(event);
            this.onceEvents.delete(event);
            this.warnedEvents.delete(event);
        } else {
            this.events.clear();
            this.onceEvents.clear();
            this.warnedEvents.clear();
        }
        
        return this;
    }
    
    /**
     * Emit an event
     * @param {string} event - Event name
     * @param {...*} args - Arguments to pass to listeners
     * @returns {boolean} True if event had listeners, false otherwise
     */
    emit(event, ...args) {
        let hasListeners = false;
        
        // Execute regular listeners
        if (this.events.has(event)) {
            const listeners = [...this.events.get(event)]; // Copy array to avoid issues with removal during emission
            hasListeners = listeners.length > 0;
            
            for (const listenerObj of listeners) {
                try {
                    listenerObj.listener(...args);
                } catch (error) {
                    console.error(`Error in event listener for "${event}":`, error);
                }
            }
        }
        
        // Execute once listeners
        if (this.onceEvents.has(event)) {
            const listeners = [...this.onceEvents.get(event)]; // Copy array
            hasListeners = hasListeners || listeners.length > 0;
            
            for (const listener of listeners) {
                try {
                    listener(...args);
                } catch (error) {
                    console.error(`Error in once event listener for "${event}":`, error);
                }
            }
            
            // Clear once listeners for this event
            this.onceEvents.delete(event);
        }
        
        return hasListeners;
    }
    
    /**
     * Get all event names
     * @returns {string[]} Array of event names
     */
    eventNames() {
        const regularEvents = Array.from(this.events.keys());
        const onceEvents = Array.from(this.onceEvents.keys());
        return [...new Set([...regularEvents, ...onceEvents])];
    }
    
    /**
     * Get listener count for an event
     * @param {string} event - Event name
     * @returns {number} Number of listeners
     */
    listenerCount(event) {
        const regularCount = this.events.has(event) ? this.events.get(event).length : 0;
        const onceCount = this.onceEvents.has(event) ? this.onceEvents.get(event).length : 0;
        return regularCount + onceCount;
    }
    
    /**
     * Get all listeners for an event
     * @param {string} event - Event name
     * @returns {Function[]} Array of listener functions
     */
    listeners(event) {
        const result = [];
        
        if (this.events.has(event)) {
            result.push(...this.events.get(event).map(l => l.original));
        }
        
        if (this.onceEvents.has(event)) {
            result.push(...this.onceEvents.get(event).map(l => l.original));
        }
        
        return result;
    }
    
    /**
     * Set maximum number of listeners for an event
     * @param {number} n - Maximum number of listeners
     * @returns {EventSystem} This instance for chaining
     */
    setMaxListeners(n) {
        if (typeof n !== 'number' || n < 0) {
            throw new TypeError('Max listeners must be a non-negative number');
        }
        
        this.maxListeners = n;
        return this;
    }
    
    /**
     * Get current maximum number of listeners
     * @returns {number} Maximum number of listeners
     */
    getMaxListeners() {
        return this.maxListeners;
    }
    
    /**
     * Create a new EventSystem that inherits events from this one
     * @returns {EventSystem} New event system
     */
    fork() {
        const forked = new EventSystem();
        forked.setMaxListeners(this.maxListeners);
        
        // Copy all current listeners
        for (const [event, listeners] of this.events) {
            for (const listenerObj of listeners) {
                forked.on(event, listenerObj.original);
            }
        }
        
        for (const [event, listeners] of this.onceEvents) {
            for (const listener of listeners) {
                forked.once(event, listener.original);
            }
        }
        
        return forked;
    }
    
    /**
     * Add event listener with error handling
     * @param {string} event - Event name
     * @param {Function} listener - Event handler function
     * @param {Function} errorHandler - Error handler function
     * @param {Object} context - Context for the listener function
     * @returns {EventSystem} This instance for chaining
     */
    safeOn(event, listener, errorHandler, context = null) {
        const safeListener = (...args) => {
            try {
                listener.apply(context, args);
            } catch (error) {
                if (typeof errorHandler === 'function') {
                    errorHandler(error, event, args);
                } else {
                    console.error(`Error in safe listener for "${event}":`, error);
                }
            }
        };
        
        return this.on(event, safeListener, context);
    }
    
    /**
     * Wait for an event to be emitted once
     * @param {string} event - Event name
     * @param {number} timeout - Timeout in milliseconds (optional)
     * @returns {Promise} Promise that resolves with event arguments
     */
    waitFor(event, timeout) {
        return new Promise((resolve, reject) => {
            let timeoutId = null;
            
            const handler = (...args) => {
                if (timeoutId) {
                    clearTimeout(timeoutId);
                }
                resolve(args.length > 1 ? args : args[0]);
            };
            
            if (timeout) {
                timeoutId = setTimeout(() => {
                    this.off(event, handler);
                    reject(new Error(`Timeout waiting for event "${event}"`));
                }, timeout);
            }
            
            this.once(event, handler);
        });
    }
    
    /**
     * Emit an event asynchronously
     * @param {string} event - Event name
     * @param {...*} args - Arguments to pass to listeners
     * @returns {Promise} Promise that resolves when all listeners have been called
     */
    async emitAsync(event, ...args) {
        if (!this.events.has(event) && !this.onceEvents.has(event)) {
            return false;
        }
        
        const promises = [];
        
        // Collect regular listeners
        if (this.events.has(event)) {
            for (const listenerObj of this.events.get(event)) {
                promises.push(
                    Promise.resolve().then(() => listenerObj.listener(...args))
                );
            }
        }
        
        // Collect once listeners
        if (this.onceEvents.has(event)) {
            for (const listener of this.onceEvents.get(event)) {
                promises.push(
                    Promise.resolve().then(() => listener(...args))
                );
            }
            
            // Clear once listeners
            this.onceEvents.delete(event);
        }
        
        // Wait for all listeners to complete
        await Promise.allSettled(promises);
        
        return true;
    }
    
    /**
     * Destroy the event system and remove all listeners
     */
    destroy() {
        this.removeAllListeners();
        this.warnedEvents.clear();
    }
}