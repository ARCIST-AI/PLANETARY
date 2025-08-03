/**
 * Main module exports
 */

// Core modules
export * from './core/index.js';

// Physics modules
export * from './physics/index.js';

// Celestial modules
export * from './celestial/index.js';

// Rendering modules
export * from './rendering/index.js';

// Utility modules
export * from './utils/index.js';

/**
 * Main application factory
 */
export class ApplicationFactory {
    /**
     * Create a complete application with all modules
     * @param {Object} config - Configuration object
     * @returns {Object} Application with all modules
     */
    static createApplication(config = {}) {
        return import('./core/index.js').then(({ CoreFactory }) => {
            return CoreFactory.createApplication(config);
        });
    }
    
    /**
     * Create a solar system viewer application
     * @param {Object} config - Configuration object
     * @returns {Object} Solar system viewer application
     */
    static async createSolarSystemViewer(config = {}) {
        const { ApplicationPresets } = await import('./core/index.js');
        return ApplicationPresets.createSolarSystemViewer(config);
    }
    
    /**
     * Create a binary star system viewer application
     * @param {Object} config - Configuration object
     * @returns {Object} Binary star system viewer application
     */
    static async createBinaryStarSystemViewer(config = {}) {
        const { ApplicationPresets } = await import('./core/index.js');
        return ApplicationPresets.createBinaryStarSystemViewer(config);
    }
    
    /**
     * Create an asteroid belt viewer application
     * @param {Object} config - Configuration object
     * @returns {Object} Asteroid belt viewer application
     */
    static async createAsteroidBeltViewer(config = {}) {
        const { ApplicationPresets } = await import('./core/index.js');
        return ApplicationPresets.createAsteroidBeltViewer(config);
    }
}

/**
 * Default export
 */
// Import modules dynamically
const coreModule = await import('./core/index.js');
const physicsModule = await import('./physics/index.js');
const celestialModule = await import('./celestial/index.js');
const renderingModule = await import('./rendering/index.js');
const utilsModule = await import('./utils/index.js');

export default {
    // Core modules
    Engine: coreModule.Engine,
    RenderEngine: coreModule.RenderEngine,
    SimulationEngine: coreModule.SimulationEngine,
    DataManager: coreModule.DataManager,
    UIEngine: coreModule.UIEngine,
    CoreFactory: coreModule.CoreFactory,
    ApplicationPresets: coreModule.ApplicationPresets,
    
    // Physics modules
    NBodyIntegrator: physicsModule.NBodyIntegrator,
    KeplerianOrbit: physicsModule.KeplerianOrbit,
    Perturbations: physicsModule.Perturbations,
    CoordinateTransform: physicsModule.CoordinateTransform,
    PhysicsConstants: physicsModule.PhysicsConstants,
    PhysicsUtils: physicsModule.PhysicsUtils,
    
    // Celestial modules
    CelestialBody: celestialModule.CelestialBody,
    Star: celestialModule.Star,
    Planet: celestialModule.Planet,
    Moon: celestialModule.Moon,
    Asteroid: celestialModule.Asteroid,
    Comet: celestialModule.Comet,
    Spacecraft: celestialModule.Spacecraft,
    SolarSystem: celestialModule.SolarSystem,
    CelestialFactory: celestialModule.CelestialFactory,
    SolarSystemPresets: celestialModule.SolarSystemPresets,
    
    // Rendering modules
    TextureManager: renderingModule.TextureManager,
    MaterialManager: renderingModule.MaterialManager,
    GeometryManager: renderingModule.GeometryManager,
    RenderingManager: renderingModule.RenderingManager,
    LightingManager: renderingModule.LightingManager,
    OrbitVisualization: renderingModule.OrbitVisualization,
    AtmosphereEffects: renderingModule.AtmosphereEffects,
    SpaceEnvironment: renderingModule.SpaceEnvironment,
    SpecialEffects: renderingModule.SpecialEffects,
    ScaleVisualization: renderingModule.ScaleVisualization,
    QualitySettings: renderingModule.QualitySettings,
    createRenderingSystem: renderingModule.createRenderingSystem,
    getDefaultRenderingConfig: renderingModule.getDefaultRenderingConfig,
    getQualityPresets: renderingModule.getQualityPresets,
    applyQualityPreset: renderingModule.applyQualityPreset,
    
    // Utility modules
    MathUtils: utilsModule.MathUtils,
    DateUtils: utilsModule.DateUtils,
    EventSystem: utilsModule.EventSystem,
    PerformanceMonitor: utilsModule.PerformanceMonitor,
    Constants: utilsModule.Constants,
    Utils: utilsModule.Utils,
    
    // Application factory
    ApplicationFactory
};