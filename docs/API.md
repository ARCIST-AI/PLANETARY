# 📖 API Documentation

This document provides comprehensive API documentation for the PLANETARY 3D Solar System Visualization project.

## Table of Contents

- [Core Classes](#core-classes)
- [Celestial Bodies](#celestial-bodies)
- [Physics System](#physics-system)
- [Rendering System](#rendering-system)
- [Utilities](#utilities)
- [Event System](#event-system)
- [Configuration Options](#configuration-options)

## Core Classes

### Engine

Main application controller that orchestrates all subsystems.

```javascript
import { Engine } from './src/core/Engine.js';
```

#### Constructor

```javascript
const engine = new Engine(options);
```

**Parameters:**
- `options` (Object) - Configuration options
  - `container` (HTMLElement) - DOM container for the 3D canvas
  - `enablePhysics` (boolean) - Enable N-body physics simulation (default: `true`)
  - `timeAcceleration` (number) - Time acceleration factor (default: `1`)
  - `physics` (Object) - Physics configuration
  - `rendering` (Object) - Rendering configuration
  - `camera` (Object) - Camera configuration

#### Methods

##### `start()`
Starts the simulation and rendering loop.

```javascript
engine.start();
```

##### `pause()`
Pauses the simulation.

```javascript
engine.pause();
```

##### `resume()`
Resumes a paused simulation.

```javascript
engine.resume();
```

##### `setTimeAcceleration(factor)`
Sets the time acceleration factor.

```javascript
engine.setTimeAcceleration(1000); // 1000x real-time
```

**Parameters:**
- `factor` (number) - Time acceleration multiplier

##### `addBody(body)`
Adds a celestial body to the simulation.

```javascript
engine.addBody(celestialBody);
```

**Parameters:**
- `body` (CelestialBody) - The celestial body to add

##### `getPerformanceMetrics()`
Returns current performance metrics.

```javascript
const metrics = engine.getPerformanceMetrics();
// { fps: 60, memoryUsage: 45.2, drawCalls: 123 }
```

### SolarSystem

Manages collections of celestial bodies and their interactions.

```javascript
import { SolarSystem } from './src/celestial/SolarSystem.js';
```

#### Constructor

```javascript
const solarSystem = new SolarSystem(options);
```

**Parameters:**
- `options` (Object) - Configuration options
  - `enablePhysics` (boolean) - Enable N-body physics (default: `true`)
  - `timeStep` (number) - Physics time step in seconds (default: `3600`)

#### Methods

##### `loadDefaultBodies()`
Loads the default solar system bodies (Sun, planets, moons).

```javascript
await solarSystem.loadDefaultBodies();
```

**Returns:** Promise that resolves when all bodies are loaded.

##### `addBody(body)`
Adds a celestial body to the system.

```javascript
solarSystem.addBody(celestialBody);
```

##### `removeBody(id)`
Removes a celestial body by ID.

```javascript
solarSystem.removeBody('earth');
```

##### `getBody(id)`
Retrieves a celestial body by ID.

```javascript
const earth = solarSystem.getBody('earth');
```

##### `getBodiesByType(type)`
Retrieves all bodies of a specific type.

```javascript
const planets = solarSystem.getBodiesByType('planet');
const moons = solarSystem.getBodiesByType('moon');
```

##### `update(deltaTime)`
Updates all celestial bodies and their physics.

```javascript
solarSystem.update(deltaTime);
```

## Celestial Bodies

### CelestialBody

Base class for all astronomical objects.

```javascript
import { CelestialBody } from './src/celestial/CelestialBody.js';
```

#### Constructor

```javascript
const body = new CelestialBody(options);
```

**Parameters:**
- `options` (Object) - Body configuration
  - `name` (string) - Body name
  - `mass` (number) - Mass in kilograms
  - `radius` (number) - Radius in meters
  - `position` (Object) - Initial position `{x, y, z}` in meters
  - `velocity` (Object) - Initial velocity `{x, y, z}` in m/s
  - `color` (number) - Body color (hex)
  - `texture` (string) - Texture URL (optional)

#### Properties

- `id` (string) - Unique identifier
- `name` (string) - Display name
- `type` (string) - Body type ('star', 'planet', 'moon', etc.)
- `mass` (number) - Mass in kg
- `radius` (number) - Radius in meters
- `position` (Object) - Current position `{x, y, z}`
- `velocity` (Object) - Current velocity `{x, y, z}`
- `acceleration` (Object) - Current acceleration `{x, y, z}`

#### Methods

##### `update(deltaTime, useNBody)`
Updates the body's physics and rendering.

```javascript
body.update(deltaTime, true); // Use N-body physics
```

##### `calculateGravitationalForce(otherBody)`
Calculates gravitational force with another body.

```javascript
const force = body.calculateGravitationalForce(otherBody);
```

##### `getDistanceTo(otherBody)`
Calculates distance to another body.

```javascript
const distance = earth.getDistanceTo(moon);
```

### Planet

Represents a planet with additional planetary properties.

```javascript
import { Planet } from './src/celestial/Planet.js';
```

#### Constructor

```javascript
const planet = new Planet(options);
```

**Additional Properties:**
- `albedo` (number) - Surface reflectivity (0-1)
- `surfaceTemperature` (number) - Surface temperature in Kelvin
- `atmosphere` (Object) - Atmospheric properties
- `moons` (Array) - Array of moon objects

#### Methods

##### `addMoon(moon)`
Adds a moon to the planet.

```javascript
planet.addMoon(moonObject);
```

##### `removeMoon(moonId)`
Removes a moon by ID.

```javascript
planet.removeMoon('luna');
```

##### `isInHabitableZone()`
Determines if the planet is in its star's habitable zone.

```javascript
const habitable = planet.isInHabitableZone();
```

### Star

Represents a star with stellar properties.

```javascript
import { Star } from './src/celestial/Star.js';
```

#### Additional Properties

- `luminosity` (number) - Luminosity in watts
- `temperature` (number) - Surface temperature in Kelvin
- `spectralClass` (string) - Spectral classification (O, B, A, F, G, K, M)
- `stellarClass` (string) - Stellar classification

#### Methods

##### `getHabitableZone()`
Calculates the habitable zone boundaries.

```javascript
const hz = star.getHabitableZone();
// { inner: 1.4e11, outer: 1.6e11 } // in meters
```

### Asteroid

Represents an asteroid with specific asteroid properties.

```javascript
import { Asteroid } from './src/celestial/Asteroid.js';
```

#### Additional Properties

- `orbitalClass` (string) - Orbital classification
- `composition` (Object) - Compositional data
- `rotationPeriod` (number) - Rotation period in seconds

#### Methods

##### `isPotentiallyHazardous()`
Determines if the asteroid is potentially hazardous to Earth.

```javascript
const hazardous = asteroid.isPotentiallyHazardous();
```

## Physics System

### NBodyIntegrator

Handles N-body gravitational physics integration.

```javascript
import { NBodyIntegrator } from './src/physics/NBodyIntegrator.js';
```

#### Constructor

```javascript
const integrator = new NBodyIntegrator(config);
```

**Parameters:**
- `config` (Object) - Integration configuration
  - `G` (number) - Gravitational constant (default: `6.67430e-11`)
  - `softening` (number) - Softening parameter (default: `1e6`)
  - `method` (string) - Integration method ('euler', 'rk4', 'verlet')

#### Methods

##### `addBody(body)`
Adds a body to the integration system.

```javascript
integrator.addBody(celestialBody);
```

##### `integrate(bodies, deltaTime)`
Performs one integration step.

```javascript
const updatedBodies = integrator.integrate(bodies, deltaTime);
```

### KeplerianOrbit

Handles Keplerian orbital mechanics calculations.

```javascript
import { KeplerianOrbit } from './src/physics/KeplerianOrbit.js';
```

#### Constructor

```javascript
const orbit = new KeplerianOrbit(elements);
```

**Parameters:**
- `elements` (Object) - Orbital elements
  - `semiMajorAxis` (number) - Semi-major axis in meters
  - `eccentricity` (number) - Orbital eccentricity
  - `inclination` (number) - Inclination in radians
  - `longitudeOfAscendingNode` (number) - LOAN in radians
  - `argumentOfPeriapsis` (number) - Argument of periapsis in radians
  - `meanAnomalyAtEpoch` (number) - Mean anomaly at epoch in radians
  - `epoch` (Date) - Epoch time

#### Methods

##### `getPositionAtTime(time)`
Calculates position at a given time.

```javascript
const position = orbit.getPositionAtTime(new Date());
```

##### `getVelocityAtTime(time)`
Calculates velocity at a given time.

```javascript
const velocity = orbit.getVelocityAtTime(new Date());
```

## Rendering System

### RenderingManager

Manages 3D rendering operations.

```javascript
import { RenderingManager } from './src/rendering/RenderingManager.js';
```

#### Methods

##### `setQuality(level)`
Sets rendering quality level.

```javascript
renderer.setQuality('high'); // 'low', 'medium', 'high', 'ultra'
```

##### `enableShadows(enable)`
Enables or disables shadow rendering.

```javascript
renderer.enableShadows(true);
```

## Utilities

### EventSystem

Provides event handling capabilities.

```javascript
import { EventSystem } from './src/utils/EventSystem.js';
```

#### Methods

##### `on(event, callback)`
Registers an event listener.

```javascript
eventSystem.on('bodySelected', (body) => {
    console.log('Selected:', body.name);
});
```

##### `emit(event, ...args)`
Emits an event.

```javascript
eventSystem.emit('bodySelected', celestialBody);
```

##### `off(event, callback)`
Removes an event listener.

```javascript
eventSystem.off('bodySelected', callback);
```

### PerformanceMonitor

Monitors application performance.

```javascript
import { PerformanceMonitor } from './src/utils/PerformanceMonitor.js';
```

#### Methods

##### `start()`
Starts performance monitoring.

```javascript
monitor.start();
```

##### `getMetrics()`
Returns current performance metrics.

```javascript
const metrics = monitor.getMetrics();
// { fps: 60, memoryUsage: 45.2, frameTime: 16.7 }
```

## Configuration Options

### Engine Configuration

```javascript
const engine = new Engine({
    container: document.getElementById('app'),
    
    // Physics settings
    physics: {
        integrator: 'rk4',              // Integration method
        timeStep: 3600,                 // Time step in seconds
        enablePerturbations: true,      // Include orbital perturbations
        softening: 1e6,                 // Gravitational softening
        useRelativistic: false          // Relativistic effects
    },
    
    // Rendering settings
    rendering: {
        antialias: true,                // Anti-aliasing
        shadows: true,                  // Shadow rendering
        postProcessing: true,           // Post-processing effects
        quality: 'high',                // Quality level
        maxObjects: 10000,              // Maximum rendered objects
        lodDistances: {                 // Level of detail distances
            high: 5,                    // AU
            medium: 20,
            low: 100
        }
    },
    
    // Camera settings
    camera: {
        mode: 'orbit',                  // Camera mode
        target: 'earth',                // Target object
        distance: 10,                   // Distance in AU
        fov: 60,                        // Field of view
        near: 0.1,                      // Near clipping plane
        far: 1e15                       // Far clipping plane
    },
    
    // Performance settings
    performance: {
        adaptiveQuality: true,          // Adaptive quality adjustment
        targetFPS: 60,                  // Target frame rate
        memoryLimit: 1024,              // Memory limit in MB
        enableWorkers: true             // Use web workers
    }
});
```

### Time Configuration

```javascript
// Time acceleration factors
const timeFactors = {
    REAL_TIME: 1,
    MINUTE_PER_SECOND: 60,
    HOUR_PER_SECOND: 3600,
    DAY_PER_SECOND: 86400,
    WEEK_PER_SECOND: 604800,
    MONTH_PER_SECOND: 2592000,
    YEAR_PER_SECOND: 31536000
};

engine.setTimeAcceleration(timeFactors.DAY_PER_SECOND);
```

### Quality Levels

```javascript
const qualityLevels = {
    LOW: {
        textureSize: 512,
        shadows: false,
        postProcessing: false,
        antialiasing: false,
        particleCount: 100
    },
    MEDIUM: {
        textureSize: 1024,
        shadows: true,
        postProcessing: false,
        antialiasing: true,
        particleCount: 500
    },
    HIGH: {
        textureSize: 2048,
        shadows: true,
        postProcessing: true,
        antialiasing: true,
        particleCount: 1000
    },
    ULTRA: {
        textureSize: 4096,
        shadows: true,
        postProcessing: true,
        antialiasing: true,
        particleCount: 2000
    }
};
```

## Error Handling

All API methods that can fail return promises or throw descriptive errors:

```javascript
try {
    await solarSystem.loadDefaultBodies();
    engine.start();
} catch (error) {
    console.error('Failed to initialize:', error.message);
}
```

## Events

The system emits various events for different states:

```javascript
// Body selection
engine.on('bodySelected', (body) => {
    console.log('Selected body:', body.name);
});

// Performance warnings
engine.on('performanceWarning', (metrics) => {
    console.warn('Performance issue:', metrics);
});

// Simulation state changes  
engine.on('simulationPaused', () => {
    console.log('Simulation paused');
});

engine.on('simulationResumed', () => {
    console.log('Simulation resumed');
});
```

## Type Definitions

For TypeScript users, type definitions are available:

```typescript
interface CelestialBodyOptions {
    name: string;
    mass: number;
    radius: number;
    position: Vector3;
    velocity: Vector3;
    color?: number;
    texture?: string;
}

interface Vector3 {
    x: number;
    y: number;
    z: number;
}

interface OrbitalElements {
    semiMajorAxis: number;
    eccentricity: number;
    inclination: number;
    longitudeOfAscendingNode: number;
    argumentOfPeriapsis: number;
    meanAnomalyAtEpoch: number;
    epoch: Date;
}
```

---

For more examples and advanced usage, see the [examples/](../examples/) directory.