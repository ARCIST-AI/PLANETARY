// Physical Constants (SI units)
export const PHYSICS_CONSTANTS = {
    // Gravitational constant
    G: 6.67430e-11, // m³ kg⁻¹ s⁻²
    
    // Speed of light
    c: 299792458, // m/s
    
    // Astronomical Unit
    AU: 1.495978707e11, // meters
    
    // Solar mass
    SOLAR_MASS: 1.98847e30, // kg
    
    // Earth mass
    EARTH_MASS: 5.9722e24, // kg
    
    // Earth radius
    EARTH_RADIUS: 6.371e6, // meters
    
    // Solar radius
    SOLAR_RADIUS: 6.96e8, // meters
    
    // Julian year
    JULIAN_YEAR: 365.25 * 24 * 3600, // seconds
    
    // Day
    DAY: 24 * 3600, // seconds
};

// Time constants
export const TIME_CONSTANTS = {
    // Simulation time step (seconds)
    DEFAULT_TIME_STEP: 3600, // 1 hour
    
    // Maximum time step for stability
    MAX_TIME_STEP: 86400, // 1 day
    
    // Minimum time step for accuracy
    MIN_TIME_STEP: 60, // 1 minute
    
    // Animation frame rate
    TARGET_FPS: 60,
    
    // Time acceleration factors
    TIME_SPEEDS: {
        PAUSED: 0,
        REAL_TIME: 1,
        MINUTE_PER_SECOND: 60,
        HOUR_PER_SECOND: 3600,
        DAY_PER_SECOND: 86400,
        WEEK_PER_SECOND: 604800,
        MONTH_PER_SECOND: 2592000,
        YEAR_PER_SECOND: 31536000,
    }
};

// Rendering constants
export const RENDERING_CONSTANTS = {
    // Default camera settings
    DEFAULT_CAMERA_FOV: 60,
    DEFAULT_CAMERA_NEAR: 0.1,
    DEFAULT_CAMERA_FAR: 1e15,
    
    // Default camera position (in AU)
    DEFAULT_CAMERA_POSITION: { x: 10, y: 5, z: 10 },
    
    // Scale factors for visualization
    DEFAULT_PLANET_SCALE: 1.0,
    DEFAULT_DISTANCE_SCALE: 0.1,
    
    // Level of Detail distances (in AU)
    LOD_DISTANCES: {
        HIGH: 5,
        MEDIUM: 20,
        LOW: 100,
        POINT: 500
    },
    
    // Maximum number of objects to render
    MAX_RENDER_OBJECTS: 10000,
    
    // Texture resolution
    TEXTURE_RESOLUTION: {
        LOW: 512,
        MEDIUM: 1024,
        HIGH: 2048,
        ULTRA: 4096
    },
    
    // Default FPS limit
    DEFAULT_FPS_LIMIT: 60
};

// Camera control constants
export const CAMERA_CONSTANTS = {
    // Camera modes
    MODES: {
        ORBIT: 'orbit',
        FIRST_PERSON: 'firstPerson',
        FREE_FLY: 'freeFly',
        FOLLOW: 'follow',
        LOOK_AT: 'lookAt',
        CINEMATIC: 'cinematic'
    },
    
    // Camera movement speeds (in AU per second)
    MOVEMENT_SPEEDS: {
        SLOW: 0.5,
        NORMAL: 2.0,
        FAST: 10.0,
        VERY_FAST: 50.0
    },
    
    // Camera sensitivity
    SENSITIVITY: {
        ROTATION: 1.0,
        ZOOM: 1.0,
        PAN: 1.0,
        INERTIA: 0.9
    },
    
    // Camera constraints
    CONSTRAINTS: {
        MIN_DISTANCE: 0.1, // AU
        MAX_DISTANCE: 1000, // AU
        MIN_HEIGHT: -50, // AU
        MAX_HEIGHT: 50, // AU
        SAFE_SUN_DISTANCE: 2.0, // AU
        COLLISION_PADDING: 0.05 // AU
    },
    
    // Preset camera positions (in AU)
    PRESET_POSITIONS: {
        SOLAR_SYSTEM_OVERVIEW: { x: 30, y: 15, z: 30, target: { x: 0, y: 0, z: 0 } },
        INNER_PLANETS_FOCUS: { x: 5, y: 3, z: 5, target: { x: 0, y: 0, z: 0 } },
        OUTER_PLANETS_FOCUS: { x: 50, y: 10, z: 50, target: { x: 0, y: 0, z: 0 } },
        SUN_CLOSE_UP: { x: 3, y: 1, z: 3, target: { x: 0, y: 0, z: 0 } },
        EDGE_ON_VIEW: { x: 30, y: 0, z: 0, target: { x: 0, y: 0, z: 0 } },
        TOP_DOWN_VIEW: { x: 0, y: 50, z: 0, target: { x: 0, y: 0, z: 0 } }
    },
    
    // Animation settings
    ANIMATION: {
        DEFAULT_DURATION: 2000, // milliseconds
        EASING_FUNCTION: 'quadraticInOut',
        PATH_FPS: 30,
        MAX_PATH_POINTS: 1000
    },
    
    // Navigation aids
    NAVIGATION_AIDS: {
        MINIMAP_SIZE: 200,
        COMPASS_SIZE: 100,
        INDICATOR_UPDATE_INTERVAL: 100, // milliseconds
        SHOW_COORDINATES: true,
        SHOW_SPEED: true,
        SHOW_DISTANCE: true
    },
    
    // Touch controls
    TOUCH: {
        GESTURE_THRESHOLD: 10,
        PINCH_SENSITIVITY: 0.1,
        ROTATION_SENSITIVITY: 0.005,
        DOUBLE_TAP_DELAY: 300,
        VIRTUAL_JOYSTICK_SIZE: 100
    },
    
    // Keyboard controls
    KEYBOARD: {
        MOVE_FORWARD: 'KeyW',
        MOVE_BACKWARD: 'KeyS',
        MOVE_LEFT: 'KeyA',
        MOVE_RIGHT: 'KeyD',
        MOVE_UP: 'KeyQ',
        MOVE_DOWN: 'KeyE',
        SPEED_BOOST: 'ShiftLeft',
        BRAKE: 'Space',
        TOGGLE_MODE: 'KeyC',
        RESET_CAMERA: 'KeyR'
    }
};

// UI constants
export const UI_CONSTANTS = {
    // Panel dimensions
    CONTROL_PANEL_WIDTH: 320,
    INFO_PANEL_WIDTH: 300,
    
    // Animation durations
    ANIMATION_DURATION: 300, // milliseconds
    
    // Auto-hide delay
    AUTO_HIDE_DELAY: 3000, // milliseconds
    
    // Color scheme
    COLORS: {
        PRIMARY: '#3498db',
        SECONDARY: '#e74c3c',
        SUCCESS: '#2ecc71',
        WARNING: '#f39c12',
        DANGER: '#e74c3c',
        BACKGROUND: 'rgba(20, 20, 30, 0.9)',
        TEXT: '#ffffff',
        TEXT_SECONDARY: '#cccccc',
        BORDER: 'rgba(255, 255, 255, 0.1)'
    }
};

// Data source constants
export const DATA_CONSTANTS = {
    // JPL Horizons API endpoints
    JPL_HORIZONS_BASE_URL: 'https://ssd.jpl.nasa.gov/api/horizons.api',
    
    // Minor Planet Center
    MPC_BASE_URL: 'https://minorplanetcenter.net/iau/lists/',
    
    // Cache settings
    CACHE_EXPIRY: {
        EPHEMERIS: 24 * 60 * 60 * 1000, // 24 hours
        ORBITAL_ELEMENTS: 7 * 24 * 60 * 60 * 1000, // 7 days
        TEXTURES: 30 * 24 * 60 * 60 * 1000, // 30 days
    },
    
    // Cache sizes
    CACHE_SIZES: {
        DEFAULT: 100, // number of items
        SMALL: 50,
        MEDIUM: 200,
        LARGE: 500
    },
    
    // Update intervals
    UPDATE_INTERVALS: {
        DEFAULT: 60000, // 1 minute
        FAST: 30000, // 30 seconds
        SLOW: 300000, // 5 minutes
        VERY_SLOW: 900000 // 15 minutes
    },
    
    // Request limits
    API_RATE_LIMIT: {
        JPL_HORIZONS: 100, // requests per hour
        MPC: 50, // requests per hour
    }
};

// Performance constants
export const PERFORMANCE_CONSTANTS = {
    // Memory limits (in bytes)
    MEMORY_LIMITS: {
        TEXTURES: 100 * 1024 * 1024, // 100MB
        GEOMETRY: 50 * 1024 * 1024, // 50MB
        CACHE: 1000 * 1024 * 1024, // 1GB
    },
    
    // Performance thresholds
    PERFORMANCE_THRESHOLDS: {
        FPS_LOW: 30,
        FPS_MEDIUM: 45,
        FPS_HIGH: 60,
        
        MEMORY_WARNING: 0.8, // 80% of limit
        MEMORY_CRITICAL: 0.95, // 95% of limit
    },
    
    // Adaptive quality settings
    QUALITY_LEVELS: {
        LOW: {
            TEXTURE_SIZE: 512,
            SHADOWS: false,
            POST_PROCESSING: false,
            PARTICLE_COUNT: 100,
        },
        MEDIUM: {
            TEXTURE_SIZE: 1024,
            SHADOWS: true,
            POST_PROCESSING: false,
            PARTICLE_COUNT: 500,
        },
        HIGH: {
            TEXTURE_SIZE: 2048,
            SHADOWS: true,
            POST_PROCESSING: true,
            PARTICLE_COUNT: 1000,
        },
        ULTRA: {
            TEXTURE_SIZE: 4096,
            SHADOWS: true,
            POST_PROCESSING: true,
            PARTICLE_COUNT: 2000,
        }
    }
};

// Coordinate system constants
export const COORDINATE_CONSTANTS = {
    // Reference frames
    REFERENCE_FRAMES: {
        HELIOCENTRIC_J2000: 'heliocentric_j2000',
        GEOCENTRIC_J2000: 'geocentric_j2000',
        ECLIPTIC_J2000: 'ecliptic_j2000',
    },
    
    // Coordinate transformations
    J2000_EPOCH: new Date('2000-01-01T12:00:00Z').getTime(),
    
    // Obliquity of the ecliptic (J2000)
    ECLIPTIC_OBLIQUITY: 23.4392911 * Math.PI / 180, // radians
};

// Celestial body categories
export const BODY_CATEGORIES = {
    STAR: 'star',
    PLANET: 'planet',
    DWARF_PLANET: 'dwarf_planet',
    MOON: 'moon',
    ASTEROID: 'asteroid',
    COMET: 'comet',
    SPACECRAFT: 'spacecraft',
};

// Default celestial body data
export const DEFAULT_BODY_DATA = {
    // Sun
    sun: {
        name: 'Sun',
        mass: PHYSICS_CONSTANTS.SOLAR_MASS,
        radius: PHYSICS_CONSTANTS.SOLAR_RADIUS,
        color: 0xffff00,
        emissive: 0xffaa00,
        emissiveIntensity: 1,
        category: BODY_CATEGORIES.STAR,
    },
    
    // Planets (basic data - will be enhanced with JPL data)
    mercury: {
        name: 'Mercury',
        mass: 3.3011e23, // kg
        radius: 2.4397e6, // m
        semiMajorAxis: 0.387 * PHYSICS_CONSTANTS.AU, // m
        eccentricity: 0.2056,
        inclination: 7.005 * Math.PI / 180, // radians
        color: 0x8c7853,
        category: BODY_CATEGORIES.PLANET,
    },
    
    venus: {
        name: 'Venus',
        mass: 4.8675e24, // kg
        radius: 6.0518e6, // m
        semiMajorAxis: 0.723 * PHYSICS_CONSTANTS.AU, // m
        eccentricity: 0.0067,
        inclination: 3.39458 * Math.PI / 180, // radians
        color: 0xffc649,
        category: BODY_CATEGORIES.PLANET,
    },
    
    earth: {
        name: 'Earth',
        mass: PHYSICS_CONSTANTS.EARTH_MASS,
        radius: PHYSICS_CONSTANTS.EARTH_RADIUS,
        semiMajorAxis: 1.0 * PHYSICS_CONSTANTS.AU, // m
        eccentricity: 0.0167,
        inclination: 0.0, // radians (reference)
        color: 0x2233ff,
        category: BODY_CATEGORIES.PLANET,
    },
    
    mars: {
        name: 'Mars',
        mass: 6.4171e23, // kg
        radius: 3.3895e6, // m
        semiMajorAxis: 1.524 * PHYSICS_CONSTANTS.AU, // m
        eccentricity: 0.0934,
        inclination: 1.850 * Math.PI / 180, // radians
        color: 0xff3333,
        category: BODY_CATEGORIES.PLANET,
    },
    
    jupiter: {
        name: 'Jupiter',
        mass: 1.8982e27, // kg
        radius: 6.9911e7, // m
        semiMajorAxis: 5.204 * PHYSICS_CONSTANTS.AU, // m
        eccentricity: 0.0489,
        inclination: 1.303 * Math.PI / 180, // radians
        color: 0xcc9966,
        category: BODY_CATEGORIES.PLANET,
    },
    
    saturn: {
        name: 'Saturn',
        mass: 5.6834e26, // kg
        radius: 5.8232e7, // m
        semiMajorAxis: 9.573 * PHYSICS_CONSTANTS.AU, // m
        eccentricity: 0.0565,
        inclination: 2.485 * Math.PI / 180, // radians
        color: 0xffcc99,
        category: BODY_CATEGORIES.PLANET,
        hasRings: true,
    },
    
    uranus: {
        name: 'Uranus',
        mass: 8.6810e25, // kg
        radius: 2.5362e7, // m
        semiMajorAxis: 19.165 * PHYSICS_CONSTANTS.AU, // m
        eccentricity: 0.0457,
        inclination: 0.772 * Math.PI / 180, // radians
        color: 0x4fd0e7,
        category: BODY_CATEGORIES.PLANET,
    },
    
    neptune: {
        name: 'Neptune',
        mass: 1.02413e26, // kg
        radius: 2.4622e7, // m
        semiMajorAxis: 30.178 * PHYSICS_CONSTANTS.AU, // m
        eccentricity: 0.0113,
        inclination: 1.770 * Math.PI / 180, // radians
        color: 0x3333ff,
        category: BODY_CATEGORIES.PLANET,
    }
};