import { COORDINATE_CONSTANTS, PHYSICS_CONSTANTS } from '../utils/Constants.js';
import { MathUtils } from '../utils/MathUtils.js';

/**
 * Coordinate system transformations for astronomical calculations
 */
export class CoordinateTransform {
    /**
     * Create a new coordinate transform instance
     * @param {Object} config - Configuration options
     */
    constructor(config = {}) {
        this.epoch = config.epoch || COORDINATE_CONSTANTS.J2000_EPOCH;
        this.obliquity = config.obliquity || COORDINATE_CONSTANTS.ECLIPTIC_OBLIQUITY;
        this.AU = config.AU || PHYSICS_CONSTANTS.AU;
    }

    /**
     * Convert spherical coordinates to Cartesian
     * @param {number} r - Radius
     * @param {number} theta - Polar angle (from z-axis)
     * @param {number} phi - Azimuthal angle (from x-axis)
     * @returns {Object} Cartesian coordinates {x, y, z}
     */
    static sphericalToCartesian(r, theta, phi) {
        const x = r * Math.sin(theta) * Math.cos(phi);
        const y = r * Math.sin(theta) * Math.sin(phi);
        const z = r * Math.cos(theta);
        
        return { x, y, z };
    }

    /**
     * Convert Cartesian coordinates to spherical
     * @param {Object} cartesian - Cartesian coordinates {x, y, z}
     * @returns {Object} Spherical coordinates {r, theta, phi}
     */
    static cartesianToSpherical(cartesian) {
        const r = Math.sqrt(cartesian.x * cartesian.x + cartesian.y * cartesian.y + cartesian.z * cartesian.z);
        const theta = Math.acos(cartesian.z / r);
        const phi = Math.atan2(cartesian.y, cartesian.x);
        
        return { r, theta, phi };
    }

    /**
     * Convert equatorial coordinates to ecliptic coordinates
     * @param {Object} equatorial - Equatorial coordinates {ra, dec} in radians
     * @returns {Object} Ecliptic coordinates {longitude, latitude} in radians
     */
    equatorialToEcliptic(equatorial) {
        const ra = equatorial.ra;
        const dec = equatorial.dec;
        
        const sinLat = Math.sin(dec) * Math.cos(this.obliquity) - 
                       Math.cos(dec) * Math.sin(ra) * Math.sin(this.obliquity);
        const lat = Math.asin(sinLat);
        
        const cosLon = (Math.sin(dec) * Math.sin(this.obliquity) + 
                        Math.cos(dec) * Math.sin(ra) * Math.cos(this.obliquity)) / Math.cos(lat);
        const sinLon = Math.cos(dec) * Math.cos(ra) / Math.cos(lat);
        const lon = Math.atan2(sinLon, cosLon);
        
        return {
            longitude: lon,
            latitude: lat
        };
    }

    /**
     * Convert ecliptic coordinates to equatorial coordinates
     * @param {Object} ecliptic - Ecliptic coordinates {longitude, latitude} in radians
     * @returns {Object} Equatorial coordinates {ra, dec} in radians
     */
    eclipticToEquatorial(ecliptic) {
        const lon = ecliptic.longitude;
        const lat = ecliptic.latitude;
        
        const sinDec = Math.sin(lat) * Math.cos(this.obliquity) + 
                       Math.cos(lat) * Math.sin(lon) * Math.sin(this.obliquity);
        const dec = Math.asin(sinDec);
        
        const cosRA = (Math.sin(lat) * Math.sin(this.obliquity) - 
                       Math.cos(lat) * Math.sin(lon) * Math.cos(this.obliquity)) / Math.cos(dec);
        const sinRA = Math.cos(lat) * Math.cos(lon) / Math.cos(dec);
        const ra = Math.atan2(sinRA, cosRA);
        
        return {
            ra: ra,
            dec: dec
        };
    }

    /**
     * Convert equatorial coordinates to horizontal coordinates
     * @param {Object} equatorial - Equatorial coordinates {ra, dec} in radians
     * @param {number} lst - Local Sidereal Time in radians
     * @param {number} latitude - Observer's latitude in radians
     * @returns {Object} Horizontal coordinates {azimuth, altitude} in radians
     */
    equatorialToHorizontal(equatorial, lst, latitude) {
        const ra = equatorial.ra;
        const dec = equatorial.dec;
        
        const ha = lst - ra; // Hour angle
        
        const sinAlt = Math.sin(dec) * Math.sin(latitude) + 
                       Math.cos(dec) * Math.cos(latitude) * Math.cos(ha);
        const alt = Math.asin(sinAlt);
        
        const cosAz = (Math.sin(dec) - Math.sin(alt) * Math.sin(latitude)) / 
                      (Math.cos(alt) * Math.cos(latitude));
        const sinAz = -Math.cos(dec) * Math.sin(ha) / Math.cos(alt);
        const az = Math.atan2(sinAz, cosAz);
        
        // Convert azimuth to astronomical convention (from North through East)
        const azimuth = (az + Math.PI) % (2 * Math.PI);
        
        return {
            azimuth: azimuth,
            altitude: alt
        };
    }

    /**
     * Convert horizontal coordinates to equatorial coordinates
     * @param {Object} horizontal - Horizontal coordinates {azimuth, altitude} in radians
     * @param {number} lst - Local Sidereal Time in radians
     * @param {number} latitude - Observer's latitude in radians
     * @returns {Object} Equatorial coordinates {ra, dec} in radians
     */
    horizontalToEquatorial(horizontal, lst, latitude) {
        const az = horizontal.azimuth - Math.PI; // Convert from astronomical to mathematical convention
        const alt = horizontal.altitude;
        
        const sinDec = Math.sin(alt) * Math.sin(latitude) + 
                       Math.cos(alt) * Math.cos(latitude) * Math.cos(az);
        const dec = Math.asin(sinDec);
        
        const cosHA = (Math.sin(alt) - Math.sin(dec) * Math.sin(latitude)) / 
                      (Math.cos(dec) * Math.cos(latitude));
        const sinHA = -Math.cos(alt) * Math.sin(az) / Math.cos(dec);
        const ha = Math.atan2(sinHA, cosHA);
        
        const ra = (lst - ha + 2 * Math.PI) % (2 * Math.PI);
        
        return {
            ra: ra,
            dec: dec
        };
    }

    /**
     * Convert heliocentric coordinates to geocentric coordinates
     * @param {Object} heliocentric - Heliocentric coordinates {x, y, z} in meters
     * @param {Object} earthPosition - Earth's heliocentric position {x, y, z} in meters
     * @returns {Object} Geocentric coordinates {x, y, z} in meters
     */
    heliocentricToGeocentric(heliocentric, earthPosition) {
        return MathUtils.subtractVectors(heliocentric, earthPosition);
    }

    /**
     * Convert geocentric coordinates to heliocentric coordinates
     * @param {Object} geocentric - Geocentric coordinates {x, y, z} in meters
     * @param {Object} earthPosition - Earth's heliocentric position {x, y, z} in meters
     * @returns {Object} Heliocentric coordinates {x, y, z} in meters
     */
    geocentricToHeliocentric(geocentric, earthPosition) {
        return MathUtils.addVectors(geocentric, earthPosition);
    }

    /**
     * Convert rectangular coordinates to orbital elements
     * @param {Object} position - Position vector {x, y, z} in meters
     * @param {Object} velocity - Velocity vector {x, y, z} in m/s
     * @param {number} centralBodyMass - Mass of central body in kg
     * @returns {Object} Orbital elements
     */
    rectangularToOrbitalElements(position, velocity, centralBodyMass) {
        return KeplerianOrbit.calculateOrbitalElements(position, velocity, centralBodyMass);
    }

    /**
     * Convert orbital elements to rectangular coordinates
     * @param {Object} elements - Orbital elements
     * @param {Date} time - Time for position calculation
     * @returns {Object} State vectors {position, velocity}
     */
    orbitalElementsToRectangular(elements, time) {
        const orbit = new KeplerianOrbit(elements);
        return orbit.getStateAtTime(time);
    }

    /**
     * Convert right ascension and declination to direction vector
     * @param {number} ra - Right ascension in radians
     * @param {number} dec - Declination in radians
     * @returns {Object} Unit vector {x, y, z}
     */
    raDecToVector(ra, dec) {
        const x = Math.cos(dec) * Math.cos(ra);
        const y = Math.cos(dec) * Math.sin(ra);
        const z = Math.sin(dec);
        
        return { x, y, z };
    }

    /**
     * Convert direction vector to right ascension and declination
     * @param {Object} vector - Direction vector {x, y, z}
     * @returns {Object} {ra, dec} in radians
     */
    vectorToRaDec(vector) {
        const r = Math.sqrt(vector.x * vector.x + vector.y * vector.y + vector.z * vector.z);
        const dec = Math.asin(vector.z / r);
        const ra = Math.atan2(vector.y, vector.x);
        
        return { ra, dec };
    }

    /**
     * Convert astronomical units to meters
     * @param {number} au - Distance in AU
     * @returns {number} Distance in meters
     */
    auToMeters(au) {
        return au * this.AU;
    }

    /**
     * Convert meters to astronomical units
     * @param {number} meters - Distance in meters
     * @returns {number} Distance in AU
     */
    metersToAu(meters) {
        return meters / this.AU;
    }

    /**
     * Convert degrees to radians
     * @param {number} degrees - Angle in degrees
     * @returns {number} Angle in radians
     */
    degreesToRadians(degrees) {
        return MathUtils.degToRad(degrees);
    }

    /**
     * Convert radians to degrees
     * @param {number} radians - Angle in radians
     * @returns {number} Angle in degrees
     */
    radiansToDegrees(radians) {
        return MathUtils.radToDeg(radians);
    }

    /**
     * Convert hours to radians (for right ascension)
     * @param {number} hours - Hours
     * @returns {number} Radians
     */
    hoursToRadians(hours) {
        return hours * Math.PI / 12;
    }

    /**
     * Convert radians to hours (for right ascension)
     * @param {number} radians - Radians
     * @returns {number} Hours
     */
    radiansToHours(radians) {
        return radians * 12 / Math.PI;
    }

    /**
     * Convert hours, minutes, seconds to decimal hours
     * @param {number} hours - Hours
     * @param {number} minutes - Minutes
     * @param {number} seconds - Seconds
     * @returns {number} Decimal hours
     */
    hmsToHours(hours, minutes, seconds) {
        return hours + minutes / 60 + seconds / 3600;
    }

    /**
     * Convert decimal hours to hours, minutes, seconds
     * @param {number} decimalHours - Decimal hours
     * @returns {Object} {hours, minutes, seconds}
     */
    hoursToHms(decimalHours) {
        const hours = Math.floor(decimalHours);
        const fractionalHours = decimalHours - hours;
        const minutes = Math.floor(fractionalHours * 60);
        const seconds = (fractionalHours * 60 - minutes) * 60;
        
        return { hours, minutes, seconds };
    }

    /**
     * Convert degrees, arcminutes, arcseconds to decimal degrees
     * @param {number} degrees - Degrees
     * @param {number} arcminutes - Arcminutes
     * @param {number} arcseconds - Arcseconds
     * @returns {number} Decimal degrees
     */
    dmsToDegrees(degrees, arcminutes, arcseconds) {
        return degrees + arcminutes / 60 + arcseconds / 3600;
    }

    /**
     * Convert decimal degrees to degrees, arcminutes, arcseconds
     * @param {number} decimalDegrees - Decimal degrees
     * @returns {Object} {degrees, arcminutes, arcseconds}
     */
    degreesToDms(decimalDegrees) {
        const degrees = Math.floor(decimalDegrees);
        const fractionalDegrees = decimalDegrees - degrees;
        const arcminutes = Math.floor(fractionalDegrees * 60);
        const arcseconds = (fractionalDegrees * 60 - arcminutes) * 60;
        
        return { degrees, arcminutes, arcseconds };
    }

    /**
     * Calculate Local Sidereal Time
     * @param {Date} date - Date and time
     * @param {number} longitude - Observer's longitude in radians (east positive)
     * @returns {number} Local Sidereal Time in radians
     */
    calculateLST(date, longitude) {
        // Calculate Julian Day
        const jd = this.calculateJulianDay(date);
        
        // Calculate Julian Century from J2000.0
        const jc = (jd - 2451545.0) / 36525.0;
        
        // Greenwich Mean Sidereal Time at 0h UT
        const gmst = 24110.54841 + 8640184.812866 * jc + 0.093104 * jc * jc - 0.0000062 * jc * jc * jc;
        
        // Convert to seconds and normalize to 0-86400
        const gmstSeconds = gmst % 86400;
        if (gmstSeconds < 0) gmstSeconds += 86400;
        
        // Convert to radians
        const gmstRadians = (gmstSeconds / 86400) * 2 * Math.PI;
        
        // Add UT time fraction and longitude
        const utFraction = (date.getUTCHours() + date.getUTCMinutes() / 60 + date.getUTCSeconds() / 3600) / 24;
        const lst = gmstRadians + utFraction * 2 * Math.PI + longitude;
        
        // Normalize to 0-2π
        return lst % (2 * Math.PI);
    }

    /**
     * Calculate Julian Day from date
     * @param {Date} date - Date and time
     * @returns {number} Julian Day
     */
    calculateJulianDay(date) {
        const year = date.getUTCFullYear();
        const month = date.getUTCMonth() + 1;
        const day = date.getUTCDate();
        const hour = date.getUTCHours();
        const minute = date.getUTCMinutes();
        const second = date.getUTCSeconds();
        
        let a, b;
        if (month <= 2) {
            a = Math.floor((year - 1) / 100);
            b = 2 - a + Math.floor(a / 4);
        } else {
            a = Math.floor(year / 100);
            b = 2 - a + Math.floor(a / 4);
        }
        
        const jd = Math.floor(365.25 * (year + 4716)) + Math.floor(30.6001 * (month + 1)) + day + b - 1524.5;
        const timeFraction = (hour + minute / 60 + second / 3600) / 24;
        
        return jd + timeFraction;
    }

    /**
     * Update configuration
     * @param {Object} config - New configuration
     */
    updateConfig(config) {
        if (config.epoch !== undefined) this.epoch = config.epoch;
        if (config.obliquity !== undefined) this.obliquity = config.obliquity;
        if (config.AU !== undefined) this.AU = config.AU;
    }
}

// Import KeplerianOrbit for static method reference
import { KeplerianOrbit } from './KeplerianOrbit.js';