/**
 * Rendering module for the space simulation
 * Handles all visual aspects of the simulation including textures, materials, geometries, and rendering
 */

// Export rendering managers
export { TextureManager } from './TextureManager.js';
export { MaterialManager } from './MaterialManager.js';
export { GeometryManager } from './GeometryManager.js';
export { RenderingManager } from './RenderingManager.js';
export { LightingManager } from './LightingManager.js';
export { OrbitVisualization } from './OrbitVisualization.js';
export { AtmosphereEffects } from './AtmosphereEffects.js';
export { SpaceEnvironment } from './SpaceEnvironment.js';
export { SpecialEffects } from './SpecialEffects.js';
export { ScaleVisualization } from './ScaleVisualization.js';
export { QualitySettings } from './QualitySettings.js';

/**
 * Rendering module configuration
 * @typedef {Object} RenderingConfig
 * @property {string} quality - Rendering quality ('low', 'medium', 'high', 'ultra')
 * @property {boolean} enableShadows - Enable shadow rendering
 * @property {boolean} enableAtmospheres - Enable atmosphere effects
 * @property {boolean} enableClouds - Enable cloud rendering
 * @property {boolean} enableRings - Enable ring rendering
 * @property {Object} textureConfig - Texture manager configuration
 * @property {Object} lightingConfig - Lighting manager configuration
 * @property {THREE.WebGLRenderer} renderer - Three.js renderer instance
 * @property {THREE.Scene} scene - Three.js scene instance
 * @property {THREE.Camera} camera - Three.js camera instance
 * @property {Object} performanceMonitor - Performance monitor instance
 * @property {Object} eventSystem - Event system instance
 */

/**
 * Create a complete rendering system
 * @param {RenderingConfig} config - Configuration object
 * @returns {RenderingManager} The rendering manager instance
 */
export function createRenderingSystem(config = {}) {
    // Create rendering manager with configuration
    const renderingManager = new RenderingManager(config);
    
    // Initialize with Three.js components if provided
    if (config.renderer && config.scene && config.camera) {
        renderingManager.init(config.renderer, config.scene, config.camera);
    }
    
    return renderingManager;
}

/**
 * Get default rendering configuration
 * @returns {RenderingConfig} Default configuration
 */
export function getDefaultRenderingConfig() {
    return {
        quality: 'high',
        enableShadows: true,
        enableAtmospheres: true,
        enableClouds: true,
        enableRings: true,
        textureConfig: {
            quality: 'high',
            maxAnisotropy: 16
        },
        lightingConfig: {
            quality: 'high',
            enableShadows: true,
            shadowMapSize: 2048
        }
    };
}

/**
 * Get quality presets for rendering
 * @returns {Object} Quality presets
 */
export function getQualityPresets() {
    return {
        low: {
            quality: 'low',
            enableShadows: false,
            enableAtmospheres: false,
            enableClouds: false,
            enableRings: false,
            textureConfig: {
                quality: 'low',
                maxAnisotropy: 4
            },
            lightingConfig: {
                quality: 'low',
                enableShadows: false,
                shadowMapSize: 512
            }
        },
        medium: {
            quality: 'medium',
            enableShadows: true,
            enableAtmospheres: true,
            enableClouds: true,
            enableRings: true,
            textureConfig: {
                quality: 'medium',
                maxAnisotropy: 8
            },
            lightingConfig: {
                quality: 'medium',
                enableShadows: true,
                shadowMapSize: 1024
            }
        },
        high: {
            quality: 'high',
            enableShadows: true,
            enableAtmospheres: true,
            enableClouds: true,
            enableRings: true,
            textureConfig: {
                quality: 'high',
                maxAnisotropy: 16
            },
            lightingConfig: {
                quality: 'high',
                enableShadows: true,
                shadowMapSize: 2048
            }
        },
        ultra: {
            quality: 'ultra',
            enableShadows: true,
            enableAtmospheres: true,
            enableClouds: true,
            enableRings: true,
            textureConfig: {
                quality: 'ultra',
                maxAnisotropy: 16
            },
            lightingConfig: {
                quality: 'ultra',
                enableShadows: true,
                shadowMapSize: 4096
            }
        }
    };
}

/**
 * Apply quality preset to rendering configuration
 * @param {RenderingConfig} config - Configuration to modify
 * @param {string} presetName - Name of the preset ('low', 'medium', 'high', 'ultra')
 * @returns {RenderingConfig} Modified configuration
 */
export function applyQualityPreset(config, presetName) {
    const presets = getQualityPresets();
    const preset = presets[presetName];
    
    if (!preset) {
        console.warn(`Unknown quality preset: ${presetName}`);
        return config;
    }
    
    return {
        ...config,
        ...preset,
        textureConfig: {
            ...config.textureConfig,
            ...preset.textureConfig
        }
    };
}