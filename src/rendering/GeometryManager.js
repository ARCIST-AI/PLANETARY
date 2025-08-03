import * as THREE from 'three';
import { MathUtils } from '../utils/index.js';

/**
 * Geometry Manager for creating and managing geometries for celestial bodies
 */
export class GeometryManager {
    /**
     * Create a new geometry manager
     * @param {Object} config - Configuration object
     */
    constructor(config = {}) {
        // Geometry quality settings
        this.quality = config.quality || 'high';
        this.maxGeometries = config.maxGeometries || 100;
        
        // Geometry cache
        this.geometryCache = new Map();
        
        // Detail levels based on quality
        this.detailLevels = {
            low: {
                sphereSegments: 16,
                sphereRings: 16,
                ringSegments: 32,
                asteroidDetail: 3,
                torusSegments: 16,
                torusRadialSegments: 8
            },
            medium: {
                sphereSegments: 32,
                sphereRings: 32,
                ringSegments: 64,
                asteroidDetail: 4,
                torusSegments: 32,
                torusRadialSegments: 16
            },
            high: {
                sphereSegments: 64,
                sphereRings: 64,
                ringSegments: 128,
                asteroidDetail: 5,
                torusSegments: 64,
                torusRadialSegments: 32
            },
            ultra: {
                sphereSegments: 128,
                sphereRings: 128,
                ringSegments: 256,
                asteroidDetail: 6,
                torusSegments: 128,
                torusRadialSegments: 64
            }
        };
    }
    
    /**
     * Get geometry quality setting
     * @returns {string} Quality setting
     */
    getQuality() {
        return this.quality;
    }
    
    /**
     * Set geometry quality setting
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
     * Get detail level for current quality
     * @returns {Object} Detail level object
     */
    getDetailLevel() {
        return this.detailLevels[this.quality];
    }
    
    /**
     * Create a sphere geometry
     * @param {number} radius - Sphere radius
     * @param {Object} options - Geometry options
     * @returns {THREE.SphereGeometry} Created geometry
     */
    createSphereGeometry(radius = 1, options = {}) {
        const detail = this.getDetailLevel();
        const segments = options.segments || detail.sphereSegments;
        const rings = options.rings || detail.sphereRings;
        
        const cacheKey = `sphere_${radius}_${segments}_${rings}`;
        
        // Check cache first
        if (this.geometryCache.has(cacheKey)) {
            return this.geometryCache.get(cacheKey);
        }
        
        // Create geometry
        const geometry = new THREE.SphereGeometry(radius, segments, rings);
        
        // Cache the geometry
        this.geometryCache.set(cacheKey, geometry);
        
        return geometry;
    }
    
    /**
     * Create a planet geometry with enhanced detail
     * @param {number} radius - Planet radius
     * @param {Object} options - Geometry options
     * @returns {THREE.SphereGeometry} Created geometry
     */
    createPlanetGeometry(radius = 1, options = {}) {
        const detail = this.getDetailLevel();
        const segments = options.segments || detail.sphereSegments;
        const rings = options.rings || detail.sphereRings;
        
        const cacheKey = `planet_${radius}_${segments}_${rings}`;
        
        // Check cache first
        if (this.geometryCache.has(cacheKey)) {
            return this.geometryCache.get(cacheKey);
        }
        
        // Create geometry
        const geometry = new THREE.SphereGeometry(radius, segments, rings);
        
        // Enhance geometry for planets
        if (this.quality === 'high' || this.quality === 'ultra') {
            // Calculate tangents for normal mapping
            geometry.computeTangents();
            
            // Enhance vertex normals for better lighting
            geometry.computeVertexNormals();
        }
        
        // Cache the geometry
        this.geometryCache.set(cacheKey, geometry);
        
        return geometry;
    }
    
    /**
     * Create a star geometry with enhanced detail
     * @param {number} radius - Star radius
     * @param {Object} options - Geometry options
     * @returns {THREE.SphereGeometry} Created geometry
     */
    createStarGeometry(radius = 1, options = {}) {
        const detail = this.getDetailLevel();
        const segments = options.segments || detail.sphereSegments;
        const rings = options.rings || detail.sphereRings;
        
        const cacheKey = `star_${radius}_${segments}_${rings}`;
        
        // Check cache first
        if (this.geometryCache.has(cacheKey)) {
            return this.geometryCache.get(cacheKey);
        }
        
        // Create geometry
        const geometry = new THREE.SphereGeometry(radius, segments, rings);
        
        // Enhance geometry for stars
        if (this.quality === 'high' || this.quality === 'ultra') {
            // Add some noise to vertices for more realistic star surface
            const positions = geometry.attributes.position;
            const vertex = new THREE.Vector3();
            
            for (let i = 0; i < positions.count; i++) {
                vertex.fromBufferAttribute(positions, i);
                
                // Add small random displacement
                const noise = (Math.random() - 0.5) * 0.02 * radius;
                vertex.normalize().multiplyScalar(radius + noise);
                
                positions.setXYZ(i, vertex.x, vertex.y, vertex.z);
            }
            
            positions.needsUpdate = true;
            geometry.computeVertexNormals();
        }
        
        // Cache the geometry
        this.geometryCache.set(cacheKey, geometry);
        
        return geometry;
    }
    
    /**
     * Create a moon geometry
     * @param {number} radius - Moon radius
     * @param {Object} options - Geometry options
     * @returns {THREE.SphereGeometry} Created geometry
     */
    createMoonGeometry(radius = 1, options = {}) {
        const detail = this.getDetailLevel();
        const segments = options.segments || detail.sphereSegments;
        const rings = options.rings || detail.sphereRings;
        
        const cacheKey = `moon_${radius}_${segments}_${rings}`;
        
        // Check cache first
        if (this.geometryCache.has(cacheKey)) {
            return this.geometryCache.get(cacheKey);
        }
        
        // Create geometry
        const geometry = new THREE.SphereGeometry(radius, segments, rings);
        
        // Enhance geometry for moons
        if (this.quality === 'high' || this.quality === 'ultra') {
            // Calculate tangents for normal mapping
            geometry.computeTangents();
            
            // Add some crater-like deformations
            const positions = geometry.attributes.position;
            const vertex = new THREE.Vector3();
            
            for (let i = 0; i < positions.count; i++) {
                vertex.fromBufferAttribute(positions, i);
                
                // Add crater-like depressions
                const noise = Math.sin(vertex.x * 10) * Math.cos(vertex.y * 10) * 0.01 * radius;
                vertex.normalize().multiplyScalar(radius + noise);
                
                positions.setXYZ(i, vertex.x, vertex.y, vertex.z);
            }
            
            positions.needsUpdate = true;
            geometry.computeVertexNormals();
        }
        
        // Cache the geometry
        this.geometryCache.set(cacheKey, geometry);
        
        return geometry;
    }
    
    /**
     * Create an asteroid geometry
     * @param {number} radius - Asteroid radius
     * @param {Object} options - Geometry options
     * @returns {THREE.BufferGeometry} Created geometry
     */
    createAsteroidGeometry(radius = 1, options = {}) {
        const detail = this.getDetailLevel();
        const detailLevel = options.detail || detail.asteroidDetail;
        
        const cacheKey = `asteroid_${radius}_${detailLevel}`;
        
        // Check cache first
        if (this.geometryCache.has(cacheKey)) {
            return this.geometryCache.get(cacheKey);
        }
        
        // Create icosahedron as base
        const geometry = new THREE.IcosahedronGeometry(radius, detailLevel);
        
        // Deform vertices to create irregular shape
        const positions = geometry.attributes.position;
        const vertex = new THREE.Vector3();
        
        for (let i = 0; i < positions.count; i++) {
            vertex.fromBufferAttribute(positions, i);
            
            // Add random displacement
            const displacement = (Math.random() - 0.5) * 0.3 * radius;
            vertex.normalize().multiplyScalar(radius + displacement);
            
            positions.setXYZ(i, vertex.x, vertex.y, vertex.z);
        }
        
        positions.needsUpdate = true;
        geometry.computeVertexNormals();
        
        // Cache the geometry
        this.geometryCache.set(cacheKey, geometry);
        
        return geometry;
    }
    
    /**
     * Create a comet nucleus geometry
     * @param {number} radius - Comet nucleus radius
     * @param {Object} options - Geometry options
     * @returns {THREE.BufferGeometry} Created geometry
     */
    createCometNucleusGeometry(radius = 1, options = {}) {
        const detail = this.getDetailLevel();
        const detailLevel = options.detail || detail.asteroidDetail;
        
        const cacheKey = `comet_nucleus_${radius}_${detailLevel}`;
        
        // Check cache first
        if (this.geometryCache.has(cacheKey)) {
            return this.geometryCache.get(cacheKey);
        }
        
        // Create icosahedron as base
        const geometry = new THREE.IcosahedronGeometry(radius, detailLevel);
        
        // Deform vertices to create irregular shape
        const positions = geometry.attributes.position;
        const vertex = new THREE.Vector3();
        
        for (let i = 0; i < positions.count; i++) {
            vertex.fromBufferAttribute(positions, i);
            
            // Add random displacement for irregular shape
            const displacement = (Math.random() - 0.5) * 0.2 * radius;
            vertex.normalize().multiplyScalar(radius + displacement);
            
            positions.setXYZ(i, vertex.x, vertex.y, vertex.z);
        }
        
        positions.needsUpdate = true;
        geometry.computeVertexNormals();
        
        // Cache the geometry
        this.geometryCache.set(cacheKey, geometry);
        
        return geometry;
    }
    
    /**
     * Create a comet coma geometry
     * @param {number} radius - Comet coma radius
     * @param {Object} options - Geometry options
     * @returns {THREE.BufferGeometry} Created geometry
     */
    createComaGeometry(radius = 1, options = {}) {
        const detail = this.getDetailLevel();
        const segments = options.segments || detail.sphereSegments;
        
        const cacheKey = `coma_${radius}_${segments}`;
        
        // Check cache first
        if (this.geometryCache.has(cacheKey)) {
            return this.geometryCache.get(cacheKey);
        }
        
        // Create sphere geometry
        const geometry = new THREE.SphereGeometry(radius, segments, segments);
        
        // Cache the geometry
        this.geometryCache.set(cacheKey, geometry);
        
        return geometry;
    }
    
    /**
     * Create a comet tail geometry
     * @param {number} length - Tail length
     * @param {number} width - Tail width
     * @param {Object} options - Geometry options
     * @returns {THREE.BufferGeometry} Created geometry
     */
    createTailGeometry(length = 10, width = 2, options = {}) {
        const detail = this.getDetailLevel();
        const segments = options.segments || detail.torusSegments;
        const radialSegments = options.radialSegments || detail.torusRadialSegments;
        
        const cacheKey = `tail_${length}_${width}_${segments}_${radialSegments}`;
        
        // Check cache first
        if (this.geometryCache.has(cacheKey)) {
            return this.geometryCache.get(cacheKey);
        }
        
        // Create cone geometry for tail
        const geometry = new THREE.ConeGeometry(width, length, segments, radialSegments, true);
        
        // Rotate to point in correct direction
        geometry.rotateX(Math.PI / 2);
        
        // Cache the geometry
        this.geometryCache.set(cacheKey, geometry);
        
        return geometry;
    }
    
    /**
     * Create a ring geometry
     * @param {number} innerRadius - Inner radius
     * @param {number} outerRadius - Outer radius
     * @param {Object} options - Geometry options
     * @returns {THREE.RingGeometry} Created geometry
     */
    createRingGeometry(innerRadius = 1, outerRadius = 2, options = {}) {
        const detail = this.getDetailLevel();
        const segments = options.segments || detail.ringSegments;
        
        const cacheKey = `ring_${innerRadius}_${outerRadius}_${segments}`;
        
        // Check cache first
        if (this.geometryCache.has(cacheKey)) {
            return this.geometryCache.get(cacheKey);
        }
        
        // Create ring geometry
        const geometry = new THREE.RingGeometry(innerRadius, outerRadius, segments);
        
        // Cache the geometry
        this.geometryCache.set(cacheKey, geometry);
        
        return geometry;
    }
    
    /**
     * Create a spacecraft geometry
     * @param {string} type - Spacecraft type
     * @param {Object} options - Geometry options
     * @returns {THREE.BufferGeometry} Created geometry
     */
    createSpacecraftGeometry(type = 'satellite', options = {}) {
        const cacheKey = `spacecraft_${type}`;
        
        // Check cache first
        if (this.geometryCache.has(cacheKey)) {
            return this.geometryCache.get(cacheKey);
        }
        
        let geometry;
        
        switch (type) {
            case 'satellite':
                geometry = this.createSatelliteGeometry(options);
                break;
            case 'probe':
                geometry = this.createProbeGeometry(options);
                break;
            case 'shuttle':
                geometry = this.createShuttleGeometry(options);
                break;
            case 'station':
                geometry = this.createStationGeometry(options);
                break;
            default:
                geometry = this.createSatelliteGeometry(options);
        }
        
        // Cache the geometry
        this.geometryCache.set(cacheKey, geometry);
        
        return geometry;
    }
    
    /**
     * Create a satellite geometry
     * @param {Object} options - Geometry options
     * @returns {THREE.BufferGeometry} Created geometry
     */
    createSatelliteGeometry(options = {}) {
        const size = options.size || 1;
        
        // Create a simple box with solar panels
        const group = new THREE.Group();
        
        // Main body
        const bodyGeometry = new THREE.BoxGeometry(size, size * 0.5, size * 0.5);
        
        // Solar panels
        const panelGeometry = new THREE.BoxGeometry(size * 2, size * 0.1, size * 0.8);
        
        // Combine geometries
        const mergedGeometry = new THREE.BufferGeometry();
        
        // This is a simplified version - in a real implementation,
        // you would properly merge the geometries
        
        return bodyGeometry;
    }
    
    /**
     * Create a probe geometry
     * @param {Object} options - Geometry options
     * @returns {THREE.BufferGeometry} Created geometry
     */
    createProbeGeometry(options = {}) {
        const size = options.size || 1;
        
        // Create a simple cylinder with dish
        const bodyGeometry = new THREE.CylinderGeometry(size * 0.3, size * 0.3, size, 16);
        
        return bodyGeometry;
    }
    
    /**
     * Create a shuttle geometry
     * @param {Object} options - Geometry options
     * @returns {THREE.BufferGeometry} Created geometry
     */
    createShuttleGeometry(options = {}) {
        const size = options.size || 1;
        
        // Create a simple cone-like shape
        const geometry = new THREE.ConeGeometry(size * 0.5, size * 2, 8);
        
        return geometry;
    }
    
    /**
     * Create a station geometry
     * @param {Object} options - Geometry options
     * @returns {THREE.BufferGeometry} Created geometry
     */
    createStationGeometry(options = {}) {
        const size = options.size || 1;
        
        // Create a complex structure
        const coreGeometry = new THREE.SphereGeometry(size, 16, 16);
        
        return coreGeometry;
    }
    
    /**
     * Create a skybox geometry
     * @param {number} size - Skybox size
     * @param {Object} options - Geometry options
     * @returns {THREE.BoxGeometry} Created geometry
     */
    createSkyboxGeometry(size = 1000, options = {}) {
        const cacheKey = `skybox_${size}`;
        
        // Check cache first
        if (this.geometryCache.has(cacheKey)) {
            return this.geometryCache.get(cacheKey);
        }
        
        // Create box geometry
        const geometry = new THREE.BoxGeometry(size, size, size);
        
        // Cache the geometry
        this.geometryCache.set(cacheKey, geometry);
        
        return geometry;
    }
    
    /**
     * Create a billboard geometry for sprites
     * @param {number} width - Billboard width
     * @param {number} height - Billboard height
     * @param {Object} options - Geometry options
     * @returns {THREE.PlaneGeometry} Created geometry
     */
    createBillboardGeometry(width = 1, height = 1, options = {}) {
        const cacheKey = `billboard_${width}_${height}`;
        
        // Check cache first
        if (this.geometryCache.has(cacheKey)) {
            return this.geometryCache.get(cacheKey);
        }
        
        // Create plane geometry
        const geometry = new THREE.PlaneGeometry(width, height);
        
        // Cache the geometry
        this.geometryCache.set(cacheKey, geometry);
        
        return geometry;
    }
    
    /**
     * Create a line geometry for orbital paths
     * @param {Array<THREE.Vector3>} points - Array of points
     * @param {Object} options - Geometry options
     * @returns {THREE.BufferGeometry} Created geometry
     */
    createLineGeometry(points = [], options = {}) {
        const cacheKey = `line_${points.length}`;
        
        // Check cache first
        if (this.geometryCache.has(cacheKey)) {
            return this.geometryCache.get(cacheKey);
        }
        
        // Create line geometry
        const geometry = new THREE.BufferGeometry().setFromPoints(points);
        
        // Cache the geometry
        this.geometryCache.set(cacheKey, geometry);
        
        return geometry;
    }
    
    /**
     * Create a tube geometry for orbital paths
     * @param {Array<THREE.Vector3>} points - Array of points
     * @param {number} radius - Tube radius
     * @param {Object} options - Geometry options
     * @returns {THREE.TubeGeometry} Created geometry
     */
    createTubeGeometry(points = [], radius = 0.1, options = {}) {
        const detail = this.getDetailLevel();
        const segments = options.segments || detail.torusSegments;
        const radialSegments = options.radialSegments || detail.torusRadialSegments;
        
        const cacheKey = `tube_${points.length}_${radius}_${segments}_${radialSegments}`;
        
        // Check cache first
        if (this.geometryCache.has(cacheKey)) {
            return this.geometryCache.get(cacheKey);
        }
        
        // Create curve from points
        const curve = new THREE.CatmullRomCurve3(points);
        
        // Create tube geometry
        const geometry = new THREE.TubeGeometry(curve, segments, radius, radialSegments, false);
        
        // Cache the geometry
        this.geometryCache.set(cacheKey, geometry);
        
        return geometry;
    }
    
    /**
     * Clear geometry cache
     */
    clearCache() {
        this.geometryCache.forEach(geometry => {
            if (geometry.dispose) {
                geometry.dispose();
            }
        });
        this.geometryCache.clear();
    }
    
    /**
     * Dispose of all geometries and clean up
     */
    dispose() {
        this.clearCache();
    }
}