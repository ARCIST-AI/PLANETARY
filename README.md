# 🌌 PLANETARY - 3D Solar System Visualization

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen.svg)](https://nodejs.org/)
[![Three.js](https://img.shields.io/badge/three.js-0.161.0-blue.svg)](https://threejs.org/)
[![Vite](https://img.shields.io/badge/vite-5.1.4-646CFF.svg)](https://vitejs.dev/)

A professional-grade 3D solar system visualization with accurate astronomical data and N-body physics simulation. Built with Three.js and modern web technologies, PLANETARY provides an interactive educational experience for exploring our solar system with real-time physics calculations, orbital mechanics, and high-quality 3D rendering.

![PLANETARY Demo](docs/images/planetary-demo.gif)

## ✨ Features

### 🌍 Accurate Astronomical Simulation
- **Real astronomical data** from NASA JPL Horizons and Minor Planet Center
- **N-body physics simulation** with Runge-Kutta 4th order integration
- **Keplerian orbital mechanics** for efficient computation
- **Perturbation effects** including J2, atmospheric drag, and solar radiation pressure
- **Historical and future date simulation** (1900-2100)

### 🎮 Interactive Experience
- **Advanced camera controls** with multiple viewing modes (orbit, follow, free-fly)
- **Real-time tooltips** with detailed astronomical information
- **Time acceleration controls** from real-time to years-per-second
- **Interactive object selection** and detailed information panels
- **Preset camera views** for optimal viewing experiences

### 🚀 High Performance
- **WebGL 2.0 rendering** with Three.js
- **Level of Detail (LOD)** system for performance optimization
- **Web Workers** for physics calculations
- **Adaptive quality settings** based on performance metrics
- **Memory management** and performance monitoring

### 🎯 Educational Tools
- **Comprehensive object database** including planets, moons, asteroids, and comets
- **Orbital visualization** with trajectory prediction
- **Scale visualization** options for better understanding
- **Astronomical coordinate systems** and transformations

## 🚀 Quick Start

### Prerequisites

- **Node.js** 18.0.0 or higher
- **npm** or **yarn** package manager
- **Modern web browser** with WebGL 2.0 support (Chrome 56+, Firefox 51+, Safari 15+)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/planetary.git
   cd planetary
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   Navigate to `http://localhost:5173` to see the application running.

### Alternative: Quick Setup with Examples

```bash
# Install and run with example data
npm install
npm run dev

# Open browser to http://localhost:5173
# The application will load with the full solar system
```

## 📁 Project Structure

```
planetary/
├── src/                     # Source code
│   ├── celestial/          # Celestial body classes and systems
│   │   ├── CelestialBody.js    # Base celestial body class
│   │   ├── Planet.js           # Planet-specific functionality
│   │   ├── Star.js             # Star-specific functionality
│   │   ├── Moon.js             # Moon-specific functionality
│   │   ├── Asteroid.js         # Asteroid-specific functionality
│   │   └── SolarSystem.js      # Solar system management
│   ├── physics/            # Physics simulation modules
│   │   ├── NBodyIntegrator.js  # N-body physics integration
│   │   ├── KeplerianOrbit.js   # Keplerian orbital mechanics
│   │   ├── Perturbations.js    # Orbital perturbations
│   │   └── CoordinateTransform.js # Coordinate transformations
│   ├── rendering/          # 3D rendering components
│   │   ├── RenderingManager.js # Main rendering controller
│   │   ├── MaterialManager.js  # Material and texture management
│   │   ├── LightingManager.js  # Lighting and shadows
│   │   └── OrbitVisualization.js # Orbit trail rendering
│   ├── core/               # Core application logic
│   │   ├── Engine.js           # Main application engine
│   │   ├── DataManager.js      # Data loading and caching
│   │   ├── CameraControls.js   # Camera control system
│   │   └── WorkerManager.js    # Web worker management
│   ├── ui/                 # User interface components
│   ├── utils/              # Utility functions and constants
│   └── workers/            # Web worker scripts
├── docs/                   # Documentation
├── examples/               # Usage examples
├── test/                   # Test configuration
└── public/                 # Static assets
```

## 🎮 Usage

### Basic Usage

```javascript
import { Engine } from './src/core/Engine.js';
import { SolarSystem } from './src/celestial/SolarSystem.js';

// Initialize the application
const engine = new Engine({
    container: document.getElementById('solar-system'),
    enablePhysics: true,
    timeAcceleration: 1000 // 1000x real-time
});

// Create and load the solar system
const solarSystem = new SolarSystem();
await solarSystem.loadDefaultBodies();

// Start the simulation
engine.start();
```

### Advanced Configuration

```javascript
// Custom physics settings
const engine = new Engine({
    container: document.getElementById('container'),
    physics: {
        integrator: 'rk4',           // Runge-Kutta 4th order
        timeStep: 3600,              // 1 hour steps
        enablePerturbations: true,   // Include orbital perturbations
        softening: 1e6               // Gravitational softening
    },
    rendering: {
        antialias: true,
        shadows: true,
        postProcessing: true,
        quality: 'high'
    },
    camera: {
        mode: 'orbit',
        target: 'earth',
        distance: 10                 // AU
    }
});
```

### Adding Custom Bodies

```javascript
import { Planet } from './src/celestial/Planet.js';

// Create a custom planet
const customPlanet = new Planet({
    name: 'Custom Planet',
    mass: 5.972e24,                 // kg
    radius: 6.371e6,                // meters
    semiMajorAxis: 2.0 * 1.496e11,  // 2 AU
    eccentricity: 0.05,
    inclination: 0.1,               // radians
    color: 0x4169e1
});

solarSystem.addBody(customPlanet);
```

## 🧪 Development

### Available Scripts

```bash
# Development
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build

# Testing
npm test             # Run all tests
npm run test:ui      # Run tests with UI
npm run test:runner  # Custom test runner

# Code Quality
npm run lint         # Run ESLint
npm run lint:fix     # Fix linting issues
npm run format       # Format code with Prettier
npm run check        # Run all quality checks
```

### Running Tests

The project includes comprehensive test coverage:

```bash
# Run all tests
npm test

# Run specific test suite
npm run test:runner -- celestial-bodies
npm run test:runner -- physics-components  
npm run test:runner -- utils

# Run tests with coverage
npm run test:runner -- --coverage

# Run interactive test UI
npm run test:ui
```

### Development Guidelines

1. **Code Style**: Follow the ESLint and Prettier configurations
2. **Testing**: Write tests for all new functionality
3. **Documentation**: Update documentation for API changes
4. **Performance**: Consider performance impact of changes
5. **Browser Support**: Test in multiple browsers

See [DEVELOPMENT.md](docs/DEVELOPMENT.md) for detailed development guidelines.

## 📊 Performance

### System Requirements

**Minimum:**
- CPU: Intel i3 / AMD equivalent
- RAM: 4GB
- GPU: Integrated graphics with WebGL 2.0 support
- Browser: Chrome 70+, Firefox 65+, Safari 15+

**Recommended:**
- CPU: Intel i5 / AMD Ryzen 5
- RAM: 8GB
- GPU: Dedicated graphics card
- Browser: Latest Chrome, Firefox, or Safari

### Performance Features

- **Adaptive Quality**: Automatically adjusts rendering quality based on performance
- **LOD System**: Level of detail for distant objects
- **Web Workers**: Physics calculations run in background threads
- **Memory Management**: Efficient memory usage and garbage collection
- **Performance Monitoring**: Real-time performance metrics

## 🧪 Testing

The project includes comprehensive test coverage across all modules:

- **Unit Tests**: 148+ tests covering core functionality
- **Integration Tests**: Component interaction testing
- **Performance Tests**: Benchmark critical code paths
- **Browser Tests**: Cross-browser compatibility

Run tests with:
```bash
npm test                    # All tests
npm run test:runner -- physics    # Physics module tests
npm run test:runner -- celestial  # Celestial body tests
```

See [TESTING.md](TESTING.md) for detailed testing information.

## 📖 API Documentation

### Core Classes

#### Engine
Main application controller that orchestrates all subsystems.

```javascript
const engine = new Engine(options);
engine.start();
engine.pause();
engine.setTimeAcceleration(factor);
```

#### SolarSystem
Manages collections of celestial bodies and their interactions.

```javascript
const solarSystem = new SolarSystem();
await solarSystem.loadDefaultBodies();
solarSystem.addBody(celestialBody);
solarSystem.update(deltaTime);
```

#### CelestialBody
Base class for all astronomical objects.

```javascript
const body = new CelestialBody({
    name: 'Object Name',
    mass: 1e24,
    radius: 6e6,
    position: { x: 0, y: 0, z: 0 },
    velocity: { x: 0, y: 1000, z: 0 }
});
```

For complete API documentation, see [docs/API.md](docs/API.md).

## 🎓 Examples

### Basic Solar System
```javascript
// examples/basic-usage.js
import { Engine, SolarSystem } from '../src/index.js';

const engine = new Engine({
    container: document.getElementById('app')
});

const solarSystem = new SolarSystem();
await solarSystem.loadDefaultBodies();
engine.start();
```

### Custom Physics Simulation
```javascript
// examples/advanced-physics.js
// Demonstrates custom N-body simulation setup
```

### Camera Controls
```javascript
// examples/camera-controls-usage.js
// Shows different camera control modes
```

See the [examples/](examples/) directory for more detailed examples.

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guidelines](CONTRIBUTING.md) for details.

### Development Process

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Add tests for new functionality
5. Run the test suite (`npm test`)
6. Commit your changes (`git commit -m 'Add amazing feature'`)
7. Push to the branch (`git push origin feature/amazing-feature`)
8. Open a Pull Request

### Code of Conduct

This project follows the [Contributor Covenant Code of Conduct](CODE_OF_CONDUCT.md).

## 📜 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **NASA JPL** for providing accurate astronomical data through the Horizons system
- **Minor Planet Center** for asteroid and comet orbital elements
- **Three.js community** for the excellent 3D rendering library
- **Open source contributors** who make projects like this possible

## 📞 Support

- **Documentation**: [docs/](docs/)
- **Examples**: [examples/](examples/)
- **Issues**: Please use the GitHub issue tracker
- **Discussions**: Use GitHub Discussions for questions and ideas

## 🔗 Links

- [Live Demo](https://your-username.github.io/planetary)
- [Documentation](https://your-username.github.io/planetary/docs)
- [API Reference](docs/API.md)
- [Architecture Design](architecture-design.md)
- [Change Log](CHANGELOG.md)

---

**Built with ❤️ for space exploration and education**

*PLANETARY - Bringing the cosmos to your browser*