import * as THREE from 'three';

/**
 * Quality Settings for managing visual quality presets and settings
 */
export class QualitySettings {
    /**
     * Create a new quality settings manager
     * @param {Object} config - Configuration object
     */
    constructor(config = {}) {
        // Three.js components
        this.renderer = config.renderer || null;
        this.scene = config.scene || null;
        
        // Current quality settings
        this.currentQuality = config.quality || 'high';
        
        // Quality presets
        this.qualityPresets = {
            low: {
                name: 'Low',
                description: 'Lowest quality, best performance',
                pixelRatio: 1,
                shadowMap: {
                    enabled: false,
                    type: THREE.BasicShadowMap,
                    size: 512
                },
                antialias: false,
                textureFilter: THREE.NearestFilter,
                textureAnisotropy: 1,
                maxLights: 3,
                particleCount: 100,
                atmosphereSamples: 4,
                spaceEnvironmentStars: 1000,
                spaceEnvironmentNebulae: false,
                specialEffectsEnabled: false,
                scaleVisualizationEnabled: true,
                orbitVisualizationSegments: 32,
                renderingResolution: 0.5
            },
            medium: {
                name: 'Medium',
                description: 'Balanced quality and performance',
                pixelRatio: 1,
                shadowMap: {
                    enabled: true,
                    type: THREE.PCFShadowMap,
                    size: 1024
                },
                antialias: true,
                textureFilter: THREE.LinearFilter,
                textureAnisotropy: 2,
                maxLights: 5,
                particleCount: 500,
                atmosphereSamples: 8,
                spaceEnvironmentStars: 5000,
                spaceEnvironmentNebulae: true,
                specialEffectsEnabled: true,
                scaleVisualizationEnabled: true,
                orbitVisualizationSegments: 64,
                renderingResolution: 0.75
            },
            high: {
                name: 'High',
                description: 'High quality, good performance',
                pixelRatio: window.devicePixelRatio || 1,
                shadowMap: {
                    enabled: true,
                    type: THREE.PCFSoftShadowMap,
                    size: 2048
                },
                antialias: true,
                textureFilter: THREE.LinearMipmapLinearFilter,
                textureAnisotropy: 4,
                maxLights: 8,
                particleCount: 2000,
                atmosphereSamples: 16,
                spaceEnvironmentStars: 20000,
                spaceEnvironmentNebulae: true,
                specialEffectsEnabled: true,
                scaleVisualizationEnabled: true,
                orbitVisualizationSegments: 128,
                renderingResolution: 1.0
            },
            ultra: {
                name: 'Ultra',
                description: 'Highest quality, lower performance',
                pixelRatio: Math.min(window.devicePixelRatio || 1, 2),
                shadowMap: {
                    enabled: true,
                    type: THREE.PCFSoftShadowMap,
                    size: 4096
                },
                antialias: true,
                textureFilter: THREE.LinearMipmapLinearFilter,
                textureAnisotropy: 8,
                maxLights: 16,
                particleCount: 10000,
                atmosphereSamples: 32,
                spaceEnvironmentStars: 100000,
                spaceEnvironmentNebulae: true,
                specialEffectsEnabled: true,
                scaleVisualizationEnabled: true,
                orbitVisualizationSegments: 256,
                renderingResolution: 1.5
            }
        };
        
        // Custom settings
        this.customSettings = this.getQualityPreset('high');
        
        // Event callbacks
        this.onQualityChange = null;
    }
    
    /**
     * Initialize the quality settings manager
     * @param {THREE.WebGLRenderer} renderer - Three.js renderer
     * @param {THREE.Scene} scene - Three.js scene
     */
    init(renderer, scene) {
        this.renderer = renderer;
        this.scene = scene;
        
        // Apply current quality settings
        this.applyQuality(this.currentQuality);
    }
    
    /**
     * Get current quality setting
     * @returns {string} Current quality setting
     */
    getCurrentQuality() {
        return this.currentQuality;
    }
    
    /**
     * Get all quality presets
     * @returns {Object} Quality presets
     */
    getQualityPresets() {
        return this.qualityPresets;
    }
    
    /**
     * Get quality preset by name
     * @param {string} qualityName - Quality preset name
     * @returns {Object} Quality preset
     */
    getQualityPreset(qualityName) {
        return this.qualityPresets[qualityName] || this.qualityPresets.high;
    }
    
    /**
     * Set quality preset
     * @param {string} qualityName - Quality preset name
     */
    setQuality(qualityName) {
        if (this.qualityPresets[qualityName]) {
            this.currentQuality = qualityName;
            this.applyQuality(qualityName);
            
            // Trigger quality change event
            if (this.onQualityChange) {
                this.onQualityChange(qualityName, this.qualityPresets[qualityName]);
            }
        }
    }
    
    /**
     * Apply quality preset
     * @param {string} qualityName - Quality preset name
     */
    applyQuality(qualityName) {
        const preset = this.getQualityPreset(qualityName);
        
        // Apply to renderer
        if (this.renderer) {
            // Set pixel ratio
            this.renderer.setPixelRatio(preset.pixelRatio);
            
            // Set shadow map
            this.renderer.shadowMap.enabled = preset.shadowMap.enabled;
            this.renderer.shadowMap.type = preset.shadowMap.type;
            
            // Set shadow map size
            if (this.renderer.shadowMap.enabled) {
                this.renderer.shadowMap.setSize = preset.shadowMap.size;
            }
        }
        
        // Apply to scene
        if (this.scene) {
            // Limit lights
            const lights = [];
            this.scene.traverse(object => {
                if (object.isLight) {
                    lights.push(object);
                }
            });
            
            // Disable excess lights
            lights.forEach((light, index) => {
                if (index >= preset.maxLights) {
                    light.visible = false;
                } else {
                    light.visible = true;
                }
            });
            
            // Apply texture settings to materials
            this.scene.traverse(object => {
                if (object.isMesh && object.material) {
                    const material = object.material;
                    
                    // Set texture filter
                    if (material.map) {
                        material.map.magFilter = preset.textureFilter;
                        material.map.minFilter = preset.textureFilter;
                        material.map.anisotropy = preset.textureAnisotropy;
                        material.map.needsUpdate = true;
                    }
                    
                    // Set other texture maps
                    ['normalMap', 'bumpMap', 'specularMap', 'roughnessMap', 'metalnessMap', 'emissiveMap'].forEach(mapName => {
                        if (material[mapName]) {
                            material[mapName].magFilter = preset.textureFilter;
                            material[mapName].minFilter = preset.textureFilter;
                            material[mapName].anisotropy = preset.textureAnisotropy;
                            material[mapName].needsUpdate = true;
                        }
                    });
                }
            });
        }
        
        // Store custom settings
        this.customSettings = { ...preset };
    }
    
    /**
     * Get custom settings
     * @returns {Object} Custom settings
     */
    getCustomSettings() {
        return this.customSettings;
    }
    
    /**
     * Set custom setting
     * @param {string} settingName - Setting name
     * @param {*} value - Setting value
     */
    setCustomSetting(settingName, value) {
        this.customSettings[settingName] = value;
        this.applyCustomSettings();
    }
    
    /**
     * Apply custom settings
     */
    applyCustomSettings() {
        // Apply pixel ratio
        if (this.renderer && this.customSettings.pixelRatio !== undefined) {
            this.renderer.setPixelRatio(this.customSettings.pixelRatio);
        }
        
        // Apply shadow map settings
        if (this.renderer && this.customSettings.shadowMap) {
            this.renderer.shadowMap.enabled = this.customSettings.shadowMap.enabled;
            this.renderer.shadowMap.type = this.customSettings.shadowMap.type;
            
            if (this.renderer.shadowMap.enabled && this.customSettings.shadowMap.size) {
                this.renderer.shadowMap.setSize = this.customSettings.shadowMap.size;
            }
        }
        
        // Apply texture settings
        if (this.scene) {
            this.scene.traverse(object => {
                if (object.isMesh && object.material) {
                    const material = object.material;
                    
                    // Set texture filter
                    if (material.map && this.customSettings.textureFilter) {
                        material.map.magFilter = this.customSettings.textureFilter;
                        material.map.minFilter = this.customSettings.textureFilter;
                        material.map.anisotropy = this.customSettings.textureAnisotropy || 4;
                        material.map.needsUpdate = true;
                    }
                    
                    // Set other texture maps
                    ['normalMap', 'bumpMap', 'specularMap', 'roughnessMap', 'metalnessMap', 'emissiveMap'].forEach(mapName => {
                        if (material[mapName] && this.customSettings.textureFilter) {
                            material[mapName].magFilter = this.customSettings.textureFilter;
                            material[mapName].minFilter = this.customSettings.textureFilter;
                            material[mapName].anisotropy = this.customSettings.textureAnisotropy || 4;
                            material[mapName].needsUpdate = true;
                        }
                    });
                }
            });
        }
        
        // Apply light limit
        if (this.scene && this.customSettings.maxLights !== undefined) {
            const lights = [];
            this.scene.traverse(object => {
                if (object.isLight) {
                    lights.push(object);
                }
            });
            
            // Disable excess lights
            lights.forEach((light, index) => {
                if (index >= this.customSettings.maxLights) {
                    light.visible = false;
                } else {
                    light.visible = true;
                }
            });
        }
    }
    
    /**
     * Reset to preset
     * @param {string} qualityName - Quality preset name
     */
    resetToPreset(qualityName) {
        this.setQuality(qualityName);
    }
    
    /**
     * Save custom settings to preset
     * @param {string} presetName - Preset name
     */
    saveAsPreset(presetName) {
        this.qualityPresets[presetName] = { ...this.customSettings };
    }
    
    /**
     * Delete custom preset
     * @param {string} presetName - Preset name
     */
    deletePreset(presetName) {
        if (presetName !== 'low' && presetName !== 'medium' && presetName !== 'high' && presetName !== 'ultra') {
            delete this.qualityPresets[presetName];
        }
    }
    
    /**
     * Export settings to JSON
     * @returns {string} JSON string
     */
    exportSettings() {
        const settings = {
            currentQuality: this.currentQuality,
            customSettings: this.customSettings,
            qualityPresets: this.qualityPresets
        };
        
        return JSON.stringify(settings, null, 2);
    }
    
    /**
     * Import settings from JSON
     * @param {string} jsonString - JSON string
     */
    importSettings(jsonString) {
        try {
            const settings = JSON.parse(jsonString);
            
            // Import current quality
            if (settings.currentQuality) {
                this.currentQuality = settings.currentQuality;
            }
            
            // Import custom settings
            if (settings.customSettings) {
                this.customSettings = settings.customSettings;
                this.applyCustomSettings();
            }
            
            // Import quality presets
            if (settings.qualityPresets) {
                // Keep default presets
                const defaultPresets = ['low', 'medium', 'high', 'ultra'];
                
                // Clear non-default presets
                Object.keys(this.qualityPresets).forEach(presetName => {
                    if (!defaultPresets.includes(presetName)) {
                        delete this.qualityPresets[presetName];
                    }
                });
                
                // Add imported presets
                Object.keys(settings.qualityPresets).forEach(presetName => {
                    this.qualityPresets[presetName] = settings.qualityPresets[presetName];
                });
            }
            
            // Trigger quality change event
            if (this.onQualityChange) {
                this.onQualityChange(this.currentQuality, this.customSettings);
            }
        } catch (error) {
            console.error('Failed to import quality settings:', error);
        }
    }
    
    /**
     * Set quality change callback
     * @param {Function} callback - Callback function
     */
    setQualityChangeCallback(callback) {
        this.onQualityChange = callback;
    }
    
    /**
     * Get recommended quality based on system performance
     * @returns {string} Recommended quality preset name
     */
    getRecommendedQuality() {
        // Simple performance detection based on device and renderer capabilities
        if (!this.renderer) {
            return 'medium';
        }
        
        const capabilities = this.renderer.capabilities;
        const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
        
        // Check for WebGL 2 support
        if (!capabilities.isWebGL2) {
            return isMobile ? 'low' : 'medium';
        }
        
        // Check for floating point texture support
        if (!capabilities.floatFragmentTextures) {
            return isMobile ? 'low' : 'medium';
        }
        
        // Check for max texture size
        if (capabilities.maxTextureSize < 4096) {
            return isMobile ? 'low' : 'medium';
        }
        
        // Check device memory
        if (navigator.deviceMemory) {
            if (navigator.deviceMemory < 4) {
                return isMobile ? 'low' : 'medium';
            } else if (navigator.deviceMemory < 8) {
                return isMobile ? 'medium' : 'high';
            }
        }
        
        // Check hardware concurrency
        if (navigator.hardwareConcurrency) {
            if (navigator.hardwareConcurrency < 4) {
                return isMobile ? 'low' : 'medium';
            } else if (navigator.hardwareConcurrency < 8) {
                return isMobile ? 'medium' : 'high';
            }
        }
        
        // Default to high for desktop, medium for mobile
        return isMobile ? 'medium' : 'high';
    }
    
    /**
     * Auto-detect and apply recommended quality
     */
    autoDetectQuality() {
        const recommendedQuality = this.getRecommendedQuality();
        this.setQuality(recommendedQuality);
        return recommendedQuality;
    }
    
    /**
     * Get performance metrics
     * @returns {Object} Performance metrics
     */
    getPerformanceMetrics() {
        if (!this.renderer) {
            return {};
        }
        
        const info = this.renderer.info;
        
        return {
            memory: {
                geometries: info.memory.geometries,
                textures: info.memory.textures
            },
            render: {
                calls: info.render.calls,
                triangles: info.render.triangles,
                lines: info.render.lines,
                points: info.render.points
            },
            frame: {
                timestamp: performance.now()
            }
        };
    }
    
    /**
     * Optimize for performance
     */
    optimizeForPerformance() {
        // Temporarily reduce quality for better performance
        const currentQuality = this.currentQuality;
        
        if (currentQuality === 'ultra') {
            this.setQuality('high');
        } else if (currentQuality === 'high') {
            this.setQuality('medium');
        } else if (currentQuality === 'medium') {
            this.setQuality('low');
        }
        
        return this.currentQuality;
    }
    
    /**
     * Optimize for quality
     */
    optimizeForQuality() {
        // Temporarily increase quality for better visuals
        const currentQuality = this.currentQuality;
        
        if (currentQuality === 'low') {
            this.setQuality('medium');
        } else if (currentQuality === 'medium') {
            this.setQuality('high');
        } else if (currentQuality === 'high') {
            this.setQuality('ultra');
        }
        
        return this.currentQuality;
    }
    
    /**
     * Dispose of all resources and clean up
     */
    dispose() {
        // Clear references
        this.renderer = null;
        this.scene = null;
        this.onQualityChange = null;
    }
}