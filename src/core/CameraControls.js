import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { FirstPersonControls } from 'three/examples/jsm/controls/FirstPersonControls.js';
import { FlyControls } from 'three/examples/jsm/controls/FlyControls.js';
import { CAMERA_CONSTANTS } from '../utils/Constants.js';
import { EventSystem } from '../utils/EventSystem.js';
import { MathUtils } from '../utils/MathUtils.js';

/**
 * Comprehensive camera controls and navigation system for solar system visualization
 */
export class CameraControls {
    constructor(camera, domElement, config = {}) {
        this.camera = camera;
        this.domElement = domElement;
        this.config = { ...CAMERA_CONSTANTS, ...config };
        
        // Camera state
        this.mode = this.config.MODES.ORBIT;
        this.target = new THREE.Vector3(0, 0, 0);
        this.followTarget = null;
        this.lookAtTarget = null;
        
        // Movement state
        this.movementSpeed = this.config.MOVEMENT_SPEEDS.NORMAL;
        this.rotationSpeed = this.config.SENSITIVITY.ROTATION;
        this.zoomSpeed = this.config.SENSITIVITY.ZOOM;
        this.panSpeed = this.config.SENSITIVITY.PAN;
        this.inertia = this.config.SENSITIVITY.INERTIA;
        
        // Velocity for smooth movement
        this.velocity = new THREE.Vector3();
        this.angularVelocity = new THREE.Vector3();
        
        // Input state
        this.keys = {};
        this.mouseButtons = {};
        this.touches = [];
        this.lastMousePosition = new THREE.Vector2();
        this.lastTouchDistance = 0;
        
        // Navigation aids
        this.minimap = null;
        this.compass = null;
        this.distanceIndicator = null;
        this.speedIndicator = null;
        this.coordinateDisplay = null;
        
        // Animation system
        this.animationPaths = new Map();
        this.currentAnimation = null;
        this.animationProgress = 0;
        this.animationStartTime = 0;
        
        // Event system
        this.events = new EventSystem();
        
        // Controls
        this.orbitControls = null;
        this.firstPersonControls = null;
        this.flyControls = null;
        
        // Initialize
        this.initializeControls();
        this.setupEventListeners();
        this.createNavigationAids();
    }
    
    /**
     * Initialize all control types
     */
    initializeControls() {
        // Orbit controls (default)
        this.orbitControls = new OrbitControls(this.camera, this.domElement);
        this.orbitControls.enableDamping = true;
        this.orbitControls.dampingFactor = 0.05;
        this.orbitControls.screenSpacePanning = false;
        this.orbitControls.minDistance = this.config.CONSTRAINTS.MIN_DISTANCE;
        this.orbitControls.maxDistance = this.config.CONSTRAINTS.MAX_DISTANCE;
        this.orbitControls.maxPolarAngle = Math.PI;
        this.orbitControls.enabled = true;
        
        // First person controls
        this.firstPersonControls = new FirstPersonControls(this.camera, this.domElement);
        this.firstPersonControls.lookSpeed = this.rotationSpeed;
        this.firstPersonControls.movementSpeed = this.movementSpeed;
        this.firstPersonControls.lookVertical = true;
        this.firstPersonControls.autoForward = false;
        this.firstPersonControls.enabled = false;
        
        // Fly controls
        this.flyControls = new FlyControls(this.camera, this.domElement);
        this.flyControls.movementSpeed = this.movementSpeed;
        this.flyControls.rollSpeed = Math.PI / 24;
        this.flyControls.autoForward = false;
        this.flyControls.dragToLook = false;
        this.flyControls.enabled = false;
    }
    
    /**
     * Setup event listeners for user input
     */
    setupEventListeners() {
        // Keyboard events
        window.addEventListener('keydown', this.onKeyDown.bind(this));
        window.addEventListener('keyup', this.onKeyUp.bind(this));
        
        // Mouse events
        this.domElement.addEventListener('mousedown', this.onMouseDown.bind(this));
        this.domElement.addEventListener('mousemove', this.onMouseMove.bind(this));
        this.domElement.addEventListener('mouseup', this.onMouseUp.bind(this));
        this.domElement.addEventListener('wheel', this.onMouseWheel.bind(this));
        this.domElement.addEventListener('dblclick', this.onDoubleClick.bind(this));
        
        // Touch events
        this.domElement.addEventListener('touchstart', this.onTouchStart.bind(this));
        this.domElement.addEventListener('touchmove', this.onTouchMove.bind(this));
        this.domElement.addEventListener('touchend', this.onTouchEnd.bind(this));
        
        // Window events
        window.addEventListener('resize', this.onWindowResize.bind(this));
        
        // Context menu
        this.domElement.addEventListener('contextmenu', (e) => e.preventDefault());
    }
    
    /**
     * Create navigation aids UI elements
     */
    createNavigationAids() {
        // Minimap
        this.createMinimap();
        
        // Compass
        this.createCompass();
        
        // Distance indicator
        this.createDistanceIndicator();
        
        // Speed indicator
        this.createSpeedIndicator();
        
        // Coordinate display
        this.createCoordinateDisplay();
    }
    
    /**
     * Create minimap element
     */
    createMinimap() {
        const minimapContainer = document.createElement('div');
        minimapContainer.id = 'minimap-container';
        minimapContainer.className = 'navigation-aid';
        minimapContainer.style.position = 'absolute';
        minimapContainer.style.bottom = '20px';
        minimapContainer.style.right = '20px';
        minimapContainer.style.width = `${this.config.NAVIGATION_AIDS.MINIMAP_SIZE}px`;
        minimapContainer.style.height = `${this.config.NAVIGATION_AIDS.MINIMAP_SIZE}px`;
        minimapContainer.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
        minimapContainer.style.border = '1px solid rgba(255, 255, 255, 0.3)';
        minimapContainer.style.borderRadius = '50%';
        minimapContainer.style.overflow = 'hidden';
        
        const minimapCanvas = document.createElement('canvas');
        minimapCanvas.width = this.config.NAVIGATION_AIDS.MINIMAP_SIZE;
        minimapCanvas.height = this.config.NAVIGATION_AIDS.MINIMAP_SIZE;
        minimapContainer.appendChild(minimapCanvas);
        
        document.body.appendChild(minimapContainer);
        this.minimap = {
            container: minimapContainer,
            canvas: minimapCanvas,
            context: minimapCanvas.getContext('2d')
        };
    }
    
    /**
     * Create compass element
     */
    createCompass() {
        const compassContainer = document.createElement('div');
        compassContainer.id = 'compass-container';
        compassContainer.className = 'navigation-aid';
        compassContainer.style.position = 'absolute';
        compassContainer.style.top = '20px';
        compassContainer.style.right = '20px';
        compassContainer.style.width = `${this.config.NAVIGATION_AIDS.COMPASS_SIZE}px`;
        compassContainer.style.height = `${this.config.NAVIGATION_AIDS.COMPASS_SIZE}px`;
        compassContainer.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
        compassContainer.style.border = '1px solid rgba(255, 255, 255, 0.3)';
        compassContainer.style.borderRadius = '50%';
        
        const compassCanvas = document.createElement('canvas');
        compassCanvas.width = this.config.NAVIGATION_AIDS.COMPASS_SIZE;
        compassCanvas.height = this.config.NAVIGATION_AIDS.COMPASS_SIZE;
        compassContainer.appendChild(compassCanvas);
        
        document.body.appendChild(compassContainer);
        this.compass = {
            container: compassContainer,
            canvas: compassCanvas,
            context: compassCanvas.getContext('2d')
        };
    }
    
    /**
     * Create distance indicator element
     */
    createDistanceIndicator() {
        const distanceContainer = document.createElement('div');
        distanceContainer.id = 'distance-indicator';
        distanceContainer.className = 'navigation-aid';
        distanceContainer.style.position = 'absolute';
        distanceContainer.style.bottom = '20px';
        distanceContainer.style.left = '20px';
        distanceContainer.style.padding = '10px';
        distanceContainer.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
        distanceContainer.style.border = '1px solid rgba(255, 255, 255, 0.3)';
        distanceContainer.style.borderRadius = '5px';
        distanceContainer.style.color = 'white';
        distanceContainer.style.fontFamily = 'Arial, sans-serif';
        distanceContainer.style.fontSize = '14px';
        distanceContainer.textContent = 'Distance: -- AU';
        
        document.body.appendChild(distanceContainer);
        this.distanceIndicator = distanceContainer;
    }
    
    /**
     * Create speed indicator element
     */
    createSpeedIndicator() {
        const speedContainer = document.createElement('div');
        speedContainer.id = 'speed-indicator';
        speedContainer.className = 'navigation-aid';
        speedContainer.style.position = 'absolute';
        speedContainer.style.bottom = '60px';
        speedContainer.style.left = '20px';
        speedContainer.style.padding = '10px';
        speedContainer.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
        speedContainer.style.border = '1px solid rgba(255, 255, 255, 0.3)';
        speedContainer.style.borderRadius = '5px';
        speedContainer.style.color = 'white';
        speedContainer.style.fontFamily = 'Arial, sans-serif';
        speedContainer.style.fontSize = '14px';
        speedContainer.textContent = 'Speed: 0.0 AU/s';
        
        document.body.appendChild(speedContainer);
        this.speedIndicator = speedContainer;
    }
    
    /**
     * Create coordinate display element
     */
    createCoordinateDisplay() {
        const coordinateContainer = document.createElement('div');
        coordinateContainer.id = 'coordinate-display';
        coordinateContainer.className = 'navigation-aid';
        coordinateContainer.style.position = 'absolute';
        coordinateContainer.style.top = '20px';
        coordinateContainer.style.left = '20px';
        coordinateContainer.style.padding = '10px';
        coordinateContainer.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
        coordinateContainer.style.border = '1px solid rgba(255, 255, 255, 0.3)';
        coordinateContainer.style.borderRadius = '5px';
        coordinateContainer.style.color = 'white';
        coordinateContainer.style.fontFamily = 'Arial, sans-serif';
        coordinateContainer.style.fontSize = '14px';
        coordinateContainer.textContent = 'X: 0.0, Y: 0.0, Z: 0.0';
        
        document.body.appendChild(coordinateContainer);
        this.coordinateDisplay = coordinateContainer;
    }
    
    /**
     * Update camera controls based on current mode
     * @param {number} delta - Time delta in seconds
     */
    update(delta) {
        // Update animation if active
        if (this.currentAnimation) {
            this.updateAnimation(delta);
        }
        
        // Update controls based on mode
        switch (this.mode) {
            case this.config.MODES.ORBIT:
                this.orbitControls.update();
                break;
                
            case this.config.MODES.FIRST_PERSON:
                this.firstPersonControls.update(delta);
                this.handleKeyboardMovement(delta);
                break;
                
            case this.config.MODES.FREE_FLY:
                this.flyControls.update(delta);
                this.handleKeyboardMovement(delta);
                break;
                
            case this.config.MODES.FOLLOW:
                this.updateFollowMode();
                this.orbitControls.update();
                break;
                
            case this.config.MODES.LOOK_AT:
                this.updateLookAtMode();
                break;
        }
        
        // Apply constraints
        this.applyConstraints();
        
        // Update navigation aids
        this.updateNavigationAids();
        
        // Emit update event
        this.events.emit('cameraUpdated', {
            position: this.camera.position.clone(),
            rotation: this.camera.rotation.clone(),
            mode: this.mode,
            target: this.target.clone()
        });
    }
    
    /**
     * Handle keyboard movement for first-person and free-fly modes
     * @param {number} delta - Time delta in seconds
     */
    handleKeyboardMovement(delta) {
        const moveSpeed = this.keys[this.config.KEYBOARD.SPEED_BOOST] 
            ? this.movementSpeed * 3 
            : this.movementSpeed;
        
        const direction = new THREE.Vector3();
        
        // Forward/backward
        if (this.keys[this.config.KEYBOARD.MOVE_FORWARD]) {
            direction.z -= 1;
        }
        if (this.keys[this.config.KEYBOARD.MOVE_BACKWARD]) {
            direction.z += 1;
        }
        
        // Left/right
        if (this.keys[this.config.KEYBOARD.MOVE_LEFT]) {
            direction.x -= 1;
        }
        if (this.keys[this.config.KEYBOARD.MOVE_RIGHT]) {
            direction.x += 1;
        }
        
        // Up/down
        if (this.keys[this.config.KEYBOARD.MOVE_UP]) {
            direction.y += 1;
        }
        if (this.keys[this.config.KEYBOARD.MOVE_DOWN]) {
            direction.y -= 1;
        }
        
        // Brake
        if (this.keys[this.config.KEYBOARD.BRAKE]) {
            this.velocity.multiplyScalar(0.9);
        }
        
        // Apply movement
        if (direction.length() > 0) {
            direction.normalize();
            
            // Transform direction to camera space
            direction.applyQuaternion(this.camera.quaternion);
            
            // Apply acceleration
            this.velocity.add(direction.multiplyScalar(moveSpeed * delta));
        }
        
        // Apply inertia
        this.velocity.multiplyScalar(this.inertia);
        
        // Update position
        this.camera.position.add(this.velocity.clone().multiplyScalar(delta));
    }
    
    /**
     * Update follow mode
     */
    updateFollowMode() {
        if (this.followTarget) {
            this.orbitControls.target.copy(this.followTarget.position);
        }
    }
    
    /**
     * Update look-at mode
     */
    updateLookAtMode() {
        if (this.lookAtTarget) {
            this.camera.lookAt(this.lookAtTarget.position);
        }
    }
    
    /**
     * Apply camera constraints
     */
    applyConstraints() {
        // Distance constraints
        const distance = this.camera.position.length();
        if (distance < this.config.CONSTRAINTS.MIN_DISTANCE) {
            this.camera.position.normalize().multiplyScalar(this.config.CONSTRAINTS.MIN_DISTANCE);
        } else if (distance > this.config.CONSTRAINTS.MAX_DISTANCE) {
            this.camera.position.normalize().multiplyScalar(this.config.CONSTRAINTS.MAX_DISTANCE);
        }
        
        // Height constraints
        if (this.camera.position.y < this.config.CONSTRAINTS.MIN_HEIGHT) {
            this.camera.position.y = this.config.CONSTRAINTS.MIN_HEIGHT;
        } else if (this.camera.position.y > this.config.CONSTRAINTS.MAX_HEIGHT) {
            this.camera.position.y = this.config.CONSTRAINTS.MAX_HEIGHT;
        }
        
        // Safe distance from sun
        const sunDistance = this.camera.position.length();
        if (sunDistance < this.config.CONSTRAINTS.SAFE_SUN_DISTANCE) {
            this.camera.position.normalize().multiplyScalar(this.config.CONSTRAINTS.SAFE_SUN_DISTANCE);
        }
        
        // Collision detection with celestial bodies
        this.checkCollisions();
    }
    
    /**
     * Check for collisions with celestial bodies
     */
    checkCollisions() {
        // This would be implemented with a reference to celestial bodies
        // For now, we'll leave it as a placeholder
    }
    
    /**
     * Update navigation aids
     */
    updateNavigationAids() {
        // Update minimap
        this.updateMinimap();
        
        // Update compass
        this.updateCompass();
        
        // Update distance indicator
        this.updateDistanceIndicator();
        
        // Update speed indicator
        this.updateSpeedIndicator();
        
        // Update coordinate display
        this.updateCoordinateDisplay();
    }
    
    /**
     * Update minimap
     */
    updateMinimap() {
        if (!this.minimap) return;
        
        const ctx = this.minimap.context;
        const size = this.config.NAVIGATION_AIDS.MINIMAP_SIZE;
        const centerX = size / 2;
        const centerY = size / 2;
        
        // Clear canvas
        ctx.clearRect(0, 0, size, size);
        
        // Draw background
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(0, 0, size, size);
        
        // Draw grid
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
        ctx.lineWidth = 1;
        
        for (let i = 0; i <= 4; i++) {
            const pos = (i / 4) * size;
            ctx.beginPath();
            ctx.moveTo(pos, 0);
            ctx.lineTo(pos, size);
            ctx.stroke();
            
            ctx.beginPath();
            ctx.moveTo(0, pos);
            ctx.lineTo(size, pos);
            ctx.stroke();
        }
        
        // Draw camera position
        const cameraX = centerX + (this.camera.position.x / 50) * (size / 2);
        const cameraZ = centerY + (this.camera.position.z / 50) * (size / 2);
        
        ctx.fillStyle = '#3498db';
        ctx.beginPath();
        ctx.arc(cameraX, cameraZ, 5, 0, Math.PI * 2);
        ctx.fill();
        
        // Draw camera direction
        const dirX = Math.sin(this.camera.rotation.y);
        const dirZ = Math.cos(this.camera.rotation.y);
        
        ctx.strokeStyle = '#3498db';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(cameraX, cameraZ);
        ctx.lineTo(cameraX + dirX * 15, cameraZ + dirZ * 15);
        ctx.stroke();
    }
    
    /**
     * Update compass
     */
    updateCompass() {
        if (!this.compass) return;
        
        const ctx = this.compass.context;
        const size = this.config.NAVIGATION_AIDS.COMPASS_SIZE;
        const centerX = size / 2;
        const centerY = size / 2;
        const radius = size / 2 - 10;
        
        // Clear canvas
        ctx.clearRect(0, 0, size, size);
        
        // Draw background
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
        ctx.fill();
        
        // Draw cardinal directions
        ctx.fillStyle = 'white';
        ctx.font = '12px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        
        // Calculate rotation offset
        const rotation = this.camera.rotation.y;
        
        // Draw N, E, S, W
        const directions = [
            { letter: 'N', angle: 0 },
            { letter: 'E', angle: Math.PI / 2 },
            { letter: 'S', angle: Math.PI },
            { letter: 'W', angle: 3 * Math.PI / 2 }
        ];
        
        for (const dir of directions) {
            const angle = dir.angle - rotation;
            const x = centerX + Math.sin(angle) * (radius - 15);
            const y = centerY - Math.cos(angle) * (radius - 15);
            
            ctx.fillText(dir.letter, x, y);
        }
        
        // Draw needle pointing to camera's forward direction
        ctx.strokeStyle = '#e74c3c';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.lineTo(
            centerX + Math.sin(-rotation) * (radius - 20),
            centerY - Math.cos(-rotation) * (radius - 20)
        );
        ctx.stroke();
    }
    
    /**
     * Update distance indicator
     */
    updateDistanceIndicator() {
        if (!this.distanceIndicator) return;
        
        let distance = 0;
        let target = 'Origin';
        
        if (this.followTarget) {
            distance = this.camera.position.distanceTo(this.followTarget.position);
            target = this.followTarget.name || 'Target';
        } else if (this.lookAtTarget) {
            distance = this.camera.position.distanceTo(this.lookAtTarget.position);
            target = this.lookAtTarget.name || 'Target';
        } else {
            distance = this.camera.position.length();
        }
        
        this.distanceIndicator.textContent = `Distance to ${target}: ${distance.toFixed(2)} AU`;
    }
    
    /**
     * Update speed indicator
     */
    updateSpeedIndicator() {
        if (!this.speedIndicator) return;
        
        const speed = this.velocity.length();
        this.speedIndicator.textContent = `Speed: ${speed.toFixed(2)} AU/s`;
    }
    
    /**
     * Update coordinate display
     */
    updateCoordinateDisplay() {
        if (!this.coordinateDisplay) return;
        
        const pos = this.camera.position;
        this.coordinateDisplay.textContent = `X: ${pos.x.toFixed(2)}, Y: ${pos.y.toFixed(2)}, Z: ${pos.z.toFixed(2)}`;
    }
    
    /**
     * Set camera mode
     * @param {string} mode - Camera mode
     */
    setMode(mode) {
        if (!Object.values(this.config.MODES).includes(mode)) {
            console.warn(`Unknown camera mode: ${mode}`);
            return;
        }
        
        // Disable all controls
        this.orbitControls.enabled = false;
        this.firstPersonControls.enabled = false;
        this.flyControls.enabled = false;
        
        // Enable appropriate control
        switch (mode) {
            case this.config.MODES.ORBIT:
                this.orbitControls.enabled = true;
                break;
                
            case this.config.MODES.FIRST_PERSON:
                this.firstPersonControls.enabled = true;
                break;
                
            case this.config.MODES.FREE_FLY:
                this.flyControls.enabled = true;
                break;
                
            case this.config.MODES.FOLLOW:
                this.orbitControls.enabled = true;
                break;
                
            case this.config.MODES.LOOK_AT:
                // No specific controls needed
                break;
                
            case this.config.MODES.CINEMATIC:
                // No specific controls needed
                break;
        }
        
        this.mode = mode;
        this.events.emit('cameraModeChanged', mode);
    }
    
    /**
     * Set camera position
     * @param {THREE.Vector3|Object} position - Camera position
     * @param {boolean} animate - Whether to animate the transition
     */
    setPosition(position, animate = false) {
        const pos = position instanceof THREE.Vector3 
            ? position 
            : new THREE.Vector3(position.x, position.y, position.z);
        
        if (animate) {
            this.animateToPosition(pos);
        } else {
            this.camera.position.copy(pos);
            this.events.emit('cameraPositionChanged', pos);
        }
    }
    
    /**
     * Set camera target
     * @param {THREE.Vector3|Object} target - Camera target
     */
    setTarget(target) {
        this.target = target instanceof THREE.Vector3 
            ? target 
            : new THREE.Vector3(target.x, target.y, target.z);
        
        this.orbitControls.target.copy(this.target);
        this.events.emit('cameraTargetChanged', this.target);
    }
    
    /**
     * Set follow target
     * @param {THREE.Object3D} target - Object to follow
     */
    setFollowTarget(target) {
        this.followTarget = target;
        
        if (target) {
            this.setMode(this.config.MODES.FOLLOW);
        } else if (this.mode === this.config.MODES.FOLLOW) {
            this.setMode(this.config.MODES.ORBIT);
        }
        
        this.events.emit('cameraFollowTargetChanged', target);
    }
    
    /**
     * Set look-at target
     * @param {THREE.Object3D} target - Object to look at
     */
    setLookAtTarget(target) {
        this.lookAtTarget = target;
        
        if (target) {
            this.setMode(this.config.MODES.LOOK_AT);
        } else if (this.mode === this.config.MODES.LOOK_AT) {
            this.setMode(this.config.MODES.ORBIT);
        }
        
        this.events.emit('cameraLookAtTargetChanged', target);
    }
    
    /**
     * Set movement speed
     * @param {number} speed - Movement speed
     */
    setMovementSpeed(speed) {
        this.movementSpeed = speed;
        this.firstPersonControls.movementSpeed = speed;
        this.flyControls.movementSpeed = speed;
        this.events.emit('cameraMovementSpeedChanged', speed);
    }
    
    /**
     * Set rotation sensitivity
     * @param {number} sensitivity - Rotation sensitivity
     */
    setRotationSensitivity(sensitivity) {
        this.rotationSpeed = sensitivity;
        this.firstPersonControls.lookSpeed = sensitivity;
        this.events.emit('cameraRotationSensitivityChanged', sensitivity);
    }
    
    /**
     * Set zoom sensitivity
     * @param {number} sensitivity - Zoom sensitivity
     */
    setZoomSensitivity(sensitivity) {
        this.zoomSpeed = sensitivity;
        this.orbitControls.zoomSpeed = sensitivity;
        this.events.emit('cameraZoomSensitivityChanged', sensitivity);
    }
    
    /**
     * Set pan sensitivity
     * @param {number} sensitivity - Pan sensitivity
     */
    setPanSensitivity(sensitivity) {
        this.panSpeed = sensitivity;
        this.orbitControls.panSpeed = sensitivity;
        this.events.emit('cameraPanSensitivityChanged', sensitivity);
    }
    
    /**
     * Set inertia
     * @param {number} inertia - Inertia factor (0-1)
     */
    setInertia(inertia) {
        this.inertia = Math.max(0, Math.min(1, inertia));
        this.events.emit('cameraInertiaChanged', this.inertia);
    }
    
    /**
     * Move to preset position
     * @param {string} presetName - Name of preset position
     * @param {boolean} animate - Whether to animate the transition
     */
    moveToPreset(presetName, animate = true) {
        const preset = this.config.PRESET_POSITIONS[presetName];
        
        if (!preset) {
            console.warn(`Unknown preset position: ${presetName}`);
            return;
        }
        
        this.setPosition(preset, animate);
        
        if (preset.target) {
            this.setTarget(preset.target);
        }
        
        this.events.emit('cameraMovedToPreset', presetName);
    }
    
    /**
     * Animate camera to position
     * @param {THREE.Vector3} position - Target position
     * @param {number} duration - Animation duration in milliseconds
     * @param {string} easing - Easing function name
     */
    animateToPosition(position, duration = this.config.ANIMATION.DEFAULT_DURATION, easing = this.config.ANIMATION.EASING_FUNCTION) {
        const startPos = this.camera.position.clone();
        const targetPos = position.clone();
        
        this.currentAnimation = {
            type: 'position',
            startPos,
            targetPos,
            duration,
            easing,
            startTime: performance.now()
        };
        
        this.events.emit('cameraAnimationStarted', {
            type: 'position',
            startPos,
            targetPos,
            duration
        });
    }
    
    /**
     * Animate camera along a path
     * @param {THREE.Vector3[]} path - Array of positions to follow
     * @param {number} duration - Animation duration in milliseconds
     * @param {string} easing - Easing function name
     */
    animateAlongPath(path, duration = this.config.ANIMATION.DEFAULT_DURATION, easing = this.config.ANIMATION.EASING_FUNCTION) {
        if (path.length < 2) {
            console.warn('Path must have at least 2 points');
            return;
        }
        
        this.currentAnimation = {
            type: 'path',
            path,
            duration,
            easing,
            startTime: performance.now()
        };
        
        this.events.emit('cameraAnimationStarted', {
            type: 'path',
            path,
            duration
        });
    }
    
    /**
     * Update animation
     * @param {number} delta - Time delta in seconds
     */
    updateAnimation(delta) {
        if (!this.currentAnimation) return;
        
        const now = performance.now();
        const elapsed = now - this.currentAnimation.startTime;
        const progress = Math.min(1, elapsed / this.currentAnimation.duration);
        
        // Apply easing
        const easedProgress = this.applyEasing(progress, this.currentAnimation.easing);
        
        if (this.currentAnimation.type === 'position') {
            // Interpolate position
            this.camera.position.lerpVectors(
                this.currentAnimation.startPos,
                this.currentAnimation.targetPos,
                easedProgress
            );
        } else if (this.currentAnimation.type === 'path') {
            // Interpolate along path
            const pathIndex = easedProgress * (this.currentAnimation.path.length - 1);
            const prevIndex = Math.floor(pathIndex);
            const nextIndex = Math.min(prevIndex + 1, this.currentAnimation.path.length - 1);
            const localProgress = pathIndex - prevIndex;
            
            this.camera.position.lerpVectors(
                this.currentAnimation.path[prevIndex],
                this.currentAnimation.path[nextIndex],
                localProgress
            );
        }
        
        // Check if animation is complete
        if (progress >= 1) {
            const animation = this.currentAnimation;
            this.currentAnimation = null;
            this.events.emit('cameraAnimationCompleted', animation);
        }
    }
    
    /**
     * Apply easing function
     * @param {number} t - Progress (0-1)
     * @param {string} easing - Easing function name
     * @returns {number} Eased progress
     */
    applyEasing(t, easing) {
        switch (easing) {
            case 'linear':
                return t;
                
            case 'quadraticIn':
                return t * t;
                
            case 'quadraticOut':
                return t * (2 - t);
                
            case 'quadraticInOut':
                return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
                
            case 'cubicIn':
                return t * t * t;
                
            case 'cubicOut':
                return (--t) * t * t + 1;
                
            case 'cubicInOut':
                return t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1;
                
            default:
                return t;
        }
    }
    
    /**
     * Stop current animation
     */
    stopAnimation() {
        if (this.currentAnimation) {
            const animation = this.currentAnimation;
            this.currentAnimation = null;
            this.events.emit('cameraAnimationStopped', animation);
        }
    }
    
    /**
     * Record camera path
     * @param {string} name - Path name
     * @param {number} interval - Recording interval in milliseconds
     */
    recordPath(name, interval = 100) {
        if (this.animationPaths.has(name)) {
            console.warn(`Path "${name}" already exists, overwriting`);
        }
        
        const path = [];
        const recordInterval = setInterval(() => {
            path.push(this.camera.position.clone());
        }, interval);
        
        this.animationPaths.set(name, {
            path,
            recordInterval
        });
        
        this.events.emit('cameraPathRecordingStarted', { name, interval });
    }
    
    /**
     * Stop recording camera path
     * @param {string} name - Path name
     */
    stopRecordingPath(name) {
        const pathData = this.animationPaths.get(name);
        
        if (pathData) {
            clearInterval(pathData.recordInterval);
            this.events.emit('cameraPathRecordingStopped', { name, path: pathData.path });
        }
    }
    
    /**
     * Play recorded camera path
     * @param {string} name - Path name
     * @param {number} duration - Playback duration in milliseconds
     */
    playPath(name, duration = this.config.ANIMATION.DEFAULT_DURATION) {
        const pathData = this.animationPaths.get(name);
        
        if (!pathData || pathData.path.length < 2) {
            console.warn(`Path "${name}" not found or too short`);
            return;
        }
        
        this.animateAlongPath(pathData.path, duration);
        this.events.emit('cameraPathPlaybackStarted', { name, duration });
    }
    
    /**
     * Delete recorded camera path
     * @param {string} name - Path name
     */
    deletePath(name) {
        if (this.animationPaths.has(name)) {
            const pathData = this.animationPaths.get(name);
            
            if (pathData.recordInterval) {
                clearInterval(pathData.recordInterval);
            }
            
            this.animationPaths.delete(name);
            this.events.emit('cameraPathDeleted', name);
        }
    }
    
    /**
     * Get all recorded path names
     * @returns {string[]} Array of path names
     */
    getPathNames() {
        return Array.from(this.animationPaths.keys());
    }
    
    /**
     * Get recorded path data
     * @param {string} name - Path name
     * @returns {Object|null} Path data or null if not found
     */
    getPath(name) {
        const pathData = this.animationPaths.get(name);
        
        if (pathData) {
            return {
                name,
                path: pathData.path,
                length: pathData.path.length
            };
        }
        
        return null;
    }
    
    /**
     * Show/hide navigation aids
     * @param {boolean} show - Whether to show navigation aids
     */
    showNavigationAids(show) {
        const display = show ? 'block' : 'none';
        
        if (this.minimap) {
            this.minimap.container.style.display = display;
        }
        
        if (this.compass) {
            this.compass.container.style.display = display;
        }
        
        if (this.distanceIndicator) {
            this.distanceIndicator.style.display = display;
        }
        
        if (this.speedIndicator) {
            this.speedIndicator.style.display = display;
        }
        
        if (this.coordinateDisplay) {
            this.coordinateDisplay.style.display = display;
        }
        
        this.events.emit('navigationAidsVisibilityChanged', show);
    }
    
    /**
     * Reset camera to default position
     * @param {boolean} animate - Whether to animate the transition
     */
    reset(animate = false) {
        this.setPosition(this.config.DEFAULT_CAMERA_POSITION, animate);
        this.setTarget({ x: 0, y: 0, z: 0 });
        this.setMode(this.config.MODES.ORBIT);
        this.setFollowTarget(null);
        this.setLookAtTarget(null);
        this.stopAnimation();
        this.velocity.set(0, 0, 0);
        this.angularVelocity.set(0, 0, 0);
        
        this.events.emit('cameraReset');
    }
    
    /**
     * Handle key down event
     * @param {KeyboardEvent} event - Keyboard event
     */
    onKeyDown(event) {
        this.keys[event.code] = true;
        
        // Handle special keys
        if (event.code === this.config.KEYBOARD.TOGGLE_MODE) {
            this.cycleMode();
        } else if (event.code === this.config.KEYBOARD.RESET_CAMERA) {
            this.reset(true);
        }
        
        // Number keys for preset positions
        if (event.code.startsWith('Digit')) {
            const digit = parseInt(event.code.replace('Digit', ''));
            const presets = Object.keys(this.config.PRESET_POSITIONS);
            
            if (digit > 0 && digit <= presets.length) {
                this.moveToPreset(presets[digit - 1], true);
            }
        }
        
        // Tab to cycle through planets
        if (event.code === 'Tab') {
            event.preventDefault();
            this.events.emit('cyclePlanetsRequested');
        }
    }
    
    /**
     * Handle key up event
     * @param {KeyboardEvent} event - Keyboard event
     */
    onKeyUp(event) {
        this.keys[event.code] = false;
    }
    
    /**
     * Handle mouse down event
     * @param {MouseEvent} event - Mouse event
     */
    onMouseDown(event) {
        this.mouseButtons[event.button] = true;
        this.lastMousePosition.set(event.clientX, event.clientY);
    }
    
    /**
     * Handle mouse move event
     * @param {MouseEvent} event - Mouse event
     */
    onMouseMove(event) {
        if (this.mode === this.config.MODES.FIRST_PERSON || 
            this.mode === this.config.MODES.FREE_FLY) {
            // These modes are handled by their respective controls
            return;
        }
        
        const deltaX = event.clientX - this.lastMousePosition.x;
        const deltaY = event.clientY - this.lastMousePosition.y;
        
        // Right mouse button for panning
        if (this.mouseButtons[2]) {
            this.pan(deltaX, deltaY);
        }
        
        this.lastMousePosition.set(event.clientX, event.clientY);
    }
    
    /**
     * Handle mouse up event
     * @param {MouseEvent} event - Mouse event
     */
    onMouseUp(event) {
        this.mouseButtons[event.button] = false;
    }
    
    /**
     * Handle mouse wheel event
     * @param {WheelEvent} event - Wheel event
     */
    onMouseWheel(event) {
        if (this.mode === this.config.MODES.ORBIT || 
            this.mode === this.config.MODES.FOLLOW) {
            // These modes are handled by OrbitControls
            return;
        }
        
        const delta = event.deltaY > 0 ? 1 : -1;
        this.zoom(delta * this.zoomSpeed);
        
        event.preventDefault();
    }
    
    /**
     * Handle double click event
     * @param {MouseEvent} event - Mouse event
     */
    onDoubleClick(event) {
        this.events.emit('cameraDoubleClick', {
            clientX: event.clientX,
            clientY: event.clientY
        });
    }
    
    /**
     * Handle touch start event
     * @param {TouchEvent} event - Touch event
     */
    onTouchStart(event) {
        this.touches = Array.from(event.touches);
        
        if (this.touches.length === 1) {
            this.lastMousePosition.set(this.touches[0].clientX, this.touches[0].clientY);
        } else if (this.touches.length === 2) {
            this.lastTouchDistance = this.getTouchDistance();
        }
        
        event.preventDefault();
    }
    
    /**
     * Handle touch move event
     * @param {TouchEvent} event - Touch event
     */
    onTouchMove(event) {
        this.touches = Array.from(event.touches);
        
        if (this.touches.length === 1) {
            // Single touch - rotate
            const deltaX = this.touches[0].clientX - this.lastMousePosition.x;
            const deltaY = this.touches[0].clientY - this.lastMousePosition.y;
            
            this.rotate(deltaX * this.config.TOUCH.ROTATION_SENSITIVITY, 
                       deltaY * this.config.TOUCH.ROTATION_SENSITIVITY);
            
            this.lastMousePosition.set(this.touches[0].clientX, this.touches[0].clientY);
        } else if (this.touches.length === 2) {
            // Two touches - pinch to zoom
            const touchDistance = this.getTouchDistance();
            const delta = touchDistance - this.lastTouchDistance;
            
            this.zoom(delta * this.config.TOUCH.PINCH_SENSITIVITY);
            
            this.lastTouchDistance = touchDistance;
        }
        
        event.preventDefault();
    }
    
    /**
     * Handle touch end event
     * @param {TouchEvent} event - Touch event
     */
    onTouchEnd(event) {
        this.touches = Array.from(event.touches);
        event.preventDefault();
    }
    
    /**
     * Handle window resize event
     */
    onWindowResize() {
        // Update camera aspect ratio
        this.camera.aspect = this.domElement.clientWidth / this.domElement.clientHeight;
        this.camera.updateProjectionMatrix();
        
        // Update controls
        this.orbitControls.update();
        this.firstPersonControls.handleResize();
        this.flyControls.handleResize();
        
        this.events.emit('windowResized', {
            width: this.domElement.clientWidth,
            height: this.domElement.clientHeight
        });
    }
    
    /**
     * Get distance between two touches
     * @returns {number} Distance between touches
     */
    getTouchDistance() {
        if (this.touches.length < 2) return 0;
        
        const dx = this.touches[0].clientX - this.touches[1].clientX;
        const dy = this.touches[0].clientY - this.touches[1].clientY;
        
        return Math.sqrt(dx * dx + dy * dy);
    }
    
    /**
     * Rotate camera
     * @param {number} deltaX - Horizontal rotation
     * @param {number} deltaY - Vertical rotation
     */
    rotate(deltaX, deltaY) {
        if (this.mode === this.config.MODES.ORBIT || 
            this.mode === this.config.MODES.FOLLOW) {
            // These modes are handled by OrbitControls
            return;
        }
        
        // Apply rotation to camera
        this.camera.rotation.y -= deltaX * this.rotationSpeed;
        this.camera.rotation.x -= deltaY * this.rotationSpeed;
        
        // Limit vertical rotation
        this.camera.rotation.x = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, this.camera.rotation.x));
    }
    
    /**
     * Pan camera
     * @param {number} deltaX - Horizontal pan
     * @param {number} deltaY - Vertical pan
     */
    pan(deltaX, deltaY) {
        if (this.mode === this.config.MODES.ORBIT || 
            this.mode === this.config.MODES.FOLLOW) {
            // These modes are handled by OrbitControls
            return;
        }
        
        // Calculate pan direction
        const panX = new THREE.Vector3();
        const panY = new THREE.Vector3();
        
        // Get camera's right and up vectors
        const right = new THREE.Vector3(1, 0, 0);
        const up = new THREE.Vector3(0, 1, 0);
        
        right.applyQuaternion(this.camera.quaternion);
        up.applyQuaternion(this.camera.quaternion);
        
        // Apply pan
        panX.copy(right).multiplyScalar(-deltaX * this.panSpeed * 0.01);
        panY.copy(up).multiplyScalar(deltaY * this.panSpeed * 0.01);
        
        this.camera.position.add(panX);
        this.camera.position.add(panY);
    }
    
    /**
     * Zoom camera
     * @param {number} delta - Zoom delta
     */
    zoom(delta) {
        if (this.mode === this.config.MODES.ORBIT || 
            this.mode === this.config.MODES.FOLLOW) {
            // These modes are handled by OrbitControls
            return;
        }
        
        // Calculate zoom direction
        const zoomDir = new THREE.Vector3(0, 0, -1);
        zoomDir.applyQuaternion(this.camera.quaternion);
        
        // Apply zoom
        this.camera.position.add(zoomDir.multiplyScalar(delta * this.zoomSpeed));
    }
    
    /**
     * Cycle through camera modes
     */
    cycleMode() {
        const modes = Object.values(this.config.MODES);
        const currentIndex = modes.indexOf(this.mode);
        const nextIndex = (currentIndex + 1) % modes.length;
        
        this.setMode(modes[nextIndex]);
    }
    
    /**
     * Get camera state
     * @returns {Object} Camera state
     */
    getState() {
        return {
            mode: this.mode,
            position: this.camera.position.clone(),
            rotation: this.camera.rotation.clone(),
            target: this.target.clone(),
            followTarget: this.followTarget,
            lookAtTarget: this.lookAtTarget,
            movementSpeed: this.movementSpeed,
            rotationSpeed: this.rotationSpeed,
            zoomSpeed: this.zoomSpeed,
            panSpeed: this.panSpeed,
            inertia: this.inertia,
            velocity: this.velocity.clone(),
            isAnimating: !!this.currentAnimation
        };
    }
    
    /**
     * Set camera state
     * @param {Object} state - Camera state
     */
    setState(state) {
        this.setMode(state.mode);
        this.setPosition(state.position);
        this.camera.rotation.copy(state.rotation);
        this.setTarget(state.target);
        this.setFollowTarget(state.followTarget);
        this.setLookAtTarget(state.lookAtTarget);
        this.setMovementSpeed(state.movementSpeed);
        this.setRotationSensitivity(state.rotationSpeed);
        this.setZoomSensitivity(state.zoomSpeed);
        this.setPanSensitivity(state.panSpeed);
        this.setInertia(state.inertia);
        this.velocity.copy(state.velocity);
        
        this.events.emit('cameraStateChanged', state);
    }
    
    /**
     * Destroy camera controls
     */
    destroy() {
        // Remove event listeners
        window.removeEventListener('keydown', this.onKeyDown);
        window.removeEventListener('keyup', this.onKeyUp);
        this.domElement.removeEventListener('mousedown', this.onMouseDown);
        this.domElement.removeEventListener('mousemove', this.onMouseMove);
        this.domElement.removeEventListener('mouseup', this.onMouseUp);
        this.domElement.removeEventListener('wheel', this.onMouseWheel);
        this.domElement.removeEventListener('dblclick', this.onDoubleClick);
        this.domElement.removeEventListener('touchstart', this.onTouchStart);
        this.domElement.removeEventListener('touchmove', this.onTouchMove);
        this.domElement.removeEventListener('touchend', this.onTouchEnd);
        window.removeEventListener('resize', this.onWindowResize);
        
        // Dispose of controls
        if (this.orbitControls) {
            this.orbitControls.dispose();
        }
        
        if (this.firstPersonControls) {
            this.firstPersonControls.dispose();
        }
        
        if (this.flyControls) {
            this.flyControls.dispose();
        }
        
        // Remove navigation aids
        if (this.minimap) {
            this.minimap.container.remove();
        }
        
        if (this.compass) {
            this.compass.container.remove();
        }
        
        if (this.distanceIndicator) {
            this.distanceIndicator.remove();
        }
        
        if (this.speedIndicator) {
            this.speedIndicator.remove();
        }
        
        if (this.coordinateDisplay) {
            this.coordinateDisplay.remove();
        }
        
        // Clear animation paths
        for (const [name, pathData] of this.animationPaths) {
            if (pathData.recordInterval) {
                clearInterval(pathData.recordInterval);
            }
        }
        this.animationPaths.clear();
        
        // Destroy event system
        this.events.destroy();
        
        console.log('Camera Controls destroyed');
    }
}