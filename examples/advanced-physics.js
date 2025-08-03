/**
 * Advanced Physics Simulation Example
 * 
 * This example demonstrates advanced physics simulation features including:
 * - Custom integration methods
 * - Gravitational perturbations
 * - Relativistic corrections
 * - Custom gravitational constants
 * - Multi-body interactions
 */

import { Engine } from '../src/core/Engine.js';
import { SolarSystem } from '../src/celestial/SolarSystem.js';
import { NBodyIntegrator } from '../src/physics/NBodyIntegrator.js';
import { Perturbations } from '../src/physics/Perturbations.js';
import { MathUtils } from '../src/utils/MathUtils.js';

async function advancedPhysicsExample() {
  console.log('Starting Advanced Physics Simulation Example...');
  
  try {
    // 1. Create a custom N-body integrator with advanced settings
    const customIntegrator = new NBodyIntegrator({
      G: 6.67430e-11,  // Gravitational constant
      softening: 1e6,   // Softening parameter to prevent singularities
      method: 'rk4'     // Runge-Kutta 4th order integration method
    });
    
    console.log('✓ Custom N-body integrator created');
    
    // 2. Create a perturbations calculator
    const perturbations = new Perturbations({
      includeRelativistic: true,
      includeTidal: true,
      includeNonGravitational: true
    });
    
    console.log('✓ Perturbations calculator created');
    
    // 3. Create and initialize the engine with custom physics
    const engine = new Engine({
      canvasId: 'solar-system-canvas',
      enablePerformanceMonitor: true,
      integrator: customIntegrator,
      perturbations: perturbations
    });
    
    await engine.initialize();
    console.log('✓ Engine initialized with custom physics');
    
    // 4. Access the solar system
    const solarSystem = engine.solarSystem;
    
    // 5. Demonstrate energy conservation monitoring
    let initialEnergy = solarSystem.getTotalEnergy();
    console.log(`Initial system energy: ${initialEnergy.toExponential(2)} J`);
    
    // Monitor energy conservation
    setInterval(() => {
      const currentEnergy = solarSystem.getTotalEnergy();
      const energyChange = Math.abs((currentEnergy - initialEnergy) / initialEnergy);
      
      console.log(`Current energy: ${currentEnergy.toExponential(2)} J`);
      console.log(`Energy change: ${(energyChange * 100).toFixed(6)}%`);
      
      // Update initial energy periodically to account for numerical drift
      if (energyChange > 0.01) { // 1% threshold
        initialEnergy = currentEnergy;
        console.log('Updated initial energy reference');
      }
    }, 5000);
    
    // 6. Demonstrate angular momentum conservation
    let initialAngularMomentum = calculateAngularMomentum(solarSystem);
    console.log(`Initial angular momentum: ${initialAngularMomentum.toExponential(2)} kg⋅m²/s`);
    
    // Monitor angular momentum conservation
    setInterval(() => {
      const currentAngularMomentum = calculateAngularMomentum(solarSystem);
      const momentumChange = Math.abs((currentAngularMomentum - initialAngularMomentum) / initialAngularMomentum);
      
      console.log(`Current angular momentum: ${currentAngularMomentum.toExponential(2)} kg⋅m²/s`);
      console.log(`Angular momentum change: ${(momentumChange * 100).toFixed(6)}%`);
      
      if (momentumChange > 0.01) { // 1% threshold
        initialAngularMomentum = currentAngularMomentum;
        console.log('Updated initial angular momentum reference');
      }
    }, 5000);
    
    // 7. Demonstrate center of mass tracking
    setInterval(() => {
      const com = solarSystem.getCenterOfMass();
      console.log(`Center of mass: (${com.x.toExponential(2)}, ${com.y.toExponential(2)}, ${com.z.toExponential(2)}) m`);
    }, 3000);
    
    // 8. Demonstrate integration method comparison
    console.log('\n--- Integration Method Comparison ---');
    
    // Create a simple two-body system for comparison
    const simpleSystem = [
      {
        mass: 1.989e30,  // Sun mass
        position: { x: 0, y: 0, z: 0 },
        velocity: { x: 0, y: 0, z: 0 }
      },
      {
        mass: 5.972e24,  // Earth mass
        position: { x: 1.496e11, y: 0, z: 0 },  // 1 AU
        velocity: { x: 0, y: 2.978e4, z: 0 }   // Earth orbital velocity
      }
    ];
    
    // Test different integration methods
    const methods = ['euler', 'rk4'];
    const dt = 86400; // 1 day time step
    
    methods.forEach(method => {
      console.log(`\nTesting ${method.toUpperCase()} integration method:`);
      
      customIntegrator.method = method;
      const testSystem = JSON.parse(JSON.stringify(simpleSystem)); // Deep copy
      
      const startTime = performance.now();
      
      // Simulate for one Earth year
      for (let i = 0; i < 365; i++) {
        customIntegrator.integrate(testSystem, dt);
      }
      
      const endTime = performance.now();
      const executionTime = endTime - startTime;
      
      // Calculate final orbital parameters
      const earth = testSystem[1];
      const distance = Math.sqrt(earth.position.x ** 2 + earth.position.y ** 2 + earth.position.z ** 2);
      const velocity = Math.sqrt(earth.velocity.x ** 2 + earth.velocity.y ** 2 + earth.velocity.z ** 2);
      
      console.log(`  Execution time: ${executionTime.toFixed(2)} ms`);
      console.log(`  Final distance: ${distance.toExponential(2)} m (expected: ~1.496e11 m)`);
      console.log(`  Final velocity: ${velocity.toExponential(2)} m/s (expected: ~2.978e4 m/s)`);
      console.log(`  Distance error: ${Math.abs(distance - 1.496e11).toExponential(2)} m`);
      console.log(`  Velocity error: ${Math.abs(velocity - 2.978e4).toExponential(2)} m/s`);
    });
    
    // 9. Demonstrate relativistic effects
    console.log('\n--- Relativistic Effects Demonstration ---');
    
    // Create a close binary system with high velocities
    const binarySystem = [
      {
        mass: 1.989e30,  // Sun mass
        position: { x: -1e10, y: 0, z: 0 },
        velocity: { x: 0, y: -1e5, z: 0 }
      },
      {
        mass: 1.989e30,  // Sun mass
        position: { x: 1e10, y: 0, z: 0 },
        velocity: { x: 0, y: 1e5, z: 0 }
      }
    ];
    
    // Simulate with and without relativistic corrections
    console.log('Simulating binary system without relativistic corrections:');
    perturbations.includeRelativistic = false;
    const systemWithoutRelativity = JSON.parse(JSON.stringify(binarySystem));
    
    for (let i = 0; i < 100; i++) {
      customIntegrator.integrate(systemWithoutRelativity, dt);
    }
    
    console.log('Simulating binary system with relativistic corrections:');
    perturbations.includeRelativistic = true;
    const systemWithRelativity = JSON.parse(JSON.stringify(binarySystem));
    
    for (let i = 0; i < 100; i++) {
      customIntegrator.integrate(systemWithRelativity, dt);
    }
    
    // Compare results
    const separationWithoutRel = Math.sqrt(
      (systemWithoutRelativity[1].position.x - systemWithoutRelativity[0].position.x) ** 2 +
      (systemWithoutRelativity[1].position.y - systemWithoutRelativity[0].position.y) ** 2
    );
    
    const separationWithRel = Math.sqrt(
      (systemWithRelativity[1].position.x - systemWithRelativity[0].position.x) ** 2 +
      (systemWithRelativity[1].position.y - systemWithRelativity[0].position.y) ** 2
    );
    
    console.log(`Final separation without relativity: ${separationWithoutRel.toExponential(2)} m`);
    console.log(`Final separation with relativity: ${separationWithRel.toExponential(2)} m`);
    console.log(`Relativistic correction: ${Math.abs(separationWithRel - separationWithoutRel).toExponential(2)} m`);
    
    // 10. Start the main simulation
    solarSystem.setTimeScale(86400); // 1 second = 1 day
    engine.start();
    console.log('\n✓ Main simulation started');
    
    console.log('Advanced Physics Simulation Example running successfully!');
    console.log('Monitor the console for:');
    console.log('- Energy conservation');
    console.log('- Angular momentum conservation');
    console.log('- Center of mass tracking');
    console.log('- Integration method comparison results');
    console.log('- Relativistic effects demonstration');
    
  } catch (error) {
    console.error('Error in Advanced Physics Simulation Example:', error);
  }
}

// Helper function to calculate total angular momentum of the system
function calculateAngularMomentum(solarSystem) {
  const bodies = solarSystem.bodies;
  let totalAngularMomentum = { x: 0, y: 0, z: 0 };
  
  for (const body of bodies) {
    // L = r × p = r × mv
    const r = body.position;
    const v = body.velocity;
    const m = body.mass;
    
    // Cross product: r × mv
    const angularMomentum = {
      x: m * (r.y * v.z - r.z * v.y),
      y: m * (r.z * v.x - r.x * v.z),
      z: m * (r.x * v.y - r.y * v.x)
    };
    
    totalAngularMomentum.x += angularMomentum.x;
    totalAngularMomentum.y += angularMomentum.y;
    totalAngularMomentum.z += angularMomentum.z;
  }
  
  // Calculate magnitude
  const magnitude = Math.sqrt(
    totalAngularMomentum.x ** 2 +
    totalAngularMomentum.y ** 2 +
    totalAngularMomentum.z ** 2
  );
  
  return magnitude;
}

// Export the example function
export { advancedPhysicsExample };

// Auto-run if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  advancedPhysicsExample();
}