/**
 * Tooltip System Example
 * Demonstrates how to use the tooltip system
 */

import { TooltipSystemIntegration } from './TooltipSystemIntegration.js';

// Example configuration
const tooltipConfig = {
  enableTooltips: true,
  enablePerformanceOptimization: true,
  enablePinManager: true,
  enableExternalLinks: true,
  enableResponsiveTester: true, // Enable for development/testing
  
  // Component-specific configurations
  tooltipManager: {
    defaultDelay: 300,
    defaultDuration: 5000,
    enableAnimations: true,
    enableAccessibility: true,
    theme: 'default',
    language: 'en',
    debug: false // Set to true for debugging
  },
  
  performanceOptimizer: {
    enablePooling: true,
    poolSize: 10,
    enableDebouncing: true,
    debounceDelay: 50,
    enableThrottling: true,
    throttleDelay: 100,
    enableLazyLoading: true,
    enableVisibilityOptimization: true,
    enableMemoryManagement: true,
    enableBatchRendering: true
  },
  
  pinManager: {
    enablePinning: true,
    enableDismiss: true,
    maxPinnedTooltips: 3,
    autoDismissTimeout: 30000,
    pinShortcut: 'p',
    dismissShortcut: 'Escape'
  },
  
  externalLinks: {
    enableExternalLinks: true,
    maxLinksPerTooltip: 3,
    openInNewTab: true,
    showLinkIcon: true,
    linkIcon: '🔗',
    linkText: 'Learn more'
  },
  
  responsiveTester: {
    enableTesting: true,
    testViewportSizes: [
      { name: 'Mobile Small', width: 320, height: 568 },
      { name: 'Mobile Medium', width: 375, height: 667 },
      { name: 'Mobile Large', width: 414, height: 736 },
      { name: 'Tablet Small', width: 768, height: 1024 },
      { name: 'Tablet Large', width: 1024, height: 1366 },
      { name: 'Desktop Small', width: 1366, height: 768 },
      { name: 'Desktop Medium', width: 1920, height: 1080 },
      { name: 'Desktop Large', width: 2560, height: 1440 }
    ],
    autoRunTests: false,
    showTestResults: true,
    enablePerformanceMetrics: true
  }
};

// Example dependencies (mock implementation for demonstration)
const dependencies = {
  // UI Engine would be provided by the main application
  uiEngine: {
    on: (event, callback) => {
      console.log(`UI Engine event listener registered for: ${event}`);
    },
    emit: (event, data) => {
      console.log(`UI Engine event emitted: ${event}`, data);
    }
  },
  
  // Event System
  eventSystem: {
    on: (event, callback) => {
      document.addEventListener(event, callback);
    },
    off: (event, callback) => {
      document.removeEventListener(event, callback);
    },
    emit: (event, data) => {
      document.dispatchEvent(new CustomEvent(event, { detail: data }));
    }
  },
  
  // Localization
  localization: {
    get: (key, language = 'en') => {
      const translations = {
        'tooltip.sun.name': { en: 'Sun', es: 'Sol', fr: 'Soleil' },
        'tooltip.sun.description': { 
          en: 'The Sun is the star at the center of our Solar System.',
          es: 'El Sol es la estrella en el centro de nuestro Sistema Solar.',
          fr: 'Le Soleil est l\'étoile au centre de notre Système Solaire.'
        },
        'tooltip.earth.name': { en: 'Earth', es: 'Tierra', fr: 'Terre' },
        'tooltip.earth.description': { 
          en: 'Earth is the third planet from the Sun and the only astronomical object known to harbor life.',
          es: 'La Tierra es el tercer planeta del Sol y el único objeto astronómico conocido que alberga vida.',
          fr: 'La Terre est la troisième planète du Soleil et le seul objet astronomique connu à abriter la vie.'
        }
      };
      
      return translations[key]?.[language] || key;
    }
  },
  
  // Performance Monitor
  performanceMonitor: {
    start: (label) => {
      console.log(`Performance monitoring started for: ${label}`);
      return performance.now();
    },
    end: (label, startTime) => {
      const duration = performance.now() - startTime;
      console.log(`Performance monitoring ended for: ${label}, duration: ${duration.toFixed(2)}ms`);
      return duration;
    },
    mark: (label) => {
      console.log(`Performance mark: ${label}`);
    }
  }
};

// Initialize the tooltip system
async function initializeTooltipSystem() {
  try {
    console.log('Initializing Tooltip System...');
    
    // Create tooltip system integration
    const tooltipSystem = new TooltipSystemIntegration(tooltipConfig);
    
    // Initialize with dependencies
    await tooltipSystem.initialize(dependencies);
    
    console.log('Tooltip System initialized successfully');
    
    // Return the tooltip system for use in the application
    return tooltipSystem;
    
  } catch (error) {
    console.error('Failed to initialize Tooltip System:', error);
    throw error;
  }
}

// Example usage functions
function setupExampleUsage(tooltipSystem) {
  // Example 1: Show a planet tooltip
  function showPlanetTooltip() {
    const position = { x: 200, y: 150 };
    tooltipSystem.show('planet-tooltip-1', 'planet', position, {
      content: {
        name: 'Earth',
        type: 'Planet',
        description: 'Earth is the third planet from the Sun and the only known planet to harbor life.',
        details: [
          'Diameter: 12,742 km',
          'Distance from Sun: 149.6 million km',
          'Orbital Period: 365.25 days',
          'Moons: 1 (The Moon)'
        ]
      }
    });
  }
  
  // Example 2: Show a control tooltip
  function showControlTooltip() {
    const position = { x: 50, y: 50 };
    tooltipSystem.show('control-tooltip-1', 'control', position, {
      content: {
        name: 'Time Controls',
        type: 'UI Control',
        description: 'Use these controls to adjust the simulation time speed and direction.',
        details: [
          'Play/Pause: Start or pause the simulation',
          'Speed: Adjust simulation speed',
          'Direction: Forward or backward time'
        ]
      }
    });
  }
  
  // Example 3: Show a concept tooltip
  function showConceptTooltip() {
    const position = { x: 400, y: 300 };
    tooltipSystem.show('concept-tooltip-1', 'concept', position, {
      content: {
        name: 'Orbital Mechanics',
        type: 'Astronomical Concept',
        description: 'Orbital mechanics is the study of the motion of objects in space under the influence of gravity.',
        details: [
          'Kepler\'s Laws describe planetary motion',
          'Newton\'s Law of Universal Gravitation explains the force',
          'Orbits can be circular, elliptical, parabolic, or hyperbolic'
        ]
      }
    });
  }
  
  // Example 4: Pin a tooltip
  function pinActiveTooltip() {
    tooltipSystem.pinTooltip('planet-tooltip-1');
  }
  
  // Example 5: Get performance metrics
  function showPerformanceMetrics() {
    const metrics = tooltipSystem.getPerformanceMetrics();
    console.log('Performance Metrics:', metrics);
    
    // Display metrics in a user-friendly way
    alert(`Average render time: ${metrics.averageRenderTime?.toFixed(2) || 'N/A'}ms\n` +
          `Total tooltips shown: ${metrics.totalTooltipsShown || 0}\n` +
          `Cache hit rate: ${metrics.cacheHitRate?.toFixed(2) || 'N/A'}%`);
  }
  
  // Example 6: Run responsive tests
  function runResponsiveTests() {
    tooltipSystem.runResponsiveTests();
    
    // Get test results after a delay
    setTimeout(() => {
      const results = tooltipSystem.getTestResults();
      console.log('Test Results:', results);
      
      const passed = results.filter(r => r.passed).length;
      const failed = results.filter(r => !r.passed).length;
      
      alert(`Responsive Tests Completed\n` +
            `Passed: ${passed}\n` +
            `Failed: ${failed}\n` +
            `Total: ${results.length}`);
    }, 5000);
  }
  
  // Create example UI elements
  function createExampleUI() {
    const container = document.createElement('div');
    container.style.position = 'fixed';
    container.style.bottom = '20px';
    container.style.left = '20px';
    container.style.backgroundColor = 'rgba(255, 255, 255, 0.9)';
    container.style.padding = '15px';
    container.style.borderRadius = '8px';
    container.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.1)';
    container.style.zIndex = '1000';
    
    const title = document.createElement('h3');
    title.textContent = 'Tooltip System Examples';
    title.style.marginTop = '0';
    title.style.marginBottom = '10px';
    container.appendChild(title);
    
    // Create buttons for each example
    const buttons = [
      { text: 'Show Planet Tooltip', action: showPlanetTooltip },
      { text: 'Show Control Tooltip', action: showControlTooltip },
      { text: 'Show Concept Tooltip', action: showConceptTooltip },
      { text: 'Pin Active Tooltip', action: pinActiveTooltip },
      { text: 'Show Performance Metrics', action: showPerformanceMetrics },
      { text: 'Run Responsive Tests', action: runResponsiveTests }
    ];
    
    buttons.forEach(({ text, action }) => {
      const button = document.createElement('button');
      button.textContent = text;
      button.style.margin = '5px';
      button.style.padding = '8px 12px';
      button.style.backgroundColor = '#2196f3';
      button.style.color = 'white';
      button.style.border = 'none';
      button.style.borderRadius = '4px';
      button.style.cursor = 'pointer';
      
      button.addEventListener('click', action);
      container.appendChild(button);
    });
    
    document.body.appendChild(container);
  }
  
  // Create the example UI
  createExampleUI();
}

// Main function to run the example
async function runExample() {
  try {
    // Initialize the tooltip system
    const tooltipSystem = await initializeTooltipSystem();
    
    // Setup example usage
    setupExampleUsage(tooltipSystem);
    
    // Log success
    console.log('Tooltip System Example is ready to use!');
    
    // Return the tooltip system for further use
    return tooltipSystem;
    
  } catch (error) {
    console.error('Failed to run Tooltip System Example:', error);
  }
}

// Auto-run the example when the DOM is loaded
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', runExample);
} else {
  runExample();
}

// Export for use in other modules
export { runExample, initializeTooltipSystem, setupExampleUsage };