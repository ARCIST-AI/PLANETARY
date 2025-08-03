import * as THREE from 'three';
import { MathUtils } from '../utils/index.js';

/**
 * Space Environment for creating and managing space background and environment effects
 */
export class SpaceEnvironment {
    /**
     * Create a new space environment manager
     * @param {Object} config - Configuration object
     */
    constructor(config = {}) {
        // Three.js components
        this.scene = config.scene || null;
        this.renderer = config.renderer || null;
        this.camera = config.camera || null;
        
        // Environment settings
        this.quality = config.quality || 'high';
        this.enableStars = config.enableStars !== undefined ? config.enableStars : true;
        this.enableNebulae = config.enableNebulae !== undefined ? config.enableNebulae : true;
        this.enableGalaxies = config.enableGalaxies !== undefined ? config.enableGalaxies : true;
        
        // Environment registry
        this.stars = null;
        this.nebulae = [];
        this.galaxies = [];
        
        // Detail levels based on quality
        this.detailLevels = {
            low: {
                starCount: 5000,
                nebulaCount: 1,
                galaxyCount: 0,
                starSize: 1.0,
                nebulaSize: 100.0,
                galaxySize: 0
            },
            medium: {
                starCount: 20000,
                nebulaCount: 2,
                galaxyCount: 1,
                starSize: 0.8,
                nebulaSize: 150.0,
                galaxySize: 200.0
            },
            high: {
                starCount: 100000,
                nebulaCount: 3,
                galaxyCount: 2,
                starSize: 0.5,
                nebulaSize: 200.0,
                galaxySize: 300.0
            },
            ultra: {
                starCount: 500000,
                nebulaCount: 5,
                galaxyCount: 3,
                starSize: 0.3,
                nebulaSize: 250.0,
                galaxySize: 400.0
            }
        };
        
        // Default colors
        this.defaultColors = {
            stars: [
                0xffffff, 0xffffee, 0xeeeeff, 0xeeffff,
                0xffeeff, 0xffffdd, 0xddffff, 0xffdddd
            ],
            nebulae: [
                { color: 0x4444ff, opacity: 0.3 },
                { color: 0xff4444, opacity: 0.3 },
                { color: 0x44ff44, opacity: 0.3 },
                { color: 0xff44ff, opacity: 0.3 },
                { color: 0x44ffff, opacity: 0.3 }
            ],
            galaxies: [
                { color: 0xffffff, opacity: 0.2 },
                { color: 0xffffcc, opacity: 0.2 },
                { color: 0xccffff, opacity: 0.2 }
            ]
        };
        
        // Random seed for reproducible results
        this.seed = config.seed || Math.random() * 10000;
    }
    
    /**
     * Initialize the space environment manager
     * @param {THREE.Scene} scene - Three.js scene
     * @param {THREE.WebGLRenderer} renderer - Three.js renderer
     * @param {THREE.Camera} camera - Three.js camera
     */
    init(scene, renderer, camera) {
        this.scene = scene;
        this.renderer = renderer;
        this.camera = camera;
        
        // Create default environment
        this.createDefaultEnvironment();
    }
    
    /**
     * Get environment quality setting
     * @returns {string} Quality setting
     */
    getQuality() {
        return this.quality;
    }
    
    /**
     * Set environment quality setting
     * @param {string} quality - Quality setting ('low', 'medium', 'high', 'ultra')
     */
    setQuality(quality) {
        const validQualities = ['low', 'medium', 'high', 'ultra'];
        if (validQualities.includes(quality)) {
            this.quality = quality;
            
            // Update existing environment
            this.updateEnvironmentQuality();
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
     * Update quality of existing environment
     */
    updateEnvironmentQuality() {
        // Clear existing environment
        this.clearEnvironment();
        
        // Create new environment with updated quality
        this.createDefaultEnvironment();
    }
    
    /**
     * Create default environment
     */
    createDefaultEnvironment() {
        if (!this.scene) return;
        
        const detail = this.getDetailLevel();
        
        // Create starfield
        if (this.enableStars && detail.starCount > 0) {
            this.createStarfield(detail.starCount, detail.starSize);
        }
        
        // Create nebulae
        if (this.enableNebulae && detail.nebulaCount > 0) {
            for (let i = 0; i < detail.nebulaCount; i++) {
                const colorIndex = i % this.defaultColors.nebulae.length;
                this.createNebula(
                    detail.nebulaSize,
                    this.defaultColors.nebulae[colorIndex]
                );
            }
        }
        
        // Create galaxies
        if (this.enableGalaxies && detail.galaxyCount > 0) {
            for (let i = 0; i < detail.galaxyCount; i++) {
                const colorIndex = i % this.defaultColors.galaxies.length;
                this.createGalaxy(
                    detail.galaxySize,
                    this.defaultColors.galaxies[colorIndex]
                );
            }
        }
    }
    
    /**
     * Create a starfield
     * @param {number} count - Number of stars
     * @param {number} size - Star size
     * @returns {THREE.Points} Created starfield
     */
    createStarfield(count, size) {
        if (this.stars) {
            this.removeStars();
        }
        
        // Create geometry
        const geometry = new THREE.BufferGeometry();
        const positions = new Float32Array(count * 3);
        const colors = new Float32Array(count * 3);
        const sizes = new Float32Array(count);
        
        // Set random seed for reproducible results
        const random = this.createSeededRandom(this.seed);
        
        // Generate stars
        for (let i = 0; i < count; i++) {
            const i3 = i * 3;
            
            // Position (random point on sphere)
            const theta = random() * Math.PI * 2;
            const phi = Math.acos(2 * random() - 1);
            const radius = 1000;
            
            positions[i3] = radius * Math.sin(phi) * Math.cos(theta);
            positions[i3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
            positions[i3 + 2] = radius * Math.cos(phi);
            
            // Color
            const colorIndex = Math.floor(random() * this.defaultColors.stars.length);
            const color = new THREE.Color(this.defaultColors.stars[colorIndex]);
            
            // Add some color variation
            const variation = 0.2;
            color.r += (random() - 0.5) * variation;
            color.g += (random() - 0.5) * variation;
            color.b += (random() - 0.5) * variation;
            
            colors[i3] = color.r;
            colors[i3 + 1] = color.g;
            colors[i3 + 2] = color.b;
            
            // Size
            sizes[i] = size * (0.5 + random() * 0.5);
        }
        
        // Set geometry attributes
        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
        geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
        
        // Create material
        const material = new THREE.ShaderMaterial({
            uniforms: {
                time: { value: 0 }
            },
            vertexShader: `
                attribute float size;
                attribute vec3 color;
                
                varying vec3 vColor;
                
                void main() {
                    vColor = color;
                    
                    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
                    gl_PointSize = size * (300.0 / -mvPosition.z);
                    gl_Position = projectionMatrix * mvPosition;
                }
            `,
            fragmentShader: `
                uniform float time;
                
                varying vec3 vColor;
                
                void main() {
                    // Create circular point
                    vec2 center = gl_PointCoord - vec2(0.5);
                    float distance = length(center);
                    
                    if (distance > 0.5) {
                        discard;
                    }
                    
                    // Add some twinkle effect
                    float twinkle = sin(time * 2.0 + gl_FragCoord.x * 0.01) * 0.1 + 0.9;
                    
                    // Set final color
                    gl_FragColor = vec4(vColor * twinkle, 1.0);
                }
            `,
            transparent: true,
            vertexColors: true
        });
        
        // Create points
        this.stars = new THREE.Points(geometry, material);
        this.stars.name = 'starfield';
        
        // Add to scene
        if (this.scene) {
            this.scene.add(this.stars);
        }
        
        return this.stars;
    }
    
    /**
     * Create a nebula
     * @param {number} size - Nebula size
     * @param {Object} colorOptions - Color options
     * @returns {THREE.Mesh} Created nebula
     */
    createNebula(size, colorOptions = {}) {
        // Set random seed for reproducible results
        const random = this.createSeededRandom(this.seed + this.nebulae.length);
        
        // Create geometry
        const geometry = new THREE.SphereGeometry(size, 32, 32);
        
        // Create material
        const material = new THREE.ShaderMaterial({
            uniforms: {
                color: { value: new THREE.Color(colorOptions.color || 0x4444ff) },
                opacity: { value: colorOptions.opacity || 0.3 },
                time: { value: 0 },
                scale: { value: size }
            },
            vertexShader: `
                varying vec3 vPosition;
                varying vec3 vNormal;
                varying vec2 vUv;
                
                void main() {
                    vPosition = position;
                    vNormal = normal;
                    vUv = uv;
                    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                }
            `,
            fragmentShader: `
                uniform vec3 color;
                uniform float opacity;
                uniform float time;
                uniform float scale;
                
                varying vec3 vPosition;
                varying vec3 vNormal;
                varying vec2 vUv;
                
                // Simple noise function
                float noise(vec2 p) {
                    return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453);
                }
                
                void main() {
                    // Create noise pattern
                    vec2 noiseUv = vUv * 5.0 + time * 0.05;
                    float n = noise(noiseUv);
                    n += noise(noiseUv * 2.0) * 0.5;
                    n += noise(noiseUv * 4.0) * 0.25;
                    
                    // Create cloud-like pattern
                    float cloud = pow(n, 2.0);
                    
                    // Add some variation based on position
                    float variation = sin(vPosition.x * 0.1) * 
                                     cos(vPosition.y * 0.1) * 
                                     sin(vPosition.z * 0.1) * 0.2 + 0.8;
                    
                    // Final opacity
                    float alpha = cloud * variation * opacity;
                    
                    // Set final color
                    gl_FragColor = vec4(color, alpha);
                }
            `,
            transparent: true,
            side: THREE.BackSide,
            blending: THREE.AdditiveBlending,
            depthWrite: false
        });
        
        // Create mesh
        const nebula = new THREE.Mesh(geometry, material);
        
        // Position nebula randomly
        const theta = random() * Math.PI * 2;
        const phi = Math.acos(2 * random() - 1);
        const radius = 800;
        
        nebula.position.x = radius * Math.sin(phi) * Math.cos(theta);
        nebula.position.y = radius * Math.sin(phi) * Math.sin(theta);
        nebula.position.z = radius * Math.cos(phi);
        
        // Rotate nebula randomly
        nebula.rotation.x = random() * Math.PI;
        nebula.rotation.y = random() * Math.PI;
        nebula.rotation.z = random() * Math.PI;
        
        nebula.name = `nebula_${this.nebulae.length}`;
        
        // Add to scene
        if (this.scene) {
            this.scene.add(nebula);
        }
        
        // Register nebula
        this.nebulae.push(nebula);
        
        return nebula;
    }
    
    /**
     * Create a galaxy
     * @param {number} size - Galaxy size
     * @param {Object} colorOptions - Color options
     * @returns {THREE.Mesh} Created galaxy
     */
    createGalaxy(size, colorOptions = {}) {
        // Set random seed for reproducible results
        const random = this.createSeededRandom(this.seed + this.galaxies.length + 1000);
        
        // Create geometry
        const geometry = new THREE.BufferGeometry();
        const particleCount = 10000;
        const positions = new Float32Array(particleCount * 3);
        const colors = new Float32Array(particleCount * 3);
        
        // Generate galaxy particles
        for (let i = 0; i < particleCount; i++) {
            const i3 = i * 3;
            
            // Spiral galaxy pattern
            const angle = random() * Math.PI * 4;
            const distance = Math.pow(random(), 0.5) * size;
            const height = (random() - 0.5) * size * 0.1;
            
            // Calculate position
            const x = Math.cos(angle) * distance;
            const y = height;
            const z = Math.sin(angle) * distance;
            
            positions[i3] = x;
            positions[i3 + 1] = y;
            positions[i3 + 2] = z;
            
            // Color based on distance from center
            const color = new THREE.Color(colorOptions.color || 0xffffff);
            const brightness = 1.0 - (distance / size) * 0.5;
            
            colors[i3] = color.r * brightness;
            colors[i3 + 1] = color.g * brightness;
            colors[i3 + 2] = color.b * brightness;
        }
        
        // Set geometry attributes
        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
        
        // Create material
        const material = new THREE.PointsMaterial({
            size: size * 0.01,
            vertexColors: true,
            transparent: true,
            opacity: colorOptions.opacity || 0.8,
            blending: THREE.AdditiveBlending,
            depthWrite: false
        });
        
        // Create points
        const galaxy = new THREE.Points(geometry, material);
        
        // Position galaxy randomly
        const theta = random() * Math.PI * 2;
        const phi = Math.acos(2 * random() - 1);
        const radius = 900;
        
        galaxy.position.x = radius * Math.sin(phi) * Math.cos(theta);
        galaxy.position.y = radius * Math.sin(phi) * Math.sin(theta);
        galaxy.position.z = radius * Math.cos(phi);
        
        // Rotate galaxy randomly
        galaxy.rotation.x = random() * Math.PI;
        galaxy.rotation.y = random() * Math.PI;
        galaxy.rotation.z = random() * Math.PI;
        
        galaxy.name = `galaxy_${this.galaxies.length}`;
        
        // Add to scene
        if (this.scene) {
            this.scene.add(galaxy);
        }
        
        // Register galaxy
        this.galaxies.push(galaxy);
        
        return galaxy;
    }
    
    /**
     * Create a seeded random number generator
     * @param {number} seed - Random seed
     * @returns {Function} Random function
     */
    createSeededRandom(seed) {
        return function() {
            seed = (seed * 9301 + 49297) % 233280;
            return seed / 233280;
        };
    }
    
    /**
     * Remove stars
     */
    removeStars() {
        if (!this.stars) return;
        
        // Remove from scene
        if (this.scene && this.stars.parent === this.scene) {
            this.scene.remove(this.stars);
        }
        
        // Dispose of resources
        if (this.stars.geometry) {
            this.stars.geometry.dispose();
        }
        if (this.stars.material) {
            this.stars.material.dispose();
        }
        
        this.stars = null;
    }
    
    /**
     * Remove nebula by index
     * @param {number} index - Nebula index
     */
    removeNebula(index) {
        if (index < 0 || index >= this.nebulae.length) return;
        
        const nebula = this.nebulae[index];
        
        // Remove from scene
        if (this.scene && nebula.parent === this.scene) {
            this.scene.remove(nebula);
        }
        
        // Dispose of resources
        if (nebula.geometry) {
            nebula.geometry.dispose();
        }
        if (nebula.material) {
            nebula.material.dispose();
        }
        
        // Remove from array
        this.nebulae.splice(index, 1);
    }
    
    /**
     * Remove galaxy by index
     * @param {number} index - Galaxy index
     */
    removeGalaxy(index) {
        if (index < 0 || index >= this.galaxies.length) return;
        
        const galaxy = this.galaxies[index];
        
        // Remove from scene
        if (this.scene && galaxy.parent === this.scene) {
            this.scene.remove(galaxy);
        }
        
        // Dispose of resources
        if (galaxy.geometry) {
            galaxy.geometry.dispose();
        }
        if (galaxy.material) {
            galaxy.material.dispose();
        }
        
        // Remove from array
        this.galaxies.splice(index, 1);
    }
    
    /**
     * Toggle star visibility
     * @param {boolean} visible - Whether stars are visible
     */
    toggleStars(visible) {
        this.enableStars = visible;
        
        if (this.stars) {
            this.stars.visible = visible;
        }
    }
    
    /**
     * Toggle nebula visibility
     * @param {boolean} visible - Whether nebulae are visible
     */
    toggleNebulae(visible) {
        this.enableNebulae = visible;
        
        this.nebulae.forEach(nebula => {
            nebula.visible = visible;
        });
    }
    
    /**
     * Toggle galaxy visibility
     * @param {boolean} visible - Whether galaxies are visible
     */
    toggleGalaxies(visible) {
        this.enableGalaxies = visible;
        
        this.galaxies.forEach(galaxy => {
            galaxy.visible = visible;
        });
    }
    
    /**
     * Update environment effects
     * @param {number} deltaTime - Time elapsed in seconds
     */
    update(deltaTime) {
        const time = Date.now() * 0.001;
        
        // Update stars
        if (this.stars && this.stars.material.uniforms) {
            this.stars.material.uniforms.time.value = time;
        }
        
        // Update nebulae
        this.nebulae.forEach(nebula => {
            if (nebula.material.uniforms) {
                nebula.material.uniforms.time.value = time;
            }
            
            // Slowly rotate nebulae
            nebula.rotation.y += deltaTime * 0.01;
        });
        
        // Update galaxies
        this.galaxies.forEach(galaxy => {
            // Slowly rotate galaxies
            galaxy.rotation.y += deltaTime * 0.005;
        });
    }
    
    /**
     * Clear all environment objects
     */
    clearEnvironment() {
        // Remove stars
        this.removeStars();
        
        // Remove all nebulae
        while (this.nebulae.length > 0) {
            this.removeNebula(0);
        }
        
        // Remove all galaxies
        while (this.galaxies.length > 0) {
            this.removeGalaxy(0);
        }
    }
    
    /**
     * Set environment seed for reproducible results
     * @param {number} seed - Random seed
     */
    setSeed(seed) {
        this.seed = seed;
        
        // Recreate environment with new seed
        this.updateEnvironmentQuality();
    }
    
    /**
     * Dispose of all resources and clean up
     */
    dispose() {
        // Clear environment
        this.clearEnvironment();
    }
}