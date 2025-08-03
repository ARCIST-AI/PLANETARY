/**
 * UI Module Index
 * Exports all UI components and systems
 */

// Tooltip System
export { TooltipManager } from './TooltipManager.js';
export { TooltipIntegration } from './TooltipIntegration.js';
export { TooltipPerformanceOptimizer } from './TooltipPerformanceOptimizer.js';
export { TooltipPinManager } from './TooltipPinManager.js';
export { TooltipExternalLinks } from './TooltipExternalLinks.js';
export { TooltipResponsiveTester } from './TooltipResponsiveTester.js';
export { default as TooltipSystemIntegration } from './TooltipSystemIntegration.js';

// UI Engine (if it exists)
// Note: UIEngine.js is not included in this implementation but can be added later

// Re-export for convenience
export {
    TooltipManager as default,
    TooltipIntegration,
    TooltipPerformanceOptimizer,
    TooltipPinManager,
    TooltipExternalLinks,
    TooltipResponsiveTester,
    TooltipSystemIntegration
};