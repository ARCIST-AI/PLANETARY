# 🧪 Testing Guide

This document describes the comprehensive testing framework setup for the PLANETARY 3D Solar System Visualization project.

## Table of Contents

- [Overview](#overview)
- [Test Structure](#test-structure)
- [Running Tests](#running-tests)
- [Test Categories](#test-categories)
- [Writing Tests](#writing-tests)
- [Mocking Guidelines](#mocking-guidelines)
- [Coverage Requirements](#coverage-requirements)
- [Performance Testing](#performance-testing)
- [Continuous Integration](#continuous-integration)

## Overview

The project uses [Vitest](https://vitest.dev/) as the testing framework, which provides a fast unit testing experience with features like:

- **Jest-compatible API** for familiar testing patterns
- **ES module support** for modern JavaScript
- **TypeScript support** for type-safe testing
- **Coverage reporting** with multiple output formats
- **Watch mode** for development efficiency
- **UI mode** for visual test management
- **Parallel execution** for faster test runs
- **Snapshot testing** for component consistency

### Testing Philosophy

We follow these testing principles:

1. **Comprehensive Coverage**: All critical functionality should be tested
2. **Fast Execution**: Tests should run quickly for rapid feedback
3. **Reliable Results**: Tests should be deterministic and stable
4. **Clear Intent**: Tests should clearly document expected behavior
5. **Easy Maintenance**: Tests should be easy to understand and modify

## Test Structure

### File Organization

Tests are co-located with source files for better maintainability:

```
src/
├── celestial/
│   ├── CelestialBody.js
│   ├── Planet.js
│   ├── SolarSystem.js
│   ├── SolarSystem.test.js          # Existing test
│   └── celestial-bodies.test.js     # Comprehensive test suite
├── physics/
│   ├── NBodyIntegrator.js
│   ├── NBodyIntegrator.test.js      # Existing test
│   ├── KeplerianOrbit.js
│   └── physics-components.test.js   # Comprehensive test suite
├── utils/
│   ├── MathUtils.js
│   ├── MathUtils.test.js           # Existing test
│   ├── EventSystem.js
│   └── utils.test.js               # Comprehensive test suite
└── workers/
    ├── SimulationWorker.js
    └── workers.test.js             # Comprehensive test suite
```

### Test Configuration

The project uses these configuration files:

- `vitest.config.js` - Main Vitest configuration
- `test/setup.js` - Global test setup and mocks
- `test-runner.js` - Custom test runner with enhanced features

## Running Tests

### Basic Commands

```bash
# Run all tests
npm test

# Run tests in watch mode (development)
npm run test -- --watch

# Run tests with UI interface
npm run test:ui

# Run tests with coverage report
npm run test -- --coverage

# Run all quality checks (tests + linting + formatting)
npm run check
```

### Custom Test Runner

The project includes a custom test runner with additional features:

```bash
# Run specific test suite
npm run test:runner -- celestial-bodies
npm run test:runner -- physics-components
npm run test:runner -- utils
npm run test:runner -- workers

# Run with specific options
npm run test:runner -- MathUtils --ui
npm run test:runner -- --coverage
npm run test:runner -- --all

# Run single test file
npm run test:runner -- "src/utils/MathUtils.test.js"
```

### Test Filtering

```bash
# Run tests matching pattern
npm test -- --grep "gravitational"

# Run tests in specific directory
npm test -- src/physics/

# Run tests with specific timeout
npm test -- --testTimeout=10000
```

## Test Categories

### 1. Unit Tests

Test individual functions and methods in isolation:

```javascript
describe('MathUtils', () => {
  describe('vectorMagnitude', () => {
    it('should calculate vector magnitude correctly', () => {
      const vector = { x: 3, y: 4, z: 0 };
      const magnitude = MathUtils.vectorMagnitude(vector);
      
      expect(magnitude).toBeCloseTo(5.0, 5);
    });
    
    it('should handle zero vector', () => {
      const vector = { x: 0, y: 0, z: 0 };
      const magnitude = MathUtils.vectorMagnitude(vector);
      
      expect(magnitude).toBe(0);
    });
  });
});
```

### 2. Integration Tests

Test component interactions and system behavior:

```javascript
describe('SolarSystem Integration', () => {
  it('should update all bodies consistently', () => {
    const solarSystem = new SolarSystem();
    solarSystem.addBody(earth);
    solarSystem.addBody(moon);
    
    const initialEarthPos = { ...earth.position };
    const initialMoonPos = { ...moon.position };
    
    solarSystem.update(3600); // 1 hour
    
    expect(earth.position).not.toEqual(initialEarthPos);
    expect(moon.position).not.toEqual(initialMoonPos);
  });
});
```

### 3. Performance Tests

Test performance characteristics and benchmarks:

```javascript
describe('Performance', () => {
  it('should handle 1000 bodies efficiently', () => {
    const startTime = performance.now();
    
    const solarSystem = new SolarSystem();
    for (let i = 0; i < 1000; i++) {
      solarSystem.addBody(createRandomBody());
    }
    
    solarSystem.update(3600);
    
    const endTime = performance.now();
    expect(endTime - startTime).toBeLessThan(1000); // Under 1 second
  });
});
```

### 4. Edge Case Tests

Test boundary conditions and error scenarios:

```javascript
describe('Error Handling', () => {
  it('should handle invalid mass values', () => {
    expect(() => {
      new CelestialBody({ mass: -1 });
    }).toThrow('Mass must be positive');
  });
  
  it('should handle division by zero in force calculation', () => {
    const body1 = new CelestialBody({ position: { x: 0, y: 0, z: 0 } });
    const body2 = new CelestialBody({ position: { x: 0, y: 0, z: 0 } });
    
    const force = body1.calculateGravitationalForce(body2);
    expect(force).toEqual({ x: 0, y: 0, z: 0 });
  });
});
```

## Writing Tests

### Test Structure Template

```javascript
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { ClassUnderTest } from './ClassUnderTest.js';

describe('ClassUnderTest', () => {
  let instance;
  
  beforeEach(() => {
    // Setup before each test
    instance = new ClassUnderTest();
  });
  
  afterEach(() => {
    // Cleanup after each test
    vi.clearAllMocks();
  });
  
  describe('constructor', () => {
    it('should create instance with default values', () => {
      expect(instance).toBeInstanceOf(ClassUnderTest);
      expect(instance.someProperty).toBe(expectedValue);
    });
  });
  
  describe('methodName', () => {
    it('should perform expected operation', () => {
      const result = instance.methodName(input);
      expect(result).toBe(expectedOutput);
    });
    
    it('should handle edge cases', () => {
      expect(() => {
        instance.methodName(invalidInput);
      }).toThrow('Expected error message');
    });
  });
});
```

### Best Practices

#### 1. **Clear Test Names**

```javascript
// Good: Descriptive test names
it('should calculate gravitational force between two bodies at 1 AU distance', () => {
  // Test implementation
});

// Bad: Vague test names
it('should work correctly', () => {
  // Test implementation
});
```

#### 2. **Arrange-Act-Assert Pattern**

```javascript
it('should calculate orbital period correctly', () => {
  // Arrange
  const semiMajorAxis = 1.496e11; // 1 AU
  const centralMass = 1.989e30;   // Solar mass
  
  // Act
  const period = KeplerianOrbit.calculateOrbitalPeriod(semiMajorAxis, centralMass);
  
  // Assert
  expect(period).toBeCloseTo(31557600, 0); // 1 year in seconds
});
```

#### 3. **Test Independence**

```javascript
// Good: Each test is independent
describe('CelestialBody', () => {
  beforeEach(() => {
    // Fresh instance for each test
    body = new CelestialBody({ mass: 1e24, radius: 6e6 });
  });
  
  it('should update position', () => {
    body.update(3600);
    // Test specific to this body instance
  });
  
  it('should calculate force', () => {
    const otherBody = new CelestialBody({ mass: 2e24, radius: 7e6 });
    const force = body.calculateGravitationalForce(otherBody);
    // Test doesn't depend on previous test
  });
});
```

#### 4. **Meaningful Assertions**

```javascript
// Good: Specific assertions
expect(planet.surfaceTemperature).toBeCloseTo(288.15, 1); // Earth's average temperature
expect(asteroid.orbitalClass).toBe('main-belt');
expect(star.spectralClass).toMatch(/[OBAFGKM]/);

// Good: Multiple related assertions
expect(orbitResult).toMatchObject({
  position: expect.objectContaining({
    x: expect.any(Number),
    y: expect.any(Number),  
    z: expect.any(Number)
  }),
  velocity: expect.objectContaining({
    x: expect.any(Number),
    y: expect.any(Number),
    z: expect.any(Number)
  })
});
```

## Mocking Guidelines

### 1. **External Dependencies**

```javascript
// Mock Three.js for rendering tests
vi.mock('three', () => ({
  Scene: vi.fn().mockImplementation(() => ({
    add: vi.fn(),
    remove: vi.fn(),
    traverse: vi.fn()
  })),
  WebGLRenderer: vi.fn().mockImplementation(() => ({
    render: vi.fn(),
    setSize: vi.fn(),
    dispose: vi.fn()
  })),
  PerspectiveCamera: vi.fn().mockImplementation(() => ({
    position: { x: 0, y: 0, z: 0 },
    lookAt: vi.fn()
  }))
}));
```

### 2. **Complex Calculations**

```javascript
// Mock expensive physics calculations in unit tests
vi.mock('../physics/NBodyIntegrator.js', () => ({
  NBodyIntegrator: vi.fn().mockImplementation(() => ({
    integrate: vi.fn().mockReturnValue([
      { id: 'earth', position: { x: 1e11, y: 0, z: 0 } }
    ]),
    calculateTotalEnergy: vi.fn().mockReturnValue(-1e30)
  }))
}));
```

### 3. **Web APIs**

```javascript
// Mock performance API
Object.defineProperty(global, 'performance', {
  value: {
    now: vi.fn(() => Date.now()),
    memory: {
      usedJSHeapSize: 50000000,
      totalJSHeapSize: 100000000
    }
  }
});

// Mock Web Workers
vi.mock('../workers/SimulationWorker.js', () => ({
  SimulationWorker: vi.fn().mockImplementation(() => ({
    postMessage: vi.fn(),
    terminate: vi.fn(),
    onmessage: null
  }))
}));
```

### 4. **Utility Functions**

```javascript
// Mock only what's necessary
vi.mock('../utils/MathUtils.js', () => ({
  MathUtils: {
    generateUUID: vi.fn(() => 'test-uuid-123'),
    clamp: vi.fn((value, min, max) => Math.max(min, Math.min(max, value))),
    // Keep real implementations for simple functions
    degToRad: (deg) => deg * Math.PI / 180,
    radToDeg: (rad) => rad * 180 / Math.PI
  }
}));
```

## Coverage Requirements

### Coverage Targets

- **Overall Coverage**: ≥ 90%
- **Critical Path Coverage**: 100%
- **New Code Coverage**: ≥ 95%
- **Branch Coverage**: ≥ 85%

### Generating Coverage Reports

```bash
# Generate HTML coverage report
npm run test -- --coverage --reporter=html

# Generate lcov format for CI/CD
npm run test -- --coverage --reporter=lcov

# Generate multiple formats
npm run test -- --coverage --reporter=html --reporter=lcov --reporter=text
```

### Coverage Configuration

```javascript
// vitest.config.js
export default {
  test: {
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'lcov'],
      include: ['src/**/*.js'],
      exclude: [
        'src/**/*.test.js',
        'src/**/index.js',
        'src/workers/**', // Web workers have special testing needs
      ],
      thresholds: {
        global: {
          branches: 85,
          functions: 90,
          lines: 90,
          statements: 90
        }
      }
    }
  }
};
```

## Performance Testing

### Benchmarking

```javascript
describe('Performance Benchmarks', () => {
  it('should calculate N-body forces efficiently', () => {
    const bodies = createTestBodies(100);
    const integrator = new NBodyIntegrator();
    
    const startTime = performance.now();
    
    for (let i = 0; i < 10; i++) {
      integrator.calculateForces(bodies);
    }
    
    const endTime = performance.now();
    const averageTime = (endTime - startTime) / 10;
    
    expect(averageTime).toBeLessThan(50); // Less than 50ms per calculation
  });
});
```

### Memory Testing

```javascript
describe('Memory Usage', () => {
  it('should not leak memory during simulation', () => {
    const initialMemory = performance.memory.usedJSHeapSize;
    
    const solarSystem = new SolarSystem();
    
    // Run simulation cycles
    for (let i = 0; i < 1000; i++) {
      solarSystem.update(3600);
    }
    
    // Force garbage collection if available
    if (global.gc) global.gc();
    
    const finalMemory = performance.memory.usedJSHeapSize;
    const memoryIncrease = finalMemory - initialMemory;
    
    expect(memoryIncrease).toBeLessThan(10 * 1024 * 1024); // Less than 10MB increase
  });
});
```

## Continuous Integration

### GitHub Actions Configuration

```yaml
# .github/workflows/test.yml
name: Test Suite

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    
    strategy:
      matrix:
        node-version: [18.x, 20.x]
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Use Node.js ${{ matrix.node-version }}
        uses: actions/setup-node@v3
        with:
          node-version: ${{ matrix.node-version }}
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run linter
        run: npm run lint
      
      - name: Run tests
        run: npm test -- --coverage
      
      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          file: ./coverage/lcov.info
```

### Pre-commit Hooks

```json
{
  "husky": {
    "hooks": {
      "pre-commit": "npm run lint && npm test -- --run",
      "pre-push": "npm run check"
    }
  }
}
```

## Troubleshooting

### Common Issues

#### 1. **Flaky Tests**
```javascript
// Issue: Tests sometimes fail due to timing
// Solution: Use proper async/await patterns
it('should load data asynchronously', async () => {
  const promise = dataLoader.loadAstronomicalData();
  await expect(promise).resolves.toMatchObject({
    bodies: expect.any(Array)
  });
});
```

#### 2. **Memory Issues in Tests**
```javascript
// Issue: Tests consuming too much memory
// Solution: Clean up resources in afterEach
afterEach(() => {
  // Dispose of Three.js objects
  scene.traverse((object) => {
    if (object.geometry) object.geometry.dispose();
    if (object.material) object.material.dispose();
  });
  
  // Clear mock call history
  vi.clearAllMocks();
});
```

#### 3. **Precision Issues**
```javascript
// Issue: Floating-point precision errors
// Solution: Use toBeCloseTo() for numeric comparisons
expect(calculatedValue).toBeCloseTo(expectedValue, 5); // 5 decimal places
```

### Debug Mode

Enable debug mode for detailed test output:

```bash
DEBUG=true npm test
NODE_ENV=debug npm run test:runner -- MathUtils
```

---

For more information, see:
- [Development Guide](docs/DEVELOPMENT.md)
- [API Documentation](docs/API.md)
- [Vitest Documentation](https://vitest.dev/)