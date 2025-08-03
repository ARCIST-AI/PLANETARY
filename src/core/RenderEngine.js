import * as THREE from 'three';
import { CameraControls } from './CameraControls.js';
import { MathUtils } from '../utils/MathUtils.js';
import { RENDERING_CONSTANTS } from '../utils/Constants.js';

/**
 * 3D rendering engine using Three.js
 */
export class RenderEngine {
    constructor(canvas, config = {}) {
        this.canvas = canvas;
        this.config = { ...RENDERING_CONSTANTS, ...config };
        
        // Three.js components
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.cameraControls = null;
        this.raycaster = null;
        this.mouse = null;
        
        // Lighting
        this.sunLight = null;
        this.ambientLight = null;
        
        // Celestial bodies
        this.celestialBodies = new Map();
        this.orbitLines = new Map();
        this.labels = new Map();
        
        // Rendering state
        this.isInitialized = false;
        this.isRunning = false;
        this.lastFrameTime = 0;
        this.frameCount = 0;
        this.renderTime = 0;
        
        // Performance metrics
        this.metrics = {
            drawCalls: 0,
            triangles: 0,
            objectCount: 0,
            renderTime: 0
        };
        
        // Event callbacks
        this.eventCallbacks = new Map();
        
        // Selected object
        this.selectedObject = null;
        
        // Level of detail management
        this.lodManager = new Map();
    }
    
    /**
     * Initialize the render engine
     * @returns {Promise<void>}
     */
    async initialize() {
        try {
            console.log('Initializing Render Engine...');
            
            // Initialize Three.js components
            this.initializeScene();
            this.initializeCamera();
            this.initializeRenderer();
            this.initializeControls();
            this.initializeLighting();
            this.initializeInteraction();
            
            // Set initial camera position
            this.setCameraPosition(this.config.DEFAULT_CAMERA_POSITION);
            
            // Handle window resize
            window.addEventListener('resize', this.handleResize.bind(this));
            
            this.isInitialized = true;
            console.log('Render Engine initialized successfully');
            
        } catch (error) {
            console.error('Failed to initialize Render Engine:', error);
            throw error;
        }
    }
    
    /**
     * Initialize the scene
     */
    initializeScene() {
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x000000);
        
        // Add fog for depth perception
        this.scene.fog = new THREE.Fog(0x000000, 100, 10000);
    }
    
    /**
     * Initialize the camera
     */
    initializeCamera() {
        const aspect = this.canvas.clientWidth / this.canvas.clientHeight;
        this.camera = new THREE.PerspectiveCamera(
            this.config.DEFAULT_CAMERA_FOV,
            aspect,
            this.config.DEFAULT_CAMERA_NEAR,
            this.config.DEFAULT_CAMERA_FAR
        );
    }
    
    /**
     * Initialize the renderer
     */
    initializeRenderer() {
        this.renderer = new THREE.WebGLRenderer({
            canvas: this.canvas,
            antialias: this.config.antialias,
            alpha: true
        });
        
        this.renderer.setPixelRatio(this.config.pixelRatio);
        this.renderer.setSize(this.canvas.clientWidth, this.canvas.clientHeight);
        
        // Enable shadows if configured
        if (this.config.shadows) {
            this.renderer.shadowMap.enabled = true;
            this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        }
        
        // Set tone mapping for better visual quality
        this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
        this.renderer.toneMappingExposure = 1.0;
    }
    
    /**
     * Initialize camera controls
     */
    initializeControls() {
        this.cameraControls = new CameraControls(this.camera, this.renderer.domElement, {
            MODES: {
                ORBIT: 'orbit',
                FIRST_PERSON: 'first-person',
                FREE_FLY: 'free-fly',
                FOLLOW: 'follow',
                LOOK_AT: 'look-at',
                CINEMATIC: 'cinematic'
            },
            DEFAULT_CAMERA_POSITION: this.config.DEFAULT_CAMERA_POSITION,
            MOVEMENT_SPEEDS: {
                SLOW: 0.1,
                NORMAL: 0.5,
                FAST: 2.0
            },
            SENSITIVITY: {
                ROTATION: 1.0,
                ZOOM: 1.0,
                PAN: 1.0,
                INERTIA: 0.9
            },
            CONSTRAINTS: {
                MIN_DISTANCE: 1,
                MAX_DISTANCE: 1000,
                MIN_HEIGHT: -500,
                MAX_HEIGHT: 500,
                SAFE_SUN_DISTANCE: 5
            },
            PRESET_POSITIONS: {
                TOP_DOWN: { x: 0, y: 200, z: 0 },
                SIDE_VIEW: { x: 200, y: 0, z: 0 },
                ECLiptic: { x: 100, y: 100, z: 100 },
                SUN_CLOSE: { x: 20, y: 20, z: 20 },
                OUTER_SYSTEM: { x: 500, y: 100, z: 500 }
            },
            NAVIGATION_AIDS: {
                MINIMAP_SIZE: 150,
                COMPASS_SIZE: 100
            },
            ANIMATION: {
                DEFAULT_DURATION: 2000,
                EASING_FUNCTION: 'cubicInOut'
            },
            TOUCH: {
                ROTATION_SENSITIVITY: 0.005,
                PINCH_SENSITIVITY: 0.01
            },
            KEYBOARD: {
                MOVE_FORWARD: 'KeyW',
                MOVE_BACKWARD: 'KeyS',
                MOVE_LEFT: 'KeyA',
                MOVE_RIGHT: 'KeyD',
                MOVE_UP: 'KeyQ',
                MOVE_DOWN: 'KeyE',
                SPEED_BOOST: 'ShiftLeft',
                BRAKE: 'Space',
                TOGGLE_MODE: 'KeyC',
                RESET_CAMERA: 'KeyR'
            }
        });
        
        // Set up event listeners for camera controls
        this.cameraControls.events.on('cameraUpdated', (data) => {
            this.emit('cameraUpdated', data);
        });
        
        this.cameraControls.events.on('cameraModeChanged', (mode) => {
            this.emit('cameraModeChanged', mode);
        });
        
        this.cameraControls.events.on('cameraPositionChanged', (position) => {
            this.emit('cameraPositionChanged', position);
        });
        
        this.cameraControls.events.on('cameraTargetChanged', (target) => {
            this.emit('cameraTargetChanged', target);
        });
        
        this.cameraControls.events.on('cameraFollowTargetChanged', (target) => {
            this.emit('cameraFollowTargetChanged', target);
        });
        
        this.cameraControls.events.on('cameraLookAtTargetChanged', (target) => {
            this.emit('cameraLookAtTargetChanged', target);
        });
        
        this.cameraControls.events.on('cameraMovementSpeedChanged', (speed) => {
            this.emit('cameraMovementSpeedChanged', speed);
        });
        
        this.cameraControls.events.on('cameraRotationSensitivityChanged', (sensitivity) => {
            this.emit('cameraRotationSensitivityChanged', sensitivity);
        });
        
        this.cameraControls.events.on('cameraZoomSensitivityChanged', (sensitivity) => {
            this.emit('cameraZoomSensitivityChanged', sensitivity);
        });
        
        this.cameraControls.events.on('cameraPanSensitivityChanged', (sensitivity) => {
            this.emit('cameraPanSensitivityChanged', sensitivity);
        });
        
        this.cameraControls.events.on('cameraInertiaChanged', (inertia) => {
            this.emit('cameraInertiaChanged', inertia);
        });
        
        this.cameraControls.events.on('cameraAnimationStarted', (animation) => {
            this.emit('cameraAnimationStarted', animation);
        });
        
        this.cameraControls.events.on('cameraAnimationCompleted', (animation) => {
            this.emit('cameraAnimationCompleted', animation);
        });
        
        this.cameraControls.events.on('cameraAnimationStopped', (animation) => {
            this.emit('cameraAnimationStopped', animation);
        });
        
        this.cameraControls.events.on('cameraPathRecordingStarted', (data) => {
            this.emit('cameraPathRecordingStarted', data);
        });
        
        this.cameraControls.events.on('cameraPathRecordingStopped', (data) => {
            this.emit('cameraPathRecordingStopped', data);
        });
        
        this.cameraControls.events.on('cameraPathPlaybackStarted', (data) => {
            this.emit('cameraPathPlaybackStarted', data);
        });
        
        this.cameraControls.events.on('cameraPathDeleted', (name) => {
            this.emit('cameraPathDeleted', name);
        });
        
        this.cameraControls.events.on('navigationAidsVisibilityChanged', (visible) => {
            this.emit('navigationAidsVisibilityChanged', visible);
        });
        
        this.cameraControls.events.on('cameraReset', () => {
            this.emit('cameraReset');
        });
        
        this.cameraControls.events.on('cameraDoubleClick', (data) => {
            this.emit('cameraDoubleClick', data);
        });
        
        this.cameraControls.events.on('cyclePlanetsRequested', () => {
            this.emit('cyclePlanetsRequested');
        });
        
        this.cameraControls.events.on('windowResized', (data) => {
            this.emit('windowResized', data);
        });
        
        this.cameraControls.events.on('cameraStateChanged', (state) => {
            this.emit('cameraStateChanged', state);
        });
    }
    
    /**
     * Initialize lighting
     */
    initializeLighting() {
        // Sun light (directional light)
        this.sunLight = new THREE.DirectionalLight(0xffffff, 1.5);
        this.sunLight.position.set(0, 0, 0);
        this.sunLight.castShadow = true;
        
        // Configure shadow camera
        const shadowCameraSize = 100;
        this.sunLight.shadow.camera.left = -shadowCameraSize;
        this.sunLight.shadow.camera.right = shadowCameraSize;
        this.sunLight.shadow.camera.top = shadowCameraSize;
        this.sunLight.shadow.camera.bottom = -shadowCameraSize;
        this.sunLight.shadow.camera.near = 0.5;
        this.sunLight.shadow.camera.far = 500;
        this.sunLight.shadow.mapSize.width = 2048;
        this.sunLight.shadow.mapSize.height = 2048;
        
        this.scene.add(this.sunLight);
        
        // Ambient light
        this.ambientLight = new THREE.AmbientLight(0x404040, 0.2);
        this.scene.add(this.ambientLight);
    }
    
    /**
     * Initialize interaction components
     */
    initializeInteraction() {
        this.raycaster = new THREE.Raycaster();
        this.mouse = new THREE.Vector2();
        
        // Add mouse event listeners
        this.canvas.addEventListener('mousemove', this.onMouseMove.bind(this));
        this.canvas.addEventListener('click', this.onMouseClick.bind(this));
    }
    
    /**
     * Start the render engine
     */
    start() {
        if (!this.isInitialized) {
            throw new Error('Render Engine must be initialized before starting');
        }
        
        if (this.isRunning) {
            console.warn('Render Engine is already running');
            return;
        }
        
        this.isRunning = true;
        this.lastFrameTime = performance.now();
        this.frameCount = 0;
        
        console.log('Render Engine started');
    }
    
    /**
     * Stop the render engine
     */
    stop() {
        if (!this.isRunning) {
            console.warn('Render Engine is not running');
            return;
        }
        
        this.isRunning = false;
        console.log('Render Engine stopped');
    }
    
    /**
     * Render a single frame
     */
    render() {
        if (!this.isRunning) return;
        
        const startTime = performance.now();
        
        // Calculate delta time
        const currentTime = performance.now();
        const delta = Math.min((currentTime - this.lastFrameTime) / 1000, 0.1);
        this.lastFrameTime = currentTime;
        
        // Update camera controls
        this.cameraControls.update(delta);
        
        // Update LOD based on camera distance
        this.updateLOD();
        
        // Update labels to face camera
        this.updateLabels();
        
        // Render the scene
        this.renderer.render(this.scene, this.camera);
        
        // Update performance metrics
        this.renderTime = performance.now() - startTime;
        this.frameCount++;
        
        // Collect render metrics
        this.collectRenderMetrics();
        
        // Emit render event
        this.emit('rendered', {
            frameTime: this.renderTime,
            frameCount: this.frameCount,
            metrics: this.metrics
        });
    }
    
    /**
     * Update celestial bodies in the scene
     * @param {Map} bodies - Map of celestial bodies
     */
    updateCelestialBodies(bodies) {
        // Update existing bodies and add new ones
        for (const [id, body] of bodies) {
            if (this.celestialBodies.has(id)) {
                this.updateBodyPosition(id, body.position);
                this.updateBodyRotation(id, body.rotation);
            } else {
                this.addCelestialBody(id, body);
            }
        }
        
        // Remove bodies that no longer exist
        for (const [id] of this.celestialBodies) {
            if (!bodies.has(id)) {
                this.removeCelestialBody(id);
            }
        }
    }
    
    /**
     * Add a celestial body to the scene
     * @param {string} id - Body ID
     * @param {Object} bodyData - Body data
     */
    addCelestialBody(id, bodyData) {
        // Create mesh
        const geometry = new THREE.SphereGeometry(bodyData.radius, 32, 32);
        const material = new THREE.MeshPhongMaterial({
            color: bodyData.color || 0xffffff,
            emissive: bodyData.emissive || 0x000000,
            emissiveIntensity: bodyData.emissiveIntensity || 0,
            shininess: bodyData.shininess || 30
        });
        
        const mesh = new THREE.Mesh(geometry, material);
        mesh.position.copy(bodyData.position);
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        mesh.userData = { id, ...bodyData };
        
        this.scene.add(mesh);
        this.celestialBodies.set(id, mesh);
        
        // Create orbit line
        if (bodyData.orbit) {
            this.createOrbitLine(id, bodyData.orbit);
        }
        
        // Create label
        if (bodyData.name) {
            this.createLabel(id, bodyData.name, mesh.position);
        }
        
        // Create LOD levels if needed
        if (bodyData.lod) {
            this.createLOD(id, mesh, bodyData.lod);
        }
        
        this.emit('bodyAdded', { id, mesh, bodyData });
    }
    
    /**
     * Update body position
     * @param {string} id - Body ID
     * @param {THREE.Vector3} position - New position
     */
    updateBodyPosition(id, position) {
        const mesh = this.celestialBodies.get(id);
        if (mesh) {
            mesh.position.copy(position);
            
            // Update label position
            const label = this.labels.get(id);
            if (label) {
                label.position.copy(position);
            }
        }
    }
    
    /**
     * Update body rotation
     * @param {string} id - Body ID
     * @param {THREE.Euler} rotation - New rotation
     */
    updateBodyRotation(id, rotation) {
        const mesh = this.celestialBodies.get(id);
        if (mesh) {
            mesh.rotation.copy(rotation);
        }
    }
    
    /**
     * Remove a celestial body from the scene
     * @param {string} id - Body ID
     */
    removeCelestialBody(id) {
        const mesh = this.celestialBodies.get(id);
        if (mesh) {
            this.scene.remove(mesh);
            mesh.geometry.dispose();
            mesh.material.dispose();
            this.celestialBodies.delete(id);
        }
        
        // Remove orbit line
        const orbitLine = this.orbitLines.get(id);
        if (orbitLine) {
            this.scene.remove(orbitLine);
            orbitLine.geometry.dispose();
            orbitLine.material.dispose();
            this.orbitLines.delete(id);
        }
        
        // Remove label
        const label = this.labels.get(id);
        if (label) {
            this.scene.remove(label);
            this.labels.delete(id);
        }
        
        // Remove LOD
        const lod = this.lodManager.get(id);
        if (lod) {
            this.scene.remove(lod);
            this.lodManager.delete(id);
        }
        
        this.emit('bodyRemoved', { id });
    }
    
    /**
     * Create orbit line for a celestial body
     * @param {string} id - Body ID
     * @param {Object} orbitData - Orbit data
     */
    createOrbitLine(id, orbitData) {
        const points = this.calculateOrbitPoints(orbitData);
        const geometry = new THREE.BufferGeometry().setFromPoints(points);
        const material = new THREE.LineBasicMaterial({
            color: 0x444444,
            transparent: true,
            opacity: 0.5
        });
        
        const orbitLine = new THREE.Line(geometry, material);
        this.scene.add(orbitLine);
        this.orbitLines.set(id, orbitLine);
    }
    
    /**
     * Calculate points along an orbit
     * @param {Object} orbitData - Orbit data
     * @returns {THREE.Vector3[]} Array of points
     */
    calculateOrbitPoints(orbitData) {
        const points = [];
        const segments = 100;
        
        for (let i = 0; i <= segments; i++) {
            const angle = (i / segments) * Math.PI * 2;
            const position = MathUtils.orbitalElementsToPosition({
                ...orbitData,
                meanAnomalyAtEpoch: angle,
                orbitalPeriod: 1
            }, 0);
            
            points.push(new THREE.Vector3(position.x, position.y, position.z));
        }
        
        return points;
    }
    
    /**
     * Create label for a celestial body
     * @param {string} id - Body ID
     * @param {string} text - Label text
     * @param {THREE.Vector3} position - Label position
     */
    createLabel(id, text, position) {
        // Create canvas for text
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        canvas.width = 256;
        canvas.height = 64;
        
        // Draw text
        context.font = '24px Arial';
        context.fillStyle = 'white';
        context.textAlign = 'center';
        context.fillText(text, canvas.width / 2, canvas.height / 2);
        
        // Create texture and sprite
        const texture = new THREE.CanvasTexture(canvas);
        const material = new THREE.SpriteMaterial({ map: texture, transparent: true });
        const sprite = new THREE.Sprite(material);
        
        sprite.position.copy(position);
        sprite.scale.set(2, 0.5, 1);
        
        this.scene.add(sprite);
        this.labels.set(id, sprite);
    }
    
    /**
     * Update labels to face camera
     */
    updateLabels() {
        for (const label of this.labels.values()) {
            label.lookAt(this.camera.position);
        }
    }
    
    /**
     * Create LOD (Level of Detail) for a celestial body
     * @param {string} id - Body ID
     * @param {THREE.Mesh} mesh - Base mesh
     * @param {Object} lodData - LOD data
     */
    createLOD(id, mesh, lodData) {
        const lod = new THREE.LOD();
        
        // Add different detail levels
        for (const [distance, detail] of Object.entries(lodData)) {
            const geometry = new THREE.SphereGeometry(mesh.geometry.parameters.radius, detail, detail);
            const material = mesh.material.clone();
            const levelMesh = new THREE.Mesh(geometry, material);
            
            lod.addLevel(levelMesh, parseFloat(distance));
        }
        
        lod.position.copy(mesh.position);
        this.scene.remove(mesh);
        this.scene.add(lod);
        this.celestialBodies.set(id, lod);
        this.lodManager.set(id, lod);
    }
    
    /**
     * Update LOD based on camera distance
     */
    updateLOD() {
        for (const lod of this.lodManager.values()) {
            lod.update(this.camera);
        }
    }
    
    /**
     * Set camera position
     * @param {Object} position - Camera position {x, y, z}
     * @param {boolean} animate - Whether to animate the transition
     */
    setCameraPosition(position, animate = false) {
        this.cameraControls.setPosition(position, animate);
    }
    
    /**
     * Handle window resize
     */
    handleResize() {
        const width = this.canvas.clientWidth;
        const height = this.canvas.clientHeight;
        
        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();
        
        this.renderer.setSize(width, height);
        
        this.emit('resized', { width, height });
    }
    
    /**
     * Handle mouse move
     * @param {MouseEvent} event - Mouse event
     */
    onMouseMove(event) {
        const rect = this.canvas.getBoundingClientRect();
        this.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        this.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
    }
    
    /**
     * Handle mouse click
     * @param {MouseEvent} event - Mouse event
     */
    onMouseClick(event) {
        this.raycaster.setFromCamera(this.mouse, this.camera);
        
        const meshes = Array.from(this.celestialBodies.values());
        const intersects = this.raycaster.intersectObjects(meshes);
        
        if (intersects.length > 0) {
            const object = intersects[0].object;
            this.selectObject(object);
        } else {
            this.deselectObject();
        }
    }
    
    /**
     * Select an object
     * @param {THREE.Object3D} object - Object to select
     */
    selectObject(object) {
        this.deselectObject();
        this.selectedObject = object;
        
        // Add selection indicator
        const geometry = new THREE.RingGeometry(
            object.geometry.parameters.radius * 1.2,
            object.geometry.parameters.radius * 1.4,
            32
        );
        const material = new THREE.MeshBasicMaterial({
            color: 0xffff00,
            side: THREE.DoubleSide,
            transparent: true,
            opacity: 0.5
        });
        
        const selectionRing = new THREE.Mesh(geometry, material);
        selectionRing.rotation.x = Math.PI / 2;
        object.add(selectionRing);
        
        this.emit('objectSelected', object.userData);
    }
    
    /**
     * Deselect current object
     */
    deselectObject() {
        if (this.selectedObject) {
            // Remove selection indicator
            const selectionRing = this.selectedObject.children.find(
                child => child.geometry && child.geometry.type === 'RingGeometry'
            );
            
            if (selectionRing) {
                this.selectedObject.remove(selectionRing);
                selectionRing.geometry.dispose();
                selectionRing.material.dispose();
            }
            
            this.selectedObject = null;
            this.emit('objectDeselected');
        }
    }
    
    /**
     * Collect render metrics
     */
    collectRenderMetrics() {
        this.metrics.drawCalls = this.renderer.info.render.calls;
        this.metrics.triangles = this.renderer.info.render.triangles;
        this.metrics.objectCount = this.scene.children.length;
        this.metrics.renderTime = this.renderTime;
    }
    
    /**
     * Update view settings
     * @param {Object} settings - View settings
     */
    updateViewSettings(settings) {
        if (settings.cameraPosition) {
            this.setCameraPosition(settings.cameraPosition);
        }
        
        if (settings.fov !== undefined) {
            this.camera.fov = settings.fov;
            this.camera.updateProjectionMatrix();
        }
        
        if (settings.cameraDistance !== undefined) {
            const direction = new THREE.Vector3();
            direction.subVectors(this.camera.position, this.cameraControls.target).normalize();
            this.camera.position.copy(direction.multiplyScalar(settings.cameraDistance));
            this.cameraControls.update();
        }
    }
    
    /**
     * Update display settings
     * @param {Object} settings - Display settings
     */
    updateDisplaySettings(settings) {
        if (settings.showOrbits !== undefined) {
            for (const orbitLine of this.orbitLines.values()) {
                orbitLine.visible = settings.showOrbits;
            }
        }
        
        if (settings.showLabels !== undefined) {
            for (const label of this.labels.values()) {
                label.visible = settings.showLabels;
            }
        }
        
        if (settings.showTextures !== undefined) {
            for (const mesh of this.celestialBodies.values()) {
                if (mesh.material) {
                    mesh.material.wireframe = !settings.showTextures;
                }
            }
        }
        
        if (settings.sunIntensity !== undefined) {
            this.sunLight.intensity = settings.sunIntensity;
        }
        
        if (settings.ambientLight !== undefined) {
            this.ambientLight.intensity = settings.ambientLight;
        }
    }
    
    /**
     * Set planet scale
     * @param {number} scale - Planet scale multiplier
     */
    setPlanetScale(scale) {
        for (const mesh of this.celestialBodies.values()) {
            if (mesh.userData && mesh.userData.radius) {
                const originalRadius = mesh.userData.radius;
                mesh.scale.setScalar(scale);
            }
        }
    }
    
    /**
     * Set distance scale
     * @param {number} scale - Distance scale multiplier
     */
    setDistanceScale(scale) {
        for (const mesh of this.celestialBodies.values()) {
            if (mesh.userData && mesh.userData.position) {
                const originalPosition = mesh.userData.position;
                mesh.position.copy(originalPosition).multiplyScalar(scale);
            }
        }
        
        // Update orbit lines
        for (const [id, orbitLine] of this.orbitLines) {
            const body = this.celestialBodies.get(id);
            if (body && body.userData && body.userData.orbit) {
                this.scene.remove(orbitLine);
                this.createOrbitLine(id, body.userData.orbit);
            }
        }
    }
    
    /**
     * Set camera speed
     * @param {number} speed - Camera speed multiplier
     */
    setCameraSpeed(speed) {
        this.cameraControls.setMovementSpeed(speed);
    }
    
    /**
     * Set camera mode
     * @param {string} mode - Camera mode
     */
    setCameraMode(mode) {
        this.cameraControls.setMode(mode);
    }
    
    /**
     * Get camera mode
     * @returns {string} Current camera mode
     */
    getCameraMode() {
        return this.cameraControls.mode;
    }
    
    /**
     * Set camera target
     * @param {Object} target - Camera target {x, y, z}
     */
    setCameraTarget(target) {
        this.cameraControls.setTarget(target);
    }
    
    /**
     * Set follow target
     * @param {THREE.Object3D} target - Object to follow
     */
    setFollowTarget(target) {
        this.cameraControls.setFollowTarget(target);
    }
    
    /**
     * Set look-at target
     * @param {THREE.Object3D} target - Object to look at
     */
    setLookAtTarget(target) {
        this.cameraControls.setLookAtTarget(target);
    }
    
    /**
     * Set movement speed
     * @param {number} speed - Movement speed
     */
    setMovementSpeed(speed) {
        this.cameraControls.setMovementSpeed(speed);
    }
    
    /**
     * Set rotation sensitivity
     * @param {number} sensitivity - Rotation sensitivity
     */
    setRotationSensitivity(sensitivity) {
        this.cameraControls.setRotationSensitivity(sensitivity);
    }
    
    /**
     * Set zoom sensitivity
     * @param {number} sensitivity - Zoom sensitivity
     */
    setZoomSensitivity(sensitivity) {
        this.cameraControls.setZoomSensitivity(sensitivity);
    }
    
    /**
     * Set pan sensitivity
     * @param {number} sensitivity - Pan sensitivity
     */
    setPanSensitivity(sensitivity) {
        this.cameraControls.setPanSensitivity(sensitivity);
    }
    
    /**
     * Set inertia
     * @param {number} inertia - Inertia factor (0-1)
     */
    setInertia(inertia) {
        this.cameraControls.setInertia(inertia);
    }
    
    /**
     * Move to preset position
     * @param {string} presetName - Name of preset position
     * @param {boolean} animate - Whether to animate the transition
     */
    moveToPreset(presetName, animate = true) {
        this.cameraControls.moveToPreset(presetName, animate);
    }
    
    /**
     * Animate camera to position
     * @param {THREE.Vector3} position - Target position
     * @param {number} duration - Animation duration in milliseconds
     * @param {string} easing - Easing function name
     */
    animateToPosition(position, duration = 2000, easing = 'cubicInOut') {
        this.cameraControls.animateToPosition(position, duration, easing);
    }
    
    /**
     * Animate camera along a path
     * @param {THREE.Vector3[]} path - Array of positions to follow
     * @param {number} duration - Animation duration in milliseconds
     * @param {string} easing - Easing function name
     */
    animateAlongPath(path, duration = 2000, easing = 'cubicInOut') {
        this.cameraControls.animateAlongPath(path, duration, easing);
    }
    
    /**
     * Stop current animation
     */
    stopAnimation() {
        this.cameraControls.stopAnimation();
    }
    
    /**
     * Record camera path
     * @param {string} name - Path name
     * @param {number} interval - Recording interval in milliseconds
     */
    recordPath(name, interval = 100) {
        this.cameraControls.recordPath(name, interval);
    }
    
    /**
     * Stop recording camera path
     * @param {string} name - Path name
     */
    stopRecordingPath(name) {
        this.cameraControls.stopRecordingPath(name);
    }
    
    /**
     * Play recorded camera path
     * @param {string} name - Path name
     * @param {number} duration - Playback duration in milliseconds
     */
    playPath(name, duration = 2000) {
        this.cameraControls.playPath(name, duration);
    }
    
    /**
     * Delete recorded camera path
     * @param {string} name - Path name
     */
    deletePath(name) {
        this.cameraControls.deletePath(name);
    }
    
    /**
     * Get all recorded path names
     * @returns {string[]} Array of path names
     */
    getPathNames() {
        return this.cameraControls.getPathNames();
    }
    
    /**
     * Get recorded path data
     * @param {string} name - Path name
     * @returns {Object|null} Path data or null if not found
     */
    getPath(name) {
        return this.cameraControls.getPath(name);
    }
    
    /**
     * Show/hide navigation aids
     * @param {boolean} show - Whether to show navigation aids
     */
    showNavigationAids(show) {
        this.cameraControls.showNavigationAids(show);
    }
    
    /**
     * Reset camera
     * @param {boolean} animate - Whether to animate the transition
     */
    resetCamera(animate = false) {
        this.cameraControls.reset(animate);
    }
    
    /**
     * Get camera state
     * @returns {Object} Camera state
     */
    getCameraState() {
        return this.cameraControls.getState();
    }
    
    /**
     * Set camera state
     * @param {Object} state - Camera state
     */
    setCameraState(state) {
        this.cameraControls.setState(state);
    }
    
    /**
     * Show or hide orbits
     * @param {boolean} show - Whether to show orbits
     */
    setShowOrbits(show) {
        for (const orbitLine of this.orbitLines.values()) {
            orbitLine.visible = show;
        }
    }
    
    /**
     * Show or hide labels
     * @param {boolean} show - Whether to show labels
     */
    setShowLabels(show) {
        for (const label of this.labels.values()) {
            label.visible = show;
        }
    }
    
    /**
     * Show or hide textures
     * @param {boolean} show - Whether to show textures
     */
    setShowTextures(show) {
        for (const mesh of this.celestialBodies.values()) {
            if (mesh.material) {
                mesh.material.wireframe = !show;
            }
        }
    }
    
    /**
     * Show or hide starfield
     * @param {boolean} show - Whether to show starfield
     */
    setShowStarfield(show) {
        // This would require implementing a starfield background
        // For now, we'll just change the scene background color
        if (show) {
            this.scene.background = new THREE.Color(0x000033);
        } else {
            this.scene.background = new THREE.Color(0x000000);
        }
    }
    
    /**
     * Show or hide grid
     * @param {boolean} show - Whether to show grid
     */
    setShowGrid(show) {
        let grid = this.scene.getObjectByName('grid');
        
        if (show && !grid) {
            const size = 1000;
            const divisions = 50;
            grid = new THREE.GridHelper(size, divisions, 0x444444, 0x222222);
            grid.name = 'grid';
            this.scene.add(grid);
        } else if (!show && grid) {
            this.scene.remove(grid);
            grid.geometry.dispose();
            grid.material.dispose();
        }
    }
    
    /**
     * Set sun intensity
     * @param {number} intensity - Sun light intensity
     */
    setSunIntensity(intensity) {
        this.sunLight.intensity = intensity;
    }
    
    /**
     * Set ambient light intensity
     * @param {number} intensity - Ambient light intensity
     */
    setAmbientLight(intensity) {
        this.ambientLight.intensity = intensity;
    }
    
    /**
     * Show or hide shadows
     * @param {boolean} show - Whether to show shadows
     */
    setShowShadows(show) {
        this.renderer.shadowMap.enabled = show;
        this.sunLight.castShadow = show;
        
        for (const mesh of this.celestialBodies.values()) {
            mesh.castShadow = show;
            mesh.receiveShadow = show;
        }
    }
    
    /**
     * Select a planet
     * @param {string} planetId - Planet ID
     */
    selectPlanet(planetId) {
        const mesh = this.celestialBodies.get(planetId);
        if (mesh) {
            this.selectObject(mesh);
        }
    }
    
    /**
     * Set follow planet
     * @param {string} planetId - Planet ID to follow, or null to stop following
     */
    setFollowPlanet(planetId) {
        if (planetId) {
            const mesh = this.celestialBodies.get(planetId);
            if (mesh) {
                this.controls.target.copy(mesh.position);
            }
        } else {
            this.controls.target.set(0, 0, 0);
        }
    }
    
    /**
     * Set level of detail
     * @param {number} lod - Level of detail (1-10)
     */
    setLevelOfDetail(lod) {
        // This would require implementing LOD management
        // For now, we'll just adjust the geometry detail
        const segments = Math.max(8, Math.min(64, lod * 6));
        
        for (const [id, mesh] of this.celestialBodies) {
            if (mesh.geometry && mesh.userData && mesh.userData.radius) {
                const radius = mesh.geometry.parameters.radius;
                mesh.geometry.dispose();
                mesh.geometry = new THREE.SphereGeometry(radius, segments, segments);
            }
        }
    }
    
    /**
     * Update engine configuration
     * @param {Object} config - New configuration
     */
    updateConfig(config) {
        this.config = { ...this.config, ...config };
        
        if (config.pixelRatio !== undefined) {
            this.renderer.setPixelRatio(config.pixelRatio);
        }
        
        if (config.shadows !== undefined) {
            this.renderer.shadowMap.enabled = config.shadows;
        }
    }
    
    /**
     * Get render engine status
     * @returns {Object} Status information
     */
    getStatus() {
        return {
            isInitialized: this.isInitialized,
            isRunning: this.isRunning,
            frameCount: this.frameCount,
            renderTime: this.renderTime,
            metrics: this.metrics,
            objectCount: this.celestialBodies.size,
            config: this.config
        };
    }
    
    /**
     * Reset the render engine
     */
    reset() {
        // Clear all celestial bodies
        for (const [id] of this.celestialBodies) {
            this.removeCelestialBody(id);
        }
        
        // Reset camera
        this.setCameraPosition(this.config.DEFAULT_CAMERA_POSITION);
        
        // Reset metrics
        this.frameCount = 0;
        this.renderTime = 0;
        this.metrics = {
            drawCalls: 0,
            triangles: 0,
            objectCount: 0,
            renderTime: 0
        };
        
        this.emit('reset');
    }
    
    /**
     * Register event callback
     * @param {string} event - Event name
     * @param {Function} callback - Callback function
     */
    on(event, callback) {
        if (!this.eventCallbacks.has(event)) {
            this.eventCallbacks.set(event, []);
        }
        
        this.eventCallbacks.get(event).push(callback);
    }
    
    /**
     * Remove event callback
     * @param {string} event - Event name
     * @param {Function} callback - Callback function
     */
    off(event, callback) {
        if (this.eventCallbacks.has(event)) {
            const callbacks = this.eventCallbacks.get(event);
            const index = callbacks.indexOf(callback);
            
            if (index !== -1) {
                callbacks.splice(index, 1);
            }
            
            if (callbacks.length === 0) {
                this.eventCallbacks.delete(event);
            }
        }
    }
    
    /**
     * Emit event
     * @param {string} event - Event name
     * @param {...*} args - Event arguments
     */
    emit(event, ...args) {
        if (this.eventCallbacks.has(event)) {
            for (const callback of this.eventCallbacks.get(event)) {
                try {
                    callback(...args);
                } catch (error) {
                    console.error(`Error in render engine event callback for "${event}":`, error);
                }
            }
        }
    }
    
    /**
     * Destroy the render engine
     */
    destroy() {
        this.stop();
        
        // Remove event listeners
        window.removeEventListener('resize', this.handleResize.bind(this));
        this.canvas.removeEventListener('mousemove', this.onMouseMove.bind(this));
        this.canvas.removeEventListener('click', this.onMouseClick.bind(this));
        
        // Dispose of Three.js resources
        if (this.renderer) {
            this.renderer.dispose();
        }
        
        // Clear all objects
        this.reset();
        
        this.eventCallbacks.clear();
        console.log('Render Engine destroyed');
    }
}