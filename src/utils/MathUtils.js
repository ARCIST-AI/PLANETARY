import { Matrix } from 'ml-matrix';
import { evaluate } from 'mathjs';

/**
 * Mathematical utility functions for astronomical calculations
 */
export class MathUtils {
    /**
     * Convert degrees to radians
     * @param {number} degrees - Angle in degrees
     * @returns {number} Angle in radians
     */
    static degToRad(degrees) {
        return degrees * Math.PI / 180;
    }

    /**
     * Convert radians to degrees
     * @param {number} radians - Angle in radians
     * @returns {number} Angle in degrees
     */
    static radToDeg(radians) {
        return radians * 180 / Math.PI;
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
     * Calculate distance between two 3D points
     * @param {Object} p1 - First point {x, y, z}
     * @param {Object} p2 - Second point {x, y, z}
     * @returns {number} Distance
     */
    static distance(p1, p2) {
        const dx = p2.x - p1.x;
        const dy = p2.y - p1.y;
        const dz = p2.z - p1.z;
        return Math.sqrt(dx * dx + dy * dy + dz * dz);
    }

    /**
     * Calculate squared distance (faster, no sqrt)
     * @param {Object} p1 - First point {x, y, z}
     * @param {Object} p2 - Second point {x, y, z}
     * @returns {number} Squared distance
     */
    static distanceSquared(p1, p2) {
        const dx = p2.x - p1.x;
        const dy = p2.y - p1.y;
        const dz = p2.z - p1.z;
        return dx * dx + dy * dy + dz * dz;
    }

    /**
     * Linear interpolation between two values
     * @param {number} a - Start value
     * @param {number} b - End value
     * @param {number} t - Interpolation factor [0, 1]
     * @returns {number} Interpolated value
     */
    static lerp(a, b, t) {
        return a + (b - a) * t;
    }

    /**
     * Smooth interpolation using cosine
     * @param {number} a - Start value
     * @param {number} b - End value
     * @param {number} t - Interpolation factor [0, 1]
     * @returns {number} Smooth interpolated value
     */
    static smoothLerp(a, b, t) {
        const smoothT = (1 - Math.cos(t * Math.PI)) / 2;
        return a + (b - a) * smoothT;
    }

    /**
     * Clamp value between min and max
     * @param {number} value - Value to clamp
     * @param {number} min - Minimum value
     * @param {number} max - Maximum value
     * @returns {number} Clamped value
     */
    static clamp(value, min, max) {
        return Math.max(min, Math.min(max, value));
    }

    /**
     * Map value from one range to another
     * @param {number} value - Input value
     * @param {number} inMin - Input range minimum
     * @param {number} inMax - Input range maximum
     * @param {number} outMin - Output range minimum
     * @param {number} outMax - Output range maximum
     * @returns {number} Mapped value
     */
    static map(value, inMin, inMax, outMin, outMax) {
        return (value - inMin) * (outMax - outMin) / (inMax - inMin) + outMin;
    }

    /**
     * Create 3D vector
     * @param {number} x - X component
     * @param {number} y - Y component
     * @param {number} z - Z component
     * @returns {Object} Vector object
     */
    static vector3(x = 0, y = 0, z = 0) {
        return { x, y, z };
    }

    /**
     * Add two vectors
     * @param {Object} v1 - First vector
     * @param {Object} v2 - Second vector
     * @returns {Object} Result vector
     */
    static addVectors(v1, v2) {
        return {
            x: v1.x + v2.x,
            y: v1.y + v2.y,
            z: v1.z + v2.z
        };
    }

    /**
     * Subtract two vectors
     * @param {Object} v1 - First vector
     * @param {Object} v2 - Second vector
     * @returns {Object} Result vector
     */
    static subtractVectors(v1, v2) {
        return {
            x: v1.x - v2.x,
            y: v1.y - v2.y,
            z: v1.z - v2.z
        };
    }

    /**
     * Multiply vector by scalar
     * @param {Object} v - Vector
     * @param {number} scalar - Scalar value
     * @returns {Object} Result vector
     */
    static multiplyVector(v, scalar) {
        return {
            x: v.x * scalar,
            y: v.y * scalar,
            z: v.z * scalar
        };
    }

    /**
     * Calculate dot product of two vectors
     * @param {Object} v1 - First vector
     * @param {Object} v2 - Second vector
     * @returns {number} Dot product
     */
    static dotProduct(v1, v2) {
        return v1.x * v2.x + v1.y * v2.y + v1.z * v2.z;
    }

    /**
     * Calculate cross product of two vectors
     * @param {Object} v1 - First vector
     * @param {Object} v2 - Second vector
     * @returns {Object} Cross product vector
     */
    static crossProduct(v1, v2) {
        return {
            x: v1.y * v2.z - v1.z * v2.y,
            y: v1.z * v2.x - v1.x * v2.z,
            z: v1.x * v2.y - v1.y * v2.x
        };
    }

    /**
     * Calculate vector magnitude
     * @param {Object} v - Vector
     * @returns {number} Magnitude
     */
    static vectorMagnitude(v) {
        return Math.sqrt(v.x * v.x + v.y * v.y + v.z * v.z);
    }

    /**
     * Normalize vector to unit length
     * @param {Object} v - Vector
     * @returns {Object} Normalized vector
     */
    static normalizeVector(v) {
        const mag = this.vectorMagnitude(v);
        if (mag === 0) return { x: 0, y: 0, z: 0 };
        return {
            x: v.x / mag,
            y: v.y / mag,
            z: v.z / mag
        };
    }

    /**
     * Create rotation matrix from axis and angle
     * @param {Object} axis - Rotation axis (normalized)
     * @param {number} angle - Rotation angle in radians
     * @returns {Matrix} 3x3 rotation matrix
     */
    static rotationMatrix(axis, angle) {
        const c = Math.cos(angle);
        const s = Math.sin(angle);
        const t = 1 - c;
        const x = axis.x;
        const y = axis.y;
        const z = axis.z;

        return new Matrix([
            [t * x * x + c, t * x * y - s * z, t * x * z + s * y],
            [t * x * y + s * z, t * y * y + c, t * y * z - s * x],
            [t * x * z - s * y, t * y * z + s * x, t * z * z + c]
        ]);
    }

    /**
     * Apply rotation matrix to vector
     * @param {Matrix} matrix - 3x3 rotation matrix
     * @param {Object} vector - Vector to rotate
     * @returns {Object} Rotated vector
     */
    static applyRotation(matrix, vector) {
        const result = matrix.multiply([[vector.x], [vector.y], [vector.z]]);
        return {
            x: result.get(0, 0),
            y: result.get(1, 0),
            z: result.get(2, 0)
        };
    }

    /**
     * Calculate gravitational force between two bodies
     * @param {Object} body1 - First body {mass, position}
     * @param {Object} body2 - Second body {mass, position}
     * @param {number} G - Gravitational constant
     * @returns {Object} Force vector on body1 due to body2
     */
    static gravitationalForce(body1, body2, G) {
        const r = this.subtractVectors(body2.position, body1.position);
        const rMag = this.vectorMagnitude(r);
        
        if (rMag === 0) return { x: 0, y: 0, z: 0 };
        
        const forceMag = G * body1.mass * body2.mass / (rMag * rMag);
        const forceDir = this.normalizeVector(r);
        
        return this.multiplyVector(forceDir, forceMag);
    }

    /**
     * Calculate orbital velocity for circular orbit
     * @param {number} centralMass - Mass of central body
     * @param {number} orbitalRadius - Orbital radius
     * @param {number} G - Gravitational constant
     * @returns {number} Orbital velocity
     */
    static orbitalVelocity(centralMass, orbitalRadius, G) {
        return Math.sqrt(G * centralMass / orbitalRadius);
    }

    /**
     * Calculate orbital period using Kepler's third law
     * @param {number} semiMajorAxis - Semi-major axis
     * @param {number} centralMass - Mass of central body
     * @param {number} G - Gravitational constant
     * @returns {number} Orbital period
     */
    static orbitalPeriod(semiMajorAxis, centralMass, G) {
        return 2 * Math.PI * Math.sqrt(Math.pow(semiMajorAxis, 3) / (G * centralMass));
    }

    /**
     * Solve Kepler's equation for eccentric anomaly
     * @param {number} meanAnomaly - Mean anomaly
     * @param {number} eccentricity - Orbital eccentricity
     * @param {number} tolerance - Convergence tolerance
     * @returns {number} Eccentric anomaly
     */
    static solveKeplerEquation(meanAnomaly, eccentricity, tolerance = 1e-8) {
        let E = meanAnomaly; // Initial guess
        let deltaE;
        
        do {
            deltaE = (E - eccentricity * Math.sin(E) - meanAnomaly) / (1 - eccentricity * Math.cos(E));
            E -= deltaE;
        } while (Math.abs(deltaE) > tolerance);
        
        return E;
    }

    /**
     * Calculate position from orbital elements
     * @param {Object} elements - Orbital elements
     * @param {number} time - Time since epoch
     * @returns {Object} Position vector
     */
    static orbitalElementsToPosition(elements, time) {
        const { semiMajorAxis, eccentricity, inclination, 
                longitudeOfAscendingNode, argumentOfPeriapsis, 
                meanAnomalyAtEpoch, orbitalPeriod } = elements;
        
        // Mean anomaly at time t
        const meanAnomaly = meanAnomalyAtEpoch + (2 * Math.PI * time) / orbitalPeriod;
        
        // Eccentric anomaly
        const eccentricAnomaly = this.solveKeplerEquation(meanAnomaly, eccentricity);
        
        // True anomaly
        const trueAnomaly = 2 * Math.atan2(
            Math.sqrt(1 + eccentricity) * Math.sin(eccentricAnomaly / 2),
            Math.sqrt(1 - eccentricity) * Math.cos(eccentricAnomaly / 2)
        );
        
        // Distance from focus
        const r = semiMajorAxis * (1 - eccentricity * Math.cos(eccentricAnomaly));
        
        // Position in orbital plane
        const xOrbital = r * Math.cos(trueAnomaly);
        const yOrbital = r * Math.sin(trueAnomaly);
        const zOrbital = 0;
        
        // Rotation matrices for orbital orientation
        const cosOmega = Math.cos(longitudeOfAscendingNode);
        const sinOmega = Math.sin(longitudeOfAscendingNode);
        const cosI = Math.cos(inclination);
        const sinI = Math.sin(inclination);
        const cosW = Math.cos(argumentOfPeriapsis);
        const sinW = Math.sin(argumentOfPeriapsis);
        
        // Transform to 3D space
        const x = (cosOmega * cosW - sinOmega * sinW * cosI) * xOrbital + 
                  (-cosOmega * sinW - sinOmega * cosW * cosI) * yOrbital;
        const y = (sinOmega * cosW + cosOmega * sinW * cosI) * xOrbital + 
                  (-sinOmega * sinW + cosOmega * cosW * cosI) * yOrbital;
        const z = (sinW * sinI) * xOrbital + (cosW * sinI) * yOrbital;
        
        return { x, y, z };
    }

    /**
     * Safe mathematical expression evaluation
     * @param {string} expression - Mathematical expression
     * @param {Object} variables - Variable values
     * @returns {number} Result
     */
    static evaluateExpression(expression, variables = {}) {
        try {
            return evaluate(expression, variables);
        } catch (error) {
            console.warn(`Math evaluation error: ${error.message}`);
            return 0;
        }
    }

    /**
     * Calculate B-spline interpolation
     * @param {Array} points - Control points
     * @param {number} t - Parameter [0, 1]
     * @param {number} degree - B-spline degree
     * @returns {Object} Interpolated point
     */
    static bSplineInterpolation(points, t, degree = 3) {
        const n = points.length - 1;
        const knotVector = this.generateKnotVector(n, degree);
        
        let result = { x: 0, y: 0, z: 0 };
        
        for (let i = 0; i <= n; i++) {
            const basis = this.bSplineBasis(i, degree, t, knotVector);
            result.x += points[i].x * basis;
            result.y += points[i].y * basis;
            result.z += points[i].z * basis;
        }
        
        return result;
    }

    /**
     * Calculate B-spline basis function
     * @param {number} i - Control point index
     * @param {number} p - Degree
     * @param {number} t - Parameter
     * @param {Array} knots - Knot vector
     * @returns {number} Basis value
     */
    static bSplineBasis(i, p, t, knots) {
        if (p === 0) {
            return (t >= knots[i] && t < knots[i + 1]) ? 1 : 0;
        }
        
        let left = 0, right = 0;
        
        if (knots[i + p] !== knots[i]) {
            left = (t - knots[i]) / (knots[i + p] - knots[i]) * this.bSplineBasis(i, p - 1, t, knots);
        }
        
        if (knots[i + p + 1] !== knots[i + 1]) {
            right = (knots[i + p + 1] - t) / (knots[i + p + 1] - knots[i + 1]) * this.bSplineBasis(i + 1, p - 1, t, knots);
        }
        
        return left + right;
    }

    /**
     * Generate uniform knot vector for B-spline
     * @param {number} n - Number of control points - 1
     * @param {number} p - Degree
     * @returns {Array} Knot vector
     */
    static generateKnotVector(n, p) {
        const knots = [];
        const m = n + p + 1;
        
        for (let i = 0; i <= m; i++) {
            if (i <= p) {
                knots.push(0);
            } else if (i >= n + 1) {
                knots.push(1);
            } else {
                knots.push((i - p) / (n - p + 1));
            }
        }
        
        return knots;
    }
}