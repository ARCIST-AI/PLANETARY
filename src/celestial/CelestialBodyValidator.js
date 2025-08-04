/**
 * CelestialBodyValidator class
 * Validation system for celestial body properties
 */

import { PhysicsConstants } from '../physics/index.js';

/**
 * CelestialBodyValidator class
 */
export class CelestialBodyValidator {
    /**
     * Validate a celestial body
     * @param {CelestialBody} body - Celestial body to validate
     * @returns {Object} Validation result { valid, errors, warnings }
     */
    static validate(body) {
        const result = {
            valid: true,
            errors: [],
            warnings: []
        };

        // Validate basic properties
        this._validateBasicProperties(body, result);

        // Validate physical properties
        this._validatePhysicalProperties(body, result);

        // Validate orbital properties
        this._validateOrbitalProperties(body, result);

        // Validate rotation properties
        this._validateRotationProperties(body, result);

        // Validate type-specific properties
        this._validateTypeSpecificProperties(body, result);

        // Validate relationships
        this._validateRelationships(body, result);

        result.valid = result.errors.length === 0;

        return result;
    }

    /**
     * Validate basic properties
     * @param {CelestialBody} body - Celestial body to validate
     * @param {Object} result - Validation result
     * @private
     */
    static _validateBasicProperties(body, result) {
        // Validate ID
        if (!body.id || typeof body.id !== 'string' || body.id.trim() === '') {
            result.errors.push('ID is required and must be a non-empty string');
        }

        // Validate name
        if (!body.name || typeof body.name !== 'string' || body.name.trim() === '') {
            result.errors.push('Name is required and must be a non-empty string');
        }

        // Validate type
        if (!body.type || typeof body.type !== 'string' || body.type.trim() === '') {
            result.errors.push('Type is required and must be a non-empty string');
        }

        // Validate position
        if (!body.position || typeof body.position !== 'object') {
            result.errors.push('Position is required and must be an object');
        } else {
            if (typeof body.position.x !== 'number' || isNaN(body.position.x)) {
                result.errors.push('Position.x must be a valid number');
            }
            if (typeof body.position.y !== 'number' || isNaN(body.position.y)) {
                result.errors.push('Position.y must be a valid number');
            }
            if (typeof body.position.z !== 'number' || isNaN(body.position.z)) {
                result.errors.push('Position.z must be a valid number');
            }
        }

        // Validate velocity
        if (!body.velocity || typeof body.velocity !== 'object') {
            result.errors.push('Velocity is required and must be an object');
        } else {
            if (typeof body.velocity.x !== 'number' || isNaN(body.velocity.x)) {
                result.errors.push('Velocity.x must be a valid number');
            }
            if (typeof body.velocity.y !== 'number' || isNaN(body.velocity.y)) {
                result.errors.push('Velocity.y must be a valid number');
            }
            if (typeof body.velocity.z !== 'number' || isNaN(body.velocity.z)) {
                result.errors.push('Velocity.z must be a valid number');
            }
        }

        // Validate acceleration
        if (!body.acceleration || typeof body.acceleration !== 'object') {
            result.errors.push('Acceleration is required and must be an object');
        } else {
            if (typeof body.acceleration.x !== 'number' || isNaN(body.acceleration.x)) {
                result.errors.push('Acceleration.x must be a valid number');
            }
            if (typeof body.acceleration.y !== 'number' || isNaN(body.acceleration.y)) {
                result.errors.push('Acceleration.y must be a valid number');
            }
            if (typeof body.acceleration.z !== 'number' || isNaN(body.acceleration.z)) {
                result.errors.push('Acceleration.z must be a valid number');
            }
        }
    }

    /**
     * Validate physical properties
     * @param {CelestialBody} body - Celestial body to validate
     * @param {Object} result - Validation result
     * @private
     */
    static _validatePhysicalProperties(body, result) {
        // Validate mass
        if (typeof body.mass !== 'number' || isNaN(body.mass)) {
            result.errors.push('Mass must be a valid number');
        } else if (body.mass < 0) {
            result.errors.push('Mass cannot be negative');
        } else if (body.mass === 0 && body.type !== 'spacecraft') {
            result.warnings.push('Mass is zero - this may not be realistic for this body type');
        }

        // Validate radius
        if (typeof body.radius !== 'number' || isNaN(body.radius)) {
            result.errors.push('Radius must be a valid number');
        } else if (body.radius < 0) {
            result.errors.push('Radius cannot be negative');
        } else if (body.radius === 0) {
            result.warnings.push('Radius is zero - this may not be realistic');
        }

        // Validate density
        if (typeof body.density !== 'number' || isNaN(body.density)) {
            result.errors.push('Density must be a valid number');
        } else if (body.density < 0) {
            result.errors.push('Density cannot be negative');
        } else if (body.density > 50000) {
            result.warnings.push('Density is extremely high - this may not be realistic');
        } else if (body.density < 100 && body.mass > 0) {
            result.warnings.push('Density is very low - this may not be realistic');
        }

        // Validate gravity
        if (typeof body.gravity !== 'number' || isNaN(body.gravity)) {
            result.errors.push('Gravity must be a valid number');
        } else if (body.gravity < 0) {
            result.errors.push('Gravity cannot be negative');
        }

        // Validate escape velocity
        if (typeof body.escapeVelocity !== 'number' || isNaN(body.escapeVelocity)) {
            result.errors.push('Escape velocity must be a valid number');
        } else if (body.escapeVelocity < 0) {
            result.errors.push('Escape velocity cannot be negative');
        }

        // Check consistency between mass, radius, and density
        if (body.mass > 0 && body.radius > 0 && body.density > 0) {
            const volume = (4 / 3) * Math.PI * Math.pow(body.radius, 3);
            const calculatedDensity = body.mass / volume;
            const densityRatio = calculatedDensity / body.density;
            
            if (densityRatio < 0.5 || densityRatio > 2) {
                result.warnings.push('Mass, radius, and density are inconsistent with each other');
            }
        }

        // Check consistency between mass, radius, and gravity
        if (body.mass > 0 && body.radius > 0 && body.gravity > 0) {
            const calculatedGravity = (PhysicsConstants.G * body.mass) / Math.pow(body.radius, 2);
            const gravityRatio = calculatedGravity / body.gravity;
            
            if (gravityRatio < 0.5 || gravityRatio > 2) {
                result.warnings.push('Mass, radius, and gravity are inconsistent with each other');
            }
        }

        // Check consistency between mass, radius, and escape velocity
        if (body.mass > 0 && body.radius > 0 && body.escapeVelocity > 0) {
            const calculatedEscapeVelocity = Math.sqrt((2 * PhysicsConstants.G * body.mass) / body.radius);
            const escapeVelocityRatio = calculatedEscapeVelocity / body.escapeVelocity;
            
            if (escapeVelocityRatio < 0.5 || escapeVelocityRatio > 2) {
                result.warnings.push('Mass, radius, and escape velocity are inconsistent with each other');
            }
        }
    }

    /**
     * Validate orbital properties
     * @param {CelestialBody} body - Celestial body to validate
     * @param {Object} result - Validation result
     * @private
     */
    static _validateOrbitalProperties(body, result) {
        // Validate semi-major axis
        if (typeof body.semiMajorAxis !== 'number' || isNaN(body.semiMajorAxis)) {
            result.errors.push('Semi-major axis must be a valid number');
        } else if (body.semiMajorAxis < 0) {
            result.errors.push('Semi-major axis cannot be negative');
        }

        // Validate eccentricity
        if (typeof body.eccentricity !== 'number' || isNaN(body.eccentricity)) {
            result.errors.push('Eccentricity must be a valid number');
        } else if (body.eccentricity < 0) {
            result.errors.push('Eccentricity cannot be negative');
        } else if (body.eccentricity >= 1) {
            if (body.eccentricity > 1) {
                result.warnings.push('Eccentricity > 1 indicates a hyperbolic orbit - this may not be intended');
            } else if (body.eccentricity === 1) {
                result.warnings.push('Eccentricity = 1 indicates a parabolic orbit - this may not be intended');
            }
        }

        // Validate inclination
        if (typeof body.inclination !== 'number' || isNaN(body.inclination)) {
            result.errors.push('Inclination must be a valid number');
        } else if (body.inclination < 0 || body.inclination > Math.PI) {
            result.warnings.push('Inclination should typically be between 0 and π radians');
        }

        // Validate longitude of ascending node
        if (typeof body.longitudeOfAscendingNode !== 'number' || isNaN(body.longitudeOfAscendingNode)) {
            result.errors.push('Longitude of ascending node must be a valid number');
        } else if (body.longitudeOfAscendingNode < 0 || body.longitudeOfAscendingNode > 2 * Math.PI) {
            result.warnings.push('Longitude of ascending node should typically be between 0 and 2π radians');
        }

        // Validate argument of periapsis
        if (typeof body.argumentOfPeriapsis !== 'number' || isNaN(body.argumentOfPeriapsis)) {
            result.errors.push('Argument of periapsis must be a valid number');
        } else if (body.argumentOfPeriapsis < 0 || body.argumentOfPeriapsis > 2 * Math.PI) {
            result.warnings.push('Argument of periapsis should typically be between 0 and 2π radians');
        }

        // Validate mean anomaly at epoch
        if (typeof body.meanAnomalyAtEpoch !== 'number' || isNaN(body.meanAnomalyAtEpoch)) {
            result.errors.push('Mean anomaly at epoch must be a valid number');
        } else if (body.meanAnomalyAtEpoch < 0 || body.meanAnomalyAtEpoch > 2 * Math.PI) {
            result.warnings.push('Mean anomaly at epoch should typically be between 0 and 2π radians');
        }

        // Validate epoch
        if (!(body.epoch instanceof Date) || isNaN(body.epoch.getTime())) {
            result.errors.push('Epoch must be a valid Date object');
        }

        // Validate orbital period
        if (typeof body.orbitalPeriod !== 'number' || isNaN(body.orbitalPeriod)) {
            result.errors.push('Orbital period must be a valid number');
        } else if (body.orbitalPeriod < 0) {
            result.errors.push('Orbital period cannot be negative');
        }

        // Validate mean motion
        if (typeof body.meanMotion !== 'number' || isNaN(body.meanMotion)) {
            result.errors.push('Mean motion must be a valid number');
        } else if (body.meanMotion < 0) {
            result.errors.push('Mean motion cannot be negative');
        }

        // Check consistency between orbital period and mean motion
        if (body.orbitalPeriod > 0 && body.meanMotion > 0) {
            const calculatedMeanMotion = (2 * Math.PI) / body.orbitalPeriod;
            const meanMotionRatio = calculatedMeanMotion / body.meanMotion;
            
            if (meanMotionRatio < 0.9 || meanMotionRatio > 1.1) {
                result.warnings.push('Orbital period and mean motion are inconsistent with each other');
            }
        }

        // Check consistency between semi-major axis and orbital period (if parent exists)
        if (body.parent && body.parent.mass > 0 && body.semiMajorAxis > 0 && body.orbitalPeriod > 0) {
            const calculatedPeriod = 2 * Math.PI * Math.sqrt(Math.pow(body.semiMajorAxis, 3) / (PhysicsConstants.G * body.parent.mass));
            const periodRatio = calculatedPeriod / body.orbitalPeriod;
            
            if (periodRatio < 0.9 || periodRatio > 1.1) {
                result.warnings.push('Semi-major axis and orbital period are inconsistent with parent mass');
            }
        }
    }

    /**
     * Validate rotation properties
     * @param {CelestialBody} body - Celestial body to validate
     * @param {Object} result - Validation result
     * @private
     */
    static _validateRotationProperties(body, result) {
        // Validate rotation period
        if (typeof body.rotationPeriod !== 'number' || isNaN(body.rotationPeriod)) {
            result.errors.push('Rotation period must be a valid number');
        } else if (body.rotationPeriod < 0) {
            result.errors.push('Rotation period cannot be negative');
        } else if (body.rotationPeriod === 0) {
            result.warnings.push('Rotation period is zero - this indicates a non-rotating body');
        }

        // Validate axial tilt
        if (typeof body.axialTilt !== 'number' || isNaN(body.axialTilt)) {
            result.errors.push('Axial tilt must be a valid number');
        } else if (body.axialTilt < 0 || body.axialTilt > Math.PI) {
            result.warnings.push('Axial tilt should typically be between 0 and π radians');
        }

        // Validate rotation angle
        if (typeof body.rotationAngle !== 'number' || isNaN(body.rotationAngle)) {
            result.errors.push('Rotation angle must be a valid number');
        }
    }

    /**
     * Validate type-specific properties
     * @param {CelestialBody} body - Celestial body to validate
     * @param {Object} result - Validation result
     * @private
     */
    static _validateTypeSpecificProperties(body, result) {
        switch (body.type) {
            case 'star':
                this._validateStarProperties(body, result);
                break;
            case 'planet':
                this._validatePlanetProperties(body, result);
                break;
            case 'asteroid':
                this._validateAsteroidProperties(body, result);
                break;
            case 'comet':
                this._validateCometProperties(body, result);
                break;
            case 'spacecraft':
                this._validateSpacecraftProperties(body, result);
                break;
        }
    }

    /**
     * Validate star-specific properties
     * @param {CelestialBody} body - Celestial body to validate
     * @param {Object} result - Validation result
     * @private
     */
    static _validateStarProperties(body, result) {
        // Validate luminosity
        if (typeof body.luminosity !== 'number' || isNaN(body.luminosity)) {
            result.errors.push('Star luminosity must be a valid number');
        } else if (body.luminosity < 0) {
            result.errors.push('Star luminosity cannot be negative');
        } else if (body.luminosity === 0) {
            result.warnings.push('Star luminosity is zero - this is not realistic for a star');
        }

        // Validate temperature
        if (typeof body.temperature !== 'number' || isNaN(body.temperature)) {
            result.errors.push('Star temperature must be a valid number');
        } else if (body.temperature < 0) {
            result.errors.push('Star temperature cannot be negative');
        } else if (body.temperature < 1000) {
            result.warnings.push('Star temperature is very low - this may not be realistic');
        } else if (body.temperature > 100000) {
            result.warnings.push('Star temperature is extremely high - this may not be realistic');
        }

        // Validate spectral class
        if (body.spectralClass && typeof body.spectralClass !== 'string') {
            result.errors.push('Star spectral class must be a string');
        } else if (body.spectralClass && !['O', 'B', 'A', 'F', 'G', 'K', 'M'].includes(body.spectralClass)) {
            result.warnings.push('Star spectral class should be one of: O, B, A, F, G, K, M');
        }

        // Validate stellar class
        if (body.stellarClass && typeof body.stellarClass !== 'string') {
            result.errors.push('Star stellar class must be a string');
        }

        // Validate age
        if (typeof body.age !== 'number' || isNaN(body.age)) {
            result.errors.push('Star age must be a valid number');
        } else if (body.age < 0) {
            result.errors.push('Star age cannot be negative');
        } else if (body.age > 1.4e10) {
            result.warnings.push('Star age exceeds the age of the universe');
        }

        // Validate metallicity
        if (typeof body.metallicity !== 'number' || isNaN(body.metallicity)) {
            result.errors.push('Star metallicity must be a valid number');
        }

        // Validate rotation velocity
        if (typeof body.rotationVelocity !== 'number' || isNaN(body.rotationVelocity)) {
            result.errors.push('Star rotation velocity must be a valid number');
        } else if (body.rotationVelocity < 0) {
            result.errors.push('Star rotation velocity cannot be negative');
        }

        // Check consistency between mass and luminosity (mass-luminosity relation)
        if (body.mass > 0 && body.luminosity > 0) {
            const solarMass = 1.989e30;
            const solarLuminosity = 3.828e26;
            const massRatio = body.mass / solarMass;
            const luminosityRatio = body.luminosity / solarLuminosity;
            const expectedLuminosityRatio = Math.pow(massRatio, 3.5);
            
            if (expectedLuminosityRatio > 0) {
                const ratio = luminosityRatio / expectedLuminosityRatio;
                if (ratio < 0.1 || ratio > 10) {
                    result.warnings.push('Star mass and luminosity are inconsistent with mass-luminosity relation');
                }
            }
        }
    }

    /**
     * Validate planet-specific properties
     * @param {CelestialBody} body - Celestial body to validate
     * @param {Object} result - Validation result
     * @private
     */
    static _validatePlanetProperties(body, result) {
        // Validate albedo
        if (typeof body.albedo !== 'number' || isNaN(body.albedo)) {
            result.errors.push('Planet albedo must be a valid number');
        } else if (body.albedo < 0) {
            result.errors.push('Planet albedo cannot be negative');
        } else if (body.albedo > 1) {
            result.errors.push('Planet albedo cannot exceed 1');
        }

        // Validate greenhouse effect
        if (typeof body.greenhouseEffect !== 'number' || isNaN(body.greenhouseEffect)) {
            result.errors.push('Planet greenhouse effect must be a valid number');
        } else if (body.greenhouseEffect < 0) {
            result.errors.push('Planet greenhouse effect cannot be negative');
        }

        // Validate surface temperature
        if (typeof body.surfaceTemperature !== 'number' || isNaN(body.surfaceTemperature)) {
            result.errors.push('Planet surface temperature must be a valid number');
        } else if (body.surfaceTemperature < 0) {
            result.warnings.push('Planet surface temperature is below absolute zero');
        }

        // Validate atmospheric pressure
        if (typeof body.atmosphericPressure !== 'number' || isNaN(body.atmosphericPressure)) {
            result.errors.push('Planet atmospheric pressure must be a valid number');
        } else if (body.atmosphericPressure < 0) {
            result.errors.push('Planet atmospheric pressure cannot be negative');
        }

        // Validate atmospheric composition
        if (body.atmosphericComposition && typeof body.atmosphericComposition !== 'object') {
            result.errors.push('Planet atmospheric composition must be an object');
        } else if (body.atmosphericComposition) {
            let total = 0;
            for (const [component, fraction] of Object.entries(body.atmosphericComposition)) {
                if (typeof fraction !== 'number' || isNaN(fraction)) {
                    result.errors.push(`Atmospheric component ${component} fraction must be a valid number`);
                } else if (fraction < 0) {
                    result.errors.push(`Atmospheric component ${component} fraction cannot be negative`);
                } else {
                    total += fraction;
                }
            }
            
            if (Math.abs(total - 1) > 0.01) {
                result.warnings.push('Atmospheric composition fractions do not sum to 1');
            }
        }

        // Validate hydrosphere
        if (typeof body.hydrosphere !== 'number' || isNaN(body.hydrosphere)) {
            result.errors.push('Planet hydrosphere must be a valid number');
        } else if (body.hydrosphere < 0) {
            result.errors.push('Planet hydrosphere cannot be negative');
        } else if (body.hydrosphere > 1) {
            result.errors.push('Planet hydrosphere cannot exceed 1');
        }
    }

    /**
     * Validate asteroid-specific properties
     * @param {CelestialBody} body - Celestial body to validate
     * @param {Object} result - Validation result
     * @private
     */
    static _validateAsteroidProperties(body, result) {
        // Validate albedo
        if (typeof body.albedo !== 'number' || isNaN(body.albedo)) {
            result.errors.push('Asteroid albedo must be a valid number');
        } else if (body.albedo < 0) {
            result.errors.push('Asteroid albedo cannot be negative');
        } else if (body.albedo > 1) {
            result.errors.push('Asteroid albedo cannot exceed 1');
        }

        // Validate surface temperature
        if (typeof body.surfaceTemperature !== 'number' || isNaN(body.surfaceTemperature)) {
            result.errors.push('Asteroid surface temperature must be a valid number');
        } else if (body.surfaceTemperature < 0) {
            result.warnings.push('Asteroid surface temperature is below absolute zero');
        }

        // Validate porosity
        if (typeof body.porosity !== 'number' || isNaN(body.porosity)) {
            result.errors.push('Asteroid porosity must be a valid number');
        } else if (body.porosity < 0) {
            result.errors.push('Asteroid porosity cannot be negative');
        } else if (body.porosity > 1) {
            result.errors.push('Asteroid porosity cannot exceed 1');
        }

        // Validate composition
        if (body.composition && typeof body.composition !== 'object') {
            result.errors.push('Asteroid composition must be an object');
        } else if (body.composition) {
            let total = 0;
            for (const [component, fraction] of Object.entries(body.composition)) {
                if (typeof fraction !== 'number' || isNaN(fraction)) {
                    result.errors.push(`Composition component ${component} fraction must be a valid number`);
                } else if (fraction < 0) {
                    result.errors.push(`Composition component ${component} fraction cannot be negative`);
                } else {
                    total += fraction;
                }
            }
            
            if (Math.abs(total - 1) > 0.01) {
                result.warnings.push('Asteroid composition fractions do not sum to 1');
            }
        }

        // Validate irregular shape
        if (typeof body.irregularShape !== 'boolean') {
            result.errors.push('Asteroid irregular shape must be a boolean');
        }

        // Validate dimensions
        if (body.dimensions && typeof body.dimensions !== 'object') {
            result.errors.push('Asteroid dimensions must be an object');
        } else if (body.dimensions) {
            if (typeof body.dimensions.length !== 'number' || isNaN(body.dimensions.length)) {
                result.errors.push('Asteroid dimension length must be a valid number');
            }
            if (typeof body.dimensions.width !== 'number' || isNaN(body.dimensions.width)) {
                result.errors.push('Asteroid dimension width must be a valid number');
            }
            if (typeof body.dimensions.height !== 'number' || isNaN(body.dimensions.height)) {
                result.errors.push('Asteroid dimension height must be a valid number');
            }
        }
    }

    /**
     * Validate comet-specific properties
     * @param {CelestialBody} body - Celestial body to validate
     * @param {Object} result - Validation result
     * @private
     */
    static _validateCometProperties(body, result) {
        // Validate albedo
        if (typeof body.albedo !== 'number' || isNaN(body.albedo)) {
            result.errors.push('Comet albedo must be a valid number');
        } else if (body.albedo < 0) {
            result.errors.push('Comet albedo cannot be negative');
        } else if (body.albedo > 1) {
            result.errors.push('Comet albedo cannot exceed 1');
        }

        // Validate surface temperature
        if (typeof body.surfaceTemperature !== 'number' || isNaN(body.surfaceTemperature)) {
            result.errors.push('Comet surface temperature must be a valid number');
        } else if (body.surfaceTemperature < 0) {
            result.warnings.push('Comet surface temperature is below absolute zero');
        }

        // Validate porosity
        if (typeof body.porosity !== 'number' || isNaN(body.porosity)) {
            result.errors.push('Comet porosity must be a valid number');
        } else if (body.porosity < 0) {
            result.errors.push('Comet porosity cannot be negative');
        } else if (body.porosity > 1) {
            result.errors.push('Comet porosity cannot exceed 1');
        }

        // Validate composition
        if (body.composition && typeof body.composition !== 'object') {
            result.errors.push('Comet composition must be an object');
        } else if (body.composition) {
            let total = 0;
            for (const [component, fraction] of Object.entries(body.composition)) {
                if (typeof fraction !== 'number' || isNaN(fraction)) {
                    result.errors.push(`Composition component ${component} fraction must be a valid number`);
                } else if (fraction < 0) {
                    result.errors.push(`Composition component ${component} fraction cannot be negative`);
                } else {
                    total += fraction;
                }
            }
            
            if (Math.abs(total - 1) > 0.01) {
                result.warnings.push('Comet composition fractions do not sum to 1');
            }
        }

        // Validate active
        if (typeof body.active !== 'boolean') {
            result.errors.push('Comet active must be a boolean');
        }

        // Validate activity level
        if (typeof body.activityLevel !== 'number' || isNaN(body.activityLevel)) {
            result.errors.push('Comet activity level must be a valid number');
        } else if (body.activityLevel < 0) {
            result.errors.push('Comet activity level cannot be negative');
        } else if (body.activityLevel > 1) {
            result.errors.push('Comet activity level cannot exceed 1');
        }

        // Validate has tail
        if (typeof body.hasTail !== 'boolean') {
            result.errors.push('Comet hasTail must be a boolean');
        }
    }

    /**
     * Validate spacecraft-specific properties
     * @param {CelestialBody} body - Celestial body to validate
     * @param {Object} result - Validation result
     * @private
     */
    static _validateSpacecraftProperties(body, result) {
        // Validate spacecraft type
        if (body.spacecraftType && typeof body.spacecraftType !== 'string') {
            result.errors.push('Spacecraft type must be a string');
        }

        // Validate status
        if (body.status && typeof body.status !== 'string') {
            result.errors.push('Spacecraft status must be a string');
        }

        // Validate dry mass
        if (typeof body.dryMass !== 'number' || isNaN(body.dryMass)) {
            result.errors.push('Spacecraft dry mass must be a valid number');
        } else if (body.dryMass < 0) {
            result.errors.push('Spacecraft dry mass cannot be negative');
        }

        // Validate fuel mass
        if (typeof body.fuelMass !== 'number' || isNaN(body.fuelMass)) {
            result.errors.push('Spacecraft fuel mass must be a valid number');
        } else if (body.fuelMass < 0) {
            result.errors.push('Spacecraft fuel mass cannot be negative');
        }

        // Validate total mass
        if (typeof body.totalMass !== 'number' || isNaN(body.totalMass)) {
            result.errors.push('Spacecraft total mass must be a valid number');
        } else if (body.totalMass < 0) {
            result.errors.push('Spacecraft total mass cannot be negative');
        }

        // Check consistency between masses
        if (body.dryMass >= 0 && body.fuelMass >= 0 && body.totalMass >= 0) {
            const calculatedTotalMass = body.dryMass + body.fuelMass;
            if (Math.abs(calculatedTotalMass - body.totalMass) > 0.01) {
                result.warnings.push('Spacecraft total mass is not equal to dry mass plus fuel mass');
            }
        }

        // Validate thrust
        if (typeof body.thrust !== 'number' || isNaN(body.thrust)) {
            result.errors.push('Spacecraft thrust must be a valid number');
        } else if (body.thrust < 0) {
            result.errors.push('Spacecraft thrust cannot be negative');
        }

        // Validate specific impulse
        if (typeof body.specificImpulse !== 'number' || isNaN(body.specificImpulse)) {
            result.errors.push('Spacecraft specific impulse must be a valid number');
        } else if (body.specificImpulse < 0) {
            result.errors.push('Spacecraft specific impulse cannot be negative');
        }

        // Validate fuel consumption
        if (typeof body.fuelConsumption !== 'number' || isNaN(body.fuelConsumption)) {
            result.errors.push('Spacecraft fuel consumption must be a valid number');
        } else if (body.fuelConsumption < 0) {
            result.errors.push('Spacecraft fuel consumption cannot be negative');
        }

        // Validate boolean properties
        const booleanProps = [
            'hasPropulsion', 'hasAttitudeControl', 'hasCommunication', 
            'hasNavigation', 'hasInstruments', 'hasThermalControl',
            'isThrusting', 'isCommunicating', 'isRecording'
        ];

        for (const prop of booleanProps) {
            if (body[prop] !== undefined && typeof body[prop] !== 'boolean') {
                result.errors.push(`Spacecraft ${prop} must be a boolean`);
            }
        }
    }

    /**
     * Validate relationships
     * @param {CelestialBody} body - Celestial body to validate
     * @param {Object} result - Validation result
     * @private
     */
    static _validateRelationships(body, result) {
        // Validate parent relationship
        if (body.parent) {
            if (typeof body.parent !== 'object') {
                result.errors.push('Parent must be an object');
            } else if (!body.parent.id) {
                result.errors.push('Parent must have an ID');
            } else if (body.parent.id === body.id) {
                result.errors.push('Body cannot be its own parent');
            }

            // Check for circular references
            let current = body.parent;
            const visited = new Set();
            while (current) {
                if (visited.has(current.id)) {
                    result.errors.push('Circular reference detected in parent relationships');
                    break;
                }
                visited.add(current.id);
                current = current.parent;
            }
        }

        // Validate orbital properties require a parent
        if (body.semiMajorAxis > 0 && !body.parent) {
            result.warnings.push('Body has orbital properties but no parent - this may not be intended');
        }
    }
}