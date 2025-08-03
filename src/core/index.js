/**
 * Core module exports
 */

export { Engine } from './Engine.js';
export { RenderEngine } from './RenderEngine.js';
export { SimulationEngine } from './SimulationEngine.js';
export { DataManager } from './DataManager.js';
export { UIEngine } from './UIEngine.js';

/**
 * Core factory
 */
export class CoreFactory {
    /**
     * Create a new engine
     * @param {Object} config - Configuration object
     * @returns {Engine} New engine
     */
    static createEngine(config = {}) {
        return new Engine(config);
    }
    
    /**
     * Create a new render engine
     * @param {Object} config - Configuration object
     * @returns {RenderEngine} New render engine
     */
    static createRenderEngine(config = {}) {
        return new RenderEngine(config);
    }
    
    /**
     * Create a new simulation engine
     * @param {Object} config - Configuration object
     * @returns {SimulationEngine} New simulation engine
     */
    static createSimulationEngine(config = {}) {
        return new SimulationEngine(config);
    }
    
    /**
     * Create a new data manager
     * @param {Object} config - Configuration object
     * @returns {DataManager} New data manager
     */
    static createDataManager(config = {}) {
        return new DataManager(config);
    }
    
    /**
     * Create a new UI engine
     * @param {Object} config - Configuration object
     * @returns {UIEngine} New UI engine
     */
    static createUIEngine(config = {}) {
        return new UIEngine(config);
    }
    
    /**
     * Create a complete application with all engines
     * @param {Object} config - Configuration object
     * @returns {Object} Application with all engines
     */
    static createApplication(config = {}) {
        const app = {
            engine: this.createEngine(config.engine),
            renderEngine: this.createRenderEngine(config.renderEngine),
            simulationEngine: this.createSimulationEngine(config.simulationEngine),
            dataManager: this.createDataManager(config.dataManager),
            uiEngine: this.createUIEngine(config.uiEngine)
        };
        
        // Connect engines
        app.engine.setRenderEngine(app.renderEngine);
        app.engine.setSimulationEngine(app.simulationEngine);
        app.engine.setDataManager(app.dataManager);
        app.engine.setUIEngine(app.uiEngine);
        
        return app;
    }
}

/**
 * Application presets
 */
export const ApplicationPresets = {
    /**
     * Create a simple solar system viewer
     * @param {Object} config - Configuration
     * @returns {Object} Application
     */
    async createSolarSystemViewer(config = {}) {
        const app = CoreFactory.createApplication({
            engine: {
                name: 'Solar System Viewer',
                version: '1.0.0',
                description: 'A simple solar system viewer'
            },
            renderEngine: {
                container: config.container || 'app',
                width: config.width || window.innerWidth,
                height: config.height || window.innerHeight,
                backgroundColor: config.backgroundColor || 0x000000,
                camera: {
                    type: 'perspective',
                    fov: 75,
                    near: 0.1,
                    far: 1e15,
                    position: { x: 0, y: 1e11, z: 2e11 }
                },
                controls: {
                    type: 'orbit',
                    enableDamping: true,
                    dampingFactor: 0.05,
                    enableZoom: true,
                    enablePan: true,
                    minDistance: 1e9,
                    maxDistance: 1e13
                },
                lights: [
                    {
                        type: 'ambient',
                        color: 0x404040,
                        intensity: 0.5
                    },
                    {
                        type: 'point',
                        color: 0xffffff,
                        intensity: 1.0,
                        position: { x: 0, y: 0, z: 0 }
                    }
                ],
                renderer: {
                    antialias: true,
                    alpha: true,
                    pixelRatio: window.devicePixelRatio
                }
            },
            simulationEngine: {
                timeScale: config.timeScale || 86400, // 1 day per second
                useNBody: config.useNBody || false,
                useRelativity: config.useRelativity || false,
                usePerturbations: config.usePerturbations || false,
                integrator: {
                    type: config.integratorType || 'rungeKutta4',
                    stepSize: config.stepSize || 3600 // 1 hour
                }
            },
            dataManager: {
                autoSave: config.autoSave || false,
                autoSaveInterval: config.autoSaveInterval || 60000, // 1 minute
                storageType: config.storageType || 'local',
                workers: {
                    enabled: config.workersEnabled || false,
                    count: config.workerCount || navigator.hardwareConcurrency || 4
                }
            },
            uiEngine: {
                container: config.uiContainer || 'ui',
                theme: config.theme || 'dark',
                panels: [
                    {
                        id: 'info',
                        title: 'Information',
                        position: 'top-left',
                        visible: true,
                        content: 'body-info'
                    },
                    {
                        id: 'controls',
                        title: 'Controls',
                        position: 'bottom-left',
                        visible: true,
                        content: 'simulation-controls'
                    },
                    {
                        id: 'settings',
                        title: 'Settings',
                        position: 'top-right',
                        visible: false,
                        content: 'settings-panel'
                    }
                ]
            }
        });
        
        // Create a simple solar system
        const { SolarSystemPresets } = await import('../celestial/index.js');
        const solarSystem = SolarSystemPresets.createSimpleSystem({
            name: 'Solar System',
            timeScale: app.simulationEngine.timeScale,
            useNBody: app.simulationEngine.useNBody
        });
        
        // Add solar system to simulation
        app.simulationEngine.addSolarSystem(solarSystem);
        
        // Add solar system to render
        app.renderEngine.addSolarSystem(solarSystem);
        
        // Start the application
        app.engine.start();
        
        return app;
    },
    
    /**
     * Create a binary star system viewer
     * @param {Object} config - Configuration
     * @returns {Object} Application
     */
    async createBinaryStarSystemViewer(config = {}) {
        const app = CoreFactory.createApplication({
            engine: {
                name: 'Binary Star System Viewer',
                version: '1.0.0',
                description: 'A binary star system viewer'
            },
            renderEngine: {
                container: config.container || 'app',
                width: config.width || window.innerWidth,
                height: config.height || window.innerHeight,
                backgroundColor: config.backgroundColor || 0x000000,
                camera: {
                    type: 'perspective',
                    fov: 75,
                    near: 0.1,
                    far: 1e15,
                    position: { x: 0, y: 1e11, z: 2e11 }
                },
                controls: {
                    type: 'orbit',
                    enableDamping: true,
                    dampingFactor: 0.05,
                    enableZoom: true,
                    enablePan: true,
                    minDistance: 1e9,
                    maxDistance: 1e13
                },
                lights: [
                    {
                        type: 'ambient',
                        color: 0x404040,
                        intensity: 0.5
                    },
                    {
                        type: 'point',
                        color: 0xffffff,
                        intensity: 1.0,
                        position: { x: 0, y: 0, z: 0 }
                    }
                ],
                renderer: {
                    antialias: true,
                    alpha: true,
                    pixelRatio: window.devicePixelRatio
                }
            },
            simulationEngine: {
                timeScale: config.timeScale || 86400, // 1 day per second
                useNBody: config.useNBody || true,
                useRelativity: config.useRelativity || false,
                usePerturbations: config.usePerturbations || false,
                integrator: {
                    type: config.integratorType || 'rungeKutta4',
                    stepSize: config.stepSize || 3600 // 1 hour
                }
            },
            dataManager: {
                autoSave: config.autoSave || false,
                autoSaveInterval: config.autoSaveInterval || 60000, // 1 minute
                storageType: config.storageType || 'local',
                workers: {
                    enabled: config.workersEnabled || false,
                    count: config.workerCount || navigator.hardwareConcurrency || 4
                }
            },
            uiEngine: {
                container: config.uiContainer || 'ui',
                theme: config.theme || 'dark',
                panels: [
                    {
                        id: 'info',
                        title: 'Information',
                        position: 'top-left',
                        visible: true,
                        content: 'body-info'
                    },
                    {
                        id: 'controls',
                        title: 'Controls',
                        position: 'bottom-left',
                        visible: true,
                        content: 'simulation-controls'
                    },
                    {
                        id: 'settings',
                        title: 'Settings',
                        position: 'top-right',
                        visible: false,
                        content: 'settings-panel'
                    }
                ]
            }
        });
        
        // Create a binary star system
        const { SolarSystemPresets } = await import('../celestial/index.js');
        const solarSystem = SolarSystemPresets.createBinarySystem({
            name: 'Binary Star System',
            timeScale: app.simulationEngine.timeScale,
            useNBody: app.simulationEngine.useNBody,
            separation: config.separation || 2e11,
            orbitalVelocity: config.orbitalVelocity || 20000,
            primaryMass: config.primaryMass || 1.989e30,
            primaryRadius: config.primaryRadius || 6.96e8,
            primaryColor: config.primaryColor || 0xFFFF00,
            primaryTemperature: config.primaryTemperature || 5778,
            primaryClass: config.primaryClass || 'G',
            primarySpectralType: config.primarySpectralType || 'G2V',
            secondaryMass: config.secondaryMass || 1.989e30,
            secondaryRadius: config.secondaryRadius || 6.96e8,
            secondaryColor: config.secondaryColor || 0xFF9900,
            secondaryTemperature: config.secondaryTemperature || 4000,
            secondaryClass: config.secondaryClass || 'K',
            secondarySpectralType: config.secondarySpectralType || 'K2V'
        });
        
        // Add solar system to simulation
        app.simulationEngine.addSolarSystem(solarSystem);
        
        // Add solar system to render
        app.renderEngine.addSolarSystem(solarSystem);
        
        // Start the application
        app.engine.start();
        
        return app;
    },
    
    /**
     * Create an asteroid belt viewer
     * @param {Object} config - Configuration
     * @returns {Object} Application
     */
    async createAsteroidBeltViewer(config = {}) {
        const app = CoreFactory.createApplication({
            engine: {
                name: 'Asteroid Belt Viewer',
                version: '1.0.0',
                description: 'An asteroid belt viewer'
            },
            renderEngine: {
                container: config.container || 'app',
                width: config.width || window.innerWidth,
                height: config.height || window.innerHeight,
                backgroundColor: config.backgroundColor || 0x000000,
                camera: {
                    type: 'perspective',
                    fov: 75,
                    near: 0.1,
                    far: 1e15,
                    position: { x: 0, y: 1e11, z: 2e11 }
                },
                controls: {
                    type: 'orbit',
                    enableDamping: true,
                    dampingFactor: 0.05,
                    enableZoom: true,
                    enablePan: true,
                    minDistance: 1e9,
                    maxDistance: 1e13
                },
                lights: [
                    {
                        type: 'ambient',
                        color: 0x404040,
                        intensity: 0.5
                    },
                    {
                        type: 'point',
                        color: 0xffffff,
                        intensity: 1.0,
                        position: { x: 0, y: 0, z: 0 }
                    }
                ],
                renderer: {
                    antialias: true,
                    alpha: true,
                    pixelRatio: window.devicePixelRatio
                }
            },
            simulationEngine: {
                timeScale: config.timeScale || 86400, // 1 day per second
                useNBody: config.useNBody || true,
                useRelativity: config.useRelativity || false,
                usePerturbations: config.usePerturbations || false,
                integrator: {
                    type: config.integratorType || 'rungeKutta4',
                    stepSize: config.stepSize || 3600 // 1 hour
                }
            },
            dataManager: {
                autoSave: config.autoSave || false,
                autoSaveInterval: config.autoSaveInterval || 60000, // 1 minute
                storageType: config.storageType || 'local',
                workers: {
                    enabled: config.workersEnabled || false,
                    count: config.workerCount || navigator.hardwareConcurrency || 4
                }
            },
            uiEngine: {
                container: config.uiContainer || 'ui',
                theme: config.theme || 'dark',
                panels: [
                    {
                        id: 'info',
                        title: 'Information',
                        position: 'top-left',
                        visible: true,
                        content: 'body-info'
                    },
                    {
                        id: 'controls',
                        title: 'Controls',
                        position: 'bottom-left',
                        visible: true,
                        content: 'simulation-controls'
                    },
                    {
                        id: 'settings',
                        title: 'Settings',
                        position: 'top-right',
                        visible: false,
                        content: 'settings-panel'
                    }
                ]
            }
        });
        
        // Create an asteroid belt system
        const { SolarSystemPresets } = await import('../celestial/index.js');
        const solarSystem = SolarSystemPresets.createAsteroidBeltSystem({
            name: 'Asteroid Belt System',
            timeScale: app.simulationEngine.timeScale,
            useNBody: app.simulationEngine.useNBody,
            includeInnerPlanet: config.includeInnerPlanet !== false,
            includeOuterPlanet: config.includeOuterPlanet !== false,
            innerPlanetDistance: config.innerPlanetDistance || 1.496e11,
            outerPlanetDistance: config.outerPlanetDistance || 7.786e11,
            asteroidCount: config.asteroidCount || 100,
            beltInnerRadius: config.beltInnerRadius || 3.2e11,
            beltOuterRadius: config.beltOuterRadius || 5.2e11
        });
        
        // Add solar system to simulation
        app.simulationEngine.addSolarSystem(solarSystem);
        
        // Add solar system to render
        app.renderEngine.addSolarSystem(solarSystem);
        
        // Start the application
        app.engine.start();
        
        return app;
    }
};