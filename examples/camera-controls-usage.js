/**
 * Example usage of the CameraControls system
 * This example demonstrates how to use the CameraControls class with the RenderEngine
 */

import { RenderEngine } from '../src/core/RenderEngine.js';
import { UIEngine } from '../src/core/UIEngine.js';
import { SolarSystem } from '../src/celestial/SolarSystem.js';
import { SimulationEngine } from '../src/core/SimulationEngine.js';

// Initialize the application
async function initApp() {
    // Get canvas element
    const canvas = document.getElementById('canvas');
    if (!canvas) {
        console.error('Canvas element not found');
        return;
    }
    
    try {
        // Initialize engines
        const renderEngine = new RenderEngine(canvas);
        const uiEngine = new UIEngine();
        const solarSystem = new SolarSystem();
        const simulationEngine = new SimulationEngine();
        
        // Initialize all engines
        await renderEngine.initialize();
        await uiEngine.initialize();
        await solarSystem.initialize();
        await simulationEngine.initialize();
        
        // Connect engines together
        connectEngines(renderEngine, uiEngine, solarSystem, simulationEngine);
        
        // Start the simulation
        startSimulation(renderEngine, simulationEngine);
        
        console.log('Application initialized successfully');
        
    } catch (error) {
        console.error('Failed to initialize application:', error);
    }
}

/**
 * Connect all engines together
 */
function connectEngines(renderEngine, uiEngine, solarSystem, simulationEngine) {
    // Connect UI to RenderEngine for camera controls
    uiEngine.on('cameraModeChanged', (mode) => {
        renderEngine.setCameraMode(mode);
    });
    
    uiEngine.on('cameraPresetChanged', (preset) => {
        renderEngine.moveToPreset(preset, true);
    });
    
    uiEngine.on('movementSpeedChanged', (speed) => {
        renderEngine.setMovementSpeed(speed);
    });
    
    uiEngine.on('rotationSensitivityChanged', (sensitivity) => {
        renderEngine.setRotationSensitivity(sensitivity);
    });
    
    uiEngine.on('zoomSensitivityChanged', (sensitivity) => {
        renderEngine.setZoomSensitivity(sensitivity);
    });
    
    uiEngine.on('panSensitivityChanged', (sensitivity) => {
        renderEngine.setPanSensitivity(sensitivity);
    });
    
    uiEngine.on('cameraInertiaChanged', (inertia) => {
        renderEngine.setInertia(inertia);
    });
    
    uiEngine.on('navigationAidsToggled', (show) => {
        renderEngine.showNavigationAids(show);
    });
    
    uiEngine.on('cameraResetRequested', () => {
        renderEngine.resetCamera(true);
    });
    
    uiEngine.on('animationDurationChanged', (duration) => {
        // Store animation duration for future animations
        window.animationDuration = duration;
    });
    
    uiEngine.on('animationEasingChanged', (easing) => {
        // Store animation easing for future animations
        window.animationEasing = easing;
    });
    
    uiEngine.on('animationStopRequested', () => {
        renderEngine.stopAnimation();
    });
    
    uiEngine.on('pathRecordingStarted', (data) => {
        renderEngine.recordPath(data.name, data.interval);
    });
    
    uiEngine.on('pathRecordingStopped', () => {
        // Get the current path name from the UI
        const pathNameInput = document.getElementById('path-name');
        if (pathNameInput) {
            renderEngine.stopRecordingPath(pathNameInput.value);
        }
    });
    
    uiEngine.on('pathPlaybackStarted', (data) => {
        renderEngine.playPath(data.name, data.duration);
    });
    
    uiEngine.on('pathDeleteRequested', (pathName) => {
        renderEngine.deletePath(pathName);
    });
    
    // Connect RenderEngine to UI for path updates
    renderEngine.on('cameraPathRecordingStarted', (data) => {
        console.log(`Started recording path: ${data.name}`);
    });
    
    renderEngine.on('cameraPathRecordingStopped', (data) => {
        console.log(`Stopped recording path: ${data.name}`);
        // Update the saved paths list in the UI
        const pathNames = renderEngine.getPathNames();
        uiEngine.updateSavedPaths(pathNames);
    });
    
    renderEngine.on('cameraPathPlaybackStarted', (data) => {
        console.log(`Started playing path: ${data.name}`);
    });
    
    renderEngine.on('cameraPathDeleted', (name) => {
        console.log(`Deleted path: ${name}`);
        // Update the saved paths list in the UI
        const pathNames = renderEngine.getPathNames();
        uiEngine.updateSavedPaths(pathNames);
    });
    
    // Connect SolarSystem to RenderEngine
    solarSystem.on('bodiesUpdated', (bodies) => {
        renderEngine.updateCelestialBodies(bodies);
    });
    
    // Connect SimulationEngine to SolarSystem
    simulationEngine.on('timeUpdated', (timeData) => {
        solarSystem.updateTime(timeData);
    });
    
    // Connect UI to other engines for general controls
    uiEngine.on('timeSpeedChanged', (speed) => {
        simulationEngine.setTimeSpeed(speed);
    });
    
    uiEngine.on('showOrbitsToggled', (show) => {
        renderEngine.setShowOrbits(show);
    });
    
    uiEngine.on('showLabelsToggled', (show) => {
        renderEngine.setShowLabels(show);
    });
    
    uiEngine.on('showTexturesToggled', (show) => {
        renderEngine.setShowTextures(show);
    });
    
    uiEngine.on('planetScaleChanged', (scale) => {
        renderEngine.setPlanetScale(scale);
    });
    
    uiEngine.on('distanceScaleChanged', (scale) => {
        renderEngine.setDistanceScale(scale);
    });
    
    uiEngine.on('sunIntensityChanged', (intensity) => {
        renderEngine.setSunIntensity(intensity);
    });
    
    uiEngine.on('ambientLightChanged', (intensity) => {
        renderEngine.setAmbientLight(intensity);
    });
    
    uiEngine.on('shadowsToggled', (show) => {
        renderEngine.setShowShadows(show);
    });
    
    uiEngine.on('planetSelected', (planetId) => {
        renderEngine.selectPlanet(planetId);
        if (uiEngine.elements.get('auto-follow-planet').checked) {
            renderEngine.setFollowPlanet(planetId);
        }
    });
    
    // Connect RenderEngine to UI for object selection
    renderEngine.on('objectSelected', (objectData) => {
        uiEngine.showInfoPanel(
            objectData.name,
            objectData.description || 'No description available',
            {
                'Type': objectData.type || 'Unknown',
                'Radius': `${objectData.radius || 'Unknown'} km`,
                'Mass': `${objectData.mass || 'Unknown'} kg`,
                'Distance from Sun': `${objectData.distance || 'Unknown'} AU`
            },
            objectData.facts || []
        );
    });
    
    renderEngine.on('objectDeselected', () => {
        uiEngine.hideInfoPanel();
    });
}

/**
 * Start the simulation loop
 */
function startSimulation(renderEngine, simulationEngine) {
    // Animation loop
    function animate() {
        requestAnimationFrame(animate);
        
        // Update simulation
        simulationEngine.update();
        
        // Render the scene
        renderEngine.render();
    }
    
    // Start the animation loop
    animate();
}

// Initialize the application when the DOM is loaded
document.addEventListener('DOMContentLoaded', initApp);

// Example of programmatic camera control
function exampleCameraControl(renderEngine) {
    // Set camera mode
    renderEngine.setCameraMode('orbit');
    
    // Move to a preset position
    renderEngine.moveToPreset('top-down', true);
    
    // Animate to a custom position
    const customPosition = { x: 100, y: 100, z: 100 };
    renderEngine.animateToPosition(customPosition, 3000, 'cubicInOut');
    
    // Set follow target (assuming you have a planet mesh)
    // const earthMesh = renderEngine.celestialBodies.get('earth');
    // if (earthMesh) {
    //     renderEngine.setFollowTarget(earthMesh);
    // }
    
    // Record a path
    renderEngine.recordPath('my-path', 100);
    
    // After some time, stop recording
    setTimeout(() => {
        renderEngine.stopRecordingPath('my-path');
        
        // Play the recorded path
        renderEngine.playPath('my-path', 2000);
    }, 5000);
}

// Example of camera control via keyboard shortcuts
function setupKeyboardShortcuts(renderEngine, uiEngine) {
    document.addEventListener('keydown', (e) => {
        // Camera mode shortcuts
        switch (e.key) {
            case '1':
                renderEngine.setCameraMode('orbit');
                break;
            case '2':
                renderEngine.setCameraMode('first-person');
                break;
            case '3':
                renderEngine.setCameraMode('free-fly');
                break;
            case '4':
                renderEngine.setCameraMode('follow');
                break;
            case '5':
                renderEngine.setCameraMode('look-at');
                break;
            case '6':
                renderEngine.setCameraMode('cinematic');
                break;
        }
        
        // Preset position shortcuts
        if (e.ctrlKey) {
            switch (e.key) {
                case '1':
                    renderEngine.moveToPreset('top-down', true);
                    break;
                case '2':
                    renderEngine.moveToPreset('side-view', true);
                    break;
                case '3':
                    renderEngine.moveToPreset('ecliptic', true);
                    break;
                case '4':
                    renderEngine.moveToPreset('sun-close', true);
                    break;
                case '5':
                    renderEngine.moveToPreset('outer-system', true);
                    break;
            }
        }
        
        // Animation control shortcuts
        if (e.key === 'Escape') {
            renderEngine.stopAnimation();
        }
        
        // Reset camera shortcut
        if (e.key === 'r' && e.ctrlKey) {
            renderEngine.resetCamera(true);
        }
    });
}

// Export functions for external use
window.exampleCameraControl = exampleCameraControl;
window.setupKeyboardShortcuts = setupKeyboardShortcuts;