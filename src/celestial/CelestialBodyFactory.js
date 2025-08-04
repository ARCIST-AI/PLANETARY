/**
 * CelestialBodyFactory class
 * Factory for creating celestial bodies with proper initialization
 */

import { CelestialBody } from './CelestialBody.js';
import { Asteroid } from './Asteroid.js';
import { Comet } from './Comet.js';
import { Planet } from './Planet.js';
import { Spacecraft } from './Spacecraft.js';
import { Star } from './Star.js';
import { MathUtils } from '../utils/index.js';

/**
 * CelestialBodyFactory class
 */
export class CelestialBodyFactory {
    /**
     * Create a celestial body based on type
     * @param {string} type - Type of celestial body
     * @param {Object} options - Options for the celestial body
     * @returns {CelestialBody} Created celestial body
     */
    static create(type, options = {}) {
        switch (type.toLowerCase()) {
            case 'asteroid':
                return new Asteroid(options);
            case 'comet':
                return new Comet(options);
            case 'planet':
                return new Planet(options);
            case 'spacecraft':
                return new Spacecraft(options);
            case 'star':
                return new Star(options);
            default:
                return new CelestialBody({ ...options, type });
        }
    }

    /**
     * Create a star with realistic properties
     * @param {Object} options - Options for the star
     * @returns {Star} Created star
     */
    static createStar(options = {}) {
        const starOptions = {
            id: options.id || MathUtils.generateUUID(),
            name: options.name || 'Star',
            mass: options.mass || 1.989e30, // Solar mass
            radius: options.radius || 6.96e8, // Solar radius
            temperature: options.temperature || 5778, // Solar temperature
            luminosity: options.luminosity || 3.828e26, // Solar luminosity
            spectralClass: options.spectralClass || 'G',
            stellarClass: options.stellarClass || 'Main Sequence',
            age: options.age || 4.6e9, // Solar age
            color: options.color || 0xffff00,
            emissive: options.emissive || 0xffff00,
            emissiveIntensity: options.emissiveIntensity || 1,
            ...options
        };

        return new Star(starOptions);
    }

    /**
     * Create a planet with realistic properties
     * @param {Object} options - Options for the planet
     * @returns {Planet} Created planet
     */
    static createPlanet(options = {}) {
        const planetOptions = {
            id: options.id || MathUtils.generateUUID(),
            name: options.name || 'Planet',
            mass: options.mass || 5.972e24, // Earth mass
            radius: options.radius || 6.371e6, // Earth radius
            density: options.density || 5514, // Earth density
            gravity: options.gravity || 9.81, // Earth gravity
            rotationPeriod: options.rotationPeriod || 24 * 3600, // 24 hours
            axialTilt: options.axialTilt || 0.41, // Earth axial tilt
            albedo: options.albedo || 0.3, // Earth albedo
            greenhouseEffect: options.greenhouseEffect || 0.3,
            surfaceTemperature: options.surfaceTemperature || 288, // Earth temperature
            atmosphericPressure: options.atmosphericPressure || 101325, // Earth pressure
            atmosphericComposition: options.atmosphericComposition || {
                nitrogen: 0.78,
                oxygen: 0.21,
                argon: 0.01
            },
            hydrosphere: options.hydrosphere || 0.7, // Earth hydrosphere fraction
            color: options.color || 0x2233ff,
            ...options
        };

        return new Planet(planetOptions);
    }

    /**
     * Create an asteroid with realistic properties
     * @param {Object} options - Options for the asteroid
     * @returns {Asteroid} Created asteroid
     */
    static createAsteroid(options = {}) {
        const asteroidOptions = {
            id: options.id || MathUtils.generateUUID(),
            name: options.name || 'Asteroid',
            mass: options.mass || 1e16, // Typical asteroid mass
            radius: options.radius || 1e5, // Typical asteroid radius
            density: options.density || 2000, // Typical asteroid density
            albedo: options.albedo || 0.1, // Typical asteroid albedo
            rotationPeriod: options.rotationPeriod || MathUtils.random(2, 24) * 3600,
            axialTilt: options.axialTilt || Math.random() * Math.PI,
            porosity: options.porosity || 0.2,
            composition: options.composition || {
                silicate: 0.6,
                metal: 0.3,
                carbon: 0.1
            },
            irregularShape: options.irregularShape !== false,
            color: options.color || 0x888888,
            ...options
        };

        return new Asteroid(asteroidOptions);
    }

    /**
     * Create a comet with realistic properties
     * @param {Object} options - Options for the comet
     * @returns {Comet} Created comet
     */
    static createComet(options = {}) {
        const cometOptions = {
            id: options.id || MathUtils.generateUUID(),
            name: options.name || 'Comet',
            mass: options.mass || 1e13, // Typical comet mass
            radius: options.radius || 5e3, // Typical comet radius
            density: options.density || 500, // Typical comet density
            albedo: options.albedo || 0.04, // Typical comet albedo
            rotationPeriod: options.rotationPeriod || MathUtils.random(6, 60) * 3600,
            axialTilt: options.axialTilt || Math.random() * Math.PI,
            porosity: options.porosity || 0.7,
            composition: options.composition || {
                ice: 0.5,
                dust: 0.4,
                rock: 0.1
            },
            active: options.active !== false,
            activityLevel: options.activityLevel || 0.5,
            hasTail: options.hasTail !== false,
            color: options.color || 0xaaccff,
            ...options
        };

        return new Comet(cometOptions);
    }

    /**
     * Create a spacecraft with realistic properties
     * @param {Object} options - Options for the spacecraft
     * @returns {Spacecraft} Created spacecraft
     */
    static createSpacecraft(options = {}) {
        const spacecraftOptions = {
            id: options.id || MathUtils.generateUUID(),
            name: options.name || 'Spacecraft',
            mass: options.mass || 1000, // Typical spacecraft mass
            radius: options.radius || 10, // Typical spacecraft size
            spacecraftType: options.spacecraftType || 'satellite',
            status: options.status || 'active',
            dryMass: options.dryMass || 800,
            fuelMass: options.fuelMass || 200,
            thrust: options.thrust || 100,
            specificImpulse: options.specificImpulse || 300,
            hasPropulsion: options.hasPropulsion !== false,
            hasAttitudeControl: options.hasAttitudeControl !== false,
            hasCommunication: options.hasCommunication !== false,
            hasNavigation: options.hasNavigation !== false,
            hasInstruments: options.hasInstruments !== false,
            hasThermalControl: options.hasThermalControl !== false,
            color: options.color || 0xcccccc,
            ...options
        };

        return new Spacecraft(spacecraftOptions);
    }

    /**
     * Create a solar system with predefined bodies
     * @param {Object} options - Options for the solar system
     * @returns {Object} Object containing all created bodies
     */
    static createSolarSystem(options = {}) {
        const system = {
            star: null,
            planets: [],
            asteroids: [],
            comets: [],
            spacecraft: []
        };

        // Create the star
        system.star = this.createStar({
            name: options.starName || 'Sun',
            ...options.starOptions
        });

        // Create planets
        if (options.planets && options.planets.length > 0) {
            for (const planetConfig of options.planets) {
                const planet = this.createPlanet({
                    parent: system.star,
                    ...planetConfig
                });
                system.planets.push(planet);
            }
        } else {
            // Create default planets
            const defaultPlanets = [
                { name: 'Mercury', semiMajorAxis: 5.79e10, radius: 2.44e6, mass: 3.30e23 },
                { name: 'Venus', semiMajorAxis: 1.08e11, radius: 6.05e6, mass: 4.87e24 },
                { name: 'Earth', semiMajorAxis: 1.50e11, radius: 6.37e6, mass: 5.97e24 },
                { name: 'Mars', semiMajorAxis: 2.28e11, radius: 3.39e6, mass: 6.42e23 }
            ];

            for (const planetConfig of defaultPlanets) {
                const planet = this.createPlanet({
                    parent: system.star,
                    ...planetConfig
                });
                system.planets.push(planet);
            }
        }

        // Create asteroids
        if (options.asteroids && options.asteroids.length > 0) {
            for (const asteroidConfig of options.asteroids) {
                const asteroid = this.createAsteroid({
                    parent: system.star,
                    ...asteroidConfig
                });
                system.asteroids.push(asteroid);
            }
        }

        // Create comets
        if (options.comets && options.comets.length > 0) {
            for (const cometConfig of options.comets) {
                const comet = this.createComet({
                    parent: system.star,
                    ...cometConfig
                });
                system.comets.push(comet);
            }
        }

        // Create spacecraft
        if (options.spacecraft && options.spacecraft.length > 0) {
            for (const spacecraftConfig of options.spacecraft) {
                const spacecraft = this.createSpacecraft({
                    parent: spacecraftConfig.parent || system.planets[2] || system.star, // Default to Earth or star
                    ...spacecraftConfig
                });
                system.spacecraft.push(spacecraft);
            }
        }

        return system;
    }

    /**
     * Create a random celestial body
     * @param {string} type - Type of celestial body (optional, random if not specified)
     * @param {Object} options - Base options for the celestial body
     * @returns {CelestialBody} Created celestial body
     */
    static createRandom(type = null, options = {}) {
        const types = ['asteroid', 'comet', 'planet', 'star'];
        const randomType = type || types[Math.floor(Math.random() * types.length)];

        switch (randomType) {
            case 'asteroid':
                return this.createRandomAsteroid(options);
            case 'comet':
                return this.createRandomComet(options);
            case 'planet':
                return this.createRandomPlanet(options);
            case 'star':
                return this.createRandomStar(options);
            default:
                return this.createRandomPlanet(options);
        }
    }

    /**
     * Create a random star
     * @param {Object} options - Base options for the star
     * @returns {Star} Created star
     */
    static createRandomStar(options = {}) {
        const spectralClasses = ['O', 'B', 'A', 'F', 'G', 'K', 'M'];
        const stellarClasses = ['Main Sequence', 'Red Dwarf', 'Giant', 'Supergiant', 'White Dwarf'];
        
        const spectralClass = spectralClasses[Math.floor(Math.random() * spectralClasses.length)];
        const stellarClass = stellarClasses[Math.floor(Math.random() * stellarClasses.length)];
        
        // Temperature based on spectral class
        const temperatureRanges = {
            'O': [30000, 50000],
            'B': [10000, 30000],
            'A': [7500, 10000],
            'F': [6000, 7500],
            'G': [5200, 6000],
            'K': [3700, 5200],
            'M': [2400, 3700]
        };
        
        const tempRange = temperatureRanges[spectralClass];
        const temperature = MathUtils.random(tempRange[0], tempRange[1]);
        
        // Mass based on stellar class
        const massRanges = {
            'Main Sequence': [0.08, 20],
            'Red Dwarf': [0.08, 0.5],
            'Giant': [0.8, 10],
            'Supergiant': [10, 50],
            'White Dwarf': [0.5, 1.4]
        };
        
        const massRange = massRanges[stellarClass];
        const massRatio = MathUtils.random(massRange[0], massRange[1]);
        const mass = massRatio * 1.989e30; // Solar masses
        
        // Color based on temperature
        let color;
        if (temperature >= 30000) color = 0x9bb0ff;
        else if (temperature >= 10000) color = 0xaabfff;
        else if (temperature >= 7500) color = 0xcad7ff;
        else if (temperature >= 6000) color = 0xf8f7ff;
        else if (temperature >= 5200) color = 0xfff4ea;
        else if (temperature >= 3700) color = 0xffd2a1;
        else color = 0xffcc6f;

        return this.createStar({
            name: options.name || `Star-${MathUtils.generateUUID().substring(0, 8)}`,
            temperature,
            mass,
            spectralClass,
            stellarClass,
            color,
            ...options
        });
    }

    /**
     * Create a random planet
     * @param {Object} options - Base options for the planet
     * @returns {Planet} Created planet
     */
    static createRandomPlanet(options = {}) {
        const planetTypes = ['terrestrial', 'gas giant', 'ice giant'];
        const planetType = planetTypes[Math.floor(Math.random() * planetTypes.length)];
        
        let mass, radius, density, color;
        
        switch (planetType) {
            case 'terrestrial':
                mass = MathUtils.random(0.1, 2) * 5.972e24; // Earth masses
                radius = MathUtils.random(0.5, 1.5) * 6.371e6; // Earth radii
                density = MathUtils.random(3000, 8000);
                color = MathUtils.randomChoice([0x8B4513, 0x228B22, 0x4169E1, 0xDC143C]);
                break;
            case 'gas giant':
                mass = MathUtils.random(50, 500) * 5.972e24; // Earth masses
                radius = MathUtils.random(5, 15) * 6.371e6; // Earth radii
                density = MathUtils.random(500, 2000);
                color = MathUtils.randomChoice([0xDEB887, 0xF4A460, 0xDAA520, 0xCD853F]);
                break;
            case 'ice giant':
                mass = MathUtils.random(10, 50) * 5.972e24; // Earth masses
                radius = MathUtils.random(2, 5) * 6.371e6; // Earth radii
                density = MathUtils.random(1000, 3000);
                color = MathUtils.randomChoice([0x4FD0E0, 0x40E0D0, 0x48D1CC, 0x00CED1]);
                break;
        }

        return this.createPlanet({
            name: options.name || `Planet-${MathUtils.generateUUID().substring(0, 8)}`,
            mass,
            radius,
            density,
            color,
            ...options
        });
    }

    /**
     * Create a random asteroid
     * @param {Object} options - Base options for the asteroid
     * @returns {Asteroid} Created asteroid
     */
    static createRandomAsteroid(options = {}) {
        const mass = MathUtils.random(1e14, 1e18);
        const radius = MathUtils.random(1e3, 1e6);
        const composition = {
            silicate: Math.random(),
            metal: Math.random(),
            carbon: Math.random()
        };
        
        // Normalize composition
        const total = composition.silicate + composition.metal + composition.carbon;
        composition.silicate /= total;
        composition.metal /= total;
        composition.carbon /= total;

        return this.createAsteroid({
            name: options.name || `Asteroid-${MathUtils.generateUUID().substring(0, 8)}`,
            mass,
            radius,
            composition,
            ...options
        });
    }

    /**
     * Create a random comet
     * @param {Object} options - Base options for the comet
     * @returns {Comet} Created comet
     */
    static createRandomComet(options = {}) {
        const mass = MathUtils.random(1e11, 1e15);
        const radius = MathUtils.random(1e3, 1e5);
        const composition = {
            ice: Math.random(),
            dust: Math.random(),
            rock: Math.random()
        };
        
        // Normalize composition
        const total = composition.ice + composition.dust + composition.rock;
        composition.ice /= total;
        composition.dust /= total;
        composition.rock /= total;

        return this.createComet({
            name: options.name || `Comet-${MathUtils.generateUUID().substring(0, 8)}`,
            mass,
            radius,
            composition,
            eccentricity: MathUtils.random(0.7, 0.99),
            ...options
        });
    }
}