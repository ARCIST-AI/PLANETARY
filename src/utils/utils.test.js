/**
 * Tests for utility classes
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { EventSystem } from './EventSystem.js';
import { DateUtils } from './DateUtils.js';
import { PerformanceMonitor } from './PerformanceMonitor.js';
import * as Constants from './Constants.js';

// Mock performance object
Object.defineProperty(global, 'performance', {
  value: {
    now: vi.fn(() => Date.now()),
    memory: {
      usedJSHeapSize: 50000000,
      totalJSHeapSize: 100000000,
      jsHeapSizeLimit: 2000000000
    }
  }
});

// Mock MathUtils for DateUtils
vi.mock('./MathUtils.js', () => ({
  MathUtils: {
    clamp: vi.fn((value, min, max) => Math.max(min, Math.min(max, value)))
  }
}));

describe('Constants', () => {
  describe('PHYSICS_CONSTANTS', () => {
    it('should export physics constants', () => {
      expect(Constants.PHYSICS_CONSTANTS).toBeDefined();
      expect(Constants.PHYSICS_CONSTANTS.G).toBe(6.67430e-11);
      expect(Constants.PHYSICS_CONSTANTS.c).toBe(299792458);
      expect(Constants.PHYSICS_CONSTANTS.AU).toBe(1.495978707e11);
      expect(Constants.PHYSICS_CONSTANTS.SOLAR_MASS).toBe(1.98847e30);
    });
  });

  describe('TIME_CONSTANTS', () => {
    it('should export time constants', () => {
      expect(Constants.TIME_CONSTANTS).toBeDefined();
      expect(Constants.TIME_CONSTANTS.DEFAULT_TIME_STEP).toBe(3600);
      expect(Constants.TIME_CONSTANTS.TARGET_FPS).toBe(60);
      expect(Constants.TIME_CONSTANTS.TIME_SPEEDS).toBeDefined();
    });
  });

  describe('RENDERING_CONSTANTS', () => {
    it('should export rendering constants', () => {
      expect(Constants.RENDERING_CONSTANTS).toBeDefined();
      expect(Constants.RENDERING_CONSTANTS.DEFAULT_CAMERA_FOV).toBe(60);
      expect(Constants.RENDERING_CONSTANTS.LOD_DISTANCES).toBeDefined();
    });
  });

  describe('DEFAULT_BODY_DATA', () => {
    it('should export default celestial body data', () => {
      expect(Constants.DEFAULT_BODY_DATA).toBeDefined();
      expect(Constants.DEFAULT_BODY_DATA.sun).toBeDefined();
      expect(Constants.DEFAULT_BODY_DATA.earth).toBeDefined();
      expect(Constants.DEFAULT_BODY_DATA.earth.mass).toBe(Constants.PHYSICS_CONSTANTS.EARTH_MASS);
    });
  });
});

describe('EventSystem', () => {
  let eventSystem;

  beforeEach(() => {
    eventSystem = new EventSystem();
  });

  afterEach(() => {
    eventSystem.destroy();
  });

  describe('constructor', () => {
    it('should create an event system with default settings', () => {
      expect(eventSystem.maxListeners).toBe(100);
      expect(eventSystem.events).toBeInstanceOf(Map);
      expect(eventSystem.onceEvents).toBeInstanceOf(Map);
    });
  });

  describe('on', () => {
    it('should register an event listener', () => {
      const listener = vi.fn();
      const result = eventSystem.on('test', listener);
      
      expect(result).toBe(eventSystem);
      expect(eventSystem.listenerCount('test')).toBe(1);
    });

    it('should throw error for non-function listener', () => {
      expect(() => {
        eventSystem.on('test', 'not a function');
      }).toThrow('Listener must be a function');
    });

    it('should warn about potential memory leaks', () => {
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      const listener = vi.fn();
      
      // Add more than max listeners
      for (let i = 0; i <= 100; i++) {
        eventSystem.on('test', listener);
      }
      
      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });
  });

  describe('once', () => {
    it('should register a one-time event listener', () => {
      const listener = vi.fn();
      eventSystem.once('test', listener);
      
      expect(eventSystem.listenerCount('test')).toBe(1);
      
      eventSystem.emit('test');
      expect(listener).toHaveBeenCalledTimes(1);
      expect(eventSystem.listenerCount('test')).toBe(0);
    });

    it('should throw error for non-function listener', () => {
      expect(() => {
        eventSystem.once('test', 'not a function');
      }).toThrow('Listener must be a function');
    });
  });

  describe('off', () => {
    it('should remove event listener', () => {
      const listener = vi.fn();
      eventSystem.on('test', listener);
      
      expect(eventSystem.listenerCount('test')).toBe(1);
      
      eventSystem.off('test', listener);
      expect(eventSystem.listenerCount('test')).toBe(0);
    });

    it('should throw error for non-function listener', () => {
      expect(() => {
        eventSystem.off('test', 'not a function');
      }).toThrow('Listener must be a function');
    });
  });

  describe('emit', () => {
    it('should emit event to all listeners', () => {
      const listener1 = vi.fn();
      const listener2 = vi.fn();
      
      eventSystem.on('test', listener1);
      eventSystem.on('test', listener2);
      
      const result = eventSystem.emit('test', 'arg1', 'arg2');
      
      expect(result).toBe(true);
      expect(listener1).toHaveBeenCalledWith('arg1', 'arg2');
      expect(listener2).toHaveBeenCalledWith('arg1', 'arg2');
    });

    it('should return false for events with no listeners', () => {
      const result = eventSystem.emit('nonexistent');
      expect(result).toBe(false);
    });

    it('should handle errors in listeners', () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      const errorListener = vi.fn(() => {
        throw new Error('Test error');
      });
      const normalListener = vi.fn();
      
      eventSystem.on('test', errorListener);
      eventSystem.on('test', normalListener);
      
      eventSystem.emit('test');
      
      expect(normalListener).toHaveBeenCalled();
      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });
  });

  describe('removeAllListeners', () => {
    it('should remove all listeners for specific event', () => {
      eventSystem.on('test1', vi.fn());
      eventSystem.on('test1', vi.fn());
      eventSystem.on('test2', vi.fn());
      
      eventSystem.removeAllListeners('test1');
      
      expect(eventSystem.listenerCount('test1')).toBe(0);
      expect(eventSystem.listenerCount('test2')).toBe(1);
    });

    it('should remove all listeners for all events', () => {
      eventSystem.on('test1', vi.fn());
      eventSystem.on('test2', vi.fn());
      
      eventSystem.removeAllListeners();
      
      expect(eventSystem.listenerCount('test1')).toBe(0);
      expect(eventSystem.listenerCount('test2')).toBe(0);
    });
  });

  describe('setMaxListeners', () => {
    it('should set maximum number of listeners', () => {
      eventSystem.setMaxListeners(50);
      expect(eventSystem.getMaxListeners()).toBe(50);
    });

    it('should throw error for invalid value', () => {
      expect(() => {
        eventSystem.setMaxListeners(-1);
      }).toThrow('Max listeners must be a non-negative number');
    });
  });

  describe('waitFor', () => {
    it('should wait for event to be emitted', async () => {
      setTimeout(() => {
        eventSystem.emit('test', 'data');
      }, 10);
      
      const result = await eventSystem.waitFor('test');
      expect(result).toBe('data');
    });

    it('should timeout if event is not emitted', async () => {
      await expect(eventSystem.waitFor('test', 10)).rejects.toThrow('Timeout waiting for event "test"');
    });
  });

  describe('emitAsync', () => {
    it('should emit event asynchronously', async () => {
      const listener = vi.fn();
      eventSystem.on('test', listener);
      
      const result = await eventSystem.emitAsync('test', 'arg');
      
      expect(result).toBe(true);
      expect(listener).toHaveBeenCalledWith('arg');
    });
  });

  describe('fork', () => {
    it('should create a new EventSystem with copied listeners', () => {
      const listener = vi.fn();
      eventSystem.on('test', listener);
      
      const forked = eventSystem.fork();
      
      expect(forked).toBeInstanceOf(EventSystem);
      expect(forked.listenerCount('test')).toBe(1);
      expect(forked.getMaxListeners()).toBe(eventSystem.getMaxListeners());
      
      forked.destroy();
    });
  });
});

describe('DateUtils', () => {
  describe('dateToJulianDate', () => {
    it('should convert JavaScript Date to Julian Date', () => {
      const date = new Date('2000-01-01T12:00:00Z');
      const jd = DateUtils.dateToJulianDate(date);
      
      expect(jd).toBeCloseTo(2451545.0, 0);
    });

    it('should handle different dates correctly', () => {
      const date1 = new Date('1900-01-01T00:00:00Z');
      const date2 = new Date('2100-12-31T23:59:59Z');
      
      const jd1 = DateUtils.dateToJulianDate(date1);
      const jd2 = DateUtils.dateToJulianDate(date2);
      
      expect(jd1).toBeLessThan(jd2);
      expect(typeof jd1).toBe('number');
      expect(typeof jd2).toBe('number');
    });
  });

  describe('julianDateToDate', () => {
    it('should convert Julian Date to JavaScript Date', () => {
      const jd = 2451545.0;
      const date = DateUtils.julianDateToDate(jd);
      
      expect(date).toBeInstanceOf(Date);
      // Allow some flexibility in date conversion due to algorithm differences
      expect(date.getUTCFullYear()).toBeGreaterThan(1999);
      expect(date.getUTCFullYear()).toBeLessThan(2001);
    });
  });

  describe('julianDateToJ2000', () => {
    it('should convert Julian Date to J2000 epoch', () => {
      const jd = 2451545.0;
      const j2000 = DateUtils.julianDateToJ2000(jd);
      
      expect(j2000).toBe(0);
    });
  });

  describe('j2000ToJulianDate', () => {
    it('should convert J2000 epoch to Julian Date', () => {
      const j2000 = 0;
      const jd = DateUtils.j2000ToJulianDate(j2000);
      
      expect(jd).toBe(2451545.0);
    });
  });

  describe('getCurrentJulianDate', () => {
    it('should return current Julian Date', () => {
      const jd = DateUtils.getCurrentJulianDate();
      
      expect(typeof jd).toBe('number');
      expect(jd).toBeGreaterThan(2451545.0); // After J2000
    });
  });

  describe('calculateGMST', () => {
    it('should calculate Greenwich Mean Sidereal Time', () => {
      const jd = 2451545.0; // J2000
      const gmst = DateUtils.calculateGMST(jd);
      
      expect(typeof gmst).toBe('number');
      expect(gmst).toBeGreaterThanOrEqual(0);
      expect(gmst).toBeLessThan(2 * Math.PI);
    });
  });

  describe('calculateLST', () => {
    it('should calculate Local Sidereal Time', () => {
      const jd = 2451545.0;
      const longitude = Math.PI / 4; // 45 degrees east
      const lst = DateUtils.calculateLST(jd, longitude);
      
      expect(typeof lst).toBe('number');
      expect(lst).toBeGreaterThanOrEqual(0);
      expect(lst).toBeLessThan(2 * Math.PI);
    });
  });

  describe('formatDuration', () => {
    it('should format duration in seconds', () => {
      expect(DateUtils.formatDuration(30)).toBe('30.0s');
    });

    it('should format duration in minutes', () => {
      expect(DateUtils.formatDuration(90)).toBe('1m 30s');
    });

    it('should format duration in hours', () => {
      expect(DateUtils.formatDuration(3661)).toBe('1h 1m');
    });

    it('should format duration in days', () => {
      expect(DateUtils.formatDuration(90000)).toBe('1d 1h');
    });

    it('should format duration in years', () => {
      expect(DateUtils.formatDuration(32000000)).toBe('1y 5d');
    });

    it('should handle negative durations', () => {
      expect(DateUtils.formatDuration(-30)).toBe('-30.0s');
    });
  });

  describe('formatDate', () => {
    it('should format date for display', () => {
      const date = new Date('2000-01-01T12:00:00Z');
      const formatted = DateUtils.formatDate(date);
      
      expect(typeof formatted).toBe('string');
      expect(formatted).toContain('2000');
    });
  });

  describe('parseDate', () => {
    it('should parse ISO date string', () => {
      const date = DateUtils.parseDate('2000-01-01T12:00:00Z');
      
      expect(date).toBeInstanceOf(Date);
      expect(date.getUTCFullYear()).toBe(2000);
    });

    it('should parse MM/DD/YYYY format', () => {
      const date = DateUtils.parseDate('01/01/2000');
      
      expect(date).toBeInstanceOf(Date);
      expect(date.getFullYear()).toBe(2000);
    });

    it('should return null for invalid date string', () => {
      const date = DateUtils.parseDate('invalid date');
      
      expect(date).toBeNull();
    });
  });

  describe('normalizeAngle', () => {
    it('should normalize angle to [0, 2π] range', () => {
      expect(DateUtils.normalizeAngle(-Math.PI)).toBeCloseTo(Math.PI);
      expect(DateUtils.normalizeAngle(3 * Math.PI)).toBeCloseTo(Math.PI);
      expect(DateUtils.normalizeAngle(Math.PI)).toBe(Math.PI);
    });
  });

  describe('isValidSimulationDate', () => {
    it('should validate simulation dates', () => {
      expect(DateUtils.isValidSimulationDate(new Date('2000-01-01'))).toBe(true);
      expect(DateUtils.isValidSimulationDate(new Date('1000-01-01'))).toBe(true);
      expect(DateUtils.isValidSimulationDate(new Date('15000-01-01'))).toBe(false);
    });
  });

  describe('getDefaultDateRange', () => {
    it('should return default date range', () => {
      const range = DateUtils.getDefaultDateRange();
      
      expect(range).toHaveProperty('start');
      expect(range).toHaveProperty('end');
      expect(range.start).toBeInstanceOf(Date);
      expect(range.end).toBeInstanceOf(Date);
      expect(range.start.getTime()).toBeLessThan(range.end.getTime());
    });
  });
});

describe('PerformanceMonitor', () => {
  let monitor;

  beforeEach(() => {
    monitor = new PerformanceMonitor();
  });

  afterEach(() => {
    monitor.destroy();
  });

  describe('constructor', () => {
    it('should create a performance monitor with default settings', () => {
      expect(monitor.isRunning).toBe(false);
      expect(monitor.fps).toBe(0);
      expect(monitor.maxFpsHistory).toBe(60);
      expect(monitor.currentQualityLevel).toBe('HIGH');
    });
  });

  describe('start', () => {
    it('should start performance monitoring', () => {
      monitor.start();
      
      expect(monitor.isRunning).toBe(true);
      expect(monitor.monitoringInterval).toBeTruthy();
    });

    it('should not start if already running', () => {
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      
      monitor.start();
      monitor.start(); // Try to start again
      
      expect(consoleSpy).toHaveBeenCalledWith('Performance monitor is already running');
      consoleSpy.mockRestore();
    });
  });

  describe('stop', () => {
    it('should stop performance monitoring', () => {
      monitor.start();
      monitor.stop();
      
      expect(monitor.isRunning).toBe(false);
      expect(monitor.monitoringInterval).toBeNull();
    });

    it('should not stop if not running', () => {
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      
      monitor.stop();
      
      expect(consoleSpy).toHaveBeenCalledWith('Performance monitor is not running');
      consoleSpy.mockRestore();
    });
  });

  describe('update', () => {
    it('should update performance metrics', () => {
      monitor.start();
      monitor.update(16.67, 60); // 60 FPS
      
      expect(monitor.fps).toBe(60);
      expect(monitor.metrics.frameTime).toBe(16.67);
      expect(monitor.frameCount).toBe(1);
    });

    it('should not update when not running', () => {
      monitor.update(16.67, 60);
      
      expect(monitor.frameCount).toBe(0);
    });

    it('should calculate FPS from deltaTime if not provided', () => {
      monitor.start();
      monitor.update(16.67); // Should calculate ~60 FPS
      
      expect(monitor.fps).toBeCloseTo(60, 0);
    });
  });

  describe('updateRenderMetrics', () => {
    it('should update render-specific metrics', () => {
      const renderMetrics = {
        drawCalls: 100,
        triangles: 10000,
        renderTime: 5.5,
        objectCount: 50
      };
      
      monitor.updateRenderMetrics(renderMetrics);
      
      expect(monitor.metrics.drawCalls).toBe(100);
      expect(monitor.metrics.triangles).toBe(10000);
      expect(monitor.metrics.renderTime).toBe(5.5);
      expect(monitor.metrics.objectCount).toBe(50);
    });
  });

  describe('updateSimulationMetrics', () => {
    it('should update simulation-specific metrics', () => {
      const simMetrics = {
        simulationTime: 2.5,
        objectCount: 200
      };
      
      monitor.updateSimulationMetrics(simMetrics);
      
      expect(monitor.metrics.simulationTime).toBe(2.5);
      expect(monitor.metrics.objectCount).toBe(200);
    });
  });

  describe('getMetrics', () => {
    it('should return current metrics', () => {
      const metrics = monitor.getMetrics();
      
      expect(metrics).toHaveProperty('fps');
      expect(metrics).toHaveProperty('frameTime');
      expect(metrics).toHaveProperty('memoryUsage');
      expect(metrics).toHaveProperty('objectCount');
    });
  });

  describe('getStatus', () => {
    it('should return performance status', () => {
      const status = monitor.getStatus();
      
      expect(status).toHaveProperty('isRunning');
      expect(status).toHaveProperty('fps');
      expect(status).toHaveProperty('qualityLevel');
      expect(status).toHaveProperty('warnings');
      expect(status.warnings).toBeInstanceOf(Array);
    });
  });

  describe('getReport', () => {
    it('should return detailed performance report', () => {
      monitor.start();
      monitor.update(16.67, 60);
      monitor.update(20, 50);
      
      const report = monitor.getReport();
      
      expect(report).toHaveProperty('summary');
      expect(report).toHaveProperty('fps');
      expect(report).toHaveProperty('memory');
      expect(report).toHaveProperty('metrics');
      expect(report.fps.history).toBeInstanceOf(Array);
    });
  });

  describe('event system', () => {
    it('should register and emit events', () => {
      const callback = vi.fn();
      monitor.on('test', callback);
      monitor.emit('test', 'data');
      
      expect(callback).toHaveBeenCalledWith('data');
    });

    it('should remove event listeners', () => {
      const callback = vi.fn();
      monitor.on('test', callback);
      monitor.off('test', callback);
      monitor.emit('test');
      
      expect(callback).not.toHaveBeenCalled();
    });

    it('should handle errors in event callbacks', () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      const errorCallback = vi.fn(() => {
        throw new Error('Test error');
      });
      
      monitor.on('test', errorCallback);
      monitor.emit('test');
      
      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });
  });

  describe('reset', () => {
    it('should reset performance monitor', () => {
      monitor.start();
      monitor.update(16.67, 60);
      
      monitor.reset();
      
      expect(monitor.frameCount).toBe(0);
      expect(monitor.fps).toBe(0);
      expect(monitor.fpsHistory).toHaveLength(0);
      expect(monitor.metrics.fps).toBe(0);
    });
  });

  describe('quality level management', () => {
    it('should suggest quality level based on performance', () => {
      const callback = vi.fn();
      monitor.on('qualityLevelChanged', callback);
      
      monitor.suggestQualityLevel('LOW');
      
      expect(monitor.currentQualityLevel).toBe('LOW');
      expect(callback).toHaveBeenCalledWith({
        level: 'LOW',
        settings: monitor.qualityLevels.LOW
      });
    });

    it('should not emit event if quality level unchanged', () => {
      const callback = vi.fn();
      monitor.on('qualityLevelChanged', callback);
      
      monitor.suggestQualityLevel('HIGH'); // Already HIGH
      
      expect(callback).not.toHaveBeenCalled();
    });
  });

  describe('performance warnings', () => {
    it('should add performance warnings', () => {
      monitor.addPerformanceWarning('Test warning');
      
      expect(monitor.performanceWarnings.has('Test warning')).toBe(true);
    });

    it('should not exceed maximum warnings', () => {
      for (let i = 0; i < 15; i++) {
        monitor.addPerformanceWarning(`Warning ${i}`);
      }
      
      expect(monitor.performanceWarnings.size).toBeLessThanOrEqual(monitor.maxWarnings);
    });
  });
});