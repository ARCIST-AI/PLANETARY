import * as THREE from 'three';

/**
 * Lighting Manager for creating and managing lighting in the space simulation
 */
export class LightingManager {
    /**
     * Create a new lighting manager
     * @param {Object} config - Configuration object
     */
    constructor(config = {}) {
        // Three.js components
        this.scene = config.scene || null;
        this.renderer = config.renderer || null;
        
        // Lighting quality settings
        this.quality = config.quality || 'high';
        this.enableShadows = config.enableShadows !== undefined ? config.enableShadows : true;
        this.shadowMapSize = config.shadowMapSize || 2048;
        
        // Lighting registry
        this.lights = new Map();
        
        // Default lighting properties
        this.defaultProperties = {
            ambient: {
                color: 0x000000,
                intensity: 0.0
            },
            directional: {
                color: 0xffffff,
                intensity: 1.0,
                castShadow: true,
                shadowMapWidth: 2048,
                shadowMapHeight: 2048,
                shadowCameraNear: 0.5,
                shadowCameraFar: 500,
                shadowCameraLeft: -100,
                shadowCameraRight: 100,
                shadowCameraTop: 100,
                shadowCameraBottom: -100
            },
            point: {
                color: 0xffffff,
                intensity: 1.0,
                distance: 0,
                decay: 1,
                castShadow: true,
                shadowMapWidth: 1024,
                shadowMapHeight: 1024
            },
            spot: {
                color: 0xffffff,
                intensity: 1.0,
                distance: 0,
                angle: Math.PI / 3,
                penumbra: 0,
                decay: 1,
                castShadow: true,
                shadowMapWidth: 1024,
                shadowMapHeight: 1024
            }
        };
        
        // Lighting presets
        this.presets = {
            realistic: {
                ambientIntensity: 0.0,
                sunIntensity: 1.5,
                enableShadows: true,
                shadowQuality: 'high'
            },
            cinematic: {
                ambientIntensity: 0.1,
                sunIntensity: 2.0,
                enableShadows: true,
                shadowQuality: 'ultra'
            },
            performance: {
                ambientIntensity: 0.2,
                sunIntensity: 1.0,
                enableShadows: false,
                shadowQuality: 'low'
            }
        };
    }
    
    /**
     * Initialize the lighting manager
     * @param {THREE.Scene} scene - Three.js scene
     * @param {THREE.WebGLRenderer} renderer - Three.js renderer
     */
    init(scene, renderer) {
        this.scene = scene;
        this.renderer = renderer;
        
        // Set up renderer shadow settings
        this.setupRendererShadows();
        
        // Create default lighting
        this.createDefaultLighting();
    }
    
    /**
     * Set up renderer shadow settings
     */
    setupRendererShadows() {
        if (!this.renderer) return;
        
        // Enable shadows
        this.renderer.shadowMap.enabled = this.enableShadows;
        
        // Set shadow map type based on quality
        if (this.quality === 'ultra') {
            this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        } else {
            this.renderer.shadowMap.type = THREE.PCFShadowMap;
        }
    }
    
    /**
     * Create default lighting for the scene
     */
    createDefaultLighting() {
        if (!this.scene) return;
        
        // Create ambient light
        this.createAmbientLight('default_ambient', {
            color: this.defaultProperties.ambient.color,
            intensity: this.defaultProperties.ambient.intensity
        });
        
        // Create directional light (sun)
        this.createDirectionalLight('sun', {
            color: this.defaultProperties.directional.color,
            intensity: this.defaultProperties.directional.intensity,
            position: new THREE.Vector3(100, 100, 50),
            castShadow: this.defaultProperties.directional.castShadow
        });
    }
    
    /**
     * Get lighting quality setting
     * @returns {string} Quality setting
     */
    getQuality() {
        return this.quality;
    }
    
    /**
     * Set lighting quality setting
     * @param {string} quality - Quality setting ('low', 'medium', 'high', 'ultra')
     */
    setQuality(quality) {
        const validQualities = ['low', 'medium', 'high', 'ultra'];
        if (validQualities.includes(quality)) {
            this.quality = quality;
            
            // Update shadow map size based on quality
            switch (quality) {
                case 'low':
                    this.shadowMapSize = 512;
                    break;
                case 'medium':
                    this.shadowMapSize = 1024;
                    break;
                case 'high':
                    this.shadowMapSize = 2048;
                    break;
                case 'ultra':
                    this.shadowMapSize = 4096;
                    break;
            }
            
            // Update renderer settings
            this.setupRendererShadows();
            
            // Update existing lights
            this.updateLightsQuality();
        }
    }
    
    /**
     * Update quality of existing lights
     */
    updateLightsQuality() {
        // Update all lights
        this.lights.forEach((light, lightId) => {
            if (light.castShadow) {
                // Update shadow map size
                if (light.shadow) {
                    light.shadow.mapSize.width = this.shadowMapSize;
                    light.shadow.mapSize.height = this.shadowMapSize;
                    
                    // Update shadow camera for directional lights
                    if (light instanceof THREE.DirectionalLight) {
                        const shadowCamera = light.shadow.camera;
                        const range = this.getShadowCameraRange();
                        shadowCamera.left = -range;
                        shadowCamera.right = range;
                        shadowCamera.top = range;
                        shadowCamera.bottom = -range;
                        shadowCamera.updateProjectionMatrix();
                    }
                }
            }
        });
    }
    
    /**
     * Get shadow camera range based on quality
     * @returns {number} Shadow camera range
     */
    getShadowCameraRange() {
        switch (this.quality) {
            case 'low': return 50;
            case 'medium': return 100;
            case 'high': return 200;
            case 'ultra': return 400;
            default: return 100;
        }
    }
    
    /**
     * Create an ambient light
     * @param {string} lightId - Light ID
     * @param {Object} options - Light options
     * @returns {THREE.AmbientLight} Created light
     */
    createAmbientLight(lightId, options = {}) {
        // Check if light already exists
        if (this.lights.has(lightId)) {
            return this.lights.get(lightId);
        }
        
        // Merge with default properties
        const properties = {
            ...this.defaultProperties.ambient,
            ...options
        };
        
        // Create light
        const light = new THREE.AmbientLight(properties.color, properties.intensity);
        light.name = lightId;
        
        // Add to scene
        if (this.scene) {
            this.scene.add(light);
        }
        
        // Register light
        this.lights.set(lightId, light);
        
        return light;
    }
    
    /**
     * Create a directional light
     * @param {string} lightId - Light ID
     * @param {Object} options - Light options
     * @returns {THREE.DirectionalLight} Created light
     */
    createDirectionalLight(lightId, options = {}) {
        // Check if light already exists
        if (this.lights.has(lightId)) {
            return this.lights.get(lightId);
        }
        
        // Merge with default properties
        const properties = {
            ...this.defaultProperties.directional,
            ...options
        };
        
        // Create light
        const light = new THREE.DirectionalLight(properties.color, properties.intensity);
        light.name = lightId;
        light.castShadow = properties.castShadow;
        
        // Set position if provided
        if (properties.position) {
            light.position.copy(properties.position);
        }
        
        // Set up shadow properties
        if (properties.castShadow) {
            light.shadow.mapSize.width = properties.shadowMapWidth || this.shadowMapSize;
            light.shadow.mapSize.height = properties.shadowMapHeight || this.shadowMapSize;
            light.shadow.camera.near = properties.shadowCameraNear;
            light.shadow.camera.far = properties.shadowCameraFar;
            light.shadow.camera.left = properties.shadowCameraLeft;
            light.shadow.camera.right = properties.shadowCameraRight;
            light.shadow.camera.top = properties.shadowCameraTop;
            light.shadow.camera.bottom = properties.shadowCameraBottom;
            light.shadow.camera.updateProjectionMatrix();
        }
        
        // Add to scene
        if (this.scene) {
            this.scene.add(light);
            
            // Add helper for debugging
            if (options.showHelper) {
                const helper = new THREE.DirectionalLightHelper(light, 5);
                helper.name = `${lightId}_helper`;
                this.scene.add(helper);
            }
        }
        
        // Register light
        this.lights.set(lightId, light);
        
        return light;
    }
    
    /**
     * Create a point light
     * @param {string} lightId - Light ID
     * @param {Object} options - Light options
     * @returns {THREE.PointLight} Created light
     */
    createPointLight(lightId, options = {}) {
        // Check if light already exists
        if (this.lights.has(lightId)) {
            return this.lights.get(lightId);
        }
        
        // Merge with default properties
        const properties = {
            ...this.defaultProperties.point,
            ...options
        };
        
        // Create light
        const light = new THREE.PointLight(
            properties.color,
            properties.intensity,
            properties.distance,
            properties.decay
        );
        light.name = lightId;
        light.castShadow = properties.castShadow;
        
        // Set position if provided
        if (properties.position) {
            light.position.copy(properties.position);
        }
        
        // Set up shadow properties
        if (properties.castShadow) {
            light.shadow.mapSize.width = properties.shadowMapWidth || this.shadowMapSize;
            light.shadow.mapSize.height = properties.shadowMapHeight || this.shadowMapSize;
            light.shadow.camera.near = 0.5;
            light.shadow.camera.far = 500;
        }
        
        // Add to scene
        if (this.scene) {
            this.scene.add(light);
            
            // Add helper for debugging
            if (options.showHelper) {
                const helper = new THREE.PointLightHelper(light, 1);
                helper.name = `${lightId}_helper`;
                this.scene.add(helper);
            }
        }
        
        // Register light
        this.lights.set(lightId, light);
        
        return light;
    }
    
    /**
     * Create a spot light
     * @param {string} lightId - Light ID
     * @param {Object} options - Light options
     * @returns {THREE.SpotLight} Created light
     */
    createSpotLight(lightId, options = {}) {
        // Check if light already exists
        if (this.lights.has(lightId)) {
            return this.lights.get(lightId);
        }
        
        // Merge with default properties
        const properties = {
            ...this.defaultProperties.spot,
            ...options
        };
        
        // Create light
        const light = new THREE.SpotLight(
            properties.color,
            properties.intensity,
            properties.distance,
            properties.angle,
            properties.penumbra,
            properties.decay
        );
        light.name = lightId;
        light.castShadow = properties.castShadow;
        
        // Set position if provided
        if (properties.position) {
            light.position.copy(properties.position);
        }
        
        // Set target if provided
        if (properties.target) {
            light.target = properties.target;
        }
        
        // Set up shadow properties
        if (properties.castShadow) {
            light.shadow.mapSize.width = properties.shadowMapWidth || this.shadowMapSize;
            light.shadow.mapSize.height = properties.shadowMapHeight || this.shadowMapSize;
            light.shadow.camera.near = 0.5;
            light.shadow.camera.far = 500;
            light.shadow.camera.fov = 30;
            light.shadow.camera.updateProjectionMatrix();
        }
        
        // Add to scene
        if (this.scene) {
            this.scene.add(light);
            
            // Add helper for debugging
            if (options.showHelper) {
                const helper = new THREE.SpotLightHelper(light);
                helper.name = `${lightId}_helper`;
                this.scene.add(helper);
            }
        }
        
        // Register light
        this.lights.set(lightId, light);
        
        return light;
    }
    
    /**
     * Create a hemisphere light
     * @param {string} lightId - Light ID
     * @param {Object} options - Light options
     * @returns {THREE.HemisphereLight} Created light
     */
    createHemisphereLight(lightId, options = {}) {
        // Check if light already exists
        if (this.lights.has(lightId)) {
            return this.lights.get(lightId);
        }
        
        // Create light
        const light = new THREE.HemisphereLight(
            options.skyColor || 0xffffbb,
            options.groundColor || 0x080820,
            options.intensity || 0.7
        );
        light.name = lightId;
        
        // Set position if provided
        if (options.position) {
            light.position.copy(options.position);
        }
        
        // Add to scene
        if (this.scene) {
            this.scene.add(light);
        }
        
        // Register light
        this.lights.set(lightId, light);
        
        return light;
    }
    
    /**
     * Create a rect area light
     * @param {string} lightId - Light ID
     * @param {Object} options - Light options
     * @returns {THREE.RectAreaLight} Created light
     */
    createRectAreaLight(lightId, options = {}) {
        // Check if light already exists
        if (this.lights.has(lightId)) {
            return this.lights.get(lightId);
        }
        
        // Create light
        const light = new THREE.RectAreaLight(
            options.color || 0xffffff,
            options.intensity || 1.0,
            options.width || 10,
            options.height || 10
        );
        light.name = lightId;
        
        // Set position if provided
        if (options.position) {
            light.position.copy(options.position);
        }
        
        // Set rotation if provided
        if (options.rotation) {
            light.rotation.copy(options.rotation);
        }
        
        // Add to scene
        if (this.scene) {
            this.scene.add(light);
        }
        
        // Register light
        this.lights.set(lightId, light);
        
        return light;
    }
    
    /**
     * Create lighting for a star
     * @param {string} starId - Star ID
     * @param {Object} starData - Star data
     * @param {Object} options - Lighting options
     * @returns {THREE.PointLight} Created light
     */
    createStarLight(starId, starData, options = {}) {
        const lightId = `star_light_${starId}`;
        
        // Check if light already exists
        if (this.lights.has(lightId)) {
            return this.lights.get(lightId);
        }
        
        // Calculate light intensity based on star data
        const intensity = options.intensity || (starData.luminosity || 1.0) * 2.0;
        const distance = options.distance || 0;
        const decay = options.decay || 2.0;
        
        // Create light
        const light = this.createPointLight(lightId, {
            color: starData.color || 0xffffff,
            intensity: intensity,
            distance: distance,
            decay: decay,
            position: options.position || new THREE.Vector3(0, 0, 0),
            castShadow: options.castShadow !== undefined ? options.castShadow : true
        });
        
        return light;
    }
    
    /**
     * Create lighting for a spacecraft
     * @param {string} spacecraftId - Spacecraft ID
     * @param {Object} options - Lighting options
     * @returns {Object} Object containing created lights
     */
    createSpacecraftLighting(spacecraftId, options = {}) {
        const lights = {};
        
        // Create headlight
        if (options.headlight) {
            lights.headlight = this.createSpotLight(`spacecraft_headlight_${spacecraftId}`, {
                color: 0xffffff,
                intensity: 1.0,
                distance: 100,
                angle: Math.PI / 6,
                penumbra: 0.1,
                position: new THREE.Vector3(0, 0, 2),
                castShadow: false
            });
        }
        
        // Create navigation lights
        if (options.navLights) {
            // Red light (left)
            lights.redLight = this.createPointLight(`spacecraft_red_light_${spacecraftId}`, {
                color: 0xff0000,
                intensity: 0.5,
                distance: 10,
                position: new THREE.Vector3(-1, 0, 0),
                castShadow: false
            });
            
            // Green light (right)
            lights.greenLight = this.createPointLight(`spacecraft_green_light_${spacecraftId}`, {
                color: 0x00ff00,
                intensity: 0.5,
                distance: 10,
                position: new THREE.Vector3(1, 0, 0),
                castShadow: false
            });
        }
        
        return lights;
    }
    
    /**
     * Get light by ID
     * @param {string} lightId - Light ID
     * @returns {THREE.Light} Light or null if not found
     */
    getLight(lightId) {
        return this.lights.get(lightId) || null;
    }
    
    /**
     * Update light properties
     * @param {string} lightId - Light ID
     * @param {Object} properties - Properties to update
     */
    updateLight(lightId, properties = {}) {
        const light = this.lights.get(lightId);
        if (!light) return;
        
        // Update common properties
        if (properties.color !== undefined) light.color.setHex(properties.color);
        if (properties.intensity !== undefined) light.intensity = properties.intensity;
        if (properties.position !== undefined) light.position.copy(properties.position);
        
        // Update specific light types
        if (light instanceof THREE.PointLight) {
            if (properties.distance !== undefined) light.distance = properties.distance;
            if (properties.decay !== undefined) light.decay = properties.decay;
        } else if (light instanceof THREE.SpotLight) {
            if (properties.distance !== undefined) light.distance = properties.distance;
            if (properties.angle !== undefined) light.angle = properties.angle;
            if (properties.penumbra !== undefined) light.penumbra = properties.penumbra;
            if (properties.decay !== undefined) light.decay = properties.decay;
            if (properties.target !== undefined) light.target = properties.target;
        } else if (light instanceof THREE.DirectionalLight) {
            if (properties.target !== undefined) light.target = properties.target;
        }
        
        // Update shadow properties
        if (properties.castShadow !== undefined) light.castShadow = properties.castShadow;
        if (light.shadow && properties.shadowMapWidth !== undefined) {
            light.shadow.mapSize.width = properties.shadowMapWidth;
            light.shadow.mapSize.height = properties.shadowMapHeight || properties.shadowMapWidth;
        }
    }
    
    /**
     * Remove light by ID
     * @param {string} lightId - Light ID
     */
    removeLight(lightId) {
        const light = this.lights.get(lightId);
        if (!light) return;
        
        // Remove from scene
        if (this.scene && light.parent === this.scene) {
            this.scene.remove(light);
            
            // Remove helper if exists
            const helper = this.scene.getObjectByName(`${lightId}_helper`);
            if (helper) {
                this.scene.remove(helper);
            }
        }
        
        // Dispose of resources
        if (light.shadow && light.shadow.map) {
            light.shadow.map.dispose();
        }
        
        // Remove from registry
        this.lights.delete(lightId);
    }
    
    /**
     * Apply lighting preset
     * @param {string} presetName - Name of the preset ('realistic', 'cinematic', 'performance')
     */
    applyPreset(presetName) {
        const preset = this.presets[presetName];
        if (!preset) {
            console.warn(`Unknown lighting preset: ${presetName}`);
            return;
        }
        
        // Update settings
        this.enableShadows = preset.enableShadows;
        this.setQuality(preset.shadowQuality);
        
        // Update ambient light
        const ambientLight = this.getLight('default_ambient');
        if (ambientLight) {
            ambientLight.intensity = preset.ambientIntensity;
        }
        
        // Update sun light
        const sunLight = this.getLight('sun');
        if (sunLight) {
            sunLight.intensity = preset.sunIntensity;
            sunLight.castShadow = preset.enableShadows;
        }
    }
    
    /**
     * Toggle shadows
     * @param {boolean} enabled - Whether shadows are enabled
     */
    toggleShadows(enabled) {
        this.enableShadows = enabled;
        
        // Update renderer
        if (this.renderer) {
            this.renderer.shadowMap.enabled = enabled;
        }
        
        // Update all lights
        this.lights.forEach(light => {
            if (light.castShadow !== undefined) {
                light.castShadow = enabled;
            }
        });
    }
    
    /**
     * Clear all lights
     */
    clearAllLights() {
        // Create a copy of the keys to avoid modification during iteration
        const lightIds = Array.from(this.lights.keys());
        
        // Remove each light
        lightIds.forEach(lightId => {
            this.removeLight(lightId);
        });
    }
    
    /**
     * Dispose of all resources and clean up
     */
    dispose() {
        // Clear all lights
        this.clearAllLights();
        
        // Clear registry
        this.lights.clear();
    }
}