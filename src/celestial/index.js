/**
 * Celestial module
 * Exports all celestial body classes
 */

// Export celestial body classes
export { CelestialBody } from './CelestialBody.js';
export { Star } from './Star.js';
export { Planet } from './Planet.js';
export { Moon } from './Moon.js';
export { Asteroid } from './Asteroid.js';
export { Comet } from './Comet.js';

// Factory functions for creating celestial bodies

/**
 * Create a celestial body
 * @param {Object} options - Options for the celestial body
 * @returns {CelestialBody} Created celestial body
 */
export function createCelestialBody(options = {}) {
    return new CelestialBody(options);
}

/**
 * Create a star
 * @param {Object} options - Options for the star
 * @returns {Star} Created star
 */
export function createStar(options = {}) {
    return new Star(options);
}

/**
 * Create a planet
 * @param {Object} options - Options for the planet
 * @returns {Planet} Created planet
 */
export function createPlanet(options = {}) {
    return new Planet(options);
}

/**
 * Create a moon
 * @param {Object} options - Options for the moon
 * @returns {Moon} Created moon
 */
export function createMoon(options = {}) {
    return new Moon(options);
}

/**
 * Create an asteroid
 * @param {Object} options - Options for the asteroid
 * @returns {Asteroid} Created asteroid
 */
export function createAsteroid(options = {}) {
    return new Asteroid(options);
}

/**
 * Create a comet
 * @param {Object} options - Options for the comet
 * @returns {Comet} Created comet
 */
export function createComet(options = {}) {
    return new Comet(options);
}

// Utility functions

/**
 * Create a celestial body from type
 * @param {string} type - Type of celestial body
 * @param {Object} options - Options for the celestial body
 * @returns {CelestialBody} Created celestial body
 */
export function createCelestialBodyFromType(type, options = {}) {
    switch (type) {
        case 'star':
            return createStar(options);
        case 'planet':
            return createPlanet(options);
        case 'moon':
            return createMoon(options);
        case 'asteroid':
            return createAsteroid(options);
        case 'comet':
            return createComet(options);
        default:
            return createCelestialBody(options);
    }
}

/**
 * Clone a celestial body
 * @param {CelestialBody} body - Celestial body to clone
 * @returns {CelestialBody} Cloned celestial body
 */
export function cloneCelestialBody(body) {
    return body.clone();
}

/**
 * Serialize a celestial body
 * @param {CelestialBody} body - Celestial body to serialize
 * @returns {Object} Serialized celestial body
 */
export function serializeCelestialBody(body) {
    return body.serialize();
}

/**
 * Deserialize a celestial body
 * @param {Object} data - Serialized celestial body
 * @param {Object} bodies - Map of bodies by ID
 * @returns {CelestialBody} Deserialized celestial body
 */
export function deserializeCelestialBody(data, bodies = {}) {
    switch (data.type) {
        case 'star':
            return Star.deserialize(data, bodies);
        case 'planet':
            return Planet.deserialize(data, bodies);
        case 'moon':
            return Moon.deserialize(data, bodies);
        case 'asteroid':
            return Asteroid.deserialize(data, bodies);
        case 'comet':
            return Comet.deserialize(data, bodies);
        default:
            return CelestialBody.deserialize(data, bodies);
    }
}

/**
 * Create a solar system
 * @param {Object} options - Options for the solar system
 * @returns {Object} Solar system object
 */
export function createSolarSystem(options = {}) {
    const solarSystem = {
        name: options.name || 'Solar System',
        bodies: [],
        bodyMap: {}
    };
    
    // Create star
    const star = createStar(options.star || {});
    solarSystem.bodies.push(star);
    solarSystem.bodyMap[star.id] = star;
    
    // Create planets
    if (options.planets) {
        for (const planetOptions of options.planets) {
            const planet = createPlanet({
                ...planetOptions,
                parent: star
            });
            solarSystem.bodies.push(planet);
            solarSystem.bodyMap[planet.id] = planet;
            
            // Create moons
            if (planetOptions.moons) {
                for (const moonOptions of planetOptions.moons) {
                    const moon = createMoon({
                        ...moonOptions,
                        parent: planet
                    });
                    planet.addMoon(moon);
                    solarSystem.bodies.push(moon);
                    solarSystem.bodyMap[moon.id] = moon;
                }
            }
        }
    }
    
    // Create asteroids
    if (options.asteroids) {
        for (const asteroidOptions of options.asteroids) {
            const asteroid = createAsteroid({
                ...asteroidOptions,
                parent: star
            });
            solarSystem.bodies.push(asteroid);
            solarSystem.bodyMap[asteroid.id] = asteroid;
        }
    }
    
    // Create comets
    if (options.comets) {
        for (const cometOptions of options.comets) {
            const comet = createComet({
                ...cometOptions,
                parent: star
            });
            solarSystem.bodies.push(comet);
            solarSystem.bodyMap[comet.id] = comet;
        }
    }
    
    return solarSystem;
}

/**
 * Serialize a solar system
 * @param {Object} solarSystem - Solar system to serialize
 * @returns {Object} Serialized solar system
 */
export function serializeSolarSystem(solarSystem) {
    return {
        name: solarSystem.name,
        bodies: solarSystem.bodies.map(body => serializeCelestialBody(body))
    };
}

/**
 * Deserialize a solar system
 * @param {Object} data - Serialized solar system
 * @returns {Object} Deserialized solar system
 */
export function deserializeSolarSystem(data) {
    const solarSystem = {
        name: data.name,
        bodies: [],
        bodyMap: {}
    };
    
    // First pass: create all bodies
    for (const bodyData of data.bodies) {
        const body = createCelestialBodyFromType(bodyData.type, {
            id: bodyData.id,
            name: bodyData.name,
            parentId: bodyData.parentId
        });
        solarSystem.bodies.push(body);
        solarSystem.bodyMap[body.id] = body;
    }
    
    // Second pass: deserialize all bodies with parent references
    for (let i = 0; i < data.bodies.length; i++) {
        const bodyData = data.bodies[i];
        const body = solarSystem.bodies[i];
        const deserializedBody = deserializeCelestialBody(bodyData, solarSystem.bodyMap);
        
        // Copy all properties from deserialized body
        Object.assign(body, deserializedBody);
    }
    
    // Add moons to planets
    for (const body of solarSystem.bodies) {
        if (body.type === 'planet') {
            for (const moonId of body.moonIds || []) {
                const moon = solarSystem.bodyMap[moonId];
                if (moon) {
                    body.addMoon(moon);
                }
            }
        }
    }
    
    return solarSystem;
}

/**
 * Update a solar system
 * @param {Object} solarSystem - Solar system to update
 * @param {number} deltaTime - Time step in seconds
 * @param {boolean} useNBody - Whether to use N-body simulation
 */
export function updateSolarSystem(solarSystem, deltaTime, useNBody = false) {
    for (const body of solarSystem.bodies) {
        body.update(deltaTime, useNBody);
    }
}

/**
 * Get a body by ID from a solar system
 * @param {Object} solarSystem - Solar system
 * @param {string} id - Body ID
 * @returns {CelestialBody|null} Body or null if not found
 */
export function getBodyById(solarSystem, id) {
    return solarSystem.bodyMap[id] || null;
}

/**
 * Get bodies by type from a solar system
 * @param {Object} solarSystem - Solar system
 * @param {string} type - Body type
 * @returns {Array} Array of bodies
 */
export function getBodiesByType(solarSystem, type) {
    return solarSystem.bodies.filter(body => body.type === type);
}

/**
 * Get all stars from a solar system
 * @param {Object} solarSystem - Solar system
 * @returns {Array} Array of stars
 */
export function getStars(solarSystem) {
    return getBodiesByType(solarSystem, 'star');
}

/**
 * Get all planets from a solar system
 * @param {Object} solarSystem - Solar system
 * @returns {Array} Array of planets
 */
export function getPlanets(solarSystem) {
    return getBodiesByType(solarSystem, 'planet');
}

/**
 * Get all moons from a solar system
 * @param {Object} solarSystem - Solar system
 * @returns {Array} Array of moons
 */
export function getMoons(solarSystem) {
    return getBodiesByType(solarSystem, 'moon');
}

/**
 * Get all asteroids from a solar system
 * @param {Object} solarSystem - Solar system
 * @returns {Array} Array of asteroids
 */
export function getAsteroids(solarSystem) {
    return getBodiesByType(solarSystem, 'asteroid');
}

/**
 * Get all comets from a solar system
 * @param {Object} solarSystem - Solar system
 * @returns {Array} Array of comets
 */
export function getComets(solarSystem) {
    return getBodiesByType(solarSystem, 'comet');
}