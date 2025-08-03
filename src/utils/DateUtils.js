import { PHYSICS_CONSTANTS, TIME_CONSTANTS } from './Constants.js';
import { MathUtils } from './MathUtils.js';

/**
 * Date and time utility functions for astronomical calculations
 */
export class DateUtils {
    /**
     * Convert JavaScript Date to Julian Date
     * @param {Date} date - JavaScript Date object
     * @returns {number} Julian Date
     */
    static dateToJulianDate(date) {
        const a = Math.floor((14 - (date.getMonth() + 1)) / 12);
        const y = date.getFullYear() + 4800 - a;
        const m = (date.getMonth() + 1) + 12 * a - 3;
        
        // For Gregorian calendar
        const julianDate = date.getDate() + Math.floor((153 * m + 2) / 5) + 365 * y + 
                          Math.floor(y / 4) - Math.floor(y / 100) + Math.floor(y / 400) - 32045;
        
        // Add time component
        const timeComponent = (date.getHours() - 12) / 24 + 
                             date.getMinutes() / 1440 + 
                             date.getSeconds() / 86400 + 
                             date.getMilliseconds() / 86400000;
        
        return julianDate + timeComponent + 2400000.5;
    }

    /**
     * Convert Julian Date to JavaScript Date
     * @param {number} julianDate - Julian Date
     * @returns {Date} JavaScript Date object
     */
    static julianDateToDate(julianDate) {
        const jd = julianDate - 2400000.5;
        const f = jd % 1;
        const z = Math.floor(jd);
        
        let a;
        if (z < 2299161) {
            a = z;
        } else {
            const alpha = Math.floor((z - 1867216.25) / 36524.25);
            a = z + 1 + alpha - Math.floor(alpha / 4);
        }
        
        const b = a + 1524;
        const c = Math.floor((b - 122.1) / 365.25);
        const d = Math.floor(365.25 * c);
        const e = Math.floor((b - d) / 30.6001);
        
        const day = b - d - Math.floor(30.6001 * e);
        const month = e < 14 ? e - 1 : e - 13;
        const year = month > 2 ? c - 4716 : c - 4715;
        
        const hours = Math.floor(f * 24);
        const minutes = Math.floor((f * 24 - hours) * 60);
        const seconds = Math.floor(((f * 24 - hours) * 60 - minutes) * 60);
        const milliseconds = Math.floor((((f * 24 - hours) * 60 - minutes) * 60 - seconds) * 1000);
        
        return new Date(year, month - 1, day, hours, minutes, seconds, milliseconds);
    }

    /**
     * Convert Julian Date to J2000 epoch (days since January 1, 2000, 12:00 UT)
     * @param {number} julianDate - Julian Date
     * @returns {number} Days since J2000 epoch
     */
    static julianDateToJ2000(julianDate) {
        return julianDate - 2451545.0;
    }

    /**
     * Convert J2000 epoch to Julian Date
     * @param {number} j2000 - Days since J2000 epoch
     * @returns {number} Julian Date
     */
    static j2000ToJulianDate(j2000) {
        return j2000 + 2451545.0;
    }

    /**
     * Get current Julian Date
     * @returns {number} Current Julian Date
     */
    static getCurrentJulianDate() {
        return this.dateToJulianDate(new Date());
    }

    /**
     * Get current J2000 epoch
     * @returns {number} Current J2000 epoch
     */
    static getCurrentJ2000() {
        return this.julianDateToJ2000(this.getCurrentJulianDate());
    }

    /**
     * Calculate Greenwich Mean Sidereal Time (GMST)
     * @param {number} julianDate - Julian Date
     * @returns {number} GMST in radians
     */
    static calculateGMST(julianDate) {
        const j2000 = this.julianDateToJ2000(julianDate);
        const centuries = j2000 / 36525.0;
        
        // GMST at 0h UT
        const gmst0 = 24110.54841 + 8640184.812866 * centuries + 0.093104 * centuries * centuries - 
                     0.0000062 * centuries * centuries * centuries;
        
        // Convert to radians and normalize
        const gmstRad = (gmst0 / 86400.0) * 2 * Math.PI;
        return this.normalizeAngle(gmstRad);
    }

    /**
     * Calculate Local Sidereal Time (LST)
     * @param {number} julianDate - Julian Date
     * @param {number} longitude - Observer longitude in radians (east positive)
     * @returns {number} LST in radians
     */
    static calculateLST(julianDate, longitude) {
        const gmst = this.calculateGMST(julianDate);
        return this.normalizeAngle(gmst + longitude);
    }

    /**
     * Calculate Earth's orbital position (simplified)
     * @param {number} j2000 - Days since J2000 epoch
     * @returns {Object} Earth's orbital parameters
     */
    static calculateEarthOrbit(j2000) {
        const T = j2000 / 36525.0; // Centuries since J2000
        
        // Mean anomaly (radians)
        const M = this.normalizeAngle(
            (357.52911 + 35999.05029 * T - 0.0001537 * T * T) * Math.PI / 180
        );
        
        // Eccentric anomaly (simplified)
        let E = M;
        for (let i = 0; i < 5; i++) {
            E = M + 0.016708634 * Math.sin(E);
        }
        
        // True anomaly
        const v = 2 * Math.atan2(
            Math.sqrt(1 + 0.016708634) * Math.sin(E / 2),
            Math.sqrt(1 - 0.016708634) * Math.cos(E / 2)
        );
        
        // Distance from Sun (AU)
        const r = 1.000001018 * (1 - 0.016708634 * Math.cos(E));
        
        return { meanAnomaly: M, eccentricAnomaly: E, trueAnomaly: v, distance: r };
    }

    /**
     * Calculate nutation in longitude and obliquity
     * @param {number} j2000 - Days since J2000 epoch
     * @returns {Object} Nutation values {deltaPsi, deltaEpsilon}
     */
    static calculateNutation(j2000) {
        const T = j2000 / 36525.0; // Centuries since J2000
        
        // Simplified nutation calculation (main terms only)
        const L = this.normalizeAngle((485868.249036 + 1717915923.2178 * T + 31.8792 * T * T) * Math.PI / 648000);
        const LPrime = this.normalizeAngle((1287104.79305 + 129596581.0481 * T - 0.5532 * T * T) * Math.PI / 648000);
        
        const deltaPsi = (-17.1996 * Math.sin(L) - 1.3187 * Math.sin(2 * L) - 0.2062 * Math.sin(2 * LPrime) + 
                          0.1426 * Math.sin(LPrime)) * Math.PI / 648000;
        
        const deltaEpsilon = (9.2025 * Math.cos(L) + 0.5736 * Math.cos(2 * L) - 0.0977 * Math.cos(2 * LPrime)) * Math.PI / 648000;
        
        return { deltaPsi, deltaEpsilon };
    }

    /**
     * Calculate true obliquity of the ecliptic
     * @param {number} j2000 - Days since J2000 epoch
     * @returns {number} True obliquity in radians
     */
    static calculateTrueObliquity(j2000) {
        const T = j2000 / 36525.0; // Centuries since J2000
        
        // Mean obliquity
        const epsilon0 = (84381.406 - 46.836769 * T - 0.0001831 * T * T + 0.00200340 * T * T * T) * Math.PI / 648000;
        
        // Add nutation
        const nutation = this.calculateNutation(j2000);
        return epsilon0 + nutation.deltaEpsilon;
    }

    /**
     * Format time duration in human-readable format
     * @param {number} seconds - Duration in seconds
     * @returns {string} Formatted duration
     */
    static formatDuration(seconds) {
        const absSeconds = Math.abs(seconds);
        const sign = seconds < 0 ? '-' : '';
        
        if (absSeconds < 60) {
            return `${sign}${absSeconds.toFixed(1)}s`;
        } else if (absSeconds < 3600) {
            const minutes = Math.floor(absSeconds / 60);
            const secs = absSeconds % 60;
            return `${sign}${minutes}m ${secs.toFixed(0)}s`;
        } else if (absSeconds < 86400) {
            const hours = Math.floor(absSeconds / 3600);
            const minutes = Math.floor((absSeconds % 3600) / 60);
            return `${sign}${hours}h ${minutes}m`;
        } else if (absSeconds < 31536000) {
            const days = Math.floor(absSeconds / 86400);
            const hours = Math.floor((absSeconds % 86400) / 3600);
            return `${sign}${days}d ${hours}h`;
        } else {
            const years = Math.floor(absSeconds / 31536000);
            const days = Math.floor((absSeconds % 31536000) / 86400);
            return `${sign}${years}y ${days}d`;
        }
    }

    /**
     * Format date for display
     * @param {Date} date - Date to format
     * @returns {string} Formatted date string
     */
    static formatDate(date) {
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });
    }

    /**
     * Format Julian Date for display
     * @param {number} julianDate - Julian Date
     * @returns {string} Formatted Julian Date
     */
    static formatJulianDate(julianDate) {
        return `JD ${julianDate.toFixed(6)}`;
    }

    /**
     * Parse date string in various formats
     * @param {string} dateString - Date string to parse
     * @returns {Date|null} Parsed Date object or null
     */
    static parseDate(dateString) {
        const formats = [
            // ISO format
            () => new Date(dateString),
            // MM/DD/YYYY
            () => {
                const parts = dateString.split('/');
                if (parts.length === 3) {
                    return new Date(parts[2], parts[0] - 1, parts[1]);
                }
                return null;
            },
            // DD-MM-YYYY
            () => {
                const parts = dateString.split('-');
                if (parts.length === 3) {
                    return new Date(parts[2], parts[1] - 1, parts[0]);
                }
                return null;
            },
            // Month DD, YYYY
            () => new Date(dateString)
        ];
        
        for (const format of formats) {
            try {
                const date = format();
                if (!isNaN(date.getTime())) {
                    return date;
                }
            } catch (e) {
                // Continue to next format
            }
        }
        
        return null;
    }

    /**
     * Normalize angle to [0, 2π] range
     * @param {number} angle - Angle in radians
     * @returns {number} Normalized angle
     */
    static normalizeAngle(angle) {
        while (angle < 0) angle += 2 * Math.PI;
        while (angle >= 2 * Math.PI) angle -= 2 * Math.PI;
        return angle;
    }

    /**
     * Calculate time acceleration factor
     * @param {number} simulationSpeed - Speed multiplier
     * @returns {number} Time acceleration factor
     */
    static getTimeAcceleration(simulationSpeed) {
        return simulationSpeed * TIME_CONSTANTS.DEFAULT_TIME_STEP;
    }

    /**
     * Calculate simulation time step based on speed
     * @param {number} simulationSpeed - Speed multiplier
     * @returns {number} Time step in seconds
     */
    static calculateTimeStep(simulationSpeed) {
        const baseStep = TIME_CONSTANTS.DEFAULT_TIME_STEP;
        const acceleratedStep = baseStep * simulationSpeed;
        
        return MathUtils.clamp(
            acceleratedStep,
            TIME_CONSTANTS.MIN_TIME_STEP,
            TIME_CONSTANTS.MAX_TIME_STEP
        );
    }

    /**
     * Check if date is within valid range for simulation
     * @param {Date} date - Date to check
     * @returns {boolean} True if date is valid
     */
    static isValidSimulationDate(date) {
        const year = date.getFullYear();
        // Reasonable range for astronomical simulation
        return year >= -10000 && year <= 10000;
    }

    /**
     * Get default simulation date range
     * @returns {Object} Date range {start, end}
     */
    static getDefaultDateRange() {
        return {
            start: new Date('1900-01-01T00:00:00Z'),
            end: new Date('2100-12-31T23:59:59Z')
        };
    }
}