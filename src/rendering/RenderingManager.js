import * as THREE from 'three';
import { TextureManager } from './TextureManager.js';
import { MaterialManager } from './MaterialManager.js';
import { GeometryManager } from './GeometryManager.js';
import { MathUtils } from '../utils/index.js';

/**
 * Rendering Manager for creating and managing visual representations of celestial bodies
 */
export class RenderingManager {
    /**
     * Create a new rendering manager
     * @param {Object} config - Configuration object
     */
    constructor(config = {}) {
        // Three.js components
        this.renderer = config.renderer || null;
        this.scene = config.scene || null;
        this.camera = config.camera || null;
        
        // Quality settings
        this.quality = config.quality || 'high';
        this.enableShadows = config.enableShadows !== undefined ? config.enableShadows : true;
        this.enableAtmospheres = config.enableAtmospheres !== undefined ? config.enableAtmospheres : true;
        this.enableClouds = config.enableClouds !== undefined ? config.enableClouds : true;
        this.enableRings = config.enableRings !== undefined ? config.enableRings : true;
        
        // Create sub-managers
        this.textureManager = new TextureManager({
            quality: this.quality,
            renderer: this.renderer
        });
        
        this.materialManager = new MaterialManager({
            quality: this.quality,
            textureManager: this.textureManager,
            enableShadows: this.enableShadows
        });
        
        this.geometryManager = new GeometryManager({
            quality: this.quality
        });
        
        // Object registry
        this.objectRegistry = new Map();
        
        // Visual effects
        this.visualEffects = new Map();
        
        // Performance monitoring
        this.performanceMonitor = config.performanceMonitor || null;
        
        // Event system
        this.eventSystem = config.eventSystem || null;
    }
    
    /**
     * Initialize the rendering manager
     * @param {THREE.WebGLRenderer} renderer - Three.js renderer
     * @param {THREE.Scene} scene - Three.js scene
     * @param {THREE.Camera} camera - Three.js camera
     */
    init(renderer, scene, camera) {
        this.renderer = renderer;
        this.scene = scene;
        this.camera = camera;
        
        // Update texture manager with renderer
        this.textureManager.setRenderer(renderer);
        
        // Set up renderer settings
        this.setupRenderer();
        
        // Set up scene
        this.setupScene();
        
        // Create skybox
        this.createSkybox();
    }
    
    /**
     * Set up renderer settings
     */
    setupRenderer() {
        if (!this.renderer) return;
        
        // Set shadow settings
        this.renderer.shadowMap.enabled = this.enableShadows;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        
        // Set tone mapping
        this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
        this.renderer.toneMappingExposure = 1.0;
        
        // Set output encoding
        this.renderer.outputEncoding = THREE.sRGBEncoding;
        
        // Set pixel ratio
        this.renderer.setPixelRatio(window.devicePixelRatio);
        
        // Set size
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        
        // Handle window resize
        window.addEventListener('resize', () => this.handleResize());
    }
    
    /**
     * Set up scene settings
     */
    setupScene() {
        if (!this.scene) return;
        
        // Set background color
        this.scene.background = new THREE.Color(0x000000);
        
        // Set fog for distance
        this.scene.fog = new THREE.Fog(0x000000, 1000, 10000);
    }
    
    /**
     * Create skybox
     */
    async createSkybox() {
        if (!this.scene) return;
        
        try {
            // Create skybox material
            const material = await this.materialManager.createSkyboxMaterial({
                textureType: 'stars'
            });
            
            // Create skybox geometry
            const geometry = this.geometryManager.createSkyboxGeometry(50000);
            
            // Create skybox mesh
            const skybox = new THREE.Mesh(geometry, material);
            skybox.name = 'skybox';
            
            // Add to scene
            this.scene.add(skybox);
            
            // Store reference
            this.skybox = skybox;
        } catch (error) {
            console.error('Failed to create skybox:', error);
        }
    }
    
    /**
     * Get rendering quality setting
     * @returns {string} Quality setting
     */
    getQuality() {
        return this.quality;
    }
    
    /**
     * Set rendering quality setting
     * @param {string} quality - Quality setting ('low', 'medium', 'high', 'ultra')
     */
    setQuality(quality) {
        const validQualities = ['low', 'medium', 'high', 'ultra'];
        if (validQualities.includes(quality)) {
            this.quality = quality;
            
            // Update sub-managers
            this.textureManager.setQuality(quality);
            this.materialManager.setQuality(quality);
            this.geometryManager.setQuality(quality);
            
            // Update renderer settings
            if (this.renderer) {
                this.setupRenderer();
            }
            
            // Update existing objects
            this.updateObjectQuality();
        }
    }
    
    /**
     * Update quality of existing objects
     */
    updateObjectQuality() {
        // Update all registered objects
        this.objectRegistry.forEach((objectData, objectId) => {
            const { object, type, options } = objectData;
            
            // Update object based on type
            switch (type) {
                case 'star':
                    this.updateStarObject(object, options);
                    break;
                case 'planet':
                    this.updatePlanetObject(object, options);
                    break;
                case 'moon':
                    this.updateMoonObject(object, options);
                    break;
                case 'asteroid':
                    this.updateAsteroidObject(object, options);
                    break;
                case 'comet':
                    this.updateCometObject(object, options);
                    break;
                case 'spacecraft':
                    this.updateSpacecraftObject(object, options);
                    break;
            }
        });
    }
    
    /**
     * Create a star object
     * @param {Object} starData - Star data
     * @param {Object} options - Rendering options
     * @returns {Promise<THREE.Object3D>} Created star object
     */
    async createStarObject(starData, options = {}) {
        const objectId = `star_${starData.id}`;
        
        // Check if object already exists
        if (this.objectRegistry.has(objectId)) {
            return this.objectRegistry.get(objectId).object;
        }
        
        try {
            // Create geometry
            const geometry = this.geometryManager.createStarGeometry(
                starData.radius,
                options
            );
            
            // Create material
            const material = await this.materialManager.createStarMaterial({
                color: starData.color,
                emissive: starData.emissive || starData.color,
                emissiveIntensity: starData.emissiveIntensity || 1.0,
                texturePath: options.texturePath
            });
            
            // Create mesh
            const star = new THREE.Mesh(geometry, material);
            star.name = objectId;
            star.castShadow = true;
            star.receiveShadow = false;
            
            // Add to scene
            if (this.scene) {
                this.scene.add(star);
            }
            
            // Add glow effect for high quality
            if (this.quality === 'high' || this.quality === 'ultra') {
                await this.addStarGlowEffect(star, starData);
            }
            
            // Register object
            this.objectRegistry.set(objectId, {
                object: star,
                type: 'star',
                data: starData,
                options: options
            });
            
            // Emit event
            if (this.eventSystem) {
                this.eventSystem.emit('objectCreated', { type: 'star', object: star, data: starData });
            }
            
            return star;
        } catch (error) {
            console.error('Failed to create star object:', error);
            return null;
        }
    }
    
    /**
     * Create a planet object
     * @param {Object} planetData - Planet data
     * @param {Object} options - Rendering options
     * @returns {Promise<THREE.Object3D>} Created planet object
     */
    async createPlanetObject(planetData, options = {}) {
        const objectId = `planet_${planetData.id}`;
        
        // Check if object already exists
        if (this.objectRegistry.has(objectId)) {
            return this.objectRegistry.get(objectId).object;
        }
        
        try {
            // Create container for planet and its features
            const planetContainer = new THREE.Group();
            planetContainer.name = objectId;
            
            // Create geometry
            const geometry = this.geometryManager.createPlanetGeometry(
                planetData.radius,
                options
            );
            
            // Create materials
            let materials;
            if (this.enableClouds && this.textureManager.cloudTexturePaths[planetData.name.toLowerCase()]) {
                materials = await this.materialManager.createPlanetWithCloudsMaterial(
                    planetData.name.toLowerCase(),
                    {
                        color: planetData.color,
                        cloudOpacity: options.cloudOpacity || 0.7
                    }
                );
            } else {
                materials = {
                    surface: await this.materialManager.createPlanetMaterial(
                        planetData.name.toLowerCase(),
                        {
                            color: planetData.color
                        }
                    )
                };
            }
            
            // Create surface mesh
            const surface = new THREE.Mesh(geometry, materials.surface);
            surface.name = `${objectId}_surface`;
            surface.castShadow = true;
            surface.receiveShadow = true;
            planetContainer.add(surface);
            
            // Create cloud layer if available
            if (materials.clouds && this.enableClouds) {
                const cloudGeometry = this.geometryManager.createSphereGeometry(
                    planetData.radius * 1.01,
                    options
                );
                const clouds = new THREE.Mesh(cloudGeometry, materials.clouds);
                clouds.name = `${objectId}_clouds`;
                clouds.castShadow = false;
                clouds.receiveShadow = false;
                planetContainer.add(clouds);
            }
            
            // Create night lights if available
            if (materials.night && this.quality === 'high' || this.quality === 'ultra') {
                const nightGeometry = this.geometryManager.createSphereGeometry(
                    planetData.radius * 1.001,
                    options
                );
                const nightLights = new THREE.Mesh(nightGeometry, materials.night);
                nightLights.name = `${objectId}_night`;
                nightLights.castShadow = false;
                nightLights.receiveShadow = false;
                planetContainer.add(nightLights);
            }
            
            // Create rings if applicable
            if (planetData.hasRings && this.enableRings) {
                await this.addPlanetRings(planetContainer, planetData, options);
            }
            
            // Add atmosphere if applicable
            if (this.enableAtmospheres && planetData.hasAtmosphere) {
                await this.addPlanetAtmosphere(planetContainer, planetData, options);
            }
            
            // Add to scene
            if (this.scene) {
                this.scene.add(planetContainer);
            }
            
            // Register object
            this.objectRegistry.set(objectId, {
                object: planetContainer,
                type: 'planet',
                data: planetData,
                options: options
            });
            
            // Emit event
            if (this.eventSystem) {
                this.eventSystem.emit('objectCreated', { type: 'planet', object: planetContainer, data: planetData });
            }
            
            return planetContainer;
        } catch (error) {
            console.error('Failed to create planet object:', error);
            return null;
        }
    }
    
    /**
     * Create a moon object
     * @param {Object} moonData - Moon data
     * @param {Object} options - Rendering options
     * @returns {Promise<THREE.Object3D>} Created moon object
     */
    async createMoonObject(moonData, options = {}) {
        const objectId = `moon_${moonData.id}`;
        
        // Check if object already exists
        if (this.objectRegistry.has(objectId)) {
            return this.objectRegistry.get(objectId).object;
        }
        
        try {
            // Create geometry
            const geometry = this.geometryManager.createMoonGeometry(
                moonData.radius,
                options
            );
            
            // Create material
            const material = await this.materialManager.createMoonMaterial(
                moonData.name.toLowerCase(),
                {
                    color: moonData.color
                }
            );
            
            // Create mesh
            const moon = new THREE.Mesh(geometry, material);
            moon.name = objectId;
            moon.castShadow = true;
            moon.receiveShadow = true;
            
            // Add to scene
            if (this.scene) {
                this.scene.add(moon);
            }
            
            // Register object
            this.objectRegistry.set(objectId, {
                object: moon,
                type: 'moon',
                data: moonData,
                options: options
            });
            
            // Emit event
            if (this.eventSystem) {
                this.eventSystem.emit('objectCreated', { type: 'moon', object: moon, data: moonData });
            }
            
            return moon;
        } catch (error) {
            console.error('Failed to create moon object:', error);
            return null;
        }
    }
    
    /**
     * Create an asteroid object
     * @param {Object} asteroidData - Asteroid data
     * @param {Object} options - Rendering options
     * @returns {Promise<THREE.Object3D>} Created asteroid object
     */
    async createAsteroidObject(asteroidData, options = {}) {
        const objectId = `asteroid_${asteroidData.id}`;
        
        // Check if object already exists
        if (this.objectRegistry.has(objectId)) {
            return this.objectRegistry.get(objectId).object;
        }
        
        try {
            // Create geometry
            const geometry = this.geometryManager.createAsteroidGeometry(
                asteroidData.radius,
                options
            );
            
            // Create material
            const material = await this.materialManager.createAsteroidMaterial({
                color: asteroidData.color,
                texturePath: options.texturePath
            });
            
            // Create mesh
            const asteroid = new THREE.Mesh(geometry, material);
            asteroid.name = objectId;
            asteroid.castShadow = true;
            asteroid.receiveShadow = true;
            
            // Add to scene
            if (this.scene) {
                this.scene.add(asteroid);
            }
            
            // Register object
            this.objectRegistry.set(objectId, {
                object: asteroid,
                type: 'asteroid',
                data: asteroidData,
                options: options
            });
            
            // Emit event
            if (this.eventSystem) {
                this.eventSystem.emit('objectCreated', { type: 'asteroid', object: asteroid, data: asteroidData });
            }
            
            return asteroid;
        } catch (error) {
            console.error('Failed to create asteroid object:', error);
            return null;
        }
    }
    
    /**
     * Create a comet object
     * @param {Object} cometData - Comet data
     * @param {Object} options - Rendering options
     * @returns {Promise<THREE.Object3D>} Created comet object
     */
    async createCometObject(cometData, options = {}) {
        const objectId = `comet_${cometData.id}`;
        
        // Check if object already exists
        if (this.objectRegistry.has(objectId)) {
            return this.objectRegistry.get(objectId).object;
        }
        
        try {
            // Create container for comet and its features
            const cometContainer = new THREE.Group();
            cometContainer.name = objectId;
            
            // Create nucleus
            const nucleusGeometry = this.geometryManager.createCometNucleusGeometry(
                cometData.radius,
                options
            );
            
            const nucleusMaterial = await this.materialManager.createCometMaterial({
                color: cometData.color,
                emissive: 0x666666,
                emissiveIntensity: 0.2
            });
            
            const nucleus = new THREE.Mesh(nucleusGeometry, nucleusMaterial);
            nucleus.name = `${objectId}_nucleus`;
            nucleus.castShadow = true;
            nucleus.receiveShadow = true;
            cometContainer.add(nucleus);
            
            // Create coma
            const comaGeometry = this.geometryManager.createComaGeometry(
                cometData.radius * 3,
                options
            );
            
            const comaMaterial = await this.materialManager.createComaMaterial({
                color: 0xaaccff,
                opacity: 0.6
            });
            
            const coma = new THREE.Mesh(comaGeometry, comaMaterial);
            coma.name = `${objectId}_coma`;
            coma.castShadow = false;
            coma.receiveShadow = false;
            cometContainer.add(coma);
            
            // Create tail
            if (cometData.hasTail) {
                const tailGeometry = this.geometryManager.createTailGeometry(
                    cometData.radius * 20,
                    cometData.radius * 5,
                    options
                );
                
                const tailMaterial = await this.materialManager.createTailMaterial({
                    color: 0xaaccff,
                    opacity: 0.4
                });
                
                const tail = new THREE.Mesh(tailGeometry, tailMaterial);
                tail.name = `${objectId}_tail`;
                tail.position.z = -cometData.radius * 10;
                tail.castShadow = false;
                tail.receiveShadow = false;
                cometContainer.add(tail);
            }
            
            // Add to scene
            if (this.scene) {
                this.scene.add(cometContainer);
            }
            
            // Register object
            this.objectRegistry.set(objectId, {
                object: cometContainer,
                type: 'comet',
                data: cometData,
                options: options
            });
            
            // Emit event
            if (this.eventSystem) {
                this.eventSystem.emit('objectCreated', { type: 'comet', object: cometContainer, data: cometData });
            }
            
            return cometContainer;
        } catch (error) {
            console.error('Failed to create comet object:', error);
            return null;
        }
    }
    
    /**
     * Create a spacecraft object
     * @param {Object} spacecraftData - Spacecraft data
     * @param {Object} options - Rendering options
     * @returns {Promise<THREE.Object3D>} Created spacecraft object
     */
    async createSpacecraftObject(spacecraftData, options = {}) {
        const objectId = `spacecraft_${spacecraftData.id}`;
        
        // Check if object already exists
        if (this.objectRegistry.has(objectId)) {
            return this.objectRegistry.get(objectId).object;
        }
        
        try {
            // Create geometry
            const geometry = this.geometryManager.createSpacecraftGeometry(
                spacecraftData.spacecraftType,
                options
            );
            
            // Create material
            const material = await this.materialManager.createSpacecraftMaterial({
                color: spacecraftData.color,
                texturePath: options.texturePath
            });
            
            // Create mesh
            const spacecraft = new THREE.Mesh(geometry, material);
            spacecraft.name = objectId;
            spacecraft.castShadow = true;
            spacecraft.receiveShadow = true;
            
            // Add to scene
            if (this.scene) {
                this.scene.add(spacecraft);
            }
            
            // Register object
            this.objectRegistry.set(objectId, {
                object: spacecraft,
                type: 'spacecraft',
                data: spacecraftData,
                options: options
            });
            
            // Emit event
            if (this.eventSystem) {
                this.eventSystem.emit('objectCreated', { type: 'spacecraft', object: spacecraft, data: spacecraftData });
            }
            
            return spacecraft;
        } catch (error) {
            console.error('Failed to create spacecraft object:', error);
            return null;
        }
    }
    
    /**
     * Add star glow effect
     * @param {THREE.Object3D} star - Star object
     * @param {Object} starData - Star data
     */
    async addStarGlowEffect(star, starData) {
        try {
            // Create glow geometry
            const glowGeometry = this.geometryManager.createSphereGeometry(
                starData.radius * 1.5,
                { segments: 32, rings: 32 }
            );
            
            // Create glow material
            const glowMaterial = new THREE.MeshBasicMaterial({
                color: starData.color,
                transparent: true,
                opacity: 0.3,
                side: THREE.BackSide
            });
            
            // Create glow mesh
            const glow = new THREE.Mesh(glowGeometry, glowMaterial);
            glow.name = `${star.name}_glow`;
            star.add(glow);
            
            // Store reference
            this.visualEffects.set(`${star.name}_glow`, glow);
        } catch (error) {
            console.error('Failed to add star glow effect:', error);
        }
    }
    
    /**
     * Add planet rings
     * @param {THREE.Object3D} planetContainer - Planet container
     * @param {Object} planetData - Planet data
     * @param {Object} options - Rendering options
     */
    async addPlanetRings(planetContainer, planetData, options = {}) {
        try {
            // Create ring geometry
            const ringGeometry = this.geometryManager.createRingGeometry(
                planetData.radius * 1.5,
                planetData.radius * 2.5,
                options
            );
            
            // Create ring material
            const ringMaterial = await this.materialManager.createRingMaterial({
                color: planetData.ringColor || 0xffcc99,
                opacity: 0.8
            });
            
            // Create ring mesh
            const rings = new THREE.Mesh(ringGeometry, ringMaterial);
            rings.name = `${planetContainer.name}_rings`;
            rings.rotation.x = Math.PI / 2;
            planetContainer.add(rings);
            
            // Store reference
            this.visualEffects.set(`${planetContainer.name}_rings`, rings);
        } catch (error) {
            console.error('Failed to add planet rings:', error);
        }
    }
    
    /**
     * Add planet atmosphere
     * @param {THREE.Object3D} planetContainer - Planet container
     * @param {Object} planetData - Planet data
     * @param {Object} options - Rendering options
     */
    async addPlanetAtmosphere(planetContainer, planetData, options = {}) {
        try {
            // Create atmosphere geometry
            const atmosphereGeometry = this.geometryManager.createSphereGeometry(
                planetData.radius * 1.05,
                options
            );
            
            // Create atmosphere material
            const atmosphereMaterial = new THREE.ShaderMaterial({
                vertexShader: `
                    varying vec3 vNormal;
                    void main() {
                        vNormal = normalize(normalMatrix * normal);
                        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                    }
                `,
                fragmentShader: `
                    varying vec3 vNormal;
                    uniform vec3 atmosphereColor;
                    uniform float opacity;
                    void main() {
                        float intensity = pow(0.7 - dot(vNormal, vec3(0.0, 0.0, 1.0)), 2.0);
                        gl_FragColor = vec4(atmosphereColor, intensity * opacity);
                    }
                `,
                uniforms: {
                    atmosphereColor: { value: new THREE.Color(planetData.atmosphereColor || 0x88ccff) },
                    opacity: { value: 0.3 }
                },
                blending: THREE.AdditiveBlending,
                side: THREE.BackSide,
                transparent: true
            });
            
            // Create atmosphere mesh
            const atmosphere = new THREE.Mesh(atmosphereGeometry, atmosphereMaterial);
            atmosphere.name = `${planetContainer.name}_atmosphere`;
            planetContainer.add(atmosphere);
            
            // Store reference
            this.visualEffects.set(`${planetContainer.name}_atmosphere`, atmosphere);
        } catch (error) {
            console.error('Failed to add planet atmosphere:', error);
        }
    }
    
    /**
     * Update star object
     * @param {THREE.Object3D} star - Star object
     * @param {Object} options - Rendering options
     */
    async updateStarObject(star, options = {}) {
        // Update material
        if (star.material) {
            const material = await this.materialManager.createStarMaterial(options);
            star.material = material;
        }
        
        // Update geometry if needed
        if (options.radius && star.geometry) {
            const geometry = this.geometryManager.createStarGeometry(options.radius, options);
            star.geometry.dispose();
            star.geometry = geometry;
        }
    }
    
    /**
     * Update planet object
     * @param {THREE.Object3D} planetContainer - Planet container
     * @param {Object} options - Rendering options
     */
    async updatePlanetObject(planetContainer, options = {}) {
        // Update surface
        const surface = planetContainer.getObjectByName(`${planetContainer.name}_surface`);
        if (surface) {
            const material = await this.materialManager.createPlanetMaterial(
                options.name || 'earth',
                options
            );
            surface.material = material;
            
            if (options.radius) {
                const geometry = this.geometryManager.createPlanetGeometry(options.radius, options);
                surface.geometry.dispose();
                surface.geometry = geometry;
            }
        }
        
        // Update clouds
        const clouds = planetContainer.getObjectByName(`${planetContainer.name}_clouds`);
        if (clouds && options.cloudOpacity !== undefined) {
            clouds.material.opacity = options.cloudOpacity;
        }
    }
    
    /**
     * Update moon object
     * @param {THREE.Object3D} moon - Moon object
     * @param {Object} options - Rendering options
     */
    async updateMoonObject(moon, options = {}) {
        // Update material
        if (moon.material) {
            const material = await this.materialManager.createMoonMaterial(
                options.name || 'moon',
                options
            );
            moon.material = material;
        }
        
        // Update geometry if needed
        if (options.radius && moon.geometry) {
            const geometry = this.geometryManager.createMoonGeometry(options.radius, options);
            moon.geometry.dispose();
            moon.geometry = geometry;
        }
    }
    
    /**
     * Update asteroid object
     * @param {THREE.Object3D} asteroid - Asteroid object
     * @param {Object} options - Rendering options
     */
    async updateAsteroidObject(asteroid, options = {}) {
        // Update material
        if (asteroid.material) {
            const material = await this.materialManager.createAsteroidMaterial(options);
            asteroid.material = material;
        }
        
        // Update geometry if needed
        if (options.radius && asteroid.geometry) {
            const geometry = this.geometryManager.createAsteroidGeometry(options.radius, options);
            asteroid.geometry.dispose();
            asteroid.geometry = geometry;
        }
    }
    
    /**
     * Update comet object
     * @param {THREE.Object3D} cometContainer - Comet container
     * @param {Object} options - Rendering options
     */
    async updateCometObject(cometContainer, options = {}) {
        // Update nucleus
        const nucleus = cometContainer.getObjectByName(`${cometContainer.name}_nucleus`);
        if (nucleus) {
            const material = await this.materialManager.createCometMaterial(options);
            nucleus.material = material;
            
            if (options.radius) {
                const geometry = this.geometryManager.createCometNucleusGeometry(options.radius, options);
                nucleus.geometry.dispose();
                nucleus.geometry = geometry;
            }
        }
        
        // Update coma
        const coma = cometContainer.getObjectByName(`${cometContainer.name}_coma`);
        if (coma && options.radius) {
            const geometry = this.geometryManager.createComaGeometry(options.radius * 3, options);
            coma.geometry.dispose();
            coma.geometry = geometry;
        }
        
        // Update tail
        const tail = cometContainer.getObjectByName(`${cometContainer.name}_tail`);
        if (tail && options.radius) {
            const geometry = this.geometryManager.createTailGeometry(
                options.radius * 20,
                options.radius * 5,
                options
            );
            tail.geometry.dispose();
            tail.geometry = geometry;
        }
    }
    
    /**
     * Update spacecraft object
     * @param {THREE.Object3D} spacecraft - Spacecraft object
     * @param {Object} options - Rendering options
     */
    async updateSpacecraftObject(spacecraft, options = {}) {
        // Update material
        if (spacecraft.material) {
            const material = await this.materialManager.createSpacecraftMaterial(options);
            spacecraft.material = material;
        }
        
        // Update geometry if needed
        if (options.spacecraftType && spacecraft.geometry) {
            const geometry = this.geometryManager.createSpacecraftGeometry(options.spacecraftType, options);
            spacecraft.geometry.dispose();
            spacecraft.geometry = geometry;
        }
    }
    
    /**
     * Get object by ID
     * @param {string} objectId - Object ID
     * @returns {THREE.Object3D} Object or null if not found
     */
    getObject(objectId) {
        const objectData = this.objectRegistry.get(objectId);
        return objectData ? objectData.object : null;
    }
    
    /**
     * Remove object by ID
     * @param {string} objectId - Object ID
     */
    removeObject(objectId) {
        const objectData = this.objectRegistry.get(objectId);
        if (!objectData) return;
        
        const { object, type } = objectData;
        
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
        this.objectRegistry.delete(objectId);
        
        // Emit event
        if (this.eventSystem) {
            this.eventSystem.emit('objectRemoved', { type, object, objectId });
        }
    }
    
    /**
     * Handle window resize
     */
    handleResize() {
        if (this.renderer && this.camera) {
            this.camera.aspect = window.innerWidth / window.innerHeight;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(window.innerWidth, window.innerHeight);
        }
    }
    
    /**
     * Update rendering
     * @param {number} deltaTime - Time elapsed in seconds
     */
    update(deltaTime) {
        // Update visual effects
        this.updateVisualEffects(deltaTime);
        
        // Update performance monitor
        if (this.performanceMonitor) {
            this.performanceMonitor.update('rendering', {
                objects: this.objectRegistry.size,
                quality: this.quality
            });
        }
    }
    
    /**
     * Update visual effects
     * @param {number} deltaTime - Time elapsed in seconds
     */
    updateVisualEffects(deltaTime) {
        // Update star glows
        this.visualEffects.forEach((effect, effectId) => {
            if (effectId.includes('_glow')) {
                // Pulsating effect for star glows
                const time = Date.now() * 0.001;
                effect.material.opacity = 0.3 + Math.sin(time * 2) * 0.1;
            }
        });
    }
    
    /**
     * Clear all objects
     */
    clearAllObjects() {
        // Create a copy of the keys to avoid modification during iteration
        const objectIds = Array.from(this.objectRegistry.keys());
        
        // Remove each object
        objectIds.forEach(objectId => {
            this.removeObject(objectId);
        });
    }
    
    /**
     * Dispose of all resources and clean up
     */
    dispose() {
        // Clear all objects
        this.clearAllObjects();
        
        // Dispose of managers
        this.textureManager.dispose();
        this.materialManager.dispose();
        this.geometryManager.dispose();
        
        // Clear visual effects
        this.visualEffects.clear();
        
        // Remove event listeners
        window.removeEventListener('resize', () => this.handleResize());
    }
}