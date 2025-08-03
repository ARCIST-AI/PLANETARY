import * as THREE from 'three';
import { MathUtils } from '../utils/index.js';

/**
 * Scale Visualization for creating and managing scale and distance visualization tools
 */
export class ScaleVisualization {
    /**
     * Create a new scale visualization manager
     * @param {Object} config - Configuration object
     */
    constructor(config = {}) {
        // Three.js components
        this.scene = config.scene || null;
        this.renderer = config.renderer || null;
        this.camera = config.camera || null;
        
        // Visualization settings
        this.quality = config.quality || 'high';
        this.enableScaleBar = config.enableScaleBar !== undefined ? config.enableScaleBar : true;
        this.enableDistanceMarkers = config.enableDistanceMarkers !== undefined ? config.enableDistanceMarkers : true;
        this.enableGrid = config.enableGrid !== undefined ? config.enableGrid : true;
        
        // Visualization registries
        this.scaleBars = new Map();
        this.distanceMarkers = new Map();
        this.grids = new Map();
        this.labels = new Map();
        
        // Detail levels based on quality
        this.detailLevels = {
            low: {
                scaleBarSegments: 10,
                distanceMarkerCount: 5,
                gridSize: 10,
                gridDivisions: 10,
                labelResolution: 64
            },
            medium: {
                scaleBarSegments: 20,
                distanceMarkerCount: 10,
                gridSize: 20,
                gridDivisions: 20,
                labelResolution: 128
            },
            high: {
                scaleBarSegments: 50,
                distanceMarkerCount: 20,
                gridSize: 50,
                gridDivisions: 50,
                labelResolution: 256
            },
            ultra: {
                scaleBarSegments: 100,
                distanceMarkerCount: 50,
                gridSize: 100,
                gridDivisions: 100,
                labelResolution: 512
            }
        };
        
        // Default colors
        this.defaultColors = {
            scaleBar: 0xffffff,
            distanceMarker: 0x00ff00,
            grid: 0x444444,
            label: 0xffffff,
            background: 0x000000
        };
        
        // Default units
        this.units = {
            astronomical: {
                name: 'AU',
                scale: 149597870.7, // km
                abbreviation: 'AU'
            },
            kilometer: {
                name: 'Kilometer',
                scale: 1,
                abbreviation: 'km'
            },
            meter: {
                name: 'Meter',
                scale: 0.001,
                abbreviation: 'm'
            },
            mile: {
                name: 'Mile',
                scale: 0.621371,
                abbreviation: 'mi'
            },
            lightyear: {
                name: 'Light Year',
                scale: 9460730472580.8,
                abbreviation: 'ly'
            },
            parsec: {
                name: 'Parsec',
                scale: 30856775814913.7,
                abbreviation: 'pc'
            }
        };
        
        // Current unit
        this.currentUnit = this.units.astronomical;
    }
    
    /**
     * Initialize the scale visualization manager
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
        // Update all scale bars
        this.scaleBars.forEach((scaleBarData, scaleBarId) => {
            this.updateScaleBar(scaleBarId, scaleBarData.options);
        });
        
        // Update all distance markers
        this.distanceMarkers.forEach((markerData, markerId) => {
            this.updateDistanceMarker(markerId, markerData.options);
        });
        
        // Update all grids
        this.grids.forEach((gridData, gridId) => {
            this.updateGrid(gridId, gridData.options);
        });
        
        // Update all labels
        this.labels.forEach((labelData, labelId) => {
            this.updateLabel(labelId, labelData.options);
        });
    }
    
    /**
     * Set current unit
     * @param {string} unitName - Unit name ('astronomical', 'kilometer', 'meter', 'mile', 'lightyear', 'parsec')
     */
    setUnit(unitName) {
        if (this.units[unitName]) {
            this.currentUnit = this.units[unitName];
            
            // Update all visualizations with new unit
            this.updateVisualizationUnit();
        }
    }
    
    /**
     * Update unit of existing visualizations
     */
    updateVisualizationUnit() {
        // Update all scale bars
        this.scaleBars.forEach((scaleBarData, scaleBarId) => {
            this.updateScaleBar(scaleBarId, scaleBarData.options);
        });
        
        // Update all distance markers
        this.distanceMarkers.forEach((markerData, markerId) => {
            this.updateDistanceMarker(markerId, markerData.options);
        });
    }
    
    /**
     * Create a scale bar
     * @param {string} scaleBarId - Scale bar ID
     * @param {Object} options - Scale bar options
     * @returns {THREE.Group} Created scale bar
     */
    createScaleBar(scaleBarId, options = {}) {
        // Check if scale bar already exists
        if (this.scaleBars.has(scaleBarId)) {
            return this.scaleBars.get(scaleBarId).object;
        }
        
        // Get detail level
        const detail = this.getDetailLevel();
        
        // Merge with default options
        const mergedOptions = {
            position: new THREE.Vector3(0, 0, 0),
            rotation: new THREE.Euler(0, 0, 0),
            length: 100,
            height: 1,
            color: this.defaultColors.scaleBar,
            backgroundColor: this.defaultColors.background,
            opacity: 0.8,
            showLabels: true,
            showTicks: true,
            segments: detail.scaleBarSegments,
            ...options
        };
        
        // Create scale bar container
        const scaleBarContainer = new THREE.Group();
        scaleBarContainer.name = scaleBarId;
        
        // Create scale bar background
        const background = this.createScaleBarBackground(mergedOptions);
        scaleBarContainer.add(background);
        
        // Create scale bar line
        const line = this.createScaleBarLine(mergedOptions);
        scaleBarContainer.add(line);
        
        // Create scale bar ticks
        if (mergedOptions.showTicks) {
            const ticks = this.createScaleBarTicks(mergedOptions);
            scaleBarContainer.add(ticks);
        }
        
        // Create scale bar labels
        if (mergedOptions.showLabels) {
            const labels = this.createScaleBarLabels(mergedOptions);
            scaleBarContainer.add(labels);
        }
        
        // Set position and rotation
        scaleBarContainer.position.copy(mergedOptions.position);
        scaleBarContainer.rotation.copy(mergedOptions.rotation);
        
        // Add to scene
        if (this.scene) {
            this.scene.add(scaleBarContainer);
        }
        
        // Register scale bar
        this.scaleBars.set(scaleBarId, {
            object: scaleBarContainer,
            options: mergedOptions
        });
        
        return scaleBarContainer;
    }
    
    /**
     * Create scale bar background
     * @param {Object} options - Scale bar options
     * @returns {THREE.Mesh} Created background
     */
    createScaleBarBackground(options) {
        // Create geometry
        const geometry = new THREE.PlaneGeometry(options.length, options.height * 3);
        
        // Create material
        const material = new THREE.MeshBasicMaterial({
            color: options.backgroundColor,
            transparent: true,
            opacity: options.opacity * 0.5,
            side: THREE.DoubleSide
        });
        
        // Create mesh
        const background = new THREE.Mesh(geometry, material);
        background.name = 'background';
        
        return background;
    }
    
    /**
     * Create scale bar line
     * @param {Object} options - Scale bar options
     * @returns {THREE.Line} Created line
     */
    createScaleBarLine(options) {
        // Create geometry
        const geometry = new THREE.BufferGeometry();
        const positions = new Float32Array([
            -options.length / 2, 0, 0,
            options.length / 2, 0, 0
        ]);
        
        // Set geometry attributes
        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        
        // Create material
        const material = new THREE.LineBasicMaterial({
            color: options.color,
            transparent: true,
            opacity: options.opacity,
            linewidth: 2
        });
        
        // Create line
        const line = new THREE.Line(geometry, material);
        line.name = 'line';
        
        return line;
    }
    
    /**
     * Create scale bar ticks
     * @param {Object} options - Scale bar options
     * @returns {THREE.Group} Created ticks
     */
    createScaleBarTicks(options) {
        // Create ticks container
        const ticksContainer = new THREE.Group();
        ticksContainer.name = 'ticks';
        
        // Calculate tick spacing
        const tickSpacing = options.length / options.segments;
        
        // Create ticks
        for (let i = 0; i <= options.segments; i++) {
            const position = -options.length / 2 + i * tickSpacing;
            
            // Create tick
            const tick = this.createScaleBarTick(position, options);
            ticksContainer.add(tick);
        }
        
        return ticksContainer;
    }
    
    /**
     * Create scale bar tick
     * @param {number} position - Tick position
     * @param {Object} options - Scale bar options
     * @returns {THREE.Line} Created tick
     */
    createScaleBarTick(position, options) {
        // Create geometry
        const geometry = new THREE.BufferGeometry();
        const positions = new Float32Array([
            position, -options.height, 0,
            position, options.height, 0
        ]);
        
        // Set geometry attributes
        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        
        // Create material
        const material = new THREE.LineBasicMaterial({
            color: options.color,
            transparent: true,
            opacity: options.opacity,
            linewidth: 1
        });
        
        // Create line
        const tick = new THREE.Line(geometry, material);
        
        return tick;
    }
    
    /**
     * Create scale bar labels
     * @param {Object} options - Scale bar options
     * @returns {THREE.Group} Created labels
     */
    createScaleBarLabels(options) {
        // Create labels container
        const labelsContainer = new THREE.Group();
        labelsContainer.name = 'labels';
        
        // Calculate label spacing
        const labelSpacing = options.length / options.segments;
        
        // Create labels
        for (let i = 0; i <= options.segments; i++) {
            const position = -options.length / 2 + i * labelSpacing;
            
            // Calculate distance
            const distance = Math.abs(position) / this.currentUnit.scale;
            
            // Create label
            const label = this.createLabel(
                `scaleBar_label_${i}`,
                {
                    text: distance.toFixed(2) + ' ' + this.currentUnit.abbreviation,
                    position: new THREE.Vector3(position, options.height * 2, 0),
                    color: options.color,
                    size: options.height * 1.5,
                    backgroundColor: options.backgroundColor,
                    backgroundOpacity: options.opacity * 0.5
                }
            );
            
            labelsContainer.add(label);
        }
        
        return labelsContainer;
    }
    
    /**
     * Create a distance marker
     * @param {string} markerId - Distance marker ID
     * @param {Object} options - Distance marker options
     * @returns {THREE.Group} Created distance marker
     */
    createDistanceMarker(markerId, options = {}) {
        // Check if distance marker already exists
        if (this.distanceMarkers.has(markerId)) {
            return this.distanceMarkers.get(markerId).object;
        }
        
        // Get detail level
        const detail = this.getDetailLevel();
        
        // Merge with default options
        const mergedOptions = {
            startPosition: new THREE.Vector3(0, 0, 0),
            endPosition: new THREE.Vector3(100, 0, 0),
            color: this.defaultColors.distanceMarker,
            opacity: 0.8,
            showLabels: true,
            showTicks: true,
            segments: detail.distanceMarkerCount,
            ...options
        };
        
        // Create distance marker container
        const markerContainer = new THREE.Group();
        markerContainer.name = markerId;
        
        // Create distance line
        const line = this.createDistanceLine(mergedOptions);
        markerContainer.add(line);
        
        // Create distance ticks
        if (mergedOptions.showTicks) {
            const ticks = this.createDistanceTicks(mergedOptions);
            markerContainer.add(ticks);
        }
        
        // Create distance labels
        if (mergedOptions.showLabels) {
            const labels = this.createDistanceLabels(mergedOptions);
            markerContainer.add(labels);
        }
        
        // Add to scene
        if (this.scene) {
            this.scene.add(markerContainer);
        }
        
        // Register distance marker
        this.distanceMarkers.set(markerId, {
            object: markerContainer,
            options: mergedOptions
        });
        
        return markerContainer;
    }
    
    /**
     * Create distance line
     * @param {Object} options - Distance marker options
     * @returns {THREE.Line} Created line
     */
    createDistanceLine(options) {
        // Create geometry
        const geometry = new THREE.BufferGeometry();
        const positions = new Float32Array([
            options.startPosition.x, options.startPosition.y, options.startPosition.z,
            options.endPosition.x, options.endPosition.y, options.endPosition.z
        ]);
        
        // Set geometry attributes
        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        
        // Create material
        const material = new THREE.LineBasicMaterial({
            color: options.color,
            transparent: true,
            opacity: options.opacity,
            linewidth: 2
        });
        
        // Create line
        const line = new THREE.Line(geometry, material);
        line.name = 'line';
        
        return line;
    }
    
    /**
     * Create distance ticks
     * @param {Object} options - Distance marker options
     * @returns {THREE.Group} Created ticks
     */
    createDistanceTicks(options) {
        // Create ticks container
        const ticksContainer = new THREE.Group();
        ticksContainer.name = 'ticks';
        
        // Calculate direction vector
        const direction = new THREE.Vector3().subVectors(
            options.endPosition,
            options.startPosition
        ).normalize();
        
        // Calculate perpendicular vector
        const perpendicular = new THREE.Vector3(-direction.y, direction.x, 0).normalize();
        
        // Calculate tick spacing
        const distance = options.startPosition.distanceTo(options.endPosition);
        const tickSpacing = distance / options.segments;
        
        // Create ticks
        for (let i = 1; i < options.segments; i++) {
            const position = new THREE.Vector3().addVectors(
                options.startPosition,
                direction.clone().multiplyScalar(i * tickSpacing)
            );
            
            // Create tick
            const tick = this.createDistanceTick(position, perpendicular, options);
            ticksContainer.add(tick);
        }
        
        return ticksContainer;
    }
    
    /**
     * Create distance tick
     * @param {THREE.Vector3} position - Tick position
     * @param {THREE.Vector3} perpendicular - Perpendicular direction
     * @param {Object} options - Distance marker options
     * @returns {THREE.Line} Created tick
     */
    createDistanceTick(position, perpendicular, options) {
        // Create geometry
        const geometry = new THREE.BufferGeometry();
        const positions = new Float32Array([
            position.x - perpendicular.x * 2, position.y - perpendicular.y * 2, position.z,
            position.x + perpendicular.x * 2, position.y + perpendicular.y * 2, position.z
        ]);
        
        // Set geometry attributes
        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        
        // Create material
        const material = new THREE.LineBasicMaterial({
            color: options.color,
            transparent: true,
            opacity: options.opacity,
            linewidth: 1
        });
        
        // Create line
        const tick = new THREE.Line(geometry, material);
        
        return tick;
    }
    
    /**
     * Create distance labels
     * @param {Object} options - Distance marker options
     * @returns {THREE.Group} Created labels
     */
    createDistanceLabels(options) {
        // Create labels container
        const labelsContainer = new THREE.Group();
        labelsContainer.name = 'labels';
        
        // Calculate direction vector
        const direction = new THREE.Vector3().subVectors(
            options.endPosition,
            options.startPosition
        ).normalize();
        
        // Calculate perpendicular vector
        const perpendicular = new THREE.Vector3(-direction.y, direction.x, 0).normalize();
        
        // Calculate total distance
        const distance = options.startPosition.distanceTo(options.endPosition) / this.currentUnit.scale;
        
        // Create start label
        const startLabel = this.createLabel(
            `distanceMarker_start`,
            {
                text: '0 ' + this.currentUnit.abbreviation,
                position: new THREE.Vector3().addVectors(
                    options.startPosition,
                    perpendicular.clone().multiplyScalar(5)
                ),
                color: options.color,
                size: 2,
                backgroundColor: this.defaultColors.background,
                backgroundOpacity: options.opacity * 0.5
            }
        );
        
        labelsContainer.add(startLabel);
        
        // Create end label
        const endLabel = this.createLabel(
            `distanceMarker_end`,
            {
                text: distance.toFixed(2) + ' ' + this.currentUnit.abbreviation,
                position: new THREE.Vector3().addVectors(
                    options.endPosition,
                    perpendicular.clone().multiplyScalar(5)
                ),
                color: options.color,
                size: 2,
                backgroundColor: this.defaultColors.background,
                backgroundOpacity: options.opacity * 0.5
            }
        );
        
        labelsContainer.add(endLabel);
        
        // Create middle label
        const middlePosition = new THREE.Vector3().addVectors(
            options.startPosition,
            direction.clone().multiplyScalar(options.startPosition.distanceTo(options.endPosition) * 0.5)
        );
        
        const middleLabel = this.createLabel(
            `distanceMarker_middle`,
            {
                text: (distance * 0.5).toFixed(2) + ' ' + this.currentUnit.abbreviation,
                position: new THREE.Vector3().addVectors(
                    middlePosition,
                    perpendicular.clone().multiplyScalar(5)
                ),
                color: options.color,
                size: 2,
                backgroundColor: this.defaultColors.background,
                backgroundOpacity: options.opacity * 0.5
            }
        );
        
        labelsContainer.add(middleLabel);
        
        return labelsContainer;
    }
    
    /**
     * Create a grid
     * @param {string} gridId - Grid ID
     * @param {Object} options - Grid options
     * @returns {THREE.Group} Created grid
     */
    createGrid(gridId, options = {}) {
        // Check if grid already exists
        if (this.grids.has(gridId)) {
            return this.grids.get(gridId).object;
        }
        
        // Get detail level
        const detail = this.getDetailLevel();
        
        // Merge with default options
        const mergedOptions = {
            position: new THREE.Vector3(0, 0, 0),
            rotation: new THREE.Euler(0, 0, 0),
            size: detail.gridSize,
            divisions: detail.gridDivisions,
            color: this.defaultColors.grid,
            opacity: 0.5,
            showLabels: true,
            showAxes: true,
            ...options
        };
        
        // Create grid container
        const gridContainer = new THREE.Group();
        gridContainer.name = gridId;
        
        // Create grid plane
        const gridPlane = this.createGridPlane(mergedOptions);
        gridContainer.add(gridPlane);
        
        // Create grid axes
        if (mergedOptions.showAxes) {
            const axes = this.createGridAxes(mergedOptions);
            gridContainer.add(axes);
        }
        
        // Create grid labels
        if (mergedOptions.showLabels) {
            const labels = this.createGridLabels(mergedOptions);
            gridContainer.add(labels);
        }
        
        // Set position and rotation
        gridContainer.position.copy(mergedOptions.position);
        gridContainer.rotation.copy(mergedOptions.rotation);
        
        // Add to scene
        if (this.scene) {
            this.scene.add(gridContainer);
        }
        
        // Register grid
        this.grids.set(gridId, {
            object: gridContainer,
            options: mergedOptions
        });
        
        return gridContainer;
    }
    
    /**
     * Create grid plane
     * @param {Object} options - Grid options
     * @returns {THREE.GridHelper} Created grid plane
     */
    createGridPlane(options) {
        // Create grid helper
        const grid = new THREE.GridHelper(
            options.size,
            options.divisions,
            options.color,
            options.color
        );
        
        // Set material opacity
        grid.material.opacity = options.opacity;
        grid.material.transparent = true;
        
        grid.name = 'plane';
        
        return grid;
    }
    
    /**
     * Create grid axes
     * @param {Object} options - Grid options
     * @returns {THREE.Group} Created axes
     */
    createGridAxes(options) {
        // Create axes container
        const axesContainer = new THREE.Group();
        axesContainer.name = 'axes';
        
        // Create X axis
        const xAxisGeometry = new THREE.BufferGeometry();
        const xAxisPositions = new Float32Array([
            0, 0, 0,
            options.size / 2, 0, 0
        ]);
        xAxisGeometry.setAttribute('position', new THREE.BufferAttribute(xAxisPositions, 3));
        
        const xAxisMaterial = new THREE.LineBasicMaterial({
            color: 0xff0000,
            transparent: true,
            opacity: options.opacity
        });
        
        const xAxis = new THREE.Line(xAxisGeometry, xAxisMaterial);
        axesContainer.add(xAxis);
        
        // Create Y axis
        const yAxisGeometry = new THREE.BufferGeometry();
        const yAxisPositions = new Float32Array([
            0, 0, 0,
            0, options.size / 2, 0
        ]);
        yAxisGeometry.setAttribute('position', new THREE.BufferAttribute(yAxisPositions, 3));
        
        const yAxisMaterial = new THREE.LineBasicMaterial({
            color: 0x00ff00,
            transparent: true,
            opacity: options.opacity
        });
        
        const yAxis = new THREE.Line(yAxisGeometry, yAxisMaterial);
        axesContainer.add(yAxis);
        
        // Create Z axis
        const zAxisGeometry = new THREE.BufferGeometry();
        const zAxisPositions = new Float32Array([
            0, 0, 0,
            0, 0, options.size / 2
        ]);
        zAxisGeometry.setAttribute('position', new THREE.BufferAttribute(zAxisPositions, 3));
        
        const zAxisMaterial = new THREE.LineBasicMaterial({
            color: 0x0000ff,
            transparent: true,
            opacity: options.opacity
        });
        
        const zAxis = new THREE.Line(zAxisGeometry, zAxisMaterial);
        axesContainer.add(zAxis);
        
        return axesContainer;
    }
    
    /**
     * Create grid labels
     * @param {Object} options - Grid options
     * @returns {THREE.Group} Created labels
     */
    createGridLabels(options) {
        // Create labels container
        const labelsContainer = new THREE.Group();
        labelsContainer.name = 'labels';
        
        // Calculate label spacing
        const labelSpacing = options.size / options.divisions;
        
        // Create X axis labels
        for (let i = 1; i <= options.divisions / 2; i++) {
            const position = new THREE.Vector3(i * labelSpacing, 0, 0);
            const distance = i * labelSpacing / this.currentUnit.scale;
            
            const label = this.createLabel(
                `grid_x_${i}`,
                {
                    text: distance.toFixed(1) + ' ' + this.currentUnit.abbreviation,
                    position: position,
                    color: 0xff0000,
                    size: 1,
                    backgroundColor: this.defaultColors.background,
                    backgroundOpacity: options.opacity * 0.5
                }
            );
            
            labelsContainer.add(label);
            
            // Negative X
            const negativePosition = new THREE.Vector3(-i * labelSpacing, 0, 0);
            
            const negativeLabel = this.createLabel(
                `grid_x_neg_${i}`,
                {
                    text: (-distance).toFixed(1) + ' ' + this.currentUnit.abbreviation,
                    position: negativePosition,
                    color: 0xff0000,
                    size: 1,
                    backgroundColor: this.defaultColors.background,
                    backgroundOpacity: options.opacity * 0.5
                }
            );
            
            labelsContainer.add(negativeLabel);
        }
        
        // Create Z axis labels
        for (let i = 1; i <= options.divisions / 2; i++) {
            const position = new THREE.Vector3(0, 0, i * labelSpacing);
            const distance = i * labelSpacing / this.currentUnit.scale;
            
            const label = this.createLabel(
                `grid_z_${i}`,
                {
                    text: distance.toFixed(1) + ' ' + this.currentUnit.abbreviation,
                    position: position,
                    color: 0x0000ff,
                    size: 1,
                    backgroundColor: this.defaultColors.background,
                    backgroundOpacity: options.opacity * 0.5
                }
            );
            
            labelsContainer.add(label);
            
            // Negative Z
            const negativePosition = new THREE.Vector3(0, 0, -i * labelSpacing);
            
            const negativeLabel = this.createLabel(
                `grid_z_neg_${i}`,
                {
                    text: (-distance).toFixed(1) + ' ' + this.currentUnit.abbreviation,
                    position: negativePosition,
                    color: 0x0000ff,
                    size: 1,
                    backgroundColor: this.defaultColors.background,
                    backgroundOpacity: options.opacity * 0.5
                }
            );
            
            labelsContainer.add(negativeLabel);
        }
        
        return labelsContainer;
    }
    
    /**
     * Create a label
     * @param {string} labelId - Label ID
     * @param {Object} options - Label options
     * @returns {THREE.Sprite} Created label
     */
    createLabel(labelId, options = {}) {
        // Check if label already exists
        if (this.labels.has(labelId)) {
            return this.labels.get(labelId).object;
        }
        
        // Get detail level
        const detail = this.getDetailLevel();
        
        // Merge with default options
        const mergedOptions = {
            text: 'Label',
            position: new THREE.Vector3(0, 0, 0),
            color: this.defaultColors.label,
            size: 2,
            backgroundColor: this.defaultColors.background,
            backgroundOpacity: 0.5,
            resolution: detail.labelResolution,
            ...options
        };
        
        // Create canvas
        const canvas = document.createElement('canvas');
        canvas.width = mergedOptions.resolution;
        canvas.height = mergedOptions.resolution / 2;
        
        // Get context
        const context = canvas.getContext('2d');
        
        // Draw background
        context.fillStyle = `rgba(${this.hexToRgb(mergedOptions.backgroundColor)}, ${mergedOptions.backgroundOpacity})`;
        context.fillRect(0, 0, canvas.width, canvas.height);
        
        // Draw text
        context.fillStyle = `#${mergedOptions.color.toString(16).padStart(6, '0')}`;
        context.font = `${canvas.height / 2}px Arial`;
        context.textAlign = 'center';
        context.textBaseline = 'middle';
        context.fillText(mergedOptions.text, canvas.width / 2, canvas.height / 2);
        
        // Create texture
        const texture = new THREE.CanvasTexture(canvas);
        
        // Create material
        const material = new THREE.SpriteMaterial({
            map: texture,
            transparent: true
        });
        
        // Create sprite
        const sprite = new THREE.Sprite(material);
        sprite.name = labelId;
        
        // Set position
        sprite.position.copy(mergedOptions.position);
        
        // Set scale
        sprite.scale.set(mergedOptions.size, mergedOptions.size / 2, 1);
        
        // Add to scene
        if (this.scene) {
            this.scene.add(sprite);
        }
        
        // Register label
        this.labels.set(labelId, {
            object: sprite,
            options: mergedOptions,
            canvas: canvas,
            texture: texture
        });
        
        return sprite;
    }
    
    /**
     * Convert hex color to RGB
     * @param {number} hex - Hex color
     * @returns {string} RGB color string
     */
    hexToRgb(hex) {
        const color = new THREE.Color(hex);
        return `${color.r}, ${color.g}, ${color.b}`;
    }
    
    /**
     * Update scale bar
     * @param {string} scaleBarId - Scale bar ID
     * @param {Object} options - Scale bar options
     */
    updateScaleBar(scaleBarId, options = {}) {
        const scaleBarData = this.scaleBars.get(scaleBarId);
        if (!scaleBarData) return;
        
        const { object } = scaleBarData;
        
        // Remove old scale bar
        if (this.scene && object.parent === this.scene) {
            this.scene.remove(object);
        }
        
        // Dispose of resources
        object.traverse(child => {
            if (child.isMesh || child.isLine) {
                if (child.geometry) {
                    child.geometry.dispose();
                }
                if (child.material) {
                    child.material.dispose();
                }
            }
        });
        
        // Create new scale bar
        const newScaleBar = this.createScaleBar(
            scaleBarId,
            { ...scaleBarData.options, ...options }
        );
        
        // Update registry
        scaleBarData.object = newScaleBar;
        scaleBarData.options = { ...scaleBarData.options, ...options };
    }
    
    /**
     * Update distance marker
     * @param {string} markerId - Distance marker ID
     * @param {Object} options - Distance marker options
     */
    updateDistanceMarker(markerId, options = {}) {
        const markerData = this.distanceMarkers.get(markerId);
        if (!markerData) return;
        
        const { object } = markerData;
        
        // Remove old distance marker
        if (this.scene && object.parent === this.scene) {
            this.scene.remove(object);
        }
        
        // Dispose of resources
        object.traverse(child => {
            if (child.isMesh || child.isLine) {
                if (child.geometry) {
                    child.geometry.dispose();
                }
                if (child.material) {
                    child.material.dispose();
                }
            }
        });
        
        // Create new distance marker
        const newDistanceMarker = this.createDistanceMarker(
            markerId,
            { ...markerData.options, ...options }
        );
        
        // Update registry
        markerData.object = newDistanceMarker;
        markerData.options = { ...markerData.options, ...options };
    }
    
    /**
     * Update grid
     * @param {string} gridId - Grid ID
     * @param {Object} options - Grid options
     */
    updateGrid(gridId, options = {}) {
        const gridData = this.grids.get(gridId);
        if (!gridData) return;
        
        const { object } = gridData;
        
        // Remove old grid
        if (this.scene && object.parent === this.scene) {
            this.scene.remove(object);
        }
        
        // Dispose of resources
        object.traverse(child => {
            if (child.isMesh || child.isLine) {
                if (child.geometry) {
                    child.geometry.dispose();
                }
                if (child.material) {
                    child.material.dispose();
                }
            }
        });
        
        // Create new grid
        const newGrid = this.createGrid(
            gridId,
            { ...gridData.options, ...options }
        );
        
        // Update registry
        gridData.object = newGrid;
        gridData.options = { ...gridData.options, ...options };
    }
    
    /**
     * Update label
     * @param {string} labelId - Label ID
     * @param {Object} options - Label options
     */
    updateLabel(labelId, options = {}) {
        const labelData = this.labels.get(labelId);
        if (!labelData) return;
        
        const { object, canvas, texture } = labelData;
        
        // Remove old label
        if (this.scene && object.parent === this.scene) {
            this.scene.remove(object);
        }
        
        // Dispose of resources
        if (texture) {
            texture.dispose();
        }
        
        // Create new label
        const newLabel = this.createLabel(
            labelId,
            { ...labelData.options, ...options }
        );
        
        // Update registry
        labelData.object = newLabel;
        labelData.options = { ...labelData.options, ...options };
    }
    
    /**
     * Get visualization by ID and type
     * @param {string} visualizationId - Visualization ID
     * @param {string} type - Visualization type
     * @returns {THREE.Object3D} Visualization or null if not found
     */
    getVisualization(visualizationId, type) {
        switch (type) {
            case 'scaleBar':
                const scaleBarData = this.scaleBars.get(visualizationId);
                return scaleBarData ? scaleBarData.object : null;
            case 'distanceMarker':
                const markerData = this.distanceMarkers.get(visualizationId);
                return markerData ? markerData.object : null;
            case 'grid':
                const gridData = this.grids.get(visualizationId);
                return gridData ? gridData.object : null;
            case 'label':
                const labelData = this.labels.get(visualizationId);
                return labelData ? labelData.object : null;
            default:
                return null;
        }
    }
    
    /**
     * Remove visualization by ID and type
     * @param {string} visualizationId - Visualization ID
     * @param {string} type - Visualization type
     */
    removeVisualization(visualizationId, type) {
        switch (type) {
            case 'scaleBar':
                this.removeScaleBar(visualizationId);
                break;
            case 'distanceMarker':
                this.removeDistanceMarker(visualizationId);
                break;
            case 'grid':
                this.removeGrid(visualizationId);
                break;
            case 'label':
                this.removeLabel(visualizationId);
                break;
        }
    }
    
    /**
     * Remove scale bar by ID
     * @param {string} scaleBarId - Scale bar ID
     */
    removeScaleBar(scaleBarId) {
        const scaleBarData = this.scaleBars.get(scaleBarId);
        if (!scaleBarData) return;
        
        const { object } = scaleBarData;
        
        // Remove from scene
        if (this.scene && object.parent === this.scene) {
            this.scene.remove(object);
        }
        
        // Dispose of resources
        object.traverse(child => {
            if (child.isMesh || child.isLine) {
                if (child.geometry) {
                    child.geometry.dispose();
                }
                if (child.material) {
                    child.material.dispose();
                }
            }
        });
        
        // Remove from registry
        this.scaleBars.delete(scaleBarId);
    }
    
    /**
     * Remove distance marker by ID
     * @param {string} markerId - Distance marker ID
     */
    removeDistanceMarker(markerId) {
        const markerData = this.distanceMarkers.get(markerId);
        if (!markerData) return;
        
        const { object } = markerData;
        
        // Remove from scene
        if (this.scene && object.parent === this.scene) {
            this.scene.remove(object);
        }
        
        // Dispose of resources
        object.traverse(child => {
            if (child.isMesh || child.isLine) {
                if (child.geometry) {
                    child.geometry.dispose();
                }
                if (child.material) {
                    child.material.dispose();
                }
            }
        });
        
        // Remove from registry
        this.distanceMarkers.delete(markerId);
    }
    
    /**
     * Remove grid by ID
     * @param {string} gridId - Grid ID
     */
    removeGrid(gridId) {
        const gridData = this.grids.get(gridId);
        if (!gridData) return;
        
        const { object } = gridData;
        
        // Remove from scene
        if (this.scene && object.parent === this.scene) {
            this.scene.remove(object);
        }
        
        // Dispose of resources
        object.traverse(child => {
            if (child.isMesh || child.isLine) {
                if (child.geometry) {
                    child.geometry.dispose();
                }
                if (child.material) {
                    child.material.dispose();
                }
            }
        });
        
        // Remove from registry
        this.grids.delete(gridId);
    }
    
    /**
     * Remove label by ID
     * @param {string} labelId - Label ID
     */
    removeLabel(labelId) {
        const labelData = this.labels.get(labelId);
        if (!labelData) return;
        
        const { object, texture } = labelData;
        
        // Remove from scene
        if (this.scene && object.parent === this.scene) {
            this.scene.remove(object);
        }
        
        // Dispose of resources
        if (texture) {
            texture.dispose();
        }
        if (object.material) {
            object.material.dispose();
        }
        
        // Remove from registry
        this.labels.delete(labelId);
    }
    
    /**
     * Toggle scale bar visibility
     * @param {boolean} visible - Whether scale bars are visible
     */
    toggleScaleBars(visible) {
        this.enableScaleBar = visible;
        
        this.scaleBars.forEach(scaleBarData => {
            scaleBarData.object.visible = visible;
        });
    }
    
    /**
     * Toggle distance marker visibility
     * @param {boolean} visible - Whether distance markers are visible
     */
    toggleDistanceMarkers(visible) {
        this.enableDistanceMarkers = visible;
        
        this.distanceMarkers.forEach(markerData => {
            markerData.object.visible = visible;
        });
    }
    
    /**
     * Toggle grid visibility
     * @param {boolean} visible - Whether grids are visible
     */
    toggleGrids(visible) {
        this.enableGrid = visible;
        
        this.grids.forEach(gridData => {
            gridData.object.visible = visible;
        });
    }
    
    /**
     * Update visualizations
     * @param {number} deltaTime - Time elapsed in seconds
     */
    update(deltaTime) {
        // Update labels to face camera
        this.labels.forEach(labelData => {
            const { object } = labelData;
            
            // Make label always face camera
            if (this.camera) {
                object.lookAt(this.camera.position);
            }
        });
    }
    
    /**
     * Clear all visualizations
     */
    clearAllVisualizations() {
        // Clear all scale bars
        const scaleBarIds = Array.from(this.scaleBars.keys());
        scaleBarIds.forEach(scaleBarId => {
            this.removeScaleBar(scaleBarId);
        });
        
        // Clear all distance markers
        const markerIds = Array.from(this.distanceMarkers.keys());
        markerIds.forEach(markerId => {
            this.removeDistanceMarker(markerId);
        });
        
        // Clear all grids
        const gridIds = Array.from(this.grids.keys());
        gridIds.forEach(gridId => {
            this.removeGrid(gridId);
        });
        
        // Clear all labels
        const labelIds = Array.from(this.labels.keys());
        labelIds.forEach(labelId => {
            this.removeLabel(labelId);
        });
    }
    
    /**
     * Dispose of all resources and clean up
     */
    dispose() {
        // Clear all visualizations
        this.clearAllVisualizations();
        
        // Clear registries
        this.scaleBars.clear();
        this.distanceMarkers.clear();
        this.grids.clear();
        this.labels.clear();
    }
}