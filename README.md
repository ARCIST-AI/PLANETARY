# 3D Solar System Visualization

A professional-grade 3D solar system visualization with accurate astronomical data and N-body physics simulation.

![Solar System Visualization](./assets/screenshot.png)

## Features

- **Accurate Astronomical Data**: Real planetary data including orbital parameters, physical properties, and current positions
- **N-body Physics Simulation**: Advanced gravitational physics with support for perturbations and relativistic corrections
- **Interactive 3D Visualization**: Smooth camera controls, zoom, and rotation with Three.js
- **Time Controls**: Adjust simulation speed, pause, and navigate to specific dates
- **Customizable Display**: Toggle orbits, labels, textures, and adjust scales
- **Performance Monitoring**: Real-time FPS, object count, and memory usage tracking
- **Responsive Design**: Works on desktop and mobile devices
- **Educational Information**: Detailed information about celestial bodies with interesting facts

## Getting Started

### Prerequisites

- Node.js (>= 18.0.0)
- npm or yarn

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/solar-system-viz.git
   cd solar-system-viz
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Open your browser and navigate to `http://localhost:3000`

## Usage

### Basic Controls

- **Mouse**: Click and drag to rotate the view
- **Scroll**: Zoom in and out
- **Touch**: Pinch to zoom, drag to rotate (mobile devices)

### Control Panel

The control panel on the right side of the screen provides various options:

#### Time Controls
- **Simulation Speed**: Adjust how fast time passes in the simulation
- **Current Date**: View and set the current simulation date
- **Play/Pause**: Start or pause the simulation
- **Reset**: Return to the current date and time

#### View Controls
- **Camera Distance**: Adjust the distance from the solar system
- **Field of View**: Change the camera's field of view

#### Display Controls
- **Show Orbital Paths**: Toggle the visibility of orbital paths
- **Show Labels**: Toggle the visibility of celestial body labels
- **Show Textures**: Toggle the visibility of planet textures
- **Planet Scale**: Adjust the size of planets for better visibility
- **Distance Scale**: Adjust the scale of distances between bodies

#### Lighting Controls
- **Sun Intensity**: Adjust the brightness of the sun
- **Ambient Light**: Adjust the ambient lighting level

### Information Panel

Click on any celestial body to view detailed information including:
- Physical properties (mass, radius, density)
- Orbital parameters (semi-major axis, eccentricity, inclination)
- Interesting facts and trivia

## Project Structure

```
solar-system-viz/
├── public/                 # Static assets
│   ├── index.html         # Main HTML file
│   ├── styles.css         # Global styles
│   └── assets/            # Images, textures, etc.
├── src/                   # Source code
│   ├── core/              # Core engines
│   │   ├── Engine.js      # Main application engine
│   │   ├── RenderEngine.js # 3D rendering engine
│   │   ├── SimulationEngine.js # Physics simulation engine
│   │   └── UIEngine.js    # User interface engine
│   ├── physics/           # Physics calculations
│   │   ├── NBodyIntegrator.js # N-body integration
│   │   ├── KeplerianOrbit.js # Orbital mechanics
│   │   ├── Perturbations.js # Gravitational perturbations
│   │   └── CoordinateTransform.js # Coordinate transformations
│   ├── celestial/         # Celestial bodies
│   │   ├── SolarSystem.js # Solar system management
│   │   ├── Spacecraft.js  # Spacecraft simulation
│   │   └── data/          # Astronomical data
│   ├── utils/             # Utility functions
│   │   ├── MathUtils.js   # Mathematical utilities
│   │   ├── DateUtils.js   # Date and time utilities
│   │   ├── EventSystem.js # Event management
│   │   └── PerformanceMonitor.js # Performance monitoring
│   ├── workers/           # Web Workers
│   │   └── SimulationWorker.js # Physics calculations in worker
│   └── main.js            # Application entry point
├── test/                  # Test setup and utilities
├── architecture-design.md # Architecture design document
├── TESTING.md             # Testing framework documentation
└── package.json           # Project dependencies and scripts
```

## Development

### Building for Production

```bash
npm run build
```

This will create a `dist` folder with optimized production files.

### Testing

Run the test suite:

```bash
npm test
```

Run tests with coverage:

```bash
npm run test:runner -- --coverage
```

Run all checks (tests, linting, formatting):

```bash
npm run check
```

### Linting and Formatting

Check for linting issues:

```bash
npm run lint
```

Fix linting issues:

```bash
npm run lint:fix
```

Check code formatting:

```bash
npm run format:check
```

Format code:

```bash
npm run format
```

## API Reference

### Core Classes

#### Engine

The main application engine that coordinates all other components.

```javascript
import { Engine } from './src/core/Engine.js';

const engine = new Engine();
await engine.initialize();
engine.start();
```

#### SolarSystem

Manages the solar system simulation including celestial bodies and their interactions.

```javascript
import { SolarSystem } from './src/celestial/SolarSystem.js';

const solarSystem = new SolarSystem();
await solarSystem.initialize();

// Add a custom body
solarSystem.addBody({
  name: 'Custom Planet',
  mass: 1e24,
  radius: 1e7,
  position: { x: 1e11, y: 0, z: 0 },
  velocity: { x: 0, y: 3e4, z: 0 },
  color: '#ff0000',
  type: 'planet'
});
```

#### NBodyIntegrator

Handles N-body gravitational physics calculations.

```javascript
import { NBodyIntegrator } from './src/physics/NBodyIntegrator.js';

const integrator = new NBodyIntegrator({
  G: 6.67430e-11,  // Gravitational constant
  softening: 0.1,   // Softening parameter
  method: 'rk4'     // Integration method
});

// Integrate bodies forward in time
const updatedBodies = integrator.integrate(bodies, dt);
```

### Utility Functions

#### MathUtils

Mathematical utility functions.

```javascript
import { MathUtils } from './src/utils/MathUtils.js';

const mathUtils = new MathUtils();

// Convert degrees to radians
const radians = mathUtils.degToRad(180);

// Calculate distance between points
const distance = mathUtils.distance(x1, y1, x2, y2);

// Linear interpolation
const value = mathUtils.lerp(start, end, t);
```

#### DateUtils

Date and time utility functions.

```javascript
import { DateUtils } from './src/utils/DateUtils.js';

const dateUtils = new DateUtils();

// Convert Julian date to JavaScript Date
const date = dateUtils.julianToDate(julianDate);

// Calculate days since J2000 epoch
const days = dateUtils.daysSinceJ2000(date);
```

## Customization

### Adding New Celestial Bodies

You can add custom celestial bodies to the simulation:

```javascript
// Get the solar system instance
const solarSystem = engine.solarSystem;

// Add a new planet
solarSystem.addBody({
  name: 'Proxima b',
  mass: 2.45e24,  // kg
  radius: 1.1e7,   // meters
  position: { x: -1.2e11, y: 0, z: 0 },  // meters
  velocity: { x: 0, y: -2.2e4, z: 0 },   // m/s
  color: '#8B4513',
  type: 'planet',
  parent: 'Proxima Centauri'
});
```

### Custom Textures

You can add custom textures for celestial bodies:

1. Place your texture images in the `public/assets/textures/` directory
2. Reference the texture path when adding a body:

```javascript
solarSystem.addBody({
  name: 'Custom Planet',
  // ... other properties
  texture: '/assets/textures/custom-planet.jpg'
});
```

### Custom Shaders

For advanced visual effects, you can create custom shaders:

```javascript
// Create a custom shader material
const customMaterial = new THREE.ShaderMaterial({
  uniforms: {
    time: { value: 0 },
    texture: { value: texture }
  },
  vertexShader: `
    // Your vertex shader code
  `,
  fragmentShader: `
    // Your fragment shader code
  `
});

// Apply to a celestial body
body.material = customMaterial;
```

## Performance Optimization

The simulation includes several performance optimizations:

- **Web Workers**: Physics calculations run in a separate thread
- **Level of Detail**: Lower detail for distant objects
- **Frustum Culling**: Only render visible objects
- **Object Pooling**: Reuse objects instead of creating new ones
- **Efficient Data Structures**: Optimized for large numbers of objects

To monitor performance:

1. Open the control panel
2. View the performance monitor in the bottom right
3. Check FPS, object count, and memory usage

## Contributing

We welcome contributions! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Add tests for new functionality
5. Ensure all tests pass (`npm run check`)
6. Commit your changes (`git commit -m 'Add amazing feature'`)
7. Push to the branch (`git push origin feature/amazing-feature`)
8. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Three.js for 3D rendering
- NASA for planetary data and textures
- The astronomical community for orbital calculations and research

## Support

If you encounter any issues or have questions:

1. Check the [Issues](https://github.com/your-username/solar-system-viz/issues) page
2. Create a new issue with detailed information
3. Join our community discussions

## Changelog

See [CHANGELOG.md](CHANGELOG.md) for a list of changes and version history.