import { PERFORMANCE_CONSTANTS } from './Constants.js';

/**
 * Performance monitoring utility for tracking application metrics
 */
export class PerformanceMonitor {
    constructor() {
        this.isRunning = false;
        this.startTime = 0;
        this.frameCount = 0;
        this.lastFrameTime = 0;
        this.fps = 0;
        this.fpsHistory = [];
        this.maxFpsHistory = 60;
        
        // Memory usage
        this.memoryUsage = 0;
        this.memoryHistory = [];
        this.maxMemoryHistory = 60;
        this.memoryLimit = PERFORMANCE_CONSTANTS.MEMORY_LIMITS.CACHE;
        
        // Performance metrics
        this.metrics = {
            fps: 0,
            frameTime: 0,
            memoryUsage: 0,
            memoryPercentage: 0,
            objectCount: 0,
            drawCalls: 0,
            triangles: 0,
            renderTime: 0,
            simulationTime: 0,
            uiUpdateTime: 0
        };
        
        // Performance thresholds
        this.thresholds = PERFORMANCE_CONSTANTS.PERFORMANCE_THRESHOLDS;
        
        // Performance quality levels
        this.currentQualityLevel = 'HIGH';
        this.qualityLevels = PERFORMANCE_CONSTANTS.QUALITY_LEVELS;
        
        // Event system
        this.eventCallbacks = new Map();
        
        // Performance monitoring interval
        this.monitoringInterval = null;
        this.monitoringIntervalTime = 1000; // 1 second
        
        // Performance warnings
        this.performanceWarnings = new Set();
        this.maxWarnings = 10;
    }
    
    /**
     * Start performance monitoring
     */
    start() {
        if (this.isRunning) {
            console.warn('Performance monitor is already running');
            return;
        }
        
        this.isRunning = true;
        this.startTime = performance.now();
        this.lastFrameTime = this.startTime;
        this.frameCount = 0;
        
        // Start monitoring interval
        this.monitoringInterval = setInterval(() => {
            this.updateMetrics();
            this.checkPerformance();
        }, this.monitoringIntervalTime);
        
        console.log('Performance monitor started');
    }
    
    /**
     * Stop performance monitoring
     */
    stop() {
        if (!this.isRunning) {
            console.warn('Performance monitor is not running');
            return;
        }
        
        this.isRunning = false;
        
        if (this.monitoringInterval) {
            clearInterval(this.monitoringInterval);
            this.monitoringInterval = null;
        }
        
        console.log('Performance monitor stopped');
    }
    
    /**
     * Update performance metrics for each frame
     * @param {number} deltaTime - Time since last frame in milliseconds
     * @param {number} fps - Current FPS
     */
    update(deltaTime, fps) {
        if (!this.isRunning) return;
        
        this.frameCount++;
        this.lastFrameTime = performance.now();
        
        // Update FPS
        if (fps !== undefined) {
            this.fps = fps;
        } else {
            this.fps = 1000 / deltaTime;
        }
        
        // Update FPS history
        this.fpsHistory.push(this.fps);
        if (this.fpsHistory.length > this.maxFpsHistory) {
            this.fpsHistory.shift();
        }
        
        // Update frame time
        this.metrics.frameTime = deltaTime;
        this.metrics.fps = this.fps;
        
        // Update memory usage if available
        this.updateMemoryUsage();
        
        // Emit frame update event
        this.emit('frameUpdated', this.metrics);
    }
    
    /**
     * Update metrics periodically
     */
    updateMetrics() {
        if (!this.isRunning) return;
        
        // Calculate average FPS
        const avgFps = this.fpsHistory.length > 0 
            ? this.fpsHistory.reduce((a, b) => a + b, 0) / this.fpsHistory.length 
            : 0;
        
        // Calculate average memory usage
        const avgMemory = this.memoryHistory.length > 0
            ? this.memoryHistory.reduce((a, b) => a + b, 0) / this.memoryHistory.length
            : 0;
        
        // Update metrics
        this.metrics.fps = avgFps;
        this.metrics.memoryUsage = avgMemory;
        this.metrics.memoryPercentage = (avgMemory / this.memoryLimit) * 100;
        
        // Emit metrics update event
        this.emit('metricsUpdated', { ...this.metrics });
    }
    
    /**
     * Update memory usage information
     */
    updateMemoryUsage() {
        if (performance.memory) {
            const memory = performance.memory;
            this.memoryUsage = memory.usedJSHeapSize;
            
            // Update memory history
            this.memoryHistory.push(this.memoryUsage);
            if (this.memoryHistory.length > this.maxMemoryHistory) {
                this.memoryHistory.shift();
            }
        }
    }
    
    /**
     * Check performance against thresholds and adjust quality if needed
     */
    checkPerformance() {
        const { fps, memoryPercentage } = this.metrics;
        
        // Check FPS performance
        if (fps < this.thresholds.FPS_LOW) {
            this.addPerformanceWarning('Low FPS detected');
            this.suggestQualityLevel('LOW');
        } else if (fps < this.thresholds.FPS_MEDIUM) {
            this.suggestQualityLevel('MEDIUM');
        } else if (fps >= this.thresholds.FPS_HIGH) {
            this.suggestQualityLevel('HIGH');
        }
        
        // Check memory usage
        if (memoryPercentage > this.thresholds.MEMORY_CRITICAL) {
            this.addPerformanceWarning('Critical memory usage detected');
            this.suggestQualityLevel('LOW');
            this.emit('memoryCritical', memoryPercentage);
        } else if (memoryPercentage > this.thresholds.MEMORY_WARNING) {
            this.addPerformanceWarning('High memory usage detected');
            this.emit('memoryWarning', memoryPercentage);
        }
        
        // Emit performance check event
        this.emit('performanceChecked', {
            fps,
            memoryPercentage,
            qualityLevel: this.currentQualityLevel
        });
    }
    
    /**
     * Suggest a quality level based on performance
     * @param {string} level - Suggested quality level
     */
    suggestQualityLevel(level) {
        if (this.currentQualityLevel !== level) {
            this.currentQualityLevel = level;
            this.emit('qualityLevelChanged', {
                level,
                settings: this.qualityLevels[level]
            });
        }
    }
    
    /**
     * Add a performance warning
     * @param {string} message - Warning message
     */
    addPerformanceWarning(message) {
        if (this.performanceWarnings.size >= this.maxWarnings) {
            return;
        }
        
        this.performanceWarnings.add(message);
        this.emit('performanceWarning', message);
        
        // Auto-clear warnings after some time
        setTimeout(() => {
            this.performanceWarnings.delete(message);
        }, 5000);
    }
    
    /**
     * Update render-specific metrics
     * @param {Object} renderMetrics - Render metrics
     */
    updateRenderMetrics(renderMetrics) {
        this.metrics.drawCalls = renderMetrics.drawCalls || 0;
        this.metrics.triangles = renderMetrics.triangles || 0;
        this.metrics.renderTime = renderMetrics.renderTime || 0;
        this.metrics.objectCount = renderMetrics.objectCount || 0;
    }
    
    /**
     * Update simulation-specific metrics
     * @param {Object} simMetrics - Simulation metrics
     */
    updateSimulationMetrics(simMetrics) {
        this.metrics.simulationTime = simMetrics.simulationTime || 0;
        this.metrics.objectCount = simMetrics.objectCount || this.metrics.objectCount;
    }
    
    /**
     * Update UI-specific metrics
     * @param {Object} uiMetrics - UI metrics
     */
    updateUIMetrics(uiMetrics) {
        this.metrics.uiUpdateTime = uiMetrics.updateTime || 0;
    }
    
    /**
     * Get current performance metrics
     * @returns {Object} Current metrics
     */
    getMetrics() {
        return { ...this.metrics };
    }
    
    /**
     * Get performance status
     * @returns {Object} Performance status
     */
    getStatus() {
        return {
            isRunning: this.isRunning,
            fps: this.fps,
            memoryUsage: this.memoryUsage,
            memoryPercentage: this.metrics.memoryPercentage,
            qualityLevel: this.currentQualityLevel,
            warnings: Array.from(this.performanceWarnings),
            uptime: this.isRunning ? performance.now() - this.startTime : 0
        };
    }
    
    /**
     * Get performance report
     * @returns {Object} Detailed performance report
     */
    getReport() {
        const avgFps = this.fpsHistory.length > 0 
            ? this.fpsHistory.reduce((a, b) => a + b, 0) / this.fpsHistory.length 
            : 0;
        
        const minFps = this.fpsHistory.length > 0 
            ? Math.min(...this.fpsHistory) 
            : 0;
        
        const maxFps = this.fpsHistory.length > 0 
            ? Math.max(...this.fpsHistory) 
            : 0;
        
        const avgMemory = this.memoryHistory.length > 0
            ? this.memoryHistory.reduce((a, b) => a + b, 0) / this.memoryHistory.length
            : 0;
        
        const peakMemory = this.memoryHistory.length > 0
            ? Math.max(...this.memoryHistory)
            : 0;
        
        return {
            summary: {
                uptime: this.isRunning ? performance.now() - this.startTime : 0,
                frameCount: this.frameCount,
                currentFps: this.fps,
                currentMemory: this.memoryUsage,
                qualityLevel: this.currentQualityLevel
            },
            fps: {
                average: avgFps,
                minimum: minFps,
                maximum: maxFps,
                history: [...this.fpsHistory]
            },
            memory: {
                average: avgMemory,
                peak: peakMemory,
                limit: this.memoryLimit,
                percentage: (avgMemory / this.memoryLimit) * 100,
                history: [...this.memoryHistory]
            },
            metrics: { ...this.metrics },
            warnings: Array.from(this.performanceWarnings)
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
                    console.error(`Error in performance monitor event callback for "${event}":`, error);
                }
            }
        }
    }
    
    /**
     * Reset performance monitor
     */
    reset() {
        this.frameCount = 0;
        this.fps = 0;
        this.fpsHistory = [];
        this.memoryUsage = 0;
        this.memoryHistory = [];
        this.performanceWarnings.clear();
        
        // Reset metrics
        this.metrics = {
            fps: 0,
            frameTime: 0,
            memoryUsage: 0,
            memoryPercentage: 0,
            objectCount: 0,
            drawCalls: 0,
            triangles: 0,
            renderTime: 0,
            simulationTime: 0,
            uiUpdateTime: 0
        };
        
        if (this.isRunning) {
            this.startTime = performance.now();
            this.lastFrameTime = this.startTime;
        }
        
        this.emit('reset');
    }
    
    /**
     * Destroy performance monitor
     */
    destroy() {
        this.stop();
        this.eventCallbacks.clear();
        this.performanceWarnings.clear();
    }
}