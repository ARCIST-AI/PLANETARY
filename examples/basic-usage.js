/**
 * Basic Usage Example
 * 
 * This example demonstrates how to initialize and use the solar system visualization
 * with basic configuration and controls.
 */

import { Engine } from '../src/core/Engine.js';
import { SolarSystem } from '../src/celestial/SolarSystem.js';

async function basicUsageExample() {
  console.log('Starting Basic Usage Example...');
  
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
    
    // 3. Configure time settings
    solarSystem.setTimeScale(86400); // 1 second = 1 day
    console.log('✓ Time scale set to 1 day per second');
    
    // 4. Set a specific date
    const targetDate = new Date('2023-06-21'); // Summer solstice
    solarSystem.setTime(targetDate);
    console.log(`✓ Date set to ${targetDate.toDateString()}`);
    
    // 5. Start the simulation
    engine.start();
    console.log('✓ Simulation started');
    
    // 6. Add event listeners for user interaction
    engine.uiEngine.on('bodySelected', (body) => {
      console.log(`Selected body: ${body.name}`);
      console.log(`  Mass: ${body.mass.toExponential(2)} kg`);
      console.log(`  Radius: ${body.radius.toExponential(2)} m`);
    });
    
    engine.uiEngine.on('timeScaleChanged', (scale) => {
      console.log(`Time scale changed to: ${scale}x`);
    });
    
    // 7. Demonstrate programmatic control
    setTimeout(() => {
      console.log('Pausing simulation...');
      solarSystem.pause();
      
      setTimeout(() => {
        console.log('Resuming simulation...');
        solarSystem.resume();
      }, 3000);
    }, 5000);
    
    // 8. Demonstrate camera control
    setTimeout(() => {
      console.log('Focusing on Earth...');
      const earth = solarSystem.getBodyByName('Earth');
      if (earth) {
        engine.renderEngine.focusOnBody(earth);
      }
    }, 10000);
    
    console.log('Basic Usage Example running successfully!');
    console.log('Use your mouse to interact with the visualization:');
    console.log('- Click and drag to rotate');
    console.log('- Scroll to zoom');
    console.log('- Click on planets for information');
    
  } catch (error) {
    console.error('Error in Basic Usage Example:', error);
  }
}

// Export the example function
export { basicUsageExample };

// Auto-run if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  basicUsageExample();
}