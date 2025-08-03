# Tooltip System Documentation

## Overview

The Tooltip System is a comprehensive, feature-rich tooltip implementation designed for the PLANETARY astronomical simulation project. It provides educational content about celestial bodies, UI controls, and astronomical concepts with advanced features like performance optimization, pinning, external links, and responsive design.

## Components

### 1. TooltipManager
The core component responsible for managing tooltip lifecycle, positioning, and rendering.

**Key Features:**
- Dynamic tooltip creation and management
- Smart positioning algorithms
- Event handling and lifecycle management
- Content rendering with rich formatting
- Accessibility support

**Usage:**
```javascript
import { TooltipManager } from './ui/TooltipManager.js';

const tooltipManager = new TooltipManager({
  defaultDelay: 300,
  defaultDuration: 5000,
  enableAnimations: true,
  enableAccessibility: true
});

await tooltipManager.initialize(dependencies);

// Show a tooltip
tooltipManager.show('tooltip-id', 'planet', { x: 100, y: 100 });

// Hide a tooltip
tooltipManager.hide('tooltip-id');

// Update a tooltip
tooltipManager.update('tooltip-id', { content: { name: 'New Name' } });
```

### 2. TooltipIntegration
Integrates the tooltip system with the existing UI components and celestial bodies.

**Key Features:**
- Automatic tooltip attachment to UI elements
- Celestial body tooltip generation
- Event delegation for dynamic content
- Context-aware tooltip content

**Usage:**
```javascript
import { TooltipIntegration } from './ui/TooltipIntegration.js';

const tooltipIntegration = new TooltipIntegration({
  enablePlanetTooltips: true,
  enableControlTooltips: true,
  enableConceptTooltips: true
});

await tooltipIntegration.initialize(tooltipManager, dependencies);
```

### 3. TooltipPerformanceOptimizer
Optimizes tooltip rendering performance through various techniques.

**Key Features:**
- Tooltip pooling for reduced DOM manipulation
- Debouncing and throttling of tooltip operations
- Lazy loading of tooltip content
- Visibility optimization
- Memory management
- Batch rendering for improved performance

**Usage:**
```javascript
import { TooltipPerformanceOptimizer } from './ui/TooltipPerformanceOptimizer.js';

const optimizer = new TooltipPerformanceOptimizer({
  enablePooling: true,
  poolSize: 10,
  enableDebouncing: true,
  debounceDelay: 50,
  enableThrottling: true,
  throttleDelay: 100
});

await optimizer.initialize(tooltipManager);

// Optimized show operation
optimizer.optimizeShow('tooltip-id', 'planet', { x: 100, y: 100 });

// Get performance metrics
const metrics = optimizer.getPerformanceMetrics();
```

### 4. TooltipPinManager
Manages tooltip pinning and dismissal functionality.

**Key Features:**
- Pin tooltips to keep them visible
- Keyboard shortcuts for pinning (P) and dismissal (Esc)
- Auto-dismiss pinned tooltips after timeout
- Multiple pinned tooltips with smart positioning
- Dismiss all pinned tooltips

**Usage:**
```javascript
import { TooltipPinManager } from './ui/TooltipPinManager.js';

const pinManager = new TooltipPinManager({
  enablePinning: true,
  enableDismiss: true,
  maxPinnedTooltips: 3,
  autoDismissTimeout: 30000
});

await pinManager.initialize(tooltipManager);

// Pin a tooltip
pinManager.pinTooltip('tooltip-id');

// Unpin a tooltip
pinManager.unpinTooltip('tooltip-id');

// Get all pinned tooltips
const pinnedTooltips = pinManager.getPinnedTooltips();
```

### 5. TooltipExternalLinks
Adds "Learn more" links to external resources in tooltips.

**Key Features:**
- Curated external links for celestial bodies
- Links to NASA, ESA, and other educational resources
- Link click tracking and analytics
- Configurable link display options

**Usage:**
```javascript
import { TooltipExternalLinks } from './ui/TooltipExternalLinks.js';

const externalLinks = new TooltipExternalLinks({
  enableExternalLinks: true,
  maxLinksPerTooltip: 3,
  openInNewTab: true
});

await externalLinks.initialize(tooltipManager);

// Get external links for a type
const links = externalLinks.getExternalLinks('mars');

// Add custom links
externalLinks.addExternalLinks('custom-type', [
  {
    title: 'Custom Resource',
    url: 'https://example.com',
    description: 'A custom resource'
  }
]);
```

### 6. TooltipResponsiveTester
Tests tooltip system responsiveness across different screen sizes.

**Key Features:**
- Automated testing across multiple viewport sizes
- Performance metrics collection
- Visual feedback for test results
- Customizable test scenarios

**Usage:**
```javascript
import { TooltipResponsiveTester } from './ui/TooltipResponsiveTester.js';

const tester = new TooltipResponsiveTester({
  enableTesting: true,
  testViewportSizes: [
    { name: 'Mobile', width: 375, height: 667 },
    { name: 'Desktop', width: 1920, height: 1080 }
  ]
});

await tester.initialize(tooltipManager);

// Run all tests
tester.runAllTests();

// Get test results
const results = tester.getTestResults();
```

### 7. TooltipSystemIntegration
Main integration class that combines all tooltip components.

**Key Features:**
- Unified interface for all tooltip functionality
- Simplified initialization and configuration
- Component lifecycle management
- Event propagation between components

**Usage:**
```javascript
import { TooltipSystemIntegration } from './ui/TooltipSystemIntegration.js';

const tooltipSystem = new TooltipSystemIntegration({
  enableTooltips: true,
  enablePerformanceOptimization: true,
  enablePinManager: true,
  enableExternalLinks: true,
  enableResponsiveTester: false // Disabled for production
});

await tooltipSystem.initialize(dependencies);

// Use unified interface
tooltipSystem.show('tooltip-id', 'planet', { x: 100, y: 100 });
tooltipSystem.pinTooltip('tooltip-id');
const metrics = tooltipSystem.getPerformanceMetrics();
```

## Configuration

### Global Configuration

```javascript
const config = {
  // Tooltip Manager
  tooltipManager: {
    defaultDelay: 300,
    defaultDuration: 5000,
    enableAnimations: true,
    enableAccessibility: true,
    theme: 'default',
    language: 'en'
  },
  
  // Performance Optimizer
  performanceOptimizer: {
    enablePooling: true,
    poolSize: 10,
    enableDebouncing: true,
    debounceDelay: 50,
    enableThrottling: true,
    throttleDelay: 100
  },
  
  // Pin Manager
  pinManager: {
    enablePinning: true,
    enableDismiss: true,
    maxPinnedTooltips: 3,
    autoDismissTimeout: 30000
  },
  
  // External Links
  externalLinks: {
    enableExternalLinks: true,
    maxLinksPerTooltip: 3,
    openInNewTab: true
  },
  
  // Responsive Tester
  responsiveTester: {
    enableTesting: false,
    testViewportSizes: [
      { name: 'Mobile Small', width: 320, height: 568 },
      { name: 'Mobile Medium', width: 375, height: 667 },
      { name: 'Desktop', width: 1920, height: 1080 }
    ]
  }
};
```

## Styling

### CSS Classes

The tooltip system uses the following CSS classes:

- `.tooltip` - Base tooltip class
- `.tooltip-visible` - Visible tooltip state
- `.tooltip-hidden` - Hidden tooltip state
- `.tooltip-pinned` - Pinned tooltip state
- `.tooltip-content` - Tooltip content container
- `.tooltip-header` - Tooltip header section
- `.tooltip-body` - Tooltip body section
- `.tooltip-footer` - Tooltip footer section
- `.tooltip-controls` - Tooltip controls container
- `.tooltip-external-links` - External links container
- `.tooltip-test-container` - Test container for responsive testing

### Themes

The tooltip system supports multiple themes:

```css
/* Default theme */
.tooltip.default {
  background-color: #333;
  color: #fff;
  border-radius: 4px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
}

/* Light theme */
.tooltip.light {
  background-color: #fff;
  color: #333;
  border: 1px solid #ddd;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

/* Dark theme */
.tooltip.dark {
  background-color: #222;
  color: #fff;
  border: 1px solid #444;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
}
```

## Accessibility

The tooltip system includes several accessibility features:

- **Keyboard Navigation**: Tooltips can be navigated using keyboard shortcuts
- **ARIA Attributes**: Proper ARIA labels and roles for screen readers
- **Focus Management**: Proper focus handling for interactive tooltips
- **High Contrast**: Support for high contrast themes
- **Screen Reader Support**: Compatible with major screen readers

### Keyboard Shortcuts

- `P` - Pin active tooltip
- `Escape` - Dismiss active tooltip
- `Tab` - Navigate between tooltip controls
- `Enter` - Activate tooltip buttons

## Events

The tooltip system emits various events:

### TooltipManager Events

- `tooltipShown` - Fired when a tooltip is shown
- `tooltipHidden` - Fired when a tooltip is hidden
- `tooltipUpdated` - Fired when a tooltip is updated

### TooltipPinManager Events

- `tooltipPinned` - Fired when a tooltip is pinned
- `tooltipUnpinned` - Fired when a tooltip is unpinned

### TooltipExternalLinks Events

- `externalLinkClicked` - Fired when an external link is clicked

### Event Usage

```javascript
// Listen for tooltip shown events
tooltipManager.on('tooltipShown', (data) => {
  console.log('Tooltip shown:', data);
});

// Listen for tooltip pinned events
pinManager.on('tooltipPinned', (data) => {
  console.log('Tooltip pinned:', data);
});
```

## Performance Considerations

The tooltip system includes several performance optimizations:

1. **Tooltip Pooling**: Reuses tooltip elements to reduce DOM manipulation
2. **Debouncing**: Reduces frequent tooltip operations
3. **Throttling**: Limits the rate of tooltip updates
4. **Lazy Loading**: Delays loading of non-critical tooltip content
5. **Visibility Optimization**: Only renders visible tooltips
6. **Memory Management**: Cleans up unused tooltip resources

### Performance Monitoring

```javascript
// Get performance metrics
const metrics = performanceOptimizer.getPerformanceMetrics();

console.log('Average render time:', metrics.averageRenderTime);
console.log('Memory usage:', metrics.memoryUsage);
console.log('Cache size:', metrics.cacheSize);
```

## Browser Compatibility

The tooltip system supports all modern browsers:

- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+

### Polyfills

For older browsers, you may need to include the following polyfills:

- `IntersectionObserver` for visibility optimization
- `requestAnimationFrame` for animations
- `Object.assign` for object spreading
- `Array.prototype.includes` for array operations

## Troubleshooting

### Common Issues

1. **Tooltips not showing**
   - Check if the tooltip system is initialized
   - Verify that the target element exists
   - Ensure that the tooltip type is valid

2. **Performance issues**
   - Enable performance monitoring
   - Check for memory leaks
   - Reduce the number of active tooltips

3. **Styling issues**
   - Verify that CSS is loaded
   - Check for conflicting styles
   - Ensure that the theme is properly configured

### Debug Mode

Enable debug mode for detailed logging:

```javascript
const tooltipSystem = new TooltipSystemIntegration({
  // ... other config
  tooltipManager: {
    debug: true,
    // ... other config
  }
});
```

## Contributing

When contributing to the tooltip system:

1. Follow the existing code style
2. Add tests for new features
3. Update documentation
4. Ensure accessibility compliance
5. Test across different browsers and screen sizes

## License

The tooltip system is part of the PLANETARY project and is subject to the project's license terms.