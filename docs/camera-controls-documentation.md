# Camera Controls Documentation

## Overview

The CameraControls system provides a comprehensive camera management solution for the 3D solar system visualization. It supports multiple camera modes, smooth animations, path recording/playback, and various navigation aids.

## Features

### Camera Modes

1. **Orbit Mode**: Default camera mode that orbits around a target point
2. **First Person Mode**: Camera moves freely in first-person perspective
3. **Free Fly Mode**: Camera can move and rotate freely in 3D space
4. **Follow Mode**: Camera follows a selected celestial body
5. **Look At Mode**: Camera maintains focus on a selected object
6. **Cinematic Mode**: Smooth cinematic camera movements

### Preset Camera Positions

- **Top Down**: Bird's eye view of the solar system
- **Side View**: Side view of the solar system
- **Ecliptic**: View from the ecliptic plane
- **Sun Close**: Close-up view of the Sun
- **Outer System**: View focused on outer planets

### Camera Controls

#### Movement Speed
- Adjustable movement speed for all camera modes
- Range: 0.1x to 5x normal speed

#### Sensitivity Settings
- **Rotation Sensitivity**: Controls mouse rotation sensitivity
- **Zoom Sensitivity**: Controls mouse wheel zoom sensitivity
- **Pan Sensitivity**: Controls mouse panning sensitivity
- **Camera Inertia**: Controls smoothness of camera movement

#### Navigation Aids
- **Mini-map**: Shows top-down view of camera position
- **Compass**: Shows camera orientation
- **Distance Indicators**: Shows distance to celestial bodies

### Animation System

#### Camera Animation
- Smooth transitions between camera positions
- Configurable duration and easing functions
- Supported easing functions: Linear, Ease In/Out, Cubic In/Out

#### Path Recording and Playback
- Record camera movements as named paths
- Adjustable recording interval
- Playback recorded paths with configurable duration
- Save and manage multiple camera paths

### Keyboard Controls

| Key | Action |
|-----|--------|
| W | Move forward |
| S | Move backward |
| A | Move left |
| D | Move right |
| Q | Move up |
| E | Move down |
| Shift | Speed boost |
| Space | Brake/Stop |
| C | Toggle camera mode |
| R | Reset camera |
| 1-6 | Switch camera modes (1=Orbit, 2=First Person, etc.) |
| Ctrl+1-5 | Move to preset positions |
| Escape | Stop current animation |

### Touch/Mobile Support

- Single finger drag: Rotate camera
- Two finger pinch: Zoom in/out
- Two finger drag: Pan camera
- Double tap: Reset camera

## API Reference

### CameraControls Class

#### Constructor
```javascript
new CameraControls(camera, domElement, options)
```

#### Methods

##### Camera Mode
```javascript
// Set camera mode
setMode(mode) // mode: 'orbit', 'first-person', 'free-fly', 'follow', 'look-at', 'cinematic'

// Get current camera mode
getMode() // Returns current mode string
```

##### Position and Target
```javascript
// Set camera position
setPosition(position, animate = false) // position: {x, y, z}

// Set camera target
setTarget(target) // target: {x, y, z}

// Set follow target
setFollowTarget(target) // target: THREE.Object3D or null

// Set look-at target
setLookAtTarget(target) // target: THREE.Object3D or null
```

##### Preset Positions
```javascript
// Move to preset position
moveToPreset(presetName, animate = true) // presetName: 'top-down', 'side-view', etc.
```

##### Sensitivity and Speed
```javascript
// Set movement speed
setMovementSpeed(speed) // speed: number (0.1-5)

// Set rotation sensitivity
setRotationSensitivity(sensitivity) // sensitivity: number (0.1-3)

// Set zoom sensitivity
setZoomSensitivity(sensitivity) // sensitivity: number (0.1-3)

// Set pan sensitivity
setPanSensitivity(sensitivity) // sensitivity: number (0.1-3)

// Set camera inertia
setInertia(inertia) // inertia: number (0-0.99)
```

##### Animation
```javascript
// Animate to position
animateToPosition(position, duration = 2000, easing = 'cubicInOut')

// Animate along path
animateAlongPath(path, duration = 2000, easing = 'cubicInOut')

// Stop current animation
stopAnimation()
```

##### Path Recording and Playback
```javascript
// Start recording path
recordPath(name, interval = 100) // name: string, interval: ms

// Stop recording path
stopRecordingPath(name) // name: string

// Play recorded path
playPath(name, duration = 2000) // name: string, duration: ms

// Delete recorded path
deletePath(name) // name: string

// Get all recorded path names
getPathNames() // Returns array of strings

// Get recorded path data
getPath(name) // Returns path data object or null
```

##### Navigation Aids
```javascript
// Show/hide navigation aids
showNavigationAids(show) // show: boolean
```

##### Camera State
```javascript
// Reset camera
reset(animate = false)

// Get camera state
getState() // Returns camera state object

// Set camera state
setState(state) // state: camera state object
```

##### Update and Destroy
```javascript
// Update camera controls (call in animation loop)
update(delta) // delta: time since last frame in seconds

// Destroy camera controls
destroy()
```

#### Events

The CameraControls class emits various events:

```javascript
// Camera events
cameraControls.on('cameraUpdated', (data) => { ... })
cameraControls.on('cameraModeChanged', (mode) => { ... })
cameraControls.on('cameraPositionChanged', (position) => { ... })
cameraControls.on('cameraTargetChanged', (target) => { ... })
cameraControls.on('cameraFollowTargetChanged', (target) => { ... })
cameraControls.on('cameraLookAtTargetChanged', (target) => { ... })

// Settings events
cameraControls.on('cameraMovementSpeedChanged', (speed) => { ... })
cameraControls.on('cameraRotationSensitivityChanged', (sensitivity) => { ... })
cameraControls.on('cameraZoomSensitivityChanged', (sensitivity) => { ... })
cameraControls.on('cameraPanSensitivityChanged', (sensitivity) => { ... })
cameraControls.on('cameraInertiaChanged', (inertia) => { ... })

// Animation events
cameraControls.on('cameraAnimationStarted', (animation) => { ... })
cameraControls.on('cameraAnimationCompleted', (animation) => { ... })
cameraControls.on('cameraAnimationStopped', (animation) => { ... })

// Path events
cameraControls.on('cameraPathRecordingStarted', (data) => { ... })
cameraControls.on('cameraPathRecordingStopped', (data) => { ... })
cameraControls.on('cameraPathPlaybackStarted', (data) => { ... })
cameraControls.on('cameraPathDeleted', (name) => { ... })

// Navigation aids events
cameraControls.on('navigationAidsVisibilityChanged', (visible) => { ... })

// Other events
cameraControls.on('cameraReset', () => { ... })
cameraControls.on('cameraDoubleClick', (data) => { ... })
cameraControls.on('cyclePlanetsRequested', () => { ... })
```

### Integration with RenderEngine

The CameraControls system is integrated with the RenderEngine class. Here's how to use it:

```javascript
// Initialize render engine
const renderEngine = new RenderEngine(canvas);
await renderEngine.initialize();

// Camera control methods are available through renderEngine
renderEngine.setCameraMode('orbit');
renderEngine.moveToPreset('top-down', true);
renderEngine.setMovementSpeed(1.5);
```

### Integration with UIEngine

The UIEngine provides camera control panels that connect to the CameraControls system:

```javascript
// Initialize UI engine
const uiEngine = new UIEngine();
await uiEngine.initialize();

// Connect UI events to render engine
uiEngine.on('cameraModeChanged', (mode) => {
    renderEngine.setCameraMode(mode);
});

uiEngine.on('cameraPresetChanged', (preset) => {
    renderEngine.moveToPreset(preset, true);
});

// And so on for other camera controls...
```

## Examples

### Basic Camera Control

```javascript
// Set camera mode
renderEngine.setCameraMode('orbit');

// Move to a preset position
renderEngine.moveToPreset('top-down', true);

// Adjust movement speed
renderEngine.setMovementSpeed(1.5);
```

### Camera Animation

```javascript
// Animate to custom position
const position = { x: 100, y: 100, z: 100 };
renderEngine.animateToPosition(position, 3000, 'cubicInOut');

// Animate along a path
const path = [
    { x: 0, y: 100, z: 0 },
    { x: 100, y: 100, z: 0 },
    { x: 100, y: 100, z: 100 }
];
renderEngine.animateAlongPath(path, 5000, 'easeInOut');
```

### Path Recording and Playback

```javascript
// Start recording a path
renderEngine.recordPath('my-journey', 100);

// After some time, stop recording
setTimeout(() => {
    renderEngine.stopRecordingPath('my-journey');
    
    // Play the recorded path
    renderEngine.playPath('my-journey', 2000);
}, 5000);
```

### Following a Celestial Body

```javascript
// Get a celestial body (e.g., Earth)
const earth = renderEngine.celestialBodies.get('earth');

// Set camera to follow Earth
renderEngine.setFollowTarget(earth);

// Set camera to look at Earth
renderEngine.setLookAtTarget(earth);
```

## Best Practices

1. **Use Appropriate Camera Modes**: Choose the camera mode that best suits your use case. Use 'orbit' for general exploration, 'follow' for tracking objects, and 'cinematic' for presentations.

2. **Smooth Transitions**: Use animations for camera transitions to provide a better user experience.

3. **Path Recording**: Use path recording for creating tours or demonstrations of your solar system.

4. **Performance**: Be mindful of performance when using navigation aids, especially the mini-map, as they require additional rendering.

5. **Mobile Considerations**: Test touch controls on mobile devices and adjust sensitivity settings as needed.

6. **Camera Constraints**: The camera system includes constraints to prevent getting too close to the Sun or going too far from the solar system. These can be adjusted in the configuration.

## Troubleshooting

### Camera Not Moving
- Check if the camera controls are properly initialized
- Verify that the update method is being called in the animation loop
- Check if the camera mode is set correctly

### Jerky Camera Movement
- Adjust the camera inertia setting for smoother movement
- Ensure the delta time is being passed correctly to the update method
- Check for performance issues that might affect frame rate

### Path Recording Not Working
- Ensure the path name is unique
- Check if the recording interval is appropriate for your use case
- Verify that the stopRecordingPath method is called with the same name

### Navigation Aids Not Visible
- Check if navigation aids are enabled
- Verify that the CSS styles are properly loaded
- Ensure the DOM elements are properly created

## Future Enhancements

Potential future enhancements to the camera system:

1. **Advanced Path Editing**: Allow editing of recorded paths
2. **Camera Shake Effects**: Add shake effects for events like collisions
3. **Depth of Field**: Add depth of field effects for more cinematic visuals
4. **Multiple Camera Support**: Support for multiple cameras with switching
5. **Camera Profiles**: Save and load camera configurations
6. **VR Support**: Add support for VR headsets
7. **AI Camera**: AI-controlled camera that automatically follows interesting events