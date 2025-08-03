/**
 * Tooltip Manager for handling educational tooltips throughout the solar system visualization
 */

import { EventSystem } from '../utils/EventSystem.js';
import { MathUtils } from '../utils/MathUtils.js';

/**
 * Tooltip Manager class
 */
export class TooltipManager {
    /**
     * Create a new Tooltip Manager
     * @param {Object} config - Configuration object
     */
    constructor(config = {}) {
        this.config = {
            enabled: true,
            delay: 500, // milliseconds before showing tooltip
            duration: 0, // 0 = indefinite until mouse leaves
            maxWidth: 400,
            maxHeight: 300,
            fontSize: 14,
            padding: 12,
            borderRadius: 8,
            backgroundColor: 'rgba(30, 30, 40, 0.95)',
            borderColor: 'rgba(100, 100, 120, 0.7)',
            textColor: '#ffffff',
            shadowColor: 'rgba(0, 0, 0, 0.5)',
            shadowBlur: 10,
            zIndex: 1000,
            smartPositioning: true,
            edgeMargin: 10,
            fadeDuration: 200,
            showPinButton: true,
            showCloseButton: true,
            showLearnMore: true,
            language: 'en',
            ...config
        };

        // State
        this.activeTooltips = new Map();
        this.pinnedTooltips = new Set();
        this.tooltipTimers = new Map();
        this.isInitialized = false;
        this.container = null;
        
        // Event system
        this.eventSystem = new EventSystem();
        
        // Educational content database
        this.contentDatabase = new Map();
        this.initializeContentDatabase();
        
        // Localization
        this.localization = new Map();
        this.initializeLocalization();
    }

    /**
     * Initialize the tooltip manager
     * @returns {Promise<void>}
     */
    async initialize() {
        if (this.isInitialized) return;

        try {
            console.log('Initializing Tooltip Manager...');
            
            // Create tooltip container
            this.createContainer();
            
            // Setup styles
            this.setupStyles();
            
            // Setup event listeners
            this.setupEventListeners();
            
            this.isInitialized = true;
            console.log('Tooltip Manager initialized successfully');
            
        } catch (error) {
            console.error('Failed to initialize Tooltip Manager:', error);
            throw error;
        }
    }

    /**
     * Create tooltip container
     */
    createContainer() {
        this.container = document.createElement('div');
        this.container.id = 'tooltip-manager-container';
        this.container.className = 'tooltip-manager-container';
        this.container.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            pointer-events: none;
            z-index: ${this.config.zIndex};
        `;
        document.body.appendChild(this.container);
    }

    /**
     * Setup CSS styles for tooltips
     */
    setupStyles() {
        const styleId = 'tooltip-manager-styles';
        let styleElement = document.getElementById(styleId);
        
        if (!styleElement) {
            styleElement = document.createElement('style');
            styleElement.id = styleId;
            document.head.appendChild(styleElement);
        }
        
        styleElement.textContent = `
            .tooltip {
                position: absolute;
                background-color: ${this.config.backgroundColor};
                border: 1px solid ${this.config.borderColor};
                border-radius: ${this.config.borderRadius}px;
                color: ${this.config.textColor};
                font-size: ${this.config.fontSize}px;
                padding: ${this.config.padding}px;
                max-width: ${this.config.maxWidth}px;
                max-height: ${this.config.maxHeight}px;
                overflow-y: auto;
                box-shadow: 0 4px ${this.config.shadowBlur}px ${this.config.shadowColor};
                pointer-events: auto;
                opacity: 0;
                transition: opacity ${this.config.fadeDuration}ms ease-in-out;
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                line-height: 1.4;
            }
            
            .tooltip.visible {
                opacity: 1;
            }
            
            .tooltip-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 8px;
                padding-bottom: 8px;
                border-bottom: 1px solid rgba(255, 255, 255, 0.1);
            }
            
            .tooltip-title {
                font-weight: bold;
                font-size: 16px;
                margin: 0;
            }
            
            .tooltip-controls {
                display: flex;
                gap: 4px;
            }
            
            .tooltip-button {
                background: none;
                border: none;
                color: ${this.config.textColor};
                cursor: pointer;
                font-size: 14px;
                padding: 2px 6px;
                border-radius: 3px;
                opacity: 0.7;
                transition: opacity 0.2s;
            }
            
            .tooltip-button:hover {
                opacity: 1;
                background-color: rgba(255, 255, 255, 0.1);
            }
            
            .tooltip-content {
                margin-bottom: 12px;
            }
            
            .tooltip-section {
                margin-bottom: 10px;
            }
            
            .tooltip-section-title {
                font-weight: bold;
                margin-bottom: 4px;
                color: #a0c4ff;
            }
            
            .tooltip-list {
                margin: 4px 0;
                padding-left: 20px;
            }
            
            .tooltip-list li {
                margin-bottom: 2px;
            }
            
            .tooltip-fact {
                background-color: rgba(160, 196, 255, 0.1);
                border-left: 3px solid #a0c4ff;
                padding: 6px 10px;
                margin: 6px 0;
                border-radius: 0 4px 4px 0;
            }
            
            .tooltip-learn-more {
                display: inline-block;
                color: #a0c4ff;
                text-decoration: none;
                margin-top: 8px;
                font-size: 13px;
                transition: color 0.2s;
            }
            
            .tooltip-learn-more:hover {
                color: #ffffff;
                text-decoration: underline;
            }
            
            .tooltip-comparison {
                display: flex;
                align-items: center;
                gap: 8px;
                margin: 4px 0;
                font-size: 13px;
            }
            
            .tooltip-comparison-value {
                font-weight: bold;
                color: #a0c4ff;
            }
            
            .tooltip-loading {
                text-align: center;
                padding: 20px;
                color: rgba(255, 255, 255, 0.7);
            }
            
            .tooltip-error {
                color: #ff6b6b;
                padding: 10px;
                background-color: rgba(255, 107, 107, 0.1);
                border-radius: 4px;
            }
            
            /* Scrollbar styling */
            .tooltip::-webkit-scrollbar {
                width: 6px;
            }
            
            .tooltip::-webkit-scrollbar-track {
                background: rgba(255, 255, 255, 0.1);
                border-radius: 3px;
            }
            
            .tooltip::-webkit-scrollbar-thumb {
                background: rgba(255, 255, 255, 0.3);
                border-radius: 3px;
            }
            
            .tooltip::-webkit-scrollbar-thumb:hover {
                background: rgba(255, 255, 255, 0.5);
            }
        `;
    }

    /**
     * Setup event listeners
     */
    setupEventListeners() {
        // Handle window resize
        window.addEventListener('resize', () => {
            this.handleResize();
        });
        
        // Handle escape key to close all tooltips
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.hideAllTooltips();
            }
        });
        
        // Handle scroll events
        document.addEventListener('scroll', () => {
            this.updateTooltipPositions();
        }, { passive: true });
    }

    /**
     * Initialize educational content database
     */
    initializeContentDatabase() {
        // Planet content
        this.contentDatabase.set('mercury', {
            name: 'Mercury',
            type: 'Terrestrial Planet',
            physical: {
                radius: '2,439.7 km',
                mass: '3.3011 × 10²³ kg',
                density: '5.427 g/cm³',
                gravity: '3.7 m/s²',
                escapeVelocity: '4.25 km/s'
            },
            orbital: {
                distanceFromSun: '0.387 AU (57.9 million km)',
                orbitalPeriod: '88 Earth days',
                rotationPeriod: '59 Earth days',
                eccentricity: '0.2056',
                inclination: '7.0°'
            },
            atmosphere: {
                composition: 'Exosphere (trace amounts of hydrogen, helium, oxygen, sodium)',
                pressure: 'Virtually none'
            },
            temperature: {
                surface: '167°C (average), -173°C to 427°C',
                core: 'Estimated 1,600-1,700°C'
            },
            moons: 0,
            facts: [
                'Mercury is the smallest planet in our solar system and the closest to the Sun.',
                'A day on Mercury lasts 59 Earth days, but a year on Mercury is only 88 Earth days.',
                'Mercury has no atmosphere to retain heat, causing extreme temperature variations.',
                'Mercury\'s surface is covered with craters, similar to Earth\'s Moon.',
                'Mercury has a large iron core that takes up about 75% of the planet\'s radius.'
            ],
            discovery: {
                discoveredBy: 'Known since ancient times',
                firstSpacecraft: 'Mariner 10 (1974)',
                notableMissions: 'MESSENGER (2011-2015), BepiColombo (en route)'
            },
            learnMore: 'https://solarsystem.nasa.gov/planets/mercury/'
        });

        this.contentDatabase.set('venus', {
            name: 'Venus',
            type: 'Terrestrial Planet',
            physical: {
                radius: '6,051.8 km',
                mass: '4.8675 × 10²⁴ kg',
                density: '5.243 g/cm³',
                gravity: '8.87 m/s²',
                escapeVelocity: '10.36 km/s'
            },
            orbital: {
                distanceFromSun: '0.723 AU (108.2 million km)',
                orbitalPeriod: '225 Earth days',
                rotationPeriod: '243 Earth days (retrograde)',
                eccentricity: '0.0067',
                inclination: '3.4°'
            },
            atmosphere: {
                composition: '96.5% carbon dioxide, 3.5% nitrogen',
                pressure: '92 times Earth\'s pressure'
            },
            temperature: {
                surface: '464°C (average)',
                core: 'Estimated 5,200°C'
            },
            moons: 0,
            facts: [
                'Venus is the hottest planet in our solar system due to its thick atmosphere and greenhouse effect.',
                'Venus rotates backwards compared to most planets, in a direction opposite to its orbit.',
                'A day on Venus is longer than a year on Venus.',
                'Venus is often called Earth\'s twin due to similar size and mass.',
                'The atmospheric pressure on Venus is equivalent to being 900 meters underwater on Earth.'
            ],
            discovery: {
                discoveredBy: 'Known since ancient times',
                firstSpacecraft: 'Mariner 2 (1962)',
                notableMissions: 'Venera program, Magellan (1990-1994), Venus Express (2006-2014)'
            },
            learnMore: 'https://solarsystem.nasa.gov/planets/venus/'
        });

        this.contentDatabase.set('earth', {
            name: 'Earth',
            type: 'Terrestrial Planet',
            physical: {
                radius: '6,371 km',
                mass: '5.972 × 10²⁴ kg',
                density: '5.514 g/cm³',
                gravity: '9.8 m/s²',
                escapeVelocity: '11.19 km/s'
            },
            orbital: {
                distanceFromSun: '1 AU (149.6 million km)',
                orbitalPeriod: '365.25 days',
                rotationPeriod: '24 hours',
                eccentricity: '0.0167',
                inclination: '0°'
            },
            atmosphere: {
                composition: '78% nitrogen, 21% oxygen, 1% other gases',
                pressure: '1 atmosphere (101.325 kPa)'
            },
            temperature: {
                surface: '15°C (average)',
                core: 'Estimated 5,700°C'
            },
            moons: 1,
            facts: [
                'Earth is the only known planet with life in the universe.',
                'About 71% of Earth\'s surface is covered with water.',
                'Earth\'s atmosphere protects us from harmful solar radiation.',
                'Earth has a strong magnetic field generated by its molten iron core.',
                'Earth is the third planet from the Sun and the largest of the terrestrial planets.'
            ],
            discovery: {
                discoveredBy: 'Known since ancient times',
                firstSpacecraft: 'Sputnik 1 (1957)',
                notableMissions: 'Apollo program, International Space Station, countless Earth observation satellites'
            },
            learnMore: 'https://solarsystem.nasa.gov/planets/earth/'
        });

        this.contentDatabase.set('mars', {
            name: 'Mars',
            type: 'Terrestrial Planet',
            physical: {
                radius: '3,389.5 km',
                mass: '6.4171 × 10²³ kg',
                density: '3.933 g/cm³',
                gravity: '3.71 m/s²',
                escapeVelocity: '5.03 km/s'
            },
            orbital: {
                distanceFromSun: '1.524 AU (227.9 million km)',
                orbitalPeriod: '687 Earth days',
                rotationPeriod: '24.6 hours',
                eccentricity: '0.0934',
                inclination: '1.85°'
            },
            atmosphere: {
                composition: '95.3% carbon dioxide, 2.7% nitrogen, 1.6% argon',
                pressure: 'Less than 1% of Earth\'s pressure'
            },
            temperature: {
                surface: '-65°C (average), -143°C to 35°C',
                core: 'Estimated 1,500-2,000°C'
            },
            moons: 2,
            facts: [
                'Mars is known as the Red Planet due to iron oxide (rust) on its surface.',
                'Mars has the largest dust storms in the solar system, lasting for months.',
                'Mars has two small moons: Phobos and Deimos.',
                'Mars has the tallest volcano in the solar system, Olympus Mons.',
                'A day on Mars is almost the same length as a day on Earth.'
            ],
            discovery: {
                discoveredBy: 'Known since ancient times',
                firstSpacecraft: 'Mariner 4 (1965)',
                notableMissions: 'Viking program, Spirit & Opportunity rovers, Curiosity rover, Perseverance rover'
            },
            learnMore: 'https://solarsystem.nasa.gov/planets/mars/'
        });

        this.contentDatabase.set('jupiter', {
            name: 'Jupiter',
            type: 'Gas Giant',
            physical: {
                radius: '69,911 km',
                mass: '1.898 × 10²⁷ kg',
                density: '1.326 g/cm³',
                gravity: '24.79 m/s²',
                escapeVelocity: '59.5 km/s'
            },
            orbital: {
                distanceFromSun: '5.204 AU (778.5 million km)',
                orbitalPeriod: '12 Earth years',
                rotationPeriod: '9.9 hours',
                eccentricity: '0.0489',
                inclination: '1.31°'
            },
            atmosphere: {
                composition: '90% hydrogen, 10% helium, trace amounts of other gases',
                pressure: 'Immense, increasing with depth'
            },
            temperature: {
                cloudTops: '-108°C',
                core: 'Estimated 24,000°C'
            },
            moons: 79,
            facts: [
                'Jupiter is the largest planet in our solar system.',
                'Jupiter\'s Great Red Spot is a storm that has raged for hundreds of years.',
                'Jupiter has a faint ring system.',
                'Jupiter acts as a "cosmic vacuum cleaner," protecting inner planets from asteroids and comets.',
                'Jupiter is so massive that it almost became a star.'
            ],
            discovery: {
                discoveredBy: 'Known since ancient times',
                firstSpacecraft: 'Pioneer 10 (1973)',
                notableMissions: 'Voyager 1 & 2, Galileo (1995-2003), Juno (2016-present)'
            },
            learnMore: 'https://solarsystem.nasa.gov/planets/jupiter/'
        });

        this.contentDatabase.set('saturn', {
            name: 'Saturn',
            type: 'Gas Giant',
            physical: {
                radius: '58,232 km',
                mass: '5.683 × 10²⁶ kg',
                density: '0.687 g/cm³',
                gravity: '10.44 m/s²',
                escapeVelocity: '35.5 km/s'
            },
            orbital: {
                distanceFromSun: '9.573 AU (1.43 billion km)',
                orbitalPeriod: '29.5 Earth years',
                rotationPeriod: '10.7 hours',
                eccentricity: '0.0565',
                inclination: '2.49°'
            },
            atmosphere: {
                composition: '96% hydrogen, 3% helium, 1% other gases',
                pressure: 'Immense, increasing with depth'
            },
            temperature: {
                cloudTops: '-139°C',
                core: 'Estimated 11,700°C'
            },
            moons: 82,
            facts: [
                'Saturn is famous for its spectacular ring system.',
                'Saturn is the least dense planet in our solar system and would float in water.',
                'Saturn\'s moon Titan is larger than Mercury and has a thick atmosphere.',
                'Saturn has hexagonal storms at its north pole.',
                'Saturn\'s rings are made mostly of ice particles with some rocky debris.'
            ],
            discovery: {
                discoveredBy: 'Known since ancient times',
                firstSpacecraft: 'Pioneer 11 (1979)',
                notableMissions: 'Voyager 1 & 2, Cassini-Huygens (2004-2017)'
            },
            learnMore: 'https://solarsystem.nasa.gov/planets/saturn/'
        });

        this.contentDatabase.set('uranus', {
            name: 'Uranus',
            type: 'Ice Giant',
            physical: {
                radius: '25,362 km',
                mass: '8.681 × 10²⁵ kg',
                density: '1.271 g/cm³',
                gravity: '8.87 m/s²',
                escapeVelocity: '21.3 km/s'
            },
            orbital: {
                distanceFromSun: '19.165 AU (2.87 billion km)',
                orbitalPeriod: '84 Earth years',
                rotationPeriod: '17.2 hours (retrograde)',
                eccentricity: '0.0457',
                inclination: '0.77°'
            },
            atmosphere: {
                composition: '83% hydrogen, 15% helium, 2% methane',
                pressure: 'Immense, increasing with depth'
            },
            temperature: {
                cloudTops: '-197°C',
                core: 'Estimated 4,700°C'
            },
            moons: 27,
            facts: [
                'Uranus rotates on its side, with its axis tilted at 98 degrees.',
                'Uranus has faint rings and 27 known moons.',
                'Uranus appears blue-green due to methane in its atmosphere.',
                'Uranus was the first planet discovered with a telescope.',
                'Uranus experiences extreme seasons lasting 21 Earth years each.'
            ],
            discovery: {
                discoveredBy: 'William Herschel (1781)',
                firstSpacecraft: 'Voyager 2 (1986)',
                notableMissions: 'Voyager 2 flyby (1986), no dedicated missions since'
            },
            learnMore: 'https://solarsystem.nasa.gov/planets/uranus/'
        });

        this.contentDatabase.set('neptune', {
            name: 'Neptune',
            type: 'Ice Giant',
            physical: {
                radius: '24,622 km',
                mass: '1.024 × 10²⁶ kg',
                density: '1.638 g/cm³',
                gravity: '11.15 m/s²',
                escapeVelocity: '23.5 km/s'
            },
            orbital: {
                distanceFromSun: '30.178 AU (4.5 billion km)',
                orbitalPeriod: '165 Earth years',
                rotationPeriod: '16.1 hours',
                eccentricity: '0.0113',
                inclination: '1.77°'
            },
            atmosphere: {
                composition: '80% hydrogen, 19% helium, 1% methane',
                pressure: 'Immense, increasing with depth'
            },
            temperature: {
                cloudTops: '-201°C',
                core: 'Estimated 5,400°C'
            },
            moons: 14,
            facts: [
                'Neptune has the fastest winds in the solar system, reaching speeds of 2,100 km/h.',
                'Neptune was discovered through mathematical prediction before it was observed.',
                'Neptune\'s moon Triton orbits backwards and is gradually spiraling toward Neptune.',
                'Neptune appears blue due to methane in its atmosphere.',
                'Neptune takes 165 Earth years to orbit the Sun once.'
            ],
            discovery: {
                discoveredBy: 'Johann Galle (1846), predicted by Urbain Le Verrier',
                firstSpacecraft: 'Voyager 2 (1989)',
                notableMissions: 'Voyager 2 flyby (1989), no dedicated missions since'
            },
            learnMore: 'https://solarsystem.nasa.gov/planets/neptune/'
        });

        // UI Control content
        this.contentDatabase.set('time-speed', {
            name: 'Time Speed Control',
            description: 'Controls the simulation time speed',
            details: [
                'Adjusts how fast time passes in the simulation',
                '1x = real-time speed',
                'Higher values speed up orbital motion',
                'Lower values slow down for detailed observation'
            ],
            recommendations: [
                'Use 1-10x for observing daily motions',
                'Use 100-1000x for watching orbital periods',
                'Use higher values for long-term evolution'
            ],
            educational: 'Time in space is relative. This control helps us observe processes that take days, years, or centuries in compressed time.'
        });

        this.contentDatabase.set('planet-size-scale', {
            name: 'Planet Size Scale',
            description: 'Adjusts the visual size of planets',
            details: [
                'Scales planet sizes for better visibility',
                'Real planets would be tiny at true scale',
                'Enlarged sizes help distinguish small bodies',
                'Does not affect actual physics calculations'
            ],
            recommendations: [
                'Use 1-5x for realistic proportions',
                'Use 10-20x for emphasizing small bodies',
                'Balance with distance scale for best view'
            ],
            educational: 'Planets vary enormously in size. Jupiter is 11 times wider than Earth, while Mercury is only 38% of Earth\'s width.'
        });

        this.contentDatabase.set('distance-scale', {
            name: 'Distance Scale',
            description: 'Adjusts the spacing between celestial bodies',
            details: [
                'Scales orbital distances for visualization',
                'Real distances would make inner planets invisible',
                'Compressed distances keep all bodies in view',
                'Maintains relative proportions'
            ],
            recommendations: [
                'Use 0.001-0.01x for seeing entire solar system',
                'Use 0.1-0.5x for focusing on inner planets',
                'Use 1x for accurate distance representation'
            ],
            educational: 'An Astronomical Unit (AU) is the average Earth-Sun distance (149.6 million km). Neptune orbits 30 times farther from the Sun than Earth.'
        });

        this.contentDatabase.set('show-orbits', {
            name: 'Orbital Paths',
            description: 'Toggle display of orbital trajectories',
            details: [
                'Shows the elliptical paths planets follow',
                'Helps visualize orbital mechanics',
                'Displays inclination changes in 3D space',
                'Can be toggled for cleaner views'
            ],
            educational: 'Planets orbit in ellipses, not perfect circles. Kepler\'s laws describe how orbital speed varies with distance from the Sun.'
        });

        this.contentDatabase.set('show-labels', {
            name: 'Planet Labels',
            description: 'Toggle name labels on celestial bodies',
            details: [
                'Displays planet and moon names',
                'Helps identify celestial bodies',
                'Can be customized for different languages',
                'Useful for educational purposes'
            ],
            educational: 'Learning planet names is the first step in understanding our solar system. Each name has mythological or historical significance.'
        });

        // Astronomical concepts
        this.contentDatabase.set('astronomical-unit', {
            name: 'Astronomical Unit (AU)',
            description: 'Unit of distance in astronomy',
            details: [
                '1 AU = 149,597,870.7 kilometers',
                'Average Earth-Sun distance',
                'Used for measuring distances within solar systems',
                'Light takes about 8 minutes to travel 1 AU'
            ],
            comparisons: [
                'Mercury: 0.39 AU from Sun',
                'Earth: 1 AU from Sun',
                'Jupiter: 5.2 AU from Sun',
                'Neptune: 30 AU from Sun'
            ],
            educational: 'The AU helps us comprehend vast solar system distances. If Earth were 1 meter from the Sun, Neptune would be 30 meters away!'
        });

        this.contentDatabase.set('orbital-mechanics', {
            name: 'Orbital Mechanics',
            description: 'The physics of celestial motion',
            details: [
                'Planets follow elliptical orbits (Kepler\'s 1st Law)',
                'Planets sweep equal areas in equal times (Kepler\'s 2nd Law)',
                'Orbital period relates to distance (Kepler\'s 3rd Law)',
                'Gravity provides the centripetal force for orbits'
            ],
            educational: 'Orbital mechanics explains how satellites, planets, and moons move. Understanding these principles enables space exploration and satellite deployment.'
        });
    }

    /**
     * Initialize localization
     */
    initializeLocalization() {
        // English (default)
        this.localization.set('en', {
            'loading': 'Loading...',
            'error': 'Error loading content',
            'pin': 'Pin',
            'unpin': 'Unpin',
            'close': 'Close',
            'learnMore': 'Learn More',
            'physical': 'Physical Characteristics',
            'orbital': 'Orbital Information',
            'atmosphere': 'Atmosphere',
            'temperature': 'Temperature',
            'moons': 'Moons',
            'facts': 'Interesting Facts',
            'discovery': 'Discovery',
            'details': 'Details',
            'recommendations': 'Recommended Settings',
            'educational': 'Educational Context',
            'comparisons': 'Comparisons to Earth',
            'radius': 'Radius',
            'mass': 'Mass',
            'density': 'Density',
            'gravity': 'Surface Gravity',
            'escapeVelocity': 'Escape Velocity',
            'distanceFromSun': 'Distance from Sun',
            'orbitalPeriod': 'Orbital Period',
            'rotationPeriod': 'Rotation Period',
            'eccentricity': 'Orbital Eccentricity',
            'inclination': 'Orbital Inclination',
            'composition': 'Composition',
            'pressure': 'Pressure',
            'surface': 'Surface',
            'core': 'Core',
            'discoveredBy': 'Discovered By',
            'firstSpacecraft': 'First Spacecraft',
            'notableMissions': 'Notable Missions'
        });
    }

    /**
     * Show a tooltip
     * @param {string} id - Tooltip ID
     * @param {string} type - Tooltip type ('planet', 'control', 'concept')
     * @param {Object} position - Position {x, y}
     * @param {Object} options - Additional options
     * @returns {string} Tooltip ID
     */
    show(id, type, position, options = {}) {
        if (!this.config.enabled) return null;

        // Clear any existing timer for this ID
        if (this.tooltipTimers.has(id)) {
            clearTimeout(this.tooltipTimers.get(id));
            this.tooltipTimers.delete(id);
        }

        // Check if tooltip is already active
        if (this.activeTooltips.has(id)) {
            this.update(id, position);
            return id;
        }

        // Set timer for delayed appearance
        const timer = setTimeout(() => {
            this.createTooltip(id, type, position, options);
        }, options.delay || this.config.delay);

        this.tooltipTimers.set(id, timer);
        return id;
    }

    /**
     * Create a tooltip element
     * @param {string} id - Tooltip ID
     * @param {string} type - Tooltip type
     * @param {Object} position - Position {x, y}
     * @param {Object} options - Additional options
     */
    createTooltip(id, type, position, options = {}) {
        const content = this.getContent(type, id, options);
        if (!content) return;

        const tooltip = document.createElement('div');
        tooltip.id = `tooltip-${id}`;
        tooltip.className = 'tooltip';
        tooltip.innerHTML = this.generateTooltipHTML(content, type, id);

        // Apply custom styles
        if (options.styles) {
            Object.assign(tooltip.style, options.styles);
        }

        // Add to container
        this.container.appendChild(tooltip);

        // Position tooltip
        this.positionTooltip(tooltip, position);

        // Show with fade effect
        setTimeout(() => {
            tooltip.classList.add('visible');
        }, 10);

        // Store tooltip
        this.activeTooltips.set(id, {
            element: tooltip,
            type: type,
            position: position,
            options: options
        });

        // Setup event listeners
        this.setupTooltipEventListeners(tooltip, id);

        // Emit event
        this.eventSystem.emit('tooltipShown', { id, type, position, content });
    }

    /**
     * Get tooltip content
     * @param {string} type - Tooltip type
     * @param {string} id - Content ID
     * @param {Object} options - Additional options
     * @returns {Object|null} Content object
     */
    getContent(type, id, options = {}) {
        const content = this.contentDatabase.get(id);
        if (!content) return null;

        // Add custom data if provided
        if (options.customData) {
            return { ...content, ...options.customData };
        }

        return content;
    }

    /**
     * Generate tooltip HTML
     * @param {Object} content - Content object
     * @param {string} type - Tooltip type
     * @param {string} id - Tooltip ID
     * @returns {string} HTML string
     */
    generateTooltipHTML(content, type, id) {
        const texts = this.localization.get(this.config.language) || this.localization.get('en');
        let html = '';

        // Header
        html += '<div class="tooltip-header">';
        html += `<h3 class="tooltip-title">${content.name}</h3>`;
        
        // Controls
        html += '<div class="tooltip-controls">';
        if (this.config.showPinButton) {
            html += `<button class="tooltip-button pin-button" data-tooltip-id="${id}" title="${texts.pin}">📌</button>`;
        }
        if (this.config.showCloseButton) {
            html += `<button class="tooltip-button close-button" data-tooltip-id="${id}" title="${texts.close}">✕</button>`;
        }
        html += '</div>';
        html += '</div>';

        // Content
        html += '<div class="tooltip-content">';

        // Description
        if (content.description) {
            html += `<p>${content.description}</p>`;
        }

        // Type-specific content
        if (type === 'planet') {
            html += this.generatePlanetContent(content, texts);
        } else if (type === 'control') {
            html += this.generateControlContent(content, texts);
        } else if (type === 'concept') {
            html += this.generateConceptContent(content, texts);
        }

        html += '</div>';

        // Learn more link
        if (this.config.showLearnMore && content.learnMore) {
            html += `<a href="${content.learnMore}" target="_blank" class="tooltip-learn-more">${texts.learnMore} →</a>`;
        }

        return html;
    }

    /**
     * Generate planet-specific content HTML
     * @param {Object} content - Content object
     * @param {Object} texts - Localization texts
     * @returns {string} HTML string
     */
    generatePlanetContent(content, texts) {
        let html = '';

        // Physical characteristics
        if (content.physical) {
            html += '<div class="tooltip-section">';
            html += `<div class="tooltip-section-title">${texts.physical}</div>`;
            html += '<ul class="tooltip-list">';
            for (const [key, value] of Object.entries(content.physical)) {
                const label = texts[key] || key;
                html += `<li><strong>${label}:</strong> ${value}</li>`;
            }
            html += '</ul>';
            html += '</div>';
        }

        // Orbital information
        if (content.orbital) {
            html += '<div class="tooltip-section">';
            html += `<div class="tooltip-section-title">${texts.orbital}</div>`;
            html += '<ul class="tooltip-list">';
            for (const [key, value] of Object.entries(content.orbital)) {
                const label = texts[key] || key;
                html += `<li><strong>${label}:</strong> ${value}</li>`;
            }
            html += '</ul>';
            html += '</div>';
        }

        // Atmosphere
        if (content.atmosphere) {
            html += '<div class="tooltip-section">';
            html += `<div class="tooltip-section-title">${texts.atmosphere}</div>`;
            html += '<ul class="tooltip-list">';
            for (const [key, value] of Object.entries(content.atmosphere)) {
                const label = texts[key] || key;
                html += `<li><strong>${label}:</strong> ${value}</li>`;
            }
            html += '</ul>';
            html += '</div>';
        }

        // Temperature
        if (content.temperature) {
            html += '<div class="tooltip-section">';
            html += `<div class="tooltip-section-title">${texts.temperature}</div>`;
            html += '<ul class="tooltip-list">';
            for (const [key, value] of Object.entries(content.temperature)) {
                const label = texts[key] || key;
                html += `<li><strong>${label}:</strong> ${value}</li>`;
            }
            html += '</ul>';
            html += '</div>';
        }

        // Moons
        if (content.moons !== undefined) {
            html += '<div class="tooltip-section">';
            html += `<div class="tooltip-section-title">${texts.moons}</div>`;
            html += `<p>${content.moons} ${content.moons === 1 ? 'moon' : 'moons'}</p>`;
            html += '</div>';
        }

        // Facts
        if (content.facts && content.facts.length > 0) {
            html += '<div class="tooltip-section">';
            html += `<div class="tooltip-section-title">${texts.facts}</div>`;
            for (const fact of content.facts) {
                html += `<div class="tooltip-fact">${fact}</div>`;
            }
            html += '</div>';
        }

        // Discovery
        if (content.discovery) {
            html += '<div class="tooltip-section">';
            html += `<div class="tooltip-section-title">${texts.discovery}</div>`;
            html += '<ul class="tooltip-list">';
            for (const [key, value] of Object.entries(content.discovery)) {
                const label = texts[key] || key;
                html += `<li><strong>${label}:</strong> ${value}</li>`;
            }
            html += '</ul>';
            html += '</div>';
        }

        return html;
    }

    /**
     * Generate control-specific content HTML
     * @param {Object} content - Content object
     * @param {Object} texts - Localization texts
     * @returns {string} HTML string
     */
    generateControlContent(content, texts) {
        let html = '';

        // Details
        if (content.details && content.details.length > 0) {
            html += '<div class="tooltip-section">';
            html += `<div class="tooltip-section-title">${texts.details}</div>`;
            html += '<ul class="tooltip-list">';
            for (const detail of content.details) {
                html += `<li>${detail}</li>`;
            }
            html += '</ul>';
            html += '</div>';
        }

        // Recommendations
        if (content.recommendations && content.recommendations.length > 0) {
            html += '<div class="tooltip-section">';
            html += `<div class="tooltip-section-title">${texts.recommendations}</div>`;
            html += '<ul class="tooltip-list">';
            for (const recommendation of content.recommendations) {
                html += `<li>${recommendation}</li>`;
            }
            html += '</ul>';
            html += '</div>';
        }

        // Educational context
        if (content.educational) {
            html += '<div class="tooltip-section">';
            html += `<div class="tooltip-section-title">${texts.educational}</div>`;
            html += `<div class="tooltip-fact">${content.educational}</div>`;
            html += '</div>';
        }

        return html;
    }

    /**
     * Generate concept-specific content HTML
     * @param {Object} content - Content object
     * @param {Object} texts - Localization texts
     * @returns {string} HTML string
     */
    generateConceptContent(content, texts) {
        let html = '';

        // Details
        if (content.details && content.details.length > 0) {
            html += '<div class="tooltip-section">';
            html += `<div class="tooltip-section-title">${texts.details}</div>`;
            html += '<ul class="tooltip-list">';
            for (const detail of content.details) {
                html += `<li>${detail}</li>`;
            }
            html += '</ul>';
            html += '</div>';
        }

        // Comparisons
        if (content.comparisons && content.comparisons.length > 0) {
            html += '<div class="tooltip-section">';
            html += `<div class="tooltip-section-title">${texts.comparisons}</div>`;
            for (const comparison of content.comparisons) {
                html += `<div class="tooltip-comparison">${comparison}</div>`;
            }
            html += '</div>';
        }

        // Educational context
        if (content.educational) {
            html += '<div class="tooltip-section">';
            html += `<div class="tooltip-section-title">${texts.educational}</div>`;
            html += `<div class="tooltip-fact">${content.educational}</div>`;
            html += '</div>';
        }

        return html;
    }

    /**
     * Position tooltip with smart positioning
     * @param {HTMLElement} tooltip - Tooltip element
     * @param {Object} position - Position {x, y}
     */
    positionTooltip(tooltip, position) {
        if (!this.config.smartPositioning) {
            tooltip.style.left = `${position.x}px`;
            tooltip.style.top = `${position.y}px`;
            return;
        }

        const tooltipRect = tooltip.getBoundingClientRect();
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;

        let x = position.x;
        let y = position.y;

        // Adjust horizontal position
        if (x + tooltipRect.width + this.config.edgeMargin > viewportWidth) {
            x = viewportWidth - tooltipRect.width - this.config.edgeMargin;
        }
        if (x < this.config.edgeMargin) {
            x = this.config.edgeMargin;
        }

        // Adjust vertical position
        if (y + tooltipRect.height + this.config.edgeMargin > viewportHeight) {
            y = viewportHeight - tooltipRect.height - this.config.edgeMargin;
        }
        if (y < this.config.edgeMargin) {
            y = this.config.edgeMargin;
        }

        tooltip.style.left = `${x}px`;
        tooltip.style.top = `${y}px`;
    }

    /**
     * Setup tooltip event listeners
     * @param {HTMLElement} tooltip - Tooltip element
     * @param {string} id - Tooltip ID
     */
    setupTooltipEventListeners(tooltip, id) {
        // Pin button
        const pinButton = tooltip.querySelector('.pin-button');
        if (pinButton) {
            pinButton.addEventListener('click', (e) => {
                e.stopPropagation();
                this.togglePin(id);
            });
        }

        // Close button
        const closeButton = tooltip.querySelector('.close-button');
        if (closeButton) {
            closeButton.addEventListener('click', (e) => {
                e.stopPropagation();
                this.hide(id);
            });
        }

        // Prevent tooltip from closing when hovering over it
        tooltip.addEventListener('mouseenter', () => {
            if (this.tooltipTimers.has(id)) {
                clearTimeout(this.tooltipTimers.get(id));
                this.tooltipTimers.delete(id);
            }
        });

        tooltip.addEventListener('mouseleave', () => {
            if (!this.pinnedTooltips.has(id)) {
                this.hide(id);
            }
        });
    }

    /**
     * Update tooltip position
     * @param {string} id - Tooltip ID
     * @param {Object} position - New position {x, y}
     */
    update(id, position) {
        const tooltipData = this.activeTooltips.get(id);
        if (tooltipData) {
            this.positionTooltip(tooltipData.element, position);
            tooltipData.position = position;
            this.eventSystem.emit('tooltipUpdated', { id, position });
        }
    }

    /**
     * Hide tooltip
     * @param {string} id - Tooltip ID
     */
    hide(id) {
        // Clear timer if exists
        if (this.tooltipTimers.has(id)) {
            clearTimeout(this.tooltipTimers.get(id));
            this.tooltipTimers.delete(id);
        }

        // Don't hide if pinned
        if (this.pinnedTooltips.has(id)) {
            return;
        }

        const tooltipData = this.activeTooltips.get(id);
        if (tooltipData) {
            const tooltip = tooltipData.element;
            
            // Fade out
            tooltip.classList.remove('visible');
            
            // Remove after fade
            setTimeout(() => {
                if (tooltip.parentNode) {
                    tooltip.parentNode.removeChild(tooltip);
                }
                this.activeTooltips.delete(id);
                this.eventSystem.emit('tooltipHidden', { id });
            }, this.config.fadeDuration);
        }
    }

    /**
     * Hide all tooltips
     */
    hideAllTooltips() {
        // Clear all timers
        for (const timer of this.tooltipTimers.values()) {
            clearTimeout(timer);
        }
        this.tooltipTimers.clear();

        // Hide all active tooltips
        for (const id of this.activeTooltips.keys()) {
            if (!this.pinnedTooltips.has(id)) {
                this.hide(id);
            }
        }
    }

    /**
     * Toggle tooltip pin state
     * @param {string} id - Tooltip ID
     */
    togglePin(id) {
        const tooltipData = this.activeTooltips.get(id);
        if (!tooltipData) return;

        const pinButton = tooltipData.element.querySelector('.pin-button');
        
        if (this.pinnedTooltips.has(id)) {
            this.pinnedTooltips.delete(id);
            if (pinButton) {
                pinButton.textContent = '📌';
                pinButton.title = 'Pin';
            }
            this.eventSystem.emit('tooltipUnpinned', { id });
        } else {
            this.pinnedTooltips.add(id);
            if (pinButton) {
                pinButton.textContent = '📌';
                pinButton.style.opacity = '1';
                pinButton.title = 'Unpin';
            }
            this.eventSystem.emit('tooltipPinned', { id });
        }
    }

    /**
     * Update all tooltip positions (e.g., on resize or scroll)
     */
    updateTooltipPositions() {
        for (const [id, tooltipData] of this.activeTooltips) {
            this.positionTooltip(tooltipData.element, tooltipData.position);
        }
    }

    /**
     * Handle window resize
     */
    handleResize() {
        this.updateTooltipPositions();
        this.eventSystem.emit('resized');
    }

    /**
     * Set configuration
     * @param {Object} config - New configuration
     */
    setConfig(config) {
        this.config = { ...this.config, ...config };
        
        // Update styles if needed
        if (config.backgroundColor || config.borderColor || config.textColor) {
            this.setupStyles();
        }
        
        this.eventSystem.emit('configUpdated', this.config);
    }

    /**
     * Set language
     * @param {string} language - Language code
     */
    setLanguage(language) {
        if (this.localization.has(language)) {
            this.config.language = language;
            // Update existing tooltips
            for (const [id, tooltipData] of this.activeTooltips) {
                const content = this.getContent(tooltipData.type, id, tooltipData.options);
                if (content) {
                    tooltipData.element.innerHTML = this.generateTooltipHTML(content, tooltipData.type, id);
                    this.setupTooltipEventListeners(tooltipData.element, id);
                }
            }
            this.eventSystem.emit('languageChanged', language);
        }
    }

    /**
     * Add custom content
     * @param {string} id - Content ID
     * @param {Object} content - Content object
     */
    addContent(id, content) {
        this.contentDatabase.set(id, content);
        this.eventSystem.emit('contentAdded', { id, content });
    }

    /**
     * Remove content
     * @param {string} id - Content ID
     */
    removeContent(id) {
        this.contentDatabase.delete(id);
        this.eventSystem.emit('contentRemoved', { id });
    }

    /**
     * Get tooltip status
     * @returns {Object} Status information
     */
    getStatus() {
        return {
            isInitialized: this.isInitialized,
            enabled: this.config.enabled,
            activeTooltips: this.activeTooltips.size,
            pinnedTooltips: this.pinnedTooltips.size,
            config: this.config
        };
    }

    /**
     * Register event callback
     * @param {string} event - Event name
     * @param {Function} callback - Callback function
     */
    on(event, callback) {
        this.eventSystem.on(event, callback);
    }

    /**
     * Remove event callback
     * @param {string} event - Event name
     * @param {Function} callback - Callback function
     */
    off(event, callback) {
        this.eventSystem.off(event, callback);
    }

    /**
     * Destroy the tooltip manager
     */
    destroy() {
        // Clear all timers
        for (const timer of this.tooltipTimers.values()) {
            clearTimeout(timer);
        }
        this.tooltipTimers.clear();

        // Remove all tooltips
        for (const tooltipData of this.activeTooltips.values()) {
            if (tooltipData.element.parentNode) {
                tooltipData.element.parentNode.removeChild(tooltipData.element);
            }
        }
        this.activeTooltips.clear();
        this.pinnedTooltips.clear();

        // Remove container
        if (this.container && this.container.parentNode) {
            this.container.parentNode.removeChild(this.container);
        }

        // Remove styles
        const styleElement = document.getElementById('tooltip-manager-styles');
        if (styleElement) {
            styleElement.parentNode.removeChild(styleElement);
        }

        // Destroy event system
        this.eventSystem.destroy();

        console.log('Tooltip Manager destroyed');
    }
}