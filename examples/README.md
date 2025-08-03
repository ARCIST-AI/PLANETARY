# Examples

This directory contains example scripts demonstrating how to use the Solar System Visualization project.

## Available Examples

### 1. Basic Usage Example (`basic-usage.js`)

Demonstrates the fundamental usage of the solar system visualization:

- Initializing the engine
- Configuring time settings
- Setting specific dates
- Starting and controlling the simulation
- Adding event listeners for user interaction
- Programmatic camera control

**Run the example:**
```bash
node examples/basic-usage.js
```

**Key concepts demonstrated:**
- Engine initialization and configuration
- Solar system time control
- Event handling
- Basic camera manipulation

### 2. Custom Celestial Bodies Example (`custom-bodies.js`)

Shows how to add custom celestial bodies to the simulation:

- Adding fictional planets
- Creating moons for planets
- Adding asteroids and comets
- Integrating spacecraft
- Setting custom properties and descriptions
- Automatic camera focusing on custom bodies

**Run the example:**
```bash
node examples/custom-bodies.js
```

**Key concepts demonstrated:**
- Creating custom celestial bodies
- Setting body properties (mass, radius, position, velocity)
- Adding descriptive information
- Creating orbital relationships (parent bodies)
- Spacecraft simulation

### 3. Advanced Physics Simulation Example (`advanced-physics.js`)

Demonstrates advanced physics simulation features:

- Custom N-body integrator configuration
- Gravitational perturbations
- Relativistic corrections
- Energy and angular momentum conservation monitoring
- Integration method comparison
- Center of mass tracking
- Binary system simulation

**Run the example:**
```bash
node examples/advanced-physics.js
```

**Key concepts demonstrated:**
- Advanced physics configuration
- Conservation law monitoring
- Integration method comparison
- Relativistic effects
- System property tracking

## Running Examples

### Prerequisites

Before running the examples, make sure you have:

1. Installed all dependencies:
   ```bash
   npm install
   ```

2. Built the project:
   ```bash
   npm run build
   ```

### Running an Example

To run any example:

```bash
node examples/<example-name>.js
```

For example:
```bash
node examples/basic-usage.js
```

### Running in a Browser

Some examples can be adapted to run in a browser. To do this:

1. Create an HTML file that imports the example
2. Include the necessary CSS and JavaScript files
3. Open the HTML file in a browser

Example HTML structure:
```html
<!DOCTYPE html>
<html>
<head>
    <title>Solar System Example</title>
    <link rel="stylesheet" href="/public/styles.css">
</head>
<body>
    <div id="app">
        <div id="canvas-container">
            <canvas id="solar-system-canvas"></canvas>
        </div>
        <div id="ui-container" class="ui-container"></div>
    </div>
    
    <script type="module">
        import { basicUsageExample } from './examples/basic-usage.js';
        basicUsageExample();
    </script>
</body>
</html>
```

## Creating Your Own Examples

To create your own example:

1. Create a new JavaScript file in the `examples/` directory
2. Import the necessary modules from the `src/` directory
3. Follow the pattern established in the existing examples:
   - Create an async function for your example
   - Initialize the engine with appropriate configuration
   - Set up the solar system and any custom bodies
   - Add event listeners and monitoring as needed
   - Start the simulation
   - Export the function for use in other modules
   - Add auto-run code for direct execution

### Example Template

```javascript
/**
 * Your Custom Example
 * 
 * Description of what your example demonstrates
 */

import { Engine } from '../src/core/Engine.js';
import { SolarSystem } from '../src/celestial/SolarSystem.js';

async function yourCustomExample() {
  console.log('Starting Your Custom Example...');
  
  try {
    // 1. Create and initialize the engine
    const engine = new Engine({
      canvasId: 'solar-system-canvas',
      enablePerformanceMonitor: true
    });
    
    await engine.initialize();
    console.log('✓ Engine initialized');
    
    // 2. Access the solar system
    const solarSystem = engine.solarSystem;
    
    // 3. Your custom code here
    // ...
    
    // 4. Start the simulation
    engine.start();
    console.log('✓ Simulation started');
    
    console.log('Your Custom Example running successfully!');
    
  } catch (error) {
    console.error('Error in Your Custom Example:', error);
  }
}

// Export the example function
export { yourCustomExample };

// Auto-run if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  yourCustomExample();
}
```

## Tips for Creating Examples

1. **Start Simple**: Begin with basic functionality and gradually add complexity
2. **Add Logging**: Use console.log to show what's happening at each step
3. **Handle Errors**: Always wrap your code in try-catch blocks
4. **Document**: Add clear comments explaining what each section does
5. **Modularize**: Break complex examples into smaller, manageable functions
6. **Test**: Make sure your example runs without errors before sharing

## Common Patterns

### Initialization Pattern

Most examples will follow this initialization pattern:

```javascript
const engine = new Engine({
  canvasId: 'solar-system-canvas',
  enablePerformanceMonitor: true
});

await engine.initialize();

const solarSystem = engine.solarSystem;
```

### Custom Body Pattern

To add custom celestial bodies:

```javascript
const customBody = {
  name: 'Custom Body',
  mass: 1e24,
  radius: 1e7,
  position: { x: 1e11, y: 0, z: 0 },
  velocity: { x: 0, y: 3e4, z: 0 },
  color: '#ff0000',
  type: 'planet'
};

solarSystem.addBody(customBody);
```

### Event Handling Pattern

To respond to user interactions:

```javascript
engine.uiEngine.on('bodySelected', (body) => {
  console.log(`Selected: ${body.name}`);
});

engine.uiEngine.on('timeScaleChanged', (scale) => {
  console.log(`Time scale: ${scale}x`);
});
```

### Simulation Control Pattern

To control the simulation:

```javascript
// Set time scale
solarSystem.setTimeScale(86400); // 1 second = 1 day

// Pause/resume
solarSystem.pause();
solarSystem.resume();

// Set specific date
solarSystem.setTime(new Date('2023-06-21'));

// Start/stop engine
engine.start();
engine.stop();
```

## Troubleshooting

### Common Issues

1. **Module Not Found**: Make sure all dependencies are installed with `npm install`
2. **Canvas Not Found**: Ensure the canvas element with the correct ID exists in your HTML
3. **Initialization Errors**: Check that you're awaiting the engine initialization
4. **Physics Errors**: Verify that all bodies have valid mass, position, and velocity properties

### Debug Mode

To enable debug mode, add this to your engine configuration:

```javascript
const engine = new Engine({
  canvasId: 'solar-system-canvas',
  enablePerformanceMonitor: true,
  debug: true
});
```

This will provide additional logging and debugging information.

## Contributing Examples

We welcome contributions of new examples! Please:

1. Follow the established patterns and conventions
2. Add clear documentation and comments
3. Test your example thoroughly
4. Update this README with information about your example
5. Submit a pull request with your example

For more information about contributing, see the main project README.