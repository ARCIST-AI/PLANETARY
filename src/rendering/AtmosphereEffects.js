import * as THREE from 'three';
import { MathUtils } from '../utils/index.js';

/**
 * Atmosphere Effects for creating and managing atmospheric visualizations
 */
export class AtmosphereEffects {
    /**
     * Create a new atmosphere effects manager
     * @param {Object} config - Configuration object
     */
    constructor(config = {}) {
        // Three.js components
        this.scene = config.scene || null;
        this.renderer = config.renderer || null;
        this.camera = config.camera || null;
        
        // Effect settings
        this.quality = config.quality || 'high';
        this.enableAtmospheres = config.enableAtmospheres !== undefined ? config.enableAtmospheres : true;
        
        // Atmosphere registry
        this.atmospheres = new Map();
        
        // Detail levels based on quality
        this.detailLevels = {
            low: {
                segments: 32,
                layers: 2
            },
            medium: {
                segments: 64,
                layers: 3
            },
            high: {
                segments: 128,
                layers: 4
            },
            ultra: {
                segments: 256,
                layers: 5
            }
        };
        
        // Default atmosphere properties
        this.defaultProperties = {
            earth: {
                color: 0x4444ff,
                opacity: 0.3,
                density: 1.0,
                scale: 1.015,
                glowColor: 0x88aaff,
                glowIntensity: 0.5,
                scatterColor: 0x88ccff,
                scatterIntensity: 0.8
            },
            mars: {
                color: 0xff8844,
                opacity: 0.2,
                density: 0.5,
                scale: 1.008,
                glowColor: 0xffaa66,
                glowIntensity: 0.3,
                scatterColor: 0xffcc88,
                scatterIntensity: 0.5
            },
            venus: {
                color: 0xffdd88,
                opacity: 0.4,
                density: 1.5,
                scale: 1.02,
                glowColor: 0xffffaa,
                glowIntensity: 0.7,
                scatterColor: 0xffffcc,
                scatterIntensity: 1.0
            },
            jupiter: {
                color: 0xaaffcc,
                opacity: 0.2,
                density: 0.8,
                scale: 1.05,
                glowColor: 0xccffdd,
                glowIntensity: 0.4,
                scatterColor: 0xddffee,
                scatterIntensity: 0.6
            },
            titan: {
                color: 0xffaa66,
                opacity: 0.5,
                density: 1.2,
                scale: 1.03,
                glowColor: 0xffcc88,
                glowIntensity: 0.6,
                scatterColor: 0xffddaa,
                scatterIntensity: 0.8
            }
        };
    }
    
    /**
     * Initialize the atmosphere effects manager
     * @param {THREE.Scene} scene - Three.js scene
     * @param {THREE.WebGLRenderer} renderer - Three.js renderer
     * @param {THREE.Camera} camera - Three.js camera
     */
    init(scene, renderer, camera) {
        this.scene = scene;
        this.renderer = renderer;
        this.camera = camera;
        
        // Set up renderer for transparency
        if (this.renderer) {
            this.renderer.autoClear = false;
            this.renderer.setClearColor(0x000000, 0);
        }
    }
    
    /**
     * Get effects quality setting
     * @returns {string} Quality setting
     */
    getQuality() {
        return this.quality;
    }
    
    /**
     * Set effects quality setting
     * @param {string} quality - Quality setting ('low', 'medium', 'high', 'ultra')
     */
    setQuality(quality) {
        const validQualities = ['low', 'medium', 'high', 'ultra'];
        if (validQualities.includes(quality)) {
            this.quality = quality;
            
            // Update existing atmospheres
            this.updateAtmosphereQuality();
        }
    }
    
    /**
     * Get detail level for current quality
     * @returns {Object} Detail level object
     */
    getDetailLevel() {
        return this.detailLevels[this.quality];
    }
    
    /**
     * Update quality of existing atmospheres
     */
    updateAtmosphereQuality() {
        // Update all atmospheres
        this.atmospheres.forEach((atmosphereData, atmosphereId) => {
            this.updateAtmosphere(atmosphereId, atmosphereData.options);
        });
    }
    
    /**
     * Create an atmosphere for a celestial body
     * @param {string} atmosphereId - Atmosphere ID
     * @param {Object} bodyData - Celestial body data
     * @param {Object} options - Atmosphere options
     * @returns {THREE.Object3D} Created atmosphere
     */
    createAtmosphere(atmosphereId, bodyData, options = {}) {
        // Check if atmosphere already exists
        if (this.atmospheres.has(atmosphereId)) {
            return this.atmospheres.get(atmosphereId).object;
        }
        
        // Get atmosphere properties based on body type
        const bodyType = options.bodyType || 'earth';
        const properties = {
            ...this.defaultProperties[bodyType],
            ...options
        };
        
        // Get detail level
        const detail = this.getDetailLevel();
        
        // Create atmosphere container
        const atmosphereContainer = new THREE.Group();
        atmosphereContainer.name = atmosphereId;
        
        // Create atmosphere layers
        const layers = [];
        for (let i = 0; i < detail.layers; i++) {
            const layerScale = properties.scale + (i * 0.005);
            const layerOpacity = properties.opacity * (1 - i / detail.layers);
            
            const layer = this.createAtmosphereLayer(
                bodyData.radius * layerScale,
                detail.segments,
                {
                    color: properties.color,
                    opacity: layerOpacity,
                    density: properties.density
                }
            );
            
            layer.name = `${atmosphereId}_layer_${i}`;
            atmosphereContainer.add(layer);
            layers.push(layer);
        }
        
        // Create glow effect for high quality
        if (this.quality === 'high' || this.quality === 'ultra') {
            const glow = this.createAtmosphereGlow(
                bodyData.radius * properties.scale * 1.1,
                detail.segments,
                {
                    color: properties.glowColor,
                    intensity: properties.glowIntensity
                }
            );
            
            glow.name = `${atmosphereId}_glow`;
            atmosphereContainer.add(glow);
        }
        
        // Create scatter effect for ultra quality
        if (this.quality === 'ultra') {
            const scatter = this.createAtmosphereScatter(
                bodyData.radius * properties.scale * 1.2,
                detail.segments,
                {
                    color: properties.scatterColor,
                    intensity: properties.scatterIntensity
                }
            );
            
            scatter.name = `${atmosphereId}_scatter`;
            atmosphereContainer.add(scatter);
        }
        
        // Add to scene
        if (this.scene) {
            this.scene.add(atmosphereContainer);
        }
        
        // Register atmosphere
        this.atmospheres.set(atmosphereId, {
            object: atmosphereContainer,
            bodyData: bodyData,
            options: properties,
            layers: layers
        });
        
        return atmosphereContainer;
    }
    
    /**
     * Create an atmosphere layer
     * @param {number} radius - Layer radius
     * @param {number} segments - Number of segments
     * @param {Object} options - Layer options
     * @returns {THREE.Mesh} Created layer
     */
    createAtmosphereLayer(radius, segments, options = {}) {
        // Create sphere geometry
        const geometry = new THREE.SphereGeometry(radius, segments, segments / 2);
        
        // Create shader material
        const material = new THREE.ShaderMaterial({
            uniforms: {
                color: { value: new THREE.Color(options.color || 0x4444ff) },
                opacity: { value: options.opacity || 0.3 },
                density: { value: options.density || 1.0 },
                time: { value: 0 }
            },
            vertexShader: `
                varying vec3 vNormal;
                varying vec3 vPosition;
                
                void main() {
                    vNormal = normalize(normalMatrix * normal);
                    vPosition = position;
                    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                }
            `,
            fragmentShader: `
                uniform vec3 color;
                uniform float opacity;
                uniform float density;
                uniform float time;
                
                varying vec3 vNormal;
                varying vec3 vPosition;
                
                void main() {
                    // Calculate rim lighting effect
                    vec3 viewDirection = normalize(cameraPosition - vPosition);
                    float rim = 1.0 - max(0.0, dot(viewDirection, vNormal));
                    rim = pow(rim, density * 2.0);
                    
                    // Add some noise for atmospheric effect
                    float noise = sin(vPosition.x * 10.0 + time) * 
                                 sin(vPosition.y * 10.0 + time) * 
                                 sin(vPosition.z * 10.0 + time) * 0.1;
                    
                    // Final color with rim effect
                    vec3 finalColor = color * (rim + noise);
                    
                    // Set final color with opacity
                    gl_FragColor = vec4(finalColor, opacity * rim);
                }
            `,
            transparent: true,
            side: THREE.BackSide,
            blending: THREE.AdditiveBlending,
            depthWrite: false
        });
        
        // Create mesh
        const layer = new THREE.Mesh(geometry, material);
        
        return layer;
    }
    
    /**
     * Create an atmosphere glow effect
     * @param {number} radius - Glow radius
     * @param {number} segments - Number of segments
     * @param {Object} options - Glow options
     * @returns {THREE.Mesh} Created glow
     */
    createAtmosphereGlow(radius, segments, options = {}) {
        // Create sphere geometry
        const geometry = new THREE.SphereGeometry(radius, segments, segments / 2);
        
        // Create shader material
        const material = new THREE.ShaderMaterial({
            uniforms: {
                color: { value: new THREE.Color(options.color || 0x88aaff) },
                intensity: { value: options.intensity || 0.5 },
                time: { value: 0 }
            },
            vertexShader: `
                varying vec3 vNormal;
                varying vec3 vPosition;
                
                void main() {
                    vNormal = normalize(normalMatrix * normal);
                    vPosition = position;
                    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                }
            `,
            fragmentShader: `
                uniform vec3 color;
                uniform float intensity;
                uniform float time;
                
                varying vec3 vNormal;
                varying vec3 vPosition;
                
                void main() {
                    // Calculate rim lighting effect
                    vec3 viewDirection = normalize(cameraPosition - vPosition);
                    float rim = 1.0 - max(0.0, dot(viewDirection, vNormal));
                    rim = pow(rim, 3.0);
                    
                    // Add pulsating effect
                    float pulse = sin(time * 2.0) * 0.1 + 0.9;
                    
                    // Final color with glow effect
                    vec3 finalColor = color * rim * intensity * pulse;
                    
                    // Set final color with opacity
                    gl_FragColor = vec4(finalColor, rim * 0.5);
                }
            `,
            transparent: true,
            side: THREE.BackSide,
            blending: THREE.AdditiveBlending,
            depthWrite: false
        });
        
        // Create mesh
        const glow = new THREE.Mesh(geometry, material);
        
        return glow;
    }
    
    /**
     * Create an atmosphere scatter effect
     * @param {number} radius - Scatter radius
     * @param {number} segments - Number of segments
     * @param {Object} options - Scatter options
     * @returns {THREE.Mesh} Created scatter
     */
    createAtmosphereScatter(radius, segments, options = {}) {
        // Create sphere geometry
        const geometry = new THREE.SphereGeometry(radius, segments, segments / 2);
        
        // Create shader material
        const material = new THREE.ShaderMaterial({
            uniforms: {
                color: { value: new THREE.Color(options.color || 0x88ccff) },
                intensity: { value: options.intensity || 0.8 },
                time: { value: 0 }
            },
            vertexShader: `
                varying vec3 vNormal;
                varying vec3 vPosition;
                varying vec2 vUv;
                
                void main() {
                    vNormal = normalize(normalMatrix * normal);
                    vPosition = position;
                    vUv = uv;
                    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                }
            `,
            fragmentShader: `
                uniform vec3 color;
                uniform float intensity;
                uniform float time;
                
                varying vec3 vNormal;
                varying vec3 vPosition;
                varying vec2 vUv;
                
                // Simple noise function
                float noise(vec2 p) {
                    return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453);
                }
                
                void main() {
                    // Calculate view direction
                    vec3 viewDirection = normalize(cameraPosition - vPosition);
                    
                    // Calculate scatter based on view angle
                    float scatter = pow(1.0 - max(0.0, dot(viewDirection, vNormal)), 2.0);
                    
                    // Add noise for cloud-like effect
                    float n = noise(vUv * 20.0 + time * 0.1);
                    n += noise(vUv * 40.0 + time * 0.2) * 0.5;
                    n += noise(vUv * 80.0 + time * 0.4) * 0.25;
                    
                    // Apply noise to scatter
                    scatter *= n * 0.5 + 0.5;
                    
                    // Final color with scatter effect
                    vec3 finalColor = color * scatter * intensity;
                    
                    // Set final color with opacity
                    gl_FragColor = vec4(finalColor, scatter * 0.3);
                }
            `,
            transparent: true,
            side: THREE.BackSide,
            blending: THREE.AdditiveBlending,
            depthWrite: false
        });
        
        // Create mesh
        const scatter = new THREE.Mesh(geometry, material);
        
        return scatter;
    }
    
    /**
     * Create a simple atmosphere for performance
     * @param {string} atmosphereId - Atmosphere ID
     * @param {Object} bodyData - Celestial body data
     * @param {Object} options - Atmosphere options
     * @returns {THREE.Mesh} Created atmosphere
     */
    createSimpleAtmosphere(atmosphereId, bodyData, options = {}) {
        // Check if atmosphere already exists
        if (this.atmospheres.has(atmosphereId)) {
            return this.atmospheres.get(atmosphereId).object;
        }
        
        // Get atmosphere properties based on body type
        const bodyType = options.bodyType || 'earth';
        const properties = {
            ...this.defaultProperties[bodyType],
            ...options
        };
        
        // Get detail level
        const detail = this.getDetailLevel();
        
        // Create sphere geometry
        const geometry = new THREE.SphereGeometry(
            bodyData.radius * properties.scale,
            detail.segments,
            detail.segments / 2
        );
        
        // Create simple material
        const material = new THREE.MeshBasicMaterial({
            color: properties.color,
            transparent: true,
            opacity: properties.opacity,
            side: THREE.BackSide
        });
        
        // Create mesh
        const atmosphere = new THREE.Mesh(geometry, material);
        atmosphere.name = atmosphereId;
        
        // Add to scene
        if (this.scene) {
            this.scene.add(atmosphere);
        }
        
        // Register atmosphere
        this.atmospheres.set(atmosphereId, {
            object: atmosphere,
            bodyData: bodyData,
            options: properties,
            type: 'simple'
        });
        
        return atmosphere;
    }
    
    /**
     * Update atmosphere
     * @param {string} atmosphereId - Atmosphere ID
     * @param {Object} options - Atmosphere options
     */
    updateAtmosphere(atmosphereId, options = {}) {
        const atmosphereData = this.atmospheres.get(atmosphereId);
        if (!atmosphereData) return;
        
        const { object, bodyData, type } = atmosphereData;
        
        // Remove old atmosphere
        if (this.scene && object.parent === this.scene) {
            this.scene.remove(object);
        }
        
        // Dispose of resources
        if (object.geometry) {
            object.geometry.dispose();
        }
        if (object.material) {
            if (Array.isArray(object.material)) {
                object.material.forEach(material => material.dispose());
            } else {
                object.material.dispose();
            }
        }
        
        // Create new atmosphere
        let newAtmosphere;
        if (type === 'simple') {
            newAtmosphere = this.createSimpleAtmosphere(
                atmosphereId,
                bodyData,
                { ...atmosphereData.options, ...options }
            );
        } else {
            newAtmosphere = this.createAtmosphere(
                atmosphereId,
                bodyData,
                { ...atmosphereData.options, ...options }
            );
        }
        
        // Update registry
        atmosphereData.object = newAtmosphere;
        atmosphereData.options = { ...atmosphereData.options, ...options };
    }
    
    /**
     * Get atmosphere by ID
     * @param {string} atmosphereId - Atmosphere ID
     * @returns {THREE.Object3D} Atmosphere or null if not found
     */
    getAtmosphere(atmosphereId) {
        const atmosphereData = this.atmospheres.get(atmosphereId);
        return atmosphereData ? atmosphereData.object : null;
    }
    
    /**
     * Remove atmosphere by ID
     * @param {string} atmosphereId - Atmosphere ID
     */
    removeAtmosphere(atmosphereId) {
        const atmosphereData = this.atmospheres.get(atmosphereId);
        if (!atmosphereData) return;
        
        const { object } = atmosphereData;
        
        // Remove from scene
        if (this.scene && object.parent === this.scene) {
            this.scene.remove(object);
        }
        
        // Dispose of resources
        if (object.geometry) {
            object.geometry.dispose();
        }
        if (object.material) {
            if (Array.isArray(object.material)) {
                object.material.forEach(material => material.dispose());
            } else {
                object.material.dispose();
            }
        }
        
        // Remove from registry
        this.atmospheres.delete(atmosphereId);
    }
    
    /**
     * Toggle atmosphere visibility
     * @param {boolean} visible - Whether atmospheres are visible
     */
    toggleAtmospheres(visible) {
        this.enableAtmospheres = visible;
        
        // Update all atmospheres
        this.atmospheres.forEach((atmosphereData) => {
            atmosphereData.object.visible = visible;
        });
    }
    
    /**
     * Update atmospheric effects
     * @param {number} deltaTime - Time elapsed in seconds
     */
    update(deltaTime) {
        const time = Date.now() * 0.001;
        
        // Update all atmospheres
        this.atmospheres.forEach((atmosphereData) => {
            const { object, type } = atmosphereData;
            
            if (type === 'simple') {
                // Simple atmospheres don't need updates
                return;
            }
            
            // Update shader uniforms
            object.traverse((child) => {
                if (child.isMesh && child.material.uniforms) {
                    if (child.material.uniforms.time) {
                        child.material.uniforms.time.value = time;
                    }
                }
            });
        });
    }
    
    /**
     * Clear all atmospheres
     */
    clearAllAtmospheres() {
        // Create a copy of the keys to avoid modification during iteration
        const atmosphereIds = Array.from(this.atmospheres.keys());
        
        // Remove each atmosphere
        atmosphereIds.forEach(atmosphereId => {
            this.removeAtmosphere(atmosphereId);
        });
    }
    
    /**
     * Dispose of all resources and clean up
     */
    dispose() {
        // Clear all atmospheres
        this.clearAllAtmospheres();
        
        // Clear registry
        this.atmospheres.clear();
    }
}