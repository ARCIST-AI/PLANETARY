# 🛠️ Development Guide

This guide provides comprehensive information for developers working on the PLANETARY project.

## Table of Contents

- [Development Environment Setup](#development-environment-setup)
- [Project Architecture](#project-architecture)
- [Coding Standards](#coding-standards)
- [Testing Guidelines](#testing-guidelines)
- [Performance Optimization](#performance-optimization)
- [Contributing Workflow](#contributing-workflow)
- [Debugging Tips](#debugging-tips)

## Development Environment Setup

### Prerequisites

- **Node.js** 18.0.0 or higher
- **npm** or **yarn** package manager
- **Git** for version control
- **Modern IDE** with JavaScript/TypeScript support (VS Code recommended)

### Recommended VS Code Extensions

```json
{
  "recommendations": [
    "esbenp.prettier-vscode",
    "dbaeumer.vscode-eslint",
    "bradlc.vscode-tailwindcss",
    "ms-vscode.vscode-typescript-next",
    "ms-vscode.vscode-json"
  ]
}
```

### Environment Setup

1. **Clone and setup the repository:**
   ```bash
   git clone https://github.com/your-username/planetary.git
   cd planetary
   npm install
   ```

2. **Configure your IDE:**
   - Install recommended extensions
   - Enable ESLint and Prettier integration
   - Set up auto-formatting on save

3. **Verify setup:**
   ```bash
   npm run dev
   npm test
   npm run lint
   ```

### Development Scripts

```bash
# Development server with hot reload
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with UI
npm run test:ui

# Run specific test suite
npm run test:runner -- celestial-bodies

# Code quality checks
npm run lint
npm run lint:fix
npm run format
npm run format:check

# Run all quality checks
npm run check
```

## Project Architecture

### Directory Structure

```
src/
├── celestial/          # Celestial body classes and systems
│   ├── CelestialBody.js    # Base class for all astronomical objects
│   ├── Planet.js           # Planet-specific functionality
│   ├── Star.js             # Star-specific functionality
│   ├── Moon.js             # Moon-specific functionality
│   ├── Asteroid.js         # Asteroid-specific functionality
│   ├── Comet.js            # Comet-specific functionality
│   ├── Spacecraft.js       # Spacecraft-specific functionality
│   └── SolarSystem.js      # System management and orchestration
├── physics/            # Physics simulation modules
│   ├── NBodyIntegrator.js  # N-body gravitational integration
│   ├── KeplerianOrbit.js   # Keplerian orbital mechanics
│   ├── Perturbations.js    # Orbital perturbation calculations
│   └── CoordinateTransform.js # Coordinate system transformations
├── rendering/          # 3D rendering components
│   ├── RenderingManager.js # Main rendering controller
│   ├── MaterialManager.js  # Material and texture management
│   ├── LightingManager.js  # Lighting and shadow systems
│   ├── GeometryManager.js  # Geometry optimization and LOD
│   └── OrbitVisualization.js # Orbit trail rendering
├── core/               # Core application logic
│   ├── Engine.js           # Main application orchestrator
│   ├── DataManager.js      # Data loading and caching
│   ├── CameraControls.js   # Camera control system
│   ├── SimulationEngine.js # Physics simulation controller
│   ├── RenderEngine.js     # Rendering system controller
│   ├── UIEngine.js         # User interface controller
│   └── WorkerManager.js    # Web worker management
├── ui/                 # User interface components
│   ├── TooltipManager.js   # Tooltip system
│   ├── TooltipIntegration.js # Tooltip integration
│   └── TooltipPerformanceOptimizer.js # Performance optimization
├── utils/              # Utility functions and constants
│   ├── Constants.js        # Physical and application constants
│   ├── MathUtils.js        # Mathematical utility functions
│   ├── DateUtils.js        # Date and time utilities
│   ├── EventSystem.js      # Event handling system
│   └── PerformanceMonitor.js # Performance monitoring
└── workers/            # Web worker scripts
    └── SimulationWorker.js # Physics calculation worker
```

### Module System

The project uses ES6 modules with explicit imports/exports:

```javascript
// Good: Explicit imports
import { CelestialBody } from './CelestialBody.js';
import { PHYSICS_CONSTANTS } from '../utils/Constants.js';

// Good: Explicit exports
export class Planet extends CelestialBody {
    // Implementation
}

// Index files for convenient imports
export { Planet } from './Planet.js';
export { Star } from './Star.js';
export { Moon } from './Moon.js';
```

### Design Patterns

#### 1. **Event-Driven Architecture**
```javascript
// Components communicate via events
class Engine extends EventSystem {
    start() {
        this.emit('simulationStarted');
    }
}

// Listeners can subscribe to events
engine.on('simulationStarted', () => {
    console.log('Simulation has started');
});
```

#### 2. **Factory Pattern**
```javascript
// CelestialBodyFactory creates appropriate body types
const body = CelestialBodyFactory.createBody({
    type: 'planet',
    name: 'Earth',
    // ... other properties
});
```

#### 3. **Strategy Pattern**
```javascript
// Different integration strategies
class NBodyIntegrator {
    constructor(method = 'rk4') {
        this.integrator = IntegratorFactory.create(method);
    }
}
```

## Coding Standards

### JavaScript Style Guide

We follow a modified Airbnb JavaScript style guide with these key points:

#### 1. **Naming Conventions**

```javascript
// Classes: PascalCase
class CelestialBody {}

// Functions and variables: camelCase
const calculateMass = () => {};
let gravitationalForce = 0;

// Constants: SCREAMING_SNAKE_CASE
const PHYSICS_CONSTANTS = {
    G: 6.67430e-11
};

// Private properties: prefix with underscore
class Engine {
    constructor() {
        this._isRunning = false;
    }
}
```

#### 2. **Function Documentation**

```javascript
/**
 * Calculate gravitational force between two bodies
 * @param {CelestialBody} body1 - First celestial body
 * @param {CelestialBody} body2 - Second celestial body
 * @returns {Object} Force vector {x, y, z} in Newtons
 */
function calculateGravitationalForce(body1, body2) {
    // Implementation
}
```

#### 3. **Error Handling**

```javascript
// Use descriptive error messages
if (!body.mass || body.mass <= 0) {
    throw new Error(`Invalid mass for body "${body.name}": ${body.mass}`);
}

// Handle async operations properly
try {
    const data = await loadAstronomicalData();
    return processData(data);
} catch (error) {
    console.error('Failed to load astronomical data:', error);
    throw new Error(`Data loading failed: ${error.message}`);
}
```

#### 4. **Performance Considerations**

```javascript
// Avoid unnecessary object creation in loops
const tempVector = { x: 0, y: 0, z: 0 };
for (const body of bodies) {
    // Reuse tempVector instead of creating new objects
    tempVector.x = body.position.x;
    tempVector.y = body.position.y;
    tempVector.z = body.position.z;
    // Process tempVector
}

// Use const for immutable values
const AU = 1.496e11; // meters

// Use let for mutable values
let totalMass = 0;
```

### Code Organization

#### 1. **File Structure**

```javascript
// File header with description
/**
 * Planet class
 * Represents a planet with atmospheric and geological properties
 */

// Imports at the top
import { CelestialBody } from './CelestialBody.js';
import { PHYSICS_CONSTANTS } from '../utils/Constants.js';

// Class definition
export class Planet extends CelestialBody {
    // Constructor first
    constructor(options = {}) {
        super(options);
        // Planet-specific initialization
    }
    
    // Public methods
    addMoon(moon) {
        // Implementation
    }
    
    // Private methods (prefixed with underscore)
    _calculateAtmosphericPressure() {
        // Implementation
    }
}
```

#### 2. **Import/Export Guidelines**

```javascript
// Prefer named exports over default exports
export class Planet {} // Good
export default Planet;  // Avoid

// Group imports logically
// Third-party imports first
import * as THREE from 'three';

// Internal imports
import { CelestialBody } from './CelestialBody.js';
import { PHYSICS_CONSTANTS } from '../utils/Constants.js';
```

## Testing Guidelines

### Test Structure

We use Vitest for testing with this structure:

```javascript
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { Planet } from './Planet.js';

describe('Planet', () => {
    let planet;
    
    beforeEach(() => {
        planet = new Planet({
            name: 'Test Planet',
            mass: 5.972e24,
            radius: 6.371e6
        });
    });
    
    afterEach(() => {
        // Cleanup if needed
    });
    
    describe('constructor', () => {
        it('should create a planet with correct properties', () => {
            expect(planet.name).toBe('Test Planet');
            expect(planet.mass).toBe(5.972e24);
            expect(planet.type).toBe('planet');
        });
        
        it('should handle invalid input', () => {
            expect(() => {
                new Planet({ mass: -1 });
            }).toThrow('Invalid mass');
        });
    });
    
    describe('addMoon', () => {
        it('should add a moon to the planet', () => {
            const moon = new Moon({ name: 'Test Moon' });
            planet.addMoon(moon);
            
            expect(planet.moons).toHaveLength(1);
            expect(planet.moons[0]).toBe(moon);
        });
    });
});
```

### Testing Best Practices

#### 1. **Test Categories**

```javascript
// Unit tests: Test individual functions/methods
it('should calculate gravitational force correctly', () => {
    const force = calculateGravitationalForce(body1, body2);
    expect(force.magnitude).toBeCloseTo(expectedForce, 5);
});

// Integration tests: Test component interactions
it('should update all bodies in the solar system', () => {
    solarSystem.addBody(earth);
    solarSystem.addBody(moon);
    solarSystem.update(3600);
    
    expect(earth.position).not.toEqual(initialEarthPosition);
    expect(moon.position).not.toEqual(initialMoonPosition);
});

// Performance tests: Test performance characteristics
it('should handle 1000 bodies efficiently', () => {
    const startTime = performance.now();
    
    for (let i = 0; i < 1000; i++) {
        solarSystem.addBody(createRandomBody());
    }
    solarSystem.update(3600);
    
    const endTime = performance.now();
    expect(endTime - startTime).toBeLessThan(100); // ms
});
```

#### 2. **Mocking Guidelines**

```javascript
// Mock external dependencies
vi.mock('../utils/DataLoader.js', () => ({
    loadAstronomicalData: vi.fn().mockResolvedValue(mockData)
}));

// Mock Three.js objects
vi.mock('three', () => ({
    Scene: vi.fn().mockImplementation(() => ({
        add: vi.fn(),
        remove: vi.fn()
    })),
    WebGLRenderer: vi.fn().mockImplementation(() => ({
        render: vi.fn(),
        setSize: vi.fn()
    }))
}));
```

### Test Coverage Goals

- **Unit Test Coverage**: > 90%
- **Integration Test Coverage**: > 80%
- **Critical Path Coverage**: 100%

```bash
# Run tests with coverage
npm run test:runner -- --coverage

# Check coverage for specific modules
npm run test:runner -- celestial-bodies --coverage
```

## Performance Optimization

### 1. **Memory Management**

```javascript
// Reuse objects to avoid garbage collection
const tempVector = { x: 0, y: 0, z: 0 };
const tempMatrix = new THREE.Matrix4();

class PhysicsCalculator {
    constructor() {
        // Pre-allocate working objects
        this.workingVector = { x: 0, y: 0, z: 0 };
        this.workingMatrix = new THREE.Matrix4();
    }
    
    calculate(bodies) {
        bodies.forEach(body => {
            // Reuse working objects
            this.workingVector.x = body.position.x;
            // ... calculations
        });
    }
}
```

### 2. **Loop Optimization**

```javascript
// Cache array length
const bodies = solarSystem.getBodies();
const bodyCount = bodies.length;

for (let i = 0; i < bodyCount; i++) {
    const body = bodies[i];
    // Process body
}

// Use for...of for cleaner code when index isn't needed
for (const body of bodies) {
    // Process body
}
```

### 3. **Computational Optimization**

```javascript
// Pre-calculate constants
const G_TIMES_MASS = PHYSICS_CONSTANTS.G * body.mass;

// Use squared distances to avoid sqrt when possible
const distanceSquared = dx * dx + dy * dy + dz * dz;
if (distanceSquared < thresholdSquared) {
    // Only calculate sqrt when necessary
    const distance = Math.sqrt(distanceSquared);
}

// Use bitwise operations for integer math
const index = (x << 8) | y; // Instead of x * 256 + y
```

### 4. **Rendering Performance**

```javascript
// Use object pooling for frequently created/destroyed objects
class ParticlePool {
    constructor(size) {
        this.pool = [];
        for (let i = 0; i < size; i++) {
            this.pool.push(new Particle());
        }
        this.index = 0;
    }
    
    acquire() {
        const particle = this.pool[this.index];
        this.index = (this.index + 1) % this.pool.length;
        return particle;
    }
}

// Batch rendering operations
const geometryBatcher = new GeometryBatcher();
bodies.forEach(body => {
    geometryBatcher.add(body.geometry, body.position);
});
geometryBatcher.render();
```

## Contributing Workflow

### 1. **Branch Strategy**

```bash
# Feature branches
git checkout -b feature/new-physics-model

# Bug fix branches
git checkout -b fix/memory-leak-issue

# Documentation branches
git checkout -b docs/api-updates
```

### 2. **Commit Guidelines**

Follow conventional commits:

```bash
# Feature commits
git commit -m "feat(physics): add relativistic effects to N-body calculation"

# Bug fix commits
git commit -m "fix(rendering): resolve memory leak in texture management"

# Documentation commits
git commit -m "docs(api): update CelestialBody class documentation"

# Test commits
git commit -m "test(celestial): add comprehensive Planet class tests"
```

### 3. **Pull Request Process**

1. **Create feature branch**
   ```bash
   git checkout -b feature/my-feature
   ```

2. **Make changes with tests**
   - Write code following style guidelines
   - Add comprehensive tests
   - Update documentation

3. **Run quality checks**
   ```bash
   npm run check
   npm test
   ```

4. **Submit pull request**
   - Clear description of changes
   - Link to related issues
   - Include test results

5. **Code review process**
   - Address reviewer feedback
   - Update tests if necessary
   - Maintain code quality standards

## Debugging Tips

### 1. **Browser DevTools**

```javascript
// Use performance profiling
console.time('physics-calculation');
performPhysicsCalculation();
console.timeEnd('physics-calculation');

// Memory debugging
console.log('Memory usage:', performance.memory);

// Three.js debugging
console.log('Renderer info:', renderer.info);
```

### 2. **Custom Debug Tools**

```javascript
// Debug visualization for orbits
class OrbitDebugger {
    static visualizeOrbit(body, steps = 100) {
        const points = [];
        const orbit = new KeplerianOrbit(body.orbitalElements);
        
        for (let i = 0; i < steps; i++) {
            const time = new Date(Date.now() + i * 86400000); // Daily steps
            const position = orbit.getPositionAtTime(time);
            points.push(position);
        }
        
        return points;
    }
}

// Performance monitoring
const monitor = new PerformanceMonitor();
monitor.on('performanceWarning', (metrics) => {
    console.warn('Performance issue:', metrics);
});
```

### 3. **Testing Debug Features**

```javascript
// Debug mode in tests
const debugMode = process.env.NODE_ENV === 'debug';

if (debugMode) {
    console.log('Test data:', {
        body: body.serialize(),
        forces: calculatedForces,
        expectedResult: expectedValue
    });
}
```

### 4. **Common Issues and Solutions**

#### Performance Issues
```javascript
// Issue: Low FPS
// Solution: Check renderer stats
console.log('Draw calls:', renderer.info.render.calls);
console.log('Triangles:', renderer.info.render.triangles);

// If too many draw calls, implement batching
// If too many triangles, implement LOD system
```

#### Memory Leaks
```javascript
// Issue: Increasing memory usage
// Solution: Check for unreleased resources
scene.traverse((object) => {
    if (object.geometry) object.geometry.dispose();
    if (object.material) {
        if (Array.isArray(object.material)) {
            object.material.forEach(material => material.dispose());
        } else {
            object.material.dispose();
        }
    }
});
```

#### Physics Instabilities
```javascript
// Issue: Bodies flying off to infinity
// Solution: Check integration parameters
const integrator = new NBodyIntegrator({
    softening: 1e6,    // Increase softening
    timeStep: 3600,    // Decrease time step
    method: 'rk4'      // Use more stable integrator
});
```

---

For more information, see:
- [API Documentation](API.md)
- [Testing Guide](TESTING.md)
- [Architecture Design](../architecture-design.md)