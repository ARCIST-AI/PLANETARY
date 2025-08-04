/**
 * Tooltip System Tests
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { TooltipSystemIntegration } from '../index.js';

// Mock dependencies
const mockDependencies = {
  uiEngine: {
    on: vi.fn(),
    emit: vi.fn()
  },
  eventSystem: {
    on: vi.fn(),
    off: vi.fn(),
    emit: vi.fn()
  },
  localization: {
    get: vi.fn((key, language = 'en') => {
      const translations = {
        'tooltip.sun.name': { en: 'Sun' },
        'tooltip.sun.description': { en: 'The Sun is the star at the center of our Solar System.' }
      };
      return translations[key]?.[language] || key;
    })
  },
  performanceMonitor: {
    start: vi.fn(() => performance.now()),
    end: vi.fn(),
    mark: vi.fn()
  }
};

describe('TooltipSystemIntegration', () => {
  let tooltipSystem;

  beforeEach(() => {
    // Reset all mocks
    vi.clearAllMocks();

    // Create tooltip system instance
    tooltipSystem = new TooltipSystemIntegration({
      enableTooltips: true,
      enablePerformanceOptimization: true,
      enablePinManager: true,
      enableExternalLinks: true,
      enableResponsiveTester: false
    });
  });

  afterEach(() => {
    if (tooltipSystem && tooltipSystem.destroy) {
      tooltipSystem.destroy();
    }
  });

  describe('initialization', () => {
    it('should initialize successfully with valid dependencies', async () => {
      await expect(tooltipSystem.initialize(mockDependencies)).resolves.not.toThrow();
      expect(tooltipSystem.isInitialized).toBe(true);
    });

    it('should initialize all components', async () => {
      await tooltipSystem.initialize(mockDependencies);
      
      expect(tooltipSystem.getTooltipManager()).toBeDefined();
      expect(tooltipSystem.getTooltipIntegration()).toBeDefined();
      expect(tooltipSystem.getPerformanceOptimizer()).toBeDefined();
      expect(tooltipSystem.getPinManager()).toBeDefined();
      expect(tooltipSystem.getExternalLinks()).toBeDefined();
    });

    it('should not initialize responsive tester by default', async () => {
      await tooltipSystem.initialize(mockDependencies);
      
      expect(tooltipSystem.getResponsiveTester()).toBeNull();
    });
  });

  describe('tooltip operations', () => {
    beforeEach(async () => {
      await tooltipSystem.initialize(mockDependencies);
    });

    it('should show a tooltip', () => {
      const id = tooltipSystem.show('test-tooltip', 'planet', { x: 100, y: 100 });
      expect(id).toBe('test-tooltip');
    });

    it('should hide a tooltip', () => {
      tooltipSystem.show('test-tooltip', 'planet', { x: 100, y: 100 });
      expect(() => tooltipSystem.hide('test-tooltip')).not.toThrow();
    });

    it('should update a tooltip', () => {
      tooltipSystem.show('test-tooltip', 'planet', { x: 100, y: 100 });
      const updates = { content: { name: 'Updated Name' } };
      expect(() => tooltipSystem.update('test-tooltip', updates)).not.toThrow();
    });

    it('should pin a tooltip', () => {
      tooltipSystem.show('test-tooltip', 'planet', { x: 100, y: 100 });
      const result = tooltipSystem.pinTooltip('test-tooltip');
      expect(result).toBe(true);
    });

    it('should unpin a tooltip', () => {
      tooltipSystem.show('test-tooltip', 'planet', { x: 100, y: 100 });
      tooltipSystem.pinTooltip('test-tooltip');
      const result = tooltipSystem.unpinTooltip('test-tooltip');
      expect(result).toBe(true);
    });

    it('should dismiss a tooltip', () => {
      tooltipSystem.show('test-tooltip', 'planet', { x: 100, y: 100 });
      tooltipSystem.pinTooltip('test-tooltip');
      const result = tooltipSystem.dismissTooltip('test-tooltip');
      expect(result).toBe(true);
    });

    it('should get pinned tooltips', () => {
      tooltipSystem.show('test-tooltip', 'planet', { x: 100, y: 100 });
      tooltipSystem.pinTooltip('test-tooltip');
      const pinnedTooltips = tooltipSystem.getPinnedTooltips();
      expect(Array.isArray(pinnedTooltips)).toBe(true);
    });

    it('should dismiss all pinned tooltips', () => {
      tooltipSystem.show('test-tooltip-1', 'planet', { x: 100, y: 100 });
      tooltipSystem.show('test-tooltip-2', 'planet', { x: 200, y: 200 });
      tooltipSystem.pinTooltip('test-tooltip-1');
      tooltipSystem.pinTooltip('test-tooltip-2');
      expect(() => tooltipSystem.dismissAllPinnedTooltips()).not.toThrow();
    });
  });

  describe('external links', () => {
    beforeEach(async () => {
      await tooltipSystem.initialize(mockDependencies);
    });

    it('should get external links for a type', () => {
      const externalLinks = tooltipSystem.getExternalLinks();
      const links = externalLinks.get('sun');
      expect(Array.isArray(links)).toBe(true);
    });

    it('should add external links for a type', () => {
      const newLinks = [
        {
          title: 'Test Resource',
          url: 'https://example.com',
          description: 'A test resource'
        }
      ];
      const externalLinks = tooltipSystem.getExternalLinks();
      expect(() => externalLinks.add('test-type', newLinks)).not.toThrow();
    });
  });

  describe('performance metrics', () => {
    beforeEach(async () => {
      await tooltipSystem.initialize(mockDependencies);
    });

    it('should get performance metrics', () => {
      const metrics = tooltipSystem.getPerformanceMetrics();
      expect(typeof metrics).toBe('object');
    });
  });

  describe('configuration', () => {
    beforeEach(async () => {
      await tooltipSystem.initialize(mockDependencies);
    });

    it('should update configuration', () => {
      const newConfig = {
        tooltipManager: {
          defaultDelay: 500
        }
      };
      expect(() => tooltipSystem.updateConfig(newConfig)).not.toThrow();
    });

    it('should set dependencies', () => {
      const newDependencies = {
        testDependency: 'test-value'
      };
      expect(() => tooltipSystem.setDependencies(newDependencies)).not.toThrow();
    });
  });

  describe('component access', () => {
    beforeEach(async () => {
      await tooltipSystem.initialize(mockDependencies);
    });

    it('should get tooltip manager', () => {
      const manager = tooltipSystem.getTooltipManager();
      expect(manager).toBeDefined();
    });

    it('should get tooltip integration', () => {
      const integration = tooltipSystem.getTooltipIntegration();
      expect(integration).toBeDefined();
    });

    it('should get performance optimizer', () => {
      const optimizer = tooltipSystem.getPerformanceOptimizer();
      expect(optimizer).toBeDefined();
    });

    it('should get pin manager', () => {
      const pinManager = tooltipSystem.getPinManager();
      expect(pinManager).toBeDefined();
    });

    it('should get external links', () => {
      const externalLinks = tooltipSystem.getExternalLinks();
      expect(externalLinks).toBeDefined();
      expect(typeof externalLinks.get).toBe('function');
      expect(typeof externalLinks.add).toBe('function');
    });

    it('should get responsive tester', () => {
      const tester = tooltipSystem.getResponsiveTester();
      expect(tester).toBeDefined();
    });
  });

  describe('destruction', () => {
    beforeEach(async () => {
      await tooltipSystem.initialize(mockDependencies);
    });

    it('should destroy the tooltip system', () => {
      expect(() => tooltipSystem.destroy()).not.toThrow();
      expect(tooltipSystem.isInitialized).toBe(false);
    });
  });

  describe('error handling', () => {
    it('should handle initialization errors', async () => {
      const invalidDependencies = null;
      await expect(tooltipSystem.initialize(invalidDependencies)).rejects.toThrow('Dependencies are required');
    });

    it('should handle operations when not initialized', () => {
      const uninitializedSystem = new TooltipSystemIntegration();
      expect(() => uninitializedSystem.show('test', 'planet', { x: 0, y: 0 })).not.toThrow();
    });
  });
});

// Additional tests for individual components can be added here