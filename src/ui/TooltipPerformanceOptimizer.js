/**
 * Tooltip Performance Optimizer for improving tooltip rendering performance
 */

/**
 * Tooltip Performance Optimizer class
 */
export class TooltipPerformanceOptimizer {
    /**
     * Create a new Tooltip Performance Optimizer
     * @param {Object} config - Configuration object
     */
    constructor(config = {}) {
        this.config = {
            enablePooling: true,
            poolSize: 10,
            enableDebouncing: true,
            debounceDelay: 50,
            enableThrottling: true,
            throttleDelay: 100,
            enableLazyLoading: true,
            lazyLoadDelay: 200,
            enableVisibilityOptimization: true,
            enableMemoryOptimization: true,
            maxVisibleTooltips: 5,
            enableBatchRendering: true,
            batchRenderDelay: 16, // ~60fps
            enableCache: true,
            cacheSize: 100,
            ...config
        };

        // State
        this.isInitialized = false;
        this.tooltipManager = null;
        
        // Performance monitoring
        this.performanceMetrics = {
            renderTimes: [],
            averageRenderTime: 0,
            maxRenderTime: 0,
            minRenderTime: Infinity,
            totalRenderTime: 0,
            renderCount: 0,
            lastRenderTime: 0
        };
        
        // Tooltip pool
        this.tooltipPool = [];
        this.activeTooltips = new Map();
        
        // Debounce and throttle timers
        this.debounceTimers = new Map();
        this.throttleTimers = new Map();
        
        // Visibility optimization
        this.visibleTooltips = new Set();
        this.hiddenTooltips = new Set();
        
        // Cache
        this.contentCache = new Map();
        this.renderCache = new Map();
        
        // Batch rendering
        this.batchQueue = [];
        this.batchTimer = null;
        
        // Memory optimization
        this.memoryUsage = {
            current: 0,
            peak: 0,
            limit: 50 * 1024 * 1024 // 50MB
        };
        
        // Lazy loading
        this.lazyLoadQueue = [];
        this.lazyLoadTimer = null;
    }

    /**
     * Initialize the performance optimizer
     * @param {Object} tooltipManager - Tooltip manager instance
     * @returns {Promise<void>}
     */
    async initialize(tooltipManager) {
        if (this.isInitialized) return;

        try {
            console.log('Initializing Tooltip Performance Optimizer...');
            
            this.tooltipManager = tooltipManager;
            
            // Initialize tooltip pool
            if (this.config.enablePooling) {
                this.initializeTooltipPool();
            }
            
            // Setup performance monitoring
            this.setupPerformanceMonitoring();
            
            // Setup visibility optimization
            if (this.config.enableVisibilityOptimization) {
                this.setupVisibilityOptimization();
            }
            
            // Setup memory optimization
            if (this.config.enableMemoryOptimization) {
                this.setupMemoryOptimization();
            }
            
            this.isInitialized = true;
            console.log('Tooltip Performance Optimizer initialized successfully');
            
        } catch (error) {
            console.error('Failed to initialize Tooltip Performance Optimizer:', error);
            throw error;
        }
    }

    /**
     * Initialize tooltip pool
     */
    initializeTooltipPool() {
        for (let i = 0; i < this.config.poolSize; i++) {
            const tooltipElement = document.createElement('div');
            tooltipElement.className = 'tooltip tooltip-pooled';
            tooltipElement.style.display = 'none';
            document.body.appendChild(tooltipElement);
            this.tooltipPool.push(tooltipElement);
        }
    }

    /**
     * Setup performance monitoring
     */
    setupPerformanceMonitoring() {
        // Override tooltip manager methods to monitor performance
        if (this.tooltipManager) {
            const originalShow = this.tooltipManager.show.bind(this.tooltipManager);
            this.tooltipManager.show = (...args) => {
                const startTime = performance.now();
                const result = originalShow(...args);
                const endTime = performance.now();
                this.recordRenderTime(endTime - startTime);
                return result;
            };

            const originalUpdate = this.tooltipManager.update.bind(this.tooltipManager);
            this.tooltipManager.update = (...args) => {
                const startTime = performance.now();
                const result = originalUpdate(...args);
                const endTime = performance.now();
                this.recordRenderTime(endTime - startTime);
                return result;
            };
        }
    }

    /**
     * Setup visibility optimization
     */
    setupVisibilityOptimization() {
        // Monitor visible tooltips and hide those outside viewport
        const checkVisibility = () => {
            this.checkTooltipVisibility();
            requestAnimationFrame(checkVisibility);
        };
        
        requestAnimationFrame(checkVisibility);
    }

    /**
     * Setup memory optimization
     */
    setupMemoryOptimization() {
        // Periodically check memory usage and clean up if needed
        setInterval(() => {
            this.checkMemoryUsage();
        }, 5000); // Check every 5 seconds
    }

    /**
     * Get tooltip from pool
     * @returns {HTMLElement} Tooltip element
     */
    getTooltipFromPool() {
        if (this.tooltipPool.length > 0) {
            return this.tooltipPool.pop();
        }
        
        // Pool is empty, create a new tooltip
        const tooltipElement = document.createElement('div');
        tooltipElement.className = 'tooltip tooltip-pooled';
        document.body.appendChild(tooltipElement);
        return tooltipElement;
    }

    /**
     * Return tooltip to pool
     * @param {HTMLElement} tooltipElement - Tooltip element
     */
    returnTooltipToPool(tooltipElement) {
        // Reset tooltip element
        tooltipElement.style.display = 'none';
        tooltipElement.innerHTML = '';
        tooltipElement.className = 'tooltip tooltip-pooled';
        
        // Return to pool if not full
        if (this.tooltipPool.length < this.config.poolSize) {
            this.tooltipPool.push(tooltipElement);
        } else {
            // Pool is full, remove from DOM
            tooltipElement.remove();
        }
    }

    /**
     * Debounce function
     * @param {Function} func - Function to debounce
     * @param {string} key - Debounce key
     * @param {number} delay - Debounce delay
     * @returns {Function} Debounced function
     */
    debounce(func, key, delay = this.config.debounceDelay) {
        return (...args) => {
            if (this.debounceTimers.has(key)) {
                clearTimeout(this.debounceTimers.get(key));
            }
            
            const timer = setTimeout(() => {
                func(...args);
                this.debounceTimers.delete(key);
            }, delay);
            
            this.debounceTimers.set(key, timer);
        };
    }

    /**
     * Throttle function
     * @param {Function} func - Function to throttle
     * @param {string} key - Throttle key
     * @param {number} delay - Throttle delay
     * @returns {Function} Throttled function
     */
    throttle(func, key, delay = this.config.throttleDelay) {
        return (...args) => {
            if (this.throttleTimers.has(key)) {
                return;
            }
            
            func(...args);
            
            const timer = setTimeout(() => {
                this.throttleTimers.delete(key);
            }, delay);
            
            this.throttleTimers.set(key, timer);
        };
    }

    /**
     * Check tooltip visibility
     */
    checkTooltipVisibility() {
        if (!this.tooltipManager || !this.config.enableVisibilityOptimization) return;
        
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;
        
        for (const [id, tooltip] of this.activeTooltips) {
            const rect = tooltip.getBoundingClientRect();
            
            // Check if tooltip is outside viewport
            if (rect.right < 0 || rect.left > viewportWidth || 
                rect.bottom < 0 || rect.top > viewportHeight) {
                // Hide tooltip if outside viewport
                if (this.visibleTooltips.has(id)) {
                    tooltip.style.display = 'none';
                    this.visibleTooltips.delete(id);
                    this.hiddenTooltips.add(id);
                }
            } else {
                // Show tooltip if inside viewport
                if (this.hiddenTooltips.has(id)) {
                    tooltip.style.display = '';
                    this.hiddenTooltips.delete(id);
                    this.visibleTooltips.add(id);
                }
            }
        }
        
        // Limit number of visible tooltips
        if (this.visibleTooltips.size > this.config.maxVisibleTooltips) {
            const tooltipsToHide = Array.from(this.visibleTooltips)
                .slice(this.config.maxVisibleTooltips);
            
            for (const id of tooltipsToHide) {
                const tooltip = this.activeTooltips.get(id);
                if (tooltip) {
                    tooltip.style.display = 'none';
                    this.visibleTooltips.delete(id);
                    this.hiddenTooltips.add(id);
                }
            }
        }
    }

    /**
     * Record render time
     * @param {number} renderTime - Render time in milliseconds
     */
    recordRenderTime(renderTime) {
        this.performanceMetrics.renderTimes.push(renderTime);
        this.performanceMetrics.totalRenderTime += renderTime;
        this.performanceMetrics.renderCount++;
        this.performanceMetrics.lastRenderTime = renderTime;
        
        // Update min and max
        if (renderTime < this.performanceMetrics.minRenderTime) {
            this.performanceMetrics.minRenderTime = renderTime;
        }
        
        if (renderTime > this.performanceMetrics.maxRenderTime) {
            this.performanceMetrics.maxRenderTime = renderTime;
        }
        
        // Calculate average
        this.performanceMetrics.averageRenderTime = 
            this.performanceMetrics.totalRenderTime / this.performanceMetrics.renderCount;
        
        // Keep only last 100 render times
        if (this.performanceMetrics.renderTimes.length > 100) {
            this.performanceMetrics.renderTimes.shift();
        }
    }

    /**
     * Check memory usage
     */
    checkMemoryUsage() {
        if (!this.config.enableMemoryOptimization) return;
        
        // Estimate memory usage
        let estimatedMemory = 0;
        
        // Tooltip pool memory
        estimatedMemory += this.tooltipPool.length * 1024; // ~1KB per tooltip
        
        // Active tooltips memory
        estimatedMemory += this.activeTooltips.size * 2048; // ~2KB per active tooltip
        
        // Cache memory
        estimatedMemory += this.contentCache.size * 1024; // ~1KB per cache entry
        estimatedMemory += this.renderCache.size * 2048; // ~2KB per render cache entry
        
        this.memoryUsage.current = estimatedMemory;
        
        if (estimatedMemory > this.memoryUsage.peak) {
            this.memoryUsage.peak = estimatedMemory;
        }
        
        // Clean up if memory limit is exceeded
        if (estimatedMemory > this.memoryUsage.limit) {
            this.cleanupMemory();
        }
    }

    /**
     * Clean up memory
     */
    cleanupMemory() {
        console.log('Cleaning up tooltip memory...');
        
        // Clear caches
        if (this.contentCache.size > this.config.cacheSize / 2) {
            const entriesToDelete = this.contentCache.size - this.config.cacheSize / 2;
            const keysToDelete = Array.from(this.contentCache.keys()).slice(0, entriesToDelete);
            
            for (const key of keysToDelete) {
                this.contentCache.delete(key);
            }
        }
        
        if (this.renderCache.size > this.config.cacheSize / 2) {
            const entriesToDelete = this.renderCache.size - this.config.cacheSize / 2;
            const keysToDelete = Array.from(this.renderCache.keys()).slice(0, entriesToDelete);
            
            for (const key of keysToDelete) {
                this.renderCache.delete(key);
            }
        }
        
        // Reduce tooltip pool size
        if (this.tooltipPool.length > this.config.poolSize / 2) {
            const tooltipsToRemove = this.tooltipPool.length - this.config.poolSize / 2;
            
            for (let i = 0; i < tooltipsToRemove; i++) {
                const tooltip = this.tooltipPool.pop();
                tooltip.remove();
            }
        }
        
        console.log('Tooltip memory cleanup completed');
    }

    /**
     * Add to batch queue
     * @param {Function} renderFunction - Render function
     */
    addToBatchQueue(renderFunction) {
        if (!this.config.enableBatchRendering) {
            renderFunction();
            return;
        }
        
        this.batchQueue.push(renderFunction);
        
        if (!this.batchTimer) {
            this.batchTimer = setTimeout(() => {
                this.processBatchQueue();
            }, this.config.batchRenderDelay);
        }
    }

    /**
     * Process batch queue
     */
    processBatchQueue() {
        const batchQueue = this.batchQueue.slice();
        this.batchQueue = [];
        this.batchTimer = null;
        
        // Process all render functions in the batch
        for (const renderFunction of batchQueue) {
            try {
                renderFunction();
            } catch (error) {
                console.error('Error in batch render function:', error);
            }
        }
    }

    /**
     * Add to lazy load queue
     * @param {Function} loadFunction - Load function
     */
    addToLazyLoadQueue(loadFunction) {
        if (!this.config.enableLazyLoading) {
            loadFunction();
            return;
        }
        
        this.lazyLoadQueue.push(loadFunction);
        
        if (!this.lazyLoadTimer) {
            this.lazyLoadTimer = setTimeout(() => {
                this.processLazyLoadQueue();
            }, this.config.lazyLoadDelay);
        }
    }

    /**
     * Process lazy load queue
     */
    processLazyLoadQueue() {
        const lazyLoadQueue = this.lazyLoadQueue.slice();
        this.lazyLoadQueue = [];
        this.lazyLoadTimer = null;
        
        // Process all load functions in the queue
        for (const loadFunction of lazyLoadQueue) {
            try {
                loadFunction();
            } catch (error) {
                console.error('Error in lazy load function:', error);
            }
        }
    }

    /**
     * Get content from cache
     * @param {string} key - Cache key
     * @returns {Object|null} Cached content or null if not found
     */
    getFromCache(key) {
        if (!this.config.enableCache) return null;
        
        return this.contentCache.get(key) || null;
    }

    /**
     * Add content to cache
     * @param {string} key - Cache key
     * @param {Object} content - Content to cache
     */
    addToCache(key, content) {
        if (!this.config.enableCache) return;
        
        // Check cache size limit
        if (this.contentCache.size >= this.config.cacheSize) {
            // Remove oldest entry
            const oldestKey = this.contentCache.keys().next().value;
            this.contentCache.delete(oldestKey);
        }
        
        this.contentCache.set(key, content);
    }

    /**
     * Get render from cache
     * @param {string} key - Cache key
     * @returns {string|null} Cached render or null if not found
     */
    getRenderFromCache(key) {
        if (!this.config.enableCache) return null;
        
        return this.renderCache.get(key) || null;
    }

    /**
     * Add render to cache
     * @param {string} key - Cache key
     * @param {string} render - Render to cache
     */
    addRenderToCache(key, render) {
        if (!this.config.enableCache) return;
        
        // Check cache size limit
        if (this.renderCache.size >= this.config.cacheSize) {
            // Remove oldest entry
            const oldestKey = this.renderCache.keys().next().value;
            this.renderCache.delete(oldestKey);
        }
        
        this.renderCache.set(key, render);
    }

    /**
     * Optimize tooltip show
     * @param {string} id - Tooltip ID
     * @param {string} type - Tooltip type
     * @param {Object} position - Position object
     * @param {Object} options - Options object
     * @returns {string|null} Tooltip ID or null if failed
     */
    optimizeShow(id, type, position, options = {}) {
        if (!this.tooltipManager) return null;
        
        // Check cache for content
        const cachedContent = this.getFromCache(`${id}-${type}`);
        if (cachedContent && options.content) {
            options.content = cachedContent;
        }
        
        // Debounce show operation
        const debouncedShow = this.debounce(
            () => {
                const tooltipId = this.tooltipManager.show(id, type, position, options);
                
                if (tooltipId) {
                    // Track active tooltip
                    const tooltip = document.getElementById(`tooltip-${tooltipId}`);
                    if (tooltip) {
                        this.activeTooltips.set(tooltipId, tooltip);
                        this.visibleTooltips.add(tooltipId);
                    }
                }
                
                return tooltipId;
            },
            `show-${id}`,
            options.delay || this.config.debounceDelay
        );
        
        return debouncedShow();
    }

    /**
     * Optimize tooltip update
     * @param {string} id - Tooltip ID
     * @param {Object} updates - Updates object
     */
    optimizeUpdate(id, updates) {
        if (!this.tooltipManager) return;
        
        // Throttle update operation
        const throttledUpdate = this.throttle(
            () => {
                this.tooltipManager.update(id, updates);
            },
            `update-${id}`,
            this.config.throttleDelay
        );
        
        throttledUpdate();
    }

    /**
     * Optimize tooltip hide
     * @param {string} id - Tooltip ID
     */
    optimizeHide(id) {
        if (!this.tooltipManager) return;
        
        // Hide tooltip immediately
        this.tooltipManager.hide(id);
        
        // Clean up tracking
        this.activeTooltips.delete(id);
        this.visibleTooltips.delete(id);
        this.hiddenTooltips.delete(id);
    }

    /**
     * Get performance metrics
     * @returns {Object} Performance metrics
     */
    getPerformanceMetrics() {
        return {
            ...this.performanceMetrics,
            memoryUsage: this.memoryUsage,
            cacheSize: {
                contentCache: this.contentCache.size,
                renderCache: this.renderCache.size
            },
            poolSize: {
                current: this.tooltipPool.length,
                active: this.activeTooltips.size,
                visible: this.visibleTooltips.size,
                hidden: this.hiddenTooltips.size
            }
        };
    }

    /**
     * Update configuration
     * @param {Object} config - New configuration
     */
    updateConfig(config) {
        this.config = { ...this.config, ...config };
        
        // Adjust tooltip pool size if needed
        if (config.poolSize !== undefined && config.poolSize > this.tooltipPool.length) {
            const tooltipsToAdd = config.poolSize - this.tooltipPool.length;
            
            for (let i = 0; i < tooltipsToAdd; i++) {
                const tooltipElement = document.createElement('div');
                tooltipElement.className = 'tooltip tooltip-pooled';
                tooltipElement.style.display = 'none';
                document.body.appendChild(tooltipElement);
                this.tooltipPool.push(tooltipElement);
            }
        }
    }

    /**
     * Destroy the performance optimizer
     */
    destroy() {
        // Clear timers
        for (const timer of this.debounceTimers.values()) {
            clearTimeout(timer);
        }
        this.debounceTimers.clear();
        
        for (const timer of this.throttleTimers.values()) {
            clearTimeout(timer);
        }
        this.throttleTimers.clear();
        
        if (this.batchTimer) {
            clearTimeout(this.batchTimer);
            this.batchTimer = null;
        }
        
        if (this.lazyLoadTimer) {
            clearTimeout(this.lazyLoadTimer);
            this.lazyLoadTimer = null;
        }
        
        // Clear tooltip pool
        for (const tooltip of this.tooltipPool) {
            tooltip.remove();
        }
        this.tooltipPool = [];
        
        // Clear tracking
        this.activeTooltips.clear();
        this.visibleTooltips.clear();
        this.hiddenTooltips.clear();
        
        // Clear caches
        this.contentCache.clear();
        this.renderCache.clear();
        
        // Clear queues
        this.batchQueue = [];
        this.lazyLoadQueue = [];
        
        console.log('Tooltip Performance Optimizer destroyed');
    }
}