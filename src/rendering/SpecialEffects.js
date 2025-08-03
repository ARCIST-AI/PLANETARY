import * as THREE from 'three';
import { MathUtils } from '../utils/index.js';

/**
 * Special Effects for creating and managing various visual effects
 */
export class SpecialEffects {
    /**
     * Create a new special effects manager
     * @param {Object} config - Configuration object
     */
    constructor(config = {}) {
        // Three.js components
        this.scene = config.scene || null;
        this.renderer = config.renderer || null;
        this.camera = config.camera || null;
        
        // Effect settings
        this.quality = config.quality || 'high';
        
        // Effect registries
        this.particleSystems = new Map();
        this.lensFlares = new Map();
        this.explosions = new Map();
        this.trails = new Map();
        this.auroras = new Map();
        
        // Detail levels based on quality
        this.detailLevels = {
            low: {
                particleCount: 100,
                flareCount: 3,
                explosionParticles: 200,
                trailLength: 10,
                auroraSegments: 32
            },
            medium: {
                particleCount: 500,
                flareCount: 5,
                explosionParticles: 500,
                trailLength: 20,
                auroraSegments: 64
            },
            high: {
                particleCount: 2000,
                flareCount: 8,
                explosionParticles: 1000,
                trailLength: 50,
                auroraSegments: 128
            },
            ultra: {
                particleCount: 10000,
                flareCount: 12,
                explosionParticles: 5000,
                trailLength: 100,
                auroraSegments: 256
            }
        };
    }
    
    /**
     * Initialize the special effects manager
     * @param {THREE.Scene} scene - Three.js scene
     * @param {THREE.WebGLRenderer} renderer - Three.js renderer
     * @param {THREE.Camera} camera - Three.js camera
     */
    init(scene, renderer, camera) {
        this.scene = scene;
        this.renderer = renderer;
        this.camera = camera;
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
            
            // Update existing effects
            this.updateEffectsQuality();
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
     * Update quality of existing effects
     */
    updateEffectsQuality() {
        // Update all particle systems
        this.particleSystems.forEach((particleData, particleId) => {
            this.updateParticleSystem(particleId, particleData.options);
        });
        
        // Update all lens flares
        this.lensFlares.forEach((flareData, flareId) => {
            this.updateLensFlare(flareId, flareData.options);
        });
        
        // Update all explosions
        this.explosions.forEach((explosionData, explosionId) => {
            this.updateExplosion(explosionId, explosionData.options);
        });
        
        // Update all trails
        this.trails.forEach((trailData, trailId) => {
            this.updateTrail(trailId, trailData.options);
        });
        
        // Update all auroras
        this.auroras.forEach((auroraData, auroraId) => {
            this.updateAurora(auroraId, auroraData.options);
        });
    }
    
    /**
     * Create a particle system
     * @param {string} particleId - Particle system ID
     * @param {Object} options - Particle system options
     * @returns {THREE.Points} Created particle system
     */
    createParticleSystem(particleId, options = {}) {
        // Check if particle system already exists
        if (this.particleSystems.has(particleId)) {
            return this.particleSystems.get(particleId).object;
        }
        
        // Get detail level
        const detail = this.getDetailLevel();
        
        // Merge with default options
        const mergedOptions = {
            count: detail.particleCount,
            size: 1.0,
            color: 0xffffff,
            opacity: 1.0,
            position: new THREE.Vector3(0, 0, 0),
            velocity: new THREE.Vector3(0, 0, 0),
            spread: 1.0,
            lifetime: 5.0,
            blending: THREE.AdditiveBlending,
            ...options
        };
        
        // Create geometry
        const geometry = new THREE.BufferGeometry();
        const positions = new Float32Array(mergedOptions.count * 3);
        const velocities = new Float32Array(mergedOptions.count * 3);
        const lifetimes = new Float32Array(mergedOptions.count);
        const sizes = new Float32Array(mergedOptions.count);
        
        // Initialize particles
        for (let i = 0; i < mergedOptions.count; i++) {
            const i3 = i * 3;
            
            // Position
            positions[i3] = mergedOptions.position.x + (Math.random() - 0.5) * mergedOptions.spread;
            positions[i3 + 1] = mergedOptions.position.y + (Math.random() - 0.5) * mergedOptions.spread;
            positions[i3 + 2] = mergedOptions.position.z + (Math.random() - 0.5) * mergedOptions.spread;
            
            // Velocity
            velocities[i3] = mergedOptions.velocity.x + (Math.random() - 0.5) * mergedOptions.spread * 0.1;
            velocities[i3 + 1] = mergedOptions.velocity.y + (Math.random() - 0.5) * mergedOptions.spread * 0.1;
            velocities[i3 + 2] = mergedOptions.velocity.z + (Math.random() - 0.5) * mergedOptions.spread * 0.1;
            
            // Lifetime
            lifetimes[i] = Math.random() * mergedOptions.lifetime;
            
            // Size
            sizes[i] = mergedOptions.size * (0.5 + Math.random() * 0.5);
        }
        
        // Set geometry attributes
        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geometry.setAttribute('velocity', new THREE.BufferAttribute(velocities, 3));
        geometry.setAttribute('lifetime', new THREE.BufferAttribute(lifetimes, 1));
        geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
        
        // Create material
        const material = new THREE.ShaderMaterial({
            uniforms: {
                color: { value: new THREE.Color(mergedOptions.color) },
                opacity: { value: mergedOptions.opacity },
                time: { value: 0 },
                maxLifetime: { value: mergedOptions.lifetime }
            },
            vertexShader: `
                attribute float size;
                attribute float lifetime;
                attribute vec3 velocity;
                
                uniform float time;
                uniform float maxLifetime;
                
                varying float vLifetime;
                
                void main() {
                    vLifetime = lifetime;
                    
                    // Calculate age
                    float age = time - lifetime;
                    float normalizedAge = age / maxLifetime;
                    
                    // Skip dead particles
                    if (normalizedAge > 1.0) {
                        gl_Position = vec4(0.0, 0.0, 0.0, 0.0);
                        return;
                    }
                    
                    // Update position
                    vec3 newPosition = position + velocity * age;
                    
                    // Calculate size based on age
                    float currentSize = size * (1.0 - normalizedAge * 0.5);
                    
                    vec4 mvPosition = modelViewMatrix * vec4(newPosition, 1.0);
                    gl_PointSize = currentSize * (300.0 / -mvPosition.z);
                    gl_Position = projectionMatrix * mvPosition;
                }
            `,
            fragmentShader: `
                uniform vec3 color;
                uniform float opacity;
                uniform float time;
                uniform float maxLifetime;
                
                varying float vLifetime;
                
                void main() {
                    // Calculate age
                    float age = time - vLifetime;
                    float normalizedAge = age / maxLifetime;
                    
                    // Skip dead particles
                    if (normalizedAge > 1.0) {
                        discard;
                    }
                    
                    // Create circular point
                    vec2 center = gl_PointCoord - vec2(0.5);
                    float distance = length(center);
                    
                    if (distance > 0.5) {
                        discard;
                    }
                    
                    // Calculate opacity based on age
                    float currentOpacity = opacity * (1.0 - normalizedAge);
                    
                    // Set final color
                    gl_FragColor = vec4(color, currentOpacity);
                }
            `,
            transparent: true,
            blending: mergedOptions.blending,
            depthWrite: false
        });
        
        // Create points
        const particleSystem = new THREE.Points(geometry, material);
        particleSystem.name = particleId;
        
        // Add to scene
        if (this.scene) {
            this.scene.add(particleSystem);
        }
        
        // Register particle system
        this.particleSystems.set(particleId, {
            object: particleSystem,
            options: mergedOptions,
            startTime: Date.now() * 0.001
        });
        
        return particleSystem;
    }
    
    /**
     * Create a lens flare
     * @param {string} flareId - Lens flare ID
     * @param {Object} options - Lens flare options
     * @returns {THREE.Group} Created lens flare
     */
    createLensFlare(flareId, options = {}) {
        // Check if lens flare already exists
        if (this.lensFlares.has(flareId)) {
            return this.lensFlares.get(flareId).object;
        }
        
        // Get detail level
        const detail = this.getDetailLevel();
        
        // Merge with default options
        const mergedOptions = {
            position: new THREE.Vector3(0, 0, 0),
            color: 0xffffff,
            size: 100,
            count: detail.flareCount,
            intensity: 1.0,
            ...options
        };
        
        // Create flare container
        const flareContainer = new THREE.Group();
        flareContainer.name = flareId;
        
        // Create flare elements
        for (let i = 0; i < mergedOptions.count; i++) {
            const size = mergedOptions.size * (1.0 - i * 0.1);
            const opacity = mergedOptions.intensity * (1.0 - i * 0.2);
            
            // Create flare element
            const flareElement = this.createFlareElement(size, {
                color: mergedOptions.color,
                opacity: opacity
            });
            
            flareElement.position.x = i * 20;
            flareContainer.add(flareElement);
        }
        
        // Set position
        flareContainer.position.copy(mergedOptions.position);
        
        // Add to scene
        if (this.scene) {
            this.scene.add(flareContainer);
        }
        
        // Register lens flare
        this.lensFlares.set(flareId, {
            object: flareContainer,
            options: mergedOptions
        });
        
        return flareContainer;
    }
    
    /**
     * Create a flare element
     * @param {number} size - Flare size
     * @param {Object} options - Flare options
     * @returns {THREE.Mesh} Created flare element
     */
    createFlareElement(size, options = {}) {
        // Create geometry
        const geometry = new THREE.PlaneGeometry(size, size);
        
        // Create material
        const material = new THREE.ShaderMaterial({
            uniforms: {
                color: { value: new THREE.Color(options.color || 0xffffff) },
                opacity: { value: options.opacity || 1.0 },
                time: { value: 0 }
            },
            vertexShader: `
                varying vec2 vUv;
                
                void main() {
                    vUv = uv;
                    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                }
            `,
            fragmentShader: `
                uniform vec3 color;
                uniform float opacity;
                uniform float time;
                
                varying vec2 vUv;
                
                void main() {
                    // Create circular gradient
                    vec2 center = vUv - vec2(0.5);
                    float distance = length(center);
                    
                    if (distance > 0.5) {
                        discard;
                    }
                    
                    // Create gradient
                    float gradient = 1.0 - (distance * 2.0);
                    gradient = pow(gradient, 2.0);
                    
                    // Add some animation
                    float pulse = sin(time * 3.0) * 0.1 + 0.9;
                    
                    // Set final color
                    gl_FragColor = vec4(color, opacity * gradient * pulse);
                }
            `,
            transparent: true,
            blending: THREE.AdditiveBlending,
            depthWrite: false,
            side: THREE.DoubleSide
        });
        
        // Create mesh
        const flareElement = new THREE.Mesh(geometry, material);
        
        // Make it always face the camera
        flareElement.lookAt(this.camera ? this.camera.position : new THREE.Vector3(0, 0, 1));
        
        return flareElement;
    }
    
    /**
     * Create an explosion effect
     * @param {string} explosionId - Explosion ID
     * @param {Object} options - Explosion options
     * @returns {THREE.Group} Created explosion
     */
    createExplosion(explosionId, options = {}) {
        // Check if explosion already exists
        if (this.explosions.has(explosionId)) {
            return this.explosions.get(explosionId).object;
        }
        
        // Get detail level
        const detail = this.getDetailLevel();
        
        // Merge with default options
        const mergedOptions = {
            position: new THREE.Vector3(0, 0, 0),
            color: 0xff4400,
            secondaryColor: 0xffaa00,
            size: 10,
            count: detail.explosionParticles,
            duration: 2.0,
            ...options
        };
        
        // Create explosion container
        const explosionContainer = new THREE.Group();
        explosionContainer.name = explosionId;
        
        // Create explosion particles
        const particleSystem = this.createExplosionParticles(mergedOptions);
        explosionContainer.add(particleSystem);
        
        // Create shockwave
        const shockwave = this.createShockwave(mergedOptions);
        explosionContainer.add(shockwave);
        
        // Set position
        explosionContainer.position.copy(mergedOptions.position);
        
        // Add to scene
        if (this.scene) {
            this.scene.add(explosionContainer);
        }
        
        // Register explosion
        this.explosions.set(explosionId, {
            object: explosionContainer,
            options: mergedOptions,
            startTime: Date.now() * 0.001
        });
        
        return explosionContainer;
    }
    
    /**
     * Create explosion particles
     * @param {Object} options - Explosion options
     * @returns {THREE.Points} Created explosion particles
     */
    createExplosionParticles(options) {
        // Create geometry
        const geometry = new THREE.BufferGeometry();
        const positions = new Float32Array(options.count * 3);
        const velocities = new Float32Array(options.count * 3);
        const colors = new Float32Array(options.count * 3);
        const sizes = new Float32Array(options.count);
        
        // Initialize particles
        for (let i = 0; i < options.count; i++) {
            const i3 = i * 3;
            
            // Random spherical direction
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.acos(2 * Math.random() - 1);
            const speed = Math.random() * options.size;
            
            // Position (start at center)
            positions[i3] = 0;
            positions[i3 + 1] = 0;
            positions[i3 + 2] = 0;
            
            // Velocity
            velocities[i3] = Math.sin(phi) * Math.cos(theta) * speed;
            velocities[i3 + 1] = Math.sin(phi) * Math.sin(theta) * speed;
            velocities[i3 + 2] = Math.cos(phi) * speed;
            
            // Color (mix between primary and secondary)
            const mix = Math.random();
            const color1 = new THREE.Color(options.color);
            const color2 = new THREE.Color(options.secondaryColor);
            const color = color1.clone().lerp(color2, mix);
            
            colors[i3] = color.r;
            colors[i3 + 1] = color.g;
            colors[i3 + 2] = color.b;
            
            // Size
            sizes[i] = options.size * (0.5 + Math.random() * 0.5);
        }
        
        // Set geometry attributes
        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geometry.setAttribute('velocity', new THREE.BufferAttribute(velocities, 3));
        geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
        geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
        
        // Create material
        const material = new THREE.ShaderMaterial({
            uniforms: {
                time: { value: 0 },
                duration: { value: options.duration }
            },
            vertexShader: `
                attribute float size;
                attribute vec3 velocity;
                attribute vec3 color;
                
                uniform float time;
                uniform float duration;
                
                varying vec3 vColor;
                
                void main() {
                    vColor = color;
                    
                    // Calculate age
                    float normalizedAge = time / duration;
                    
                    // Skip if explosion is finished
                    if (normalizedAge > 1.0) {
                        gl_Position = vec4(0.0, 0.0, 0.0, 0.0);
                        return;
                    }
                    
                    // Update position
                    vec3 newPosition = position + velocity * time;
                    
                    // Calculate size based on age
                    float currentSize = size * (1.0 - normalizedAge * 0.8);
                    
                    vec4 mvPosition = modelViewMatrix * vec4(newPosition, 1.0);
                    gl_PointSize = currentSize * (300.0 / -mvPosition.z);
                    gl_Position = projectionMatrix * mvPosition;
                }
            `,
            fragmentShader: `
                uniform float time;
                uniform float duration;
                
                varying vec3 vColor;
                
                void main() {
                    // Calculate age
                    float normalizedAge = time / duration;
                    
                    // Skip if explosion is finished
                    if (normalizedAge > 1.0) {
                        discard;
                    }
                    
                    // Create circular point
                    vec2 center = gl_PointCoord - vec2(0.5);
                    float distance = length(center);
                    
                    if (distance > 0.5) {
                        discard;
                    }
                    
                    // Calculate opacity based on age
                    float opacity = 1.0 - normalizedAge;
                    
                    // Set final color
                    gl_FragColor = vec4(vColor, opacity);
                }
            `,
            transparent: true,
            blending: THREE.AdditiveBlending,
            depthWrite: false,
            vertexColors: true
        });
        
        // Create points
        const particles = new THREE.Points(geometry, material);
        
        return particles;
    }
    
    /**
     * Create a shockwave effect
     * @param {Object} options - Shockwave options
     * @returns {THREE.Mesh} Created shockwave
     */
    createShockwave(options) {
        // Create geometry
        const geometry = new THREE.RingGeometry(0.1, options.size * 0.5, 32);
        
        // Create material
        const material = new THREE.ShaderMaterial({
            uniforms: {
                color: { value: new THREE.Color(options.secondaryColor || 0xffaa00) },
                time: { value: 0 },
                duration: { value: options.duration },
                maxSize: { value: options.size }
            },
            vertexShader: `
                varying vec2 vUv;
                
                void main() {
                    vUv = uv;
                    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                }
            `,
            fragmentShader: `
                uniform vec3 color;
                uniform float time;
                uniform float duration;
                uniform float maxSize;
                
                varying vec2 vUv;
                
                void main() {
                    // Calculate age
                    float normalizedAge = time / duration;
                    
                    // Skip if shockwave is finished
                    if (normalizedAge > 1.0) {
                        discard;
                    }
                    
                    // Calculate distance from center
                    float distance = length(vUv - vec2(0.5));
                    
                    // Create ring effect
                    float ringWidth = 0.1;
                    float ringPosition = normalizedAge;
                    float ring = 1.0 - abs(distance - ringPosition) / ringWidth;
                    
                    // Calculate opacity
                    float opacity = ring * (1.0 - normalizedAge);
                    
                    // Set final color
                    gl_FragColor = vec4(color, opacity);
                }
            `,
            transparent: true,
            blending: THREE.AdditiveBlending,
            depthWrite: false,
            side: THREE.DoubleSide
        });
        
        // Create mesh
        const shockwave = new THREE.Mesh(geometry, material);
        
        // Make it always face the camera
        shockwave.lookAt(this.camera ? this.camera.position : new THREE.Vector3(0, 0, 1));
        
        return shockwave;
    }
    
    /**
     * Create a trail effect
     * @param {string} trailId - Trail ID
     * @param {Object} options - Trail options
     * @returns {THREE.Line} Created trail
     */
    createTrail(trailId, options = {}) {
        // Check if trail already exists
        if (this.trails.has(trailId)) {
            return this.trails.get(trailId).object;
        }
        
        // Get detail level
        const detail = this.getDetailLevel();
        
        // Merge with default options
        const mergedOptions = {
            color: 0x4444ff,
            opacity: 0.8,
            width: 1.0,
            length: detail.trailLength,
            lifetime: 1.0,
            ...options
        };
        
        // Create geometry
        const geometry = new THREE.BufferGeometry();
        const positions = new Float32Array(mergedOptions.length * 3);
        const times = new Float32Array(mergedOptions.length);
        
        // Initialize trail
        for (let i = 0; i < mergedOptions.length; i++) {
            const i3 = i * 3;
            
            // Position
            positions[i3] = 0;
            positions[i3 + 1] = 0;
            positions[i3 + 2] = 0;
            
            // Time
            times[i] = 0;
        }
        
        // Set geometry attributes
        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geometry.setAttribute('time', new THREE.BufferAttribute(times, 1));
        
        // Create material
        const material = new THREE.ShaderMaterial({
            uniforms: {
                color: { value: new THREE.Color(mergedOptions.color) },
                opacity: { value: mergedOptions.opacity },
                currentTime: { value: 0 },
                lifetime: { value: mergedOptions.lifetime }
            },
            vertexShader: `
                attribute float time;
                
                uniform float currentTime;
                uniform float lifetime;
                
                varying float vAge;
                
                void main() {
                    // Calculate age
                    float age = currentTime - time;
                    vAge = age / lifetime;
                    
                    // Skip old points
                    if (vAge > 1.0) {
                        gl_Position = vec4(0.0, 0.0, 0.0, 0.0);
                        return;
                    }
                    
                    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                }
            `,
            fragmentShader: `
                uniform vec3 color;
                uniform float opacity;
                
                varying float vAge;
                
                void main() {
                    // Skip old points
                    if (vAge > 1.0) {
                        discard;
                    }
                    
                    // Calculate opacity based on age
                    float currentOpacity = opacity * (1.0 - vAge);
                    
                    // Set final color
                    gl_FragColor = vec4(color, currentOpacity);
                }
            `,
            transparent: true,
            blending: THREE.AdditiveBlending,
            depthWrite: false
        });
        
        // Create line
        const trail = new THREE.Line(geometry, material);
        trail.name = trailId;
        
        // Add to scene
        if (this.scene) {
            this.scene.add(trail);
        }
        
        // Register trail
        this.trails.set(trailId, {
            object: trail,
            options: mergedOptions,
            positions: [],
            times: []
        });
        
        return trail;
    }
    
    /**
     * Create an aurora effect
     * @param {string} auroraId - Aurora ID
     * @param {Object} options - Aurora options
     * @returns {THREE.Mesh} Created aurora
     */
    createAurora(auroraId, options = {}) {
        // Check if aurora already exists
        if (this.auroras.has(auroraId)) {
            return this.auroras.get(auroraId).object;
        }
        
        // Get detail level
        const detail = this.getDetailLevel();
        
        // Merge with default options
        const mergedOptions = {
            position: new THREE.Vector3(0, 100, 0),
            size: 200,
            color1: 0x00ff00,
            color2: 0xff00ff,
            intensity: 0.5,
            speed: 0.5,
            ...options
        };
        
        // Create geometry
        const geometry = new THREE.PlaneGeometry(mergedOptions.size, mergedOptions.size, detail.auroraSegments, detail.auroraSegments);
        
        // Create material
        const material = new THREE.ShaderMaterial({
            uniforms: {
                color1: { value: new THREE.Color(mergedOptions.color1) },
                color2: { value: new THREE.Color(mergedOptions.color2) },
                intensity: { value: mergedOptions.intensity },
                time: { value: 0 },
                speed: { value: mergedOptions.speed }
            },
            vertexShader: `
                varying vec2 vUv;
                varying vec3 vPosition;
                
                void main() {
                    vUv = uv;
                    vPosition = position;
                    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                }
            `,
            fragmentShader: `
                uniform vec3 color1;
                uniform vec3 color2;
                uniform float intensity;
                uniform float time;
                uniform float speed;
                
                varying vec2 vUv;
                varying vec3 vPosition;
                
                // Simple noise function
                float noise(vec2 p) {
                    return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453);
                }
                
                void main() {
                    // Create wave pattern
                    vec2 uv = vUv;
                    float wave1 = sin(uv.x * 10.0 + time * speed) * 0.5 + 0.5;
                    float wave2 = sin(uv.x * 15.0 + time * speed * 1.5) * 0.5 + 0.5;
                    float wave3 = sin(uv.x * 20.0 + time * speed * 2.0) * 0.5 + 0.5;
                    
                    // Combine waves
                    float wave = (wave1 + wave2 * 0.5 + wave3 * 0.25) / 1.75;
                    
                    // Create curtain effect
                    float curtain = 1.0 - abs(uv.y - wave) * 2.0;
                    curtain = max(0.0, curtain);
                    
                    // Add noise
                    float n = noise(uv * 20.0 + time * speed * 0.5);
                    curtain *= n * 0.5 + 0.5;
                    
                    // Mix colors
                    vec3 color = mix(color1, color2, wave);
                    
                    // Set final color
                    gl_FragColor = vec4(color, curtain * intensity);
                }
            `,
            transparent: true,
            blending: THREE.AdditiveBlending,
            depthWrite: false,
            side: THREE.DoubleSide
        });
        
        // Create mesh
        const aurora = new THREE.Mesh(geometry, material);
        aurora.name = auroraId;
        
        // Set position
        aurora.position.copy(mergedOptions.position);
        
        // Add to scene
        if (this.scene) {
            this.scene.add(aurora);
        }
        
        // Register aurora
        this.auroras.set(auroraId, {
            object: aurora,
            options: mergedOptions
        });
        
        return aurora;
    }
    
    /**
     * Update particle system
     * @param {string} particleId - Particle system ID
     * @param {Object} options - Particle system options
     */
    updateParticleSystem(particleId, options = {}) {
        const particleData = this.particleSystems.get(particleId);
        if (!particleData) return;
        
        const { object } = particleData;
        
        // Remove old particle system
        if (this.scene && object.parent === this.scene) {
            this.scene.remove(object);
        }
        
        // Dispose of resources
        if (object.geometry) {
            object.geometry.dispose();
        }
        if (object.material) {
            object.material.dispose();
        }
        
        // Create new particle system
        const newParticleSystem = this.createParticleSystem(
            particleId,
            { ...particleData.options, ...options }
        );
        
        // Update registry
        particleData.object = newParticleSystem;
        particleData.options = { ...particleData.options, ...options };
    }
    
    /**
     * Update lens flare
     * @param {string} flareId - Lens flare ID
     * @param {Object} options - Lens flare options
     */
    updateLensFlare(flareId, options = {}) {
        const flareData = this.lensFlares.get(flareId);
        if (!flareData) return;
        
        const { object } = flareData;
        
        // Remove old lens flare
        if (this.scene && object.parent === this.scene) {
            this.scene.remove(object);
        }
        
        // Dispose of resources
        object.traverse(child => {
            if (child.isMesh) {
                if (child.geometry) {
                    child.geometry.dispose();
                }
                if (child.material) {
                    child.material.dispose();
                }
            }
        });
        
        // Create new lens flare
        const newLensFlare = this.createLensFlare(
            flareId,
            { ...flareData.options, ...options }
        );
        
        // Update registry
        flareData.object = newLensFlare;
        flareData.options = { ...flareData.options, ...options };
    }
    
    /**
     * Update explosion
     * @param {string} explosionId - Explosion ID
     * @param {Object} options - Explosion options
     */
    updateExplosion(explosionId, options = {}) {
        const explosionData = this.explosions.get(explosionId);
        if (!explosionData) return;
        
        const { object } = explosionData;
        
        // Remove old explosion
        if (this.scene && object.parent === this.scene) {
            this.scene.remove(object);
        }
        
        // Dispose of resources
        object.traverse(child => {
            if (child.isMesh || child.isPoints) {
                if (child.geometry) {
                    child.geometry.dispose();
                }
                if (child.material) {
                    child.material.dispose();
                }
            }
        });
        
        // Create new explosion
        const newExplosion = this.createExplosion(
            explosionId,
            { ...explosionData.options, ...options }
        );
        
        // Update registry
        explosionData.object = newExplosion;
        explosionData.options = { ...explosionData.options, ...options };
    }
    
    /**
     * Update trail
     * @param {string} trailId - Trail ID
     * @param {Object} options - Trail options
     */
    updateTrail(trailId, options = {}) {
        const trailData = this.trails.get(trailId);
        if (!trailData) return;
        
        const { object } = trailData;
        
        // Remove old trail
        if (this.scene && object.parent === this.scene) {
            this.scene.remove(object);
        }
        
        // Dispose of resources
        if (object.geometry) {
            object.geometry.dispose();
        }
        if (object.material) {
            object.material.dispose();
        }
        
        // Create new trail
        const newTrail = this.createTrail(
            trailId,
            { ...trailData.options, ...options }
        );
        
        // Update registry
        trailData.object = newTrail;
        trailData.options = { ...trailData.options, ...options };
    }
    
    /**
     * Update aurora
     * @param {string} auroraId - Aurora ID
     * @param {Object} options - Aurora options
     */
    updateAurora(auroraId, options = {}) {
        const auroraData = this.auroras.get(auroraId);
        if (!auroraData) return;
        
        const { object } = auroraData;
        
        // Remove old aurora
        if (this.scene && object.parent === this.scene) {
            this.scene.remove(object);
        }
        
        // Dispose of resources
        if (object.geometry) {
            object.geometry.dispose();
        }
        if (object.material) {
            object.material.dispose();
        }
        
        // Create new aurora
        const newAurora = this.createAurora(
            auroraId,
            { ...auroraData.options, ...options }
        );
        
        // Update registry
        auroraData.object = newAurora;
        auroraData.options = { ...auroraData.options, ...options };
    }
    
    /**
     * Add position to trail
     * @param {string} trailId - Trail ID
     * @param {THREE.Vector3} position - Position to add
     */
    addTrailPosition(trailId, position) {
        const trailData = this.trails.get(trailId);
        if (!trailData) return;
        
        const { object, options, positions, times } = trailData;
        
        // Add new position
        positions.push(position.clone());
        times.push(Date.now() * 0.001);
        
        // Keep only the most recent positions
        if (positions.length > options.length) {
            positions.shift();
            times.shift();
        }
        
        // Update geometry
        const positionsArray = new Float32Array(options.length * 3);
        const timesArray = new Float32Array(options.length);
        
        // Initialize arrays
        for (let i = 0; i < options.length; i++) {
            const i3 = i * 3;
            
            if (i < positions.length) {
                positionsArray[i3] = positions[i].x;
                positionsArray[i3 + 1] = positions[i].y;
                positionsArray[i3 + 2] = positions[i].z;
                timesArray[i] = times[i];
            } else {
                positionsArray[i3] = 0;
                positionsArray[i3 + 1] = 0;
                positionsArray[i3 + 2] = 0;
                timesArray[i] = 0;
            }
        }
        
        // Update geometry attributes
        object.geometry.setAttribute('position', new THREE.BufferAttribute(positionsArray, 3));
        object.geometry.setAttribute('time', new THREE.BufferAttribute(timesArray, 1));
    }
    
    /**
     * Get effect by ID and type
     * @param {string} effectId - Effect ID
     * @param {string} type - Effect type
     * @returns {THREE.Object3D} Effect or null if not found
     */
    getEffect(effectId, type) {
        switch (type) {
            case 'particle':
                const particleData = this.particleSystems.get(effectId);
                return particleData ? particleData.object : null;
            case 'flare':
                const flareData = this.lensFlares.get(effectId);
                return flareData ? flareData.object : null;
            case 'explosion':
                const explosionData = this.explosions.get(effectId);
                return explosionData ? explosionData.object : null;
            case 'trail':
                const trailData = this.trails.get(effectId);
                return trailData ? trailData.object : null;
            case 'aurora':
                const auroraData = this.auroras.get(effectId);
                return auroraData ? auroraData.object : null;
            default:
                return null;
        }
    }
    
    /**
     * Remove effect by ID and type
     * @param {string} effectId - Effect ID
     * @param {string} type - Effect type
     */
    removeEffect(effectId, type) {
        switch (type) {
            case 'particle':
                this.removeParticleSystem(effectId);
                break;
            case 'flare':
                this.removeLensFlare(effectId);
                break;
            case 'explosion':
                this.removeExplosion(effectId);
                break;
            case 'trail':
                this.removeTrail(effectId);
                break;
            case 'aurora':
                this.removeAurora(effectId);
                break;
        }
    }
    
    /**
     * Remove particle system by ID
     * @param {string} particleId - Particle system ID
     */
    removeParticleSystem(particleId) {
        const particleData = this.particleSystems.get(particleId);
        if (!particleData) return;
        
        const { object } = particleData;
        
        // Remove from scene
        if (this.scene && object.parent === this.scene) {
            this.scene.remove(object);
        }
        
        // Dispose of resources
        if (object.geometry) {
            object.geometry.dispose();
        }
        if (object.material) {
            object.material.dispose();
        }
        
        // Remove from registry
        this.particleSystems.delete(particleId);
    }
    
    /**
     * Remove lens flare by ID
     * @param {string} flareId - Lens flare ID
     */
    removeLensFlare(flareId) {
        const flareData = this.lensFlares.get(flareId);
        if (!flareData) return;
        
        const { object } = flareData;
        
        // Remove from scene
        if (this.scene && object.parent === this.scene) {
            this.scene.remove(object);
        }
        
        // Dispose of resources
        object.traverse(child => {
            if (child.isMesh) {
                if (child.geometry) {
                    child.geometry.dispose();
                }
                if (child.material) {
                    child.material.dispose();
                }
            }
        });
        
        // Remove from registry
        this.lensFlares.delete(flareId);
    }
    
    /**
     * Remove explosion by ID
     * @param {string} explosionId - Explosion ID
     */
    removeExplosion(explosionId) {
        const explosionData = this.explosions.get(explosionId);
        if (!explosionData) return;
        
        const { object } = explosionData;
        
        // Remove from scene
        if (this.scene && object.parent === this.scene) {
            this.scene.remove(object);
        }
        
        // Dispose of resources
        object.traverse(child => {
            if (child.isMesh || child.isPoints) {
                if (child.geometry) {
                    child.geometry.dispose();
                }
                if (child.material) {
                    child.material.dispose();
                }
            }
        });
        
        // Remove from registry
        this.explosions.delete(explosionId);
    }
    
    /**
     * Remove trail by ID
     * @param {string} trailId - Trail ID
     */
    removeTrail(trailId) {
        const trailData = this.trails.get(trailId);
        if (!trailData) return;
        
        const { object } = trailData;
        
        // Remove from scene
        if (this.scene && object.parent === this.scene) {
            this.scene.remove(object);
        }
        
        // Dispose of resources
        if (object.geometry) {
            object.geometry.dispose();
        }
        if (object.material) {
            object.material.dispose();
        }
        
        // Remove from registry
        this.trails.delete(trailId);
    }
    
    /**
     * Remove aurora by ID
     * @param {string} auroraId - Aurora ID
     */
    removeAurora(auroraId) {
        const auroraData = this.auroras.get(auroraId);
        if (!auroraData) return;
        
        const { object } = auroraData;
        
        // Remove from scene
        if (this.scene && object.parent === this.scene) {
            this.scene.remove(object);
        }
        
        // Dispose of resources
        if (object.geometry) {
            object.geometry.dispose();
        }
        if (object.material) {
            object.material.dispose();
        }
        
        // Remove from registry
        this.auroras.delete(auroraId);
    }
    
    /**
     * Update effects
     * @param {number} deltaTime - Time elapsed in seconds
     */
    update(deltaTime) {
        const time = Date.now() * 0.001;
        
        // Update particle systems
        this.particleSystems.forEach((particleData, particleId) => {
            const { object, startTime, options } = particleData;
            
            // Check if particle system has expired
            if (time - startTime > options.lifetime) {
                this.removeParticleSystem(particleId);
                return;
            }
            
            // Update shader uniforms
            if (object.material.uniforms) {
                if (object.material.uniforms.time) {
                    object.material.uniforms.time.value = time - startTime;
                }
            }
        });
        
        // Update lens flares
        this.lensFlares.forEach((flareData) => {
            const { object } = flareData;
            
            // Update flare elements to face camera
            object.traverse(child => {
                if (child.isMesh) {
                    child.lookAt(this.camera ? this.camera.position : new THREE.Vector3(0, 0, 1));
                    
                    // Update shader uniforms
                    if (child.material.uniforms) {
                        if (child.material.uniforms.time) {
                            child.material.uniforms.time.value = time;
                        }
                    }
                }
            });
        });
        
        // Update explosions
        this.explosions.forEach((explosionData, explosionId) => {
            const { object, startTime, options } = explosionData;
            
            // Check if explosion has expired
            if (time - startTime > options.duration) {
                this.removeExplosion(explosionId);
                return;
            }
            
            // Update shader uniforms
            object.traverse(child => {
                if (child.isMesh || child.isPoints) {
                    if (child.material.uniforms) {
                        if (child.material.uniforms.time) {
                            child.material.uniforms.time.value = time - startTime;
                        }
                    }
                }
            });
        });
        
        // Update trails
        this.trails.forEach((trailData) => {
            const { object } = trailData;
            
            // Update shader uniforms
            if (object.material.uniforms) {
                if (object.material.uniforms.currentTime) {
                    object.material.uniforms.currentTime.value = time;
                }
            }
        });
        
        // Update auroras
        this.auroras.forEach((auroraData) => {
            const { object } = auroraData;
            
            // Update shader uniforms
            if (object.material.uniforms) {
                if (object.material.uniforms.time) {
                    object.material.uniforms.time.value = time;
                }
            }
        });
    }
    
    /**
     * Clear all effects
     */
    clearAllEffects() {
        // Clear all particle systems
        const particleIds = Array.from(this.particleSystems.keys());
        particleIds.forEach(particleId => {
            this.removeParticleSystem(particleId);
        });
        
        // Clear all lens flares
        const flareIds = Array.from(this.lensFlares.keys());
        flareIds.forEach(flareId => {
            this.removeLensFlare(flareId);
        });
        
        // Clear all explosions
        const explosionIds = Array.from(this.explosions.keys());
        explosionIds.forEach(explosionId => {
            this.removeExplosion(explosionId);
        });
        
        // Clear all trails
        const trailIds = Array.from(this.trails.keys());
        trailIds.forEach(trailId => {
            this.removeTrail(trailId);
        });
        
        // Clear all auroras
        const auroraIds = Array.from(this.auroras.keys());
        auroraIds.forEach(auroraId => {
            this.removeAurora(auroraId);
        });
    }
    
    /**
     * Dispose of all resources and clean up
     */
    dispose() {
        // Clear all effects
        this.clearAllEffects();
        
        // Clear registries
        this.particleSystems.clear();
        this.lensFlares.clear();
        this.explosions.clear();
        this.trails.clear();
        this.auroras.clear();
    }
}