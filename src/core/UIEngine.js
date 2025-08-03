import { UI_CONSTANTS } from '../utils/Constants.js';
import { TooltipIntegration } from '../ui/TooltipIntegration.js';

/**
 * User Interface engine for managing UI components and interactions
 */
export class UIEngine {
    constructor(config = {}) {
        this.config = {
            showControls: true,
            showInfo: true,
            showTooltips: true,
            autoHideControls: true,
            autoHideDelay: UI_CONSTANTS.AUTO_HIDE_DELAY,
            theme: 'dark',
            language: 'en',
            ...config
        };
        
        // UI state
        this.isInitialized = false;
        this.isVisible = true;
        this.isControlsVisible = true;
        this.isInfoVisible = false;
        this.selectedObject = null;
        this.hoveredObject = null;
        
        // UI elements
        this.elements = new Map();
        this.tooltips = new Map();
        this.panels = new Map();
        
        // Event callbacks
        this.eventCallbacks = new Map();
        
        // Auto-hide timer
        this.autoHideTimer = null;
        
        // UI components
        this.components = new Map();
        
        // Tooltip integration
        this.tooltipIntegration = new TooltipIntegration({
            enabled: this.config.showTooltips,
            delay: 500,
            language: this.config.language
        });
        
        // Dependencies for tooltip integration
        this.dependencies = {};
        
        // Localization
        this.localization = new Map();
        this.initializeLocalization();
        
        // Theme
        this.themes = new Map();
        this.initializeThemes();
    }
    
    /**
     * Initialize the UI engine
     * @returns {Promise<void>}
     */
    async initialize() {
        try {
            console.log('Initializing UI Engine...');
            
            // Initialize UI elements
            this.initializeElements();
            
            // Initialize panels
            this.initializePanels();
            
            // Initialize components
            this.initializeComponents();
            
            // Initialize tooltip integration
            await this.initializeTooltipIntegration();
            
            // Apply theme
            this.applyTheme(this.config.theme);
            
            // Setup camera control event listeners
            this.setupCameraControlEventListeners();
            
            // Setup event listeners
            this.setupEventListeners();
            
            // Setup auto-hide if enabled
            if (this.config.autoHideControls) {
                this.setupAutoHide();
            }
            
            this.isInitialized = true;
            console.log('UI Engine initialized successfully');
            
        } catch (error) {
            console.error('Failed to initialize UI Engine:', error);
            throw error;
        }
    }
    
    /**
     * Initialize UI elements
     */
    initializeElements() {
        // Get or create canvas container
        let canvasContainer = document.getElementById('canvas-container');
        if (!canvasContainer) {
            canvasContainer = document.createElement('div');
            canvasContainer.id = 'canvas-container';
            document.body.appendChild(canvasContainer);
        }
        this.elements.set('canvasContainer', canvasContainer);
        
        // Get or create control panel
        let controlPanel = document.getElementById('control-panel');
        if (!controlPanel) {
            controlPanel = document.createElement('div');
            controlPanel.id = 'control-panel';
            controlPanel.className = 'control-panel';
            canvasContainer.appendChild(controlPanel);
        }
        this.elements.set('controlPanel', controlPanel);
        
        // Get or create info panel
        let infoPanel = document.getElementById('info-panel');
        if (!infoPanel) {
            infoPanel = document.createElement('div');
            infoPanel.id = 'info-panel';
            infoPanel.className = 'info-panel';
            canvasContainer.appendChild(infoPanel);
        }
        this.elements.set('infoPanel', infoPanel);
        
        // Get or create tooltip container
        let tooltipContainer = document.getElementById('tooltip-container');
        if (!tooltipContainer) {
            tooltipContainer = document.createElement('div');
            tooltipContainer.id = 'tooltip-container';
            tooltipContainer.className = 'tooltip-container';
            canvasContainer.appendChild(tooltipContainer);
        }
        this.elements.set('tooltipContainer', tooltipContainer);
        
        // Get or create loading screen
        let loadingScreen = document.getElementById('loading-screen');
        if (!loadingScreen) {
            loadingScreen = document.createElement('div');
            loadingScreen.id = 'loading-screen';
            loadingScreen.className = 'loading-screen';
            loadingScreen.innerHTML = `
                <div class="loading-content">
                    <div class="loading-spinner"></div>
                    <div class="loading-text">Loading Solar System...</div>
                    <div class="loading-progress-bar">
                        <div class="loading-progress"></div>
                    </div>
                </div>
            `;
            document.body.appendChild(loadingScreen);
        }
        this.elements.set('loadingScreen', loadingScreen);
    }
    
    /**
     * Initialize panels
     */
    initializePanels() {
        // Control panel sections
        const controlPanel = this.elements.get('controlPanel');
        
        // Time controls
        const timeControls = this.createPanelSection('time-controls', 'Time Controls');
        timeControls.innerHTML = `
            <div class="control-group">
                <button id="play-pause" class="control-button">▶️</button>
                <button id="reset-time" class="control-button">↺</button>
            </div>
            <div class="control-group">
                <label for="time-speed">Speed:</label>
                <input type="range" id="time-speed" min="0.1" max="100" step="0.1" value="1">
                <span id="time-speed-value">1x</span>
            </div>
            <div class="control-group">
                <label for="current-date">Date:</label>
                <input type="date" id="current-date">
            </div>
        `;
        controlPanel.appendChild(timeControls);
        this.panels.set('timeControls', timeControls);
        
        // View settings
        const viewSettings = this.createPanelSection('view-settings', 'View Settings');
        viewSettings.innerHTML = `
            <div class="control-group">
                <label for="planet-size-scale">Planet Size Scale:</label>
                <input type="range" id="planet-size-scale" min="0.1" max="20" step="0.1" value="1">
                <span id="planet-size-scale-value">1x</span>
            </div>
            <div class="control-group">
                <label for="distance-scale">Distance Scale:</label>
                <input type="range" id="distance-scale" min="0.001" max="1" step="0.001" value="0.1">
                <span id="distance-scale-value">0.1x</span>
            </div>
            <div class="control-group">
                <label for="camera-speed">Camera Speed:</label>
                <input type="range" id="camera-speed" min="0.1" max="5" step="0.1" value="1">
                <span id="camera-speed-value">1x</span>
            </div>
        `;
        controlPanel.appendChild(viewSettings);
        this.panels.set('viewSettings', viewSettings);
        
        // Display options
        const displayOptions = this.createPanelSection('display-options', 'Display Options');
        displayOptions.innerHTML = `
            <div class="control-group">
                <label class="toggle-label">
                    <input type="checkbox" id="show-orbits" checked>
                    <span class="toggle-slider"></span>
                    Show Orbital Paths
                </label>
            </div>
            <div class="control-group">
                <label class="toggle-label">
                    <input type="checkbox" id="show-labels" checked>
                    <span class="toggle-slider"></span>
                    Show Planet Labels
                </label>
            </div>
            <div class="control-group">
                <label class="toggle-label">
                    <input type="checkbox" id="show-textures" checked>
                    <span class="toggle-slider"></span>
                    Show Planet Textures
                </label>
            </div>
            <div class="control-group">
                <label class="toggle-label">
                    <input type="checkbox" id="show-starfield" checked>
                    <span class="toggle-slider"></span>
                    Show Star Field
                </label>
            </div>
            <div class="control-group">
                <label class="toggle-label">
                    <input type="checkbox" id="show-grid">
                    <span class="toggle-slider"></span>
                    Show Grid
                </label>
            </div>
        `;
        controlPanel.appendChild(displayOptions);
        this.panels.set('displayOptions', displayOptions);
        
        // Lighting controls
        const lightingControls = this.createPanelSection('lighting-controls', 'Lighting Controls');
        lightingControls.innerHTML = `
            <div class="control-group">
                <label for="sun-intensity">Sun Intensity:</label>
                <input type="range" id="sun-intensity" min="0" max="3" step="0.1" value="1.5">
                <span id="sun-intensity-value">1.5</span>
            </div>
            <div class="control-group">
                <label for="ambient-light">Ambient Light:</label>
                <input type="range" id="ambient-light" min="0" max="1" step="0.05" value="0.2">
                <span id="ambient-light-value">0.2</span>
            </div>
            <div class="control-group">
                <label class="toggle-label">
                    <input type="checkbox" id="show-shadows" checked>
                    <span class="toggle-slider"></span>
                    Show Shadows
                </label>
            </div>
        `;
        controlPanel.appendChild(lightingControls);
        this.panels.set('lightingControls', lightingControls);
        
        // Planet selection
        const planetSelection = this.createPanelSection('planet-selection', 'Planet Selection');
        planetSelection.innerHTML = `
            <div class="control-group">
                <label for="planet-select">Select Planet:</label>
                <select id="planet-select" class="planet-select">
                    <option value="">None (Free Camera)</option>
                    <option value="sun">Sun</option>
                    <option value="mercury">Mercury</option>
                    <option value="venus">Venus</option>
                    <option value="earth">Earth</option>
                    <option value="mars">Mars</option>
                    <option value="jupiter">Jupiter</option>
                    <option value="saturn">Saturn</option>
                    <option value="uranus">Uranus</option>
                    <option value="neptune">Neptune</option>
                </select>
            </div>
            <div class="control-group">
                <label class="toggle-label">
                    <input type="checkbox" id="auto-follow-planet">
                    <span class="toggle-slider"></span>
                    Auto-Follow Planet
                </label>
            </div>
        `;
        controlPanel.appendChild(planetSelection);
        this.panels.set('planetSelection', planetSelection);
        
        // Performance settings
        const performanceSettings = this.createPanelSection('performance-settings', 'Performance Settings');
        performanceSettings.innerHTML = `
            <div class="control-group">
                <label for="level-of-detail">Level of Detail:</label>
                <input type="range" id="level-of-detail" min="1" max="5" step="1" value="3">
                <span id="level-of-detail-value">3</span>
            </div>
            <div class="control-group">
                <label for="fps-limit">FPS Limit:</label>
                <input type="range" id="fps-limit" min="15" max="120" step="5" value="60">
                <span id="fps-limit-value">60</span>
            </div>
        `;
        controlPanel.appendChild(performanceSettings);
        this.panels.set('performanceSettings', performanceSettings);
        
        // Info panel
        const infoPanel = this.elements.get('infoPanel');
        infoPanel.innerHTML = `
            <div class="info-header">
                <h2 id="info-title">Solar System</h2>
                <button id="close-info" class="close-button">×</button>
            </div>
            <div class="info-content">
                <div id="info-description">Select an object to view information</div>
                <div id="info-details"></div>
                <div id="info-facts"></div>
            </div>
        `;
        this.panels.set('infoPanel', infoPanel);
        
        // Panel toggle button
        const togglePanel = document.createElement('button');
        togglePanel.id = 'toggle-panel';
        togglePanel.className = 'panel-toggle';
        togglePanel.textContent = '−';
        controlPanel.appendChild(togglePanel);
        this.elements.set('togglePanel', togglePanel);
    }
    
    /**
     * Create a panel section
     * @param {string} id - Section ID
     * @param {string} title - Section title
     * @returns {HTMLElement} Section element
     */
    createPanelSection(id, title) {
        const section = document.createElement('div');
        section.id = id;
        section.className = 'panel-section';
        
        const header = document.createElement('h3');
        header.className = 'panel-section-header';
        header.textContent = title;
        section.appendChild(header);
        
        return section;
    }
    
    /**
     * Initialize UI components
     */
    initializeComponents() {
        // Create tooltip component (now using TooltipIntegration)
        const tooltipComponent = {
            show: (id, content, x, y) => this.showTooltip(id, content, x, y),
            hide: (id) => this.hideTooltip(id),
            update: (id, content, x, y) => this.updateTooltip(id, content, x, y),
            setEnabled: (enabled) => this.setTooltipEnabled(enabled),
            addContent: (id, content) => this.addTooltipContent(id, content),
            removeContent: (id) => this.removeTooltipContent(id),
            setLanguage: (language) => this.setTooltipLanguage(language)
        };
        this.components.set('tooltip', tooltipComponent);
        
        // Create loading component
        const loadingComponent = {
            show: () => this.showLoading(),
            hide: () => this.hideLoading(),
            updateProgress: (progress, message) => this.updateLoadingProgress(progress, message)
        };
        this.components.set('loading', loadingComponent);
        
        // Create info panel component
        const infoPanelComponent = {
            show: (title, description, details, facts) => this.showInfoPanel(title, description, details, facts),
            hide: () => this.hideInfoPanel(),
            update: (title, description, details, facts) => this.updateInfoPanel(title, description, details, facts)
        };
        this.components.set('infoPanel', infoPanelComponent);
    }
    
    /**
     * Initialize tooltip integration
     */
    async initializeTooltipIntegration() {
        try {
            console.log('Initializing Tooltip Integration...');
            
            // Initialize tooltip integration with dependencies
            await this.tooltipIntegration.initialize(this.dependencies);
            
            // Register event listeners for tooltip integration
            this.tooltipIntegration.on('tooltipShown', (data) => {
                this.emit('tooltipShown', data);
            });
            
            this.tooltipIntegration.on('tooltipHidden', (data) => {
                this.emit('tooltipHidden', data);
            });
            
            this.tooltipIntegration.on('tooltipUpdated', (data) => {
                this.emit('tooltipUpdated', data);
            });
            
            this.tooltipIntegration.on('tooltipPinned', (data) => {
                this.emit('tooltipPinned', data);
            });
            
            this.tooltipIntegration.on('tooltipUnpinned', (data) => {
                this.emit('tooltipUnpinned', data);
            });
            
            console.log('Tooltip Integration initialized successfully');
            
        } catch (error) {
            console.error('Failed to initialize Tooltip Integration:', error);
            throw error;
        }
    }
    
    /**
     * Initialize localization
     */
    initializeLocalization() {
        // English (default)
        this.localization.set('en', {
            'loading': 'Loading Solar System...',
            'timeControls': 'Time Controls',
            'cameraControls': 'Camera Controls',
            'cameraAnimation': 'Camera Animation',
            'cameraPath': 'Camera Path Recording',
            'displayOptions': 'Display Options',
            'lighting': 'Lighting',
            'speed': 'Speed',
            'date': 'Date',
            'distance': 'Distance',
            'fieldOfView': 'Field of View',
            'showOrbits': 'Show Orbits',
            'showLabels': 'Show Labels',
            'showTextures': 'Show Textures',
            'planetScale': 'Planet Scale',
            'distanceScale': 'Distance Scale',
            'sunIntensity': 'Sun Intensity',
            'ambientLight': 'Ambient Light',
            'selectObject': 'Select an object to view information',
            'close': 'Close',
            'cameraMode': 'Camera Mode',
            'cameraPreset': 'Preset Position',
            'movementSpeed': 'Movement Speed',
            'rotationSensitivity': 'Rotation Sensitivity',
            'zoomSensitivity': 'Zoom Sensitivity',
            'panSensitivity': 'Pan Sensitivity',
            'cameraInertia': 'Camera Inertia',
            'showNavigationAids': 'Show Navigation Aids',
            'resetCamera': 'Reset Camera',
            'animationDuration': 'Animation Duration (ms)',
            'animationEasing': 'Easing Function',
            'stopAnimation': 'Stop Animation',
            'pathName': 'Path Name',
            'recordingInterval': 'Recording Interval (ms)',
            'playbackDuration': 'Playback Duration (ms)',
            'recordPath': 'Record Path',
            'stopRecording': 'Stop Recording',
            'savedPaths': 'Saved Paths',
            'playPath': 'Play Path',
            'deletePath': 'Delete Path',
            'orbit': 'Orbit',
            'firstPerson': 'First Person',
            'freeFly': 'Free Fly',
            'follow': 'Follow',
            'lookAt': 'Look At',
            'cinematic': 'Cinematic',
            'topDown': 'Top Down',
            'sideView': 'Side View',
            'ecliptic': 'Ecliptic',
            'sunClose': 'Sun Close',
            'outerSystem': 'Outer System',
            'linear': 'Linear',
            'easeIn': 'Ease In',
            'easeOut': 'Ease Out',
            'easeInOut': 'Ease In Out',
            'cubicIn': 'Cubic In',
            'cubicOut': 'Cubic Out',
            'cubicInOut': 'Cubic In Out'
        });
        
        // Add more languages as needed
    }
    
    /**
     * Initialize themes
     */
    initializeThemes() {
        // Dark theme (default)
        this.themes.set('dark', {
            '--background-color': '#000000',
            '--panel-background': 'rgba(20, 20, 30, 0.8)',
            '--panel-border': 'rgba(100, 100, 120, 0.5)',
            '--text-color': '#ffffff',
            '--text-secondary': '#aaaaaa',
            '--button-background': 'rgba(60, 60, 80, 0.8)',
            '--button-hover': 'rgba(80, 80, 100, 0.9)',
            '--button-text': '#ffffff',
            '--input-background': 'rgba(40, 40, 50, 0.8)',
            '--input-border': 'rgba(100, 100, 120, 0.5)',
            '--tooltip-background': 'rgba(30, 30, 40, 0.9)',
            '--tooltip-border': 'rgba(100, 100, 120, 0.7)'
        });
        
        // Light theme
        this.themes.set('light', {
            '--background-color': '#f0f0f0',
            '--panel-background': 'rgba(255, 255, 255, 0.8)',
            '--panel-border': 'rgba(200, 200, 200, 0.5)',
            '--text-color': '#000000',
            '--text-secondary': '#555555',
            '--button-background': 'rgba(230, 230, 230, 0.8)',
            '--button-hover': 'rgba(210, 210, 210, 0.9)',
            '--button-text': '#000000',
            '--input-background': 'rgba(245, 245, 245, 0.8)',
            '--input-border': 'rgba(200, 200, 200, 0.5)',
            '--tooltip-background': 'rgba(255, 255, 255, 0.9)',
            '--tooltip-border': 'rgba(200, 200, 200, 0.7)'
        });
    }
    
    /**
     * Setup camera control event listeners
     */
    setupCameraControlEventListeners() {
        // Camera mode
        const cameraMode = document.getElementById('camera-mode');
        if (cameraMode) {
            cameraMode.addEventListener('change', (e) => {
                this.emit('cameraModeChanged', e.target.value);
            });
        }
        
        // Camera preset
        const cameraPreset = document.getElementById('camera-preset');
        if (cameraPreset) {
            cameraPreset.addEventListener('change', (e) => {
                if (e.target.value) {
                    this.emit('cameraPresetChanged', e.target.value);
                }
            });
        }
        
        // Movement speed
        const movementSpeed = document.getElementById('movement-speed');
        const movementSpeedValue = document.getElementById('movement-speed-value');
        if (movementSpeed && movementSpeedValue) {
            movementSpeed.addEventListener('input', (e) => {
                const value = parseFloat(e.target.value);
                movementSpeedValue.textContent = `${value}x`;
                this.emit('movementSpeedChanged', value);
            });
        }
        
        // Rotation sensitivity
        const rotationSensitivity = document.getElementById('rotation-sensitivity');
        const rotationSensitivityValue = document.getElementById('rotation-sensitivity-value');
        if (rotationSensitivity && rotationSensitivityValue) {
            rotationSensitivity.addEventListener('input', (e) => {
                const value = parseFloat(e.target.value);
                rotationSensitivityValue.textContent = `${value}x`;
                this.emit('rotationSensitivityChanged', value);
            });
        }
        
        // Zoom sensitivity
        const zoomSensitivity = document.getElementById('zoom-sensitivity');
        const zoomSensitivityValue = document.getElementById('zoom-sensitivity-value');
        if (zoomSensitivity && zoomSensitivityValue) {
            zoomSensitivity.addEventListener('input', (e) => {
                const value = parseFloat(e.target.value);
                zoomSensitivityValue.textContent = `${value}x`;
                this.emit('zoomSensitivityChanged', value);
            });
        }
        
        // Pan sensitivity
        const panSensitivity = document.getElementById('pan-sensitivity');
        const panSensitivityValue = document.getElementById('pan-sensitivity-value');
        if (panSensitivity && panSensitivityValue) {
            panSensitivity.addEventListener('input', (e) => {
                const value = parseFloat(e.target.value);
                panSensitivityValue.textContent = `${value}x`;
                this.emit('panSensitivityChanged', value);
            });
        }
        
        // Camera inertia
        const cameraInertia = document.getElementById('camera-inertia');
        const cameraInertiaValue = document.getElementById('camera-inertia-value');
        if (cameraInertia && cameraInertiaValue) {
            cameraInertia.addEventListener('input', (e) => {
                const value = parseFloat(e.target.value);
                cameraInertiaValue.textContent = value;
                this.emit('cameraInertiaChanged', value);
            });
        }
        
        // Show navigation aids
        const showNavigationAids = document.getElementById('show-navigation-aids');
        if (showNavigationAids) {
            showNavigationAids.addEventListener('change', (e) => {
                this.emit('navigationAidsToggled', e.target.checked);
            });
        }
        
        // Reset camera
        const resetCamera = document.getElementById('reset-camera');
        if (resetCamera) {
            resetCamera.addEventListener('click', () => {
                this.emit('cameraResetRequested');
            });
        }
        
        // Animation duration
        const animationDuration = document.getElementById('animation-duration');
        if (animationDuration) {
            animationDuration.addEventListener('change', (e) => {
                this.emit('animationDurationChanged', parseInt(e.target.value));
            });
        }
        
        // Animation easing
        const animationEasing = document.getElementById('animation-easing');
        if (animationEasing) {
            animationEasing.addEventListener('change', (e) => {
                this.emit('animationEasingChanged', e.target.value);
            });
        }
        
        // Stop animation
        const stopAnimation = document.getElementById('stop-animation');
        if (stopAnimation) {
            stopAnimation.addEventListener('click', () => {
                this.emit('animationStopRequested');
            });
        }
        
        // Path recording
        const recordPath = document.getElementById('record-path');
        const stopRecording = document.getElementById('stop-recording');
        const pathName = document.getElementById('path-name');
        const recordingInterval = document.getElementById('recording-interval');
        
        if (recordPath && pathName && recordingInterval) {
            recordPath.addEventListener('click', () => {
                const name = pathName.value.trim();
                if (name) {
                    const interval = parseInt(recordingInterval.value);
                    this.emit('pathRecordingStarted', { name, interval });
                }
            });
        }
        
        if (stopRecording) {
            stopRecording.addEventListener('click', () => {
                this.emit('pathRecordingStopped');
            });
        }
        
        // Path playback
        const playPath = document.getElementById('play-path');
        const deletePath = document.getElementById('delete-path');
        const savedPaths = document.getElementById('saved-paths');
        const playbackDuration = document.getElementById('playback-duration');
        
        if (playPath && savedPaths && playbackDuration) {
            playPath.addEventListener('click', () => {
                const pathName = savedPaths.value;
                if (pathName) {
                    const duration = parseInt(playbackDuration.value);
                    this.emit('pathPlaybackStarted', { name: pathName, duration });
                }
            });
        }
        
        if (deletePath && savedPaths) {
            deletePath.addEventListener('click', () => {
                const pathName = savedPaths.value;
                if (pathName) {
                    this.emit('pathDeleteRequested', pathName);
                }
            });
        }
    }
    
    /**
     * Update saved paths list
     * @param {string[]} pathNames - Array of path names
     */
    updateSavedPaths(pathNames) {
        const savedPaths = document.getElementById('saved-paths');
        if (savedPaths) {
            savedPaths.innerHTML = '';
            
            if (pathNames.length === 0) {
                const option = document.createElement('option');
                option.value = '';
                option.textContent = 'No saved paths';
                savedPaths.appendChild(option);
            } else {
                for (const name of pathNames) {
                    const option = document.createElement('option');
                    option.value = name;
                    option.textContent = name;
                    savedPaths.appendChild(option);
                }
            }
        }
    }
    
    /**
     * Setup event listeners
     */
    setupEventListeners() {
        // Panel toggle
        const togglePanel = this.elements.get('togglePanel');
        const controlPanel = this.elements.get('controlPanel');
        
        if (togglePanel && controlPanel) {
            togglePanel.addEventListener('click', () => {
                controlPanel.classList.toggle('collapsed');
                togglePanel.textContent = controlPanel.classList.contains('collapsed') ? '+' : '−';
                this.isControlsVisible = !controlPanel.classList.contains('collapsed');
                this.emit('controlsToggled', this.isControlsVisible);
            });
        }
        
        // Info panel close
        const closeInfo = document.getElementById('close-info');
        if (closeInfo) {
            closeInfo.addEventListener('click', () => {
                this.hideInfoPanel();
            });
        }
        
        // Window resize
        window.addEventListener('resize', () => {
            this.handleResize();
        });
        
        // Mouse move for auto-hide
        if (this.config.autoHideControls) {
            document.addEventListener('mousemove', () => {
                this.handleMouseMove();
            });
        }
    }
    
    /**
     * Setup auto-hide functionality
     */
    setupAutoHide() {
        this.handleMouseMove = () => {
            if (!this.isControlsVisible) {
                this.showControls();
            }
            
            // Reset timer
            if (this.autoHideTimer) {
                clearTimeout(this.autoHideTimer);
            }
            
            this.autoHideTimer = setTimeout(() => {
                this.hideControls();
            }, this.config.autoHideDelay);
        };
    }
    
    /**
     * Show controls
     */
    showControls() {
        const controlPanel = this.elements.get('controlPanel');
        if (controlPanel) {
            controlPanel.classList.remove('hidden');
            this.isControlsVisible = true;
            this.emit('controlsShown');
        }
    }
    
    /**
     * Hide controls
     */
    hideControls() {
        const controlPanel = this.elements.get('controlPanel');
        if (controlPanel && !controlPanel.classList.contains('collapsed')) {
            controlPanel.classList.add('hidden');
            this.isControlsVisible = false;
            this.emit('controlsHidden');
        }
    }
    
    /**
     * Show tooltip
     * @param {string} id - Tooltip ID
     * @param {string} content - Tooltip content
     * @param {number} x - X position
     * @param {number} y - Y position
     */
    showTooltip(id, content, x, y) {
        if (!this.config.showTooltips) return;
        
        let tooltip = this.tooltips.get(id);
        
        if (!tooltip) {
            tooltip = document.createElement('div');
            tooltip.id = `tooltip-${id}`;
            tooltip.className = 'tooltip';
            this.elements.get('tooltipContainer').appendChild(tooltip);
            this.tooltips.set(id, tooltip);
        }
        
        tooltip.textContent = content;
        tooltip.style.left = `${x}px`;
        tooltip.style.top = `${y}px`;
        tooltip.classList.add('visible');
        
        this.emit('tooltipShown', { id, content, x, y });
    }
    
    /**
     * Hide tooltip
     * @param {string} id - Tooltip ID
     */
    hideTooltip(id) {
        const tooltip = this.tooltips.get(id);
        if (tooltip) {
            tooltip.classList.remove('visible');
            this.emit('tooltipHidden', { id });
        }
    }
    
    /**
     * Update tooltip
     * @param {string} id - Tooltip ID
     * @param {string} content - Tooltip content
     * @param {number} x - X position
     * @param {number} y - Y position
     */
    updateTooltip(id, content, x, y) {
        const tooltip = this.tooltips.get(id);
        if (tooltip) {
            tooltip.textContent = content;
            tooltip.style.left = `${x}px`;
            tooltip.style.top = `${y}px`;
            this.emit('tooltipUpdated', { id, content, x, y });
        }
    }
    
    /**
     * Show loading screen
     */
    showLoading() {
        const loadingScreen = this.elements.get('loadingScreen');
        if (loadingScreen) {
            loadingScreen.style.display = 'flex';
            this.emit('loadingShown');
        }
    }
    
    /**
     * Hide loading screen
     */
    hideLoading() {
        const loadingScreen = this.elements.get('loadingScreen');
        if (loadingScreen) {
            loadingScreen.style.opacity = '0';
            setTimeout(() => {
                loadingScreen.style.display = 'none';
            }, 500);
            this.emit('loadingHidden');
        }
    }
    
    /**
     * Update loading progress
     * @param {number} progress - Progress percentage (0-100)
     * @param {string} message - Progress message
     */
    updateLoadingProgress(progress, message) {
        const progressBar = document.querySelector('.loading-progress');
        const loadingText = document.querySelector('.loading-text');
        
        if (progressBar) {
            progressBar.style.width = `${progress}%`;
        }
        
        if (loadingText) {
            loadingText.textContent = message;
        }
        
        this.emit('loadingProgressUpdated', { progress, message });
    }
    
    /**
     * Show info panel
     * @param {string} title - Info title
     * @param {string} description - Info description
     * @param {Object} details - Info details
     * @param {Array} facts - Info facts
     */
    showInfoPanel(title, description, details = {}, facts = []) {
        const infoPanel = this.elements.get('infoPanel');
        if (infoPanel) {
            this.updateInfoPanel(title, description, details, facts);
            infoPanel.classList.add('visible');
            this.isInfoVisible = true;
            this.emit('infoPanelShown', { title, description, details, facts });
        }
    }
    
    /**
     * Hide info panel
     */
    hideInfoPanel() {
        const infoPanel = this.elements.get('infoPanel');
        if (infoPanel) {
            infoPanel.classList.remove('visible');
            this.isInfoVisible = false;
            this.selectedObject = null;
            this.emit('infoPanelHidden');
        }
    }
    
    /**
     * Update info panel
     * @param {string} title - Info title
     * @param {string} description - Info description
     * @param {Object} details - Info details
     * @param {Array} facts - Info facts
     */
    updateInfoPanel(title, description, details = {}, facts = []) {
        const infoTitle = document.getElementById('info-title');
        const infoDescription = document.getElementById('info-description');
        const infoDetails = document.getElementById('info-details');
        const infoFacts = document.getElementById('info-facts');
        
        if (infoTitle) infoTitle.textContent = title;
        if (infoDescription) infoDescription.textContent = description;
        
        if (infoDetails) {
            infoDetails.innerHTML = '';
            
            for (const [key, value] of Object.entries(details)) {
                const detailItem = document.createElement('div');
                detailItem.className = 'info-detail';
                detailItem.innerHTML = `<span class="info-detail-label">${key}:</span> <span class="info-detail-value">${value}</span>`;
                infoDetails.appendChild(detailItem);
            }
        }
        
        if (infoFacts) {
            infoFacts.innerHTML = '';
            
            if (facts.length > 0) {
                const factsTitle = document.createElement('h4');
                factsTitle.textContent = 'Facts';
                infoFacts.appendChild(factsTitle);
                
                const factsList = document.createElement('ul');
                factsList.className = 'info-facts-list';
                
                for (const fact of facts) {
                    const factItem = document.createElement('li');
                    factItem.textContent = fact;
                    factsList.appendChild(factItem);
                }
                
                infoFacts.appendChild(factsList);
            }
        }
        
        this.emit('infoPanelUpdated', { title, description, details, facts });
    }
    
    /**
     * Handle window resize
     */
    handleResize() {
        // Update UI elements based on new window size
        this.emit('resized', {
            width: window.innerWidth,
            height: window.innerHeight
        });
    }
    
    /**
     * Apply theme
     * @param {string} themeName - Theme name
     */
    applyTheme(themeName) {
        const theme = this.themes.get(themeName);
        if (theme) {
            const root = document.documentElement;
            
            for (const [property, value] of Object.entries(theme)) {
                root.style.setProperty(property, value);
            }
            
            this.config.theme = themeName;
            this.emit('themeChanged', themeName);
        }
    }
    
    /**
     * Set language
     * @param {string} language - Language code
     */
    setLanguage(language) {
        if (this.localization.has(language)) {
            this.config.language = language;
            this.updateUIText();
            this.emit('languageChanged', language);
        }
    }
    
    /**
     * Update UI text based on current language
     */
    updateUIText() {
        const texts = this.localization.get(this.config.language);
        
        if (!texts) return;
        
        // Update panel titles
        const timeControlsHeader = document.querySelector('#time-controls .panel-section-header');
        if (timeControlsHeader) timeControlsHeader.textContent = texts.timeControls;
        
        const cameraControlsHeader = document.querySelector('#camera-controls .panel-section-header');
        if (cameraControlsHeader) cameraControlsHeader.textContent = texts.cameraControls;
        
        const displayControlsHeader = document.querySelector('#display-controls .panel-section-header');
        if (displayControlsHeader) displayControlsHeader.textContent = texts.displayOptions;
        
        const lightingControlsHeader = document.querySelector('#lighting-controls .panel-section-header');
        if (lightingControlsHeader) lightingControlsHeader.textContent = texts.lighting;
        
        // Update labels
        const labels = {
            'time-speed-label': texts.speed,
            'current-date-label': texts.date,
            'camera-distance-label': texts.distance,
            'camera-fov-label': texts.fieldOfView,
            'show-orbits-label': texts.showOrbits,
            'show-labels-label': texts.showLabels,
            'show-textures-label': texts.showTextures,
            'planet-scale-label': texts.planetScale,
            'distance-scale-label': texts.distanceScale,
            'sun-intensity-label': texts.sunIntensity,
            'ambient-light-label': texts.ambientLight
        };
        
        for (const [id, text] of Object.entries(labels)) {
            const element = document.getElementById(id);
            if (element) element.textContent = text;
        }
    }
    
    /**
     * Update UI configuration
     * @param {Object} config - New configuration
     */
    updateConfig(config) {
        this.config = { ...this.config, ...config };
        
        if (config.showControls !== undefined) {
            if (config.showControls) {
                this.showControls();
            } else {
                this.hideControls();
            }
        }
        
        if (config.showTooltips !== undefined) {
            if (!config.showTooltips) {
                for (const tooltip of this.tooltips.values()) {
                    tooltip.classList.remove('visible');
                }
            }
        }
        
        if (config.theme !== undefined) {
            this.applyTheme(config.theme);
        }
        
        if (config.language !== undefined) {
            this.setLanguage(config.language);
        }
        
        this.emit('configUpdated', this.config);
    }
    
    /**
     * Get UI engine status
     * @returns {Object} Status information
     */
    getStatus() {
        return {
            isInitialized: this.isInitialized,
            isVisible: this.isVisible,
            isControlsVisible: this.isControlsVisible,
            isInfoVisible: this.isInfoVisible,
            selectedObject: this.selectedObject,
            hoveredObject: this.hoveredObject,
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
                    console.error(`Error in UI engine event callback for "${event}":`, error);
                }
            }
        }
    }
    
    /**
     * Destroy the UI engine
     */
    destroy() {
        // Clear auto-hide timer
        if (this.autoHideTimer) {
            clearTimeout(this.autoHideTimer);
            this.autoHideTimer = null;
        }
        
        // Remove event listeners
        window.removeEventListener('resize', this.handleResize);
        
        if (this.config.autoHideControls) {
            document.removeEventListener('mousemove', this.handleMouseMove);
        }
        
        // Clear tooltips
        for (const tooltip of this.tooltips.values()) {
            tooltip.remove();
        }
        this.tooltips.clear();
        
        // Clear elements
        this.elements.clear();
        this.panels.clear();
        this.components.clear();
        this.eventCallbacks.clear();
        
        console.log('UI Engine destroyed');
    }
}