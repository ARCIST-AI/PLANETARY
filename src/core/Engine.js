import { RenderEngine } from './RenderEngine.js';
import { SimulationEngine } from './SimulationEngine.js';
import { DataManager } from './DataManager.js';
import { UIEngine } from './UIEngine.js';
import { PerformanceMonitor } from '../utils/PerformanceMonitor.js';
import { EventSystem } from '../utils/EventSystem.js';
import { RENDERING_CONSTANTS, TIME_CONSTANTS, UI_CONSTANTS } from '../utils/Constants.js';

/**
 * Main application engine that orchestrates all subsystems
 */
export class Engine {
    constructor(canvas) {
        this.canvas = canvas;
        this.isInitialized = false;
        this.isRunning = false;
        this.lastFrameTime = 0;
        this.frameCount = 0;
        this.fps = 0;
        
        // Core subsystems
        this.renderEngine = null;
        this.simulationEngine = null;
        this.dataManager = null;
        this.uiEngine = null;
        this.performanceMonitor = null;
        this.eventSystem = null;
        
        // Configuration
        this.config = {
            rendering: {
                antialias: true,
                pixelRatio: Math.min(window.devicePixelRatio, 2),
                shadows: true,
                postProcessing: true,
                maxObjects: RENDERING_CONSTANTS.MAX_RENDER_OBJECTS,
                fpsLimit: RENDERING_CONSTANTS.DEFAULT_FPS_LIMIT
            },
            simulation: {
                timeStep: TIME_CONSTANTS.DEFAULT_TIME_STEP,
                simulationSpeed: TIME_CONSTANTS.TIME_SPEEDS.REAL_TIME,
                maxBodies: 1000,
                useWebWorkers: true
            },
            data: {
                autoUpdate: true,
                cacheEnabled: true,
                preloadEssential: true
            },
            ui: {
                showControls: true,
                showInfo: true,
                showPerformance: true,
                theme: 'dark'
            }
        };
        
        // Initialize event system first
        this.eventSystem = new EventSystem();
        this.setupEventHandlers();
    }
    
    /**
     * Initialize the engine and all subsystems
     * @returns {Promise<void>}
     */
    async initialize() {
        try {
            console.log('Initializing Solar System Visualization Engine...');
            
            // Initialize performance monitor
            this.performanceMonitor = new PerformanceMonitor();
            
            // Initialize data manager
            this.dataManager = new DataManager(this.config.data);
            await this.dataManager.initialize();
            
            // Initialize simulation engine
            this.simulationEngine = new SimulationEngine(this.config.simulation);
            await this.simulationEngine.initialize();
            
            // Initialize render engine
            this.renderEngine = new RenderEngine(this.canvas, this.config.rendering);
            await this.renderEngine.initialize();
            
            // Initialize UI engine
            this.uiEngine = new UIEngine(this.config.ui);
            await this.uiEngine.initialize();
            
            // Connect subsystems
            this.connectSubsystems();
            
            // Set initial state
            await this.setInitialState();
            
            this.isInitialized = true;
            this.eventSystem.emit('engine:initialized');
            
            console.log('Engine initialized successfully');
        } catch (error) {
            console.error('Failed to initialize engine:', error);
            throw error;
        }
    }
    
    /**
     * Connect subsystems and establish data flow
     */
    connectSubsystems() {
        // Connect simulation to rendering
        this.simulationEngine.on('bodiesUpdated', (bodies) => {
            this.renderEngine.updateCelestialBodies(bodies);
        });
        
        // Connect simulation to UI
        this.simulationEngine.on('timeUpdated', (timeData) => {
            this.uiEngine.emit('timeUpdated', timeData);
        });
        
        // Connect data manager to simulation
        this.dataManager.on('dataLoaded', (data) => {
            this.simulationEngine.updateCelestialData(data);
        });
        
        // Connect UI to simulation
        this.uiEngine.on('timeSpeedChanged', (speed) => {
            this.simulationEngine.setTimeSpeed(speed);
        });
        
        this.uiEngine.on('timeControl', (action) => {
            switch (action) {
                case 'play':
                    this.simulationEngine.play();
                    break;
                case 'pause':
                    this.simulationEngine.pause();
                    break;
                case 'reset':
                    this.simulationEngine.reset();
                    break;
            }
        });
        
        // Connect UI to rendering
        this.uiEngine.on('viewChanged', (settings) => {
            this.renderEngine.updateViewSettings(settings);
        });
        
        this.uiEngine.on('displayChanged', (settings) => {
            this.renderEngine.updateDisplaySettings(settings);
        });
        
        // Connect performance monitor to UI
        this.performanceMonitor.on('metricsUpdated', (metrics) => {
            this.uiEngine.emit('performanceMetricsUpdated', metrics);
        });
        
        // Connect rendering to UI for object selection
        this.renderEngine.on('objectSelected', (object) => {
            this.uiEngine.emit('objectSelected', object);
        });
        
        // Connect engine events to UI
        this.eventSystem.on('engine:initialized', () => {
            this.uiEngine.components.get('loading').hide();
        });
        
        this.eventSystem.on('engine:error', (error) => {
            this.uiEngine.emit('error', error);
        });
    }
    
    /**
     * Set initial state of the simulation
     */
    async setInitialState() {
        // Load essential celestial body data
        await this.dataManager.loadEssentialData();
        
        // Set initial camera position
        this.renderEngine.setCameraPosition({
            x: RENDERING_CONSTANTS.DEFAULT_CAMERA_POSITION.x,
            y: RENDERING_CONSTANTS.DEFAULT_CAMERA_POSITION.y,
            z: RENDERING_CONSTANTS.DEFAULT_CAMERA_POSITION.z
        });
        
        // Set initial simulation time
        this.simulationEngine.setCurrentTime(new Date());
        
        // Set initial UI state
        this.uiEngine.emit('initialDateSet', new Date());
        this.uiEngine.emit('timeSpeedSet', this.config.simulation.simulationSpeed);
    }
    
    /**
     * Start the engine main loop
     */
    start() {
        if (!this.isInitialized) {
            throw new Error('Engine must be initialized before starting');
        }
        
        if (this.isRunning) {
            console.warn('Engine is already running');
            return;
        }
        
        this.isRunning = true;
        this.lastFrameTime = performance.now();
        this.frameCount = 0;
        
        // Start subsystems
        this.simulationEngine.start();
        this.renderEngine.start();
        this.performanceMonitor.start();
        
        // Start main loop
        this.mainLoop();
        
        this.eventSystem.emit('engine:started');
        console.log('Engine started');
    }
    
    /**
     * Stop the engine
     */
    stop() {
        if (!this.isRunning) {
            console.warn('Engine is not running');
            return;
        }
        
        this.isRunning = false;
        
        // Stop subsystems
        this.simulationEngine.stop();
        this.renderEngine.stop();
        this.performanceMonitor.stop();
        
        this.eventSystem.emit('engine:stopped');
        console.log('Engine stopped');
    }
    
    /**
     * Main application loop
     */
    mainLoop() {
        if (!this.isRunning) return;
        
        const currentTime = performance.now();
        const deltaTime = currentTime - this.lastFrameTime;
        this.lastFrameTime = currentTime;
        
        // Calculate FPS
        this.frameCount++;
        if (this.frameCount % 60 === 0) {
            this.fps = 1000 / deltaTime;
        }
        
        // FPS limiting
        const fpsLimit = this.config.rendering.fpsLimit || 60;
        const targetFrameTime = 1000 / fpsLimit;
        
        if (deltaTime >= targetFrameTime) {
            // Update simulation
            this.simulationEngine.update(deltaTime);
            
            // Update rendering
            this.renderEngine.render();
            
            // Update performance monitoring
            this.performanceMonitor.update(deltaTime, this.fps);
        }
        
        // Continue loop
        requestAnimationFrame(() => this.mainLoop());
    }
    
    /**
     * Setup event handlers for system events
     */
    setupEventHandlers() {
        // Handle window resize
        window.addEventListener('resize', () => {
            if (this.renderEngine) {
                this.renderEngine.handleResize();
            }
        });
        
        // Handle visibility change (pause when tab is not visible)
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                this.wasRunning = this.isRunning;
                if (this.isRunning) {
                    this.pause();
                }
            } else {
                if (this.wasRunning) {
                    this.play();
                }
            }
        });
        
        // Handle errors
        window.addEventListener('error', (event) => {
            console.error('Global error:', event.error);
            this.eventSystem.emit('engine:error', event.error);
        });
        
        // Handle unhandled promise rejections
        window.addEventListener('unhandledrejection', (event) => {
            console.error('Unhandled promise rejection:', event.reason);
            this.eventSystem.emit('engine:error', event.reason);
        });
    }
    
    /**
     * Pause the simulation
     */
    pause() {
        if (this.simulationEngine) {
            this.simulationEngine.pause();
        }
        this.eventSystem.emit('engine:paused');
    }
    
    /**
     * Resume the simulation
     */
    play() {
        if (this.simulationEngine) {
            this.simulationEngine.play();
        }
        this.eventSystem.emit('engine:resumed');
    }
    
    /**
     * Reset the simulation to initial state
     */
    reset() {
        if (this.simulationEngine) {
            this.simulationEngine.reset();
        }
        if (this.renderEngine) {
            this.renderEngine.reset();
        }
        this.eventSystem.emit('engine:reset');
    }
    
    /**
     * Update engine configuration
     * @param {Object} newConfig - New configuration object
     */
    updateConfig(newConfig) {
        this.config = { ...this.config, ...newConfig };
        
        // Update subsystem configurations
        if (this.renderEngine) {
            this.renderEngine.updateConfig(this.config.rendering);
        }
        if (this.simulationEngine) {
            this.simulationEngine.updateConfig(this.config.simulation);
        }
        if (this.dataManager) {
            this.dataManager.updateConfig(this.config.data);
        }
        if (this.uiEngine) {
            this.uiEngine.updateConfig(this.config.ui);
        }
        
        this.eventSystem.emit('engine:configUpdated', this.config);
    }
    
    /**
     * Get current engine status
     * @returns {Object} Engine status information
     */
    getStatus() {
        return {
            isInitialized: this.isInitialized,
            isRunning: this.isRunning,
            fps: this.fps,
            frameCount: this.frameCount,
            config: this.config,
            subsystems: {
                renderEngine: this.renderEngine ? this.renderEngine.getStatus() : null,
                simulationEngine: this.simulationEngine ? this.simulationEngine.getStatus() : null,
                dataManager: this.dataManager ? this.dataManager.getStatus() : null,
                uiEngine: this.uiEngine ? this.uiEngine.getStatus() : null,
                performanceMonitor: this.performanceMonitor ? this.performanceMonitor.getStatus() : null
            }
        };
    }
    
    /**
     * Clean up resources and destroy the engine
     */
    destroy() {
        this.stop();
        
        if (this.renderEngine) {
            this.renderEngine.destroy();
        }
        if (this.simulationEngine) {
            this.simulationEngine.destroy();
        }
        if (this.dataManager) {
            this.dataManager.destroy();
        }
        if (this.uiEngine) {
            this.uiEngine.destroy();
        }
        if (this.performanceMonitor) {
            this.performanceMonitor.destroy();
        }
        if (this.eventSystem) {
            this.eventSystem.destroy();
        }
        
        this.isInitialized = false;
        this.eventSystem.emit('engine:destroyed');
        console.log('Engine destroyed');
    }
}