import { Engine } from './core/Engine.js';

/**
 * Main application entry point
 */
class SolarSystemApp {
    constructor() {
        this.engine = null;
        this.isInitialized = false;
    }
    
    /**
     * Initialize the application
     */
    async initialize() {
        try {
            console.log('Initializing Solar System Visualization...');
            
            // Get canvas element
            const canvas = document.getElementById('solar-system-canvas');
            if (!canvas) {
                throw new Error('Canvas element not found');
            }
            
            // Create and initialize engine
            this.engine = new Engine(canvas);
            await this.engine.initialize();
            
            // Setup UI event listeners
            this.setupUIEventListeners();
            
            // Initialize complete
            this.isInitialized = true;
            console.log('Solar System Visualization initialized successfully');
            
            // Start the engine
            this.engine.start();
            
        } catch (error) {
            console.error('Failed to initialize application:', error);
            this.showError('Failed to initialize application: ' + error.message);
        }
    }
    
    /**
     * Setup UI event listeners
     */
    setupUIEventListeners() {
        // Time controls
        const playPauseBtn = document.getElementById('play-pause');
        const resetTimeBtn = document.getElementById('reset-time');
        
        if (playPauseBtn) {
            playPauseBtn.addEventListener('click', () => {
                if (this.engine) {
                    const isRunning = this.engine.getStatus().isRunning;
                    if (isRunning) {
                        this.engine.pause();
                        playPauseBtn.textContent = '▶️';
                    } else {
                        this.engine.play();
                        playPauseBtn.textContent = '⏸️';
                    }
                }
            });
        }
        
        if (resetTimeBtn) {
            resetTimeBtn.addEventListener('click', () => {
                if (this.engine) {
                    this.engine.reset();
                    if (playPauseBtn) {
                        playPauseBtn.textContent = '▶️';
                    }
                }
            });
        }
        
        // Time speed control
        const timeSpeedSlider = document.getElementById('time-speed');
        const timeSpeedValue = document.getElementById('time-speed-value');
        
        if (timeSpeedSlider && timeSpeedValue) {
            timeSpeedSlider.addEventListener('input', (e) => {
                const speed = parseFloat(e.target.value);
                timeSpeedValue.textContent = `${speed}x`;
                
                if (this.engine) {
                    this.engine.updateConfig({
                        simulation: {
                            timeStep: 3600, // 1 hour
                            simulationSpeed: speed
                        }
                    });
                }
            });
        }
        
        // Current date control
        const currentDateInput = document.getElementById('current-date');
        
        if (currentDateInput) {
            currentDateInput.addEventListener('change', (e) => {
                const date = new Date(e.target.value);
                if (!isNaN(date.getTime())) {
                    if (this.engine && this.engine.simulationEngine) {
                        this.engine.simulationEngine.setCurrentTime(date);
                    }
                }
            });
            
            // Set initial date to today
            const today = new Date();
            currentDateInput.value = today.toISOString().split('T')[0];
        }
        
        // View settings
        const planetSizeScaleSlider = document.getElementById('planet-size-scale');
        const planetSizeScaleValue = document.getElementById('planet-size-scale-value');
        const distanceScaleSlider = document.getElementById('distance-scale');
        const distanceScaleValue = document.getElementById('distance-scale-value');
        const cameraSpeedSlider = document.getElementById('camera-speed');
        const cameraSpeedValue = document.getElementById('camera-speed-value');
        
        if (planetSizeScaleSlider && planetSizeScaleValue) {
            planetSizeScaleSlider.addEventListener('input', (e) => {
                const scale = parseFloat(e.target.value);
                planetSizeScaleValue.textContent = `${scale}x`;
                
                if (this.engine && this.engine.renderEngine) {
                    this.engine.renderEngine.setPlanetScale(scale);
                }
            });
        }
        
        if (distanceScaleSlider && distanceScaleValue) {
            distanceScaleSlider.addEventListener('input', (e) => {
                const scale = parseFloat(e.target.value);
                distanceScaleValue.textContent = `${scale}x`;
                
                if (this.engine && this.engine.renderEngine) {
                    this.engine.renderEngine.setDistanceScale(scale);
                }
            });
        }
        
        if (cameraSpeedSlider && cameraSpeedValue) {
            cameraSpeedSlider.addEventListener('input', (e) => {
                const speed = parseFloat(e.target.value);
                cameraSpeedValue.textContent = `${speed}x`;
                
                if (this.engine && this.engine.renderEngine) {
                    this.engine.renderEngine.setCameraSpeed(speed);
                }
            });
        }
        
        // Display options
        const showOrbitsCheckbox = document.getElementById('show-orbits');
        const showLabelsCheckbox = document.getElementById('show-labels');
        const showTexturesCheckbox = document.getElementById('show-textures');
        const showStarfieldCheckbox = document.getElementById('show-starfield');
        const showGridCheckbox = document.getElementById('show-grid');
        
        if (showOrbitsCheckbox) {
            showOrbitsCheckbox.addEventListener('change', (e) => {
                if (this.engine && this.engine.renderEngine) {
                    this.engine.renderEngine.setShowOrbits(e.target.checked);
                }
            });
        }
        
        if (showLabelsCheckbox) {
            showLabelsCheckbox.addEventListener('change', (e) => {
                if (this.engine && this.engine.renderEngine) {
                    this.engine.renderEngine.setShowLabels(e.target.checked);
                }
            });
        }
        
        if (showTexturesCheckbox) {
            showTexturesCheckbox.addEventListener('change', (e) => {
                if (this.engine && this.engine.renderEngine) {
                    this.engine.renderEngine.setShowTextures(e.target.checked);
                }
            });
        }
        
        if (showStarfieldCheckbox) {
            showStarfieldCheckbox.addEventListener('change', (e) => {
                if (this.engine && this.engine.renderEngine) {
                    this.engine.renderEngine.setShowStarfield(e.target.checked);
                }
            });
        }
        
        if (showGridCheckbox) {
            showGridCheckbox.addEventListener('change', (e) => {
                if (this.engine && this.engine.renderEngine) {
                    this.engine.renderEngine.setShowGrid(e.target.checked);
                }
            });
        }
        
        // Lighting controls
        const sunIntensitySlider = document.getElementById('sun-intensity');
        const sunIntensityValue = document.getElementById('sun-intensity-value');
        const ambientLightSlider = document.getElementById('ambient-light');
        const ambientLightValue = document.getElementById('ambient-light-value');
        const showShadowsCheckbox = document.getElementById('show-shadows');
        
        if (sunIntensitySlider && sunIntensityValue) {
            sunIntensitySlider.addEventListener('input', (e) => {
                const intensity = parseFloat(e.target.value);
                sunIntensityValue.textContent = intensity;
                
                if (this.engine && this.engine.renderEngine) {
                    this.engine.renderEngine.setSunIntensity(intensity);
                }
            });
        }
        
        if (ambientLightSlider && ambientLightValue) {
            ambientLightSlider.addEventListener('input', (e) => {
                const intensity = parseFloat(e.target.value);
                ambientLightValue.textContent = intensity;
                
                if (this.engine && this.engine.renderEngine) {
                    this.engine.renderEngine.setAmbientLight(intensity);
                }
            });
        }
        
        if (showShadowsCheckbox) {
            showShadowsCheckbox.addEventListener('change', (e) => {
                if (this.engine && this.engine.renderEngine) {
                    this.engine.renderEngine.setShowShadows(e.target.checked);
                }
            });
        }
        
        // Planet selection
        const planetSelect = document.getElementById('planet-select');
        const autoFollowPlanetCheckbox = document.getElementById('auto-follow-planet');
        
        if (planetSelect) {
            planetSelect.addEventListener('change', (e) => {
                const planet = e.target.value;
                
                if (this.engine && this.engine.renderEngine) {
                    this.engine.renderEngine.selectPlanet(planet);
                    
                    // Auto-follow if enabled
                    if (autoFollowPlanetCheckbox && autoFollowPlanetCheckbox.checked) {
                        this.engine.renderEngine.setFollowPlanet(planet);
                    }
                }
            });
        }
        
        if (autoFollowPlanetCheckbox) {
            autoFollowPlanetCheckbox.addEventListener('change', (e) => {
                if (this.engine && this.engine.renderEngine) {
                    const planet = planetSelect ? planetSelect.value : null;
                    if (e.target.checked && planet) {
                        this.engine.renderEngine.setFollowPlanet(planet);
                    } else {
                        this.engine.renderEngine.setFollowPlanet(null);
                    }
                }
            });
        }
        
        // Performance settings
        const levelOfDetailSlider = document.getElementById('level-of-detail');
        const levelOfDetailValue = document.getElementById('level-of-detail-value');
        const fpsLimitSlider = document.getElementById('fps-limit');
        const fpsLimitValue = document.getElementById('fps-limit-value');
        
        if (levelOfDetailSlider && levelOfDetailValue) {
            levelOfDetailSlider.addEventListener('input', (e) => {
                const lod = parseInt(e.target.value);
                levelOfDetailValue.textContent = lod;
                
                if (this.engine && this.engine.renderEngine) {
                    this.engine.renderEngine.setLevelOfDetail(lod);
                }
            });
        }
        
        if (fpsLimitSlider && fpsLimitValue) {
            fpsLimitSlider.addEventListener('input', (e) => {
                const fps = parseInt(e.target.value);
                fpsLimitValue.textContent = fps;
                
                if (this.engine) {
                    this.engine.updateConfig({
                        rendering: {
                            fpsLimit: fps
                        }
                    });
                }
            });
        }
    }
    
    /**
     * Show error message to user
     * @param {string} message - Error message
     */
    showError(message) {
        const loadingScreen = document.getElementById('loading-screen');
        const loadingText = document.querySelector('.loading-text');
        
        if (loadingScreen && loadingText) {
            loadingText.textContent = `Error: ${message}`;
            loadingText.style.color = '#e74c3c';
        }
    }
    
    /**
     * Get application status
     * @returns {Object} Application status
     */
    getStatus() {
        return {
            isInitialized: this.isInitialized,
            engine: this.engine ? this.engine.getStatus() : null
        };
    }
    
    /**
     * Destroy the application
     */
    destroy() {
        if (this.engine) {
            this.engine.destroy();
            this.engine = null;
        }
        
        this.isInitialized = false;
        console.log('Solar System Visualization destroyed');
    }
}

// Create and initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const app = new SolarSystemApp();
    app.initialize().catch(error => {
        console.error('Failed to start application:', error);
    });
    
    // Make app globally accessible for debugging
    window.solarSystemApp = app;
});

// Handle page unload
window.addEventListener('beforeunload', () => {
    if (window.solarSystemApp) {
        window.solarSystemApp.destroy();
    }
});