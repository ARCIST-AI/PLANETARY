/**
 * Custom Celestial Bodies Example
 * 
 * This example demonstrates how to add custom celestial bodies to the solar system,
 * including fictional planets, moons, and spacecraft.
 */

import { Engine } from '../src/core/Engine.js';
import { SolarSystem } from '../src/celestial/SolarSystem.js';
import { Spacecraft } from '../src/celestial/Spacecraft.js';

async function customBodiesExample() {
  console.log('Starting Custom Celestial Bodies Example...');
  
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
    
    // 3. Add a fictional planet
    const fictionalPlanet = {
      name: 'Kepler-452b',
      mass: 5.0e24,  // kg (similar to Earth)
      radius: 1.6e7, // m (slightly larger than Earth)
      position: { x: 2.0e11, y: 0, z: 0 },  // m (beyond Mars orbit)
      velocity: { x: 0, y: 2.1e4, z: 0 },   // m/s
      color: '#8B4513', // Brown color
      type: 'planet',
      texture: '/assets/textures/kepler-452b.jpg',
      description: 'A fictional Earth-like exoplanet',
      orbitalPeriod: 450, // Earth days
      rotationPeriod: 24, // Earth hours
      atmosphere: {
        composition: ['N2', 'O2', 'CO2'],
        pressure: 1.2 // atm
      }
    };
    
    solarSystem.addBody(fictionalPlanet);
    console.log('✓ Added fictional planet: Kepler-452b');
    
    // 4. Add a moon to the fictional planet
    const moon = {
      name: 'Luna Prime',
      mass: 7.3e22,  // kg (similar to Earth's Moon)
      radius: 1.7e6, // m (similar to Earth's Moon)
      position: { x: 2.0e11 + 4.0e8, y: 0, z: 0 },  // m (orbiting Kepler-452b)
      velocity: { x: 0, y: 2.1e4 + 1.0e3, z: 0 },   // m/s
      color: '#C0C0C0', // Silver color
      type: 'moon',
      parent: 'Kepler-452b',
      description: 'The largest moon of Kepler-452b',
      orbitalPeriod: 20, // Earth days
      rotationPeriod: 20, // Earth days (tidally locked)
      atmosphere: {
        composition: ['Ar', 'Ne'],
        pressure: 0.001 // atm (very thin)
      }
    };
    
    solarSystem.addBody(moon);
    console.log('✓ Added moon: Luna Prime');
    
    // 5. Add an asteroid
    const asteroid = {
      name: 'Ceres-Prime',
      mass: 9.4e20,  // kg (similar to Ceres)
      radius: 4.7e5, // m (similar to Ceres)
      position: { x: 4.1e11, y: 0, z: 0 },  // m (asteroid belt)
      velocity: { x: 0, y: 1.8e4, z: 0 },   // m/s
      color: '#A0522D', // Sienna color
      type: 'asteroid',
      description: 'A large asteroid in the asteroid belt',
      orbitalPeriod: 1680, // Earth days
      rotationPeriod: 9, // Earth hours
      shape: 'irregular',
      composition: ['rock', 'ice']
    };
    
    solarSystem.addBody(asteroid);
    console.log('✓ Added asteroid: Ceres-Prime');
    
    // 6. Add a comet
    const comet = {
      name: 'Comet X',
      mass: 1.0e13,  // kg (typical comet mass)
      radius: 5.0e3, // m (typical comet nucleus)
      position: { x: 5.0e11, y: 0, z: 0 },  // m
      velocity: { x: 0, y: 1.2e4, z: 0 },   // m/s
      color: '#87CEEB', // Sky blue color
      type: 'comet',
      description: 'A periodic comet with a highly elliptical orbit',
      orbitalPeriod: 2737, // Earth days (7.5 years)
      eccentricity: 0.7, // Highly elliptical
      inclination: 15, // degrees
      hasTail: true,
      tailLength: 1.0e8 // m
    };
    
    solarSystem.addBody(comet);
    console.log('✓ Added comet: Comet X');
    
    // 7. Create and add a spacecraft
    const spacecraft = new Spacecraft({
      name: 'Voyager-X',
      mass: 722.7, // kg (similar to Voyager)
      position: { x: 1.5e11, y: 0, z: 0 },  // m (Earth orbit)
      velocity: { x: 0, y: 3.0e4, z: 0 },   // m/s
      color: '#FFD700', // Gold color
      type: 'spacecraft',
      description: 'A deep space exploration probe',
      mission: 'Interstellar exploration',
      launchDate: new Date('2023-01-01'),
      instruments: ['camera', 'spectrometer', 'magnetometer'],
      powerSource: 'RTG',
      trajectory: 'gravity_assist'
    });
    
    solarSystem.addBody(spacecraft);
    console.log('✓ Added spacecraft: Voyager-X');
    
    // 8. Configure the simulation
    solarSystem.setTimeScale(172800); // 1 second = 2 days
    console.log('✓ Time scale set to 2 days per second');
    
    // 9. Start the simulation
    engine.start();
    console.log('✓ Simulation started');
    
    // 10. Demonstrate focusing on custom bodies
    const focusSequence = [
      'Kepler-452b',
      'Luna Prime',
      'Ceres-Prime',
      'Comet X',
      'Voyager-X'
    ];
    
    let focusIndex = 0;
    
    const focusNextBody = () => {
      const bodyName = focusSequence[focusIndex];
      const body = solarSystem.getBodyByName(bodyName);
      
      if (body) {
        console.log(`Focusing on ${bodyName}...`);
        engine.renderEngine.focusOnBody(body);
      }
      
      focusIndex = (focusIndex + 1) % focusSequence.length;
    };
    
    // Focus on each body every 8 seconds
    setInterval(focusNextBody, 8000);
    focusNextBody(); // Focus on the first body immediately
    
    // 11. Add event listeners
    engine.uiEngine.on('bodySelected', (body) => {
      console.log(`Selected body: ${body.name}`);
      if (body.description) {
        console.log(`  Description: ${body.description}`);
      }
      if (body.type === 'spacecraft' && body.mission) {
        console.log(`  Mission: ${body.mission}`);
      }
    });
    
    console.log('Custom Celestial Bodies Example running successfully!');
    console.log('The simulation includes:');
    console.log('- Fictional planet: Kepler-452b');
    console.log('- Moon: Luna Prime');
    console.log('- Asteroid: Ceres-Prime');
    console.log('- Comet: Comet X');
    console.log('- Spacecraft: Voyager-X');
    console.log('Camera will automatically focus on each body every 8 seconds.');
    
  } catch (error) {
    console.error('Error in Custom Celestial Bodies Example:', error);
  }
}

// Export the example function
export { customBodiesExample };

// Auto-run if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  customBodiesExample();
}