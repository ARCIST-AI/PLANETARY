import * as THREE from 'three';
import { TextureManager } from './TextureManager.js';

/**
 * Material Manager for creating and managing materials for celestial bodies
 */
export class MaterialManager {
    /**
     * Create a new material manager
     * @param {Object} config - Configuration object
     */
    constructor(config = {}) {
        this.textureManager = config.textureManager || new TextureManager(config.textureConfig);
        
        // Material quality settings
        this.quality = config.quality || 'high';
        this.enableShadows = config.enableShadows !== undefined ? config.enableShadows : true;
        this.enableNormalMaps = config.enableNormalMaps !== undefined ? config.enableNormalMaps : true;
        this.enableSpecularMaps = config.enableSpecularMaps !== undefined ? config.enableSpecularMaps : true;
        this.enableBumpMaps = config.enableBumpMaps !== undefined ? config.enableBumpMaps : true;
        
        // Material cache
        this.materialCache = new Map();
        
        // Default material properties
        this.defaultProperties = {
            // Star properties
            star: {
                emissive: 0xffffff,
                emissiveIntensity: 1.0,
                color: 0xffffaa,
                roughness: 0.8,
                metalness: 0.2
            },
            
            // Planet properties
            planet: {
                roughness: 0.8,
                metalness: 0.1,
                clearcoat: 0.0,
                clearcoatRoughness: 0.0,
                reflectivity: 0.5
            },
            
            // Moon properties
            moon: {
                roughness: 0.9,
                metalness: 0.0,
                clearcoat: 0.0,
                clearcoatRoughness: 0.0,
                reflectivity: 0.1
            },
            
            // Asteroid properties
            asteroid: {
                roughness: 1.0,
                metalness: 0.3,
                clearcoat: 0.0,
                clearcoatRoughness: 0.0,
                reflectivity: 0.2
            },
            
            // Comet properties
            comet: {
                roughness: 0.7,
                metalness: 0.0,
                clearcoat: 0.0,
                clearcoatRoughness: 0.0,
                reflectivity: 0.3,
                transparent: true,
                opacity: 0.8
            },
            
            // Spacecraft properties
            spacecraft: {
                roughness: 0.4,
                metalness: 0.8,
                clearcoat: 0.3,
                clearcoatRoughness: 0.1,
                reflectivity: 0.7
            }
        };
        
        // Set texture manager quality
        this.textureManager.setQuality(this.quality);
    }
    
    /**
     * Get material quality setting
     * @returns {string} Quality setting
     */
    getQuality() {
        return this.quality;
    }
    
    /**
     * Set material quality setting
     * @param {string} quality - Quality setting ('low', 'medium', 'high', 'ultra')
     */
    setQuality(quality) {
        const validQualities = ['low', 'medium', 'high', 'ultra'];
        if (validQualities.includes(quality)) {
            this.quality = quality;
            this.textureManager.setQuality(quality);
            // Clear cache when quality changes
            this.clearCache();
        }
    }
    
    /**
     * Create a star material
     * @param {Object} options - Material options
     * @returns {Promise<THREE.Material>} Created material
     */
    async createStarMaterial(options = {}) {
        const cacheKey = `star_${JSON.stringify(options)}`;
        
        // Check cache first
        if (this.materialCache.has(cacheKey)) {
            return this.materialCache.get(cacheKey);
        }
        
        // Load texture if provided
        let texture = null;
        if (options.texturePath) {
            try {
                texture = await this.textureManager.loadTexture(options.texturePath);
            } catch (error) {
                console.warn('Failed to load star texture:', error);
            }
        }
        
        // Merge with default properties
        const properties = {
            ...this.defaultProperties.star,
            ...options
        };
        
        // Create material based on quality
        let material;
        if (this.quality === 'low') {
            material = new THREE.MeshBasicMaterial({
                map: texture,
                color: properties.color,
                emissive: properties.emissive,
                emissiveIntensity: properties.emissiveIntensity
            });
        } else {
            material = new THREE.MeshStandardMaterial({
                map: texture,
                color: properties.color,
                emissive: properties.emissive,
                emissiveIntensity: properties.emissiveIntensity,
                roughness: properties.roughness,
                metalness: properties.metalness
            });
        }
        
        // Add glow effect for high quality
        if (this.quality === 'high' || this.quality === 'ultra') {
            material.emissiveMap = texture;
            material.emissiveIntensity = properties.emissiveIntensity;
        }
        
        // Cache the material
        this.materialCache.set(cacheKey, material);
        
        return material;
    }
    
    /**
     * Create a planet material
     * @param {string} planetName - Planet name
     * @param {Object} options - Material options
     * @returns {Promise<THREE.Material>} Created material
     */
    async createPlanetMaterial(planetName, options = {}) {
        const cacheKey = `planet_${planetName}_${JSON.stringify(options)}`;
        
        // Check cache first
        if (this.materialCache.has(cacheKey)) {
            return this.materialCache.get(cacheKey);
        }
        
        // Load planet textures
        const textures = await this.textureManager.loadPlanetTextures(planetName);
        
        // Merge with default properties
        const properties = {
            ...this.defaultProperties.planet,
            ...options
        };
        
        // Create material based on quality
        let material;
        if (this.quality === 'low') {
            material = new THREE.MeshLambertMaterial({
                map: textures.map
            });
        } else {
            const materialOptions = {
                map: textures.map,
                color: properties.color,
                roughness: properties.roughness,
                metalness: properties.metalness
            };
            
            // Add normal map if enabled and available
            if (this.enableNormalMaps && textures.normalMap) {
                materialOptions.normalMap = textures.normalMap;
            }
            
            // Add bump map if enabled and available
            if (this.enableBumpMaps && textures.bumpMap) {
                materialOptions.bumpMap = textures.bumpMap;
                materialOptions.bumpScale = options.bumpScale || 0.01;
            }
            
            // Add specular map if enabled and available
            if (this.enableSpecularMaps && textures.specularMap) {
                materialOptions.specularMap = textures.specularMap;
            }
            
            // Add clearcoat for high quality
            if (this.quality === 'high' || this.quality === 'ultra') {
                materialOptions.clearcoat = properties.clearcoat;
                materialOptions.clearcoatRoughness = properties.clearcoatRoughness;
            }
            
            material = new THREE.MeshStandardMaterial(materialOptions);
        }
        
        // Cache the material
        this.materialCache.set(cacheKey, material);
        
        return material;
    }
    
    /**
     * Create a planet with clouds material
     * @param {string} planetName - Planet name
     * @param {Object} options - Material options
     * @returns {Promise<Object>} Object containing surface and cloud materials
     */
    async createPlanetWithCloudsMaterial(planetName, options = {}) {
        const cacheKey = `planet_clouds_${planetName}_${JSON.stringify(options)}`;
        
        // Check cache first
        if (this.materialCache.has(cacheKey)) {
            return this.materialCache.get(cacheKey);
        }
        
        // Create surface material
        const surfaceMaterial = await this.createPlanetMaterial(planetName, options);
        
        // Load cloud texture
        let cloudTexture = null;
        if (this.textureManager.cloudTexturePaths[planetName]) {
            try {
                cloudTexture = await this.textureManager.loadTexture(
                    this.textureManager.cloudTexturePaths[planetName],
                    { transparent: true }
                );
            } catch (error) {
                console.warn(`Failed to load cloud texture for ${planetName}:`, error);
            }
        }
        
        // Create cloud material
        const cloudMaterial = new THREE.MeshStandardMaterial({
            map: cloudTexture,
            transparent: true,
            opacity: options.cloudOpacity || 0.7,
            roughness: 1.0,
            metalness: 0.0,
            depthWrite: false
        });
        
        // Create night material if available
        let nightMaterial = null;
        if (this.textureManager.nightTexturePaths[planetName]) {
            try {
                const nightTexture = await this.textureManager.loadTexture(
                    this.textureManager.nightTexturePaths[planetName]
                );
                
                nightMaterial = new THREE.MeshBasicMaterial({
                    map: nightTexture,
                    transparent: true,
                    opacity: 0.8,
                    blending: THREE.AdditiveBlending,
                    depthWrite: false
                });
            } catch (error) {
                console.warn(`Failed to load night texture for ${planetName}:`, error);
            }
        }
        
        const materials = {
            surface: surfaceMaterial,
            clouds: cloudMaterial,
            night: nightMaterial
        };
        
        // Cache the materials
        this.materialCache.set(cacheKey, materials);
        
        return materials;
    }
    
    /**
     * Create a moon material
     * @param {string} moonName - Moon name
     * @param {Object} options - Material options
     * @returns {Promise<THREE.Material>} Created material
     */
    async createMoonMaterial(moonName, options = {}) {
        const cacheKey = `moon_${moonName}_${JSON.stringify(options)}`;
        
        // Check cache first
        if (this.materialCache.has(cacheKey)) {
            return this.materialCache.get(cacheKey);
        }
        
        // Load moon textures
        const textures = await this.textureManager.loadPlanetTextures(moonName);
        
        // Merge with default properties
        const properties = {
            ...this.defaultProperties.moon,
            ...options
        };
        
        // Create material based on quality
        let material;
        if (this.quality === 'low') {
            material = new THREE.MeshLambertMaterial({
                map: textures.map
            });
        } else {
            const materialOptions = {
                map: textures.map,
                color: properties.color,
                roughness: properties.roughness,
                metalness: properties.metalness
            };
            
            // Add normal map if enabled and available
            if (this.enableNormalMaps && textures.normalMap) {
                materialOptions.normalMap = textures.normalMap;
            }
            
            // Add bump map if enabled and available
            if (this.enableBumpMaps && textures.bumpMap) {
                materialOptions.bumpMap = textures.bumpMap;
                materialOptions.bumpScale = options.bumpScale || 0.02;
            }
            
            // Add specular map if enabled and available
            if (this.enableSpecularMaps && textures.specularMap) {
                materialOptions.specularMap = textures.specularMap;
            }
            
            material = new THREE.MeshStandardMaterial(materialOptions);
        }
        
        // Cache the material
        this.materialCache.set(cacheKey, material);
        
        return material;
    }
    
    /**
     * Create an asteroid material
     * @param {Object} options - Material options
     * @returns {Promise<THREE.Material>} Created material
     */
    async createAsteroidMaterial(options = {}) {
        const cacheKey = `asteroid_${JSON.stringify(options)}`;
        
        // Check cache first
        if (this.materialCache.has(cacheKey)) {
            return this.materialCache.get(cacheKey);
        }
        
        // Load texture if provided
        let texture = null;
        if (options.texturePath) {
            try {
                texture = await this.textureManager.loadTexture(options.texturePath);
            } catch (error) {
                console.warn('Failed to load asteroid texture:', error);
            }
        }
        
        // Create procedural texture if no texture provided
        if (!texture) {
            texture = this.textureManager.createProceduralTexture('noise', {
                size: 512,
                scale: 0.1,
                octaves: 4,
                persistence: 0.5
            });
        }
        
        // Merge with default properties
        const properties = {
            ...this.defaultProperties.asteroid,
            ...options
        };
        
        // Create material based on quality
        let material;
        if (this.quality === 'low') {
            material = new THREE.MeshLambertMaterial({
                map: texture,
                color: properties.color
            });
        } else {
            material = new THREE.MeshStandardMaterial({
                map: texture,
                color: properties.color,
                roughness: properties.roughness,
                metalness: properties.metalness,
                normalScale: new THREE.Vector2(0.5, 0.5)
            });
        }
        
        // Cache the material
        this.materialCache.set(cacheKey, material);
        
        return material;
    }
    
    /**
     * Create a comet material
     * @param {Object} options - Material options
     * @returns {Promise<THREE.Material>} Created material
     */
    async createCometMaterial(options = {}) {
        const cacheKey = `comet_${JSON.stringify(options)}`;
        
        // Check cache first
        if (this.materialCache.has(cacheKey)) {
            return this.materialCache.get(cacheKey);
        }
        
        // Load texture if provided
        let texture = null;
        if (options.texturePath) {
            try {
                texture = await this.textureManager.loadTexture(options.texturePath);
            } catch (error) {
                console.warn('Failed to load comet texture:', error);
            }
        }
        
        // Merge with default properties
        const properties = {
            ...this.defaultProperties.comet,
            ...options
        };
        
        // Create material
        const material = new THREE.MeshStandardMaterial({
            map: texture,
            color: properties.color,
            roughness: properties.roughness,
            metalness: properties.metalness,
            transparent: properties.transparent,
            opacity: properties.opacity,
            emissive: properties.emissive || 0x000000,
            emissiveIntensity: properties.emissiveIntensity || 0.0
        });
        
        // Cache the material
        this.materialCache.set(cacheKey, material);
        
        return material;
    }
    
    /**
     * Create a comet coma material
     * @param {Object} options - Material options
     * @returns {Promise<THREE.Material>} Created material
     */
    async createComaMaterial(options = {}) {
        const cacheKey = `coma_${JSON.stringify(options)}`;
        
        // Check cache first
        if (this.materialCache.has(cacheKey)) {
            return this.materialCache.get(cacheKey);
        }
        
        // Create procedural texture for coma
        const texture = this.textureManager.createProceduralTexture('gradient', {
            size: 256,
            colors: [
                { position: 0, color: 'rgba(170, 204, 255, 0.8)' },
                { position: 0.5, color: 'rgba(170, 204, 255, 0.4)' },
                { position: 1, color: 'rgba(170, 204, 255, 0.0)' }
            ]
        });
        
        // Merge with default properties
        const properties = {
            ...this.defaultProperties.comet,
            ...options,
            transparent: true,
            opacity: 0.6
        };
        
        // Create material
        const material = new THREE.MeshStandardMaterial({
            map: texture,
            color: properties.color,
            roughness: properties.roughness,
            metalness: properties.metalness,
            transparent: properties.transparent,
            opacity: properties.opacity,
            emissive: properties.emissive || 0xaaccff,
            emissiveIntensity: properties.emissiveIntensity || 0.2,
            side: THREE.DoubleSide,
            depthWrite: false,
            blending: THREE.AdditiveBlending
        });
        
        // Cache the material
        this.materialCache.set(cacheKey, material);
        
        return material;
    }
    
    /**
     * Create a comet tail material
     * @param {Object} options - Material options
     * @returns {Promise<THREE.Material>} Created material
     */
    async createTailMaterial(options = {}) {
        const cacheKey = `tail_${JSON.stringify(options)}`;
        
        // Check cache first
        if (this.materialCache.has(cacheKey)) {
            return this.materialCache.get(cacheKey);
        }
        
        // Create procedural texture for tail
        const texture = this.textureManager.createProceduralTexture('gradient', {
            size: 256,
            colors: [
                { position: 0, color: 'rgba(170, 204, 255, 0.8)' },
                { position: 1, color: 'rgba(170, 204, 255, 0.0)' }
            ]
        });
        
        // Merge with default properties
        const properties = {
            ...this.defaultProperties.comet,
            ...options,
            transparent: true,
            opacity: 0.4
        };
        
        // Create material
        const material = new THREE.MeshStandardMaterial({
            map: texture,
            color: properties.color,
            roughness: properties.roughness,
            metalness: properties.metalness,
            transparent: properties.transparent,
            opacity: properties.opacity,
            emissive: properties.emissive || 0xaaccff,
            emissiveIntensity: properties.emissiveIntensity || 0.3,
            side: THREE.DoubleSide,
            depthWrite: false,
            blending: THREE.AdditiveBlending
        });
        
        // Cache the material
        this.materialCache.set(cacheKey, material);
        
        return material;
    }
    
    /**
     * Create a spacecraft material
     * @param {Object} options - Material options
     * @returns {Promise<THREE.Material>} Created material
     */
    async createSpacecraftMaterial(options = {}) {
        const cacheKey = `spacecraft_${JSON.stringify(options)}`;
        
        // Check cache first
        if (this.materialCache.has(cacheKey)) {
            return this.materialCache.get(cacheKey);
        }
        
        // Load texture if provided
        let texture = null;
        if (options.texturePath) {
            try {
                texture = await this.textureManager.loadTexture(options.texturePath);
            } catch (error) {
                console.warn('Failed to load spacecraft texture:', error);
            }
        }
        
        // Merge with default properties
        const properties = {
            ...this.defaultProperties.spacecraft,
            ...options
        };
        
        // Create material based on quality
        let material;
        if (this.quality === 'low') {
            material = new THREE.MeshPhongMaterial({
                map: texture,
                color: properties.color,
                shininess: 100
            });
        } else {
            material = new THREE.MeshStandardMaterial({
                map: texture,
                color: properties.color,
                roughness: properties.roughness,
                metalness: properties.metalness,
                clearcoat: properties.clearcoat,
                clearcoatRoughness: properties.clearcoatRoughness
            });
        }
        
        // Cache the material
        this.materialCache.set(cacheKey, material);
        
        return material;
    }
    
    /**
     * Create a ring material
     * @param {Object} options - Material options
     * @returns {Promise<THREE.Material>} Created material
     */
    async createRingMaterial(options = {}) {
        const cacheKey = `ring_${JSON.stringify(options)}`;
        
        // Check cache first
        if (this.materialCache.has(cacheKey)) {
            return this.materialCache.get(cacheKey);
        }
        
        // Load texture if provided
        let texture = null;
        if (options.texturePath) {
            try {
                texture = await this.textureManager.loadTexture(options.texturePath);
            } catch (error) {
                console.warn('Failed to load ring texture:', error);
            }
        }
        
        // Create procedural texture if no texture provided
        if (!texture) {
            texture = this.textureManager.createProceduralTexture('gradient', {
                size: 512,
                colors: [
                    { position: 0, color: '#ffcc99' },
                    { position: 0.5, color: '#cc9966' },
                    { position: 1, color: '#996633' }
                ]
            });
        }
        
        // Create material
        const material = new THREE.MeshStandardMaterial({
            map: texture,
            color: options.color || 0xffcc99,
            roughness: options.roughness || 0.8,
            metalness: options.metalness || 0.3,
            transparent: true,
            opacity: options.opacity || 0.8,
            side: THREE.DoubleSide
        });
        
        // Cache the material
        this.materialCache.set(cacheKey, material);
        
        return material;
    }
    
    /**
     * Create a skybox material
     * @param {Object} options - Material options
     * @returns {Promise<THREE.Material>} Created material
     */
    async createSkyboxMaterial(options = {}) {
        const cacheKey = `skybox_${JSON.stringify(options)}`;
        
        // Check cache first
        if (this.materialCache.has(cacheKey)) {
            return this.materialCache.get(cacheKey);
        }
        
        // Load cube texture
        let cubeTexture = null;
        if (options.textureType === 'stars') {
            cubeTexture = await this.textureManager.loadStarField();
        } else if (options.textureType === 'milkyway') {
            cubeTexture = await this.textureManager.loadMilkyWay();
        }
        
        // Create material
        const material = new THREE.MeshBasicMaterial({
            map: cubeTexture,
            side: THREE.BackSide
        });
        
        // Cache the material
        this.materialCache.set(cacheKey, material);
        
        return material;
    }
    
    /**
     * Update material properties
     * @param {THREE.Material} material - Material to update
     * @param {Object} properties - Properties to update
     */
    updateMaterialProperties(material, properties = {}) {
        if (!material) return;
        
        // Update common properties
        if (properties.color !== undefined) material.color.setHex(properties.color);
        if (properties.roughness !== undefined) material.roughness = properties.roughness;
        if (properties.metalness !== undefined) material.metalness = properties.metalness;
        if (properties.opacity !== undefined) material.opacity = properties.opacity;
        if (properties.transparent !== undefined) material.transparent = properties.transparent;
        if (properties.emissive !== undefined) material.emissive.setHex(properties.emissive);
        if (properties.emissiveIntensity !== undefined) material.emissiveIntensity = properties.emissiveIntensity;
        
        // Update MeshStandardMaterial specific properties
        if (material instanceof THREE.MeshStandardMaterial) {
            if (properties.clearcoat !== undefined) material.clearcoat = properties.clearcoat;
            if (properties.clearcoatRoughness !== undefined) material.clearcoatRoughness = properties.clearcoatRoughness;
            if (properties.normalScale !== undefined) material.normalScale = properties.normalScale;
            if (properties.bumpScale !== undefined) material.bumpScale = properties.bumpScale;
        }
        
        // Update needsUpdate flag
        material.needsUpdate = true;
    }
    
    /**
     * Clear material cache
     */
    clearCache() {
        this.materialCache.forEach(material => {
            if (material.dispose) {
                material.dispose();
            }
        });
        this.materialCache.clear();
    }
    
    /**
     * Dispose of all materials and clean up
     */
    dispose() {
        this.clearCache();
        this.textureManager.dispose();
    }
}