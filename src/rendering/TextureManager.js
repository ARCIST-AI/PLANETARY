import * as THREE from 'three';
import { MathUtils } from '../utils/index.js';

/**
 * Texture Manager for loading and managing planetary textures
 */
export class TextureManager {
    /**
     * Create a new texture manager
     * @param {Object} config - Configuration object
     */
    constructor(config = {}) {
        this.loadingManager = config.loadingManager || new THREE.LoadingManager();
        this.textureLoader = new THREE.TextureLoader(this.loadingManager);
        this.cubeTextureLoader = new THREE.CubeTextureLoader(this.loadingManager);
        
        // Texture cache
        this.textureCache = new Map();
        
        // Texture quality settings
        this.quality = config.quality || 'high';
        this.maxAnisotropy = config.maxAnisotropy || 16;
        
        // Default texture paths
        this.defaultTexturePaths = {
            sun: '/textures/sun.jpg',
            mercury: '/textures/mercury.jpg',
            venus: '/textures/venus.jpg',
            earth: '/textures/earth.jpg',
            mars: '/textures/mars.jpg',
            jupiter: '/textures/jupiter.jpg',
            saturn: '/textures/saturn.jpg',
            uranus: '/textures/uranus.jpg',
            neptune: '/textures/neptune.jpg',
            moon: '/textures/moon.jpg',
            stars: '/textures/stars.jpg',
            milkyway: '/textures/milkyway.jpg'
        };
        
        // Bump map paths
        this.bumpMapPaths = {
            mercury: '/textures/mercury_bump.jpg',
            venus: '/textures/venus_bump.jpg',
            earth: '/textures/earth_bump.jpg',
            mars: '/textures/mars_bump.jpg',
            moon: '/textures/moon_bump.jpg'
        };
        
        // Specular map paths
        this.specularMapPaths = {
            earth: '/textures/earth_specular.jpg',
            mars: '/textures/mars_specular.jpg',
            moon: '/textures/moon_specular.jpg'
        };
        
        // Normal map paths
        this.normalMapPaths = {
            earth: '/textures/earth_normal.jpg',
            mars: '/textures/mars_normal.jpg',
            moon: '/textures/moon_normal.jpg'
        };
        
        // Cloud texture paths
        this.cloudTexturePaths = {
            earth: '/textures/earth_clouds.jpg',
            venus: '/textures/venus_clouds.jpg',
            jupiter: '/textures/jupiter_clouds.jpg',
            saturn: '/textures/saturn_clouds.jpg',
            uranus: '/textures/uranus_clouds.jpg',
            neptune: '/textures/neptune_clouds.jpg'
        };
        
        // Night texture paths
        this.nightTexturePaths = {
            earth: '/textures/earth_night.jpg'
        };
        
        // Set up loading manager callbacks
        this.setupLoadingManager();
    }
    
    /**
     * Set up loading manager callbacks
     */
    setupLoadingManager() {
        this.loadingManager.onLoad = () => {
            console.log('TextureManager: All textures loaded');
        };
        
        this.loadingManager.onProgress = (url, loaded, total) => {
            console.log(`TextureManager: Loading ${url} (${loaded}/${total})`);
        };
        
        this.loadingManager.onError = (url) => {
            console.error(`TextureManager: Error loading ${url}`);
        };
    }
    
    /**
     * Get texture quality setting
     * @returns {string} Quality setting
     */
    getQuality() {
        return this.quality;
    }
    
    /**
     * Set texture quality setting
     * @param {string} quality - Quality setting ('low', 'medium', 'high', 'ultra')
     */
    setQuality(quality) {
        const validQualities = ['low', 'medium', 'high', 'ultra'];
        if (validQualities.includes(quality)) {
            this.quality = quality;
            // Clear cache when quality changes
            this.clearCache();
        }
    }
    
    /**
     * Get texture size based on quality setting
     * @returns {number} Texture size in pixels
     */
    getTextureSize() {
        switch (this.quality) {
            case 'low': return 512;
            case 'medium': return 1024;
            case 'high': return 2048;
            case 'ultra': return 4096;
            default: return 2048;
        }
    }
    
    /**
     * Load a texture
     * @param {string} path - Texture path
     * @param {Object} options - Loading options
     * @returns {Promise<THREE.Texture>} Loaded texture
     */
    loadTexture(path, options = {}) {
        return new Promise((resolve, reject) => {
            // Check cache first
            if (this.textureCache.has(path)) {
                resolve(this.textureCache.get(path));
                return;
            }
            
            const texture = this.textureLoader.load(
                path,
                (loadedTexture) => {
                    // Apply texture settings
                    this.configureTexture(loadedTexture, options);
                    
                    // Cache the texture
                    this.textureCache.set(path, loadedTexture);
                    
                    resolve(loadedTexture);
                },
                undefined,
                (error) => {
                    console.error(`Failed to load texture: ${path}`, error);
                    reject(error);
                }
            );
        });
    }
    
    /**
     * Load a cube texture
     * @param {Array<string>} paths - Array of 6 texture paths
     * @param {Object} options - Loading options
     * @returns {Promise<THREE.CubeTexture>} Loaded cube texture
     */
    loadCubeTexture(paths, options = {}) {
        return new Promise((resolve, reject) => {
            const cacheKey = paths.join(',');
            
            // Check cache first
            if (this.textureCache.has(cacheKey)) {
                resolve(this.textureCache.get(cacheKey));
                return;
            }
            
            const texture = this.cubeTextureLoader.load(
                paths,
                (loadedTexture) => {
                    // Apply texture settings
                    this.configureTexture(loadedTexture, options);
                    
                    // Cache the texture
                    this.textureCache.set(cacheKey, loadedTexture);
                    
                    resolve(loadedTexture);
                },
                undefined,
                (error) => {
                    console.error(`Failed to load cube texture: ${paths}`, error);
                    reject(error);
                }
            );
        });
    }
    
    /**
     * Configure texture with options
     * @param {THREE.Texture} texture - Texture to configure
     * @param {Object} options - Configuration options
     */
    configureTexture(texture, options = {}) {
        // Set anisotropy
        texture.anisotropy = Math.min(this.maxAnisotropy, this.getMaxAnisotropy());
        
        // Set wrap modes
        texture.wrapS = options.wrapS || THREE.RepeatWrapping;
        texture.wrapT = options.wrapT || THREE.RepeatWrapping;
        
        // Set filtering
        texture.minFilter = options.minFilter || THREE.LinearMipmapLinearFilter;
        texture.magFilter = options.magFilter || THREE.LinearFilter;
        
        // Set encoding
        texture.encoding = options.encoding || THREE.sRGBEncoding;
        
        // Set color space
        texture.colorSpace = options.colorSpace || THREE.SRGBColorSpace;
        
        // Set flip Y
        if (options.flipY !== undefined) {
            texture.flipY = options.flipY;
        }
        
        // Set repeat
        if (options.repeat) {
            texture.repeat.set(options.repeat.x, options.repeat.y);
        }
        
        // Set offset
        if (options.offset) {
            texture.offset.set(options.offset.x, options.offset.y);
        }
        
        // Set rotation
        if (options.rotation !== undefined) {
            texture.rotation = options.rotation;
        }
        
        // Set center
        if (options.center) {
            texture.center.set(options.center.x, options.center.y);
        }
    }
    
    /**
     * Get maximum anisotropy supported by the system
     * @returns {number} Maximum anisotropy
     */
    getMaxAnisotropy() {
        const renderer = this.getRenderer();
        if (renderer) {
            return renderer.capabilities.getMaxAnisotropy();
        }
        return 1;
    }
    
    /**
     * Get the current renderer (if available)
     * @returns {THREE.WebGLRenderer} Renderer instance
     */
    getRenderer() {
        // This should be set by the application
        return this.renderer;
    }
    
    /**
     * Set the renderer instance
     * @param {THREE.WebGLRenderer} renderer - Renderer instance
     */
    setRenderer(renderer) {
        this.renderer = renderer;
    }
    
    /**
     * Load planet textures
     * @param {string} planetName - Planet name
     * @param {Object} options - Loading options
     * @returns {Promise<Object>} Object containing all loaded textures
     */
    async loadPlanetTextures(planetName, options = {}) {
        const textures = {};
        
        // Load main texture
        if (this.defaultTexturePaths[planetName]) {
            try {
                textures.map = await this.loadTexture(
                    this.defaultTexturePaths[planetName],
                    options
                );
            } catch (error) {
                console.warn(`Failed to load main texture for ${planetName}:`, error);
            }
        }
        
        // Load bump map
        if (this.bumpMapPaths[planetName]) {
            try {
                textures.bumpMap = await this.loadTexture(
                    this.bumpMapPaths[planetName],
                    { ...options, colorSpace: THREE.NoColorSpace }
                );
            } catch (error) {
                console.warn(`Failed to load bump map for ${planetName}:`, error);
            }
        }
        
        // Load specular map
        if (this.specularMapPaths[planetName]) {
            try {
                textures.specularMap = await this.loadTexture(
                    this.specularMapPaths[planetName],
                    { ...options, colorSpace: THREE.NoColorSpace }
                );
            } catch (error) {
                console.warn(`Failed to load specular map for ${planetName}:`, error);
            }
        }
        
        // Load normal map
        if (this.normalMapPaths[planetName]) {
            try {
                textures.normalMap = await this.loadTexture(
                    this.normalMapPaths[planetName],
                    { ...options, colorSpace: THREE.NoColorSpace }
                );
            } catch (error) {
                console.warn(`Failed to load normal map for ${planetName}:`, error);
            }
        }
        
        // Load cloud texture
        if (this.cloudTexturePaths[planetName]) {
            try {
                textures.cloudMap = await this.loadTexture(
                    this.cloudTexturePaths[planetName],
                    { ...options, transparent: true }
                );
            } catch (error) {
                console.warn(`Failed to load cloud texture for ${planetName}:`, error);
            }
        }
        
        // Load night texture
        if (this.nightTexturePaths[planetName]) {
            try {
                textures.nightMap = await this.loadTexture(
                    this.nightTexturePaths[planetName],
                    { ...options, colorSpace: THREE.SRGBColorSpace }
                );
            } catch (error) {
                console.warn(`Failed to load night texture for ${planetName}:`, error);
            }
        }
        
        return textures;
    }
    
    /**
     * Load star field texture
     * @param {Object} options - Loading options
     * @returns {Promise<THREE.CubeTexture>} Loaded star field texture
     */
    async loadStarField(options = {}) {
        const paths = [
            this.defaultTexturePaths.stars,
            this.defaultTexturePaths.stars,
            this.defaultTexturePaths.stars,
            this.defaultTexturePaths.stars,
            this.defaultTexturePaths.stars,
            this.defaultTexturePaths.stars
        ];
        
        return this.loadCubeTexture(paths, options);
    }
    
    /**
     * Load milky way texture
     * @param {Object} options - Loading options
     * @returns {Promise<THREE.CubeTexture>} Loaded milky way texture
     */
    async loadMilkyWay(options = {}) {
        const paths = [
            this.defaultTexturePaths.milkyway,
            this.defaultTexturePaths.milkyway,
            this.defaultTexturePaths.milkyway,
            this.defaultTexturePaths.milkyway,
            this.defaultTexturePaths.milkyway,
            this.defaultTexturePaths.milkyway
        ];
        
        return this.loadCubeTexture(paths, options);
    }
    
    /**
     * Create a procedural texture
     * @param {string} type - Texture type
     * @param {Object} options - Texture options
     * @returns {THREE.Texture} Generated texture
     */
    createProceduralTexture(type, options = {}) {
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        
        const size = options.size || 512;
        canvas.width = size;
        canvas.height = size;
        
        switch (type) {
            case 'noise':
                this.createNoiseTexture(context, size, options);
                break;
            case 'gradient':
                this.createGradientTexture(context, size, options);
                break;
            case 'grid':
                this.createGridTexture(context, size, options);
                break;
            case 'stars':
                this.createStarsTexture(context, size, options);
                break;
            default:
                this.createDefaultTexture(context, size, options);
        }
        
        const texture = new THREE.CanvasTexture(canvas);
        this.configureTexture(texture, options);
        
        return texture;
    }
    
    /**
     * Create a noise texture
     * @param {CanvasRenderingContext2D} context - Canvas context
     * @param {number} size - Texture size
     * @param {Object} options - Texture options
     */
    createNoiseTexture(context, size, options = {}) {
        const imageData = context.createImageData(size, size);
        const data = imageData.data;
        
        const scale = options.scale || 0.1;
        const octaves = options.octaves || 4;
        const persistence = options.persistence || 0.5;
        
        for (let y = 0; y < size; y++) {
            for (let x = 0; x < size; x++) {
                let value = 0;
                let amplitude = 1;
                let frequency = scale;
                let maxValue = 0;
                
                for (let i = 0; i < octaves; i++) {
                    value += this.noise(x * frequency, y * frequency) * amplitude;
                    maxValue += amplitude;
                    amplitude *= persistence;
                    frequency *= 2;
                }
                
                value = (value / maxValue) * 255;
                
                const index = (y * size + x) * 4;
                data[index] = value;     // R
                data[index + 1] = value; // G
                data[index + 2] = value; // B
                data[index + 3] = 255;   // A
            }
        }
        
        context.putImageData(imageData, 0, 0);
    }
    
    /**
     * Create a gradient texture
     * @param {CanvasRenderingContext2D} context - Canvas context
     * @param {number} size - Texture size
     * @param {Object} options - Texture options
     */
    createGradientTexture(context, size, options = {}) {
        const gradient = context.createLinearGradient(0, 0, 0, size);
        
        const colors = options.colors || [
            { position: 0, color: '#000000' },
            { position: 1, color: '#ffffff' }
        ];
        
        colors.forEach(colorStop => {
            gradient.addColorStop(colorStop.position, colorStop.color);
        });
        
        context.fillStyle = gradient;
        context.fillRect(0, 0, size, size);
    }
    
    /**
     * Create a grid texture
     * @param {CanvasRenderingContext2D} context - Canvas context
     * @param {number} size - Texture size
     * @param {Object} options - Texture options
     */
    createGridTexture(context, size, options = {}) {
        const cellSize = options.cellSize || 32;
        const lineWidth = options.lineWidth || 1;
        const color = options.color || '#ffffff';
        
        context.fillStyle = '#000000';
        context.fillRect(0, 0, size, size);
        
        context.strokeStyle = color;
        context.lineWidth = lineWidth;
        
        // Draw vertical lines
        for (let x = 0; x <= size; x += cellSize) {
            context.beginPath();
            context.moveTo(x, 0);
            context.lineTo(x, size);
            context.stroke();
        }
        
        // Draw horizontal lines
        for (let y = 0; y <= size; y += cellSize) {
            context.beginPath();
            context.moveTo(0, y);
            context.lineTo(size, y);
            context.stroke();
        }
    }
    
    /**
     * Create a stars texture
     * @param {CanvasRenderingContext2D} context - Canvas context
     * @param {number} size - Texture size
     * @param {Object} options - Texture options
     */
    createStarsTexture(context, size, options = {}) {
        const starCount = options.starCount || 1000;
        const minSize = options.minSize || 0.5;
        const maxSize = options.maxSize || 2;
        const colors = options.colors || ['#ffffff', '#ffffcc', '#ccccff'];
        
        context.fillStyle = '#000000';
        context.fillRect(0, 0, size, size);
        
        for (let i = 0; i < starCount; i++) {
            const x = Math.random() * size;
            const y = Math.random() * size;
            const radius = minSize + Math.random() * (maxSize - minSize);
            const color = colors[Math.floor(Math.random() * colors.length)];
            
            context.beginPath();
            context.arc(x, y, radius, 0, Math.PI * 2);
            context.fillStyle = color;
            context.fill();
        }
    }
    
    /**
     * Create a default texture
     * @param {CanvasRenderingContext2D} context - Canvas context
     * @param {number} size - Texture size
     * @param {Object} options - Texture options
     */
    createDefaultTexture(context, size, options = {}) {
        const color = options.color || '#ff0000';
        
        context.fillStyle = color;
        context.fillRect(0, 0, size, size);
    }
    
    /**
     * Simple noise function
     * @param {number} x - X coordinate
     * @param {number} y - Y coordinate
     * @returns {number} Noise value
     */
    noise(x, y) {
        const X = Math.floor(x) & 255;
        const Y = Math.floor(y) & 255;
        
        x -= Math.floor(x);
        y -= Math.floor(y);
        
        const u = this.fade(x);
        const v = this.fade(y);
        
        const a = this.p[X] + Y;
        const aa = this.p[a];
        const ab = this.p[a + 1];
        const b = this.p[X + 1] + Y;
        const ba = this.p[b];
        const bb = this.p[b + 1];
        
        return this.lerp(v,
            this.lerp(u, this.grad(this.p[aa], x, y), this.grad(this.p[ba], x - 1, y)),
            this.lerp(u, this.grad(this.p[ab], x, y - 1), this.grad(this.p[bb], x - 1, y - 1))
        );
    }
    
    /**
     * Fade function for noise interpolation
     * @param {number} t - Value to fade
     * @returns {number} Faded value
     */
    fade(t) {
        return t * t * t * (t * (t * 6 - 15) + 10);
    }
    
    /**
     * Linear interpolation
     * @param {number} t - Interpolation factor
     * @param {number} a - First value
     * @param {number} b - Second value
     * @returns {number} Interpolated value
     */
    lerp(t, a, b) {
        return a + t * (b - a);
    }
    
    /**
     * Gradient function for noise
     * @param {number} hash - Hash value
     * @param {number} x - X coordinate
     * @param {number} y - Y coordinate
     * @returns {number} Gradient value
     */
    grad(hash, x, y) {
        const h = hash & 15;
        const u = h < 8 ? x : y;
        const v = h < 4 ? y : h === 12 || h === 14 ? x : 0;
        return ((h & 1) === 0 ? u : -u) + ((h & 2) === 0 ? v : -v);
    }
    
    /**
     * Clear texture cache
     */
    clearCache() {
        this.textureCache.forEach(texture => {
            if (texture.dispose) {
                texture.dispose();
            }
        });
        this.textureCache.clear();
    }
    
    /**
     * Dispose of all textures and clean up
     */
    dispose() {
        this.clearCache();
        this.textureLoader.dispose();
        this.cubeTextureLoader.dispose();
    }
}

// Permutation table for noise generation
TextureManager.prototype.p = [];
for (let i = 0; i < 256; i++) {
    TextureManager.prototype.p[i] = Math.floor(Math.random() * 256);
}
for (let i = 0; i < 256; i++) {
    TextureManager.prototype.p[256 + i] = TextureManager.prototype.p[i];
}