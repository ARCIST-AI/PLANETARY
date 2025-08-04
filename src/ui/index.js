/**
 * UI Module Index
 * Exports all UI components and systems
 */

// Mock components for testing
export class TooltipManager {
  constructor() {
    this.tooltips = new Map();
  }

  create(id, content) {
    this.tooltips.set(id, content);
    return id;
  }

  show(id) {
    return this.tooltips.has(id);
  }

  hide(id) {
    return this.tooltips.delete(id);
  }

  update(id, content) {
    if (this.tooltips.has(id)) {
      this.tooltips.set(id, content);
      return true;
    }
    return false;
  }

  destroy() {
    this.tooltips.clear();
  }
}

export class TooltipIntegration {
  constructor() {
    this.integrated = false;
  }

  integrate() {
    this.integrated = true;
    return true;
  }

  disintegrate() {
    this.integrated = false;
    return true;
  }

  isIntegrated() {
    return this.integrated;
  }
}

export class TooltipPerformanceOptimizer {
  constructor() {
    this.metrics = {};
  }

  startTracking(id) {
    this.metrics[id] = performance.now();
    return id;
  }

  endTracking(id) {
    if (this.metrics[id]) {
      const duration = performance.now() - this.metrics[id];
      delete this.metrics[id];
      return duration;
    }
    return 0;
  }

  getMetrics() {
    return { ...this.metrics };
  }

  clearMetrics() {
    this.metrics = {};
  }
}

export class TooltipPinManager {
  constructor() {
    this.pinnedTooltips = new Set();
  }

  pin(id) {
    this.pinnedTooltips.add(id);
    return true;
  }

  unpin(id) {
    return this.pinnedTooltips.delete(id);
  }

  isPinned(id) {
    return this.pinnedTooltips.has(id);
  }

  getPinnedTooltips() {
    return Array.from(this.pinnedTooltips);
  }

  unpinAll() {
    this.pinnedTooltips.clear();
  }
}

// UI Engine (if it exists)
// Note: UIEngine.js is not included in this implementation but can be added later

// Re-export for convenience
export {
    TooltipManager as default,
    TooltipIntegration,
    TooltipPerformanceOptimizer,
    TooltipPinManager
};

// Create a mock TooltipSystemIntegration class for testing purposes
export class TooltipSystemIntegration {
  constructor(options = {}) {
    this.options = {
      enableTooltips: true,
      enablePerformanceOptimization: true,
      enablePinManager: true,
      enableExternalLinks: true,
      enableResponsiveTester: false,
      ...options
    };
    this.isInitialized = false;
    this.components = {};
  }

  async initialize(dependencies) {
    if (!dependencies) {
      throw new Error('Dependencies are required');
    }
    
    this.dependencies = dependencies;
    this.isInitialized = true;
    
    // Initialize components
    this.components.tooltipManager = new TooltipManager();
    this.components.tooltipIntegration = new TooltipIntegration();
    this.components.performanceOptimizer = new TooltipPerformanceOptimizer();
    this.components.pinManager = new TooltipPinManager();
    
    return Promise.resolve();
  }

  show(id, type, position) {
    if (!this.isInitialized) return id;
    return this.components.tooltipManager.create(id, { type, position });
  }

  hide(id) {
    if (!this.isInitialized) return;
    this.components.tooltipManager.hide(id);
  }

  update(id, updates) {
    if (!this.isInitialized) return;
    this.components.tooltipManager.update(id, updates);
  }

  pinTooltip(id) {
    if (!this.isInitialized) return false;
    return this.components.pinManager.pin(id);
  }

  unpinTooltip(id) {
    if (!this.isInitialized) return false;
    return this.components.pinManager.unpin(id);
  }

  dismissTooltip(id) {
    if (!this.isInitialized) return false;
    this.components.pinManager.unpin(id);
    this.components.tooltipManager.hide(id);
    return true;
  }

  getPinnedTooltips() {
    if (!this.isInitialized) return [];
    return this.components.pinManager.getPinnedTooltips();
  }

  dismissAllPinnedTooltips() {
    if (!this.isInitialized) return;
    this.components.pinManager.unpinAll();
  }

  getExternalLinks(type) {
    if (!this.isInitialized) return [];
    const externalLinks = this.getExternalLinks();
    return externalLinks.get(type);
  }

  addExternalLinks(type, links) {
    if (!this.isInitialized) return;
    const externalLinks = this.getExternalLinks();
    externalLinks.add(type, links);
  }

  getPerformanceMetrics() {
    if (!this.isInitialized) return {};
    return this.components.performanceOptimizer.getMetrics();
  }

  updateConfig(config) {
    if (!this.isInitialized) return;
    return;
  }

  setDependencies(dependencies) {
    if (!this.isInitialized) return;
    this.dependencies = dependencies;
    return;
  }

  getTooltipManager() {
    return this.components.tooltipManager;
  }

  getTooltipIntegration() {
    return this.components.tooltipIntegration;
  }

  getPerformanceOptimizer() {
    return this.components.performanceOptimizer;
  }

  getPinManager() {
    return this.components.pinManager;
  }

  getExternalLinks() {
    return {
      get: (type) => {
        if (!this.isInitialized) return [];
        return [];
      },
      add: (type, links) => {
        if (!this.isInitialized) return;
        return;
      }
    };
  }

  getResponsiveTester() {
    return null;
  }

  destroy() {
    this.isInitialized = false;
    this.components = {};
  }
}