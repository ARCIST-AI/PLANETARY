/**
 * Tooltip Integration module for connecting tooltips with the solar system visualization
 */

import { TooltipManager } from './TooltipManager.js';

/**
 * Tooltip Integration class
 */
export class TooltipIntegration {
    /**
     * Create a new Tooltip Integration
     * @param {Object} config - Configuration object
     */
    constructor(config = {}) {
        this.config = {
            enabled: true,
            planetTooltips: true,
            controlTooltips: true,
            conceptTooltips: true,
            interactiveElements: true,
            showOnHover: true,
            showOnClick: false,
            delay: 500,
            ...config
        };

        // Tooltip manager
        this.tooltipManager = new TooltipManager({
            delay: this.config.delay,
            ...config.tooltipConfig
        });

        // State
        this.isInitialized = false;
        this.uiEngine = null;
        this.solarSystem = null;
        this.canvas = null;
        this.renderer = null;
        this.camera = null;
        this.controls = null;

        // Active tooltip tracking
        this.activePlanetTooltips = new Map();
        this.activeControlTooltips = new Map();
        this.activeConceptTooltips = new Map();

        // Event listeners
        this.eventListeners = new Map();
    }

    /**
     * Initialize the tooltip integration
     * @param {Object} dependencies - Dependencies { uiEngine, solarSystem, canvas, renderer, camera, controls }
     * @returns {Promise<void>}
     */
    async initialize(dependencies = {}) {
        if (this.isInitialized) return;

        try {
            console.log('Initializing Tooltip Integration...');

            // Store dependencies
            this.uiEngine = dependencies.uiEngine;
            this.solarSystem = dependencies.solarSystem;
            this.canvas = dependencies.canvas;
            this.renderer = dependencies.renderer;
            this.camera = dependencies.camera;
            this.controls = dependencies.controls;

            // Initialize tooltip manager
            await this.tooltipManager.initialize();

            // Setup planet tooltips
            if (this.config.planetTooltips && this.solarSystem) {
                this.setupPlanetTooltips();
            }

            // Setup control tooltips
            if (this.config.controlTooltips && this.uiEngine) {
                this.setupControlTooltips();
            }

            // Setup concept tooltips
            if (this.config.conceptTooltips) {
                this.setupConceptTooltips();
            }

            // Setup interactive elements
            if (this.config.interactiveElements && this.uiEngine) {
                this.setupInteractiveElements();
            }

            this.isInitialized = true;
            console.log('Tooltip Integration initialized successfully');

        } catch (error) {
            console.error('Failed to initialize Tooltip Integration:', error);
            throw error;
        }
    }

    /**
     * Setup planet tooltips
     */
    setupPlanetTooltips() {
        if (!this.canvas || !this.camera || !this.renderer) return;

        // Mouse move event for planet tooltips
        const mouseMoveHandler = (event) => {
            if (!this.config.enabled || !this.config.planetTooltips) return;

            // Calculate mouse position in normalized device coordinates
            const rect = this.canvas.getBoundingClientRect();
            const mouse = {
                x: ((event.clientX - rect.left) / rect.width) * 2 - 1,
                y: -((event.clientY - rect.top) / rect.height) * 2 + 1
            };

            // Raycast to find intersected objects
            const raycaster = new THREE.Raycaster();
            raycaster.setFromCamera(mouse, this.camera);

            // Get all celestial objects from the solar system
            const celestialObjects = this.getCelestialObjects();
            const intersects = raycaster.intersectObjects(celestialObjects);

            if (intersects.length > 0) {
                const intersectedObject = intersects[0].object;
                const celestialBody = intersectedObject.userData.body;

                if (celestialBody) {
                    this.showPlanetTooltip(celestialBody, event.clientX, event.clientY);
                }
            } else {
                this.hidePlanetTooltips();
            }
        };

        this.canvas.addEventListener('mousemove', mouseMoveHandler);
        this.eventListeners.set('planetMouseMove', mouseMoveHandler);

        // Mouse leave event
        const mouseLeaveHandler = () => {
            this.hidePlanetTooltips();
        };

        this.canvas.addEventListener('mouseleave', mouseLeaveHandler);
        this.eventListeners.set('planetMouseLeave', mouseLeaveHandler);
    }

    /**
     * Get celestial objects from the solar system
     * @returns {Array} Array of THREE.Object3D objects
     */
    getCelestialObjects() {
        const objects = [];

        if (this.solarSystem) {
            // Get all bodies from the solar system
            const bodies = this.solarSystem.getBodies();
            
            for (const body of bodies) {
                // Check if the body has a mesh object
                if (body.mesh) {
                    objects.push(body.mesh);
                }
                
                // Check if the body has an orbit line
                if (body.orbitLine) {
                    objects.push(body.orbitLine);
                }
            }
        }

        return objects;
    }

    /**
     * Show planet tooltip
     * @param {Object} celestialBody - Celestial body object
     * @param {number} x - Mouse X position
     * @param {number} y - Mouse Y position
     */
    showPlanetTooltip(celestialBody, x, y) {
        const bodyId = celestialBody.id;
        
        // Check if tooltip is already active
        if (this.activePlanetTooltips.has(bodyId)) {
            this.tooltipManager.update(bodyId, { x, y });
            return;
        }

        // Show tooltip
        const tooltipId = this.tooltipManager.show(bodyId, 'planet', { x, y }, {
            customData: {
                name: celestialBody.name,
                type: celestialBody.constructor.name,
                // Add real-time data if available
                currentPosition: celestialBody.position,
                currentVelocity: celestialBody.velocity
            }
        });

        if (tooltipId) {
            this.activePlanetTooltips.set(bodyId, tooltipId);
        }
    }

    /**
     * Hide planet tooltips
     */
    hidePlanetTooltips() {
        for (const tooltipId of this.activePlanetTooltips.values()) {
            this.tooltipManager.hide(tooltipId);
        }
        this.activePlanetTooltips.clear();
    }

    /**
     * Setup control tooltips
     */
    setupControlTooltips() {
        if (!this.uiEngine) return;

        // Time speed control
        this.setupControlTooltip('time-speed', 'control', {
            showOnHover: true,
            delay: 300
        });

        // Planet size scale
        this.setupControlTooltip('planet-size-scale', 'control', {
            showOnHover: true,
            delay: 300
        });

        // Distance scale
        this.setupControlTooltip('distance-scale', 'control', {
            showOnHover: true,
            delay: 300
        });

        // Show orbits toggle
        this.setupControlTooltip('show-orbits', 'control', {
            showOnHover: true,
            delay: 300
        });

        // Show labels toggle
        this.setupControlTooltip('show-labels', 'control', {
            showOnHover: true,
            delay: 300
        });

        // Show textures toggle
        this.setupControlTooltip('show-textures', 'control', {
            showOnHover: true,
            delay: 300
        });

        // Show starfield toggle
        this.setupControlTooltip('show-starfield', 'control', {
            showOnHover: true,
            delay: 300
        });

        // Show grid toggle
        this.setupControlTooltip('show-grid', 'control', {
            showOnHover: true,
            delay: 300
        });

        // Sun intensity
        this.setupControlTooltip('sun-intensity', 'control', {
            showOnHover: true,
            delay: 300
        });

        // Ambient light
        this.setupControlTooltip('ambient-light', 'control', {
            showOnHover: true,
            delay: 300
        });

        // Show shadows toggle
        this.setupControlTooltip('show-shadows', 'control', {
            showOnHover: true,
            delay: 300
        });

        // Planet selection
        this.setupControlTooltip('planet-select', 'control', {
            showOnHover: true,
            delay: 300
        });

        // Auto-follow planet toggle
        this.setupControlTooltip('auto-follow-planet', 'control', {
            showOnHover: true,
            delay: 300
        });

        // Level of detail
        this.setupControlTooltip('level-of-detail', 'control', {
            showOnHover: true,
            delay: 300
        });

        // FPS limit
        this.setupControlTooltip('fps-limit', 'control', {
            showOnHover: true,
            delay: 300
        });

        // Play/pause button
        this.setupControlTooltip('play-pause', 'control', {
            showOnHover: true,
            delay: 300
        });

        // Reset time button
        this.setupControlTooltip('reset-time', 'control', {
            showOnHover: true,
            delay: 300
        });

        // Current date input
        this.setupControlTooltip('current-date', 'control', {
            showOnHover: true,
            delay: 300
        });

        // Camera speed
        this.setupControlTooltip('camera-speed', 'control', {
            showOnHover: true,
            delay: 300
        });
    }

    /**
     * Setup tooltip for a specific control element
     * @param {string} elementId - ID of the control element
     * @param {string} tooltipType - Type of tooltip
     * @param {Object} options - Tooltip options
     */
    setupControlTooltip(elementId, tooltipType, options = {}) {
        const element = document.getElementById(elementId);
        if (!element) return;

        const showTooltip = (event) => {
            if (!this.config.enabled || !this.config.controlTooltips) return;

            const rect = element.getBoundingClientRect();
            const x = rect.left + rect.width / 2;
            const y = rect.top - 10; // Show above the element

            const tooltipId = this.tooltipManager.show(elementId, tooltipType, { x, y }, options);
            if (tooltipId) {
                this.activeControlTooltips.set(elementId, tooltipId);
            }
        };

        const hideTooltip = () => {
            const tooltipId = this.activeControlTooltips.get(elementId);
            if (tooltipId) {
                this.tooltipManager.hide(tooltipId);
                this.activeControlTooltips.delete(elementId);
            }
        };

        if (options.showOnHover !== false) {
            element.addEventListener('mouseenter', showTooltip);
            element.addEventListener('mouseleave', hideTooltip);
            this.eventListeners.set(`${elementId}MouseEnter`, showTooltip);
            this.eventListeners.set(`${elementId}MouseLeave`, hideTooltip);
        }

        if (options.showOnClick) {
            element.addEventListener('click', (event) => {
                event.stopPropagation();
                showTooltip(event);
            });
            this.eventListeners.set(`${elementId}Click`, showTooltip);
        }
    }

    /**
     * Setup concept tooltips
     */
    setupConceptTooltips() {
        // These will be setup when orbital paths and other visual elements are created
        // For now, we'll add a method that can be called when these elements are available

        // Example: Setup tooltip for AU scale indicator
        this.setupConceptTooltip('au-scale-indicator', 'astronomical-unit', {
            showOnHover: true,
            delay: 300
        });

        // Example: Setup tooltip for orbital mechanics visualization
        this.setupConceptTooltip('orbital-mechanics-demo', 'orbital-mechanics', {
            showOnHover: true,
            delay: 300
        });
    }

    /**
     * Setup tooltip for a concept element
     * @param {string} elementId - ID of the concept element
     * @param {string} contentId - ID of the content to show
     * @param {Object} options - Tooltip options
     */
    setupConceptTooltip(elementId, contentId, options = {}) {
        const element = document.getElementById(elementId);
        if (!element) return;

        const showTooltip = (event) => {
            if (!this.config.enabled || !this.config.conceptTooltips) return;

            const rect = element.getBoundingClientRect();
            const x = rect.left + rect.width / 2;
            const y = rect.top - 10; // Show above the element

            const tooltipId = this.tooltipManager.show(contentId, 'concept', { x, y }, options);
            if (tooltipId) {
                this.activeConceptTooltips.set(elementId, tooltipId);
            }
        };

        const hideTooltip = () => {
            const tooltipId = this.activeConceptTooltips.get(elementId);
            if (tooltipId) {
                this.tooltipManager.hide(tooltipId);
                this.activeConceptTooltips.delete(elementId);
            }
        };

        if (options.showOnHover !== false) {
            element.addEventListener('mouseenter', showTooltip);
            element.addEventListener('mouseleave', hideTooltip);
            this.eventListeners.set(`${elementId}MouseEnter`, showTooltip);
            this.eventListeners.set(`${elementId}MouseLeave`, hideTooltip);
        }

        if (options.showOnClick) {
            element.addEventListener('click', (event) => {
                event.stopPropagation();
                showTooltip(event);
            });
            this.eventListeners.set(`${elementId}Click`, showTooltip);
        }
    }

    /**
     * Setup interactive elements
     */
    setupInteractiveElements() {
        if (!this.uiEngine) return;

        // Panel toggle button
        this.setupInteractiveTooltip('toggle-panel', {
            content: {
                name: 'Control Panel',
                description: 'Toggle the visibility of the control panel',
                details: [
                    'Click to collapse or expand the control panel',
                    'Collapsed state gives you a full-screen view',
                    'Expanded state provides access to all controls'
                ]
            },
            showOnHover: true,
            delay: 300
        });

        // Info panel close button
        this.setupInteractiveTooltip('close-info', {
            content: {
                name: 'Close Info Panel',
                description: 'Close the information panel',
                details: [
                    'Hides the detailed information about the selected object',
                    'Click on any celestial object to reopen the info panel'
                ]
            },
            showOnHover: true,
            delay: 300
        });
    }

    /**
     * Setup tooltip for an interactive element
     * @param {string} elementId - ID of the interactive element
     * @param {Object} options - Options including content
     */
    setupInteractiveTooltip(elementId, options = {}) {
        const element = document.getElementById(elementId);
        if (!element) return;

        const showTooltip = (event) => {
            if (!this.config.enabled || !this.config.interactiveElements) return;

            const rect = element.getBoundingClientRect();
            const x = rect.left + rect.width / 2;
            const y = rect.top - 10; // Show above the element

            // Add custom content to tooltip manager
            const contentId = `interactive-${elementId}`;
            this.tooltipManager.addContent(contentId, options.content);

            const tooltipId = this.tooltipManager.show(contentId, 'control', { x, y }, options);
            if (tooltipId) {
                this.activeControlTooltips.set(elementId, tooltipId);
            }
        };

        const hideTooltip = () => {
            const tooltipId = this.activeControlTooltips.get(elementId);
            if (tooltipId) {
                this.tooltipManager.hide(tooltipId);
                this.activeControlTooltips.delete(elementId);
            }
        };

        if (options.showOnHover !== false) {
            element.addEventListener('mouseenter', showTooltip);
            element.addEventListener('mouseleave', hideTooltip);
            this.eventListeners.set(`${elementId}MouseEnter`, showTooltip);
            this.eventListeners.set(`${elementId}MouseLeave`, hideTooltip);
        }
    }

    /**
     * Enable or disable tooltips
     * @param {boolean} enabled - Whether tooltips should be enabled
     */
    setEnabled(enabled) {
        this.config.enabled = enabled;
        this.tooltipManager.setConfig({ enabled });
        
        if (!enabled) {
            this.hideAllTooltips();
        }
    }

    /**
     * Enable or disable specific tooltip types
     * @param {Object} types - Object with boolean properties for each type
     */
    setTooltipTypes(types = {}) {
        this.config = { ...this.config, ...types };
        
        if (types.planetTooltips === false) {
            this.hidePlanetTooltips();
        }
        
        if (types.controlTooltips === false) {
            this.hideControlTooltips();
        }
        
        if (types.conceptTooltips === false) {
            this.hideConceptTooltips();
        }
    }

    /**
     * Hide all tooltips
     */
    hideAllTooltips() {
        this.hidePlanetTooltips();
        this.hideControlTooltips();
        this.hideConceptTooltips();
        this.tooltipManager.hideAllTooltips();
    }

    /**
     * Hide control tooltips
     */
    hideControlTooltips() {
        for (const tooltipId of this.activeControlTooltips.values()) {
            this.tooltipManager.hide(tooltipId);
        }
        this.activeControlTooltips.clear();
    }

    /**
     * Hide concept tooltips
     */
    hideConceptTooltips() {
        for (const tooltipId of this.activeConceptTooltips.values()) {
            this.tooltipManager.hide(tooltipId);
        }
        this.activeConceptTooltips.clear();
    }

    /**
     * Update tooltip configuration
     * @param {Object} config - New configuration
     */
    updateConfig(config) {
        this.config = { ...this.config, ...config };
        this.tooltipManager.setConfig(config.tooltipConfig);
    }

    /**
     * Add custom content for a tooltip
     * @param {string} id - Content ID
     * @param {Object} content - Content object
     */
    addContent(id, content) {
        this.tooltipManager.addContent(id, content);
    }

    /**
     * Remove content for a tooltip
     * @param {string} id - Content ID
     */
    removeContent(id) {
        this.tooltipManager.removeContent(id);
    }

    /**
     * Set tooltip language
     * @param {string} language - Language code
     */
    setLanguage(language) {
        this.tooltipManager.setLanguage(language);
    }

    /**
     * Get tooltip integration status
     * @returns {Object} Status information
     */
    getStatus() {
        return {
            isInitialized: this.isInitialized,
            enabled: this.config.enabled,
            planetTooltips: this.config.planetTooltips,
            controlTooltips: this.config.controlTooltips,
            conceptTooltips: this.config.conceptTooltips,
            interactiveElements: this.config.interactiveElements,
            activePlanetTooltips: this.activePlanetTooltips.size,
            activeControlTooltips: this.activeControlTooltips.size,
            activeConceptTooltips: this.activeConceptTooltips.size,
            tooltipManagerStatus: this.tooltipManager.getStatus()
        };
    }

    /**
     * Register event callback
     * @param {string} event - Event name
     * @param {Function} callback - Callback function
     */
    on(event, callback) {
        this.tooltipManager.on(event, callback);
    }

    /**
     * Remove event callback
     * @param {string} event - Event name
     * @param {Function} callback - Callback function
     */
    off(event, callback) {
        this.tooltipManager.off(event, callback);
    }

    /**
     * Destroy the tooltip integration
     */
    destroy() {
        // Remove all event listeners
        for (const [id, listener] of this.eventListeners) {
            const elementId = id.replace(/(MouseEnter|MouseLeave|Click|MouseMove)/, '');
            const element = document.getElementById(elementId);
            
            if (element) {
                if (id.includes('MouseEnter')) {
                    element.removeEventListener('mouseenter', listener);
                } else if (id.includes('MouseLeave')) {
                    element.removeEventListener('mouseleave', listener);
                } else if (id.includes('Click')) {
                    element.removeEventListener('click', listener);
                } else if (id.includes('MouseMove')) {
                    element.removeEventListener('mousemove', listener);
                }
            }
        }
        this.eventListeners.clear();

        // Clear active tooltips
        this.hideAllTooltips();

        // Destroy tooltip manager
        this.tooltipManager.destroy();

        console.log('Tooltip Integration destroyed');
    }
}