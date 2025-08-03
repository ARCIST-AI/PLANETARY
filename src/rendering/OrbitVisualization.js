import * as THREE from 'three';
import { MathUtils } from '../utils/index.js';

/**
 * Orbit Visualization for creating and managing orbital path visualizations
 */
export class OrbitVisualization {
    /**
     * Create a new orbit visualization manager
     * @param {Object} config - Configuration object
     */
    constructor(config = {}) {
        // Three.js components
        this.scene = config.scene || null;
        this.camera = config.camera || null;
        
        // Visualization settings
        this.quality = config.quality || 'high';
        this.showOrbits = config.showOrbits !== undefined ? config.showOrbits : true;
        this.showTrajectories = config.showTrajectories !== undefined ? config.showTrajectories : true;
        this.orbitColor = config.orbitColor || 0x4444ff;
        this.trajectoryColor = config.trajectoryColor || 0xff4444;
        this.orbitOpacity = config.orbitOpacity || 0.6;
        this.trajectoryOpacity = config.trajectoryOpacity || 0.8;
        
        // Orbit registry
        this.orbits = new Map();
        this.trajectories = new Map();
        
        // Detail levels based on quality
        this.detailLevels = {
            low: {
                segments: 64,
                tubeRadius: 0.02,
                radialSegments: 4
            },
            medium: {
                segments: 128,
                tubeRadius: 0.015,
                radialSegments: 6
            },
            high: {
                segments: 256,
                tubeRadius: 0.01,
                radialSegments: 8
            },
            ultra: {
                segments: 512,
                tubeRadius: 0.005,
                radialSegments: 12
            }
        };
    }
    
    /**
     * Initialize the orbit visualization manager
     * @param {THREE.Scene} scene - Three.js scene
     * @param {THREE.Camera} camera - Three.js camera
     */
    init(scene, camera) {
        this.scene = scene;
        this.camera = camera;
    }
    
    /**
     * Get visualization quality setting
     * @returns {string} Quality setting
     */
    getQuality() {
        return this.quality;
    }
    
    /**
     * Set visualization quality setting
     * @param {string} quality - Quality setting ('low', 'medium', 'high', 'ultra')
     */
    setQuality(quality) {
        const validQualities = ['low', 'medium', 'high', 'ultra'];
        if (validQualities.includes(quality)) {
            this.quality = quality;
            
            // Update existing visualizations
            this.updateVisualizationQuality();
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
     * Update quality of existing visualizations
     */
    updateVisualizationQuality() {
        // Update all orbits
        this.orbits.forEach((orbitData, orbitId) => {
            this.updateOrbit(orbitId, orbitData.options);
        });
        
        // Update all trajectories
        this.trajectories.forEach((trajectoryData, trajectoryId) => {
            this.updateTrajectory(trajectoryId, trajectoryData.options);
        });
    }
    
    /**
     * Create an elliptical orbit visualization
     * @param {string} orbitId - Orbit ID
     * @param {Object} orbitalElements - Orbital elements
     * @param {Object} options - Visualization options
     * @returns {THREE.Object3D} Created orbit visualization
     */
    createEllipticalOrbit(orbitId, orbitalElements, options = {}) {
        // Check if orbit already exists
        if (this.orbits.has(orbitId)) {
            return this.orbits.get(orbitId).object;
        }
        
        // Merge with default options
        const mergedOptions = {
            color: this.orbitColor,
            opacity: this.orbitOpacity,
            ...options
        };
        
        // Get detail level
        const detail = this.getDetailLevel();
        
        // Calculate orbit points
        const points = this.calculateEllipticalOrbitPoints(orbitalElements, detail.segments);
        
        // Create orbit visualization
        const orbit = this.createOrbitFromPoints(points, mergedOptions);
        orbit.name = orbitId;
        
        // Add to scene
        if (this.scene) {
            this.scene.add(orbit);
        }
        
        // Register orbit
        this.orbits.set(orbitId, {
            object: orbit,
            type: 'elliptical',
            orbitalElements: orbitalElements,
            options: mergedOptions
        });
        
        return orbit;
    }
    
    /**
     * Calculate points for an elliptical orbit
     * @param {Object} orbitalElements - Orbital elements
     * @param {number} segments - Number of segments
     * @returns {Array<THREE.Vector3>} Array of points
     */
    calculateEllipticalOrbitPoints(orbitalElements, segments) {
        const points = [];
        
        // Extract orbital elements
        const a = orbitalElements.semiMajorAxis || 1;
        const e = orbitalElements.eccentricity || 0;
        const i = orbitalElements.inclination || 0;
        const Ω = orbitalElements.longitudeOfAscendingNode || 0;
        const ω = orbitalElements.argumentOfPeriapsis || 0;
        
        // Calculate semi-minor axis
        const b = a * Math.sqrt(1 - e * e);
        
        // Calculate points
        for (let j = 0; j <= segments; j++) {
            const angle = (j / segments) * Math.PI * 2;
            
            // Calculate position in orbital plane
            const x = a * Math.cos(angle);
            const y = b * Math.sin(angle);
            
            // Convert to 3D position
            const position = this.orbitalToCartesian(x, y, i, Ω, ω);
            
            points.push(position);
        }
        
        return points;
    }
    
    /**
     * Convert orbital coordinates to Cartesian coordinates
     * @param {number} x - X coordinate in orbital plane
     * @param {number} y - Y coordinate in orbital plane
     * @param {number} i - Inclination
     * @param {number} Ω - Longitude of ascending node
     * @param {number} ω - Argument of periapsis
     * @returns {THREE.Vector3} Cartesian position
     */
    orbitalToCartesian(x, y, i, Ω, ω) {
        // Convert angles to radians
        const inc = i * Math.PI / 180;
        const lan = Ω * Math.PI / 180;
        const aop = ω * Math.PI / 180;
        
        // Create rotation matrices
        const rotZ1 = new THREE.Matrix3().set(
            Math.cos(lan), -Math.sin(lan), 0,
            Math.sin(lan), Math.cos(lan), 0,
            0, 0, 1
        );
        
        const rotX = new THREE.Matrix3().set(
            1, 0, 0,
            0, Math.cos(inc), -Math.sin(inc),
            0, Math.sin(inc), Math.cos(inc)
        );
        
        const rotZ2 = new THREE.Matrix3().set(
            Math.cos(aop), -Math.sin(aop), 0,
            Math.sin(aop), Math.cos(aop), 0,
            0, 0, 1
        );
        
        // Apply rotations
        const position = new THREE.Vector3(x, y, 0);
        position.applyMatrix3(rotZ2);
        position.applyMatrix3(rotX);
        position.applyMatrix3(rotZ1);
        
        return position;
    }
    
    /**
     * Create a circular orbit visualization
     * @param {string} orbitId - Orbit ID
     * @param {Object} orbitData - Orbit data
     * @param {Object} options - Visualization options
     * @returns {THREE.Object3D} Created orbit visualization
     */
    createCircularOrbit(orbitId, orbitData, options = {}) {
        // Check if orbit already exists
        if (this.orbits.has(orbitId)) {
            return this.orbits.get(orbitId).object;
        }
        
        // Merge with default options
        const mergedOptions = {
            color: this.orbitColor,
            opacity: this.orbitOpacity,
            ...options
        };
        
        // Get detail level
        const detail = this.getDetailLevel();
        
        // Calculate orbit points
        const points = this.calculateCircularOrbitPoints(orbitData, detail.segments);
        
        // Create orbit visualization
        const orbit = this.createOrbitFromPoints(points, mergedOptions);
        orbit.name = orbitId;
        
        // Add to scene
        if (this.scene) {
            this.scene.add(orbit);
        }
        
        // Register orbit
        this.orbits.set(orbitId, {
            object: orbit,
            type: 'circular',
            orbitData: orbitData,
            options: mergedOptions
        });
        
        return orbit;
    }
    
    /**
     * Calculate points for a circular orbit
     * @param {Object} orbitData - Orbit data
     * @param {number} segments - Number of segments
     * @returns {Array<THREE.Vector3>} Array of points
     */
    calculateCircularOrbitPoints(orbitData, segments) {
        const points = [];
        
        // Extract orbit data
        const radius = orbitData.radius || 1;
        const inclination = orbitData.inclination || 0;
        const longitude = orbitData.longitude || 0;
        
        // Calculate points
        for (let j = 0; j <= segments; j++) {
            const angle = (j / segments) * Math.PI * 2;
            
            // Calculate position
            const x = radius * Math.cos(angle);
            const y = radius * Math.sin(angle);
            const z = 0;
            
            // Convert to 3D position
            const position = new THREE.Vector3(x, y, z);
            
            // Apply inclination
            position.applyAxisAngle(new THREE.Vector3(1, 0, 0), inclination * Math.PI / 180);
            
            // Apply longitude
            position.applyAxisAngle(new THREE.Vector3(0, 0, 1), longitude * Math.PI / 180);
            
            points.push(position);
        }
        
        return points;
    }
    
    /**
     * Create a parabolic trajectory visualization
     * @param {string} trajectoryId - Trajectory ID
     * @param {Object} trajectoryData - Trajectory data
     * @param {Object} options - Visualization options
     * @returns {THREE.Object3D} Created trajectory visualization
     */
    createParabolicTrajectory(trajectoryId, trajectoryData, options = {}) {
        // Check if trajectory already exists
        if (this.trajectories.has(trajectoryId)) {
            return this.trajectories.get(trajectoryId).object;
        }
        
        // Merge with default options
        const mergedOptions = {
            color: this.trajectoryColor,
            opacity: this.trajectoryOpacity,
            ...options
        };
        
        // Get detail level
        const detail = this.getDetailLevel();
        
        // Calculate trajectory points
        const points = this.calculateParabolicTrajectoryPoints(trajectoryData, detail.segments);
        
        // Create trajectory visualization
        const trajectory = this.createTrajectoryFromPoints(points, mergedOptions);
        trajectory.name = trajectoryId;
        
        // Add to scene
        if (this.scene) {
            this.scene.add(trajectory);
        }
        
        // Register trajectory
        this.trajectories.set(trajectoryId, {
            object: trajectory,
            type: 'parabolic',
            trajectoryData: trajectoryData,
            options: mergedOptions
        });
        
        return trajectory;
    }
    
    /**
     * Calculate points for a parabolic trajectory
     * @param {Object} trajectoryData - Trajectory data
     * @param {number} segments - Number of segments
     * @returns {Array<THREE.Vector3>} Array of points
     */
    calculateParabolicTrajectoryPoints(trajectoryData, segments) {
        const points = [];
        
        // Extract trajectory data
        const periapsis = trajectoryData.periapsis || 1;
        const eccentricity = 1.0; // Parabolic trajectory has e = 1
        const inclination = trajectoryData.inclination || 0;
        const longitude = trajectoryData.longitude || 0;
        
        // Calculate points
        for (let j = 0; j <= segments; j++) {
            const angle = (j / segments) * Math.PI; // Only half orbit for parabolic
            
            // Calculate radius using parabolic orbit equation
            const r = periapsis * (1 + eccentricity) / (1 + eccentricity * Math.cos(angle));
            
            // Calculate position
            const x = r * Math.cos(angle);
            const y = r * Math.sin(angle);
            const z = 0;
            
            // Convert to 3D position
            const position = new THREE.Vector3(x, y, z);
            
            // Apply inclination
            position.applyAxisAngle(new THREE.Vector3(1, 0, 0), inclination * Math.PI / 180);
            
            // Apply longitude
            position.applyAxisAngle(new THREE.Vector3(0, 0, 1), longitude * Math.PI / 180);
            
            points.push(position);
        }
        
        return points;
    }
    
    /**
     * Create a hyperbolic trajectory visualization
     * @param {string} trajectoryId - Trajectory ID
     * @param {Object} trajectoryData - Trajectory data
     * @param {Object} options - Visualization options
     * @returns {THREE.Object3D} Created trajectory visualization
     */
    createHyperbolicTrajectory(trajectoryId, trajectoryData, options = {}) {
        // Check if trajectory already exists
        if (this.trajectories.has(trajectoryId)) {
            return this.trajectories.get(trajectoryId).object;
        }
        
        // Merge with default options
        const mergedOptions = {
            color: this.trajectoryColor,
            opacity: this.trajectoryOpacity,
            ...options
        };
        
        // Get detail level
        const detail = this.getDetailLevel();
        
        // Calculate trajectory points
        const points = this.calculateHyperbolicTrajectoryPoints(trajectoryData, detail.segments);
        
        // Create trajectory visualization
        const trajectory = this.createTrajectoryFromPoints(points, mergedOptions);
        trajectory.name = trajectoryId;
        
        // Add to scene
        if (this.scene) {
            this.scene.add(trajectory);
        }
        
        // Register trajectory
        this.trajectories.set(trajectoryId, {
            object: trajectory,
            type: 'hyperbolic',
            trajectoryData: trajectoryData,
            options: mergedOptions
        });
        
        return trajectory;
    }
    
    /**
     * Calculate points for a hyperbolic trajectory
     * @param {Object} trajectoryData - Trajectory data
     * @param {number} segments - Number of segments
     * @returns {Array<THREE.Vector3>} Array of points
     */
    calculateHyperbolicTrajectoryPoints(trajectoryData, segments) {
        const points = [];
        
        // Extract trajectory data
        const periapsis = trajectoryData.periapsis || 1;
        const eccentricity = trajectoryData.eccentricity || 1.5; // Hyperbolic trajectory has e > 1
        const inclination = trajectoryData.inclination || 0;
        const longitude = trajectoryData.longitude || 0;
        
        // Calculate angle range for hyperbolic trajectory
        const maxAngle = Math.acos(-1 / eccentricity);
        
        // Calculate points
        for (let j = 0; j <= segments; j++) {
            const angle = -maxAngle + (j / segments) * 2 * maxAngle;
            
            // Calculate radius using hyperbolic orbit equation
            const r = periapsis * (1 + eccentricity) / (1 + eccentricity * Math.cos(angle));
            
            // Calculate position
            const x = r * Math.cos(angle);
            const y = r * Math.sin(angle);
            const z = 0;
            
            // Convert to 3D position
            const position = new THREE.Vector3(x, y, z);
            
            // Apply inclination
            position.applyAxisAngle(new THREE.Vector3(1, 0, 0), inclination * Math.PI / 180);
            
            // Apply longitude
            position.applyAxisAngle(new THREE.Vector3(0, 0, 1), longitude * Math.PI / 180);
            
            points.push(position);
        }
        
        return points;
    }
    
    /**
     * Create a custom trajectory from points
     * @param {string} trajectoryId - Trajectory ID
     * @param {Array<THREE.Vector3>} points - Array of points
     * @param {Object} options - Visualization options
     * @returns {THREE.Object3D} Created trajectory visualization
     */
    createCustomTrajectory(trajectoryId, points, options = {}) {
        // Check if trajectory already exists
        if (this.trajectories.has(trajectoryId)) {
            return this.trajectories.get(trajectoryId).object;
        }
        
        // Merge with default options
        const mergedOptions = {
            color: this.trajectoryColor,
            opacity: this.trajectoryOpacity,
            ...options
        };
        
        // Create trajectory visualization
        const trajectory = this.createTrajectoryFromPoints(points, mergedOptions);
        trajectory.name = trajectoryId;
        
        // Add to scene
        if (this.scene) {
            this.scene.add(trajectory);
        }
        
        // Register trajectory
        this.trajectories.set(trajectoryId, {
            object: trajectory,
            type: 'custom',
            points: points,
            options: mergedOptions
        });
        
        return trajectory;
    }
    
    /**
     * Create orbit visualization from points
     * @param {Array<THREE.Vector3>} points - Array of points
     * @param {Object} options - Visualization options
     * @returns {THREE.Object3D} Created orbit visualization
     */
    createOrbitFromPoints(points, options) {
        // Get detail level
        const detail = this.getDetailLevel();
        
        // Create curve from points
        const curve = new THREE.CatmullRomCurve3(points);
        
        // Create tube geometry
        const geometry = new THREE.TubeGeometry(
            curve,
            points.length - 1,
            options.tubeRadius || detail.tubeRadius,
            options.radialSegments || detail.radialSegments,
            false
        );
        
        // Create material
        const material = new THREE.MeshBasicMaterial({
            color: options.color,
            transparent: true,
            opacity: options.opacity,
            side: THREE.DoubleSide
        });
        
        // Create mesh
        const orbit = new THREE.Mesh(geometry, material);
        
        return orbit;
    }
    
    /**
     * Create trajectory visualization from points
     * @param {Array<THREE.Vector3>} points - Array of points
     * @param {Object} options - Visualization options
     * @returns {THREE.Object3D} Created trajectory visualization
     */
    createTrajectoryFromPoints(points, options) {
        // Get detail level
        const detail = this.getDetailLevel();
        
        // Create curve from points
        const curve = new THREE.CatmullRomCurve3(points);
        
        // Create tube geometry
        const geometry = new THREE.TubeGeometry(
            curve,
            points.length - 1,
            options.tubeRadius || detail.tubeRadius,
            options.radialSegments || detail.radialSegments,
            false
        );
        
        // Create material
        const material = new THREE.MeshBasicMaterial({
            color: options.color,
            transparent: true,
            opacity: options.opacity,
            side: THREE.DoubleSide
        });
        
        // Create mesh
        const trajectory = new THREE.Mesh(geometry, material);
        
        return trajectory;
    }
    
    /**
     * Update orbit visualization
     * @param {string} orbitId - Orbit ID
     * @param {Object} options - Visualization options
     */
    updateOrbit(orbitId, options = {}) {
        const orbitData = this.orbits.get(orbitId);
        if (!orbitData) return;
        
        const { object, type, orbitalElements, orbitData: data } = orbitData;
        
        // Remove old visualization
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
        
        // Create new visualization
        let newOrbit;
        if (type === 'elliptical') {
            const points = this.calculateEllipticalOrbitPoints(orbitalElements, this.getDetailLevel().segments);
            newOrbit = this.createOrbitFromPoints(points, { ...orbitData.options, ...options });
        } else if (type === 'circular') {
            const points = this.calculateCircularOrbitPoints(data, this.getDetailLevel().segments);
            newOrbit = this.createOrbitFromPoints(points, { ...orbitData.options, ...options });
        }
        
        newOrbit.name = orbitId;
        
        // Add to scene
        if (this.scene) {
            this.scene.add(newOrbit);
        }
        
        // Update registry
        orbitData.object = newOrbit;
        orbitData.options = { ...orbitData.options, ...options };
    }
    
    /**
     * Update trajectory visualization
     * @param {string} trajectoryId - Trajectory ID
     * @param {Object} options - Visualization options
     */
    updateTrajectory(trajectoryId, options = {}) {
        const trajectoryData = this.trajectories.get(trajectoryId);
        if (!trajectoryData) return;
        
        const { object, type, trajectoryData: data, points } = trajectoryData;
        
        // Remove old visualization
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
        
        // Create new visualization
        let newTrajectory;
        if (type === 'parabolic') {
            const newPoints = this.calculateParabolicTrajectoryPoints(data, this.getDetailLevel().segments);
            newTrajectory = this.createTrajectoryFromPoints(newPoints, { ...trajectoryData.options, ...options });
        } else if (type === 'hyperbolic') {
            const newPoints = this.calculateHyperbolicTrajectoryPoints(data, this.getDetailLevel().segments);
            newTrajectory = this.createTrajectoryFromPoints(newPoints, { ...trajectoryData.options, ...options });
        } else if (type === 'custom') {
            newTrajectory = this.createTrajectoryFromPoints(points, { ...trajectoryData.options, ...options });
        }
        
        newTrajectory.name = trajectoryId;
        
        // Add to scene
        if (this.scene) {
            this.scene.add(newTrajectory);
        }
        
        // Update registry
        trajectoryData.object = newTrajectory;
        trajectoryData.options = { ...trajectoryData.options, ...options };
    }
    
    /**
     * Get orbit by ID
     * @param {string} orbitId - Orbit ID
     * @returns {THREE.Object3D} Orbit or null if not found
     */
    getOrbit(orbitId) {
        const orbitData = this.orbits.get(orbitId);
        return orbitData ? orbitData.object : null;
    }
    
    /**
     * Get trajectory by ID
     * @param {string} trajectoryId - Trajectory ID
     * @returns {THREE.Object3D} Trajectory or null if not found
     */
    getTrajectory(trajectoryId) {
        const trajectoryData = this.trajectories.get(trajectoryId);
        return trajectoryData ? trajectoryData.object : null;
    }
    
    /**
     * Remove orbit by ID
     * @param {string} orbitId - Orbit ID
     */
    removeOrbit(orbitId) {
        const orbitData = this.orbits.get(orbitId);
        if (!orbitData) return;
        
        const { object } = orbitData;
        
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
        this.orbits.delete(orbitId);
    }
    
    /**
     * Remove trajectory by ID
     * @param {string} trajectoryId - Trajectory ID
     */
    removeTrajectory(trajectoryId) {
        const trajectoryData = this.trajectories.get(trajectoryId);
        if (!trajectoryData) return;
        
        const { object } = trajectoryData;
        
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
        this.trajectories.delete(trajectoryId);
    }
    
    /**
     * Toggle orbit visibility
     * @param {boolean} visible - Whether orbits are visible
     */
    toggleOrbits(visible) {
        this.showOrbits = visible;
        
        // Update all orbits
        this.orbits.forEach((orbitData) => {
            orbitData.object.visible = visible;
        });
    }
    
    /**
     * Toggle trajectory visibility
     * @param {boolean} visible - Whether trajectories are visible
     */
    toggleTrajectories(visible) {
        this.showTrajectories = visible;
        
        // Update all trajectories
        this.trajectories.forEach((trajectoryData) => {
            trajectoryData.object.visible = visible;
        });
    }
    
    /**
     * Set orbit color
     * @param {number} color - Orbit color
     */
    setOrbitColor(color) {
        this.orbitColor = color;
        
        // Update all orbits
        this.orbits.forEach((orbitData) => {
            orbitData.object.material.color.setHex(color);
        });
    }
    
    /**
     * Set trajectory color
     * @param {number} color - Trajectory color
     */
    setTrajectoryColor(color) {
        this.trajectoryColor = color;
        
        // Update all trajectories
        this.trajectories.forEach((trajectoryData) => {
            trajectoryData.object.material.color.setHex(color);
        });
    }
    
    /**
     * Set orbit opacity
     * @param {number} opacity - Orbit opacity
     */
    setOrbitOpacity(opacity) {
        this.orbitOpacity = opacity;
        
        // Update all orbits
        this.orbits.forEach((orbitData) => {
            orbitData.object.material.opacity = opacity;
        });
    }
    
    /**
     * Set trajectory opacity
     * @param {number} opacity - Trajectory opacity
     */
    setTrajectoryOpacity(opacity) {
        this.trajectoryOpacity = opacity;
        
        // Update all trajectories
        this.trajectories.forEach((trajectoryData) => {
            trajectoryData.object.material.opacity = opacity;
        });
    }
    
    /**
     * Clear all orbits
     */
    clearAllOrbits() {
        // Create a copy of the keys to avoid modification during iteration
        const orbitIds = Array.from(this.orbits.keys());
        
        // Remove each orbit
        orbitIds.forEach(orbitId => {
            this.removeOrbit(orbitId);
        });
    }
    
    /**
     * Clear all trajectories
     */
    clearAllTrajectories() {
        // Create a copy of the keys to avoid modification during iteration
        const trajectoryIds = Array.from(this.trajectories.keys());
        
        // Remove each trajectory
        trajectoryIds.forEach(trajectoryId => {
            this.removeTrajectory(trajectoryId);
        });
    }
    
    /**
     * Clear all visualizations
     */
    clearAll() {
        this.clearAllOrbits();
        this.clearAllTrajectories();
    }
    
    /**
     * Dispose of all resources and clean up
     */
    dispose() {
        // Clear all visualizations
        this.clearAll();
        
        // Clear registries
        this.orbits.clear();
        this.trajectories.clear();
    }
}